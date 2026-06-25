import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ScheduleEntryWithEmployee } from '../types/scheduleTypes';
import { formatDisplayDate } from '../utils/dateRangeUtils';
import { getShiftShortLabel } from '../utils/shiftUtils';
import { scheduleErrorMessages } from '../validation/scheduleValidation';
import * as scheduleService from './scheduleService';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const XLSX_UTI = 'org.openxmlformats.spreadsheetml.sheet';

type XlsxExportResult = {
  fileName: string;
  uri: string | null;
  base64: string;
  locationLabel: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function textBytes(text: string) {
  return Array.from(unescape(encodeURIComponent(text))).map((char) => char.charCodeAt(0));
}

function crc32(bytes: number[]) {
  let crc = -1;

  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ -1) >>> 0;
}

function uint16(value: number) {
  return [value & 255, (value >>> 8) & 255];
}

function uint32(value: number) {
  return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255];
}

function createZip(files: { name: string; content: string }[]) {
  const localParts: number[] = [];
  const centralParts: number[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = textBytes(file.name);
    const contentBytes = textBytes(file.content);
    const checksum = crc32(contentBytes);
    const localHeader = [
      ...uint32(0x04034b50),
      ...uint16(20),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(checksum),
      ...uint32(contentBytes.length),
      ...uint32(contentBytes.length),
      ...uint16(nameBytes.length),
      ...uint16(0),
      ...nameBytes,
    ];
    const centralHeader = [
      ...uint32(0x02014b50),
      ...uint16(20),
      ...uint16(20),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(checksum),
      ...uint32(contentBytes.length),
      ...uint32(contentBytes.length),
      ...uint16(nameBytes.length),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(0),
      ...uint32(offset),
      ...nameBytes,
    ];

    localParts.push(...localHeader, ...contentBytes);
    centralParts.push(...centralHeader);
    offset += localHeader.length + contentBytes.length;
  }

  const end = [
    ...uint32(0x06054b50),
    ...uint16(0),
    ...uint16(0),
    ...uint16(files.length),
    ...uint16(files.length),
    ...uint32(centralParts.length),
    ...uint32(localParts.length),
    ...uint16(0),
  ];

  return [...localParts, ...centralParts, ...end];
}

function toBase64(bytes: number[]) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const first = bytes[i];
    const second = bytes[i + 1] ?? 0;
    const third = bytes[i + 2] ?? 0;
    const triplet = (first << 16) | (second << 8) | third;

    output += alphabet[(triplet >> 18) & 63];
    output += alphabet[(triplet >> 12) & 63];
    output += i + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    output += i + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }

  return output;
}

function getColumnName(index: number) {
  let column = '';
  let current = index;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    current = Math.floor((current - 1) / 26);
  }

  return column;
}

function worksheetCell(rowIndex: number, columnIndex: number, value: string) {
  const reference = `${getColumnName(columnIndex)}${rowIndex}`;
  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function worksheetRow(rowIndex: number, values: string[]) {
  const cells = values.map((value, index) => worksheetCell(rowIndex, index + 1, value)).join('');
  return `<row r="${rowIndex}">${cells}</row>`;
}

function getEmployees(entries: ScheduleEntryWithEmployee[]) {
  const employeeIds = Array.from(new Set(entries.map((entry) => entry.employeeId)));
  return employeeIds
    .map((employeeId) => entries.find((entry) => entry.employeeId === employeeId)?.employee)
    .filter(Boolean);
}

function buildWorksheetXml(dates: string[], entries: ScheduleEntryWithEmployee[]) {
  const employees = getEmployees(entries);
  const header = worksheetRow(1, ['Pracownik', ...dates.map(formatDisplayDate)]);
  const rows = employees
    .map((employee, index) => {
      if (!employee) {
        return '';
      }

      const shiftValues = dates.map((date) => {
        const entry = entries.find((item) => item.employeeId === employee.id && item.entryDate === date);
        return entry ? getShiftShortLabel(entry.shiftCode) : '0';
      });

      return worksheetRow(index + 2, [employee.fullName, ...shiftValues]);
    })
    .join('');
  const lastColumn = getColumnName(dates.length + 1);
  const lastRow = Math.max(employees.length + 1, 1);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <dimension ref="A1:${lastColumn}${lastRow}"/>
    <cols>
      <col min="1" max="1" width="28" customWidth="1"/>
      <col min="2" max="${dates.length + 1}" width="12" customWidth="1"/>
    </cols>
    <sheetData>${header}${rows}</sheetData>
  </worksheet>`;
}

function createXlsxBase64(dates: string[], entries: ScheduleEntryWithEmployee[]) {
  const worksheetXml = buildWorksheetXml(dates, entries);
  const bytes = createZip([
    {
      name: '[Content_Types].xml',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    },
    {
      name: '_rels/.rels',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Grafik" sheetId="1" r:id="rId1"/></sheets></workbook>',
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    },
    { name: 'xl/worksheets/sheet1.xml', content: worksheetXml },
  ]);

  return toBase64(bytes);
}

export async function generateScheduleXlsx(scheduleWeekId: string): Promise<XlsxExportResult> {
  try {
    const data = await scheduleService.getScheduleEditorData(scheduleWeekId);
    const base64 = createXlsxBase64(data.dates, data.entries);
    const fileName = `grafik-${data.week.startDate}-${data.week.endDate}.xlsx`;
    const savedFile = await saveXlsxForUser(base64, fileName);

    return { fileName, base64, ...savedFile };
  } catch {
    throw new Error(scheduleErrorMessages.exportFailed);
  }
}

async function saveXlsxForUser(base64: string, fileName: string) {
  try {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const baseName = fileName.replace(/\.xlsx$/i, '');
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, baseName, XLSX_MIME);
      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });

      return {
        uri,
        locationLabel: 'wybrany folder w pamięci telefonu',
      };
    }
  } catch {
    // iOS and some Android file managers do not expose SAF. Fall back to app storage and share sheet.
  }

  const uri = await saveXlsxToAppDocuments(base64, fileName);

  if (uri && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, {
      mimeType: XLSX_MIME,
      dialogTitle: 'Zapisz grafik Excel',
      UTI: XLSX_UTI,
    });
  }

  return {
    uri,
    locationLabel: uri ? 'dokumenty aplikacji / systemowe udostępnianie' : 'wygenerowany plik Excel',
  };
}

async function saveXlsxToAppDocuments(base64: string, fileName: string) {
  const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!baseDirectory) {
    return null;
  }

  const uri = `${baseDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

import { ScheduleEntryWithEmployee } from '../types/scheduleTypes';
import { formatDisplayDate, getDayLabel } from '../utils/dateRangeUtils';
import { getAllShiftOptions, getShiftShortLabel } from '../utils/shiftUtils';
import { scheduleErrorMessages } from '../validation/scheduleValidation';
import * as scheduleService from './scheduleService';

declare const require: any;

type DocxExportResult = {
  fileName: string;
  uri: string | null;
  base64: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function paragraph(text: string, bold = false) {
  const boldTag = bold ? '<w:rPr><w:b/></w:rPr>' : '';
  return `<w:p><w:r>${boldTag}<w:t>${escapeXml(text)}</w:t></w:r></w:p>`;
}

function cell(text: string) {
  return `<w:tc><w:tcPr><w:tcW w:w="1800" w:type="dxa"/></w:tcPr>${paragraph(text)}</w:tc>`;
}

function buildTable(dates: string[], entries: ScheduleEntryWithEmployee[]) {
  const employeeIds = Array.from(new Set(entries.map((entry) => entry.employeeId)));
  const employees = employeeIds
    .map((employeeId) => entries.find((entry) => entry.employeeId === employeeId)?.employee)
    .filter(Boolean);

  const header = `<w:tr>${cell('Pracownik')}${dates
    .map((date) => cell(`${getDayLabel(date)} ${formatDisplayDate(date).slice(0, 5)}`))
    .join('')}</w:tr>`;

  const rows = employees
    .map((employee) => {
      if (!employee) {
        return '';
      }

      const entryCells = dates
        .map((date) => {
          const entry = entries.find((item) => item.employeeId === employee.id && item.entryDate === date);
          return cell(entry ? getShiftShortLabel(entry.shiftCode) : '0');
        })
        .join('');

      return `<w:tr>${cell(employee.fullName)}${entryCells}</w:tr>`;
    })
    .join('');

  return `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>${header}${rows}</w:tbl>`;
}

function buildDocumentXml(dates: string[], entries: ScheduleEntryWithEmployee[]) {
  const rangeLabel = `${formatDisplayDate(dates[0])} - ${formatDisplayDate(dates[dates.length - 1])}`;
  const legend = getAllShiftOptions()
    .map((option) => paragraph(`${option.label} - ${option.description}`))
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
      ${paragraph('Grafik pracy', true)}
      ${paragraph(`Zakres dat: ${rangeLabel}`)}
      ${paragraph(`Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`)}
      ${buildTable(dates, entries)}
      ${paragraph('Legenda', true)}
      ${legend}
      <w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr>
    </w:body>
  </w:document>`;
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

export async function generateScheduleDocx(scheduleWeekId: string): Promise<DocxExportResult> {
  try {
    const data = await scheduleService.getScheduleEditorData(scheduleWeekId);
    const documentXml = buildDocumentXml(data.dates, data.entries);
    const bytes = createZip([
      {
        name: '[Content_Types].xml',
        content:
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
      },
      {
        name: '_rels/.rels',
        content:
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      },
      { name: 'word/document.xml', content: documentXml },
    ]);
    const base64 = toBase64(bytes);
    const fileName = `grafik-${data.week.startDate}-${data.week.endDate}.docx`;

    try {
      const FileSystem = require('expo-file-system');
      const Sharing = require('expo-sharing');
      const uri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          dialogTitle: 'Udostępnij grafik',
          UTI: 'org.openxmlformats.wordprocessingml.document',
        });
      }

      return { fileName, uri, base64 };
    } catch {
      return { fileName, uri: null, base64 };
    }
  } catch {
    throw new Error(scheduleErrorMessages.exportFailed);
  }
}

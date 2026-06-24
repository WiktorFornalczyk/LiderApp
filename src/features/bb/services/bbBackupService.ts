import { BbBackupData, BbImportMode, BbImportSummary, BbRecord } from '../types/bbTypes';
import { bbErrorMessages } from '../validation/bbValidation';
import * as bbRepository from './bbRepository';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

type ExportOptions = {
  includeArchived?: boolean;
  saveExternally?: boolean;
};

type ExportResult = {
  json: string;
  uri: string | null;
  fileName: string;
  locationLabel: string;
};

export async function exportBbDataToJson(options?: ExportOptions): Promise<ExportResult> {
  try {
    const recordsWithYards = await bbRepository.getBbRecordsForExport(options);
    const yardsById = new Map(recordsWithYards.map((record) => [record.yard.id, record.yard]));
    const bbRecords: BbRecord[] = recordsWithYards.map(({ yard, ...record }) => record);
    const data: BbBackupData = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appName: 'LiderApp',
      dataType: 'bb_backup',
      yards: Array.from(yardsById.values()),
      bbRecords,
    };
    const json = JSON.stringify(data, null, 2);
    const fileName = `liderapp-bb-backup-${new Date().toISOString().slice(0, 10)}.json`;

    if (options?.saveExternally === false) {
      const internalUri = await saveJsonToAppDocuments(json, fileName);
      return {
        json,
        uri: internalUri,
        fileName,
        locationLabel: internalUri ? 'pamięć aplikacji' : 'pamięć tymczasowa',
      };
    }

    const savedFile = await saveJsonForUser(json, fileName);
    return { json, fileName, ...savedFile };
  } catch {
    throw new Error(bbErrorMessages.exportFailed);
  }
}

export async function importBbDataFromJson(fileUriOrJson: string, mode: BbImportMode) {
  try {
    let jsonText = fileUriOrJson;

    if (!fileUriOrJson.trim().startsWith('{')) {
      jsonText = await FileSystem.readAsStringAsync(fileUriOrJson);
    }

    const data = validateBbBackupJson(JSON.parse(jsonText));

    if (mode === 'replace') {
      await createLocalBackupBeforeReplace();
      await replaceBbBackupData(data);
      return { added: data.yards.length + data.bbRecords.length, updated: 0, skipped: 0, conflicts: 0 };
    }

    return mergeBbBackupData(data);
  } catch {
    throw new Error(bbErrorMessages.importFailed);
  }
}

export function validateBbBackupJson(data: unknown): BbBackupData {
  if (!data || typeof data !== 'object') {
    throw new Error(bbErrorMessages.importFailed);
  }

  const backup = data as BbBackupData;

  if (
    backup.schemaVersion !== 1 ||
    backup.appName !== 'LiderApp' ||
    backup.dataType !== 'bb_backup' ||
    !Array.isArray(backup.yards) ||
    !Array.isArray(backup.bbRecords)
  ) {
    throw new Error(bbErrorMessages.importFailed);
  }

  return backup;
}

export async function createLocalBackupBeforeReplace() {
  const backup = await exportBbDataToJson({ includeArchived: true, saveExternally: false });
  await bbRepository.setSetting('lastBbLocalBackupBeforeReplaceAt', new Date().toISOString());
  await bbRepository.setSetting('lastBbLocalBackupBeforeReplaceJson', backup.json);
  return backup;
}

export async function mergeBbBackupData(data: BbBackupData): Promise<BbImportSummary> {
  return bbRepository.mergeBbBackupData(data);
}

export async function replaceBbBackupData(data: BbBackupData) {
  await bbRepository.replaceBbBackupData(data);
}

async function saveJsonForUser(json: string, fileName: string) {
  try {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const baseName = fileName.replace(/\.json$/i, '');
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        baseName,
        'application/json'
      );
      await FileSystem.writeAsStringAsync(uri, json);
      return {
        uri,
        locationLabel: 'wybrany folder w pamięci telefonu',
      };
    }
  } catch {
    // iOS and some Android file managers do not expose SAF. Fall back to app storage and share sheet.
  }

  const uri = await saveJsonToAppDocuments(json, fileName);

  if (uri && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Zapisz eksport BB',
      UTI: 'public.json',
    });
  }

  return {
    uri,
    locationLabel: uri ? 'dokumenty aplikacji / systemowe udostępnianie' : 'wygenerowany JSON',
  };
}

async function saveJsonToAppDocuments(json: string, fileName: string) {
  const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!baseDirectory) {
    return null;
  }

  const uri = `${baseDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, json);
  return uri;
}

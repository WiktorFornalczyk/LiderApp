import { BbBackupData, BbImportMode, BbImportSummary, BbRecord } from '../types/bbTypes';
import { bbErrorMessages } from '../validation/bbValidation';
import * as bbRepository from './bbRepository';

declare const require: any;

export async function exportBbDataToJson(options?: { includeArchived?: boolean }) {
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

    try {
      const FileSystem = require('expo-file-system');
      const Sharing = require('expo-sharing');
      const uri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(uri, json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: 'Eksport BB',
        });
      }

      return { json, uri, fileName };
    } catch {
      return { json, uri: null, fileName };
    }
  } catch {
    throw new Error(bbErrorMessages.exportFailed);
  }
}

export async function importBbDataFromJson(fileUriOrJson: string, mode: BbImportMode) {
  try {
    let jsonText = fileUriOrJson;

    if (!fileUriOrJson.trim().startsWith('{')) {
      const FileSystem = require('expo-file-system');
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
  const backup = await exportBbDataToJson({ includeArchived: true });
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

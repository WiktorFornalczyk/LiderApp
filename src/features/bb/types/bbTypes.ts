import { Yard } from '../yards/types/yardTypes';

export type BbLine = 'L-I' | 'L-II';
export type BbPallet = 'drewniana' | 'plastikowa' | null;
export type BbStatus = 'active' | 'archived' | 'split';

export type BbRecord = {
  id: string;
  placId: string;
  nrPartii: string;
  rodzajSadzy: string;
  bbOd: number;
  bbDo: number;
  linia: BbLine;
  paleta: BbPallet;
  strecz: boolean;
  kapturownica: boolean;
  uwagi: string | null;
  status: BbStatus;
  archivedAt: string | null;
  parentId: string | null;
  splitFromId: string | null;
  splitAt: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BbRecordRow = Omit<BbRecord, 'strecz' | 'kapturownica' | 'linia' | 'paleta' | 'status'> & {
  linia: string;
  paleta: string | null;
  strecz: number;
  kapturownica: number;
  status: string;
};

export type BbRecordWithYard = BbRecord & {
  yard: Yard;
};

export type BbInput = {
  placId: string;
  nrPartii: string;
  rodzajSadzy: string;
  bbOd: string | number;
  bbDo: string | number;
  linia: BbLine | '';
  paleta?: BbPallet;
  strecz?: boolean;
  kapturownica?: boolean;
  uwagi?: string | null;
};

export type BbValidationErrors = Partial<Record<keyof BbInput | 'status', string>>;

export type BbFilters = {
  placId?: string | null;
  nrPartii?: string;
  rodzajSadzy?: string;
  linia?: BbLine | null;
  paleta?: BbPallet | 'empty';
  strecz?: boolean | null;
  kapturownica?: boolean | null;
  createdAtFrom?: string;
  updatedAtFrom?: string;
};

export type BbSortMode = 'newest' | 'oldest' | 'nrPartii' | 'yard' | 'range' | 'rodzajSadzy';
export type BbListMode = 'active' | 'yards' | 'recent';

export type BbDuplicateResult = {
  type: 'duplicate' | 'overlap';
  record: BbRecordWithYard;
};

export type BbBackupData = {
  schemaVersion: 1;
  exportedAt: string;
  appName: 'LiderApp';
  dataType: 'bb_backup';
  yards: Yard[];
  bbRecords: BbRecord[];
};

export type BbImportMode = 'merge' | 'replace';

export type BbImportSummary = {
  added: number;
  updated: number;
  skipped: number;
  conflicts: number;
};

export type BbOcrResult = {
  imageUri: string | null;
  rawText: string;
  suggestedNrPartii: string | null;
  suggestedValues: Partial<BbInput>;
  suggestedPlacName?: string | null;
  error?: string;
  debugInfo?: string;
};

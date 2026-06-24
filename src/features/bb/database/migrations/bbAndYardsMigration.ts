import { SQLiteDatabase } from 'expo-sqlite';

export async function runBbAndYardsMigration(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS yards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bb_records (
      id TEXT PRIMARY KEY,
      placId TEXT NOT NULL,
      nrPartii TEXT NOT NULL,
      rodzajSadzy TEXT NOT NULL,
      bbOd INTEGER NOT NULL,
      bbDo INTEGER NOT NULL,
      linia TEXT NOT NULL,
      paleta TEXT NULL,
      strecz INTEGER NOT NULL DEFAULT 0,
      kapturownica INTEGER NOT NULL DEFAULT 0,
      uwagi TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      archivedAt TEXT NULL,
      parentId TEXT NULL,
      splitFromId TEXT NULL,
      splitAt INTEGER NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (placId) REFERENCES yards(id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_yards_name ON yards(name);
    CREATE INDEX IF NOT EXISTS idx_bb_records_placId ON bb_records(placId);
    CREATE INDEX IF NOT EXISTS idx_bb_records_nrPartii ON bb_records(nrPartii);
    CREATE INDEX IF NOT EXISTS idx_bb_records_rodzajSadzy ON bb_records(rodzajSadzy);
    CREATE INDEX IF NOT EXISTS idx_bb_records_linia ON bb_records(linia);
    CREATE INDEX IF NOT EXISTS idx_bb_records_status ON bb_records(status);
    CREATE INDEX IF NOT EXISTS idx_bb_records_archivedAt ON bb_records(archivedAt);
    CREATE INDEX IF NOT EXISTS idx_bb_records_splitFromId ON bb_records(splitFromId);
    CREATE INDEX IF NOT EXISTS idx_bb_records_bbRange ON bb_records(nrPartii, bbOd, bbDo);
  `);
}

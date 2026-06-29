import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('notesapp.db');

export enum ItemType {
  Folder = 'folder',
  Note = 'note',
  Voice = 'voice',
  Image = 'image',
  Document = 'document',
}

export interface Item {
  id: number;
  name: string;
  type: ItemType;

  parent_id: number | null;

  content: string | null;
  file_path: string | null;

  created_at: string;
  updated_at: string;
}

export async function initDatabase() {
  console.log('INIT DATABASE');

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      parent_id INTEGER,
      content TEXT,
      file_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY(parent_id)
      REFERENCES items(id)
      ON DELETE CASCADE
    );
    `);
}
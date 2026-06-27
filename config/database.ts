import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('notesapp.db');

export interface Note {
  id: number;
  title: string;
  body: string;
  folder_id?: number | null;
}

export interface Folder {
  id: number;
  name: string;
}

export function initDatabase() {
  console.log('INIT DATABASE');

  db.execSync('PRAGMA foreign_keys = ON;');

  db.execSync(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT,
      folder_id INTEGER,
      FOREIGN KEY(folder_id)
      REFERENCES folders(id)
      ON DELETE CASCADE
    );
  `);
}
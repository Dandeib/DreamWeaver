import * as SQLite from 'expo-sqlite';

export interface Dream {
  id: number;
  date: string;
  title: string;
  content: string;
}

const db = SQLite.openDatabaseSync('dreams.db');

export async function initDB() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS dreams (
      id INTEGER PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    );
  `);
}

export async function addDream(title: string, content: string) {
  const date = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO dreams (date, title, content) VALUES (?, ?, ?)',
    date,
    title,
    content
  );
  return result;
}

export async function getDreams(): Promise<Dream[]> {
  const allRows = await db.getAllAsync<Dream>('SELECT * FROM dreams ORDER BY date DESC');
  return allRows;
}

export async function getDreamById(id: number): Promise<Dream | null> {
  const dream = await db.getFirstAsync<Dream>('SELECT * FROM dreams WHERE id = ?', id);
  return dream;
}


export async function updateDream(id: number, title: string, content: string) {
  const result = await db.runAsync(
    'UPDATE dreams SET title = ?, content = ? WHERE id = ?',
    title,
    content,
    id
  );
  return result;
}

export async function deleteDream(id: number) {
  const result = await db.runAsync('DELETE FROM dreams WHERE id = ?', id);
  return result;
}
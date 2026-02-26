import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import * as schema from './schema';

let _sqlite: InstanceType<typeof Database> | undefined;
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function ensureDb() {
  if (_db && _sqlite) return;

  const DB_PATH = path.resolve(process.cwd(), 'data', 'fastlane.db');
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _sqlite = new Database(DB_PATH);
  _sqlite.pragma('journal_mode = WAL');
  _sqlite.pragma('foreign_keys = ON');
  _db = drizzle(_sqlite, { schema });
}

export function getDb() {
  ensureDb();
  return _db!;
}

export function getSqlite() {
  ensureDb();
  return _sqlite!;
}

// Legacy named exports — kept so existing `import { db } from '@/db'`
// continues to work at runtime. These getters defer initialization until
// the first property access, avoiding crashes during `next build` on
// platforms without a filesystem (e.g. Vercel).
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export const sqlite = new Proxy({} as InstanceType<typeof Database>, {
  get(_, prop) {
    return Reflect.get(getSqlite(), prop);
  },
});

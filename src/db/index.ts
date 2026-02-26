import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import * as schema from './schema';

// Resolve the database file relative to the project root.
// In production you may want to use an absolute path via an env var.
const DB_PATH = path.resolve(process.cwd(), 'data', 'fastlane.db');

// Ensure the data directory exists before opening the database.
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Raw better-sqlite3 connection.
 *
 * Exported for cases where you need direct SQLite access (e.g. backups,
 * PRAGMA statements, or manual transactions).
 */
export const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance.
sqlite.pragma('journal_mode = WAL');

// Enforce foreign key constraints at the database level.
sqlite.pragma('foreign_keys = ON');

/**
 * Drizzle ORM instance pre-configured with the full application schema.
 *
 * Usage:
 *   import { db } from '@/db';
 *   const allUsers = await db.select().from(schema.users);
 */
export const db = drizzle(sqlite, { schema });

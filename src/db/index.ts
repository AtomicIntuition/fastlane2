import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import fs from 'node:fs';
import * as schema from './schema';

const dbUrl = process.env.TURSO_DATABASE_URL ?? 'file:./data/fastlane.db';

// For local file:// databases, ensure the parent directory exists
if (dbUrl.startsWith('file:')) {
  const filePath = dbUrl.slice(5);
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const client = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

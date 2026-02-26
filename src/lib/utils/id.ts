import { ulid } from 'ulid';

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable Identifier).
 *
 * ULIDs are used as primary keys throughout the application because they are:
 * - Globally unique without coordination
 * - Lexicographically sortable (encodes creation time)
 * - URL-safe (Crockford Base32)
 * - 128-bit compatible with UUID storage
 */
export function generateId(): string {
  return ulid();
}

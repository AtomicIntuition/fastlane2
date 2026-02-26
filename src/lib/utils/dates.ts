/**
 * Date and time utilities for the FastLane fasting tracker.
 *
 * All timestamps throughout the application are stored as UTC milliseconds
 * (Unix epoch). These helpers convert between that representation and
 * human-readable formats.
 */

/** Return the current UTC timestamp in milliseconds. */
export function nowUtc(): number {
  return Date.now();
}

/**
 * Format a duration given in milliseconds into a compact human-readable
 * string.
 *
 * - Durations >= 1 hour  → "Xh Ym"
 * - Durations <  1 hour  → "Xm Ys"
 * - Negative durations   → "0m 0s"
 */
export function formatDuration(ms: number): string {
  if (ms < 0) return '0m 0s';

  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  if (totalHours > 0) {
    const remainingMinutes = totalMinutes % 60;
    return `${totalHours}h ${remainingMinutes}m`;
  }

  const remainingSeconds = totalSeconds % 60;
  return `${totalMinutes}m ${remainingSeconds}s`;
}

/**
 * Format a UTC millisecond timestamp to a locale time string.
 *
 * Example output: "2:30 PM"
 */
export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a UTC millisecond timestamp to a locale date string.
 *
 * Example output: "Jan 15, 2026"
 */
export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Return the start of the day (00:00:00.000 UTC) for the given timestamp.
 */
export function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Calculate the number of whole days between two timestamps.
 *
 * The result is always a non-negative integer regardless of argument order.
 */
export function daysBetween(a: number, b: number): number {
  const msPerDay = 86_400_000;
  return Math.floor(Math.abs(a - b) / msPerDay);
}

/**
 * Convert a UTC millisecond timestamp to an ISO date string (YYYY-MM-DD).
 */
export function toDateString(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

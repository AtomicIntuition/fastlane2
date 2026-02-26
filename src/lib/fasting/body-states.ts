/* ------------------------------------------------------------------ */
/*  Metabolic Body States                                              */
/* ------------------------------------------------------------------ */

export interface BodyState {
  id: string
  name: string
  emoji: string
  startHour: number
  endHour: number
  description: string
}

export const BODY_STATES: BodyState[] = [
  {
    id: 'anabolic',
    name: 'Anabolic',
    emoji: '🍽️',
    startHour: 0,
    endHour: 4,
    description:
      'Your body is digesting food, absorbing nutrients, and storing energy. Blood sugar and insulin levels are elevated.',
  },
  {
    id: 'catabolic',
    name: 'Catabolic',
    emoji: '🔄',
    startHour: 4,
    endHour: 8,
    description:
      'Insulin levels are dropping. Your body begins transitioning from using glucose to tapping into glycogen stores.',
  },
  {
    id: 'fat-burning',
    name: 'Fat Burning',
    emoji: '🔥',
    startHour: 8,
    endHour: 12,
    description:
      'Glycogen stores are depleting. Your body increasingly relies on fat oxidation for energy.',
  },
  {
    id: 'ketosis',
    name: 'Ketosis',
    emoji: '⚡',
    startHour: 12,
    endHour: 14,
    description:
      'Your liver is producing ketone bodies from fatty acids. Mental clarity and sustained energy improve.',
  },
  {
    id: 'autophagy',
    name: 'Autophagy',
    emoji: '♻️',
    startHour: 14,
    endHour: 16,
    description:
      'Cellular recycling activates. Damaged proteins and organelles are broken down and reused.',
  },
  {
    id: 'deep-autophagy',
    name: 'Deep Autophagy',
    emoji: '🧬',
    startHour: 16,
    endHour: 24,
    description:
      'Autophagy intensifies. Growth hormone increases significantly, supporting fat metabolism and tissue repair.',
  },
  {
    id: 'immune-reset',
    name: 'Immune Reset',
    emoji: '🛡️',
    startHour: 24,
    endHour: 48,
    description:
      'Extended fasting triggers immune cell regeneration. Old immune cells are recycled and replaced with new ones.',
  },
  {
    id: 'stem-cell',
    name: 'Stem Cell',
    emoji: '🌱',
    startHour: 48,
    endHour: 72,
    description:
      'Stem cell-based regeneration is activated. The body enters a deep renewal state affecting multiple organ systems.',
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Get the current body state for a given number of elapsed hours.
 * Returns the last state if beyond 72h.
 */
export function getCurrentBodyState(elapsedHours: number): BodyState {
  const clamped = Math.max(0, elapsedHours)
  for (let i = BODY_STATES.length - 1; i >= 0; i--) {
    if (clamped >= BODY_STATES[i].startHour) {
      return BODY_STATES[i]
    }
  }
  return BODY_STATES[0]
}

/**
 * Get the next body state after the current elapsed hours.
 * Returns `null` if the user is in the final state (Stem Cell).
 */
export function getNextBodyState(elapsedHours: number): BodyState | null {
  const current = getCurrentBodyState(elapsedHours)
  const currentIdx = BODY_STATES.findIndex((s) => s.id === current.id)
  if (currentIdx >= BODY_STATES.length - 1) return null
  return BODY_STATES[currentIdx + 1]
}

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
    name: 'Fed State',
    emoji: '🍽️',
    startHour: 0,
    endHour: 4,
    description:
      'Your body is digesting your last meal. Blood sugar and insulin are elevated — totally normal, this is where every fast begins.',
  },
  {
    id: 'catabolic',
    name: 'Transition',
    emoji: '🔄',
    startHour: 4,
    endHour: 8,
    description:
      'Insulin is dropping and your body is switching fuel sources. You\'re probably sleeping through this part!',
  },
  {
    id: 'fat-burning',
    name: 'Fat Burning',
    emoji: '🔥',
    startHour: 8,
    endHour: 12,
    description:
      'Your body is now burning stored fat for energy. This is where the magic starts — you\'re in the zone.',
  },
  {
    id: 'ketosis',
    name: 'Ketosis',
    emoji: '⚡',
    startHour: 12,
    endHour: 14,
    description:
      'Ketones are fueling your brain. Many people feel sharper focus and steady energy during this phase.',
  },
  {
    id: 'autophagy',
    name: 'Cell Repair',
    emoji: '♻️',
    startHour: 14,
    endHour: 16,
    description:
      'Your cells are cleaning house — recycling damaged parts and repairing themselves. This is the sweet spot for 16:8 fasters.',
  },
  {
    id: 'deep-autophagy',
    name: 'Deep Repair',
    emoji: '🧬',
    startHour: 16,
    endHour: 24,
    description:
      'Cell repair intensifies and growth hormone rises. You\'re going beyond the standard window — great for occasional extended fasts.',
  },
  {
    id: 'immune-reset',
    name: 'Immune Reset',
    emoji: '🛡️',
    startHour: 24,
    endHour: 48,
    description:
      'Your immune system regenerates old cells. This is an advanced extended fast — not for daily use. Consult a doctor first.',
  },
  {
    id: 'stem-cell',
    name: 'Deep Renewal',
    emoji: '🌱',
    startHour: 48,
    endHour: 72,
    description:
      'Stem cell regeneration activates. This is an advanced multi-day fast — only for experienced fasters under medical guidance.',
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

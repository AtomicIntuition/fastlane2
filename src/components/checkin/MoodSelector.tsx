'use client'

import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type MoodValue = 'great' | 'good' | 'okay' | 'rough' | 'terrible'

export interface MoodSelectorProps {
  /** Currently selected mood */
  value: MoodValue | null
  /** Called when a mood is selected */
  onChange: (mood: MoodValue) => void
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Mood options                                                       */
/* ------------------------------------------------------------------ */

interface MoodOption {
  value: MoodValue
  emoji: string
  label: string
}

const MOODS: MoodOption[] = [
  { value: 'great', emoji: '\u{1F604}', label: 'Great' },
  { value: 'good', emoji: '\u{1F642}', label: 'Good' },
  { value: 'okay', emoji: '\u{1F610}', label: 'Okay' },
  { value: 'rough', emoji: '\u{1F61F}', label: 'Rough' },
  { value: 'terrible', emoji: '\u{1F62B}', label: 'Terrible' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MoodSelector({ value, onChange, className }: MoodSelectorProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-2', className)}
      role="radiogroup"
      aria-label="Mood selector"
    >
      {MOODS.map((mood) => {
        const isSelected = value === mood.value

        return (
          <button
            key={mood.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={mood.label}
            onClick={() => onChange(mood.value)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-[var(--fl-radius-lg)] py-3 px-2',
              'transition-all duration-[var(--fl-transition-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2',
              isSelected
                ? 'bg-[var(--fl-primary)]/10 ring-2 ring-[var(--fl-primary)] shadow-[var(--fl-shadow-sm)]'
                : 'bg-[var(--fl-bg-secondary)] hover:bg-[var(--fl-bg-tertiary)]',
            )}
          >
            <span
              className={cn(
                'text-2xl transition-transform duration-[var(--fl-transition-fast)]',
                isSelected && 'scale-110',
              )}
              aria-hidden="true"
            >
              {mood.emoji}
            </span>
            <span
              className={cn(
                'text-[var(--fl-text-xs)] font-medium',
                isSelected
                  ? 'text-[var(--fl-primary)]'
                  : 'text-[var(--fl-text-secondary)]',
              )}
            >
              {mood.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

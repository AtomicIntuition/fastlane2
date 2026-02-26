'use client'

import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { MoodSelector, type MoodValue } from '@/components/checkin/MoodSelector'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CheckinInput {
  mood: MoodValue
  hungerLevel: number
  energyLevel: number
  notes: string
}

export interface CheckinFormProps {
  /** Called when the form is submitted with valid data */
  onSubmit: (data: CheckinInput) => void | Promise<void>
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CheckinForm({ onSubmit, className }: CheckinFormProps) {
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [hungerLevel, setHungerLevel] = useState(5)
  const [energyLevel, setEnergyLevel] = useState(5)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!mood) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        mood,
        hungerLevel,
        energyLevel,
        notes: notes.trim(),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-6', className)}
    >
      {/* Mood selector */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)] mb-2">
          How are you feeling?
        </legend>
        <MoodSelector value={mood} onChange={setMood} />
      </fieldset>

      {/* Hunger level slider */}
      <Slider
        label="Hunger Level"
        min={1}
        max={10}
        step={1}
        value={hungerLevel}
        onChange={(e) => setHungerLevel(Number(e.target.value))}
        showValue
        minLabel="Not hungry"
        maxLabel="Very hungry"
        formatValue={(v) => String(v)}
      />

      {/* Energy level slider */}
      <Slider
        label="Energy Level"
        min={1}
        max={10}
        step={1}
        value={energyLevel}
        onChange={(e) => setEnergyLevel(Number(e.target.value))}
        showValue
        minLabel="Low energy"
        maxLabel="High energy"
        formatValue={(v) => String(v)}
      />

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="checkin-notes"
          className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]"
        >
          Notes <span className="font-normal text-[var(--fl-text-tertiary)]">(optional)</span>
        </label>
        <textarea
          id="checkin-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything you want to remember about today..."
          rows={3}
          className={cn(
            'w-full resize-none rounded-[var(--fl-radius-md)] border border-[var(--fl-border)]',
            'bg-[var(--fl-bg)] px-3 py-2 text-[var(--fl-text-base)] text-[var(--fl-text)]',
            'placeholder:text-[var(--fl-text-tertiary)]',
            'transition-colors duration-[var(--fl-transition-fast)]',
            'hover:border-[var(--fl-border-hover)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--fl-border-focus)] focus:border-[var(--fl-border-focus)]',
          )}
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={!mood}
        leftIcon={<Send size={18} />}
      >
        Save Check-in
      </Button>
    </form>
  )
}

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Target,
  Heart,
  Leaf,
  Brain,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Clock,
  Lock,
  Star,
  Check,
  Bell,
  BellOff,
  Globe,
  Zap,
  Trophy,
  Dumbbell,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  onboardingSchema,
  type OnboardingInput,
  type fastingGoals,
  type experienceLevels,
} from '@/lib/utils/validation';
import {
  PROTOCOLS,
  getProtocol,
  recommendProtocol,
  type FastingProtocol,
} from '@/lib/fasting/protocols';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 5;

type FastingGoal = (typeof fastingGoals)[number];
type ExperienceLevel = (typeof experienceLevels)[number];

interface GoalOption {
  value: FastingGoal;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'weight_loss',
    label: 'Weight Loss',
    description: 'Burn fat and reach a healthy weight through time-restricted eating.',
    icon: <Target size={24} />,
  },
  {
    value: 'health',
    label: 'Better Health',
    description: 'Improve metabolic health, blood sugar, and overall wellbeing.',
    icon: <Heart size={24} />,
  },
  {
    value: 'longevity',
    label: 'Longevity',
    description: 'Activate cellular repair processes and slow aging.',
    icon: <Leaf size={24} />,
  },
  {
    value: 'mental_clarity',
    label: 'Mental Clarity',
    description: 'Sharpen focus and cognitive performance through fasting.',
    icon: <Brain size={24} />,
  },
  {
    value: 'autophagy',
    label: 'Autophagy',
    description: 'Trigger deep cellular cleanup and regeneration.',
    icon: <Sparkles size={24} />,
  },
];

interface ExperienceOption {
  value: ExperienceLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to fasting',
    icon: <Star size={24} />,
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Done some fasting before',
    icon: <Dumbbell size={24} />,
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced faster',
    icon: <Trophy size={24} />,
  },
];

const DIFFICULTY_BADGE_MAP: Record<FastingProtocol['difficulty'], { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  beginner: { variant: 'success', label: 'Beginner' },
  intermediate: { variant: 'warning', label: 'Intermediate' },
  advanced: { variant: 'danger', label: 'Advanced' },
};

/* ------------------------------------------------------------------ */
/*  OnboardingWizard                                                   */
/* ------------------------------------------------------------------ */

export function OnboardingWizard() {
  const router = useRouter();

  /* ---- wizard state ---- */
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animating, setAnimating] = useState(false);

  const [fastingGoal, setFastingGoal] = useState<FastingGoal | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [preferredProtocol, setPreferredProtocol] = useState('');
  const [timezone, setTimezone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  /* ---- auto-detect timezone ---- */
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz);
    } catch {
      setTimezone('UTC');
    }
  }, []);

  /* ---- recommended protocol ---- */
  const recommended = useMemo(() => {
    if (fastingGoal && experienceLevel) {
      return recommendProtocol(experienceLevel as ExperienceLevel, fastingGoal);
    }
    return null;
  }, [fastingGoal, experienceLevel]);

  /* ---- selected protocol details ---- */
  const selectedProtocol = useMemo(() => {
    return preferredProtocol ? getProtocol(preferredProtocol) : null;
  }, [preferredProtocol]);

  /* ---- step transition helper ---- */
  const goToStep = useCallback((nextStep: number, dir: 'forward' | 'backward') => {
    setDirection(dir);
    setAnimating(true);
    // Short delay for exit animation
    setTimeout(() => {
      setStep(nextStep);
      // Allow enter animation
      setTimeout(() => {
        setAnimating(false);
      }, 50);
    }, 200);
  }, []);

  /* ---- step validation ---- */
  function validateStep(): boolean {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!fastingGoal) stepErrors.fastingGoal = 'Please select a fasting goal';
        break;
      case 2:
        if (!experienceLevel) stepErrors.experienceLevel = 'Please select your experience level';
        break;
      case 3:
        if (!preferredProtocol) stepErrors.preferredProtocol = 'Please select a fasting protocol';
        break;
      case 4:
        if (!timezone) stepErrors.timezone = 'Timezone is required';
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  /* ---- navigation ---- */
  function handleNext() {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) {
      goToStep(step + 1, 'forward');
    }
  }

  function handleBack() {
    if (step > 1) {
      setErrors({});
      goToStep(step - 1, 'backward');
    }
  }

  /* ---- final submit ---- */
  async function handleFinish() {
    setServerError('');

    const payload: OnboardingInput = {
      fastingGoal: fastingGoal as FastingGoal,
      experienceLevel: experienceLevel as ExperienceLevel,
      preferredProtocol,
      timezone,
    };

    // Full validation
    const result = onboardingSchema.safeParse(payload);
    if (!result.success) {
      setServerError('Please complete all steps before continuing.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          notificationsEnabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setServerError(data?.error ?? 'Failed to save preferences. Please try again.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setServerError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Step renderers                                                   */
  /* ---------------------------------------------------------------- */

  function renderGoalStep() {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--fl-text)] sm:text-2xl">
            What&apos;s your fasting goal?
          </h2>
          <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            This helps us recommend the best protocol for you
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFastingGoal(option.value);
                if (errors.fastingGoal) setErrors((prev) => ({ ...prev, fastingGoal: '' }));
              }}
              className={cn(
                'flex items-start gap-4 rounded-[var(--fl-radius-lg)] border p-4 text-left',
                'transition-all duration-[var(--fl-transition-fast)]',
                'hover:border-[var(--fl-primary)] hover:bg-[var(--fl-bg-secondary)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2',
                fastingGoal === option.value
                  ? 'border-[var(--fl-primary)] bg-emerald-50/50 ring-1 ring-[var(--fl-primary)]'
                  : 'border-[var(--fl-border)] bg-[var(--fl-bg)]',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--fl-radius-md)]',
                  fastingGoal === option.value
                    ? 'bg-[var(--fl-primary)] text-white'
                    : 'bg-[var(--fl-bg-tertiary)] text-[var(--fl-text-secondary)]',
                )}
              >
                {option.icon}
              </span>
              <div className="flex-1">
                <span className="block font-semibold text-[var(--fl-text)]">
                  {option.label}
                </span>
                <span className="block text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                  {option.description}
                </span>
              </div>
              {fastingGoal === option.value && (
                <Check size={20} className="mt-1 shrink-0 text-[var(--fl-primary)]" />
              )}
            </button>
          ))}
        </div>

        {errors.fastingGoal && (
          <p role="alert" className="text-center text-[var(--fl-text-sm)] text-[var(--fl-danger)]">
            {errors.fastingGoal}
          </p>
        )}
      </div>
    );
  }

  function renderExperienceStep() {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--fl-text)] sm:text-2xl">
            What&apos;s your experience level?
          </h2>
          <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            We&apos;ll tailor our recommendations to where you are
          </p>
        </div>

        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {EXPERIENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setExperienceLevel(option.value);
                if (errors.experienceLevel) setErrors((prev) => ({ ...prev, experienceLevel: '' }));
              }}
              className={cn(
                'flex flex-col items-center gap-3 rounded-[var(--fl-radius-lg)] border p-6 text-center',
                'transition-all duration-[var(--fl-transition-fast)]',
                'hover:border-[var(--fl-primary)] hover:bg-[var(--fl-bg-secondary)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2',
                experienceLevel === option.value
                  ? 'border-[var(--fl-primary)] bg-emerald-50/50 ring-1 ring-[var(--fl-primary)]'
                  : 'border-[var(--fl-border)] bg-[var(--fl-bg)]',
              )}
            >
              <span
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full',
                  experienceLevel === option.value
                    ? 'bg-[var(--fl-primary)] text-white'
                    : 'bg-[var(--fl-bg-tertiary)] text-[var(--fl-text-secondary)]',
                )}
              >
                {option.icon}
              </span>
              <div>
                <span className="block text-lg font-semibold text-[var(--fl-text)]">
                  {option.label}
                </span>
                <span className="block text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                  {option.description}
                </span>
              </div>
              {experienceLevel === option.value && (
                <Check size={20} className="text-[var(--fl-primary)]" />
              )}
            </button>
          ))}
        </div>

        {errors.experienceLevel && (
          <p role="alert" className="text-center text-[var(--fl-text-sm)] text-[var(--fl-danger)]">
            {errors.experienceLevel}
          </p>
        )}
      </div>
    );
  }

  function renderProtocolStep() {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--fl-text)] sm:text-2xl">
            Choose your protocol
          </h2>
          <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            {recommended
              ? `We recommend ${recommended.name} based on your goals`
              : 'Select the fasting schedule that works best for you'}
          </p>
        </div>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {PROTOCOLS.map((protocol) => {
            const isRecommended = recommended?.id === protocol.id;
            const isSelected = preferredProtocol === protocol.id;
            const diffBadge = DIFFICULTY_BADGE_MAP[protocol.difficulty];

            return (
              <button
                key={protocol.id}
                type="button"
                onClick={() => {
                  setPreferredProtocol(protocol.id);
                  if (errors.preferredProtocol) setErrors((prev) => ({ ...prev, preferredProtocol: '' }));
                }}
                className={cn(
                  'relative flex flex-col gap-2 rounded-[var(--fl-radius-lg)] border p-4 text-left',
                  'transition-all duration-[var(--fl-transition-fast)]',
                  'hover:border-[var(--fl-primary)] hover:bg-[var(--fl-bg-secondary)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-[var(--fl-primary)] bg-emerald-50/50 ring-1 ring-[var(--fl-primary)]'
                    : 'border-[var(--fl-border)] bg-[var(--fl-bg)]',
                )}
              >
                {/* Recommended badge */}
                {isRecommended && (
                  <div className="absolute -top-2.5 left-3">
                    <Badge variant="success" size="sm">
                      <Zap size={10} className="mr-0.5" />
                      Recommended
                    </Badge>
                  </div>
                )}

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock
                      size={18}
                      className={cn(
                        isSelected ? 'text-[var(--fl-primary)]' : 'text-[var(--fl-text-secondary)]',
                      )}
                    />
                    <span className="font-bold text-[var(--fl-text)]">{protocol.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={diffBadge.variant} size="sm">
                      {diffBadge.label}
                    </Badge>
                    {protocol.isPro && (
                      <Lock size={14} className="text-amber-500" />
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)] leading-snug">
                  {protocol.description}
                </p>

                {/* Hours display */}
                {protocol.fastingHours > 0 && (
                  <div className="flex items-center gap-2 text-[var(--fl-text-xs)]">
                    <span className="font-semibold text-[var(--fl-primary)]">
                      {protocol.fastingHours}h fasting
                    </span>
                    <span className="text-[var(--fl-text-tertiary)]">/</span>
                    <span className="text-[var(--fl-text-secondary)]">
                      {protocol.eatingHours}h eating
                    </span>
                  </div>
                )}

                {/* Benefits */}
                <div className="flex flex-wrap gap-1">
                  {protocol.benefits.slice(0, 2).map((benefit) => (
                    <Badge key={benefit} variant="default" size="sm">
                      {benefit}
                    </Badge>
                  ))}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute right-3 top-3">
                    <Check size={18} className="text-[var(--fl-primary)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {errors.preferredProtocol && (
          <p role="alert" className="text-center text-[var(--fl-text-sm)] text-[var(--fl-danger)]">
            {errors.preferredProtocol}
          </p>
        )}
      </div>
    );
  }

  function renderScheduleStep() {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--fl-text)] sm:text-2xl">
            Set your preferences
          </h2>
          <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            Fine-tune your fasting experience
          </p>
        </div>

        {/* Protocol summary */}
        {selectedProtocol && (
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--fl-radius-md)] bg-[var(--fl-primary)] text-white">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-semibold text-[var(--fl-text)]">
                  {selectedProtocol.name} Protocol
                </p>
                <p className="text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                  {selectedProtocol.fastingHours > 0
                    ? `${selectedProtocol.fastingHours}h fasting, ${selectedProtocol.eatingHours}h eating`
                    : 'Custom schedule'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Timezone */}
        <div className="flex flex-col gap-2">
          <label className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
            Timezone
          </label>
          <div className="flex items-center gap-3 rounded-[var(--fl-radius-md)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-3">
            <Globe size={18} className="shrink-0 text-[var(--fl-text-secondary)]" />
            <span className="text-[var(--fl-text)]">{timezone || 'Detecting...'}</span>
            <Badge variant="success" size="sm" className="ml-auto">
              Auto-detected
            </Badge>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex flex-col gap-2">
          <label className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
            Notifications
          </label>
          <button
            type="button"
            onClick={() => setNotificationsEnabled((prev) => !prev)}
            className={cn(
              'flex items-center gap-3 rounded-[var(--fl-radius-md)] border px-4 py-3',
              'transition-all duration-[var(--fl-transition-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2',
              notificationsEnabled
                ? 'border-[var(--fl-primary)] bg-emerald-50/50'
                : 'border-[var(--fl-border)] bg-[var(--fl-bg)]',
            )}
          >
            {notificationsEnabled ? (
              <Bell size={18} className="text-[var(--fl-primary)]" />
            ) : (
              <BellOff size={18} className="text-[var(--fl-text-tertiary)]" />
            )}
            <div className="flex-1 text-left">
              <span className="block font-medium text-[var(--fl-text)]">
                {notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
              </span>
              <span className="block text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                {notificationsEnabled
                  ? 'Get reminders when your fast ends'
                  : 'You won\'t receive fasting reminders'}
              </span>
            </div>
            <div
              className={cn(
                'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors',
                notificationsEnabled ? 'bg-[var(--fl-primary)]' : 'bg-[var(--fl-bg-tertiary)]',
              )}
            >
              <div
                className={cn(
                  'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </div>
          </button>
        </div>

        {errors.timezone && (
          <p role="alert" className="text-center text-[var(--fl-text-sm)] text-[var(--fl-danger)]">
            {errors.timezone}
          </p>
        )}
      </div>
    );
  }

  function renderSummaryStep() {
    const goalOption = GOAL_OPTIONS.find((g) => g.value === fastingGoal);
    const experienceOption = EXPERIENCE_OPTIONS.find((e) => e.value === experienceLevel);

    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
            <Check size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--fl-text)] sm:text-2xl">
            You&apos;re all set!
          </h2>
          <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            Here&apos;s a summary of your personalized setup
          </p>
        </div>

        {/* Summary cards */}
        <div className="flex flex-col gap-3">
          {/* Goal */}
          <div className="flex items-center gap-3 rounded-[var(--fl-radius-md)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--fl-radius-md)] bg-[var(--fl-bg-tertiary)] text-[var(--fl-text-secondary)]">
              {goalOption?.icon}
            </span>
            <div className="flex-1">
              <span className="block text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                Goal
              </span>
              <span className="block font-medium text-[var(--fl-text)]">
                {goalOption?.label}
              </span>
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-3 rounded-[var(--fl-radius-md)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--fl-radius-md)] bg-[var(--fl-bg-tertiary)] text-[var(--fl-text-secondary)]">
              {experienceOption?.icon}
            </span>
            <div className="flex-1">
              <span className="block text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                Experience
              </span>
              <span className="block font-medium text-[var(--fl-text)]">
                {experienceOption?.label}
              </span>
            </div>
          </div>

          {/* Protocol */}
          <div className="flex items-center gap-3 rounded-[var(--fl-radius-md)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--fl-radius-md)] bg-[var(--fl-bg-tertiary)] text-[var(--fl-text-secondary)]">
              <Clock size={20} />
            </span>
            <div className="flex-1">
              <span className="block text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                Protocol
              </span>
              <span className="block font-medium text-[var(--fl-text)]">
                {selectedProtocol?.name}
                {selectedProtocol && selectedProtocol.fastingHours > 0 && (
                  <span className="ml-2 text-[var(--fl-text-sm)] font-normal text-[var(--fl-text-secondary)]">
                    ({selectedProtocol.fastingHours}h fast / {selectedProtocol.eatingHours}h eat)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-3 rounded-[var(--fl-radius-md)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--fl-radius-md)] bg-[var(--fl-bg-tertiary)] text-[var(--fl-text-secondary)]">
              <Globe size={20} />
            </span>
            <div className="flex-1">
              <span className="block text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                Timezone
              </span>
              <span className="block font-medium text-[var(--fl-text)]">
                {timezone}
              </span>
            </div>
            {notificationsEnabled ? (
              <Bell size={16} className="text-[var(--fl-primary)]" />
            ) : (
              <BellOff size={16} className="text-[var(--fl-text-tertiary)]" />
            )}
          </div>
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-[var(--fl-radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-[var(--fl-text-sm)] text-red-700"
          >
            {serverError}
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Step content map                                                 */
  /* ---------------------------------------------------------------- */

  const stepContent: Record<number, React.ReactNode> = {
    1: renderGoalStep(),
    2: renderExperienceStep(),
    3: renderProtocolStep(),
    4: renderScheduleStep(),
    5: renderSummaryStep(),
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text-secondary)]">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-[var(--fl-text-sm)] tabular-nums text-[var(--fl-text-tertiary)]">
            {Math.round((step / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <Progress value={step} max={TOTAL_STEPS} color="primary" trackHeight="h-2" />
      </div>

      {/* Step content with transition */}
      <div
        className={cn(
          'transition-all duration-200 ease-in-out',
          animating
            ? direction === 'forward'
              ? 'translate-x-4 opacity-0'
              : '-translate-x-4 opacity-0'
            : 'translate-x-0 opacity-100',
        )}
      >
        {stepContent[step]}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            leftIcon={<ChevronLeft size={18} />}
            disabled={loading}
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={handleNext}
            rightIcon={<ChevronRight size={18} />}
            size="lg"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinish}
            loading={loading}
            size="lg"
            leftIcon={!loading ? <Zap size={18} /> : undefined}
          >
            Start Fasting
          </Button>
        )}
      </div>
    </div>
  );
}

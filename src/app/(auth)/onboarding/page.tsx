import type { Metadata } from 'next';
import { OnboardingWizard } from '@/components/auth/OnboardingWizard';

export const metadata: Metadata = {
  title: 'Onboarding',
};

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--fl-text)] sm:text-3xl">
          Let&apos;s personalize your experience
        </h1>
        <p className="max-w-md text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
          Answer a few quick questions so we can recommend the best fasting protocol
          and settings for you.
        </p>
      </div>

      {/* Wizard */}
      <OnboardingWizard />
    </div>
  );
}

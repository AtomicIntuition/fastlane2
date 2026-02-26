import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
};

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card variant="elevated" padding="lg">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--fl-radius-lg)] bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg">
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--fl-text)]">
              Create your account
            </h1>
            <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              Start your intermittent fasting journey today
            </p>
          </div>
        </div>

        {/* OAuth */}
        <div className="mb-6">
          <OAuthButtons />
        </div>

        {/* Email registration form */}
        <RegisterForm />
      </Card>
    </div>
  );
}

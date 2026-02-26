import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
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
              Welcome back
            </h1>
            <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              Sign in to continue your fasting journey
            </p>
          </div>
        </div>

        {/* OAuth */}
        <div className="mb-6">
          <OAuthButtons />
        </div>

        {/* Email login form */}
        <LoginForm />
      </Card>

      {/* Guest mode link */}
      <p className="mt-4 text-center text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
        <Link
          href="/try"
          className="font-medium text-[var(--fl-primary)] hover:text-[var(--fl-primary-hover)] transition-colors"
        >
          Try without an account
        </Link>
      </p>
    </div>
  );
}

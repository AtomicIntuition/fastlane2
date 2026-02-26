'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '@/lib/utils/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/* ------------------------------------------------------------------ */
/*  RegisterForm                                                       */
/* ------------------------------------------------------------------ */

export function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---- field change handler ---- */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError('');
  }

  /* ---- submit handler ---- */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    // Client-side validation
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterInput;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1. Create account
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json().catch(() => null);
        setServerError(data?.error ?? 'Registration failed. Please try again.');
        return;
      }

      // 2. Auto sign-in after registration
      const signInRes = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.error) {
        // Account was created but auto-login failed - redirect to login
        router.push('/login');
        return;
      }

      // 3. Redirect to onboarding
      router.push('/onboarding');
    } catch {
      setServerError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Server error banner */}
      {serverError && (
        <div
          role="alert"
          className="rounded-[var(--fl-radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-[var(--fl-text-sm)] text-red-700"
        >
          {serverError}
        </div>
      )}

      {/* Name */}
      <Input
        name="name"
        type="text"
        label="Name"
        placeholder="Your name"
        autoComplete="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        leftIcon={<User />}
        disabled={loading}
      />

      {/* Email */}
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        leftIcon={<Mail />}
        disabled={loading}
      />

      {/* Password */}
      <Input
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        leftIcon={<Lock />}
        rightIcon={
          <button
            type="button"
            tabIndex={-1}
            className="pointer-events-auto cursor-pointer text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text)]"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        disabled={loading}
      />

      {/* Confirm Password */}
      <Input
        name="confirmPassword"
        type={showConfirm ? 'text' : 'password'}
        label="Confirm Password"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        leftIcon={<Lock />}
        rightIcon={
          <button
            type="button"
            tabIndex={-1}
            className="pointer-events-auto cursor-pointer text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text)]"
            onClick={() => setShowConfirm((prev) => !prev)}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        disabled={loading}
      />

      {/* Submit */}
      <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
        Create account
      </Button>

      {/* Login link */}
      <p className="text-center text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-[var(--fl-primary)] hover:text-[var(--fl-primary-hover)] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

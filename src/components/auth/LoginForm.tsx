'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/utils/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/* ------------------------------------------------------------------ */
/*  LoginForm                                                          */
/* ------------------------------------------------------------------ */

export function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ---- field change handler ---- */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name as keyof LoginInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError('');
  }

  /* ---- submit handler ---- */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    // Client-side validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginInput;
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
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setServerError('Invalid email or password. Please try again.');
        return;
      }

      router.push('/dashboard');
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
        placeholder="Enter your password"
        autoComplete="current-password"
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

      {/* Forgot password link */}
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-primary)] hover:text-[var(--fl-primary-hover)] transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <Button type="submit" loading={loading} fullWidth size="lg">
        Sign in
      </Button>

      {/* Register link */}
      <p className="text-center text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-[var(--fl-primary)] hover:text-[var(--fl-primary-hover)] transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}

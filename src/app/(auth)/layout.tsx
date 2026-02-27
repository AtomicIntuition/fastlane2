import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unfed',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[var(--fl-bg)]">
      {/* Green accent line at top */}
      <div className="fixed inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[var(--fl-primary)] to-teal-500" />

      {/* Subtle background pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Page content */}
      <main className="relative z-10 w-full px-4 py-12 sm:px-6">
        {children}
      </main>
    </div>
  );
}

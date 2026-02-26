'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Nav data                                                           */
/* ------------------------------------------------------------------ */

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

/* ------------------------------------------------------------------ */
/*  Marketing Header                                                   */
/* ------------------------------------------------------------------ */

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll for sticky header effect */
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close mobile menu on route navigation */
  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-200',
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-lg shadow-sm'
          : 'bg-transparent',
      )}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:rounded-sm"
          aria-label="FastLane home"
        >
          <span className="text-xl font-bold text-foreground">
            Fast<span className="text-emerald-500">Lane</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2',
              'text-sm font-medium text-foreground-secondary',
              'transition-colors hover:text-foreground hover:bg-background-secondary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            )}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2',
              'bg-emerald-500 text-sm font-semibold text-white',
              'transition-colors hover:bg-emerald-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
            )}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-lg md:hidden',
            'text-foreground transition-colors hover:bg-background-secondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
          )}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={cn(
          'overflow-hidden transition-all duration-300 md:hidden',
          mobileMenuOpen
            ? 'max-h-96 border-b border-border bg-background/95 backdrop-blur-lg'
            : 'max-h-0',
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex flex-col gap-1 px-4 pb-6 pt-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMobileMenu}
              className={cn(
                'rounded-lg px-4 py-3 text-base font-medium text-foreground-secondary',
                'transition-colors hover:bg-background-secondary hover:text-foreground',
              )}
            >
              {link.label}
            </a>
          ))}

          <div className="my-2 h-px bg-border" />

          <Link
            href="/login"
            onClick={closeMobileMenu}
            className={cn(
              'rounded-lg px-4 py-3 text-base font-medium text-foreground-secondary',
              'transition-colors hover:bg-background-secondary hover:text-foreground',
            )}
          >
            Log In
          </Link>

          <Link
            href="/register"
            onClick={closeMobileMenu}
            className={cn(
              'mt-1 inline-flex items-center justify-center rounded-lg px-4 py-3',
              'bg-emerald-500 text-base font-semibold text-white',
              'transition-colors hover:bg-emerald-600',
            )}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

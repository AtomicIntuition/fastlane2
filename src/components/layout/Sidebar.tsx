'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Timer,
  CalendarDays,
  BarChart3,
  Settings,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUiStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Timer', href: '/timer', icon: Timer },
  { label: 'History', href: '/history', icon: CalendarDays },
  { label: 'Stats', href: '/stats', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SidebarProps {
  /** User's display name */
  userName?: string
  /** User's email */
  userEmail?: string
  /** User's avatar image URL */
  userImage?: string | null
  /** Whether the user has a Pro subscription */
  isPro?: boolean
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Sidebar({
  userName,
  userEmail,
  userImage,
  isPro = false,
  className,
}: SidebarProps) {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUiStore()

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[var(--fl-z-overlay)] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base layout
          'fixed inset-y-0 left-0 z-[var(--fl-z-overlay)] flex w-64 flex-col',
          'border-r border-[var(--fl-border)] bg-[var(--fl-bg)]',
          // Desktop: always visible
          'lg:z-auto lg:translate-x-0',
          // Mobile: slide in/out
          'transition-transform duration-[var(--fl-transition-base)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop visibility
          'hidden lg:flex',
          sidebarOpen && '!flex',
          className,
        )}
      >
        {/* Header: wordmark + close button (mobile) */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--fl-border)] px-4">
          <span className="text-lg font-bold tracking-tight text-[var(--fl-text)]">
            Fast<span className="text-[var(--fl-primary)]">Lane</span>
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className={cn(
              'inline-flex items-center justify-center lg:hidden',
              'h-8 w-8 rounded-[var(--fl-radius-sm)]',
              'text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text)] hover:bg-[var(--fl-bg-secondary)]',
              'transition-colors duration-[var(--fl-transition-fast)]',
            )}
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 border-b border-[var(--fl-border)] px-4 py-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              'bg-[var(--fl-bg-secondary)] overflow-hidden',
            )}
          >
            {userImage ? (
              <Image
                src={userImage}
                alt={userName ?? 'User avatar'}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : initials ? (
              <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
                {initials}
              </span>
            ) : (
              <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text-tertiary)]">
                ?
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {userName && (
              <p className="truncate text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
                {userName}
              </p>
            )}
            {userEmail && (
              <p className="truncate text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-[var(--fl-radius-md)] px-3 py-2.5',
                      'text-[var(--fl-text-sm)] font-medium',
                      'transition-colors duration-[var(--fl-transition-fast)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)]',
                      isActive
                        ? 'bg-[var(--fl-primary)]/10 text-[var(--fl-primary)]'
                        : 'text-[var(--fl-text-secondary)] hover:bg-[var(--fl-bg-secondary)] hover:text-[var(--fl-text)]',
                    )}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="shrink-0"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Upgrade to Pro card (only for free users) */}
        {!isPro && (
          <div className="px-3 pb-4">
            <Card padding="sm" className="bg-gradient-to-br from-[var(--fl-primary)]/5 to-[var(--fl-primary)]/15">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--fl-primary)]" />
                  <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
                    Upgrade to Pro
                  </span>
                </div>
                <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                  Unlock advanced protocols, detailed analytics, and unlimited history.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="mt-1"
                  leftIcon={<Sparkles size={14} />}
                >
                  Go Pro
                </Button>
              </div>
            </Card>
          </div>
        )}
      </aside>
    </>
  )
}

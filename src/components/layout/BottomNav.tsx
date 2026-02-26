'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Timer,
  CalendarDays,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Timer', href: '/timer', icon: Timer },
  { label: 'History', href: '/history', icon: CalendarDays },
  { label: 'Insights', href: '/stats', icon: TrendingUp },
  { label: 'Profile', href: '/settings', icon: User },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-[var(--fl-z-sticky)] lg:hidden',
        'border-t border-[var(--fl-border)] bg-[var(--fl-bg)]/95 backdrop-blur-sm',
        // Safe area for notched phones (iOS)
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-1',
                'text-[0.625rem] font-medium leading-tight',
                'transition-colors duration-[var(--fl-transition-fast)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:rounded-[var(--fl-radius-md)]',
                isActive
                  ? 'text-[var(--fl-primary)]'
                  : 'text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text-secondary)]',
              )}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className="shrink-0"
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

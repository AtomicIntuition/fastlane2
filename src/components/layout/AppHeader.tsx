'use client'

import Image from 'next/image'
import { Menu, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUiStore } from '@/stores/ui-store'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AppHeaderProps {
  /** Page title displayed in the center */
  title?: string
  /** User's display name for the avatar fallback */
  userName?: string
  /** User's avatar image URL */
  userImage?: string | null
  /** Callback when avatar/menu button is clicked */
  onUserMenuClick?: () => void
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AppHeader({
  title,
  userName,
  userImage,
  onUserMenuClick,
  className,
}: AppHeaderProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null

  return (
    <header
      className={cn(
        'sticky top-0 z-[var(--fl-z-sticky)] flex h-14 items-center justify-between',
        'border-b border-[var(--fl-border)] bg-[var(--fl-bg)]/95 backdrop-blur-sm',
        'px-4 lg:px-6',
        className,
      )}
    >
      {/* Left: hamburger (mobile) + wordmark */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={cn(
            'inline-flex items-center justify-center lg:hidden',
            'h-9 w-9 rounded-[var(--fl-radius-md)]',
            'text-[var(--fl-text-secondary)] hover:text-[var(--fl-text)] hover:bg-[var(--fl-bg-secondary)]',
            'transition-colors duration-[var(--fl-transition-fast)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)]',
          )}
        >
          <Menu size={20} />
        </button>

        <span className="text-lg font-bold tracking-tight text-[var(--fl-text)]">
          Fast<span className="text-[var(--fl-primary)]">Lane</span>
        </span>
      </div>

      {/* Center: page title */}
      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)] hidden sm:block">
          {title}
        </h1>
      )}

      {/* Right: user avatar / menu */}
      <button
        type="button"
        onClick={onUserMenuClick}
        aria-label="User menu"
        className={cn(
          'inline-flex items-center justify-center',
          'h-9 w-9 shrink-0 rounded-full',
          'bg-[var(--fl-bg-secondary)] text-[var(--fl-text-secondary)]',
          'hover:ring-2 hover:ring-[var(--fl-primary)] hover:ring-offset-1',
          'transition-all duration-[var(--fl-transition-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2',
          'overflow-hidden',
        )}
      >
        {userImage ? (
          <Image
            src={userImage}
            alt={userName ?? 'User avatar'}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
            {initials}
          </span>
        ) : (
          <User size={18} />
        )}
      </button>
    </header>
  )
}

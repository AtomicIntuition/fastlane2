'use client'

import { useState } from 'react'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import {
  User,
  Timer,
  Bell,
  CreditCard,
  Trash2,
  LogOut,
  Crown,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { getProtocol } from '@/lib/fasting/protocols'
import { formatDate } from '@/lib/utils/dates'
import { toast } from '@/components/ui/Toast'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SettingsContentProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
  profile: {
    preferredProtocol: string | null
    timezone: string
    notificationsEnabled: boolean
  } | null
  subscription: {
    status: string | null
    currentPeriodEnd: number | null
    cancelAtPeriodEnd: boolean
  } | null
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SettingsContent({
  user,
  profile,
  subscription,
}: SettingsContentProps) {
  const { planId } = useApp()
  const isPro = planId === 'pro'

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const preferredProtocol = profile?.preferredProtocol
    ? getProtocol(profile.preferredProtocol)
    : null

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch {
      setIsSigningOut(false)
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-[var(--fl-text)]">Settings</h2>

      {/* ================================================================ */}
      {/*  Profile Section                                                  */}
      {/* ================================================================ */}
      <Card
        padding="md"
        header={
          <div className="flex items-center gap-2">
            <User size={18} className="text-[var(--fl-text-secondary)]" />
            <h3 className="text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
              Profile
            </h3>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--fl-bg-secondary)]">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User avatar'}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-[var(--fl-text)]">
                  {user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) ?? '?'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
                {user.name ?? 'No name set'}
              </p>
              <p className="truncate text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                {user.email ?? 'No email'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/*  Fasting Preferences                                              */}
      {/* ================================================================ */}
      <Card
        padding="md"
        header={
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-[var(--fl-text-secondary)]" />
            <h3 className="text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
              Fasting Preferences
            </h3>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Preferred Protocol */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
                Preferred Protocol
              </p>
              <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                Your default fasting protocol
              </p>
            </div>
            <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-primary)]">
              {preferredProtocol?.name ?? 'Not set'}
            </span>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between border-t border-[var(--fl-border)] pt-4">
            <div>
              <p className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
                Timezone
              </p>
              <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                Used for daily streak calculations
              </p>
            </div>
            <span className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text-secondary)]">
              {profile?.timezone ?? 'UTC'}
            </span>
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/*  Notifications                                                    */}
      {/* ================================================================ */}
      <Card
        padding="md"
        header={
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[var(--fl-text-secondary)]" />
            <h3 className="text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
              Notifications
            </h3>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
              Push Notifications
            </p>
            <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
              Get notified when your fast is complete
            </p>
          </div>
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${
              profile?.notificationsEnabled
                ? 'bg-[var(--fl-primary)]'
                : 'bg-[var(--fl-bg-tertiary)]'
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                profile?.notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/*  Subscription                                                     */}
      {/* ================================================================ */}
      <Card
        padding="md"
        header={
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[var(--fl-text-secondary)]" />
            <h3 className="text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
              Subscription
            </h3>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Current plan */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
                Current Plan
              </p>
              {isPro && subscription?.currentPeriodEnd && (
                <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
                    : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
                </p>
              )}
            </div>
            <Badge variant={isPro ? 'pro' : 'default'} size="md">
              {isPro ? (
                <span className="flex items-center gap-1">
                  <Crown size={12} />
                  Pro
                </span>
              ) : (
                'Free'
              )}
            </Badge>
          </div>

          {/* Action button */}
          <div className="border-t border-[var(--fl-border)] pt-4">
            {isPro ? (
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink size={14} />}
                onClick={async () => {
                  try {
                    const res = await fetch('/api/stripe/portal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error ?? 'Failed to open portal')
                    if (data.url) window.location.href = data.url
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : 'Failed to open billing portal',
                    )
                  }
                }}
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Crown size={14} />}
                onClick={() => {
                  window.location.href = '/upgrade'
                }}
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/*  Danger Zone                                                      */}
      {/* ================================================================ */}
      <Card
        padding="md"
        header={
          <div className="flex items-center gap-2">
            <Trash2 size={18} className="text-[var(--fl-danger)]" />
            <h3 className="text-[var(--fl-text-base)] font-semibold text-[var(--fl-danger)]">
              Danger Zone
            </h3>
          </div>
        }
        className="border-[var(--fl-danger)]/30"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
                Delete Account
              </p>
              <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/*  Sign Out                                                         */}
      {/* ================================================================ */}
      <div className="pb-4">
        <Button
          variant="ghost"
          size="md"
          fullWidth
          leftIcon={<LogOut size={18} />}
          loading={isSigningOut}
          onClick={handleSignOut}
          className="text-[var(--fl-text-secondary)] hover:text-[var(--fl-danger)]"
        >
          Sign Out
        </Button>
      </div>

      {/* ---- Delete Account Confirmation Dialog ---- */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete your account?"
        description="This will permanently delete your account, all fasting sessions, check-ins, and stats. This action cannot be undone."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                toast.info('Account deletion will be available soon')
                setShowDeleteDialog(false)
              }}
            >
              Delete Account
            </Button>
          </>
        }
      />
    </div>
  )
}

import { Skeleton } from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Title */}
      <Skeleton className="h-7 w-24" />

      {/* Profile card */}
      <div className="rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] p-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" className="h-14 w-14" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Preferences card */}
      <div className="rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] p-4 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Notifications card */}
      <div className="rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton variant="rectangular" className="h-6 w-11 rounded-full" />
        </div>
      </div>

      {/* Subscription card */}
      <Skeleton variant="rectangular" className="h-24 w-full" />

      {/* Sign out button */}
      <Skeleton variant="rectangular" className="h-10 w-full rounded-[var(--fl-radius-md)]" />
    </div>
  )
}

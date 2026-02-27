import { Skeleton } from '@/components/ui/Skeleton'

export default function TimerLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
      {/* TimerRing placeholder */}
      <Skeleton variant="circular" className="h-[220px] w-[220px]" />

      {/* BodyStateCard */}
      <Skeleton variant="rectangular" className="h-20 w-full" />

      {/* Water button */}
      <Skeleton variant="rectangular" className="h-10 w-32 rounded-full" />

      {/* Remaining time text */}
      <Skeleton width="md" className="h-5" />

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <Skeleton variant="rectangular" className="h-10 w-28 rounded-[var(--fl-radius-md)]" />
        <Skeleton variant="rectangular" className="h-10 w-20 rounded-[var(--fl-radius-md)]" />
      </div>

      {/* Body State Timeline */}
      <div className="w-full space-y-3">
        <Skeleton width="sm" className="h-4" />
        <Skeleton variant="rectangular" className="h-32 w-full" />
      </div>
    </div>
  )
}

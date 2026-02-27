import { Skeleton } from '@/components/ui/Skeleton'

export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Title */}
      <Skeleton className="h-7 w-24" />

      {/* Calendar heatmap card */}
      <Skeleton variant="rectangular" className="h-36 w-full" />

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" className="h-8 w-16 rounded-full" />
        <Skeleton variant="rectangular" className="h-8 w-24 rounded-full" />
        <Skeleton variant="rectangular" className="h-8 w-24 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}

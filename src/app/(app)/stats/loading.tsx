import { Skeleton } from '@/components/ui/Skeleton'

export default function StatsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Title */}
      <Skeleton className="h-7 w-24" />

      {/* Streak counter */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-20 w-full" />
        ))}
      </div>

      {/* Weekly summary */}
      <Skeleton variant="rectangular" className="h-28 w-full" />

      {/* Trend chart */}
      <Skeleton variant="rectangular" className="h-48 w-full" />

      {/* Calendar heatmap */}
      <Skeleton variant="rectangular" className="h-36 w-full" />
    </div>
  )
}

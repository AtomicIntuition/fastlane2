import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <WifiOff className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">You&apos;re Offline</h1>
        <p className="text-foreground-secondary mb-6">
          Don&apos;t worry — your fasting timer continues running in the background. Connect to the
          internet to sync your data.
        </p>
        <p className="text-sm text-foreground-tertiary">
          Your timer data is saved locally and will sync when you&apos;re back online.
        </p>
      </div>
    </div>
  )
}

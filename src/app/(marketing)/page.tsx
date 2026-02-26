import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { HomeContent } from './HomeContent'

export default async function HomePage() {
  const session = await auth().catch(() => null)

  if (session?.user?.id) {
    redirect('/timer')
  }

  return <HomeContent />
}

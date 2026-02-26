import Credentials from 'next-auth/providers/credentials'
import { compareSync } from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { loginSchema } from '@/lib/utils/validation'

export const credentialsProvider = Credentials({
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    const parsed = loginSchema.safeParse(credentials)
    if (!parsed.success) return null

    const { email, password } = parsed.data

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get()

    if (!user || !user.passwordHash) return null

    const passwordMatch = compareSync(password, user.passwordHash)
    if (!passwordMatch) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    }
  },
})

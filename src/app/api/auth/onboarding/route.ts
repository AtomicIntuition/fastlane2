import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { onboardingSchema } from '@/lib/utils/validation';
import { generateId } from '@/lib/utils/id';
import { nowUtc } from '@/lib/utils/dates';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { fastingGoal, experienceLevel, preferredProtocol, timezone } = parsed.data;
    const notificationsEnabled = body.notificationsEnabled !== false ? 1 : 0;
    const now = nowUtc();

    const existing = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get();

    if (existing) {
      await db.update(userProfiles)
        .set({
          fastingGoal,
          experienceLevel,
          preferredProtocol,
          timezone,
          notificationsEnabled,
          onboardingCompleted: 1,
          updatedAt: now,
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      await db.insert(userProfiles)
        .values({
          id: generateId(),
          userId,
          fastingGoal,
          experienceLevel,
          preferredProtocol,
          timezone,
          notificationsEnabled,
          onboardingCompleted: 1,
          createdAt: now,
          updatedAt: now,
        });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 },
    );
  }
}

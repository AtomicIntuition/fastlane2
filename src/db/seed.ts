import { hash } from 'bcryptjs';
import { ulid } from 'ulid';
import { db } from './index';
import {
  users,
  userProfiles,
  fastingSessions,
  dailyCheckins,
} from './schema';

/**
 * Seed the database with sample data for local development.
 *
 * Creates:
 * - 1 test user with a hashed password
 * - 1 user profile (onboarding complete)
 * - 3 fasting sessions (2 completed, 1 active)
 * - 4 daily check-ins spread across the sessions
 *
 * Run with:
 *   npx tsx src/db/seed.ts
 */
async function seed(): Promise<void> {
  console.log('[seed] Seeding database...');

  // ------------------------------------------
  // Test user
  // ------------------------------------------
  const userId = ulid();
  const now = Date.now();
  const DAY = 86_400_000;
  const HOUR = 3_600_000;

  const passwordHash = await hash('password123', 12);

  db.insert(users).values({
    id: userId,
    name: 'Jane Faster',
    email: 'jane@example.com',
    passwordHash,
    createdAt: now - 30 * DAY,
    updatedAt: now,
  }).run();

  console.log('[seed] Created test user: jane@example.com / password123');

  // ------------------------------------------
  // User profile
  // ------------------------------------------
  db.insert(userProfiles).values({
    id: ulid(),
    userId,
    fastingGoal: 'health',
    experienceLevel: 'intermediate',
    preferredProtocol: '16:8',
    timezone: 'America/New_York',
    notificationsEnabled: 1,
    onboardingCompleted: 1,
    createdAt: now - 30 * DAY,
    updatedAt: now,
  }).run();

  console.log('[seed] Created user profile');

  // ------------------------------------------
  // Fasting sessions
  // ------------------------------------------
  const session1Id = ulid();
  const session1Start = now - 3 * DAY;
  const session1End = session1Start + 16 * HOUR;

  db.insert(fastingSessions).values({
    id: session1Id,
    userId,
    protocol: '16:8',
    fastingHours: 16,
    eatingHours: 8,
    startedAt: session1Start,
    targetEndAt: session1End,
    actualEndAt: session1End + 30 * 60_000, // ended 30 min late
    status: 'completed',
    notes: 'Felt great, was not too hungry.',
    createdAt: session1Start,
  }).run();

  const session2Id = ulid();
  const session2Start = now - 2 * DAY;
  const session2End = session2Start + 18 * HOUR;

  db.insert(fastingSessions).values({
    id: session2Id,
    userId,
    protocol: '18:6',
    fastingHours: 18,
    eatingHours: 6,
    startedAt: session2Start,
    targetEndAt: session2End,
    actualEndAt: session2End - 15 * 60_000, // ended 15 min early
    status: 'completed',
    notes: 'Tried 18:6 for the first time. A bit challenging.',
    createdAt: session2Start,
  }).run();

  const session3Id = ulid();
  const session3Start = now - 6 * HOUR; // started 6 hours ago

  db.insert(fastingSessions).values({
    id: session3Id,
    userId,
    protocol: '16:8',
    fastingHours: 16,
    eatingHours: 8,
    startedAt: session3Start,
    targetEndAt: session3Start + 16 * HOUR,
    actualEndAt: null,
    status: 'active',
    notes: null,
    createdAt: session3Start,
  }).run();

  console.log('[seed] Created 3 fasting sessions (2 completed, 1 active)');

  // ------------------------------------------
  // Daily check-ins
  // ------------------------------------------
  const checkins = [
    {
      id: ulid(),
      userId,
      fastingSessionId: session1Id,
      date: new Date(session1Start).toISOString().slice(0, 10),
      mood: 'good' as const,
      hungerLevel: 4,
      energyLevel: 7,
      notes: 'Smooth day overall.',
      createdAt: session1Start + 10 * HOUR,
    },
    {
      id: ulid(),
      userId,
      fastingSessionId: session1Id,
      date: new Date(session1End).toISOString().slice(0, 10),
      mood: 'great' as const,
      hungerLevel: 3,
      energyLevel: 8,
      notes: 'Felt really clear-headed.',
      createdAt: session1End,
    },
    {
      id: ulid(),
      userId,
      fastingSessionId: session2Id,
      date: new Date(session2Start).toISOString().slice(0, 10),
      mood: 'okay' as const,
      hungerLevel: 7,
      energyLevel: 5,
      notes: 'The extra two hours were tough.',
      createdAt: session2Start + 12 * HOUR,
    },
    {
      id: ulid(),
      userId,
      fastingSessionId: session3Id,
      date: new Date(session3Start).toISOString().slice(0, 10),
      mood: 'good' as const,
      hungerLevel: 5,
      energyLevel: 6,
      notes: null,
      createdAt: now,
    },
  ];

  for (const checkin of checkins) {
    db.insert(dailyCheckins).values(checkin).run();
  }

  console.log('[seed] Created 4 daily check-ins');
  console.log('[seed] Seeding complete!');
}

// Run the seed function.
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[seed] Seeding failed:', error);
    process.exit(1);
  });

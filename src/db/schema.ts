import { pgTable, text, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ulid } from 'ulid';

// ---------------------------------------------------------------------------
// Auth.js compatible tables
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified'),
  image: text('image'),
  passwordHash: text('passwordHash'),
  createdAt: integer('createdAt')
    .$defaultFn(() => Date.now()),
  updatedAt: integer('updatedAt')
    .$defaultFn(() => Date.now()),
});

export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = pgTable('sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires').notNull(),
});

export const verificationTokens = pgTable(
  'verificationTokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------

export const userProfiles = pgTable('userProfiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('userId')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  fastingGoal: text('fastingGoal', {
    enum: ['weight_loss', 'health', 'longevity', 'mental_clarity', 'autophagy'],
  }),
  experienceLevel: text('experienceLevel', {
    enum: ['beginner', 'intermediate', 'advanced'],
  }),
  preferredProtocol: text('preferredProtocol'),
  timezone: text('timezone').default('UTC'),
  notificationsEnabled: integer('notificationsEnabled').default(1),
  onboardingCompleted: integer('onboardingCompleted').default(0),
  createdAt: integer('createdAt')
    .$defaultFn(() => Date.now()),
  updatedAt: integer('updatedAt')
    .$defaultFn(() => Date.now()),
});

export const fastingSessions = pgTable('fastingSessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  protocol: text('protocol').notNull(),
  fastingHours: integer('fastingHours').notNull(),
  eatingHours: integer('eatingHours').notNull(),
  startedAt: integer('startedAt').notNull(),
  targetEndAt: integer('targetEndAt').notNull(),
  actualEndAt: integer('actualEndAt'),
  status: text('status', {
    enum: ['active', 'completed', 'cancelled'],
  }).default('active'),
  waterGlasses: integer('waterGlasses').default(0),
  notes: text('notes'),
  createdAt: integer('createdAt')
    .$defaultFn(() => Date.now()),
});

export const dailyCheckins = pgTable('dailyCheckins', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  fastingSessionId: text('fastingSessionId')
    .references(() => fastingSessions.id, { onDelete: 'set null' }),
  date: text('date').notNull(),
  mood: text('mood', {
    enum: ['great', 'good', 'okay', 'rough', 'terrible'],
  }),
  hungerLevel: integer('hungerLevel'),
  energyLevel: integer('energyLevel'),
  notes: text('notes'),
  createdAt: integer('createdAt')
    .$defaultFn(() => Date.now()),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('userId')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripeCustomerId'),
  stripeSubscriptionId: text('stripeSubscriptionId').unique(),
  stripePriceId: text('stripePriceId'),
  status: text('status', {
    enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'],
  }).default('active'),
  currentPeriodStart: integer('currentPeriodStart'),
  currentPeriodEnd: integer('currentPeriodEnd'),
  cancelAtPeriodEnd: integer('cancelAtPeriodEnd').default(0),
  createdAt: integer('createdAt')
    .$defaultFn(() => Date.now()),
  updatedAt: integer('updatedAt')
    .$defaultFn(() => Date.now()),
});

export const analyticsEvents = pgTable('analyticsEvents', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text('userId'),
  event: text('event').notNull(),
  properties: text('properties'),
  timestamp: integer('timestamp').notNull(),
  sessionId: text('sessionId'),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(userProfiles),
  fastingSessions: many(fastingSessions),
  dailyCheckins: many(dailyCheckins),
  subscription: one(subscriptions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const fastingSessionsRelations = relations(fastingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [fastingSessions.userId],
    references: [users.id],
  }),
  checkins: many(dailyCheckins),
}));

export const dailyCheckinsRelations = relations(dailyCheckins, ({ one }) => ({
  user: one(users, {
    fields: [dailyCheckins.userId],
    references: [users.id],
  }),
  fastingSession: one(fastingSessions, {
    fields: [dailyCheckins.fastingSessionId],
    references: [fastingSessions.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

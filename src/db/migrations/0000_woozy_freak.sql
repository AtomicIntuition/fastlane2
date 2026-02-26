CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "analyticsEvents" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"event" text NOT NULL,
	"properties" text,
	"timestamp" integer NOT NULL,
	"sessionId" text
);
--> statement-breakpoint
CREATE TABLE "dailyCheckins" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"fastingSessionId" text,
	"date" text NOT NULL,
	"mood" text,
	"hungerLevel" integer,
	"energyLevel" integer,
	"notes" text,
	"createdAt" integer
);
--> statement-breakpoint
CREATE TABLE "fastingSessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"protocol" text NOT NULL,
	"fastingHours" integer NOT NULL,
	"eatingHours" integer NOT NULL,
	"startedAt" integer NOT NULL,
	"targetEndAt" integer NOT NULL,
	"actualEndAt" integer,
	"status" text DEFAULT 'active',
	"waterGlasses" integer DEFAULT 0,
	"notes" text,
	"createdAt" integer
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" integer NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"stripePriceId" text,
	"status" text DEFAULT 'active',
	"currentPeriodStart" integer,
	"currentPeriodEnd" integer,
	"cancelAtPeriodEnd" integer DEFAULT 0,
	"createdAt" integer,
	"updatedAt" integer,
	CONSTRAINT "subscriptions_userId_unique" UNIQUE("userId"),
	CONSTRAINT "subscriptions_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "userProfiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"fastingGoal" text,
	"experienceLevel" text,
	"preferredProtocol" text,
	"timezone" text DEFAULT 'UTC',
	"notificationsEnabled" integer DEFAULT 1,
	"onboardingCompleted" integer DEFAULT 0,
	"createdAt" integer,
	"updatedAt" integer,
	CONSTRAINT "userProfiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" integer,
	"image" text,
	"passwordHash" text,
	"createdAt" integer,
	"updatedAt" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" integer NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dailyCheckins" ADD CONSTRAINT "dailyCheckins_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dailyCheckins" ADD CONSTRAINT "dailyCheckins_fastingSessionId_fastingSessions_id_fk" FOREIGN KEY ("fastingSessionId") REFERENCES "public"."fastingSessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fastingSessions" ADD CONSTRAINT "fastingSessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD CONSTRAINT "userProfiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
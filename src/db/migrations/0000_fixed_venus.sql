CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `analyticsEvents` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`event` text NOT NULL,
	`properties` text,
	`timestamp` integer NOT NULL,
	`sessionId` text
);
--> statement-breakpoint
CREATE TABLE `dailyCheckins` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fastingSessionId` text,
	`date` text NOT NULL,
	`mood` text,
	`hungerLevel` integer,
	`energyLevel` integer,
	`notes` text,
	`createdAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fastingSessionId`) REFERENCES `fastingSessions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `fastingSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`protocol` text NOT NULL,
	`fastingHours` integer NOT NULL,
	`eatingHours` integer NOT NULL,
	`startedAt` integer NOT NULL,
	`targetEndAt` integer NOT NULL,
	`actualEndAt` integer,
	`status` text DEFAULT 'active',
	`notes` text,
	`createdAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_sessionToken_unique` ON `sessions` (`sessionToken`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`stripeCustomerId` text,
	`stripeSubscriptionId` text,
	`stripePriceId` text,
	`status` text DEFAULT 'active',
	`currentPeriodStart` integer,
	`currentPeriodEnd` integer,
	`cancelAtPeriodEnd` integer DEFAULT 0,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_userId_unique` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripeSubscriptionId_unique` ON `subscriptions` (`stripeSubscriptionId`);--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fastingGoal` text,
	`experienceLevel` text,
	`preferredProtocol` text,
	`timezone` text DEFAULT 'UTC',
	`notificationsEnabled` integer DEFAULT 1,
	`onboardingCompleted` integer DEFAULT 0,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `userProfiles_userId_unique` ON `userProfiles` (`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`passwordHash` text,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);

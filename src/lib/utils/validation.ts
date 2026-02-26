import * as z from 'zod';

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Onboarding schema
// ---------------------------------------------------------------------------

export const fastingGoals = [
  'weight_loss',
  'health',
  'longevity',
  'mental_clarity',
  'autophagy',
] as const;

export const experienceLevels = [
  'beginner',
  'intermediate',
  'advanced',
] as const;

export const onboardingSchema = z.object({
  fastingGoal: z.enum(fastingGoals, {
    message: 'Please select a fasting goal',
  }),
  experienceLevel: z.enum(experienceLevels, {
    message: 'Please select your experience level',
  }),
  preferredProtocol: z
    .string()
    .min(1, 'Please select a fasting protocol'),
  timezone: z
    .string()
    .min(1, 'Timezone is required'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ---------------------------------------------------------------------------
// Daily check-in schema
// ---------------------------------------------------------------------------

export const moods = [
  'great',
  'good',
  'okay',
  'rough',
  'terrible',
] as const;

export const checkinSchema = z.object({
  mood: z.enum(moods, {
    message: 'Please select your mood',
  }),
  hungerLevel: z
    .number()
    .int()
    .min(1, 'Hunger level must be between 1 and 10')
    .max(10, 'Hunger level must be between 1 and 10'),
  energyLevel: z
    .number()
    .int()
    .min(1, 'Energy level must be between 1 and 10')
    .max(10, 'Energy level must be between 1 and 10'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional(),
});

export type CheckinInput = z.infer<typeof checkinSchema>;

// ---------------------------------------------------------------------------
// Start fast schema
// ---------------------------------------------------------------------------

export const startFastSchema = z.object({
  protocol: z
    .string()
    .min(1, 'Please select a fasting protocol'),
});

export type StartFastInput = z.infer<typeof startFastSchema>;

// ---------------------------------------------------------------------------
// Add water schema
// ---------------------------------------------------------------------------

export const addWaterSchema = z.object({
  sessionId: z
    .string()
    .min(1, 'Session ID is required'),
});

export type AddWaterInput = z.infer<typeof addWaterSchema>;

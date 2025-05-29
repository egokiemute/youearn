import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  telegramUsername: z.string()
    .min(1, 'Telegram username is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'Telegram username can only contain letters, numbers, and underscores'),
  // referralCode: z.string()
  //   .length(5, 'Referral code must be exactly 5 characters')
  //   .regex(/^[a-zA-Z0-9]+$/, 'Referral code can only contain letters and numbers')
  //   .optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});
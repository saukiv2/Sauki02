import { z } from 'zod';

/**
 * Phone validation: 11 digits, starts with 070|080|081|090|091
 */
export const phoneSchema = z
  .string()
  .regex(
    /^(070|080|081|090|091)\d{8}$/,
    'Phone must be 11 digits and start with 070, 080, 081, 090, or 091'
  );

/**
 * BVN validation: exactly 11 digits
 */
export const bvnSchema = z
  .string()
  .regex(/^\d{11}$/, 'BVN must be exactly 11 digits');

/**
 * Password validation: min 8 chars, 1 uppercase, 1 number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number');

/**
 * Registration request validation
 */
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: phoneSchema,
  password: passwordSchema,
  bvn: bvnSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login request validation
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

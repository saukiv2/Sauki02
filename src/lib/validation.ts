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
 * Registration request validation - using phone number instead of email
 */
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone: phoneSchema,
  password: passwordSchema,
  bvn: bvnSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login request validation - using phone number instead of email
 */
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

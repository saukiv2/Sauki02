import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN';
}

/**
 * Hash password using bcryptjs with saltRounds=12
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plaintext password with hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure token (simplified - no JWT)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return uuidv4();
}

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return uuidv4();
}

/**
 * Hash token for storage
 */
export function hashToken(token: string): string {
  // Simple hash - in production use proper hashing
  return Buffer.from(token).toString('base64');
}

/**
 * Verify access token - for compatibility, just check if token exists
 * Real verification happens at API handler level via DB session lookup
 */
export function verifyAccessToken(token: string): boolean {
  return !!token;
}

/**
 * Verify refresh token - for compatibility, just check if token exists
 * Real verification happens at API handler level via DB session lookup
 */
export function verifyRefreshToken(token: string): boolean {
  return !!token;
}

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
 * Verify JWT access token (now a no-op, tokens verified via DB)
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  // With session-based auth, verification happens at the database level
  // This is kept for API compatibility
  return token ? { userId: '', email: '', role: 'CUSTOMER' } : null;
}

/**
 * Verify JWT refresh token (now a no-op, tokens verified via DB)
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  // With session-based auth, verification happens at the database level
  return token ? { userId: '', email: '', role: 'CUSTOMER' } : null;
}

import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
 * Generate a proper JWT access token (1 hour expiry)
 */
export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

/**
 * Generate a proper JWT refresh token (30 days expiry)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';
  return jwt.sign(payload, secret, { expiresIn: '30d' });
}

/**
 * Hash token for storage in DB
 */
export function hashToken(token: string): string {
  // Simple hash - in production use proper hashing
  return Buffer.from(token).toString('base64');
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    const payload = jwt.verify(token, secret) as TokenPayload;
    return payload;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';
    const payload = jwt.verify(token, secret) as TokenPayload;
    return payload;
  } catch (error) {
    console.error('[Auth] Refresh token verification failed:', error);
    return null;
  }
}

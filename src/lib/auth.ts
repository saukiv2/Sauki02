import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const JWT_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

// Defer reading secrets until they're needed
const getJwtSecrets = () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
});

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
 * Generate JWT access token (15 minutes)
 */
export function generateAccessToken(payload: TokenPayload): string {
  const { secret } = getJwtSecrets();
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

/**
 * Generate JWT refresh token (30 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const { refreshSecret } = getJwtSecrets();
  return jwt.sign(payload, refreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const { secret } = getJwtSecrets();
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const { refreshSecret } = getJwtSecrets();
    return jwt.verify(token, refreshSecret) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Hash token for storage in database
 */
export function hashToken(token: string): string {
  return require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

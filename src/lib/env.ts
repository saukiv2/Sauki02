/**
 * Safe environment variable access with defaults
 */

export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    return process.env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Check if running during build
 */
export const isBuildTime = (): boolean => {
  return process.env.__NEXT_PHASE === 'phase-production-build';
};

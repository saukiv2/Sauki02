import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

let prismaInstance: PrismaClient | null = null;

const createPrismaClient = (): PrismaClient => {
  // Check if building
  const isBuild = process.env.__NEXT_PHASE === 'phase-production-build';
  
  // Suppress all logs during build
  const logConfig = isBuild ? [] : (process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']);
  
  return new PrismaClient({
    log: logConfig as any,
    errorFormat: 'pretty',
  });
};

export const prisma = (() => {
  // Return cached instance if available
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Skip initialization during build
  const isBuild = process.env.__NEXT_PHASE === 'phase-production-build';
  if (isBuild && !process.env.DATABASE_URL) {
    console.warn('[Prisma] Skipping initialization during build without DATABASE_URL');
    // Return a dummy client that won't connect
    return new PrismaClient({
      log: [],
    });
  }

  try {
    prismaInstance = createPrismaClient();

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }

    return prismaInstance;
  } catch (error) {
    console.error('[Prisma] Error initializing client:', error instanceof Error ? error.message : String(error));
    // Return a basic client on error
    return new PrismaClient({ log: [] });
  }
})();

export default prisma;

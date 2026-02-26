import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

let prismaInstance: PrismaClient | null = null;

const createPrismaClient = (): PrismaClient => {
  // Suppress logs during build
  const isBuild = process.env.__NEXT_PHASE === 'phase-production-build';
  
  return new PrismaClient({
    log: isBuild
      ? []
      : process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
  });
};

export const prisma = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  try {
    prismaInstance = createPrismaClient();

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }

    return prismaInstance;
  } catch (error) {
    console.error('Failed to initialize Prisma:', error);
    // Return a dummy client during build to prevent crashes
    return new PrismaClient();
  }
})();

export default prisma;

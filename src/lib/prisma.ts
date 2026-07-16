import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Programmatically append connection_limit to prevent PostgreSQL connection limit errors
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes('connection_limit=')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=2`;
};

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

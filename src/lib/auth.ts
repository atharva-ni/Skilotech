import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from './prisma';
import { UserRole } from '@prisma/client';

/**
 * Get the current authenticated user from Clerk + database.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  return dbUser;
}

/**
 * Get the current user or throw 401.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require the current user to have one of the specified roles.
 * Throws if unauthorized or wrong role.
 */
export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: insufficient permissions');
  }
  return user;
}

/**
 * Sync a Clerk user to the database (used by webhook and on first API call).
 */
export async function syncClerkUser(clerkUser: {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
}) {
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('User has no email address');

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      username: clerkUser.username,
      avatarUrl: clerkUser.imageUrl,
      lastLoginAt: new Date(),
    },
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      username: clerkUser.username,
      avatarUrl: clerkUser.imageUrl,
      role: 'student', // Default role
    },
  });

  return dbUser;
}

/**
 * Helper to build a JSON error response.
 */
export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Helper to build a JSON success response.
 */
export function apiSuccess(data: unknown, status: number = 200) {
  return Response.json(data, { status });
}

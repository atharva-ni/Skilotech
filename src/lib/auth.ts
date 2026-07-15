import { auth } from '@clerk/nextjs/server';
import prisma from './prisma';
import { UserRole } from '@prisma/client';

// ─── Hardcoded Admin Emails ────────────────────────────────────────────────────
// Any user who signs in with one of these emails will automatically receive
// the 'admin' role. Add or remove emails as needed.
const ADMIN_EMAILS: string[] = [
  'team.bhairavamedia@gmail.com'
];

/**
 * Check if an email should be granted admin privileges.
 */
function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

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
 * Automatically assigns the 'admin' role if the email matches ADMIN_EMAILS.
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

  const emailClean = email.toLowerCase().trim();

  // Check if a user pre-created by the admin or already existing exists with this email
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: emailClean },
  });

  if (existingUserByEmail && existingUserByEmail.clerkId !== clerkUser.id) {
    // Claim or re-sync the account with the new clerkId
    await prisma.user.update({
      where: { id: existingUserByEmail.id },
      data: {
        clerkId: clerkUser.id,
        firstName: existingUserByEmail.firstName || clerkUser.firstName,
        lastName: existingUserByEmail.lastName || clerkUser.lastName,
        username: existingUserByEmail.username || clerkUser.username,
        avatarUrl: clerkUser.imageUrl,
        lastLoginAt: new Date(),
      },
    });
  }

  // Determine the role: admin if email is in the hardcoded list, otherwise check if there's pre-assigned role, otherwise student
  const assignedRole: UserRole = isAdminEmail(emailClean) 
    ? 'admin' 
    : existingUserByEmail 
    ? existingUserByEmail.role 
    : 'student';

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: emailClean,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      username: clerkUser.username,
      avatarUrl: clerkUser.imageUrl,
      lastLoginAt: new Date(),
      // Re-apply admin role on every sync so it can't be accidentally downgraded
      ...(isAdminEmail(emailClean) ? { role: 'admin' } : {}),
    },
    create: {
      clerkId: clerkUser.id,
      email: emailClean,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      username: clerkUser.username,
      avatarUrl: clerkUser.imageUrl,
      role: assignedRole,
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

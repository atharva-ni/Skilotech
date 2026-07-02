import { UserRole } from '@prisma/client';

/**
 * Role hierarchy for permission checks.
 * Higher number = more privileges.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  student: 1,
  instructor: 2,
  recruiter: 2,
  admin: 3,
  super_admin: 4,
};

/**
 * Check if a user's role has at least the specified privilege level.
 */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

/**
 * Permission definitions for different actions.
 */
export const PERMISSIONS = {
  // Course management
  'course.create': ['instructor', 'admin', 'super_admin'] as UserRole[],
  'course.edit': ['instructor', 'admin', 'super_admin'] as UserRole[],
  'course.delete': ['admin', 'super_admin'] as UserRole[],
  'course.approve': ['admin', 'super_admin'] as UserRole[],
  'course.publish': ['instructor', 'admin', 'super_admin'] as UserRole[],

  // User management
  'user.list': ['admin', 'super_admin'] as UserRole[],
  'user.edit_role': ['admin', 'super_admin'] as UserRole[],
  'user.delete': ['super_admin'] as UserRole[],

  // Enrollment
  'enrollment.create': ['student'] as UserRole[],
  'enrollment.view_all': ['admin', 'super_admin'] as UserRole[],

  // Job management
  'job.create': ['recruiter', 'admin', 'super_admin'] as UserRole[],
  'job.edit': ['recruiter', 'admin', 'super_admin'] as UserRole[],

  // Payment
  'payment.view_all': ['admin', 'super_admin'] as UserRole[],
  'payment.refund': ['admin', 'super_admin'] as UserRole[],

  // Admin
  'admin.dashboard': ['admin', 'super_admin'] as UserRole[],
  'admin.analytics': ['admin', 'super_admin'] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(role);
}

/**
 * Get the default dashboard path for a role.
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'instructor':
      return '/dashboard/instructor';
    case 'recruiter':
      return '/dashboard/recruiter';
    case 'admin':
    case 'super_admin':
      return '/dashboard/admin';
    case 'student':
    default:
      return '/dashboard';
  }
}

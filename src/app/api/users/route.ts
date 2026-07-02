import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import { updateUserRoleSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate as admin
    const currentUser = await requireRole(UserRole.admin, UserRole.super_admin);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleFilter && roleFilter !== 'all') {
      where.role = roleFilter as UserRole;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    return apiSuccess({ users });
  } catch (error: any) {
    console.error('Error listing users:', error);
    return apiError(error?.message || 'Failed to list users', 400);
  }
}

export async function PUT(req: Request) {
  try {
    // 1. Authenticate as admin
    const adminUser = await requireRole(UserRole.admin, UserRole.super_admin);

    const body = await req.json();
    const { userId, role } = body;

    if (!userId) {
      return apiError('User ID is required', 400);
    }

    // Validate the role
    const validatedRole = updateUserRoleSchema.parse({ role });

    // 2. Fetch the target user to edit
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return apiError('User not found', 404);
    }

    // 3. Security checks
    // Non-super_admins cannot modify roles of super_admins or make users super_admins
    if (adminUser.role !== UserRole.super_admin) {
      if (targetUser.role === UserRole.super_admin || validatedRole.role === UserRole.super_admin) {
        return apiError('Forbidden: only super admins can manage super admin roles', 403);
      }
    }

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: validatedRole.role },
    });

    console.log(`Admin ${adminUser.id} updated user ${userId} role to ${validatedRole.role}`);

    return apiSuccess({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return apiError(error?.message || 'Failed to update user role', 400);
  }
}

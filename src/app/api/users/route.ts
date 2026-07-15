import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import { updateUserRoleSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate as admin
    await requireRole(UserRole.admin, UserRole.super_admin);

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

export async function POST(req: Request) {
  try {
    // 1. Authenticate as admin
    const adminUser = await requireRole(UserRole.admin, UserRole.super_admin);

    const body = await req.json();
    const { email, role, firstName, lastName } = body;

    if (!email) {
      return apiError('Email is required', 400);
    }
    if (!role || (role !== 'instructor' && role !== 'recruiter')) {
      return apiError('Valid role (instructor or recruiter) is required', 400);
    }

    const emailClean = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailClean },
    });

    if (existingUser) {
      return apiError('User with this email already exists', 400);
    }

    // Generate a unique placeholder username
    const username = emailClean.split('@')[0] + '_' + Math.floor(Math.random() * 10000);

    // Create a pending user in the database
    const newUser = await prisma.user.create({
      data: {
        clerkId: `pending:${emailClean}`,
        email: emailClean,
        role: role as any,
        firstName: firstName || null,
        lastName: lastName || null,
        username,
        isVerified: true, // Mark pre-approved profile as verified
      },
    });

    console.log(`Admin ${adminUser.id} pre-created user profile for: ${emailClean} as ${role}`);

    return apiSuccess({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error: any) {
    console.error('Error pre-creating user profile:', error);
    return apiError(error?.message || 'Failed to create user profile', 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 1. Authenticate as admin
    const adminUser = await requireRole(UserRole.admin, UserRole.super_admin);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return apiError('User ID is required', 400);
    }

    // 2. Prevent self-deletion
    if (adminUser.id === userId) {
      return apiError('You cannot delete your own account', 400);
    }

    // 3. Fetch the target user to delete
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return apiError('User not found', 404);
    }

    // 4. Role authorization checks
    if (targetUser.role === UserRole.super_admin) {
      return apiError('Forbidden: Super Admins cannot be deleted', 403);
    }

    if (targetUser.role === UserRole.admin && adminUser.role !== UserRole.super_admin) {
      return apiError('Forbidden: Only Super Admins can delete Admin accounts', 403);
    }

    // 5. Check if user is active instructor of any courses
    const courseCount = await prisma.course.count({
      where: { instructorId: userId }
    });

    if (courseCount > 0) {
      return apiError('Cannot delete user: This user is an active instructor of one or more courses. Please reassign the courses first.', 400);
    }

    // 6. Delete payments and user inside a transaction (handling onDelete: Restrict on payments)
    await prisma.$transaction([
      prisma.payment.deleteMany({
        where: { userId }
      }),
      prisma.user.delete({
        where: { id: userId }
      })
    ]);

    console.log(`Admin ${adminUser.id} deleted user account ${userId} (${targetUser.email})`);

    return apiSuccess({
      success: true,
      message: `User ${targetUser.email} has been successfully deleted.`
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return apiError(error?.message || 'Failed to delete user', 400);
  }
}


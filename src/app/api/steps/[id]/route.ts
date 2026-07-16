import { requireAuth, requireRole, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { createLessonStepSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';
import { cache } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();

    const { id } = await params;

    const step = await prisma.lessonStep.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            title: true,
            module: {
              select: {
                courseId: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!step) {
      return apiError('Step not found', 404);
    }

    // Map 'text' database step type to 'assignment' if marked in metadata
    const stepResponse = { ...step };
    if (step.metadata && typeof step.metadata === 'object' && (step.metadata as any).isAssignment) {
      stepResponse.stepType = 'assignment' as any;
    }

    return apiSuccess({ step: stepResponse });
  } catch (error: any) {
    console.error(`Error fetching step:`, error);
    return apiError(error?.message || 'Failed to fetch step details', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const stepItem = await prisma.lessonStep.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            module: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!stepItem) {
      return apiError('Step not found', 404);
    }

    const courseId = stepItem.lesson.module.courseId;
    const isCreator = stepItem.lesson.module.course.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: you are not authorized to edit this step', 403);
    }

    const body = await req.json();
    const updateSchema = createLessonStepSchema.partial();
    const validatedData = updateSchema.parse(body);

    // Sanitize lessonId to prevent empty string fk violation
    if (validatedData.lessonId === '' || !validatedData.lessonId) {
      delete validatedData.lessonId;
    }

    // If updating lessonId, verify the target lesson belongs to the same course
    if (validatedData.lessonId && validatedData.lessonId !== stepItem.lessonId) {
      const targetLesson = await prisma.lesson.findUnique({
        where: { id: validatedData.lessonId },
        include: { module: true },
      });
      if (!targetLesson || targetLesson.module.courseId !== courseId) {
        return apiError('Invalid target lesson: Must belong to the same course', 400);
      }
    }

    const { stepType, attachmentUrl, attachmentName, ...rest } = validatedData;
    let updatePayload: any = { ...rest };
    
    if (stepType) {
      if (stepType === 'assignment') {
        updatePayload.stepType = 'text';
        const currentMetadata = (stepItem.metadata as any) || {};
        updatePayload.metadata = {
          ...currentMetadata,
          isAssignment: true,
          attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : currentMetadata.attachmentUrl,
          attachmentName: attachmentName !== undefined ? attachmentName : currentMetadata.attachmentName,
        };
      } else {
        updatePayload.stepType = stepType;
        const currentMetadata = (stepItem.metadata as any) || {};
        const { isAssignment, attachmentUrl: aUrl, attachmentName: aName, ...otherMetadata } = currentMetadata;
        updatePayload.metadata = otherMetadata;
      }
    } else {
      const currentMetadata = (stepItem.metadata as any) || {};
      if (currentMetadata.isAssignment) {
        updatePayload.metadata = {
          ...currentMetadata,
          attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : currentMetadata.attachmentUrl,
          attachmentName: attachmentName !== undefined ? attachmentName : currentMetadata.attachmentName,
        };
      }
    }

    const updatedStep = await prisma.lessonStep.update({
      where: { id },
      data: updatePayload,
    });

    const stepResponse = { ...updatedStep };
    if (updatedStep.metadata && typeof updatedStep.metadata === 'object' && (updatedStep.metadata as any).isAssignment) {
      stepResponse.stepType = 'assignment' as any;
    }

    // Invalidate course detail cache
    await cache.del(`course:detail:${courseId}`);

    console.log(`Step updated: ${stepResponse.title} (ID: ${stepResponse.id})`);
    return apiSuccess({ success: true, step: stepResponse });
  } catch (error: any) {
    console.error('Error updating step:', error);
    return apiError(error?.message || 'Failed to update step', 400);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const stepItem = await prisma.lessonStep.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            module: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!stepItem) {
      return apiError('Step not found', 404);
    }

    const courseId = stepItem.lesson.module.courseId;
    const isCreator = stepItem.lesson.module.course.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: you are not authorized to delete this step', 403);
    }

    await prisma.lessonStep.delete({
      where: { id },
    });

    // Invalidate course detail cache
    await cache.del(`course:detail:${courseId}`);

    console.log(`Step deleted: ${stepItem.title} (ID: ${stepItem.id})`);
    return apiSuccess({ success: true, message: 'Step deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting step:', error);
    return apiError(error?.message || 'Failed to delete step', 400);
  }
}


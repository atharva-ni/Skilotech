import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import { markStepCompleteSchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const dbUser = await requireAuth();

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return apiError('User not enrolled in this course', 403);
    }

    // Fetch progress records
    const progressRecords = await prisma.lessonProgress.findMany({
      where: {
        userId: dbUser.id,
        isCompleted: true,
        step: {
          lesson: {
            module: {
              courseId,
            },
          },
        },
      },
      select: {
        stepId: true,
        completedAt: true,
        timeSpentSecs: true,
      },
    });

    return apiSuccess({
      progressPct: Number(enrollment.progressPct),
      completedSteps: progressRecords.map((r) => r.stepId),
      detailedProgress: progressRecords,
    });
  } catch (error: any) {
    console.error('Error fetching course progress:', error);
    return apiError(error?.message || 'Failed to fetch progress', 400);
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const dbUser = await requireAuth();

    const body = await req.json();
    const { stepId, timeSpentSecs } = markStepCompleteSchema.parse(body);

    // 1. Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return apiError('User not enrolled in this course', 403);
    }

    // 2. Verify step belongs to this course
    const step = await prisma.lessonStep.findUnique({
      where: { id: stepId },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!step || step.lesson.module.courseId !== courseId) {
      return apiError('Step does not belong to the specified course', 400);
    }

    // 3. Save or update step completion progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_stepId: {
          userId: dbUser.id,
          stepId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        timeSpentSecs: { increment: timeSpentSecs },
      },
      create: {
        userId: dbUser.id,
        stepId,
        isCompleted: true,
        completedAt: new Date(),
        timeSpentSecs,
      },
    });

    // 4. Recalculate overall course progress percentage
    // Get all steps in this course
    const allCourseSteps = await prisma.lessonStep.findMany({
      where: {
        lesson: {
          module: {
            courseId,
          },
        },
      },
      select: { id: true },
    });

    const totalStepsCount = allCourseSteps.length;
    let progressPct = 0;

    if (totalStepsCount > 0) {
      const allCourseStepIds = allCourseSteps.map((s) => s.id);
      
      // Count completed steps for this student in this course
      const completedStepsCount = await prisma.lessonProgress.count({
        where: {
          userId: dbUser.id,
          isCompleted: true,
          stepId: { in: allCourseStepIds },
        },
      });

      progressPct = Math.round((completedStepsCount / totalStepsCount) * 100);
    }

    // 5. Update enrollment progress
    const isCompleted = progressPct === 100;
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPct,
        status: isCompleted ? 'completed' : 'active',
        completedAt: isCompleted ? new Date() : enrollment.completedAt,
        lastAccessed: new Date(),
      },
    });

    // Fetch all completed steps for this course to send back to UI
    const completedStepRecords = await prisma.lessonProgress.findMany({
      where: {
        userId: dbUser.id,
        isCompleted: true,
        step: {
          lesson: {
            module: {
              courseId,
            },
          },
        },
      },
      select: { stepId: true },
    });

    const completedSteps = completedStepRecords.map((r) => r.stepId);

    console.log(`User ${dbUser.id} completed step ${stepId} in course ${courseId}. Progress: ${progressPct}%`);

    return apiSuccess({
      success: true,
      progressPct,
      completedSteps,
    });
  } catch (error: any) {
    console.error('Error completing step:', error);
    return apiError(error?.message || 'Failed to update progress', 400);
  }
}

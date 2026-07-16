import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import { createModuleSchema, createLessonSchema, createLessonStepSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';
import { cache } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;

    // Fetch the modules and lessons
    const curriculum = await prisma.module.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
          include: {
            steps: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                title: true,
                stepType: true,
                sortOrder: true,
                metadata: true,
              },
            },
          },
        },
      },
    });

    // Map 'text' steps marked as assignment to 'assignment' stepType
    curriculum.forEach((mod: any) => {
      if (mod.lessons) {
        mod.lessons.forEach((les: any) => {
          if (les.steps) {
            les.steps.forEach((st: any) => {
              if (st.metadata && typeof st.metadata === 'object' && st.metadata.isAssignment) {
                st.stepType = 'assignment';
              }
            });
          }
        });
      }
    });

    return apiSuccess({ curriculum });
  } catch (error: any) {
    console.error('Error fetching curriculum:', error);
    return apiError(error?.message || 'Failed to fetch curriculum', 400);
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const body = await req.json();
    const { type } = body;

    if (!type) {
      return apiError('Missing curriculum item type. Must be module, lesson, or step.', 400);
    }

    if (type === 'module') {
      const validatedData = createModuleSchema.parse(body.data);
      const newModule = await prisma.module.create({
        data: {
          ...validatedData,
          courseId,
        },
      });
      // Invalidate course detail cache
      await cache.del(`course:detail:${courseId}`);
      return apiSuccess({ success: true, module: newModule }, 201);
    } 
    
    if (type === 'lesson') {
      const validatedData = createLessonSchema.parse(body.data);
      
      // Verify module belongs to this course
      const targetModule = await prisma.module.findUnique({ where: { id: validatedData.moduleId } });
      if (!targetModule || targetModule.courseId !== courseId) {
        return apiError('Module does not belong to this course', 400);
      }

      const newLesson = await prisma.lesson.create({
        data: validatedData,
      });
      // Invalidate course detail cache
      await cache.del(`course:detail:${courseId}`);
      return apiSuccess({ success: true, lesson: newLesson }, 201);
    } 
    
    if (type === 'step') {
      const validatedData = createLessonStepSchema.parse(body.data);

      // Verify lesson belongs to this course via module
      const targetLesson = await prisma.lesson.findUnique({
        where: { id: validatedData.lessonId },
        include: { module: true },
      });

      if (!targetLesson || targetLesson.module.courseId !== courseId) {
        return apiError('Lesson does not belong to this course', 400);
      }

      const { stepType, attachmentUrl, attachmentName, ...rest } = validatedData;
      let dbStepType: any = stepType;
      let stepMetadata: any = {};

      if (stepType === 'assignment') {
        dbStepType = 'text';
        stepMetadata = {
          isAssignment: true,
          attachmentUrl: attachmentUrl || null,
          attachmentName: attachmentName || null,
        };
      }

      const newStep = await prisma.lessonStep.create({
        data: {
          ...rest,
          stepType: dbStepType,
          metadata: stepMetadata,
        },
      });
      
      // Map it back to 'assignment' for the return payload if needed
      const stepResponse = { ...newStep };
      if (stepType === 'assignment') {
        stepResponse.stepType = 'assignment' as any;
      }

      // Invalidate course detail cache
      await cache.del(`course:detail:${courseId}`);
      return apiSuccess({ success: true, step: stepResponse }, 201);
    }

    return apiError('Invalid curriculum item type. Must be module, lesson, or step.', 400);
  } catch (error: any) {
    console.error('Error adding to curriculum:', error);
    return apiError(error?.message || 'Failed to update curriculum', 400);
  }
}


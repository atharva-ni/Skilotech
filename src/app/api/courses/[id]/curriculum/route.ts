import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import { createModuleSchema, createLessonSchema, createLessonStepSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';

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
                durationMins: true, // If we added any steps fields
              } as any, // fallback since schema handles fields properly
            },
          },
        },
      },
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

    // Verify course exists and belongs to instructor
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return apiError('Course not found', 404);
    }

    if (course.instructorId !== dbUser.id && dbUser.role === UserRole.instructor) {
      return apiError('Forbidden: you are not the creator of this course', 403);
    }

    const body = await req.json();
    const type = body.type; // 'module', 'lesson', or 'step'

    if (type === 'module') {
      const validatedData = createModuleSchema.parse(body.data);
      const newModule = await prisma.module.create({
        data: {
          ...validatedData,
          courseId,
        },
      });
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

      const newStep = await prisma.lessonStep.create({
        data: validatedData,
      });
      return apiSuccess({ success: true, step: newStep }, 201);
    }

    return apiError('Invalid curriculum item type. Must be module, lesson, or step.', 400);
  } catch (error: any) {
    console.error('Error adding to curriculum:', error);
    return apiError(error?.message || 'Failed to update curriculum', 400);
  }
}

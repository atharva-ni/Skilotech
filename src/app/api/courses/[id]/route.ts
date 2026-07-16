import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, requireRole, apiError, apiSuccess } from '@/lib/auth';
import { updateCourseSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';
import { cache } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await getCurrentUser();

    // Cache static course details (avoiding heavy DB joins on modules/lessons/steps)
    const cacheKey = `course:detail:${id}`;
    let course: any = null;

    const cachedRaw = await cache.get(cacheKey);
    if (cachedRaw) {
      console.log(`[Cache Hit] Serving course details for: ${id}`);
      course = JSON.parse(cachedRaw);
    } else {
      course = await prisma.course.findUnique({
        where: { id },
        include: {
          category: true,
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  durationMins: true,
                  isFree: true,
                  sortOrder: true,
                  steps: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                      id: true,
                      title: true,
                      stepType: true,
                      sortOrder: true,
                      textContent: true,
                      videoUrl: true,
                      videoDurationSecs: true,
                      labLanguage: true,
                      labStarterCode: true,
                      labInstructions: true,
                      metadata: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (course) {
        // Cache for 60 seconds
        await cache.set(cacheKey, JSON.stringify(course), 60);
      }
    }

    if (!course) {
      return apiError('Course not found', 404);
    }

    // Check enrollment state if user is logged in
    let isEnrolled = false;
    let progressPct = 0;
    let completedSteps: string[] = [];

    if (dbUser) {
      let enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: dbUser.id,
            courseId: id,
          },
        },
      });

      if (!enrollment && (
        dbUser.role === UserRole.admin ||
        dbUser.role === UserRole.super_admin ||
        course.instructorId === dbUser.id
      )) {
        enrollment = await prisma.enrollment.create({
          data: {
            userId: dbUser.id,
            courseId: id,
            status: 'active',
          },
        });
      }

      if (enrollment) {
        isEnrolled = true;
        progressPct = Number(enrollment.progressPct);

        // Fetch completed steps for progress tracking
        const stepProgress = await prisma.lessonProgress.findMany({
          where: {
            userId: dbUser.id,
            isCompleted: true,
            step: {
              lesson: {
                module: {
                  courseId: id,
                },
              },
            },
          },
          select: { stepId: true },
        });

        completedSteps = stepProgress.map((sp) => sp.stepId);
      }
    }

    // If not enrolled and course is draft/pending, restrict access to creator/admins
    if (course.status !== 'published') {
      if (!dbUser) {
        return apiError('Unauthorized', 401);
      }
      const hasPrivilege =
        dbUser.role === UserRole.admin ||
        dbUser.role === UserRole.super_admin ||
        course.instructorId === dbUser.id;

      if (!hasPrivilege) {
        return apiError('Forbidden', 403);
      }
    }

    // Map 'text' steps marked as assignment to 'assignment' stepType
    if (course && course.modules) {
      course.modules.forEach((mod: any) => {
        if (mod.lessons) {
          mod.lessons.forEach((les: any) => {
            if (les.steps) {
              les.steps.forEach((st: any) => {
                if (st.metadata && typeof st.metadata === 'object' && (st.metadata as any).isAssignment) {
                  st.stepType = 'assignment';
                }
              });
            }
          });
        }
      });
    }

    // Prepare response data
    const formattedCourse = {
      ...course,
      instructor: {
        ...course.instructor,
        name: `${course.instructor.firstName ?? ''} ${course.instructor.lastName ?? ''}`.trim(),
        avatar: course.instructor.avatarUrl || '👩‍🏫',
      },
      isEnrolled,
      progressPct,
      completedSteps,
    };

    return apiSuccess(formattedCourse);
  } catch (error: any) {
    console.error('Error fetching course detail:', error);
    return apiError(error?.message || 'Failed to fetch course details', 400);
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    // Find course first to verify ownership
    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) {
      return apiError('Course not found', 404);
    }

    const isCreator = existingCourse.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: only course creator or admin can update', 403);
    }

    const body = await req.json();
    const validatedData = updateCourseSchema.parse(body);

    // Sanitize categoryId: convert empty string to null to support uncategorizing courses
    if (validatedData.categoryId === '') {
      validatedData.categoryId = null;
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: validatedData,
    });

    // Invalidate cached details and list
    await cache.del(`course:detail:${id}`);
    await cache.flushPattern('courses:list:*');

    console.log(`Course updated: ${updatedCourse.title} (ID: ${updatedCourse.id})`);
    return apiSuccess({ success: true, course: updatedCourse });
  } catch (error: any) {
    console.error('Error updating course:', error);
    return apiError(error?.message || 'Failed to update course', 400);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return apiError('Course not found', 404);
    }

    const isCreator = course.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: only course creator or admin can delete this course', 403);
    }

    await prisma.course.delete({ where: { id } });

    // Invalidate cached details and list
    await cache.del(`course:detail:${id}`);
    await cache.flushPattern('courses:list:*');

    console.log(`Course deleted: ${course.title} (ID: ${course.id})`);
    return apiSuccess({ success: true, message: 'Course deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return apiError(error?.message || 'Failed to delete course', 400);
  }
}

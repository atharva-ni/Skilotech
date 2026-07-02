import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Ensure user is authenticated
    await requireAuth();

    const { id } = await params;

    // 2. Fetch the lesson step from database
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

    return apiSuccess({ step });
  } catch (error: any) {
    console.error(`Error fetching step:`, error);
    return apiError(error?.message || 'Failed to fetch step details', 500);
  }
}

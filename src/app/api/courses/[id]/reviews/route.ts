import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import { z } from 'zod';
import { cache } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5 stars'),
  reviewText: z.string().optional().nullable(),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const dbUser = await requireAuth();

    // 1. Parse and validate review request body
    const body = await req.json();
    const { rating, reviewText } = reviewSchema.parse(body);

    // 2. Validate course existence
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!courseExists) {
      return apiError('Course not found', 404);
    }

    // 3. Upsert (create or update) review
    // The database unique constraint is @@unique([courseId, userId])
    await prisma.courseReview.upsert({
      where: {
        courseId_userId: {
          courseId,
          userId: dbUser.id,
        },
      },
      update: {
        rating,
        reviewText: reviewText || null,
        isVerified: true, // Mark verified since the student is completing the course
      },
      create: {
        courseId,
        userId: dbUser.id,
        rating,
        reviewText: reviewText || null,
        isVerified: true,
      },
    });

    // 4. Recalculate average rating and counts
    const aggregations = await prisma.courseReview.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingAvg = aggregations._avg.rating || 0;
    const ratingCount = aggregations._count.rating || 0;

    // 5. Update course record with new stats
    await prisma.course.update({
      where: { id: courseId },
      data: {
        ratingAvg,
        ratingCount,
      },
    });

    // 6. Invalidate caches for course detail query
    await cache.del(`course:detail:${courseId}`);
    console.log(`[Review API] Saved review from user=${dbUser.id} for course=${courseId}. New Avg=${ratingAvg}, Count=${ratingCount}`);

    return apiSuccess({ success: true, ratingAvg, ratingCount });
  } catch (error: any) {
    console.error('Error submitting course review:', error);
    return apiError(error?.message || 'Failed to submit review', 500);
  }
}

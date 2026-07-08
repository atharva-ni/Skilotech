import { apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const problems = await prisma.codingProblem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
        description: true,
        starterCode: true,
        examples: true,
        sampleOutput: true,
        testCode: true,
        aiFeedback: true,
      }
    });

    return apiSuccess({ problems });
  } catch (error: any) {
    console.error('Problems API error:', error);
    return apiError(error?.message || 'Failed to fetch problems', 500);
  }
}

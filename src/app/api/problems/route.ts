import { apiError, apiSuccess, getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();

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
        constraints: true,
        sampleOutput: true,
        testCode: true,
        aiFeedback: true,
        sortOrder: true,
      }
    });

    let completedProblemIds: string[] = [];
    if (dbUser) {
      const activeProblemIdentifiers = [
        ...problems.map(p => p.id),
        ...problems.map(p => p.slug)
      ];
      const submissions = await prisma.submission.findMany({
        where: {
          userId: dbUser.id,
          status: 'graded',
          assignmentId: { in: activeProblemIdentifiers }
        },
        select: { assignmentId: true }
      });
      completedProblemIds = Array.from(new Set(submissions.map(s => s.assignmentId)));
    }

    return apiSuccess({ problems, completedProblemIds });
  } catch (error: any) {
    console.error('Problems API error:', error);
    return apiError(error?.message || 'Failed to fetch problems', 500);
  }
}

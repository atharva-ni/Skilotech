import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUser, syncClerkUser, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { generateConsolidatedFeedback } from '@/lib/socraticTutorAgent';

export async function GET() {
  try {
    let dbUser = await getCurrentUser();

    // On-demand sync fallback: if logged in with Clerk but not yet synced to database
    if (!dbUser) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        console.log(`On-demand sync triggered for Clerk user: ${clerkUser.id}`);
        dbUser = await syncClerkUser({
          id: clerkUser.id,
          emailAddresses: clerkUser.emailAddresses,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          username: clerkUser.username,
          imageUrl: clerkUser.imageUrl,
        });
      }
    }

    if (!dbUser) {
      return apiError('Unauthorized', 401);
    }

    // Fetch enrollments with course details (both active and completed)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: dbUser.id,
        status: { in: ['active', 'completed'] },
      },
      select: { courseId: true },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    // Fetch payment records
    const payments = await prisma.payment.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    // Generate or fetch consolidated AI feedback
    let recentAiFeedback = null;
    try {
      const cacheKey = `user:consolidated-feedback:${dbUser.id}`;
      const cachedFeedback = await cache.get(cacheKey);

      if (cachedFeedback) {
        recentAiFeedback = JSON.parse(cachedFeedback);
      } else {
        // Fetch submissions with AI reviews to build a consolidated view
        const submissions = await prisma.submission.findMany({
          where: { userId: dbUser.id },
          include: {
            aiReviews: {
              orderBy: { createdAt: 'desc' },
            },
            assignment: {
              select: { title: true }
            }
          },
          orderBy: { submittedAt: 'desc' },
        });

        const reviews = submissions
          .flatMap(sub => sub.aiReviews.map(rev => ({
            assignmentTitle: sub.assignment?.title || 'Coding Practice',
            code: sub.code || '',
            language: sub.language || '',
            summary: rev.summary || '',
            strengths: Array.isArray(rev.strengths) ? (rev.strengths as unknown as string[]) : [],
            improvements: Array.isArray(rev.improvements) ? (rev.improvements as unknown as string[]) : [],
            styleFeedback: rev.styleFeedback || ''
          })))
          .slice(0, 10);

        if (reviews.length > 0) {
          try {
            const consolidated = await generateConsolidatedFeedback(reviews);
            recentAiFeedback = {
              title: 'Your Socratic Learning Progress',
              score: 100, // Static placeholder score since score displays are hidden
              summary: consolidated.summary,
              strengths: consolidated.strengths,
              improvements: consolidated.improvements,
              styleFeedback: consolidated.styleFeedback,
            };
          } catch (consolidatedErr) {
            console.error('Failed to generate consolidated feedback, falling back to latest review:', consolidatedErr);
            const latest = reviews[0];
            recentAiFeedback = {
              title: 'Your Socratic Learning Progress',
              score: 100,
              summary: latest.summary,
              strengths: latest.strengths,
              improvements: latest.improvements,
              styleFeedback: latest.styleFeedback,
            };
          }
          // Cache consolidated feedback for 30 minutes
          await cache.set(cacheKey, JSON.stringify(recentAiFeedback), 1800);
        }
      }
    } catch (feedbackErr) {
      console.error('Failed to construct consolidated AI feedback:', feedbackErr);
    }

    // Fetch user enrollments and module progress to check module completion
    const userEnrollments = await prisma.enrollment.findMany({
      where: { userId: dbUser.id, status: 'active' },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    steps: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const allUserProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: dbUser.id,
        isCompleted: true
      }
    });

    const moduleCompletionDates: { moduleId: string; completedAt: Date }[] = [];

    for (const enrollment of userEnrollments) {
      if (!enrollment.course || !enrollment.course.modules) continue;
      for (const module of enrollment.course.modules) {
        const moduleStepIds = module.lessons.flatMap(l => l.steps.map(s => s.id));
        if (moduleStepIds.length === 0) continue;

        const completedModuleSteps = allUserProgress.filter(p => moduleStepIds.includes(p.stepId));

        if (completedModuleSteps.length === moduleStepIds.length) {
          const latestCompletionTime = Math.max(...completedModuleSteps.map(p => new Date(p.completedAt || p.updatedAt).getTime()));
          moduleCompletionDates.push({
            moduleId: module.id,
            completedAt: new Date(latestCompletionTime)
          });
        }
      }
    }

    // Fetch user's graded submissions
    const userSubmissions = await prisma.submission.findMany({
      where: { 
        userId: dbUser.id,
        status: 'graded'
      },
      select: { createdAt: true, assignmentId: true },
    });

    // Generate daily contributions: Key is YYYY-MM-DD
    const dailyContributions: Record<string, { problems: Set<string>, modulesCount: number }> = {};

    for (const sub of userSubmissions) {
      const dateStr = sub.createdAt.toISOString().slice(0, 10);
      if (!dailyContributions[dateStr]) {
        dailyContributions[dateStr] = { problems: new Set(), modulesCount: 0 };
      }
      dailyContributions[dateStr].problems.add(sub.assignmentId);
    }

    for (const mc of moduleCompletionDates) {
      const dateStr = mc.completedAt.toISOString().slice(0, 10);
      if (!dailyContributions[dateStr]) {
        dailyContributions[dateStr] = { problems: new Set(), modulesCount: 0 };
      }
      dailyContributions[dateStr].modulesCount++;
    }

    // Calculate unique days with at least one contribution (completed module or solved problem)
    const uniqueDates = Object.keys(dailyContributions).sort((a, b) => b.localeCompare(a));

    // Calculate consecutive days streak
    let streakCount = 0;
    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
        let current = uniqueDates.includes(todayStr) ? new Date() : yesterday;
        while (true) {
          const dateStr = current.toISOString().slice(0, 10);
          if (uniqueDates.includes(dateStr)) {
            streakCount++;
            current.setDate(current.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Generate heatmap cells (7 rows x 15 columns = 105 cells)
    const heatmapCells: { date: string; problemsCount: number; modulesCount: number; shade: number; isFuture?: boolean }[] = [];
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const today = new Date();
    const todayWeekday = today.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
    const futurePadding = 6 - todayWeekday;
    const activeCellsCount = 105 - futurePadding;

    for (let i = activeCellsCount - 1; i >= 0; i--) {
      const cellDate = new Date(today.getTime() - i * MS_PER_DAY);
      const cellDateStr = cellDate.toISOString().slice(0, 10);
      const dayData = dailyContributions[cellDateStr];
      const problemsCount = dayData ? dayData.problems.size : 0;
      const modulesCount = dayData ? dayData.modulesCount : 0;
      const totalDayCount = problemsCount + modulesCount;
      
      let shade = 0;
      if (totalDayCount === 1) shade = 1;
      else if (totalDayCount === 2) shade = 2;
      else if (totalDayCount === 3) shade = 3;
      else if (totalDayCount >= 4) shade = 4;
      
      heatmapCells.push({
        date: cellDateStr,
        problemsCount,
        modulesCount,
        shade
      });
    }

    for (let i = 1; i <= futurePadding; i++) {
      const futureDate = new Date(today.getTime() + i * MS_PER_DAY);
      heatmapCells.push({
        date: futureDate.toISOString().slice(0, 10),
        problemsCount: 0,
        modulesCount: 0,
        shade: 0,
        isFuture: true
      });
    }

    // Calculate solved assignments (only unique CodingProblems with status: 'graded')
    const activeProblems = await prisma.codingProblem.findMany({
      where: { isActive: true },
      select: { id: true, slug: true }
    });

    const activeProblemIdentifiers = [
      ...activeProblems.map(p => p.id),
      ...activeProblems.map(p => p.slug)
    ];

    const submissions = await prisma.submission.findMany({
      where: {
        userId: dbUser.id,
        status: 'graded',
        assignmentId: { in: activeProblemIdentifiers }
      },
      select: { assignmentId: true }
    });

    const uniqueSolvedProblems = Array.from(new Set(submissions.map(s => s.assignmentId)));
    const submissionsCount = uniqueSolvedProblems.length;
    const totalProblemsCount = activeProblems.length;

    // Calculate problems solved today
    const nowTime = new Date();
    const startOfToday = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate());

    const submissionsToday = await prisma.submission.findMany({
      where: {
        userId: dbUser.id,
        status: 'graded',
        assignmentId: { in: activeProblemIdentifiers },
        createdAt: { gte: startOfToday }
      },
      select: { assignmentId: true }
    });
    const solvedTodayAssignmentIds = Array.from(new Set(submissionsToday.map(s => s.assignmentId)));
    const submissionsTodayCount = solvedTodayAssignmentIds.length;

    // Calculate Coding XP
    const completedStepsCount = await prisma.lessonProgress.count({
      where: {
        userId: dbUser.id,
        isCompleted: true
      }
    });

    const progressToday = await prisma.lessonProgress.findMany({
      where: {
        userId: dbUser.id,
        isCompleted: true,
        updatedAt: { gte: startOfToday }
      }
    });

    const codingXp = (completedStepsCount * 10) + (submissionsCount * 100);
    const codingXpToday = (progressToday.length * 10) + (submissionsTodayCount * 100);

    // Calculate weekly progress (Monday to Sunday)
    const currentDay = nowTime.getDay();
    const monday = new Date(nowTime);
    const diff = nowTime.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    const weekDays: Date[] = [];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }

    const startOfWeek = weekDays[0];
    const weeklySubmissions = userSubmissions.filter(s => new Date(s.createdAt).getTime() >= startOfWeek.getTime());

    const weeklyActivity = weekDays.map((dayDate, idx) => {
      const dayStart = dayDate.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const daySubs = weeklySubmissions.filter(s => {
        const t = new Date(s.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      });
      const uniqueDayProblems = Array.from(new Set(daySubs.map(s => s.assignmentId))).length;

      const dayModules = moduleCompletionDates.filter(mc => {
        const t = mc.completedAt.getTime();
        return t >= dayStart && t < dayEnd;
      });

      const count = dayModules.length + uniqueDayProblems;
      return {
        day: dayLabels[idx],
        count
      };
    });

    const weeklyTotalActivities = weeklyActivity.reduce((sum, d) => sum + d.count, 0);
    const weeklyTotalModules = moduleCompletionDates.filter(mc => mc.completedAt.getTime() >= startOfWeek.getTime()).length;
    const weeklyTotalProblems = Array.from(new Set(weeklySubmissions.map(s => s.assignmentId))).length;

    const weeklyDailyAvg = parseFloat((weeklyTotalActivities / 7).toFixed(1));
    const weeklyGoalPct = Math.min(100, Math.round((weeklyTotalActivities / 4) * 100)); // 4 activities weekly goal

    const modulesCompletedToday = moduleCompletionDates.filter(mc => mc.completedAt.getTime() >= startOfToday.getTime()).length;

    return apiSuccess({
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        name: `${dbUser.firstName ?? ''} ${dbUser.lastName ?? ''}`.trim() || dbUser.username || 'User',
        username: dbUser.username,
        avatarUrl: dbUser.avatarUrl,
        avatar: dbUser.avatarUrl || '🎓', // fallback for avatar emoji
        role: dbUser.role,
        bio: dbUser.bio,
        phone: dbUser.phone,
        isVerified: dbUser.isVerified,
      },
      enrolledCourseIds,
      payments,
      recentAiFeedback,
      submissionsCount,
      totalProblemsCount,
      submissionsTodayCount,
      codingXp,
      codingXpToday,
      streakCount,
      heatmapCells,
      weeklyActivity,
      weeklyTotalActivities,
      weeklyTotalModules,
      weeklyTotalProblems,
      weeklyDailyAvg,
      weeklyGoalPct,
      modulesCompletedToday,
    });
  } catch (error: any) {
    console.error('Error fetching /api/users/me:', error);
    return apiError(error?.message || 'Internal Server Error', 500);
  }
}

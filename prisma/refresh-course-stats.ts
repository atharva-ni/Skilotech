import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting Course statistics and student counts refresh...');

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, slug: true }
  });

  for (const course of courses) {
    // 1. Calculate actual enrollment count
    const studentCount = await prisma.enrollment.count({
      where: { courseId: course.id }
    });

    // 2. Calculate actual rating average and counts
    const reviewStats = await prisma.courseReview.aggregate({
      where: { courseId: course.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingAvg = reviewStats._avg.rating || 0;
    const ratingCount = reviewStats._count.rating || 0;

    // 3. Update the course metadata to reflect real database data
    const updated = await prisma.course.update({
      where: { id: course.id },
      data: {
        studentsEnrolled: studentCount,
        ratingAvg,
        ratingCount,
      }
    });

    console.log(`Updated Course "${course.title}" (${course.slug}):`);
    console.log(`  - Real Students Enrolled: ${studentCount}`);
    console.log(`  - Real Rating Avg: ${ratingAvg}`);
    console.log(`  - Real Rating Count: ${ratingCount}`);
  }

  console.log('🎉 Course stats refresh completed successfully!');
}

main()
  .catch((e) => {
    console.error('Refresh script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

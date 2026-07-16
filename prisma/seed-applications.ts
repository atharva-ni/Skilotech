import { PrismaClient, UserRole, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding job applications for recruiter addys1243@gmail.com...');

  // 1. Find the recruiter
  const recruiter = await prisma.user.findUnique({
    where: { email: 'addys1243@gmail.com' }
  });

  if (!recruiter) {
    console.error('Error: Recruiter addys1243@gmail.com not found. Please run seed-jobs first.');
    return;
  }

  // 2. Find jobs created by the recruiter
  const recruiterJobs = await prisma.job.findMany({
    where: { recruiterId: recruiter.id }
  });

  if (recruiterJobs.length === 0) {
    console.error('Error: No jobs found for recruiter addys1243@gmail.com. Please run seed-jobs first.');
    return;
  }

  // 3. Define candidates (students) to seed
  const candidatesData = [
    {
      email: 'john.doe@example.com',
      clerkId: 'usr_john_doe',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      avatarUrl: '👨‍💻',
      bio: 'Self-taught Python enthusiast who loves building API backends with FastAPI and Flask. Familiar with relational databases.',
      coverLetter: 'I am extremely excited about the Junior Python Developer role at Stripe. I have been building Flask and FastAPI projects for over a year and have a solid foundation in SQL database querying, Git version control, and writing clear, testable code.',
      targetJobTitle: 'Junior Python Developer',
      resumeUrl: '/resumes/john_doe.html'
    },
    {
      email: 'jane.smith@example.com',
      clerkId: 'usr_jane_smith',
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      avatarUrl: '👩‍💻',
      bio: 'Frontend developer focused on building interactive, premium interfaces with React and modern CSS frameworks.',
      coverLetter: 'I love crafting polished user interfaces with Next.js and Vercel. I have built several interactive responsive projects and have solid skills in TypeScript, CSS modules, and custom micro-animations.',
      targetJobTitle: 'Frontend Engineer Intern',
      resumeUrl: '/resumes/jane_smith.html'
    },
    {
      email: 'alice.jones@example.com',
      clerkId: 'usr_alice_jones',
      firstName: 'Alice',
      lastName: 'Jones',
      username: 'alicejones',
      avatarUrl: '🕵️‍♀️',
      bio: 'Junior systems developer focusing on Go programming language, Docker deployment pipelines, and building scalable JSON APIs.',
      coverLetter: 'Having built highly concurrent microservices in Go and deployed them using Docker containers, I believe my skills match the Software Engineer role at GitHub. I excel at writing clean RESTful service endpoints and database interactions.',
      targetJobTitle: 'Software Engineer',
      resumeUrl: '/resumes/alice_jones.html'
    }
  ];

  for (const item of candidatesData) {
    // A. Find or create candidate
    let student = await prisma.user.findUnique({
      where: { email: item.email }
    });

    if (!student) {
      console.log(`Creating student candidate: ${item.email}...`);
      student = await prisma.user.create({
        data: {
          email: item.email,
          clerkId: item.clerkId,
          firstName: item.firstName,
          lastName: item.lastName,
          username: item.username,
          avatarUrl: item.avatarUrl,
          bio: item.bio,
          role: UserRole.student,
          isVerified: true,
          isActive: true
        }
      });
    }

    // B. Find the specific target job
    const job = recruiterJobs.find(j => j.title === item.targetJobTitle);
    if (!job) {
      console.warn(`Warning: Target job "${item.targetJobTitle}" not found for this recruiter. Skipping application seeding for ${item.email}.`);
      continue;
    }

    // C. Check if application already exists
    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId: job.id,
          userId: student.id
        }
      }
    });

    if (!existingApp) {
      console.log(`Seeding application for ${item.firstName} ${item.lastName} -> ${job.title}...`);
      await prisma.application.create({
        data: {
          jobId: job.id,
          userId: student.id,
          status: ApplicationStatus.applied,
          coverLetter: item.coverLetter,
          resumeUrl: item.resumeUrl,
          matchScore: null,
          recruiterNotes: null
        }
      });
    } else {
      console.log(`Application for ${item.firstName} ${item.lastName} already exists. Resetting to initial state...`);
      await prisma.application.update({
        where: { id: existingApp.id },
        data: {
          resumeUrl: item.resumeUrl,
          status: ApplicationStatus.applied,
          matchScore: null,
          recruiterNotes: null
        }
      });
    }
  }

  console.log('Database seeded with test applications successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

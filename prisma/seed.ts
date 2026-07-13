import { PrismaClient, UserRole, CourseLevel, CourseStatus, LessonStepType, PaymentStatus, PaymentMethod, EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing data (respecting foreign key order)
  console.log('Clearing old data...');
  await prisma.courseReview.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.commentLike.deleteMany({});
  await prisma.postLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.communityPost.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.aiReview.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.lessonStep.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  console.log('Seeding users...');
  
  const student = await prisma.user.create({
    data: {
      clerkId: 'usr_student_1',
      email: 'aarav@skilotech.com',
      firstName: 'Aarav',
      lastName: 'Mehta',
      username: 'aarav_mehta',
      avatarUrl: '🎓',
      role: UserRole.student,
      bio: 'Aspiring Full Stack Developer. Passionate about learning new web technologies and solving algorithmic challenges.',
      phone: '+919876543210',
      isVerified: true,
      metadata: { onboardingCompleted: true },
    },
  });

  const instructor = await prisma.user.create({
    data: {
      clerkId: 'usr_instructor_1',
      email: 'priya@skilotech.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      username: 'priya_sharma',
      avatarUrl: '👩‍🏫',
      role: UserRole.instructor,
      bio: 'Senior Software Engineer with 8+ years of experience in React, Node.js, and Cloud Architectures. Passionate about teaching.',
      phone: '+919876543211',
      isVerified: true,
    },
  });

  const recruiter = await prisma.user.create({
    data: {
      clerkId: 'usr_recruiter_1',
      email: 'rahul@skilotech.com',
      firstName: 'Rahul',
      lastName: 'Gupta',
      username: 'rahul_gupta',
      avatarUrl: '🏢',
      role: UserRole.recruiter,
      bio: 'Technical Recruiter at TechNova Solutions. Looking for talented developers skilled in React, Node.js, and DSA.',
      phone: '+919876543212',
      isVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      clerkId: 'usr_admin_1',
      email: 'sneha@skilotech.com',
      firstName: 'Sneha',
      lastName: 'Verma',
      username: 'sneha_verma',
      avatarUrl: '⚙️',
      role: UserRole.admin,
      bio: 'SkillBridge Platform Administrator. Managing courses, recruiters, and payments analytics.',
      phone: '+919876543213',
      isVerified: true,
    },
  });

  console.log('Seeding categories...');
  
  // 3. Seed Categories
  const webDevCat = await prisma.category.create({
    data: { name: 'Web Development', slug: 'web-development', icon: '🌐', sortOrder: 1 }
  });

  const csCat = await prisma.category.create({
    data: { name: 'Computer Science', slug: 'computer-science', icon: '🧮', sortOrder: 2 }
  });

  const aiCat = await prisma.category.create({
    data: { name: 'AI & ML', slug: 'ai-ml', icon: '🤖', sortOrder: 3 }
  });

  const devopsCat = await prisma.category.create({
    data: { name: 'DevOps', slug: 'devops', icon: '🛠️', sortOrder: 4 }
  });

  const designCat = await prisma.category.create({
    data: { name: 'Design', slug: 'design', icon: '🎨', sortOrder: 5 }
  });

  // 4. Seed Courses, Modules, Lessons, Steps
  console.log('Seeding courses & step-wise curriculum...');

  // Course 1: Full-Stack Web Development
  const course1 = await prisma.course.create({
    data: {
      title: 'Full-Stack Web Development with React & Node.js',
      slug: 'full-stack-web-development-react-nodejs',
      description: 'Master modern web development with React, Node.js, and PostgreSQL. Build production-ready applications from scratch.',
      shortDescription: 'Build full-stack SaaS apps with React, Express, Node.js, and relational databases.',
      instructorId: instructor.id,
      categoryId: webDevCat.id,
      level: CourseLevel.intermediate,
      status: CourseStatus.published,
      price: 299900, // ₹2,999.00 (in paise)
      currency: 'INR',
      thumbnailUrl: '/course-web.jpg',
      durationHours: 42.0,
      studentsEnrolled: 1847,
      ratingAvg: 4.8,
      ratingCount: 124,
      isFeatured: true,
    },
  });

  // Modules for Course 1
  const m1 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: 'Module 1: Introduction & Environment Setup',
      description: 'Learn the architecture of full-stack apps and configure your dev environment.',
      sortOrder: 1,
      isFree: true,
    },
  });

  const m2 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: 'Module 2: React Core & State Management',
      description: 'Deep dive into React components, hooks, custom hooks, and state patterns.',
      sortOrder: 2,
    },
  });

  // Lessons for Module 1
  const l1_1 = await prisma.lesson.create({
    data: {
      moduleId: m1.id,
      title: 'Lesson 1.1: Web App Architecture Overview',
      description: 'Understand client-server architecture, HTTP requests, APIs, and databases.',
      sortOrder: 1,
      durationMins: 15,
      isFree: true,
    },
  });

  const l1_2 = await prisma.lesson.create({
    data: {
      moduleId: m1.id,
      title: 'Lesson 1.2: Node.js & Express Setup',
      description: 'Initialize a Node.js project, install Express, and configure a basic server.',
      sortOrder: 2,
      durationMins: 25,
    },
  });

  // Steps for Lesson 1.1 (Step-wise learning flow)
  await prisma.lessonStep.createMany({
    data: [
      {
        lessonId: l1_1.id,
        stepType: LessonStepType.intro,
        sortOrder: 1,
        title: 'Step 1: Welcome to Full-Stack Web Dev',
        textContent: `# Welcome to Full-Stack Web Development!
In this step, we will map out what you'll be building in this course and lay the foundational concepts.

### Learning Objectives:
1. Understand the difference between Frontend, Backend, and Database.
2. Conceptualize the Client-Server model.
3. Discover how the Web Works.
        `,
      },
      {
        lessonId: l1_1.id,
        stepType: LessonStepType.text,
        sortOrder: 2,
        title: 'Step 2: Client-Server Model Deep Dive',
        textContent: `## The Client-Server Model

Every web request operates on a client-server architecture. Let's break this down:

1. **Client**: The browser (Chrome, Firefox, Safari) running on a user's device. It makes requests (HTTP/HTTPS) and renders HTML/CSS/JS.
2. **Server**: A backend process running on a computer somewhere, listening for incoming client requests. It processes requests, communicates with the database, and returns responses.
3. **Database**: A specialized system used to store structured data persistently.

### Anatomy of an HTTP Request
When you enter \`https://skillbridge.com/courses\` in your browser:
* **DNS Resolution**: Your browser translates the domain name into an IP address.
* **TCP Connection**: An connection is established.
* **HTTP Request**: The browser sends a \`GET /courses\` request.
* **Server Processing**: The server receives the request, queries the database for courses, and renders them.
* **HTTP Response**: The server sends a status code (e.g., \`200 OK\`) along with the requested HTML/JSON data.
        `,
      },
      {
        lessonId: l1_1.id,
        stepType: LessonStepType.video,
        sortOrder: 3,
        title: 'Step 3: Web Architecture Visualizer',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rickroll mock url
        videoDurationSecs: 240,
        textContent: 'Watch this 4-minute overview of modern client-server structures and how databases interact with backend services.',
      },
      {
        id: 'step_web_1_1_4',
        lessonId: l1_1.id,
        stepType: LessonStepType.lab,
        sortOrder: 4,
        title: 'Step 4: Interactive Architecture Quiz',
        labLanguage: 'javascript',
        labStarterCode: `// Architecture Quiz: Fill in the return values to pass the checks!

function getClientRole() {
  // TODO: Return what the Client is primarily responsible for:
  // Options: 'render_ui', 'database_storage', 'run_backend_logic'
  return "";
}

function getHTTPMethodForCreation() {
  // TODO: Return the HTTP verb used to create new resources (e.g., GET, POST, PUT, DELETE)
  return "";
}

module.exports = { getClientRole, getHTTPMethodForCreation };
`,
        labSolutionCode: `function getClientRole() {
  return "render_ui";
}

function getHTTPMethodForCreation() {
  return "POST";
}

module.exports = { getClientRole, getHTTPMethodForCreation };
`,
        labInstructions: `### Interactive Lab: Architecture Basics

Fill in the template code functions to demonstrate your understanding:
1. \`getClientRole()\` should return \`"render_ui"\`.
2. \`getHTTPMethodForCreation()\` should return \`"POST"\`.

Click **Run Code** to compile and test, and then submit to verify!`,
      },
    ],
  });

  // Create matching Assignment to satisfy foreign key for submissions
  await prisma.assignment.create({
    data: {
      id: 'step_web_1_1_4',
      courseId: course1.id,
      moduleId: m1.id,
      title: 'Step 4: Interactive Architecture Quiz',
      assignmentType: 'coding',
      status: 'active',
      maxScore: 100,
    }
  });

  // Steps for Lesson 1.2
  await prisma.lessonStep.createMany({
    data: [
      {
        lessonId: l1_2.id,
        stepType: LessonStepType.intro,
        sortOrder: 1,
        title: 'Step 1: Setting up Node.js & Express',
        textContent: `# Setting up Express
In this lesson, we will initialize a Node.js project and write our very first Express application. Express is the most popular, minimalist web framework for Node.js.
        `,
      },
      {
        lessonId: l1_2.id,
        stepType: LessonStepType.text,
        sortOrder: 2,
        title: 'Step 2: The Core Express Lifecycle',
        textContent: `## How Express Processes Requests

An Express application is essentially a pipeline of functions called **Middleware**. Let's review the request lifecycle:

1. **Incoming Request**: A client calls \`GET /api/users\`.
2. **Middleware Chains**: Express executes any global middlewares (e.g., JSON body parser, CORS policies, logging middlewares).
3. **Route Handler**: The request matches the \`app.get('/api/users')\` route. The route handler function runs.
4. **Response Sent**: The server finishes by sending a response with \`res.json()\` or \`res.send()\`.

Here is a basic Express application:
\`\`\`javascript
const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.send('Hello from SkillBridge!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
\`\`\`
        `,
      },
      {
        id: 'step_web_1_2_3',
        lessonId: l1_2.id,
        stepType: LessonStepType.lab,
        sortOrder: 3,
        title: 'Step 3: Lab — Creating your first GET endpoint',
        labLanguage: 'javascript',
        labStarterCode: `const express = require('express');

function createExpressApp() {
  const app = express();
  
  // TODO: Add a GET route handler for path "/ping" that returns the string "pong"
  
  
  return app;
}

module.exports = { createExpressApp };
`,
        labSolutionCode: `const express = require('express');

function createExpressApp() {
  const app = express();
  
  app.get('/ping', (req, res) => {
    res.send('pong');
  });
  
  return app;
}

module.exports = { createExpressApp };
`,
        labInstructions: `### Interactive Lab: Creating a Route

Complete the \`createExpressApp\` function:
1. Define a \`GET\` endpoint at path \`/ping\`.
2. The route handler should return the string \`"pong"\` using \`res.send('pong')\`.
3. Return the configured \`app\` instance.`,
      },
    ],
  });

  // Create matching Assignment to satisfy foreign key for submissions
  await prisma.assignment.create({
    data: {
      id: 'step_web_1_2_3',
      courseId: course1.id,
      moduleId: m1.id,
      title: 'Step 3: Lab — Creating your first GET endpoint',
      assignmentType: 'coding',
      status: 'active',
      maxScore: 100,
    }
  });

  // Course 2: DSA in Python
  const course2 = await prisma.course.create({
    data: {
      title: 'Data Structures & Algorithms in Python',
      slug: 'data-structures-algorithms-python',
      description: 'Deep dive into DSA with Python. Prepare for technical interviews at top tech companies with 200+ practice problems.',
      shortDescription: 'Master Binary Search, Dynamic Programming, Graphs, and Trees in Python.',
      instructorId: instructor.id,
      categoryId: csCat.id,
      level: CourseLevel.advanced,
      status: CourseStatus.published,
      price: 199900, // ₹1,999.00
      currency: 'INR',
      thumbnailUrl: '/course-dsa.jpg',
      durationHours: 56.0,
      studentsEnrolled: 3254,
      ratingAvg: 4.9,
      ratingCount: 231,
      isFeatured: false,
    },
  });

  // Module for Course 2
  const course2_m1 = await prisma.module.create({
    data: {
      courseId: course2.id,
      title: 'Module 1: Array Algorithms & Binary Search',
      description: 'Master binary search and two-pointer array algorithms.',
      sortOrder: 1,
    },
  });

  const course2_l1 = await prisma.lesson.create({
    data: {
      moduleId: course2_m1.id,
      title: 'Lesson 1.1: Binary Search Implementation',
      description: 'Understand binary search log(N) time complexity and implement it iteratively and recursively.',
      sortOrder: 1,
      durationMins: 20,
    },
  });

  await prisma.lessonStep.createMany({
    data: [
      {
        lessonId: course2_l1.id,
        stepType: LessonStepType.intro,
        sortOrder: 1,
        title: 'Step 1: Introduction to Binary Search',
        textContent: `# Introduction to Binary Search
Binary Search is a divide-and-conquer algorithm that finds the position of a target value within a **sorted array**.

### Why Binary Search?
* **Linear Search**: Checks each element one by one. Time Complexity: **O(N)**.
* **Binary Search**: Halves the search space at each step. Time Complexity: **O(log N)**.

For an array of 1 million items, Linear Search takes up to 1,000,000 operations, while Binary Search takes at most **20** operations!
        `,
      },
      {
        lessonId: course2_l1.id,
        stepType: LessonStepType.text,
        sortOrder: 2,
        title: 'Step 2: Binary Search Pseudocode',
        textContent: `## How It Works

1. Initialize two pointers: \`low = 0\` and \`high = len(arr) - 1\`.
2. While \`low <= high\`:
   * Calculate mid index: \`mid = low + (high - low) // 2\`. (Using \`low + (high-low)//2\` prevents integer overflow in other languages compared to \`(low + high)//2\`).
   * If \`arr[mid] == target\`, we found the element! Return \`mid\`.
   * If \`arr[mid] < target\`, the target must be in the right half. Update \`low = mid + 1\`.
   * If \`arr[mid] > target\`, the target must be in the left half. Update \`high = mid - 1\`.
3. If low exceeds high, the element is not present. Return \`-1\`.
        `,
      },
      {
        id: 'step_dsa_1_1_2',
        lessonId: course2_l1.id,
        stepType: LessonStepType.lab,
        sortOrder: 3,
        title: 'Step 3: Lab — Implementing Binary Search',
        labLanguage: 'python',
        labStarterCode: `def binary_search(arr, target):
    # TODO: Implement binary search. 
    # Input 'arr' is a sorted list of integers.
    # Return the index of target if found, otherwise return -1.
    pass
`,
        labSolutionCode: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1
`,
        labInstructions: `### Interactive Lab: Binary Search

Implement the \`binary_search\` function in Python:
1. Set up \`low\` and \`high\` bounds.
2. Binary search the sorted array.
3. Return the 0-indexed position of \`target\`, or \`-1\` if not found.`,
      },
    ],
  });

  // Create matching Assignment to satisfy foreign key for submissions
  await prisma.assignment.create({
    data: {
      id: 'step_dsa_1_1_2',
      courseId: course2.id,
      moduleId: course2_m1.id,
      title: 'Step 3: Lab — Implementing Binary Search',
      assignmentType: 'coding',
      status: 'active',
      maxScore: 100,
    }
  });

  // Seed Enrollments & Payments
  console.log('Seeding sample enrollments and payments...');
  
  const payment1 = await prisma.payment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      razorpayOrderId: 'order_fake_123',
      razorpayPaymentId: 'pay_fake_123',
      razorpaySignature: 'sig_fake_123',
      amount: 299900,
      currency: 'INR',
      status: PaymentStatus.completed,
      method: PaymentMethod.upi,
      receipt: 'rcpt_fake_123',
      description: 'Enrollment for Aarav Mehta in React & Node course',
      paidAt: new Date(),
    },
  });

  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      status: EnrollmentStatus.active,
      paymentId: payment1.id,
      progressPct: 25.00, // 1 step completed out of 4 is 25%
    },
  });

  // Seed first step as completed for student
  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      stepId: (await prisma.lessonStep.findFirst({ where: { lessonId: l1_1.id, sortOrder: 1 } }))!.id,
      isCompleted: true,
      completedAt: new Date(),
      timeSpentSecs: 120,
    },
  });

  // Seed Invoice
  await prisma.invoice.create({
    data: {
      paymentId: payment1.id,
      userId: student.id,
      invoiceNumber: 'INV-2026-0001',
      amount: 299900,
      taxAmount: 0,
      totalAmount: 299900,
      currency: 'INR',
      billingName: 'Aarav Mehta',
      billingEmail: 'aarav@skilotech.com',
      billingAddress: '123 Main Street, Mumbai, India',
    },
  });

  // Seed community posts
  console.log('Seeding community posts...');
  await prisma.communityPost.createMany({
    data: [
      {
        authorId: student.id,
        content: 'Just completed the Web App Architecture lesson! The Client-Server model makes so much sense now. The visualizer and quiz were incredibly helpful! 🚀',
        tags: JSON.stringify(['web-dev', 'learning', 'basics']),
        likesCount: 5,
        commentsCount: 1,
      },
      {
        authorId: instructor.id,
        content: 'Welcome everyone to SkillBridge! Post your coding questions in this community feed, and I or other mentors will reply. Keep coding! 💻',
        tags: JSON.stringify(['welcome', 'mentor-tips']),
        likesCount: 18,
        commentsCount: 0,
        isPinned: true,
      },
    ],
  });

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

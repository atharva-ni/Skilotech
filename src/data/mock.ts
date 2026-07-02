export type UserRole = 'student' | 'instructor' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  isVerified?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  rating: number;
  studentsEnrolled: number;
  duration: string;
  modules: number;
  lessons: number;
  image: string;
  status: 'published' | 'draft' | 'pending';
  progress?: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  salary: string;
  skills: string[];
  posted: string;
  applicants: number;
  status: 'active' | 'closed' | 'draft';
  description: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: 'active' | 'closed' | 'draft';
  type: 'coding' | 'written' | 'quiz';
}

export interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  submittedAt: string;
  grade: number | null;
  status: 'pending' | 'graded' | 'ai_reviewed';
  aiScore: number | null;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
}

export interface Payment {
  id: string;
  studentName: string;
  courseName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  method: string;
  invoiceId: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  matchScore: number;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'interviewing' | 'hired' | 'rejected';
  skills: string[];
  experience: string;
}

// ---- Mock Users ----
export const mockUsers: Record<UserRole, User> = {
  student: {
    id: 'usr_student_1',
    name: 'Aarav Mehta',
    email: 'aarav@skillzy.com',
    role: 'student',
    avatar: '🎓',
  },
  instructor: {
    id: 'usr_instructor_1',
    name: 'Priya Sharma',
    email: 'priya@skillzy.com',
    role: 'instructor',
    avatar: '👩‍🏫',
  },
  recruiter: {
    id: 'usr_recruiter_1',
    name: 'Rahul Gupta',
    email: 'rahul@skillzy.com',
    role: 'recruiter',
    avatar: '🏢',
  },
  admin: {
    id: 'usr_admin_1',
    name: 'Sneha Verma',
    email: 'sneha@skillzy.com',
    role: 'admin',
    avatar: '⚙️',
  },
};

// ---- Mock Courses ----
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Full-Stack Web Development with React & Node.js',
    description: 'Master modern web development with React, Node.js and PostgreSQL. Build production-ready applications from scratch.',
    instructor: 'Priya Sharma',
    instructorAvatar: '👩‍🏫',
    category: 'Web Development',
    level: 'Intermediate',
    price: 2999,
    rating: 4.8,
    studentsEnrolled: 1847,
    duration: '42 hours',
    modules: 12,
    lessons: 86,
    image: '/course-web.jpg',
    status: 'published',
    progress: 65,
  },
  {
    id: 'course-2',
    title: 'Data Structures & Algorithms in Python',
    description: 'Deep dive into DSA with Python. Prepare for technical interviews at top companies with 200+ practice problems.',
    instructor: 'Vikram Patel',
    instructorAvatar: '👨‍💻',
    category: 'Computer Science',
    level: 'Advanced',
    price: 1999,
    rating: 4.9,
    studentsEnrolled: 3254,
    duration: '56 hours',
    modules: 18,
    lessons: 124,
    image: '/course-dsa.jpg',
    status: 'published',
    progress: 30,
  },
  {
    id: 'course-3',
    title: 'Machine Learning Fundamentals',
    description: 'Learn machine learning from scratch. Covers supervised learning, neural networks, and real-world projects with scikit-learn and TensorFlow.',
    instructor: 'Dr. Anita Roy',
    instructorAvatar: '👩‍🔬',
    category: 'AI & ML',
    level: 'Intermediate',
    price: 3499,
    rating: 4.7,
    studentsEnrolled: 2198,
    duration: '38 hours',
    modules: 10,
    lessons: 72,
    image: '/course-ml.jpg',
    status: 'published',
  },
  {
    id: 'course-4',
    title: 'DevOps & Cloud Engineering with AWS',
    description: 'Master CI/CD pipelines, Docker, Kubernetes, and AWS services. Become a certified cloud engineer.',
    instructor: 'Karan Singhania',
    instructorAvatar: '🛠️',
    category: 'DevOps',
    level: 'Advanced',
    price: 4499,
    rating: 4.6,
    studentsEnrolled: 987,
    duration: '48 hours',
    modules: 14,
    lessons: 98,
    image: '/course-devops.jpg',
    status: 'published',
  },
  {
    id: 'course-5',
    title: 'UI/UX Design Masterclass',
    description: 'Create stunning user interfaces and experiences. Learn Figma, design systems, user research, and prototyping.',
    instructor: 'Meera Joshi',
    instructorAvatar: '🎨',
    category: 'Design',
    level: 'Beginner',
    price: 1499,
    rating: 4.8,
    studentsEnrolled: 1542,
    duration: '28 hours',
    modules: 8,
    lessons: 56,
    image: '/course-design.jpg',
    status: 'published',
  },
  {
    id: 'course-6',
    title: 'Cybersecurity Essentials',
    description: 'Learn ethical hacking, network security, and security best practices. Prepare for CompTIA Security+ certification.',
    instructor: 'Arjun Nair',
    instructorAvatar: '🔐',
    category: 'Security',
    level: 'Intermediate',
    price: 2499,
    rating: 4.5,
    studentsEnrolled: 876,
    duration: '35 hours',
    modules: 9,
    lessons: 64,
    image: '/course-security.jpg',
    status: 'pending',
  },
  {
    id: 'course-7',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile apps with React Native and Expo. Deploy to both iOS and Android.',
    instructor: 'Priya Sharma',
    instructorAvatar: '👩‍🏫',
    category: 'Mobile Development',
    level: 'Intermediate',
    price: 2799,
    rating: 4.7,
    studentsEnrolled: 1234,
    duration: '36 hours',
    modules: 11,
    lessons: 78,
    image: '/course-mobile.jpg',
    status: 'draft',
  },
  {
    id: 'course-8',
    title: 'Introduction to Programming with JavaScript',
    description: 'Perfect for absolute beginners. Learn programming fundamentals with JavaScript through interactive exercises.',
    instructor: 'Vikram Patel',
    instructorAvatar: '👨‍💻',
    category: 'Programming',
    level: 'Beginner',
    price: 999,
    rating: 4.9,
    studentsEnrolled: 4567,
    duration: '20 hours',
    modules: 6,
    lessons: 42,
    image: '/course-js.jpg',
    status: 'published',
  },
];

// ---- Mock Jobs ----
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Frontend Developer',
    company: 'TechNova Solutions',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹8-12 LPA',
    skills: ['React', 'TypeScript', 'CSS', 'Next.js'],
    posted: '2 days ago',
    applicants: 45,
    status: 'active',
    description: 'We are looking for a skilled frontend developer to join our product team.',
  },
  {
    id: 'job-2',
    title: 'Backend Engineer',
    company: 'DataStream Inc.',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹12-18 LPA',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    posted: '1 week ago',
    applicants: 78,
    status: 'active',
    description: 'Join our backend team to build scalable microservices.',
  },
  {
    id: 'job-3',
    title: 'ML Engineering Intern',
    company: 'AI Dynamics',
    location: 'Remote',
    type: 'Internship',
    salary: '₹25K/month',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
    posted: '3 days ago',
    applicants: 120,
    status: 'active',
    description: 'Exciting internship opportunity in our ML research team.',
  },
  {
    id: 'job-4',
    title: 'DevOps Engineer',
    company: 'CloudScale Tech',
    location: 'Pune, India',
    type: 'Full-time',
    salary: '₹15-22 LPA',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    posted: '5 days ago',
    applicants: 32,
    status: 'active',
    description: 'Help us build and maintain cloud infrastructure for our enterprise clients.',
  },
  {
    id: 'job-5',
    title: 'UI/UX Designer',
    company: 'DesignCraft Studio',
    location: 'Mumbai, India',
    type: 'Contract',
    salary: '₹6-10 LPA',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    posted: '1 day ago',
    applicants: 56,
    status: 'active',
    description: 'Join our design team to create beautiful digital experiences.',
  },
  {
    id: 'job-6',
    title: 'Full Stack Developer',
    company: 'InnoVerse Labs',
    location: 'Delhi, India',
    type: 'Full-time',
    salary: '₹10-16 LPA',
    skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
    posted: '4 days ago',
    applicants: 89,
    status: 'active',
    description: 'Build end-to-end features for our SaaS platform.',
  },
];

// ---- Mock Assignments ----
export const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Build a REST API with Express',
    courseId: 'course-1',
    courseName: 'Full-Stack Web Development',
    dueDate: '2026-07-05',
    submissions: 28,
    totalStudents: 45,
    status: 'active',
    type: 'coding',
  },
  {
    id: 'assign-2',
    title: 'Implement Binary Search Tree',
    courseId: 'course-2',
    courseName: 'Data Structures & Algorithms',
    dueDate: '2026-07-03',
    submissions: 42,
    totalStudents: 60,
    status: 'active',
    type: 'coding',
  },
  {
    id: 'assign-3',
    title: 'Linear Regression Project',
    courseId: 'course-3',
    courseName: 'Machine Learning Fundamentals',
    dueDate: '2026-07-10',
    submissions: 15,
    totalStudents: 38,
    status: 'active',
    type: 'coding',
  },
  {
    id: 'assign-4',
    title: 'Docker Container Setup',
    courseId: 'course-4',
    courseName: 'DevOps & Cloud Engineering',
    dueDate: '2026-06-30',
    submissions: 20,
    totalStudents: 25,
    status: 'closed',
    type: 'coding',
  },
  {
    id: 'assign-5',
    title: 'Wireframe Design Challenge',
    courseId: 'course-5',
    courseName: 'UI/UX Design Masterclass',
    dueDate: '2026-07-08',
    submissions: 30,
    totalStudents: 50,
    status: 'active',
    type: 'written',
  },
];

// ---- Mock Submissions ----
export const mockSubmissions: Submission[] = [
  { id: 'sub-1', studentName: 'Aarav Mehta', studentEmail: 'aarav@email.com', assignmentTitle: 'Build a REST API with Express', submittedAt: '2026-06-28', grade: null, status: 'pending', aiScore: 87 },
  { id: 'sub-2', studentName: 'Neha Kapoor', studentEmail: 'neha@email.com', assignmentTitle: 'Implement Binary Search Tree', submittedAt: '2026-06-27', grade: 92, status: 'graded', aiScore: 91 },
  { id: 'sub-3', studentName: 'Rohan Das', studentEmail: 'rohan@email.com', assignmentTitle: 'Linear Regression Project', submittedAt: '2026-06-28', grade: null, status: 'ai_reviewed', aiScore: 78 },
  { id: 'sub-4', studentName: 'Diya Iyer', studentEmail: 'diya@email.com', assignmentTitle: 'Build a REST API with Express', submittedAt: '2026-06-26', grade: 88, status: 'graded', aiScore: 85 },
  { id: 'sub-5', studentName: 'Kabir Singh', studentEmail: 'kabir@email.com', assignmentTitle: 'Docker Container Setup', submittedAt: '2026-06-25', grade: null, status: 'pending', aiScore: null },
];

// ---- Mock Community Posts ----
export const mockPosts: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Aarav Mehta',
    authorAvatar: '🎓',
    content: 'Just completed the Full-Stack Web Development course! The React + Node.js combo is amazing. Highly recommend it to anyone starting their dev journey. 🚀',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    tags: ['web-dev', 'react', 'celebration'],
  },
  {
    id: 'post-2',
    author: 'Neha Kapoor',
    authorAvatar: '💻',
    content: 'Can anyone help me understand the time complexity of merge sort vs quick sort? I keep getting confused about the worst-case scenarios.',
    timestamp: '5 hours ago',
    likes: 12,
    comments: 15,
    tags: ['dsa', 'help', 'algorithms'],
  },
  {
    id: 'post-3',
    author: 'Vikram Patel',
    authorAvatar: '👨‍💻',
    content: 'New coding challenge is live! Build a rate limiter using Redis. Submit your solutions in the coding lab. Best implementations get featured! 🏆',
    timestamp: '1 day ago',
    likes: 56,
    comments: 23,
    tags: ['challenge', 'redis', 'coding'],
  },
  {
    id: 'post-4',
    author: 'Rohan Das',
    authorAvatar: '🔥',
    content: 'Just got placed at DataStream Inc. as a Backend Engineer! Thanks Skillzy for the amazing courses and mock interviews. Dream come true! 🎉',
    timestamp: '2 days ago',
    likes: 89,
    comments: 34,
    tags: ['placement', 'success-story'],
  },
  {
    id: 'post-5',
    author: 'Meera Joshi',
    authorAvatar: '🎨',
    content: 'Pro tip: Always start your UI designs with a proper spacing system. It makes your layouts 10x more consistent. Here\'s my spacing guide...',
    timestamp: '3 days ago',
    likes: 45,
    comments: 11,
    tags: ['design', 'tips', 'ui-ux'],
  },
];

// ---- Mock Payments ----
export const mockPayments: Payment[] = [
  { id: 'pay-1', studentName: 'Aarav Mehta', courseName: 'Full-Stack Web Development', amount: 2999, status: 'completed', date: '2026-06-25', method: 'UPI', invoiceId: 'INV-2026-001' },
  { id: 'pay-2', studentName: 'Neha Kapoor', courseName: 'Data Structures & Algorithms', amount: 1999, status: 'completed', date: '2026-06-24', method: 'Card', invoiceId: 'INV-2026-002' },
  { id: 'pay-3', studentName: 'Rohan Das', courseName: 'Machine Learning Fundamentals', amount: 3499, status: 'completed', date: '2026-06-23', method: 'UPI', invoiceId: 'INV-2026-003' },
  { id: 'pay-4', studentName: 'Diya Iyer', courseName: 'DevOps & Cloud Engineering', amount: 4499, status: 'pending', date: '2026-06-28', method: 'Card', invoiceId: 'INV-2026-004' },
  { id: 'pay-5', studentName: 'Kabir Singh', courseName: 'UI/UX Design Masterclass', amount: 1499, status: 'completed', date: '2026-06-22', method: 'Net Banking', invoiceId: 'INV-2026-005' },
  { id: 'pay-6', studentName: 'Ananya Rao', courseName: 'Full-Stack Web Development', amount: 2999, status: 'failed', date: '2026-06-27', method: 'UPI', invoiceId: 'INV-2026-006' },
  { id: 'pay-7', studentName: 'Vivek Mishra', courseName: 'Cybersecurity Essentials', amount: 2499, status: 'refunded', date: '2026-06-20', method: 'Card', invoiceId: 'INV-2026-007' },
];

// ---- Mock Applicants ----
export const mockApplicants: Applicant[] = [
  { id: 'app-1', name: 'Aarav Mehta', email: 'aarav@email.com', jobTitle: 'Frontend Developer', matchScore: 92, appliedDate: '2026-06-25', status: 'shortlisted', skills: ['React', 'TypeScript', 'CSS'], experience: '1 year' },
  { id: 'app-2', name: 'Neha Kapoor', email: 'neha@email.com', jobTitle: 'Backend Engineer', matchScore: 88, appliedDate: '2026-06-24', status: 'interviewing', skills: ['Node.js', 'PostgreSQL', 'Docker'], experience: '2 years' },
  { id: 'app-3', name: 'Rohan Das', email: 'rohan@email.com', jobTitle: 'ML Engineering Intern', matchScore: 95, appliedDate: '2026-06-23', status: 'hired', skills: ['Python', 'TensorFlow', 'NLP'], experience: 'Fresher' },
  { id: 'app-4', name: 'Diya Iyer', email: 'diya@email.com', jobTitle: 'Frontend Developer', matchScore: 79, appliedDate: '2026-06-26', status: 'applied', skills: ['React', 'JavaScript', 'HTML'], experience: 'Fresher' },
  { id: 'app-5', name: 'Kabir Singh', email: 'kabir@email.com', jobTitle: 'DevOps Engineer', matchScore: 85, appliedDate: '2026-06-22', status: 'rejected', skills: ['AWS', 'Kubernetes', 'CI/CD'], experience: '3 years' },
  { id: 'app-6', name: 'Ananya Rao', email: 'ananya@email.com', jobTitle: 'Full Stack Developer', matchScore: 91, appliedDate: '2026-06-27', status: 'applied', skills: ['React', 'Node.js', 'MongoDB'], experience: '1 year' },
];

// ---- Platform Stats ----
export const platformStats = {
  totalUsers: 12547,
  totalCourses: 156,
  totalRevenue: 4523890,
  activeJobs: 89,
  enrollments: 28943,
  completionRate: 72,
  avgRating: 4.7,
  monthlyGrowth: 18.5,
};

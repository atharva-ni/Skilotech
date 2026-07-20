'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  ArrowRight,
  Terminal,
  Sparkles,
  Flame,
  GraduationCap,
  Target,
  Calendar,
  Clock,
  Play,
  ChevronRight,
  Check,
  Code,
  TrendingUp,
  Compass,
  Cpu,
  LineChart,
  MoreVertical,
  Plus,
  Info,
  AlertTriangle,
  Pencil,
  Trash2,
  MessageSquare
} from 'lucide-react';

// Map each role to its dedicated dashboard path
const roleDashboardPaths: Record<string, string> = {
  admin: '/dashboard/admin',
  super_admin: '/dashboard/admin',
  instructor: '/dashboard/instructor',
  recruiter: '/dashboard/recruiter',
};

const fallbackJobs = [
  {
    id: 'mock-job-1',
    title: 'Junior Python Developer',
    company: 'Stripe',
    location: 'Remote',
    jobType: 'full_time',
    salaryDisplay: '$95,000 - $115,000',
  },
  {
    id: 'mock-job-2',
    title: 'Frontend Engineer Intern',
    company: 'Vercel',
    location: 'San Francisco, CA',
    jobType: 'internship',
    salaryDisplay: '$40 - $55 / hr',
  },
  {
    id: 'mock-job-3',
    title: 'Software Engineer',
    company: 'GitHub',
    location: 'Remote, US',
    jobType: 'full_time',
    salaryDisplay: '$110,000 - $140,000',
  }
];

// Animated Counter Component (0 -> value)
function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1000; // ms
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}</>;
}

// SVG Progress Ring Component (Linear Style)
function ProgressRing({ percentage, size = 32 }: { percentage: number; size?: number }) {
  const radius = size * 0.4;
  const stroke = 2.5;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg height={size} width={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="rgba(0, 0, 0, 0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#000000"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '9px', fontWeight: 700, color: 'var(--text-primary)', transform: 'translateY(0.5px)' }}>
        {percentage}%
      </span>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Todo list state with localStorage sync
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('skilotech_todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    } else {
      setTodos([
        { id: 1, text: 'Complete Functions Quiz', completed: true },
        { id: 2, text: 'Finish Python Assignment', completed: false },
        { id: 3, text: 'Study 15 More Minutes', completed: false },
      ]);
    }
  }, []);

  const saveTodos = (newTodos: any[]) => {
    setTodos(newTodos);
    localStorage.setItem('skilotech_todos', JSON.stringify(newTodos));
  };

  const toggleTodo = (id: number) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos(updated);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      const newTodo = {
        id: Date.now(),
        text: newTaskText.trim(),
        completed: false
      };
      saveTodos([...todos, newTodo]);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const startEditing = (id: number, text: string) => {
    setEditingTaskId(id);
    setEditingTaskText(text);
  };

  const handleSaveEdit = (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (editingTaskText.trim()) {
      const updated = todos.map(t => t.id === id ? { ...t, text: editingTaskText.trim() } : t);
      saveTodos(updated);
    }
    setEditingTaskId(null);
  };

  const deleteTodo = (id: number) => {
    const updated = todos.filter(t => t.id !== id);
    saveTodos(updated);
  };

  const completedTodosCount = todos.filter(t => t.completed).length;

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskText, setEditingTaskText] = useState<string>('');

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentAiFeedback, setRecentAiFeedback] = useState<any>(null);
  const [currentLessonTitle, setCurrentLessonTitle] = useState<string>('Lesson 4: Functions & Scope Optimization');
  const [currentModuleTitle, setCurrentModuleTitle] = useState<string>('Introduction');
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [dynamicHeatmap, setDynamicHeatmap] = useState<{ date: string; problemsCount: number; modulesCount: number; shade: number; isFuture?: boolean }[]>([]);
  const [modulesCompletedToday, setModulesCompletedToday] = useState(0);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; count: number }[]>([
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 }
  ]);
  const [weeklyTotalActivities, setWeeklyTotalActivities] = useState(0);
  const [weeklyTotalModules, setWeeklyTotalModules] = useState(0);
  const [weeklyTotalProblems, setWeeklyTotalProblems] = useState(0);
  const [weeklyDailyAvg, setWeeklyDailyAvg] = useState(0);
  const [weeklyGoalPct, setWeeklyGoalPct] = useState(0);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    certificatesCount: 0,
    applicationsCount: 0,
    activeApplicationsCount: 0,
    submissionsCount: 0,
    totalProblemsCount: 0,
    streakCount: 0,
    submissionsTodayCount: 0,
    codingXp: 0,
    codingXpToday: 0,
  });

  // Redirect non-student roles to their dedicated dashboards
  useEffect(() => {
    if (user?.role && roleDashboardPaths[user.role]) {
      router.replace(roleDashboardPaths[user.role]);
    }
  }, [user?.role, router]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch courses details
        const res = await fetch(`/api/courses?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load courses');
        const data = await res.json();
        
        // Fetch profile details
        const meRes = await fetch(`/api/users/me?t=${Date.now()}`, { cache: 'no-store' });
        if (!meRes.ok) throw new Error('Failed to load profile details');
        const meData = await meRes.json();
        
        const courseIds = meData.enrolledCourseIds || [];
        setRecentAiFeedback(meData.recentAiFeedback || null);
        const submissionsCount = meData.submissionsCount || 0;
        const totalProblemsCount = meData.totalProblemsCount || 0;
        const submissionsTodayCount = meData.submissionsTodayCount || 0;
        const codingXp = meData.codingXp || 0;
        const codingXpToday = meData.codingXpToday || 0;
        const streakCount = meData.streakCount || 0;
        if (meData.heatmapCells) {
          setDynamicHeatmap(meData.heatmapCells);
        }
        if (meData.weeklyActivity) {
          setWeeklyActivity(meData.weeklyActivity);
        }
        setWeeklyTotalActivities(meData.weeklyTotalActivities || 0);
        setWeeklyTotalModules(meData.weeklyTotalModules || 0);
        setWeeklyTotalProblems(meData.weeklyTotalProblems || 0);
        setWeeklyDailyAvg(meData.weeklyDailyAvg || 0);
        setWeeklyGoalPct(meData.weeklyGoalPct || 0);
        setModulesCompletedToday(meData.modulesCompletedToday || 0);
        
        // Match course IDs to full courses details
        const fullEnrolled = data.courses.filter((c: any) => courseIds.includes(c.id));
        
        // Fetch progress for each course
        const coursesWithProgress = await Promise.all(
          fullEnrolled.map(async (course: any) => {
            const progressRes = await fetch(`/api/courses/${course.id}/progress?t=${Date.now()}`, { cache: 'no-store' });
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              return {
                ...course,
                progress: progressData.progressPct || 0,
              };
            }
            return { ...course, progress: 0 };
          })
        );

        // Sort courses so that active learning courses (progress > 0) come first
        const sortedCourses = [...coursesWithProgress].sort((a: any, b: any) => b.progress - a.progress);

        setEnrolledCourses(sortedCourses);
        
        const completed = sortedCourses.filter((c: any) => c.progress === 100).length;
        setStats({
          enrolledCount: courseIds.length,
          completedCount: completed,
          certificatesCount: completed,
          applicationsCount: 0,
          activeApplicationsCount: 0,
          submissionsCount,
          totalProblemsCount,
          streakCount,
          submissionsTodayCount,
          codingXp,
          codingXpToday,
        });

        // Load details for the first sorted course to dynamically get the active lesson title
        if (sortedCourses.length > 0) {
          const firstCourse = sortedCourses[0];
          const detailRes = await fetch(`/api/courses/${firstCourse.id}?t=${Date.now()}`, { cache: 'no-store' });
          const progressRes = await fetch(`/api/courses/${firstCourse.id}/progress?t=${Date.now()}`, { cache: 'no-store' });
          
          if (detailRes.ok && progressRes.ok) {
            const detailData = await detailRes.json();
            const progressData = await progressRes.json();
            const courseDetails = detailData;
            const completedSteps = progressData.completedSteps || [];
            
            let activeLesson = null;
            let activeLessonFull = null;
            let activeModule = null;
            if (courseDetails && courseDetails.modules) {
              outerLoop: for (let m = 0; m < courseDetails.modules.length; m++) {
                const mod = courseDetails.modules[m];
                if (mod.lessons) {
                  for (let l = 0; l < mod.lessons.length; l++) {
                    const les = mod.lessons[l];
                    if (les.steps) {
                      const isAnyStepIncomplete = les.steps.some((step: any) => !completedSteps.includes(step.id));
                      if (isAnyStepIncomplete) {
                        activeLesson = les.title;
                        activeLessonFull = `Lesson ${m + 1}.${l + 1}: ${les.title}`;
                        activeModule = mod.title;
                        break outerLoop;
                      }
                    }
                  }
                }
              }
            }
            if (activeLessonFull) {
              setCurrentLessonTitle(activeLessonFull);
            } else if (activeLesson) {
              setCurrentLessonTitle(activeLesson);
            } else if (courseDetails && courseDetails.modules && courseDetails.modules.length > 0) {
              const lastMod = courseDetails.modules[courseDetails.modules.length - 1];
              if (lastMod && lastMod.lessons && lastMod.lessons.length > 0) {
                const lastLes = lastMod.lessons[lastMod.lessons.length - 1];
                setCurrentLessonTitle(`Lesson ${courseDetails.modules.length}.${lastMod.lessons.length}: ${lastLes.title}`);
                activeModule = lastMod.title;
              }
            }
            if (activeModule) {
              setCurrentModuleTitle(activeModule);
            }
          }
        }

        // Load available jobs
        try {
          const jobsRes = await fetch(`/api/jobs?t=${Date.now()}`, { cache: 'no-store' });
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            const activeJobs = (jobsData.data || jobsData || []).filter((j: any) => j.status === 'active');
            if (activeJobs.length > 0) {
              setAvailableJobs(activeJobs.slice(0, 3));
            } else {
              setAvailableJobs(fallbackJobs);
            }
          } else {
            setAvailableJobs(fallbackJobs);
          }
        } catch (jobErr) {
          console.error('Failed to load available jobs:', jobErr);
          setAvailableJobs(fallbackJobs);
        }

        // Load recent community posts
        try {
          const postsRes = await fetch(`/api/community/posts?t=${Date.now()}`, { cache: 'no-store' });
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setRecentPosts(Array.isArray(postsData) ? postsData.slice(0, 2) : []);
          }
        } catch (postErr) {
          console.error('Failed to load recent posts:', postErr);
        }

      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

  // Loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '50%', border: '3px solid rgba(0,0,0,0.03)',
          borderTop: '3px solid var(--accent-primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.02em' }}>compiling_workspace_dashboard...</p>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
  };

  // Heatmap values representation (7 rows x 15 columns = 105 cells)
  const heatmapCells = (() => {
    const today = new Date();
    const todayWeekday = today.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
    const futurePadding = 6 - todayWeekday;
    const activeCellsCount = 105 - futurePadding;
    const cells: { date: string; problemsCount: number; modulesCount: number; shade: number; isFuture?: boolean }[] = [];
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    for (let i = activeCellsCount - 1; i >= 0; i--) {
      const cellDate = new Date(today.getTime() - i * MS_PER_DAY);
      cells.push({
        date: cellDate.toISOString().slice(0, 10),
        problemsCount: 0,
        modulesCount: 0,
        shade: 0
      });
    }

    for (let i = 1; i <= futurePadding; i++) {
      const futureDate = new Date(today.getTime() + i * MS_PER_DAY);
      cells.push({
        date: futureDate.toISOString().slice(0, 10),
        problemsCount: 0,
        modulesCount: 0,
        shade: 0,
        isFuture: true
      });
    }
    return cells;
  })();

  return (
    <motion.div 
      className={styles.dashboardContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* MAIN TOP GRID */}
      <div className={styles.topGrid}>
        {/* LEFT COLUMN */}
        <div className={styles.leftColumn}>
          {/* Welcome Card */}
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeTitleInfo}>
                <h1 className={styles.welcomeTitle}>
                  Good Evening, {user?.name?.split(' ')[0] || 'Atharva'} 👋
                </h1>
                <span className={styles.welcomeSubtitle}>Let's continue your learning journey.</span>
              </div>
              
            </div>

            {/* Hero middle statistics */}
            <div className={styles.heroMiddleGrid}>
              <div className={styles.heroMetaItem}>
                <span className={styles.heroMetaLabel}>Current Course</span>
                <span className={styles.heroMetaValue}>{enrolledCourses[0]?.title || 'Python Programming'}</span>
                <span className={styles.heroMetaSub}>Current Module: {currentModuleTitle}</span>
              </div>
              <div className={styles.heroMetaItem}>
                <span className={styles.heroMetaLabel}>Current Lesson</span>
                <span className={styles.heroMetaValue}>{currentLessonTitle}</span>
                <span className={styles.heroMetaSub}>{enrolledCourses[0]?.progress || 2}% Completed</span>
              </div>
              <div className={styles.heroMetaItem}>
                <span className={styles.heroMetaLabel}>Progress Metrics</span>
                <span className={styles.heroMetaValue}>84% On Track</span>
                <span className={styles.heroMetaSub}>{stats.submissionsCount} problems solved</span>
              </div>
            </div>
          </div>

          {/* Stats KPI Grid */}
          <div className={styles.statsGrid}>
            {/* Problems Solved */}
            <Link href="/dashboard/coding-lab" className={styles.statCard}>
              <div className={styles.statIconContainerBlack}>
                <Code size={16} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}>
                  {stats.submissionsCount}
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '4px' }}>
                    / {stats.totalProblemsCount}
                  </span>
                </span>
                <span className={styles.statTitle}>Problems Solved</span>
                <span className={styles.statSubtext}>+{stats.submissionsTodayCount} solved today</span>
              </div>
            </Link>

            {/* Coding XP */}
            <div className={styles.statCard}>
              <div className={styles.statIconContainer}>
                <Award size={16} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}>
                  <Counter value={stats.codingXp} />
                  <span style={{ fontSize: '11px', fontWeight: 500, marginLeft: '4px' }}>XP</span>
                </span>
                <span className={styles.statTitle}>Coding XP</span>
                <span className={styles.statSubtext}>+{stats.codingXpToday} XP earned today</span>
              </div>
            </div>

            {/* Active Course */}
            <Link href="/dashboard/courses" className={styles.statCard}>
              <div className={styles.statIconContainer}>
                <BookOpen size={16} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}><Counter value={stats.enrolledCount} /></span>
                <span className={styles.statTitle}>Active Course</span>
                <span className={styles.statSubtext}>Keep it up!</span>
              </div>
            </Link>

            {/* Learning Streak */}
            <div className={styles.statCard}>
              <div className={styles.statIconContainer}>
                <Flame size={16} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statNum}><Counter value={stats.streakCount} /> <span style={{ fontSize: '11px', fontWeight: 500 }}>Days</span></span>
                <span className={styles.statTitle}>Learning Streak</span>
                <span className={styles.statSubtext}>{stats.streakCount > 0 ? "Great consistency!" : "Start coding to build streak"}</span>
              </div>
            </div>
          </div>



          {/* Recent AI Feedback (Overhauled Socratic Layout) */}
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> Recent AI Feedback
              </h2>
              <Link href="/dashboard/my-learning" className={styles.viewAllLink}>
                View All <ArrowRight size={13} />
              </Link>
            </div>
            
            <div className={styles.aiFeedbackContainer}>
              {/* Progress Summary Card */}
              <div className={styles.aiProgressCard}>
                <div className={styles.aiHeader}>
                  <div className={styles.terminalIconBox}>
                    <Terminal size={16} />
                  </div>
                  <div className={styles.aiHeaderText}>
                    <h4 className={styles.aiHeaderTitle}>
                      {recentAiFeedback?.title || 'Your Socratic Learning Progress'}
                    </h4>
                    <p className={styles.aiHeaderSubtitle}>Interactive optimization feedback</p>
                  </div>
                </div>
                <p className={styles.aiProgressBody}>
                  {recentAiFeedback?.summary || "You are currently working on the 'Hello World' assignment, focusing on returning the correct string from a function, and you have shown progress in defining functions and using return statements. Keep practicing and pay close attention to details such as capitalization and punctuation to improve your code."}
                </p>
              </div>

              {/* Feedback list items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentAiFeedback ? (
                  <>
                    {/* Render dynamic strengths */}
                    {(recentAiFeedback.strengths || []).map((text: string, i: number) => (
                      <div key={`strength-${i}`} className={`${styles.feedbackItemBordered} ${styles.borderGreen}`}>
                        <span className={`${styles.itemIcon} ${styles.iconGreen}`}>✓</span>
                        <p className={styles.itemText}>
                          <strong>Strength:</strong> {text}
                        </p>
                      </div>
                    ))}

                    {/* Render dynamic improvements */}
                    {(recentAiFeedback.improvements || []).map((text: string, i: number) => (
                      <div key={`improvement-${i}`} className={`${styles.feedbackItemBordered} ${styles.borderOrange}`}>
                        <span className={`${styles.itemIcon} ${styles.iconOrange}`}>⚡</span>
                        <p className={styles.itemText}>
                          <strong>Tip:</strong> {text}
                        </p>
                      </div>
                    ))}

                    {/* Render dynamic styleFeedback */}
                    {recentAiFeedback.styleFeedback && (
                      <div className={`${styles.feedbackItemBordered} ${styles.borderBlue}`}>
                        <span className={`${styles.itemIcon} ${styles.iconBlue}`}>ℹ</span>
                        <p className={styles.itemText}>
                          <strong>Advice:</strong> {recentAiFeedback.styleFeedback}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Fallback mockup values matching the user screenshot exactly */}
                    <div className={`${styles.feedbackItemBordered} ${styles.borderGreen}`}>
                      <span className={`${styles.itemIcon} ${styles.iconGreen}`}>✓</span>
                      <p className={styles.itemText}>
                        <strong>Strength:</strong> Correct function definition
                      </p>
                    </div>

                    <div className={`${styles.feedbackItemBordered} ${styles.borderGreen}`}>
                      <span className={`${styles.itemIcon} ${styles.iconGreen}`}>✓</span>
                      <p className={styles.itemText}>
                        <strong>Strength:</strong> Proper use of return statement
                      </p>
                    </div>

                    <div className={`${styles.feedbackItemBordered} ${styles.borderOrange}`}>
                      <span className={`${styles.itemIcon} ${styles.iconOrange}`}>⚡</span>
                      <p className={styles.itemText}>
                        <strong>Tip:</strong> String formatting and capitalization
                      </p>
                    </div>

                    <div className={`${styles.feedbackItemBordered} ${styles.borderOrange}`}>
                      <span className={`${styles.itemIcon} ${styles.iconOrange}`}>⚡</span>
                      <p className={styles.itemText}>
                        <strong>Tip:</strong> Attention to punctuation and special characters in output
                      </p>
                    </div>

                    <div className={`${styles.feedbackItemBordered} ${styles.borderBlue}`}>
                      <span className={`${styles.itemIcon} ${styles.iconBlue}`}>ℹ</span>
                      <p className={styles.itemText}>
                        <strong>Advice:</strong> Pay close attention to the details of the expected output, including capitalization, punctuation, and special characters, and review basic string manipulation and function return types in your programming language of choice.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR WIDGETS) */}
        <div className={styles.sideStack}>
          {/* Heatmap & Community Side-by-Side Wrapper */}
          <div className={styles.sideStackRow}>
            {/* Learning Streak Heatmap Widget */}
            <div className={styles.progressCard}>
              <div className={styles.progressHeader} style={{ marginBottom: '16px' }}>
                <div>
                  <p className={styles.progressTitle}>Learning streak</p>
                  <span className={styles.progressDuration}>
                    Today: {modulesCompletedToday} modules • {stats.submissionsTodayCount} code solved
                  </span>
                </div>
                <span className={styles.streakValueBadge} style={{ alignSelf: 'flex-start' }}>{stats.streakCount} Day Streak 🔥</span>
              </div>

              {/* Heatmap Section */}
              <div className={styles.heatmapContainer}>
                <div className={styles.heatmapMain}>
                  {/* Weekday labels on the left */}
                  <div className={styles.weekdayLabels}>
                    <span></span>
                    <span>Mon</span>
                    <span></span>
                    <span>Wed</span>
                    <span></span>
                    <span>Fri</span>
                    <span></span>
                  </div>

                  {/* Heatmap Grid */}
                  <div className={styles.heatmapGrid}>
                    {(dynamicHeatmap.length > 0 ? dynamicHeatmap : heatmapCells).map((cell, idx) => (
                      <motion.div
                        key={idx}
                        className={`${styles.heatmapCell} ${styles[`heatmapCell${cell.shade}`]}`}
                        style={cell.isFuture ? { visibility: 'hidden' } : {}}
                        title={cell.isFuture ? undefined : `${cell.modulesCount} modules and ${cell.problemsCount} code solved on ${new Date(cell.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.005 }}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.heatmapLegend}>
                  <span>Less</span>
                  <div className={styles.heatmapLegendColors}>
                    <div className={`${styles.heatmapCell} ${styles.heatmapCell0}`} />
                    <div className={`${styles.heatmapCell} ${styles.heatmapCell1}`} />
                    <div className={`${styles.heatmapCell} ${styles.heatmapCell2}`} />
                    <div className={`${styles.heatmapCell} ${styles.heatmapCell3}`} />
                    <div className={`${styles.heatmapCell} ${styles.heatmapCell4}`} />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Community Mini Card */}
            <div className={styles.communityMiniCard}>
              <div className={styles.progressHeader} style={{ marginBottom: '16px' }}>
                <div>
                  <p className={styles.progressTitle}>Community Hub</p>
                  <span className={styles.progressDuration}>Discussions & updates</span>
                </div>
                <Link href="/dashboard/community" className={styles.communityHubLink}>
                  Go to Hub <ArrowRight size={10} style={{ marginLeft: '2px' }} />
                </Link>
              </div>

              <div className={styles.communityFeedList}>
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => {
                    const lines = post.content.split('\n');
                    const title = lines[0] || '';
                    const imageRegex = /!\[.*?\]\((data:image\/.*?)\)/;
                    const hasImage = imageRegex.test(post.content);
                    const cleanTitle = title.replace(imageRegex, '').trim();
                    const displayedTitle = cleanTitle.length > 50 ? `${cleanTitle.substring(0, 50)}...` : cleanTitle;

                    return (
                      <div key={post.id} className={styles.communityFeedItem}>
                        <div className={styles.postAuthorRow}>
                          <span className={styles.authorAvatar}>👤</span>
                          <span className={styles.authorName}>{post.author ? `${post.author.firstName ?? ''} ${post.author.lastName ?? ''}`.trim() || post.author.username || 'Student' : 'Student'}</span>
                        </div>
                        <p className={styles.postSnippet}>
                          {displayedTitle}
                          {hasImage && (
                            <span style={{ 
                              color: 'var(--text-tertiary)', 
                              fontSize: '10px', 
                              fontWeight: 600,
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '2px', 
                              background: 'rgba(0,0,0,0.03)', 
                              padding: '1px 6px', 
                              borderRadius: '4px', 
                              marginLeft: '6px' 
                            }}>
                              📷 Image
                            </span>
                          )}
                        </p>
                        <div className={styles.postFooterMeta}>
                          <span>{post.likesCount || 0} likes</span>
                          <span style={{ margin: '0 4px' }}>•</span>
                          <span>{post.commentsCount || 0} replies</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.communityEmptyState}>
                    No discussions yet. Start one!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Widget 3: Todo List */}
          <div className={styles.todoCard}>
            <div className={styles.todoHeader}>
              <p className={styles.todoTitle}>Todo List</p>
              <button className={styles.addTaskBtn} onClick={() => setIsAddingTask(prev => !prev)}>
                <Plus size={11} /> Add Task
              </button>
            </div>

            {isAddingTask && (
              <form onSubmit={handleAddTaskSubmit} className={styles.todoInputRow}>
                <input
                  type="text"
                  placeholder="Type a task and press Enter..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className={styles.todoInput}
                  autoFocus
                />
              </form>
            )}
            
            <div className={styles.todoList}>
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={styles.todoItem} 
                >
                  {editingTaskId === todo.id ? (
                    <form 
                      onSubmit={(e) => handleSaveEdit(e, todo.id)} 
                      className={styles.todoEditForm}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        className={styles.todoEditInput}
                        autoFocus
                        onBlur={(e) => handleSaveEdit(e, todo.id)}
                      />
                    </form>
                  ) : (
                    <>
                      <div className={styles.todoLeft} onClick={() => toggleTodo(todo.id)}>
                        <div className={`${styles.todoCheckbox} ${todo.completed ? styles.todoCheckboxCompleted : ''}`}>
                          {todo.completed && <Check size={9} strokeWidth={3} />}
                        </div>
                        <span className={`${styles.todoText} ${todo.completed ? styles.todoTextCompleted : ''}`}>
                          {todo.text}
                        </span>
                      </div>

                      <div className={styles.todoRight}>
                        <button 
                          className={styles.todoActionBtn} 
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(todo.id, todo.text);
                          }}
                          aria-label="Edit task"
                        >
                          <Pencil size={11} />
                        </button>
                        <button 
                          className={styles.todoActionBtn} 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTodo(todo.id);
                          }}
                          aria-label="Delete task"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.todoProgress}>
              Progress: {completedTodosCount} of {todos.length} tasks completed ({Math.round((completedTodosCount / todos.length) * 100)}%)
            </div>
          </div>

          {/* Widget 4: Available Jobs */}
          <div className={styles.jobsCard}>
            <div className={styles.jobsHeader}>
              <p className={styles.jobsTitle}>
                <Briefcase size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Available Jobs
              </p>
            </div>
            
            <div className={styles.jobsList}>
              {availableJobs.map((job) => (
                <Link 
                  href="/dashboard/jobs" 
                  key={job.id} 
                  className={styles.jobItem}
                >
                  <div className={styles.jobLogoBlock}>
                    {job.company.charAt(0)}
                  </div>
                  <div className={styles.jobInfo}>
                    <h5 className={styles.jobItemTitle}>{job.title}</h5>
                    <p className={styles.jobItemMeta}>
                      {job.company} • {job.location}
                    </p>
                    <span className={styles.jobItemSalary}>
                      {job.jobType === 'full_time' ? 'Full-time' : 'Internship'} {job.salaryDisplay ? `• ${job.salaryDisplay}` : ''}
                    </span>
                  </div>
                  <ChevronRight size={14} className={styles.jobChevron} />
                </Link>
              ))}
            </div>

            <div className={styles.jobsFooter}>
              <Link href="/dashboard/jobs" className={styles.jobsFooterLink}>
                Browse All Jobs <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

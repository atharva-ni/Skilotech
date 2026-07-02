'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    certificatesCount: 0,
    applicationsCount: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch real courses list from catalog to extract details
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to load courses');
        const data = await res.json();
        
        // Fetch user progress for all enrolled courses
        const meRes = await fetch('/api/users/me');
        if (!meRes.ok) throw new Error('Failed to load profile details');
        const meData = await meRes.json();
        
        const courseIds = meData.enrolledCourseIds || [];
        
        // Match course IDs to full courses details
        const fullEnrolled = data.courses.filter((c: any) => courseIds.includes(c.id));
        
        // Fetch progress for each course
        const coursesWithProgress = await Promise.all(
          fullEnrolled.map(async (course: any) => {
            const progressRes = await fetch(`/api/courses/${course.id}/progress`);
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

        setEnrolledCourses(coursesWithProgress);
        
        // Calculate statistics
        const completed = coursesWithProgress.filter((c: any) => c.progress === 100).length;
        setStats({
          enrolledCount: courseIds.length,
          completedCount: completed,
          certificatesCount: completed, // 1 certificate per completed course
          applicationsCount: 1, // mock job app
        });

      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%', border: '3px solid var(--border-primary)',
          borderTop: '3px solid var(--accent-primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Learner'}</span> 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Continue your learning journey. You are enrolled in {stats.enrolledCount} courses.
          </p>
        </div>
        <div className={styles.welcomeArt}>📚</div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Enrolled Courses', value: stats.enrolledCount.toString(), icon: '📚', trend: 'Lifetime access' },
          { label: 'Completed', value: stats.completedCount.toString(), icon: '✅', trend: 'Keep it up!' },
          { label: 'Certificates', value: stats.certificatesCount.toString(), icon: '🏆', trend: 'Verified' },
          { label: 'Applications', value: stats.applicationsCount.toString(), icon: '💼', trend: '1 active' },
        ].map((stat, i) => (
          <div key={stat.label} className={`${styles.statCard} animate-fade-in-up stagger-${i + 1}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statTrend}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <section className={styles.section}>
        <div className="flex-between">
          <h2 className="section-title">Continue Learning</h2>
          <Link href="/dashboard/my-learning" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {enrolledCourses.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3>Not enrolled in any courses yet</h3>
            <p style={{ margin: '8px 0 20px 0' }}>Explore our catalog to start building new skills.</p>
            <Link href="/dashboard/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className={styles.courseGrid}>
            {enrolledCourses.map((course) => (
              <Link href={`/dashboard/courses/${course.id}`} key={course.id} className={styles.courseCard}>
                <div className={styles.courseThumbnail}>
                  <span className={styles.courseEmoji}>
                    {course.category?.icon || '🌐'}
                  </span>
                </div>
                <div className={styles.courseInfo}>
                  <span className={styles.courseCategory}>{course.category?.name || 'Technology'}</span>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseInstructor}>by {course.instructor?.firstName} {course.instructor?.lastName}</p>
                  <div className={styles.progressSection}>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className={styles.progressLabel}>{course.progress}% complete</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent AI Feedback Preview */}
      <section className={styles.section}>
        <h2 className="section-title">Recent AI Feedback</h2>
        <div className={styles.aiFeedbackCard}>
          <div className={styles.aiHeader}>
            <span className={styles.aiIcon}>🤖</span>
            <div>
              <h4>REST API Assignment — Code Review</h4>
              <p className="text-muted">Interactive optimization feedback</p>
            </div>
            <span className={`badge badge-success`}>87/100</span>
          </div>
          <div className={styles.aiBody}>
            <p>✅ Good use of async/await patterns and error handling middleware.</p>
            <p>⚡ Consider using connection pooling for database queries to improve performance by ~40%.</p>
            <p>🔒 Add input validation with a library like Zod to prevent SQL injection vectors.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

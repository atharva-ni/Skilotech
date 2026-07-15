'use client';

import React, { useState, useEffect } from 'react';
import CourseCard from '@/components/ui/CourseCard';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function MyLearning() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyLearningData() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch all courses catalog
        const coursesRes = await fetch('/api/courses');
        if (!coursesRes.ok) throw new Error('Failed to load courses catalog');
        const catalogData = await coursesRes.json();

        // Fetch user me details
        const meRes = await fetch('/api/users/me');
        if (!meRes.ok) throw new Error('Failed to load profile');
        const meData = await meRes.json();

        const courseIds = meData.enrolledCourseIds || [];

        // Match enrolled courses
        const fullEnrolled = catalogData.courses.filter((c: any) => courseIds.includes(c.id));

        // Fetch progress for each matching course
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
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to load enrolled courses');
      } finally {
        setLoading(false);
      }
    }

    loadMyLearningData();
  }, [user]);

  const filteredCourses = enrolledCourses.filter((c) => {
    if (filter === 'in-progress') return c.progress > 0 && c.progress < 100;
    if (filter === 'completed') return c.progress === 100;
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Learning</h1>
        <p className="page-subtitle">Track your progress and continue where you left off.</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: 'var(--spacing-xl)',
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: '12px'
      }}>
        {[
          { label: 'All Enrolled', value: 'all' },
          { label: 'In Progress', value: 'in-progress' },
          { label: 'Completed', value: 'completed' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as 'all' | 'in-progress' | 'completed')}
            className={`btn ${filter === tab.value ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 16px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{
            width: '40px', height: '40px', margin: '0 auto 16px auto',
            borderRadius: '50%', border: '3px solid var(--border-primary)',
            borderTop: '3px solid var(--accent-primary)',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700 }}>No courses found</h3>
          <p style={{ marginTop: '8px', fontSize: 'var(--font-size-sm)' }}>
            {filter === 'completed'
              ? "You haven't completed any courses yet. Keep learning!"
              : "You are not enrolled in any courses. Browse catalog to start."}
          </p>
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={`${course.instructor?.firstName ?? ''} ${course.instructor?.lastName ?? ''}`.trim() || 'Instructor'}
              category={course.category?.name || 'Technology'}
              price={course.price}
              rating={Number(course.ratingAvg || 0)}
              studentsEnrolled={course.studentsEnrolled || 0}
              duration={`${Math.round(course.durationHours || 0)} hours`}
              progress={course.progress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

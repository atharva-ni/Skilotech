'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetail({ params }: PageProps) {
  const { id } = use(params);
  const { user, refreshProfile } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${id}`);
      if (!res.ok) {
        throw new Error('Course not found');
      }
      const data = await res.json();
      setCourse(data);
      setIsEnrolled(data.isEnrolled);
      setProgressPct(data.progressPct);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id, user]);

  const handlePaymentSuccess = async (invoiceId: string) => {
    toast.success('Enrollment confirmed!');
    await refreshProfile();
    await fetchCourseDetails();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%', border: '3px solid var(--border-primary)',
          borderTop: '3px solid var(--accent-primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 16px' }}>
        <h2>Course Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0', color: 'var(--text-secondary)' }}>
          The course you are looking for does not exist or has been removed.
        </p>
        <Link href="/dashboard/courses" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--spacing-xl)' }}>
      {/* Course Main Details */}
      <div>
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Link href="/dashboard/courses" style={{ color: 'var(--accent-primary-hover)', display: 'inline-block', marginBottom: 'var(--spacing-base)' }}>
            ← Back to Catalog
          </Link>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Badge variant="primary">{course.category?.name || 'Technology'}</Badge>
            <Badge variant="info">{course.level.toUpperCase()}</Badge>
          </div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{course.title}</h1>
          <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
            {course.description}
          </p>
        </div>

        {/* Rating and Info */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          padding: 'var(--spacing-base) 0',
          borderTop: '1px solid var(--border-primary)',
          borderBottom: '1px solid var(--border-primary)',
          marginBottom: 'var(--spacing-xl)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)'
        }}>
          <span>⭐ <strong style={{ color: 'var(--warning)' }}>{Number(course.ratingAvg)}</strong>/5 rating</span>
          <span>👥 {course.studentsEnrolled.toLocaleString()} students enrolled</span>
          <span>⏱️ {Math.round(course.durationHours || 0)} hours total duration</span>
          <span>📁 {course.modules?.length || 0} modules</span>
        </div>

        {/* Instructor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            {course.instructor?.avatar || '👩‍🏫'}
          </div>
          <div>
            <h4 style={{ fontWeight: 600 }}>{course.instructor?.name || 'Instructor'}</h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Lead Instructor</p>
          </div>
        </div>

        {/* Curriculum Section */}
        <div>
          <h2 className="section-title">Course Curriculum</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            {course.modules?.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No modules added to this course curriculum yet.</p>
            ) : (
              course.modules?.map((mod: any, mIdx: number) => (
                <div key={mod.id} className="card" style={{ padding: 'var(--spacing-base)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                    Module {mIdx + 1}: {mod.title}
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {mod.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mod.lessons?.map((lesson: any, lIdx: number) => (
                      <div key={lesson.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-secondary)',
                        padding: '10px',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{isEnrolled || lesson.isFree ? '🔓' : '🔒'}</span>
                          <span>Lesson {mIdx + 1}.{lIdx + 1}: {lesson.title}</span>
                        </div>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                          {lesson.durationMins} mins • {lesson.steps?.length || 0} steps
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pricing / Enrollment Side Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {isEnrolled ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.25rem' }}>✅</span>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>You are enrolled!</h3>
                </div>
                <ProgressBar progress={progressPct} showLabel />
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                  {progressPct}% complete • Keep it up!
                </div>
              </div>
              <Link href={`/dashboard/courses/${course.id}/learn`} style={{ width: '100%' }}>
                <Button style={{ width: '100%' }}>Resume Learning ▶</Button>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-primary)', paddingTop: '12px' }}>
                <span>✓ Lifetime access to all content</span>
                <span>✓ Step-wise guided learning</span>
                <span>✓ AI-powered code reviews</span>
                <span>✓ Certificate of Completion</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Course Price</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0' }}>
                  ₹{(course.price / 100).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>✓ 30-day money-back guarantee</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                <span>✓ Lifetime access to course content</span>
                <span>✓ Interactive coding sandbox lab</span>
                <span>✓ Step-by-step progress tracking</span>
                <span>✓ Certificate of Completion</span>
              </div>
              <RazorpayCheckout
                courseId={course.id}
                courseTitle={course.title}
                coursePrice={course.price}
                courseDescription={course.description}
                onSuccess={handlePaymentSuccess}
              />
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span>🔒</span> Secured by Razorpay
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

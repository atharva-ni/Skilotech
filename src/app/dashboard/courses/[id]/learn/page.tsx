'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StepWiseLearningPage({ params }: PageProps) {
  const { id: courseId } = use(params);
  const { user } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progressPct, setProgressPct] = useState(0);
  
  // Navigation states
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Flattened steps list for next/prev calculations
  const [flatSteps, setFlatSteps] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch course details with modules, lessons, steps
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error('Course not found');
      const data = await res.json();
      
      if (!data.isEnrolled) {
        toast.error('You must enroll in this course first!');
        window.location.href = `/dashboard/courses/${courseId}`;
        return;
      }
      
      setCourse(data);
      setCompletedSteps(data.completedSteps || []);
      setProgressPct(data.progressPct || 0);

      // 2. Flatten steps to create sequential progression lists
      const stepsList: any[] = [];
      data.modules?.forEach((module: any) => {
        module.lessons?.forEach((lesson: any) => {
          lesson.steps?.forEach((step: any) => {
            stepsList.push({
              ...step,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              moduleId: module.id,
            });
          });
        });
      });
      setFlatSteps(stepsList);

      // 3. Set default active step (first uncompleted step, or first step)
      if (stepsList.length > 0) {
        const firstUncompleted = stepsList.find(s => !data.completedSteps?.includes(s.id));
        setActiveStepId(firstUncompleted ? firstUncompleted.id : stepsList[0].id);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load learning environment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, user]);

  const activeStepIndex = flatSteps.findIndex((s) => s.id === activeStepId);
  const activeStep = flatSteps[activeStepIndex];

  // Helper to check if a step is locked
  const isStepLocked = (stepIndex: number) => {
    // Under strict sequential logic: step index is locked if any step before it is not completed
    for (let i = 0; i < stepIndex; i++) {
      if (!completedSteps.includes(flatSteps[i].id)) {
        return true;
      }
    }
    return false;
  };

  const handleMarkComplete = async () => {
    if (!activeStepId) return;

    try {
      toast.loading('Saving progress...');
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: activeStepId,
          timeSpentSecs: 30, // Mock time spent reading/watching
        }),
      });

      const data = await res.json();
      toast.dismiss();

      if (res.ok) {
        setCompletedSteps(data.completedSteps || []);
        setProgressPct(data.progressPct || 0);
        toast.success('Step completed!');

        // Auto advance to next step if exists and is not locked
        const nextIndex = activeStepIndex + 1;
        if (nextIndex < flatSteps.length) {
          setActiveStepId(flatSteps[nextIndex].id);
        } else {
          toast.success('Congratulations! You completed the course! 🎉');
        }
      } else {
        throw new Error(data.error || 'Failed to complete step');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%', border: '3px solid var(--border-primary)',
          borderTop: '3px solid var(--accent-primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading learning environment...</p>
      </div>
    );
  }

  if (!course || flatSteps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 16px' }}>
        <h2>Learning Environment Empty</h2>
        <p style={{ margin: '1rem 0 2rem 0', color: 'var(--text-secondary)' }}>No lessons are available for this course yet.</p>
        <Link href={`/dashboard/courses/${courseId}`} className="btn btn-primary">Back to course detail</Link>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: sidebarCollapsed ? '70px 1fr' : '320px 1fr',
      minHeight: 'calc(100vh - var(--header-height))',
      transition: 'grid-template-columns 0.3s ease',
      borderTop: '1px solid var(--border-primary)',
    }}>
      {/* Left Sidebar Curriculum Navigation */}
      <aside style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {!sidebarCollapsed && <span style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Curriculum</span>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div style={{ flex: 1, padding: sidebarCollapsed ? '8px' : '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {course.modules?.map((mod: any, mIdx: number) => (
            <div key={mod.id} style={{ display: sidebarCollapsed ? 'none' : 'block' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Module {mIdx + 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mod.lessons?.map((lesson: any, lIdx: number) => (
                  <div key={lesson.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {mIdx + 1}.{lIdx + 1} {lesson.title}
                    </div>
                    {/* Lesson Steps */}
                    <div style={{ paddingLeft: '8px', borderLeft: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {lesson.steps?.map((step: any) => {
                        const stepIndex = flatSteps.findIndex((s) => s.id === step.id);
                        const isLocked = isStepLocked(stepIndex);
                        const isCompleted = completedSteps.includes(step.id);
                        const isActive = step.id === activeStepId;

                        return (
                          <button
                            key={step.id}
                            disabled={isLocked}
                            onClick={() => setActiveStepId(step.id)}
                            style={{
                              textAlign: 'left',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                              border: 'none',
                              fontSize: 'var(--font-size-xs)',
                              color: isActive
                                ? 'var(--accent-primary-hover)'
                                : isLocked
                                ? 'var(--text-muted)'
                                : 'var(--text-secondary)',
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              transition: 'all var(--transition-fast)',
                            }}
                          >
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                              {step.stepType === 'intro' ? '📝' : step.stepType === 'text' ? '📖' : step.stepType === 'video' ? '▶️' : '💻'} {step.title}
                            </span>
                            <span>{isCompleted ? '✅' : isLocked ? '🔒' : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Simple icons display for collapsed sidebar */}
          {sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {flatSteps.map((step, idx) => {
                const isActive = step.id === activeStepId;
                const isCompleted = completedSteps.includes(step.id);
                const isLocked = isStepLocked(idx);

                return (
                  <button
                    key={step.id}
                    disabled={isLocked}
                    onClick={() => setActiveStepId(step.id)}
                    title={step.title}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: isActive ? 'rgba(99,102,241,0.15)' : 'var(--bg-glass)',
                      border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                      color: isCompleted ? 'var(--success)' : isLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isCompleted ? '✓' : isLocked ? '🔒' : (step.stepType === 'video' ? '▶' : '•')}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main style={{ padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Course Progress header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-primary)', paddingBottom: '16px', marginBottom: '24px'
        }}>
          <div>
            <Link href={`/dashboard/courses/${courseId}`} style={{ color: 'var(--accent-primary-hover)', fontSize: 'var(--font-size-xs)', display: 'block', marginBottom: '4px' }}>
              ← Return to course dashboard
            </Link>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>{course.title}</h2>
          </div>
          <div style={{ width: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Course Progress</span>
              <span>{progressPct}%</span>
            </div>
            <ProgressBar progress={progressPct} />
          </div>
        </div>

        {/* Step Content Area */}
        {activeStep && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header info */}
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                {activeStep.stepType.toUpperCase()} STEP
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeStep.title}
              </h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Lesson: {activeStep.lessonTitle}
              </p>
            </div>

            {/* Step Body rendering based on StepType */}
            <div style={{
              flex: 1,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              color: 'var(--text-primary)',
              lineHeight: '1.7',
            }}>
              {/* Render Intro/Text content */}
              {(activeStep.stepType === 'intro' || activeStep.stepType === 'text') && (
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--font-size-base)' }}>
                  {activeStep.textContent}
                </div>
              )}

              {/* Render Video content */}
              {activeStep.stepType === 'video' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%', // 16:9 Aspect Ratio
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-secondary)',
                  }}>
                    <iframe
                      src={activeStep.videoUrl?.replace('watch?v=', 'embed/')}
                      title={activeStep.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        border: 'none',
                      }}
                    />
                  </div>
                  {activeStep.textContent && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      {activeStep.textContent}
                    </p>
                  )}
                </div>
              )}

              {/* Render Lab content */}
              {activeStep.stepType === 'lab' && (
                <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '4rem' }}>💻</span>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>In-Browser Coding Practice</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '440px', fontSize: 'var(--font-size-sm)' }}>
                      Apply what you learned in an interactive code sandbox lab with instant evaluation and AI review.
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/coding-lab?stepId=${activeStep.id}`}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: 'var(--font-size-base)' }}
                  >
                    Launch Interactive Lab ➔
                  </Link>
                </div>
              )}
            </div>

            {/* Stepper navigation footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid var(--border-primary)', paddingTop: '20px', marginTop: '24px'
            }}>
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepId(flatSteps[activeStepIndex - 1].id)}
                className="btn btn-secondary"
                style={{ cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                ← Previous Step
              </button>

              {completedSteps.includes(activeStep.id) ? (
                <button
                  disabled={activeStepIndex === flatSteps.length - 1}
                  onClick={() => setActiveStepId(flatSteps[activeStepIndex + 1].id)}
                  className="btn btn-primary"
                  style={{ cursor: activeStepIndex === flatSteps.length - 1 ? 'not-allowed' : 'pointer' }}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  className="btn btn-primary"
                  style={{ background: 'var(--success)', color: '#fff', boxShadow: 'none' }}
                >
                  ✓ Mark Complete & Next
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

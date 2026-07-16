'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, FileText, Play, Code, Lock, CheckCircle2, ChevronRight, ChevronDown, 
  ArrowLeft, ArrowRight, Folder, Terminal, Sparkles, ChevronLeft, Star,
  Volume2, Pause, Square, ClipboardList
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StepWiseLearningPage({ params }: PageProps) {
  const { id: courseId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progressPct, setProgressPct] = useState(0);
  
  // Navigation states
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Paginated text content page state
  const [currentTextPage, setCurrentTextPage] = useState(0);

  // Main scroll viewport ref
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Collapsible tree state for student progress navigation
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set<string>();
      if (!prev.has(modId)) {
        next.add(modId);
      }
      return next;
    });
  };

  const toggleLesson = (lesId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lesId)) next.delete(lesId);
      else next.add(lesId);
      return next;
    });
  };

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
        const activeStep = firstUncompleted ? firstUncompleted : stepsList[0];
        setActiveStepId(activeStep.id);
        
        // Auto-expand current active module and lesson on load
        setExpandedModules(new Set([activeStep.moduleId]));
        setExpandedLessons(new Set([activeStep.lessonId]));
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load learning environment');
    } finally {
      setLoading(false);
    }
  };

  // Keep active step's module and lesson expanded during navigation
  useEffect(() => {
    if (activeStepId && flatSteps.length > 0) {
      const activeStep = flatSteps.find(s => s.id === activeStepId);
      if (activeStep) {
        setExpandedModules(new Set([activeStep.moduleId]));
        setExpandedLessons(prev => {
          if (prev.has(activeStep.lessonId)) return prev;
          const next = new Set(prev);
          next.add(activeStep.lessonId);
          return next;
        });
      }
    }
  }, [activeStepId, flatSteps]);

  // Reset text page index and scroll to top when changing active steps
  useEffect(() => {
    setCurrentTextPage(0);
    handleScrollToTop();
  }, [activeStepId]);

  // Scroll to top when changing text pages
  useEffect(() => {
    handleScrollToTop();
  }, [currentTextPage]);

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

  // Completion & Review states
  const [showCompletion, setShowCompletion] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    try {
      setSubmittingReview(true);
      toast.loading('Submitting review...');

      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText }),
      });

      const data = await res.json();
      toast.dismiss();

      if (res.ok) {
        toast.success('Thank you for your feedback! 🎉');
        router.push(`/dashboard/courses/${courseId}`);
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error submitting feedback');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Text-To-Speech (TTS) States and Effects
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  // Stop reading when changing steps or text pages
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, [activeStepId, currentTextPage]);

  // Cancel voice reading when leaving/unmounting component
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startSpeaking = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown headings, lists, links, code blocks
    const cleanText = textToSpeak
      .replace(/```[\s\S]*?```/g, '') // Strip complete code blocks
      .replace(/[#*`>_\-]/g, ' ')     // Strip markdown characters
      .replace(/\[.*?\]\(.*?\)/g, ' ') // Strip markdown links
      .replace(/\s+/g, ' ')           // Normalize spaces
      .trim();

    if (!cleanText) {
      toast.error('No readable text found on this page.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      // In some browsers, calling cancel triggers an error boundary, which we can safely ignore
      if (e.error !== 'interrupted') {
        console.error('SpeechSynthesis error:', e);
      }
      setIsSpeaking(false);
      setIsPaused(false);
    };

    setIsSpeaking(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
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
          setShowCompletion(true);
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

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 16px' }}>
        <h2>Course Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0', color: 'var(--text-secondary)' }}>The requested course could not be loaded.</p>
        <Link href="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
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
        background: '#f9fafb',
        borderRight: '1px solid var(--border-primary)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.01)',
      }}>
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
        }}>
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.75px' }}>
              Curriculum Outline
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid var(--border-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.2s ease',
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div style={{ flex: 1, padding: sidebarCollapsed ? '12px 8px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!sidebarCollapsed && course.modules?.map((mod: any, mIdx: number) => {
            const isModuleExpanded = expandedModules.has(mod.id);
            return (
              <div key={mod.id} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Module Header clickable trigger */}
                <div 
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isModuleExpanded ? '#f3f4f6' : 'transparent',
                    marginBottom: '4px',
                    transition: 'all 0.15s ease',
                    border: '1px solid',
                    borderColor: isModuleExpanded ? '#e5e7eb' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Folder size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {mod.title}
                    </span>
                  </div>
                  {isModuleExpanded ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />}
                </div>

                {/* Lessons list under Module */}
                {isModuleExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', marginBottom: '8px' }}>
                    {mod.lessons?.length === 0 ? (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '4px 12px', fontStyle: 'italic' }}>
                        No lessons inside this module
                      </span>
                    ) : (
                      mod.lessons?.map((les: any) => {
                        const isLessonActive = flatSteps.find(s => s.id === activeStepId)?.lessonId === les.id;
                        const isLessonExpanded = expandedLessons.has(les.id);
                        return (
                          <div key={les.id} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div 
                              onClick={() => toggleLesson(les.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: isLessonActive ? '#eff6ff' : 'transparent',
                                color: isLessonActive ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
                                fontWeight: isLessonActive ? 600 : 500,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                <BookOpen size={12} style={{ color: isLessonActive ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                                <span style={{ fontSize: 'var(--font-size-xs)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {les.title}
                                </span>
                              </div>
                              {isLessonExpanded ? <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
                            </div>

                            {/* Steps (collapsible under Lesson) */}
                            {isLessonExpanded && (
                              <div style={{ paddingLeft: '14px', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px', marginLeft: '14px' }}>
                                {les.steps?.length === 0 ? (
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '2px 8px', fontStyle: 'italic' }}>
                                    No steps available
                                  </span>
                                ) : (
                                  les.steps?.map((stp: any) => {
                                    const isCompleted = completedSteps.includes(stp.id);
                                    const isActive = activeStepId === stp.id;
                                    const idxInFlat = flatSteps.findIndex(s => s.id === stp.id);
                                    const isLocked = isStepLocked(idxInFlat);

                                    // Render custom step type icons
                                    const getStepIcon = () => {
                                      if (isLocked) return <Lock size={12} style={{ color: 'var(--text-muted)' }} />;
                                      if (isCompleted) return <CheckCircle2 size={12} style={{ color: '#10b981' }} />;
                                      switch (stp.stepType) {
                                        case 'intro': return <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />;
                                        case 'text': return <FileText size={12} style={{ color: 'var(--text-secondary)' }} />;
                                        case 'video': return <Play size={12} style={{ fill: 'currentColor', color: 'var(--text-secondary)' }} />;
                                        case 'lab': return <Code size={12} style={{ color: 'var(--text-secondary)' }} />;
                                        case 'assignment': return <ClipboardList size={12} style={{ color: '#ec4899' }} />;
                                        default: return <FileText size={12} />;
                                      }
                                    };

                                    return (
                                      <button
                                        key={stp.id}
                                        disabled={isLocked}
                                        onClick={() => setActiveStepId(stp.id)}
                                        style={{
                                          textAlign: 'left',
                                          padding: '6px 8px',
                                          borderRadius: '6px',
                                          background: isActive 
                                            ? '#ffffff' 
                                            : 'transparent',
                                          border: '1px solid',
                                          borderColor: isActive ? '#e5e7eb' : 'transparent',
                                          fontSize: '11px',
                                          color: isActive
                                            ? 'var(--text-primary)'
                                            : isLocked
                                            ? 'var(--text-muted)'
                                            : 'var(--text-secondary)',
                                          cursor: isLocked ? 'not-allowed' : 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          width: '100%',
                                          transition: 'all 0.15s ease',
                                          fontWeight: isActive ? 600 : 400,
                                          boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                                        }}
                                      >
                                        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                          {getStepIcon()}
                                        </span>
                                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                                          {stp.title}
                                        </span>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Collapsed Sidebar Simple List of Icons */}
          {sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {flatSteps.map((step, idx) => {
                const isActive = step.id === activeStepId;
                const isCompleted = completedSteps.includes(step.id);
                const isLocked = isStepLocked(idx);

                const getStepIcon = () => {
                  if (isLocked) return <Lock size={14} />;
                  if (isCompleted) return <CheckCircle2 size={14} style={{ color: '#10b981' }} />;
                  switch (step.stepType) {
                    case 'intro': return <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />;
                    case 'text': return <FileText size={14} />;
                    case 'video': return <Play size={14} style={{ fill: 'currentColor' }} />;
                    case 'lab': return <Code size={14} />;
                    case 'assignment': return <ClipboardList size={14} style={{ color: '#ec4899' }} />;
                    default: return <FileText size={14} />;
                  }
                };

                return (
                  <button
                    key={step.id}
                    disabled={isLocked}
                    onClick={() => {
                      setActiveStepId(step.id);
                      setExpandedModules(new Set([step.moduleId]));
                      setExpandedLessons(prev => new Set([...prev, step.lessonId]));
                    }}
                    title={step.title}
                    style={{
                      width: '38px', height: '38px', borderRadius: '8px',
                      background: isActive ? '#eff6ff' : '#ffffff',
                      border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-secondary)',
                      color: isActive ? 'var(--accent-primary-hover)' : isCompleted ? '#10b981' : isLocked ? 'var(--text-muted)' : 'var(--text-secondary)',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {getStepIcon()}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main ref={mainContentRef} style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#fcfcfd' }}>
        {/* Course Progress header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px', marginBottom: '20px',
          background: 'transparent',
        }}>
          <div>
            <Link 
              href={`/dashboard/courses/${courseId}`} 
              style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '11px', 
                fontWeight: 600,
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                marginBottom: '8px',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <ArrowLeft size={12} /> Return to Course Dashboard
            </Link>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {course.title}
            </h2>
          </div>
          <div style={{ width: '240px', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Course Progress</span>
              <span style={{ color: 'var(--accent-primary-hover)' }}>{progressPct}%</span>
            </div>
            <ProgressBar progress={progressPct} />
          </div>
        </div>

        {/* Step Content Area */}
        {showCompletion ? (
          <div style={{
            maxWidth: '680px',
            margin: '40px auto',
            padding: '40px',
            background: '#ffffff',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-premium)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            width: '100%',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#10b981',
              fontSize: '2.5rem',
            }}>
              🎉
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Course Completed successfully!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Congratulations! You have completed all the steps in <strong>{course.title}</strong>. 
                We would love to hear your feedback about your learning experience.
              </p>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-primary)' }} />

            {/* Star Rating Selector */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                How would you rate this course?
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hoverRating ?? rating);
                  return (
                    <Star
                      key={star}
                      size={36}
                      style={{
                        cursor: 'pointer',
                        fill: active ? '#f59e0b' : 'none',
                        color: active ? '#f59e0b' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Feedback Comments Textarea */}
            <div style={{ width: '100%', textAlign: 'left' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                Share your feedback (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like? What can be improved?"
                rows={4}
                className="input"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  width: '100%',
                  background: '#10b981',
                  borderColor: '#10b981',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  cursor: submittingReview ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingReview ? 'Submitting Review...' : 'Submit Feedback'}
              </button>
              
              <button
                onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                disabled={submittingReview}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  alignSelf: 'center',
                  marginTop: '4px',
                }}
              >
                Skip & Return to Course Overview
              </button>
            </div>
          </div>
        ) : activeStep ? (() => {
          const textPages = activeStep && (activeStep.stepType === 'intro' || activeStep.stepType === 'text' || activeStep.stepType === 'assignment')
            ? splitTextIntoPages(activeStep.textContent || '')
            : [];

          return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Header info wrapper */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                borderBottom: '1px solid var(--border-secondary)',
                paddingBottom: '20px',
              }}>
                <div>
                  {/* Premium color-coded badges based on step type */}
                  {activeStep.stepType === 'intro' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <Sparkles size={10} /> Intro Step
                    </span>
                  )}
                  {activeStep.stepType === 'text' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <FileText size={10} /> Reading Step
                    </span>
                  )}
                  {activeStep.stepType === 'video' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <Play size={10} style={{ fill: 'currentColor' }} /> Video Step
                    </span>
                  )}
                  {activeStep.stepType === 'lab' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(139,92,246,0.08)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.15)' }}>
                      <Code size={10} /> Lab Step
                    </span>
                  )}
                  {activeStep.stepType === 'assignment' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(236,72,153,0.08)', color: '#db2777', border: '1px solid rgba(236,72,153,0.15)' }}>
                      <ClipboardList size={10} /> Assignment Step
                    </span>
                  )}
                  
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '12px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                    {activeStep.title}
                  </h1>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '6px', fontWeight: 500 }}>
                    Lesson: <span style={{ color: 'var(--text-secondary)' }}>{activeStep.lessonTitle}</span>
                  </p>
                </div>

                {/* Audio Reader Widget (Only show on Intro, Text, or Assignment reading steps) */}
                {(activeStep.stepType === 'intro' || activeStep.stepType === 'text' || activeStep.stepType === 'assignment') && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '30px',
                    padding: '8px 16px',
                    boxShadow: 'var(--shadow-sm)',
                    alignSelf: 'flex-start',
                  }}>
                    <style>{`
                      @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 1; }
                      }
                    `}</style>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isSpeaking ? 'rgba(99, 102, 241, 0.1)' : 'rgba(100, 116, 139, 0.08)',
                        color: isSpeaking ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        animation: isSpeaking && !isPaused ? 'pulse 2s infinite' : 'none',
                      }}>
                        <Volume2 size={15} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                          Audio Reader
                        </span>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '2px', lineHeight: 1 }}>
                          {isSpeaking ? (isPaused ? 'Paused' : 'Reading...') : 'Listen'}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: '16px', width: '1px', background: 'var(--border-secondary)' }} />

                    {/* Speed Selector */}
                    <select
                      value={speechRate}
                      onChange={(e) => {
                        const newRate = parseFloat(e.target.value);
                        setSpeechRate(newRate);
                        if (isSpeaking && !isPaused) {
                          setTimeout(() => {
                            startSpeaking(textPages[currentTextPage] || '');
                          }, 50);
                        }
                      }}
                      style={{
                        padding: '2px 4px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-secondary)',
                        background: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="0.75">0.75x</option>
                      <option value="1">1.0x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="1.75">1.75x</option>
                      <option value="2">2.0x</option>
                    </select>

                    <div style={{ height: '16px', width: '1px', background: 'var(--border-secondary)' }} />

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!isSpeaking ? (
                        <button
                          onClick={() => startSpeaking(textPages[currentTextPage] || '')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '15px',
                            border: 'none',
                            background: 'var(--accent-primary)',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.15)',
                          }}
                        >
                          <Play size={10} fill="#ffffff" /> Play
                        </button>
                      ) : (
                        <>
                          {isPaused ? (
                            <button
                              onClick={resumeSpeaking}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '15px',
                                border: 'none',
                                background: 'var(--accent-primary)',
                                color: '#ffffff',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.15)',
                              }}
                            >
                              <Play size={10} fill="#ffffff" /> Resume
                            </button>
                          ) : (
                            <button
                              onClick={pauseSpeaking}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '15px',
                                border: '1px solid var(--border-secondary)',
                                background: '#ffffff',
                                color: 'var(--text-primary)',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Pause size={10} /> Pause
                            </button>
                          )}

                          <button
                            onClick={stopSpeaking}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-secondary)',
                              background: '#ffffff',
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                            title="Stop"
                          >
                            <Square size={8} fill="#ef4444" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step Body rendering based on StepType */}
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                boxShadow: 'var(--shadow-premium)',
              }}>
                {/* Render Intro/Text/Assignment content with local page selector */}
                {(activeStep.stepType === 'intro' || activeStep.stepType === 'text' || activeStep.stepType === 'assignment') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ 
                      paddingRight: '8px'
                    }}>
                      <MarkdownRenderer text={textPages[currentTextPage]} />
                    </div>
                    {textPages.length > 1 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-secondary)',
                        paddingTop: '16px',
                        marginTop: '8px',
                      }}>
                        <button
                          disabled={currentTextPage === 0}
                          onClick={() => {
                            setCurrentTextPage(prev => Math.max(0, prev - 1));
                            handleScrollToTop();
                          }}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: currentTextPage === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentTextPage === 0 ? 0.5 : 1,
                            background: currentTextPage === 0 ? 'var(--bg-primary)' : '',
                            color: currentTextPage === 0 ? 'var(--text-muted)' : '',
                            borderColor: currentTextPage === 0 ? 'var(--border-primary)' : '',
                          }}
                        >
                          ← Previous Page
                        </button>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          Page {currentTextPage + 1} of {textPages.length}
                        </span>
                        <button
                          disabled={currentTextPage === textPages.length - 1}
                          onClick={() => {
                            setCurrentTextPage(prev => Math.min(textPages.length - 1, prev + 1));
                            handleScrollToTop();
                          }}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: currentTextPage === textPages.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: currentTextPage === textPages.length - 1 ? 0.5 : 1,
                            background: currentTextPage === textPages.length - 1 ? 'var(--bg-primary)' : '',
                            color: currentTextPage === textPages.length - 1 ? 'var(--text-muted)' : '',
                            borderColor: currentTextPage === textPages.length - 1 ? 'var(--border-primary)' : '',
                          }}
                        >
                          Next Page →
                        </button>
                      </div>
                    )}
                    {activeStep.stepType === 'assignment' && (activeStep.attachmentUrl || activeStep.metadata?.attachmentUrl) && (
                      <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(236,72,153,0.04), rgba(99,102,241,0.04))',
                        border: '1px solid rgba(236,72,153,0.15)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.25rem' }}>📎</span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Attached Assignment File</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                              {activeStep.attachmentName || activeStep.metadata?.attachmentName || 'Click download link to retrieve files'}
                            </div>
                          </div>
                        </div>
                        <a
                          href={activeStep.attachmentUrl || activeStep.metadata?.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '6px 14px',
                            background: '#db2777',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 2px 8px rgba(219,39,119,0.25)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(219,39,119,0.35)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(219,39,119,0.25)';
                          }}
                        >
                          Download Attachment
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Render Video content */}
                {activeStep.stepType === 'video' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '56.25%', // 16:9 Aspect Ratio
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-secondary)',
                      boxShadow: 'var(--shadow-md)',
                    }}>
                      <iframe
                        src={(() => {
                          const url = activeStep.videoUrl || '';
                          const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                          if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
                          return url.replace('watch?v=', 'embed/');
                        })()}
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
                      <div style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: 'var(--font-size-sm)',
                        background: '#f9fafb',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        borderLeft: '4px solid var(--accent-primary)',
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}>
                        {activeStep.textContent}
                      </div>
                    )}
                  </div>
                )}

                {/* Render Lab content */}
                {activeStep.stepType === 'lab' && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '48px 16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '24px',
                    background: 'linear-gradient(to bottom, #faf5ff, #ffffff)',
                    borderRadius: '12px',
                    border: '1px solid #f3e8ff',
                  }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'rgba(139,92,246,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#7c3aed',
                    }}>
                      <Terminal size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#5b21b6' }}>Interactive Coding Lab</h3>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '480px', fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
                        Put your skills to the test! Write code directly in the browser and receive real-time execution feedback and AI-guided hints.
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/coding-lab?stepId=${activeStep.id}`}
                      className="btn btn-primary"
                      style={{ 
                        padding: '12px 28px', 
                        fontSize: 'var(--font-size-sm)', 
                        borderRadius: '8px',
                        background: '#7c3aed',
                        borderColor: '#7c3aed',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      Launch Coding Lab <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Stepper navigation footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: '1px solid var(--border-primary)', paddingTop: '24px', marginTop: '12px'
              }}>
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => {
                    setActiveStepId(flatSteps[activeStepIndex - 1].id);
                    handleScrollToTop();
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-secondary)',
                    background: '#ffffff',
                    color: activeStepIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronLeft size={16} /> Previous Step
                </button>

                {completedSteps.includes(activeStep.id) ? (
                  activeStepIndex === flatSteps.length - 1 ? (
                    <button
                      onClick={() => {
                        setShowCompletion(true);
                        handleScrollToTop();
                      }}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        border: '1px solid #10b981',
                        background: '#10b981',
                        color: '#ffffff',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Finish Course <CheckCircle2 size={16} />
                    </button>
                  ) : (
                    <button
                      disabled={activeStepIndex === flatSteps.length - 1 || (textPages.length > 1 && currentTextPage !== textPages.length - 1)}
                      onClick={() => {
                        setActiveStepId(flatSteps[activeStepIndex + 1].id);
                        handleScrollToTop();
                      }}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        cursor: (activeStepIndex === flatSteps.length - 1 || (textPages.length > 1 && currentTextPage !== textPages.length - 1)) ? 'not-allowed' : 'pointer',
                        background: (activeStepIndex === flatSteps.length - 1 || (textPages.length > 1 && currentTextPage !== textPages.length - 1)) ? 'var(--bg-primary)' : 'var(--accent-primary)',
                        borderColor: (activeStepIndex === flatSteps.length - 1 || (textPages.length > 1 && currentTextPage !== textPages.length - 1)) ? 'var(--border-primary)' : 'var(--accent-primary)',
                        color: (activeStepIndex === flatSteps.length - 1 || (textPages.length > 1 && currentTextPage !== textPages.length - 1)) ? 'var(--text-muted)' : '#ffffff',
                        boxShadow: (activeStepIndex === flatSteps.length - 1 || (textPages.length > 1 && currentTextPage !== textPages.length - 1)) ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.15)',
                      }}
                    >
                      Next Step <ChevronRight size={16} />
                    </button>
                  )
                ) : (
                  <button
                    onClick={async () => {
                      await handleMarkComplete();
                      handleScrollToTop();
                    }}
                    disabled={textPages.length > 1 && currentTextPage !== textPages.length - 1}
                    className="btn btn-primary"
                    style={{ 
                      background: (textPages.length > 1 && currentTextPage !== textPages.length - 1) ? 'var(--bg-primary)' : '#10b981', 
                      borderColor: (textPages.length > 1 && currentTextPage !== textPages.length - 1) ? 'var(--border-primary)' : '#10b981', 
                      color: (textPages.length > 1 && currentTextPage !== textPages.length - 1) ? 'var(--text-muted)' : '#fff', 
                      boxShadow: (textPages.length > 1 && currentTextPage !== textPages.length - 1) ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: (textPages.length > 1 && currentTextPage !== textPages.length - 1) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <CheckCircle2 size={16} /> 
                    {textPages.length > 1 && currentTextPage !== textPages.length - 1 
                      ? `Read all pages to complete (${currentTextPage + 1}/${textPages.length})` 
                      : 'Mark Complete & Next'
                    }
                  </button>
                )}
              </div>
            </div>
          );
        })() : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 16px',
            background: '#ffffff',
            border: '1px dashed var(--border-secondary)',
            borderRadius: 'var(--radius-xl)',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: '3.5rem' }}>📖</span>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>No learning steps created yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '440px', fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
                This course has lessons configured, but no learning steps (text content, videos, or coding exercises) have been added by the instructor yet.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Robust helper function to split text into pages based on manual pagebreaks or automatic paragraph grouping
export function splitTextIntoPages(text: string): string[] {
  if (!text) return [''];
  
  // 1. Split by explicit custom pagebreak tag if present
  if (text.includes('<!-- pagebreak -->')) {
    return text.split('<!-- pagebreak -->').map(p => p.trim()).filter(Boolean);
  }
  
  // 2. Auto-paginate very long text step content (over 800 characters)
  if (text.length > 800) {
    const paragraphs = text.split(/\n\s*\n/);
    const pages: string[] = [];
    let currentPage = '';
    
    for (const para of paragraphs) {
      if ((currentPage + para).length > 600 && currentPage.length > 0) {
        pages.push(currentPage.trim());
        currentPage = para;
      } else {
        if (currentPage.length > 0) {
          currentPage += '\n\n' + para;
        } else {
          currentPage = para;
        }
      }
    }
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }
    return pages;
  }
  
  return [text];
}

// Custom parser component to render formatted Markdown, code snippets, auto-bullet points and subheadings
export function MarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  // Split by code blocks first if explicit backticks are present
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Explicit code block
          const lines = part.slice(3, -3).trim().split('\n');
          let language = 'text';
          let codeLines = lines;
          if (lines[0] && !lines[0].includes(' ') && lines[0].length < 15 && lines[0] === lines[0].toLowerCase()) {
            language = lines[0];
            codeLines = lines.slice(1);
          }
          return (
            <div 
              key={index}
              style={{
                background: '#0b0f19',
                color: '#f8fafc',
                borderRadius: '10px',
                padding: '16px 20px',
                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                fontSize: '0.875rem',
                overflowX: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                margin: '18px 0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {/* Terminal Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px', userSelect: 'none' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {language === 'text' ? 'code snippet' : language}
                </div>
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre', lineHeight: '1.6' }}><code>{codeLines.join('\n')}</code></pre>
            </div>
          );
        } else {
          // Parse paragraph blocks
          // Ensure headings are isolated on their own blocks to prevent paragraphs from getting wrapped in heading tags
          let processedText = part.split('\n').map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ') || trimmedLine.startsWith('### ')) {
              return '\n\n' + trimmedLine + '\n\n';
            }
            return line;
          }).join('\n');

          processedText = processedText.replace(/\n{3,}/g, '\n\n');

          const blocks = processedText.split(/\n\s*\n/);
          return blocks.map((block, bIdx) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            // Check if it is an explicit Markdown Heading
            if (trimmed.startsWith('# ')) {
              return (
                <h1 key={bIdx} style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)', 
                  marginTop: '32px', 
                  marginBottom: '12px', 
                  letterSpacing: '-0.5px',
                  borderLeft: '4px solid #6366f1',
                  paddingLeft: '12px',
                  lineHeight: '1.2'
                }}>
                  {parseInlineMarkdown(trimmed.slice(2))}
                </h1>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={bIdx} style={{ 
                  fontSize: '1.45rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  marginTop: '28px', 
                  marginBottom: '10px', 
                  letterSpacing: '-0.3px',
                  borderLeft: '4px solid #6366f1',
                  paddingLeft: '10px',
                  lineHeight: '1.3'
                }}>
                  {parseInlineMarkdown(trimmed.slice(3))}
                </h2>
              );
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={bIdx} style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  marginTop: '22px', 
                  marginBottom: '8px',
                  borderLeft: '3px solid #818cf8',
                  paddingLeft: '8px',
                  lineHeight: '1.4'
                }}>
                  {parseInlineMarkdown(trimmed.slice(4))}
                </h3>
              );
            }

            // Check if it is an explicit Blockquote (renders as premium note banner)
            if (trimmed.startsWith('> ')) {
              return (
                <div 
                  key={bIdx}
                  style={{
                    borderLeft: '4px solid #3b82f6',
                    background: 'rgba(59, 130, 246, 0.04)',
                    padding: '14px 20px',
                    margin: '18px 0',
                    borderRadius: '0 8px 8px 0',
                    color: '#1e3a8a',
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <span style={{ color: '#3b82f6', fontSize: '1.15rem', userSelect: 'none', lineHeight: '1.5' }}>💡</span>
                  <div style={{ flex: 1 }}>
                    {parseInlineMarkdown(trimmed.slice(2))}
                  </div>
                </div>
              );
            }

            // Check if it is a block of code (e.g. print(...), >>> ..., etc.)
            const lines = trimmed.split('\n');
            const isCodeBlock = lines.some(line => 
              line.trim().startsWith('>>>') || 
              line.trim().startsWith('print(') || 
              line.trim().includes('def ') || 
              line.trim().includes('class ') ||
              line.trim() === '15' // output line
            );
            
            // If it starts with >>> or looks like code block lines and doesn't contain normal conversational punctuation
            if (isCodeBlock && lines.length > 0 && !trimmed.includes('Interpreter is') && !trimmed.includes('compiled languages')) {
              return (
                <div 
                  key={bIdx}
                  style={{
                    background: '#0b0f19',
                    color: '#f8fafc',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                    fontSize: '0.875rem',
                    overflowX: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    margin: '16px 0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* macOS controls mock for inline code logs */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px', userSelect: 'none' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      interactive console
                    </div>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}><code>{trimmed}</code></pre>
                </div>
              );
            }

            // Check if it is a list block
            const isUnordered = lines.every(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
            const isOrdered = lines.every(line => /^\d+\.\s/.test(line.trim()));

            if (isUnordered) {
              return (
                <ul key={bIdx} style={{ paddingLeft: '4px', marginTop: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lines.map((line, lIdx) => (
                    <li key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ color: '#6366f1', fontSize: '11px', marginTop: '6px', userSelect: 'none', lineHeight: '1' }}>✦</span>
                      <span style={{ color: '#334155', fontSize: '1.025rem', lineHeight: '1.7' }}>
                        {parseInlineMarkdown(line.trim().slice(2))}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            }

            if (isOrdered) {
              return (
                <ol key={bIdx} style={{ paddingLeft: '4px', marginTop: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lines.map((line, lIdx) => {
                    const content = line.trim().replace(/^\d+\.\s/, '');
                    return (
                      <li key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#6366f1', fontSize: '1.025rem', fontWeight: 700, minWidth: '22px', userSelect: 'none', lineHeight: '1.7' }}>{lIdx + 1}.</span>
                        <span style={{ color: '#334155', fontSize: '1.025rem', lineHeight: '1.7' }}>
                          {parseInlineMarkdown(content)}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              );
            }

            // Intelligent list formatting for plain text paragraphs (e.g. Advantages list)
            // If the preceding paragraph ended with a colon, and this block is split into multiple short lines:
            if (lines.length > 1 && lines.every(line => line.length < 50 && !line.includes('.'))) {
              return (
                <ul key={bIdx} style={{ paddingLeft: '4px', marginTop: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lines.map((line, lIdx) => (
                    <li key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ color: '#6366f1', fontSize: '11px', marginTop: '6px', userSelect: 'none', lineHeight: '1' }}>✦</span>
                      <span style={{ color: '#334155', fontSize: '1.025rem', lineHeight: '1.7' }}>
                        {parseInlineMarkdown(line.trim())}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            }

            // Check if it's a short line ending in colon (e.g., "Types of Execution:" or "Example:")
            if (trimmed.endsWith(':') && trimmed.length < 40) {
              return (
                <h4 
                  key={bIdx} 
                  style={{ 
                    fontSize: '1.05rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)', 
                    marginTop: '24px', 
                    marginBottom: '8px',
                    borderBottom: '1px solid var(--border-secondary)',
                    paddingBottom: '6px',
                  }}
                >
                  {parseInlineMarkdown(trimmed)}
                </h4>
              );
            }

            // Standard paragraph
            return (
              <p 
                key={bIdx}
                style={{
                  marginTop: '8px',
                  marginBottom: '16px',
                  color: '#334155',
                  fontSize: '1.025rem',
                  lineHeight: '1.85',
                }}
              >
                {parseInlineMarkdown(trimmed)}
              </p>
            );
          });
        }
      })}
    </div>
  );
}

// Inline Markdown parser for Bold, Italic, and Inline Code
function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to match **bold**, *italic*, `code`, and plain text
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={index} 
          style={{
            background: 'rgba(99, 102, 241, 0.06)',
            color: '#4f46e5',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'SFMono-Regular, Consolas, monospace',
            fontSize: '0.875em',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            fontWeight: 600,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

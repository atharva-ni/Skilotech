'use client';

import React, { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';

interface AiFeedbackType {
  score: number;
  metrics: { complexity: string; performance: string; style: string };
  suggestions: string[];
  positives?: string[];
  optimalCode?: string;
  optimalExplanation?: string;
  secondaryHint?: string;
}

type Language = 'javascript' | 'python' | 'cpp' | 'java';

interface TestResult {
  passed: boolean;
  summary: string;
  passedCount: number;
  totalCount: number;
}

interface ExecutionOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  isTimeout: boolean;
  memory: number | null;
  cpuTime: number | null;
  wallTime: number | null;
  testResults: TestResult | null;
  testCases: { index: number; passed: boolean; actual: string }[] | null;
  aiFeedback?: AiFeedbackType | null;
}

function CodingLabInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepId = searchParams.get('stepId');

  const [language, setLanguage] = useState<Language>('javascript');
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackType | null>(null);
  const [execOutput, setExecOutput] = useState<ExecutionOutput | null>(null);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'ai'>('console');
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Dynamic step loading (when launched from a lesson lab step)
  const [dbStep, setDbStep] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);

  // Dynamic problems loading (for standalone practice mode)
  const [problems, setProblems] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  // Resizable panels
  const [leftWidth, setLeftWidth] = useState(280);     // px
  const [rightWidth, setRightWidth] = useState(300);   // px
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  const startDrag = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (side === 'left') isDraggingLeft.current = true;
    else isDraggingRight.current = true;

    const startX = e.clientX;
    const startLeftW = leftWidth;
    const startRightW = rightWidth;

    const onMove = (ev: MouseEvent) => {
      const totalW = containerRef.current?.offsetWidth || window.innerWidth;
      const delta = ev.clientX - startX;
      if (isDraggingLeft.current) {
        const next = Math.max(180, Math.min(totalW * 0.4, startLeftW + delta));
        setLeftWidth(next);
      } else {
        const next = Math.max(200, Math.min(totalW * 0.4, startRightW - delta));
        setRightWidth(next);
      }
    };
    const onUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftWidth, rightWidth]);

  const activeProblem = problems.find((p) => p.slug === selectedProblemId || p.id === selectedProblemId) ?? problems[0];
  const activeExamples = isStepMode && dbStep ? (dbStep.metadata?.examples || []) : (activeProblem?.examples || []);

  // Load standalone problems on mount if not in step mode
  useEffect(() => {
    if (!isStepMode) {
      Promise.resolve().then(() => {
        setLoadingProblems(true);
      });
      fetch('/api/problems')
        .then((r) => r.json())
        .then((data) => {
          if (data.problems) {
            setProblems(data.problems);
            if (data.problems.length > 0) {
              setSelectedProblemId(data.problems[0].slug || data.problems[0].id);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load problems:', err);
          toast.error('Failed to load coding problems');
        })
        .finally(() => setLoadingProblems(false));
    } else {
      Promise.resolve().then(() => {
        setLoadingProblems(false);
      });
    }
  }, [isStepMode]);

  // Load DB step if stepId is present in URL
  useEffect(() => {
    if (stepId) {
      Promise.resolve().then(() => {
        setIsStepMode(true);
        setLoadingStep(true);
        setSelectedCaseIdx(0);
      });
      fetch(`/api/steps/${stepId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.step) {
            const s = data.step;
            setDbStep(s);
            // Detect language from labLanguage field
            const lang = (s.labLanguage as Language) || 'javascript';
            setLanguage(lang);
            setCode(s.labStarterCode || '');
          }
        })
        .catch((err) => {
          console.error('Failed to load step:', err);
          toast.error('Failed to load lab step');
        })
        .finally(() => setLoadingStep(false));
    }
  }, [stepId]);

  // Reset language if current language is not supported by activeProblem
  useEffect(() => {
    if (!isStepMode && activeProblem) {
      const tests = activeProblem.testCode as Record<string, string> | undefined;
      const isSupported = !!(tests && tests[language] && tests[language].trim() !== '');
      if (!isSupported) {
        const supported = ['javascript', 'python', 'cpp', 'java'].find(lang => 
          tests && tests[lang] && tests[lang].trim() !== ''
        ) as Language || 'javascript';
        Promise.resolve().then(() => {
          setLanguage(supported);
        });
      }
    }
  }, [activeProblem, isStepMode, language]);

  // Update code when problem or language changes (free-practice mode only)
  useEffect(() => {
    if (!isStepMode && activeProblem) {
      const starter = activeProblem.starterCode as Record<string, string>;
      Promise.resolve().then(() => {
        setCode(starter?.[language] || '');
        setExecOutput(null);
        setAiFeedback(null);
        setSelectedCaseIdx(0);
      });
    }
  }, [activeProblem, language, isStepMode]);

  const callCompileApi = async (isSubmit: boolean): Promise<ExecutionOutput | null> => {
    try {
      const body: Record<string, any> = { code, language, isSubmit };
      if (isStepMode && stepId) {
        body.stepId = stepId;
      } else {
        body.problemId = selectedProblemId;
      }

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Compilation failed');
      return data as ExecutionOutput;
    } catch (err: any) {
      toast.error(err.message || 'Execution service error');
      return null;
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setExecOutput(null);
    setAiFeedback(null); // Clear previous AI feedback on new run
    setActiveConsoleTab('console');
    setOutputCollapsed(false);
    const t0 = performance.now();
    const result = await callCompileApi(false);
    const elapsed = Math.round(performance.now() - t0);
    setIsRunning(false);
    if (result) {
      setExecOutput(result);
      if (result.exitCode === 0 && !result.stderr) {
        toast.success(`✅ Code executed successfully in ${elapsed}ms`);
      } else if (result.isTimeout) {
        toast.error('⏱️ Time Limit Exceeded - optimize your solution');
      } else if (result.stderr) {
        toast.error('❌ Runtime error - check console output');
      } else {
        toast.info(`Code finished with exit code ${result.exitCode}`);
      }
    }
  };

  const handleAskAi = async () => {
    setIsAskingAi(true);
    setAiFeedback(null);
    setActiveConsoleTab('ai');
    setOutputCollapsed(false);
    try {
      const body: Record<string, any> = { code, language, askAi: true };
      if (isStepMode && stepId) {
        body.stepId = stepId;
      } else {
        body.problemId = selectedProblemId;
      }

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get AI feedback');
      
      if (data.aiFeedback) {
        setAiFeedback(data.aiFeedback);
        toast.success('💡 AI Feedback generated!');
      } else {
        throw new Error('AI Tutor did not return any feedback.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to request AI hints');
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setExecOutput(null);
    setOutputCollapsed(false);
    setActiveConsoleTab('console'); // Stay on Console tab first
    setAiFeedback(null); // Clear previous AI feedback on new submit
    const t0 = performance.now();
    const result = await callCompileApi(true);
    const elapsed = Math.round(performance.now() - t0);
    setIsSubmitting(false);
    if (result) {
      setExecOutput(result);

      if (result.testResults?.passed) {
        toast.success(`🎉 All ${result.testResults.passedCount} tests passed! (${elapsed}ms)`);
      } else {
        if (result.testResults) {
          toast.error(`❌ ${result.testResults.passedCount}/${result.testResults.totalCount} passed - ${result.testResults.summary}`);
        } else {
          toast.error(`❌ Submission failed. Check console error outputs.`);
        }
      }
    }
  };

  // Compute Monaco language identifier
  const monacoLang = language === 'cpp' ? 'cpp' : language;

  if (loadingStep || (loadingProblems && !isStepMode)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTop: '3px solid var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading lab environment...</p>
      </div>
    );
  }



  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(100vh - var(--header-height) - 48px)',
        margin: '-12px',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Collapsed left tab */}
      {leftCollapsed && (
        <div style={{
          width: '28px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '12px',
          cursor: 'pointer',
          flexShrink: 0,
        }} onClick={() => setLeftCollapsed(false)} title="Expand Problem">
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '1px', fontWeight: 700, textTransform: 'uppercase' }}>Problem</span>
          <span style={{ marginTop: '8px', fontSize: '16px' }}>›</span>
        </div>
      )}
      {/* Left Pane: Problem Description */}
      {!leftCollapsed && (
        <div className="card" style={{
          width: `${leftWidth}px`,
          minWidth: `${leftWidth}px`,
          maxWidth: `${leftWidth}px`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          padding: 0,
          flexShrink: 0,
          transition: 'width 0.05s',
        }}>
          {/* Left panel header with collapse button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problem</span>
            <button onClick={() => setLeftCollapsed(true)} title="Collapse panel" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '16px', padding: '0 4px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>‹</button>
          </div>
          {/* Step mode: show step details from DB */}

          {isStepMode && dbStep ? (
            <div style={{ padding: '20px' }}>
              {dbStep.lesson?.module?.courseId && (
                <button
                  onClick={() => {
                    router.push(`/dashboard/courses/${dbStep.lesson.module.courseId}/learn`);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary, #7c3aed)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0',
                    marginBottom: '14px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary-hover, #6d28d9)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-primary, #7c3aed)')}
                >
                  ← Return to Course Workspace
                </button>
              )}
              <span className="badge badge-primary" style={{ marginBottom: '8px', display: 'inline-block' }}>
                💻 LESSON LAB
              </span>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: '0 0 8px 0' }}>
                {dbStep.title}
              </h2>
              {dbStep.labInstructions && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {dbStep.labInstructions}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Problem selector dropdown */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, pointerEvents: 'none', fontSize: '0.85rem' }}>📚</span>
                  <select
                    className="input select"
                    value={selectedProblemId}
                    onChange={(e) => setSelectedProblemId(e.target.value)}
                    style={{
                      paddingLeft: '2.5rem',
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e5e5',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: 'var(--font-size-sm)',
                      height: '42px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {problems.map((problem) => (
                      <option
                        key={problem.id || problem.slug}
                        value={problem.slug || problem.id}
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      >
                        {problem.title} ({problem.difficulty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scrollable problem content */}
              {activeProblem && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}>
                  {/* Problem number + title */}
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {activeProblem.sortOrder}. {activeProblem.title}
                  </h2>

                  {/* Difficulty badge + topic tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                      background: activeProblem.difficulty === 'easy'
                        ? 'rgba(0, 175, 155, 0.12)'
                        : activeProblem.difficulty === 'medium'
                          ? 'rgba(255, 176, 46, 0.12)'
                          : 'rgba(255, 55, 95, 0.12)',
                      color: activeProblem.difficulty === 'easy'
                        ? '#00af9b'
                        : activeProblem.difficulty === 'medium'
                          ? '#ffb02e'
                          : '#ff375f',
                    }}>
                      {activeProblem.difficulty === 'easy' ? 'Easy' : activeProblem.difficulty === 'medium' ? 'Medium' : 'Hard'}
                    </span>

                    <span style={{ color: 'var(--border-secondary)', fontSize: '14px', userSelect: 'none' }}>|</span>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}>
                      Topics
                    </span>

                    {(activeProblem.tags as string[] || []).map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                          cursor: 'default',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                    marginBottom: '24px',
                  }}>
                    {activeProblem.description}
                  </div>

                  {/* Horizontal separator */}
                  <div style={{ height: '1px', background: 'var(--border-primary)', marginBottom: '20px' }} />

                  {/* Examples */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                    {(activeProblem.examples as any[] || []).map((example: any, index: number) => (
                      <div key={index}>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                        }}>
                          Example {index + 1}:
                        </div>
                        <div style={{
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 16px',
                          borderLeft: '3px solid var(--border-secondary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', flexShrink: 0 }}>Input:</span>
                            <code style={{
                              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                              fontSize: '12.5px',
                              color: 'var(--text-primary)',
                              wordBreak: 'break-all',
                            }}>
                              {example.input}
                            </code>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', flexShrink: 0 }}>Output:</span>
                            <code style={{
                              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                              fontSize: '12.5px',
                              color: 'var(--text-primary)',
                              wordBreak: 'break-all',
                            }}>
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', flexShrink: 0 }}>Explanation:</span>
                              <span style={{
                                fontSize: '13px',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                              }}>
                                {example.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {(activeProblem.constraints as string[] || []).length > 0 && (
                    <div>
                      <div style={{ height: '1px', background: 'var(--border-primary)', marginBottom: '20px' }} />
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                      }}>
                        Constraints:
                      </div>
                      <ul style={{
                        listStyle: 'disc',
                        paddingLeft: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}>
                        {(activeProblem.constraints as string[]).map((constraint: string, idx: number) => (
                          <li key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <code style={{
                              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                              fontSize: '12px',
                              color: 'var(--text-primary)',
                              background: 'var(--bg-tertiary)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-primary)',
                            }}>
                              {constraint}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )} {/* end left panel */}

      {/* Left drag handle */}
      {!leftCollapsed && (
        <div
          onMouseDown={startDrag('left')}
          style={{
            width: '5px',
            background: 'transparent',
            cursor: 'col-resize',
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-primary)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        />
      )}

      {/* Middle Pane: Monaco Editor + Output */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: 0, overflow: 'hidden', minWidth: 0 }}>
        {/* Editor Toolbar */}
        <div className="card" style={{ flex: outputCollapsed ? '1' : '1 1 60%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                className="input select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{ width: '150px', padding: '4px 8px' }}
                disabled={isStepMode}
              >
                {[
                  { value: 'javascript', label: 'JavaScript' },
                  { value: 'python', label: 'Python' },
                  { value: 'cpp', label: 'C++' },
                  { value: 'java', label: 'Java' },
                ].map(lang => {
                  const tests = activeProblem?.testCode as Record<string, string> | undefined;
                  const isSupported = isStepMode || !!(tests && tests[lang.value] && tests[lang.value].trim() !== '');
                  if (!isSupported) return null;
                  return (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  );
                })}
              </select>
              {isStepMode && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-glass)', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-primary)' }}>
                  📖 Lesson Lab
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                  borderRadius: '8px', border: 'none', cursor: isRunning || isSubmitting ? 'not-allowed' : 'pointer',
                  background: isRunning
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                  color: '#fff',
                  opacity: isSubmitting ? 0.5 : 1,
                  boxShadow: isRunning ? '0 0 12px rgba(245,158,11,0.35)' : '0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isRunning ? (
                  <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: '12px' }}>⚙️</span> Running...</>
                ) : '▶ Run Code'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 18px', fontSize: '12px', fontWeight: 700,
                  borderRadius: '8px', border: 'none', cursor: isRunning || isSubmitting ? 'not-allowed' : 'pointer',
                  background: isSubmitting
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  opacity: isRunning ? 0.5 : 1,
                  boxShadow: isSubmitting ? '0 0 12px rgba(245,158,11,0.35)' : '0 2px 8px rgba(16,185,129,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSubmitting ? (
                  <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: '12px' }}>⚙️</span> Judging...</>
                ) : '🚀 Submit'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={(val) => {
                setCode(val ?? '');
                setAiFeedback(null); // Clear AI feedback when code edits happen so they can Ask AI again
              }}
              theme="light"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                suggest: { showKeywords: true },
                quickSuggestions: true,
              }}
            />
          </div>
        </div>

        {/* Output / Console Output Pane */}
        {!outputCollapsed && (
          <div className="card" style={{ flex: '0 1 38%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', padding: '0 8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setActiveConsoleTab('console')}
                  style={{
                    padding: '10px 16px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                    color: activeConsoleTab === 'console' ? 'var(--accent-primary-hover)' : 'var(--text-tertiary)',
                    borderBottom: activeConsoleTab === 'console' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px',
                    borderLeft: 'none', borderRight: 'none', borderTop: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  📟 Console Output
                </button>
                <button
                  onClick={() => setActiveConsoleTab('ai')}
                  style={{
                    padding: '10px 16px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                    color: activeConsoleTab === 'ai' ? 'var(--accent-primary-hover)' : 'var(--text-tertiary)',
                    borderBottom: activeConsoleTab === 'ai' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px',
                    borderLeft: 'none', borderRight: 'none', borderTop: 'none',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  🤖 AI Feedback
                </button>
              </div>
              <button onClick={() => setOutputCollapsed(true)} title="Collapse console" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '14px', padding: '4px 8px', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px' }}>▼</span> Hide
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-tertiary)', padding: '16px' }}>
              {activeConsoleTab === 'console' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Execution Status Banner */}
                  {(isRunning || isSubmitting) && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.05) 100%)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: '16px' }}>⚙️</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#d97706' }}>
                        {isRunning ? 'Compiling & executing your code...' : 'Running test cases & judging submission...'}
                      </span>
                    </div>
                  )}

                  {execOutput && !isRunning && !isSubmitting && (() => {
                    const isExecSuccess = execOutput.testResults 
                      ? execOutput.testResults.passed 
                      : (execOutput.exitCode === 0 && !execOutput.stderr && !execOutput.isTimeout);

                    return (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 16px', borderRadius: '8px',
                        background: isExecSuccess
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)'
                          : execOutput.isTimeout
                            ? 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.04) 100%)'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.04) 100%)',
                        border: `1px solid ${
                          isExecSuccess
                            ? 'rgba(16,185,129,0.2)'
                            : execOutput.isTimeout ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
                        }`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {isExecSuccess ? '✅' : execOutput.isTimeout ? '⏱️' : '❌'}
                          </span>
                          <span style={{
                            fontSize: '13px', fontWeight: 700,
                            color: isExecSuccess
                              ? '#059669'
                              : execOutput.isTimeout ? '#d97706' : '#dc2626',
                          }}>
                            {execOutput.isTimeout
                              ? 'Time Limit Exceeded'
                              : execOutput.stderr?.includes('SyntaxError') || execOutput.stderr?.includes('Error')
                                ? 'Runtime Error'
                                : execOutput.testResults
                                  ? (execOutput.testResults.passed ? 'Accepted' : `Wrong Answer (${execOutput.testResults.passedCount}/${execOutput.testResults.totalCount} passed)`)
                                  : execOutput.exitCode === 0 && !execOutput.stderr
                                    ? 'Execution Successful'
                                    : `Failed (exit code ${execOutput.exitCode})`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', Consolas, monospace" }}>
                          {execOutput.timeMs > 0 && <span>⏱ {execOutput.timeMs}ms</span>}
                          {execOutput.memory && <span>💾 {(execOutput.memory / 1024).toFixed(1)} KB</span>}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Output log area */}
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    fontSize: '13px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    minHeight: '60px'
                  }}>
                    {(isRunning || isSubmitting) ? (
                      <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s ease-in-out infinite' }} />
                        Waiting for output...
                      </div>
                    ) : execOutput ? (
                      <>
                        {execOutput.stdout && (
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>stdout</div>
                            <div style={{ color: 'var(--text-primary)' }}>{execOutput.stdout}</div>
                          </div>
                        )}
                        {execOutput.stderr && (
                          <div style={{ marginTop: execOutput.stdout ? '12px' : '0' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>stderr</div>
                            <div style={{ color: 'var(--error)', padding: '8px 12px', background: 'rgba(239,68,68,0.05)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.12)' }}>{execOutput.stderr}</div>
                          </div>
                        )}
                        {!execOutput.stdout && !execOutput.stderr && (
                          <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            No output produced. Process exited with code {execOutput.exitCode}.
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>💡</span>
                        Click <strong style={{ color: 'var(--text-secondary)', margin: '0 4px' }}>▶ Run Code</strong> to execute, or <strong style={{ color: 'var(--text-secondary)', margin: '0 4px' }}>🚀 Submit</strong> to run against all test cases.
                      </div>
                    )}
                  </div>

                  {/* LeetCode style Test Cases list */}
                  {activeExamples.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📋 Test Cases
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {activeExamples.map((_: any, idx: number) => {
                          const tcResult = execOutput?.testCases?.find(tc => tc.index === idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedCaseIdx(idx)}
                              style={{
                                padding: '6px 14px',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 600,
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid ${selectedCaseIdx === idx ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                                background: selectedCaseIdx === idx ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                color: selectedCaseIdx === idx ? '#ffffff' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <span>Case {idx + 1}</span>
                              {tcResult && (
                                <span style={{ fontSize: '10px', lineHeight: 1 }}>
                                  {tcResult.passed ? '🟢' : '🔴'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {activeExamples[selectedCaseIdx] && (
                        <div style={{
                          background: 'var(--bg-secondary)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-primary)',
                          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                          fontSize: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          {/* Status Check Badge */}
                          {execOutput?.testCases && execOutput.testCases.find(tc => tc.index === selectedCaseIdx) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Result</div>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                background: execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'var(--success-bg)' : 'var(--error-bg)',
                                color: execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'var(--success)' : 'var(--error)',
                                border: `1px solid ${execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                              }}>
                                {execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? '✅ Passed' : '❌ Failed'}
                              </span>
                            </div>
                          )}

                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Input</div>
                            <div style={{ color: 'var(--text-primary)', padding: '6px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                              {activeExamples[selectedCaseIdx].input}
                            </div>
                          </div>

                          {/* Actual Output (only show if code ran and gave output) */}
                          {execOutput?.testCases && execOutput.testCases.find(tc => tc.index === selectedCaseIdx) && (
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Actual Output</div>
                              <div style={{
                                color: execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'var(--text-primary)' : 'var(--error)',
                                padding: '6px 8px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.actual}
                              </div>
                            </div>
                          )}

                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Expected Output</div>
                            <div style={{ color: 'var(--text-primary)', padding: '6px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                              {activeExamples[selectedCaseIdx].output}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {isAskingAi ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTop: '3px solid var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>🤖 Socratic Tutor is analyzing your code...</span>
                    </div>
                  ) : aiFeedback ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Socratic Tutor Title Banner */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(124,58,237,0.02) 100%)',
                        border: '1px solid rgba(99,102,241,0.1)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>🤖</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Socratic Tutor Feedback</span>
                        </div>
                        <button
                          onClick={handleAskAi}
                          style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                            borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600,
                            color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                            boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s ease'
                          }}
                        >
                          🔄 Re-Ask AI
                        </button>
                      </div>

                      {/* Positive Points (if any) */}
                      {aiFeedback.positives && aiFeedback.positives.length > 0 && (
                        <div style={{
                          background: 'rgba(34, 197, 94, 0.05)',
                          border: '1px solid rgba(34, 197, 94, 0.15)',
                          borderRadius: '8px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ What You Did Well</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {aiFeedback.positives.map((pos: string, idx: number) => (
                              <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
                                <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                                <span>{pos}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Primary Socratic Guide */}
                      {aiFeedback.optimalExplanation && (
                        <div style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '8px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 Socratic Tip</div>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            {aiFeedback.optimalExplanation}
                          </p>
                        </div>
                      )}

                      {/* Step by step hints */}
                      {aiFeedback.suggestions && aiFeedback.suggestions.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step-by-Step Suggestions</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {aiFeedback.suggestions.map((suggestion: string, idx: number) => (
                              <div key={idx} style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.6,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'flex-start'
                              }}>
                                <span style={{
                                  background: 'var(--accent-tertiary)',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  minWidth: '18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  marginTop: '1px'
                                }}>{idx + 1}</span>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '36px 16px', textAlign: 'center', flex: 1,
                      background: 'var(--bg-secondary)', border: '1px dashed var(--border-primary)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '2.25rem', marginBottom: '8px' }}>🤖</span>
                      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700 }}>Get AI Assistance</h4>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', maxWidth: '380px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                        Need help understanding your logic or compiler errors? Ask our AI Socratic Tutor to guide you step-by-step.
                      </p>
                      <button
                        onClick={handleAskAi}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          color: '#ffffff', border: 'none', borderRadius: '8px',
                          padding: '8px 20px', fontSize: '12px', fontWeight: 700,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        ✨ Ask AI Tutor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )} {/* end output pane */}

        {/* Collapsed console bar */}
        {outputCollapsed && (
          <div onClick={() => setOutputCollapsed(false)} style={{
            height: '32px',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            cursor: 'pointer',
            gap: '8px',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '10px' }}>▲</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Show Console Output</span>
          </div>
        )}
      </div> {/* end middle pane */}


    </div>
  );
}

export default function CodingLab() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTop: '3px solid var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Initializing editor...</p>
      </div>
    }>
      <CodingLabInner />
    </Suspense>
  );
}


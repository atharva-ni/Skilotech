'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

interface AiFeedbackType {
  score: number;
  metrics: { complexity: string; performance: string; style: string };
  suggestions: string[];
  optimalCode?: string;
  optimalExplanation?: string;
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
}

function CodingLabInner() {
  const searchParams = useSearchParams();
  const stepId = searchParams.get('stepId');

  const [language, setLanguage] = useState<Language>('javascript');
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'console' | 'report'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackType | null>(null);
  const [execOutput, setExecOutput] = useState<ExecutionOutput | null>(null);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // Dynamic step loading (when launched from a lesson lab step)
  const [dbStep, setDbStep] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);

  // Dynamic problems loading (for standalone practice mode)
  const [problems, setProblems] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  const activeProblem = problems.find((p) => p.slug === selectedProblemId || p.id === selectedProblemId) ?? problems[0];
  const activeExamples = isStepMode && dbStep ? (dbStep.metadata?.examples || []) : (activeProblem?.examples || []);

  // Load standalone problems on mount if not in step mode
  useEffect(() => {
    if (!isStepMode) {
      setLoadingProblems(true);
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
      setLoadingProblems(false);
    }
  }, [isStepMode]);

  // Load DB step if stepId is present in URL
  useEffect(() => {
    if (stepId) {
      setIsStepMode(true);
      setLoadingStep(true);
      setSelectedCaseIdx(0);
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

  // Update code when problem or language changes (free-practice mode only)
  useEffect(() => {
    if (!isStepMode && activeProblem) {
      const starter = activeProblem.starterCode as Record<string, string>;
      setCode(starter?.[language] || '');
      setExecOutput(null);
      setAiFeedback(null);
      setShowAiFeedback(false);
      setActiveTab('console');
      setSelectedCaseIdx(0);
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
    setActiveTab('console');
    setExecOutput(null);
    const result = await callCompileApi(false);
    setIsRunning(false);
    if (result) setExecOutput(result);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveTab('report');
    setExecOutput(null);
    const result = await callCompileApi(true);
    setIsSubmitting(false);
    if (result) {
      setExecOutput(result);
      // Show AI feedback panel after submission (dynamic lookup from DB)
      const feedbackData = isStepMode
        ? (dbStep?.metadata?.aiFeedback || dbStep?.metadata || {})
        : (activeProblem?.aiFeedback || {});

      const feedback = {
        score: feedbackData.score || 82,
        metrics: feedbackData.metrics || { complexity: 'O(N) Time', performance: 'Good Runtime', style: 'Readable' },
        suggestions: feedbackData.suggestions || ['Great work! Review edge cases and consider space optimizations.'],
        optimalExplanation: feedbackData.optimalExplanation || 'Review the problem constraints and choose the simplest correct approach.',
        optimalCode: feedbackData.optimalCode || code,
      };
      setAiFeedback(feedback);
      setShowAiFeedback(true);

      if (result.testResults?.passed) {
        toast.success(`✅ All ${result.testResults.passedCount} tests passed!`);
      } else if (result.testResults) {
        toast.error(`❌ ${result.testResults.summary}`);
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: showAiFeedback ? '3fr 5fr 3.5fr' : '1fr 2fr',
      gap: 'var(--spacing-md)',
      height: 'calc(100vh - var(--header-height) - 48px)',
      margin: '-12px',
      overflow: 'hidden'
    }}>
      {/* Left Pane: Problem Description */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', borderRadius: 0, borderTop: 'none', borderBottom: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 16px 0' }}>

          {/* Step mode: show step details from DB */}
          {isStepMode && dbStep ? (
            <div>
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
            <>
              {/* Problem selector dropdown */}
              <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
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

              {/* Title & Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid #e5e5e5', paddingBottom: '16px', marginBottom: '8px' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>{activeProblem?.title}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge variant={activeProblem?.difficulty === 'Easy' ? 'success' : 'warning'}>{activeProblem?.difficulty}</Badge>
                  {(activeProblem?.tags as string[] || []).map((tag) => (
                    <Badge key={tag} variant="primary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Problem description & examples (free practice mode) */}
        {!isStepMode && activeProblem && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {activeProblem.description}
            </p>
            {(activeProblem.examples as any[] || []).map((example, index) => (
              <div key={index} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <strong>Example {index + 1}:</strong>
                <pre style={{ marginTop: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                  Input: {example.input}{'\n'}
                  Output: {example.output}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Middle Pane: Monaco Editor + Output */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--spacing-md)', overflow: 'hidden' }}>
        {/* Editor Toolbar */}
        <div className="card" style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0 }}>
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
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              {isStepMode && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-glass)', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-primary)' }}>
                  📖 Lesson Lab
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" onClick={handleRun} disabled={isRunning || isSubmitting}>
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                {isSubmitting ? '⏳ Submitting...' : '🚀 Submit'}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={(val) => setCode(val ?? '')}
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

        {/* Output / Submission Report Pane */}
        <div className="card" style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', padding: '0 8px' }}>
            {(['console', 'report'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 16px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                  color: activeTab === tab ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {tab === 'console' ? '📟 Console Output' : '📊 Submission Report'}
                {tab === 'report' && execOutput?.testResults && (
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)',
                  }} />
                )}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-tertiary)', padding: '16px' }}>
            {activeTab === 'console' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  minHeight: '80px'
                }}>
                  {isRunning ? (
                    <div style={{ color: 'var(--text-secondary)' }}>Running...</div>
                  ) : execOutput ? (
                    <>
                      {execOutput.stdout && (
                        <div style={{ color: 'var(--text-primary)' }}>
                          {execOutput.stdout}
                        </div>
                      )}
                      {execOutput.stderr && (
                        <div style={{ color: 'var(--error)', marginTop: execOutput.stdout ? '12px' : '0' }}>
                          {execOutput.stderr}
                        </div>
                      )}
                      {!execOutput.stdout && !execOutput.stderr && (
                        <div style={{ color: 'var(--text-muted)' }}>
                          [Process finished with exit code {execOutput.exitCode}]
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Click "Run Code" to see console output here.
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
              <div>
                {!execOutput && !isSubmitting && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>No submission yet.</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      Click <strong>Submit</strong> to run tests and get your AI optimization report.
                    </p>
                  </div>
                )}
                {isSubmitting && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2rem 0' }}>
                    <span style={{ fontSize: '1.5rem', animation: 'float 2s infinite' }}>🤖</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Running test cases and generating AI review...
                    </span>
                  </div>
                )}
                {execOutput && !isSubmitting && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Test Results Banner */}
                    {execOutput.testResults && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: 'var(--radius-md)',
                        background: execOutput.testResults.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)'}`,
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{execOutput.testResults.passed ? '✅' : '❌'}</span>
                        <div>
                          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)' }}>
                            {execOutput.testResults.passed ? 'Accepted' : 'Wrong Answer'}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            {execOutput.testResults.summary}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Stats */}
                    <div style={{ display: 'flex', gap: '24px' }}>
                      {[
                        { label: 'Runtime', value: `${execOutput.timeMs}ms` },
                        { label: 'Memory', value: execOutput.memory ? `${(execOutput.memory / 1024).toFixed(0)} KB` : 'N/A' },
                        { label: 'CPU Time', value: execOutput.cpuTime != null ? `${execOutput.cpuTime}ms` : 'N/A' },
                        { label: 'Exit Code', value: String(execOutput.exitCode) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{label}</div>
                          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI Feedback preview */}
                    {aiFeedback && (
                      <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '12px' }}>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                          🤖 AI Optimization Score
                        </p>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                          {aiFeedback.score}/100
                        </div>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          See full analysis in the right panel →
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: AI Feedback */}
      {showAiFeedback && aiFeedback && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', borderRadius: 0, borderTop: 'none', borderBottom: 'none', animation: 'slideInLeft 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>🤖 AI Feedback</h3>
            <button onClick={() => setShowAiFeedback(false)} style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '1.25rem', border: 'none', cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--success)' }}>{aiFeedback.score}/100</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Optimization Score</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '8px' }}>Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
              {Object.entries(aiFeedback.metrics).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary-hover)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '8px' }}>Suggestions</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, listStyle: 'none' }}>
              {aiFeedback.suggestions.map((s, i) => (
                <li key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)', lineHeight: 1.5 }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {aiFeedback.optimalExplanation && (
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>Optimal Approach</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                {aiFeedback.optimalExplanation}
              </p>
              {aiFeedback.optimalCode && (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '6px' }}>Optimal Implementation</div>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', color: '#0969da', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {aiFeedback.optimalCode}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
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


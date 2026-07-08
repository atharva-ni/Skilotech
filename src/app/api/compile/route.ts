import { NextRequest } from 'next/server';
import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { executeCode } from '@/lib/compiler';
import { z } from 'zod';

const compileRequestSchema = z.object({
  code: z.string(),
  language: z.enum(['javascript', 'python', 'cpp', 'java']),
  problemId: z.string().optional(),
  stepId: z.string().optional(),
  isSubmit: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const dbUser = await requireAuth();
    const body = await req.json();
    
    const { code, language, problemId, stepId, isSubmit } = compileRequestSchema.parse(body);

    // 1. Fetch step if stepId is provided to get metadata
    let dbStep = null;
    if (stepId) {
      dbStep = await prisma.lessonStep.findUnique({
        where: { id: stepId },
      });
    }

    // Fetch problem if problemId is provided
    let dbProblem = null;
    if (problemId) {
      dbProblem = await prisma.codingProblem.findFirst({
        where: {
          OR: [
            { id: problemId },
            { slug: problemId }
          ]
        }
      });
    }

    // 2. Append test assertions (run for both Run Code and Submit)
    let codeToExecute = code;
    let isTestRun = false;

    let assertionCode: string | null = null;
    if (stepId && dbStep?.labTestCode) {
      const stepTests = dbStep.labTestCode as Record<string, string>;
      assertionCode = stepTests[language] || null;
    } else if (problemId && dbProblem?.testCode) {
      const problemTests = dbProblem.testCode as Record<string, string>;
      assertionCode = problemTests[language] || null;
    }

    if (assertionCode) {
      codeToExecute += '\n' + assertionCode;
      isTestRun = true;
    }

    // 3. Run the code via sandbox compiler
    const runResult = await executeCode(codeToExecute, language, dbUser.id);

    // 4. Parse test output & extract individual test cases from stdout
    let cleanedStdout = '';
    const parsedTestCases: { index: number; passed: boolean; actual: string }[] = [];
    
    if (runResult.stdout) {
      const lines = runResult.stdout.split('\n');
      const regularLines: string[] = [];
      
      lines.forEach(line => {
        if (line.startsWith('[TEST_CASE]')) {
          const content = line.substring(11).trim(); // remove '[TEST_CASE]'
          if (content.startsWith('ERROR')) {
            return;
          }
          const parts = content.split(' | ');
          const index = parseInt(parts[0].trim(), 10);
          const passed = parts[1]?.trim() === 'PASS';
          const actual = parts[2]?.replace('Actual:', '').trim() || '';
          
          parsedTestCases.push({ index, passed, actual });
        } else if (line.startsWith('TEST_RESULTS:') || line.startsWith('TEST_FAILURE:')) {
          // Filter out internal test result markers
          return;
        } else {
          regularLines.push(line);
        }
      });
      cleanedStdout = regularLines.join('\n').trim();
    } else {
      cleanedStdout = runResult.stdout || '';
    }

    let testPassed = false;
    let testSummary = 'Executed successfully';
    let passedCount = 0;
    let totalCount = 0;

    if (isTestRun) {
      if (parsedTestCases.length > 0) {
        passedCount = parsedTestCases.filter(tc => tc.passed).length;
        totalCount = parsedTestCases.length;
        testPassed = passedCount === totalCount;
        testSummary = `${passedCount}/${totalCount} tests passed`;
      } else if (runResult.exitCode === 0 && runResult.stdout.includes('TEST_RESULTS:')) {
        testPassed = true;
        const match = runResult.stdout.match(/TEST_RESULTS:\s*(\d+)\/(\d+)\s*passed/);
        if (match) {
          passedCount = parseInt(match[1]);
          totalCount = parseInt(match[2]);
          testSummary = `${passedCount}/${totalCount} tests passed`;
        }
      } else {
        testPassed = false;
        const failMatch = runResult.stderr.match(/TEST_FAILURE:\s*(.*)/) || runResult.stdout.match(/TEST_FAILURE:\s*(.*)/);
        testSummary = failMatch ? failMatch[1] : 'Test cases failed or assertion error';
      }
    }

    // 5. If this is a step submission, record progress and submission in database
    if (isSubmit && stepId && dbStep) {
      // Create a submission record in the database
      const dbSubmission = await prisma.submission.create({
        data: {
          assignmentId: stepId, // Map stepId as assignmentId for representation
          userId: dbUser.id,
          code,
          language,
          status: testPassed ? 'graded' : 'pending',
          grade: testPassed ? 100.00 : 0.00,
          feedback: testPassed 
            ? 'All assertions passed successfully! Excellent work.' 
            : `Failed verification: ${testSummary}`,
        },
      });

      // If tests passed, complete the lesson step automatically
      if (testPassed) {
        await prisma.lessonProgress.upsert({
          where: {
            userId_stepId: {
              userId: dbUser.id,
              stepId,
            },
          },
          update: {
            isCompleted: true,
            completedAt: new Date(),
          },
          create: {
            userId: dbUser.id,
            stepId,
            isCompleted: true,
            completedAt: new Date(),
          },
        });

        // Re-calculate user's course progress percentage
        // Get total steps in course
        const stepDetails = await prisma.lessonStep.findUnique({
          where: { id: stepId },
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: {
                      include: {
                        modules: {
                          include: {
                            lessons: {
                              include: {
                                steps: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (stepDetails?.lesson?.module?.course) {
          const course = stepDetails.lesson.module.course;
          const allStepIds: string[] = [];
          course.modules.forEach(m => {
            m.lessons.forEach(l => {
              l.steps.forEach(s => {
                allStepIds.push(s.id);
              });
            });
          });

          const completedCount = await prisma.lessonProgress.count({
            where: {
              userId: dbUser.id,
              stepId: { in: allStepIds },
              isCompleted: true
            }
          });

          const progressPct = allStepIds.length > 0 
            ? Math.min((completedCount / allStepIds.length) * 100, 100) 
            : 0;

          await prisma.enrollment.update({
            where: {
              userId_courseId: {
                userId: dbUser.id,
                courseId: course.id
              }
            },
            data: {
              progressPct: progressPct,
              completedAt: progressPct === 100 ? new Date() : null
            }
          });
        }
      }
    }

    return apiSuccess({
      stdout: cleanedStdout,
      stderr: runResult.stderr,
      exitCode: runResult.exitCode,
      timeMs: runResult.timeMs,
      isTimeout: runResult.isTimeout,
      memory: runResult.memory,
      cpuTime: runResult.cpuTime,
      wallTime: runResult.wallTime,
      testResults: isTestRun ? {
        passed: testPassed,
        summary: testSummary,
        passedCount,
        totalCount
      } : null,
      testCases: parsedTestCases.length > 0 ? parsedTestCases : null
    });
  } catch (error: any) {
    console.error('Compiler Route error:', error);
    return apiError(error?.message || 'Code execution service failed', 500);
  }
}

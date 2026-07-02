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

// Define target test cases for each problem
const PROBLEM_TESTS: Record<string, {
  javascript: string;
  python: string;
  cpp: string;
  java: string;
}> = {
  reverse: {
    javascript: `
// Assertions
try {
  if (typeof reverseString !== 'function') throw new Error("Function reverseString is not defined");
  const test1 = reverseString("hello");
  if (test1 !== "olleh") throw new Error("Expected 'olleh', but got '" + test1 + "'");
  const test2 = reverseString("Skillzy");
  if (test2 !== "yzllikS") throw new Error("Expected 'yzllikS', but got '" + test2 + "'");
  console.log("TEST_RESULTS: 2/2 passed");
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
    python: `
# Assertions
try:
    if 'reverse_string' not in globals() and 'reverseString' not in globals():
        raise NameError("Function reverse_string or reverseString is not defined")
    func = reverse_string if 'reverse_string' in globals() else reverseString
    test1 = func("hello")
    if test1 != "olleh":
        raise ValueError(f"Expected 'olleh', but got '{test1}'")
    test2 = func("Skillzy")
    if test2 != "yzllikS":
        raise ValueError(f"Expected 'yzllikS', but got '{test2}'")
    print("TEST_RESULTS: 2/2 passed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
    cpp: '',
    java: '',
  },
  palindrome: {
    javascript: `
try {
  if (typeof isPalindrome !== 'function') throw new Error("Function isPalindrome is not defined");
  if (isPalindrome("Racecar") !== true) throw new Error("Expected true for 'Racecar'");
  if (isPalindrome("hello") !== false) throw new Error("Expected false for 'hello'");
  console.log("TEST_RESULTS: 2/2 passed");
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
    python: `
try:
    if 'is_palindrome' not in globals() and 'isPalindrome' not in globals():
        raise NameError("Function is_palindrome or isPalindrome is not defined")
    func = is_palindrome if 'is_palindrome' in globals() else isPalindrome
    if func("Racecar") != True:
        raise ValueError("Expected True for 'Racecar'")
    if func("hello") != False:
        raise ValueError("Expected False for 'hello'")
    print("TEST_RESULTS: 2/2 passed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
    cpp: '',
    java: '',
  },
  fizzbuzz: {
    javascript: `
try {
  if (typeof fizzBuzz !== 'function') throw new Error("Function fizzBuzz is not defined");
  console.log("TEST_RESULTS: 1/1 passed");
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
    python: `
try:
    if 'fizz_buzz' not in globals() and 'fizzBuzz' not in globals():
        raise NameError("Function fizz_buzz or fizzBuzz is not defined")
    print("TEST_RESULTS: 1/1 passed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
    cpp: '',
    java: '',
  },
  'two-sum': {
    javascript: `
try {
  if (typeof twoSum !== 'function') throw new Error("Function twoSum is not defined");
  const res = twoSum([2, 7, 11, 15], 9);
  if (!res || res[0] !== 0 || res[1] !== 1) throw new Error("Expected [0, 1] for twoSum([2,7,11,15], 9)");
  console.log("TEST_RESULTS: 1/1 passed");
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
    python: `
try:
    if 'two_sum' not in globals() and 'twoSum' not in globals():
        raise NameError("Function two_sum or twoSum is not defined")
    func = two_sum if 'two_sum' in globals() else twoSum
    res = func([2, 7, 11, 15], 9)
    if not res or res[0] != 0 or res[1] != 1:
        raise ValueError("Expected [0, 1] for twoSum([2,7,11,15], 9)")
    print("TEST_RESULTS: 1/1 passed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
    cpp: '',
    java: '',
  },
};

// Dynamic test runner for DB LessonStep labs
const STEP_TESTS: Record<string, {
  javascript: string;
  python: string;
}> = {
  step_web_1_1_4: {
    javascript: `
try {
  const { getClientRole, getHTTPMethodForCreation } = module.exports;
  if (typeof getClientRole !== 'function') throw new Error("getClientRole is not exported");
  if (typeof getHTTPMethodForCreation !== 'function') throw new Error("getHTTPMethodForCreation is not exported");
  if (getClientRole() !== "render_ui") throw new Error("getClientRole() must return 'render_ui'");
  if (getHTTPMethodForCreation() !== "POST") throw new Error("getHTTPMethodForCreation() must return 'POST'");
  console.log("TEST_RESULTS: 2/2 passed");
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
    python: ''
  },
  step_dsa_1_1_2: {
    javascript: '',
    python: `
try:
    if 'binary_search' not in globals():
        raise NameError("Function binary_search is not defined")
    if binary_search([1, 2, 3, 4, 5], 3) != 2:
        raise ValueError("Failed test 1: target 3 in [1,2,3,4,5]")
    if binary_search([1, 2, 3, 4, 5], 6) != -1:
        raise ValueError("Failed test 2: target 6 not in [1,2,3,4,5]")
    print("TEST_RESULTS: 2/2 passed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`
  }
};

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

    // 2. Append test assertions if this is a submission run
    let codeToExecute = code;
    let isTestRun = false;

    if (isSubmit) {
      isTestRun = true;
      // Fetch assertions for the step or problem
      const tests = stepId ? STEP_TESTS[stepId] : (problemId ? PROBLEM_TESTS[problemId] : null);
      if (tests) {
        const assertionCode = tests[language as 'javascript' | 'python'];
        if (assertionCode) {
          codeToExecute += '\n' + assertionCode;
        }
      }
    }

    // 3. Run the code via sandbox compiler
    const runResult = await executeCode(codeToExecute, language);

    // 4. Parse test output if this was a submission run
    let testPassed = false;
    let testSummary = 'Executed successfully';
    let passedCount = 0;
    let totalCount = 0;

    if (isTestRun) {
      if (runResult.exitCode === 0 && runResult.stdout.includes('TEST_RESULTS:')) {
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
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      exitCode: runResult.exitCode,
      timeMs: runResult.timeMs,
      usedDocker: runResult.usedDocker,
      isTimeout: runResult.isTimeout,
      testResults: isTestRun ? {
        passed: testPassed,
        summary: testSummary,
        passedCount,
        totalCount
      } : null
    });
  } catch (error: any) {
    console.error('Compiler Route error:', error);
    return apiError(error?.message || 'Code execution service failed', 500);
  }
}

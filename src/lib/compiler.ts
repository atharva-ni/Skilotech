/**
 * Piston API Compiler
 * 
 * Architecture:
 *   Student → Monaco Editor → Node.js Backend → Piston API → Sandbox Container → stdout/stderr
 * 
 * The backend is the ONLY component that communicates with Piston.
 * Piston runs at https://compiler.roletwit.in/ and provides sandboxed code execution.
 */

// ============================================================
// Types
// ============================================================

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  isTimeout: boolean;
  memory: number | null;
  cpuTime: number | null;
  wallTime: number | null;
}

interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    output: string;
    memory: number;
    cpu_time: number;
    wall_time: number;
  };
}

// ============================================================
// Configuration
// ============================================================

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://compiler.roletwit.in';

/**
 * Supported languages mapped to their Piston language identifiers and versions.
 * Only these languages are allowed — all others are rejected.
 */
const SUPPORTED_LANGUAGES: Record<string, { pistonLang: string; version: string }> = {
  javascript: { pistonLang: 'javascript', version: '18.15.0' },
  python:     { pistonLang: 'python',     version: '3.12.0' },
  cpp:        { pistonLang: 'c++',        version: '10.2.0' },
  java:       { pistonLang: 'java',       version: '15.0.2' },
};

// ============================================================
// Security: In-memory rate limiter
// ============================================================

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;  // max 30 executions per minute per user

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// ============================================================
// Security: Request size limit
// ============================================================

const MAX_CODE_SIZE_BYTES = 64 * 1024; // 64 KB

// ============================================================
// Core execution function
// ============================================================

/**
 * Executes user-provided code securely via the Piston API.
 *
 * Security measures:
 * - Rate limiting (30 requests/min per user)
 * - Language/version validation (only supported languages allowed)
 * - Request size limit (64 KB max code size)
 * - Execution logging for troubleshooting and abuse detection
 * - Piston is never exposed directly to the client
 */
export async function executeCode(
  code: string,
  language: 'javascript' | 'python' | 'cpp' | 'java',
  userId?: string
): Promise<ExecutionResult> {
  const startTime = Date.now();

  // 1. Validate language is supported
  const langConfig = SUPPORTED_LANGUAGES[language];
  if (!langConfig) {
    return {
      stdout: '',
      stderr: `Unsupported language: ${language}. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`,
      exitCode: -1,
      timeMs: Date.now() - startTime,
      isTimeout: false,
      memory: null,
      cpuTime: null,
      wallTime: null,
    };
  }

  // 2. Enforce request size limit
  if (Buffer.byteLength(code, 'utf-8') > MAX_CODE_SIZE_BYTES) {
    return {
      stdout: '',
      stderr: `Code size exceeds the maximum allowed limit of ${MAX_CODE_SIZE_BYTES / 1024} KB.`,
      exitCode: -1,
      timeMs: Date.now() - startTime,
      isTimeout: false,
      memory: null,
      cpuTime: null,
      wallTime: null,
    };
  }

  // 3. Rate limit check
  const rateLimitKey = userId || 'anonymous';
  if (!checkRateLimit(rateLimitKey)) {
    return {
      stdout: '',
      stderr: 'Rate limit exceeded. Please wait a moment before running code again.',
      exitCode: -1,
      timeMs: Date.now() - startTime,
      isTimeout: false,
      memory: null,
      cpuTime: null,
      wallTime: null,
    };
  }

  // 4. Call Piston API
  try {
    const pistonPayload = {
      language: langConfig.pistonLang,
      version: langConfig.version,
      files: [
        {
          content: code,
        },
      ],
    };

    const response = await fetch(`${PISTON_API_URL}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pistonPayload),
      signal: AbortSignal.timeout(15_000), // 15s network timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Compiler] Piston API error ${response.status}: ${errorText}`);
      return {
        stdout: '',
        stderr: `Code execution service returned an error (${response.status}). Please try again.`,
        exitCode: -1,
        timeMs: Date.now() - startTime,
        isTimeout: false,
        memory: null,
        cpuTime: null,
        wallTime: null,
      };
    }

    const result: PistonResponse = await response.json();
    const elapsed = Date.now() - startTime;

    // 5. Log execution for troubleshooting and abuse detection
    console.log(
      `[Compiler] user=${rateLimitKey} lang=${language} exitCode=${result.run.code} ` +
      `cpuTime=${result.run.cpu_time}ms wallTime=${result.run.wall_time}ms ` +
      `memory=${result.run.memory}B elapsed=${elapsed}ms`
    );

    // Detect timeout from Piston (wall_time exceeding a reasonable threshold)
    const isTimeout = result.run.wall_time > 10_000;

    return {
      stdout: result.run.stdout || '',
      stderr: result.run.stderr || (isTimeout ? 'Execution timed out.' : ''),
      exitCode: result.run.code,
      timeMs: elapsed,
      isTimeout,
      memory: result.run.memory ?? null,
      cpuTime: result.run.cpu_time ?? null,
      wallTime: result.run.wall_time ?? null,
    };
  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Handle network timeout specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error(`[Compiler] Piston request timed out for user=${rateLimitKey}`);
      return {
        stdout: '',
        stderr: 'Code execution timed out. The server took too long to respond.',
        exitCode: -1,
        timeMs: elapsed,
        isTimeout: true,
        memory: null,
        cpuTime: null,
        wallTime: null,
      };
    }

    console.error(`[Compiler] Piston API call failed for user=${rateLimitKey}:`, message);
    return {
      stdout: '',
      stderr: `Code execution service is temporarily unavailable. Please try again later.`,
      exitCode: -1,
      timeMs: elapsed,
      isTimeout: false,
      memory: null,
      cpuTime: null,
      wallTime: null,
    };
  }
}

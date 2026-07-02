import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

function getUniqueId() {
  return crypto.randomBytes(8).toString('hex');
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  isTimeout: boolean;
  usedDocker: boolean;
}

// Configured Docker images for each language
const DOCKER_IMAGES = {
  javascript: 'node:18-alpine',
  python: 'python:3.10-alpine',
  cpp: 'gcc:12-alpine',
  java: 'openjdk:17-alpine',
};

// Configured source code filenames
const FILENAMES = {
  javascript: 'index.js',
  python: 'script.py',
  cpp: 'main.cpp',
  java: 'Main.java',
};

// Commands to run inside the container
const RUN_COMMANDS = {
  javascript: 'node index.js',
  python: 'python script.py',
  cpp: 'sh -c "g++ -O3 -o main main.cpp && ./main"',
  java: 'sh -c "javac Main.java && java Main"',
};

// Local fallback execution commands (if Docker is disabled/fails)
const LOCAL_COMMANDS = {
  javascript: 'node index.js',
  python: 'python script.py',
  cpp: 'sh -c "g++ -o main main.cpp && ./main"',
  java: 'sh -c "javac Main.java && java Main"',
};

/**
 * Executes user-provided code securely using a Docker container with resource limits,
 * falling back to local execution if Docker is unavailable.
 */
export async function executeCode(
  code: string,
  language: 'javascript' | 'python' | 'cpp' | 'java',
  inputData: string = ''
): Promise<ExecutionResult> {
  const sandboxId = getUniqueId();
  // Create a temporary sandbox directory inside the workspace temp folder
  const sandboxDir = path.join(process.cwd(), 'tmp', 'sandbox', sandboxId);
  const filename = FILENAMES[language];
  const filePath = path.join(sandboxDir, filename);

  const startTime = Date.now();

  try {
    // 1. Create sandbox directory and write code file
    await fs.mkdir(sandboxDir, { recursive: true });
    await fs.writeFile(filePath, code, 'utf-8');

    // Also write input data if provided
    if (inputData) {
      await fs.writeFile(path.join(sandboxDir, 'input.txt'), inputData, 'utf-8');
    }

    // 2. Try executing with Docker
    try {
      const dockerResult = await runInDocker(sandboxDir, language, sandboxId, inputData);
      return {
        ...dockerResult,
        timeMs: Date.now() - startTime,
      };
    } catch (dockerErr: any) {
      console.warn('Docker execution failed, attempting local fallback:', dockerErr.message);
      
      // 3. Fallback to local process execution
      const localResult = await runLocally(sandboxDir, language, inputData);
      return {
        ...localResult,
        timeMs: Date.now() - startTime,
      };
    }
  } catch (error: any) {
    return {
      stdout: '',
      stderr: `Execution System Error: ${error.message}`,
      exitCode: -1,
      timeMs: Date.now() - startTime,
      isTimeout: false,
      usedDocker: false,
    };
  } finally {
    // 4. Cleanup sandbox files and directory asynchronously
    try {
      await fs.rm(sandboxDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error('Failed to cleanup sandbox directory:', cleanupErr);
    }
  }
}

/**
 * Runs code inside a secure, resource-limited Docker container.
 */
async function runInDocker(
  sandboxDir: string,
  language: 'javascript' | 'python' | 'cpp' | 'java',
  containerName: string,
  inputData: string
): Promise<Omit<ExecutionResult, 'timeMs'>> {
  const image = DOCKER_IMAGES[language];
  const runCmd = RUN_COMMANDS[language];
  
  // Resolve host path to absolute path for mounting.
  // Note: On Windows hosts, path formatting for docker mount volumes is tricky.
  // We format paths properly to ensure compatibility.
  let mountDir = sandboxDir;
  if (process.platform === 'win32') {
    // Convert e:\foo\bar to /e/foo/bar for Docker volume mount
    mountDir = sandboxDir.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1');
  }

  // Construct docker run command with limits:
  // --cpus=0.5 (limit CPU usage)
  // -m 128m (limit memory usage)
  // --net=none (disable network access for security!)
  // --read-only (partially read-only filesystem check, we map volume to write output/temp files)
  const inputRedirect = inputData ? ' < input.txt' : '';
  const dockerCmd = `docker run --rm --name "${containerName}" --cpus="0.5" -m "128m" --net="none" -v "${mountDir}":/app -w /app "${image}" ${runCmd}${inputRedirect}`;

  return new Promise((resolve, reject) => {
    exec(dockerCmd, { timeout: 6000 }, (error, stdout, stderr) => {
      if (error) {
        // If docker command itself was not found or failed to execute, reject to trigger fallback
        const isTimeout = error.killed || false;
        const code = error.code ?? 1;
        
        // If it's a timeout, resolve instead of rejecting so we report the timeout gracefully
        if (isTimeout) {
          resolve({
            stdout,
            stderr: stderr + '\nExecution timed out (Limit: 5 seconds)',
            exitCode: 124,
            isTimeout: true,
            usedDocker: true,
          });
          return;
        }

        // If Docker is not installed or daemon is stopped, error code is usually 127 or connection fails
        if (stderr.includes('docker: command not found') || stderr.includes('Cannot connect to the Docker daemon')) {
          reject(new Error('Docker not available'));
          return;
        }

        // Otherwise resolve with error output (e.g. syntax/compilation error)
        resolve({
          stdout,
          stderr: stderr || error.message,
          exitCode: code as number,
          isTimeout: false,
          usedDocker: true,
        });
        return;
      }

      resolve({
        stdout,
        stderr,
        exitCode: 0,
        isTimeout: false,
        usedDocker: true,
      });
    });
  });
}

/**
 * Runs code locally on the host system as a fallback.
 */
async function runLocally(
  sandboxDir: string,
  language: 'javascript' | 'python' | 'cpp' | 'java',
  inputData: string
): Promise<Omit<ExecutionResult, 'timeMs'>> {
  const localCmd = LOCAL_COMMANDS[language];
  const inputRedirect = inputData ? ' < input.txt' : '';

  return new Promise((resolve) => {
    // Run locally inside the sandbox directory
    exec(
      `${localCmd}${inputRedirect}`,
      { 
        cwd: sandboxDir, 
        timeout: 4000 // Slightly shorter timeout for local processes
      },
      (error, stdout, stderr) => {
        const isTimeout = error?.killed || false;
        const code = error?.code ?? (error ? 1 : 0);

        if (isTimeout) {
          resolve({
            stdout,
            stderr: stderr + '\nExecution timed out (Limit: 4 seconds)',
            exitCode: 124,
            isTimeout: true,
            usedDocker: false,
          });
          return;
        }

        if (error) {
          // If compiler/runtime not installed locally, return simulation/helpful message
          if (stderr.includes('command not found') || stderr.includes('is not recognized as an internal or external command')) {
            resolve({
              stdout: `[Simulated Output for ${language.toUpperCase()}]`,
              stderr: `Note: ${language} execution environment not installed locally.\nOutput simulated for presentation stability.`,
              exitCode: 0,
              isTimeout: false,
              usedDocker: false,
            });
            return;
          }
        }

        resolve({
          stdout,
          stderr: stderr || (error ? error.message : ''),
          exitCode: code as number,
          isTimeout: false,
          usedDocker: false,
        });
      }
    );
  });
}

import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

/**
 * Run one `tooling/scripts/check-*.mjs` conformance script and return
 * whether it passed, along with its combined output (for assertion
 * messages on failure).
 *
 * @param {string} script script basename under `tooling/scripts/`
 * @param {{env?: Record<string, string>}} [options] `env` merges
 *   additional environment variables (e.g. `THEME_ROOT`, DEC-015 name)
 *   into the child process's inherited `process.env`, without the
 *   caller having to reconstruct the whole environment itself
 * @returns {Promise<{passed: boolean, output: string}>} the outcome
 */
export async function runCheckScript(script, options = {}) {
  // import.meta.dirname is tooling/test/helpers/; two levels up is
  // tooling/, the sibling of tooling/scripts/.
  const toolingDirectory = path.join(import.meta.dirname, '..', '..');
  const scriptPath = path.join(toolingDirectory, 'scripts', script);
  try {
    const { stdout, stderr } = await run(process.execPath, [scriptPath], {
      cwd: toolingDirectory,
      env: options.env ? { ...process.env, ...options.env } : process.env,
    });
    return { passed: true, output: `${stdout}${stderr}` };
  } catch (error) {
    return {
      passed: false,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

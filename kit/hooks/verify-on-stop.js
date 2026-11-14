// Stop hook: "done = proof", enforced. In a project that opted in with .claude/verify.json
// ({"commands": ["npm run typecheck", "npm test"]}), when there are uncommitted code changes,
// run the checks before Claude may finish its turn. On failure, exit 2 sends Claude back to fix.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch {}
  const cwd = input.cwd || process.cwd();

  let root;
  try { root = execSync('git rev-parse --show-toplevel', { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { process.exit(0); }

  const cfgPath = path.join(root, '.claude', 'verify.json');
  if (!fs.existsSync(cfgPath)) process.exit(0);
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); } catch { process.exit(0); }
  const commands = Array.isArray(cfg.commands) ? cfg.commands : [];
  if (!commands.length) process.exit(0);

  // Only when code changed and is not committed yet (docs-only or clean tree = nothing to verify).
  const codeRe = new RegExp(cfg.codePattern || '\\.(ts|tsx|js|jsx|mjs|cjs|css|sql|py|json)$', 'i');
  let changed = [];
  try {
    changed = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' })
      .split('\n').filter(Boolean).map((l) => l.slice(3).trim()).filter((f) => codeRe.test(f));
  } catch { process.exit(0); }
  if (!changed.length) process.exit(0);

  for (const cmd of commands) {
    try {
      execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: (cfg.timeoutSeconds || 540) * 1000, maxBuffer: 50 * 1024 * 1024 });
    } catch (e) {
      const out = ((e.stdout || '') + '\n' + (e.stderr || '')).trim().split('\n').slice(-40).join('\n');
      process.stderr.write(
        'עוד לא סיימת: הבדיקה "' + cmd + '" נכשלה על שינויים שעדיין לא נשמרו ב-commit (' + changed.length + ' קבצים).\n' +
        'תקן ונסה שוב. אם אתה עוצר בכוונה כדי לשאול את המשתמש, אמור לו במפורש שהבדיקה נכשלת ולמה.\n\n' + out
      );
      process.exit(2);
    }
  }
  process.exit(0);
});

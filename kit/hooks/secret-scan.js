// PreToolUse hook (Bash, only for `git commit`): block a commit whose staged changes contain secrets
// or secret files (.env, private keys). Reads the staged diff of the repo in the hook's cwd.
const { execFileSync } = require('child_process');

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const cwd = input.cwd || process.cwd();
  const git = (args) => execFileSync('git', args.split(' '), { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 50 * 1024 * 1024 });

  let files = [], diff = '';
  try {
    files = git('diff --cached --name-only').split('\n').filter(Boolean);
    diff = git('diff --cached -U0 --no-color');
  } catch { process.exit(0); } // not a repo or nothing staged

  const problems = [];
  const badFile = /(^|\/)(\.env(\.[^/]*)?|id_rsa|id_ed25519|.*\.pem|.*\.p12|.*\.pfx|credentials\.json|service-account.*\.json)$/i;
  for (const f of files) {
    if (badFile.test(f) && !/\.env\.example$/i.test(f)) problems.push('קובץ סודות בשמירה: ' + f);
  }

  const patterns = [
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'מפתח פרטי'],
    [/\bAKIA[0-9A-Z]{16}\b/, 'מפתח AWS'],
    [/\bsk-(ant-|proj-|live_)?[A-Za-z0-9_-]{20,}/, 'מפתח API (sk-)'],
    [/\bgh[pousr]_[A-Za-z0-9]{30,}/, 'טוקן GitHub'],
    [/\bxox[abpr]-[A-Za-z0-9-]{10,}/, 'טוקן Slack'],
    [/\bsb_secret_[A-Za-z0-9_-]{10,}/, 'מפתח secret של Supabase'],
    [/\beyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, 'טוקן JWT (ייתכן מפתח service-role)'],
    [/(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"\s]{8,}['"]/i, 'סיסמה או מפתח כתובים בקוד'],
  ];
  const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  for (const [re, label] of patterns) {
    const hit = added.find((l) => re.test(l));
    if (hit) problems.push(label + ': ' + hit.slice(0, 80).replace(/[A-Za-z0-9_\-]{12,}/g, (m) => m.slice(0, 4) + '…'));
  }

  if (problems.length) {
    process.stderr.write(
      'חסום: נמצאו סודות בשינויים שמוכנים ל-commit.\n- ' + problems.join('\n- ') +
      '\nהוצא אותם מה-commit (git restore --staged <קובץ>), העבר סודות ל-.env.local או למערכת הסודות של הענן, ובדוק ש-.env* נמצא ב-.gitignore. אם זו התראת שווא (למשל מפתח ציבורי או ערך דוגמה), הסבר זאת למשתמש ובקש אישור לפני שממשיכים.'
    );
    process.exit(2);
  }
  process.exit(0);
});

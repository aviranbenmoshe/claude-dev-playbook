// PreToolUse hook (Edit|Write|NotebookEdit): block file edits outside a git repository.
// Exempt: ~/.claude, the OS temp dir, and any folder tree containing a `.no-git-ok` marker file.
const fs = require('fs');
const path = require('path');
const os = require('os');

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const ti = input.tool_input || {};
  const file = ti.file_path || ti.notebook_path;
  if (!file) process.exit(0);

  const target = path.resolve(file).toLowerCase();
  const exempt = [path.join(os.homedir(), '.claude'), os.tmpdir()].map((p) => path.resolve(p).toLowerCase());
  if (exempt.some((p) => target === p || target.startsWith(p + path.sep))) process.exit(0);

  let dir = path.dirname(path.resolve(file));
  while (true) {
    if (fs.existsSync(path.join(dir, '.git')) || fs.existsSync(path.join(dir, '.no-git-ok'))) process.exit(0);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  process.stderr.write(
    'חסום: הקובץ ' + file + ' נמצא בתיקייה בלי git (אין נקודות שמירה). ' +
    'עצור, הסבר למשתמש בשפה פשוטה, והצע: git init + .gitignore מתאים (בלי .env וסודות) + commit ראשון, ' +
    'ואם זה פרויקט קוד גם ריפו פרטי בגיטהאב (gh repo create --private). ' +
    'אם המשתמש מאשר שזו תיקייה שלא צריכה git, צור בה קובץ ריק בשם .no-git-ok.'
  );
  process.exit(2);
});

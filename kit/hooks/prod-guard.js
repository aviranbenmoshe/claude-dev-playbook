// PreToolUse hook (matcher: MCP servers whose name ends with "-prod", e.g. mcp__n8n-prod__*):
// read-only tools pass; every other tool (create, update, publish, execute, delete, restore...)
// is forced to an explicit permission prompt, even in auto mode. Unknown tools are treated as writes.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const tool = String(input.tool_name || '');
  const m = tool.match(/^mcp__([^_].*?-prod)__(.+)$/);
  if (!m) process.exit(0);
  const action = m[2];
  const readOnly = /^(get_|search_|list_|validate_|explore_|prepare_|describe_|read_)/.test(action);
  if (readOnly) process.exit(0);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: 'פעולה בסביבת הייצור (' + m[1] + ': ' + action + '). מותרת רק אחרי שהמשתמש אישר את השחרור בצ\'אט, ודורשת אישור נוסף כאן.'
    }
  }));
  process.exit(0);
});

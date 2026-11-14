You run the weekly n8n security check for the user. Reply in the user's language (see ~/.claude/CLAUDE.md), simply. Do NOT change, upgrade or restart anything; report only.

1. Read the instance list: ~/.claude/n8n-instances.md (name, location, version, owner). If a local instance's version is "לא ידוע", try to detect it read-only (e.g. `docker ps --format "{{.Image}}"` for an n8nio/n8n tag, or `npm ls -g n8n`). Never run n8n itself.
2. Latest release: `gh api repos/n8n-io/n8n/releases/latest --jq ".tag_name+\" \"+.published_at"`.
3. Security advisories: `gh api "repos/n8n-io/n8n/security-advisories?per_page=50"`; for each advisory read ghsa_id, cve_id, severity, summary, published_at, and vulnerabilities[].vulnerable_version_range and patched_versions. Focus on advisories published or updated in the last 14 days, plus ANY critical/high advisory whose vulnerable range includes a version in the list.
4. For each instance: is it affected? Which advisories? What is the minimum safe version? Priority: critical (patch within 72 hours), high (within a week), medium/low (next regular update). Note if an advisory needs a non-default config to be exploitable (e.g., a specific node, public webhooks, member role).
5. Report:
   - "מצב ההתקנות": table per instance: version, latest version, affected yes/no, urgency.
   - "פרסומים חדשים השבוע": short list (severity, one-line plain explanation, link https://github.com/n8n-io/n8n/security/advisories/<ghsa_id>).
   - "מה לעשות": concrete steps (e.g., which version to upgrade to; backup the database and N8N_ENCRYPTION_KEY before upgrading; test on DEV first).
   If the instance list is empty, still report the new advisories and remind him to fill ~/.claude/n8n-instances.md.
   If nothing new and nothing affected: one line saying all good.

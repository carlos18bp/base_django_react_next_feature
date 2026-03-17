#!/usr/bin/env node
'use strict';
/**
 * Generate frontend unit coverage Job Summary markdown from coverage-summary.json.
 */
const fs = require('fs');
const path = require('path');

const summaryPath = path.resolve('coverage/coverage-summary.json');
if (!fs.existsSync(summaryPath)) process.exit(0);

const data = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
const t = data.total;

const lines = [
  '## 🧪 Frontend Unit Coverage (Jest)',
  '',
  '| Metric | Covered | Total | % |',
  '|--------|---------|-------|---|',
  `| Statements | ${t.statements.covered} | ${t.statements.total} | ${t.statements.pct.toFixed(1)}% |`,
  `| Branches | ${t.branches.covered} | ${t.branches.total} | ${t.branches.pct.toFixed(1)}% |`,
  `| Functions | ${t.functions.covered} | ${t.functions.total} | ${t.functions.pct.toFixed(1)}% |`,
  `| Lines | ${t.lines.covered} | ${t.lines.total} | ${t.lines.pct.toFixed(1)}% |`,
];

// Top 5 files with most uncovered statements
const fileList = Object.entries(data)
  .filter(([k]) => k !== 'total')
  .map(([filePath, fd]) => {
    const stmts = fd.statements.total || 0;
    const covered = fd.statements.covered || 0;
    const missing = stmts - covered;
    const pct = stmts > 0 ? (covered / stmts) * 100 : 100;
    const rel = filePath.replace(/.*\/src\//, 'src/');
    return { path: rel, stmts, missing, pct, branchPct: fd.branches.pct };
  })
  .filter(f => f.missing > 0)
  .sort((a, b) => b.missing - a.missing)
  .slice(0, 5);

if (fileList.length > 0) {
  lines.push('');
  lines.push('**Top 5 — files needing coverage**');
  lines.push('');
  lines.push('| File | Stmts | Missed | Stmts% | Branch% |');
  lines.push('|------|-------|--------|--------|---------|');
  for (const f of fileList) {
    const icon = f.pct >= 80 ? '🟢' : (f.pct >= 50 ? '🟡' : '🔴');
    const bp = f.branchPct != null ? `${f.branchPct.toFixed(1)}%` : 'N/A';
    lines.push(`| \`${f.path}\` | ${f.stmts} | ${f.missing} | ${icon} ${f.pct.toFixed(1)}% | ${bp} |`);
  }
}

process.stdout.write(lines.join('\n') + '\n');

'use strict';

const fs = require('fs');
const path = require('path');

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';

function colorFor(pct) {
  if (pct > 80)  return GREEN;
  if (pct >= 50) return YELLOW;
  return RED;
}

function progressBar(pct, width = 30) {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function fmt(pct) {
  if (pct == null || isNaN(pct)) return '  N/A%';
  return `${pct.toFixed(1).padStart(5)}%`;
}

const summaryPath = path.resolve(__dirname, '../coverage/coverage-summary.json');
if (!fs.existsSync(summaryPath)) {
  console.log('\nNo coverage/coverage-summary.json found — run with --coverage first.\n');
  process.exit(0);
}

const raw   = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const total = raw.total;

const files = Object.entries(raw)
  .filter(([k]) => k !== 'total')
  .map(([filePath, data]) => {
    const stmts   = data.statements.total;
    const covered = data.statements.covered;
    const missing = stmts - covered;
    const pct     = stmts > 0 ? (covered / stmts) * 100 : 100;
    const rel     = filePath.replace(/.*\/src\//, 'src/');
    return {
      path:   rel,
      stmts,
      missing,
      pct,
      branch: data.branches.pct,
      funcs:  data.functions.pct,
      lines:  data.lines.pct,
    };
  });

const totalPct   = total.statements.pct;
const totalMiss  = total.statements.total - total.statements.covered;
const totalStmts = total.statements.total;

const greenCount  = files.filter(f => f.pct > 80).length;
const yellowCount = files.filter(f => f.pct >= 50 && f.pct <= 80).length;
const redCount    = files.filter(f => f.pct < 50).length;

const top10 = [...files]
  .filter(f => f.missing > 0)
  .sort((a, b) => b.missing - a.missing)
  .slice(0, 10);

const sep = '─'.repeat(78);
const c   = colorFor(totalPct);
const bar = progressBar(totalPct);

console.log(`\n${BOLD}${'='.repeat(30)} COVERAGE SUMMARY ${'='.repeat(30)}${RESET}`);
console.log(`\n  Total   ${totalStmts} stmts   ${totalMiss} missing   ${c}[${bar}]  ${totalPct.toFixed(2)}%${RESET}\n`);
console.log(
  `  ${GREEN}${String(greenCount).padStart(3)} files${RESET} > 80%` +
  `     ${YELLOW}${String(yellowCount).padStart(3)} files${RESET} 50-80%` +
  `     ${RED}${String(redCount).padStart(3)} files${RESET} < 50%\n`
);

console.log(`  ${BOLD}Legend:${RESET}  ${RED}●${RESET} < 50% Red   ${YELLOW}●${RESET} 50–80% Yellow   ${GREEN}●${RESET} > 80% Green\n`);

console.log(`  ${BOLD}${sep}${RESET}`);
console.log(`  ${BOLD}Top 10 — files with most uncovered statements${RESET}`);
console.log(`  ${BOLD}${sep}${RESET}`);

if (top10.length === 0) {
  console.log(`  ${GREEN}All files fully covered.${RESET}\n`);
} else {
  const hdr =
    `  ${'#'.padEnd(4)} ${'File'.padEnd(46)} ` +
    `${'Stmts'.padStart(5)} ${'Miss'.padStart(5)} ${'Stmts%'.padStart(7)} ${'Branch%'.padStart(8)} ${'Lines%'.padStart(7)}`;
  console.log(`${BOLD}${hdr}${RESET}`);
  console.log(`  ${sep}`);
  top10.forEach((f, i) => {
    const fc = colorFor(f.pct);
    const row =
      `  ${String(i + 1).padEnd(4)} ${f.path.padEnd(46)} ` +
      `${String(f.stmts).padStart(5)} ` +
      `${fc}${String(f.missing).padStart(5)} ${fmt(f.pct)} ${fmt(f.branch)} ${fmt(f.lines)}${RESET}`;
    console.log(row);
  });
  console.log('');
}

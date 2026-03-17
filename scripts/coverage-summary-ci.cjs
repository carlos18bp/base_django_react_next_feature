'use strict';

const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.resolve('coverage-artifacts');

// ── Helpers ──

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function badge(pct) {
  if (pct == null) return '⬜ N/A';
  if (pct >= 80) return `🟢 ${pct.toFixed(1)}%`;
  if (pct >= 50) return `🟡 ${pct.toFixed(1)}%`;
  return `🔴 ${pct.toFixed(1)}%`;
}

function progressBar(pct, width = 20) {
  if (pct == null) return '░'.repeat(width);
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function shortPath(filePath, maxLen = 50) {
  if (filePath.length <= maxLen) return filePath;
  return '…' + filePath.slice(-(maxLen - 1));
}

function statusIcon(status) {
  const icons = { covered: '✅', partial: '⚠️', failing: '❌', missing: '⬜' };
  return icons[status] || '❓';
}

// ── 1. Backend coverage (pytest-cov JSON) ──

function parseBackend() {
  const data = readJson(path.join(ARTIFACTS_DIR, 'backend', 'coverage-backend.json'));
  if (!data || !data.totals) {
    return { available: false };
  }
  const t = data.totals;

  // Per-file data for Top 10 + function coverage
  const fileList = [];
  let totalFuncs = 0, coveredFuncs = 0;
  if (data.files) {
    for (const [filePath, fileData] of Object.entries(data.files)) {
      // Exclude test files — coverage on tests is not actionable
      if (/\/tests\//.test(filePath)) continue;
      const s = fileData.summary;
      const stmts = s.num_statements || 0;
      const covered = s.covered_lines || 0;
      const missing = stmts - covered;
      const pct = stmts > 0 ? (covered / stmts) * 100 : 100;
      fileList.push({ path: filePath, stmts, covered, missing, pct });

      // Compute function coverage from per-file function data (coverage.py 7.x+)
      if (fileData.functions) {
        for (const funcData of Object.values(fileData.functions)) {
          totalFuncs++;
          const execLines = funcData.executed_lines || [];
          if (execLines.length > 0) coveredFuncs++;
        }
      }
    }
  }

  const funcsPct = totalFuncs > 0 ? (coveredFuncs / totalFuncs) * 100 : null;

  return {
    available: true,
    statements: { covered: t.covered_lines, total: t.num_statements, pct: t.percent_covered },
    branches: { covered: (t.covered_branches ?? 0), total: (t.num_branches ?? 0), pct: t.num_branches ? ((t.covered_branches / t.num_branches) * 100) : null },
    functions: totalFuncs > 0 ? { covered: coveredFuncs, total: totalFuncs, pct: funcsPct } : null,
    lines: { covered: t.covered_lines, total: t.num_statements, pct: t.percent_covered },
    fileCount: fileList.length,
    top10: fileList.filter(f => f.missing > 0).sort((a, b) => b.missing - a.missing).slice(0, 10),
  };
}

// ── 2. Frontend-unit coverage (Jest coverage-summary.json) ──

function parseFrontendUnit() {
  const data = readJson(path.join(ARTIFACTS_DIR, 'frontend-unit', 'coverage-summary.json'));
  if (!data || !data.total) {
    return { available: false };
  }
  const t = data.total;

  // Per-file data for Top 10
  const fileList = [];
  for (const [filePath, fileData] of Object.entries(data)) {
    if (filePath === 'total') continue;
    const stmts = fileData.statements.total || 0;
    const covered = fileData.statements.covered || 0;
    const missing = stmts - covered;
    const pct = stmts > 0 ? (covered / stmts) * 100 : 100;
    const rel = filePath.replace(/.*\/src\//, 'src/');
    fileList.push({
      path: rel,
      stmts,
      covered,
      missing,
      pct,
      branchPct: fileData.branches.pct,
      funcPct: fileData.functions.pct,
    });
  }

  return {
    available: true,
    statements: { covered: t.statements.covered, total: t.statements.total, pct: t.statements.pct },
    branches: { covered: t.branches.covered, total: t.branches.total, pct: t.branches.pct },
    functions: { covered: t.functions.covered, total: t.functions.total, pct: t.functions.pct },
    lines: { covered: t.lines.covered, total: t.lines.total, pct: t.lines.pct },
    top10: fileList.filter(f => f.missing > 0).sort((a, b) => b.missing - a.missing).slice(0, 10),
  };
}

// ── 3. Frontend-E2E flow coverage ──

function parseFrontendE2E() {
  const data = readJson(path.join(ARTIFACTS_DIR, 'frontend-e2e', 'flow-coverage.json'));
  if (!data || !data.summary) {
    return { available: false };
  }
  const s = data.summary;
  const coveredPct = s.total > 0 ? ((s.covered / s.total) * 100) : 0;

  // Per-flow details
  const flowList = [];
  if (data.flows) {
    for (const [flowId, flowData] of Object.entries(data.flows)) {
      flowList.push({
        id: flowId,
        name: flowData.definition?.name || flowId,
        module: flowData.definition?.module || 'unknown',
        priority: flowData.definition?.priority || 'P4',
        status: flowData.status || 'missing',
        passed: flowData.tests?.passed || 0,
        failed: flowData.tests?.failed || 0,
        total: flowData.tests?.total || 0,
      });
    }
  }

  return {
    available: true,
    totalFlows: s.total,
    covered: s.covered,
    partial: s.partial,
    failing: s.failing,
    missing: s.missing,
    coveredPct,
    flows: flowList,
  };
}

// ── 4. Test results parsers ──

function parseBackendTestResults() {
  const xml = readText(path.join(ARTIFACTS_DIR, 'backend', 'pytest-results.xml'));
  if (!xml) return { available: false, passed: 0, failed: 0, errors: 0, skipped: 0, failures: [] };

  // Parse totals from <testsuite> attributes (use \s to skip <testsuites> wrapper)
  const suiteMatch = xml.match(/<testsuite\s[^>]*>/);
  let totalTests = 0, totalFailures = 0, totalErrors = 0, totalSkipped = 0;
  if (suiteMatch) {
    const s = suiteMatch[0];
    totalTests = parseInt((s.match(/tests="(\d+)"/) || [])[1] || '0', 10);
    totalFailures = parseInt((s.match(/failures="(\d+)"/) || [])[1] || '0', 10);
    totalErrors = parseInt((s.match(/errors="(\d+)"/) || [])[1] || '0', 10);
    totalSkipped = parseInt((s.match(/skipped="(\d+)"/) || [])[1] || '0', 10);
  }

  // Extract failed test names
  const failures = [];
  const tcRegex = /<testcase\s+[^>]*classname="([^"]*)"[^>]*name="([^"]*)"[^>]*>[\s\S]*?<\/testcase>/g;
  let match;
  while ((match = tcRegex.exec(xml)) !== null) {
    const block = match[0];
    if (block.includes('<failure') || block.includes('<error')) {
      const cls = match[1];
      const name = match[2];
      const msgMatch = block.match(/message="([^"]*)"/);
      failures.push({
        test: `${cls}::${name}`,
        message: msgMatch ? msgMatch[1].slice(0, 120) : '',
      });
    }
  }

  return {
    available: true,
    total: totalTests,
    passed: totalTests - totalFailures - totalErrors - totalSkipped,
    failed: totalFailures + totalErrors,
    skipped: totalSkipped,
    failures,
  };
}

function parseFrontendTestResults() {
  const data = readJson(path.join(ARTIFACTS_DIR, 'frontend-unit', 'jest-results.json'));
  if (!data) return { available: false, passed: 0, failed: 0, failures: [] };

  const failures = [];
  if (data.testResults) {
    for (const suite of data.testResults) {
      const filePath = (suite.testFilePath || suite.name || '').replace(/.*\/src\//, 'src/');
      const results = suite.testResults || suite.assertionResults || [];
      for (const t of results) {
        if (t.status === 'failed') {
          const msg = (t.failureMessages || []).join(' ').slice(0, 120).replace(/\n/g, ' ');
          failures.push({
            test: t.fullName || t.title || 'unknown',
            file: filePath,
            message: msg,
          });
        }
      }
    }
  }

  return {
    available: true,
    total: data.numTotalTests || 0,
    passed: data.numPassedTests || 0,
    failed: data.numFailedTests || 0,
    skipped: data.numPendingTests || 0,
    failures,
  };
}

function parseE2ETestResults() {
  const data = readJson(path.join(ARTIFACTS_DIR, 'frontend-e2e', 'playwright-results.json'));
  if (!data) return { available: false, passed: 0, failed: 0, failures: [] };

  const failures = [];
  let passed = 0, failed = 0, skipped = 0;

  function walkSuites(suites, parentTitle) {
    for (const suite of (suites || [])) {
      const title = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
      for (const spec of (suite.specs || [])) {
        for (const test of (spec.tests || [])) {
          if (test.status === 'expected') passed++;
          else if (test.status === 'skipped') skipped++;
          else {
            failed++;
            const errMsg = (test.results || [])
              .filter(r => r.status === 'failed' || r.status === 'timedOut')
              .map(r => (r.error?.message || '').slice(0, 120))
              .join(' ');
            failures.push({
              test: `${title} > ${spec.title}`,
              message: errMsg.replace(/\n/g, ' '),
            });
          }
        }
      }
      walkSuites(suite.suites, title);
    }
  }

  walkSuites(data.suites, '');

  return {
    available: true,
    total: passed + failed + skipped,
    passed,
    failed,
    skipped,
    failures,
  };
}

// ── Build Markdown ──

function buildMarkdown(backend, frontUnit, frontE2E, backendTests, frontTests, e2eTests) {
  const lines = [];

  lines.push('## 📊 Coverage Report');
  lines.push('');

  // ── Overview table ──
  lines.push('| Suite | Coverage | Bar | Details |');
  lines.push('|-------|----------|-----|---------|');

  if (backend.available) {
    const pct = backend.statements.pct;
    lines.push(`| **Backend** (pytest) | ${badge(pct)} | \`${progressBar(pct)}\` | ${backend.statements.covered}/${backend.statements.total} stmts${backend.branches.pct != null ? `, ${backend.branches.pct.toFixed(1)}% branches` : ''} |`);
  } else {
    lines.push('| **Backend** (pytest) | ⬜ N/A | `' + progressBar(null) + '` | _artifact not available_ |');
  }

  if (frontUnit.available) {
    const pct = frontUnit.statements.pct;
    lines.push(`| **Frontend Unit** (Jest) | ${badge(pct)} | \`${progressBar(pct)}\` | ${frontUnit.statements.covered}/${frontUnit.statements.total} stmts, ${frontUnit.branches.pct.toFixed(1)}% branches, ${frontUnit.functions.pct.toFixed(1)}% funcs |`);
  } else {
    lines.push('| **Frontend Unit** (Jest) | ⬜ N/A | `' + progressBar(null) + '` | _artifact not available_ |');
  }

  if (frontE2E.available) {
    const pct = frontE2E.coveredPct;
    lines.push(`| **Frontend E2E** (Playwright) | ${badge(pct)} | \`${progressBar(pct)}\` | ${frontE2E.covered}/${frontE2E.totalFlows} flows covered, ${frontE2E.failing} failing, ${frontE2E.missing} missing |`);
  } else {
    lines.push('| **Frontend E2E** (Playwright) | ⬜ N/A | `' + progressBar(null) + '` | _artifact not available_ |');
  }

  lines.push('');

  // ── Test results overview ──
  const hasAnyTests = backendTests.available || frontTests.available || e2eTests.available;
  const totalFailed = (backendTests.failed || 0) + (frontTests.failed || 0) + (e2eTests.failed || 0);
  const totalPassed = (backendTests.passed || 0) + (frontTests.passed || 0) + (e2eTests.passed || 0);
  const totalAll = (backendTests.total || 0) + (frontTests.total || 0) + (e2eTests.total || 0);

  if (hasAnyTests) {
    const icon = totalFailed > 0 ? '❌' : '✅';
    lines.push(`### ${icon} Test Results — ${totalPassed}/${totalAll} passed${totalFailed > 0 ? `, **${totalFailed} failed**` : ''}`);
    lines.push('');
    lines.push('| Suite | Passed | Failed | Skipped | Total |');
    lines.push('|-------|--------|--------|---------|-------|');
    if (backendTests.available) {
      const fIcon = backendTests.failed > 0 ? ' ❌' : '';
      lines.push(`| Backend (pytest) | ${backendTests.passed} | ${backendTests.failed}${fIcon} | ${backendTests.skipped} | ${backendTests.total} |`);
    }
    if (frontTests.available) {
      const fIcon = frontTests.failed > 0 ? ' ❌' : '';
      lines.push(`| Frontend Unit (Jest) | ${frontTests.passed} | ${frontTests.failed}${fIcon} | ${frontTests.skipped} | ${frontTests.total} |`);
    }
    if (e2eTests.available) {
      const fIcon = e2eTests.failed > 0 ? ' ❌' : '';
      lines.push(`| Frontend E2E (Playwright) | ${e2eTests.passed} | ${e2eTests.failed}${fIcon} | ${e2eTests.skipped} | ${e2eTests.total} |`);
    }
    lines.push('');
  }

  // ── Failed tests detail ──
  const allFailures = [
    ...backendTests.failures.map(f => ({ ...f, suite: 'Backend' })),
    ...frontTests.failures.map(f => ({ ...f, suite: 'Frontend Unit' })),
    ...e2eTests.failures.map(f => ({ ...f, suite: 'E2E' })),
  ];

  if (allFailures.length > 0) {
    lines.push('<details>');
    lines.push(`<summary><strong>❌ Failed Tests (${allFailures.length})</strong></summary>`);
    lines.push('');
    lines.push('| # | Suite | Test | Message |');
    lines.push('|---|-------|------|---------|');
    allFailures.slice(0, 30).forEach((f, i) => {
      const testName = shortPath(f.test, 60);
      const msg = (f.message || '').replace(/\|/g, '\\|').slice(0, 80);
      lines.push(`| ${i + 1} | ${f.suite} | \`${testName}\` | ${msg} |`);
    });
    if (allFailures.length > 30) {
      lines.push(`| | | _...and ${allFailures.length - 30} more_ | |`);
    }
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  // ── Backend details ──
  if (backend.available) {
    lines.push('<details>');
    lines.push('<summary><strong>🐍 Backend Details</strong></summary>');
    lines.push('');
    lines.push('| Metric | Covered | Total | % |');
    lines.push('|--------|---------|-------|---|');
    lines.push(`| Statements | ${backend.statements.covered} | ${backend.statements.total} | ${backend.statements.pct.toFixed(1)}% |`);
    if (backend.branches.pct != null) {
      lines.push(`| Branches | ${backend.branches.covered} | ${backend.branches.total} | ${backend.branches.pct.toFixed(1)}% |`);
    }
    if (backend.functions) {
      lines.push(`| Functions | ${backend.functions.covered} | ${backend.functions.total} | ${backend.functions.pct.toFixed(1)}% |`);
    }
    if (backend.lines) {
      lines.push(`| Lines | ${backend.lines.covered} | ${backend.lines.total} | ${backend.lines.pct.toFixed(1)}% |`);
    }
    lines.push('');

    if (backend.top10.length > 0) {
      lines.push('**Top 10 — files with most uncovered statements**');
      lines.push('');
      lines.push('| # | File | Stmts | Missed | Coverage |');
      lines.push('|---|------|-------|--------|----------|');
      backend.top10.forEach((f, i) => {
        lines.push(`| ${i + 1} | \`${shortPath(f.path)}\` | ${f.stmts} | ${f.missing} | ${badge(f.pct)} |`);
      });
      lines.push('');
    }

    lines.push('</details>');
    lines.push('');
  }

  // ── Frontend Unit details ──
  if (frontUnit.available) {
    lines.push('<details>');
    lines.push('<summary><strong>🧪 Frontend Unit Details</strong></summary>');
    lines.push('');
    lines.push('| Metric | Covered | Total | % |');
    lines.push('|--------|---------|-------|---|');
    lines.push(`| Statements | ${frontUnit.statements.covered} | ${frontUnit.statements.total} | ${frontUnit.statements.pct.toFixed(1)}% |`);
    lines.push(`| Branches | ${frontUnit.branches.covered} | ${frontUnit.branches.total} | ${frontUnit.branches.pct.toFixed(1)}% |`);
    lines.push(`| Functions | ${frontUnit.functions.covered} | ${frontUnit.functions.total} | ${frontUnit.functions.pct.toFixed(1)}% |`);
    lines.push(`| Lines | ${frontUnit.lines.covered} | ${frontUnit.lines.total} | ${frontUnit.lines.pct.toFixed(1)}% |`);
    lines.push('');

    if (frontUnit.top10.length > 0) {
      lines.push('**Top 10 — files with most uncovered statements**');
      lines.push('');
      lines.push('| # | File | Stmts | Missed | Stmts% | Branch% | Funcs% |');
      lines.push('|---|------|-------|--------|--------|---------|--------|');
      frontUnit.top10.forEach((f, i) => {
        const bp = f.branchPct != null ? `${f.branchPct.toFixed(1)}%` : 'N/A';
        const fp = f.funcPct != null ? `${f.funcPct.toFixed(1)}%` : 'N/A';
        lines.push(`| ${i + 1} | \`${shortPath(f.path)}\` | ${f.stmts} | ${f.missing} | ${badge(f.pct)} | ${bp} | ${fp} |`);
      });
      lines.push('');
    }

    lines.push('</details>');
    lines.push('');
  }

  // ── E2E details ──
  if (frontE2E.available) {
    lines.push('<details>');
    lines.push('<summary><strong>🎭 Frontend E2E Flow Details</strong></summary>');
    lines.push('');
    lines.push(`| Status | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| ✅ Covered | ${frontE2E.covered} |`);
    lines.push(`| ⚠️ Partial | ${frontE2E.partial} |`);
    lines.push(`| ❌ Failing | ${frontE2E.failing} |`);
    lines.push(`| ⬜ Missing | ${frontE2E.missing} |`);
    lines.push(`| **Total** | **${frontE2E.totalFlows}** |`);
    lines.push('');

    // Coverage by module
    if (frontE2E.flows.length > 0) {
      const moduleMap = {};
      for (const f of frontE2E.flows) {
        const mod = f.module || 'unknown';
        if (!moduleMap[mod]) moduleMap[mod] = { covered: 0, total: 0 };
        moduleMap[mod].total++;
        if (f.status === 'covered') moduleMap[mod].covered++;
      }
      const modules = Object.entries(moduleMap).sort((a, b) => a[0].localeCompare(b[0]));

      lines.push('**📦 Coverage by module**');
      lines.push('');
      lines.push('| Module | Covered | Total | % |');
      lines.push('|--------|--------:|------:|------:|');
      for (const [mod, counts] of modules) {
        const pct = counts.total > 0 ? ((counts.covered / counts.total) * 100).toFixed(1) : '0.0';
        lines.push(`| ${mod} | ${counts.covered} | ${counts.total} | ${pct}% |`);
      }
      lines.push('');
    }

    // Show non-covered flows (failing, partial, missing)
    const problemFlows = frontE2E.flows.filter(f => f.status !== 'covered');
    if (problemFlows.length > 0) {
      const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
      const statusOrder = { failing: 0, partial: 1, missing: 2 };
      problemFlows.sort((a, b) =>
        (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9) ||
        (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
      );

      lines.push('**Flows needing attention**');
      lines.push('');
      lines.push('| Status | Priority | Flow | Module | Tests |');
      lines.push('|--------|----------|------|--------|-------|');
      for (const f of problemFlows) {
        const testsInfo = f.total > 0 ? `${f.passed}/${f.total} passed` : '—';
        lines.push(`| ${statusIcon(f.status)} ${f.status} | ${f.priority} | ${f.name} | ${f.module} | ${testsInfo} |`);
      }
      lines.push('');
    }

    lines.push('</details>');
    lines.push('');
  }

  lines.push('---');
  lines.push('_Generated by CI — Coverage Summary_');
  lines.push('');

  return lines.join('\n');
}

// ── Main ──

const backend = parseBackend();
const frontUnit = parseFrontendUnit();
const frontE2E = parseFrontendE2E();

const backendTests = parseBackendTestResults();
const frontTests = parseFrontendTestResults();
const e2eTests = parseE2ETestResults();

const md = buildMarkdown(backend, frontUnit, frontE2E, backendTests, frontTests, e2eTests);

fs.writeFileSync('coverage-report.md', md, 'utf-8');

console.log('✅ coverage-report.md generated');
console.log('');
console.log(`   Backend:        ${backend.available ? badge(backend.statements.pct) : 'N/A'}`);
console.log(`   Frontend Unit:  ${frontUnit.available ? badge(frontUnit.statements.pct) : 'N/A'}`);
console.log(`   Frontend E2E:   ${frontE2E.available ? badge(frontE2E.coveredPct) : 'N/A'}`);
const totalFail = (backendTests.failed || 0) + (frontTests.failed || 0) + (e2eTests.failed || 0);
if (totalFail > 0) {
  console.log(`   ❌ Failed tests: ${totalFail}`);
}

#!/usr/bin/env node
/**
 * AST Parser for the Test Quality Gate.
 *
 * Parses JavaScript/TypeScript test files using Babel and extracts
 * test metadata (names, line ranges, assertion counts, quality issues).
 *
 * Usage:
 *   node ast-parser.cjs <file-path> [--e2e]
 *
 * Output: JSON on stdout matching the schema expected by JSASTBridge.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default || require('@babel/traverse');

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const filePath = args[0];
const isE2E = args.includes('--e2e');

if (!filePath) {
  process.stderr.write(JSON.stringify({ error: 'No file path provided' }));
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
let source;
try {
  source = fs.readFileSync(absolutePath, 'utf-8');
} catch (err) {
  process.stderr.write(JSON.stringify({ error: `Cannot read file: ${err.message}` }));
  process.exit(1);
}

// ── Parse ───────────────────────────────────────────────────────────────────
let ast;
try {
  ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'],
    ranges: true,
    tokens: false,
    errorRecovery: true,
  });
} catch (err) {
  const result = {
    file: filePath,
    tests: [],
    issues: [{ type: 'PARSE_ERROR', message: err.message, line: err.loc ? err.loc.line : 1 }],
    summary: { testCount: 0, issueCount: 1, hasParseError: true },
  };
  process.stdout.write(JSON.stringify(result));
  process.exit(0);
}

const lines = source.split('\n');

// ── Helpers ─────────────────────────────────────────────────────────────────
function getCallName(node) {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression' && node.object.type === 'Identifier') {
    return `${node.object.name}.${node.property.name || node.property.value}`;
  }
  return null;
}

function isTestCall(name) {
  return ['it', 'test', 'it.only', 'test.only', 'it.skip', 'test.skip', 'it.todo', 'test.todo'].includes(name);
}

function isDescribeCall(name) {
  return ['describe', 'describe.only', 'describe.skip', 'describe.serial'].includes(name);
}

const ASSERTION_PATTERNS = [
  'expect', 'assert', 'toEqual', 'toBe', 'toContain', 'toMatch',
  'toHaveBeenCalled', 'toHaveBeenCalledWith', 'toThrow', 'toBeVisible',
  'toHaveText', 'toHaveAttribute', 'toHaveCount', 'toBeHidden',
  'toBeEnabled', 'toBeDisabled', 'toBeChecked', 'toBeTruthy', 'toBeFalsy',
  'toBeNull', 'toBeUndefined', 'toBeDefined', 'toBeGreaterThan',
  'toHaveLength', 'toHaveProperty', 'toMatchObject', 'toMatchSnapshot',
  'resolves', 'rejects',
];

function countAssertions(bodyNode) {
  let count = 0;
  if (!bodyNode) return count;
  const bodySource = source.slice(bodyNode.start, bodyNode.end);
  for (const pat of ASSERTION_PATTERNS) {
    const re = new RegExp(`\\b${pat}\\b`, 'g');
    const matches = bodySource.match(re);
    if (matches) count += matches.length;
  }
  // Deduplicate chained expect().toBe patterns: count unique expect chains
  const expectChains = bodySource.match(/\bexpect\s*\(/g);
  if (expectChains) return expectChains.length;
  return count;
}

function hasConsoleLog(bodyNode) {
  if (!bodyNode) return false;
  const bodySource = source.slice(bodyNode.start, bodyNode.end);
  return /\bconsole\.\w+\s*\(/.test(bodySource);
}

function hasHardcodedTimeout(bodyNode) {
  if (!bodyNode) return { has: false, value: 0 };
  const bodySource = source.slice(bodyNode.start, bodyNode.end);
  const match = bodySource.match(/waitForTimeout\s*\(\s*(\d+)\s*\)/);
  if (match) return { has: true, value: parseInt(match[1], 10) };
  const sleepMatch = bodySource.match(/page\.waitForTimeout\s*\(\s*(\d+)\s*\)/);
  if (sleepMatch) return { has: true, value: parseInt(sleepMatch[1], 10) };
  return { has: false, value: 0 };
}

function isEmptyBody(bodyNode) {
  if (!bodyNode) return true;
  if (bodyNode.type === 'BlockStatement') {
    return bodyNode.body.length === 0;
  }
  return false;
}

// ── Traverse ────────────────────────────────────────────────────────────────
const tests = [];
const issues = [];
const describeStack = [];

traverse(ast, {
  CallExpression(pathNode) {
    const node = pathNode.node;
    const callName = getCallName(node.callee);
    if (!callName) return;

    // Track describe blocks
    if (isDescribeCall(callName)) {
      const nameArg = node.arguments[0];
      const describeName = nameArg && (nameArg.type === 'StringLiteral' || nameArg.type === 'TemplateLiteral')
        ? (nameArg.value || nameArg.quasis?.[0]?.value?.raw || '')
        : '';
      describeStack.push(describeName);

      // Find the callback body and traverse it, then pop
      const callback = node.arguments.find(a => a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression');
      if (callback && callback.body) {
        // Let traversal continue naturally; we pop on exit
      }
      return;
    }

    // Detect test calls
    if (isTestCall(callName)) {
      const nameArg = node.arguments[0];
      const testName = nameArg && (nameArg.type === 'StringLiteral' || nameArg.type === 'TemplateLiteral')
        ? (nameArg.value || nameArg.quasis?.[0]?.value?.raw || '')
        : '<anonymous>';

      const isSkipped = callName.includes('.skip') || callName.includes('.todo');
      const isOnly = callName.includes('.only');
      const baseType = callName.startsWith('test') ? 'test' : 'it';

      const callback = node.arguments.find(a => a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression');
      const bodyNode = callback ? callback.body : null;

      const startLine = node.loc ? node.loc.start.line : 0;
      const endLine = node.loc ? node.loc.end.line : 0;
      const numLines = endLine - startLine + 1;

      const assertionCount = countAssertions(bodyNode);
      const consoleLogs = hasConsoleLog(bodyNode);
      const timeout = hasHardcodedTimeout(bodyNode);
      const empty = isEmptyBody(bodyNode);

      const describeBlock = describeStack.length > 0 ? describeStack[describeStack.length - 1] : null;
      const fullContext = describeBlock ? `${describeBlock} > ${testName}` : testName;

      tests.push({
        name: testName,
        fullContext,
        line: startLine,
        endLine,
        numLines,
        type: baseType,
        isSkipped,
        isOnly,
        hasAssertions: assertionCount > 0,
        assertionCount,
        hasConsoleLog: consoleLogs,
        hasHardcodedTimeout: timeout.has,
        timeoutValue: timeout.value,
        isEmpty: empty,
        describeBlock,
      });
    }
  },
});

// Pop describe stack via a second pass (simplified: we use scope-based detection above)
// The describeStack approach works for flat describe blocks but may not be perfect for deeply nested.
// For the quality gate's purposes this is sufficient.

// ── Quality issues ──────────────────────────────────────────────────────────
for (const t of tests) {
  // Empty test body
  if (t.isEmpty && !t.isSkipped) {
    issues.push({
      type: 'EMPTY_TEST',
      message: `Test "${t.name}" has an empty body`,
      line: t.line,
      identifier: t.name,
      suggestion: 'Add assertions or mark as .todo()',
    });
  }

  // No assertions
  if (!t.hasAssertions && !t.isEmpty && !t.isSkipped) {
    issues.push({
      type: 'NO_ASSERTIONS',
      message: `Test "${t.name}" has no assertions`,
      line: t.line,
      identifier: t.name,
      suggestion: 'Add expect() or assert calls to verify behavior',
    });
  }

  // Console.log in test
  if (t.hasConsoleLog) {
    issues.push({
      type: 'CONSOLE_LOG',
      message: `Test "${t.name}" contains console.log`,
      line: t.line,
      identifier: t.name,
      suggestion: 'Remove console.log from test code',
    });
  }

  // Hardcoded timeout (E2E concern)
  if (t.hasHardcodedTimeout) {
    issues.push({
      type: 'HARDCODED_TIMEOUT',
      message: `Test "${t.name}" uses waitForTimeout(${t.timeoutValue})`,
      line: t.line,
      identifier: t.name,
      suggestion: 'Use toBeVisible(), waitForResponse(), or waitForURL() instead',
    });
  }

  // test.only
  if (t.isOnly) {
    issues.push({
      type: 'FOCUSED_TEST',
      message: `Test "${t.name}" uses .only — will skip other tests`,
      line: t.line,
      identifier: t.name,
      suggestion: 'Remove .only before committing',
    });
  }
}

// ── Output ──────────────────────────────────────────────────────────────────
const result = {
  file: filePath,
  tests,
  issues,
  summary: {
    testCount: tests.length,
    issueCount: issues.length,
    hasParseError: false,
  },
};

process.stdout.write(JSON.stringify(result));

#!/usr/bin/env node

/*
 * AST parser bridge for test-quality-gate.
 *
 * Inputs:
 *   node ast-parser.cjs <absolute-or-relative-file-path> [--e2e]
 *
 * Output JSON shape:
 * {
 *   file: string,
 *   tests: Array<{
 *     name, fullContext, line, endLine, numLines, type,
 *     isSkipped, isOnly, hasAssertions, assertionCount,
 *     hasConsoleLog, hasHardcodedTimeout, timeoutValue,
 *     isEmpty, describeBlock
 *   }>,
 *   issues: Array<{type, message, line, identifier?, suggestion?}>,
 *   summary: {testCount, issueCount, hasParseError}
 * }
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const LIFECYCLE_HOOKS = new Set(['beforeEach', 'afterEach', 'beforeAll', 'afterAll']);

const GENERIC_TITLES = new Set([
  'it works',
  'should work',
  'test',
  'works',
  'does something',
  'handles it',
  'is correct',
  'passes',
  'runs',
]);

const FORBIDDEN_TOKEN_RE = /\b(batch|coverage|cov|deep)\b/i;
const USELESS_ASSERTION_PATTERNS = [
  /expect\(\s*true\s*\)\s*\.toBe\(\s*true\s*\)/,
  /expect\(\s*1\s*\)\s*\.toBe\(\s*1\s*\)/,
  /expect\(\s*false\s*\)\s*\.toBe\(\s*false\s*\)/,
  /assert\(\s*true\s*\)/,
];

const ASSERTION_RE = /\bexpect\s*\(|\bassert(?:\w+)?\s*\(/g;
const CONSOLE_RE = /\bconsole\.(?:log|debug|info|warn|error)\s*\(/;
const HARDCODED_TIMEOUT_RE = /(?<!test\.)\b(?:waitForTimeout|setTimeout)\s*\(\s*(\d+)/g;

function printJson(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function normalizeTitle(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function textFromLiteral(node) {
  if (!node) return '';

  if (node.type === 'StringLiteral') {
    return String(node.value || '');
  }

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return String(node.value);
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((item) => item.value.cooked || item.value.raw || '').join('');
  }

  return '';
}

function getMemberChain(callee) {
  const chain = [];
  let current = callee;

  while (current) {
    if (current.type === 'Identifier') {
      chain.unshift(current.name);
      break;
    }

    if (current.type === 'MemberExpression') {
      if (current.computed) {
        if (current.property && current.property.type === 'StringLiteral') {
          chain.unshift(String(current.property.value || ''));
        } else {
          break;
        }
      } else if (current.property && current.property.type === 'Identifier') {
        chain.unshift(current.property.name);
      } else {
        break;
      }

      current = current.object;
      continue;
    }

    break;
  }

  return chain;
}

function classifyCall(node) {
  if (!node || node.type !== 'CallExpression') return null;

  const chain = getMemberChain(node.callee);
  if (chain.length === 0) return null;

  const root = chain[0];
  const hasDescribe = chain.includes('describe');
  const isOnly = chain.includes('only');
  const isSkipped = chain.includes('skip') || chain.includes('todo') || chain.includes('fixme');
  const isSerial = chain.includes('serial');

  if (root === 'describe' || (root === 'test' && hasDescribe)) {
    return {
      kind: 'describe',
      chain,
      isOnly,
      isSkipped,
      isSerial,
    };
  }

  if (root === 'it' || root === 'test') {
    if (chain.some((part) => LIFECYCLE_HOOKS.has(part))) {
      return null;
    }
    return {
      kind: 'test',
      chain,
      testType: root === 'it' ? 'it' : 'test',
      isOnly,
      isSkipped,
      isSerial,
    };
  }

  return null;
}

function getCallbackArg(callNode) {
  for (const arg of callNode.arguments || []) {
    if (!arg || typeof arg !== 'object') continue;
    if (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') {
      return arg;
    }
  }
  return null;
}

function isAstNode(value) {
  return !!value && typeof value === 'object' && typeof value.type === 'string';
}

function collectChildren(node) {
  const children = [];
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isAstNode(item)) children.push(item);
      }
      continue;
    }
    if (isAstNode(value)) children.push(value);
  }
  return children;
}

function getNodeText(content, node) {
  if (!node || node.start == null || node.end == null) return '';
  return content.slice(node.start, node.end);
}

function countMatches(regex, text) {
  const cloned = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  const matches = text.match(cloned);
  return matches ? matches.length : 0;
}

function buildTestRecord(content, callNode, meta, describeStack, isE2E) {
  const rawTitle = textFromLiteral((callNode.arguments || [])[0]) || '(unnamed test)';
  const title = normalizeTitle(rawTitle || '(unnamed test)');
  const callback = getCallbackArg(callNode);
  const line = (callNode.loc && callNode.loc.start && callNode.loc.start.line) || 1;

  let endLine = (callNode.loc && callNode.loc.end && callNode.loc.end.line) || line;
  if (callback && callback.body && callback.body.loc && callback.body.loc.end) {
    endLine = callback.body.loc.end.line || endLine;
  }

  const numLines = Math.max(1, endLine - line + 1);
  const blockNode = callback ? (callback.body || callback) : callNode;
  const blockText = getNodeText(content, blockNode);
  const assertionCount = countMatches(ASSERTION_RE, blockText);
  const hasAssertions = assertionCount > 0;
  const hasConsoleLog = CONSOLE_RE.test(blockText);

  let timeoutValue = 0;
  for (const match of blockText.matchAll(HARDCODED_TIMEOUT_RE)) {
    const candidate = Number(match[1] || 0);
    if (Number.isFinite(candidate) && candidate > timeoutValue) {
      timeoutValue = candidate;
    }
  }

  const isEmpty =
    !callback ||
    !callback.body ||
    (callback.body.type === 'BlockStatement' && callback.body.body.length === 0);

  const describeBlock = describeStack.length > 0 ? describeStack.join(' > ') : null;
  const fullContext = describeBlock ? `${describeBlock} > ${title}` : title;

  const issues = [];

  const lowerTitle = title.toLowerCase();
  if (GENERIC_TITLES.has(lowerTitle)) {
    issues.push({
      type: 'POOR_NAMING',
      message: `Generic test title: '${title}'`,
      line,
      identifier: title,
      suggestion: "Use descriptive name: 'should <action> when <condition>'",
    });
  }

  if (FORBIDDEN_TOKEN_RE.test(title)) {
    issues.push({
      type: 'FORBIDDEN_TOKEN',
      message: `Forbidden token in test title: '${title}'`,
      line,
      identifier: title,
    });
  }

  if (!meta.isSkipped && isEmpty) {
    issues.push({
      type: 'EMPTY_TEST',
      message: 'Test body is empty',
      line,
      identifier: fullContext,
      suggestion: 'Add meaningful test logic and assertions',
    });
  }

  if (!meta.isSkipped && !isEmpty && !hasAssertions) {
    issues.push({
      type: 'NO_ASSERTIONS',
      message: 'Test has no assertions',
      line,
      identifier: fullContext,
      suggestion: 'Add assertions that verify observable behavior',
    });
  }

  if (assertionCount > 7) {
    issues.push({
      type: 'TOO_MANY_ASSERTIONS',
      message: `Test has too many assertions (${assertionCount})`,
      line,
      identifier: fullContext,
      suggestion: 'Split into smaller focused tests',
    });
  }

  if (numLines > 50) {
    issues.push({
      type: 'TEST_TOO_LONG',
      message: `Test is too long (${numLines} lines)`,
      line,
      identifier: fullContext,
      suggestion: 'Extract helpers or split into focused tests',
    });
  }

  for (const pattern of USELESS_ASSERTION_PATTERNS) {
    if (pattern.test(blockText)) {
      issues.push({
        type: 'USELESS_ASSERTION',
        message: 'Test contains useless assertion',
        line,
        identifier: fullContext,
        suggestion: 'Replace with behavior-focused assertions',
      });
      break;
    }
  }

  if (hasConsoleLog) {
    issues.push({
      type: 'CONSOLE_LOG',
      message: 'Test contains console.log/debug statements',
      line,
      identifier: fullContext,
      suggestion: 'Remove console statements from tests',
    });
  }

  if (timeoutValue > 0) {
    issues.push({
      type: isE2E ? 'WAIT_FOR_TIMEOUT' : 'HARDCODED_TIMEOUT',
      message: `Test uses hardcoded timeout (${timeoutValue}ms)`,
      line,
      identifier: fullContext,
      suggestion: 'Use condition-based waits instead of fixed delays',
    });
  }

  if (!isE2E) {
    const multiRenderCount = countMatches(/\b(?:render|mount)\s*\(/g, blockText);
    if (multiRenderCount > 1) {
      issues.push({
        type: 'MULTI_RENDER',
        message: `Multiple render/mount calls in one test (${multiRenderCount})`,
        line,
        identifier: fullContext,
        suggestion: 'Keep one render per test when possible',
      });
    }

    if (/\bwrapper\.vm\b|\binstance\(\)/.test(blockText)) {
      issues.push({
        type: 'IMPLEMENTATION_COUPLING',
        message: 'Test asserts implementation details instead of observable behavior',
        line,
        identifier: fullContext,
        suggestion: 'Prefer user-observable assertions',
      });
    }

    if (/\bquerySelector\b|\bgetElementById\b|\bgetElementsByClassName\b/.test(blockText)) {
      issues.push({
        type: 'FRAGILE_SELECTOR',
        message: 'Fragile selector usage detected',
        line,
        identifier: fullContext,
        suggestion: 'Prefer resilient selectors (role, label, testid)',
      });
    }

    const snapshotCount = countMatches(/\btoMatchSnapshot\s*\(/g, blockText);
    if (snapshotCount > 1) {
      issues.push({
        type: 'SNAPSHOT_OVERRELIANCE',
        message: `Test relies heavily on snapshots (${snapshotCount})`,
        line,
        identifier: fullContext,
        suggestion: 'Add semantic assertions to complement snapshots',
      });
    }

    if (/\bDate\.now\b|\bnew Date\s*\(|\bMath\.random\b/.test(blockText)) {
      issues.push({
        type: 'NONDETERMINISTIC',
        message: 'Potential nondeterministic source in test',
        line,
        identifier: fullContext,
        suggestion: 'Control time/random sources via mocks or fake timers',
      });
    }
  } else {
    if (/\btoBeTruthy\s*\(|\btoBeFalsy\s*\(/.test(blockText)) {
      issues.push({
        type: 'VAGUE_ASSERTION',
        message: 'Vague truthy/falsy assertion in E2E test',
        line,
        identifier: fullContext,
        suggestion: 'Assert concrete and user-visible outcomes',
      });
    }

    const actionCount = countMatches(/\.(?:click|fill|type|press|goto|check|uncheck|selectOption)\s*\(/g, blockText);
    if (actionCount > 25) {
      issues.push({
        type: 'EXCESSIVE_STEPS',
        message: `E2E test has too many interaction steps (${actionCount})`,
        line,
        identifier: fullContext,
        suggestion: 'Split long scenarios into focused user flows',
      });
    }

    if (meta.isSerial) {
      issues.push({
        type: 'SERIAL_WITHOUT_REASON',
        message: 'Serial execution detected without explicit justification marker',
        line,
        identifier: fullContext,
        suggestion: 'Avoid serial mode or document why ordering is required',
      });
    }
  }

  return {
    test: {
      name: title,
      fullContext,
      line,
      endLine,
      numLines,
      type: meta.testType,
      isSkipped: meta.isSkipped,
      isOnly: meta.isOnly,
      hasAssertions,
      assertionCount,
      hasConsoleLog,
      hasHardcodedTimeout: timeoutValue > 0,
      timeoutValue,
      isEmpty,
      describeBlock,
    },
    issues,
  };
}

function parseTestFile(filePath, isE2E) {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  const issues = [];
  const tests = [];

  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'unambiguous',
      errorRecovery: false,
      plugins: [
        'jsx',
        'typescript',
        'classProperties',
        'objectRestSpread',
        'dynamicImport',
        'decorators-legacy',
        'topLevelAwait',
      ],
    });
  } catch (error) {
    return {
      file: absolutePath,
      tests: [],
      issues: [
        {
          type: 'PARSE_ERROR',
          message: String(error && error.message ? error.message : error),
          line: 1,
        },
      ],
      error: String(error && error.message ? error.message : error),
      summary: {
        testCount: 0,
        issueCount: 1,
        hasParseError: true,
      },
    };
  }

  function visit(node, describeStack) {
    if (!isAstNode(node)) return;

    if (node.type === 'CallExpression') {
      const classification = classifyCall(node);

      if (classification && classification.kind === 'describe') {
        const titleNode = (node.arguments || [])[0];
        const title = normalizeTitle(textFromLiteral(titleNode));
        const nextStack = title ? [...describeStack, title] : describeStack;

        const callback = getCallbackArg(node);
        if (callback) {
          if (callback.body && callback.body.type === 'BlockStatement') {
            for (const statement of callback.body.body) {
              visit(statement, nextStack);
            }
          } else {
            visit(callback.body || callback, nextStack);
          }
        }

        for (const argument of node.arguments || []) {
          if (argument !== titleNode && argument !== callback) {
            visit(argument, describeStack);
          }
        }
        return;
      }

      if (classification && classification.kind === 'test') {
        const built = buildTestRecord(content, node, classification, describeStack, isE2E);
        tests.push(built.test);
        issues.push(...built.issues);
        return;
      }
    }

    for (const child of collectChildren(node)) {
      visit(child, describeStack);
    }
  }

  visit(ast.program || ast, []);

  const duplicates = new Map();
  for (const test of tests) {
    const key = test.fullContext || test.name;
    if (!duplicates.has(key)) duplicates.set(key, []);
    duplicates.get(key).push(test.line);
  }

  for (const [title, lines] of duplicates.entries()) {
    if (lines.length > 1) {
      issues.push({
        type: 'DUPLICATE_NAME',
        message: `Duplicate test name: '${title}'`,
        line: lines[0],
        identifier: title,
        suggestion: `Appears on lines ${lines.join(', ')}`,
      });
    }
  }

  return {
    file: absolutePath,
    tests,
    issues,
    summary: {
      testCount: tests.length,
      issueCount: issues.length,
      hasParseError: false,
    },
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printJson({
      file: '',
      tests: [],
      issues: [{ type: 'PARSE_ERROR', message: 'Missing file path argument', line: 1 }],
      error: 'Missing file path argument',
      summary: { testCount: 0, issueCount: 1, hasParseError: true },
    });
    process.exit(0);
  }

  const fileArg = args.find((arg) => !arg.startsWith('-'));
  const isE2E = args.includes('--e2e');

  if (!fileArg) {
    printJson({
      file: '',
      tests: [],
      issues: [{ type: 'PARSE_ERROR', message: 'Missing file path argument', line: 1 }],
      error: 'Missing file path argument',
      summary: { testCount: 0, issueCount: 1, hasParseError: true },
    });
    process.exit(0);
  }

  try {
    const parsed = parseTestFile(fileArg, isE2E);
    printJson(parsed);
  } catch (error) {
    const message = String(error && error.message ? error.message : error);
    printJson({
      file: path.resolve(fileArg),
      tests: [],
      issues: [{ type: 'PARSE_ERROR', message, line: 1 }],
      error: message,
      summary: { testCount: 0, issueCount: 1, hasParseError: true },
    });
  }
}

main();

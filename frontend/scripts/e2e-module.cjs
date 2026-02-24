'use strict';

const { spawnSync } = require('node:child_process');

const { loadModules } = require('./e2e-modules.cjs');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const usage = `Usage:
  npm run e2e:module -- <module> [playwright args...]

Examples:
  npm run e2e:module -- auth
  npm run e2e:module -- --module auth --project="Desktop Chrome"`;

function normalizeModuleName(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.startsWith('@module:') ? trimmed.slice('@module:'.length) : trimmed;
}

function parseArgs(argv) {
  const options = {
    moduleName: null,
    extraArgs: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--module') {
      const nextValue = argv[index + 1];
      if (!nextValue) {
        throw new Error('Module name is required after --module.');
      }
      options.moduleName = normalizeModuleName(nextValue);
      index += 1;
      continue;
    }

    if (!options.moduleName) {
      options.moduleName = normalizeModuleName(arg);
      continue;
    }

    options.extraArgs.push(arg);
  }

  return options;
}

function resolveOptions(argv) {
  const options = parseArgs(argv);
  if (!options.moduleName) {
    throw new Error('Module name is required.');
  }
  return options;
}

function validateModuleName(moduleName, definitionsFile) {
  const modules = loadModules(definitionsFile);
  if (!modules.includes(moduleName)) {
    const available = modules.length > 0 ? modules.join(', ') : 'none';
    throw new Error(`Unknown module "${moduleName}". Available modules: ${available}.`);
  }
  return modules;
}

function buildModuleArgs(moduleName, extraArgs) {
  return ['run', 'e2e', '--', '--grep', `@module:${moduleName}`, ...extraArgs];
}

function runCommand(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: process.cwd() });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function run() {
  let options;
  try {
    options = resolveOptions(process.argv.slice(2));
    validateModuleName(options.moduleName);
  } catch (error) {
    console.error(`[e2e:module] ${error.message}`);
    console.error(usage);
    process.exit(1);
  }

  runCommand(npmCommand, buildModuleArgs(options.moduleName, options.extraArgs));
}

if (require.main === module) {
  run();
}

module.exports = {
  buildModuleArgs,
  normalizeModuleName,
  parseArgs,
  resolveOptions,
  validateModuleName,
};

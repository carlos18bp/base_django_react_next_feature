'use strict';

const { spawnSync } = require('node:child_process');

function main() {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    console.error('npm_execpath is unavailable; run this check through npm.');
    return 1;
  }

  const result = spawnSync(
    process.execPath,
    [npmCli, 'install-scripts', 'ls', '--json'],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    process.stderr.write(result.stderr || 'npm install-scripts failed.\n');
    return result.status || 1;
  }

  let report;

  try {
    report = JSON.parse(result.stdout);
  } catch (error) {
    console.error('Could not parse npm install-script review output.', error);
    return 1;
  }

  const pending = Array.isArray(report.allowScripts) ? report.allowScripts : [];
  if (pending.length > 0) {
    console.error(`Unreviewed dependency install scripts: ${JSON.stringify(pending)}`);
    return 1;
  }

  console.log('All dependency install scripts are reviewed.');
  return 0;
}

process.exitCode = main();

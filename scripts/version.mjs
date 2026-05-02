// Computes the effective version string for a build by appending the git
// commit count to whatever is in package.json.
//
// Usage:
//   node scripts/version.mjs                 # prints "0.2.0-dev.435"
//   node scripts/version.mjs --json          # prints { "version": "...", "build": 435, "channel": "development" }
//   node scripts/version.mjs --write-define  # prints a Vite define snippet
//
// The package.json version field is the "human portion". This script is the
// only place the build number is appended.

import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

function getBuildNumber() {
  try {
    return Number(execSync('git rev-list --count HEAD', { cwd: repoRoot }).toString().trim());
  } catch {
    return 0;
  }
}

function channelOf(version) {
  if (/-dev(\.|$)/.test(version)) return 'development';
  if (/-alpha(\.|$)/.test(version)) return 'alpha';
  return 'stable';
}

export async function computeVersion() {
  const pkg = JSON.parse(await readFile(resolve(repoRoot, 'package.json'), 'utf8'));
  const build = getBuildNumber();
  const channel = channelOf(pkg.version);

  let version = pkg.version;
  // If the human portion already ends in `-dev.X` or `-alpha.X`, replace X
  // with the live build number so package.json never goes stale.
  if (channel === 'development') {
    version = version.replace(/-dev\.\d+$/, `-dev.${build}`);
    if (!/-dev\.\d+$/.test(version)) version = `${version}-dev.${build}`;
  } else if (channel === 'alpha') {
    version = version.replace(/-alpha\.\d+$/, `-alpha.${build}`);
    if (!/-alpha\.\d+$/.test(version)) version = `${version}-alpha.${build}`;
  }
  return { version, build, channel };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const info = await computeVersion();
  if (args.has('--json')) {
    process.stdout.write(`${JSON.stringify(info, null, 2)}\n`);
  } else if (args.has('--write-define')) {
    process.stdout.write(
      `--define __APP_VERSION__=${JSON.stringify(info.version)} ` +
      `--define __APP_BUILD__=${info.build} ` +
      `--define __APP_CHANNEL__=${JSON.stringify(info.channel)}\n`,
    );
  } else {
    process.stdout.write(`${info.version}\n`);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('version.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

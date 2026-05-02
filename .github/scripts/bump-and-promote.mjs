// Bumps `package.json` version and promotes `## [Unreleased]` in
// CHANGELOG.md into a dated release block. Driven by the merging PR's
// target branch and labels.
//
// Inputs (env):
//   BASE_REF    — github.event.pull_request.base.ref (development|alpha|main)
//   PR_TITLE    — github.event.pull_request.title
//   PR_NUMBER   — github.event.pull_request.number
//   PR_LABELS   — JSON-encoded array of { name } objects
//
// Effects:
//   - Rewrites package.json "version".
//   - Rewrites CHANGELOG.md, replacing `## [Unreleased]` with a dated,
//     versioned heading and re-emitting an empty `## [Unreleased]` above it.
//
// Channel mapping:
//   development → keeps `-dev.<commit-count>` suffix
//   alpha       → `-alpha.<commit-count>`
//   main        → no pre-release suffix

import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const PKG = `${repoRoot}/package.json`;
const CHANGELOG = `${repoRoot}/CHANGELOG.md`;

const BASE_REF = process.env.BASE_REF;
const PR_TITLE = process.env.PR_TITLE || '';
const PR_NUMBER = process.env.PR_NUMBER || '';
const labelObjs = JSON.parse(process.env.PR_LABELS || '[]');
const labels = labelObjs.map((l) => l.name);

const isPromotion = /^promote\b/i.test(PR_TITLE);
const bumpLabel = labels.find((l) => /^release-bump:(major|minor|patch)$/.test(l));
const bumpKind = bumpLabel ? bumpLabel.split(':')[1] : 'patch';

function buildNumber() {
  return Number(execSync('git rev-list --count HEAD').toString().trim());
}

function parseVersion(v) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(dev|alpha)\.(\d+))?$/.exec(v);
  if (!match) throw new Error(`Cannot parse version: ${v}`);
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    channel: match[4] || null,
  };
}

function bump(parts, kind) {
  if (kind === 'major') return { ...parts, major: parts.major + 1, minor: 0, patch: 0 };
  if (kind === 'minor') return { ...parts, minor: parts.minor + 1, patch: 0 };
  return { ...parts, patch: parts.patch + 1 };
}

function format(parts, channel, build) {
  const core = `${parts.major}.${parts.minor}.${parts.patch}`;
  if (!channel) return core;
  return `${core}-${channel}.${build}`;
}

function channelLabel(channel) {
  if (channel === 'dev') return 'Development';
  if (channel === 'alpha') return 'Alpha';
  return 'Stable';
}

function targetChannel(baseRef) {
  if (baseRef === 'development') return 'dev';
  if (baseRef === 'alpha') return 'alpha';
  if (baseRef === 'main') return null;
  throw new Error(`Unsupported base ref: ${baseRef}`);
}

async function main() {
  const pkg = JSON.parse(await readFile(PKG, 'utf8'));
  const current = parseVersion(pkg.version);
  const channel = targetChannel(BASE_REF);
  const build = buildNumber();

  let next;
  if (isPromotion) {
    // Promotion PR: keep core version, only change channel.
    next = { ...current };
  } else {
    next = bump(current, bumpKind);
  }
  const newVersion = format(next, channel, build);
  pkg.version = newVersion;
  await writeFile(PKG, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

  const md = await readFile(CHANGELOG, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const headingChannel = channelLabel(channel || 'main');

  // Locate `## [Unreleased]` block and split.
  const unreleasedRe = /^## \[Unreleased\][^\n]*\n/m;
  const unreleasedMatch = unreleasedRe.exec(md);
  if (!unreleasedMatch) {
    console.warn('No [Unreleased] block found; skipping changelog promote.');
    return;
  }
  const start = unreleasedMatch.index;
  const headerEnd = start + unreleasedMatch[0].length;

  // Find the next `## ` heading (next release block).
  const nextReleaseRe = /\n## \[/g;
  nextReleaseRe.lastIndex = headerEnd;
  const nextMatch = nextReleaseRe.exec(md);
  const blockEnd = nextMatch ? nextMatch.index + 1 : md.length;

  const before = md.slice(0, start);
  const unreleasedBody = md.slice(headerEnd, blockEnd).trim();
  const after = md.slice(blockEnd);

  // Strip the inline HTML comment used for authoring guidance.
  const cleanedBody = unreleasedBody
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const promotedTitle = isPromotion
    ? `Promotion to ${headingChannel}`
    : (PR_TITLE.replace(/^[^:]+:\s*/, '').trim() || 'Untitled release');
  const promotedDescription = `Auto-promoted from PR #${PR_NUMBER}.`;

  const promotedBlock =
    `## [${newVersion}] - ${today} - ${headingChannel}\n\n` +
    `**Title:** ${promotedTitle}\n\n` +
    `**Description:** ${promotedDescription}\n\n` +
    (cleanedBody ? `${cleanedBody}\n\n` : '');

  const newUnreleased =
    `## [Unreleased]\n\n` +
    `<!--\n` +
    `Add new entries under the appropriate category. Do not pre-date entries.\n` +
    `Categories: Features, Improvements, Bug Fixes, Balance, Content, Modding, Internal.\n` +
    `-->\n\n`;

  const out = `${before}${newUnreleased}${promotedBlock}${after}`;
  await writeFile(CHANGELOG, out, 'utf8');

  console.log(`Bumped ${pkg.name} to ${newVersion} on ${BASE_REF}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

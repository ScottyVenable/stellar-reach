// Parses CHANGELOG.md into a structured JSON document consumed by the
// in-game changelog viewer.
//
// Output shape (see src/engine/changelog.ts for the typed mirror):
//
//   {
//     "currentVersion": "0.2.0-dev.435",
//     "build": 435,
//     "generatedAt": "2026-05-02T19:14:23.000Z",
//     "releases": [
//       {
//         "version": "0.2.0-dev.0",
//         "date": "2026-05-02",
//         "channel": "development" | "alpha" | "stable" | "unreleased",
//         "title": "...",
//         "description": "...",
//         "categories": [
//           { "id": "features", "label": "New", "entries": ["..."] },
//           ...
//         ]
//       },
//       ...
//     ]
//   }
//
// Run: node scripts/parse-changelog.mjs
//
// Inputs:  CHANGELOG.md, package.json, current git commit count
// Outputs: src/data/changelog.generated.json

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const CHANGELOG_PATH = resolve(repoRoot, 'CHANGELOG.md');
const PACKAGE_PATH = resolve(repoRoot, 'package.json');
const OUT_DIR = resolve(repoRoot, 'src/data');
const OUT_PATH = resolve(OUT_DIR, 'changelog.generated.json');

const CATEGORY_MAP = {
  features: { id: 'features', label: 'New', heading: 'Features' },
  improvements: { id: 'improvements', label: 'Improvements', heading: 'Improvements' },
  'bug fixes': { id: 'bug-fixes', label: 'Fixes', heading: 'Bug Fixes' },
  balance: { id: 'balance', label: 'Balance', heading: 'Balance' },
  content: { id: 'content', label: 'Content', heading: 'Content' },
  modding: { id: 'modding', label: 'Modding', heading: 'Modding' },
  internal: { id: 'internal', label: 'Internal', heading: 'Internal' },
};

function getBuildNumber() {
  try {
    return Number(execSync('git rev-list --count HEAD', { cwd: repoRoot }).toString().trim());
  } catch {
    return 0;
  }
}

function detectChannel(version) {
  if (/-dev\./.test(version)) return 'development';
  if (/-alpha\./.test(version)) return 'alpha';
  return 'stable';
}

/**
 * Splits the changelog into release blocks, each starting at a `## ` heading.
 */
function splitIntoBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let current = null;
  for (const line of lines) {
    if (/^## /.test(line)) {
      if (current) blocks.push(current);
      current = { header: line, body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function parseHeader(header) {
  // ## [Unreleased]
  // ## [0.2.0-dev.0] - 2026-05-02 - Development
  const unreleased = /^##\s+\[Unreleased\]\s*$/.exec(header);
  if (unreleased) {
    return { version: 'Unreleased', date: null, channel: 'unreleased' };
  }
  const match = /^##\s+\[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?(?:\s*-\s*(\w+))?\s*$/.exec(header);
  if (!match) return null;
  const [, version, date, channelLabel] = match;
  const channel = channelLabel ? channelLabel.toLowerCase() : detectChannel(version);
  const normalisedChannel = ['development', 'alpha', 'stable', 'unreleased'].includes(channel)
    ? channel
    : detectChannel(version);
  return { version, date: date || null, channel: normalisedChannel };
}

function parseBody(bodyLines) {
  let title = '';
  let description = '';
  const categories = [];

  let i = 0;
  // Title and description (optional; not used for [Unreleased]).
  while (i < bodyLines.length && !/^###\s+/.test(bodyLines[i])) {
    const line = bodyLines[i];
    const titleMatch = /^\*\*Title:\*\*\s+(.*)$/.exec(line);
    const descMatch = /^\*\*Description:\*\*\s+(.*)$/.exec(line);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else if (descMatch) {
      const collected = [descMatch[1].trim()];
      let j = i + 1;
      while (j < bodyLines.length && bodyLines[j].trim() !== '' && !/^###\s+/.test(bodyLines[j]) && !/^\*\*[A-Za-z]+:\*\*/.test(bodyLines[j])) {
        collected.push(bodyLines[j].trim());
        j++;
      }
      description = collected.join(' ').trim();
      i = j;
      continue;
    }
    i++;
  }

  // Categories.
  let activeCategory = null;
  for (; i < bodyLines.length; i++) {
    const line = bodyLines[i];
    const headingMatch = /^###\s+(.+?)\s*$/.exec(line);
    if (headingMatch) {
      const key = headingMatch[1].trim().toLowerCase();
      const meta = CATEGORY_MAP[key];
      if (!meta) {
        throw new Error(`Unknown changelog category heading: "${headingMatch[1]}". Update docs/CHANGELOG_FORMAT.md and scripts/parse-changelog.mjs together.`);
      }
      activeCategory = { id: meta.id, label: meta.label, entries: [] };
      categories.push(activeCategory);
      continue;
    }
    if (!activeCategory) continue;
    const entryMatch = /^-\s+(.*)$/.exec(line);
    if (entryMatch) {
      activeCategory.entries.push(entryMatch[1].trim());
      continue;
    }
    const continuationMatch = /^\s{2,}(.*)$/.exec(line);
    if (continuationMatch && activeCategory.entries.length > 0) {
      const last = activeCategory.entries.length - 1;
      activeCategory.entries[last] = `${activeCategory.entries[last]} ${continuationMatch[1].trim()}`.trim();
    }
  }

  return { title, description, categories };
}

async function main() {
  const [markdown, pkgRaw] = await Promise.all([
    readFile(CHANGELOG_PATH, 'utf8'),
    readFile(PACKAGE_PATH, 'utf8'),
  ]);
  const pkg = JSON.parse(pkgRaw);
  const build = getBuildNumber();

  const blocks = splitIntoBlocks(markdown);
  const releases = [];
  for (const block of blocks) {
    const header = parseHeader(block.header);
    if (!header) continue;
    const body = parseBody(block.body);
    releases.push({
      version: header.version,
      date: header.date,
      channel: header.channel,
      title: body.title,
      description: body.description,
      categories: body.categories,
    });
  }

  const channel = pkg.version.includes('-dev.') ? 'development'
    : pkg.version.includes('-alpha.') ? 'alpha'
    : 'stable';

  const fullVersion = pkg.version.includes('.BUILD')
    ? pkg.version.replace('.BUILD', `.${build}`)
    : pkg.version;

  const out = {
    currentVersion: fullVersion,
    build,
    channel,
    generatedAt: new Date().toISOString(),
    releases,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  process.stdout.write(`Wrote ${OUT_PATH} (${releases.length} releases, build ${build}).\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

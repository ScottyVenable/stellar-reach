// Typed mirror of the JSON document produced by scripts/parse-changelog.mjs.
// The runtime data is committed alongside the build by the prebuild step, so
// importing this module is a normal static import.

import generated from '../data/changelog.generated.json';

export type ChangelogChannel = 'development' | 'alpha' | 'stable' | 'unreleased';

export interface ChangelogCategory {
  id: string;
  label: string;
  entries: string[];
}

export interface ChangelogRelease {
  version: string;
  date: string | null;
  channel: ChangelogChannel;
  title: string;
  description: string;
  categories: ChangelogCategory[];
}

export interface ChangelogDocument {
  currentVersion: string;
  build: number;
  channel: ChangelogChannel;
  generatedAt: string;
  releases: ChangelogRelease[];
}

export const changelog = generated as unknown as ChangelogDocument;

export function releasesByChannel(channel: ChangelogChannel): ChangelogRelease[] {
  return changelog.releases.filter((release) => release.channel === channel);
}

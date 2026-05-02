// Mod loader scaffold. v0.2 supports the `goods` category only; everything
// else is reserved and rejected by the validator until later milestones.
//
// Mods committed to this repository under `mods/` are bundled into the
// build at prebuild time (see scripts/bundle-mods.mjs). At runtime the
// loader merges the bundled registry with the engine's authored content.
//
// End-user-installable mods (loading from a chosen filesystem handle in
// the PWA) are tracked under roadmap milestone M14+.

export type ModCategory = 'goods' | 'events' | 'traits' | 'modules' | 'races';

export interface ModManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  gameVersion: string;
  manifestVersion: 1;
  dependencies?: string[];
  load: Partial<Record<ModCategory, string>>;
  overrides?: Partial<Record<ModCategory, string[]>>;
}

export interface ModBundle {
  manifest: ModManifest;
  data: Partial<Record<ModCategory, unknown[]>>;
}

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const PREFIXED_ID_PATTERN = /^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/;
const SUPPORTED_CATEGORIES: ModCategory[] = ['goods'];

export interface ModValidationIssue {
  modId: string;
  category?: ModCategory;
  message: string;
}

export function validateManifest(manifest: ModManifest): ModValidationIssue[] {
  const issues: ModValidationIssue[] = [];
  const id = manifest?.id ?? '<unknown>';
  if (!manifest || typeof manifest !== 'object') {
    return [{ modId: id, message: 'Manifest is not an object.' }];
  }
  if (!ID_PATTERN.test(manifest.id ?? '')) {
    issues.push({ modId: id, message: `Invalid mod id "${manifest.id}".` });
  }
  if (manifest.manifestVersion !== 1) {
    issues.push({ modId: id, message: `Unsupported manifestVersion ${manifest.manifestVersion}.` });
  }
  for (const required of ['name', 'version', 'author', 'description', 'gameVersion'] as const) {
    if (typeof manifest[required] !== 'string' || manifest[required].length === 0) {
      issues.push({ modId: id, message: `Missing required field "${required}".` });
    }
  }
  for (const cat of Object.keys(manifest.load ?? {}) as ModCategory[]) {
    if (!SUPPORTED_CATEGORIES.includes(cat)) {
      issues.push({ modId: id, category: cat, message: `Category "${cat}" is reserved and not yet supported by the loader.` });
    }
  }
  return issues;
}

export function validateGoods(modId: string, entries: unknown[]): ModValidationIssue[] {
  const issues: ModValidationIssue[] = [];
  if (!Array.isArray(entries)) {
    return [{ modId, category: 'goods', message: 'goods.json must be a JSON array.' }];
  }
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] as Record<string, unknown>;
    if (typeof entry?.id !== 'string' || !PREFIXED_ID_PATTERN.test(entry.id as string)) {
      issues.push({ modId, category: 'goods', message: `Entry [${i}] has an invalid or unprefixed id "${entry?.id}". Use "${modId}:<kebab-id>".` });
    }
    if (typeof entry?.name !== 'string' || (entry.name as string).length === 0) {
      issues.push({ modId, category: 'goods', message: `Entry [${i}] is missing a name.` });
    }
    if (typeof entry?.basePrice !== 'number' || (entry.basePrice as number) <= 0) {
      issues.push({ modId, category: 'goods', message: `Entry [${i}] has an invalid basePrice.` });
    }
    if (typeof entry?.bulk !== 'number' || (entry.bulk as number) <= 0) {
      issues.push({ modId, category: 'goods', message: `Entry [${i}] has an invalid bulk.` });
    }
    if (!['legal', 'restricted', 'illegal'].includes(entry?.legality as string)) {
      issues.push({ modId, category: 'goods', message: `Entry [${i}] has an invalid legality. Use "legal", "restricted", or "illegal".` });
    }
  }
  return issues;
}

/**
 * Validates a fully-loaded mod bundle (manifest + data files). Used by the
 * prebuild step so CI fails fast on a malformed mod.
 */
export function validateBundle(bundle: ModBundle): ModValidationIssue[] {
  const issues = validateManifest(bundle.manifest);
  for (const cat of Object.keys(bundle.data) as ModCategory[]) {
    if (cat === 'goods') {
      issues.push(...validateGoods(bundle.manifest.id, bundle.data.goods ?? []));
    }
  }
  return issues;
}

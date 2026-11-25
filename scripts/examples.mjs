import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '..');

/** Every folder at the root that contains a manifest.json is an example extension. */
export function listExamples() {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'manifest.json')))
    .map((entry) => {
      const dir = join(root, entry.name);
      const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
      return { name: entry.name, dir, manifest };
    });
}

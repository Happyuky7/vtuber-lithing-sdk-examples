// Zips every built example into artifacts/<id>-<version>.zip, ready for
// Settings → Plugins → Install .zip extension. manifest.json sits at the root.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { zipSync } from 'fflate';
import { listExamples, root } from './examples.mjs';

const included = ['manifest.json', 'dist', 'locales', 'assets', 'README.md'];
const artifacts = join(root, 'artifacts');
mkdirSync(artifacts, { recursive: true });

function addFiles(files, base, path) {
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path)) addFiles(files, base, join(path, entry));
    return;
  }
  // Source maps point at local paths; leave them out of the installable ZIP.
  if (path.endsWith('.map')) return;
  files[relative(base, path).replaceAll('\\', '/')] = readFileSync(path);
}

for (const example of listExamples()) {
  const entry = join(example.dir, example.manifest.entry);
  if (!existsSync(entry)) throw new Error(`${example.name}: ${example.manifest.entry} is missing, run pnpm build first.`);
  const files = {};
  for (const item of included) {
    const path = join(example.dir, item);
    if (existsSync(path)) addFiles(files, example.dir, path);
  }
  files.LICENSE = readFileSync(join(root, 'LICENSE'));
  const output = join(artifacts, `${example.manifest.id}-${example.manifest.version}.zip`);
  writeFileSync(output, zipSync(files, { level: 9 }));
  console.log(`Packaged ${relative(root, output)} (${Object.keys(files).length} files)`);
}

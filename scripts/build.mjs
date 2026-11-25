// Bundles every example into its own <example>/dist/index.js ES module,
// with the SDK inlined, as the application expects.
import { join } from 'node:path';
import { build } from 'vite';
import { listExamples } from './examples.mjs';

const only = process.argv[2];

for (const example of listExamples().filter((item) => !only || item.name === only)) {
  await build({
    configFile: false,
    logLevel: 'warn',
    root: example.dir,
    build: {
      outDir: join(example.dir, 'dist'),
      emptyOutDir: true,
      minify: false,
      sourcemap: true,
      lib: {
        entry: join(example.dir, 'src', 'index.ts'),
        formats: ['es'],
        fileName: () => 'index.js'
      }
    }
  });
  console.log(`Built ${example.name} → ${example.manifest.entry}`);
}

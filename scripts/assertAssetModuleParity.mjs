import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const originalRoot = join(root, '..', 'BOE-O');
const publicRoot = join(root, 'public');

const assetModules = ['sprites', 'buttons', 'frames', 'morphshapes', 'movies'];

function walkFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) {
      continue;
    }

    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walkFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const failures = [];
const summary = [];

for (const moduleName of assetModules) {
  const originalDir = join(originalRoot, moduleName);
  const publicDir = join(publicRoot, moduleName);

  if (!existsSync(originalDir)) {
    failures.push(`Original asset module is missing: BOE-O/${moduleName}`);
    continue;
  }

  if (!existsSync(publicDir)) {
    failures.push(`Public asset module is missing: public/${moduleName}`);
    continue;
  }

  const originalFiles = walkFiles(originalDir);
  let copiedFiles = 0;
  let copiedBytes = 0;
  const missing = [];
  const changed = [];

  for (const originalFile of originalFiles) {
    const relativePath = relative(originalDir, originalFile);
    const publicFile = join(publicDir, relativePath);
    const originalStat = statSync(originalFile);

    if (!existsSync(publicFile)) {
      missing.push(relativePath);
      continue;
    }

    const publicStat = statSync(publicFile);
    if (publicStat.size !== originalStat.size) {
      changed.push(`${relativePath} (${publicStat.size} bytes in public, ${originalStat.size} bytes in BOE-O)`);
      continue;
    }

    copiedFiles += 1;
    copiedBytes += publicStat.size;
  }

  if (missing.length || changed.length) {
    failures.push(
      [
        `Asset module public/${moduleName} is not at BOE-O parity.`,
        missing.length ? `Missing files:\n${missing.slice(0, 20).map((item) => `  - ${item}`).join('\n')}` : '',
        missing.length > 20 ? `  ...and ${missing.length - 20} more` : '',
        changed.length ? `Changed files:\n${changed.slice(0, 20).map((item) => `  - ${item}`).join('\n')}` : '',
        changed.length > 20 ? `  ...and ${changed.length - 20} more` : '',
      ].filter(Boolean).join('\n')
    );
  }

  summary.push(`${moduleName}: ${copiedFiles}/${originalFiles.length} files, ${formatBytes(copiedBytes)}`);
}

if (failures.length) {
  throw new Error(`Asset module parity failed:\n${failures.join('\n\n')}`);
}

console.log(`Asset module parity checks passed.\n${summary.join('\n')}`);

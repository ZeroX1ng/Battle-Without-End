import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

const vendoredAs3Root = join(projectRoot, 'reference', 'as3', 'BOE-O');
const siblingAs3Root = join(projectRoot, '..', 'BOE-O');

function normalizeRoot(root) {
  return resolve(root);
}

export function resolveAs3Root() {
  const envRoot = process.env.BWE_AS3_ROOT?.trim();

  if (envRoot) {
    const resolved = normalizeRoot(envRoot);
    if (!existsSync(resolved)) {
      throw new Error(`BWE_AS3_ROOT points to a missing directory: ${resolved}`);
    }
    return resolved;
  }

  if (existsSync(vendoredAs3Root)) {
    return normalizeRoot(vendoredAs3Root);
  }

  if (existsSync(siblingAs3Root)) {
    return normalizeRoot(siblingAs3Root);
  }

  throw new Error(
    [
      'Missing AS3 source root.',
      `Checked vendored source: ${vendoredAs3Root}`,
      `Checked sibling source: ${siblingAs3Root}`,
      'Set BWE_AS3_ROOT to override the source location.',
    ].join('\n')
  );
}

export function resolveAs3Path(relativePath = '') {
  return join(resolveAs3Root(), relativePath);
}

export function readAs3(relativePath) {
  const filePath = resolveAs3Path(relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing AS3 source: ${relativePath}\nResolved path: ${filePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

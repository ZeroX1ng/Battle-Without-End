import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
]);

const ignoredDirectories = new Set([
  '.git',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'public',
]);

const badFragments = [
  '\uFFFD',
  '\u00C3',
  '\u00C2',
  '\u00E2',
  '\u923D',
  '\u951F',
  '\u9525\u65A4',
  '\u6D63\u72BA',
  '\u9473\u5C7D',
  '\u7039\u72B5',
  '\u95BF\u5A5A',
  '\u9357\u56E9',
  '\u7EC9\u677F',
  '\u7459\uFF49',
  '\u9410\u572D',
  '\u7F01\u5FDB',
  '\u5A13\u544A',
  '\u701B\u6A3B',
  '\u6D93\u5D85',
  '\u5A11\u581D',
  '\u9428\u52EC',
  '\u9365\u70B2',
  '\u9435',
  '\u9418',
  '\u9366',
  '\u93C8',
  '\u93B4',
  '\u93CD',
  '\u95BF',
  '\u9410',
  '\u9473',
  '\u7039',
  '\u701B',
  '\u5A13',
  '\u5A11',
  '\u5B80',
];

function extensionOf(path) {
  const dot = path.lastIndexOf('.');
  return dot < 0 ? '' : path.slice(dot).toLowerCase();
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirectories.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, files);
    } else if (textExtensions.has(extensionOf(entry))) {
      files.push(path);
    }
  }
  return files;
}

function hasPrivateUseCharacter(line) {
  for (const char of line) {
    const code = char.codePointAt(0);
    if (code >= 0xE000 && code <= 0xF8FF) return true;
  }
  return false;
}

const failures = [];

for (const file of walk(root)) {
  const rel = relative(root, file).replaceAll('\\', '/');
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    failures.push(`${rel}: cannot read as UTF-8 (${error.message})`);
    continue;
  }

  text.split(/\r?\n/).forEach((line, index) => {
    const fragment = badFragments.find(item => line.includes(item));
    if (fragment) {
      failures.push(`${rel}:${index + 1}: contains mojibake fragment ${JSON.stringify(fragment)}`);
      return;
    }
    if (hasPrivateUseCharacter(line)) {
      failures.push(`${rel}:${index + 1}: contains private-use Unicode character`);
    }
  });
}

if (failures.length) {
  throw new Error(`Source text encoding check failed:\n${failures.join('\n')}`);
}

console.log('Source text encoding checks passed.');

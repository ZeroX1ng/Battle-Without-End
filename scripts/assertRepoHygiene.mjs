import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  failures.push(message);
}

const packageJson = JSON.parse(read('package.json'));
const scripts = packageJson.scripts ?? {};

for (const scriptName of ['dev', 'build', 'preview']) {
  const command = scripts[scriptName] ?? '';
  if (!command.includes('--config vite.config.mjs') || !command.includes('--configLoader native')) {
    fail(`package.json script "${scriptName}" must use vite.config.mjs with native config loader.`);
  }
  if (command.includes('vite.config.ts')) {
    fail(`package.json script "${scriptName}" must not point at vite.config.ts.`);
  }
}

if (!existsSync(path.join(root, 'vite.config.mjs'))) {
  fail('Missing authoritative vite.config.mjs.');
}

if (existsSync(path.join(root, 'vite.config.ts'))) {
  fail('vite.config.ts still exists as an active-looking duplicate; vite.config.mjs must be the only Vite config.');
}

const gitignore = read('.gitignore');
if (/^dist\/?$/m.test(gitignore)) {
  fail('dist/ is ignored even though this card keeps tracked dist as release input.');
}

let trackedDistFiles = [];
try {
  trackedDistFiles = execFileSync('git', ['ls-files', 'dist'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split(/\r?\n/)
    .filter(Boolean);
} catch (error) {
  fail(`Unable to inspect tracked dist files: ${error.message}`);
}

if (trackedDistFiles.length === 0) {
  fail('dist/ policy is tracked release input, but git does not track any dist files.');
}

const packageFiles = packageJson.build?.files ?? [];
if (!packageFiles.includes('dist/**/*')) {
  fail('electron-builder files must include dist/**/* for the tracked release-input policy.');
}

const packExe = scripts['pack:exe'] ?? '';
if (!packExe.startsWith('npm run build &&')) {
  fail('pack:exe must run npm run build before electron-builder to avoid stale dist packaging.');
}

const releaseWorkflow = read('.github/workflows/release-win.yml');
if (!releaseWorkflow.includes('npm run assert:repo-hygiene')) {
  fail('release-win.yml must include assert:repo-hygiene in release guards.');
}

if (!releaseWorkflow.includes('npm run pack:exe')) {
  fail('release-win.yml must build the portable exe through npm run pack:exe.');
}

const card = read('docs/parity/p2-build-artifact-config-hygiene.md');
if (!card.includes('Tracked dist policy') || !card.includes('vite.config.mjs is the only active Vite config')) {
  fail('p2-build-artifact-config-hygiene.md must document the dist policy and active Vite config decision.');
}

if (failures.length > 0) {
  console.error('Repo hygiene guard failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(`Repo hygiene guard passed (${trackedDistFiles.length} tracked dist files).`);

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const packageScripts = packageJson.scripts ?? {};
const npmCommand = 'npm';
const npxCommand = 'npx';

const registeredAssertScripts = Object.keys(packageScripts)
  .filter((name) => name.startsWith('assert:') && !name.startsWith('assert:gate:'))
  .sort((a, b) => a.localeCompare(b));

const scriptByFile = new Map();
for (const [name, command] of Object.entries(packageScripts)) {
  if (!name.startsWith('assert:')) {
    continue;
  }
  const match = /^node scripts\/(.+\.mjs)$/.exec(String(command).trim());
  if (match) {
    scriptByFile.set(normalizePath(`scripts/${match[1]}`), name);
  }
}

const groups = {
  baseline: ['assert:preflight', 'assert:source-encoding', 'assert:text-resources'],
  architecture: ['assert:architecture', 'assert:module-boundary-decomposition'],
  assets: ['assert:asset-modules', 'assert:source-encoding'],
  battle: [
    'assert:battle-player-state',
    'assert:monster-reward',
    'assert:battle-damage-log-death',
    'assert:battle-death-penalty',
    'assert:battle-numeric-coercion',
    'assert:battle-active-skill-single-roll',
    'assert:battle-pet-exp-reward',
    'assert:battle-pet-flow-logs',
    'assert:text-resources',
  ],
  equipment: [
    'assert:equip-window',
    'assert:equipment-data',
    'assert:stat-list',
    'assert:equipment-ownership',
    'assert:equipment-api',
    'assert:weapon-load-category',
    'assert:weapon-quality-stat',
    'assert:equipment-compare-tooltip',
    'assert:equip-window-bounds',
    'assert:drop-filter-auto-sell',
    'assert:forge-logic',
    'assert:forge-ui-placement',
    'assert:quality-color',
    'assert:common-cell',
  ],
  gameLoop: [
    'assert:game-loop',
    'assert:battle-player-state',
    'assert:battle-damage-log-death',
    'assert:save-persistence',
    'assert:visual-fps-cap',
    'assert:test-speed-control',
    'assert:responsive-layout',
  ],
  map: [
    'assert:map-data',
    'assert:map-selection',
    'assert:monster-data-integrity',
    'assert:monster-reward',
  ],
  monster: [
    'assert:monster-data-immutable',
    'assert:monster-data-integrity',
    'assert:monster-reward',
    'assert:monster-title-tooltip',
    'assert:pet-data',
    'assert:battle-pet-exp-reward',
    'assert:battle-pet-flow-logs',
  ],
  save: [
    'assert:save-persistence',
    'assert:save-load-runtime-continuity',
    'assert:title-data-save-parity',
    'assert:architecture',
  ],
  skill: [
    'assert:skill-data-values',
    'assert:skill-window',
    'assert:skill-eligibility-effects',
    'assert:growth-skill-protection',
    'assert:battle-active-skill-single-roll',
    'assert:battle-damage-log-death',
  ],
  start: [
    'assert:start-character-age',
    'assert:start-burn-save',
    'assert:growth-skill-protection',
    'assert:equipment-ownership',
    'assert:save-persistence',
  ],
  text: ['assert:text-resources', 'assert:source-encoding'],
  ui: [
    'assert:system-window',
    'assert:shop-window',
    'assert:pet-window',
    'assert:title-window',
    'assert:other-panel',
    'assert:other-window-children',
    'assert:other-window-overlay',
    'assert:item-window',
    'assert:scroll-panel',
    'assert:effects',
    'assert:responsive-layout',
    'assert:common-cell',
  ],
};

function parseArgs() {
  const options = {
    base: '',
    mode: 'changed',
  };

  for (const arg of process.argv.slice(2)) {
    if (['baseline', 'changed', 'all', 'ci'].includes(arg)) {
      options.mode = arg;
    } else if (arg.startsWith('--base=')) {
      options.base = arg.slice('--base='.length);
    }
  }

  return options;
}

function normalizePath(path) {
  return path.replaceAll('\\', '/').replace(/^BWE\//, '');
}

function isZeroSha(value) {
  return value && /^0+$/.test(value);
}

function gitOutput(args, allowFailure = false) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    if (allowFailure) {
      return null;
    }
    throw new Error((result.stderr || result.stdout || `git ${args.join(' ')} failed`).trim());
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => normalizePath(line.trim()))
    .filter(Boolean);
}

function readGitHubBaseSha() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !existsSync(eventPath)) {
    return '';
  }

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  return event.pull_request?.base?.sha ?? event.before ?? '';
}

function getChangedFiles(base) {
  if (base && !isZeroSha(base)) {
    const tripleDot = gitOutput(['diff', '--name-only', '--diff-filter=ACMRTUB', `${base}...HEAD`], true);
    if (tripleDot) {
      return unique(tripleDot);
    }

    const doubleDot = gitOutput(['diff', '--name-only', '--diff-filter=ACMRTUB', `${base}..HEAD`], true);
    if (doubleDot) {
      return unique(doubleDot);
    }

    console.warn(`Could not diff against base ${base}; falling back to local changes.`);
  }

  const tracked = gitOutput(['diff', '--name-only', '--diff-filter=ACMRTUB', 'HEAD'], true) ?? [];
  const untracked = gitOutput(['ls-files', '--others', '--exclude-standard'], true) ?? [];
  return unique([...tracked, ...untracked]);
}

function unique(values) {
  return [...new Set(values)];
}

function addScript(selected, scriptName) {
  if (packageScripts[scriptName]) {
    selected.add(scriptName);
  } else {
    console.warn(`Skipping missing npm script: ${scriptName}`);
  }
}

function addGroup(selected, groupName) {
  for (const scriptName of groups[groupName] ?? []) {
    addScript(selected, scriptName);
  }
}

function addAllRegistered(selected) {
  for (const scriptName of registeredAssertScripts) {
    addScript(selected, scriptName);
  }
}

function selectChangedGuards(files) {
  const selected = new Set();
  addGroup(selected, 'baseline');

  for (const file of files) {
    const lower = file.toLowerCase();
    const directScript = scriptByFile.get(file);

    if (directScript) {
      addScript(selected, directScript);
    }

    if (
      lower === 'package.json' ||
      lower === 'tsconfig.json' ||
      lower.startsWith('.github/workflows/') ||
      lower === 'scripts/runguardgate.mjs' ||
      lower.startsWith('docs/ai/') ||
      lower === 'agents.md'
    ) {
      addGroup(selected, 'architecture');
    }

    if (lower.startsWith('scripts/lib/') || lower.startsWith('reference/as3/')) {
      addAllRegistered(selected);
      continue;
    }

    if (lower.startsWith('public/') || lower.includes('/assets/') || lower.includes('/sprites/')) {
      addGroup(selected, 'assets');
    }

    if (lower.includes('battle') || lower.includes('allinfopanel')) {
      addGroup(selected, 'battle');
    }

    if (
      lower.includes('equipment') ||
      lower.includes('equip') ||
      lower.includes('forge') ||
      lower.includes('itemwindow') ||
      lower.includes('weapon') ||
      lower.includes('loot') ||
      lower.includes('quality')
    ) {
      addGroup(selected, 'equipment');
    }

    if (lower.includes('gameloop') || lower.includes('usegameloop') || lower.includes('fps') || lower.includes('speed')) {
      addGroup(selected, 'gameLoop');
    }

    if (lower.includes('map')) {
      addGroup(selected, 'map');
    }

    if (lower.includes('monster') || lower.includes('pet')) {
      addGroup(selected, 'monster');
    }

    if (lower.includes('save') || lower.includes('base64') || lower.includes('slot')) {
      addGroup(selected, 'save');
    }

    if (lower.includes('skill')) {
      addGroup(selected, 'skill');
    }

    if (
      lower.includes('player') ||
      lower.includes('race') ||
      lower.includes('start') ||
      lower.includes('agegrowth') ||
      lower.includes('characterage') ||
      lower.includes('age-growth')
    ) {
      addGroup(selected, 'start');
    }

    if (lower.includes('text') || lower.includes('resource') || lower.endsWith('.md')) {
      addGroup(selected, 'text');
    }

    if (
      lower.startsWith('src/components/') ||
      lower.includes('window') ||
      lower.includes('panel') ||
      lower.includes('tooltip') ||
      lower.includes('scroll') ||
      lower.includes('responsive') ||
      lower.includes('effect')
    ) {
      addGroup(selected, 'ui');
    }

    if (lower.startsWith('src/state/') || lower.startsWith('src/core/')) {
      addGroup(selected, 'architecture');
    }
  }

  return [...selected];
}

function run(command, args, label) {
  console.log(`\n> ${label}`);
  const child =
    process.platform === 'win32'
      ? {
          command: 'cmd.exe',
          args: ['/d', '/s', '/c', [command, ...args].map(quoteCmdArg).join(' ')],
        }
      : { command, args };

  const result = spawnSync(child.command, child.args, {
    cwd: root,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runNpmScript(scriptName) {
  run(npmCommand, ['run', scriptName], `npm run ${scriptName}`);
}

function quoteCmdArg(value) {
  return /^[A-Za-z0-9_:@=./\\-]+$/.test(value) ? value : `"${value.replaceAll('"', '\\"')}"`;
}

function runTypecheck() {
  run(npxCommand, ['tsc', '-b'], 'npx tsc -b');
}

function printSelection(mode, files, scripts) {
  console.log(`Guard gate mode: ${mode}`);
  if (files.length) {
    console.log('Changed files:');
    for (const file of files) {
      console.log(`  - ${file}`);
    }
  }
  console.log('Selected guards:');
  for (const scriptName of scripts) {
    console.log(`  - ${scriptName}`);
  }
  console.log('  - npx tsc -b');
}

const options = parseArgs();
const ciBase = options.mode === 'ci' ? options.base || readGitHubBaseSha() : options.base;
const mode = options.mode === 'ci' ? 'changed' : options.mode;
const changedFiles = mode === 'changed' ? getChangedFiles(ciBase) : [];
const scripts =
  mode === 'all'
    ? registeredAssertScripts
    : mode === 'baseline'
      ? groups.baseline
      : selectChangedGuards(changedFiles);

printSelection(options.mode, changedFiles, scripts);

for (const scriptName of scripts) {
  runNpmScript(scriptName);
}
runTypecheck();

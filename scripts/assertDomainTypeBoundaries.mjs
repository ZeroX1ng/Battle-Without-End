import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotMatches(source, pattern, message) {
  if (pattern.test(source)) {
    throw new Error(message);
  }
}

function extractInterface(source, name) {
  const start = source.indexOf(`export interface ${name} {`);
  if (start < 0) {
    throw new Error(`Missing interface ${name}`);
  }
  const end = source.indexOf('\n}', start);
  if (end < 0) {
    throw new Error(`Could not read interface ${name}`);
  }
  return source.slice(start, end);
}

function countBroadAny(files) {
  const broadAny = /\bas any\b|:\s*any\b|\bany\[\]/g;
  return files.reduce((count, file) => {
    return count + [...read(file).matchAll(broadAny)].length;
  }, 0);
}

const coreTypes = read('src/core/types.ts');
const actions = read('src/state/actions.ts');
const gameContext = read('src/state/GameContext.tsx');
const playerModel = read('src/core/models/Player.ts');
const battleModel = read('src/core/models/Battle.ts');
const packageJson = JSON.parse(read('package.json'));

if (packageJson.scripts?.['assert:domain-type-boundaries'] !== 'node scripts/assertDomainTypeBoundaries.mjs') {
  throw new Error('package.json must expose assert:domain-type-boundaries');
}

assertIncludes(coreTypes, "import type { BasicStatus } from './models/BasicStatus';", 'PlayerState must import the BasicStatus runtime model type');
assertIncludes(coreTypes, "import type { Race } from './models/Race';", 'PlayerState must import the Race runtime model type');
assertIncludes(coreTypes, "import type { Equipment } from './models/Equipment';", 'PlayerState must import the Equipment runtime model type');
assertIncludes(coreTypes, "import type { Skill } from './models/Skill';", 'PlayerState must import the Skill runtime model type');
assertIncludes(coreTypes, "import type { Pet } from './models/Pet';", 'PlayerState must import the Pet runtime model type');
assertIncludes(coreTypes, "import type { Battle } from './models/Battle';", 'GameState.battle must use the Battle runtime model type');

const playerState = extractInterface(coreTypes, 'PlayerState');
for (const [field, type] of [
  ['race', 'Race | null'],
  ['basicStatus', 'BasicStatus'],
  ['pet', 'Pet | null'],
  ['title', 'TitleData | null'],
  ['head', 'Equipment | null'],
  ['feet', 'Equipment | null'],
  ['body', 'Equipment | null'],
  ['necklace', 'Equipment | null'],
  ['ring', 'Equipment | null'],
  ['leftHand', 'Equipment | null'],
  ['rightHand', 'Equipment | null'],
  ['skillStatus', 'BasicStatus'],
  ['equipStatus', 'BasicStatus'],
  ['skillList', 'Skill[]'],
  ['equipSkillList', 'Skill[]'],
  ['itemList', 'Equipment[]'],
  ['titleList', 'TitleData[]'],
  ['petList', 'Pet[]'],
]) {
  assertIncludes(playerState, `${field}: ${type};`, `PlayerState.${field} must be typed as ${type}`);
}
assertNotMatches(playerState, /:\s*any\b|\bany\[\]/, 'PlayerState must not use broad any for high-value domain fields');

assertIncludes(coreTypes, 'battle: Battle | null;', 'GameState.battle must be typed as the Battle runtime model');
assertIncludes(coreTypes, 'equip: Equipment;', 'ShopStockItem.equip must use the Equipment runtime model');

for (const needle of [
  "import type { Pet } from '../core/models/Pet';",
  "import type { TitleData } from '../core/types';",
  "| { type: 'PET_ADD'; pet: Pet }",
  "| { type: 'PET_SET'; pet: Pet }",
  "| { type: 'PET_REMOVE'; pet: Pet }",
  "| { type: 'TITLE_ADD'; title: TitleData }",
  "| { type: 'TITLE_SET'; title: TitleData }",
]) {
  assertIncludes(actions, needle, `GameAction must expose typed pet/title payload boundary: ${needle}`);
}
assertNotMatches(actions, /\b(PET_ADD|PET_SET|PET_REMOVE|TITLE_ADD|TITLE_SET)';\s+(pet|title):\s*any\b/, 'GameAction pet/title payloads must not use any');

for (const [source, needle, message] of [
  [playerModel, 'export function addPet(state: PlayerState, pet: Pet): { state: PlayerState; added: boolean }', 'Player.addPet must accept Pet'],
  [playerModel, 'export function setPet(state: PlayerState, pet: Pet): PlayerState', 'Player.setPet must accept Pet'],
  [playerModel, 'export function removePet(state: PlayerState, pet: Pet): PlayerState', 'Player.removePet must accept Pet'],
  [battleModel, 'public pet: Pet | null = null;', 'Battle.pet must be typed as Pet | null'],
  [battleModel, 'private getAttackSkills(): Skill[]', 'Battle attack skill list must be typed as Skill[]'],
  [battleModel, 'private getDefenceSkills(): Skill[]', 'Battle defence skill list must be typed as Skill[]'],
]) {
  assertIncludes(source, needle, message);
}

assertNotMatches(gameContext, /state\.battle as any/, 'GameContext must not cast state.battle to any on battle ownership paths');

const guardedFiles = [
  'src/core/types.ts',
  'src/state/actions.ts',
  'src/state/GameContext.tsx',
  'src/core/models/Player.ts',
  'src/core/models/Battle.ts',
];
const broadAnyCount = countBroadAny(guardedFiles);
if (broadAnyCount > 45) {
  throw new Error(`Broad any count in domain boundary files must stay <= 45; found ${broadAnyCount}`);
}

console.log('Domain type boundary checks passed.');

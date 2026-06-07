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

const coreTypes = read('src/core/types.ts');
const monsterModel = read('src/core/models/Monster.ts');
const buffModel = read('src/core/models/Buff.ts');
const skillBehaviors = read('src/core/data/skillBehaviors.ts');
const petSkillBehaviors = read('src/core/data/petSkillBehaviors.ts');
const packageJson = JSON.parse(read('package.json'));

if (packageJson.scripts?.['assert:battle-runtime-type-contracts'] !== 'node scripts/assertBattleRuntimeTypeContracts.mjs') {
  throw new Error('package.json must expose assert:battle-runtime-type-contracts');
}

const monsterInstance = extractInterface(coreTypes, 'MonsterInstance');
assertIncludes(monsterInstance, 'buffList: BuffData[];', 'MonsterInstance.buffList must expose the BuffData runtime boundary');
assertIncludes(monsterInstance, 'addBuff(buff: BuffData): void;', 'MonsterInstance.addBuff must accept BuffData');
assertIncludes(monsterInstance, 'runBuff(context?: { monsterHp: number; monsterNameHtml?: string }): string[];', 'MonsterInstance.runBuff must return string[] logs');
assertIncludes(monsterInstance, 'isContainBuff(name: string): BuffData | null;', 'MonsterInstance.isContainBuff must expose BuffData | null');
assertNotMatches(monsterInstance, /runBuff\([^)]*\):\s*void\b/, 'MonsterInstance.runBuff must not hide returned log strings behind void');

const battleBehaviorResult = extractInterface(coreTypes, 'BattleBehaviorResult');
for (const needle of [
  'success: boolean;',
  'logs: string[];',
  'playerHpDelta: number;',
  'playerMpDelta: number;',
  'monsterHpDelta: number;',
]) {
  assertIncludes(battleBehaviorResult, needle, `BattleBehaviorResult must expose ${needle}`);
}
assertNotMatches(battleBehaviorResult, /:\s*any\b|\bany\[\]/, 'BattleBehaviorResult must not use broad any');

for (const [source, needle, message] of [
  [monsterModel, 'public buffList: BuffData[] = [];', 'Monster.buffList must be typed as BuffData[]'],
  [monsterModel, 'isContainBuff(name: string): BuffData | null', 'Monster.isContainBuff must return BuffData | null'],
  [monsterModel, 'addBuff(buff: BuffData): void', 'Monster.addBuff must accept BuffData'],
  [monsterModel, 'runBuff(context?: BuffContext): string[]', 'Monster.runBuff must return string[]'],
  [buffModel, 'run(_context?: BuffContext): string | null', 'Buff.run must return string | null'],
]) {
  assertIncludes(source, needle, message);
}

for (const [source, label] of [
  [skillBehaviors, 'skillBehaviors.ts'],
  [petSkillBehaviors, 'petSkillBehaviors.ts'],
]) {
  assertNotMatches(source, /\bbattle:\s*any\b/, `${label} must not type battle behavior context as any`);
  assertNotMatches(source, /\bpet:\s*any\b/, `${label} must not type pet behavior context as any`);
  assertNotMatches(source, /export function (?:pet_)?behave_[^(]*\([^)]*:\s*any\b/, `${label} exported battle behavior functions must not use broad any parameters`);
}

assertIncludes(skillBehaviors, "import type { Battle } from '../models/Battle';", 'skillBehaviors.ts must import the Battle runtime model type');
assertIncludes(skillBehaviors, "import type { Skill } from '../models/Skill';", 'skillBehaviors.ts must import the Skill runtime model type');
assertIncludes(petSkillBehaviors, "import type { Battle } from '../models/Battle';", 'petSkillBehaviors.ts must import the Battle runtime model type');
assertIncludes(petSkillBehaviors, "import type { Pet } from '../models/Pet';", 'petSkillBehaviors.ts must import the Pet runtime model type');
assertIncludes(petSkillBehaviors, "import type { PetSkillInstance } from '../types';", 'petSkillBehaviors.ts must import the PetSkillInstance behavior type');

console.log('Battle runtime type contract checks passed.');

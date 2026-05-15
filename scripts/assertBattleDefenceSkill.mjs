import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const srcRoot = join(root, 'src');
const outRoot = join(root, '.tmp-battle-defence-test');
const testEntry = join(outRoot, 'battle-defence-skill.test.ts');
const seen = new Set();

const testSource = `
import { Battle } from './core/models/Battle';
import { SkillCategory, SkillType } from './core/constants';

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(label + "\\nexpected: " + e + "\\nactual:   " + a);
  }
}

const status = {
  hp: 100,
  mp: 100,
  str: 0,
  dex: 0,
  intelligence: 0,
  will: 0,
  luck: 0,
  attack: { min: 0, max: 0 },
  balance: 0,
  crit: 0,
  crit_mul: 0,
  defence: 0,
  protection: 0,
  spellChance: 100,
  manaConsumption: 0,
  protectionIgnore: 0,
  protectionReduce: 0,
  magicDamage: 0,
};

let defenceCalled = false;
const defenceSkill = {
  level: 0,
  skillData: {
    name: 'TEST_DEFENCE',
    realName: 'Test Defence',
    category: SkillCategory.ALL,
    type: SkillType.DEFENCE,
    statList: [[]],
    lvupCostList: [0],
    behaveFunction: (_skill: unknown, battle: Battle) => {
      defenceCalled = true;
      battle.playerHp -= 7;
      return {
        success: true,
        logs: ['defence skill used'],
        playerHpDelta: -7,
        playerMpDelta: 0,
        monsterHpDelta: 0,
      };
    },
  },
};

const playerState = {
  lv: 1,
  age: 10,
  race: null,
  basicStatus: status,
  ap: 0,
  gold: 0,
  xp: 0,
  pet: null,
  title: null,
  apCost: 0,
  storeLv: 0,
  head: null,
  feet: null,
  body: null,
  necklace: null,
  ring: null,
  leftHand: null,
  rightHand: null,
  BAGMAX: 50,
  PETMAX: 10,
  caculate: 0,
  playerName: 'Tester',
  skillStatus: status,
  equipStatus: status,
  skillList: [defenceSkill],
  equipSkillList: [defenceSkill],
  itemList: [],
  titleList: [],
  petList: [],
};

const battle = new Battle(playerState as any, {} as any);
battle.playerHp = 100;
battle.playerMp = 100;
battle.monsterHp = 100;
battle.monster = {
  crit: 0,
  crit_mul: 100,
  attack: 40,
  defence: 0,
  protection: 0,
  data: { protection: 0 },
  getNameHtml: () => 'Monster',
} as any;

const originalRandom = Math.random;
let calls = 0;
Math.random = () => (calls++ === 0 ? 0 : 0);
try {
  (battle as any).monsterAttackPlayer();
} finally {
  Math.random = originalRandom;
}

assertEqual(defenceCalled, true, 'monsterAttackPlayer should invoke an equipped defence skill before normal damage');
assertEqual(battle.playerHp, 93, 'successful defence skill should own the damage settlement');
assertEqual(playerState._logs, [{ text: 'defence skill used', category: 'battle' }], 'successful defence skill logs should be emitted');
`;

async function writeTestEntry() {
  await mkdir(outRoot, { recursive: true });
  await writeFile(testEntry, testSource, 'utf8');
}

async function transpileFile(filePath) {
  const normalized = resolve(filePath);
  if (seen.has(normalized) || extname(normalized) !== '.ts') {
    return;
  }
  seen.add(normalized);

  const source = await readFile(normalized, 'utf8');
  const importRegex = /from\s+['"](\.{1,2}\/[^'"]+)['"]/g;
  const imports = [...source.matchAll(importRegex)].map(match => match[1]);
  const patchedSource = source.replace(importRegex, (match, specifier) => {
    const prefix = match.slice(0, -specifier.length - 1);
    return `${prefix}${specifier}.js'`;
  });

  const output = ts.transpileModule(patchedSource, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;

  const baseRoot = normalized.startsWith(srcRoot) ? srcRoot : outRoot;
  const outPath = join(outRoot, relative(baseRoot, normalized)).replace(/\.ts$/, '.js');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, output, 'utf8');

  for (const specifier of imports) {
    const sourceRoot = normalized.startsWith(srcRoot) ? srcRoot : outRoot;
    const importedTs = resolve(dirname(normalized), `${specifier}.ts`);
    const sourceTs = importedTs.startsWith(outRoot) && !importedTs.startsWith(srcRoot)
      ? resolve(srcRoot, relative(outRoot, importedTs))
      : importedTs;
    await transpileFile(sourceTs.startsWith(srcRoot) ? sourceTs : importedTs);
  }
}

await rm(outRoot, { recursive: true, force: true });
await writeTestEntry();
await transpileFile(testEntry);

try {
  await import(pathToFileURL(join(outRoot, 'battle-defence-skill.test.js')));
} finally {
  await rm(outRoot, { recursive: true, force: true });
}

console.log('Battle defence skill chain matches AS3 monsterAttackPlayer.');

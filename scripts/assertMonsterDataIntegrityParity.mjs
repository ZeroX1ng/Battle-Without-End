import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-monster-data-integrity');

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  const actualText = JSON.stringify(actual);
  const expectedText = JSON.stringify(expected);
  if (actualText !== expectedText) {
    throw new Error(`${message}\nexpected: ${expectedText}\nactual:   ${actualText}`);
  }
}

function splitTopLevelArgs(text) {
  const args = [];
  let start = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const prev = text[i - 1];
    if (ch === '"' && prev !== '\\') {
      inString = !inString;
    } else if (ch === ',' && !inString) {
      args.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  args.push(text.slice(start).trim());
  return args.map(arg => arg.replace(/^"|"$/g, ''));
}

function parseMonsterDefinitions(source) {
  const definitions = [];
  const pattern = /public static const ([A-Za-z0-9_]+):MonsterData = new MonsterData\((.*?)\);/gs;
  for (const match of source.matchAll(pattern)) {
    const [, sourceKey, argsText] = match;
    const args = splitTopLevelArgs(argsText);
    definitions.push({
      sourceKey,
      name: args[0],
      realName: args[1],
      hp: Number(args[2]),
      attack: { min: Number(args[3]), max: Number(args[4]) },
      defence: Number(args[5]),
      protection: Number(args[6]),
      crit: Number(args[7]),
      crit_mul: Number(args[8]),
      balance: Number(args[9]),
      CP: Number(args[10]),
    });
  }
  return definitions;
}

function parseMonsterTitleNames(source) {
  const listMatch = source.match(/public static const list:Vector\.<MonsterTitle> = new <MonsterTitle>\[(.*?)\];/s);
  assert(listMatch, 'AS3 MonsterTitleList.list must be present');
  return [...listMatch[1].matchAll(/new MonsterTitle\("([^"]+)"/g)].map(match => match[1]);
}

function parseRegionBossName(source) {
  const match = source.match(/public static const REGION_BOSS:MonsterTitle = new MonsterTitle\("([^"]+)"/);
  assert(match, 'AS3 MonsterTitleList.REGION_BOSS must be present');
  return match[1].replaceAll("\\'", "'");
}

function parsePetMcTypes(source) {
  return [...new Set([...source.matchAll(/new PetData\("[^"]+","[^"]+",PetTypeList\.[A-Za-z0-9_]+,"([^"]+)"\)/g)].map(match => match[1]))];
}

function parseMapMonsterRefs(source) {
  return [...new Set([...source.matchAll(/MonsterList\.([A-Za-z0-9_]+)/g)].map(match => match[1]))];
}

const as3MonsterListSource = readAs3('scripts/iData/iMonster/MonsterList.as');
const as3MonsterDataSource = readAs3('scripts/iData/iMonster/MonsterData.as');
const as3MonsterTitleListSource = readAs3('scripts/iData/iMonster/MonsterTitleList.as');
const as3MonsterTitleSource = readAs3('scripts/iData/iMonster/MonsterTitle.as');
const as3StatMulSource = readAs3('scripts/iData/iMonster/StatMul.as');
const as3PetDataListSource = readAs3('scripts/iData/iPet/PetDataList.as');
const as3PetTypeListSource = readAs3('scripts/iData/iPet/PetTypeList.as');
const as3MapListSource = readAs3('scripts/iData/iMap/MapList.as');
const packageJson = JSON.parse(read('package.json'));

assert(as3MonsterDataSource.includes('this.name = param1;'), 'AS3 MonsterData.name must come from constructor parameter 1');
assert(as3MonsterDataSource.includes('this.realName = param2;'), 'AS3 MonsterData.realName must come from constructor parameter 2');
assert(as3MonsterTitleSource.includes('this.name = param1;'), 'AS3 MonsterTitle.name must preserve constructor parameter 1');
assert(as3StatMulSource.includes('this.name = param1;'), 'AS3 StatMul.name must preserve constructor parameter 1');
assert(as3PetTypeListSource.includes('public static const attack:PetType'), 'AS3 PetTypeList must define attack');
assert(as3PetTypeListSource.includes('public static const defence:PetType'), 'AS3 PetTypeList must define defence');
assert(as3PetTypeListSource.includes('public static const magic:PetType'), 'AS3 PetTypeList must define magic');
assert(as3PetTypeListSource.includes('public static const balance:PetType'), 'AS3 PetTypeList must define balance');

if (packageJson.scripts?.['assert:monster-data-integrity'] !== 'node scripts/assertMonsterDataIntegrityParity.mjs') {
  throw new Error('package.json must expose assert:monster-data-integrity');
}

const expectedMonsters = parseMonsterDefinitions(as3MonsterListSource);
assert(expectedMonsters.length > 0, 'AS3 MonsterList constants must be parsed');
const expectedMonsterKeys = expectedMonsters.map(monster => monster.sourceKey);
assertEqual(expectedMonsterKeys.slice(0, 5), ['Young_Raccoon', 'Young_Gray_Raccoon', 'Young_Brown_Fox', 'White_Spiderling', 'White_Spider'], 'AS3 first five monster keys');

const expectedTitleNames = parseMonsterTitleNames(as3MonsterTitleListSource);
assertEqual(expectedTitleNames.length, 22, 'AS3 MonsterTitleList length');
assert(expectedTitleNames.includes('努力的 '), 'AS3 title list must preserve the hard-working title trailing space');
const expectedRegionBossName = parseRegionBossName(as3MonsterTitleListSource);
const expectedPetTypes = parsePetMcTypes(as3PetDataListSource);
const expectedMapMonsterRefs = parseMapMonsterRefs(as3MapListSource);

const monsterModule = await importTsModule({
  entry: join(root, 'src/core/data/monsterData.ts'),
  root,
  outRoot,
});
const petModule = await importTsModule({
  entry: join(root, 'src/core/data/petData.ts'),
  root,
  outRoot,
});
const constantsModule = await importTsModule({
  entry: join(root, 'src/core/constants.ts'),
  root,
  outRoot,
});
const mapModule = await importTsModule({
  entry: join(root, 'src/core/data/mapData.ts'),
  root,
  outRoot,
});

const { MonsterList, MonsterTitleList, REGION_BOSS_TITLE, getMonsterByName } = monsterModule;
const { PetDataList } = petModule;
const { PetTypes } = constantsModule;
const { MapList } = mapModule;

assertEqual(MonsterList.length, expectedMonsters.length, 'MonsterList length must match AS3');
assertEqual(MonsterList.map(monster => monster.sourceKey ?? monster.name), expectedMonsterKeys, 'MonsterList source key order must match AS3');
assertEqual(
  MonsterList.map(monster => ({
    sourceKey: monster.sourceKey,
    name: monster.name,
    realName: monster.realName,
    hp: monster.hp,
    attack: monster.attack,
    defence: monster.defence,
    protection: monster.protection,
    crit: monster.crit,
    crit_mul: monster.crit_mul,
    balance: monster.balance,
    CP: monster.CP,
  })),
  expectedMonsters,
  'Monster static data must match AS3 MonsterList.as'
);

for (const fabricated of ['town_rat', 'town_slime', 'desert_dragon_final']) {
  assert(!MonsterList.some(monster => monster.name === fabricated || monster.sourceKey === fabricated), `Fabricated monster must be absent: ${fabricated}`);
}

assert(getMonsterByName('Brown-tailed Mongoose'), 'getMonsterByName must resolve AS3 real monster name Brown-tailed Mongoose');
assert(getMonsterByName('Giant_Sand_Worm'), 'getMonsterByName must resolve AS3 real monster name Giant_Sand_Worm');
assert(getMonsterByName('Brown_tailed_Mongoose')?.name === 'Brown-tailed Mongoose', 'AS3 sourceKey lookup must resolve Brown_tailed_Mongoose without changing MonsterData.name');

assertEqual(MonsterTitleList.length, expectedTitleNames.length, 'MonsterTitleList length must match AS3');
assertEqual(MonsterTitleList.map(title => title.name), expectedTitleNames, 'MonsterTitleList title names must match AS3 order and spacing');
assertEqual(REGION_BOSS_TITLE.name, expectedRegionBossName, 'REGION_BOSS_TITLE name must match AS3');

assert(!PetTypes.includes('slime'), 'PetTypes must not include non-AS3 slime');
assertEqual([...PetTypes].sort(), [...expectedPetTypes].sort(), 'PetTypes must match AS3 PetDataList mc set');
assertEqual([...new Set(PetDataList.map(pet => pet.mc))].sort(), [...expectedPetTypes].sort(), 'PetDataList mc set must match AS3');

const reactMapMonsterKeys = new Set(MapList.flatMap(map => map.monsterList.map(monster => monster.sourceKey ?? monster.name)));
for (const sourceKey of expectedMapMonsterRefs) {
  assert(reactMapMonsterKeys.has(sourceKey), `Map monster reference must resolve to AS3 monster: ${sourceKey}`);
}

await cleanupTranspileOutput(outRoot);
console.log('Monster static data integrity matches AS3.');

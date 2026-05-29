import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-monster-data-immutable');

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

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

async function withRandomSequence(values, fn) {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[Math.min(index++, values.length - 1)];
  try {
    return await fn();
  } finally {
    Math.random = original;
  }
}

function snapshotAttack(data) {
  return { min: data.attack.min, max: data.attack.max };
}

function assertAttackEqual(actual, expected, message) {
  assertEqual(actual.min, expected.min, `${message} min`);
  assertEqual(actual.max, expected.max, `${message} max`);
}

const as3Monster = readAs3('scripts/iData/iMonster/Monster.as');
const as3MonsterTitle = readAs3('scripts/iData/iMonster/MonsterTitle.as');
const as3Battle = readAs3('scripts/iData/Battle.as');
const as3MonsterData = readAs3('scripts/iData/iMonster/MonsterData.as');
const monsterModelSource = read('src/core/models/Monster.ts');
const monsterDataSource = read('src/core/data/monsterData.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Monster, 'this.data = param1.clone();', 'AS3 Monster must clone MonsterData before title mutations');
assertIncludes(as3MonsterData, 'return new MonsterData(this.name,this.realName,this.hp,this.attack.min,this.attack.max', 'AS3 MonsterData.clone must allocate an independent DamageNumber');
assertIncludes(as3Monster, 'this.data.attack = new DamageNumber', 'AS3 title attack changes replace only the cloned DamageNumber');
assertIncludes(as3MonsterTitle, 'public var statMulList:Vector.<StatMul>;', 'AS3 MonsterTitle owns the stat multiplier list');
assertIncludes(as3Battle, 'new Monster(Global.map.mapData.monsterList', 'AS3 Battle constructs a fresh Monster from map monster data');
assertIncludes(monsterModelSource, 'this.generateTitle();', 'React Monster constructor must still apply title generation');
assertIncludes(monsterDataSource, 'attack: { min: attackMin, max: attackMax }', 'React monsterData keeps attack as nested data that must not be shared into instances');

if (packageJson.scripts?.['assert:monster-data-immutable'] !== 'node scripts/assertMonsterDataImmutable.mjs') {
  throw new Error('package.json must expose assert:monster-data-immutable');
}

const monsterModule = await importTsModule({
  entry: join(root, 'src/core/models/Monster.ts'),
  root,
  outRoot,
});
const dataModule = await importTsModule({
  entry: join(root, 'src/core/data/monsterData.ts'),
  root,
  outRoot,
});

const { Monster, Boss } = monsterModule;
const { MonsterList, MonsterTitleList } = dataModule;

const attackTitleIndex = MonsterTitleList.findIndex(title =>
  title.statMulList.some(stat => stat.name === 'ATTACK' || stat.name === 'attackMin' || stat.name === 'attackMax')
);
assert(attackTitleIndex >= 0, 'Fixture must include at least one title that changes attack');

await withRandomSequence([0, (attackTitleIndex + 0.1) / MonsterTitleList.length], async () => {
  const source = MonsterList[0];
  const before = snapshotAttack(source);
  const monster = new Monster(source);

  assert(monster.title, 'Fixture should force Monster title generation');
  assert(monster.data.attack !== source.attack, 'Monster instance attack range must not share the source monsterData attack object');
  assertAttackEqual(snapshotAttack(source), before, 'Monster title generation must not mutate MonsterList source attack');
});

{
  const source = MonsterList[1];
  const before = snapshotAttack(source);
  const boss = new Boss(source);

  assert(boss.title, 'Boss should always use a title');
  assert(boss.data.attack !== source.attack, 'Boss instance attack range must not share the source monsterData attack object');
  assertAttackEqual(snapshotAttack(source), before, 'Boss title generation must not mutate MonsterList source attack');
}

await cleanupTranspileOutput(outRoot);

console.log('Monster title stat generation keeps source monsterData attack immutable.');

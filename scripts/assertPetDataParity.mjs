import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { resolveAs3Path } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');
const as3Root = resolveAs3Path('scripts');
const outRoot = join(root, '.tmp-pet-data-test');

const expectedRealNamesByLegacyId = {
  att_fox: '红狐狸',
  def_fox: '棕狐狸',
  bal_fox: '灰狐狸',
  att_rat: '白鼠',
  def_rat: '黑鼠',
  mag_rat: '魔鼠',
  att_spider: '红蜘蛛',
  def_spider: '巨蜘蛛',
  att_wolf: '野狼',
  mag_wolf: '狼人',
  att_bear: '红熊',
  def_bear: '棕熊',
  bal_bear: '灰熊',
  att_goblin: '哥布林战士',
  def_goblin: '哥布林卫士',
  bal_goblin: '哥布林弓手',
  mag_goblin: '哥布林法师',
  att_skeleton: '骷髅战士',
  def_skeleton: '骷髅卫士',
  bal_skeleton: '骷髅弓手',
  mag_skeleton: '骷髅法师',
  att_ghost: '火焰幽灵',
  def_ghost: '岩石幽灵',
  bal_ghost: '风幽灵',
  mag_ghost: '雷幽灵',
  att_zombie: '僵尸武士',
  def_zombie: '僵尸卫士',
  bal_zombie: '僵尸弓手',
  mag_zombie: '僵尸法师',
  att_ruin: '毁灭战士',
  def_ruin: '毁灭卫士',
  bal_ruin: '毁灭弓手',
  mag_ruin: '毁灭法师',
  def_unicorn: '神圣独角兽',
  bal_unicorn: '自然独角兽',
  att_dragon: '暗黑龙',
  mag_dragon: '光明龙',
};

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\nexpected: ${e}\nactual:   ${a}`);
  }
}

function assert(condition, label) {
  if (!condition) {
    throw new Error(label);
  }
}

function parsePetDataList(source) {
  const definitions = new Map();
  const defineRegex = /public\s+static\s+var\s+([a-z_]+):PetData\s*=\s*new\s+PetData\("([^"]+)","[^"]*",PetTypeList\.([a-z]+),"([^"]+)"\)/g;
  let match;
  while ((match = defineRegex.exec(source))) {
    const [, legacyId, name, type, mc] = match;
    definitions.set(legacyId, {
      legacyId,
      name,
      realName: expectedRealNamesByLegacyId[legacyId],
      type,
      mc,
    });
  }

  const listMatch = source.match(/public\s+static\s+var\s+list:Vector\.<PetData>\s*=\s*new\s+<PetData>\[([\s\S]*?)\]/);
  if (!listMatch) {
    throw new Error('Unable to parse AS3 PetDataList.list');
  }

  return listMatch[1]
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(legacyId => {
      const entry = definitions.get(legacyId);
      if (!entry) {
        throw new Error(`Unknown AS3 PetDataList id: ${legacyId}`);
      }
      return entry;
    });
}

try {
  const expected = parsePetDataList(
    await readFile(join(as3Root, 'iData/iPet/PetDataList.as'), 'utf8')
  );
  const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const { PetDataList, getPetDataByLegacyId } = await importTsModule({
    root,
    outRoot,
    entry: join(root, 'src/core/data/petData.ts'),
  });
  const { Pet } = await importTsModule({
    root,
    outRoot,
    entry: join(root, 'src/core/models/Pet.ts'),
  });

  assertEqual(PetDataList.length, expected.length, 'PetDataList count must match AS3 PetDataList.list, including duplicate weighted entries');
  assertEqual(
    PetDataList.map(pet => ({
      name: pet.name,
      realName: pet.realName,
      type: pet.type.type,
      mc: pet.mc,
    })),
    expected.map(({ name, realName, type, mc }) => ({ name, realName, type, mc })),
    'PetDataList entries must match AS3 names, order, type, mc, and weighted duplicates'
  );

  const lightningSprites = PetDataList.filter(pet => pet.name === 'Lightning Sprite');
  assertEqual(lightningSprites.length, 2, 'AS3 PetDataList keeps Lightning Sprite twice as random-pool weight');
  assert(lightningSprites[0] === lightningSprites[1], 'Duplicate Lightning Sprite entries should share the same PetData object like AS3 list references');

  assertEqual(getPetDataByLegacyId('att_fox').name, 'Red Fox', 'Map-data legacy id lookup must still resolve att_fox');
  assertEqual(getPetDataByLegacyId('mag_ghost').name, 'Lightning Sprite', 'Map-data legacy id lookup must still resolve mag_ghost');
  assertEqual(getPetDataByLegacyId('Lightning Sprite').realName, '雷幽灵', 'AS3 save-name lookup must resolve Lightning Sprite');

  const legacyPet = Pet.load('att_fox#1#0#1%2%3%4%5%6%7%8%9%10#1%2%3%4%5%6%7%8%9%10');
  assertEqual(legacyPet.name, 'Red Fox', 'Legacy id-based pet saves must load and migrate to AS3 pet name');
  assertEqual(legacyPet.save().split('#')[0], 'Red Fox', 'Pet.save must write the AS3 English pet name');

  const as3Pet = Pet.load('Lightning Sprite#1#0#1%2%3%4%5%6%7%8%9%10#1%2%3%4%5%6%7%8%9%10');
  assertEqual(as3Pet.realName, '雷幽灵', 'AS3 name-based pet saves must load directly');
  assertEqual(as3Pet.mc_name, 'pet_ghost', 'Pet instances keep React sprite registry names while static mc remains AS3');

  if (packageJson.scripts?.['assert:pet-data'] !== 'node scripts/assertPetDataParity.mjs') {
    throw new Error('package.json must expose assert:pet-data');
  }

  console.log('Pet data and pet save-name parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}

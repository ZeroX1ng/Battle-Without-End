import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const srcRoot = join(root, 'src');
const outRoot = join(root, '.tmp-map-data-test');
const entry = join(srcRoot, 'core/data/mapData.ts');

const expectedMaps = [
  ['Town of Beginner', '新手镇', 85, 314, 0, ['Young_Raccoon', 'Young_Gray_Raccoon', 'Young_Brown_Fox', 'White_Spiderling', 'White_Spider', 'Brown_Fox', 'Young_Red_Fox', 'Black_Town_Rat', 'Brown_Town_Rat'], ['att_fox', 'att_rat', 'def_fox', 'bal_fox']],
  ['Gairech Hill', '格林山脉', 130, 270, 0.4, ['Raccoon', 'Old_Mimic', 'Red_Spiderling', 'Young_Gray_Fox', 'Giant_Spiderling', 'Red_Fox'], ['def_rat', 'att_rat', 'mag_rat', 'att_spider', 'def_spider', 'att_fox', 'def_fox', 'bal_fox']],
  ['Alby Peninsula', '斯特莱恩', 40, 240, 0.8, ['White_Kiwi', 'Black_Kiwi', 'Green_Kiwi', 'Gold_Kiwi', 'Old_Sand_Mimic', 'Young_Goblin'], ['def_rat', 'att_rat', 'mag_rat', 'att_spider', 'def_spider', 'att_wolf', 'mag_wolf']],
  ['Forest of Souls', '灵魂之森', 115, 170, 1.2, ['Dingo', 'Small_Ice_Worm', 'Stone_Mimic', 'Young_Poison_Goblin', 'Brown_tailed_Mongoose', 'White_Ant_Lion'], ['att_spider', 'def_spider', 'att_wolf', 'mag_wolf', 'def_bear', 'bal_bear']],
  ['Filia', '费拉', 219, 137, 1.6, ['Cave_Rat', 'Goblin', 'Mimic', 'Masked_Goblin', 'Black_Aardvark', 'Black_Wolf', 'Brown_Dire_Wolf', 'Young_Brown_Warg'], ['att_wolf', 'mag_wolf', 'def_bear', 'bal_bear', 'att_bear']],
  ['The Frozen Shore', '冰封角', 300, 90, 2, ['Bandersnatch', 'Blue_Snake', 'Kobold', 'Rat_Man', 'Red_Spider', 'White_Hair_Llama', 'Kobold_Bandit'], ['def_bear', 'bal_bear', 'att_bear', 'att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin']],
  ['Ghost Hill', '幽魂谷', 405, 63, 2.4, ['Coyote', 'Zombie_Soldier', 'White_Bear', 'Maned_Aardvark', 'Stone_Hound', 'Goblin_Keeper', 'Bard_Skeleton', 'Bard_Skeleton'], ['att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin']],
  ['Misty Mountain', '谜雾山', 440, 156, 2.8, ['Burgundy_Spider', 'Giant_Forest_Rat', 'Gold_Goblin', 'Gold_Kobold', 'Gray_Gremlin', 'Young_Lungfish', 'Jackal'], ['att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin']],
  ['The Bite', '食人湾', 550, 100, 3.2, ['Stripeless_Hyena', 'Phantom_Silver_Tableware', 'Stone_Mask', 'Dragonfly', 'Imp', 'Ice_Sprite', 'Lightning_Sprite'], ['att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin', 'att_skeleton', 'def_skeleton', 'bal_skeleton', 'mag_skeleton']],
  ['The Gullet', '加尔特', 635, 137, 3.6, ['Red_Lynx', 'Skeleton', 'Candle_Warrior', 'Guardian_Horse_of_Ruins', 'Gorgon', 'Stone_Horse', 'Topaz_Beetle', 'Brown_Bear'], ['att_skeleton', 'def_skeleton', 'bal_skeleton', 'mag_skeleton']],
  ['Casterly Rock', '暴土城', 680, 189, 4, ['Red_Kobold', 'Stone_Zombie', 'Black_Buffalo', 'Shrieker', 'Long_Horn_Gnu', 'Wisp', 'Saturos', 'Skeleton_Ghost', 'Guardian_of_Ruins'], ['att_skeleton', 'def_skeleton', 'bal_skeleton', 'mag_skeleton', 'att_ghost', 'def_ghost', 'bal_ghost', 'mag_ghost']],
  ['Bone Cave', '埋骨所', 689, 264, 4.4, ['Black_Succubus', 'Giant_Spider', 'Stone_Horse', 'Troll', 'Gnoll', 'Magic_Golem', 'Captain_Skeleton', 'Green_Snake', 'Lost_Sahuagin'], ['att_ghost', 'def_ghost', 'bal_ghost', 'mag_ghost']],
  ['Cape Warth', '风怒角', 754, 323, 4.8, ['Hippo', 'Brown_Ixion', 'Incubus', 'Zombie', 'Bisque_Doll', 'Ogre', 'Esras', 'Ogre_Warrior', 'Giant_Ogre', 'Siren'], ['att_zombie', 'def_zombie', 'bal_zombie', 'mag_zombie']],
  ['Wyl', '魔渊', 376, 448, 5.2, ['Lion', 'Balrog', 'Cyclops', 'Argus', 'Grendel', 'Cloaker', 'Wight', 'Ghost_Cloaker', 'Black_Warrior', 'Pink_Succubus', 'Spider_Warrior'], ['att_ruin', 'def_ruin', 'bal_ruin', 'mag_ruin']],
  ['Vaith', '神墟', 204, 501, 5.6, ['Head_Hyena', 'Hellcat', 'Salamander', 'Banshee', 'Ruairi', 'Yeti', 'Mammoth', 'Giant_Sand_Worm', 'Ifrit'], ['att_ruin', 'def_ruin', 'bal_ruin', 'mag_ruin', 'def_unicorn', 'bal_unicorn']],
  ['???', '???', 395, 265, 6, ['Prairie_Dragon', 'Giant_Lion', 'Arc_Lich', 'Desert_Dragon'], ['att_dragon', 'mag_dragon', 'def_unicorn', 'bal_unicorn']],
];

const petNamesByLegacyId = {
  att_fox: 'Red Fox',
  def_fox: 'Brown Fox',
  bal_fox: 'Gray Fox',
  att_rat: 'Town Rat',
  def_rat: 'Black Rat',
  mag_rat: 'Rat Mage',
  att_spider: 'Red Spider',
  def_spider: 'Giant Spider',
  att_wolf: 'Wild Wolf',
  mag_wolf: 'Werewolf',
  att_bear: 'Red Bear',
  def_bear: 'Brown Bear',
  bal_bear: 'Gray Bear',
  att_goblin: 'Goblin Warrior',
  def_goblin: 'Goblin Protector',
  bal_goblin: 'Goblin Archer',
  mag_goblin: 'Goblin Mage',
  att_skeleton: 'Skeleton Warrior',
  def_skeleton: 'Skeleton Protector',
  bal_skeleton: 'Skeleton Archer',
  mag_skeleton: 'Skeleton Mage',
  att_ghost: 'Fire Sprite',
  def_ghost: 'Stone Sprite',
  bal_ghost: 'Wind Sprite',
  mag_ghost: 'Lightning Sprite',
  att_zombie: 'Zombie Warrior',
  def_zombie: 'Zombie Protector',
  bal_zombie: 'Zombie Archer',
  mag_zombie: 'Zombie Mage',
  att_ruin: 'Warrior of Ruins',
  def_ruin: 'Protector of Ruins',
  bal_ruin: 'Archer of Ruins',
  mag_ruin: 'Mage of Ruins',
  def_unicorn: 'Holy Unicorn',
  bal_unicorn: 'Prairie Unicorn',
  att_dragon: 'Dark Dragon',
  mag_dragon: 'Shining Dragon',
};

const seen = new Set();

async function transpileFile(filePath) {
  const normalized = resolve(filePath);
  if (seen.has(normalized) || extname(normalized) !== '.ts') {
    return;
  }
  seen.add(normalized);

  const source = await readFile(normalized, 'utf8');
  const importRegex = /from\s+['"](\.{1,2}\/[^'"]+)['"]/g;
  const imports = [...source.matchAll(importRegex)].map(match => match[1]);
  let patchedSource = source.replace(importRegex, (match, specifier) => `${match.slice(0, -specifier.length - 1)}${specifier}.js'`);

  const output = ts.transpileModule(patchedSource, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;

  const outPath = join(outRoot, relative(srcRoot, normalized)).replace(/\.ts$/, '.js');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, output, 'utf8');

  for (const specifier of imports) {
    await transpileFile(resolve(dirname(normalized), `${specifier}.ts`));
  }
}

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\nexpected: ${e}\nactual:   ${a}`);
  }
}

await rm(outRoot, { recursive: true, force: true });
await transpileFile(entry);

const { MapList } = await import(pathToFileURL(join(outRoot, 'core/data/mapData.js')));

assertEqual(MapList.length, expectedMaps.length, 'Map count must match AS3 MapList.list');

for (const [index, expected] of expectedMaps.entries()) {
  const [name, realName, x, y, modifier, monsters, pets] = expected;
  const actual = MapList[index];
  assertEqual(actual.name, name, `Map ${index} name`);
  assertEqual(actual.realName, realName, `Map ${name} realName`);
  assertEqual([actual.x, actual.y, actual.modifier], [x, y, modifier], `Map ${name} coordinates/modifier`);
  assertEqual(actual.monsterList.map(monster => monster.name), monsters, `Map ${name} monster pool`);
  assertEqual((actual.petList ?? []).map(pet => pet.name), pets.map(pet => petNamesByLegacyId[pet]), `Map ${name} pet pool`);
}

await rm(outRoot, { recursive: true, force: true });
console.log('Map data matches AS3 MapList.');

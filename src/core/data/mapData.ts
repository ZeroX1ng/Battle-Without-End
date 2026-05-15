// 地图静态数据
// AS3 原始: iData.iMap.MapData + MapList

import type { MapData, MonsterData, PetData } from '../types';
import { MonsterList } from './monsterData';
import { PetDataList } from './petData';

function getMonster(name: string): MonsterData {
  const monster = MonsterList.find(item => item.name === name);
  if (!monster) {
    throw new Error(`Unknown monster data: ${name}`);
  }
  return monster;
}

function getPet(name: string): PetData {
  const pet = PetDataList.find(item => item.name === name);
  if (!pet) {
    throw new Error(`Unknown pet data: ${name}`);
  }
  return pet;
}

function monsters(names: string[]): MonsterData[] {
  return names.map(getMonster);
}

function pets(names: string[]): PetData[] {
  return names.map(getPet);
}

export const MapList: MapData[] = [
  {
    x: 85,
    y: 314,
    name: 'Town of Beginner',
    realName: '新手镇',
    modifier: 0,
    monsterList: monsters(['Young_Raccoon', 'Young_Gray_Raccoon', 'Young_Brown_Fox', 'White_Spiderling', 'White_Spider', 'Brown_Fox', 'Young_Red_Fox', 'Black_Town_Rat', 'Brown_Town_Rat']),
    petList: pets(['att_fox', 'att_rat', 'def_fox', 'bal_fox']),
  },
  {
    x: 130,
    y: 270,
    name: 'Gairech Hill',
    realName: '格林山脉',
    modifier: 0.4,
    monsterList: monsters(['Raccoon', 'Old_Mimic', 'Red_Spiderling', 'Young_Gray_Fox', 'Giant_Spiderling', 'Red_Fox']),
    petList: pets(['def_rat', 'att_rat', 'mag_rat', 'att_spider', 'def_spider', 'att_fox', 'def_fox', 'bal_fox']),
  },
  {
    x: 40,
    y: 240,
    name: 'Alby Peninsula',
    realName: '斯特莱恩',
    modifier: 0.8,
    monsterList: monsters(['White_Kiwi', 'Black_Kiwi', 'Green_Kiwi', 'Gold_Kiwi', 'Old_Sand_Mimic', 'Young_Goblin']),
    petList: pets(['def_rat', 'att_rat', 'mag_rat', 'att_spider', 'def_spider', 'att_wolf', 'mag_wolf']),
  },
  {
    x: 115,
    y: 170,
    name: 'Forest of Souls',
    realName: '灵魂之森',
    modifier: 1.2,
    monsterList: monsters(['Dingo', 'Small_Ice_Worm', 'Stone_Mimic', 'Young_Poison_Goblin', 'Brown_tailed_Mongoose', 'White_Ant_Lion']),
    petList: pets(['att_spider', 'def_spider', 'att_wolf', 'mag_wolf', 'def_bear', 'bal_bear']),
  },
  {
    x: 219,
    y: 137,
    name: 'Filia',
    realName: '费拉',
    modifier: 1.6,
    monsterList: monsters(['Cave_Rat', 'Goblin', 'Mimic', 'Masked_Goblin', 'Black_Aardvark', 'Black_Wolf', 'Brown_Dire_Wolf', 'Young_Brown_Warg']),
    petList: pets(['att_wolf', 'mag_wolf', 'def_bear', 'bal_bear', 'att_bear']),
  },
  {
    x: 300,
    y: 90,
    name: 'The Frozen Shore',
    realName: '冰封角',
    modifier: 2,
    monsterList: monsters(['Bandersnatch', 'Blue_Snake', 'Kobold', 'Rat_Man', 'Red_Spider', 'White_Hair_Llama', 'Kobold_Bandit']),
    petList: pets(['def_bear', 'bal_bear', 'att_bear', 'att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin']),
  },
  {
    x: 405,
    y: 63,
    name: 'Ghost Hill',
    realName: '幽魂谷',
    modifier: 2.4,
    monsterList: monsters(['Coyote', 'Zombie_Soldier', 'White_Bear', 'Maned_Aardvark', 'Stone_Hound', 'Goblin_Keeper', 'Bard_Skeleton', 'Bard_Skeleton']),
    petList: pets(['att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin']),
  },
  {
    x: 440,
    y: 156,
    name: 'Misty Mountain',
    realName: '谜雾山',
    modifier: 2.8,
    monsterList: monsters(['Burgundy_Spider', 'Giant_Forest_Rat', 'Gold_Goblin', 'Gold_Kobold', 'Gray_Gremlin', 'Young_Lungfish', 'Jackal']),
    petList: pets(['att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin']),
  },
  {
    x: 550,
    y: 100,
    name: 'The Bite',
    realName: '食人湾',
    modifier: 3.2,
    monsterList: monsters(['Stripeless_Hyena', 'Phantom_Silver_Tableware', 'Stone_Mask', 'Dragonfly', 'Imp', 'Ice_Sprite', 'Lightning_Sprite']),
    petList: pets(['att_goblin', 'def_goblin', 'bal_goblin', 'mag_goblin', 'att_skeleton', 'def_skeleton', 'bal_skeleton', 'mag_skeleton']),
  },
  {
    x: 635,
    y: 137,
    name: 'The Gullet',
    realName: '加尔特',
    modifier: 3.6,
    monsterList: monsters(['Red_Lynx', 'Skeleton', 'Candle_Warrior', 'Guardian_Horse_of_Ruins', 'Gorgon', 'Stone_Horse', 'Topaz_Beetle', 'Brown_Bear']),
    petList: pets(['att_skeleton', 'def_skeleton', 'bal_skeleton', 'mag_skeleton']),
  },
  {
    x: 680,
    y: 189,
    name: 'Casterly Rock',
    realName: '暴土城',
    modifier: 4,
    monsterList: monsters(['Red_Kobold', 'Stone_Zombie', 'Black_Buffalo', 'Shrieker', 'Long_Horn_Gnu', 'Wisp', 'Saturos', 'Skeleton_Ghost', 'Guardian_of_Ruins']),
    petList: pets(['att_skeleton', 'def_skeleton', 'bal_skeleton', 'mag_skeleton', 'att_ghost', 'def_ghost', 'bal_ghost', 'mag_ghost']),
  },
  {
    x: 689,
    y: 264,
    name: 'Bone Cave',
    realName: '埋骨所',
    modifier: 4.4,
    monsterList: monsters(['Black_Succubus', 'Giant_Spider', 'Stone_Horse', 'Troll', 'Gnoll', 'Magic_Golem', 'Captain_Skeleton', 'Green_Snake', 'Lost_Sahuagin']),
    petList: pets(['att_ghost', 'def_ghost', 'bal_ghost', 'mag_ghost']),
  },
  {
    x: 754,
    y: 323,
    name: 'Cape Warth',
    realName: '风怒角',
    modifier: 4.8,
    monsterList: monsters(['Hippo', 'Brown_Ixion', 'Incubus', 'Zombie', 'Bisque_Doll', 'Ogre', 'Esras', 'Ogre_Warrior', 'Giant_Ogre', 'Siren']),
    petList: pets(['att_zombie', 'def_zombie', 'bal_zombie', 'mag_zombie']),
  },
  {
    x: 376,
    y: 448,
    name: 'Wyl',
    realName: '魔渊',
    modifier: 5.2,
    monsterList: monsters(['Lion', 'Balrog', 'Cyclops', 'Argus', 'Grendel', 'Cloaker', 'Wight', 'Ghost_Cloaker', 'Black_Warrior', 'Pink_Succubus', 'Spider_Warrior']),
    petList: pets(['att_ruin', 'def_ruin', 'bal_ruin', 'mag_ruin']),
  },
  {
    x: 204,
    y: 501,
    name: 'Vaith',
    realName: '神墟',
    modifier: 5.6,
    monsterList: monsters(['Head_Hyena', 'Hellcat', 'Salamander', 'Banshee', 'Ruairi', 'Yeti', 'Mammoth', 'Giant_Sand_Worm', 'Ifrit']),
    petList: pets(['att_ruin', 'def_ruin', 'bal_ruin', 'mag_ruin', 'def_unicorn', 'bal_unicorn']),
  },
  {
    x: 395,
    y: 265,
    name: '???',
    realName: '???',
    modifier: 6,
    monsterList: monsters(['Prairie_Dragon', 'Giant_Lion', 'Arc_Lich', 'Desert_Dragon']),
    petList: pets(['att_dragon', 'mag_dragon', 'def_unicorn', 'bal_unicorn']),
  },
];

export function getMapByName(name: string): MapData | undefined {
  return MapList.find(map => map.name === name);
}

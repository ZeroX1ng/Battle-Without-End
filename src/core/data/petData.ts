// ═══ 宠物静态数据 ═══
// AS3 原始: iData.iPet.PetData + PetDataList + PetType + PetTypeList

import type { PetData, PetTypeData, PetStatsData } from '../types';

// ═══ 宠物类型 ═══
// AS3 原始: iData.iPet.PetTypeList
// 数值来源于 AS3 PetTypeList.as，使用 PetStatsData 对象替代 number[]

export const PetTypeList: Record<string, PetTypeData> = {
  attack: {
    type: 'attack',
    startMin:  { hp: 50, mp: 30, attmin: 20, attmax: 30, def: 0,  pro: 0,   balance: 10, cri: 10, criMul: 130, magAtt: 0   },
    startRange:{ hp: 20, mp: 10, attmin: 5,  attmax: 10, def: 1,  pro: 1,   balance: 80, cri: 30, criMul: 200, magAtt: 1   },
    growMin:   { hp: 10, mp: 5,  attmin: 3,  attmax: 6,  def: 1,  pro: 0,   balance: 0,  cri: 1,  criMul: 0,   magAtt: 0   },
    growRange: { hp: 1,  mp: 0.5,attmin: 1,  attmax: 2,  def: 0.6,pro: 0.2, balance: 0,  cri: 0.3,criMul: 0,   magAtt: 0.1 }
  },
  defence: {
    type: 'defence',
    startMin:  { hp: 100,mp: 30, attmin: 10, attmax: 15, def: 5,  pro: 5,   balance: 10, cri: 10, criMul: 130, magAtt: 0   },
    startRange:{ hp: 40, mp: 10, attmin: 2,  attmax: 4,  def: 3,  pro: 3,   balance: 80, cri: 30, criMul: 200, magAtt: 1   },
    growMin:   { hp: 20, mp: 5,  attmin: 1,  attmax: 3,  def: 2,  pro: 0.5, balance: 0,  cri: 1,  criMul: 0,   magAtt: 0   },
    growRange: { hp: 3,  mp: 0.5,attmin: 0.2,attmax: 0.4,def: 1.2,pro: 0.3, balance: 0,  cri: 0.3,criMul: 0,   magAtt: 0.1 }
  },
  magic: {
    type: 'magic',
    startMin:  { hp: 50, mp: 100,attmin: 10, attmax: 15, def: 0,  pro: 0,   balance: 10, cri: 10, criMul: 130, magAtt: 5   },
    startRange:{ hp: 20, mp: 20, attmin: 2,  attmax: 4,  def: 1,  pro: 1,   balance: 80, cri: 30, criMul: 200, magAtt: 3   },
    growMin:   { hp: 10, mp: 10, attmin: 1,  attmax: 2,  def: 1,  pro: 0,   balance: 0,  cri: 1,  criMul: 0,   magAtt: 1   },
    growRange: { hp: 1,  mp: 2,  attmin: 0.2,attmax: 0.4,def: 0.6,pro: 0.2, balance: 0,  cri: 0.3,criMul: 0,   magAtt: 0.5 }
  },
  balance: {
    type: 'balance',
    startMin:  { hp: 70, mp: 35, attmin: 15, attmax: 20, def: 1,   pro: 1,   balance: 20, cri: 20, criMul: 130, magAtt: 1   },
    startRange:{ hp: 24, mp: 11, attmin: 3,  attmax: 6,  def: 1.2, pro: 1.2, balance: 80, cri: 40, criMul: 200, magAtt: 1.2 },
    growMin:   { hp: 12, mp: 6,  attmin: 1.5,attmax: 2.5,def: 1,   pro: 0.15,balance: 0.05,cri:1.1,criMul:0.05, magAtt: 0.2 },
    growRange: { hp: 1.25,mp:1,  attmin: 0.25,attmax:0.5,def: 0.5, pro: 0.2, balance: 0.25,cri:0.3,criMul:0.1,  magAtt: 0.1 }
  },
};

// ═══ 宠物列表 ═══
// AS3 原始: PetData.name 是英文存档名，PetDataList.list 保留重复项作为随机权重。

const att_fox: PetData = { name: 'Red Fox', realName: '红狐狸', mc: 'fox', type: PetTypeList.attack };
const def_fox: PetData = { name: 'Brown Fox', realName: '棕狐狸', mc: 'fox', type: PetTypeList.defence };
const bal_fox: PetData = { name: 'Gray Fox', realName: '灰狐狸', mc: 'fox', type: PetTypeList.balance };
const att_rat: PetData = { name: 'Town Rat', realName: '白鼠', mc: 'rat', type: PetTypeList.attack };
const def_rat: PetData = { name: 'Black Rat', realName: '黑鼠', mc: 'rat', type: PetTypeList.defence };
const mag_rat: PetData = { name: 'Rat Mage', realName: '魔鼠', mc: 'rat', type: PetTypeList.magic };
const att_spider: PetData = { name: 'Red Spider', realName: '红蜘蛛', mc: 'spider', type: PetTypeList.attack };
const def_spider: PetData = { name: 'Giant Spider', realName: '巨蜘蛛', mc: 'spider', type: PetTypeList.defence };
const att_wolf: PetData = { name: 'Wild Wolf', realName: '野狼', mc: 'wolf', type: PetTypeList.attack };
const mag_wolf: PetData = { name: 'Werewolf', realName: '狼人', mc: 'wolf', type: PetTypeList.magic };
const att_bear: PetData = { name: 'Red Bear', realName: '红熊', mc: 'bear', type: PetTypeList.attack };
const def_bear: PetData = { name: 'Brown Bear', realName: '棕熊', mc: 'bear', type: PetTypeList.defence };
const bal_bear: PetData = { name: 'Gray Bear', realName: '灰熊', mc: 'bear', type: PetTypeList.balance };
const att_goblin: PetData = { name: 'Goblin Warrior', realName: '哥布林战士', mc: 'goblin', type: PetTypeList.attack };
const def_goblin: PetData = { name: 'Goblin Protector', realName: '哥布林卫士', mc: 'goblin', type: PetTypeList.defence };
const bal_goblin: PetData = { name: 'Goblin Archer', realName: '哥布林弓手', mc: 'goblin', type: PetTypeList.balance };
const mag_goblin: PetData = { name: 'Goblin Mage', realName: '哥布林法师', mc: 'goblin', type: PetTypeList.magic };
const att_skeleton: PetData = { name: 'Skeleton Warrior', realName: '骷髅战士', mc: 'skeleton', type: PetTypeList.attack };
const def_skeleton: PetData = { name: 'Skeleton Protector', realName: '骷髅卫士', mc: 'skeleton', type: PetTypeList.defence };
const bal_skeleton: PetData = { name: 'Skeleton Archer', realName: '骷髅弓手', mc: 'skeleton', type: PetTypeList.balance };
const mag_skeleton: PetData = { name: 'Skeleton Mage', realName: '骷髅法师', mc: 'skeleton', type: PetTypeList.magic };
const att_ghost: PetData = { name: 'Fire Sprite', realName: '火焰幽灵', mc: 'ghost', type: PetTypeList.attack };
const def_ghost: PetData = { name: 'Stone Sprite', realName: '岩石幽灵', mc: 'ghost', type: PetTypeList.defence };
const bal_ghost: PetData = { name: 'Wind Sprite', realName: '风幽灵', mc: 'ghost', type: PetTypeList.balance };
const mag_ghost: PetData = { name: 'Lightning Sprite', realName: '雷幽灵', mc: 'ghost', type: PetTypeList.magic };
const att_zombie: PetData = { name: 'Zombie Warrior', realName: '僵尸武士', mc: 'zombie', type: PetTypeList.attack };
const def_zombie: PetData = { name: 'Zombie Protector', realName: '僵尸卫士', mc: 'zombie', type: PetTypeList.defence };
const bal_zombie: PetData = { name: 'Zombie Archer', realName: '僵尸弓手', mc: 'zombie', type: PetTypeList.balance };
const mag_zombie: PetData = { name: 'Zombie Mage', realName: '僵尸法师', mc: 'zombie', type: PetTypeList.magic };
const att_ruin: PetData = { name: 'Warrior of Ruins', realName: '毁灭战士', mc: 'attack', type: PetTypeList.attack };
const def_ruin: PetData = { name: 'Protector of Ruins', realName: '毁灭卫士', mc: 'defence', type: PetTypeList.defence };
const bal_ruin: PetData = { name: 'Archer of Ruins', realName: '毁灭弓手', mc: 'balance', type: PetTypeList.balance };
const mag_ruin: PetData = { name: 'Mage of Ruins', realName: '毁灭法师', mc: 'magic', type: PetTypeList.magic };
const def_unicorn: PetData = { name: 'Holy Unicorn', realName: '神圣独角兽', mc: 'unicorn', type: PetTypeList.defence };
const bal_unicorn: PetData = { name: 'Prairie Unicorn', realName: '自然独角兽', mc: 'unicorn', type: PetTypeList.balance };
const att_dragon: PetData = { name: 'Dark Dragon', realName: '暗黑龙', mc: 'dragon', type: PetTypeList.attack };
const mag_dragon: PetData = { name: 'Shining Dragon', realName: '光明龙', mc: 'dragon', type: PetTypeList.magic };

const PetDataByLegacyId: Record<string, PetData> = {
  att_fox,
  def_fox,
  bal_fox,
  att_rat,
  def_rat,
  mag_rat,
  att_spider,
  def_spider,
  att_wolf,
  mag_wolf,
  att_bear,
  def_bear,
  bal_bear,
  att_goblin,
  def_goblin,
  bal_goblin,
  mag_goblin,
  att_skeleton,
  def_skeleton,
  bal_skeleton,
  mag_skeleton,
  att_ghost,
  def_ghost,
  bal_ghost,
  mag_ghost,
  att_zombie,
  def_zombie,
  bal_zombie,
  mag_zombie,
  att_ruin,
  def_ruin,
  bal_ruin,
  mag_ruin,
  def_unicorn,
  bal_unicorn,
  att_dragon,
  mag_dragon,
};

export const PetDataList: PetData[] = [
  att_bear,
  att_dragon,
  att_fox,
  att_ghost,
  att_goblin,
  att_rat,
  att_ruin,
  att_skeleton,
  att_spider,
  att_wolf,
  att_zombie,
  def_bear,
  def_fox,
  def_ghost,
  def_goblin,
  def_rat,
  def_ruin,
  def_skeleton,
  def_spider,
  def_unicorn,
  def_zombie,
  bal_bear,
  bal_fox,
  bal_ghost,
  bal_goblin,
  bal_ruin,
  bal_skeleton,
  bal_unicorn,
  bal_zombie,
  mag_dragon,
  mag_ghost,
  mag_ghost,
  mag_goblin,
  mag_rat,
  mag_ruin,
  mag_skeleton,
  mag_wolf,
  mag_zombie,
];

export function getPetDataByLegacyId(name: string): PetData {
  const pet = PetDataByLegacyId[name] ?? PetDataList.find(item => item.name === name);
  if (!pet) {
    throw new Error(`Unknown pet data: ${name}`);
  }
  return pet;
}

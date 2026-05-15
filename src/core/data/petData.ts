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
// AS3 原始: iData.iPet.PetDataList — 37 种宠物（12品种 × 多类型变体）

export const PetDataList: PetData[] = [
  // fox — 狐狸 (3种变体)
  { name: 'att_fox',    realName: '红狐狸',   mc: 'pet_fox',    type: PetTypeList.attack },
  { name: 'def_fox',    realName: '棕狐狸',   mc: 'pet_fox',    type: PetTypeList.defence },
  { name: 'bal_fox',    realName: '灰狐狸',   mc: 'pet_fox',    type: PetTypeList.balance },

  // rat — 老鼠 (3种变体)
  { name: 'att_rat',    realName: '白鼠',     mc: 'pet_rat',    type: PetTypeList.attack },
  { name: 'def_rat',    realName: '黑鼠',     mc: 'pet_rat',    type: PetTypeList.defence },
  { name: 'mag_rat',    realName: '魔鼠',     mc: 'pet_rat',    type: PetTypeList.magic },

  // spider — 蜘蛛 (2种变体)
  { name: 'att_spider', realName: '红蜘蛛',   mc: 'pet_spider', type: PetTypeList.attack },
  { name: 'def_spider', realName: '巨蜘蛛',   mc: 'pet_spider', type: PetTypeList.defence },

  // wolf — 狼 (2种变体)
  { name: 'att_wolf',   realName: '野狼',     mc: 'pet_wolf',   type: PetTypeList.attack },
  { name: 'mag_wolf',   realName: '狼人',     mc: 'pet_wolf',   type: PetTypeList.magic },

  // bear — 熊 (3种变体)
  { name: 'att_bear',   realName: '红熊',     mc: 'pet_bear',   type: PetTypeList.attack },
  { name: 'def_bear',   realName: '棕熊',     mc: 'pet_bear',   type: PetTypeList.defence },
  { name: 'bal_bear',   realName: '灰熊',     mc: 'pet_bear',   type: PetTypeList.balance },

  // goblin — 哥布林 (4种变体)
  { name: 'att_goblin', realName: '哥布林战士', mc: 'pet_goblin', type: PetTypeList.attack },
  { name: 'def_goblin', realName: '哥布林卫士', mc: 'pet_goblin', type: PetTypeList.defence },
  { name: 'bal_goblin', realName: '哥布林弓手', mc: 'pet_goblin', type: PetTypeList.balance },
  { name: 'mag_goblin', realName: '哥布林法师', mc: 'pet_goblin', type: PetTypeList.magic },

  // skeleton — 骷髅 (4种变体)
  { name: 'att_skeleton', realName: '骷髅战士', mc: 'pet_skeleton', type: PetTypeList.attack },
  { name: 'def_skeleton', realName: '骷髅卫士', mc: 'pet_skeleton', type: PetTypeList.defence },
  { name: 'bal_skeleton', realName: '骷髅弓手', mc: 'pet_skeleton', type: PetTypeList.balance },
  { name: 'mag_skeleton', realName: '骷髅法师', mc: 'pet_skeleton', type: PetTypeList.magic },

  // ghost — 幽灵 (4种变体)
  { name: 'att_ghost',  realName: '火焰幽灵', mc: 'pet_ghost',  type: PetTypeList.attack },
  { name: 'def_ghost',  realName: '岩石幽灵', mc: 'pet_ghost',  type: PetTypeList.defence },
  { name: 'bal_ghost',  realName: '风幽灵',   mc: 'pet_ghost',  type: PetTypeList.balance },
  { name: 'mag_ghost',  realName: '雷幽灵',   mc: 'pet_ghost',  type: PetTypeList.magic },

  // zombie — 僵尸 (4种变体)
  { name: 'att_zombie', realName: '僵尸武士', mc: 'pet_zombie', type: PetTypeList.attack },
  { name: 'def_zombie', realName: '僵尸卫士', mc: 'pet_zombie', type: PetTypeList.defence },
  { name: 'bal_zombie', realName: '僵尸弓手', mc: 'pet_zombie', type: PetTypeList.balance },
  { name: 'mag_zombie', realName: '僵尸法师', mc: 'pet_zombie', type: PetTypeList.magic },

  // ruin — 遗迹守卫 (4种变体)
  { name: 'att_ruin',   realName: '毁灭战士', mc: 'pet_ruin',   type: PetTypeList.attack },
  { name: 'def_ruin',   realName: '毁灭卫士', mc: 'pet_ruin',   type: PetTypeList.defence },
  { name: 'bal_ruin',   realName: '毁灭弓手', mc: 'pet_ruin',   type: PetTypeList.balance },
  { name: 'mag_ruin',   realName: '毁灭法师', mc: 'pet_ruin',   type: PetTypeList.magic },

  // unicorn — 独角兽 (2种变体)
  { name: 'def_unicorn', realName: '神圣独角兽', mc: 'pet_unicorn', type: PetTypeList.defence },
  { name: 'bal_unicorn', realName: '自然独角兽', mc: 'pet_unicorn', type: PetTypeList.balance },

  // dragon — 龙 (2种变体)
  { name: 'att_dragon', realName: '暗黑龙',   mc: 'pet_dragon', type: PetTypeList.attack },
  { name: 'mag_dragon', realName: '光明龙',   mc: 'pet_dragon', type: PetTypeList.magic },
];

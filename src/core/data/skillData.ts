// ═══ 技能静态数据 ═══
// AS3 原始: iData.iSkill.SkillData + SkillDataList
//
// 包含所有主动/被动技能的定义、属性加成表、升级消耗、行为参数。

import type { SkillData, StatData } from '../types';
import { Stat, WeaponCategory, SkillCategory, SkillType } from '../constants';
import {
  behave_smash, behave_life_drain, behave_defence, behave_mana_shield,
  behave_counterattack, behave_bolt, behave_thunder, behave_fireball,
  behave_ice_spear, behave_mirage_missle, behave_corrosive_shot,
  des_combat_master, des_blacksmithing, des_smash, des_defence,
  des_counterattack, des_magic_bolt, des_fireball, des_icespear,
  des_thunder, des_mana_shield, des_mirage_missle, des_corrosive_shot,
  des_life_drain,
} from './skillBehaviors';

function stat(name: string, value: number): StatData {
  return { name, value };
}

const lvCost = [0, 1, 2, 3, 5, 8, 12, 18, 26, 38, 55, 80, 115, 165, 240];

// ═══ 技能列表 ═══

export const SkillDataList: SkillData[] = [
  // === COMBAT_MASTERY - 近战精通 (被动) ===
  {
    name: 'COMBAT_MASTERY',
    category: SkillCategory.MELEE,
    type: SkillType.PASSIVE,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.hp, 10 * (i + 1)), stat(Stat.str, i < 9 ? i + 1 : (i - 7) * 2 + 16 + i * 0)]),
    effectList: Array.from({ length: 15 }, (_, i) => [stat(Stat.attackMin, i + 1), stat(Stat.attackMax, i + 2)]),
    lvupCostList: [0, 1, 3, 5, 7, 8, 10, 12, 14, 16, 20, 22, 24, 26, 30],
    desFunction: des_combat_master,
  },
  // === SMASH - 重击 (主动) ===
  {
    name: 'SMASH',
    category: SkillCategory.MELEE,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => i < 7 ? [] : [stat(Stat.str, i - 6), stat(Stat.will, i - 6)]),
    lvupCostList: [0, 2, 4, 6, 8, 10, 11, 11, 11, 11, 13, 13, 13, 13, 20],
    setList: [[200],[210],[220],[230],[240],[250],[300],[310],[320],[330],[400],[420],[440],[460],[500]],
    desFunction: des_smash,
    behaveFunction: behave_smash,
  },
  // === CRITICAL_HIT - 暴击 (被动) ===
  {
    name: 'CRITICAL_HIT',
    category: SkillCategory.ALL,
    type: SkillType.PASSIVE,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.will, (i + 1) * 3), stat(Stat.crit_mul, 50 + (i < 6 ? i * 5 : (i - 6) * 10 + 85))]),
    lvupCostList: [3, 3, 3, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20],
    desFunction: des_combat_master,
  },
  // === BLACKSMITHING - 锻造 (被动) ===
  {
    name: 'BLACKSMITHING',
    category: SkillCategory.ALL,
    type: SkillType.PASSIVE,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.dex, i < 9 ? i + 1 : (i - 7) * 2 + 9), stat(Stat.intelligence, i < 9 ? i + 1 : (i - 7) * 2 + 9)]),
    lvupCostList: [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 20, 21, 22, 23, 30],
    desFunction: des_blacksmithing,
  },
  // === DEFENCE - 防御 (主动) ===
  {
    name: 'DEFENCE',
    category: SkillCategory.ALL,
    type: SkillType.DEFENCE,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.hp, i < 10 ? (i + 1) * 2 + i * 0 : i === 10 ? 22 : i === 11 ? 25 : i === 12 ? 28 : i === 13 ? 31 : 41), stat(Stat.defence, i + 1)]),
    lvupCostList: [0, 1, 3, 5, 7, 8, 11, 12, 13, 14, 17, 18, 19, 20, 25],
    setList: [[20,5,1.1],[21,6,1.15],[22,7,1.2],[24,8,1.25],[26,9,1.3],[28,10,1.4],[32,12,1.45],[34,13,1.5],[38,14,1.55],[42,15,1.7],[46,17,1.75],[50,20,1.8],[54,23,1.85],[59,26,1.9],[65,30,2]],
    desFunction: des_defence,
    behaveFunction: behave_defence,
  },
  // === COUNTERATTACK - 反击 (主动) ===
  {
    name: 'COUNTERATTACK',
    category: SkillCategory.MELEE,
    type: SkillType.DEFENCE,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.dex, i + 1)]),
    lvupCostList: [3, 4, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18],
    setList: [[50,100,5,5],[60,100,5,5],[70,100,5,5],[80,100,5,5],[90,100,5,5],[100,100,5,5],[120,110,10,10],[130,115,10,10],[140,120,10,10],[150,125,10,10],[160,130,15,15],[170,135,15,15],[180,140,15,15],[190,140,15,15],[200,150,20,20]],
    desFunction: des_counterattack,
    behaveFunction: behave_counterattack,
  },
  // === MAGIC_MASTERY - 魔法精通 (被动) ===
  {
    name: 'MAGIC_MASTERY',
    category: SkillCategory.MAGIC,
    type: SkillType.PASSIVE,
    statList: Array.from({ length: 15 }, (_, i) => {
      const mp = (i + 1) * 10;
      const intel = i < 6 ? 0 : i < 10 ? i - 5 : (i - 8) * 2 + 5;
      const list: StatData[] = [stat(Stat.mp, mp)];
      if (intel > 0) list.push(stat(Stat.intelligence, intel));
      return list;
    }),
    lvupCostList: [1, 1, 2, 2, 3, 3, 5, 5, 7, 7, 10, 10, 10, 10, 15],
    desFunction: des_combat_master,
  },
  // === FIREBOLT - 火焰 (主动) ===
  {
    name: 'FIREBOLT',
    category: SkillCategory.MAGIC,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.intelligence, i < 9 ? i * 3 + 1 + Math.floor(i / 3) : i * 4 + 8)]),
    lvupCostList: [1, 1, 2, 2, 3, 3, 5, 5, 7, 7, 12, 12, 12, 12, 15],
    setList: [[7,25,10],[8,27,10],[9,28,15],[11,30,15],[13,35,15],[15,40,15],[18,45,20],[21,50,20],[25,55,20],[29,60,20],[40,80,25],[45,85,25],[50,90,25],[55,95,25],[60,120,30]],
    desFunction: des_magic_bolt,
    behaveFunction: behave_bolt,
  },
  // === ICEBOLT - 冰矛 (主动) ===
  {
    name: 'ICEBOLT',
    category: SkillCategory.MAGIC,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.intelligence, i < 9 ? i * 3 + 1 + Math.floor(i / 3) : i * 4 + 8)]),
    lvupCostList: [1, 1, 2, 2, 3, 3, 3, 5, 5, 5, 7, 8, 9, 10, 20],
    setList: [[10,20,5],[11,21,5],[13,23,5],[15,25,5],[18,27,5],[21,30,5],[24,35,10],[28,40,10],[32,45,10],[37,48,10],[48,54,15],[53,59,15],[59,65,15],[63,72,15],[70,80,20]],
    desFunction: des_magic_bolt,
    behaveFunction: behave_bolt,
  },
  // === LIGHTNINGBOLT - 雷矢 (主动) ===
  {
    name: 'LIGHTNINGBOLT',
    category: SkillCategory.MAGIC,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.intelligence, i < 9 ? i * 3 + 1 + Math.floor(i / 3) : i * 4 + 8)]),
    lvupCostList: [1, 2, 3, 4, 5, 5, 8, 8, 8, 8, 10, 10, 10, 10, 20],
    setList: [[1,40,15],[2,46,15],[3,52,15],[4,58,15],[5,65,15],[6,72,15],[8,79,15],[9,86,15],[11,93,15],[13,100,15],[20,110,20],[24,120,20],[28,130,20],[32,140,20],[40,150,25]],
    desFunction: des_magic_bolt,
    behaveFunction: behave_bolt,
  },
  // === FIREBALL - 火球 (主动) ===
  {
    name: 'FIREBALL',
    category: SkillCategory.MAGIC,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => {
      const intel = i < 8 ? (i + 1) * 3 + i : i <= 11 ? (i + 1) * 5 - i * 3 + 32 : (i + 1) * 5 - 11;
      const list: StatData[] = [stat(Stat.intelligence, intel)];
      if (i >= 11) list.push(stat(Stat.str, i === 11 ? 2 : i === 12 ? 5 : i === 13 ? 8 : 12));
      return list;
    }),
    lvupCostList: [7, 8, 9, 10, 12, 15, 17, 20, 25, 30, 35, 40, 45, 50, 60],
    setList: [[32,80,40,0.2],[48,128,40,0.2],[64,160,40,0.2],[80,192,45,0.2],[112,208,45,0.25],[144,240,45,0.25],[208,320,50,0.25],[224,336,50,0.3],[240,352,50,0.4],[288,368,50,0.5],[288,400,50,0.6],[288,416,50,0.7],[288,432,50,0.8],[288,448,50,0.9],[320,480,55,1]],
    desFunction: des_fireball,
    behaveFunction: behave_fireball,
  },
  // === ICE_SPEAR - 冰刃 (主动) ===
  {
    name: 'ICE_SPEAR',
    category: SkillCategory.MAGIC,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => {
      const intel = i < 9 ? i + 1 : i <= 11 ? (i - 8) * 3 + 11 : (i - 8) * 3 + 14;
      const list: StatData[] = [stat(Stat.intelligence, intel)];
      if (i >= 10) list.push(stat(Stat.mp, i === 10 ? 5 : i === 11 ? 10 : i === 12 ? 15 : i === 13 ? 20 : 30));
      return list;
    }),
    lvupCostList: [4, 6, 8, 10, 12, 14, 20, 25, 30, 35, 42, 48, 54, 60, 70],
    setList: [[80,88,30,5,0.02,1],[84,96,30,5,0.02,1],[88,104,30,5,0.02,1],[92,112,30,5,0.02,1],[96,120,30,10,0.025,1],[100,128,30,10,0.025,1],[112,144,35,10,0.025,1],[116,152,35,10,0.03,1],[120,160,35,10,0.04,1],[124,168,35,10,0.05,1],[136,184,35,10,0.06,2],[140,192,40,10,0.07,2],[144,200,40,10,0.08,2],[148,208,40,10,0.09,2],[160,240,45,15,0.1,3]],
    desFunction: des_icespear,
    behaveFunction: behave_ice_spear,
  },
  // === THUNDER - 雷击 (主动) ===
  {
    name: 'THUNDER',
    category: SkillCategory.MAGIC,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.mp, i < 6 ? (i + 1) * 5 : i * 7 + 5), stat(Stat.will, i < 9 ? i + 1 : (i - 7) * 3 + 11)]),
    lvupCostList: [2, 4, 6, 9, 12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    setList: [[16,106,45,5,0.02],[26,160,45,5,0.02],[34,210,45,5,0.02],[50,262,45,5,0.02],[70,328,45,10,0.025],[82,380,50,10,0.025],[98,460,50,10,0.025],[104,536,50,10,0.03],[118,572,50,10,0.04],[126,628,50,10,0.05],[134,660,50,10,0.06],[148,716,55,10,0.07],[148,782,55,10,0.08],[148,848,55,10,0.09],[160,880,60,15,0.1]],
    desFunction: des_thunder,
    behaveFunction: behave_thunder,
  },
  // === RANGE_MASTERY - 远程精通 (被动) ===
  {
    name: 'RANGE_MASTERY',
    category: SkillCategory.RANGED,
    type: SkillType.PASSIVE,
    statList: Array.from({ length: 15 }, (_, i) => {
      const dex = (i + 1) * 2 + i * 2;
      const list: StatData[] = [stat(Stat.dex, dex)];
      if (i >= 9) { list.push(stat(Stat.str, i - 8)); }
      if (i >= 10) { list.push(stat(Stat.will, (i - 8) * 2)); }
      return list;
    }),
    effectList: Array.from({ length: 15 }, (_, i) => [stat(Stat.attackMin, i + 1), stat(Stat.attackMax, i + 2)]),
    lvupCostList: [0, 1, 3, 5, 7, 8, 9, 10, 12, 14, 15, 16, 17, 18, 20],
    desFunction: des_combat_master,
  },
  // === MIRAGE_MISSILE - 毒箭 (主动) ===
  {
    name: 'MIRAGE_MISSILE',
    category: SkillCategory.RANGED,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => {
      const dex = i < 5 ? i + 1 : i < 9 ? i + 1 : (i - 7) * 2 + 9;
      const list: StatData[] = [stat(Stat.dex, dex)];
      if (i >= 5) list.push(stat(Stat.intelligence, i - 4));
      return list;
    }),
    lvupCostList: [1, 2, 3, 4, 5, 6, 9, 11, 13, 15, 20, 22, 24, 26, 40],
    setList: [[100,4,6,0.05],[105,4,6,0.05],[110,5,6,0.1],[115,6,7,0.1],[120,7,7,0.15],[130,9,7,0.15],[135,9,8,0.2],[140,12,8,0.25],[145,13,8,0.3],[150,15,9,0.3],[160,17,10,0.4],[170,19,11,0.45],[180,21,12,0.5],[190,23,13,0.6],[200,26,15,0.7]],
    desFunction: des_mirage_missle,
    behaveFunction: behave_mirage_missle,
  },
  // === CORROSIVE_SHOT - 腐蚀箭 (主动) ===
  {
    name: 'CORROSIVE_SHOT',
    category: SkillCategory.RANGED,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => [stat(Stat.dex, i < 9 ? i * 3 + 1 + Math.floor(i / 3) : i * 4 + 8)]),
    lvupCostList: [2, 4, 6, 9, 12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    setList: [[100,1,10,0.01,0.1],[105,1,10,0.01,0.1],[110,1,10,0.01,0.1],[115,1,10,0.01,0.1],[120,1,10,0.01,0.1],[130,2,15,0.015,0.15],[135,2,15,0.015,0.2],[140,2,15,0.015,0.3],[145,2,15,0.015,0.3],[150,2,20,0.02,0.3],[160,2,20,0.022,0.3],[170,2,20,0.024,0.35],[180,2,20,0.026,0.4],[190,2,20,0.028,0.45],[200,3,25,0.03,0.5]],
    desFunction: des_corrosive_shot,
    behaveFunction: behave_corrosive_shot,
  },
  // === LIFE_DRAIN - 吸血 (主动) ===
  {
    name: 'LIFE_DRAIN',
    category: SkillCategory.MELEE,
    type: SkillType.ATTACK,
    statList: Array.from({ length: 15 }, (_, i) => {
      const str = i < 9 ? i + 1 : (i - 7) * 3 + 8;
      const list: StatData[] = [stat(Stat.str, str)];
      if (i >= 9) list.push(stat(Stat.hp, (i - 8) * 5));
      return list;
    }),
    lvupCostList: [4, 6, 8, 10, 12, 14, 17, 20, 23, 26, 30, 34, 38, 42, 50],
    setList: [[10,0.001,30],[10,0.001,35],[15,0.0015,40],[15,0.002,45],[20,0.0025,50],[25,0.0025,55],[25,0.0025,60],[25,0.003,65],[25,0.0035,70],[25,0.004,75],[30,0.005,80],[30,0.0055,85],[30,0.006,90],[30,0.0065,95],[35,0.0075,100]],
    desFunction: des_life_drain,
    behaveFunction: behave_life_drain,
  },
  // === MANA_SHIELD - 魔法盾 (主动) ===
  {
    name: 'MANA_SHIELD',
    category: SkillCategory.MAGIC,
    type: SkillType.DEFENCE,
    statList: Array.from({ length: 15 }, (_, i) => {
      const mp = (i + 1) * 2 + i * 2 + 2;
      const list: StatData[] = [stat(Stat.mp, mp)];
      if (i >= 6) list.push(stat(Stat.intelligence, i - 5));
      return list;
    }),
    lvupCostList: [4, 6, 8, 10, 12, 14, 17, 20, 23, 26, 30, 34, 38, 42, 50],
    setList: [[5,0.002,0.5,30],[5,0.002,0.5,35],[5,0.002,0.5,40],[5,0.002,0.5,45],[10,0.0025,0.75,50],[10,0.0025,0.75,55],[10,0.0025,0.75,60],[10,0.003,0.75,65],[10,0.004,1,70],[10,0.005,1,75],[10,0.006,1,80],[10,0.007,1,85],[10,0.008,1,90],[10,0.009,1,95],[15,0.01,1.5,95]],
    desFunction: des_mana_shield,
    behaveFunction: behave_mana_shield,
  },
];

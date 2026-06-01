// ═══ 称号静态数据 ═══
// AS3 原始: iData.iPlayer.Title + TitleList
//
// 游戏中约 45 个成就称号，提供属性加成。

import type { TitleData, StatMulData } from '../types';
import { Stat } from '../constants';

// ═══ 辅助函数 ═══

function sm(name: string, mul: number, add: number = 0): StatMulData {
  return { name, mul, add };
}

/**
 * 称号工厂 - 创建含 updateInfo/setGot/load/save 方法的完整 TitleData
 * AS3 原始: Title.as (159行)
 */
function makeTitle(
  name: string,
  realName: string,
  description: string,
  statMulList: StatMulData[],
  maxFix: number = 0,
  countFix: number = 0,
): TitleData {
  return {
    name,
    realName,
    description,
    statMulList,
    maxFix,
    countFix,
    max: 0,
    count: 0,
    isGot: false,

    /**
     * 更新称号进度 - 追踪 max 和 count，达标自动激活
     * AS3 原始: Title.updateInfo(param1:int=0, param2:int=0): void
     */
    /**
     * 激活称号 - 触发 behaveFunction 回调（技能解锁等）
     * AS3 原始: Title.setGot(): void
     */
    load(data: string): void {
      if (data !== '') {
        const parts = data.split('#');
        this.max = parseInt(parts[0], 10) || 0;
        this.count = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
        this.isGot = parts.length > 2 ? parts[2] === '1' : false;
      }
    },

    save(): string {
      return `${this.max}#${this.count}#${this.isGot ? '1' : '0'}`;
    },
  };
}

// ═══ 技能解锁助手 — 大师称号达成时自动学习新技能 ═══
// AS3 原始: TitleList.add_fireball / add_ice_spear 等 6 个静态函数

export const TITLE_SKILL_UNLOCKS: Record<string, string> = {
  'the Combat Master': 'LIFE_DRAIN',
  'the Magic Master': 'MANA_SHIELD',
  'the Master of Icebolt': 'ICE_SPEAR',
  'the Master of Firebolt': 'FIREBALL',
  'the Master of Lightning Bolt': 'THUNDER',
  'the Master of Range': 'CORROSIVE_SHOT',
};

// ═══ 称号列表 — 全部 45 个 ═══
// AS3 原始: iData.iPlayer.TitleList (45个称号，含45个事件分发)

const TITLE_DEFINITIONS: TitleData[] = [
  // === 入门/剧情称号 ===
  makeTitle('the Beginner', '初心者', '欢迎来到战斗无止境的游戏世界', [sm(Stat.protection, 1, 1), sm(Stat.luck, 1, 5)]),
  makeTitle('the Reborn', '转生的', '在20岁后转生', [sm(Stat.str, 1, 6), sm(Stat.intelligence, 1, 6), sm(Stat.dex, 1, 6), sm(Stat.will, 1, 6), sm(Stat.luck, 1, 6)], 0, 1),

  // === 年龄系列 ===
  makeTitle('the Adult', '成年的', '达到18岁', [sm(Stat.will, 1, 15), sm(Stat.dex, 1, 3), sm(Stat.luck, 1, -5)], 18),
  makeTitle('the All-Knowing', '睿智的', '达到30岁', [sm(Stat.intelligence, 1.1, 20), sm(Stat.dex, 1, 20), sm(Stat.will, 1, -30), sm(Stat.hp, 1, -5), sm(Stat.mp, 1, -5)], 30),
  makeTitle('the Old', '年老的', '达到40岁', [sm(Stat.intelligence, 1.2, 35), sm(Stat.dex, 1, 10), sm(Stat.will, 1, -40), sm(Stat.str, 1, -5), sm(Stat.hp, 1, -10), sm(Stat.mp, 1, -10)], 40),
  makeTitle('who Reached Lv 50 at Age 10', '10岁达到50级的', '在10岁时达到50级', [sm(Stat.str, 1.05, 20), sm(Stat.will, 1.05, 10), sm(Stat.intelligence, 1, -20), sm(Stat.dex, 1, -20), sm(Stat.luck, 1, 10)], 50),

  // === 属性神系列 ===
  makeTitle('the Wise', '聪明的', '智力超过200', [sm(Stat.intelligence, 1.1, 20)], 200),
  makeTitle('the Strong', '强壮的', '力量超过200', [sm(Stat.str, 1.1, 20)], 200),
  makeTitle('the Skillful', '灵巧的', '敏捷超过200', [sm(Stat.dex, 1.1, 20)], 200),
  makeTitle('the Tough', '坚强的', '意志超过200', [sm(Stat.will, 1.1, 20)], 200),
  makeTitle('the Lucky', '幸运的', '幸运超过200', [sm(Stat.luck, 1.1, 20)], 200),

  // === 锻造系列 ===
  makeTitle('the Beginner Forger', '初级铁匠', '强化出+5的装备', [sm(Stat.str, 1, 10), sm(Stat.luck, 1, 10), sm(Stat.intelligence, 1, -10), sm(Stat.dex, 1, -10)], 5),
  makeTitle('the Advanced Forger', '进阶铁匠', '强化出+8的装备', [sm(Stat.str, 1.05, 15), sm(Stat.luck, 1.05, 15), sm(Stat.intelligence, 0.95, -15), sm(Stat.dex, 0.95, -15)], 8),
  makeTitle('the Expert Forger', '专业铁匠', '强化出+12的装备', [sm(Stat.str, 1.1, 20), sm(Stat.luck, 1.1, 20), sm(Stat.intelligence, 0.9, -20), sm(Stat.dex, 0.9, -20)], 12),
  makeTitle('the God blessed', '上帝保佑的', '强化出+15的装备', [sm(Stat.str, 1.2, 30), sm(Stat.luck, 1.2, 30), sm(Stat.intelligence, 0.8, -30), sm(Stat.dex, 0.8, -30)], 15),

  // === 事件系列（手滑/死亡经历/战斗记录） ===
  makeTitle('who Experienced Death', '经历死亡的', '一次承受了超过500点伤害', [sm(Stat.hp, 1.05, 50), sm(Stat.protection, 1, 5), sm(Stat.intelligence, 1, -30), sm(Stat.dex, 1, -30)], 500),
  makeTitle('who Transcended Death', '超越死亡的', '一次承受了超过1000点伤害', [sm(Stat.hp, 1.1, 80), sm(Stat.protection, 1.05, 8), sm(Stat.intelligence, 1, -20), sm(Stat.dex, 1, -20)], 1000),
  makeTitle('the Breaker', '破坏者', '一次造成了500点伤害', [sm(Stat.str, 1.05, 20), sm(Stat.ATTACK, 1, 10), sm(Stat.intelligence, 1, -30), sm(Stat.luck, 1, -20)], 500),
  makeTitle('the Terminator', '终结者', '一次造成了1000点伤害', [sm(Stat.str, 1.1, 30), sm(Stat.ATTACK, 1.05, 20), sm(Stat.intelligence, 1, -20), sm(Stat.luck, 1, -15)], 1000),
  makeTitle('the Killer', '杀手', '总计造成10万伤害', [sm(Stat.hp, 1.05, 30), sm(Stat.defence, 1.05, 10)], 0, 100000),
  makeTitle('the Warlord', '战神', '总计造成100万伤害', [sm(Stat.hp, 1.1, 50), sm(Stat.defence, 1.1, 15)], 0, 1000000),
  makeTitle('the Boss Slayer', 'Boss屠戮者', '击败100个boss', [sm(Stat.protectionIgnore, 1, 5), sm(Stat.protectionReduce, 1, 3)], 0, 100),
  makeTitle('the Butterfingers', '手划的', '强化装备时连续失败4次', [sm(Stat.protection, 1, 10), sm(Stat.dex, 1, -20), sm(Stat.luck, 1, -20)], 0, 4),
  makeTitle('the Weakness Discoverer', '弱点观察者', '连续7次暴击', [sm(Stat.crit, 1.1, 20), sm(Stat.crit_mul, 1.05, 30)], 0, 7),
  makeTitle('the Elemental Apprentice', '初级元素师', '冰矛、火焰、雷矢都达到Rank 1', [sm(Stat.mp, 1.1, 100), sm(Stat.intelligence, 1.1, 30), sm(Stat.magicDamage, 1.1, 10), sm(Stat.str, 0.8, -20), sm(Stat.hp, 0.9, -30)], 0, 3),
  makeTitle('the Elemental Master', '大师元素师', '冰刃、火球、雷击都达到Rank 1', [sm(Stat.mp, 1.2, 200), sm(Stat.intelligence, 1.2, 50), sm(Stat.magicDamage, 1.15, 15), sm(Stat.str, 0.7, -30), sm(Stat.hp, 0.8, -60), sm(Stat.dex, 0.9, -30), sm(Stat.protection, 1, 3)], 0, 3),
  makeTitle('the Sniper', '狙击者', '远程精通、毒箭、破甲箭都达到Rank 1', [sm(Stat.dex, 1.2, 30), sm(Stat.crit, 1.2, 20)], 0, 3),

  // === 大师系列（技能Rank 1，含技能解锁 behaveFunction） ===
  makeTitle('the Combat Master', '近战大师', '近战精通达到Rank 1', [sm(Stat.hp, 1, 50), sm(Stat.ATTACK, 1.2), sm(Stat.str, 1, 20), sm(Stat.intelligence, 0.8, -20), sm(Stat.luck, 1, -20)]),
  makeTitle('the Master of Defence', '防御大师', '防御达到Rank 1', [sm(Stat.hp, 1.1, 100), sm(Stat.defence, 1, 20), sm(Stat.protection, 1, 10), sm(Stat.intelligence, 0.9, -10), sm(Stat.luck, 1, -10)]),
  makeTitle('the Master of Counter', '反击大师', '反击达到Rank 1', [sm(Stat.mp, 1, -30), sm(Stat.str, 1, -20), sm(Stat.intelligence, 1, 20), sm(Stat.dex, 1.1, 20)]),
  makeTitle('the Master of Smash', '重击大师', '重击达到Rank 1', [sm(Stat.str, 1.2, 20), sm(Stat.dex, 1, -20), sm(Stat.luck, 1, 20), sm(Stat.protection, 1, -10)]),
  makeTitle('the Magic Master', '魔法大师', '魔法精通达到Rank 1', [sm(Stat.mp, 1.1, 50), sm(Stat.magicDamage, 1, 5)]),
  makeTitle('the Master of Icebolt', '冰矛大师', '冰矛达到Rank 1', [sm(Stat.mp, 1.1, 20), sm(Stat.intelligence, 1.1, 15), sm(Stat.str, 0.9, -20), sm(Stat.dex, 1, 15)]),
  makeTitle('the Master of Firebolt', '火焰大师', '火焰达到Rank 1', [sm(Stat.mp, 1.1, 30), sm(Stat.intelligence, 1.1, 15), sm(Stat.str, 0.9, -10), sm(Stat.dex, 1, 15), sm(Stat.luck, 1, -10)]),
  makeTitle('the Master of Lightning Bolt', '雷矢大师', '雷矢达到Rank 1', [sm(Stat.mp, 1.1, 30), sm(Stat.hp, 0.9, -30), sm(Stat.intelligence, 1.1, 15), sm(Stat.str, 1, 10), sm(Stat.luck, 1, -10)]),
  makeTitle('the Master of Critical Hit', '暴击大师', '暴击达到Rank 1', [sm(Stat.hp, 1, 30), sm(Stat.dex, 0.9, -10), sm(Stat.protection, 1, -5), sm(Stat.will, 1.2, 30), sm(Stat.crit_mul, 1, 50)]),
  makeTitle('the Master of Blacksmithing', '锻造大师', '铁匠达到Rank 1', [sm(Stat.hp, 1, -30), sm(Stat.mp, 1, -30), sm(Stat.dex, 1, 30), sm(Stat.will, 1, 10), sm(Stat.luck, 1.1, 20)]),
  makeTitle('the Master of Ice Spear', '冰刃大师', '冰刃达到Rank 1', [sm(Stat.mp, 1.2, 30), sm(Stat.intelligence, 1.3, 25), sm(Stat.str, 0.8, -20), sm(Stat.hp, 0.9), sm(Stat.dex, 1, 25), sm(Stat.luck, 1, 20)]),
  makeTitle('the Master of Fireball', '火球大师', '火球达到Rank 1', [sm(Stat.mp, 1.2, 30), sm(Stat.intelligence, 1.2, 15), sm(Stat.str, 1.1, 10), sm(Stat.will, 0.8, -10), sm(Stat.dex, 1, -20), sm(Stat.luck, 1, -20)]),
  makeTitle('the Master of Thunder', '雷击大师', '雷击达到Rank 1', [sm(Stat.mp, 1.2, 30), sm(Stat.intelligence, 1, 15), sm(Stat.will, 1.2, 30), sm(Stat.str, 0.8, -15)]),
  makeTitle('the Master of Range', '远程大师', '远程精通达到Rank 1', [sm(Stat.dex, 1.2, 30), sm(Stat.str, 0.9, -25), sm(Stat.will, 1, -30), sm(Stat.hp, 1, 25)]),
  makeTitle('the Master of Mirage Missle', '毒箭大师', '毒箭达到Rank 1', [sm(Stat.dex, 1.1, 20), sm(Stat.intelligence, 1, 25), sm(Stat.str, 1, -20), sm(Stat.will, 1, -15), sm(Stat.mp, 1, 30)]),
  makeTitle('the Master of Corrosion', '破甲大师', '破甲箭达到Rank 1', [sm(Stat.dex, 1.3, 35), sm(Stat.will, 1, 25), sm(Stat.str, 0.8, -20), sm(Stat.hp, 1, -35), sm(Stat.mp, 1, 50)]),
  makeTitle('the Life Drain Master', '吸血大师', '吸血达到Rank 1', [sm(Stat.hp, 1.2, 50), sm(Stat.str, 1.1, 25), sm(Stat.intelligence, 0.8, -20), sm(Stat.luck, 1, -20)]),
  makeTitle('the Mana Shield Master', '魔法盾大师', '魔法盾达到Rank 1', [sm(Stat.mp, 1.2, 50), sm(Stat.intelligence, 1, 25), sm(Stat.str, 0.9, -10)]),
];

function freezeTitleDefinition(title: TitleData): TitleData {
  return Object.freeze({
    ...title,
    statMulList: Object.freeze([...title.statMulList]) as StatMulData[],
  });
}

export const TitleList: TitleData[] = Object.freeze(TITLE_DEFINITIONS.map(freezeTitleDefinition)) as TitleData[];

export interface TitleEvent {
  name: string;
  maxVal?: number;
  countVal?: number;
}

export interface TitleUpdateResult {
  titleList: TitleData[];
  unlockedSkills: string[];
}

export function serializeTitleState(title: TitleData): string {
  return `${title.max}#${title.count}#${title.isGot ? '1' : '0'}`;
}

export function cloneTitleState(title: TitleData): TitleData {
  return {
    ...title,
    statMulList: [...title.statMulList],
  };
}

export function deserializeTitleState(titleDef: TitleData, data: string): TitleData {
  const title = cloneTitleState(titleDef);
  title.max = 0;
  title.count = 0;
  title.isGot = false;
  title.load(data);
  return title;
}

export function createTitleListState(existingTitles: TitleData[] = []): TitleData[] {
  const existingByName = new Map(existingTitles.map(title => [title.name, title]));
  return TitleList.map((titleDef) => {
    const existing = existingByName.get(titleDef.name);
    return existing ? cloneTitleState({ ...titleDef, ...existing }) : cloneTitleState(titleDef);
  });
}

export function getTitleDefinition(name: string): TitleData | undefined {
  return TitleList.find(title => title.name === name);
}

function updateTitleState(title: TitleData, maxVal: number = 0, countVal: number = 0): TitleData {
  const max = maxVal > title.max ? maxVal : title.max;
  const count = countVal < 0 ? 0 : title.count + countVal;
  const isGot = title.isGot || (count >= title.countFix && max >= title.maxFix);
  return { ...title, max, count, isGot };
}

function applyTitleNames(
  titleList: TitleData[],
  titleNames: string[],
  maxVal: number,
  countVal: number,
): TitleUpdateResult {
  if (!titleNames.length) {
    return { titleList, unlockedSkills: [] };
  }
  const targetNames = new Set(titleNames);
  const unlockedSkills: string[] = [];
  const nextTitleList = titleList.map((title) => {
    if (!targetNames.has(title.name)) return title;
    const nextTitle = updateTitleState(title, maxVal, countVal);
    if (!title.isGot && nextTitle.isGot) {
      const unlockedSkill = TITLE_SKILL_UNLOCKS[nextTitle.name];
      if (unlockedSkill) unlockedSkills.push(unlockedSkill);
    }
    return nextTitle;
  });
  return { titleList: nextTitleList, unlockedSkills };
}

function titlesForEvent(eventType: string): string[] {
  switch (eventType) {
    case 'BLACKSMITHING':
      return ['the Master of Blacksmithing'];
    case 'COMBAT_MASTERY':
      return ['the Combat Master'];
    case 'COUNTERATTACK':
      return ['the Master of Counter'];
    case 'CRITICAL_HIT':
      return ['the Master of Critical Hit'];
    case 'DEFENCE':
      return ['the Master of Defence'];
    case 'FIREBOLT':
      return ['the Master of Firebolt', 'the Elemental Apprentice'];
    case 'ICEBOLT':
      return ['the Master of Icebolt', 'the Elemental Apprentice'];
    case 'LIGHTNINGBOLT':
      return ['the Master of Lightning Bolt', 'the Elemental Apprentice'];
    case 'MAGIC_MASTERY':
      return ['the Magic Master'];
    case 'SMASH':
      return ['the Master of Smash'];
    case 'CORROSIVE_SHOT':
      return ['the Master of Corrosion', 'the Sniper'];
    case 'RANGE_MASTERY':
      return ['the Master of Range', 'the Sniper'];
    case 'MIRAGE_MISSILE':
      return ['the Master of Mirage Missle', 'the Sniper'];
    case 'ICE_SPEAR':
      return ['the Master of Ice Spear', 'the Elemental Master'];
    case 'FIREBALL':
      return ['the Master of Fireball', 'the Elemental Master'];
    case 'THUNDER':
      return ['the Master of Thunder', 'the Elemental Master'];
    case 'MANA_SHIELD':
      return ['the Mana Shield Master'];
    case 'LIFE_DRAIN':
      return ['the Life Drain Master'];
    case 'age':
      return ['the Adult', 'the All-Knowing', 'the Old'];
    case 'age10':
      return ['who Reached Lv 50 at Age 10'];
    case Stat.str:
      return ['the Strong'];
    case Stat.dex:
      return ['the Skillful'];
    case Stat.intelligence:
      return ['the Wise'];
    case Stat.will:
      return ['the Tough'];
    case Stat.luck:
      return ['the Lucky'];
    case 'begin':
      return ['the Beginner'];
    case 'reborn':
      return ['the Reborn'];
    case 'forge':
      return ['the Beginner Forger', 'the Advanced Forger', 'the Expert Forger', 'the God blessed'];
    case 'endure':
      return ['who Experienced Death', 'who Transcended Death'];
    case 'damage':
      return ['the Breaker', 'the Terminator', 'the Killer', 'the Warlord'];
    case 'kill':
      return ['the Boss Slayer'];
    case 'fail':
      return ['the Butterfingers'];
    case 'crit':
      return ['the Weakness Discoverer'];
    default:
      return [];
  }
}

function titleUpdatesForEvent(eventType: string, maxVal: number, countVal: number): TitleEvent[] {
  switch (eventType) {
    case 'FIREBOLT':
      return [
        { name: 'the Master of Firebolt' },
        { name: 'the Elemental Apprentice', countVal: 1 },
      ];
    case 'ICEBOLT':
      return [
        { name: 'the Master of Icebolt' },
        { name: 'the Elemental Apprentice', countVal: 1 },
      ];
    case 'LIGHTNINGBOLT':
      return [
        { name: 'the Master of Lightning Bolt' },
        { name: 'the Elemental Apprentice', countVal: 1 },
      ];
    case 'CORROSIVE_SHOT':
      return [
        { name: 'the Master of Corrosion' },
        { name: 'the Sniper', countVal: 1 },
      ];
    case 'RANGE_MASTERY':
      return [
        { name: 'the Master of Range' },
        { name: 'the Sniper', countVal: 1 },
      ];
    case 'MIRAGE_MISSILE':
      return [
        { name: 'the Master of Mirage Missle' },
        { name: 'the Sniper', countVal: 1 },
      ];
    case 'ICE_SPEAR':
      return [
        { name: 'the Master of Ice Spear' },
        { name: 'the Elemental Master', countVal: 1 },
      ];
    case 'FIREBALL':
      return [
        { name: 'the Master of Fireball' },
        { name: 'the Elemental Master', countVal: 1 },
      ];
    case 'THUNDER':
      return [
        { name: 'the Master of Thunder' },
        { name: 'the Elemental Master', countVal: 1 },
      ];
    case 'damage':
      return [
        { name: 'the Breaker', maxVal },
        { name: 'the Terminator', maxVal },
        { name: 'the Killer', maxVal, countVal },
        { name: 'the Warlord', maxVal, countVal },
      ];
    default:
      return titlesForEvent(eventType).map(name => ({ name, maxVal, countVal }));
  }
}

export function applyTitleEvent(
  currentTitles: TitleData[] = [],
  eventType: string,
  maxVal: number = 0,
  countVal: number = 0,
): TitleUpdateResult {
  let titleList = createTitleListState(currentTitles);
  const unlockedSkills: string[] = [];
  for (const update of titleUpdatesForEvent(eventType, maxVal, countVal)) {
    const result = applyTitleNames(titleList, [update.name], update.maxVal ?? 0, update.countVal ?? 0);
    titleList = result.titleList;
    for (const skillName of result.unlockedSkills) {
      if (!unlockedSkills.includes(skillName)) unlockedSkills.push(skillName);
    }
  }
  return { titleList, unlockedSkills };
}

export function applyTitleEvents(currentTitles: TitleData[] = [], events: TitleEvent[] = []): TitleUpdateResult {
  let titleList = createTitleListState(currentTitles);
  const unlockedSkills: string[] = [];
  for (const event of events) {
    const result = applyTitleEvent(titleList, event.name, event.maxVal ?? 0, event.countVal ?? 0);
    titleList = result.titleList;
    for (const skillName of result.unlockedSkills) {
      if (!unlockedSkills.includes(skillName)) unlockedSkills.push(skillName);
    }
  }
  return { titleList, unlockedSkills };
}

// ═══ 称号事件分发系统 ═══
// AS3 原始: TitleList.updateTitleInfo(param1:String, param2:int=0, param3:int=0): void
//
// 根据游戏中发生的事件（升级技能/年龄变化/属性变化/战斗事件等），
// 自动追踪并更新对应称号的进度。
//
// 事件类型映射表：每个事件触发时，找到对应称号并调用其 updateInfo()

/**
 * 称号事件分发 — 根据事件类型批量更新相关称号
 *
 * @param eventType - 事件类型（技能名/属性名/系统事件名）
 * @param maxVal - max 追踪值（如技能等级、年龄、属性值）
 * @param countVal - count 追踪值（累计计数增量）
 */


// ═══ 职业称号详情 HTML（InfoWindow 用） ═══
// AS3 原始: Title.getDescription(): String

export function getTitleDescription(title: TitleData): string {
  let desc = `<p align='center'>${title.description}</p>`;
  desc += '--------------<br/>';
  if (title.maxFix !== 0) {
    desc += `记录:${title.max}<br/>`;
    desc += '--------------<br/>';
  }
  if (title.countFix !== 0) {
    desc += `记录:${title.count}<br/>`;
    desc += '--------------<br/>';
  }
  const GREEN = '#4BB814';
  const RED = '#ff4040';
  for (const sm of title.statMulList) {
    if (sm.add > 0) {
      desc += `<font size='20' color='${GREEN}'>  ${sm.name} +${sm.add}</font><br/>`;
    } else if (sm.add < 0) {
      desc += `<font size='20' color='${RED}'>  ${sm.name} ${sm.add}</font><br/>`;
    }
    if (sm.mul > 1) {
      desc += `<font size='20' color='${GREEN}'>  ${sm.name} x${sm.mul}</font><br/>`;
    } else if (sm.mul < 1) {
      desc += `<font size='20' color='${RED}'>  ${sm.name} x${sm.mul}</font><br/>`;
    }
  }
  return desc;
}

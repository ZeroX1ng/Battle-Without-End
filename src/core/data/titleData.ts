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
    updateInfo(maxVal: number = 0, countVal: number = 0): void {
      if (maxVal > this.max) {
        this.max = maxVal;
      }
      if (countVal < 0) {
        this.count = 0;
      } else {
        this.count += countVal;
      }
      if (this.isGot) return;
      if (this.count >= this.countFix && this.max >= this.maxFix) {
        this.setGot();
      }
    },

    /**
     * 激活称号 - 触发 behaveFunction 回调（技能解锁等）
     * AS3 原始: Title.setGot(): void
     */
    setGot(): void {
      if (this.isGot) return;
      this.isGot = true;
      if (this.behaveFunction) {
        this.behaveFunction();
      }
    },

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

export const TitleList: TitleData[] = [
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

// ═══ 称号事件分发系统 ═══
// AS3 原始: TitleList.updateTitleInfo(param1:String, param2:int=0, param3:int=0): void
//
// 根据游戏中发生的事件（升级技能/年龄变化/属性变化/战斗事件等），
// 自动追踪并更新对应称号的进度。
//
// 事件类型映射表：每个事件触发时，找到对应称号并调用其 updateInfo()

const TITLE_ALIAS: Record<string, TitleData> = {};
for (const t of TitleList) {
  TITLE_ALIAS[t.name] = t;
}

/**
 * 称号事件分发 — 根据事件类型批量更新相关称号
 *
 * @param eventType - 事件类型（技能名/属性名/系统事件名）
 * @param maxVal - max 追踪值（如技能等级、年龄、属性值）
 * @param countVal - count 追踪值（累计计数增量）
 */
export function updateTitleInfo(eventType: string, maxVal: number = 0, countVal: number = 0): void {
  // 技能 Rank 达到 1 时触发大师称号
  if (maxVal >= 15) {
    const skillToTitle: Record<string, string> = {
      BLACKSMITHING: 'the Master of Blacksmithing',
      COMBAT_MASTERY: 'the Combat Master',
      COUNTERATTACK: 'the Master of Counter',
      CRITICAL_HIT: 'the Master of Critical Hit',
      DEFENCE: 'the Master of Defence',
      FIREBOLT: 'the Master of Firebolt',
      ICEBOLT: 'the Master of Icebolt',
      LIGHTNINGBOLT: 'the Master of Lightning Bolt',
      MAGIC_MASTERY: 'the Magic Master',
      SMASH: 'the Master of Smash',
      RANGE_MASTERY: 'the Master of Range',
      CORROSIVE_SHOT: 'the Master of Corrosion',
      MIRAGE_MISSILE: 'the Master of Mirage Missle',
      ICE_SPEAR: 'the Master of Ice Spear',
      FIREBALL: 'the Master of Fireball',
      THUNDER: 'the Master of Thunder',
      MANA_SHIELD: 'the Mana Shield Master',
      LIFE_DRAIN: 'the Life Drain Master',
    };
    const titleName = skillToTitle[eventType];
    if (titleName && TITLE_ALIAS[titleName]) {
      TITLE_ALIAS[titleName].updateInfo(maxVal);
    }
  }

  // 基础元素技能 — 触发初级元素师追踪
  if (['FIREBOLT', 'ICEBOLT', 'LIGHTNINGBOLT'].includes(eventType) && maxVal >= 15) {
    TITLE_ALIAS['the Elemental Apprentice']?.updateInfo(0, 1);
  }

  // 进阶元素技能 — 触发大师元素师追踪
  if (['ICE_SPEAR', 'FIREBALL', 'THUNDER'].includes(eventType) && maxVal >= 15) {
    TITLE_ALIAS['the Elemental Master']?.updateInfo(0, 1);
  }

  // 远程技能 — 触发狙击者追踪
  if (['RANGE_MASTERY', 'MIRAGE_MISSILE', 'CORROSIVE_SHOT'].includes(eventType) && maxVal >= 15) {
    TITLE_ALIAS['the Sniper']?.updateInfo(0, 1);
  }

  switch (eventType) {
    case 'age':
      TITLE_ALIAS['the Adult']?.updateInfo(maxVal);
      TITLE_ALIAS['the All-Knowing']?.updateInfo(maxVal);
      TITLE_ALIAS['the Old']?.updateInfo(maxVal);
      break;
    case 'age10':
      TITLE_ALIAS['who Reached Lv 50 at Age 10']?.updateInfo(maxVal);
      break;
    case Stat.str:
      TITLE_ALIAS['the Strong']?.updateInfo(maxVal);
      break;
    case Stat.dex:
      TITLE_ALIAS['the Skillful']?.updateInfo(maxVal);
      break;
    case Stat.intelligence:
      TITLE_ALIAS['the Wise']?.updateInfo(maxVal);
      break;
    case Stat.will:
      TITLE_ALIAS['the Tough']?.updateInfo(maxVal);
      break;
    case Stat.luck:
      TITLE_ALIAS['the Lucky']?.updateInfo(maxVal);
      break;
    case 'begin':
      TITLE_ALIAS['the Beginner']?.updateInfo();
      break;
    case 'reborn':
      TITLE_ALIAS['the Reborn']?.updateInfo(0, 1);
      break;
    case 'forge':
      TITLE_ALIAS['the Beginner Forger']?.updateInfo(maxVal, countVal);
      TITLE_ALIAS['the Advanced Forger']?.updateInfo(maxVal, countVal);
      TITLE_ALIAS['the Expert Forger']?.updateInfo(maxVal, countVal);
      TITLE_ALIAS['the God blessed']?.updateInfo(maxVal, countVal);
      break;
    case 'endure':
      TITLE_ALIAS['who Experienced Death']?.updateInfo(maxVal);
      TITLE_ALIAS['who Transcended Death']?.updateInfo(maxVal);
      break;
    case 'damage':
      TITLE_ALIAS['the Breaker']?.updateInfo(maxVal);
      TITLE_ALIAS['the Terminator']?.updateInfo(maxVal);
      TITLE_ALIAS['the Killer']?.updateInfo(maxVal, countVal);
      TITLE_ALIAS['the Warlord']?.updateInfo(maxVal, countVal);
      break;
    case 'kill':
      TITLE_ALIAS['the Boss Slayer']?.updateInfo(maxVal, countVal);
      break;
    case 'fail':
      TITLE_ALIAS['the Butterfingers']?.updateInfo(maxVal, countVal);
      break;
    case 'crit':
      TITLE_ALIAS['the Weakness Discoverer']?.updateInfo(maxVal, countVal);
      break;
  }
}

// ═══ 技能解锁回调注入 ═══
// AS3 原始: TitleList.add_fireball/add_ice_spear 等静态方法
//
// 大师称号激活时自动学习对应高级技能。
// 使用内部队列模式 — 称号达成时将技能名推入队列，
// 由 GameReducer 在 BATTLE_TICK 中消费队列并 addSkill。

let _pendingUnlocks: string[] = [];

export function getPendingSkillUnlocks(): string[] {
  const result = _pendingUnlocks;
  _pendingUnlocks = [];
  return result;
}

/**
 * 为所有有技能解锁需求的大师称号绑定 behaveFunction
 * 达成时自动将技能名推入待解锁队列
 */
export function setupTitleBehaviors(): void {
  for (const titleName of Object.keys(TITLE_SKILL_UNLOCKS)) {
    const title = TITLE_ALIAS[titleName];
    if (title) {
      const skillName = TITLE_SKILL_UNLOCKS[titleName];
      title.behaveFunction = () => {
        _pendingUnlocks.push(skillName);
      };
    }
  }
}

setupTitleBehaviors();

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

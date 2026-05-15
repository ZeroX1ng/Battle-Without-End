// ═══ 怪物静态数据 ═══
// AS3 原始: iData.iMonster.MonsterData + MonsterList + MonsterTitle + MonsterTitleList + StatMul
//
// 包含所有怪物基础数据、怪物标题、属性倍率定义。

import type { MonsterData, MonsterTitleData, StatMulData } from '../types';
import { Stat, statTranslate } from '../constants';
import { FirstLetterToUpper } from '../math/MyMath';

// ═══ 怪物数据生成辅助函数 ═══

function md(
  name: string, realName: string, hp: number,
  attackMin: number, attackMax: number,
  defence: number, protection: number,
  crit: number, crit_mul: number,
  balance: number, CP: number
): MonsterData {
  return {
    name, realName, hp,
    attack: { min: attackMin, max: attackMax },
    defence, protection, crit, crit_mul, balance, CP
  };
}

// ═══ 属性倍率 ═══
// AS3 原始: iData.iMonster.StatMul

export function statMul(name: string, mul: number, add: number = 0): StatMulData {
  return { name, mul, add };
}

// ═══ 怪物称号列表 ═══
// AS3 原始: iData.iMonster.MonsterTitleList
// 共 22 种随机怪物头衔（20%概率出现）

export const MonsterTitleList: MonsterTitleData[] = [
  {
    name: '肉盾',
    statMulList: [
      statMul(Stat.hp, 3), statMul(Stat.defence, 1.5, 10),
      statMul(Stat.protection, 1.5, 5)
    ],
    xpMul: 3, goldMul: 2, dropMul: 1.5
  },
  {
    name: '难看的',
    statMulList: [
      statMul(Stat.hp, 1.2)
    ],
    xpMul: 1.2, goldMul: 1.2, dropMul: 1.4
  },
  {
    name: '可疑的',
    statMulList: [],
    xpMul: 3, goldMul: 3, dropMul: 3
  },
  {
    name: '未知的',
    statMulList: [
      statMul(Stat.ATTACK, 2, 20), statMul(Stat.hp, 3, 30),
      statMul(Stat.defence, 5, 20), statMul(Stat.protection, 3, 15)
    ],
    xpMul: 5, goldMul: 5, dropMul: 1.8
  },
  {
    name: '非常难看的',
    statMulList: [
      statMul(Stat.hp, 1.5)
    ],
    xpMul: 1.5, goldMul: 1.5, dropMul: 1.5
  },
  {
    name: '看起来很凶的',
    statMulList: [
      statMul(Stat.ATTACK, 2), statMul(Stat.hp, 2)
    ],
    xpMul: 2, goldMul: 1.5, dropMul: 1.5
  },
  {
    name: '刚赌赢了一把的',
    statMulList: [],
    xpMul: 1, goldMul: 5, dropMul: 1
  },
  {
    name: '眼神锐利的',
    statMulList: [
      statMul(Stat.crit, 2, 15), statMul(Stat.crit_mul, 2)
    ],
    xpMul: 2, goldMul: 1.5, dropMul: 1.5
  },
  {
    name: '10岁打到人的',
    statMulList: [
      statMul(Stat.ATTACK, 1.5), statMul(Stat.hp, 1.5),
      statMul(Stat.crit, 2), statMul(Stat.defence, 1, 10),
      statMul(Stat.protection, 1, 5)
    ],
    xpMul: 3, goldMul: 1.5, dropMul: 1.6
  },
  {
    name: '努力的',
    statMulList: [
      statMul(Stat.ATTACK, 2), statMul(Stat.hp, 5),
      statMul(Stat.defence, 2, 10)
    ],
    xpMul: 3, goldMul: 1.5, dropMul: 1.8
  },
  {
    name: '头头',
    statMulList: [
      statMul(Stat.ATTACK, 3), statMul(Stat.hp, 3),
      statMul(Stat.crit, 3), statMul(Stat.defence, 2, 10),
      statMul(Stat.protection, 2, 5), statMul(Stat.crit_mul, 2)
    ],
    xpMul: 4, goldMul: 3, dropMul: 2.2
  },
  {
    name: '被诅咒的',
    statMulList: [
      statMul(Stat.ATTACK, 2), statMul(Stat.hp, 2)
    ],
    xpMul: 0.5, goldMul: 0.5, dropMul: 0.7
  },
  {
    name: '弱小的',
    statMulList: [
      statMul(Stat.ATTACK, 0.8), statMul(Stat.hp, 0.8)
    ],
    xpMul: 0.5, goldMul: 0.5, dropMul: 0.7
  },
  {
    name: '有野心的',
    statMulList: [
      statMul(Stat.ATTACK, 1.5), statMul(Stat.hp, 1.5)
    ],
    xpMul: 1, goldMul: 1, dropMul: 1.4
  },
  {
    name: '重获新生的',
    statMulList: [
      statMul(Stat.ATTACK, 1.5), statMul(Stat.hp, 2)
    ],
    xpMul: 1.2, goldMul: 1, dropMul: 1.4
  },
  {
    name: '神圣的',
    statMulList: [
      statMul(Stat.defence, 3, 30), statMul(Stat.protection, 3, 20)
    ],
    xpMul: 3, goldMul: 3, dropMul: 2.1
  },
  {
    name: '将要灭绝的',
    statMulList: [
      statMul(Stat.defence, 2, 20), statMul(Stat.protection, 2, 10)
    ],
    xpMul: 2, goldMul: 2, dropMul: 1.7
  },
  {
    name: '初级召唤的',
    statMulList: [
      statMul(Stat.ATTACK, 1.5, 10), statMul(Stat.hp, 2, 30),
      statMul(Stat.defence, 1.5, 10), statMul(Stat.protection, 1.5, 5),
      statMul(Stat.crit, 1.5, 10), statMul(Stat.crit_mul, 1.5)
    ],
    xpMul: 1.5, goldMul: 1.5, dropMul: 2
  },
  {
    name: '进阶召唤的',
    statMulList: [
      statMul(Stat.ATTACK, 2.5, 20), statMul(Stat.hp, 3, 60),
      statMul(Stat.defence, 2, 30), statMul(Stat.protection, 2, 10),
      statMul(Stat.crit, 2, 15), statMul(Stat.crit_mul, 2)
    ],
    xpMul: 2, goldMul: 2, dropMul: 3
  },
  {
    name: '大神召唤的',
    statMulList: [
      statMul(Stat.ATTACK, 4, 30), statMul(Stat.hp, 5, 90),
      statMul(Stat.defence, 2.5, 50), statMul(Stat.protection, 2.5, 18),
      statMul(Stat.crit, 2.5, 25), statMul(Stat.crit_mul, 2.5)
    ],
    xpMul: 3, goldMul: 3, dropMul: 4
  },
  {
    name: '精英召唤的',
    statMulList: [
      statMul(Stat.ATTACK, 6, 40), statMul(Stat.hp, 7, 120),
      statMul(Stat.defence, 3.5, 70), statMul(Stat.protection, 3.5, 30),
      statMul(Stat.crit, 3.5, 40), statMul(Stat.crit_mul, 3.5)
    ],
    xpMul: 5, goldMul: 5, dropMul: 5
  },
  {
    name: '远古的',
    statMulList: [
      statMul(Stat.ATTACK, 3, 50), statMul(Stat.hp, 10, 100),
      statMul(Stat.defence, 1.5, 30), statMul(Stat.protection, 1.5, 35),
      statMul(Stat.crit, 1.5, 10), statMul(Stat.crit_mul, 1.5)
    ],
    xpMul: 10, goldMul: 10, dropMul: 2.8
  },
];

// ═══ 区域BOSS头衔（独立常量） ═══
// AS3 原始: MonsterTitleList.REGION_BOSS
// 属性加成极高，用于地图区域BOSS

export const REGION_BOSS_TITLE: MonsterTitleData = {
  name: '<font color=\'#ff4040\'>区域BOSS</font>',
  statMulList: [
    statMul(Stat.ATTACK, 3, 50), statMul(Stat.hp, 50, 100),
    statMul(Stat.defence, 0, 0), statMul(Stat.protection, 1, 50),
    statMul(Stat.crit, 2.5, 100), statMul(Stat.crit_mul, 2.5, 50)
  ],
  xpMul: 20, goldMul: 20, dropMul: 3
};

// ═══ 怪物头衔描述生成 ═══
// AS3 原始: MonsterTitle.get description(): String
// 生成包含属性加成的HTML彩色描述文本，用于InfoWindow提示

export function getMonsterTitleDescription(title: MonsterTitleData, plain = false): string {
  const GREEN_H = '#4BB814';
  const RED_H = '#ff4040';
  let desc = '';
  const arr = title.statMulList;
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    const sm = arr[i];
    if (sm.add > 0) {
      if (plain) {
        desc += `  ${FirstLetterToUpper(statTranslate(sm.name))} +${sm.add}\n`;
      } else {
        desc += `<font size='20' color='${GREEN_H}'>  ${FirstLetterToUpper(statTranslate(sm.name))} +${sm.add}</font><br/>`;
      }
    } else if (sm.add < 0) {
      if (plain) {
        desc += `  ${FirstLetterToUpper(statTranslate(sm.name))} ${sm.add}\n`;
      } else {
        desc += `<font size='20' color='${RED_H}'>  ${FirstLetterToUpper(statTranslate(sm.name))} ${sm.add}</font><br/>`;
      }
    }
    if (sm.mul > 1) {
      if (plain) {
        desc += `  ${FirstLetterToUpper(statTranslate(sm.name))} x${sm.mul}\n`;
      } else {
        desc += `<font size='20' color='${GREEN_H}'>  ${FirstLetterToUpper(statTranslate(sm.name))} x${sm.mul}</font><br/>`;
      }
    } else if (sm.mul < 1) {
      if (plain) {
        desc += `  ${FirstLetterToUpper(statTranslate(sm.name))} x${sm.mul}\n`;
      } else {
        desc += `<font size='20' color='${RED_H}'>  ${FirstLetterToUpper(statTranslate(sm.name))} x${sm.mul}</font><br/>`;
      }
    }
  }
  if (desc === '') {
    desc = '???';
  }
  return desc;
}

// ═══ 怪物列表 ═══
// AS3 原始: iData.iMonster.MonsterList
// 约 82+37 种怪物，按区域 + CP 分级

export const MonsterList: MonsterData[] = [
  // === 新手区：Town of Beginner ===
  md('town_rat', '小镇老鼠', 30, 5, 10, 2, 0, 5, 150, 50, 70),
  md('town_slime', '绿色史莱姆', 40, 4, 8, 3, 0, 5, 150, 45, 80),
  md('town_bat', '洞穴蝙蝠', 35, 6, 12, 2, 0, 8, 155, 55, 90),

  // === 森林区 ===
  md('forest_wolf', '森林狼', 80, 12, 22, 8, 5, 8, 160, 55, 180),
  md('forest_boar', '野猪', 100, 15, 25, 10, 8, 7, 155, 50, 220),
  md('forest_goblin', '哥布林', 70, 10, 18, 6, 3, 10, 160, 55, 200),
  md('forest_slime', '蓝史莱姆', 90, 8, 16, 5, 10, 5, 150, 50, 190),
  md('forest_bear', '棕熊', 140, 20, 35, 12, 12, 10, 170, 48, 350),

  // === 洞穴区 ===
  md('cave_spider', '巨型蜘蛛', 110, 18, 30, 10, 8, 12, 165, 52, 280),
  md('cave_bat', '洞穴巨蝠', 95, 16, 26, 8, 5, 15, 170, 55, 260),
  md('cave_skeleton', '骷髅兵', 130, 20, 32, 15, 12, 10, 160, 50, 320),
  md('cave_ghost', '幽灵', 75, 22, 28, 5, 0, 15, 180, 55, 300),
  md('cave_golem', '石像鬼', 180, 22, 38, 20, 18, 8, 150, 45, 450),

  // === 沼泽区 ===
  md('swamp_zombie', '僵尸', 150, 25, 40, 12, 15, 7, 155, 48, 380),
  md('swamp_slime', '毒史莱姆', 120, 18, 28, 10, 20, 10, 150, 50, 340),
  md('swamp_witch', '沼泽女巫', 100, 30, 45, 8, 10, 12, 175, 52, 420),
  md('swamp_troll', '沼泽巨魔', 220, 30, 50, 18, 15, 8, 160, 45, 550),

  // === 沙漠区 ===
  md('desert_scorpion', '沙漠蝎', 180, 28, 45, 18, 20, 15, 165, 48, 480),
  md('desert_mummy', '木乃伊', 160, 24, 38, 15, 15, 10, 160, 50, 440),
  md('desert_bandit', '沙漠强盗', 200, 32, 48, 12, 10, 18, 170, 50, 520),
  md('desert_sphinx', '狮身人面像', 260, 35, 55, 22, 22, 12, 155, 48, 650),
  md('desert_dragon', '沙龙', 350, 45, 70, 30, 25, 15, 165, 55, 900),

  // === 雪山/冰原区 ===
  md('ice_wolf', '冰原狼', 240, 35, 52, 22, 18, 15, 160, 50, 600),
  md('ice_golem', '冰魔像', 300, 30, 48, 25, 25, 10, 150, 45, 720),
  md('ice_dragon', '冰霜龙', 400, 50, 80, 35, 30, 15, 165, 55, 1100),

  // === 火山/地狱区 ===
  md('fire_demon', '烈焰魔', 280, 40, 60, 22, 20, 18, 170, 52, 750),
  md('fire_lizard', '火蜥蜴', 320, 42, 65, 25, 25, 15, 160, 48, 820),
  md('fire_dragon', '火龙', 450, 55, 85, 35, 30, 18, 168, 55, 1300),
  md('demon_lord', '恶魔领主', 500, 60, 90, 38, 35, 20, 170, 55, 1600),

  // === 高等级区域 ===
  md('dark_knight', '暗黑骑士', 420, 50, 78, 35, 30, 20, 165, 50, 1200),
  md('dark_mage', '暗黑法师', 350, 55, 82, 22, 25, 22, 175, 55, 1250),
  md('ancient_dragon', '远古龙', 600, 70, 110, 45, 40, 22, 170, 55, 2000),
  md('fallen_angel', '堕落天使', 550, 65, 100, 40, 38, 25, 172, 52, 1900),

  // === 最终区域 ===
  md('death_knight', '死亡骑士', 650, 75, 120, 45, 42, 25, 168, 50, 2400),
  md('lich_king', '巫妖王', 550, 80, 125, 35, 35, 28, 178, 55, 2500),
  md('chaos_dragon', '混沌龙', 800, 90, 140, 50, 48, 28, 172, 55, 3500),
  md('desert_dragon_final', '沙漠巨龙', 750, 85, 130, 48, 45, 25, 170, 52, 3000),

  // ═══════════════════════════════════════════════
  // 以下为 AS3 原始怪物（按 CP 升序，共 82 种）
  // ═══════════════════════════════════════════════

  // === CP 70 ~ 200 ===
  md('Young_Raccoon', '小浣熊', 10, 1, 3, 0, 0, 5, 150, 30, 70),
  md('Young_Gray_Raccoon', '小灰浣熊', 20, 2, 4, 2, 3, 10, 150, 50, 80),
  md('Young_Brown_Fox', '小棕狐狸', 20, 2, 5, 2, 3, 10, 150, 50, 90),
  md('White_Spiderling', '小白蜘蛛', 30, 5, 10, 2, 3, 20, 200, 50, 96),
  md('White_Spider', '白蜘蛛', 50, 5, 10, 5, 5, 30, 200, 50, 105),
  md('Brown_Fox', '棕狐狸', 50, 5, 10, 10, 2, 20, 150, 50, 110),
  md('Young_Red_Fox', '小红狐狸', 70, 5, 10, 10, 5, 20, 150, 50, 120),
  md('Raccoon', '浣熊', 100, 20, 25, 10, 5, 30, 150, 50, 135),
  md('Old_Mimic', '大嘴兽', 120, 10, 40, 10, 5, 80, 250, 50, 145),
  md('Red_Spiderling', '小红蜘蛛', 130, 10, 50, 10, 5, 30, 150, 50, 160),
  md('Young_Gray_Fox', '小灰狐狸', 140, 1, 60, 10, 15, 30, 150, 50, 189),
  md('Black_Town_Rat', '黑鼠', 80, 10, 15, 15, 5, 20, 150, 50, 190),
  md('Brown_Town_Rat', '棕鼠', 80, 15, 25, 10, 15, 30, 150, 50, 200),

  // === CP 200 ~ 500 ===
  md('Giant_Spiderling', '巨型蜘蛛', 150, 10, 30, 20, 15, 40, 150, 50, 220),
  md('Red_Fox', '红狐狸', 200, 20, 35, 15, 15, 40, 150, 50, 250),
  md('White_Kiwi', '白头鸟', 400, 30, 45, 10, 25, 40, 150, 50, 270),
  md('Black_Kiwi', '黑翅鸟', 300, 30, 35, 30, 15, 40, 150, 50, 290),
  md('Green_Kiwi', '绿翼鸟', 250, 50, 85, 10, 5, 100, 250, 50, 300),
  md('Gold_Kiwi', '黄金鸟', 350, 40, 45, 10, 5, 40, 150, 50, 330),
  md('Old_Sand_Mimic', '吞噬兽', 300, 10, 100, 10, 25, 40, 150, 50, 340),
  md('Young_Goblin', '小哥布林', 400, 10, 60, 10, 25, 40, 150, 50, 350),
  md('Dingo', '野狗', 200, 60, 150, 10, 15, 40, 150, 50, 370),
  md('Small_Ice_Worm', '小天冰蚕', 300, 50, 55, 50, 5, 40, 150, 50, 400),
  md('Stone_Mimic', '拟石者', 350, 50, 55, 10, 50, 40, 150, 50, 420),
  md('Young_Poison_Goblin', '小毒化哥布林', 500, 50, 55, 20, 15, 40, 150, 50, 440),
  md('Brown_tailed_Mongoose', '棕尾猫鼬', 350, 70, 95, 10, 25, 100, 250, 50, 450),
  md('White_Ant_Lion', '蚁狮', 330, 40, 65, 50, 45, 20, 150, 50, 489),

  // === CP 500 ~ 800 ===
  md('Cave_Rat', '洞鼠', 300, 70, 105, 10, 5, 100, 350, 50, 500),
  md('Goblin', '哥布林', 400, 40, 95, 30, 15, 40, 150, 50, 510),
  md('Mimic', '模仿者', 500, 40, 85, 20, 25, 40, 150, 50, 520),
  md('Masked_Goblin', '谜之哥布林', 400, 50, 65, 20, 15, 50, 150, 50, 540),
  md('Black_Aardvark', '暗黑食蚁兽', 400, 70, 75, 30, 25, 50, 150, 50, 590),
  md('Black_Wolf', '黑狼', 520, 80, 85, 30, 15, 60, 150, 50, 600),
  md('Brown_Dire_Wolf', '棕土狼', 570, 50, 115, 20, 25, 50, 150, 50, 640),
  md('Young_Brown_Warg', '棕野狼', 470, 110, 115, 30, 15, 50, 150, 50, 660),
  md('Bandersnatch', '巨灵', 470, 50, 135, 40, 25, 50, 150, 50, 679),
  md('Blue_Snake', '寒炎蛇', 870, 90, 115, 40, 25, 60, 150, 50, 700),
  md('Kobold', '科多兽', 1070, 130, 150, 40, 25, 60, 150, 50, 750),
  md('Rat_Man', '鼠人', 970, 130, 155, 20, 35, 60, 150, 50, 760),
  md('Red_Spider', '赤血蜘蛛', 1200, 110, 140, 30, 35, 60, 150, 50, 800),

  // === CP 800 ~ 1200 ===
  md('White_Hair_Llama', '白发血马', 1000, 140, 165, 40, 15, 70, 150, 50, 850),
  md('Kobold_Bandit', '地精劫持者', 1000, 100, 155, 60, 5, 70, 150, 50, 860),
  md('Coyote', '暴动者', 800, 100, 150, 10, 10, 170, 150, 50, 870),
  md('Zombie_Soldier', '僵尸士兵', 900, 150, 155, 20, 20, 100, 150, 50, 900),
  md('White_Bear', '白熊', 700, 100, 150, 20, 15, 70, 150, 50, 930),
  md('Maned_Aardvark', '鬃毛食蚁兽', 750, 80, 125, 70, 55, 70, 150, 50, 940),
  md('Stone_Hound', '石化者', 790, 200, 215, 0, 0, 220, 350, 50, 954),
  md('Goblin_Keeper', '哥布林守护者', 870, 100, 150, 50, 35, 70, 150, 50, 960),
  md('Bard_Skeleton', '吟游骷髅', 970, 100, 125, 40, 35, 80, 150, 50, 989),
  md('Burgundy_Spider', '血色天狼蛛', 780, 100, 255, 10, 15, 150, 250, 50, 1000),
  md('Giant_Forest_Rat', '巨魔鼠', 1230, 100, 150, 40, 35, 80, 150, 50, 1040),
  md('Gold_Goblin', '黄金哥布林', 1150, 100, 175, 50, 35, 80, 150, 50, 1050),
  md('Gold_Kobold', '黄金食蚁兽', 1200, 100, 157, 70, 55, 80, 150, 50, 1100),
  md('Gray_Gremlin', '阴霾小鬼', 1370, 120, 150, 50, 25, 80, 150, 50, 1140),
  md('Young_Lungfish', '地肺鱼', 290, 310, 415, 0, 35, 220, 250, 50, 1160),

  // === CP 1200 ~ 1600 ===
  md('Jackal', '豺狼', 870, 210, 215, 100, 5, 80, 150, 50, 1200),
  md('Stripeless_Hyena', '斑纹土狗', 590, 210, 315, 10, 75, 120, 150, 50, 1240),
  md('Phantom_Silver_Tableware', '幻影战士', 1000, 110, 135, 50, 55, 80, 150, 50, 1250),
  md('Stone_Mask', '土元素', 1600, 150, 215, 100, 15, 80, 150, 50, 1250),
  md('Dragonfly', '龙蝇', 1800, 150, 215, 100, 5, 80, 150, 50, 1290),
  md('Imp', '小恶魔', 1800, 160, 215, 10, 75, 80, 150, 50, 1300),
  md('Ice_Sprite', '冰精灵', 1900, 160, 215, 20, 85, 80, 150, 50, 1350),
  md('Lightning_Sprite', '雷精灵', 2000, 210, 215, 50, 45, 80, 150, 50, 1400),
  md('Red_Lynx', '红猞猁', 2000, 180, 215, 10, 55, 80, 150, 50, 1400),
  md('Skeleton', '玉骷髅', 2000, 190, 215, 30, 25, 80, 150, 50, 1400),
  md('Candle_Warrior', '浴血武者', 2070, 210, 215, 120, 5, 80, 150, 50, 1450),
  md('Guardian_Horse_of_Ruins', '毁灭守卫', 2570, 210, 215, 120, 5, 80, 150, 50, 1450),
  md('Gorgon', '蛇发女怪', 4040, 130, 200, 50, 85, 80, 150, 50, 1550),
  md('Stone_Horse', '石象鬼', 2590, 160, 215, 80, 5, 90, 150, 50, 1550),
  md('Topaz_Beetle', '灯怪', 3470, 150, 200, 80, 15, 90, 150, 50, 1550),
  md('Brown_Bear', '棕熊', 1500, 100, 300, 200, 85, 20, 150, 50, 1550),
  md('Red_Kobold', '噬血兽', 2000, 100, 315, 10, 5, 200, 250, 50, 1550),
  md('Stone_Zombie', '硬化僵尸', 4000, 100, 150, 100, 5, 100, 150, 50, 1600),

  // === CP 1600 ~ 2100 ===
  md('Long_Horn_Gnu', '树妖', 4000, 150, 265, 40, 25, 80, 150, 50, 1650),
  md('Shrieker', '花妖', 2800, 200, 215, 40, 25, 90, 150, 50, 1670),
  md('Black_Buffalo', '黑魔导', 3000, 150, 255, 10, 45, 100, 150, 50, 1700),
  md('Wisp', '小精灵', 6000, 290, 305, 90, 45, 90, 150, 50, 1700),
  md('Saturos', '石虎', 7000, 300, 405, 40, 70, 80, 150, 50, 1740),
  md('Skeleton_Ghost', '骷髅幽魂', 9030, 300, 405, 130, 5, 90, 150, 50, 1800),
  md('Guardian_of_Ruins', '马面', 8070, 10, 600, 150, 5, 100, 150, 50, 1850),
  md('Black_Succubus', '牛头', 5040, 100, 905, 300, 5, 190, 150, 50, 1900),
  md('Giant_Spider', '天兵', 3520, 320, 515, 300, 55, 100, 150, 50, 1900),
  md('Stone_Horse_Keeper', '蛤蟆精', 7070, 300, 515, 210, 5, 100, 150, 50, 1900),
  md('Troll', '蛇妖', 10070, 510, 715, 20, 45, 100, 150, 50, 2000),
  md('Gnoll', '蝎子精', 12030, 500, 815, 10, 55, 100, 150, 50, 2010),
  md('Magic_Golem', '蛟龙', 12000, 600, 805, 10, 65, 100, 150, 50, 2020),
  md('Captain_Skeleton', '风伯', 14000, 500, 905, 10, 75, 100, 150, 50, 2030),
  md('Green_Snake', '芙蓉仙子', 7000, 1000, 1505, 10, 25, 200, 150, 50, 2100),

  // === CP 2100 ~ 3500 ===
  md('Lost_Sahuagin', '大力金刚', 30040, 600, 1000, 300, 35, 100, 150, 50, 2200),
  md('Hippo', '雾中仙', 40000, 300, 1200, 300, 35, 100, 150, 50, 2300),
  md('Brown_Ixion', '噬天虎', 30000, 400, 1300, 200, 25, 150, 200, 50, 2300),
  md('Incubus', '净瓶女娲', 35000, 400, 1115, 10, 45, 90, 150, 50, 2400),
  md('Zombie', '鬼将', 35000, 500, 1305, 10, 55, 100, 150, 50, 2550),
  md('Bisque_Doll', '地狱战神', 37000, 700, 1005, 10, 65, 100, 150, 50, 2700),
  md('Ogre', '狐狸精', 20000, 500, 1500, 10, 55, 120, 150, 50, 2800),
  md('Esras', '巴古贡', 19990, 800, 1405, 10, 5, 320, 350, 50, 2900),
  md('Ogre_Warrior', '魔战士', 50000, 1000, 1215, 10, 5, 220, 250, 50, 3050),
  md('Giant_Ogre', '巨灵', 20000, 1000, 1800, 110, 55, 100, 150, 50, 3100),
  md('Siren', '活死人', 8000, 1400, 2100, 310, 95, 100, 150, 50, 3200),
  md('Lion', '天狮', 50000, 1000, 1899, 10, 25, 150, 250, 50, 3300),
  md('Balrog', '巴洛克', 70000, 1200, 1600, 10, 35, 120, 250, 50, 3400),
  md('Cyclops', '独眼巨人', 75900, 1300, 1500, 10, 45, 120, 250, 50, 3440),
  md('Argus', '百眼巨人', 59070, 1, 3000, 10, 55, 120, 250, 50, 3500),

  // === CP 3500 ~ 5500 ===
  md('Grendel', '格伦德尔', 90070, 2000, 2015, 400, 5, 120, 250, 50, 3650),
  md('Cloaker', '蛰伏伪怪', 40070, 2010, 2215, 610, 5, 120, 250, 50, 3760),
  md('Wight', '尸妖', 99999, 1500, 2005, 50, 35, 120, 250, 50, 3900),
  md('Ghost_Cloaker', '魂使者', 99999, 1500, 2005, 10, 35, 120, 150, 50, 4000),
  md('Black_Warrior', '黑武士', 99999, 1500, 2225, 10, 35, 120, 150, 50, 4000),
  md('Pink_Succubus', '樱花女妖', 99999, 1660, 2215, 10, 35, 120, 150, 50, 4300),
  md('Spider_Warrior', '蜘蛛人', 100000, 2000, 2315, 10, 35, 120, 150, 50, 4500),
  md('Head_Hyena', '噬脑者', 100000, 2110, 2315, 10, 45, 120, 150, 50, 5000),
  md('Hellcat', '地狱守护者', 150000, 2110, 2415, 10, 45, 120, 150, 50, 5500),

  // === CP 5500 ~ 10000 ===
  md('Salamander', '溶岩蜥蜴', 120000, 2210, 2415, 10, 45, 120, 150, 50, 6500),
  md('Banshee', '魅惑女妖', 30000, 2210, 3015, 410, 125, 120, 150, 50, 6500),
  md('Ruairi', '虚空守卫', 120000, 2010, 2555, 10, 35, 120, 150, 50, 7500),
  md('Yeti', '神灵', 50000, 2210, 3315, 10, 45, 20, 150, 50, 7500),
  md('Mammoth', '宙斯', 150000, 2010, 2515, 110, 55, 120, 150, 50, 8000),
  md('Giant_Sand_Worm', '深渊武士', 70000, 2010, 2515, 100, 55, 120, 150, 50, 9000),
  md('Ifrit', '恐怖利刃', 270000, 2010, 3015, 210, 75, 120, 150, 50, 10000),

  // === CP 10000+ (神话级) ===
  md('Prairie_Dragon', '空间掌控者', 300000, 3010, 4005, 10, 125, 150, 150, 50, 22000),
  md('Giant_Lion', '时间掌控者', 500000, 4010, 5515, 510, 45, 150, 150, 50, 25000),
  md('Arc_Lich', '永生神王', 700000, 5510, 6615, 1000, 25, 250, 150, 50, 27000),
  md('Desert_Dragon', '世纪之龙', 900000, 5010, 8015, 600, 95, 250, 250, 90, 30000),
];

// ═══ 怪物 CP → 名字映射辅助 ═══

export function getMonsterByCP(cp: number): MonsterData | undefined {
  return MonsterList.find(m => m.CP === cp);
}

export function getMonsterByName(name: string): MonsterData | undefined {
  return MonsterList.find(m => m.name === name);
}

// ═══ 装备/武器静态数据 ═══
// AS3 原始: iData.iItem.EquipmentData + WeaponData + EquipmentList + StatList + RangeStat
//
// 包含所有装备基础定义、属性范围列表。

import type { EquipmentData, WeaponData, RangeStatData } from '../types';
import { Stat, EquipSlot, EquipType, WeaponCategory } from '../constants';

// ═══ 范围属性(生成装备时使用) ═══
// AS3 原始: iData.iItem.RangeStat

export function rangeStat(name: string, valueMin: number, changeRange: number): RangeStatData {
  return { name, valueMin, changeRange };
}

// ═══ 属性列表(装备品质随机属性池) ═══
// AS3 原始: iData.iItem.StatList

export const StatList: RangeStatData[] = [
  rangeStat(Stat.hp, 10, 20),
  rangeStat(Stat.mp, 5, 15),
  rangeStat(Stat.str, 1, 5),
  rangeStat(Stat.dex, 1, 5),
  rangeStat(Stat.intelligence, 1, 5),
  rangeStat(Stat.will, 1, 5),
  rangeStat(Stat.luck, 1, 5),
  rangeStat(Stat.attackMin, 2, 8),
  rangeStat(Stat.attackMax, 2, 8),
  rangeStat(Stat.defence, 3, 10),
  rangeStat(Stat.protection, 1, 5),
  rangeStat(Stat.crit, 1, 8),
  rangeStat(Stat.crit_mul, 5, 30),
  rangeStat(Stat.balance, 2, 10),
  rangeStat(Stat.spellChance, 1, 5),
  rangeStat(Stat.magicDamage, 2, 10),
  rangeStat(Stat.protectionIgnore, 1, 3),
];

// ═══ 装备/武器列表 ═══
// AS3 原始: iData.iItem.EquipmentList

export const EquipmentList: (EquipmentData | WeaponData)[] = [
  // === 武器 ===
  {
    name: 'sword', realName: '剑', type: 'sword', position: 'one-handed',
    category: WeaponCategory.MELEE,
    stat: [rangeStat(Stat.attackMin, 5, 15), rangeStat(Stat.attackMax, 8, 20)],
    qualityStat: [rangeStat(Stat.str, 1, 5), rangeStat(Stat.crit, 1, 5)],
    sortWeight: 1, price: 50
  } as WeaponData,
  {
    name: 'axe', realName: '斧', type: 'axe', position: 'one-handed',
    category: WeaponCategory.MELEE,
    stat: [rangeStat(Stat.attackMin, 3, 12), rangeStat(Stat.attackMax, 12, 28)],
    qualityStat: [rangeStat(Stat.str, 2, 6), rangeStat(Stat.crit_mul, 5, 20)],
    sortWeight: 2, price: 55
  } as WeaponData,
  {
    name: 'bow', realName: '弓', type: 'bow', position: 'two-handed',
    category: WeaponCategory.RANGED,
    stat: [rangeStat(Stat.attackMin, 6, 16), rangeStat(Stat.attackMax, 8, 18)],
    qualityStat: [rangeStat(Stat.dex, 2, 5), rangeStat(Stat.balance, 2, 8)],
    sortWeight: 3, price: 60
  } as WeaponData,
  {
    name: 'crossbow', realName: '弩', type: 'crossbow', position: 'two-handed',
    category: WeaponCategory.RANGED,
    stat: [rangeStat(Stat.attackMin, 8, 18), rangeStat(Stat.attackMax, 6, 15)],
    qualityStat: [rangeStat(Stat.dex, 1, 5), rangeStat(Stat.crit, 2, 6)],
    sortWeight: 4, price: 65
  } as WeaponData,
  {
    name: 'sceptre', realName: '权杖', type: 'sceptre', position: 'two-handed',
    category: WeaponCategory.MELEE,
    stat: [rangeStat(Stat.attackMin, 4, 10), rangeStat(Stat.attackMax, 10, 25)],
    qualityStat: [rangeStat(Stat.intelligence, 2, 6), rangeStat(Stat.magicDamage, 2, 10)],
    sortWeight: 5, price: 70
  } as WeaponData,
  {
    name: 'staff', realName: '法杖', type: 'staff', position: 'two-handed',
    category: WeaponCategory.MELEE,
    stat: [rangeStat(Stat.attackMin, 3, 8), rangeStat(Stat.attackMax, 8, 20)],
    qualityStat: [rangeStat(Stat.intelligence, 2, 6), rangeStat(Stat.spellChance, 1, 5)],
    sortWeight: 6, price: 75
  } as WeaponData,
  {
    name: 'tome', realName: '魔法书', type: 'tome', position: 'two-handed',
    category: WeaponCategory.MELEE,
    stat: [rangeStat(Stat.attackMin, 4, 12), rangeStat(Stat.attackMax, 10, 22)],
    qualityStat: [rangeStat(Stat.intelligence, 3, 7), rangeStat(Stat.magicDamage, 3, 12)],
    sortWeight: 7, price: 80
  } as WeaponData,
  {
    name: 'shield', realName: '盾牌', type: 'shield', position: 'off hand',
    category: WeaponCategory.MELEE,
    stat: [rangeStat(Stat.defence, 5, 15), rangeStat(Stat.protection, 2, 8)],
    qualityStat: [rangeStat(Stat.hp, 10, 20), rangeStat(Stat.protection, 1, 5)],
    sortWeight: 8, price: 60
  } as WeaponData,
  {
    name: 'dagger', realName: '匕首', type: 'dagger', position: 'off hand',
    category: WeaponCategory.MELEE,
    stat: [rangeStat(Stat.attackMin, 3, 8), rangeStat(Stat.attackMax, 5, 12)],
    qualityStat: [rangeStat(Stat.crit, 3, 8), rangeStat(Stat.balance, 3, 10)],
    sortWeight: 9, price: 45
  } as WeaponData,

  // === 身体护甲 ===
  {
    name: 'suit', realName: '布衣', type: EquipType.LIGHT, position: EquipSlot.BODY,
    stat: [rangeStat(Stat.hp, 10, 20), rangeStat(Stat.mp, 5, 15)],
    qualityStat: [rangeStat(Stat.intelligence, 1, 4), rangeStat(Stat.spellChance, 1, 3)],
    sortWeight: 10, price: 40
  },
  {
    name: 'jerkin', realName: '皮甲', type: EquipType.MEDIUM, position: EquipSlot.BODY,
    stat: [rangeStat(Stat.hp, 15, 30), rangeStat(Stat.defence, 3, 8)],
    qualityStat: [rangeStat(Stat.dex, 1, 4), rangeStat(Stat.balance, 2, 6)],
    sortWeight: 11, price: 55
  },
  {
    name: 'breastplate', realName: '板甲', type: EquipType.HEAVY, position: EquipSlot.BODY,
    stat: [rangeStat(Stat.hp, 20, 40), rangeStat(Stat.defence, 5, 12)],
    qualityStat: [rangeStat(Stat.str, 1, 4), rangeStat(Stat.protection, 1, 4)],
    sortWeight: 12, price: 70
  },

  // === 头部护甲 ===
  {
    name: 'fur_hat', realName: '毛皮帽', type: EquipType.LIGHT, position: EquipSlot.HEAD,
    stat: [rangeStat(Stat.hp, 5, 12), rangeStat(Stat.mp, 3, 10)],
    qualityStat: [rangeStat(Stat.intelligence, 1, 3), rangeStat(Stat.luck, 1, 3)],
    sortWeight: 13, price: 30
  },
  {
    name: 'felt_hat', realName: '毡帽', type: EquipType.MEDIUM, position: EquipSlot.HEAD,
    stat: [rangeStat(Stat.hp, 8, 18), rangeStat(Stat.defence, 2, 6)],
    qualityStat: [rangeStat(Stat.dex, 1, 3), rangeStat(Stat.crit, 1, 4)],
    sortWeight: 14, price: 40
  },
  {
    name: 'helm', realName: '头盔', type: EquipType.HEAVY, position: EquipSlot.HEAD,
    stat: [rangeStat(Stat.hp, 12, 25), rangeStat(Stat.defence, 4, 10)],
    qualityStat: [rangeStat(Stat.str, 1, 3), rangeStat(Stat.protection, 1, 3)],
    sortWeight: 15, price: 55
  },

  // === 脚部护甲 ===
  {
    name: 'Shoes', realName: '布鞋', type: EquipType.LIGHT, position: EquipSlot.FEET,
    stat: [rangeStat(Stat.hp, 4, 10), rangeStat(Stat.dex, 1, 3)],
    qualityStat: [rangeStat(Stat.balance, 2, 5), rangeStat(Stat.luck, 1, 3)],
    sortWeight: 16, price: 25
  },
  {
    name: 'Boots', realName: '靴子', type: EquipType.MEDIUM, position: EquipSlot.FEET,
    stat: [rangeStat(Stat.hp, 6, 15), rangeStat(Stat.defence, 2, 5)],
    qualityStat: [rangeStat(Stat.dex, 1, 3), rangeStat(Stat.crit, 1, 4)],
    sortWeight: 17, price: 35
  },
  {
    name: 'Greaves', realName: '护胫', type: EquipType.HEAVY, position: EquipSlot.FEET,
    stat: [rangeStat(Stat.hp, 10, 20), rangeStat(Stat.defence, 3, 8)],
    qualityStat: [rangeStat(Stat.str, 1, 3), rangeStat(Stat.protection, 1, 3)],
    sortWeight: 18, price: 50
  },

  // === 饰品 ===
  {
    name: 'necklace', realName: '项链', type: EquipType.ACCESORY, position: EquipSlot.NECKLACE,
    stat: [rangeStat(Stat.hp, 5, 15), rangeStat(Stat.mp, 3, 10)],
    qualityStat: [rangeStat(Stat.luck, 1, 5), rangeStat(Stat.spellChance, 1, 4)],
    sortWeight: 19, price: 60
  },
  {
    name: 'ring', realName: '戒指', type: EquipType.ACCESORY, position: EquipSlot.RING,
    stat: [rangeStat(Stat.attackMin, 1, 5), rangeStat(Stat.attackMax, 1, 5)],
    qualityStat: [rangeStat(Stat.crit, 1, 6), rangeStat(Stat.crit_mul, 5, 15)],
    sortWeight: 20, price: 65
  },
];

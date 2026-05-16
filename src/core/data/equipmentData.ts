// 装备/武器静态数据。
// AS3 原始: iData.iItem.EquipmentData + WeaponData + EquipmentList + StatList + RangeStat

import type { EquipmentData, RangeStatData, StatData, WeaponData } from '../types';
import { EquipSlot, EquipType, Stat, WeaponCategory, WeaponHand } from '../constants';

// AS3 原始: iData.iItem.RangeStat
export function rangeStat(name: string, valueMin: number, changeRange: number): RangeStatData {
  return { name, valueMin, changeRange };
}

// AS3 原始: iData.iItem.Stat
function stat(name: string, value: number): StatData {
  return { name, value };
}

// AS3 原始: iData.iItem.StatList
export const StatList: StatData[] = [
  stat(Stat.hp, 5),
  stat(Stat.mp, 5),
  stat(Stat.attackMin, 2),
  stat(Stat.attackMax, 2),
  stat(Stat.str, 3),
  stat(Stat.dex, 3),
  stat(Stat.intelligence, 3),
  stat(Stat.will, 3),
  stat(Stat.luck, 1),
  stat(Stat.defence, 1),
  stat(Stat.protection, 1),
  stat(Stat.crit, 1),
  stat(Stat.crit_mul, 1),
  stat(Stat.magicDamage, 1),
  stat(Stat.protectionIgnore, 1),
  stat(Stat.spellChance, 0.5),
  stat(Stat.balance, 1),
];

// AS3 原始: iData.iItem.EquipmentList
export const EquipmentList: (EquipmentData | WeaponData)[] = [
  { position: WeaponHand.ONEHAND, type: "sword", name: "sword", realName: "剑", stat: [rangeStat(Stat.attackMin, 10, 10), rangeStat(Stat.attackMax, 16, 16), rangeStat(Stat.balance, 30, 3), rangeStat(Stat.crit, 15, 3)], category: WeaponCategory.MELEE, sortWeight: 1 } as WeaponData,
  { position: WeaponHand.TWOHAND, type: "axe", name: "axe", realName: "斧", stat: [rangeStat(Stat.attackMin, 5, 5), rangeStat(Stat.attackMax, 24, 24), rangeStat(Stat.balance, 15, 3), rangeStat(Stat.crit, 15, 3)], category: WeaponCategory.MELEE, sortWeight: 2 } as WeaponData,
  { position: WeaponHand.TWOHAND, type: "bow", name: "bow", realName: "弓", stat: [rangeStat(Stat.attackMin, 5, 5), rangeStat(Stat.attackMax, 10, 10), rangeStat(Stat.balance, 30, 3), rangeStat(Stat.crit, 30, 3)], category: WeaponCategory.RANGED, sortWeight: 3 } as WeaponData,
  { position: WeaponHand.TWOHAND, type: "crossbow", name: "crossbow", realName: "弩", stat: [rangeStat(Stat.attackMin, 10, 10), rangeStat(Stat.attackMax, 16, 16), rangeStat(Stat.balance, 15, 3), rangeStat(Stat.crit, 30, 3)], category: WeaponCategory.RANGED, sortWeight: 4 } as WeaponData,
  { position: WeaponHand.ONEHAND, type: "sceptre", name: "sceptre", realName: "权杖", stat: [rangeStat(Stat.attackMin, 10, 10), rangeStat(Stat.attackMax, 16, 16), rangeStat(Stat.balance, 15, 3), rangeStat(Stat.crit, 5, 3)], category: WeaponCategory.MELEE, sortWeight: 5 } as WeaponData,
  { position: WeaponHand.TWOHAND, type: "staff", name: "staff", realName: "法杖", stat: [rangeStat(Stat.attackMin, 10, 10), rangeStat(Stat.attackMax, 16, 16), rangeStat(Stat.balance, 30, 3), rangeStat(Stat.crit, 15, 3)], category: WeaponCategory.MELEE, sortWeight: 6 } as WeaponData,
  { position: WeaponHand.OFFHAND, type: "tome", name: "tome", realName: "书", stat: [rangeStat(Stat.mp, 10, 10), rangeStat(Stat.defence, 1, 4)], category: WeaponCategory.MELEE, sortWeight: 7 } as WeaponData,
  { position: WeaponHand.OFFHAND, type: "shield", name: "shield", realName: "盾", stat: [rangeStat(Stat.defence, 1, 4), rangeStat(Stat.protection, 1, 4)], category: WeaponCategory.MELEE, sortWeight: 8 } as WeaponData,
  { position: WeaponHand.OFFHAND, type: "dagger", name: "dagger", realName: "匕首", stat: [rangeStat(Stat.attackMin, 5, 5), rangeStat(Stat.attackMax, 8, 8), rangeStat(Stat.crit, 5, 3)], category: WeaponCategory.MELEE, sortWeight: 9 } as WeaponData,
  { position: EquipSlot.BODY, type: EquipType.LIGHT, name: "suit", realName: "布衣", stat: [rangeStat(Stat.defence, 1, 4), rangeStat(Stat.protection, 1, 2)], sortWeight: 10 },
  { position: EquipSlot.BODY, type: EquipType.MEDIUM, name: "jerkin", realName: "皮衣", stat: [rangeStat(Stat.defence, 1, 2), rangeStat(Stat.protection, 1, 4)], sortWeight: 11 },
  { position: EquipSlot.BODY, type: EquipType.HEAVY, name: "breastplate", realName: "铠甲", stat: [rangeStat(Stat.defence, 1, 3), rangeStat(Stat.protection, 1, 3)], sortWeight: 12 },
  { position: EquipSlot.HEAD, type: EquipType.LIGHT, name: "fur hat", realName: "布帽", stat: [rangeStat(Stat.defence, 1, 4), rangeStat(Stat.protection, 1, 2)], sortWeight: 13 },
  { position: EquipSlot.HEAD, type: EquipType.MEDIUM, name: "felt hat", realName: "皮帽", stat: [rangeStat(Stat.defence, 1, 2), rangeStat(Stat.protection, 1, 4)], sortWeight: 14 },
  { position: EquipSlot.HEAD, type: EquipType.HEAVY, name: "helm", realName: "头盔", stat: [rangeStat(Stat.defence, 1, 3), rangeStat(Stat.protection, 1, 3)], sortWeight: 15 },
  { position: EquipSlot.FEET, type: EquipType.LIGHT, name: "Shoes", realName: "布鞋", stat: [rangeStat(Stat.defence, 1, 4), rangeStat(Stat.protection, 1, 2)], sortWeight: 16 },
  { position: EquipSlot.FEET, type: EquipType.MEDIUM, name: "Boots", realName: "皮鞋", stat: [rangeStat(Stat.defence, 1, 2), rangeStat(Stat.protection, 1, 4)], sortWeight: 17 },
  { position: EquipSlot.FEET, type: EquipType.HEAVY, name: "Greaves", realName: "铁靴", stat: [rangeStat(Stat.defence, 1, 3), rangeStat(Stat.protection, 1, 3)], sortWeight: 18 },
  { position: EquipSlot.NECKLACE, type: EquipType.ACCESORY, name: "necklace", realName: "项链", stat: [], sortWeight: 19 },
  { position: EquipSlot.RING, type: EquipType.ACCESORY, name: "ring", realName: "戒指", stat: [], sortWeight: 20 },
];

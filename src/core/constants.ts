// ═══ 属性名称常量 ═══
// AS3 原始: iData.iItem.Stat（静态常量部分）

export const Stat = {
  ATTACK: 'ATTACK' as const,
  hp: 'hp' as const,
  mp: 'mp' as const,
  str: 'str' as const,
  dex: 'dex' as const,
  intelligence: 'intelligence' as const,
  will: 'will' as const,
  luck: 'luck' as const,
  attackMin: 'attackMin' as const,
  attackMax: 'attackMax' as const,
  balance: 'balance' as const,
  crit: 'crit' as const,
  crit_mul: 'crit_mul' as const,
  defence: 'defence' as const,
  protection: 'protection' as const,
  spellChance: 'spellChance' as const,
  manaConsumption: 'manaConsumption' as const,
  protectionIgnore: 'protectionIgnore' as const,
  protectionReduce: 'protectionReduce' as const,
  magicDamage: 'magicDamage' as const,
} as const;

// ═══ 属性中文翻译映射 ═══
// AS3 原始: iData.iItem.Stat.statTranslate() / iData.iMonster.StatMul.statTranslate()
// 用于怪物头衔描述、装备描述等处的属性名中文化

export function statTranslate(name: string): string {
  switch (name) {
    case Stat.intelligence: return '智力';
    case Stat.attackMin: return '最小攻击';
    case Stat.attackMax: return '最大攻击';
    case Stat.ATTACK: return '攻击';
    case Stat.crit_mul: return '暴击倍数';
    case Stat.spellChance: return '释放概率';
    case Stat.protectionIgnore: return '无视护甲';
    case Stat.protectionReduce: return '降低护甲';
    case Stat.magicDamage: return '魔法伤害';
    case Stat.str: return '力量';
    case Stat.dex: return '敏捷';
    case Stat.will: return '意志';
    case Stat.luck: return '幸运';
    case Stat.balance: return '平衡';
    case Stat.crit: return '暴击';
    case Stat.defence: return '防御';
    case Stat.protection: return '护甲';
    case Stat.hp: return '生命';
    case Stat.mp: return '魔法';
    default: return name;
  }
}

// ═══ 装备部位常量 ═══
// AS3 原始: iData.iItem.Equipment（静态常量）

export const EquipSlot = {
  HEAD: 'head' as const,
  BODY: 'body' as const,
  FEET: 'feet' as const,
  NECKLACE: 'necklace' as const,
  RING: 'ring' as const,
} as const;

// ═══ 武器手持类型常量 ═══
// AS3 原始: iData.iItem.Weapon（静态常量）

export const WeaponHand = {
  ONEHAND: 'one-handed' as const,
  OFFHAND: 'off hand' as const,
  TWOHAND: 'two-handed' as const,
} as const;

// ═══ 武器类别常量 ═══
// AS3 原始: iData.iItem.WeaponCategory

export const WeaponCategory = {
  MELEE: 'melee' as const,
  RANGED: 'ranged' as const,
  MAGIC: 'magic' as const,
  ALL: 'all' as const,
} as const;

// ═══ 装备类型常量 ═══
// AS3 原始: iData.iItem.EquipType

export const EquipType = {
  LIGHT: 'light' as const,
  MEDIUM: 'medium' as const,
  HEAVY: 'heavy' as const,
  ACCESORY: 'accesory' as const,
} as const;

// ═══ 装备类型 BASE 升级加成向量 ═══
// AS3 原始: EquipType.HEAVY_BASE / MEDIUM_BASE / LIGHT_BASE / ACCESORY_BASE
// 武器/护甲升级时按此基准值 × pow(系数, 等级-1) × (1 + 0.2*品质) 计算 levelStat

export const EquipTypeBase: Record<string, Array<{ name: string; value: number }>> = {
  [EquipType.HEAVY]: [
    { name: Stat.defence, value: 2 },
    { name: Stat.protection, value: 1 },
  ],
  [EquipType.MEDIUM]: [
    { name: Stat.hp, value: 5 },
    { name: Stat.protection, value: 1 },
  ],
  [EquipType.LIGHT]: [
    { name: Stat.hp, value: 5 },
    { name: Stat.defence, value: 2 },
  ],
  [EquipType.ACCESORY]: [],
};

// ═══ 武器类型 BASE 升级加成向量 ═══
// AS3 原始: WeaponType.SWORD_BASE / AXE_BASE / BOW_BASE / CROSSBOW_BASE
//          / STAFF_BASE / SCEPTRE_BASE / DAGGER_BASE / SHIELD_BASE / TOME_BASE

export const WeaponTypeBase: Record<string, Array<{ name: string; value: number }>> = {
  sword: [
    { name: Stat.ATTACK, value: 2.5 },
    { name: Stat.crit, value: 2 },
  ],
  axe: [
    { name: Stat.ATTACK, value: 4 },
    { name: Stat.hp, value: 5 },
  ],
  bow: [
    { name: Stat.ATTACK, value: 3 },
    { name: Stat.protectionIgnore, value: 1 },
  ],
  crossbow: [
    { name: Stat.ATTACK, value: 4 },
    { name: Stat.crit_mul, value: 3 },
  ],
  staff: [
    { name: Stat.mp, value: 5 },
    { name: Stat.magicDamage, value: 1 },
  ],
  sceptre: [
    { name: Stat.ATTACK, value: 2 },
    { name: Stat.mp, value: 5 },
  ],
  dagger: [
    { name: Stat.crit_mul, value: 3 },
  ],
  shield: [
    { name: Stat.defence, value: 3 },
  ],
  tome: [
    { name: Stat.spellChance, value: 0.3 },
  ],
};

// ═══ 技能类型常量 ═══
// AS3 原始: iData.iSkill.SkillType

export const SkillType = {
  ATTACK: 'attack' as const,
  DEFENCE: 'defence' as const,
  PASSIVE: 'passive' as const,
} as const;

// ═══ 技能类别常量 ═══
// AS3 原始: iData.iSkill.SkillCategory

export const SkillCategory = {
  MELEE: 'melee' as const,
  RANGED: 'ranged' as const,
  MAGIC: 'magic' as const,
  ALL: 'all' as const,
} as const;

// ═══ 宠物类型常量 ═══
// AS3 原始: iData.iPet.PetTypeList

export const PetTypes = [
  'rat', 'spider', 'wolf', 'bear', 'goblin',
  'skeleton', 'zombie', 'ghost', 'fox',
  'unicorn', 'dragon', 'slime'
] as const;

// ═══ 装备品质颜色常量 ═══
// AS3 原始: iData.iItem.Equipment（静态颜色常量）

export const QualityColor: Record<number, string> = {
  0: '#c8c8d4',
  1: '#4a60d7',
  2: '#a6a500',
  3: '#ff7100',
  4: '#9840be',
  5: '#ff4040',
};

// ═══ 装备品质名称 ═══

export const QualityName: Record<number, string> = {
  0: '普通',
  1: '魔法',
  2: '稀有',
  3: '精良',
  4: '史诗',
  5: '传说',
};

// ═══ 怪物强度颜色 ═══
// AS3 原始: iData.iMonster.Monster（静态颜色常量）

export const MonsterStrengthColor: Record<string, string> = {
  WEAKEST: '#EE6b9c',
  WEAK: '#BC38d3',
  NORMAL: '#bf7130',
  STRONG: '#4BB814',
  AWFUL: '#FFA640',
  BOSS: '#ff4040',
};

// ═══ 全局颜色常量 ═══
// AS3 原始: iGlobal.Global（静态常量）

export const ColorHex = {
  RED: 16728128,
  BLUE: 4874455,
  YELLOW: 16754240,
  GREEN: 8056380,
} as const;

// ═══ 日志分类常量 ═══
// AS3 原始: iGlobal.Global（静态字符串常量）

export const LogCategory = {
  battle: 'battle' as const,
  battleIntro: 'battleIntro' as const,
  money: 'money' as const,
  exp: 'exp' as const,
  item: 'item' as const,
  other: 'other' as const,
} as const;

// ═══ 武器名称常量 ═══
// AS3 原始: iGlobal.Global（静态变量）

export const WeaponNames = {
  sword: 'sword',
  axe: 'axe',
  bow: 'bow',
  crossbow: 'crossbow',
  sceptre: 'sceptre',
  staff: 'staff',
  tome: 'tome',
  shield: 'shield',
  dagger: 'dagger',
} as const;

// ═══ 护甲类型名称 ═══
// AS3 原始: iGlobal.Global（静态变量）

export const ArmorTypes = {
  suit: 'suit',
  jerkin: 'jerkin',
  breastplate: 'breastplate',
  fur_hat: 'fur_hat',
  felt_hat: 'felt_hat',
  helm: 'helm',
  shoes: 'Shoes',
  boots: 'Boots',
  greaves: 'Greaves',
} as const;

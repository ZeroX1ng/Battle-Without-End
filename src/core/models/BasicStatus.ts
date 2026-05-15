// ═══ 基础属性值对象 ═══
// AS3 原始: iData.BasicStatus.as
//
// 包含 18 个游戏属性字段，是所有属性计算的基础数据结构。
// 玩家、怪物、技能效果、装备加成均使用此结构。

import type { BasicStatusData, DamageNumber, RangeNumber, StatData } from '../types';
import { Stat } from '../constants';
import { balanceRandom } from '../math/MyMath';

/**
 * 范围数值基类（最小/最大值对）
 * AS3 原始: iData.iNumber.RangeNumber
 */
export class RangeNumberImpl implements RangeNumber {
  public min: number;
  public max: number;

  constructor(min: number = 0, max: number = 0) {
    this.min = min;
    this.max = max;
  }

  clone(): RangeNumberImpl {
    return new RangeNumberImpl(this.min, this.max);
  }
}

/**
 * 伤害数值（最小/最大攻击力对）
 * AS3 原始: iData.iNumber.DamageNumber extends RangeNumber
 */
export class DamageNumberImpl extends RangeNumberImpl implements DamageNumber {
  constructor(min: number = 0, max: number = 0) {
    super(min, max);
  }

  /**
   * 根据平衡值获取随机攻击力
   * AS3 原始: DamageNumber.getByBalance(balance): Number
   * 
   * 公式: min + (max - min) * balanceRandom(balance)
   * balance 越高 → 结果越偏向高值端（伤害越高）
   * balance < 50 时自动反转分布倾向低值端
   *
   * @param balance - 平衡值 (0-100)
   * @returns 介于 min 和 max 之间的随机攻击力值
   */
  getByBalance(balance: number): number {
    return this.min + (this.max - this.min) * balanceRandom(balance);
  }

  clone(): DamageNumberImpl {
    return new DamageNumberImpl(this.min, this.max);
  }
}

/**
 * 基础属性值对象 - 18个游戏核心属性
 * 
 * hp: 生命值
 * mp: 法力值
 * str: 力量（影响物理攻击力）
 * dex: 敏捷（影响远程攻击力、平衡值）
 * intelligence: 智力（影响魔法攻击力、法术命中等）
 * will: 意志（影响暴击率等）
 * luck: 幸运（影响暴击、掉落率等）
 * attack: 攻击力（min/max），存储未加成的基础攻击
 * balance: 平衡值（0-100），影响攻击偏差分布
 * crit: 暴击率
 * crit_mul: 暴击倍率（百分比，如 150 表示 1.5 倍）
 * defence: 防御力（减伤）
 * protection: 护甲值（百分比减伤）
 * spellChance: 法术释放概率
 * manaConsumption: 法力消耗
 * protectionIgnore: 无视护甲
 * protectionReduce: 降低护甲
 * magicDamage: 魔法伤害加成
 */
export class BasicStatus implements BasicStatusData {
  public hp: number;
  public mp: number;
  public str: number;
  public dex: number;
  public intelligence: number;
  public will: number;
  public luck: number;
  public attack: DamageNumberImpl;
  public balance: number;
  public crit: number;
  public crit_mul: number;
  public defence: number;
  public protection: number;
  public spellChance: number;
  public manaConsumption: number;
  public protectionIgnore: number;
  public protectionReduce: number;
  public magicDamage: number;

  constructor(
    hp: number = 0,
    mp: number = 0,
    str: number = 0,
    dex: number = 0,
    intelligence: number = 0,
    will: number = 0,
    luck: number = 0,
    attMin: number = 0,
    attMax: number = 0,
    balance: number = 0,
    crit: number = 0,
    crit_mul: number = 0,
    defence: number = 0,
    protection: number = 0,
    spellChance: number = 0,
    protectionIgnore: number = 0,
    protectionReduce: number = 0,
    magicDamage: number = 0
  ) {
    this.hp = hp;
    this.mp = mp;
    this.str = str;
    this.dex = dex;
    this.intelligence = intelligence;
    this.will = will;
    this.luck = luck;
    this.attack = new DamageNumberImpl(attMin, attMax);
    this.balance = balance;
    this.crit = crit;
    this.crit_mul = crit_mul;
    this.defence = defence;
    this.protection = protection;
    this.spellChance = spellChance;
    this.manaConsumption = 0;
    this.protectionIgnore = protectionIgnore;
    this.protectionReduce = protectionReduce;
    this.magicDamage = magicDamage;
  }

  /**
   * 深拷贝 - 创建一个属性值完全相同的新对象
   * AS3 原始: BasicStatus.clone()
   */
  clone(): BasicStatus {
    return new BasicStatus(
      this.hp, this.mp, this.str, this.dex, this.intelligence,
      this.will, this.luck,
      this.attack.min, this.attack.max,
      this.balance, this.crit, this.crit_mul,
      this.defence, this.protection, this.spellChance,
      this.protectionIgnore, this.protectionReduce,
      this.magicDamage
    );
  }
}

// ═══ 属性条目（Stat 数据类） ═══
// AS3 原始: iData.iItem.Stat

export class StatImpl implements StatData {
  public name: string;
  public value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  /**
   * 根据范围属性生成随机 Stat
   * AS3 原始: Stat.generate(param1:RangeStat, param2:Number): Stat
   * 
   * 在原游戏中，装备生成时调用此函数来随机化每条属性值。
   * value = (valueMin + changeRange * random * ratio * random) 取两位小数
   *
   * @param rangeStat - 范围属性定义（含 name, valueMin, changeRange）
   * @param ratio - 品质倍率（影响随机范围）
   */
  static generate(rangeStat: { name: string; valueMin: number; changeRange: number }, ratio: number): StatImpl {
    return new StatImpl(
      rangeStat.name,
      ((rangeStat.valueMin + rangeStat.changeRange * Math.random() * ratio * Math.random()) * 100 >> 0) / 100
    );
  }

  /**
   * 从存档字符串加载 Stat
   * AS3 原始: Stat.load(param1:String): Stat
   * 格式: "name$value"
   */
  static load(data: string): StatImpl {
    const _loc2_: string[] = data.split('$');
    return new StatImpl(_loc2_[0], Number(_loc2_[1]));
  }

  clone(): StatImpl {
    return new StatImpl(this.name, this.value);
  }

  /**
   * 属性名翻译 - 用于 UI 显示
   * AS3 原始: Stat.statTranslate(): String
   */
  statTranslate(): string {
    switch (this.name) {
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
      default: return this.name;
    }
  }

  /**
   * 存档序列化
   * AS3 原始: Stat.save(): String
   * 格式: "name$value"
   */
  save(): string {
    return this.name + '$' + this.value;
  }
}

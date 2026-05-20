// ═══ 装备实体类 ═══
// AS3 原始: iData.iItem.Equipment.as (562行)
//
// 管理装备实例：品质生成、属性随机、升级、存档。

import type { EquipmentData, RangeStatData, StatData } from '../types';
import { Stat, EquipType, EquipTypeBase, WeaponTypeBase } from '../constants';
import { StatImpl } from './BasicStatus';
import { balanceRandom, FirstLetterToUpper } from '../math/MyMath';
import { EquipmentList, StatList } from '../data/equipmentData';

// 品质颜色 HTML
const GREEN = '#4BB814';
const BLUE = '#4a60d7';
const YELLOW = '#a6a500';
const ORANGE = '#ff7100';
const PURPLE = '#9840be';

export class Equipment {
  public sortWeight!: number;
  public position!: string;
  public type!: string;
  public name!: string;
  public realName!: string;
  public level: number = 0;
  public quality!: number;
  public basicStat!: StatImpl[];
  public qualityStat!: StatImpl[];
  public levelStat: StatImpl[] = [];
  public category?: string;
  private ratio!: number;
  private isBoss: boolean = false;

  constructor(
    data: EquipmentData,
    ratio: number,
    isBoss: boolean = false,
    combatPower: number = 0
  ) {
    this.ratio = (ratio * 100 >> 0) / 100;
    if (this.ratio > 65) {
      this.ratio = 65;
    }
    this.level = 0;
    this.levelStat = [];
    this.isBoss = isBoss;
    this.setData(data);
    this.generateBasicStat(data.stat, this.ratio);
    this.generateQuality(this.ratio, combatPower);
  }

  /**
   * 从存档字符串加载装备
   * AS3 原始: Equipment.load(param1:String): Equipment
   * 格式: name#level#ratio#quality#basicStats%...%#qualityStats%...%
   */
  static load(data: string): Equipment {
    const _loc2_: string[] = data.split('#');
    let _loc3_: Equipment | null = null;
    let _loc4_: number = 0;
    while (_loc4_ < EquipmentList.length) {
      if (EquipmentList[_loc4_].name === _loc2_[0]) {
        _loc3_ = new Equipment(EquipmentList[_loc4_], Number(_loc2_[2]));
        break;
      }
      _loc4_++;
    }
    if (!_loc3_) {
      _loc3_ = new Equipment(EquipmentList[0], 1);
    }
    _loc3_.quality = Number(_loc2_[3]);
    _loc3_.basicStat = [];
    const _loc5_: string[] = _loc2_[4].split('%');
    _loc4_ = 0;
    while (_loc4_ < _loc5_.length) {
      if (_loc5_[_loc4_] !== '') {
        _loc3_.basicStat.push(StatImpl.load(_loc5_[_loc4_]));
      }
      _loc4_++;
    }
    _loc3_.qualityStat = [];
    if (_loc3_.quality > 0 && _loc2_.length > 5) {
      const _loc6_: string[] = _loc2_[5].split('%');
      _loc4_ = 0;
      while (_loc4_ < _loc6_.length) {
        if (_loc6_[_loc4_] !== '') {
          _loc3_.qualityStat.push(StatImpl.load(_loc6_[_loc4_]));
        }
        _loc4_++;
      }
    }
    _loc3_.setLevel(Number(_loc2_[1]));
    return _loc3_;
  }

  protected setData(data: EquipmentData): void {
    this.position = data.position;
    this.type = data.type;
    this.name = data.name;
    this.realName = data.realName;
    this.sortWeight = data.sortWeight;
    this.category = 'category' in data ? (data as { category: string }).category : undefined;
  }

  /**
   * 生成基础属性 - 从 RangeStat 随机取值
   * AS3 原始: generateBasicStat
   * 
   * 特殊处理：确保 attackMin <= attackMax（精灵族等低敏种族可能出反值）
   */
  private generateBasicStat(statList: RangeStatData[], ratio: number): void {
    this.basicStat = [];
    const _loc3_: number = statList.length;
    let _loc4_: number = 0;
    while (_loc4_ < _loc3_) {
      this.basicStat.push(StatImpl.generate(statList[_loc4_], ratio));
      _loc4_++;
    }
    // 保证最小攻击 <= 最大攻击
    if (this.basicStat.length > 0) {
      if (this.basicStat[0].name === Stat.attackMin) {
        if (this.basicStat[0].value > this.basicStat[1].value) {
          this.basicStat[0] = new StatImpl(Stat.attackMin, this.basicStat[1].value);
        }
      }
    }
  }

  /**
   * 生成品质 - 根据 ratio 和玩家战斗力决定品质等级 (0-5)
   * AS3 原始: generateQuality
   *
   * 品质公式：
   * 基础概率 = 10 + ratio * 10 - 战斗力/30，范围 [20, 70]
   * 然后用 balanceRandom 在曲线上取随机点 × 5.1 = 0~5 品质
   * Boss 掉落用 80 代替，品质更高
   */
  private generateQuality(ratio: number, combatPower: number = 0): void {
    let _loc2_: number = 10 + ratio * 10;
    if (combatPower > 0) {
      _loc2_ -= combatPower / 30;
    }
    if (_loc2_ > 70) {
      _loc2_ = 70;
    }
    if (_loc2_ < 20) {
      _loc2_ = 20;
    }
    this.quality = Math.floor(balanceRandom(_loc2_) * 5.1);
    if (this.isBoss) {
      this.quality = Math.floor(balanceRandom(80) * 5.5);
    }
    this.generateQualityStat(ratio);
  }

  /**
   * 生成品质属性 - 品质越高随机属性条数越多
   * AS3 原始: generateQualityStat
   *
   * 属性值 = stat.value * random² * ratio（传说品质用改良版随机）
   * 饰品排除 attackMin/Max 随机池最后一项
   */
  private generateQualityStat(ratio: number): void {
    let _loc3_: number = 0;
    let _loc4_: StatData;
    let _loc5_: number = 0;
    let _loc6_: StatImpl;
    this.qualityStat = [];
    let _loc2_: number = 0;
    while (_loc2_ < this.quality) {
      _loc3_ = (StatList.length - 1) * Math.random();
      if (this.type === EquipType.ACCESORY) {
        _loc3_ = (StatList.length - 2) * Math.random();
      }
      if (this.category) {
        _loc3_ = StatList.length * Math.random();
      }
      _loc4_ = StatList[Math.floor(_loc3_)];
      _loc5_ = _loc4_.value * Math.random() * Math.random() * ratio;
      if (this.quality === 5) {
          _loc5_ = _loc4_.value * (Math.random() * Math.random() * 0.85 + 0.15) * ratio;
      }
      _loc5_++;
      _loc6_ = new StatImpl(_loc4_.name, _loc5_);
      this.qualityStat.push(_loc6_);
      _loc2_++;
    }
  }

  /**
   * 设置装备等级 - 范围 [0, 15]
   */
  setLevel(level: number): void {
    this.level = level;
    if (level < 0) {
      this.level = 0;
      return;
    }
    if (level > 15) {
      this.level = 15;
    }
    this.generateLevelStat();
  }

  /**
   * 装备升级（消耗金币）
   */
  levelup(): void {
    this.level++;
    this.generateLevelStat();
  }

  canLevelup(gold: number): boolean {
    return gold > this.getMoney() && this.level < 15;
  }

  /**
   * 生成升级属性 - 每级指数增长
   * AS3 原始: generateLevelStat
   *
   * 武器升一级：value * 1.5^(level-1) * (1 + 0.2*quality)
   * 护甲升一级：value * 1.3^(level-1) * (1 + 0.2*quality)
   * 饰品升一级：qualityStat * 1.2^(level-1) * (1 + 0.2*quality) * 0.4
   */
  private generateLevelStat(): void {
    this.levelStat = [];
    if (this.level === 0) {
      return;
    }
    if (this.type !== EquipType.ACCESORY) {
      const isWeapon = !!this.category;
      const powBase = isWeapon ? 1.5 : 1.3;
      const baseStats = isWeapon
        ? WeaponTypeBase[this.type] ?? []
        : EquipTypeBase[this.type] ?? [];
      let _loc2_: number = 0;
      while (_loc2_ < baseStats.length) {
        this.levelStat.push(new StatImpl(
          baseStats[_loc2_].name,
          baseStats[_loc2_].value * Math.pow(powBase, this.level - 1) * (1 + 0.2 * this.quality)
        ));
        _loc2_++;
      }
    } else {
      let _loc2_: number = 0;
      while (_loc2_ < this.qualityStat.length) {
        this.levelStat.push(new StatImpl(
          this.qualityStat[_loc2_].name,
          this.qualityStat[_loc2_].value * Math.pow(1.2, this.level - 1) * (1 + 0.2 * this.quality) * 0.4
        ));
        _loc2_++;
      }
    }
  }

  getPositionLabel(): string {
    switch (this.position) {
      case 'head': return '头部';
      case 'body': return '身体';
      case 'feet': return '脚部';
      case 'necklace': return '项链';
      case 'ring': return '戒指';
      case 'off hand': return '副手';
      case 'one-handed': return '单手';
      case 'two-handed': return '双手';
      default: return this.position;
    }
  }

  getTypeLabel(): string {
    switch (this.type) {
      case EquipType.ACCESORY: return '饰品';
      case EquipType.HEAVY: return '重甲';
      case EquipType.MEDIUM: return '中甲';
      case EquipType.LIGHT: return '轻甲';
      case 'axe': return '斧';
      case 'bow': return '弓';
      case 'crossbow': return '弩';
      case 'dagger': return '匕首';
      case 'sceptre': return '权杖';
      case 'shield': return '盾牌';
      case 'staff': return '法杖';
      case 'sword': return '剑';
      case 'tome': return '书';
      default: return this.type;
    }
  }

  private appendStatLines(stats: StatImpl[], prefix: string = '', skipAttackPair: boolean = false): string {
    let html = '';
    let i = 0;
    while (i < stats.length) {
      const stat = stats[i];
      if (stat.name === Stat.attackMin && stats[i + 1]?.name === Stat.attackMax) {
        html += `  攻击 ${stat.value >> 0}~${stats[i + 1].value >> 0}<br/>`;
        i += 2;
        continue;
      }
      if (!skipAttackPair || stat.name !== Stat.attackMax) {
        html += `  ${FirstLetterToUpper(stat.statTranslate())} ${prefix}${stat.value >> 0}<br/>`;
      }
      i++;
    }
    return html;
  }

  getDescription(): string {
    let html = `<p align='center'>${this.getNameHTML()}`;
    if (this.level) {
      html += ` +${this.level}`;
      if (this.level === 15) {
        html += '(MAX)';
      }
    }
    html += '</p>';
    html += `<p align='center'><font size='16'>${FirstLetterToUpper(this.getPositionLabel())},${FirstLetterToUpper(this.getTypeLabel())}`;
    if (this.category) {
      html += `,${FirstLetterToUpper(this.category)}`;
    }
    html += '</font></p>';
    html += "<font size='20'>";
    html += this.appendStatLines(this.basicStat);
    html += "<font color='#00AF64'>";
    html += this.appendStatLines(this.qualityStat, '+');
    html += "</font><font color='#4b5ed7'>";
    html += this.appendStatLines(this.levelStat, '+');
    html += '</font></font>';
    return `${html}<p align='right'>$ ${this.getMoney()}</p>`;
  }

  /** 装备售价（升级消耗基准） */
  getMoney(): number {
    return (this.ratio * 30 >> 0) * (this.level + 1);
  }

  /** 出售价格 = getMoney * 10 * (1 + quality²) */
  getSellMoney(): number {
    return (this.getMoney() * 10 * (1 + this.quality * this.quality)) >> 0;
  }

  /** 带品质颜色的装备名 HTML */
  getNameHTML(): string {
    let _loc1_: string = '';
    switch (this.quality) {
      case 1: _loc1_ = GREEN; break;
      case 2: _loc1_ = BLUE; break;
      case 3: _loc1_ = YELLOW; break;
      case 4: _loc1_ = ORANGE; break;
      case 5: _loc1_ = PURPLE; break;
    }
    return `<font color='${_loc1_}'>${FirstLetterToUpper(this.realName)}</font>`;
  }

  /** 存档序列化 */
  save(): string {
    let _loc1_: string = '';
    _loc1_ += this.name + '#' + this.level + '#' + this.ratio + '#' + this.quality;
    _loc1_ += '#';
    let _loc2_: number = 0;
    while (_loc2_ < this.basicStat.length) {
      _loc1_ += this.basicStat[_loc2_].save() + '%';
      _loc2_++;
    }
    if (this.quality > 0) {
      _loc1_ += '#';
      _loc2_ = 0;
      while (_loc2_ < this.qualityStat.length) {
        _loc1_ += this.qualityStat[_loc2_].save() + '%';
        _loc2_++;
      }
    }
    return _loc1_;
  }
}

// ═══ 宠物实体类 ═══
// AS3 原始: iData.iPet.Pet.as (427行)
//
// 管理宠物实例：属性成长、技能生成、升级。

import type { PetData, PetSkillData, PetStatsData } from '../types';
import { getPetDataByLegacyId } from '../data/petData';
import { PetSkillDataList, PetSkillDataMap } from '../data/petSkillData';
import { PetStats } from './PetStats';
import { PetSkill } from './PetSkill';
import { balanceRandom, encryptInt, decryptInt } from '../math/MyMath';

const STAT_NAMES: (keyof PetStatsData)[] = [
  'hp', 'mp', 'attmin', 'attmax', 'def', 'pro', 'balance', 'cri', 'criMul', 'magAtt'
];

export class Pet {
  public type: string;
  public mc_name: string;
  public realName: string;
  public startStat: PetStatsData;
  public growStat: PetStatsData;
  public currentStat: PetStatsData;
  public skillList: PetSkill[] = [];
  private _level: number;
  private _exp: number;
  private _name: string;

  constructor(data: PetData, ratio: number) {
    this._name = data.name;
    this.type = data.type.type;
    this.mc_name = data.mc.startsWith('pet_') ? data.mc : `pet_${data.mc}`;
    this.realName = data.realName;

    this.startStat = PetStats.generatePetStats(data.type.startMin, data.type.startRange, ratio);
    this.startStat.balance = 30 + Math.random() * 60;
    this.startStat.cri = 10 + Math.random() * 30;
    this.startStat.criMul = 130 + Math.random() * 70;

    this.growStat = PetStats.generatePetStats(data.type.growMin, data.type.growRange, ratio);

    this.currentStat = {
      hp: 0, mp: 0, attmin: 0, attmax: 0,
      def: 0, pro: 0, balance: 0, cri: 0, criMul: 0, magAtt: 0
    };
    let _loc3_: number = 0;
    while (_loc3_ < STAT_NAMES.length) {
      this.currentStat[STAT_NAMES[_loc3_]] = this.startStat[STAT_NAMES[_loc3_]];
      _loc3_++;
    }

    this.generateSkill();
    this._level = encryptInt(1);
    this._exp = encryptInt(0);
  }

  static load(data: string): Pet {
    const parts = data.split('#');
    const pet = new Pet(getPetDataByLegacyId(parts[0]), 1);
    pet._exp = encryptInt(Number(parts[2]));
    pet.startStat = PetStats.load(parts[3]);
    pet.growStat = PetStats.load(parts[4]);
    pet.skillList = [];
    if (parts.length > 5) {
      const skillParts = parts[5].split('^');
      let j = 0;
      while (j < skillParts.length) {
        if (skillParts[j] !== '') {
          pet.skillList.push(PetSkill.load(skillParts[j]));
        }
        j++;
      }
    }
    pet.setLevel(Number(parts[1]));
    return pet;
  }

  // ═══ 技能系统 ═══

  private generateSkill(): void {
    this.skillList = [];
    let count: number;
    const r = Math.random();
    if (r < 0.4) {
      count = 0;
    } else if (r < 0.6) {
      count = 1;
    } else if (r < 0.75) {
      count = 2;
    } else if (r < 0.9) {
      count = 3;
    } else {
      count = 4;
    }
    const total = PetSkillDataList.length;
    let i = 0;
    while (i < count) {
      let idx: number;
      do {
        idx = Math.floor(Math.random() * total);
      } while (!this.addSkill(PetSkillDataList[idx]));
      i++;
    }
  }

  private addSkill(skillData: PetSkillData): boolean {
    if (this.skillList.length >= 4) return false;
    let i = 0;
    while (i < this.skillList.length) {
      if (skillData.name === this.skillList[i].skillData.name) return false;
      i++;
    }
    this.skillList.push(new PetSkill(skillData));
    return true;
  }

  getAttackSkill(): PetSkill[] {
    const result: PetSkill[] = [];
    let i = 0;
    while (i < this.skillList.length) {
      if (this.skillList[i].skillData.category === 'attack') {
        result.push(this.skillList[i]);
      }
      i++;
    }
    return result;
  }

  getSkill(skillData: PetSkillData): PetSkill | null {
    let i = 0;
    while (i < this.skillList.length) {
      if (this.skillList[i].skillData.name === skillData.name) {
        return this.skillList[i];
      }
      i++;
    }
    return null;
  }

  // ═══ 等级/经验 ═══

  get level(): number { return decryptInt(this._level); }
  set level(v: number) { this._level = encryptInt(v); }

  get exp(): number { return decryptInt(this._exp); }
  set exp(v: number) { this._exp = encryptInt(v); }

  /** 宠物攻击力 = attmin + (attmax - attmin) * balanceRandom(balance) */
  get attack(): number {
    return this.attmin + (this.attmax - this.attmin) * balanceRandom(this.balance);
  }

  // ═══ 属性 getter（含被动技能加成） ═══
  // AS3 原始: Pet.as hp/mp/attmin/attmax/defence/pro/cri/crimul/magicatt
  // 通过 PetSkillDataMap 按名称查找技能数据

  get hp(): number {
    let v = this.currentStat.hp;
    const sk = this.getSkill(PetSkillDataMap['Strong']);
    if (sk) v += sk.getSetArray()[0] * this.level;
    return v;
  }

  get mp(): number {
    let v = this.currentStat.mp;
    const sk = this.getSkill(PetSkillDataMap['Wisdom']);
    if (sk) v += sk.getSetArray()[0] * this.level;
    return v;
  }

  get attmin(): number {
    let v = this.currentStat.attmin;
    const sk = this.getSkill(PetSkillDataMap['Aggressive']);
    if (sk) v += sk.getSetArray()[0] * this.level;
    return v;
  }

  get attmax(): number {
    let v = this.currentStat.attmax;
    const sk = this.getSkill(PetSkillDataMap['Aggressive']);
    if (sk) v += sk.getSetArray()[0] * this.level;
    return v;
  }

  get defence(): number {
    let v = this.currentStat.def;
    const sk = this.getSkill(PetSkillDataMap['Defensive']);
    if (sk) v += sk.getSetArray()[0] * this.level;
    return v;
  }

  get pro(): number {
    let v = this.currentStat.pro;
    const sk = this.getSkill(PetSkillDataMap['Protective']);
    if (sk) v += sk.getSetArray()[0] * this.level;
    return v;
  }

  get balance(): number {
    const v = this.currentStat.balance;
    return v > 100 ? 100 : v;
  }

  get cri(): number {
    let v = this.currentStat.cri;
    const sk = this.getSkill(PetSkillDataMap['Slayer']);
    if (sk) v += sk.getSetArray()[0];
    return v;
  }

  get crimul(): number {
    let v = this.currentStat.criMul;
    const sk = this.getSkill(PetSkillDataMap['Slayer']);
    if (sk) v *= sk.getSetArray()[1];
    return v;
  }

  get magicatt(): number {
    let v = 100 + this.currentStat.magAtt;
    const sk = this.getSkill(PetSkillDataMap['Wise']);
    if (sk) v += sk.getSetArray()[0] * this.level;
    return v;
  }

  get name(): string { return this._name; }

  getTypeLabel(): string {
    switch (this.type) {
      case 'attack':
        return '攻击型';
      case 'balance':
        return '平衡型';
      case 'defence':
        return '防御型';
      case 'magic':
        return '魔法型';
      default:
        return this.type;
    }
  }

  getDescription(): string {
    let result = `<p align='center'>${this.realName} Lv.${this.level}</p>`;
    result += `<p align='center'><font size='20'>${this.getTypeLabel()}</font></p>`;
    result += "<font size='16'>";
    result += `  Hp\t${Math.floor(this.hp)}<br/>`;
    result += `  Mp\t${Math.floor(this.mp)}<br/>`;
    result += `  攻击\t${Math.floor(this.attmin)}~${Math.floor(this.attmax)}<br/>`;
    result += `  平衡\t${Math.floor(this.balance)}<br/>`;
    result += `  暴击率\t${Math.floor(this.cri)}%<br/>`;
    result += `  暴击倍数\t${Math.floor(this.crimul)}%<br/>`;
    result += `  防御\t${Math.floor(this.defence)}<br/>`;
    result += `  护甲\t${Math.floor(this.pro)}<br/>`;
    result += `  魔法攻击\t${Math.floor(this.magicatt)}%<br/>`;
    return result + '</font>';
  }

  /**
   * 设置等级并重新计算属性
   * 公式: currentStat[i] = startStat[i] + growStat[i] * (level - 1)
   */
  setLevel(level: number): void {
    if (level < 1) level = 1;
    if (level > 100) level = 100;
    this._level = encryptInt(level);
    let i = 0;
    while (i < STAT_NAMES.length) {
      this.currentStat[STAT_NAMES[i]] =
        this.startStat[STAT_NAMES[i]] + this.growStat[STAT_NAMES[i]] * (level - 1);
      i++;
    }
  }

  /**
   * 获得经验（升级用）
   * 公式: 需求经验 = level² * ((level+1)² - 13*(level+1) + 82)
   * playerLevel: 玩家等级，宠物等级不能超过玩家等级+5
   */
  addExp(exp: number, playerLevel: number = Infinity): void {
    if (this.getLevelExp() < 0) return;
    if (this.level - playerLevel > 5) return;
    this._exp = encryptInt(this.exp + exp);
    if (this.exp > this.getLevelExp()) {
      this.levelUp();
    }
  }

  private getLevelExp(): number {
    if (this.level > 100) return -1;
    return this.level * this.level * ((this.level + 1) * (this.level + 1) - 13 * (this.level + 1) + 82);
  }

  private levelUp(): void {
    this.level++;
    this._exp = encryptInt(0);
    let i = 0;
    while (i < STAT_NAMES.length) {
      this.currentStat[STAT_NAMES[i]] += this.growStat[STAT_NAMES[i]];
      i++;
    }
    // 升级时有概率学会新技能，等级越高概率越低
    if (Math.random() * 100 < 1 - this.level * 0.01) {
      const total = PetSkillDataList.length;
      const idx = Math.floor(Math.random() * total);
      this.addSkill(PetSkillDataList[idx]);
    }
  }

  save(): string {
    let result = '';
    result += this._name + '#' + this.level + '#' + this.exp;
    result += '#' + this.startStat.hp + '%' + this.startStat.mp + '%' + this.startStat.attmin + '%' + this.startStat.attmax + '%' + this.startStat.def + '%' + this.startStat.pro + '%' + this.startStat.balance + '%' + this.startStat.cri + '%' + this.startStat.criMul + '%' + this.startStat.magAtt;
    result += '#' + this.growStat.hp + '%' + this.growStat.mp + '%' + this.growStat.attmin + '%' + this.growStat.attmax + '%' + this.growStat.def + '%' + this.growStat.pro + '%' + this.growStat.balance + '%' + this.growStat.cri + '%' + this.growStat.criMul + '%' + this.growStat.magAtt;
    if (this.skillList.length > 0) {
      result += '#';
      let i = 0;
      while (i < this.skillList.length) {
        result += this.skillList[i].save() + '^';
        i++;
      }
    }
    return result;
  }
}

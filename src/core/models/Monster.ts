// ═══ 怪物实体类 ═══
// AS3 原始: iData.iMonster.Monster.as + Boss.as
//
// 管理怪物实例：BUFF、掉落、战斗属性。

import type { GlobalConfig, LootState, MonsterData, PetData, PlayerState, WeaponData } from '../types';
import type { BuffContext } from './Buff';
import { as3Int, balanceRandom } from '../math/MyMath';
import { MonsterTitleList, REGION_BOSS_TITLE } from '../data/monsterData';
import { Pet } from './Pet';
import { Equipment } from './Equipment';
import { Weapon } from './Weapon';
import { getCombatPower, getLuck } from './Player';
import { EquipmentList } from '../data/equipmentData';
import { getQualityLootKey, handleDroppedItem } from '../systems/SystemConfig';

// 怪物强度颜色
const PINK = '#EE6b9c';
const PURPLE = '#BC38d3';
const BROWN = '#bf7130';
const GREEN = '#4BB814';
const YELLOW = '#FFA640';
const RED = '#ff4040';

export class Monster {
  public title: any = null;
  public data: MonsterData;
  public buffList: any[] = [];

  constructor(data: MonsterData) {
    this.data = { ...data, attack: { ...data.attack } };
    this.generateTitle();
  }

  /**
   * 随机生成怪物标题（原 AS3: 20% 概率）
   * AS3 原始: Monster.generateTitle()
   */
  protected generateTitle(): void {
    if (Math.random() < 0.2 && MonsterTitleList.length > 0) {
      const idx = Math.floor(Math.random() * MonsterTitleList.length);
      this.title = MonsterTitleList[idx];
      this.addTitleStat();
    }
  }

  /**
   * 应用标题的属性加成
   * AS3 原始: Monster.addTitleStat()
   */
  protected addTitleStat(): void {
    if (!this.title) return;
    const list = this.title.statMulList;
    for (let i = 0; i < list.length; i++) {
      const sm = list[i];
      if (sm.name === 'attackMin') {
        this.data.attack.min = this.data.attack.min * sm.mul + sm.add;
      } else if (sm.name === 'attackMax') {
        this.data.attack.max = this.data.attack.max * sm.mul + sm.add;
      } else if (sm.name === 'ATTACK') {
        this.data.attack.min = this.data.attack.min * sm.mul + sm.add;
        this.data.attack.max = this.data.attack.max * sm.mul + sm.add;
      } else {
        (this.data as any)[sm.name] = ((this.data as any)[sm.name] || 0) * sm.mul + sm.add;
      }
    }
  }

  /**
   * 怪物掉落率
   * AS3 原始: Monster.get dropRate(): Number
   */
  getDropRate(playerState: PlayerState, mapModifier: number): number {
    let _loc1_: number = (this.CP / getCombatPower(playerState) + mapModifier) * (1 + getLuck(playerState) / 300);
    if (this.title) {
      _loc1_ *= this.title.dropMul;
    }
    return _loc1_;
  }

  /**
   * AS3 原始: Monster.get exp(): int
   * 怪物称号的 xpMul 必须在模型层结算，Battle 只负责领取奖励。
   */
  getExp(playerState: PlayerState, mapModifier: number): number {
    let _loc1_: number = (this.CP / getCombatPower(playerState) + mapModifier) * this.CP * (1 + getLuck(playerState) / 300);
    if (this.title) {
      _loc1_ *= this.title.xpMul;
    }
    return Math.floor(_loc1_);
  }

  /**
   * AS3 原始: Monster.get money(): int
   */
  getMoney(playerState: PlayerState, mapModifier: number): number {
    let _loc1_: number = (this.CP / getCombatPower(playerState) + mapModifier) * this.CP / 10 * (1 + getLuck(playerState) / 300);
    if (this.title) {
      _loc1_ *= this.title.goldMul;
    }
    return Math.floor(_loc1_);
  }

  dropItem(playerState: PlayerState, mapModifier: number, config: GlobalConfig): MonsterDropResult {
    const dropRate = this.getDropRate(playerState, mapModifier);
    if (Math.random() * 100 >= 20 * dropRate) {
      return createNoDropResult(playerState);
    }
    return this.createDroppedItem(playerState, dropRate, config, false);
  }

  dropPet(_playerState: PlayerState, _mapModifier: number, _petList: PetData[]): Pet | null {
    return null;
  }

  protected createDroppedItem(
    playerState: PlayerState,
    dropRate: number,
    config: GlobalConfig,
    isBoss: boolean,
  ): MonsterDropResult {
    const idx = Math.floor(Math.random() * EquipmentList.length);
    const ed = EquipmentList[idx];
    const combatPower = getCombatPower(playerState);
    const drop = 'category' in ed
      ? new Weapon(ed as WeaponData, dropRate, isBoss, combatPower)
      : new Equipment(ed, dropRate, isBoss, combatPower);
    const result = handleDroppedItem(playerState, drop, config);

    return {
      playerState: result.state,
      dropped: true,
      added: result.added,
      soldItem: result.soldItem,
      convertedToGold: result.convertedToGold,
      drop,
      lootKey: result.added ? getQualityLootKey(drop.quality) : undefined,
    };
  }

  get CP(): number {
    return this.data.CP;
  }

  get hp(): number {
    return as3Int(this.data.hp);
  }

  get balance(): number {
    if (this.data.balance > 100) return 100;
    if (this.data.balance < 0) return 0;
    return as3Int(this.data.balance);
  }

  get crit(): number {
    return as3Int(this.data.crit);
  }

  get crit_mul(): number {
    return as3Int(this.data.crit_mul);
  }

  get defence(): number {
    return as3Int(this.data.defence);
  }

  get protection(): number {
    let _loc1_: number = this.data.protection;
    const _loc2_ = this.isContainBuff('corrosion');
    if (_loc2_) {
      _loc1_ -= _loc2_.count;
    }
    return as3Int(_loc1_);
  }

  /**
   * 攻击力 = attMin + (attMax - attMin) * balanceRandom(balance)
   * AS3 原始: Monster.get attack(): int
   */
  get attack(): number {
    return as3Int(this.data.attack.min + (this.data.attack.max - this.data.attack.min) * balanceRandom(this.balance));
  }

  /**
   * 怪物名字 HTML - 根据 CP 对比玩家的战力着色
   * AS3 原始: Monster.get nameHtml(): String
   */
  getNameHtml(combatPower: number): string {
    const _loc1_: number = this.CP / combatPower;
    let _loc2_: string;
    let _loc3_: string;
    if (_loc1_ < 0.8) { _loc2_ = PINK; _loc3_ = 'WEAKEST'; }
    else if (_loc1_ < 1) { _loc2_ = PURPLE; _loc3_ = 'WEAK'; }
    else if (_loc1_ < 1.4) { _loc2_ = BROWN; _loc3_ = 'NORMAL'; }
    else if (_loc1_ < 2) { _loc2_ = GREEN; _loc3_ = 'STRONG'; }
    else if (_loc1_ < 3) { _loc2_ = YELLOW; _loc3_ = 'AWFUL'; }
    else { _loc2_ = RED; _loc3_ = 'BOSS'; }
    return `<font color='${_loc2_}'>${this.data.realName}</font>`;
  }

  isContainBuff(name: string): any {
    let _loc2_: number = 0;
    while (_loc2_ < this.buffList.length) {
      if (this.buffList[_loc2_].name === name) return this.buffList[_loc2_];
      _loc2_++;
    }
    return null;
  }

  addBuff(buff: any): void {
    const _loc2_ = this.isContainBuff(buff.name);
    if (!_loc2_) {
      this.buffList.push(buff);
    } else {
      _loc2_.combine(buff);
    }
  }

  runBuff(context?: BuffContext): string[] {
    const logs: string[] = [];
    let _loc1_: number = 0;
    while (_loc1_ < this.buffList.length) {
      const msg = this.buffList[_loc1_].run(context);
      if (msg) logs.push(msg);
      _loc1_++;
    }
    this.removeBuff();
    return logs;
  }

  removeBuff(): void {
    let _loc1_: number = 0;
    while (_loc1_ < this.buffList.length) {
      if (this.buffList[_loc1_].isOver()) {
        this.buffList.splice(_loc1_, 1);
        return;
      }
      _loc1_++;
    }
  }
}

/** Boss - 继承 Monster，战力翻倍，必掉装备，概率掉宠物 */
export class Boss extends Monster {
  public hpleft: number = 0;

  constructor(data: MonsterData) {
    super(data);
    this.hpleft = this.hp;
  }

  protected generateTitle(): void {
    this.title = REGION_BOSS_TITLE;
    this.addTitleStat();
  }

  get CP(): number {
    return this.data.CP * 2;
  }

  dropItem(playerState: PlayerState, mapModifier: number, config: GlobalConfig): MonsterDropResult {
    const dropRate = this.getDropRate(playerState, mapModifier);
    return this.createDroppedItem(playerState, dropRate, config, true);
  }

  /**
   * Boss 宠物掉落 — 20% 基础概率 + 幸运加成
   * 掉落率 = 20 * (1 + luck / 200)，上限 40%
   * 品质系数 = (1 + mapModifier) * (1 + luck / 500)，其中 luck/500 上限 1
   * 从地图 petList 随机选取宠物
   *
   * @returns Pet | null — 掉落成功返回 Pet 实例，否则 null
   */
  dropPet(playerState: PlayerState, mapModifier: number, petList: PetData[]): Pet | null {
    if (!petList || petList.length === 0) return null;

    const luck = getLuck(playerState);
    let rate = 20 * (1 + luck / 200);
    if (rate > 40) rate = 40;

    if (Math.random() * 100 < rate) {
      let luckRatio = luck / 500;
      if (luckRatio > 1) luckRatio = 1;
      const quality = (1 + mapModifier) * (1 + luckRatio);
      const idx = Math.floor(Math.random() * petList.length);
      return new Pet(petList[idx], quality);
    }
    return null;
  }
}

export interface MonsterDropResult {
  playerState: PlayerState;
  dropped: boolean;
  added: boolean;
  soldItem?: Equipment;
  convertedToGold: number;
  drop?: Equipment;
  lootKey?: keyof LootState;
}

function createNoDropResult(playerState: PlayerState): MonsterDropResult {
  return {
    playerState,
    dropped: false,
    added: false,
    convertedToGold: 0,
  };
}

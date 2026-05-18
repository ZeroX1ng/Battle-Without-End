// ═══ 战斗实体类 ═══
// AS3 原始: iData.Battle.as (553行)
//
// 回合制自动战斗系统：玩家/怪物/宠物三方交互。
// 核心公式：护甲减伤、暴击判定、伤害计算。

import type { GameLog, GlobalConfig, LootState, PlayerState } from '../types';
import { Stat, SkillType, SkillCategory } from '../constants';
import { Monster, Boss } from './Monster';
import { Map } from './Map';
import { balanceRandom } from '../math/MyMath';
import {
  getAttack, getAttMin, getAttMax,
  getHp, getMp, getCrit, getCritMul,
  getDefence, getProtection, getProtectionReduce, getProtectionIgnore,
  getSpellChance, getCombatPower,
  addExp as playerAddExp, addGold as playerAddGold,
  addPet as playerAddPet, loseExp
} from './Player';
import { PetSkillDataMap } from '../data/petSkillData';

/** 暴击上限常量 */
const CR = 50;

/** Battle.run() 返回的战斗结果 */
export interface BattleRunResult {
  caculate: number;
  shouldAgeup: boolean;
  shouldSave: boolean;
  shouldRefreshShop: boolean;
  playerDied: boolean;
  logs: GameLog[];
  loot: Partial<LootState>;
  titleEvents: BattleTitleEvent[];
}

export interface BattleTitleEvent {
  name: string;
  maxVal?: number;
  countVal?: number;
}

/**
 * 护甲减伤公式 - 核心战斗公式
 * AS3 原始: Battle.caculateProtection(param1:int): Number
 *
 * 正护甲: 伤害减免 = 0.06 * p / (1 + 0.06 * p) —— 渐进递减曲线
 * 负护甲(< -100): 直接双倍伤害
 * 负护甲(0 ~ -100): 伤害增幅 = -(1 - 0.94^(-p))
 *
 * @param p - 护甲值
 * @returns 减伤/增伤系数 (0~1 为减伤，负数表示增伤)
 */
export function caculateProtection(p: number): number {
  if (p >= 0) {
    return 0.06 * p / (1 + 0.06 * p);
  }
  if (p < -100) {
    return -1;
  }
  return -(1 - Math.pow(0.94, -p));
}

export class Battle {
  public turn: number = 1;
  public playerHp: number = 0;
  public playerMp: number = 0;
  public monster: Monster | null = null;
  public monsterHp: number = 0;
  public petHp: number = 0;
  public petMp: number = 0;
  public pet: any = null;
  public boss: Boss | null = null;
  public playerState: PlayerState;
  public map: Map;
  public config: GlobalConfig | null = null;
  private _playerDied: boolean = false;
  private _loot: Partial<LootState> = {};
  private _titleEvents: BattleTitleEvent[] = [];

  constructor(playerState: PlayerState, map: Map, config?: GlobalConfig) {
    this.playerState = playerState;
    this.map = map;
    this.config = config ?? null;
  }

  /**
   * 初始化战斗 - 生成怪物、设置初始 HP/MP
   * AS3 原始: Battle.init()
   */
  init(): void {
    if (!this.boss) {
      this.boss = this.map.getBoss();
    }
    if (Math.random() < 0.05) {
      // 5% 概率遇到 Boss
      this.monster = this.boss!;
      this.monsterHp = this.boss!.hpleft || (this.monster as any).hp;
    } else {
      const list = this.map.mapData.monsterList;
      const idx = Math.floor(Math.random() * list.length);
      this.monster = new Monster(list[idx]);
      this.monsterHp = this.monster.hp;
    }
    this.playerHp = getHp(this.playerState);
    this.playerMp = getMp(this.playerState);
    this.pet = (this.playerState as any).pet || null;
    if (this.pet) {
      this.petHp = this.pet.hp;
      this.petMp = this.pet.mp;
    }
    this.turn = 1;
  }

  /**
   * 回合切换 - turn *= -1
   * 正数 = 玩家回合，负数 = 怪物回合
   */
  changeTurn(): void {
    this.turn *= -1;
    if (this.checkDead()) {
      this.turn = 1;
    }
  }

  /**
   * 检查死亡 - 任一方 HP <= 0 时触发结算
   */
  checkDead(): boolean {
    if (this.playerHp <= 0) {
      if (this.monster instanceof Boss && this.boss) {
        this.boss.hpleft = this.monsterHp;
      }
      this.playerDie();
      this.init();
      return true;
    }
    if (this.petHp <= 0) {
      this.pet = null;
    }
    if (this.monsterHp <= 0) {
      if (this.monster instanceof Boss) {
        this.boss = null;
      }
      this.giveTrophy();
      this.init();
      return true;
    }
    return false;
  }

  private playerDie(): void {
    const lost = Math.floor(this.playerState.xp / 100);
    this.playerState = loseExp(this.playerState);
    this._playerDied = true;
    this.emitLogs([`<font color='#ff4040'>你被击败了！失去了 ${lost} 点经验...</font>`]);
  }

  private giveTrophy(): void {
    if (!this.monster) return;
    const expGain = this.monster.getExp(this.playerState, this.map.mapData.modifier);
    // 经验和金币（原 AS3 公式）
    this.playerState = playerAddExp(this.playerState, expGain);
    this.addLoot('exp', expGain);
    this.emitLogs([`你获得了<font color='#4a60d7'>${expGain}</font>经验.`], 'exp');
    const goldGain = this.monster.getMoney(this.playerState, this.map.mapData.modifier);
    this.playerState = playerAddGold(this.playerState, goldGain);
    this.addLoot('money', goldGain);
    this.emitLogs([`你获得了<font color='#FFA640'>$${goldGain}</font>.`], 'money');
    // 怪物掉落装备/宠物（原 AS3: 20% * dropRate 概率）
    this.processDrop();

    if (this.monster.CP / getCombatPower(this.playerState) > 3) {
      this.addTitleEvent('kill', 0, 1);
    }
    if (this.pet) {
      this.pet.addExp(expGain, this.playerState.lv);
    }
  }

  private processDrop(): void {
    if (!this.monster || !this.config) return;
    const result = this.monster.dropItem(this.playerState, this.map.mapData.modifier, this.config);
    this.playerState = result.playerState;
    if (result.dropped && result.drop) {
      if (result.added) {
        if (result.soldItem) {
          this.emitLogs([`背包已满，自动出售了${result.soldItem.getNameHTML()}.`], 'item');
        }
        this.emitLogs([`你获得了${result.drop.getNameHTML()}!`], 'item');
        if (result.lootKey) {
          this.addLoot(result.lootKey, 1);
        }
      } else if (result.convertedToGold > 0) {
        this.emitLogs([`你获得了<font color='#FFA640'>$${result.convertedToGold}</font>.`], 'money');
        this.addLoot('money', result.convertedToGold);
      }
    }

    const pet = this.monster.dropPet(this.playerState, this.map.mapData.modifier, this.map.mapData.petList || []);
    if (pet) {
      const petResult = playerAddPet(this.playerState, pet);
      if (petResult.added) {
        this.playerState = petResult.state;
        this.emitLogs([`你获得了${pet.name}!`], 'item');
      } else {
        this.emitLogs(['宠物栏满了!'], 'item');
      }
    }
  }

  /**
   * 执行一回合战斗
   * AS3 原始: Battle.fight()
   */
  fight(): void {
    if (this.turn > 0) {
      this.playerTurn();
      this.petTurn();
    } else {
      this.monsterTurn();
    }
    this.changeTurn();
  }

  /**
   * 游戏主循环 tick — 替代 AS3 Timer(500) 驱动的 Battle.run()
   * AS3 原始: Battle.run(param1:Event = null): void
   *
   * 每 500ms 由 useGameLoop → dispatch('BATTLE_TICK') 触发。
   * 职责：
   *   1. 有怪物时执行 fight() 战斗回合
   *   2. 递增 caculate 计数器
   *   3. 返回 ageup/save 信号供 Reducer 处理
   *
   * @returns BattleRunResult — caculate 值和触发信号
   */
  run(): BattleRunResult {
    const logs: GameLog[] = [];
    if (this.monster) {
      this.fight();
    }
    // 收集战斗回合中产生的日志
    if (this.playerState._logs) {
      logs.push(...this.playerState._logs);
      delete this.playerState._logs;
    }
    const caculate = this.playerState.caculate + 1;
    this.playerState = { ...this.playerState, caculate };
    const playerDied = this._playerDied;
    const loot = this._loot;
    const titleEvents = this._titleEvents;
    this._playerDied = false;
    this._loot = {};
    this._titleEvents = [];
    return {
      caculate,
      shouldAgeup: caculate > 2400,
      shouldSave: caculate % 60 === 0,
      shouldRefreshShop: caculate % 600 === 0,
      playerDied,
      logs,
      loot,
      titleEvents,
    };
  }

  /** 玩家攻击回合 */
  private playerTurn(): void {
    let usedSkill = false;
    const skills = this.getAttackSkills();
    if (skills.length > 0) {
      let chance = getSpellChance(this.playerState) + 20 + skills.length * 5;
      if (chance > 95) chance = 95;
      if (Math.random() * 100 < chance) {
        // 随机选一个技能尝试施放
        const shuffled = [...skills].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length; i++) {
          const skill = shuffled[i];
          const behaveFn = skill.skillData.behaveFunction;
          if (behaveFn) {
            const result = behaveFn(skill, this);
            if (result.success) {
              usedSkill = true;
              this.emitLogs(result.logs);
              break;
            }
          }
        }
      }
    }
    if (!usedSkill) {
      this.playerAttack();
    }
  }

  private emitLogs(logs: string[], category: string = 'battle'): void {
    if (!logs.length) return;
    const msgs = this.playerState._logs ?? [];
    for (const log of logs) msgs.push({ text: log, category });
    this.playerState._logs = msgs;
  }

  private addLoot(key: keyof LootState, amount: number): void {
    this._loot[key] = (this._loot[key] ?? 0) + amount;
  }

  private addTitleEvent(name: string, maxVal?: number, countVal?: number): void {
    this._titleEvents.push({ name, maxVal, countVal });
  }

  /** 玩家普攻伤害计算 */
  private playerAttack(): void {
    const player = this.playerState;
    const mon = this.monster!;

    // 暴击判定
    let critChance = getCrit(player) - (mon.protection - getProtectionReduce(player)) * 2;
    if (critChance > CR) critChance = CR;
    let critMul = 1;
    let isCrit = false;
    if (Math.random() * 100 < critChance) {
      critMul = getCritMul(player) / 100;
      isCrit = true;
    }

    // 有效护甲 = 怪物护甲 - 减甲 - 穿甲
    const effProtection = mon.protection - getProtectionReduce(player) - getProtectionIgnore(player);
    const protection = caculateProtection(effProtection);

    // 伤害 = (攻击力 * 暴击倍率 - 防御力) * (1 - 护甲减伤)
    let damage = (getAttack(player) * critMul - mon.defence) * (1 - protection);
    if (damage < 1) damage = 1;
    const finalDamage = Math.floor(damage);

    this.monsterHp -= finalDamage;

    this.addTitleEvent('damage', finalDamage, finalDamage);
    this.addTitleEvent('crit', 0, isCrit ? 1 : -1);
  }

  /** 怪物攻击回合 */
  private monsterTurn(): void {
    if (!this.monster) return;
    const buffLogs = this.monster.runBuff();
    this.emitLogs(buffLogs);
    const frozen = this.monster.isContainBuff('frozen');
    if (frozen || this.monsterHp <= 0) return;

    if (this.pet && this.petHp > 0) {
      const tauntSkill = this.pet.getSkill(PetSkillDataMap['Taunt']);
      if (tauntSkill) {
        this.monsterAttackPet();
      } else if (Math.random() < 0.5) {
        this.monsterAttackPlayer();
      } else {
        this.monsterAttackPet();
      }
    } else {
      this.monsterAttackPlayer();
    }
  }

  /** 怪物攻击玩家 */
  private monsterAttackPlayer(): void {
    let usedSkill = false;
    const skills = this.getDefenceSkills();
    if (skills.length > 0) {
      let chance = getSpellChance(this.playerState) + skills.length * 20;
      if (chance > 95) chance = 95;
      if (Math.random() * 100 < chance) {
        const skill = skills[Math.floor(Math.random() * skills.length)];
        const behaveFn = skill.skillData.behaveFunction;
        if (behaveFn) {
          const result = behaveFn(skill, this);
          if (result.success) {
            usedSkill = true;
            this.emitLogs(result.logs);
          }
        }
      }
    }
    if (!usedSkill) {
      this.monsterAttack();
    }
  }

  /** 怪物普通攻击玩家 */
  private monsterAttack(): void {
    const mon = this.monster!;
    const player = this.playerState;

    let critChance = mon.crit - getProtection(player) * 2;
    if (critChance > CR) critChance = CR;
    let critMul = 1;
    if (Math.random() * 100 < critChance) {
      critMul = mon.crit_mul / 100;
    }

    const protection = caculateProtection(getProtection(player));
    let damage = (mon.attack * critMul - getDefence(player)) * (1 - protection);
    if (damage < 1) damage = 1;
    const finalDamage = Math.floor(damage);

    this.playerHp -= finalDamage;

    this.addTitleEvent('endure', finalDamage);
  }

  /** 怪物攻击宠物 */
  private monsterAttackPet(): void {
    const mon = this.monster!;
    if (!this.pet) return;

    const dodgeSkill = this.pet.getSkill(PetSkillDataMap['Dodge']);
    if (dodgeSkill) {
      if (Math.random() * 100 < dodgeSkill.getSetArray()[0]) {
        this.emitLogs([`你的宠物回避了${mon.getNameHtml(getCombatPower(this.playerState))}的攻击!`]);
        return;
      }
    }

    let critChance = mon.crit - this.pet.pro * 2;
    if (critChance > CR) critChance = CR;
    let critMul = 1;
    if (Math.random() * 100 < critChance) {
      critMul = mon.crit_mul / 100;
    }

    const protection = caculateProtection(this.pet.pro);
    let damage = (mon.attack * critMul - this.pet.defence) * (1 - protection);
    if (damage < 1) damage = 1;

    this.petHp -= Math.floor(damage);

    const irSkill = this.pet.getSkill(PetSkillDataMap['Injury Resile']);
    if (irSkill) {
      if (Math.random() * 100 < irSkill.getSetArray()[0]) {
        const reflectDamage = Math.floor(damage * irSkill.getSetArray()[1] / 100);
        this.monsterHp -= reflectDamage;
        this.emitLogs([`你的宠物反弹了<font color='#ff4040'>${reflectDamage}</font>伤害给${mon.getNameHtml(getCombatPower(this.playerState))}`]);
      }
    }

    const caSkill = this.pet.getSkill(PetSkillDataMap['Counterattack']);
    if (caSkill) {
      if (Math.random() * 100 < caSkill.getSetArray()[0]) {
        let caCritChance = this.pet.cri - mon.protection * 2;
        if (caCritChance > CR) caCritChance = CR;
        let caCritMul = 1;
        if (Math.random() * 100 < caCritChance) {
          caCritMul = this.pet.crimul / 100;
        }
        const caProtection = caculateProtection(mon.protection);
        let caDamage = (this.pet.attack * caCritMul - mon.defence) * (1 - caProtection);
        caDamage *= caSkill.getSetArray()[1] / 100;
        if (caDamage < 1) caDamage = 1;
        this.monsterHp -= Math.floor(caDamage);
        this.emitLogs([`你的宠物成功反击了<font color='#ff4040'>${Math.floor(caDamage)}</font>伤害给${mon.getNameHtml(getCombatPower(this.playerState))}`]);
      }
    }
  }

  /** 宠物回合 */
  private petTurn(): void {
    if (!this.pet || this.petHp <= 0) return;

    let usedSkill = false;
    const petSkills = this.pet.getAttackSkill();
    if (petSkills && petSkills.length > 0) {
      if (Math.random() * 100 < 50) {
        const skill = petSkills[Math.floor(Math.random() * petSkills.length)];
        const behaveFn = skill.skillData.behaveFunction;
        if (behaveFn) {
          const result = behaveFn(skill, this, this.pet);
          if (result.success) {
            this.emitLogs(result.logs);
            usedSkill = true;
          }
        }
      }
    }
    if (!usedSkill) {
      const doubleHitSkill = this.pet.getSkill(PetSkillDataMap['Double hit']);
      if (doubleHitSkill) {
        this.petAttack();
        if (Math.random() * 100 < doubleHitSkill.getSetArray()[0]) {
          this.petAttack();
        }
      } else {
        this.petAttack();
      }
    }
    this.petEndTurn();
  }

  /** 宠物普攻 */
  private petAttack(): void {
    if (!this.pet || !this.monster) return;
    const mon = this.monster;

    let critChance = this.pet.cri - mon.protection * 2;
    if (critChance > CR) critChance = CR;
    let critMul = 1;
    if (Math.random() * 100 < critChance) {
      critMul = this.pet.crimul / 100;
    }

    const protection = caculateProtection(mon.protection);
    let damage = (this.pet.attack * critMul - mon.defence) * (1 - protection);
    if (damage < 1) damage = 1;

    const goeSkill = this.pet.getSkill(PetSkillDataMap['Good or Evil']);
    if (goeSkill) {
      if (Math.random() * 100 >= goeSkill.getSetArray()[0]) {
        this.monsterHp += Math.floor(damage);
        if (this.monsterHp > this.monster.hp) {
          this.monsterHp = this.monster.hp;
        }
        this.emitLogs([`你的宠物给${mon.getNameHtml(getCombatPower(this.playerState))}回复了<font color='#7AEE3C' size='16'>${Math.floor(damage)}</font> hp`]);
        return;
      }
      critMul *= 2;
    }

    this.monsterHp -= Math.floor(damage);

    const ldSkill = this.pet.getSkill(PetSkillDataMap['Life Drain']);
    if (ldSkill) {
      this.petHp += Math.floor(damage * ldSkill.getSetArray()[0] / 100);
    }
  }

  /** 宠物回合结束 - 冥想回蓝 / 治愈回血 */
  private petEndTurn(): void {
    if (!this.pet || !this.monster) return;

    const medSkill = this.pet.getSkill(PetSkillDataMap['Meditation']);
    if (medSkill) {
      const restoreMp = Math.floor(medSkill.getSetArray()[0] * this.pet.level);
      this.playerMp += restoreMp;
      const maxMp = getMp(this.playerState);
      if (this.playerMp > maxMp) this.playerMp = maxMp;
      this.petMp += restoreMp;
      if (this.petMp > this.pet.mp) this.petMp = this.pet.mp;
      this.emitLogs([`你的宠物恢复了你和他自身的<font color='#4a60d7' size='16'>${restoreMp}</font>MP`]);
    }

    const healSkill = this.pet.getSkill(PetSkillDataMap['Heal']);
    if (healSkill) {
      const restoreHp = Math.floor(healSkill.getSetArray()[0] * this.pet.level);
      this.playerHp += restoreHp;
      const maxHp = getHp(this.playerState);
      if (this.playerHp > maxHp) this.playerHp = maxHp;
      this.petHp += restoreHp;
      if (this.petHp > this.pet.hp) this.petHp = this.pet.hp;
      this.emitLogs([`你的宠物恢复了你和他自身的<font color='#7AEE3C' size='16'>${restoreHp}</font>HP`]);
    }
  }

  private getAttackSkills(): any[] {
    return this.playerState.equipSkillList.filter(s => 
      s.skillData.type === SkillType.ATTACK
    );
  }

  private getDefenceSkills(): any[] {
    const weaponCategory = this.playerState.leftHand?.category || SkillCategory.MELEE;
    return this.playerState.equipSkillList.filter(s => {
      const data = s.skillData;
      if (data.type !== SkillType.DEFENCE) return false;
      return data.category === SkillCategory.ALL ||
        data.category === SkillCategory.MAGIC ||
        data.category === weaponCategory;
    });
  }
}

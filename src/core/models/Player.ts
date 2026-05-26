// ═══ 玩家核心实体类 ═══
// AS3 原始: iGlobal.Player.as (1626行)
//
// 玩家所有状态与逻辑的集中管理模块。
// 设计为纯函数模块，所有操作通过传入/返回 PlayerState 实现不可变更新。

import type { PlayerState } from '../types';
import { Stat, WeaponCategory, SkillCategory, SkillType, EquipSlot, WeaponHand } from '../constants';
import { BasicStatus } from './BasicStatus';
import { Race } from './Race';
import { Equipment } from './Equipment';
import { Weapon } from './Weapon';
import { Skill } from './Skill';
import type { TitleData } from '../types';
import { as3Int, balanceRandom } from '../math/MyMath';
import { EquipmentList } from '../data/equipmentData';
import type { WeaponData } from '../types';
import { SkillDataList } from '../data/skillData';

// ═══ 初始状态工厂 ═══

export function createInitialPlayerState(): PlayerState {
  return {
    lv: 1, age: 10, race: null,
    basicStatus: new BasicStatus(0,0,0,0,0,0,0),
    ap: 0, gold: 0, xp: 0, pet: null, title: null,
    apCost: 0, storeLv: 0,
    head: null, feet: null, body: null, necklace: null, ring: null,
    leftHand: null, rightHand: null,
    BAGMAX: 50, PETMAX: 10, caculate: 0,
    playerName: 'Jason',
    skillStatus: new BasicStatus(0,0,0,0,0,0,0),
    equipStatus: new BasicStatus(0,0,0,0,0,0,0),
    skillList: [], equipSkillList: [], itemList: [], titleList: [], petList: [],
  };
}

// ═══ 角色初始化 ═══

/**
 * 创建新角色 - 选择种族和年龄后调用
 * AS3 原始: Player.burn(param1:int, param2:Race): void
 */
export function playerBurn(state: PlayerState, age: number, race: Race): PlayerState {
  let s = { ...createInitialPlayerState(), playerName: state.playerName, age, race, lv: 1 };
  s.basicStatus = caculateInitStat(s);
  s = equipItem(s, new Weapon(EquipmentList[1] as WeaponData, 1));
  // 初始化基础技能（原 AS3 Player.burn 中注册的 12 个技能）
  const initSkills = [
    'COMBAT_MASTERY', 'SMASH', 'CRITICAL_HIT', 'COUNTERATTACK',
    'DEFENCE', 'MAGIC_MASTERY', 'FIREBOLT', 'ICEBOLT',
    'LIGHTNINGBOLT', 'BLACKSMITHING', 'RANGE_MASTERY', 'MIRAGE_MISSILE',
  ];
  for (const name of initSkills) {
    const sd = SkillDataList.find(d => d.name === name);
    if (sd) s = addSkill(s, sd);
  }
  s = updateAllInfo(s);
  return s;
}

/** AS3 原始: caculateInitStat */
function caculateInitStat(state: PlayerState): BasicStatus {
  if (!state.race) return new BasicStatus(0,0,0,0,0,0,0);
  return state.race.caculateStat(state.age);
}

// ═══ 属性计算 ═══

/**
 * 战斗力计算
 * 公式: CP = hp + mp*0.5 + str + int*0.2 + dex*0.1 + will*0.5 + luck*0.1 + apCost
 * AS3 原始: Player.get combatPower(): Number
 */
export function getCombatPower(state: PlayerState): number {
  const b = state.basicStatus;
  const s = state.skillStatus;
  const _loc1_ = b.hp + s.hp;
  const _loc2_ = b.mp + s.mp;
  const _loc3_ = b.str + s.str;
  const _loc4_ = b.intelligence + s.intelligence;
  const _loc5_ = b.dex + s.dex;
  const _loc6_ = b.will + s.will;
  const _loc7_ = b.luck + s.luck;
  const cp = _loc1_ + 0.5 * _loc2_ + _loc3_ + 0.2 * _loc4_ + 0.1 * _loc5_ + 0.5 * _loc6_ + 0.1 * _loc7_ + state.apCost;
  return cp < 1 ? 1 : cp;
}

/**
 * 经验需求公式
 * 公式: lv² * ((lv+1)² - 13*(lv+1) + 82)
 * AS3 原始: Player.getLevelExp(): int
 */
export function getLevelExp(state: PlayerState): number {
  if (state.lv >= 200) return -1;
  return state.lv * state.lv * ((state.lv + 1) * (state.lv + 1) - 13 * (state.lv + 1) + 82);
}

// ═══ 属性加成聚合 ═══

/** 三项属性汇总：基础 + 技能 + 装备 */
export function formula_StatAddUp(state: PlayerState, name: string): number {
  return as3Int((state.basicStatus as any)[name] + (state.skillStatus as any)[name] + (state.equipStatus as any)[name]);
}

/** 称号加成 */
export function formula_title_stat(state: PlayerState, value: number, name: string): number {
  value = as3Int(value);
  if (state.title) {
    const _loc3_: number = state.title.statMulList.length;
    let _loc4_: number = 0;
    while (_loc4_ < _loc3_) {
      if (state.title.statMulList[_loc4_].name === name) {
        value *= state.title.statMulList[_loc4_].mul;
        return as3Int(value + state.title.statMulList[_loc4_].add);
      }
      _loc4_++;
    }
  }
  return value;
}

// ═══ 派生属性 Getters ═══

/** 最小攻击力 = basic+skill+equip.attackMin + str/3 (+ dex/3 if ranged) */
export function getAttMin(state: PlayerState): number {
  let _loc2_: string = WeaponCategory.MELEE;
  if (state.leftHand) _loc2_ = state.leftHand.category;
  let _loc1_: number = state.basicStatus.attack.min + state.skillStatus.attack.min + state.equipStatus.attack.min + getStr(state) / 3;
  if (_loc2_ === WeaponCategory.RANGED) _loc1_ += getDex(state) / 3;
  return formula_title_stat(state, _loc1_, Stat.ATTACK);
}

/** 最大攻击力 = basic+skill+equip.attackMax + str/2.5 (+ dex/2.5 if ranged) */
export function getAttMax(state: PlayerState): number {
  let _loc2_: string = WeaponCategory.MELEE;
  if (state.leftHand) _loc2_ = state.leftHand.category;
  let _loc1_: number = state.basicStatus.attack.max + state.skillStatus.attack.max + state.equipStatus.attack.max + getStr(state) / 2.5;
  if (_loc2_ === WeaponCategory.RANGED) _loc1_ += getDex(state) / 2.5;
  return formula_title_stat(state, _loc1_, Stat.ATTACK);
}

/**
 * 实际攻击力 = attMin + (attMax - attMin) * balanceRandom(balance)
 * 其中 balanceRandom 使用玩家平衡值作为参数
 */
export function getAttack(state: PlayerState): number {
  const min = getAttMin(state);
  const max = getAttMax(state);
  if (min > max) return as3Int(max + (min - max) * balanceRandom(getBalance(state)));
  return as3Int(min + (max - min) * balanceRandom(getBalance(state)));
}

export function getHp(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.hp), Stat.hp); }
export function getMp(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.mp), Stat.mp); }
export function getStr(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.str), Stat.str); }
export function getDex(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.dex), Stat.dex); }
export function getIntelligence(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.intelligence), Stat.intelligence); }
export function getWill(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.will), Stat.will); }
export function getLuck(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.luck), Stat.luck); }
export function getDefence(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.defence), Stat.defence); }
export function getProtection(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.protection), Stat.protection); }

/** 平衡值: 基础+dex/4，上限100 */
export function getBalance(state: PlayerState): number {
  let _loc1_: number = formula_title_stat(state, formula_StatAddUp(state, Stat.balance) + (getDex(state) - 10) / 4, Stat.balance);
  if (_loc1_ > 100) _loc1_ = 100;
  return _loc1_;
}

/** 暴击率: 基础+will/5+luck/5 */
export function getCrit(state: PlayerState): number {
  return formula_title_stat(state, formula_StatAddUp(state, Stat.crit) + getWill(state) / 5 + getLuck(state) / 5, Stat.crit);
}

/** 暴击倍率: 基础+100 (百分比) */
export function getCritMul(state: PlayerState): number {
  return formula_title_stat(state, formula_StatAddUp(state, Stat.crit_mul) + 100, Stat.crit_mul);
}

/** 法术释放概率 */
export function getSpellChance(state: PlayerState): number {
  return formula_title_stat(state, formula_StatAddUp(state, Stat.spellChance) + getIntelligence(state) / 20, Stat.spellChance);
}

export function getProtectionIgnore(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.protectionIgnore), Stat.protectionIgnore); }
export function getProtectionReduce(state: PlayerState): number { return formula_title_stat(state, formula_StatAddUp(state, Stat.protectionReduce), Stat.protectionReduce); }

/** 魔法伤害加成 */
export function getMagicDamage(state: PlayerState): number {
  return formula_title_stat(state, formula_StatAddUp(state, Stat.magicDamage) + getIntelligence(state) / 20, Stat.magicDamage);
}

/** 魔法平衡值 = (int - 10)/4 + 30，上限 99 */
export function getMagicBalance(state: PlayerState): number {
  let _loc1_: number = as3Int((getIntelligence(state) - 10) / 4 + 30);
  if (_loc1_ > 99) _loc1_ = 99;
  return _loc1_;
}

// ═══ 资源管理 ═══

export function addGold(state: PlayerState, amount: number): PlayerState {
  if (state.gold <= 1000000000) {
    return { ...state, gold: state.gold + amount };
  }
  return state;
}

export function loseGold(state: PlayerState, amount: number): PlayerState {
  return { ...state, gold: state.gold - amount };
}

export function addExp(state: PlayerState, amount: number): PlayerState {
  if (getLevelExp(state) < 0) return state;
  const newXp = state.xp + amount;
  let s = { ...state, xp: newXp };
  if (newXp > getLevelExp(s)) {
    s = levelUp(s);
  }
  return s;
}

export function loseExp(state: PlayerState): PlayerState {
  const _loc1_: number = Math.floor(state.xp / 100);
  return { ...state, xp: state.xp - _loc1_ };
}

/**
 * 升级 - 提升等级并增长属性
 * AS3 原始: Player.levelUp()
 *
 * 年龄 < 25 岁：属性增长 = 种族年龄成长 / 4
 * 年龄 >= 25 岁：仅 hp/mp +1
 */
export function levelUp(state: PlayerState): PlayerState {
  const s = { ...state, lv: state.lv + 1, xp: 0 };
  if (s.age < 25 && s.race) {
    s.basicStatus = s.basicStatus.clone();
    s.basicStatus.hp += s.race.ageupList[s.age - 10].hp / 4 + 1;
    s.basicStatus.mp += s.race.ageupList[s.age - 10].mp / 4 + 1;
    s.basicStatus.str += s.race.ageupList[s.age - 10].str / 4;
    s.basicStatus.dex += s.race.ageupList[s.age - 10].dex / 4;
    s.basicStatus.will += s.race.ageupList[s.age - 10].will / 4;
    s.basicStatus.intelligence += s.race.ageupList[s.age - 10].intelligence / 4;
    s.basicStatus.luck += s.race.ageupList[s.age - 10].luck / 4;
  } else {
    s.basicStatus = s.basicStatus.clone();
    s.basicStatus.hp += 1;
    s.basicStatus.mp += 1;
  }
  s.ap += 1;
  return s;
}

/**
 * 年龄增长 - 每 2400 tick 触发一次
 * AS3 原始: Player.ageup()
 */
export function ageup(state: PlayerState): PlayerState {
  let s: PlayerState = { ...state, caculate: 0, age: state.age + 1 };
  s.basicStatus = s.basicStatus.clone();
  const growthInfo = getAgeGrowthInfo(state);
  s.basicStatus.hp += growthInfo.nextGrowth.hp;
  s.basicStatus.mp += growthInfo.nextGrowth.mp;
  s.basicStatus.str += growthInfo.nextGrowth.str;
  s.basicStatus.dex += growthInfo.nextGrowth.dex;
  s.basicStatus.will += growthInfo.nextGrowth.will;
  s.basicStatus.intelligence += growthInfo.nextGrowth.intelligence;
  s.basicStatus.luck += growthInfo.nextGrowth.luck;
  if (growthInfo.nextApGain > 0) s.ap += growthInfo.nextApGain;
  return s;
}

export interface AgeGrowthInfo {
  nextGrowth: {
    hp: number;
    mp: number;
    str: number;
    dex: number;
    will: number;
    intelligence: number;
    luck: number;
  };
  nextApGain: number;
  remainingTicks: number;
  timeToGrowup: string;
  tooltip: string;
}

export function getAgeGrowthInfo(state: PlayerState): AgeGrowthInfo {
  const nextGrowth = {
    hp: 1,
    mp: 1,
    str: 0,
    dex: 0,
    will: 0,
    intelligence: 0,
    luck: 0,
  };

  if (state.age < 25 && state.race) {
    const ageGrowth = state.race.ageupList[state.age - 10];
    if (ageGrowth) {
      nextGrowth.hp = ageGrowth.hp + 1;
      nextGrowth.mp = ageGrowth.mp + 1;
      nextGrowth.str = ageGrowth.str;
      nextGrowth.dex = ageGrowth.dex;
      nextGrowth.will = ageGrowth.will;
      nextGrowth.intelligence = ageGrowth.intelligence;
      nextGrowth.luck = ageGrowth.luck;
    }
  }

  let nextApGain = state.age < 25 ? 17 - state.age : 0;
  if (nextApGain < 1 && state.age <= 25) nextApGain = 1;
  if (state.age >= 25) nextApGain = 0;

  const tickInCycle = state.caculate % 2400;
  const remainingTicks = 2400 - tickInCycle;
  const minutes = Math.trunc(remainingTicks / 120);
  const seconds = Math.trunc((remainingTicks - minutes * 120) / 2);
  const timeToGrowup = `${minutes}:${seconds}`;
  const tooltip = [
    '年龄增长时:',
    `Hp   +${nextGrowth.hp}`,
    `Mp   +${nextGrowth.mp}`,
    `力量 +${nextGrowth.str}`,
    `敏捷 +${nextGrowth.dex}`,
    `意志 +${nextGrowth.will}`,
    `智力 +${nextGrowth.intelligence}`,
    `幸运 +${nextGrowth.luck}`,
    `AP   +${nextApGain}`,
    `长大还剩:${timeToGrowup}`,
  ].join('\n');

  return { nextGrowth, nextApGain, remainingTicks, timeToGrowup, tooltip };
}

// ═══ 背包管理 ═══

export function addItem(state: PlayerState, item: Equipment): { state: PlayerState; added: boolean } {
  if (state.itemList.length >= state.BAGMAX) return { state, added: false };
  return { state: { ...state, itemList: [...state.itemList, item] }, added: true };
}

export function removeItem(state: PlayerState, item: Equipment): PlayerState {
  const idx = state.itemList.indexOf(item);
  if (idx >= 0) {
    const newList = [...state.itemList];
    newList.splice(idx, 1);
    return { ...state, itemList: newList };
  }
  return state;
}

// ═══ 装备管理 ═══

const EQUIP_SLOTS = ['leftHand', 'rightHand', 'feet', 'head', 'necklace', 'ring', 'body'];

export function equipItem(state: PlayerState, item: Equipment): PlayerState {
  const target = getEquipTarget(item, state);
  if (!target) return state;

  const itemWasInInventory = state.itemList.includes(item);
  const base = itemWasInInventory ? removeItem(state, item) : state;
  const displaced = target.clearSlots
    .map(slot => (base as any)[slot] as Equipment | null)
    .filter((equip): equip is Equipment => !!equip && equip !== item);

  if (base.itemList.length + displaced.length > base.BAGMAX) {
    return state;
  }

  let s: PlayerState = {
    ...base,
    itemList: [...base.itemList, ...displaced],
  };
  for (const slot of target.clearSlots) {
    s = { ...s, [slot]: null };
  }

  if (item.position === WeaponHand.ONEHAND || item.position === WeaponHand.OFFHAND || item.position === WeaponHand.TWOHAND) {
    switch (item.position) {
      case WeaponHand.ONEHAND:
        s = { ...s, leftHand: item };
        break;
      case WeaponHand.OFFHAND:
        s = { ...s, rightHand: item };
        break;
      case WeaponHand.TWOHAND:
        s = { ...s, leftHand: item };
        break;
    }
  } else {
    (s as any)[item.position] = item;
  }
  s = updateAllInfo(s);
  return s;
}

function getEquipTarget(item: Equipment, state: PlayerState): { equipSlot: string; clearSlots: string[] } | null {
  if (item.position === WeaponHand.ONEHAND || item.position === WeaponHand.OFFHAND || item.position === WeaponHand.TWOHAND) {
    switch (item.position) {
      case WeaponHand.ONEHAND:
        return { equipSlot: 'leftHand', clearSlots: ['leftHand'] };
      case WeaponHand.OFFHAND:
        return {
          equipSlot: 'rightHand',
          clearSlots: state.leftHand?.position === WeaponHand.TWOHAND ? ['rightHand', 'leftHand'] : ['rightHand'],
        };
      case WeaponHand.TWOHAND:
        return { equipSlot: 'leftHand', clearSlots: ['leftHand', 'rightHand'] };
      default:
        return null;
    }
  }
  if (!EQUIP_SLOTS.includes(item.position)) return null;
  return { equipSlot: item.position, clearSlots: [item.position] };
}

export function getEquipmentComparisonSlot(item: Equipment, state: PlayerState): Equipment | null {
  const target = getEquipTarget(item, state);
  if (!target) return null;
  return (state as any)[target.equipSlot] ?? null;
}

export function unequipItem(state: PlayerState, slot: string): PlayerState {
  if (!EQUIP_SLOTS.includes(slot)) return state;
  const item = (state as any)[slot];
  if (!item) return state;
  const result = addItem(state, item);
  if (!result.added) return state;
  return updateAllInfo({ ...result.state, [slot]: null });
}

// ═══ 技能管理 ═══

export function addSkill(state: PlayerState, skillData: any): PlayerState {
  if (state.skillList.find(s => s.skillData.name === skillData.name)) return state;
  return { ...state, skillList: [...state.skillList, new Skill(skillData)] };
}

export function equipSkill(state: PlayerState, skill: Skill): PlayerState {
  if (state.equipSkillList.includes(skill)) return state;
  if (skill.skillData.type !== SkillType.ATTACK && skill.skillData.type !== SkillType.DEFENCE) return state;
  if (!state.skillList.includes(skill)) return state;
  return { ...state, equipSkillList: [...state.equipSkillList, skill] };
}

export function unequipSkill(state: PlayerState, skill: Skill): PlayerState {
  const idx = state.equipSkillList.indexOf(skill);
  if (idx >= 0) {
    const newList = [...state.equipSkillList];
    newList.splice(idx, 1);
    return { ...state, equipSkillList: newList };
  }
  return state;
}

// ═══ 状态重算 ═══

/**
 * 重新计算技能属性加成
 * AS3 原始: Player.updateSkillInfo()
 */
function getCurrentWeaponCategory(state: PlayerState): string {
  return state.leftHand?.category ?? WeaponCategory.MELEE;
}

function isBattleSkillEligible(state: PlayerState, skill: Skill, type: string): boolean {
  const data = skill.skillData;
  if (data.type !== type) return false;
  const weaponCategory = getCurrentWeaponCategory(state);
  return data.category === SkillCategory.ALL ||
    data.category === SkillCategory.MAGIC ||
    data.category === weaponCategory;
}

export function getAttackSkillList(state: PlayerState): Skill[] {
  return state.equipSkillList.filter(skill => isBattleSkillEligible(state, skill, SkillType.ATTACK));
}

export function getDefenceSkillList(state: PlayerState): Skill[] {
  return state.equipSkillList.filter(skill => isBattleSkillEligible(state, skill, SkillType.DEFENCE));
}

export function updateSkillInfo(state: PlayerState): PlayerState {
  const skillStatus = new BasicStatus(0,0,0,0,0,0,0);
  let _loc4_: number = 0;
  while (_loc4_ < state.skillList.length) {
    const _loc2_ = state.skillList[_loc4_].skillData;
    const _loc3_ = state.skillList[_loc4_].level;
    let _loc5_: number = 0;
    while (_loc5_ < _loc2_.statList[_loc3_].length) {
      (skillStatus as any)[_loc2_.statList[_loc3_][_loc5_].name] += _loc2_.statList[_loc3_][_loc5_].value;
      _loc5_++;
    }
    if (_loc2_.effectList && state.leftHand && state.leftHand.category === _loc2_.category) {
      _loc5_ = 0;
      while (_loc5_ < _loc2_.effectList[_loc3_].length) {
        if (_loc2_.effectList[_loc3_][_loc5_].name === Stat.attackMin) {
          skillStatus.attack.min += _loc2_.effectList[_loc3_][_loc5_].value;
        } else if (_loc2_.effectList[_loc3_][_loc5_].name === Stat.attackMax) {
          skillStatus.attack.max += _loc2_.effectList[_loc3_][_loc5_].value;
        } else {
          (skillStatus as any)[_loc2_.effectList[_loc3_][_loc5_].name] += _loc2_.effectList[_loc3_][_loc5_].value;
        }
        _loc5_++;
      }
    }
    _loc4_++;
  }
  return { ...state, skillStatus };
}

/**
 * 重新计算装备属性加成
 * AS3 原始: Player.updateEquipInfo()
 */
/**
 * 一次性重算全部状态（装备 + 技能属性加成）
 * AS3 原始: Player.updateAllInfo()
 */
export function updateAllInfo(state: PlayerState): PlayerState {
  let s = updateEquipInfo(state);
  s = updateSkillInfo(s);
  return s;
}

export function updateEquipInfo(state: PlayerState): PlayerState {
  const equipStatus = new BasicStatus(0,0,0,0,0,0,0);
  let _loc2_: number = 0;
  while (_loc2_ < EQUIP_SLOTS.length) {
    const equip = (state as any)[EQUIP_SLOTS[_loc2_]] as Equipment | null;
    if (equip) {
      addEquipStats(equipStatus, equip.basicStat);
      addEquipStats(equipStatus, equip.qualityStat);
      addEquipStats(equipStatus, equip.levelStat);
    }
    _loc2_++;
  }
  return { ...state, equipStatus };
}

function addEquipStats(target: BasicStatus, stats: any[]): void {
  if (!stats) return;
  let _loc5_: number = 0;
  while (_loc5_ < stats.length) {
    if (stats[_loc5_].name === Stat.attackMin) {
      target.attack.min += stats[_loc5_].value;
    } else if (stats[_loc5_].name === Stat.attackMax) {
      target.attack.max += stats[_loc5_].value;
    } else if (stats[_loc5_].name === Stat.ATTACK) {
      target.attack.min += stats[_loc5_].value;
      target.attack.max += stats[_loc5_].value;
    } else {
      (target as any)[stats[_loc5_].name] += stats[_loc5_].value;
    }
    _loc5_++;
  }
}

// ═══ 宠物管理 ═══

export function addPet(state: PlayerState, pet: any): { state: PlayerState; added: boolean } {
  if (state.petList.length >= state.PETMAX) return { state, added: false };
  return { state: { ...state, petList: [...state.petList, pet] }, added: true };
}

export function setPet(state: PlayerState, pet: any): PlayerState {
  if (state.pet === pet) return { ...state, pet: null };
  const nextPetList = state.petList.filter(item => item !== pet);
  if (state.pet) {
    nextPetList.push(state.pet);
  }
  return { ...state, pet, petList: nextPetList };
}

export function removePet(state: PlayerState, pet: any): PlayerState {
  if (state.pet === pet) return { ...state, pet: null };
  return { ...state, petList: state.petList.filter(item => item !== pet) };
}

// ═══ 称号 ═══

export function addTitle(state: PlayerState, title: TitleData): PlayerState {
  const index = state.titleList.findIndex(item => item.name === title.name);
  if (index >= 0) {
    const titleList = [...state.titleList];
    titleList[index] = { ...titleList[index], ...title, isGot: true };
    return { ...state, titleList };
  }
  return { ...state, titleList: [...state.titleList, title] };
}

export function setTitle(state: PlayerState, title: TitleData): PlayerState {
  if (state.title?.name === title.name) return { ...state, title: null };
  const ownedTitle = state.titleList.find(item => item.name === title.name);
  if (!ownedTitle?.isGot && !title.isGot) return state;
  return { ...state, title: ownedTitle ?? title };
}

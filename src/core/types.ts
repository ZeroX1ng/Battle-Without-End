// ═══ 范围数值基类 ═══
// AS3 原始: iData.iNumber.RangeNumber

import type { BasicStatus } from './models/BasicStatus';
import type { Battle } from './models/Battle';
import type { Equipment } from './models/Equipment';
import type { Pet } from './models/Pet';
import type { Race } from './models/Race';
import type { Skill } from './models/Skill';

export interface RangeNumber {
  min: number;
  max: number;
}

// ═══ 伤害数值（对映原 BasicStatus 的 attack 子对象） ═══
// AS3 原始: iData.iNumber.DamageNumber extends RangeNumber

export interface DamageNumber extends RangeNumber {
  getByBalance(balance: number): number;
}

// ═══ 基础属性值对象（18个属性） ═══
// AS3 原始: iData.BasicStatus

export interface BasicStatusData {
  hp: number;
  mp: number;
  str: number;
  dex: number;
  intelligence: number;
  will: number;
  luck: number;
  attack: DamageNumber;
  balance: number;
  crit: number;
  crit_mul: number;
  defence: number;
  protection: number;
  spellChance: number;
  manaConsumption: number;
  protectionIgnore: number;
  protectionReduce: number;
  magicDamage: number;
}

// ═══ 属性条目（Stat 数据类） ═══
// AS3 原始: iData.iItem.Stat

export interface StatData {
  name: string;
  value: number;
}

// ═══ 范围属性（装备生成用） ═══
// AS3 原始: iData.iItem.RangeStat

export interface RangeStatData {
  name: string;
  valueMin: number;
  changeRange: number;
}

// ═══ 属性倍率（称号/怪物标题用） ═══
// AS3 原始: iData.iMonster.StatMul

export interface StatMulData {
  name: string;
  mul: number;
  add: number;
}

// ═══ 种族年龄成长属性 ═══
// AS3 原始: iData.BasicStatus（作为 ageupList 的条目）

export type AgeUpStat = BasicStatusData;

// ═══ 种族数据 ═══
// AS3 原始: iData.Race

export interface RaceData {
  name: string;
  initial: BasicStatusData;
  ageupList: BasicStatusData[];
}

// ═══ 怪物数据 ═══
// AS3 原始: iData.iMonster.MonsterData

export interface MonsterData {
  sourceKey?: string;
  name: string;
  realName: string;
  hp: number;
  attack: { min: number; max: number };
  balance: number;
  crit: number;
  crit_mul: number;
  defence: number;
  protection: number;
  CP: number;
  exp?: number;
  money?: number;
}

// ═══ 怪物标题 ═══
// AS3 原始: iData.iMonster.MonsterTitle

export interface MonsterTitleData {
  name: string;
  statMulList: StatMulData[];
  goldMul: number;
  xpMul: number;
  dropMul: number;
}

// ═══ 地图数据 ═══
// AS3 原始: iData.iMap.MapData

export interface MapData {
  x: number;
  y: number;
  name: string;
  realName: string;
  modifier: number;
  monsterList: MonsterData[];
  petList: PetData[];
}

// ═══ 装备基础数据 ═══
// AS3 原始: iData.iItem.EquipmentData

export interface EquipmentData {
  name: string;
  realName: string;
  type: string;
  position: string;
  stat: RangeStatData[];
  sortWeight: number;
}

// ═══ 武器基础数据 ═══
// AS3 原始: iData.iItem.WeaponData

export interface WeaponData extends EquipmentData {
  category: string;
}

// ═══ 装备实例数据 ═══
// AS3 原始: iData.iItem.Equipment

export interface EquipmentInstance {
  position: string;
  type: string;
  name: string;
  realName: string;
  level: number;
  quality: number;
  basicStat: StatData[];
  qualityStat: StatData[];
  levelStat: StatData[];
  sortWeight: number;
  ratio: number;
  isBoss: boolean;
  getMoney(): number;
  save(): string;
  getNameHTML(): string;
}

// ═══ 武器实例数据 ═══
// AS3 原始: iData.iItem.Weapon

export interface WeaponInstance extends EquipmentInstance {
  category: string;
  position: string;
}

// ═══ 技能基础数据 ═══
// AS3 原始: iData.iSkill.SkillData

export interface SkillData {
  name: string;
  realName?: string;
  category: string;
  type: string;
  statList: StatData[][];
  effectList?: StatData[][];
  lvupCostList: number[];
  /** 主动技能参数表 (按等级索引) */
  setList?: Array<number | number[]>;
  /** 主动技能 MP 消耗表 (按等级索引) */
  mpCostList?: number[];
  desFunction?: (skill: Skill) => string;
  behaveFunction?: (skill: Skill, battle: Battle, playerState?: PlayerState) => BattleBehaviorResult;
}

/** 技能行为函数返回值 */
export interface BattleBehaviorResult {
  success: boolean;
  logs: string[];
  playerHpDelta: number;
  playerMpDelta: number;
  monsterHpDelta: number;
}

// ═══ 技能实例 ═══
// AS3 原始: iData.iSkill.Skill

export interface SkillInstance {
  level: number;
  skillData: SkillData;
  canLevelup(): boolean;
  levelup(): void;
  getDescription(): string;
  save(): string;
}

// ═══ BUFF 数据 ═══
// AS3 原始: iData.iSkill.iBuff.Buff

export interface BuffData {
  name: string;
  count: number;
  turn: number;
  maxTurn: number;
  perValue: number;
  run(context?: { monsterHp: number; monsterNameHtml?: string }): string | null;
  isOver(): boolean;
  combine(other: BuffData): void;
}

// ═══ 宠物类型 ═══
// AS3 原始: iData.iPet.PetType

export interface PetTypeData {
  type: string;
  startMin: PetStatsData;
  startRange: PetStatsData;
  growMin: PetStatsData;
  growRange: PetStatsData;
}

// ═══ 宠物基础数据 ═══
// AS3 原始: iData.iPet.PetData

export interface PetData {
  name: string;
  realName: string;
  mc: string;
  type: PetTypeData;
}

// ═══ 宠物属性 ═══
// AS3 原始: iData.iPet.PetStats

export interface PetStatsData {
  hp: number;
  mp: number;
  attmin: number;
  attmax: number;
  def: number;
  pro: number;
  balance: number;
  cri: number;
  criMul: number;
  magAtt: number;
}

// ═══ 宠物技能 ═══
// AS3 原始: iData.iPet.iPetSkill.PetSkillData + AttackPetSkillData + DefencePetSkillData + PassivePetSkillData

export type PetSkillCategory = 'attack' | 'defence' | 'passive';

/**
 * 宠物技能静态数据定义
 * AS3 原始: iData.iPet.iPetSkill.PetSkillData
 */
export interface PetSkillData {
  name: string;
  realName: string;
  category: PetSkillCategory;
  setList: [number[], number[]];
  behaveFunction?: (skill: PetSkillInstance, battle: Battle, pet: Pet, playerState?: PlayerState) => BattleBehaviorResult;
  desFunction?: (skill: PetSkillInstance) => string;
}

/**
 * 宠物技能运行时实例
 * AS3 原始: iData.iPet.iPetSkill.PetSkill
 * level: 0=基础级, 1=进阶级
 */
export interface PetSkillInstance {
  skillData: PetSkillData;
  level: number;
  getName(): string;
  getRealName(): string;
  getDescription(): string;
  getSetArray(): number[];
  save(): string;
}

// ═══ 宠物实例 ═══
// AS3 原始: iData.iPet.Pet

export interface PetInstance {
  type: string;
  mc_name: string;
  realName: string;
  level: number;
  exp: number;
  startStat: PetStatsData;
  growStat: PetStatsData;
  currentStat: PetStatsData;
  skillList: PetSkillInstance[];
  hp: number;
  mp: number;
  attmin: number;
  attmax: number;
  attack: number;
  defence: number;
  pro: number;
  balance: number;
  cri: number;
  crimul: number;
  magicatt: number;
  getTypeLabel(): string;
  getDescription(): string;
  getAttackSkill(): PetSkillInstance[];
  getSkill(data: PetSkillData): PetSkillInstance | null;
  addExp(exp: number, playerLevel?: number): string[];
  save(): string;
}

// ═══ 称号数据 ═══
// AS3 原始: iData.iPlayer.Title

export interface TitleData {
  name: string;
  realName: string;
  statMulList: StatMulData[];
  description: string;
  maxFix: number;
  countFix: number;
  max: number;
  count: number;
  isGot: boolean;
  load(data: string): void;
  save(): string;
}

// ═══ 全局配置 ═══
// AS3 原始: iGlobal.Global（仅保留数据部分，UI引用用 state 替代）

export interface GlobalConfig {
  battle_toggle: boolean;
  battleIntro_toggle: boolean;
  money_toggle: boolean;
  exp_toggle: boolean;
  item_toggle: boolean;
  other_toggle: boolean;
  item0_toggle: boolean;
  item1_toggle: boolean;
  item2_toggle: boolean;
  item3_toggle: boolean;
  item4_toggle: boolean;
  item5_toggle: boolean;
  sword_toggle: boolean;
  axe_toggle: boolean;
  bow_toggle: boolean;
  crossbow_toggle: boolean;
  sceptre_toggle: boolean;
  staff_toggle: boolean;
  tome_toggle: boolean;
  shield_toggle: boolean;
  dagger_toggle: boolean;
  body_light_toggle: boolean;
  body_medium_toggle: boolean;
  body_heavy_toggle: boolean;
  head_light_toggle: boolean;
  head_medium_toggle: boolean;
  head_heavy_toggle: boolean;
  feet_light_toggle: boolean;
  feet_medium_toggle: boolean;
  feet_heavy_toggle: boolean;
  necklace_toggle: boolean;
  ring_toggle: boolean;
  autoSell_toggle: boolean;
  sound_toggle: boolean;
}

// ═══ 战斗状态 ═══
// AS3 原始: iData.Battle

export interface BattleState {
  turn: number;
  playerHp: number;
  playerMp: number;
  monster: MonsterInstance | null;
  monsterHp: number;
  petHp: number;
  petMp: number;
  pet: PetInstance | null;
  boss: any | null;
}

// ═══ 怪物实例 ═══
// AS3 原始: iData.iMonster.Monster

export interface MonsterInstance {
  title: MonsterTitleData | null;
  data: MonsterData;
  buffList: BuffData[];
  CP: number;
  money: number;
  exp: number;
  dropRate: number;
  attack: number;
  hp: number;
  balance: number;
  crit: number;
  crit_mul: number;
  defence: number;
  protection: number;
  nameHtml: string;
  addBuff(buff: BuffData): void;
  runBuff(context?: { monsterHp: number; monsterNameHtml?: string }): string[];
  removeBuff(): void;
  isContainBuff(name: string): BuffData | null;
  dropItem(): void;
  dropPet(): void;
}

// ═══ 战利品统计状态 ═══
// AS3 原始: iPanel.iScene.iPanel.LootPanel
// 追踪当前地图的掉落统计：金币/经验/6品质装备

export interface LootState {
  money: number;
  exp: number;
  basic: number;
  magic: number;
  rare: number;
  perfect: number;
  epic: number;
  legendary: number;
}

// Shop stock owned by game state, matching AS3 Global.shopPanel lifetime.
export interface ShopStockItem {
  equip: Equipment;
  price: number;
}

export interface ShopState {
  sellItems: ShopStockItem[];
  gambleItems: ShopStockItem[];
}

// ═══ 确认弹窗状态 ═══

export interface ConfirmState {
  message: string;
  prevScene: string;
}

// ═══ 游戏主状态 ═══
// 统一管理整个游戏的数据

export interface GameState {
  scene: string;
  player: PlayerState;
  battle: Battle | null;
  config: GlobalConfig;
  activeSaveSlot: string | null;
  ui: UIState;
  loot: LootState;
  shop: ShopState;
  tick: number;
  isRebirth: boolean;
  confirm: ConfirmState | null;
  pendingEffects?: unknown[];
}

// ═══ 玩家状态 ═══
// AS3 原始: iGlobal.Player（静态变量提取）
// 注意：这些字段的类型在运行时是 models/ 中的类实例，
// 接口定义仅用于类型文档化，实际类型由 models/ 导出。

export interface PlayerState {
  lv: number;
  age: number;
  race: Race | null;
  basicStatus: BasicStatus;
  ap: number;
  gold: number;
  xp: number;
  pet: Pet | null;
  title: TitleData | null;
  apCost: number;
  storeLv: number;
  head: Equipment | null;
  feet: Equipment | null;
  body: Equipment | null;
  necklace: Equipment | null;
  ring: Equipment | null;
  leftHand: Equipment | null;
  rightHand: Equipment | null;
  BAGMAX: number;
  PETMAX: number;
  caculate: number;
  playerName: string;
  skillStatus: BasicStatus;
  equipStatus: BasicStatus;
  skillList: Skill[];
  equipSkillList: Skill[];
  itemList: Equipment[];
  titleList: TitleData[];
  petList: Pet[];
  _logs?: GameLog[];
}

// ═══ UI 状态 ═══

export interface UIState {
  activeWindow: string | null;
  infoMessages: InfoMessage[];
}

// ═══ 信息消息 ═══
// AS3 原始: MainScene.allInfoPanel.addText 的参数

export interface InfoMessage {
  id: number;
  text: string;
  category?: string;
  timestamp: number;
}

export interface GameLog {
  text: string;
  category?: string;
}

// ═══ 存档数据 ═══

export interface SaveData {
  userName: string;
  slot: string;
  time: string;
  info: string;
}

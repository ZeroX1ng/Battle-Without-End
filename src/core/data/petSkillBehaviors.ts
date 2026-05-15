// ═══ 宠物技能战斗行为函数 + 描述函数 ═══
// AS3 原始: iData.iPet.iPetSkill.PetSkillList 中所有 behave_* / des_* / 辅助函数
//
// 宠物攻击技能：冰刃/火球/雷击，通过魔法攻击造成伤害并附加 Buff 效果。

import type { BattleBehaviorResult } from '../types';
import { BuffBurn, BuffFrozen, BuffCorrosion } from '../models/Buff';
import { getCombatPower } from '../models/Player';
import { balanceRandom } from '../math/MyMath';

const CR = 50;
const RED = '#ff4040';

function noop(): BattleBehaviorResult {
  return { success: false, logs: [], playerHpDelta: 0, playerMpDelta: 0, monsterHpDelta: 0 };
}

// ═══ 辅助函数 ═══

function calcProtection(p: number): number {
  if (p >= 0) return 0.06 * p / (1 + 0.06 * p);
  if (p < -1000) return -1;
  return -(1 - Math.pow(0.94, -p));
}

function monsterPro(battle: any): number {
  if (!battle.monster) return 1;
  return 1 - calcProtection(battle.monster.protection);
}

function petGetCritMul(battle: any, pet: any, extraCrit: number = 0): number {
  let cr = pet.cri - (battle.monster ? battle.monster.protection * 2 : 0);
  if (cr < 0 && extraCrit > 0) {
    cr = extraCrit;
  } else {
    cr += extraCrit;
  }
  if (cr > CR) cr = CR;
  if (Math.random() * 100 < cr) return pet.crimul / 100;
  return 1;
}

function petTraceAttackInfo(battle: any, pet: any, skillName: string, damage: number, critMul: number): string {
  const monName = battle.monster ? battle.monster.getNameHtml(getCombatPower(battle.playerState)) : '怪物';
  if (critMul > 1) {
    return `你的宠物使用了<font color='${RED}'>${skillName}</font>,对${monName}造成了<font color='${RED}' size='20'> ${damage}!</font>伤害.`;
  }
  return `你的宠物使用了<font color='${RED}'>${skillName}</font>,对${monName}造成了<font color='${RED}'> ${damage}</font>伤害.`;
}

function getSetArray(skill: any): number[] {
  return skill.level ? skill.skillData.setList[1] : skill.skillData.setList[0];
}

// ═══ 行为函数 ═══

/** ICE_SPEAR - 冰刃: 魔法伤害 + 冰冻 */
export function pet_behave_ice_spear(skill: any, battle: any, pet: any): BattleBehaviorResult {
  const params = getSetArray(skill);
  if (battle.petMp < params[3]) return noop();
  battle.petMp -= params[3];
  const critMul = petGetCritMul(battle, pet);
  let damage = Math.floor((params[0] + params[1] * pet.level) * pet.magicatt / 100 * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  if (params.length > 5) {
    if (Math.random() < 0.1) {
      battle.monster.addBuff(new BuffFrozen(params[5]));
    }
  } else {
    battle.monster.addBuff(new BuffFrozen(params[2]));
  }
  return {
    success: true,
    logs: [petTraceAttackInfo(battle, pet, skill.getRealName(), damage, critMul)],
    playerHpDelta: 0, playerMpDelta: 0, monsterHpDelta: -damage,
  };
}

/** FIREBALL - 火球: 魔法伤害 + 灼伤 */
export function pet_behave_fireball(skill: any, battle: any, pet: any): BattleBehaviorResult {
  const params = getSetArray(skill);
  if (battle.petMp < params[2]) return noop();
  battle.petMp -= params[2];
  const critMul = petGetCritMul(battle, pet);
  let damage = Math.floor((params[0] + params[1] * pet.level) * pet.magicatt / 100 * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  const burnVal = Math.floor(params[3] * pet.level * pet.magicatt / 100);
  battle.monster.addBuff(new BuffBurn(burnVal));
  return {
    success: true,
    logs: [petTraceAttackInfo(battle, pet, skill.getRealName(), damage, critMul)],
    playerHpDelta: 0, playerMpDelta: 0, monsterHpDelta: -damage,
  };
}

/** THUNDER - 雷击: 魔法伤害 + 腐蚀 */
export function pet_behave_thunder(skill: any, battle: any, pet: any): BattleBehaviorResult {
  const params = getSetArray(skill);
  if (battle.petMp < params[4]) return noop();
  battle.petMp -= params[4];
  const critMul = petGetCritMul(battle, pet);
  let damage = Math.floor((params[0] + params[1] * pet.level) * pet.magicatt / 100 * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  battle.monster.addBuff(new BuffCorrosion(params[2] + params[3] * pet.level));
  return {
    success: true,
    logs: [petTraceAttackInfo(battle, pet, skill.getRealName(), damage, critMul)],
    playerHpDelta: 0, playerMpDelta: 0, monsterHpDelta: -damage,
  };
}

// ═══ 描述函数 ═══

const ORANGE = '#ff7100';

function yellowText(s: string): string {
  return `<font color='${ORANGE}'>${s}</font>`;
}

export function pet_des_counterattack(skill: any): string {
  const p = getSetArray(skill);
  return `当受伤时,${yellowText(String(p[0]))}%的机会反击,反击伤害为宠物正常伤害的${yellowText(String(p[1]))}%`;
}

export function pet_des_injury_resile(skill: any): string {
  const p = getSetArray(skill);
  return `当受伤时,${yellowText(String(p[0]))}%的机会反震,反震伤害为所受伤害的${yellowText(String(p[1]))}%`;
}

export function pet_des_dodge(skill: any): string {
  const p = getSetArray(skill);
  return `${yellowText(String(p[0]))}%几率回避伤害`;
}

export function pet_des_taunt(skill: any): string {
  const p = getSetArray(skill);
  return `吸引怪兽注意力,强制他攻击自己,降低所受伤害的${yellowText(String(p[0]))}%`;
}

export function pet_des_aggressive(skill: any): string {
  const p = getSetArray(skill);
  return `增加宠物的攻击力 ${yellowText(String(p[0]))}*等级`;
}

export function pet_des_defensive(skill: any): string {
  const p = getSetArray(skill);
  return `增加宠物防御力 ${yellowText(String(p[0]))}*等级`;
}

export function pet_des_protective(skill: any): string {
  const p = getSetArray(skill);
  return `增加宠物护甲 ${yellowText(String(p[0]))}*等级`;
}

export function pet_des_strong(skill: any): string {
  const p = getSetArray(skill);
  return `增加宠物Hp ${yellowText(String(p[0]))}*等级`;
}

export function pet_des_wisdom(skill: any): string {
  const p = getSetArray(skill);
  return `增加宠物Mp ${yellowText(String(p[0]))}*等级`;
}

export function pet_des_wise(skill: any): string {
  const p = getSetArray(skill);
  return `增加宠物魔法攻击 ${yellowText(String(p[0]))}*等级`;
}

export function pet_des_slayer(skill: any): string {
  const p = getSetArray(skill);
  return `增加宠物暴击率 ${yellowText(String(p[0]))}%, 暴击倍数*2`;
}

export function pet_des_life_drain(skill: any): string {
  const p = getSetArray(skill);
  return `当宠物造成物理伤害,回复宠物生命. 回复造成伤害的${yellowText(String(p[0]))}%`;
}

export function pet_des_good_or_evil(skill: any): string {
  const p = getSetArray(skill);
  return `当造成物理伤害,${yellowText(String(p[0]))}%机会造成两倍伤害,${yellowText(String(100 - p[0]))}%机会为敌方回复生命`;
}

export function pet_des_ice_spear(skill: any): string {
  const p = getSetArray(skill);
  let s = `消耗${yellowText(String(p[3]))}魔法, 造成${yellowText(String(p[0]))}+${yellowText(String(p[1]))}*等级的伤害.<br/> 附加效果: 冰冻(使敌方${yellowText(String(p[2]))}回合无法行动`;
  if (skill.level && p.length > 5) {
    s += `,${yellowText(String(p[4]))}%几率冰冻${yellowText(String(p[5]))}回合`;
  }
  return s + ')';
}

export function pet_des_fireball(skill: any): string {
  const p = getSetArray(skill);
  return `消耗${yellowText(String(p[2]))}魔法, 造成${yellowText(String(p[0]))}+${yellowText(String(p[1]))}*等级的伤害.<br/> 附加效果: 灼伤(造成敌人${yellowText(String(p[3]))}*等级的伤害每回合,可叠加)`;
}

export function pet_des_thunder(skill: any): string {
  const p = getSetArray(skill);
  return `消耗${yellowText(String(p[4]))}魔法, 造成${yellowText(String(p[0]))}+${yellowText(String(p[1]))}*等级的伤害.<br/> 附加效果: 破甲(减少敌方${yellowText(String(p[2]))}+${yellowText(String(p[3]))}*等级的护甲,可叠加)`;
}

export function pet_des_doubleHit(skill: any): string {
  const p = getSetArray(skill);
  return `当普通攻击时,有${yellowText(String(p[0]))}%的机会再次攻击`;
}

export function pet_des_meditation(skill: any): string {
  const p = getSetArray(skill);
  return `每回合,回复自身和玩家${yellowText(String(p[0]))}*等级的Mp`;
}

export function pet_des_heal(skill: any): string {
  const p = getSetArray(skill);
  return `每回合,回复自身和玩家${yellowText(String(p[0]))}*等级的Hp`;
}

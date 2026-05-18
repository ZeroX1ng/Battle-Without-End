// ═══ 玩家技能战斗行为函数 + 描述函数 ═══
// AS3 原始: iData.iSkill.SkillDataList 中所有 behave_* / des_* / 辅助函数
//
// 行为函数接收 Battle 实例和 PlayerState，直接修改战斗状态，
// 返回 BattleBehaviorResult 包含 HP/MP 变化和日志消息。

import type { BattleBehaviorResult } from '../types';
import { SkillCategory } from '../constants';
import { balanceRandom } from '../math/MyMath';
import { BuffBurn, BuffFrozen, BuffPoison, BuffCorrosion } from '../models/Buff';
import {
  getAttack, getCrit, getCritMul,
  getDefence, getProtection, getProtectionReduce, getProtectionIgnore,
  getCombatPower, getStr, getDex, getIntelligence, getWill,
  getMagicDamage, getMagicBalance, getHp,
} from '../models/Player';
import { statTranslate } from '../constants';
import { updateTitleInfo } from './titleData';

const CR = 50;
const GREEN = '#4BB814';
const YELLOW = '#FFA640';
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
  const m = battle.monster;
  if (!m) return 1;
  const p = m.protection - getProtectionReduce(battle.playerState) - getProtectionIgnore(battle.playerState);
  return 1 - calcProtection(p);
}

function skillGetCritMul(battle: any, extraCrit: number = 0): number {
  const player = battle.playerState;
  const mon = battle.monster;
  let cr = getCrit(player) - (mon ? mon.protection - getProtectionReduce(player) : 0) * 2;
  if (cr < 0 && extraCrit > 0) {
    cr = extraCrit;
  } else {
    cr += extraCrit;
  }
  if (cr > CR) cr = CR;
  if (Math.random() * 100 < cr) return getCritMul(player) / 100;
  return 1;
}

function traceAttackInfo(battle: any, skillName: string, damage: number, critMul: number): string {
  const monName = battle.monster ? battle.monster.getNameHtml(getCombatPower(battle.playerState)) : '怪物';
  if (critMul > 1) {
    return `你使用了<font color='${RED}'>${skillName}</font>,对${monName}造成了<font color='${RED}' size='20'> ${damage}!</font>伤害.`;
  }
  return `你使用了<font color='${RED}'>${skillName}</font>,对${monName}造成了<font color='${RED}'> ${damage}</font>伤害.`;
}

// ═══ 行为函数 ═══

export function behave_smash(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  const critMul = skillGetCritMul(battle);
  let damage = Math.floor((getAttack(battle.playerState) * critMul * params / 100 - battle.monster.defence) * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  return {
    success: true,
    logs: [traceAttackInfo(battle, skill.skillData.realName, damage, critMul)],
    playerHpDelta: 0, playerMpDelta: 0, monsterHpDelta: -damage,
  };
}

export function behave_life_drain(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[0]) return noop();
  battle.playerMp -= params[0];
  const player = battle.playerState;
  const critMul = skillGetCritMul(battle);
  let damage = Math.floor((getAttack(player) * critMul * (1 + params[1] * getStr(player)) - battle.monster.defence) * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  let heal = Math.floor(damage * params[2] / 100);
  const maxHeal = getHp(player) - battle.playerHp;
  if (heal > maxHeal) heal = maxHeal;
  if (heal < 0) heal = 0;
  battle.playerHp += heal;
  return {
    success: true,
    logs: [
      traceAttackInfo(battle, skill.skillData.realName, damage, critMul),
      `你回复了 <font color='${GREEN}'>${heal} hp!</font>`,
    ],
    playerHpDelta: heal, playerMpDelta: -params[0], monsterHpDelta: -damage,
  };
}

export function behave_defence(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  const mon = battle.monster;
  const player = battle.playerState;
  let cr = mon.crit - getProtection(player) * 2;
  if (cr > CR) cr = CR;
  let critMul: number = 1;
  if (Math.random() * 100 < cr) critMul = mon.crit_mul / 100;
  let damage = Math.floor((mon.attack * critMul - getDefence(player) - params[0]) *
    (1 - calcProtection(getProtection(player) * params[2] + params[1])));
  if (damage < 1) damage = 1;
  battle.playerHp -= damage;
  updateTitleInfo('endure', damage);
  const monName = mon.getNameHtml(getCombatPower(player));
  const log = critMul > 1
    ? `你<font color='${RED}'>防御</font>成功, ${monName}对你造成<font color='${RED}' size='20'>${damage}!</font>伤害`
    : `你<font color='${RED}'>防御</font>成功, ${monName}对你造成<font color='${RED}'>${damage}</font>伤害`;
  return { success: true, logs: [log], playerHpDelta: -damage, playerMpDelta: 0, monsterHpDelta: 0 };
}

export function behave_mana_shield(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[0]) return noop();
  battle.playerMp -= params[0];
  const mon = battle.monster;
  const player = battle.playerState;
  let cr = mon.crit - getProtection(player) * 2;
  if (cr > CR) cr = CR;
  let critMul: number = 1;
  if (Math.random() * 100 < cr) critMul = mon.crit_mul / 100;
  let rawDamage = Math.floor((mon.attack * critMul - getDefence(player)) * (1 - calcProtection(getProtection(player))));
  let absorbed = Math.floor(rawDamage * params[3] / 100);
  let damage = rawDamage - absorbed;
  if (damage < 1) damage = 1;
  battle.playerHp -= damage;
  updateTitleInfo('endure', rawDamage);
  let mpCost = Math.floor(absorbed / (params[2] + getIntelligence(player) * params[1]));
  battle.playerMp -= mpCost;
  const monName = mon.getNameHtml(getCombatPower(player));
  const log = critMul > 1
    ? `${monName}对你造成<font color='${RED}' size='20'>${damage}!</font>伤害,<font color='${RED}'>魔法盾</font>吸收<font color='${RED}'>${absorbed}</font>`
    : `${monName}对你造成<font color='${RED}'>${damage}</font>伤害,<font color='${RED}'>魔法盾</font>吸收<font color='${RED}'>${absorbed}</font>`;
  return { success: true, logs: [log], playerHpDelta: -damage, playerMpDelta: -(params[0] + mpCost), monsterHpDelta: 0 };
}

export function behave_counterattack(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  const mon = battle.monster;
  const player = battle.playerState;
  let cr = mon.crit - getProtection(player) * 2;
  if (cr > CR) cr = CR;
  let critMul: number = 1;
  if (Math.random() * 100 < cr) critMul = mon.crit_mul / 100;
  let takenDamage = Math.floor((mon.attack * critMul - getDefence(player)) * (1 - calcProtection(getProtection(player))));
  if (takenDamage < 1) takenDamage = 1;
  battle.playerHp -= takenDamage;
  updateTitleInfo('endure', takenDamage);
  const monName = mon.getNameHtml(getCombatPower(player));
  const logs: string[] = [];
  logs.push(critMul > 1
    ? `${monName}对你造成<font color='${RED}' size='20'>${takenDamage}!</font>伤害`
    : `${monName}对你造成<font color='${RED}'>${takenDamage}</font>伤害`);
  if (battle.playerHp < 0) {
    logs.push('你无法反击...');
    return { success: true, logs, playerHpDelta: -takenDamage, playerMpDelta: 0, monsterHpDelta: 0 };
  }
  let retCritMul = skillGetCritMul(battle, params[2]);
  let retDamage = Math.floor((getAttack(player) * retCritMul * params[1] / 100 + takenDamage * params[0] / 100 - mon.defence) *
    (1 - calcProtection(mon.protection - getProtectionReduce(player) - getProtectionIgnore(player) - params[2] * 3)));
  if (retDamage < 1) retDamage = 1;
  battle.monsterHp -= retDamage;
  updateTitleInfo('damage', retDamage, retDamage);
  updateTitleInfo('crit', 0, retCritMul > 1 ? 1 : -1);
  logs.push(retCritMul > 1
    ? `你<font color='${RED}'>反击</font>成功,对${monName}造成<font color='${RED}' size='20'>${retDamage}!</font>伤害`
    : `你<font color='${RED}'>反击</font>成功,对${monName}造成<font color='${RED}'>${retDamage}</font>伤害`);
  return { success: true, logs, playerHpDelta: -takenDamage, playerMpDelta: 0, monsterHpDelta: -retDamage };
}

export function behave_bolt(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[2]) return noop();
  battle.playerMp -= params[2];
  const player = battle.playerState;
  const critMul = skillGetCritMul(battle);
  const baseDmg = Math.floor(balanceRandom(getMagicBalance(player)) * (params[1] - params[0]) + params[0]);
  let damage = Math.floor(baseDmg * critMul * (100 + getMagicDamage(player)) / 100 * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  return {
    success: true,
    logs: [traceAttackInfo(battle, skill.skillData.realName, damage, critMul)],
    playerHpDelta: 0, playerMpDelta: -params[2], monsterHpDelta: -damage,
  };
}

export function behave_thunder(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[2]) return noop();
  battle.playerMp -= params[2];
  const player = battle.playerState;
  const mon = battle.monster;
  const extraIgnore = params[3] + getWill(player) * params[4];
  const critMul = skillGetCritMul(battle, params[3]);
  const baseDmg = Math.floor(balanceRandom(getMagicBalance(player)) * (params[1] - params[0]) + params[0]);
  let damage = Math.floor(baseDmg * critMul * (100 + getMagicDamage(player)) / 100 *
    (1 - calcProtection(mon.protection - getProtectionReduce(player) - getProtectionIgnore(player) - extraIgnore)));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  return {
    success: true,
    logs: [traceAttackInfo(battle, skill.skillData.realName, damage, critMul)],
    playerHpDelta: 0, playerMpDelta: -params[2], monsterHpDelta: -damage,
  };
}

export function behave_fireball(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[2]) return noop();
  battle.playerMp -= params[2];
  const player = battle.playerState;
  const critMul = skillGetCritMul(battle);
  const baseDmg = Math.floor(balanceRandom(getMagicBalance(player)) * (params[1] - params[0]) + params[0]);
  let damage = Math.floor(baseDmg * critMul * (100 + getMagicDamage(player)) / 100 * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  battle.monster.addBuff(new BuffBurn(Math.floor(params[3] * getIntelligence(player))));
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  return {
    success: true,
    logs: [traceAttackInfo(battle, skill.skillData.realName, damage, critMul)],
    playerHpDelta: 0, playerMpDelta: -params[2], monsterHpDelta: -damage,
  };
}

export function behave_ice_spear(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[2]) return noop();
  battle.playerMp -= params[2];
  const player = battle.playerState;
  const critMul = skillGetCritMul(battle);
  const baseDmg = Math.floor(balanceRandom(getMagicBalance(player)) * (params[1] - params[0]) + params[0]);
  let damage = Math.floor(baseDmg * critMul * (100 + getMagicDamage(player)) / 100 * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  if (Math.random() * 100 < params[3] + getIntelligence(player) * params[4]) {
    battle.monster.addBuff(new BuffFrozen(params[5]));
  }
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  return {
    success: true,
    logs: [traceAttackInfo(battle, skill.skillData.realName, damage, critMul)],
    playerHpDelta: 0, playerMpDelta: -params[2], monsterHpDelta: -damage,
  };
}

export function behave_mirage_missle(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[2]) return noop();
  battle.playerMp -= params[2];
  const player = battle.playerState;
  const critMul = skillGetCritMul(battle);
  let damage = Math.floor((getAttack(player) * critMul * params[0] / 100 - battle.monster.defence) * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  const poisonVal = Math.floor(params[1] + params[3] * getWill(player));
  battle.monster.addBuff(new BuffPoison(poisonVal));
  battle.monster.addBuff(new BuffPoison(poisonVal));
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  return {
    success: true,
    logs: [traceAttackInfo(battle, skill.skillData.realName, damage, critMul)],
    playerHpDelta: 0, playerMpDelta: -params[2], monsterHpDelta: -damage,
  };
}

export function behave_corrosive_shot(skill: any, battle: any): BattleBehaviorResult {
  const params = skill.skillData.setList[skill.level];
  if (battle.playerMp < params[2]) return noop();
  battle.playerMp -= params[2];
  const player = battle.playerState;
  const critMul = skillGetCritMul(battle);
  let damage = Math.floor((getAttack(player) * critMul * (params[0] / 100 + getDex(player) * params[4] / 100) - battle.monster.defence) * monsterPro(battle));
  if (damage < 1) damage = 1;
  battle.monsterHp -= damage;
  battle.monster.addBuff(new BuffCorrosion(Math.floor(params[1] + getDex(player) * params[3])));
  updateTitleInfo('damage', damage, damage);
  updateTitleInfo('crit', 0, critMul > 1 ? 1 : -1);
  return {
    success: true,
    logs: [traceAttackInfo(battle, skill.skillData.realName, damage, critMul)],
    playerHpDelta: 0, playerMpDelta: -params[2], monsterHpDelta: -damage,
  };
}

// ═══ 描述函数辅助 ═══

function descGetTitle(skill: any): string {
  const lvHex = (15 - skill.level).toString(16).toUpperCase();
  let cat = '';
  switch (skill.skillData.category) {
    case SkillCategory.ALL: cat = '全部'; break;
    case SkillCategory.MAGIC: cat = '魔法'; break;
    case SkillCategory.MELEE: cat = '近战'; break;
    case SkillCategory.RANGED: cat = '远程'; break;
    default: cat = skill.skillData.category;
  }
  return `<p align='center'>${skill.skillData.realName} ${lvHex}</p><p align='center'><font size='16'>${cat}</font></p>`;
}

function descGetStat(skill: any, lv: number): string {
  let s = '<font size=\'20\'>';
  const list = skill.skillData.statList[lv];
  for (let i = 0; i < list.length; i++) {
    s += `<li>${statTranslate(list[i].name)} +${list[i].value}</li>`;
  }
  return s + '</font>';
}

function descGetEffect(skill: any, lv: number): string {
  const data = skill.skillData;
  if (data.category !== SkillCategory.MELEE && data.category !== SkillCategory.RANGED) return '';
  if (!data.effectList) return '';
  const label = data.category === SkillCategory.MELEE ? '使用近战武器:<br/>' : '使用远程武器:<br/>';
  let s = `<font size='20'>${label}`;
  const list = data.effectList[lv];
  for (let i = 0; i < list.length; i++) {
    s += `<li>${statTranslate(list[i].name)}+${list[i].value}</li>`;
  }
  return s + '</font>';
}

function descGetAp(skill: any, lv: number): string {
  return `<font size='24'>AP:${skill.skillData.lvupCostList[lv]}</font>`;
}

// ═══ 描述函数 ═══

export function des_combat_master(skill: any): string {
  let s = descGetTitle(skill);
  s += descGetStat(skill, skill.level);
  s += descGetEffect(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += descGetEffect(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_blacksmithing(skill: any): string {
  const lv = skill.level;
  let s = descGetTitle(skill);
  s += '<font size=\'20\'>当强化装备时:<br/>';
  s += `  成功率 +${lv}%<br/>`;
  if (lv > 1) s += ((lv > 13 ? '  +7' : lv > 9 ? '  +5' : lv > 5 ? '  +3' : '  +1') + '前不会消失<br/>');
  if (lv > 5) {
    const fail = lv > 13 ? '  50% 保持不变.' : lv > 9 ? '  50% 降低1级' : '  50% 降回+0.';
    s += '  当失败时:<br/>' + fail + '<br/>';
  }
  s += '</font>';
  s += descGetStat(skill, lv);
  if (skill.level < 14) {
    const nl = lv + 1;
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>`;
    s += `当强化装备时:<br/>  成功率 +${nl}%<br/>`;
    if (nl > 1) s += ((nl > 13 ? '  +7' : nl > 9 ? '  +5' : nl > 5 ? '  +3' : '  +1') + '前不会消失<br/>');
    if (nl > 5) {
      const fail = nl > 13 ? '  50% 保持不变.' : nl > 9 ? '  50% 降低1级' : '  50% 降回+0.';
      s += '  当失败时:<br/>' + fail + '<br/>';
    }
    s += '</font>';
    s += descGetStat(skill, nl);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, nl)}</font>`;
  }
  return s;
}

export function des_smash(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>当技能使用成功时:<br/>  伤害 ${params[skill.level]}%</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>当技能使用成功时:<br/>  伤害 ${params[skill.level + 1]}%</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_defence(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>当技能使用成功时:<br/>  防御 +${params[skill.level][0]}<br/>  护甲 +${params[skill.level][1]}<br/>  护甲 *${params[skill.level][2]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>当技能使用成功时:<br/>  防御 +${params[skill.level + 1][0]}<br/>  护甲 +${params[skill.level + 1][1]}<br/>  护甲 *${params[skill.level + 1][2]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_counterattack(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  反击${params[skill.level][0]}% 敌人的+${params[skill.level][1]}% 自身的伤害<br/>  额外暴击 +${params[skill.level][2]}%<br/>  无视护甲 +${params[skill.level][2] * 3}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  反击${params[skill.level + 1][0]}% 敌人的+${params[skill.level + 1][1]}% 自身的伤害<br/>  额外暴击 +${params[skill.level + 1][2]}%<br/>  无视护甲 +${params[skill.level + 1][2] * 3}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_magic_bolt(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  伤害:${params[skill.level][0]}~${params[skill.level][1]}<br/>  耗魔:${params[skill.level][2]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  伤害:${params[skill.level + 1][0]}~${params[skill.level + 1][1]}<br/>  耗魔:${params[skill.level + 1][2]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_fireball(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  伤害:${params[skill.level][0]}~${params[skill.level][1]}<br/>  附加状态: 灼烧(造成 智力*${params[skill.level][3]} 伤害每回合,可叠加)<br/>  耗魔:${params[skill.level][2]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  伤害:${params[skill.level + 1][0]}~${params[skill.level + 1][1]}<br/>  附加状态: 灼烧(造成 智力*${params[skill.level + 1][3]} 伤害每回合,可叠加)<br/>  耗魔:${params[skill.level + 1][2]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_icespear(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  伤害:${params[skill.level][0]}~${params[skill.level][1]}<br/>  附加状态: 冰冻( ${params[skill.level][3]}%+ 智力*${params[skill.level][4]}% 概率使目标无法行动${params[skill.level][5]}回合)<br/>  耗魔:${params[skill.level][2]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  伤害:${params[skill.level + 1][0]}~${params[skill.level + 1][1]}<br/>  附加状态: 冰冻( ${params[skill.level + 1][3]}%+ 智力*${params[skill.level + 1][4]}% 概率使目标无法行动${params[skill.level + 1][5]}回合)<br/>  耗魔:${params[skill.level + 1][2]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_thunder(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  伤害:${params[skill.level][0]}~${params[skill.level][1]}<br/>  特效: 无视 ${params[skill.level][3]}+ 意志*${params[skill.level][4]} 的目标护甲<br/>  额外暴击率 +${params[skill.level][3]}<br/>  耗魔:${params[skill.level][2]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  伤害:${params[skill.level + 1][0]}~${params[skill.level + 1][1]}<br/>  特效: 无视 ${params[skill.level + 1][3]}+ 意志*${params[skill.level + 1][4]} 的目标护甲<br/>  额外暴击率 +${params[skill.level + 1][3]}<br/>  耗魔:${params[skill.level + 1][2]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_mana_shield(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  效果: 每点魔法可以吸收 ${params[skill.level][2]}+智力*${params[skill.level][1]} 的伤害(最多${params[skill.level][3]}% 的伤害)<br/>  耗魔:${params[skill.level][0]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  效果: 每点魔法可以吸收 ${params[skill.level + 1][2]}+智力*${params[skill.level + 1][1]} 的伤害(最多${params[skill.level + 1][3]}% 的伤害)<br/>  耗魔:${params[skill.level + 1][0]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_mirage_missle(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  伤害:${params[skill.level][0]}%<br/>  附加状态: 毒(造成 ${params[skill.level][1]}+意志*${params[skill.level][3]} 伤害每回合,可叠加)<br/>  耗魔:${params[skill.level][2]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  伤害:${params[skill.level + 1][0]}%<br/>  附加状态: 毒(造成 ${params[skill.level + 1][1]}+意志*${params[skill.level + 1][3]} 伤害每回合,可叠加)<br/>  耗魔:${params[skill.level + 1][2]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_corrosive_shot(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  伤害:${params[skill.level][0]}%+敏捷*${params[skill.level][4]}%<br/>  附加状态: 破甲(降低 ${params[skill.level][1]}+ 敏捷*${params[skill.level][3]} 的目标护甲,可叠加)<br/>  耗魔:${params[skill.level][2]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  伤害:${params[skill.level + 1][0]}%+敏捷*${params[skill.level + 1][4]}%<br/>  附加状态: 破甲(降低 ${params[skill.level + 1][1]}+ 敏捷*${params[skill.level + 1][3]} 的目标护甲,可叠加)<br/>  耗魔:${params[skill.level + 1][2]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

export function des_life_drain(skill: any): string {
  const params = skill.skillData.setList;
  let s = descGetTitle(skill);
  s += `<font size='20'>  伤害: 100%+ 力量*${params[skill.level][1] * 100}%<br/>  效果:吸取 ${params[skill.level][2]}% 伤害用于生命回复<br/>  耗魔:${params[skill.level][0]}</font><br/>`;
  s += descGetStat(skill, skill.level);
  if (skill.level < 14) {
    s += `<font color='${GREEN}'>下一级:<br/><font size='20'>  伤害: 100%+ str*${params[skill.level + 1][1] * 100}%<br/>  效果:吸取 ${params[skill.level + 1][2]}% 伤害用于生命回复<br/>  耗魔:${params[skill.level + 1][0]}</font><br/>`;
    s += descGetStat(skill, skill.level + 1);
    s += '</font>';
    s += `<font color='${YELLOW}'>${descGetAp(skill, skill.level + 1)}</font>`;
  }
  return s;
}

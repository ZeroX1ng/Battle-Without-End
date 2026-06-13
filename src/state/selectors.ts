// ═══ 派生状态选择器 ═══
// 从原始 state 计算派生值，供 React 组件通过 useMemo 使用。
// 所有计算委托给 core/ 纯函数，此处不做任何逻辑。

import type { PlayerState, GameState, GlobalConfig } from '../core/types';
import {
  getCombatPower, getHp, getMp, getStr, getDex,
  getIntelligence, getWill, getLuck,
  getAttMin, getAttMax, getAttack, getDefence, getProtection,
  getCrit, getCritMul, getBalance,
  getSpellChance, getProtectionIgnore, getProtectionReduce,
  getMagicDamage, getLevelExp,
  getBasicStr, getBasicDex, getBasicInt, getBasicWill, getBasicLuck,
} from '../core/models/Player';

export const selectPlayer = (state: GameState) => state.player;
export const selectBattle = (state: GameState) => state.battle;
export const selectScene = (state: GameState) => state.scene;
export const selectConfig = (state: GameState) => state.config;
export const selectUI = (state: GameState) => state.ui;

export function selectPlayerStats(player: PlayerState) {
  return {
    lv: player.lv,
    age: player.age,
    hp: getHp(player),
    mp: getMp(player),
    str: getStr(player),
    dex: getDex(player),
    intelligence: getIntelligence(player),
    will: getWill(player),
    luck: getLuck(player),
    basicStr: getBasicStr(player),
    basicDex: getBasicDex(player),
    basicInt: getBasicInt(player),
    basicWill: getBasicWill(player),
    basicLuck: getBasicLuck(player),
    attmin: getAttMin(player),
    attmax: getAttMax(player),
    attack: getAttack(player),
    defence: getDefence(player),
    protection: getProtection(player),
    crit: getCrit(player),
    crit_mul: getCritMul(player),
    balance: getBalance(player),
    spellChance: getSpellChance(player),
    protectionIgnore: getProtectionIgnore(player),
    protectionReduce: getProtectionReduce(player),
    magicDamage: getMagicDamage(player),
    combatPower: getCombatPower(player),
    ap: player.ap,
    gold: player.gold,
    xp: player.xp,
    maxXp: getLevelExp(player),
    playerName: player.playerName,
    raceName: player.race?.name ?? '',
    titleRealName: player.title?.realName ?? null,
  };
}

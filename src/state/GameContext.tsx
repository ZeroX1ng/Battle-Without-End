// ═══ 全局游戏状态管理 ═══
// GameContext + GameReducer + GameProvider
// 统一管理所有游戏状态，React 组件通过 useContext 读取，
// 通过 dispatch 触发状态变更。

import React, { createContext, useCallback, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import type { GameState, PlayerState, GlobalConfig, LootState, WeaponData, TitleData } from '../core/types';
import type { GameAction, GameActionMeta } from './actions';
import type { GameEffect, ReducerContext } from './reducerEffects';
import { createInitialPlayerState, createNewPlayerState, playerBurn, ageup, addExp, addGold, loseGold, addItem, removeItem, equipItem, unequipItem, addSkill, equipSkill, unequipSkill, addPet, setPet, removePet, addTitle, setTitle, getLuck, getCombatPower, getStr, getDex, getIntelligence, getWill, updateEquipInfo, updateSkillInfo, updateAllInfo, loseExp } from '../core/models/Player';
import { applyTitleEvents } from '../core/data/titleData';
import { Battle } from '../core/models/Battle';
import { Map as GameMap } from '../core/models/Map';
import { MapList, getMapByName } from '../core/data/mapData';
import { Equipment } from '../core/models/Equipment';
import { Weapon } from '../core/models/Weapon';
import { EquipmentList } from '../core/data/equipmentData';
import { serializeSave, localLoad, deserializeSave } from '../core/systems/SaveSystem';
import { shouldDisplayLog } from '../core/systems/SystemConfig';
import { getAutoForgeTarget, getForgeCost, getForgeSuccessRate, resolveForgeFailure } from '../core/systems/ForgeSystem';
import { getShopGamblePrice, getShopGambleRatio, getShopSellRatio, getShopStockPower } from '../core/systems/ShopStockProgression';
import { Stat } from '../core/constants';
import { SkillDataList } from '../core/data/skillData';
import {
  clearPendingEffects,
  createRandomPercents,
  createReducerContext,
  nextRandomPercent,
  processGameEffects,
  queueForgeSound,
  queueLocalSave,
  queueManualSave,
  queueSoundToggle,
  queueTitleEvent,
  queueTitleEvents,
  withQueuedEffects,
} from './reducerEffects';

// ═══ 初始状态 ═══

// AS3 keeps 100 entries; React keeps 150 so sticky-scroll history is more useful during playtests.
const MAX_BATTLE_LOG_MESSAGES = 150;

function createInitialConfig(): GlobalConfig {
  return {
    battle_toggle: true, battleIntro_toggle: true,
    money_toggle: true, exp_toggle: true, item_toggle: true, other_toggle: true,
    item0_toggle: true, item1_toggle: true, item2_toggle: true, item3_toggle: true, item4_toggle: true, item5_toggle: true,
    sword_toggle: true, axe_toggle: true, bow_toggle: true, crossbow_toggle: true,
    sceptre_toggle: true, staff_toggle: true, tome_toggle: true, shield_toggle: true, dagger_toggle: true,
    body_light_toggle: true, body_medium_toggle: true, body_heavy_toggle: true,
    head_light_toggle: true, head_medium_toggle: true, head_heavy_toggle: true,
    feet_light_toggle: true, feet_medium_toggle: true, feet_heavy_toggle: true,
    necklace_toggle: true, ring_toggle: true,
    autoSell_toggle: true, sound_toggle: true,
  };
}

function createInitialLoot(): LootState {
  return { money: 0, exp: 0, basic: 0, magic: 0, rare: 0, perfect: 0, epic: 0, legendary: 0 };
}

function generateShopState(playerState: PlayerState) {
  const luck = getLuck(playerState);
  const baseCombatPower = getCombatPower(playerState);
  const stockPower = Math.max(baseCombatPower, getShopStockPower(playerState));
  const sellItems = [];
  const gambleItems = [];

  for (let i = 0; i < 7; i++) {
    const ratio = getShopSellRatio({ random: Math.random(), luck, stockPower });
    const data = EquipmentList[Math.floor(Math.random() * EquipmentList.length)];
    const equip = 'category' in data
      ? new Weapon(data as WeaponData, ratio, false, stockPower)
      : new Equipment(data, ratio, false, stockPower);
    sellItems.push({ equip, price: Math.floor(equip.getSellMoney()) });
  }

  for (let i = 0; i < 7; i++) {
    const ratio = getShopGambleRatio({ random: Math.random(), luck, stockPower });
    const data = EquipmentList[Math.floor(Math.random() * EquipmentList.length)];
    const equip = 'category' in data
      ? new Weapon(data as WeaponData, ratio, false, stockPower)
      : new Equipment(data, ratio, false, stockPower);
    const price = getShopGamblePrice({ random: Math.random(), stockPower });
    gambleItems.push({ equip, price });
  }

  return { sellItems, gambleItems };
}

function createInitialShopState(playerState: PlayerState) {
  return generateShopState(playerState);
}

function getCurrentMapName(state: GameState): string {
  return state.battle?.map?.mapData?.name ?? MapList[0].name;
}

function hasValidPlayerName(player: PlayerState): boolean {
  return player.playerName.trim().length > 0;
}

function switchBattleMap(state: GameState, map: GameMap): Battle {
  const battle = new Battle(state.player, map, state.config);
  battle.init();
  return battle;
}

function createInitialState(): GameState {
  const player = createInitialPlayerState();
  return {
    scene: 'begin',
    player,
    battle: null,
    config: createInitialConfig(),
    activeSaveSlot: null,
    ui: { activeWindow: null, infoMessages: [] },
    loot: createInitialLoot(),
    shop: createInitialShopState(player),
    tick: 0,
    isRebirth: false,
    confirm: null,
  };
}

// ═══ Reducer ═══

function cloneEquipmentInstance<T extends object>(equip: T): T {
  return Object.create(
    Object.getPrototypeOf(equip),
    Object.getOwnPropertyDescriptors(equip)
  );
}

function applyTitleEventsToPlayer(state: GameState, playerState: PlayerState, ctx: ReducerContext): GameState {
  if (!ctx.titleEvents.length) {
    return withBattlePlayer(state, playerState);
  }
  const result = applyTitleEvents(playerState.titleList as TitleData[], ctx.titleEvents);
  const currentTitleName = playerState.title?.name;
  let nextPlayer = {
    ...playerState,
    titleList: result.titleList,
    title: currentTitleName ? result.titleList.find(title => title.name === currentTitleName) ?? null : null,
  };
  let nextState = { ...state, player: nextPlayer };
  for (const skillName of result.unlockedSkills) {
    const sd = SkillDataList.find(d => d.name === skillName);
    if (sd && !nextPlayer.skillList.find((s: any) => s.skillData.name === skillName)) {
      nextPlayer = addSkill(nextPlayer, sd);
      nextState = addLog(
        { ...nextState, player: nextPlayer },
        `<font color='#FFA640'>称号解锁了新技能 ${sd.realName || skillName}!</font>`
      );
    }
  }
  return withBattlePlayer(nextState, nextPlayer);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  state = clearPendingEffects(state);
  const ctx = createReducerContext(action);
  switch (action.type) {
    case 'SET_SCENE':
      return { ...state, scene: action.scene };

    case 'OPEN_CONFIRM':
      return { ...state, confirm: { message: action.message, prevScene: state.scene }, scene: 'confirm' };

    case 'CLOSE_CONFIRM': {
      const prev = state.confirm?.prevScene ?? state.scene;
      return { ...state, confirm: null, scene: prev };
    }

    case 'PLAYER_BURN':
      queueTitleEvent(ctx, 'begin');
      {
        let player = createNewPlayerState(action.age, action.race, state.player.playerName);
        const activeSaveSlot = state.activeSaveSlot ?? 'slot1';
        let nextState: GameState = {
          ...state,
          activeSaveSlot,
          player,
          shop: action.meta?.shop ?? state.shop,
          scene: 'main',
        };
        nextState = applyTitleEventsToPlayer(nextState, player, ctx);
        player = nextState.player;
        const mapName = getCurrentMapName(nextState);
        const saveStr = serializeSave(player, nextState.config, mapName, activeSaveSlot);
        queueLocalSave(ctx, player.playerName, activeSaveSlot, saveStr);
        return withQueuedEffects(nextState, ctx);
      }

    case 'PLAYER_SET_NAME': {
      const nextPlayer = { ...state.player, playerName: action.name };
      const activeSaveSlot = action.slot ?? state.activeSaveSlot;
      const nextState = { ...state, activeSaveSlot };
      if (activeSaveSlot && hasValidPlayerName(nextPlayer)) {
        const mapName = getCurrentMapName(nextState);
        const saveStr = serializeSave(nextPlayer, nextState.config, mapName, activeSaveSlot);
        queueLocalSave(ctx, nextPlayer.playerName, activeSaveSlot, saveStr);
      }
      return withQueuedEffects(withBattlePlayer(nextState, nextPlayer), ctx);
    }

    case 'EQUIP_ITEM': {
      const newPlayer = equipItem(state.player, action.item);
      return withBattlePlayer(state, newPlayer);
    }
    case 'UNEQUIP_ITEM':
      return withBattlePlayer(state, unequipItem(state.player, action.slot));

    case 'ITEM_ADD': {
      const { state: newPlayer } = addItem(state.player, action.item);
      const item = action.item as any;
      const q = item.quality ?? 0;
      const qualityKeys = ['basic', 'magic', 'rare', 'perfect', 'epic', 'legendary'] as const;
      const key = qualityKeys[q] || 'basic';
      const stateWithLoot = { ...state, loot: { ...state.loot, [key]: state.loot[key] + 1 } };
      return addLog(withBattlePlayer(stateWithLoot, newPlayer), `你获得了${item.getNameHTML()}!`, 'item');
    }
    case 'ITEM_REMOVE': {
      const newPlayer = removeItem(state.player, action.item);
      return withBattlePlayer(state, newPlayer);
    }
    case 'ITEM_SELL': {
      const removed = removeItem(state.player, action.item);
      if (removed === state.player) return state;
      return withBattlePlayer(state, addGold(removed, action.item.getMoney()));
    }
    case 'ITEM_SORT': {
      const itemList = [...state.player.itemList];
      itemList.sort((a: any, b: any) => {
        if (action.mode === 'value') {
          if (a.getMoney() < b.getMoney()) return 1;
          if (a.getMoney() > b.getMoney()) return -1;
          return 0;
        }
        if (a.sortWeight < b.sortWeight) return -1;
        if (a.sortWeight > b.sortWeight) return 1;
        return 0;
      });
      return withBattlePlayer(state, { ...state.player, itemList });
    }

    case 'BAG_EXPAND': {
      if (state.player.BAGMAX >= 100) return state;
      const cost = (state.player.BAGMAX - 49) * 1000000;
      if (state.player.gold < cost) return state;
      const newPlayer = loseGold(state.player, cost);
      const expandedPlayer = { ...newPlayer, BAGMAX: newPlayer.BAGMAX + 1 };
      return addLog(
        withBattlePlayer(state, expandedPlayer),
        `背包容量拓展至 ${newPlayer.BAGMAX + 1} 格!`
      );
    }
    case 'PET_EXPAND': {
      if (state.player.PETMAX >= 20) return state;
      const cost = (state.player.PETMAX - 9) * 5000000;
      if (state.player.gold < cost) return state;
      const newPlayer = loseGold(state.player, cost);
      const expandedPlayer = { ...newPlayer, PETMAX: newPlayer.PETMAX + 1 };
      return addLog(
        withBattlePlayer(state, expandedPlayer),
        `宠物栏拓展至 ${newPlayer.PETMAX + 1} 格!`
      );
    }

    case 'SHOP_GENERATE': {
      return action.meta?.shop ? { ...state, shop: action.meta.shop } : state;
    }
    case 'SHOP_BUY_SELL': {
      const item = state.shop.sellItems[action.index];
      if (!item || state.player.gold < item.price) return state;
      const added = addItem(state.player, item.equip);
      if (!added.added) return state;
      const player = loseGold(added.state, item.price);
      const sellItems = state.shop.sellItems.filter((_, index) => index !== action.index);
      return withBattlePlayer({ ...state, shop: { ...state.shop, sellItems } }, player);
    }
    case 'SHOP_BUY_GAMBLE': {
      const item = state.shop.gambleItems[action.index];
      if (!item || state.player.gold < item.price) return state;
      const added = addItem(state.player, item.equip);
      if (!added.added) return state;
      const player = loseGold(added.state, item.price);
      const gambleItems = state.shop.gambleItems.filter((_, index) => index !== action.index);
      return withBattlePlayer({ ...state, shop: { ...state.shop, gambleItems } }, player);
    }

    case 'FORGE_EQUIPMENT': {
      const originalEquip = state.player.itemList[action.equipIndex] as any;
      if (!originalEquip || originalEquip.level >= 15) return state;
      const cost = getForgeCost(originalEquip.getMoney(), originalEquip.level);
      if (state.player.gold < cost) return state;
      const targetLevel = originalEquip.level + 1;
      const luck = getLuck(state.player);
      const rate = getForgeSuccessRate(targetLevel, luck, action.blacksmithLevel);
      let equip = originalEquip;

      let newPlayer = loseGold(state.player, cost);

      if (nextRandomPercent(ctx) < rate) {
        const forgedEquip = cloneEquipmentInstance(originalEquip) as any;
        forgedEquip.levelup();
        equip = forgedEquip;
        queueForgeSound(ctx, 'success');
        const newList = [...newPlayer.itemList];
        newList[action.equipIndex] = forgedEquip;
        newPlayer = updateEquipInfo({ ...newPlayer, itemList: newList });
        queueTitleEvent(ctx, 'forge', forgedEquip.level, 1);
        queueTitleEvent(ctx, 'fail', 0, -1);
        const newState = addLog(
          withBattlePlayer(state, newPlayer),
          `<font color='#4BEA14'>锻造成功</font> 你获得了${equip.getNameHTML()}<font color='#4BEA14'>+${equip.level}!</font>`,
          'item'
        );
        return withQueuedEffects(applyTitleEventsToPlayer(newState, newPlayer, ctx), ctx);
      }
      const { newLevel } = resolveForgeFailure(originalEquip.level, originalEquip.quality ?? 0, action.blacksmithLevel, nextRandomPercent(ctx));
      queueTitleEvent(ctx, 'fail', 0, 1);
      newPlayer = updateEquipInfo({ ...newPlayer, itemList: newPlayer.itemList });
      if (newLevel === null) {
        queueForgeSound(ctx, 'destroy');
        const newList = [...newPlayer.itemList];
        newList.splice(action.equipIndex, 1);
        newPlayer = updateEquipInfo({ ...newPlayer, itemList: newList });
        return withQueuedEffects(applyTitleEventsToPlayer(addLog(
          withBattlePlayer(state, newPlayer),
          `锻造失败 ${equip.getNameHTML()} 消失了`,
          'item'
        ), newPlayer, ctx), ctx);
      }
      const downgradedEquip = cloneEquipmentInstance(originalEquip) as any;
      downgradedEquip.setLevel(newLevel);
      equip = downgradedEquip;
      queueForgeSound(ctx, 'fail');
      const newList = [...newPlayer.itemList];
      newList[action.equipIndex] = downgradedEquip;
      newPlayer = updateEquipInfo({ ...newPlayer, itemList: newList });
      return withQueuedEffects(applyTitleEventsToPlayer(addLog(
        withBattlePlayer(state, newPlayer),
        `锻造失败 ${equip.getNameHTML()} 等级降为 <font color='#ff4040'>+${newLevel}</font>`,
        'item'
      ), newPlayer, ctx), ctx);
    }

    case 'AUTO_FORGE_EQUIPMENT': {
      const bl = action.blacksmithLevel;
      if (bl <= 1) return state;
      const currentEquip = state.player.itemList[action.equipIndex] as any;
      if (!currentEquip || currentEquip.level >= 15) return state;
      const autoTarget = getAutoForgeTarget(currentEquip.level, bl);
      if (autoTarget === null) return state;

      let curState = state;
      let equipState = currentEquip;
      let equipIndex = action.equipIndex;
      let forgedCount = 0;

      while (equipState && equipState.level < autoTarget && equipState.level < 15) {
        const cost = getForgeCost(equipState.getMoney(), equipState.level);
        if (curState.player.gold < cost) break;

        const targetLevel = equipState.level + 1;
        const luck = getLuck(curState.player);
        const rate = getForgeSuccessRate(targetLevel, luck, bl);

        let newPlayer = loseGold(curState.player, cost);

        if (nextRandomPercent(ctx) < rate) {
          equipState = Object.create(Object.getPrototypeOf(equipState), Object.getOwnPropertyDescriptors(equipState));
          equipState.levelup();
          queueForgeSound(ctx, 'success');
          forgedCount++;
          queueTitleEvent(ctx, 'forge', equipState.level, 1);
          queueTitleEvent(ctx, 'fail', 0, -1);
        } else {
          queueTitleEvent(ctx, 'fail', 0, 1);
          const { newLevel } = resolveForgeFailure(equipState.level, equipState.quality ?? 0, bl, nextRandomPercent(ctx));
          if (newLevel === null) {
            queueForgeSound(ctx, 'destroy');
            const newList = [...newPlayer.itemList];
            newList.splice(equipIndex, 1);
            newPlayer = updateEquipInfo({ ...newPlayer, itemList: newList });
            curState = addLog(
              { ...curState, player: newPlayer },
              `[自动锻造] ${equipState.getNameHTML()} 不幸消失...`,
              'item'
            );
            equipState = null;
            break;
          }
          equipState = Object.create(Object.getPrototypeOf(equipState), Object.getOwnPropertyDescriptors(equipState));
          equipState.setLevel(newLevel);
          queueForgeSound(ctx, 'fail');
        }

        const newList = [...newPlayer.itemList];
        newList[equipIndex] = equipState;
        newPlayer = updateEquipInfo({ ...newPlayer, itemList: newList });
        curState = { ...curState, player: newPlayer };
      }

      if (forgedCount > 0 && equipState) {
        curState = addLog(
          curState,
          `[自动锻造] 完成! ${equipState.getNameHTML()} 已强化至 <font color='#4BEA14'>+${equipState.level}</font>`,
          'item'
        );
      }
      const titledState = applyTitleEventsToPlayer(curState, curState.player, ctx);
      return withQueuedEffects(withBattlePlayer(titledState, titledState.player), ctx);
    }

    case 'SKILL_LEARN': {
      const newPlayer = addSkill(state.player, action.skill.skillData);
      return withBattlePlayer(state, newPlayer);
    }
    case 'SKILL_LEVELUP': {
      const skill = action.skill;
      const skillIdx = state.player.skillList.indexOf(skill);
      if (skillIdx < 0) return state;
      const cost = skill.skillData.lvupCostList[skill.level + 1];
      if (skill.level >= 14 || state.player.ap < cost) return state;
      const updatedSkill = Object.create(
        Object.getPrototypeOf(skill),
        Object.getOwnPropertyDescriptors(skill)
      );
      updatedSkill.levelup();
      const newList = [...state.player.skillList];
      newList[skillIdx] = updatedSkill;
      const newEquipList = state.player.equipSkillList.map(s => s === skill ? updatedSkill : s);
      const newPlayer = updateSkillInfo({
        ...state.player,
        ap: state.player.ap - cost,
        skillList: newList,
        equipSkillList: newEquipList,
      });
      if (updatedSkill.level === 14) {
        queueTitleEvent(ctx, updatedSkill.skillData.name);
      }
      return withQueuedEffects(applyTitleEventsToPlayer(addLog(
        withBattlePlayer(state, newPlayer),
        `${updatedSkill.skillData.realName} 升级至 Rank ${(15 - updatedSkill.level).toString(16).toUpperCase()}!`
      ), newPlayer, ctx), ctx);
    }
    case 'SKILL_EQUIP': {
      return withBattlePlayer(state, equipSkill(state.player, action.skill));
    }
    case 'SKILL_UNEQUIP': {
      return withBattlePlayer(state, unequipSkill(state.player, action.skill));
    }

    case 'BATTLE_START': {
      const battle = new Battle(state.player, action.map, state.config) as any;
      battle.init();
      return { ...state, battle, loot: createInitialLoot(), scene: 'main' };
    }

    case 'BATTLE_TICK': {
      if (!state.battle) return state;
      const battle = state.battle.cloneForTransition(state.player, state.config);
      const result = battle.run(state.config, action.meta?.battleDebug);

      let playerState = battle.playerState;
      let newState: GameState = { ...state, battle, tick: state.tick + 1 };
      if (result.shouldRefreshShop) {
        newState = { ...newState, shop: action.meta?.shop ?? state.shop };
      }

      // 分发战斗产生的日志消息
      if (result.logs && result.logs.length) {
        for (const log of result.logs) {
          if (typeof log === 'string') {
            newState = addLog(newState, log, 'battle');
          } else {
            newState = addLog(newState, log.text, log.category);
          }
        }
      }

      queueTitleEvents(ctx, result.titleEvents);

      if (result.loot) {
        newState = { ...newState, loot: { ...newState.loot } };
        for (const key of Object.keys(result.loot) as Array<keyof LootState>) {
          newState.loot[key] += result.loot[key] ?? 0;
        }
      }

      if (result.shouldAgeup) {
        playerState = ageup(playerState);
        queueTitleEvent(ctx, 'age', playerState.age);
        newState = addLog(
          { ...newState, player: playerState },
          `<font color='#ff4040'>你长大了! 你现在${playerState.age}岁了!</font>`
        );
      } else {
        newState = { ...newState, player: playerState };
      }

      // 称号追踪：每 tick 更新 stat 和 age10
      queueTitleEvent(ctx, Stat.str, getStr(playerState));
      queueTitleEvent(ctx, Stat.dex, getDex(playerState));
      queueTitleEvent(ctx, Stat.intelligence, getIntelligence(playerState));
      queueTitleEvent(ctx, Stat.will, getWill(playerState));
      queueTitleEvent(ctx, Stat.luck, getLuck(playerState));
      if (playerState.age === 10) {
        queueTitleEvent(ctx, 'age10', playerState.lv);
      }

      // 消费待解锁的大师技能
      newState = applyTitleEventsToPlayer(newState, playerState, ctx);
      playerState = newState.player;

      if (result.playerDied) {
        newState = addLog(
          newState,
          `<font color='#ff4040'>你在战斗中被击败。</font>`
        );
      }

      // Auto-save follows the current SaveScene slot.
      if (result.shouldSave) {
        if (!newState.activeSaveSlot) {
          newState = addLog({ ...newState, activeSaveSlot: 'slot1' }, 'Auto-save used slot1 because no active save slot was set.');
        }
        const activeSaveSlot = newState.activeSaveSlot;
        if (activeSaveSlot === null) {
          throw new Error('Auto-save slot fallback failed.');
        }
        if (!hasValidPlayerName(playerState)) {
          return withQueuedEffects(addLog(withBattlePlayer(newState, playerState), 'Save skipped: player name is empty.'), ctx);
        }
        const mapName = battle.map?.mapData?.name ?? MapList[0].name;
        const saveStr = serializeSave(playerState, newState.config, mapName, activeSaveSlot);
        queueLocalSave(ctx, playerState.playerName, activeSaveSlot, saveStr);
      }

      return withQueuedEffects(withBattlePlayer(newState, playerState), ctx);
    }

    case 'BATTLE_END':
      return { ...state, battle: null };

    case 'PLAYER_AGEUP': {
      const newPlayer = ageup(state.player);
      queueTitleEvent(ctx, 'age', newPlayer.age);
      const newState = addLog(withBattlePlayer({ ...state, tick: state.tick + 1 }, newPlayer),
        `<font color='#ff4040'>你长大了! 你现在${newPlayer.age}岁了!</font>`);
      return withQueuedEffects(applyTitleEventsToPlayer(newState, newPlayer, ctx), ctx);
    }
    case 'PLAYER_ADD_EXP': {
      return addLog(withBattlePlayer({ ...state, loot: { ...state.loot, exp: state.loot.exp + action.amount } }, addExp(state.player, action.amount)),
        `你获得了<font color='#4a60d7'>${action.amount}</font>经验.`, 'exp');
    }
    case 'PLAYER_ADD_GOLD': {
      return withBattlePlayer(
        { ...state, loot: { ...state.loot, money: state.loot.money + action.amount } },
        addGold(state.player, action.amount)
      );
    }
    case 'PLAYER_LOSE_GOLD': {
      return withBattlePlayer(
        { ...state, loot: { ...state.loot, money: state.loot.money - action.amount } },
        loseGold(state.player, action.amount)
      );
    }

    case 'PET_ADD': {
      const { state: newPlayer } = addPet(state.player, action.pet);
      return withBattlePlayer(state, newPlayer);
    }
    case 'PET_SET': {
      return withBattlePlayer(state, setPet(state.player, action.pet));
    }
    case 'PET_REMOVE': {
      return withBattlePlayer(state, removePet(state.player, action.pet));
    }
    case 'TITLE_ADD': {
      return withBattlePlayer(state, addTitle(state.player, action.title));
    }
    case 'TITLE_SET': {
      return withBattlePlayer(state, setTitle(state.player, action.title));
    }
    case 'TITLE_UNLOCK_SKILLS': {
      let playerState = state.player;
      let newState = state;
      for (const skillName of action.skillNames) {
        const sd = SkillDataList.find(d => d.name === skillName);
        if (sd && !playerState.skillList.find((s: any) => s.skillData.name === skillName)) {
          playerState = addSkill(playerState, sd);
          newState = addLog(
            { ...newState, player: playerState },
            `<font color='#FFA640'>称号解锁了新技能 ${sd.realName || skillName}!</font>`
          );
        }
      }
      return withBattlePlayer(newState, playerState);
    }

    case 'START_REBIRTH': {
      return { ...state, isRebirth: true, scene: 'race', player: { ...state.player, caculate: 0 } };
    }

    case 'DO_REBIRTH': {
      queueTitleEvent(ctx, 'reborn', 0, 1);
      queueTitleEvent(ctx, 'begin');
      let newPlayer2 = playerBurn(state.player, action.age, action.race);
      newPlayer2 = { ...newPlayer2, caculate: 0 };
      const activeSaveSlot = state.activeSaveSlot ?? 'slot1';
      let newState = addLog(
        { ...state, activeSaveSlot, player: newPlayer2, shop: action.meta?.shop ?? state.shop, scene: 'main', isRebirth: false },
        `<font color='#ff4040'>你在转生中获得了新的生命! 你现在是${action.race.name}族，${action.age}岁!</font>`
      );
      newState = applyTitleEventsToPlayer(newState, newPlayer2, ctx);
      newPlayer2 = newState.player;
      const mapName = getCurrentMapName(newState);
      const saveStr = serializeSave(newPlayer2, newState.config, mapName, activeSaveSlot);
      queueLocalSave(ctx, newPlayer2.playerName, activeSaveSlot, saveStr);
      return withQueuedEffects(newState, ctx);
    }

    case 'CONFIG_TOGGLE': {
      const key = action.key as keyof GlobalConfig;
      if (!(key in state.config)) return state;
      const newVal = !state.config[key];
      if (key === 'sound_toggle') {
        queueSoundToggle(ctx, newVal);
      }
      return withQueuedEffects({ ...state, config: { ...state.config, [key]: newVal } }, ctx);
    }

    case 'UI_OPEN_WINDOW':
      return { ...state, ui: { ...state.ui, activeWindow: action.window } };
    case 'UI_CLOSE_WINDOW':
      return { ...state, ui: { ...state.ui, activeWindow: null } };

    case 'UI_ADD_LOG': {
      return addLog(state, action.text, action.category, action.meta?.now);
    }

    case 'MAP_SWITCH': {
      const battle = switchBattleMap(state, action.map);
      return addLog(
        { ...state, battle, loot: createInitialLoot(), ui: { ...state.ui, activeWindow: null } },
        `地图切换到 ${action.map.mapData.realName || action.map.mapData.name}.`,
        'battle'
      );
    }

    case 'LOOT_RESET':
      return { ...state, loot: createInitialLoot() };

    case 'GAME_TICK':
      return { ...state, tick: state.tick + 1 };

    case 'PLAYER_LOSE_EXP': {
      const prevXp = state.player.xp;
      const newPlayer = loseExp(state.player);
      const lost = prevXp - newPlayer.xp;
      return addLog(
        withBattlePlayer(state, newPlayer),
        `<font color='#ff4040'>你失去了 ${lost} 点经验...</font>`
      );
    }

    case 'SAVE_GAME': {
      if (!hasValidPlayerName(state.player)) {
        return addLog(state, 'Save skipped: player name is empty.');
      }
      const mapName = getCurrentMapName(state);
      const saveStr = serializeSave(state.player, state.config, mapName, action.slot);
      queueLocalSave(ctx, state.player.playerName, action.slot, saveStr);
      const newState = addLog({ ...state, activeSaveSlot: action.slot }, `游戏已保存至 ${action.slot}!`);
      return withQueuedEffects(newState, ctx);
    }

    case 'MANUAL_SAVE': {
      if (!hasValidPlayerName(state.player)) {
        return addLog(state, 'Save skipped: player name is empty.');
      }
      const mapName = getCurrentMapName(state);
      queueManualSave(ctx, state.player, state.config, mapName, action.slot);
      const newState = addLog({ ...state, activeSaveSlot: action.slot }, `存档已导出至 ${action.slot}.boe 文件!`);
      return withQueuedEffects(newState, ctx);
    }

    case 'MANUAL_LOAD': {
      const { player, config, mapName, playerName } = deserializeSave(action.saveData.info, action.saveData.playerName);
      const mapData = getMapByName(mapName) ?? MapList[0];
      const battle = new Battle(player, new GameMap(mapData), config);
      battle.init();
      queueLocalSave(ctx, action.saveData.playerName, action.saveData.slot, action.saveData.info);
      return withQueuedEffects(addLog(
        { ...state, player, config, activeSaveSlot: action.saveData.slot, scene: 'main', battle, loot: createInitialLoot(), shop: action.meta?.shop ?? state.shop, tick: 0 },
        `Manual save ${action.saveData.slot} imported for ${playerName}.`
      ), ctx);
    }

    case 'LOAD_GAME': {
      const saveData = action.meta?.loadSaveData;
      if (!saveData) {
        return addLog(state, `存档 ${action.slot} 不存在`);
      }
      const { player, config, mapName, playerName } = deserializeSave(saveData.info, saveData.userName);
      const mapData = getMapByName(mapName) ?? MapList[0];
      const battle = new Battle(player, new GameMap(mapData), config);
      battle.init();
      return addLog(
        { ...state, player, config, activeSaveSlot: action.slot, scene: 'main', battle, loot: createInitialLoot(), shop: action.meta?.shop ?? state.shop, tick: 0 },
        `欢迎回来，${playerName}。存档 ${action.slot} 已读取。`
      );
    }
    default:
      return state;
  }
}

function withBattlePlayer(state: GameState, player: PlayerState): GameState {
  if (!state.battle) return { ...state, player };
  const battle = state.battle.withPlayerState(player);
  return { ...state, player, battle };
}

function addLog(state: GameState, text: string, category?: string, timestamp: number = state.tick): GameState {
  if (!shouldDisplayLog(state.config, category)) return state;
  const previous = state.ui.infoMessages[state.ui.infoMessages.length - 1];
  const msg = { id: (previous?.id ?? 0) + 1, text, category, timestamp };
  return {
    ...state,
    ui: {
      ...state.ui,
      infoMessages: [...state.ui.infoMessages.slice(-(MAX_BATTLE_LOG_MESSAGES - 1)), msg],
    },
  };
}

function createActionMeta(action: GameAction, effectBatchId: number): GameActionMeta {
  return {
    ...action.meta,
    now: action.meta?.now ?? Date.now(),
    effectBatchId: action.meta?.effectBatchId ?? effectBatchId,
    randomPercents: action.meta?.randomPercents ?? createRandomPercents(256),
  };
}

function shopForLoadedSave(saveData: { userName: string; info: string } | null | undefined): ReturnType<typeof generateShopState> | undefined {
  if (!saveData) return undefined;
  const { player } = deserializeSave(saveData.info, saveData.userName);
  return generateShopState(player);
}

function prepareActionForReducer(action: GameAction, state: GameState, effectBatchId: number): GameAction {
  const meta = createActionMeta(action, effectBatchId);
  switch (action.type) {
    case 'PLAYER_BURN': {
      const player = createNewPlayerState(action.age, action.race, state.player.playerName);
      return { ...action, meta: { ...meta, shop: meta.shop ?? generateShopState(player) } };
    }
    case 'DO_REBIRTH': {
      const player = playerBurn(state.player, action.age, action.race);
      return { ...action, meta: { ...meta, shop: meta.shop ?? generateShopState(player) } };
    }
    case 'SHOP_GENERATE':
      return { ...action, meta: { ...meta, shop: meta.shop ?? generateShopState(state.player) } };
    case 'BATTLE_TICK': {
      const battlePlayer = state.battle?.playerState;
      return { ...action, meta: { ...meta, shop: meta.shop ?? generateShopState(battlePlayer ?? state.player) } };
    }
    case 'MANUAL_LOAD':
      return { ...action, meta: { ...meta, shop: meta.shop ?? shopForLoadedSave({ userName: action.saveData.playerName, info: action.saveData.info }) } };
    case 'LOAD_GAME': {
      const loadSaveData = meta.loadSaveData ?? localLoad(action.slot);
      return { ...action, meta: { ...meta, loadSaveData, shop: meta.shop ?? shopForLoadedSave(loadSaveData) } };
    }
    default:
      return { ...action, meta };
  }
}

// ═══ Context ═══

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, baseDispatch] = useReducer(gameReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  const effectBatchIdRef = useRef(1);
  const processedEffectIdsRef = useRef(new Set<string>());
  stateRef.current = state;

  const dispatch = useCallback((action: GameAction) => {
    const preparedAction = prepareActionForReducer(action, stateRef.current, effectBatchIdRef.current++);
    baseDispatch(preparedAction);
  }, []);

  useEffect(() => {
    processGameEffects(state.pendingEffects as GameEffect[] | undefined, processedEffectIdsRef.current);
  }, [state.pendingEffects, dispatch]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
}

import { EquipType } from '../constants';
import type { GlobalConfig, PlayerState, LootState } from '../types';

type ToggleKey = keyof GlobalConfig & string;

const QUALITY_LOOT_KEYS = ['basic', 'magic', 'rare', 'perfect', 'epic', 'legendary'] as const;

function getToggle(config: GlobalConfig, key: string): boolean {
  return (config as unknown as Record<string, boolean | undefined>)[key] ?? true;
}

function getItemValue(item: any): number {
  if (typeof item?.getMoney === 'function') return item.getMoney();
  if (typeof item?.getSellMoney === 'function') return item.getSellMoney();
  return 0;
}

function getDropMoney(item: any): number {
  if (typeof item?.getMoney === 'function') return item.getMoney();
  return 0;
}

export function getQualityLootKey(quality: number): keyof LootState {
  return QUALITY_LOOT_KEYS[quality] ?? 'basic';
}

export function shouldDisplayLog(config: GlobalConfig, category: string = 'other'): boolean {
  return getToggle(config, `${category}_toggle`);
}

export function shouldKeepDroppedItem(config: GlobalConfig, item: any): boolean {
  const quality = Number(item?.quality ?? 0);
  if (!getToggle(config, `item${quality}_toggle`)) return false;

  const isWeapon = Boolean(item?.category);
  const isAccessory = item?.type === EquipType.ACCESORY;
  const toggleName = isWeapon || isAccessory
    ? `${item?.name}_toggle`
    : `${item?.position}_${String(item?.type ?? '').toLowerCase()}_toggle`;

  return getToggle(config, toggleName);
}

export function addItemWithAutoSell(
  state: PlayerState,
  item: any,
  config: GlobalConfig,
): { state: PlayerState; added: boolean; soldItem?: any } {
  if (state.itemList.length < state.BAGMAX) {
    return { state: { ...state, itemList: [...state.itemList, item] }, added: true };
  }

  if (!config.autoSell_toggle || state.itemList.length === 0) {
    return { state, added: false };
  }

  let soldIndex = 0;
  let soldValue = getItemValue(state.itemList[0]);
  for (let i = 1; i < state.itemList.length; i++) {
    const value = getItemValue(state.itemList[i]);
    if (value < soldValue) {
      soldValue = value;
      soldIndex = i;
    }
  }

  if (getItemValue(item) <= soldValue) {
    return { state, added: false };
  }

  const soldItem = state.itemList[soldIndex];
  const itemList = [...state.itemList];
  itemList.splice(soldIndex, 1);
  itemList.push(item);

  return {
    state: {
      ...state,
      gold: state.gold + getItemValue(soldItem),
      itemList,
    },
    added: true,
    soldItem,
  };
}

export function handleDroppedItem(
  state: PlayerState,
  item: any,
  config: GlobalConfig,
): { state: PlayerState; added: boolean; soldItem?: any; convertedToGold: number } {
  if (!shouldKeepDroppedItem(config, item)) {
    const convertedToGold = getDropMoney(item);
    return {
      state: { ...state, gold: state.gold + convertedToGold },
      added: false,
      convertedToGold,
    };
  }

  const result = addItemWithAutoSell(state, item, config);
  if (result.added) {
    return { ...result, convertedToGold: 0 };
  }

  const convertedToGold = getDropMoney(item);
  return {
    state: { ...state, gold: state.gold + convertedToGold },
    added: false,
    convertedToGold,
  };
}

export type SystemConfigToggleKey = ToggleKey;

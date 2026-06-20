import type { PlayerState } from '../types';
import {
  getAttMax,
  getAttMin,
  getCombatPower,
  getDefence,
  getHp,
  getMp,
  getProtection,
} from '../models/Player';

interface ShopRatioInput {
  random: number;
  luck: number;
  stockPower: number;
}

interface GamblePriceInput {
  random: number;
  stockPower: number;
}

export function getShopStockPower(playerState: PlayerState): number {
  const baseCombatPower = getCombatPower(playerState);
  const averageAttack = Math.max(0, (getAttMin(playerState) + getAttMax(playerState)) / 2);
  const defenceValue = Math.max(0, getDefence(playerState));
  const protectionValue = Math.max(0, getProtection(playerState));
  const enduranceValue = Math.max(0, getHp(playerState) + getMp(playerState) * 0.5);

  const equipmentAwarePower =
    averageAttack * 3 +
    defenceValue * 10 +
    protectionValue * 18 +
    enduranceValue * 0.2;

  return Math.max(1, baseCombatPower, equipmentAwarePower);
}

export function getShopSellRatio({ random, luck, stockPower }: ShopRatioInput): number {
  return random * 3 * (1 + luck / 400) * (1 + stockPower / 1000);
}

export function getShopGambleRatio({ random, luck, stockPower }: ShopRatioInput): number {
  return random * 6 * (1 + luck / 200) * (1 + stockPower / 700);
}

export function getShopGamblePrice({ random, stockPower }: GamblePriceInput): number {
  return Math.floor(10000 + random * 100000 * (1 + stockPower / 700));
}

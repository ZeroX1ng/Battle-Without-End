import { as3Int } from '../../core/math/MyMath';

export const PLAYER_INFO_BUFF_COLOR = '#e3b20a';
export const PLAYER_INFO_DEBUFF_COLOR = '#ff4040';

export function formatAttackRange(attMin: number, attMax: number): string {
  const min = as3Int(attMin);
  const max = as3Int(attMax);
  return min > max ? `${max}~${min}` : `${min}~${max}`;
}

export function formatCritMultiplier(critMul: number): string {
  return `${as3Int(critMul)}%`;
}

export function formatPrimaryAttribute(value: number, basicValue: number) {
  const current = as3Int(value);
  const basic = as3Int(basicValue);
  return {
    valueText: `${current}`,
    basicText: `${basic}`,
    color: current < basic ? PLAYER_INFO_DEBUFF_COLOR : PLAYER_INFO_BUFF_COLOR,
  };
}

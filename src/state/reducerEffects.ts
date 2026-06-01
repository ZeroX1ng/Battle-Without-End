import type { GameState, GlobalConfig, PlayerState } from '../core/types';
import type { GameAction } from './actions';
import { localSave, manuallySave } from '../core/systems/SaveSystem';
import { playForgeSound, setSoundEnabled, type ForgeSoundType } from '../core/systems/SoundSystem';

export type TitleEffectEvent = { name: string; maxVal?: number; countVal?: number };

type GameEffectPayload =
  | { type: 'localSave'; playerName: string; slot: string; saveString: string }
  | { type: 'manualSave'; player: PlayerState; config: GlobalConfig; mapName: string; slot: string }
  | { type: 'forgeSound'; sound: ForgeSoundType }
  | { type: 'setSoundEnabled'; enabled: boolean };

export type GameEffect = GameEffectPayload & { id: string };

export interface ReducerContext {
  action: GameAction;
  effects: GameEffect[];
  titleEvents: TitleEffectEvent[];
  randomIndex: number;
}

export function createReducerContext(action: GameAction): ReducerContext {
  return { action, effects: [], titleEvents: [], randomIndex: 0 };
}

function nextEffectId(ctx: ReducerContext): string {
  return `${ctx.action.meta?.effectBatchId ?? 0}:${ctx.effects.length}`;
}

function queueEffect(ctx: ReducerContext, effect: GameEffectPayload): void {
  ctx.effects.push({ ...effect, id: nextEffectId(ctx) } as GameEffect);
}

export function queueLocalSave(ctx: ReducerContext, playerName: string, slot: string, saveString: string): void {
  queueEffect(ctx, { type: 'localSave', playerName, slot, saveString });
}

export function queueManualSave(ctx: ReducerContext, player: PlayerState, config: GlobalConfig, mapName: string, slot: string): void {
  queueEffect(ctx, { type: 'manualSave', player, config, mapName, slot });
}

export function queueForgeSound(ctx: ReducerContext, sound: ForgeSoundType): void {
  queueEffect(ctx, { type: 'forgeSound', sound });
}

export function queueSoundToggle(ctx: ReducerContext, enabled: boolean): void {
  queueEffect(ctx, { type: 'setSoundEnabled', enabled });
}

export function queueTitleEvent(ctx: ReducerContext, name: string, maxVal: number = 0, countVal: number = 0): void {
  ctx.titleEvents.push({ name, maxVal, countVal });
}

export function queueTitleEvents(ctx: ReducerContext, events?: TitleEffectEvent[]): void {
  if (!events?.length) return;
  for (const event of events) {
    queueTitleEvent(ctx, event.name, event.maxVal ?? 0, event.countVal ?? 0);
  }
}

export function nextRandomPercent(ctx: ReducerContext): number {
  const value = ctx.action.meta?.randomPercents?.[ctx.randomIndex];
  ctx.randomIndex += 1;
  return typeof value === 'number' ? value : 0;
}

export function clearPendingEffects(state: GameState): GameState {
  if (!state.pendingEffects?.length) return state;
  const { pendingEffects: _pendingEffects, ...rest } = state;
  return rest as GameState;
}

export function withQueuedEffects(state: GameState, ctx: ReducerContext): GameState {
  if (!ctx.effects.length) return state;
  return { ...state, pendingEffects: ctx.effects };
}

export function processGameEffects(
  effects: readonly GameEffect[] | undefined,
  processedEffectIds: Set<string>
): void {
  if (!effects?.length) return;
  for (const effect of effects) {
    if (processedEffectIds.has(effect.id)) continue;
    processedEffectIds.add(effect.id);
    switch (effect.type) {
      case 'localSave':
        localSave(effect.playerName, effect.slot, effect.saveString);
        break;
      case 'manualSave':
        manuallySave(effect.player, effect.config, effect.mapName, effect.slot);
        break;
      case 'forgeSound':
        playForgeSound(effect.sound);
        break;
      case 'setSoundEnabled':
        setSoundEnabled(effect.enabled);
        break;
    }
  }
}

export function createRandomPercents(count: number): number[] {
  return Array.from({ length: count }, () => Math.random() * 100);
}

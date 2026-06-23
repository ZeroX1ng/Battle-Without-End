// ═══ Reducer Action 类型定义 ═══
// 所有状态的修改都通过 dispatch(action) 触发，由 GameReducer 处理。
// React 组件通过 dispatch 与 core/ 纯逻辑层交互。

import type { ShopState } from '../core/types';
import type { TitleData } from '../core/types';
import type { Race } from '../core/models/Race';
import type { Equipment } from '../core/models/Equipment';
import type { Skill } from '../core/models/Skill';
import type { Map } from '../core/models/Map';
import type { Battle, BattleDebugOptions } from '../core/models/Battle';
import type { Pet } from '../core/models/Pet';

export interface GameActionMeta {
  now?: number;
  effectBatchId?: number;
  shop?: ShopState;
  randomPercents?: number[];
  loadSaveData?: { userName: string; time: string; info: string } | null;
  battleDebug?: BattleDebugOptions;
}

type GameActionCore =
  // ── 场景切换 ──
  | { type: 'SET_SCENE'; scene: string }
  | { type: 'OPEN_CONFIRM'; message: string }
  | { type: 'CLOSE_CONFIRM' }

  // ── 玩家初始化 ──
  | { type: 'PLAYER_BURN'; age: number; race: Race }
  | { type: 'PLAYER_SET_NAME'; name: string; slot?: string }

  // ── 装备操作 ──
  | { type: 'EQUIP_ITEM'; item: Equipment }
  | { type: 'UNEQUIP_ITEM'; slot: string }
  | { type: 'EQUIP_LEVELUP'; item: Equipment }

  // ── 锻造系统 ──
  | { type: 'FORGE_EQUIPMENT'; equipIndex: number; blacksmithLevel: number }
  | { type: 'AUTO_FORGE_EQUIPMENT'; equipIndex: number; blacksmithLevel: number }

  // ── 技能操作 ──
  | { type: 'SKILL_LEARN'; skill: Skill }
  | { type: 'SKILL_EQUIP'; skill: Skill }
  | { type: 'SKILL_UNEQUIP'; skill: Skill }
  | { type: 'SKILL_LEVELUP'; skill: Skill }

  // ── 战斗操作 ──
  | { type: 'BATTLE_START'; map: Map }
  | { type: 'BATTLE_TICK' }
  | { type: 'BATTLE_END' }

  // ── 年龄/升级 ──
  | { type: 'PLAYER_AGEUP' }
  | { type: 'PLAYER_ADD_EXP'; amount: number }

  // ── 资源变动 ──
  | { type: 'PLAYER_ADD_GOLD'; amount: number }
  | { type: 'PLAYER_LOSE_GOLD'; amount: number }
  | { type: 'PLAYER_LOSE_EXP' }
  | { type: 'PLAYER_ADD_AP'; amount: number }

  // ── 背包 ──
  | { type: 'ITEM_ADD'; item: Equipment }
  | { type: 'ITEM_REMOVE'; item: Equipment }
  | { type: 'ITEM_SELL'; item: Equipment }
  | { type: 'ITEM_SORT'; mode: 'value' | 'type' }

  // ── 特殊商店：背包/宠物拓展 ──
  | { type: 'BAG_EXPAND'; cost: number }
  | { type: 'PET_EXPAND'; cost: number }

  // ── 普通商店 ──
  | { type: 'SHOP_GENERATE' }
  | { type: 'SHOP_BUY_SELL'; index: number }
  | { type: 'SHOP_BUY_GAMBLE'; index: number }

  // ── 宠物 ──
  | { type: 'PET_ADD'; pet: Pet }
  | { type: 'PET_SET'; pet: Pet }
  | { type: 'PET_REMOVE'; pet: Pet }

  // ── 称号 ──
  | { type: 'TITLE_ADD'; title: TitleData }
  | { type: 'TITLE_SET'; title: TitleData }
  | { type: 'TITLE_UNLOCK_SKILLS'; skillNames: string[] }

  // ── 转生 ──
  | { type: 'START_REBIRTH' }
  | { type: 'DO_REBIRTH'; age: number; race: Race }

  // ── UI 操作 ──
  | { type: 'UI_OPEN_WINDOW'; window: string }
  | { type: 'UI_CLOSE_WINDOW' }
  | { type: 'UI_ADD_LOG'; text: string; category?: string }
  | { type: 'UI_SET_THEME'; themeMode: 'dark' | 'light' }

  // ── 存档 ──
  | { type: 'SAVE_GAME'; slot: string }
  | { type: 'MANUAL_SAVE'; slot: string }
  | { type: 'MANUAL_LOAD'; saveData: { playerName: string; slot: string; info: string } }
  | { type: 'LOAD_GAME'; slot: string }

  // ── 配置 ──
  | { type: 'CONFIG_TOGGLE'; key: string }

  // ── 地图切换 ──
  | { type: 'MAP_SWITCH'; map: Map }

  // ── 战利品统计 ──
  | { type: 'LOOT_RESET' }

  // ── Tick 计数 ──
  | { type: 'GAME_TICK' };

export type GameAction = GameActionCore & { meta?: GameActionMeta };

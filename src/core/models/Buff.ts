// ═══ Buff 状态效果系统 ═══
// AS3 原始: iData.iSkill.iBuff.Buff + BuffBurn/BuffFrozen/BuffPoison/BuffCorrosion
//
// 战斗中怪物身上可以叠加多种状态效果：
// - burn (灼伤): 每回合固定伤害，可叠加
// - frozen (冰冻): 使怪物无法行动，持续回合递减
// - poison (毒素): 每回合固定伤害，可叠加
// - corrosion (腐蚀): 降低怪物护甲，通过 Monster.protection getter 实现

import type { BuffData } from '../types';

/** Buff 运行时上下文 - 提供对战斗状态的访问 */
export interface BuffContext {
  monsterHp: number;
  monsterNameHtml?: string;
}

export class Buff implements BuffData {
  public name: string;
  public count: number;
  public turn: number;
  public maxTurn: number;
  public perValue: number;
  context: BuffContext | null = null;

  constructor() {
    this.name = '';
    this.count = 0;
    this.turn = 0;
    this.maxTurn = 0;
    this.perValue = 0;
  }

  setContext(ctx: BuffContext): void {
    this.context = ctx;
  }

  run(_context?: BuffContext): string | null { return null; }

  combine(other: BuffData): void {}

  isOver(): boolean {
    return this.count <= 0;
  }
}

/** 灼伤 - 每回合造成固定伤害，可叠加 */
export class BuffBurn extends Buff {
  constructor(damage: number) {
    super();
    this.name = 'burn';
    this.count = damage;
  }

  run(context?: BuffContext): string | null {
    const ctx = context ?? this.context;
    if (!ctx) return null;
    ctx.monsterHp -= this.count;
    const target = ctx.monsterNameHtml ? `对${ctx.monsterNameHtml}` : '';
    return `<font color='#ff4040'>灼伤</font>${target}造成了<font color='#ff4040'>${this.count}</font>伤害`;
  }

  combine(other: BuffData): void {
    this.count += other.count;
  }
}

/** 冰冻 - 使怪物无法行动，每回合 count 递减直至归零 */
export class BuffFrozen extends Buff {
  constructor(turns: number) {
    super();
    this.name = 'frozen';
    this.count = turns;
  }

  run(_context?: BuffContext): string | null {
    this.count--;
    return `被<font color='#ff4040'>冰冻了!</font>`;
  }

  combine(other: BuffData): void {
    this.count = other.count;
  }
}

/** 毒素 - 每回合造成固定伤害，可叠加 */
export class BuffPoison extends Buff {
  constructor(damage: number) {
    super();
    this.name = 'poison';
    this.count = damage;
  }

  run(context?: BuffContext): string | null {
    const ctx = context ?? this.context;
    if (!ctx) return null;
    ctx.monsterHp -= this.count;
    const target = ctx.monsterNameHtml ? `对${ctx.monsterNameHtml}` : '';
    return `<font color='#ff4040'>毒</font>${target}造成了<font color='#ff4040'>${this.count}</font>伤害`;
  }

  combine(other: BuffData): void {
    this.count += other.count;
  }
}

/** 腐蚀 - 降低目标护甲 (run() 不执行动作，效果通过 Monster.protection getter 实现) */
export class BuffCorrosion extends Buff {
  constructor(value: number) {
    super();
    this.name = 'corrosion';
    this.count = value;
  }

  run(_context?: BuffContext): string | null { return null; }

  combine(other: BuffData): void {
    this.count += other.count;
  }
}

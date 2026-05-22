// ═══ useGameLoop - 心跳 Hook ═══
// 替代 AS3 的 Timer(500) 自动战斗循环。
// 使用墙钟时间补偿后台标签页期间错过的逻辑 tick。
// 严格按照计划文档原则6设计。

import { useEffect, useRef, useCallback } from 'react';

interface GameLoopOptions {
  /** 每 tick 回调 */
  callback: () => void;
  /** 间隔毫秒（默认 500ms，对应原游戏） */
  intervalMs?: number;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 游戏主循环 Hook
 *
 * 用 Date.now() 计算经过的真实时间。
 * 浏览器后台节流导致回调延迟时，回到前台后会补齐应发生的逻辑 tick。
 *
 * @returns { tick, isRunning } - 当前 tick 计数和运行状态
 */
export function useGameLoop({ callback, intervalMs = 500, enabled = true }: GameLoopOptions) {
  const tickRef = useRef(0);
  const lastTimeRef = useRef(0);
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 保持 callback 引用最新
  callbackRef.current = callback;

  const clearLoop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const loop = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastTimeRef.current;

    if (elapsed >= intervalMs) {
      const dueTicks = Math.floor(elapsed / intervalMs);
      lastTimeRef.current += dueTicks * intervalMs;
      for (let i = 0; i < dueTicks; i += 1) {
        tickRef.current++;
        callbackRef.current();
      }
    }

    const nextDelay = Math.max(0, intervalMs - (Date.now() - lastTimeRef.current));
    timeoutRef.current = setTimeout(loop, nextDelay);
  }, [intervalMs]);

  useEffect(() => {
    clearLoop();
    if (!enabled) {
      return;
    }

    lastTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(loop, intervalMs);

    return () => {
      clearLoop();
    };
  }, [clearLoop, enabled, intervalMs, loop]);

  return { tick: tickRef.current };
}

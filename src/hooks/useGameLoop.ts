// ═══ useGameLoop - 心跳 Hook ═══
// 替代 AS3 的 Timer(500) 自动战斗循环。
// 使用 useEffect + requestAnimationFrame 实现稳定定时回调。
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
 * 用 requestAnimationFrame 实现稳定的定时器。
 * 相比 setInterval 更精确，且会随页面隐藏自动暂停以节省资源。
 *
 * @returns { tick, isRunning } - 当前 tick 计数和运行状态
 */
export function useGameLoop({ callback, intervalMs = 500, enabled = true }: GameLoopOptions) {
  const tickRef = useRef(0);
  const lastTimeRef = useRef(0);
  const callbackRef = useRef(callback);
  const rafRef = useRef<number>(0);

  // 保持 callback 引用最新
  callbackRef.current = callback;

  const loop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const elapsed = timestamp - lastTimeRef.current;

    if (elapsed >= intervalMs) {
      lastTimeRef.current = timestamp - (elapsed % intervalMs);
      tickRef.current++;
      callbackRef.current();
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [intervalMs]);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, loop]);

  return { tick: tickRef.current };
}

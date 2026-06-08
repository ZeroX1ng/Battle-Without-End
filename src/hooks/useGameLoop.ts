import { useCallback, useEffect, useRef } from 'react';

interface GameLoopOptions {
  callback: () => void;
  intervalMs?: number;
  enabled?: boolean;
}

type GameLoopScheduleInput = {
  now: number;
  lastTime: number;
  intervalMs: number;
  maxTicksPerLoop?: number;
};

export type GameLoopSchedulePlan = {
  dueTicks: number;
  ticksToRun: number;
  skippedTicks: number;
  nextLastTime: number;
  nextDelayMs: number;
};

export function planGameLoopSchedule({
  now,
  lastTime,
  intervalMs,
  maxTicksPerLoop = 1,
}: GameLoopScheduleInput): GameLoopSchedulePlan {
  const safeIntervalMs = Math.max(1, intervalMs);
  const safeMaxTicksPerLoop = Math.max(1, Math.floor(maxTicksPerLoop));
  const elapsed = now - lastTime;

  if (elapsed < safeIntervalMs) {
    return {
      dueTicks: 0,
      ticksToRun: 0,
      skippedTicks: 0,
      nextLastTime: lastTime,
      nextDelayMs: safeIntervalMs - Math.max(0, elapsed),
    };
  }

  const dueTicks = Math.floor(elapsed / safeIntervalMs);
  const ticksToRun = Math.min(dueTicks, safeMaxTicksPerLoop);
  const skippedTicks = dueTicks - ticksToRun;
  const nextLastTime = now;
  const nextDelayMs = safeIntervalMs;

  return {
    dueTicks,
    ticksToRun,
    skippedTicks,
    nextLastTime,
    nextDelayMs,
  };
}

export function useGameLoop({ callback, intervalMs = 500, enabled = true }: GameLoopOptions) {
  const tickRef = useRef(0);
  const lastTimeRef = useRef(0);
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  callbackRef.current = callback;

  const clearLoop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const loop = useCallback(() => {
    const now = Date.now();
    const plan = planGameLoopSchedule({
      now,
      lastTime: lastTimeRef.current,
      intervalMs,
    });

    if (plan.ticksToRun > 0) {
      lastTimeRef.current = plan.nextLastTime;
      for (let i = 0; i < plan.ticksToRun; i += 1) {
        tickRef.current++;
        callbackRef.current();
      }
    }

    const callbackElapsedMs = Date.now() - now;
    const nextDelay = Math.max(0, plan.nextDelayMs - callbackElapsedMs);
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

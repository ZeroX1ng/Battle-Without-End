// Temporary playtest helpers.
// Controlled by import.meta.env.PROD: visible in dev (npm run dev), hidden in release (npm run build).
export const TEST_SPEED_CONTROL_ENABLED = !import.meta.env.PROD;
export const TEST_SPEED_MULTIPLIERS = [1, 10, 25, 50] as const;
export const DEFAULT_TEST_SPEED_MULTIPLIER = 1;
export const DEFAULT_TEST_ONE_HIT_KILL_ENABLED = false;

export type TestSpeedMultiplier = (typeof TEST_SPEED_MULTIPLIERS)[number];

export function getTestSpeedIntervalMs(baseIntervalMs: number, multiplier: TestSpeedMultiplier) {
  return Math.max(1, Math.floor(baseIntervalMs / multiplier));
}

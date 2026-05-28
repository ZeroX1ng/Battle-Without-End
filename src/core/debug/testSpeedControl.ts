export const TEST_SPEED_CONTROL_ENABLED = true;
export const TEST_SPEED_MULTIPLIERS = [1, 2, 5, 10] as const;
export const DEFAULT_TEST_SPEED_MULTIPLIER = 1;

export type TestSpeedMultiplier = (typeof TEST_SPEED_MULTIPLIERS)[number];

export function getTestSpeedIntervalMs(baseIntervalMs: number, multiplier: TestSpeedMultiplier) {
  return Math.max(1, Math.floor(baseIntervalMs / multiplier));
}

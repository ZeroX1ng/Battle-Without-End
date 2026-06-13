export interface ForgeFailureResult {
  newLevel: number | null;
  yell: boolean;
}

export function getForgeSuccessRate(targetLevel: number, luck: number, blacksmithLevel: number): number {
  let rate = luck / 20 + Math.pow(Math.E, -targetLevel / 5) * 100 + blacksmithLevel;
  rate = Math.floor(rate * 100) / 100;
  const cap = 100 - targetLevel * 3;
  return rate > cap ? cap : rate;
}

export function getForgeCost(equipmentValue: number, currentLevel: number): number {
  return Math.floor(equipmentValue * Math.pow(1.2, currentLevel + 1));
}

export function getAutoForgeTarget(currentLevel: number, blacksmithLevel: number): number | null {
  if (blacksmithLevel <= 1 || currentLevel >= 15) return null;
  // AS3 source: ItemWindow.as lines 268-283
  // _loc1_ is the absolute TARGET level, NOT a level gain.
  // BS 2-5: target 1, BS 6-9: target 3, BS 10-13: target 5, BS 14+: target 7
  const target = blacksmithLevel <= 5
    ? 1
    : blacksmithLevel <= 9
      ? 3
      : blacksmithLevel <= 13
        ? 5
        : 7;
  if (currentLevel >= target) return null;
  return target;
}

export function resolveForgeFailure(
  equipmentLevel: number,
  equipmentQuality: number,
  blacksmithLevel: number,
  failureRoll: number,
): ForgeFailureResult {
  const yell = equipmentLevel > 8 || equipmentQuality >= 4;

  if (blacksmithLevel <= 1) {
    return { newLevel: null, yell };
  }
  if (blacksmithLevel <= 5) {
    return equipmentLevel < 1
      ? { newLevel: 0, yell: false }
      : { newLevel: null, yell };
  }
  if (blacksmithLevel <= 9) {
    if (failureRoll < 50) return { newLevel: 0, yell: false };
    return equipmentLevel < 3
      ? { newLevel: 0, yell: false }
      : { newLevel: null, yell };
  }
  if (blacksmithLevel <= 13) {
    if (failureRoll < 50) return { newLevel: equipmentLevel - 1, yell: false };
    return equipmentLevel < 5
      ? { newLevel: 0, yell: false }
      : { newLevel: null, yell };
  }
  if (failureRoll < 50) return { newLevel: equipmentLevel, yell: false };
  return equipmentLevel < 7
    ? { newLevel: 0, yell: false }
    : { newLevel: null, yell };
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const allInfoPanel = readFileSync(join(root, 'src/components/panels/AllInfoPanel.tsx'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const assertIncludes = (source, needle, message) => {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
};

const assertNotIncludes = (source, needle, message) => {
  if (source.includes(needle)) {
    throw new Error(message);
  }
};

if (
  packageJson.scripts?.['assert:battle-log-sticky-scroll'] !==
  'node scripts/assertBattleLogStickyScrollParity.mjs'
) {
  throw new Error('package.json must expose assert:battle-log-sticky-scroll');
}

assertIncludes(
  allInfoPanel,
  'export function isBattleLogNearBottom',
  'AllInfoPanel must expose a near-bottom predicate for sticky log behavior',
);
assertIncludes(
  allInfoPanel,
  'shouldStickToBottomRef',
  'AllInfoPanel must remember whether the user is currently following the bottom',
);
assertIncludes(
  allInfoPanel,
  'onScroll={handleScroll}',
  'AllInfoPanel must update sticky ownership from user scroll state',
);
assertIncludes(
  allInfoPanel,
  'shouldStickToBottomRef.current)',
  'AllInfoPanel must only auto-scroll when the bottom lock is active',
);
assertNotIncludes(
  allInfoPanel,
  'useEffect(() => {\n    if (scrollRef.current) {\n      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;',
  'AllInfoPanel must not unconditionally jump to the newest log on every append',
);

const thresholdMatch = allInfoPanel.match(/const BATTLE_LOG_BOTTOM_THRESHOLD = (\d+)/);
if (!thresholdMatch) {
  throw new Error('AllInfoPanel must define an explicit bottom threshold');
}
const threshold = Number(thresholdMatch[1]);
if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 32) {
  throw new Error('Battle log bottom threshold must be small and explicit');
}

console.log('Battle log sticky scroll parity checks passed.');

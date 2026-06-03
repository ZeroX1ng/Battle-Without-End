import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const allInfoPanel = readFileSync(join(root, 'src/components/panels/AllInfoPanel.tsx'), 'utf8');
const gameContext = readFileSync(join(root, 'src/state/GameContext.tsx'), 'utf8');
const mainSceneCss = readFileSync(join(root, 'src/styles/main-scene.css'), 'utf8');
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
  'data-bwe-battle-log-panel',
  'AllInfoPanel must expose a stable DOM target for long-run sticky-scroll smoke',
);
assertIncludes(
  allInfoPanel,
  'data-bwe-battle-log-message-id={msg.id}',
  'AllInfoPanel must expose message ids so long-run smoke can prove 120+ generated logs despite retention',
);
assertIncludes(
  allInfoPanel,
  'className="battle-log-panel"',
  'AllInfoPanel must use the battle-log-panel layout class instead of only inline sizing',
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
assertIncludes(
  allInfoPanel,
  'element.scrollTop = element.scrollHeight;',
  'AllInfoPanel must scroll to the newest log synchronously while the bottom lock is active',
);
assertNotIncludes(
  allInfoPanel,
  'requestAnimationFrame(',
  'AllInfoPanel must not defer sticky scrolling because content-growth scroll events can clear the bottom lock first',
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

assertIncludes(
  gameContext,
  'const MAX_BATTLE_LOG_MESSAGES = 100;',
  'GameContext.addLog must declare the AS3 battle log retention limit of 100 messages',
);
assertIncludes(
  gameContext,
  'infoMessages.slice(-(MAX_BATTLE_LOG_MESSAGES - 1))',
  'GameContext.addLog must retain at most 100 visible messages after long battles',
);
assertNotIncludes(
  gameContext,
  'infoMessages.slice(-199)',
  'GameContext.addLog must not keep 200 battle-log messages; AS3 caps the list around 100 entries',
);
assertIncludes(
  mainSceneCss,
  '.battle-log-panel',
  'main-scene.css must own the battle log viewport layout for browser-visible smoke',
);
assertIncludes(
  mainSceneCss,
  'min-height: 180px;',
  'battle log viewport must reserve enough height to prevent long-run one-line collapse',
);
assertIncludes(
  mainSceneCss,
  'height: 100%;',
  'battle log viewport must fill its grid area instead of shrinking to one visible row',
);

console.log('Battle log sticky scroll parity checks passed.');

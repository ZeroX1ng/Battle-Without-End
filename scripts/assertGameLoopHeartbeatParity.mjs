import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAs3Path } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const as3Root = resolveAs3Path('scripts');

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotIncludes(source, needle, message) {
  if (source.includes(needle)) {
    throw new Error(message);
  }
}

function readAs3(relativePath) {
  const filePath = join(as3Root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing AS3 ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

const mainScene = read('src/components/scenes/MainScene.tsx');
const gameLoop = read('src/core/systems/GameLoop.ts');
const useGameLoop = read('src/hooks/useGameLoop.ts');
const gameContext = read('src/state/GameContext.tsx');
const battleModel = read('src/core/models/Battle.ts');
const packageJson = JSON.parse(read('package.json'));
const as3Battle = readAs3('iData/Battle.as');
const as3MainScene = readAs3('iPanel/iScene/MainScene.as');
const as3Player = readAs3('iGlobal/Player.as');

assertIncludes(as3Battle, 'this.timer = new Timer(500);', 'AS3 Battle must prove the 500ms Timer heartbeat.');
assertIncludes(as3Battle, 'this.timer.addEventListener(TimerEvent.TIMER,this.run);', 'AS3 Battle Timer must call run().');
assertIncludes(as3Battle, 'this.timer.start();', 'AS3 Battle Timer must start in the Battle lifecycle.');
assertIncludes(as3Battle, '++Player.caculate;', 'AS3 Battle.run must increment Player.caculate.');
assertIncludes(as3Battle, 'if(Player.caculate > 2400)', 'AS3 Battle.run must age up after 2400 ticks.');
assertIncludes(as3Battle, 'if(Player.caculate % 60 == 0)', 'AS3 Battle.run must auto-save every 60 ticks.');
assertIncludes(as3Battle, 'if(Player.caculate % 600 == 0)', 'AS3 Battle.run must refresh shop every 600 ticks.');
assertIncludes(as3MainScene, 'battle = new Battle();', 'AS3 MainScene must create a Battle instance.');
assertIncludes(as3MainScene, 'battle.init();', 'AS3 MainScene must initialize the Battle lifecycle.');
assertIncludes(as3Player, 'public static function ageup() : void', 'AS3 Player.ageup must be the age transition source.');
assertIncludes(as3Player, 'caculate = 0;', 'AS3 Player.ageup must reset caculate.');
assertIncludes(as3Player, '"caculate"', 'AS3 Player.save must persist caculate.');

assertIncludes(
  mainScene,
  "import { gameTick } from '../../core/systems/GameLoop'",
  'MainScene must use the shared core gameTick heartbeat boundary.'
);
assertIncludes(
  mainScene,
  'gameTick(stateRef.current, dispatch,',
  'MainScene useGameLoop callback must delegate tick dispatching to core GameLoop.'
);
assertNotIncludes(
  mainScene,
  "dispatch({ type: 'BATTLE_TICK' })",
  'MainScene must not bypass core GameLoop with a component-local BATTLE_TICK branch.'
);
assertIncludes(
  mainScene,
  'stateRef.current = state',
  'MainScene must keep stateRef.current updated with the latest rendered state.'
);

assertNotIncludes(
  useGameLoop,
  'requestAnimationFrame',
  'useGameLoop must not rely on requestAnimationFrame because hidden tabs can pause AS3 logic ticks.'
);
assertNotIncludes(
  useGameLoop,
  '自动暂停',
  'useGameLoop docs must not treat hidden-page auto-pause as gameplay semantics.'
);
assertIncludes(
  useGameLoop,
  'Date.now()',
  'useGameLoop must measure elapsed wall-clock time for missed tick compensation.'
);
assertIncludes(
  useGameLoop,
  'dueTicks',
  'useGameLoop must calculate missed logical ticks when elapsed time spans multiple intervals.'
);
assertIncludes(
  useGameLoop,
  'callbackRef.current()',
  'useGameLoop must continue to invoke the latest callback reference.'
);
assertIncludes(
  gameLoop,
  "dispatch({ type: 'BATTLE_TICK', meta: { battleDebug: debugOptions } })",
  'core GameLoop must own battle heartbeat dispatch.'
);
assertNotIncludes(
  gameLoop,
  "dispatch({ type: 'GAME_TICK' })",
  'core GameLoop must not make GAME_TICK the normal heartbeat path when Battle is missing.'
);
assertIncludes(
  battleModel,
  'shouldAgeup: caculate > 2400',
  'Battle.run must emit the AS3 ageup signal after 2400 ticks.'
);
assertIncludes(
  battleModel,
  'shouldSave: caculate % 60 === 0',
  'Battle.run must emit the AS3 save signal every 60 ticks.'
);
assertIncludes(
  battleModel,
  'shouldRefreshShop: caculate % 600 === 0',
  'Battle.run must emit the AS3 shop refresh signal every 600 ticks.'
);
assertIncludes(
  gameContext,
  "case 'BATTLE_TICK':",
  'GameContext must consume BATTLE_TICK results.'
);
assertIncludes(
  gameContext,
  'result.shouldAgeup',
  'BATTLE_TICK must consume the Battle.run ageup signal.'
);
assertIncludes(
  gameContext,
  'result.shouldSave',
  'BATTLE_TICK must consume the Battle.run save signal.'
);
assertIncludes(
  gameContext,
  'result.shouldRefreshShop',
  'BATTLE_TICK must consume the Battle.run shop signal.'
);

if (packageJson.scripts?.['assert:game-loop'] !== 'node scripts/assertGameLoopHeartbeatParity.mjs') {
  throw new Error('package.json must expose assert:game-loop');
}

console.log('Game loop heartbeat parity checks passed.');

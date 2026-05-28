import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const as3Root = join(root, '..', 'BOE-O', 'scripts');

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function readAs3(relativePath) {
  const filePath = join(as3Root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing AS3 ${relativePath}`);
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

const packageJson = JSON.parse(read('package.json'));
const as3Battle = readAs3('iData/Battle.as');
const as3MainScene = readAs3('iPanel/iScene/MainScene.as');
const as3FpsShow = readAs3('tool/FPSShow.as');
const useGameLoop = read('src/hooks/useGameLoop.ts');
const visualFrame = read('src/utils/visualFrame.ts');
const effects = read('src/utils/effects.tsx');
const scrollPanel = read('src/components/common/ScrollPanel.tsx');
const useWindowSize = read('src/hooks/useWindowSize.ts');

assertIncludes(as3Battle, 'this.timer = new Timer(500);', 'AS3 Battle must keep the 500ms logic Timer baseline.');
assertIncludes(as3Battle, 'this.timer.addEventListener(TimerEvent.TIMER,this.run);', 'AS3 Battle Timer must call run().');
assertIncludes(as3MainScene, 'this.addChild(new FPSShow());', 'AS3 MainScene must show FPS separately from Battle Timer ownership.');
assertIncludes(as3FpsShow, 'this.addEventListener(Event.ENTER_FRAME,this.onEnterFrame);', 'AS3 FPSShow must prove visual frame cadence is separate from logic Timer cadence.');

assertNotIncludes(useGameLoop, 'requestAnimationFrame', 'React useGameLoop must not use visual RAF for 500ms logic ticks.');
assertIncludes(useGameLoop, 'intervalMs = 500', 'React useGameLoop must keep the default 500ms logic interval.');
assertIncludes(useGameLoop, 'setTimeout(loop, intervalMs)', 'React useGameLoop must remain Timer-like, not visual-FPS driven.');

assertIncludes(visualFrame, 'export const DEFAULT_VISUAL_FPS = 30', 'Shared visual helper must default to 30fps.');
assertIncludes(visualFrame, 'export const DEFAULT_VISUAL_FRAME_MS = 1000 / DEFAULT_VISUAL_FPS', 'Shared visual helper must expose the 30fps frame duration.');
assertIncludes(visualFrame, 'export function createVisualFrameScheduler', 'Shared visual helper must expose an imperative scheduler for non-hook animation loops.');
assertIncludes(visualFrame, 'export function useVisualFrameScheduler', 'Shared visual helper must expose a React hook scheduler.');
assertIncludes(visualFrame, 'elapsed < frameMs', 'Shared visual helper must skip RAF callbacks until the visual frame budget is due.');

assertIncludes(effects, "from './visualFrame'", 'Effects must use the shared visual FPS helper.');
assertIncludes(effects, 'DEFAULT_VISUAL_FRAME_MS', 'Effect frame-to-ms conversion must use the shared visual frame duration.');
assertIncludes(effects, 'createVisualFrameScheduler()', 'Effect RAF loops must route through the shared capped scheduler.');
assertIncludes(scrollPanel, "from '../../utils/visualFrame'", 'ScrollPanel must use the shared visual FPS helper.');
assertIncludes(scrollPanel, 'createVisualFrameScheduler()', 'ScrollPanel RAF loop must route through the shared capped scheduler.');
assertIncludes(useWindowSize, "from '../utils/visualFrame'", 'Window resize RAF coalescing must use the shared visual FPS helper.');
assertIncludes(useWindowSize, 'createVisualFrameScheduler()', 'Window resize updates must route through the shared capped scheduler.');

if (packageJson.scripts?.['assert:visual-fps-cap'] !== 'node scripts/assertVisualFpsCapParity.mjs') {
  throw new Error('package.json must expose assert:visual-fps-cap');
}

console.log('Visual FPS cap guard passed.');

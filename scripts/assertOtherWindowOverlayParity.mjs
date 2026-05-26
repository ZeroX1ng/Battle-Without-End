import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

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

const packageJson = JSON.parse(read('package.json'));
const otherWindow = read('src/components/windows/OtherWindow.tsx');
const mainScene = read('src/components/scenes/MainScene.tsx');
const gameContext = read('src/state/GameContext.tsx');
const actions = read('src/state/actions.ts');
const types = read('src/core/types.ts');

if (packageJson.scripts?.['assert:other-window-overlay'] !== 'node scripts/assertOtherWindowOverlayParity.mjs') {
  throw new Error('package.json must expose assert:other-window-overlay');
}

for (const component of ['MapWindow', 'HelpWindow', 'ShopWindow', 'SpecialShopWindow', 'SaveWindow']) {
  assertNotIncludes(otherWindow, `import { ${component} }`, `OtherWindow must not import ${component}; AS3 adds large panels to the stage`);
  assertNotIncludes(otherWindow, `<${component} />`, `OtherWindow must not embed ${component}; MainScene owns the overlay surface`);
}

assertNotIncludes(otherWindow, 'childWindows', 'OtherWindow must not maintain nested child window content');
assertNotIncludes(otherWindow, 'useState', 'OtherWindow must not own active child window state');

for (const id of ['map', 'help', 'shop', 'specialshop', 'save']) {
  assertIncludes(otherWindow, `id: '${id}'`, `OtherWindow must keep the ${id} entry button`);
}

assertIncludes(otherWindow, "dispatch({ type: 'UI_OPEN_WINDOW', window: id })", 'OtherWindow non-rebirth entries must open the MainScene overlay through reducer state');

assertIncludes(actions, "type: 'UI_OPEN_WINDOW'; window: string", 'actions.ts must declare UI_OPEN_WINDOW');
assertIncludes(gameContext, "case 'UI_OPEN_WINDOW'", 'GameContext reducer must own activeWindow state');
assertIncludes(gameContext, 'activeWindow: action.window', 'UI_OPEN_WINDOW must store the requested overlay id');
assertIncludes(types, 'activeWindow: string | null', 'GameState.ui.activeWindow must preserve overlay ownership');

for (const component of ['MapWindow', 'HelpWindow', 'ShopWindow', 'SpecialShopWindow', 'SaveWindow']) {
  assertIncludes(mainScene, `import { ${component} }`, `MainScene must import ${component} for stage overlay rendering`);
  assertIncludes(mainScene, `<${component} />`, `MainScene must render ${component} as an overlay option`);
}

assertIncludes(mainScene, 'state.ui.activeWindow', 'MainScene must read the active overlay window from reducer state');
assertIncludes(mainScene, 'main-scene__overlay', 'MainScene must expose a dedicated overlay surface');
assertIncludes(mainScene, 'main-scene__overlay-panel', 'MainScene overlay must use a stable panel frame');
assertIncludes(mainScene, 'UI_CLOSE_WINDOW', 'MainScene overlay must provide a close path');

console.log('OtherWindow stage overlay parity checks passed.');

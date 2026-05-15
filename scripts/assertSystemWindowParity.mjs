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

const systemWindow = read('src/components/panels/SystemWindow.tsx');
const systemConfig = read('src/core/systems/SystemConfig.ts');
const gameContext = read('src/state/GameContext.tsx');
const battle = read('src/core/models/Battle.ts');
const packageJson = JSON.parse(read('package.json'));

const toggleKeys = [
  'battle_toggle',
  'battleIntro_toggle',
  'money_toggle',
  'exp_toggle',
  'item_toggle',
  'item0_toggle',
  'item1_toggle',
  'item2_toggle',
  'item3_toggle',
  'item4_toggle',
  'item5_toggle',
  'sword_toggle',
  'axe_toggle',
  'bow_toggle',
  'crossbow_toggle',
  'sceptre_toggle',
  'staff_toggle',
  'tome_toggle',
  'shield_toggle',
  'dagger_toggle',
  'body_light_toggle',
  'body_medium_toggle',
  'body_heavy_toggle',
  'head_light_toggle',
  'head_medium_toggle',
  'head_heavy_toggle',
  'feet_light_toggle',
  'feet_medium_toggle',
  'feet_heavy_toggle',
  'necklace_toggle',
  'ring_toggle',
  'autoSell_toggle',
  'sound_toggle',
];

for (const key of toggleKeys) {
  assertIncludes(systemWindow, `key: '${key}'`, `SystemWindow must expose the original ${key} toggle`);
  assertIncludes(gameContext, `${key}: true`, `initial config must default ${key} to true like AS3 Global`);
}

assertIncludes(systemWindow, "dispatch({ type: 'CONFIG_TOGGLE', key })", 'SystemWindow toggles must dispatch CONFIG_TOGGLE');
assertIncludes(systemWindow, 'autoSell_toggle', 'SystemWindow must include the AS3 auto sell toggle');
assertIncludes(systemWindow, 'sound_toggle', 'SystemWindow must include the AS3 sound toggle');

assertIncludes(systemConfig, 'shouldDisplayLog', 'system config must provide log filtering');
assertIncludes(systemConfig, 'shouldKeepDroppedItem', 'system config must provide drop filtering');
assertIncludes(systemConfig, 'addItemWithAutoSell', 'system config must provide full-bag auto sell');
assertIncludes(systemConfig, 'handleDroppedItem', 'system config must provide AS3 drop-to-gold fallback');

assertIncludes(gameContext, "case 'CONFIG_TOGGLE'", 'reducer must handle CONFIG_TOGGLE');
assertIncludes(gameContext, 'setSoundEnabled(newVal)', 'sound_toggle must update SoundSystem');
assertIncludes(gameContext, 'shouldDisplayLog(state.config, action.category)', 'UI logs must respect config toggles');
assertIncludes(gameContext, 'b.config = state.config', 'battle ticks must receive the latest config');
assertIncludes(battle, 'handleDroppedItem(this.playerState, drop, this.config)', 'monster drops must respect config toggles');

if (packageJson.scripts?.['assert:system-window'] !== 'node scripts/assertSystemWindowParity.mjs') {
  throw new Error('package.json must expose assert:system-window');
}

console.log('SystemWindow parity checks passed.');

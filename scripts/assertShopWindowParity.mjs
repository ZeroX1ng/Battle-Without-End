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

const shopWindow = read('src/components/windows/ShopWindow.tsx');
const gameContext = read('src/state/GameContext.tsx');
const battleModel = read('src/core/models/Battle.ts');
const types = read('src/core/types.ts');
const actions = read('src/state/actions.ts');

assertIncludes(types, 'export interface ShopState', 'GameState must own the global shopPanel-equivalent state');
assertIncludes(types, 'shop: ShopState', 'GameState must include the global shop state');
assertIncludes(actions, "type: 'SHOP_GENERATE'", 'Actions must expose an explicit shop generation event');
assertIncludes(actions, "type: 'SHOP_BUY_SELL'", 'Actions must expose sell-item purchase by index');
assertIncludes(actions, "type: 'SHOP_BUY_GAMBLE'", 'Actions must expose gamble-item purchase by index');

assertIncludes(gameContext, 'shop: createInitialShopState(player)', 'Initial state must create shop stock outside ShopWindow mounting');
assertIncludes(gameContext, "case 'SHOP_GENERATE'", 'Reducer must regenerate global shop stock');
assertIncludes(gameContext, 'shouldRefreshShop', 'Battle ticks must surface the AS3 600 tick shop refresh signal');
assertIncludes(gameContext, 'result.shouldRefreshShop', 'BATTLE_TICK must refresh the global shop when Battle.run reaches 600 ticks');
assertIncludes(gameContext, 'generateShopState(playerState)', 'Shop refresh must use the latest battle-driven player state');

assertIncludes(battleModel, 'shouldRefreshShop: caculate % 600 === 0', 'Battle.run must report the AS3 shop refresh condition');

assertNotIncludes(shopWindow, 'useState<ShopItem[]>', 'ShopWindow must not keep sell stock in component-local state');
assertNotIncludes(shopWindow, 'useState<GambleItem[]>', 'ShopWindow must not keep gamble stock in component-local state');
assertNotIncludes(shopWindow, 'useEffect(() => {\n    generateShop();', 'ShopWindow must not generate stock only when mounted');
assertIncludes(shopWindow, 'state.shop.sellItems', 'ShopWindow must render global sell stock');
assertIncludes(shopWindow, 'state.shop.gambleItems', 'ShopWindow must render global gamble stock');

console.log('ShopWindow parity checks passed.');

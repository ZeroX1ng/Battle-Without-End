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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

const packageJson = JSON.parse(read('package.json'));
const variablesCss = read('src/styles/variables.css');
const layoutCss = read('src/styles/layout.css');
const mainSceneCss = read('src/styles/main-scene.css');
const gameLayout = read('src/components/layout/GameLayout.tsx');
const app = read('src/App.tsx');
const allInfoPanel = read('src/components/panels/AllInfoPanel.tsx');
const playerInfoPanel = read('src/components/panels/PlayerInfoPanel.tsx');
const monsterInfoPanel = read('src/components/panels/MonsterInfoPanel.tsx');
const petInfoPanel = read('src/components/panels/PetInfoPanel.tsx');
const battleSkillPanel = read('src/components/panels/BattleSkillPanel.tsx');
const lootPanel = read('src/components/panels/LootPanel.tsx');
const otherWindow = read('src/components/windows/OtherWindow.tsx');
const equipWindow = read('src/components/windows/EquipWindow.tsx');
const petWindow = read('src/components/windows/PetWindow.tsx');
const actions = read('src/state/actions.ts');
const gameContext = read('src/state/GameContext.tsx');
const types = read('src/core/types.ts');
const common = read('src/components/common/Common.tsx');
const as3MainScene = read('reference/as3/BOE-O/scripts/iPanel/iScene/MainScene.as');
const as3AllInfoInnerPanel = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iAllInfo/AllInfoInnerPanel.as');
const as3EquipWindow = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/EquipWindow.as');

assert(
  packageJson.scripts?.['assert:main-scene-ui-polish'] === 'node scripts/assertMainSceneUiPolish.mjs',
  'package.json must expose assert:main-scene-ui-polish',
);

assertIncludes(variablesCss, '--color-bar-track', 'Theme variables must expose a visible HP/MP/EXP track color.');
assertIncludes(variablesCss, '--color-exp: #793ce8', 'EXP bars must use a purple color instead of reusing MP blue.');
assertIncludes(variablesCss, '[data-bwe-theme="light"]', 'Light theme token scope must exist.');
assertIncludes(variablesCss, '[data-bwe-theme="dark"]', 'Dark theme token scope must exist.');
assertIncludes(layoutCss, 'data-bwe-theme', 'Layout CSS must document the theme attribute hook.');
assertIncludes(gameLayout, 'themeMode', 'GameLayout must receive the current theme mode.');
assertIncludes(gameLayout, 'data-bwe-theme={themeMode}', 'GameLayout must expose the current theme on the stage root.');
assertIncludes(app, 'themeMode={state.ui.themeMode}', 'App must pass UI theme state into every GameLayout scene.');
assertIncludes(actions, "type: 'UI_SET_THEME'", 'Reducer actions must include a UI theme action.');
assertIncludes(types, "themeMode: 'dark' | 'light'", 'UIState must type the theme mode.');
assertIncludes(gameContext, 'UI_THEME_STORAGE_KEY', 'Theme mode must persist as local UI preference, not as save data.');
assertIncludes(gameContext, "case 'UI_SET_THEME'", 'Game reducer must handle theme toggles.');
assertIncludes(otherWindow, 'data-bwe-theme-toggle', 'OtherWindow must expose the requested theme toggle entry.');

assertIncludes(playerInfoPanel, 'data-bwe-player-stat-value', 'PlayerInfoPanel values must expose alignment hooks.');
assertIncludes(playerInfoPanel, "textAlign: 'left'", 'PlayerInfoPanel stat values must be left-aligned.');
assertNotIncludes(playerInfoPanel, "textAlign: 'right'", 'PlayerInfoPanel stat values must not stay right-aligned.');
assertIncludes(playerInfoPanel, 'var(--color-bar-track)', 'Player HP/MP/EXP bars must use the shared grey track color.');
assertIncludes(common, "bgColor = 'var(--color-bar-track)'", 'Shared Bar must default to the visible track color.');
assertIncludes(petInfoPanel, 'var(--color-bar-track)', 'Pet HP/MP/EXP bars must use the shared grey track color.');
assertIncludes(playerInfoPanel, 'PLAYER_INFO_COLUMN_STYLE', 'PlayerInfoPanel must own a compact AS3-style three-column layout.');
assertIncludes(playerInfoPanel, 'PLAYER_INFO_ROW_FONT_SIZE', 'PlayerInfoPanel row font size must be centralized for readability tuning.');

assertIncludes(as3MainScene, 'allInfoPanel.y = 235;', 'AS3 MainScene must place the log under the player panel.');
assertIncludes(as3AllInfoInnerPanel, 'this.getTime() + param1', 'AS3 AllInfoInnerPanel must prefix every log line with a timestamp.');
assertIncludes(allInfoPanel, 'formatBattleLogTimestamp', 'AllInfoPanel must render timestamps for every battle log line.');
assertIncludes(allInfoPanel, 'battle-log-panel__timestamp', 'AllInfoPanel timestamp spans must be styleable.');
assertIncludes(gameContext, 'timestamp: number = Date.now()', 'New log messages must default to wall-clock timestamps for AS3-style display.');
assertIncludes(allInfoPanel, 'ResizeObserver', 'AllInfoPanel must resize the battle-log font from the rendered log width.');
assertIncludes(allInfoPanel, 'measureText', 'AllInfoPanel must measure the longest rendered log line before choosing font size.');
assertIncludes(mainSceneCss, '--bwe-info-panel-width: 100%', 'MainScene CSS must let battle-column cards fill the readable center column.');
assertIncludes(mainSceneCss, 'grid-template-columns: minmax(540px, 1fr) minmax(250px, 0.42fr) minmax(340px, 0.58fr)', 'MainScene must distribute space across left, center, and right columns instead of starving the battle and right panels.');
assertIncludes(mainSceneCss, 'grid-template-rows: 240px minmax(0, 1fr)', 'MainScene must reserve a taller player panel for readable row spacing.');
assertIncludes(mainSceneCss, '--bwe-battle-log-font-size', 'Battle log font size must be configurable from runtime measurement.');
assertIncludes(mainSceneCss, 'height: 100%;', 'Battle log must fill the lower-left log region instead of leaving a lower blank area.');
assertIncludes(mainSceneCss, 'font-size: var(--bwe-battle-log-font-size)', 'Battle log text must use the measured font-size CSS variable.');
assertNotIncludes(mainSceneCss, '--bwe-battle-log-height', 'MainScene must not keep the old fixed battle-log height cap.');
assertNotIncludes(mainSceneCss, 'height: min(100%, var(--bwe-battle-log-height))', 'Battle log must no longer be capped shorter than the lower-left region.');
assertNotIncludes(mainSceneCss, '--bwe-center-column-width: 190px', 'MainScene must not keep the too-narrow fixed center column that starves battle panels.');
assertNotIncludes(mainSceneCss, 'minmax(260px, 300px)', 'MainScene right column must not keep the cramped 300px upper bound.');
assertIncludes(mainSceneCss, '.main-scene__battle-top > div', 'MainScene CSS must align monster and pet panels with lower battle cards.');
assertIncludes(mainSceneCss, 'align-items: stretch', 'The log region must stretch the battle log to the lower-left bottom edge.');

assertIncludes(battleSkillPanel, 'data-bwe-battle-skill-panel', 'BattleSkillPanel must expose a geometry hook.');
assertIncludes(battleSkillPanel, 'BATTLE_SKILL_PANEL_WIDTH', 'BattleSkillPanel must keep its AS3 170px content width explicit.');
assertIncludes(battleSkillPanel, 'BATTLE_SKILL_GROUP_TITLE_FONT_SIZE', 'BattleSkillPanel attack/defence group headings must be independently readable.');
assertIncludes(battleSkillPanel, 'BATTLE_SKILL_ROW_FONT_SIZE = 14', 'BattleSkillPanel rows must be enlarged for the wider center column.');
assertNotIncludes(battleSkillPanel, '        战斗技能\n      </div>', 'BattleSkillPanel must remove the redundant visible title and give the space to the lower map stats.');
assertIncludes(monsterInfoPanel, 'MONSTER_INFO_PANEL_WIDTH', 'MonsterInfoPanel must align width with the other battle-column cards.');
assertIncludes(monsterInfoPanel, 'MONSTER_INFO_PANEL_MIN_HEIGHT', 'MonsterInfoPanel must remove the old excess blank lower area.');
assertIncludes(monsterInfoPanel, 'MONSTER_INFO_PANEL_TITLE_FONT_SIZE = 17', 'MonsterInfoPanel title text must scale with the restored center column.');
assertIncludes(petInfoPanel, 'PET_INFO_PANEL_NAME_FONT_SIZE = 16', 'PetInfoPanel name text must scale with the restored center column.');
assertIncludes(lootPanel, 'LOOT_PANEL_ROW_FONT_SIZE', 'LootPanel must define a readable row font size.');
assertIncludes(lootPanel, 'LOOT_PANEL_ROW_FONT_SIZE = 16', 'LootPanel stat rows must be enlarged for the restored center column.');
assertIncludes(lootPanel, 'LOOT_PANEL_MIN_HEIGHT', 'LootPanel must reserve enough height for the legendary equipment row.');
assertIncludes(lootPanel, 'data-bwe-loot-stat-value', 'LootPanel values must expose smoke hooks.');
assertIncludes(mainSceneCss, '--bwe-info-panel-width', 'MainScene CSS must centralize the AS3 170px info-panel width.');
assertIncludes(mainSceneCss, 'justify-items: stretch', 'Battle cards must stretch across the restored center column.');
assertIncludes(otherWindow, "gridTemplateColumns: '1fr'", 'OtherWindow entries must switch to a single column after the right rail narrows.');

assertIncludes(as3EquipWindow, 'private function setPetInfo()', 'AS3 EquipWindow must be the reference for equipment-tab pet details.');
assertIncludes(equipWindow, 'data-bwe-equip-pet-info', 'EquipWindow must render the AS3-style active pet detail block.');
assertIncludes(equipWindow, 'data-bwe-equip-pet-skill-list', 'EquipWindow must render active pet skills in the equipment tab detail area.');
assertNotIncludes(equipWindow, '卸下后的属性变化', 'EquipWindow lower detail must no longer show unequip stat deltas.');
assertNotIncludes(equipWindow, 'data-bwe-equip-stat-grid', 'EquipWindow lower detail must not keep the removed unequip delta grid.');
assertNotIncludes(petInfoPanel, 'data-bwe-battle-pet-stat-grid', 'PetInfoPanel must not duplicate the full pet stat grid after it returns to EquipWindow.');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-skill-list', 'PetInfoPanel must keep the visible active pet skill row.');

assertIncludes(petWindow, 'data-bwe-pet-list-grid', 'PetWindow must render the pet list as the primary full-height surface.');
assertIncludes(petWindow, 'data-bwe-pet-pinned-info', 'PetWindow must show selected pet detail as a pinned overlay.');
assertIncludes(petWindow, 'setPinnedPetKey', 'PetWindow row click must persist the selected detail overlay.');
assertIncludes(petWindow, 'repeat(auto-fill, minmax(200px, 1fr))', 'PetWindow must use available width without a permanent side-detail column.');
assertNotIncludes(petWindow, "gridTemplateColumns: '200px minmax(0, 1fr)'", 'PetWindow must not keep the old side-detail layout that created blank space.');

console.log('Main scene UI polish checks passed.');

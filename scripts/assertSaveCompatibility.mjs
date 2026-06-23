import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-save-compatibility-test');
const saveWarningText = '现在我的修复会对存档造成不可逆的损伤，然后分析如何修复';

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

function encodeSave(raw) {
  return Buffer.from(raw, 'utf8').toString('base64');
}

function createMemoryLocalStorage() {
  const store = new Map();
  return {
    get length() {
      return store.size;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function expectLoadedSave(loaded, context) {
  assert(loaded.playerName === 'LegacySlot', `${context}: playerName must come from the save slot argument.`);
  assert(loaded.mapName === 'Legacy Meadow', `${context}: mapName must survive legacy save load.`);
  assert(loaded.selectedTitleName === 'the Beginner', `${context}: selected title name must remain readable.`);
  assert(loaded.player.lv === 12, `${context}: player level must remain readable.`);
  assert(loaded.player.age === 18, `${context}: player age must remain readable.`);
  assert(loaded.player.ap === 9, `${context}: player AP must remain readable.`);
  assert(loaded.player.xp === 345, `${context}: player XP must remain readable.`);
  assert(loaded.player.gold === 678, `${context}: player gold must remain readable.`);
  assert(loaded.player.BAGMAX === 55, `${context}: bag size must remain readable.`);
  assert(loaded.player.PETMAX === 12, `${context}: pet capacity must remain readable.`);
  assert(Math.floor(loaded.player.basicStatus.hp) === 123, `${context}: base HP must remain readable.`);
  assert(Math.floor(loaded.player.basicStatus.mp) === 45, `${context}: base MP must remain readable.`);
  assert(Math.floor(loaded.player.basicStatus.str) === 9, `${context}: STR must remain readable.`);
  assert(Math.floor(loaded.player.basicStatus.dex) === 10, `${context}: DEX must remain readable.`);
  assert(Math.floor(loaded.player.basicStatus.intelligence) === 8, `${context}: INT must remain readable.`);
  assert(Math.floor(loaded.player.basicStatus.will) === 11, `${context}: WILL must remain readable.`);
  assert(Math.floor(loaded.player.basicStatus.luck) === 7, `${context}: LUCK must remain readable.`);
  assert(loaded.config.battle_toggle === false, `${context}: false toggles must remain false.`);
  assert(loaded.config.money_toggle === true, `${context}: numeric legacy true toggles must parse as true.`);
  assert(loaded.config.exp_toggle === false, `${context}: numeric legacy false toggles must parse as false.`);
  assert(loaded.config.sound_toggle === false, `${context}: explicit false toggles must remain false.`);
  assert(loaded.player.petList.length === 1, `${context}: legacy pet list must remain readable.`);
  assert(loaded.player.pet?.name === 'Prairie Unicorn', `${context}: equipped legacy pet must remain readable.`);
  assert(loaded.player.pet?.skillList.length === 2, `${context}: equipped legacy pet skills must remain readable.`);
}

function expectRecoveredLegacyEquipment(loaded, context) {
  assert(loaded.playerName === 'LegacyEquipSlot', `${context}: playerName must come from the save slot argument.`);
  assert(loaded.player.leftHand?.name === 'axe', `${context}: incomplete legacy equipped weapon must not block loading.`);
  assert(loaded.player.leftHand?.basicStat?.length > 0, `${context}: recovered legacy equipped weapon must keep usable basic stats.`);
  assert(loaded.player.itemList.length === 1, `${context}: incomplete legacy bag equipment must not block loading.`);
  assert(loaded.player.itemList[0]?.name === 'axe', `${context}: recovered legacy bag equipment must preserve its item identity.`);
  assert(loaded.player.itemList[0]?.basicStat?.length > 0, `${context}: recovered legacy bag equipment must keep usable basic stats.`);
}

const packageJson = JSON.parse(read('package.json'));
const saveSystemSource = read('src/core/systems/SaveSystem.ts');
const visibleGuard = read('scripts/assertVisibleUiFollowups.mjs');

assert(
  packageJson.scripts?.['assert:save-compatibility'] === 'node scripts/assertSaveCompatibility.mjs',
  'package.json must expose assert:save-compatibility',
);
assertIncludes(saveSystemSource, 'export const SAVE_LOCAL_STORAGE_KEYS', 'SaveSystem must expose browser localStorage save keys.');
assertIncludes(saveSystemSource, 'export function getBrowserSaveStorageHint', 'SaveSystem must expose a save location hint.');
assertIncludes(saveSystemSource, saveWarningText, 'SaveSystem must keep the exact save-risk reminder text for player-facing warnings.');
assertNotIncludes(visibleGuard, 'console.warn(SAVE_COMPATIBILITY_WARNING)', 'Save compatibility risk must fail this guard instead of being a console warning.');

for (const section of ['@BASIC:', '@RACE:', '@EQUIP:', '@ITEM:', '@SKILL:', '@TITLE:', '@OTHER:', '@GLOBAL:', '@SELECTION:', '@PET:', '@EQUIPEDPET:']) {
  assertIncludes(saveSystemSource, section, `serializeSave must keep the ${section} section.`);
}

const saveModule = await importTsModule({
  entry: join(root, 'src/core/systems/SaveSystem.ts'),
  root,
  outRoot,
});
const {
  SAVE_PREFIX,
  SAVE_LOCAL_STORAGE_KEYS,
  deserializeSave,
  serializeSave,
  localSave,
  localLoad,
} = saveModule;

const legacyPet = 'Prairie Unicorn#4#213#100%50%10%20%5%6%52%20%150%14#40%5%3%4%1%1%1%1%5%1#Ice Spear$0^Fireball$1^';
const legacyRaw = [
  '@BASIC:lv,12,age,18,ap,9,xp,345,gold,678,apCost,1,caculate,0,BAGMAX,55,PETMAX,12,',
  '@RACE:undeath',
  '@EQUIP:',
  '@ITEM:',
  '@SKILL:',
  '@TITLE:',
  '@OTHER:hp,123,mp,45,luck,7,intelligence,8,str,9,dex,10,will,11,',
  '@GLOBAL:toggle,battle#false#battleIntro#true#money#1#exp#0#item#true#sound#false#',
  '@SELECTION:map,Legacy Meadow#title,the Beginner',
  `@PET:${legacyPet},`,
  `@EQUIPEDPET:${legacyPet}`,
].join('');
const legacySave = encodeSave(legacyRaw);

const incompleteLegacyEquipmentRaw = [
  '@BASIC:lv,3,age,11,ap,1,xp,20,gold,30,apCost,0,caculate,0,BAGMAX,50,PETMAX,10,',
  '@RACE:undeath',
  '@EQUIP:leftHand,axe#0#1#1,',
  '@ITEM:axe#0#1#1,',
  '@SKILL:',
  '@TITLE:',
  '@OTHER:hp,12,mp,8,luck,2,intelligence,3,str,4,dex,5,will,6,',
  '@GLOBAL:toggle,battle#true#battleIntro#true#money#true#exp#true#item#true#sound#true#',
  '@SELECTION:map,Legacy Meadow',
  '@PET:',
  '@EQUIPEDPET:',
].join('');
const incompleteLegacyEquipmentSave = encodeSave(incompleteLegacyEquipmentRaw);

const loaded = deserializeSave(legacySave, 'LegacySlot');
expectLoadedSave(loaded, 'legacy import');

const recoveredLegacyEquipment = deserializeSave(incompleteLegacyEquipmentSave, 'LegacyEquipSlot');
expectRecoveredLegacyEquipment(recoveredLegacyEquipment, 'incomplete legacy equipment import');

const reserialized = serializeSave(loaded.player, loaded.config, loaded.mapName, 'LegacySlot');
const reloaded = deserializeSave(reserialized, 'LegacySlot');
expectLoadedSave(reloaded, 'legacy reserialize');

globalThis.localStorage = createMemoryLocalStorage();
localSave('LegacySlot', 'slot1', legacySave);
const localData = localLoad('slot1');
assert(localData, 'localLoad must find the browser localStorage save slot.');
assert(localData.info === legacySave, 'localLoad must return the exact stored save payload.');
expectLoadedSave(deserializeSave(localData.info, localData.userName), 'localStorage legacy slot');

assert(Array.isArray(SAVE_LOCAL_STORAGE_KEYS), 'SAVE_LOCAL_STORAGE_KEYS must be an array.');
assert(SAVE_LOCAL_STORAGE_KEYS.includes(`${SAVE_PREFIX}slot1`), 'SAVE_LOCAL_STORAGE_KEYS must include the first historical save slot.');
assert(SAVE_LOCAL_STORAGE_KEYS.includes(`${SAVE_PREFIX}slot4`), 'SAVE_LOCAL_STORAGE_KEYS must include the fourth historical save slot.');

await cleanupTranspileOutput(outRoot);

console.log('Save compatibility checks passed.');

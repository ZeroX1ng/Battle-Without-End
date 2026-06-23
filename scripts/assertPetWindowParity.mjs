import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-pet-window-test');

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

function assertMatches(source, pattern, message) {
  if (!pattern.test(source)) {
    throw new Error(message);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const petWindow = read('src/components/windows/PetWindow.tsx');
const petInfoPanel = read('src/components/panels/PetInfoPanel.tsx');
const petModel = read('src/core/models/Pet.ts');
const petSkillModel = read('src/core/models/PetSkill.ts');
const player = read('src/core/models/Player.ts');
const gameContext = read('src/state/GameContext.tsx');

assertIncludes(petInfoPanel, 'Lv.', 'PetInfoPanel must show the AS3 main-panel Lv label/value');
assertIncludes(petInfoPanel, 'function PetBarRow', 'PetInfoPanel must use compact HP/MP/EXP bars with hover values');
assertIncludes(petInfoPanel, 'label="HP"', 'PetInfoPanel must show the AS3 main-panel HP bar label');
assertIncludes(petInfoPanel, 'label="MP"', 'PetInfoPanel must show live combat pet MP in the active pet panel label');
assertIncludes(petInfoPanel, 'label="EXP"', 'PetInfoPanel must show the AS3 main-panel Exp progress bar label');
assertIncludes(petInfoPanel, 'showStringInfo(`${Math.floor(value)}/${Math.floor(max)}`)', 'PetInfoPanel must show exact HP/MP/EXP values only on hover');
assertNotIncludes(petInfoPanel, 'HP ${Math.floor(hp)}/${p.hp}', 'PetInfoPanel must not render exact HP inline in the compact battle panel');
assertNotIncludes(petInfoPanel, 'MP ${Math.floor(mp)}/${p.mp}', 'PetInfoPanel must not render exact MP inline in the compact battle panel');
assertNotIncludes(petInfoPanel, 'Exp ${Math.floor(exp)}/${expMax}', 'PetInfoPanel must not render exact Exp inline in the compact battle panel');
assertIncludes(petInfoPanel, 'getLevelExp', 'PetInfoPanel Exp max must come from the AS3 pet level-exp formula');
assertNotIncludes(petInfoPanel, 'data-bwe-battle-pet-stat-grid', 'PetInfoPanel must not duplicate the full active pet status grid after it returns to EquipWindow');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-skill-list', 'PetInfoPanel must render the active pet skill list');
assertNotIncludes(petInfoPanel, '{p.type}', 'PetInfoPanel must not expose the raw pet type key on the main panel');
assertMatches(
  petInfoPanel,
  /getTypeLabel\s*\?/,
  'PetInfoPanel must localize the optional type helper row through getTypeLabel',
);

assertIncludes(petWindow, 'useInfoWindow', 'PetWindow must use the global info window for AS3 hover details');
assertIncludes(petWindow, 'showItemInfo(getPetDescription(pet))', 'PetWindow must show the original PetInfoWindow stat details on pet hover');
assertIncludes(petWindow, 'showItemInfo(getPetSkillDescription(skill))', 'PetWindow must show PetSkillCell details on skill hover');
assertIncludes(petWindow, "dispatch({ type: 'PET_SET'", 'PetWindow must keep the original equip/switch pet action');
assertIncludes(petWindow, "dispatch({ type: 'PET_REMOVE'", 'PetWindow must expose the original delete/sell pet action');
assertIncludes(petWindow, 'setPinnedPetKey', 'PetWindow row click must persist the selected PetInfoWindow overlay.');
assertIncludes(petWindow, 'data-bwe-pet-list-grid', 'PetWindow must render the pet list as the primary full-height surface.');
assertIncludes(petWindow, 'data-bwe-pet-pinned-info', 'PetWindow must render clicked pet details as a pinned overlay instead of a permanent side column.');
assertIncludes(petWindow, 'repeat(auto-fill, minmax(200px, 1fr))', 'PetWindow must use the available tab width for the pet list.');
assertNotIncludes(petWindow, "gridTemplateColumns: '200px minmax(0, 1fr)'", 'PetWindow must not keep the old side-detail layout that created blank space.');
assertIncludes(petWindow, 'PET_STATS', 'PetWindow must render the original PetInfoWindow status rows');
assertIncludes(petWindow, 'data-bwe-pet-stat-list', 'PetWindow detail stat rows must expose a vertical list hook.');
assertIncludes(petWindow, "flexDirection: 'column'", 'PetWindow detail stat rows must use a vertical layout instead of a cramped inline grid.');
assertIncludes(petWindow, "gridTemplateColumns: '74px minmax(0, 1fr)'", 'PetWindow vertical stat rows must reserve enough label/value space.');
for (const statLabel of ['Hp', 'Mp', '攻击', '平衡', '暴击率', '防御', '护甲', '魔法攻击']) {
  assertIncludes(petWindow, `label: '${statLabel}'`, `PetWindow detail panel must show AS3 PetInfoWindow ${statLabel}`);
  assertIncludes(petModel, `${statLabel}\\t`, `Pet hover description must include AS3 PetInfoWindow ${statLabel}`);
}
assertIncludes(petWindow, 'pet.skillList', 'PetWindow must render the original pet skill cells');
assertIncludes(petWindow, 'getPetSkillDescription(skill)', 'PetWindow must render PetSkillCell skill descriptions on hover');
assertIncludes(petWindow, 'handleSetPet', 'PetWindow must separate equip/switch behavior from row selection');
assertIncludes(petWindow, 'handleRemovePet', 'PetWindow must separate delete behavior from row selection');
assertNotIncludes(petWindow, 'onClick={() => dispatch({ type: \'PET_SET\', pet })}', 'PetWindow row click must not be the only pet interaction');

assertIncludes(petModel, 'getDescription()', 'Pet model must expose the original PetInfoWindow description HTML');
assertIncludes(petModel, 'getTypeLabel()', 'Pet descriptions must include the translated pet type');
assertIncludes(petSkillModel, 'getDescription()', 'PetSkill model must expose the original PetSkillCell description HTML');

assertIncludes(player, 'export function removePet', 'Player model must expose removePet for PetCell delete behavior');
assertIncludes(player, 'petList: state.petList.filter', 'removePet must remove the target pet from the pet list');
assertIncludes(player, 'state.petList.includes(pet) ? state.petList : [...state.petList, pet]', 'Cancelling the active pet must return it to the pet list instead of losing it');
assertIncludes(gameContext, "case 'PET_REMOVE'", 'GameContext must handle PET_REMOVE');
assertIncludes(gameContext, 'removePet(state.player, action.pet)', 'PET_REMOVE must update player state through removePet');
assertIncludes(gameContext, 'withBattlePlayer(state, setPet', 'PET_SET must keep active Battle playerState in sync');
assertIncludes(gameContext, 'withBattlePlayer(state, removePet', 'PET_REMOVE must keep active Battle playerState in sync');

const playerModule = await importTsModule({
  entry: join(root, 'src/core/models/Player.ts'),
  root,
  outRoot,
});
const { setPet } = playerModule;
const activePet = { name: 'active-pet' };
const nextPet = { name: 'next-pet' };
const cancelled = setPet({ pet: activePet, petList: [] }, activePet);
assert(cancelled.pet === null, 'PET_SET on the active pet must clear the active slot');
assert(cancelled.petList.includes(activePet), 'PET_SET on the active pet must keep the pet available after cancellation');
const switched = setPet({ pet: activePet, petList: [nextPet] }, nextPet);
assert(switched.pet === nextPet, 'PET_SET on another pet must switch the active slot');
assert(switched.petList.includes(activePet), 'Switching active pets must return the previous active pet to the list');
assert(!switched.petList.includes(nextPet), 'Switching active pets must remove the new active pet from the list');

await cleanupTranspileOutput(outRoot);

console.log('PetWindow parity checks passed.');

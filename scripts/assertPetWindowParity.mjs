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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const petWindow = read('src/components/windows/PetWindow.tsx');
const petModel = read('src/core/models/Pet.ts');
const petSkillModel = read('src/core/models/PetSkill.ts');
const player = read('src/core/models/Player.ts');
const gameContext = read('src/state/GameContext.tsx');

assertIncludes(petWindow, 'useInfoWindow', 'PetWindow must use the global info window for AS3 hover details');
assertIncludes(petWindow, 'showItemInfo(getPetDescription(pet))', 'PetWindow must show the original PetInfoWindow stat details on pet hover');
assertIncludes(petWindow, 'showItemInfo(getPetSkillDescription(skill))', 'PetWindow must show PetSkillCell details on skill hover');
assertIncludes(petWindow, "dispatch({ type: 'PET_SET'", 'PetWindow must keep the original equip/switch pet action');
assertIncludes(petWindow, "dispatch({ type: 'PET_REMOVE'", 'PetWindow must expose the original delete/sell pet action');
assertIncludes(petWindow, 'selectedPet', 'PetWindow must keep selected pet state for detail/status display');
assertIncludes(petWindow, 'PET_STATS', 'PetWindow must render the original PetInfoWindow status rows');
assertIncludes(petWindow, 'pet.skillList', 'PetWindow must render the original pet skill cells');
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

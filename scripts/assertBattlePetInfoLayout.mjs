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
const petInfoPanel = read('src/components/panels/PetInfoPanel.tsx');
const equipWindow = read('src/components/windows/EquipWindow.tsx');
const battleModel = read('src/core/models/Battle.ts');
const as3Battle = read('reference/as3/BOE-O/scripts/iData/Battle.as');

assert(
  packageJson.scripts?.['assert:battle-pet-info-layout'] === 'node scripts/assertBattlePetInfoLayout.mjs',
  'package.json must expose assert:battle-pet-info-layout',
);

assertIncludes(as3Battle, 'public var petMp:int', 'AS3 Battle owns live pet MP during combat.');
assertIncludes(as3Battle, 'this.petMp = Player.pet.mp', 'AS3 Battle initializes combat pet MP from the equipped pet.');
assertIncludes(battleModel, 'public petMp: number', 'React Battle must own live pet MP during combat.');
assertIncludes(battleModel, 'this.petMp = this.pet.mp', 'React Battle must initialize combat pet MP from the equipped pet.');

assertIncludes(petInfoPanel, 'data-bwe-battle-pet-panel', 'PetInfoPanel must expose the active battle pet panel for smoke checks.');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-summary', 'PetInfoPanel must expose the compact pet summary area.');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-stat-grid', 'PetInfoPanel must render the moved full pet stat grid.');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-skill-list', 'PetInfoPanel must render the moved active pet skill list.');
assertIncludes(petInfoPanel, 'battle.petMp', 'PetInfoPanel must read live combat pet MP from Battle.');
assertIncludes(petInfoPanel, 'MP ${Math.floor(mp)}/${p.mp}', 'PetInfoPanel must show the active pet MP value beside HP/Exp.');
assertIncludes(petInfoPanel, 'p.skillList', 'PetInfoPanel must render active pet skills after moving them out of EquipWindow.');
assertIncludes(petInfoPanel, 'getPetSkillName', 'PetInfoPanel must keep pet skill labels readable.');

for (const statProperty of ['hp', 'mp', 'attmin', 'attmax', 'balance', 'cri', 'crimul', 'defence', 'pro', 'magicatt']) {
  assertIncludes(petInfoPanel, statProperty, `PetInfoPanel moved stat grid must include pet.${statProperty}.`);
}

assertNotIncludes(equipWindow, 'const PET_STATS', 'EquipWindow must not keep the duplicated pet stat grid after the move.');
assertNotIncludes(equipWindow, 'data-bwe-equip-pet-info', 'EquipWindow must not keep the old pet stat block after the move.');
assertNotIncludes(equipWindow, 'handlePetSkillHover', 'EquipWindow must not keep pet skill hover wiring after the move.');

console.log('Battle pet info layout checks passed.');

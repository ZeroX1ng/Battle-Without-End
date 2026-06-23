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
assertNotIncludes(petInfoPanel, 'data-bwe-battle-pet-stat-grid', 'PetInfoPanel must not duplicate the full pet stat grid after it returns to EquipWindow.');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-skill-list', 'PetInfoPanel must still render the active pet skill list.');
assertIncludes(petInfoPanel, 'battle.petMp', 'PetInfoPanel must read live combat pet MP from Battle.');
assertIncludes(petInfoPanel, 'getPetDisplayName', 'PetInfoPanel must display localized pet names instead of save keys.');
assertIncludes(petInfoPanel, 'pet?.realName ?? pet?.name', 'PetInfoPanel localized pet names must prefer realName.');
assertNotIncludes(petInfoPanel, 'p.name || p.realName', 'PetInfoPanel must not prefer English pet save names over realName.');
assertIncludes(petInfoPanel, 'function PetBarRow', 'PetInfoPanel must use player-panel style hover bars for HP/MP/EXP.');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-bar', 'PetInfoPanel pet bars must expose hover smoke hooks.');
assertIncludes(petInfoPanel, 'showStringInfo(`${Math.floor(value)}/${Math.floor(max)}`)', 'PetInfoPanel pet bar values must move to hover StringInfo.');
assertNotIncludes(petInfoPanel, 'HP ${Math.floor(hp)}/${p.hp}', 'PetInfoPanel must not render exact HP text inline.');
assertNotIncludes(petInfoPanel, 'MP ${Math.floor(mp)}/${p.mp}', 'PetInfoPanel must not render exact MP text inline.');
assertNotIncludes(petInfoPanel, 'Exp ${Math.floor(exp)}/${expMax}', 'PetInfoPanel must not render exact Exp text inline.');
assertIncludes(petInfoPanel, 'p.skillList', 'PetInfoPanel must render active pet skills after moving them out of EquipWindow.');
assertIncludes(petInfoPanel, 'getPetSkillName', 'PetInfoPanel must keep pet skill labels readable.');
assertIncludes(petInfoPanel, 'getPetSkillSpriteName(skill)', 'PetInfoPanel battle pet skills must use AS3 pSkill_<name> sprite icons.');
assertIncludes(petInfoPanel, 'data-bwe-battle-pet-skill-icon', 'PetInfoPanel battle pet skill icons must expose sprite smoke hooks.');
assertIncludes(petInfoPanel, '<SpriteImage name={skillSpriteName}', 'PetInfoPanel battle pet skill cells must render SpriteImage icons.');

for (const statProperty of ['hp', 'mp', 'attmin', 'attmax', 'balance', 'cri', 'crimul', 'defence', 'pro', 'magicatt']) {
  assertIncludes(equipWindow, statProperty, `EquipWindow active-pet detail grid must include pet.${statProperty}.`);
}

assertIncludes(equipWindow, 'const PET_STATS', 'EquipWindow must render the AS3 setPetInfo stat grid.');
assertIncludes(equipWindow, 'data-bwe-equip-pet-info', 'EquipWindow must own the AS3-style active pet stat block.');
assertIncludes(equipWindow, 'data-bwe-equip-pet-skill-list', 'EquipWindow must own the AS3-style active pet skill block.');
assertIncludes(equipWindow, 'handlePetSkillHover', 'EquipWindow must keep pet skill hover wiring in the equipment tab detail area.');
assertIncludes(equipWindow, 'getPetSkillSpriteName(skill)', 'EquipWindow active pet skills must use AS3 pSkill_<name> sprite icons.');

console.log('Battle pet info layout checks passed.');

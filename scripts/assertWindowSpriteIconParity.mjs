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

const as3PetCell = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iPet/PetCell.as');
const as3PetSkillCell = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iPet/PetSkillCell.as');
const as3SkillCell = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSkill/SkillCell.as');
const as3OtherWindow = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/OtherWindow.as');
const as3ClickButton = read('reference/as3/BOE-O/scripts/iPanel/iScene/iPanel/iWindow/iSystem/ClickButton.as');

const petWindow = read('src/components/windows/PetWindow.tsx');
const skillWindow = read('src/components/windows/SkillWindow.tsx');
const otherWindow = read('src/components/windows/OtherWindow.tsx');
const packageJson = JSON.parse(read('package.json'));

if (packageJson.scripts?.['assert:window-sprite-icons'] !== 'node scripts/assertWindowSpriteIconParity.mjs') {
  throw new Error('package.json must expose assert:window-sprite-icons');
}

assertIncludes(as3PetCell, 'getDefinitionByName("pet_" + this.pet.mc_name)', 'AS3 PetCell must load pet icons from pet_<mc_name>.');
assertIncludes(as3PetSkillCell, 'getDefinitionByName("pSkill_" + MyMath.StringFormChange', 'AS3 PetSkillCell must load pet skill icons from pSkill_<skill_name>.');
assertIncludes(as3SkillCell, 'getDefinitionByName("mc_" + MyMath.StringFormChange', 'AS3 SkillCell must load skill icons from mc_<skill_name>.');
assertIncludes(as3ClickButton, 'getDefinitionByName(param1)', 'AS3 ClickButton must load button icons by sprite key.');
for (const key of ['button_map', 'button_help', 'button_shop', 'button_rebirth', 'button_save']) {
  assertIncludes(as3OtherWindow, `new ClickButton("${key}",50)`, `AS3 OtherWindow must use ${key}.`);
}

assertIncludes(petWindow, "import { SpriteImage } from '../shared/SpriteImage'", 'PetWindow must render registered sprite icons instead of text placeholders.');
assertIncludes(petWindow, 'getPetSpriteName(pet)', 'PetWindow pet cells must resolve pet_<mc_name> sprite keys.');
assertIncludes(petWindow, 'getPetSkillSpriteName(skill)', 'PetWindow pet skill cells must resolve pSkill_<skill_name> sprite keys.');
assertIncludes(petWindow, 'data-bwe-pet-icon={petSpriteName}', 'PetWindow must expose the resolved pet sprite key for UI smoke.');
assertIncludes(petWindow, 'data-bwe-pet-skill-icon={skillSpriteName}', 'PetWindow must expose the resolved pet skill sprite key for UI smoke.');
assertNotIncludes(petWindow, 'getPetName(pet).slice(0, 1)', 'PetWindow pet cells must not use pet-name initials as icons.');
assertNotIncludes(petWindow, 'getPetSkillIconText', 'PetWindow pet skill cells must not use text abbreviations as icons.');

assertIncludes(skillWindow, "import { SpriteImage } from '../shared/SpriteImage'", 'SkillWindow must render registered sprite icons instead of text placeholders.');
assertIncludes(skillWindow, 'getSkillSpriteName(skill)', 'SkillWindow skill cells must resolve mc_<skill_name> sprite keys.');
assertIncludes(skillWindow, 'data-bwe-skill-icon={skillSpriteName}', 'SkillWindow must expose the resolved skill sprite key for UI smoke.');
assertNotIncludes(skillWindow, 'getSkillIconText', 'SkillWindow skill cells must not use text abbreviations as icons.');

assertIncludes(otherWindow, "import { SpriteImage } from '../shared/SpriteImage'", 'OtherWindow must render registered button sprite icons instead of text-only buttons.');
assertIncludes(otherWindow, 'otherEntryIconKeys', 'OtherWindow entries must carry AS3 button_* sprite keys.');
assertIncludes(otherWindow, 'const iconKey = otherEntryIconKeys[id]', 'OtherWindow must resolve each AS3 button sprite key before rendering.');
assertIncludes(otherWindow, 'data-bwe-other-button-icon={iconKey}', 'OtherWindow must expose the resolved button sprite key for UI smoke.');
for (const key of ['button_map', 'button_help', 'button_shop', 'button_rebirth', 'button_save']) {
  assertIncludes(otherWindow, `'${key}'`, `OtherWindow must render ${key}.`);
}
assertNotIncludes(otherWindow, 'label={label.slice(0, 2)}', 'OtherWindow buttons must not use two-character text as icons.');

console.log('Window sprite icon parity checks passed.');

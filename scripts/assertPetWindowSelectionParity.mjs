import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-pet-window-selection-test');

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function createPet(marker, overrides = {}) {
  const pet = {
    marker,
    name: marker,
    realName: `Pet ${marker}`,
    level: 1,
    saved: `${marker}#1#0#1%2%3#4%5%6#`,
    save() {
      return this.saved;
    },
    ...overrides,
  };
  return pet;
}

function clonePet(pet, marker = `${pet.marker}-clone`) {
  return createPet(marker, {
    name: pet.name,
    realName: pet.realName,
    level: pet.level,
    saved: pet.saved,
  });
}

const as3PetInnerPanel = readAs3('scripts/iPanel/iScene/iPanel/iWindow/iPet/PetInnerPanel.as');
const as3PetCell = readAs3('scripts/iPanel/iScene/iPanel/iWindow/iPet/PetCell.as');
const as3ButtonGroup = readAs3('scripts/iPanel/iCell/ButtonGroup.as');
const petWindow = read('src/components/windows/PetWindow.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3PetInnerPanel, 'this.buttonGroup = new ButtonGroup();', 'AS3 PetInnerPanel must route row selection through ButtonGroup');
assertIncludes(as3PetInnerPanel, 'this.buttonGroup.addButton(_loc3_);', 'AS3 PetInnerPanel must register each PetCell as a grouped button');
assertIncludes(as3PetCell, 'this.pet = param1;', 'AS3 PetCell keeps the current row pet on the cell');
assertIncludes(as3ButtonGroup, 'internal function setDown(param1:ButtonCell)', 'AS3 ButtonGroup owns the current grouped button state');

if (packageJson.scripts?.['assert:pet-window-selection'] !== 'node scripts/assertPetWindowSelectionParity.mjs') {
  throw new Error('package.json must expose assert:pet-window-selection');
}

assertIncludes(petWindow, 'pinnedPetKey', 'PetWindow must track pinned selection by a stable pet key, not by object reference');
assertIncludes(petWindow, 'getPetSelectionKey', 'PetWindow must derive row keys from pet identity data');
assertIncludes(petWindow, 'resolveSelectedPet', 'PetWindow must resolve the selected key against the current pet list after state clones');
assertNotIncludes(petWindow, 'petList.includes(pinnedPet)', 'PetWindow selection must not use object-reference includes checks');
assertNotIncludes(petWindow, 'visibleSelectedPet === pet', 'PetWindow row selection must not compare pet objects by reference');
assertNotIncludes(petWindow, 'state.player.pet === visibleSelectedPet', 'PetWindow equipped state must not compare cloned pet objects by reference');

try {
  const selectionModule = await importTsModule({
    entry: join(root, 'src/components/windows/petWindowSelection.ts'),
    root,
    outRoot,
  });
  const { getPetSelectionKey, resolveSelectedPet } = selectionModule;

  assert(typeof getPetSelectionKey === 'function', 'PetWindow selection helper must export getPetSelectionKey');
  assert(typeof resolveSelectedPet === 'function', 'PetWindow selection helper must export resolveSelectedPet');

  const firstPet = createPet('first');
  const secondPet = createPet('second');
  const thirdPet = createPet('third');
  const selectedKey = getPetSelectionKey(secondPet);

  assert(selectedKey, 'Selected pet key must be non-empty for a valid pet');

  const clonedList = [firstPet, secondPet, thirdPet].map(pet => clonePet(pet));
  assertEqual(
    resolveSelectedPet(clonedList, null, selectedKey)?.marker,
    'second-clone',
    'Selection must survive an immutable petList clone after clicking the second pet',
  );

  const activeSecond = clonePet(secondPet, 'second-active');
  assertEqual(
    resolveSelectedPet([clonePet(firstPet), clonePet(thirdPet)], activeSecond, selectedKey)?.marker,
    'second-active',
    'Selection must remain on the newly active pet after PET_SET removes it from petList',
  );

  assertEqual(
    resolveSelectedPet([clonePet(secondPet), clonePet(thirdPet)], null, selectedKey)?.marker,
    'second-clone',
    'Deleting a non-selected pet must not disturb the selected pet',
  );

  assertEqual(
    resolveSelectedPet([clonePet(firstPet), clonePet(thirdPet)], null, selectedKey)?.marker,
    'first-clone',
    'Deleting the selected pet must fall back to the first remaining pet',
  );

  assertEqual(
    resolveSelectedPet([], activeSecond, null)?.marker,
    'second-active',
    'Empty available pet list should still show the active pet detail when present',
  );
} finally {
  await cleanupTranspileOutput(outRoot);
}

console.log('PetWindow selection parity checks passed.');

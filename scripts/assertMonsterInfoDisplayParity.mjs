import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readAs3 } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');

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

const as3MonsterInfoPanel = readAs3('scripts/iPanel/iScene/iPanel/MonsterInfoPanel.as');
const as3Monster = readAs3('scripts/iData/iMonster/Monster.as');
const reactMonsterInfoPanel = read('src/components/panels/MonsterInfoPanel.tsx');
const reactMonster = read('src/core/models/Monster.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3MonsterInfoPanel, 'new StringCell("怪物")', 'AS3 MonsterInfoPanel must show the monster label.');
assertIncludes(as3MonsterInfoPanel, 'this.title = new StringInfoCell', 'AS3 MonsterInfoPanel must show monster title text/info.');
assertIncludes(as3MonsterInfoPanel, 'new StringCell("HP")', 'AS3 MonsterInfoPanel must show HP.');
assertIncludes(as3MonsterInfoPanel, 'new StringCell("战斗力")', 'AS3 MonsterInfoPanel must show combat power.');
assertIncludes(as3MonsterInfoPanel, 'this.cp.setText(MainScene.battle.monster.CP + "");', 'AS3 MonsterInfoPanel must update combat power from monster CP.');
assertIncludes(as3MonsterInfoPanel, 'this.updateBuff();', 'AS3 MonsterInfoPanel must render monster buffs.');
assertNotIncludes(as3MonsterInfoPanel, 'MainScene.battle.monster.attack', 'AS3 MonsterInfoPanel must not read the random monster attack getter.');
assertNotIncludes(as3MonsterInfoPanel, 'new StringCell("攻击")', 'AS3 MonsterInfoPanel must not display an attack row.');

assertIncludes(as3Monster, 'public function get attack() : int', 'AS3 Monster.attack getter must exist.');
assertIncludes(as3Monster, 'MyMath.balanceRandom(this.balance)', 'AS3 Monster.attack must remain a random getter for battle calculation.');
assertIncludes(reactMonster, 'get attack(): number', 'React Monster.attack getter must exist.');
assertIncludes(reactMonster, 'balanceRandom(this.balance)', 'React Monster.attack must keep AS3 random battle semantics.');

if (packageJson.scripts?.['assert:monster-info-display-parity'] !== 'node scripts/assertMonsterInfoDisplayParity.mjs') {
  throw new Error('package.json must expose assert:monster-info-display-parity');
}

assertIncludes(reactMonsterInfoPanel, 'dangerouslySetInnerHTML={{ __html: mon.getNameHtml(getCombatPower(state.player)) }}', 'React MonsterInfoPanel must keep AS3 monster-name color display.');
assertIncludes(reactMonsterInfoPanel, 'CP: {mon.CP}', 'React MonsterInfoPanel must display monster combat power.');
assertIncludes(reactMonsterInfoPanel, '<Bar value={hp}', 'React MonsterInfoPanel must display HP.');
assertIncludes(reactMonsterInfoPanel, 'showItemInfo(getMonsterTitleDescription(mon.title))', 'React MonsterInfoPanel must preserve monster title hover info.');
assertIncludes(reactMonsterInfoPanel, 'mon.buffList', 'React MonsterInfoPanel must read monster buffs for AS3-visible buff icons.');
assertIncludes(reactMonsterInfoPanel, 'SpriteImage', 'React MonsterInfoPanel must use the sprite asset path for AS3-visible buff icons.');
assertIncludes(reactMonsterInfoPanel, 'buff_${buff.name}', 'React MonsterInfoPanel must render buff icons using AS3 buff sprite names.');
assertNotIncludes(reactMonsterInfoPanel, 'mon.attack', 'React MonsterInfoPanel render path must not read the random monster attack getter.');
assertNotIncludes(reactMonsterInfoPanel, 'Math.floor(mon.attack)', 'React MonsterInfoPanel must not render a random single attack value.');
assertNotIncludes(reactMonsterInfoPanel, 'label="攻击"', 'React MonsterInfoPanel must not display an AS3-absent attack row.');
assertNotIncludes(reactMonsterInfoPanel, 'label="防御"', 'React MonsterInfoPanel must not display AS3-absent defence extension rows in this parity card.');
assertNotIncludes(reactMonsterInfoPanel, 'label="护甲"', 'React MonsterInfoPanel must not display AS3-absent protection extension rows in this parity card.');
assertNotIncludes(reactMonsterInfoPanel, 'label="暴击"', 'React MonsterInfoPanel must not display AS3-absent crit extension rows in this parity card.');

console.log('Monster info display parity checks passed.');

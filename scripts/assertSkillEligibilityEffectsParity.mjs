import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-skill-eligibility-effects');

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertEqual(actual, expected, message) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message}\nexpected: ${e}\nactual:   ${a}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

function skillNames(skills) {
  return skills.map(skill => skill.skillData.name);
}

function clonePlayer(player) {
  return {
    ...player,
    basicStatus: player.basicStatus.clone(),
    skillStatus: player.skillStatus.clone(),
    equipStatus: player.equipStatus.clone(),
    skillList: [...player.skillList],
    equipSkillList: [...player.equipSkillList],
    itemList: [...player.itemList],
    titleList: [...player.titleList],
    petList: [...player.petList],
  };
}

const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
const as3BattleSkillPanel = read('../BOE-O/scripts/iPanel/iScene/iPanel/iBattleSkill/BattleSkillInnerPanel.as');
const playerModel = read('src/core/models/Player.ts');
const battleModel = read('src/core/models/Battle.ts');
const battleSkillPanel = read('src/components/panels/BattleSkillPanel.tsx');
const gameContext = read('src/state/GameContext.tsx');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3Player, 'public static function get attackSkillList()', 'AS3 Player.attackSkillList is the source of truth');
assertIncludes(as3Player, '_loc3_ = WeaponCategory.MELEE;', 'AS3 defaults missing leftHand to melee for skill eligibility');
assertIncludes(as3Player, 'SkillCategory.ALL || equipSkillList[_loc4_].skillData.category == SkillCategory.MAGIC', 'AS3 allows ALL and MAGIC skills regardless of weapon category');
assertIncludes(as3Player, 'public static function updateSkillInfo()', 'AS3 Player.updateSkillInfo is the source for passive stat/effect refresh');
assertIncludes(as3BattleSkillPanel, 'Player.attackSkillList', 'AS3 BattleSkillInnerPanel displays Player.attackSkillList');
assertIncludes(as3BattleSkillPanel, 'Player.defenceSkillList', 'AS3 BattleSkillInnerPanel displays Player.defenceSkillList');

assertIncludes(playerModel, 'getAttackSkillList', 'Player.ts must expose AS3-derived attackSkillList ownership');
assertIncludes(playerModel, 'getDefenceSkillList', 'Player.ts must expose AS3-derived defenceSkillList ownership');
assertIncludes(battleModel, 'getAttackSkillList(this.playerState)', 'Battle.ts must consume Player.ts attack skill filtering');
assertIncludes(battleModel, 'getDefenceSkillList(this.playerState)', 'Battle.ts must consume Player.ts defence skill filtering');
assertIncludes(battleSkillPanel, 'getAttackSkillList(state.player)', 'BattleSkillPanel must display the filtered player attack skill list');
assertIncludes(battleSkillPanel, 'getDefenceSkillList(state.player)', 'BattleSkillPanel must display the filtered player defence skill list');
assertIncludes(gameContext, "case 'SKILL_EQUIP'", 'GameContext must handle SKILL_EQUIP');
assertIncludes(gameContext, "case 'SKILL_UNEQUIP'", 'GameContext must handle SKILL_UNEQUIP');
assertIncludes(gameContext, "case 'SKILL_LEVELUP'", 'GameContext must handle SKILL_LEVELUP');
assertIncludes(gameContext, 'withBattlePlayer(state, equipSkill', 'SKILL_EQUIP must synchronize battle.playerState');
assertIncludes(gameContext, 'withBattlePlayer(state, unequipSkill', 'SKILL_UNEQUIP must synchronize battle.playerState');
assertIncludes(gameContext, 'withBattlePlayer(state, newPlayer)', 'SKILL_LEVELUP must synchronize battle.playerState');

if (packageJson.scripts?.['assert:skill-eligibility-effects'] !== 'node scripts/assertSkillEligibilityEffectsParity.mjs') {
  throw new Error('package.json must expose assert:skill-eligibility-effects');
}

const playerModule = await importTsModule({
  entry: join(root, 'src/core/models/Player.ts'),
  root,
  outRoot,
});
const battleModule = await importTsModule({
  entry: join(root, 'src/core/models/Battle.ts'),
  root,
  outRoot,
});
const skillModule = await importTsModule({
  entry: join(root, 'src/core/models/Skill.ts'),
  root,
  outRoot,
});
const skillDataModule = await importTsModule({
  entry: join(root, 'src/core/data/skillData.ts'),
  root,
  outRoot,
});
const constantsModule = await importTsModule({
  entry: join(root, 'src/core/constants.ts'),
  root,
  outRoot,
});

const {
  createInitialPlayerState,
  equipSkill,
  unequipSkill,
  updateSkillInfo,
  getAttackSkillList,
  getDefenceSkillList,
} = playerModule;
const { Battle } = battleModule;
const { Skill } = skillModule;
const { SkillDataList } = skillDataModule;
const { SkillCategory, SkillType, WeaponCategory } = constantsModule;

assertEqual(typeof getAttackSkillList, 'function', 'Player.ts should export getAttackSkillList');
assertEqual(typeof getDefenceSkillList, 'function', 'Player.ts should export getDefenceSkillList');

function makeSkill(name) {
  const data = SkillDataList.find(item => item.name === name);
  assert(data, `Missing skill data ${name}`);
  return new Skill(data);
}

const meleeAttack = makeSkill('SMASH');
const rangedAttack = makeSkill('MIRAGE_MISSILE');
const magicAttack = makeSkill('FIREBOLT');
const allDefence = makeSkill('DEFENCE');
const meleeDefence = makeSkill('COUNTERATTACK');
const passive = makeSkill('RANGE_MASTERY');
const rangedDefence = new Skill({
  name: 'TEST_RANGED_DEFENCE',
  realName: 'Test Ranged Defence',
  category: SkillCategory.RANGED,
  type: SkillType.DEFENCE,
  statList: [[]],
  lvupCostList: [0],
});

let player = clonePlayer(createInitialPlayerState());
player.leftHand = null;
player.skillList = [meleeAttack, rangedAttack, magicAttack, allDefence, meleeDefence, passive, rangedDefence];
for (const skill of player.skillList) {
  player = equipSkill(player, skill);
}

assert(!player.equipSkillList.includes(passive), 'Passive skills must not enter equipSkillList as active battle skills');
assertEqual(
  skillNames(getAttackSkillList(player)),
  ['SMASH', 'FIREBOLT'],
  'Without leftHand, AS3 defaults to melee and excludes ranged attack skills while keeping magic attacks',
);
assertEqual(
  skillNames(getDefenceSkillList(player)),
  ['DEFENCE', 'COUNTERATTACK'],
  'Without leftHand, AS3 defaults to melee and excludes ranged defence skills while keeping ALL defence skills',
);

const rangedPlayer = { ...player, leftHand: { category: WeaponCategory.RANGED } };
assertEqual(
  skillNames(getAttackSkillList(rangedPlayer)),
  ['MIRAGE_MISSILE', 'FIREBOLT'],
  'With a ranged leftHand, ranged and magic attack skills enter the actual attack list',
);
assertEqual(
  skillNames(getDefenceSkillList(rangedPlayer)),
  ['DEFENCE', 'TEST_RANGED_DEFENCE'],
  'With a ranged leftHand, ranged and ALL defence skills enter the actual defence list',
);

const unequipped = unequipSkill(rangedPlayer, rangedAttack);
assertEqual(
  skillNames(getAttackSkillList(unequipped)),
  ['FIREBOLT'],
  'unequipSkill must remove the skill from the actual AS3-derived attack list',
);

const passivePlayer = clonePlayer(createInitialPlayerState());
passive.level = 1;
passivePlayer.leftHand = { category: WeaponCategory.RANGED };
passivePlayer.skillList = [passive];
const passiveUpdated = updateSkillInfo(passivePlayer);
assert(passiveUpdated.skillStatus.dex > 0, 'Passive statList should refresh skillStatus after level changes');
assert(passiveUpdated.skillStatus.attack.min > 0, 'Passive ranged effectList should refresh attack.min with a ranged leftHand');
assert(passiveUpdated.skillStatus.attack.max > 0, 'Passive ranged effectList should refresh attack.max with a ranged leftHand');

const battle = new Battle(player, { mapData: { monsterList: [] }, getBoss: () => null });
assertEqual(
  skillNames(battle.getAttackSkills()),
  ['SMASH', 'FIREBOLT'],
  'Battle must consume the same AS3-derived attackSkillList as Player.ts',
);
assertEqual(
  skillNames(battle.getDefenceSkills()),
  ['DEFENCE', 'COUNTERATTACK'],
  'Battle must consume the same AS3-derived defenceSkillList as Player.ts',
);

await cleanupTranspileOutput(outRoot);

console.log('Skill eligibility and passive effect parity checks passed.');

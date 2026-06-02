import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { readAs3 } from './lib/as3Source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-title-state-ownership');

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message) {
  assert(!source.includes(needle), message);
}

function extractCase(source, label) {
  const marker = `case '${label}':`;
  const start = source.indexOf(marker);
  assert(start >= 0, `Missing reducer case ${label}`);
  const nextCase = source.indexOf("\n    case '", start + marker.length);
  const nextDefault = source.indexOf('\n    default:', start + marker.length);
  const candidates = [nextCase, nextDefault].filter(index => index >= 0);
  const end = candidates.length ? Math.min(...candidates) : source.length;
  return source.slice(start, end);
}

function createConfig() {
  return {
    battle_toggle: true, battleIntro_toggle: true,
    money_toggle: true, exp_toggle: true, item_toggle: true, other_toggle: true,
    item0_toggle: true, item1_toggle: true, item2_toggle: true, item3_toggle: true, item4_toggle: true, item5_toggle: true,
    sword_toggle: true, axe_toggle: true, bow_toggle: true, crossbow_toggle: true,
    sceptre_toggle: true, staff_toggle: true, dagger_toggle: true, tome_toggle: true, shield_toggle: true,
    head_light_toggle: true, head_medium_toggle: true, head_heavy_toggle: true,
    body_light_toggle: true, body_medium_toggle: true, body_heavy_toggle: true,
    feet_light_toggle: true, feet_medium_toggle: true, feet_heavy_toggle: true,
    ring_toggle: true, necklace_toggle: true,
    autoSell_toggle: true, sound_toggle: true,
  };
}

function decodeSections(base64Decode, saveString) {
  const decoded = base64Decode(saveString);
  const sections = new Map();
  for (const block of decoded.split('@')) {
    const colonIndex = block.indexOf(':');
    if (colonIndex < 0) continue;
    sections.set(block.slice(0, colonIndex), block.slice(colonIndex + 1));
  }
  return sections;
}

function titleAt(titleList, titleName) {
  const title = titleList.find(item => item.name === titleName);
  assert(title, `Missing title ${titleName}`);
  return title;
}

const as3Title = readAs3('scripts/iData/iPlayer/Title.as');
const as3TitleList = readAs3('scripts/iData/iPlayer/TitleList.as');
const as3Player = readAs3('scripts/iGlobal/Player.as');
const as3OtherWindow = readAs3('scripts/iPanel/iScene/iPanel/iWindow/OtherWindow.as');
const as3RaceScene = readAs3('scripts/iPanel/iScene/RaceScene.as');
const titleDataSource = read('src/core/data/titleData.ts');
const playerSource = read('src/core/models/Player.ts');
const saveSystemSource = read('src/core/systems/SaveSystem.ts');
const gameContextSource = read('src/state/GameContext.tsx');
const skillBehaviorsSource = read('src/core/data/skillBehaviors.ts');
const titleWindowSource = read('src/components/panels/TitleWindow.tsx');
const packageJson = JSON.parse(read('package.json'));
const doRebirthCase = extractCase(gameContextSource, 'DO_REBIRTH');

assertIncludes(as3Title, 'this.max + "#" + this.count + "#"', 'AS3 Title.save must persist max/count/isGot.');
assertIncludes(as3TitleList, 'public static function updateTitleInfo', 'AS3 TitleList.updateTitleInfo must remain the source event map.');
assertIncludes(as3OtherWindow, 'TitleList.updateTitleInfo("reborn");', 'AS3 rebirth button must grant the reborn title before Player.burn.');
assertIncludes(as3TitleList, 'reborn.updateInfo(0,1);', 'AS3 reborn event must increment the Reborn count by 1.');
assertIncludes(as3Player, 'TitleList.updateTitleInfo("begin");', 'AS3 Player.burn must also apply the begin title event.');
assertIncludes(as3RaceScene, 'Player.burn(chosenAge,chosenRace);', 'AS3 RaceScene must call Player.burn after race/age confirmation.');
assertIncludes(as3Player, 'TitleList.list[_loc6_].save()', 'AS3 Player.save writes title state in TitleList order.');
assertEqual(packageJson.scripts?.['assert:title-state-ownership'], 'node scripts/assertTitleStateOwnershipParity.mjs', 'package.json must expose assert:title-state-ownership');

assertIncludes(titleDataSource, 'export function applyTitleEvent', 'titleData must expose a pure player-title update helper.');
assertIncludes(titleDataSource, 'export function createTitleListState', 'new players and loaded saves must get isolated title state.');
assertIncludes(titleDataSource, 'export function serializeTitleState', 'SaveSystem must serialize player-owned title state explicitly.');
assertNotIncludes(titleDataSource, 'export function updateTitleInfo(', 'updateTitleInfo must not mutate module-level TitleList.');
assertNotIncludes(titleDataSource, 'let _pendingUnlocks', 'skill unlocks must be returned from title updates, not stored in a module-level queue.');
assertNotIncludes(titleDataSource, '.behaveFunction', 'TitleList definitions must not store runtime unlock callbacks.');
assertNotIncludes(skillBehaviorsSource, "import { updateTitleInfo }", 'skill behavior code must not import global title mutation helpers.');
assertNotIncludes(skillBehaviorsSource, 'updateTitleInfo(', 'skill behavior code must emit battle title events instead of mutating global title state.');
assertNotIncludes(gameContextSource, 'updateTitleInfo', 'GameContext must not process title progress through global mutation.');
assertNotIncludes(gameContextSource, 'getPendingSkillUnlocks', 'GameContext must not drain global title unlock queues.');
assertIncludes(gameContextSource, 'applyTitleEventsToPlayer', 'GameContext must apply queued title events to GameState.player.titleList.');
assertIncludes(playerSource, 'createTitleListState()', 'new player state must own a full isolated title state table.');
assertIncludes(saveSystemSource, 'serializeTitleState', 'SaveSystem must not serialize title progress through global TitleList objects.');
assertNotIncludes(saveSystemSource, 'titleDef.save()', 'SaveSystem must not fall back to mutable TitleList.save().');
assertNotIncludes(titleWindowSource, '|| def.isGot', 'TitleWindow availability must not depend on global TitleList.isGot.');
assertIncludes(titleWindowSource, 'playerTitlesByName.get(def.name)', 'TitleWindow must render availability from current player title state.');

try {
  const titleModule = await importTsModule({
    entry: join(root, 'src/core/data/titleData.ts'),
    root,
    outRoot: join(outRoot, 'title'),
  });
  const playerModule = await importTsModule({
    entry: join(root, 'src/core/models/Player.ts'),
    root,
    outRoot: join(outRoot, 'player'),
  });
  const saveModule = await importTsModule({
    entry: join(root, 'src/core/systems/SaveSystem.ts'),
    root,
    outRoot: join(outRoot, 'save'),
  });
  const mapDataModule = await importTsModule({
    entry: join(root, 'src/core/data/mapData.ts'),
    root,
    outRoot: join(outRoot, 'map'),
  });
  const raceModule = await importTsModule({
    entry: join(root, 'src/core/data/raceData.ts'),
    root,
    outRoot: join(outRoot, 'race'),
  });
  const base64Module = await importTsModule({
    entry: join(root, 'src/core/utils/Base64.ts'),
    root,
    outRoot: join(outRoot, 'base64'),
  });

  const { TitleList, createTitleListState, applyTitleEvent, applyTitleEvents } = titleModule;
  const { createInitialPlayerState, playerBurn } = playerModule;
  const { serializeSave } = saveModule;
  const { MapList } = mapDataModule;
  const { list: RaceList } = raceModule;
  const { Base64Decode } = base64Module;

  assert(Object.isFrozen(TitleList), 'React TitleList table must be frozen static definition data.');
  assert(Object.isFrozen(TitleList[0]), 'React TitleList entries must be frozen static definition data.');

  const playerA = createInitialPlayerState();
  const playerB = createInitialPlayerState();
  assertEqual(playerA.titleList.length, TitleList.length, 'new players must own a full title table.');
  assertEqual(playerB.titleList.length, TitleList.length, 'each new player must own a full title table.');
  assert(playerA.titleList !== playerB.titleList, 'new players must not share a titleList array.');
  assert(playerA.titleList[0] !== playerB.titleList[0], 'new players must not share title objects.');

  const playerAAfterDamage = applyTitleEvent(playerA.titleList, 'damage', 500, 500);
  const playerABreaker = titleAt(playerAAfterDamage.titleList, 'the Breaker');
  assertEqual(playerABreaker.isGot, true, 'damage event must unlock the Breaker for that player.');
  assertEqual(titleAt(playerA.titleList, 'the Breaker').isGot, false, 'title updates must not mutate the previous player title state.');
  assertEqual(titleAt(playerB.titleList, 'the Breaker').isGot, false, 'title updates must not leak to another player.');
  assertEqual(titleAt(TitleList, 'the Breaker').isGot, false, 'title updates must not mutate global TitleList definitions.');

  const masterResult = applyTitleEvent(playerA.titleList, 'COMBAT_MASTERY');
  assertEqual(titleAt(masterResult.titleList, 'the Combat Master').isGot, true, 'rank-1 skill event must unlock its AS3 master title.');
  assert(masterResult.unlockedSkills.includes('LIFE_DRAIN'), 'master title unlock must return the AS3 skill unlock event.');

  const rebirthFailures = [];
  function recordRebirthCheck(condition, message) {
    if (!condition) rebirthFailures.push(message);
  }

  const beforeRebirthTitle = playerABreaker;
  const beforeRebirthPlayer = {
    ...playerA,
    race: RaceList[0],
    titleList: playerAAfterDamage.titleList,
    title: beforeRebirthTitle,
  };
  const burnedRebirthPlayer = playerBurn(beforeRebirthPlayer, 10, RaceList[0]);
  const burnedBreaker = titleAt(burnedRebirthPlayer.titleList, 'the Breaker');
  recordRebirthCheck(
    burnedBreaker.isGot === true,
    'playerBurn must preserve pre-rebirth player-owned normal titles instead of resetting titleList.',
  );
  recordRebirthCheck(
    burnedRebirthPlayer.title?.name === 'the Breaker' && burnedRebirthPlayer.title === burnedBreaker,
    'playerBurn must preserve the current title as the matching object from player.titleList.',
  );

  const rebirthEventResult = applyTitleEvents(burnedRebirthPlayer.titleList, [
    { name: 'reborn', maxVal: 0, countVal: 1 },
    { name: 'begin' },
  ]);
  const rebornAfterEvents = titleAt(rebirthEventResult.titleList, 'the Reborn');
  recordRebirthCheck(
    doRebirthCase.includes("queueTitleEvent(ctx, 'reborn', 0, 1)"),
    'DO_REBIRTH must queue reborn with countVal=1 to match AS3 reborn.updateInfo(0,1).',
  );
  recordRebirthCheck(
    doRebirthCase.includes("queueTitleEvent(ctx, 'begin')"),
    'DO_REBIRTH must apply the begin title event after Player.burn, matching AS3 Player.burn.',
  );
  recordRebirthCheck(
    rebornAfterEvents.count === 1 && rebornAfterEvents.isGot === true,
    'reborn plus begin title events must leave the Reborn count=1 and isGot=true.',
  );
  recordRebirthCheck(
    gameContextSource.includes('const currentTitleName = playerState.title?.name'),
    'applyTitleEventsToPlayer must remember the selected title name before replacing player.titleList.',
  );
  recordRebirthCheck(
    gameContextSource.includes('title: currentTitleName ? result.titleList.find'),
    'applyTitleEventsToPlayer must repoint the current title to the matching object from player.titleList.',
  );
  recordRebirthCheck(
    !doRebirthCase.includes('setTitle(newPlayer2, rebornTitle)'),
    'DO_REBIRTH must not auto-equip Reborn through setTitle(), because setTitle toggles off an already selected title.',
  );
  recordRebirthCheck(
    !doRebirthCase.includes('title: rebornTitle'),
    'DO_REBIRTH must preserve the selected title; AS3 grants Reborn progress but does not assign Player.title.',
  );

  if (rebirthFailures.length) {
    throw new Error(`Rebirth title parity checks failed:\n- ${rebirthFailures.join('\n- ')}`);
  }

  const player1 = {
    ...playerA,
    race: RaceList[0],
    titleList: playerAAfterDamage.titleList,
    title: playerABreaker,
  };
  const player2 = {
    ...playerB,
    race: RaceList[0],
  };

  const save1 = serializeSave(player1, createConfig(), MapList[0].name, 'slot1');
  const save2 = serializeSave(player2, createConfig(), MapList[0].name, 'slot2');
  const titleSaves1 = (decodeSections(Base64Decode, save1).get('TITLE') ?? '').split(',').filter(Boolean);
  const titleSaves2 = (decodeSections(Base64Decode, save2).get('TITLE') ?? '').split(',').filter(Boolean);
  const breakerIndex = TitleList.findIndex(title => title.name === 'the Breaker');

  assertEqual(titleSaves1[breakerIndex], '500#0#1', 'slot1 must save its own Breaker progress.');
  assertEqual(titleSaves2[breakerIndex], '0#0#0', 'slot2 must not inherit slot1 title progress.');
} finally {
  await cleanupTranspileOutput(outRoot);
}

console.log('Title state ownership parity checks passed.');

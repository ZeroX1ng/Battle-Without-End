import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const playerOutRoot = join(root, '.tmp-age-growth-visible-player');
const raceOutRoot = join(root, '.tmp-age-growth-visible-race');

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
    throw new Error(`${message}\nexpected: ${expected}\nactual:   ${actual}`);
  }
}

try {
  const as3PlayerInfoPanel = read('../BOE-O/scripts/iPanel/iScene/iPanel/PlayerInfoPanel.as');
  const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
  const as3Race = read('../BOE-O/scripts/iData/Race.as');
  const as3MainScene = read('../BOE-O/scripts/iPanel/iScene/MainScene.as');
  const reactPlayerInfoPanel = read('src/components/panels/PlayerInfoPanel.tsx');
  const reactPlayer = read('src/core/models/Player.ts');
  const reactGameContext = read('src/state/GameContext.tsx');
  const reactUseGameLoop = read('src/hooks/useGameLoop.ts');
  const packageJson = JSON.parse(read('package.json'));

  assert(as3PlayerInfoPanel.includes('this.age = new StringInfoCell'), 'AS3 PlayerInfoPanel must render age through StringInfoCell.');
  assert(as3PlayerInfoPanel.includes('this.age.setInfo'), 'AS3 PlayerInfoPanel must attach hover info to the age text.');
  assert(as3PlayerInfoPanel.includes('ageupList[_loc3_ - 10]'), 'AS3 age hover info must read the next growth row from Race.ageupList.');
  assert(as3PlayerInfoPanel.includes('"AP   +" + _loc4_'), 'AS3 age hover info must include next AP gain.');
  assert(as3PlayerInfoPanel.includes('timeToGrowup()'), 'AS3 age hover info must include remaining growth time.');
  assert(as3PlayerInfoPanel.includes('Player.caculate % 2400'), 'AS3 remaining growth time must be based on the 2400-tick cycle.');
  assert(as3PlayerInfoPanel.includes('_loc2_:int = _loc1_ / 120'), 'AS3 remaining growth time must convert ticks to minutes.');
  assert(as3PlayerInfoPanel.includes('_loc3_:int = (_loc1_ - _loc2_ * 120) / 2'), 'AS3 remaining growth time must convert ticks to seconds.');
  assert(as3Player.includes('public static function ageup() : void'), 'AS3 Player.ageup must own growth mutation.');
  assert(as3Player.includes('caculate = 0;'), 'AS3 Player.ageup must reset growth ticks.');
  assert(as3Player.includes('MainScene.allInfoPanel.addText'), 'AS3 Player.ageup must emit visible growth feedback.');
  assert(as3Race.includes('this.ageupList[_loc4_ - 10]'), 'AS3 Race.caculateStat must share the same ageupList source.');
  assert(as3MainScene.includes('playerInfoPanel = new PlayerInfoPanel();'), 'AS3 MainScene must place PlayerInfoPanel on the main stage.');

  assert(reactPlayerInfoPanel.includes("useInfoWindow"), 'PlayerInfoPanel age text must use the global string InfoWindow.');
  assert(reactPlayerInfoPanel.includes('showStringInfo'), 'PlayerInfoPanel must show age growth info on hover.');
  assert(reactPlayerInfoPanel.includes('onMouseOver={showAgeInfo}'), 'PlayerInfoPanel age hover must respond to browser mouseover.');
  assert(reactPlayerInfoPanel.includes("addEventListener('mouseover', show)"), 'PlayerInfoPanel age hover must install a native mouseover listener for visible smoke parity.');
  assert(reactPlayerInfoPanel.includes('isAgeHovered'), 'PlayerInfoPanel must keep age hover visible across 500ms tick re-renders.');
  assert(reactPlayerInfoPanel.includes('hideStringInfo'), 'PlayerInfoPanel must hide age growth info after hover.');
  assert(reactPlayerInfoPanel.includes('getAgeGrowthInfo'), 'PlayerInfoPanel must source age hover text from the shared Player growth helper.');
  assert(reactPlayer.includes('export function getAgeGrowthInfo'), 'Player.ts must expose the shared age growth info helper.');
  assert(reactPlayer.includes('remainingTicks'), 'Age growth helper must expose remaining growth ticks.');
  assert(reactPlayer.includes('timeToGrowup'), 'Age growth helper must expose AS3-style remaining time text.');
  assert(reactPlayer.includes('nextApGain'), 'Age growth helper must expose next AP gain.');
  assert(reactGameContext.includes('result.shouldAgeup'), 'BATTLE_TICK must still consume 2400-tick age growth.');
  assert(reactGameContext.includes('ageup(playerState)'), 'BATTLE_TICK must still call Player.ageup for growth mutation.');
  assert(reactUseGameLoop.includes('intervalMs = 500'), 'useGameLoop must preserve the 500ms logic tick default.');

  if (packageJson.scripts?.['assert:age-growth-visible'] !== 'node scripts/assertAgeGrowthVisibleParity.mjs') {
    throw new Error('package.json must expose assert:age-growth-visible');
  }

  const playerModule = await importTsModule({
    root,
    outRoot: playerOutRoot,
    entry: join(root, 'src/core/models/Player.ts'),
  });
  const raceModule = await importTsModule({
    root,
    outRoot: raceOutRoot,
    entry: join(root, 'src/core/data/raceData.ts'),
  });
  const { createInitialPlayerState, playerBurn, ageup, getAgeGrowthInfo } = playerModule;
  const chosenRace = raceModule.list[0];
  const before = { ...playerBurn(createInitialPlayerState(), 17, chosenRace), caculate: 2399 };
  const info = getAgeGrowthInfo(before);
  const nextGrowth = chosenRace.ageupList[before.age - 10];

  assertEqual(info.remainingTicks, 1, 'remaining growth ticks before ageup');
  assertEqual(info.timeToGrowup, '0:0', 'AS3-style remaining time before ageup');
  assertEqual(info.nextApGain, 1, 'next AP gain at age 17');
  assertEqual(info.nextGrowth.hp, nextGrowth.hp + 1, 'next growth hp');
  assertEqual(info.nextGrowth.mp, nextGrowth.mp + 1, 'next growth mp');
  assertEqual(info.nextGrowth.str, nextGrowth.str, 'next growth str');
  assert(info.tooltip.includes('AP   +1'), 'age tooltip must include AP gain.');
  assert(info.tooltip.includes('长大还剩:0:0'), 'age tooltip must include remaining time.');

  const grown = ageup(before);
  assertEqual(grown.age, 18, 'ageup must increment age after the 2400-tick cycle');
  assertEqual(grown.caculate, 0, 'ageup must reset caculate');
  assertEqual(grown.ap, before.ap + 1, 'ageup must add the same AP shown in the hover info');
  assertEqual(grown.basicStatus.hp, before.basicStatus.hp + nextGrowth.hp + 1, 'ageup hp must match hover info');
  assertEqual(grown.basicStatus.mp, before.basicStatus.mp + nextGrowth.mp + 1, 'ageup mp must match hover info');
  assertEqual(grown.basicStatus.str, before.basicStatus.str + nextGrowth.str, 'ageup str must match hover info');

  console.log('Age growth visible parity checks passed.');
} finally {
  await cleanupTranspileOutput(playerOutRoot);
  await cleanupTranspileOutput(raceOutRoot);
}

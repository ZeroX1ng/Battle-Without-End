import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function readProjectFile(path) {
  return readFileSync(join(root, path), 'utf8');
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

const gameContext = readProjectFile('src/state/GameContext.tsx');
const battle = readProjectFile('src/core/models/Battle.ts');

const playerVisibleSources = [
  ['src/state/GameContext.tsx', gameContext],
  ['src/core/models/Battle.ts', battle],
];

// Keep bad text samples as code points so this guard does not visibly contain mojibake.
const mojibakeFragments = [
  [0x6d63, 0x72ba],
  [0x9473, 0x5c7d],
  [0x7039, 0x72b5, 0x58bf],
  [0x95bf, 0x5a5a],
  [0x9357, 0x56e9],
  [0x7ec9, 0x677f],
  [0x7459, 0xff49],
  [0x9410, 0x572d],
  [0x7f01, 0x5fdb],
  [0x5a13, 0x544a],
  [0x701b, 0x6a3b],
  [0x6d93, 0x5d85],
  [0x5a11, 0x581d],
  [0x5b80],
  [0x93cd, 0x3f],
  [0x9428, 0x52ec],
  [0x9365, 0x70b2],
].map(codes => String.fromCodePoint(...codes));

for (const [file, source] of playerVisibleSources) {
  for (const fragment of mojibakeFragments) {
    assertNotIncludes(source, fragment, `${file} contains mojibake fragment ${fragment}`);
  }
}

assertIncludes(gameContext, '你获得了${item.getNameHTML()}!', 'Item gain log must be readable Chinese');
assertIncludes(gameContext, '背包容量拓展至 ${newPlayer.BAGMAX + 1} 格!', 'Bag expansion log must be readable Chinese');
assertIncludes(gameContext, '宠物栏拓展至 ${newPlayer.PETMAX + 1} 格!', 'Pet expansion log must be readable Chinese');
assertIncludes(gameContext, '<font color=\'#4BEA14\'>锻造成功</font> 你获得了${equip.getNameHTML()}<font color=\'#4BEA14\'>+${equip.level}!</font>', 'Forge success log must be readable Chinese');
assertIncludes(gameContext, '[自动锻造] 完成! ${equipState.getNameHTML()} 已强化至', 'Auto forge log must be readable Chinese');
assertIncludes(gameContext, '你长大了! 你现在${playerState.age}岁了!', 'Battle age-up log must keep interpolation');
assertIncludes(gameContext, '你长大了! 你现在${newPlayer.age}岁了!', 'Manual age-up log must keep interpolation');
assertIncludes(gameContext, '你获得了<font color=\'#4a60d7\'>${action.amount}</font>经验.', 'Experience gain log must be readable Chinese');
assertIncludes(gameContext, '你失去了 ${lost} 点经验...', 'Experience loss log must be readable Chinese');
assertIncludes(gameContext, '游戏已保存至 ${action.slot}!', 'Save log must be readable Chinese');
assertIncludes(gameContext, '存档已导出至 ${action.slot}.boe 文件!', 'Manual save log must be readable Chinese');
assertIncludes(gameContext, '存档 ${action.slot} 不存在', 'Load-missing log must be readable Chinese');
assertIncludes(gameContext, '欢迎回来，${playerName}。存档 ${action.slot} 已读取。', 'Load-success log must be readable Chinese');

assertIncludes(battle, '你获得了<font color=\'#4a60d7\'>${expGain}</font>经验.', 'Battle exp reward log must be readable Chinese');
assertIncludes(battle, '你获得了<font color=\'#FFA640\'>$${goldGain}</font>.', 'Battle gold reward log must be readable Chinese');
assertIncludes(battle, '背包已满，自动出售了${result.soldItem.getNameHTML()}.', 'Battle auto-sell log must be readable Chinese');
assertIncludes(battle, '你获得了${result.drop.getNameHTML()}!', 'Battle item drop log must be readable Chinese');
assertIncludes(battle, '你获得了<font color=\'#FFA640\'>$${result.convertedToGold}</font>.', 'Battle converted gold log must be readable Chinese');
assertIncludes(battle, '你获得了${pet.name}!', 'Battle pet drop log must be readable Chinese');
assertIncludes(battle, '宠物栏满了!', 'Battle pet bag full log must be readable Chinese');

for (const englishLog of [
  'Gained ',
  'Auto sold ',
  'because the bag was full',
  'Pet bag is full',
  'Welcome back,',
  'does not exist',
]) {
  for (const [file, source] of playerVisibleSources) {
    assertNotIncludes(source, englishLog, `${file} contains player-visible English log: ${englishLog}`);
  }
}

console.log('Text resource encoding checks passed.');

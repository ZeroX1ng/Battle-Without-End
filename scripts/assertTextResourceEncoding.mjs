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

const mojibakeFragments = [
  '浣犺',
  '鑳屽',
  '瀹犵墿',
  '閿婚',
  '鍗囩',
  '绉板',
  '瑙ｉ',
  '鐐圭',
  '缁忛',
  '娓告',
  '瀛樻',
  '涓嶅',
  '娑堝',
  '宀',
  '鏍?',
  '鐨勬',
  '鍥炲',
];

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

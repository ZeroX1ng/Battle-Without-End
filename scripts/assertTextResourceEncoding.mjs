import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcRoot = join(root, 'src');

const forbiddenFragments = [
  '鈺',
  '閳',
  '缂',
  '闁',
  '濞',
  '娴ｇ',
  '閼',
  '鐎',
  '绱',
  '銇',
  '鍤',
  '瑜版',
  '褰傞',
  '閸',
  '鐠',
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    throw new Error(message);
  }
}

const offenders = [];
for (const file of walk(srcRoot)) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const fragment of forbiddenFragments) {
      if (line.includes(fragment)) {
        offenders.push(`${relative(root, file)}:${index + 1}: ${line.trim()}`);
        break;
      }
    }
  });
}

if (offenders.length) {
  throw new Error(`Found mojibake text resources:\n${offenders.slice(0, 40).join('\n')}`);
}

const gameContext = readFileSync(join(root, 'src/state/GameContext.tsx'), 'utf8');
assertIncludes(gameContext, '你获得了${item.getNameHTML()}!', 'Item gain log must be readable Chinese');
assertIncludes(gameContext, '背包容量拓展至 ${newPlayer.BAGMAX + 1} 格!', 'Bag expansion log must be readable Chinese');
assertIncludes(gameContext, '宠物栏拓展至 ${newPlayer.PETMAX + 1} 格!', 'Pet expansion log must be readable Chinese');
assertIncludes(gameContext, '锻造成功', 'Forge success log must be readable Chinese');
assertIncludes(gameContext, '自动锻造', 'Auto forge log must be readable Chinese');
assertIncludes(gameContext, '你长大了! 你现在${playerState.age}岁了!', 'Battle age-up log must keep readable interpolation');
assertIncludes(gameContext, '你长大了! 你现在${newPlayer.age}岁了!', 'Manual age-up log must keep readable interpolation');
assertIncludes(gameContext, '你获得了<font color', 'Experience gain log must be readable Chinese');
assertIncludes(gameContext, '你失去了 ${lost} 点经验...', 'Experience loss log must be readable Chinese');
assertIncludes(gameContext, '游戏已保存至 ${action.slot}!', 'Save log must be readable Chinese');
assertIncludes(gameContext, '存档已导出至 ${action.slot}.boe 文件!', 'Manual save log must be readable Chinese');

console.log('Text resource encoding checks passed.');

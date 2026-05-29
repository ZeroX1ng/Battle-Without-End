import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { resolveAs3Path } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');
const as3Root = resolveAs3Path('scripts');
const outRoot = join(root, '.tmp-stat-list-test');

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\nexpected: ${e}\nactual:   ${a}`);
  }
}

function parseStatList(source) {
  const stats = [];
  const regex = /new\s+Stat\(Stat\.([A-Za-z_]+),\s*([0-9.]+)\)/g;
  let match;
  while ((match = regex.exec(source))) {
    stats.push({ name: match[1], value: Number(match[2]) });
  }
  return stats;
}

function assertExactStatShape(item, index) {
  const keys = Object.keys(item).sort();
  assertEqual(keys, ['name', 'value'], `StatList[${index}] must keep the AS3 Stat shape`);
}

try {
  const expected = parseStatList(
    await readFile(join(as3Root, 'iData/iItem/StatList.as'), 'utf8')
  );
  const { StatList } = await importTsModule({
    root,
    outRoot,
    entry: join(root, 'src/core/data/equipmentData.ts'),
  });

  assertEqual(StatList.length, expected.length, 'StatList count must match AS3 StatList.list');

  const actual = StatList.map((item, index) => {
    assertExactStatShape(item, index);
    return { name: item.name, value: item.value };
  });

  assertEqual(actual, expected, 'StatList entries must match AS3 StatList.list');
  console.log('StatList matches AS3 StatList.list.');
} finally {
  await cleanupTranspileOutput(outRoot);
}

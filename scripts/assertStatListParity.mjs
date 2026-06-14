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

function assert(condition, label) {
  if (!condition) {
    throw new Error(label);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), label);
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

  const as3PlayerInfoPanel = await readFile(
    join(as3Root, 'iPanel/iScene/iPanel/PlayerInfoPanel.as'),
    'utf8'
  );
  const reactPlayerInfoPanel = await readFile(
    join(root, 'src/components/panels/PlayerInfoPanel.tsx'),
    'utf8'
  );
  const selectorsSource = await readFile(join(root, 'src/state/selectors.ts'), 'utf8');

  assertIncludes(as3PlayerInfoPanel, 'if(Player.str < Player.basicStr)', 'AS3 PlayerInfoPanel compares strength against basicStr.');
  assertIncludes(as3PlayerInfoPanel, "this.attack.setText(Player.attMin + \"~\" + Player.attMax + \"\");", 'AS3 PlayerInfoPanel renders attack as attMin~attMax.');
  assertIncludes(as3PlayerInfoPanel, 'this.crit_mul.setText(Player.crit_mul + "%");', 'AS3 PlayerInfoPanel renders crit_mul as a percent string.');
  assertIncludes(as3PlayerInfoPanel, "return \"<font color=\\'#e3b20a\\'>\" + param1 + \"</font>\";", 'AS3 PlayerInfoPanel uses gold text for non-debuffed primary attributes.');
  assertIncludes(as3PlayerInfoPanel, "return \"<font color=\\'#ff4040\\'>\" + param1 + \"</font>\";", 'AS3 PlayerInfoPanel uses red text for debuffed primary attributes.');

  assertIncludes(selectorsSource, 'attmin: getAttMin(player)', 'selectPlayerStats must expose AS3 attMin for the status panel.');
  assertIncludes(selectorsSource, 'attmax: getAttMax(player)', 'selectPlayerStats must expose AS3 attMax for the status panel.');
  assertIncludes(selectorsSource, 'basicStr: getBasicStr(player)', 'selectPlayerStats must expose AS3 basicStr for colored strength display.');
  assertIncludes(selectorsSource, 'basicDex: getBasicDex(player)', 'selectPlayerStats must expose AS3 basicDex for colored dexterity display.');
  assertIncludes(selectorsSource, 'basicInt: getBasicInt(player)', 'selectPlayerStats must expose AS3 basicInt for colored intelligence display.');
  assertIncludes(selectorsSource, 'basicWill: getBasicWill(player)', 'selectPlayerStats must expose AS3 basicWill for colored will display.');
  assertIncludes(selectorsSource, 'basicLuck: getBasicLuck(player)', 'selectPlayerStats must expose AS3 basicLuck for colored luck display.');

  assertIncludes(reactPlayerInfoPanel, 'formatAttackRange(s.attmin, s.attmax)', 'PlayerInfoPanel must render attack as the AS3 min~max range.');
  assertIncludes(reactPlayerInfoPanel, 'formatCritMultiplier(s.crit_mul)', 'PlayerInfoPanel must render crit_mul as an AS3 percent string.');
  assertIncludes(reactPlayerInfoPanel, 'PrimaryRow', 'PlayerInfoPanel must render primary attributes with AS3 basic-value comparison.');
  assertIncludes(reactPlayerInfoPanel, 'formatPrimaryAttribute(value, basic)', 'PrimaryRow must compare effective values against AS3 basic values.');

  const {
    PLAYER_INFO_BUFF_COLOR,
    PLAYER_INFO_DEBUFF_COLOR,
    formatAttackRange,
    formatCritMultiplier,
    formatPrimaryAttribute,
  } = await importTsModule({
    root,
    outRoot,
    entry: join(root, 'src/components/panels/playerInfoDisplay.ts'),
  });

  assertEqual(formatAttackRange(62.9, 129.1), '62~129', 'Attack range must render attMin~attMax with AS3 int display.');
  assertEqual(formatAttackRange(129.1, 62.9), '62~129', 'Attack range must mirror AS3 swapped min/max display.');
  assertEqual(formatCritMultiplier(100), '100%', 'Crit multiplier must render the AS3 percent domain.');
  assertEqual(formatCritMultiplier(150.9), '150%', 'Crit multiplier must truncate like AS3 int getters before adding %.');
  assertEqual(formatPrimaryAttribute(13.9, 15.2), {
    valueText: '13',
    basicText: '15',
    color: PLAYER_INFO_DEBUFF_COLOR,
  }, 'Primary attributes below their AS3 basic value must render red with the basic value.');
  assertEqual(formatPrimaryAttribute(17.4, 15.2), {
    valueText: '17',
    basicText: '15',
    color: PLAYER_INFO_BUFF_COLOR,
  }, 'Primary attributes at or above their AS3 basic value must render gold with the basic value.');

  console.log('StatList and PlayerInfoPanel display parity checks passed.');
} finally {
  await cleanupTranspileOutput(outRoot);
}

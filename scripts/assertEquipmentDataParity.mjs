import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';
import { resolveAs3Path } from './lib/as3Source.mjs';

const root = resolve(import.meta.dirname, '..');
const as3Root = resolveAs3Path('scripts');
const outRoot = join(root, '.tmp-equipment-data-test');

const constantValues = {
  'Equipment.HEAD': 'head',
  'Equipment.BODY': 'body',
  'Equipment.FEET': 'feet',
  'Equipment.NECKLACE': 'necklace',
  'Equipment.RING': 'ring',
  'Weapon.ONEHAND': 'one-handed',
  'Weapon.OFFHAND': 'off hand',
  'Weapon.TWOHAND': 'two-handed',
  'WeaponType.SWORD': 'sword',
  'WeaponType.AXE': 'axe',
  'WeaponType.BOW': 'bow',
  'WeaponType.CROSSBOW': 'crossbow',
  'WeaponType.STAFF': 'staff',
  'WeaponType.SCEPTRE': 'sceptre',
  'WeaponType.DAGGER': 'dagger',
  'WeaponType.SHIELD': 'shield',
  'WeaponType.TOME': 'tome',
  'EquipType.HEAVY': 'heavy',
  'EquipType.MEDIUM': 'medium',
  'EquipType.LIGHT': 'light',
  'EquipType.ACCESORY': 'accesory',
  'WeaponCategory.MELEE': 'melee',
  'WeaponCategory.RANGED': 'ranged',
};

const dataKeys = ['name', 'realName', 'type', 'position', 'stat', 'sortWeight'];
const weaponKeys = [...dataKeys, 'category'];

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\nexpected: ${e}\nactual:   ${a}`);
  }
}

function resolveConstant(expression) {
  const normalized = expression.trim();
  if (!(normalized in constantValues)) {
    throw new Error(`Unknown AS3 constant in EquipmentList: ${normalized}`);
  }
  return constantValues[normalized];
}

function parseRangeStats(source) {
  if (!source) return [];
  const stats = [];
  const regex = /new\s+RangeStat\(Stat\s*\.([A-Za-z_]+),\s*([0-9.]+),\s*([0-9.]+)\)/g;
  let match;
  while ((match = regex.exec(source))) {
    stats.push({
      name: match[1],
      valueMin: Number(match[2]),
      changeRange: Number(match[3]),
    });
  }
  return stats;
}

function parseEquipmentList(source) {
  const entries = [];
  const weaponRegex = /new\s+WeaponData\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*new\s+<RangeStat>\s*\[([\s\S]*?)\]\s*,\s*([^,]+?)\s*,\s*([0-9]+)\s*\)/g;
  const equipmentRegex = /new\s+EquipmentData\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*(?:new\s+<RangeStat>\s*\[([\s\S]*?)\]|new\s+Vector\.<RangeStat>\(0\))\s*,\s*([0-9]+)\s*\)/g;

  let match;
  while ((match = weaponRegex.exec(source))) {
    entries.push({
      index: match.index,
      value: {
        position: resolveConstant(match[1]),
        type: resolveConstant(match[2]),
        name: match[3],
        realName: match[4],
        stat: parseRangeStats(match[5]),
        category: resolveConstant(match[6]),
        sortWeight: Number(match[7]),
      },
    });
  }

  while ((match = equipmentRegex.exec(source))) {
    entries.push({
      index: match.index,
      value: {
        position: resolveConstant(match[1]),
        type: resolveConstant(match[2]),
        name: match[3],
        realName: match[4],
        stat: parseRangeStats(match[5]),
        sortWeight: Number(match[6]),
      },
    });
  }

  return entries
    .sort((a, b) => a.index - b.index)
    .map(entry => entry.value);
}

function assertExactEquipmentShape(item, index) {
  const expectedKeys = item.category ? weaponKeys : dataKeys;
  assertEqual(
    Object.keys(item).sort(),
    [...expectedKeys].sort(),
    `EquipmentList[${index}] must not carry non-AS3 data fields`
  );
}

function normalizeEquipment(item, index) {
  assertExactEquipmentShape(item, index);
  const normalized = {
    position: item.position,
    type: item.type,
    name: item.name,
    realName: item.realName,
    stat: item.stat.map(stat => ({
      name: stat.name,
      valueMin: stat.valueMin,
      changeRange: stat.changeRange,
    })),
  };
  if (item.category) {
    normalized.category = item.category;
  }
  normalized.sortWeight = item.sortWeight;
  return normalized;
}

try {
  const expected = parseEquipmentList(
    await readFile(join(as3Root, 'iData/iItem/EquipmentList.as'), 'utf8')
  );
  const { EquipmentList } = await importTsModule({
    root,
    outRoot,
    entry: join(root, 'src/core/data/equipmentData.ts'),
  });

  assertEqual(EquipmentList.length, expected.length, 'EquipmentList count must match AS3 EquipmentList.list');
  assertEqual(
    EquipmentList.map(normalizeEquipment),
    expected,
    'EquipmentList entries must match AS3 EquipmentList.list'
  );
  console.log('EquipmentList matches AS3 EquipmentList.list.');
} finally {
  await cleanupTranspileOutput(outRoot);
}

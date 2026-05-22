import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outRoot = join(root, '.tmp-parity-skill-data-values');

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

function assertEqual(actual, expected, message) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${message}\nexpected: ${expectedJson}\nactual:   ${actualJson}`);
  }
}

function getSkill(skills, name) {
  const skill = skills.find(item => item.name === name);
  assert(skill, `Missing skill data ${name}`);
  return skill;
}

function statMap(stats) {
  return Object.fromEntries((stats ?? []).map(item => [item.name, item.value]));
}

function assertStatList(stats, expected, message) {
  assertEqual(statMap(stats), expected, message);
}

function findMatching(source, start, open, close) {
  let depth = 0;
  let quote = null;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    const previous = source[index - 1];
    if (quote) {
      if (char === quote && previous !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === open) depth++;
    if (char === close) {
      depth--;
      if (depth === 0) return index;
    }
  }
  throw new Error(`No matching ${close} for ${open} at ${start}`);
}

function splitTopLevel(source) {
  const parts = [];
  let parens = 0;
  let brackets = 0;
  let angles = 0;
  let quote = null;
  let last = 0;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    const previous = source[index - 1];
    if (quote) {
      if (char === quote && previous !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') parens++;
    else if (char === ')') parens--;
    else if (char === '[') brackets++;
    else if (char === ']') brackets--;
    else if (char === '<') angles++;
    else if (char === '>') angles--;
    else if (char === ',' && parens === 0 && brackets === 0 && angles === 0) {
      parts.push(source.slice(last, index).trim());
      last = index + 1;
    }
  }
  parts.push(source.slice(last).trim());
  return parts;
}

function parseAs3Stats(expression) {
  if (expression === 'null') return undefined;
  const start = expression.indexOf('[');
  const end = findMatching(expression, start, '[', ']');
  return splitTopLevel(expression.slice(start + 1, end)).map(level => {
    if (level.includes('new Vector.<Stat>(0)')) return [];
    const bracket = level.indexOf('[');
    if (bracket < 0) return [];
    const close = findMatching(level, bracket, '[', ']');
    return [...level.slice(bracket + 1, close).matchAll(/new Stat\(Stat\s*\.\s*([A-Za-z_]+)\s*,\s*([^)]+)\)/g)]
      .map(match => ({ name: match[1], value: Number(match[2]) }));
  });
}

function parseAs3NumberArray(expression) {
  if (expression === 'null') return undefined;
  const start = expression.indexOf('[');
  const end = findMatching(expression, start, '[', ']');
  return Function(`return ${expression.slice(start, end + 1)}`)();
}

function parseAs3SkillDataList(source) {
  const parsed = new Map();
  const skillPattern = /public static const (\w+):(PassiveSkillData|ActiveSkillData) = new \2\(/g;
  let match;
  while ((match = skillPattern.exec(source))) {
    const name = match[1];
    const passive = match[2] === 'PassiveSkillData';
    const open = source.indexOf('(', match.index);
    const close = findMatching(source, open, '(', ')');
    const args = splitTopLevel(source.slice(open + 1, close));
    parsed.set(name, {
      name,
      statList: parseAs3Stats(args[passive ? 3 : 4]),
      effectList: parseAs3Stats(args[passive ? 4 : 5]),
      lvupCostList: parseAs3NumberArray(args[passive ? 5 : 6]),
      setList: passive ? undefined : parseAs3NumberArray(args[7]),
    });
    skillPattern.lastIndex = close;
  }
  const listMatch = source.match(/public static const list:Vector\.<SkillData> = new <SkillData>\[([^\]]+)\]/);
  assert(listMatch, 'AS3 SkillDataList.list must be present');
  return listMatch[1].split(',').map(name => {
    const skill = parsed.get(name.trim());
    assert(skill, `AS3 list references missing skill ${name.trim()}`);
    return skill;
  });
}

function normalizeStats(levels) {
  return levels?.map(level => level.map(item => ({ name: item.name, value: item.value })));
}

const as3SkillDataList = read('../BOE-O/scripts/iData/iSkill/SkillDataList.as');
const as3SkillData = read('../BOE-O/scripts/iData/iSkill/SkillData.as');
const as3PassiveSkillData = read('../BOE-O/scripts/iData/iSkill/PassiveSkillData.as');
const as3ActiveSkillData = read('../BOE-O/scripts/iData/iSkill/ActiveSkillData.as');
const as3Skill = read('../BOE-O/scripts/iData/iSkill/Skill.as');
const as3Player = read('../BOE-O/scripts/iGlobal/Player.as');
const skillDataSource = read('src/core/data/skillData.ts');
const skillModelSource = read('src/core/models/Skill.ts');
const packageJson = JSON.parse(read('package.json'));

assertIncludes(as3SkillDataList, 'public static const COMBAT_MASTERY:PassiveSkillData', 'AS3 SkillDataList.as must define COMBAT_MASTERY as PassiveSkillData');
assertIncludes(as3SkillDataList, 'public static const SMASH:ActiveSkillData', 'AS3 SkillDataList.as must define SMASH as ActiveSkillData');
assertIncludes(as3SkillDataList, 'new Stat(Stat.attackMin,8),new Stat(Stat.attackMax,18),new Stat(Stat.balance,15)', 'AS3 COMBAT_MASTERY L14 effectList includes balance');
assertIncludes(as3SkillDataList, 'new Stat(Stat.attackMin,10),new Stat(Stat.attackMax,25),new Stat(Stat.balance,15)', 'AS3 RANGE_MASTERY L14 effectList includes balance');
assertIncludes(as3SkillDataList, '[200,210,220,230,240,250,300,310,320,330,400,420,440,460,500]', 'AS3 SMASH.setList is a flat numeric array');
assertIncludes(as3SkillData, 'public var statList:Vector.<Vector.<Stat>>;', 'AS3 SkillData stores statList directly');
assertIncludes(as3PassiveSkillData, 'extends SkillData', 'AS3 PassiveSkillData is a distinct skill data type');
assertIncludes(as3ActiveSkillData, 'public var setList:Array;', 'AS3 ActiveSkillData stores setList directly');
assertIncludes(as3Skill, 'new PassiveSkill(SkillDataList.list[_loc4_] as PassiveSkillData)', 'AS3 Skill.load restores PassiveSkill from target data type');
assertIncludes(as3Skill, 'new ActiveSkill(SkillDataList.list[_loc4_] as ActiveSkillData)', 'AS3 Skill.load restores ActiveSkill from target data type');
assertIncludes(as3Player, 'public static function updateSkillInfo()', 'AS3 Player.updateSkillInfo consumes skill statList/effectList');

assert(!skillDataSource.includes('Array.from({ length: 15 }'), 'skillData.ts must mirror AS3 hard-coded per-level tables instead of regenerating them with Array.from');
assertIncludes(skillModelSource, 'new PassiveSkill(skillData)', 'Skill.load must restore PassiveSkill instances from passive skillData');
assertIncludes(skillModelSource, 'new ActiveSkill(skillData)', 'Skill.load must restore ActiveSkill instances from active skillData');

if (packageJson.scripts?.['assert:skill-data-values'] !== 'node scripts/assertSkillDataValuesParity.mjs') {
  throw new Error('package.json must expose assert:skill-data-values');
}

try {
  const skillDataModule = await importTsModule({
    entry: join(root, 'src/core/data/skillData.ts'),
    root,
    outRoot,
  });
  const skillModule = await importTsModule({
    entry: join(root, 'src/core/models/Skill.ts'),
    root,
    outRoot,
  });
  const { SkillDataList } = skillDataModule;
  const { Skill, ActiveSkill, PassiveSkill } = skillModule;
  const expectedSkills = parseAs3SkillDataList(as3SkillDataList);
  const expectedOrder = expectedSkills.map(skill => skill.name);

  assertEqual(SkillDataList.map(skill => skill.name), expectedOrder, 'SkillDataList order must match AS3');

  for (const expected of expectedSkills) {
    const skill = getSkill(SkillDataList, expected.name);
    assertEqual(skill.statList?.length, 15, `${skill.name}.statList must contain 15 AS3 levels`);
    assertEqual(skill.lvupCostList?.length, 15, `${skill.name}.lvupCostList must contain 15 AS3 levels`);
    if (skill.effectList) {
      assertEqual(skill.effectList.length, 15, `${skill.name}.effectList must contain 15 AS3 levels`);
    }
    if (skill.type !== 'passive') {
      assertEqual(skill.setList?.length, 15, `${skill.name}.setList must contain 15 AS3 levels`);
    }
    assertEqual(normalizeStats(skill.statList), expected.statList, `${skill.name}.statList must mirror every AS3 level`);
    assertEqual(normalizeStats(skill.effectList), expected.effectList, `${skill.name}.effectList must mirror every AS3 level`);
    assertEqual(skill.lvupCostList, expected.lvupCostList, `${skill.name}.lvupCostList must mirror every AS3 level`);
    assertEqual(skill.setList, expected.setList, `${skill.name}.setList must mirror every AS3 level`);
  }

  const combatMastery = getSkill(SkillDataList, 'COMBAT_MASTERY');
  assertStatList(combatMastery.statList[14], { hp: 150, str: 42, dex: 10 }, 'COMBAT_MASTERY L14 statList must mirror AS3');
  assertStatList(combatMastery.effectList[14], { attackMin: 8, attackMax: 18, balance: 15 }, 'COMBAT_MASTERY L14 effectList must mirror AS3');

  const rangeMastery = getSkill(SkillDataList, 'RANGE_MASTERY');
  assertStatList(rangeMastery.statList[14], { dex: 50, str: 6, will: 10 }, 'RANGE_MASTERY L14 statList must mirror AS3');
  assertStatList(rangeMastery.effectList[14], { attackMin: 10, attackMax: 25, balance: 15 }, 'RANGE_MASTERY L14 effectList must mirror AS3');

  const criticalHit = getSkill(SkillDataList, 'CRITICAL_HIT');
  assertStatList(criticalHit.statList[14], { will: 45, crit_mul: 150 }, 'CRITICAL_HIT L14 statList must mirror AS3');

  const blacksmithing = getSkill(SkillDataList, 'BLACKSMITHING');
  assertStatList(blacksmithing.statList[14], { dex: 21, intelligence: 21 }, 'BLACKSMITHING L14 statList must mirror AS3');

  const magicMastery = getSkill(SkillDataList, 'MAGIC_MASTERY');
  assertStatList(magicMastery.statList[10], { mp: 110, intelligence: 6 }, 'MAGIC_MASTERY L10 statList must mirror AS3');

  const smash = getSkill(SkillDataList, 'SMASH');
  assertEqual(smash.setList, [200, 210, 220, 230, 240, 250, 300, 310, 320, 330, 400, 420, 440, 460, 500], 'SMASH.setList must use AS3 flat numeric values');

  const loadedPassive = Skill.load('14#COMBAT_MASTERY');
  assert(loadedPassive instanceof PassiveSkill, 'Skill.load must restore COMBAT_MASTERY as PassiveSkill');
  assertEqual(loadedPassive.level, 14, 'Skill.load must restore passive skill level');

  const loadedActive = Skill.load('14#SMASH');
  assert(loadedActive instanceof ActiveSkill, 'Skill.load must restore SMASH as ActiveSkill');
  assertEqual(loadedActive.level, 14, 'Skill.load must restore active skill level');
} finally {
  await cleanupTranspileOutput(outRoot);
}

console.log('Skill data values parity checks passed.');

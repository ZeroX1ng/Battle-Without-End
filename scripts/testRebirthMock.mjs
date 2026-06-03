// ═══════════════════════════════════════════════
// 转生软重置人工诊断脚本
// 模拟一个"练级后"的玩家状态，执行转生后对比
// 正式 guard 仍是 npm run assert:rebirth-soft-reset-player-state；本脚本只用于人工阅读状态快照。
// ═══════════════════════════════════════════════

import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cleanupTranspileOutput, importTsModule } from './lib/transpileTsModule.mjs';

const root = resolve(import.meta.dirname, '..');
const outRoot = join(root, '.tmp-test-rebirth-mock');

function pad(str, len = 36) {
  return (str ?? '').toString().padEnd(len);
}

function fmt(val, suffix = '') {
  if (typeof val === 'boolean') return val ? '✅ 是' : '❌ 否';
  if (val === null) return '(空)';
  if (val === undefined) return '(未定义)';
  return `${val}${suffix}`;
}

function printSection(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(60)}`);
}

function printRow(label, value, suffix = '') {
  console.log(`  ${pad(label)} ${fmt(value, suffix)}`);
}

function printRows(rows) {
  for (const [label, value, suffix] of rows) {
    printRow(label, value, suffix);
  }
}

try {
  // ─── 导入模块 ───
  const playerModule = await importTsModule({
    root,
    outRoot: join(outRoot, 'player'),
    entry: join(root, 'src/core/models/Player.ts'),
  });
  const raceModule = await importTsModule({
    root,
    outRoot: join(outRoot, 'race'),
    entry: join(root, 'src/core/data/raceData.ts'),
  });

  const playerOutRoot = join(outRoot, 'player');
  const equipmentDataModule = await import(pathToFileURL(join(playerOutRoot, 'core/data/equipmentData.js')));
  const skillDataModule    = await import(pathToFileURL(join(playerOutRoot, 'core/data/skillData.js')));
  const weaponModule       = await import(pathToFileURL(join(playerOutRoot, 'core/models/Weapon.js')));
  const equipmentModule    = await import(pathToFileURL(join(playerOutRoot, 'core/models/Equipment.js')));
  const skillModule        = await import(pathToFileURL(join(playerOutRoot, 'core/models/Skill.js')));
  const petModule          = await import(pathToFileURL(join(playerOutRoot, 'core/models/Pet.js')));
  const petDataModule      = await import(pathToFileURL(join(playerOutRoot, 'core/data/petData.js')));
  const titleDataModule    = await import(pathToFileURL(join(playerOutRoot, 'core/data/titleData.js')));

  const { createInitialPlayerState, createNewPlayerState, playerBurn } = playerModule;
  const { list: RaceList } = raceModule;
  const { EquipmentList } = equipmentDataModule;
  const { SkillDataList } = skillDataModule;
  const { Weapon } = weaponModule;
  const { Equipment } = equipmentModule;
  const { Skill } = skillModule;
  const { Pet } = petModule;
  const { PetDataList } = petDataModule;
  const { createTitleListState } = titleDataModule;

  // ─── 辅助函数 ───
  function eqData(name) {
    const d = EquipmentList.find(e => e.name === name);
    if (!d) throw new Error(`Missing equipment: ${name}`);
    return d;
  }
  function skData(name) {
    const d = SkillDataList.find(s => s.name === name);
    if (!d) throw new Error(`Missing skill: ${name}`);
    return d;
  }
  function withLevel(equipment, level) {
    equipment.setLevel(level);
    return equipment;
  }

  // ─── 构造"练级后"的 Mock 玩家 ───
  const humanRace = RaceList[0];
  const elfRace   = RaceList[1] ?? RaceList[0];

  // 装备：等级 5 的剑 + 头盔 + 鞋子 + 衣服 + 戒指
  const swordLv5    = withLevel(new Weapon(eqData('sword'), 1), 5);
  const helmLv3     = withLevel(new Equipment(eqData('helm'), 1), 3);
  const bootsLv3    = withLevel(new Equipment(eqData('Boots'), 1), 3);
  const suitLv3     = withLevel(new Equipment(eqData('suit'), 1), 3);
  const ringLv2     = withLevel(new Equipment(eqData('ring'), 1), 2);
  const bagBreastplate = new Equipment(eqData('breastplate'), 1);
  const bagTome     = withLevel(new Weapon(eqData('tome'), 1), 2);

  // 技能：SMASH 练到 12 级，COUNTERATTACK 6 级，新增 LIFE_DRAIN 3 级
  const smashSkill  = new Skill(skData('SMASH'));
  smashSkill.level = 12;
  const counterSkill = new Skill(skData('COUNTERATTACK'));
  counterSkill.level = 6;
  const drainSkill   = new Skill(skData('LIFE_DRAIN'));
  drainSkill.level = 3;
  const combatSkill  = new Skill(skData('COMBAT_MASTERY'));
  combatSkill.level = 5;

  // 已装备技能
  const equipSkillList = [smashSkill, counterSkill];

  // 宠物
  const petWolf    = new Pet(PetDataList[0], 1);
  const petSlime   = new Pet(PetDataList[1], 1);

  // 称号：获得 the Breaker + the Combat Master
  const titleList = createTitleListState();
  const breakerTitle = titleList.find(t => t.name === 'the Breaker');
  const masterTitle  = titleList.find(t => t.name === 'the Combat Master');
  if (breakerTitle) {
    breakerTitle.max = 5000;
    breakerTitle.count = 1;
    breakerTitle.isGot = true;
  }
  if (masterTitle) {
    masterTitle.max = 5000;
    masterTitle.count = 1;
    masterTitle.isGot = true;
  }
  const selectedTitle = breakerTitle;

  const before = {
    ...createInitialPlayerState(),
    playerName: '测试勇者',
    age: 25,
    race: humanRace,
    lv: 68,
    basicStatus: humanRace.caculateStat(25),
    gold: 54321,
    xp: 123456,
    ap: 45,
    apCost: 22,
    storeLv: 4,
    BAGMAX: 60,
    PETMAX: 12,
    caculate: 1800,

    leftHand:  swordLv5,
    rightHand: null,
    head:      helmLv3,
    feet:      bootsLv3,
    body:      suitLv3,
    necklace:  null,
    ring:      ringLv2,

    itemList:      [bagBreastplate, bagTome],
    skillList:     [combatSkill, smashSkill, counterSkill, drainSkill],
    equipSkillList,
    pet:           petWolf,
    petList:       [petSlime],
    title:         selectedTitle,
    titleList,
  };

  // 补齐 skillStatus / equipStatus
  const beforeFull = (() => {
    const { updateAllInfo } = playerModule;
    return updateAllInfo(before);
  })();

  // ─── 打印转生前状态 ───
  console.log('\n🐣 ========== 转生前玩家状态 ==========');
  printRows([
    ['姓名',          beforeFull.playerName],
    ['种族',          `${humanRace.name}族`],
    ['年龄',          beforeFull.age, '岁'],
    ['等级',          beforeFull.lv],
    ['金币',          beforeFull.gold],
    ['经验',          beforeFull.xp],
    ['AP / AP消耗',   `${beforeFull.ap} / ${beforeFull.apCost}`],
    ['商店等级',      beforeFull.storeLv],
    ['背包容量',      beforeFull.BAGMAX],
    ['宠物容量',      beforeFull.PETMAX],
    ['caculate',      beforeFull.caculate],
    ['左手装备',      `${beforeFull.leftHand?.name ?? '(空)'} Lv.${beforeFull.leftHand?.level ?? 0}`],
    ['右手装备',      `${beforeFull.rightHand?.name ?? '(空)'}`],
    ['头部',          `${beforeFull.head?.name ?? '(空)'}`],
    ['脚部',          `${beforeFull.feet?.name ?? '(空)'}`],
    ['身体',          `${beforeFull.body?.name ?? '(空)'}`],
    ['戒指',          `${beforeFull.ring?.name ?? '(空)'}`],
    ['背包物品数',    beforeFull.itemList.length, '件'],
    ['技能列表',      beforeFull.skillList.map(s => `${s.skillData.name}(Lv${s.level})`).join(', ')],
    ['已装备技能',    beforeFull.equipSkillList.map(s => `${s.skillData.name}(Lv${s.level})`).join(', ')],
    ['出战宠物',      `${beforeFull.pet?.name ?? '(空)'}`],
    ['宠物列表',      beforeFull.petList.map(p => p.name).join(', ')],
    ['当前称号',      `${beforeFull.title?.name ?? '(空)'}`],
  ]);
  console.log(`  基础属性: HP=${beforeFull.basicStatus.hp} MP=${beforeFull.basicStatus.mp} STR=${beforeFull.basicStatus.str} DEX=${beforeFull.basicStatus.dex} INT=${beforeFull.basicStatus.intelligence} WIL=${beforeFull.basicStatus.will} LUK=${beforeFull.basicStatus.luck}`);

  // ─── 模拟转生（选 精灵族，10岁）───
  const after = playerBurn(beforeFull, 10, elfRace);

  // ─── 打印转生后状态 ───
  console.log('\n🦋 ========== 转生后玩家状态 ==========');
  printRows([
    ['姓名',          after.playerName],
    ['种族',          `${elfRace.name}族`],
    ['年龄',          after.age, '岁'],
    ['等级',          after.lv],
    ['金币',          after.gold],
    ['经验',          after.xp],
    ['AP / AP消耗',   `${after.ap} / ${after.apCost}`],
    ['商店等级',      after.storeLv],
    ['背包容量',      after.BAGMAX],
    ['宠物容量',      after.PETMAX],
    ['caculate',      after.caculate],
    ['左手装备',      `${after.leftHand?.name ?? '(空)'} Lv.${after.leftHand?.level ?? 0}`],
    ['右手装备',      `${after.rightHand?.name ?? '(空)'}`],
    ['头部',          `${after.head?.name ?? '(空)'}`],
    ['脚部',          `${after.feet?.name ?? '(空)'}`],
    ['身体',          `${after.body?.name ?? '(空)'}`],
    ['戒指',          `${after.ring?.name ?? '(空)'}`],
    ['背包物品数',    after.itemList.length, '件'],
    ['技能列表',      after.skillList.map(s => `${s.skillData.name}(Lv${s.level})`).join(', ')],
    ['已装备技能',    after.equipSkillList.map(s => `${s.skillData.name}(Lv${s.level})`).join(', ')],
    ['出战宠物',      `${after.pet?.name ?? '(空)'}`],
    ['宠物列表',      after.petList.map(p => p.name).join(', ')],
    ['当前称号',      `${after.title?.name ?? '(空)'}`],
  ]);
  console.log(`  基础属性: HP=${after.basicStatus.hp} MP=${after.basicStatus.mp} STR=${after.basicStatus.str} DEX=${after.basicStatus.dex} INT=${after.basicStatus.intelligence} WIL=${after.basicStatus.will} LUK=${after.basicStatus.luck}`);

  // ─── 差异对比 ───
  console.log('\n📊 ========== 差异对比 ==========');

  const checks = [
    // 应当重置的
    { label: '年龄 应为 10',         pass: after.age === 10,                    good: '✅ 已重置', bad: '❌ 未重置' },
    { label: '种族 应为 精灵族',     pass: after.race === elfRace,            good: '✅ 已重置', bad: '❌ 未重置' },
    { label: '等级 应为 1',           pass: after.lv === 1,                     good: '✅ 已重置', bad: '❌ 未重置' },
    { label: 'caculate 应为 0',       pass: after.caculate === 0,               good: '✅ 已重置', bad: '❌ 未重置' },
    { label: '基础属性 应重新计算',    pass: after.basicStatus.hp === elfRace.caculateStat(10).hp, good: '✅ 已重算', bad: '❌ 未重算' },

    // 应当保留的
    { label: '姓名 应保留',           pass: after.playerName === beforeFull.playerName,           good: '✅ 保留', bad: '❌ 丢失' },
    { label: '金币 应保留',           pass: after.gold === beforeFull.gold,                       good: '✅ 保留', bad: '❌ 丢失' },
    { label: '经验 应保留',           pass: after.xp === beforeFull.xp,                           good: '✅ 保留', bad: '❌ 丢失' },
    { label: 'AP 应保留',             pass: after.ap === beforeFull.ap,                           good: '✅ 保留', bad: '❌ 丢失' },
    { label: 'AP消耗 应保留',         pass: after.apCost === beforeFull.apCost,                   good: '✅ 保留', bad: '❌ 丢失' },
    { label: '商店等级 应保留',       pass: after.storeLv === beforeFull.storeLv,                 good: '✅ 保留', bad: '❌ 丢失' },
    { label: '背包容量 应保留',       pass: after.BAGMAX === beforeFull.BAGMAX,                   good: '✅ 保留', bad: '❌ 丢失' },
    { label: '宠物容量 应保留',       pass: after.PETMAX === beforeFull.PETMAX,                   good: '✅ 保留', bad: '❌ 丢失' },

    // 装备不丢失
    { label: '左手装备(剑Lv5) 应保留', pass: after.leftHand === swordLv5,                          good: '✅ 保留', bad: '❌ 丢失' },
    { label: '头盔 应保留',            pass: after.head === helmLv3,                               good: '✅ 保留', bad: '❌ 丢失' },
    { label: '鞋子 应保留',            pass: after.feet === bootsLv3,                              good: '✅ 保留', bad: '❌ 丢失' },
    { label: '衣服 应保留',            pass: after.body === suitLv3,                               good: '✅ 保留', bad: '❌ 丢失' },
    { label: '戒指 应保留',            pass: after.ring === ringLv2,                               good: '✅ 保留', bad: '❌ 丢失' },
    { label: '背包物品 应保留',        pass: after.itemList.includes(bagBreastplate) && after.itemList.includes(bagTome), good: '✅ 保留', bad: '❌ 丢失' },

    // 技能
    { label: 'SMASH 等级12 应保留',   pass: after.skillList.find(s => s.skillData.name === 'SMASH')?.level === 12,         good: '✅ 保留', bad: '❌ 丢失' },
    { label: 'COUNTERATTACK Lv6 应保留', pass: after.skillList.find(s => s.skillData.name === 'COUNTERATTACK')?.level === 6, good: '✅ 保留', bad: '❌ 丢失' },
    { label: 'LIFE_DRAIN Lv3 应保留', pass: after.skillList.find(s => s.skillData.name === 'LIFE_DRAIN')?.level === 3,     good: '✅ 保留', bad: '❌ 丢失' },
    { label: '缺少的初始技能应补',     pass: after.skillList.length >= beforeFull.skillList.length, good: '✅ 已补齐', bad: '❌ 未补齐' },

    // 已装备技能
    { label: '已装备技能 应保留',      pass: after.equipSkillList.includes(smashSkill) && after.equipSkillList.includes(counterSkill), good: '✅ 保留', bad: '❌ 丢失' },

    // 宠物
    { label: '出战宠物 应保留',        pass: after.pet === petWolf,                                good: '✅ 保留', bad: '❌ 丢失' },
    { label: '宠物列表 应保留',        pass: after.petList.includes(petSlime),                     good: '✅ 保留', bad: '❌ 丢失' },

    // 称号
    { label: 'the Breaker 应保留',    pass: after.titleList.find(t => t.name === 'the Breaker')?.isGot === true,      good: '✅ 保留', bad: '❌ 丢失' },
    { label: '当前称号 应保留',        pass: after.title?.name === 'the Breaker',                  good: '✅ 保留', bad: '❌ 丢失' },
    { label: '称号引用 应从新列表中',  pass: after.title === after.titleList.find(t => t.name === 'the Breaker'),      good: '✅ 正确', bad: '❌ 指向旧对象' },
  ];

  for (const check of checks) {
    console.log(`  ${pad(check.label, 42)} ${check.pass ? check.good : check.bad}`);
  }

  // ─── 额外验证：空白创建新建角色 ───
  const newChar = createNewPlayerState(10, humanRace, '新冒险者');
  console.log('\n🆕 ========== 新建角色验证（blank start）==========');
  printRows([
    ['姓名',          newChar.playerName],
    ['种族',          `${humanRace.name}族`],
    ['左手装备',      `${newChar.leftHand?.name ?? '(空)'} Lv.${newChar.leftHand?.level ?? 0}`],
    ['右手装备',      newChar.rightHand ? `${newChar.rightHand.name}` : '(空)'],
    ['技能数',        newChar.skillList.length, '个'],
    ['技能列表',      newChar.skillList.map(s => s.skillData.name).join(', ')],
  ]);

  // ─── 结论 ───
  const totalChecks = checks.length;
  const passed  = checks.filter(c => c.pass).length;
  const failed  = checks.filter(c => !c.pass).length;

  console.log(`\n${'═'.repeat(60)}`);
  if (failed === 0) {
    console.log(`  🎉 全部 ${totalChecks} 项检查通过！转生软重置逻辑正确。`);
  } else {
    console.log(`  ⚠️  ${passed}/${totalChecks} 通过，${failed} 项失败，请检查！`);
  }
  console.log(`${'═'.repeat(60)}\n`);

  if (failed > 0) {
    throw new Error(`Rebirth manual diagnostic failed ${failed}/${totalChecks} checks.`);
  }

} finally {
  await cleanupTranspileOutput(outRoot);
}

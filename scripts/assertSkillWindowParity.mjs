import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function read(relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
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

const skillWindow = read('src/components/windows/SkillWindow.tsx');
const skillModel = read('src/core/models/Skill.ts');
const gameContext = read('src/state/GameContext.tsx');

for (const tab of ["id: 'combat'", "id: 'magic'", "id: 'passive'"]) {
  assertIncludes(skillWindow, tab, `SkillWindow must render the original ${tab} tab`);
}

assertIncludes(skillWindow, 'SkillCategory.MAGIC', 'SkillWindow must split magic skills by SkillCategory.MAGIC');
assertIncludes(skillWindow, 'SkillType.PASSIVE', 'SkillWindow must split passive skills by SkillType.PASSIVE');
assertIncludes(skillWindow, 'SkillType.ATTACK', 'SkillWindow must treat attack skills as active/equippable');
assertIncludes(skillWindow, 'SkillType.DEFENCE', 'SkillWindow must treat defence skills as active/equippable');
assertIncludes(skillWindow, 'SKILL_PANEL_META', 'SkillWindow must preserve the original combat/magic/passive panel semantics');
assertNotIncludes(
  skillWindow,
  'title={tab.panelName}',
  'SkillWindow tab buttons must not expose AS3 internal panel class names as native tooltips'
);
assertNotIncludes(
  skillWindow,
  '{SKILL_PANEL_META[activeTab].as3Panel}',
  'SkillWindow must not render AS3 internal panel class names as player-visible text'
);
assertIncludes(skillWindow, 'isSkillInTab', 'SkillWindow must filter each panel through a dedicated AS3 parity predicate');
assertIncludes(skillWindow, 'getRankLabel', 'SkillWindow must display original Rank as 15 - level in hex');
assertIncludes(skillWindow, 'getNextApCost', 'SkillWindow must show next level AP cost');
assertIncludes(skillWindow, 'SKILL_CATEGORY_LABELS', 'SkillWindow must translate raw skill categories for players');
assertIncludes(skillWindow, 'getSkillCategoryLabel', 'SkillWindow skill rows must use localized category labels');
assertIncludes(skillWindow, '等级 {rank}', 'SkillWindow must render localized rank labels in the detail row');
assertIncludes(skillWindow, '技能点 {nextCost}', 'SkillWindow must render localized AP cost labels in the detail row');
assertNotIncludes(skillWindow, 'Rank {rank}', 'SkillWindow must not render the English Rank label in skill rows');
assertNotIncludes(skillWindow, '{skill.skillData.category}', 'SkillWindow must not render raw category keys in skill rows');
assertNotIncludes(skillWindow, 'AP {nextCost}', 'SkillWindow must not render the English AP cost label in skill rows');
assertIncludes(skillWindow, 'getSkillTabButtonStyle', 'SkillWindow tabs must use a dedicated dimensional button style');
assertIncludes(skillWindow, 'boxShadow', 'SkillWindow tab style must provide dimensional depth');
assertIncludes(skillWindow, "textShadow: active", 'SkillWindow active tab labels must gain depth with text shadow');
assertIncludes(skillWindow, 'canLevelup(state.player.ap)', 'SkillWindow must gate level-up by current AP');
assertIncludes(skillWindow, "dispatch({ type: 'SKILL_LEVELUP'", 'SkillWindow must dispatch SKILL_LEVELUP from each skill cell');
assertIncludes(skillWindow, 'useInfoWindow', 'SkillWindow must use the global description hover window');
assertIncludes(skillWindow, 'showItemInfo(getSkillDescription(skill))', 'SkillWindow must show skill descriptions on hover');
assertIncludes(skillWindow, "dispatch({ type: isEquipped ? 'SKILL_UNEQUIP' : 'SKILL_EQUIP'", 'Active skill cells must toggle equip state');
assertNotIncludes(skillWindow, "skillList.map((skill: any", 'SkillWindow must no longer be a flat learned-skill list');

assertIncludes(skillModel, 'getDescription()', 'Skill model must expose AS3 Skill.getDescription()');
assertIncludes(gameContext, 'state.player.ap < cost', 'SKILL_LEVELUP must refuse upgrades without enough AP');
assertIncludes(gameContext, 'ap: state.player.ap - cost', 'SKILL_LEVELUP must consume AP');
assertIncludes(gameContext, 'withBattlePlayer', 'SKILL_LEVELUP must keep active Battle playerState in sync');

console.log('SkillWindow parity checks passed.');

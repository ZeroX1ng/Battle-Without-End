// ═══ 宠物技能静态注册表 ═══
// AS3 原始: iData.iPet.iPetSkill.PetSkillList (18个宠物技能)

import type { PetSkillData } from '../types';
import {
  pet_behave_ice_spear, pet_behave_fireball, pet_behave_thunder,
  pet_des_counterattack, pet_des_injury_resile, pet_des_dodge, pet_des_taunt,
  pet_des_aggressive, pet_des_defensive, pet_des_protective,
  pet_des_strong, pet_des_wisdom, pet_des_wise, pet_des_slayer,
  pet_des_life_drain, pet_des_good_or_evil, pet_des_ice_spear,
  pet_des_fireball, pet_des_thunder, pet_des_doubleHit,
  pet_des_meditation, pet_des_heal,
} from './petSkillBehaviors';

// ═══ 防御技能 (4个) ═══

const counterattack: PetSkillData = {
  name: 'Counterattack',
  realName: '反击',
  category: 'defence',
  setList: [[30, 50], [30, 100]],
  desFunction: pet_des_counterattack,
};

const injury_resile: PetSkillData = {
  name: 'Injury Resile',
  realName: '反震',
  category: 'defence',
  setList: [[30, 25], [30, 50]],
  desFunction: pet_des_injury_resile,
};

const dodge: PetSkillData = {
  name: 'Dodge',
  realName: '闪避',
  category: 'defence',
  setList: [[15], [20]],
  desFunction: pet_des_dodge,
};

const taunt: PetSkillData = {
  name: 'Taunt',
  realName: '嘲讽',
  category: 'defence',
  setList: [[10], [20]],
  desFunction: pet_des_taunt,
};

// ═══ 被动技能 (12个) ═══

const aggressive: PetSkillData = {
  name: 'Aggressive',
  realName: '血性',
  category: 'passive',
  setList: [[5], [7.5]],
  desFunction: pet_des_aggressive,
};

const defensive: PetSkillData = {
  name: 'Defensive',
  realName: '硬化',
  category: 'passive',
  setList: [[5], [7.5]],
  desFunction: pet_des_defensive,
};

const protective: PetSkillData = {
  name: 'Protective',
  realName: '守护',
  category: 'passive',
  setList: [[2], [2.5]],
  desFunction: pet_des_protective,
};

const strong: PetSkillData = {
  name: 'Strong',
  realName: '强力',
  category: 'passive',
  setList: [[10], [15]],
  desFunction: pet_des_strong,
};

const wisdom: PetSkillData = {
  name: 'Wisdom',
  realName: '智慧',
  category: 'passive',
  setList: [[5], [7.5]],
  desFunction: pet_des_wisdom,
};

const wise: PetSkillData = {
  name: 'Wise',
  realName: '聪颖',
  category: 'passive',
  setList: [[1], [1.5]],
  desFunction: pet_des_wise,
};

const slayer: PetSkillData = {
  name: 'Slayer',
  realName: '必杀',
  category: 'passive',
  setList: [[10, 2], [20, 2]],
  desFunction: pet_des_slayer,
};

const life_drain: PetSkillData = {
  name: 'Life Drain',
  realName: '吸血',
  category: 'passive',
  setList: [[20], [30]],
  desFunction: pet_des_life_drain,
};

const good_or_evil: PetSkillData = {
  name: 'Good or Evil',
  realName: '善恶有报',
  category: 'passive',
  setList: [[50], [60]],
  desFunction: pet_des_good_or_evil,
};

const meditation: PetSkillData = {
  name: 'Meditation',
  realName: '冥思',
  category: 'passive',
  setList: [[0.15, 10], [0.25, 15]],
  desFunction: pet_des_meditation,
};

const heal: PetSkillData = {
  name: 'Heal',
  realName: '治愈',
  category: 'passive',
  setList: [[0.3, 10], [0.5, 15]],
  desFunction: pet_des_heal,
};

const double_hit: PetSkillData = {
  name: 'Double hit',
  realName: '连击',
  category: 'passive',
  setList: [[45], [55]],
  desFunction: pet_des_doubleHit,
};

// ═══ 攻击技能 (3个) ═══

const ice_spear: PetSkillData = {
  name: 'Ice Spear',
  realName: '冰刃',
  category: 'attack',
  setList: [[5, 1.5, 1, 25], [7, 2, 1, 35, 10, 2]],
  behaveFunction: pet_behave_ice_spear,
  desFunction: pet_des_ice_spear,
};

const fireball: PetSkillData = {
  name: 'Fireball',
  realName: '火球',
  category: 'attack',
  setList: [[7, 2, 30, 1], [10, 2.5, 40, 1.25]],
  behaveFunction: pet_behave_fireball,
  desFunction: pet_des_fireball,
};

const thunder: PetSkillData = {
  name: 'Thunder',
  realName: '雷击',
  category: 'attack',
  setList: [[10, 2.5, 0.025, 1, 35], [13, 3, 0.03, 1.25, 45]],
  behaveFunction: pet_behave_thunder,
  desFunction: pet_des_thunder,
};

// ═══ 全部技能列表 ═══

export const PetSkillDataList: PetSkillData[] = [
  counterattack,
  injury_resile,
  dodge,
  taunt,
  aggressive,
  defensive,
  strong,
  wisdom,
  wise,
  slayer,
  life_drain,
  good_or_evil,
  ice_spear,
  fireball,
  thunder,
  double_hit,
  meditation,
  heal,
];

export const PetSkillDataMap: Record<string, PetSkillData> = {};
for (const skill of PetSkillDataList) {
  PetSkillDataMap[skill.name] = skill;
}
PetSkillDataMap[protective.name] = protective;

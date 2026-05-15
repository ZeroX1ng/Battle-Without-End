// ═══ 宠物技能运行时实例 ═══
// AS3 原始: iData.iPet.iPetSkill.PetSkill

import type { PetSkillData, PetSkillInstance } from '../types';
import { PetSkillDataMap } from '../data/petSkillData';

export class PetSkill implements PetSkillInstance {
  public skillData: PetSkillData;
  public level: number;

  constructor(skillData: PetSkillData) {
    this.skillData = skillData;
    this.level = Math.random() < 0.5 ? 0 : 1;
  }

  static load(data: string): PetSkill {
    const parts = data.split('$');
    const skillData = PetSkillDataMap[parts[0]];
    const skill = new PetSkill(skillData);
    skill.level = Number(parts[1]);
    return skill;
  }

  getName(): string {
    if (this.level) {
      return 'Advanced ' + this.skillData.name;
    }
    return this.skillData.name;
  }

  getRealName(): string {
    if (this.level) {
      return '进阶' + this.skillData.realName;
    }
    return this.skillData.realName;
  }

  getDescription(): string {
    const name = this.getRealName();
    const detail = this.skillData.desFunction ? this.skillData.desFunction(this) : '';
    return `<p align='center'>${name}</p>${detail}`;
  }

  getSetArray(): number[] {
    if (this.level) {
      return this.skillData.setList[1];
    }
    return this.skillData.setList[0];
  }

  save(): string {
    return this.skillData.name + '$' + this.level;
  }
}

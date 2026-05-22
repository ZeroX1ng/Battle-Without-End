// Skill entity.
// AS3 original: iData.iSkill.Skill.as + ActiveSkill + PassiveSkill.

import type { SkillData } from '../types';
import { SkillType } from '../constants';
import { SkillDataList } from '../data/skillData';

export class Skill {
  public level: number;
  public skillData: SkillData;

  constructor(skillData: SkillData) {
    this.skillData = skillData;
    this.level = 0;
  }

  static load(data: string): Skill {
    const parts = data.split('#');
    let skill: Skill | null = null;
    for (const skillData of SkillDataList) {
      if (skillData.name === parts[1]) {
        skill = skillData.type === SkillType.PASSIVE
          ? new PassiveSkill(skillData)
          : new ActiveSkill(skillData);
        break;
      }
    }
    if (!skill) {
      skill = new PassiveSkill(SkillDataList[0]);
    }
    skill.level = Number(parts[0]);
    return skill;
  }

  canLevelup(ap: number): boolean {
    if (this.level >= 14) return false;
    return this.skillData.lvupCostList[this.level + 1] <= ap;
  }

  getDescription(): string {
    if (this.skillData.desFunction) {
      return this.skillData.desFunction(this);
    }
    return 'no function';
  }

  levelup(): void {
    this.level++;
  }

  save(): string {
    return `${this.level}#${this.skillData.name}`;
  }
}

export class ActiveSkill extends Skill {
  constructor(data: SkillData) {
    super(data);
  }
}

export class PassiveSkill extends Skill {
  constructor(data: SkillData) {
    super(data);
  }
}

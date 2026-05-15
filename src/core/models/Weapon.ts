// ═══ 武器实体类 ═══
// AS3 原始: iData.iItem.Weapon.as
//
// 继承 Equipment，添加武器类别和手持类型。

import { Equipment } from './Equipment';
import type { WeaponData } from '../types';
import { WeaponCategory, WeaponHand } from '../constants';

export class Weapon extends Equipment {
  static readonly ONEHAND = WeaponHand.ONEHAND;
  static readonly OFFHAND = WeaponHand.OFFHAND;
  static readonly TWOHAND = WeaponHand.TWOHAND;

  public category: string;

  constructor(data: WeaponData, ratio: number, isBoss: boolean = false, combatPower: number = 0) {
    super(data, ratio, isBoss, combatPower);
    this.category = data.category;
  }

  getCategory(): string {
    switch (this.category) {
      case WeaponCategory.RANGED: return '远程';
      case WeaponCategory.MELEE: return '近战';
      default: return this.category;
    }
  }
}

// ═══ 种族实体类 ═══
// AS3 原始: iData.Race.as
//
// 管理种族的初始属性与年龄成长计算。

import { BasicStatus } from './BasicStatus';

export class Race {
  public name: string;
  public initial: BasicStatus;
  public ageupList: BasicStatus[];

  constructor(name: string, initial: BasicStatus, ageupList: BasicStatus[]) {
    this.name = name;
    this.initial = initial;
    this.ageupList = ageupList;
  }

  /**
   * 根据年龄计算种族基础属性
   * AS3 原始: Race.caculateStat(param1:int): BasicStatus
   *
   * 在原游戏中，角色创建时调用此函数计算基础属性。
   * 计算逻辑：
   * 1. 从种族初始属性(initial)克隆一份
   * 2. 从 10 岁开始，逐年累加 ageupList 中的成长属性
   * 3. 每个年龄节点的成长：hp += ageup[i].hp + 1, mp += ageup[i].mp + 1（hp/mp 额外 +1 保底）
   * 4. str/dex/will/intelligence/luck 直接累加 ageup 中的值
   * 5. 如果 age > 25，超过部分每岁 hp/mp +1（无其他属性增长）
   *
   * @param age - 角色年龄（通常 10-25）
   * @returns 计算后的基础属性
   */
  caculateStat(age: number): BasicStatus {
    // 克隆初始属性
    const _loc2_: BasicStatus = this.initial.clone();
    // 记录超出 25 岁的年龄差（用于 25 岁后的 hp/mp 补偿）
    let _loc3_: number = age - 25;
    // age 上限截断为 25（年龄成长列表最多到 25 岁）
    if (age > 25) {
      age = 25;
    }
    // 从 10 岁开始，逐年累加成长属性
    let _loc4_: number = 10;
    while (_loc4_ < age) {
      _loc2_.hp += this.ageupList[_loc4_ - 10].hp + 1;
      _loc2_.mp += this.ageupList[_loc4_ - 10].mp + 1;
      _loc2_.str += this.ageupList[_loc4_ - 10].str;
      _loc2_.dex += this.ageupList[_loc4_ - 10].dex;
      _loc2_.will += this.ageupList[_loc4_ - 10].will;
      _loc2_.intelligence += this.ageupList[_loc4_ - 10].intelligence;
      _loc2_.luck += this.ageupList[_loc4_ - 10].luck;
      _loc4_++;
    }
    // 精确 25 岁时，补回之前截断的超出年龄差对应的 hp/mp
    if (age == 25) {
      _loc2_.hp += _loc3_;
      _loc2_.mp += _loc3_;
    }
    return _loc2_;
  }
}

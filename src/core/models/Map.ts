// ═══ 地图实体类 ═══
// AS3 原始: iData.iMap.Map.as

import type { MapData } from '../types';
import { Monster, Boss } from './Monster';

export class Map {
  public mapData: MapData;
  public averageCp: number;

  constructor(mapData: MapData) {
    this.mapData = mapData;
    this.averageCp = 0;
    this.setAverageCp();
  }

  /**
   * 计算地图平均战力
   * AS3 原始: Map.setAverageCp()
   */
  setAverageCp(): void {
    let _loc1_: number = 0;
    const _loc2_: number = this.mapData.monsterList.length;
    let _loc3_: number = 0;
    while (_loc3_ < _loc2_) {
      _loc1_ += this.mapData.monsterList[_loc3_].CP;
      _loc3_++;
    }
    this.averageCp = Math.trunc(_loc1_ / _loc2_);
  }

  /**
   * 随机生成一个 Boss
   * AS3 原始: Map.getBoss(): Boss
   */
  getBoss(): Boss {
    const idx = Math.floor(Math.random() * this.mapData.monsterList.length);
    return new Boss(this.mapData.monsterList[idx]);
  }
}

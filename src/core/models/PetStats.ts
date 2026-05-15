// ═══ 宠物属性容器 ═══
// AS3 原始: iData.iPet.PetStats.as
//
// 宠物10项属性存储，每个属性通过 getter/setter 使用
// encryptNum/decryptNum 进行简单混淆加密存储。

import type { PetStatsData } from '../types';
import { encryptNum, decryptNum } from '../math/MyMath';

const STAT_NAMES: (keyof PetStatsData)[] = [
  'hp', 'mp', 'attmin', 'attmax', 'def', 'pro', 'balance', 'cri', 'criMul', 'magAtt'
];

export class PetStats implements PetStatsData {
  private _hp: number;
  private _mp: number;
  private _attmin: number;
  private _attmax: number;
  private _def: number;
  private _pro: number;
  private _balance: number;
  private _cri: number;
  private _criMul: number;
  private _magAtt: number;

  constructor(
    hp: number, mp: number, attmin: number, attmax: number,
    def: number, pro: number, balance: number,
    cri: number, criMul: number, magAtt: number
  ) {
    this._hp = encryptNum(hp);
    this._mp = encryptNum(mp);
    this._attmin = encryptNum(attmin);
    this._attmax = encryptNum(attmax);
    this._def = encryptNum(def);
    this._pro = encryptNum(pro);
    this._balance = encryptNum(balance);
    this._cri = encryptNum(cri);
    this._criMul = encryptNum(criMul);
    this._magAtt = encryptNum(magAtt);
  }

  get hp(): number { return decryptNum(this._hp); }
  set hp(v: number) { this._hp = encryptNum(v); }

  get mp(): number { return decryptNum(this._mp); }
  set mp(v: number) { this._mp = encryptNum(v); }

  get attmin(): number { return decryptNum(this._attmin); }
  set attmin(v: number) { this._attmin = encryptNum(v); }

  get attmax(): number { return decryptNum(this._attmax); }
  set attmax(v: number) { this._attmax = encryptNum(v); }

  get def(): number { return decryptNum(this._def); }
  set def(v: number) { this._def = encryptNum(v); }

  get pro(): number { return decryptNum(this._pro); }
  set pro(v: number) { this._pro = encryptNum(v); }

  get balance(): number { return decryptNum(this._balance); }
  set balance(v: number) { this._balance = encryptNum(v); }

  get cri(): number { return decryptNum(this._cri); }
  set cri(v: number) { this._cri = encryptNum(v); }

  get criMul(): number { return decryptNum(this._criMul); }
  set criMul(v: number) { this._criMul = encryptNum(v); }

  get magAtt(): number { return decryptNum(this._magAtt); }
  set magAtt(v: number) { this._magAtt = encryptNum(v); }

  /**
   * 根据最小值/范围/倍率生成随机宠物属性
   * AS3 原始: PetStats.generatePetStats(startMin, startRange, ratio): PetStats
   *
   * 公式: startMin[i] + startRange[i] * ratio * Math.random()
   * ratio 通常为 1，用于品质修正
   *
   * @param startMin - 属性最小值
   * @param startRange - 属性随机范围
   * @param ratio - 倍率修正
   * @returns 生成的宠物属性对象
   */
  static generatePetStats(startMin: PetStatsData, startRange: PetStatsData, ratio: number): PetStatsData {
    return {
      hp: startMin.hp + startRange.hp * ratio * Math.random(),
      mp: startMin.mp + startRange.mp * ratio * Math.random(),
      attmin: startMin.attmin + startRange.attmin * ratio * Math.random(),
      attmax: startMin.attmax + startRange.attmax * ratio * Math.random(),
      def: startMin.def + startRange.def * ratio * Math.random(),
      pro: startMin.pro + startRange.pro * ratio * Math.random(),
      balance: startMin.balance + startRange.balance * ratio * Math.random(),
      cri: startMin.cri + startRange.cri * ratio * Math.random(),
      criMul: startMin.criMul + startRange.criMul * ratio * Math.random(),
      magAtt: startMin.magAtt + startRange.magAtt * ratio * Math.random(),
    };
  }

  /**
   * 从存档字符串加载 PetStats
   * AS3 原始: PetStats.load(param1:String): PetStats
   * 格式: "hp%mp%attmin%attmax%def%pro%balance%cri%criMul%magAtt"
   */
  static load(data: string): PetStats {
    const parts = data.split('%');
    return new PetStats(
      Number(parts[0]), Number(parts[1]), Number(parts[2]), Number(parts[3]),
      Number(parts[4]), Number(parts[5]), Number(parts[6]), Number(parts[7]),
      Number(parts[8]), Number(parts[9])
    );
  }

  /**
   * 序列化为存档字符串
   * AS3 原始: PetStats.save(): String
   * 格式: "hp%mp%attmin%attmax%def%pro%balance%cri%criMul%magAtt"
   */
  save(): string {
    return [
      this.hp, this.mp, this.attmin, this.attmax,
      this.def, this.pro, this.balance, this.cri,
      this.criMul, this.magAtt
    ].join('%');
  }
}

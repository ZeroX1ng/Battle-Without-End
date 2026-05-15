// ═══ 核心数学工具函数 ═══
// AS3 原始: tool.MyMath.as
// 
// 包含游戏最核心的随机数分布函数 balanceRandom，
// 以及简单加密混淆函数、字符串工具函数等。

/**
 * 平衡随机数函数 - 用于计算攻击伤害波动
 *
 * 在原版 Flash RPG 中，该函数确定每次攻击在最小/最大攻击力之间的落点。
 * 使用幂函数分布(power law)，通过 balance 参数控制分布的偏斜程度。
 * balance 越高 → 曲线越陡 → 结果越偏向高值端（伤害越高）。
 * balance < 50 时自动取互补值，使分布倾向低值端。
 * 
 * 实现原理：
 * 1. 将 balance 归一化到 [0,100]，< 50 取互补值
 * 2. 用 λ = (3*b - 100)/(100 - b) 计算幂指数
 * 3. 在 100 个采样点上构建幂函数 PDF 和 CDF
 * 4. 用随机数在 CDF 上查表得到 0~1 的加权系数
 *
 * @param param1 - 平衡值(0-100)，原始属性中的 balance 字段
 * @returns 0-1 之间的随机系数，乘以 (attMax - attMin) 后加到 attMin 上得到实际攻击值
 */
export function balanceRandom(param1: number): number {
  let _loc9_: number = 0;
  let _loc11_: number = NaN;
  // 参数预处理：balance < 50 时取 100-b，使概率分布反转（倾向低值端）
  let _loc2_: number = param1;
  if (param1 < 50) {
    _loc2_ = 100 - param1;
  }
  // 计算幂分布曲率参数 λ = (3*b - 100) / (100 - b)
  // 当 b→100 时 λ→∞，曲线极陡；当 b→50 时 λ→1，接近均匀分布
  const _loc3_: number = (3 * _loc2_ - 100) / (100 - _loc2_);
  // 构建 100 个采样点的幂函数概率密度函数(PDF)和累积分布函数(CDF)
  const _loc4_: number[] = new Array(100);
  const _loc5_: number[] = new Array(100);
  const _loc6_: number = 100;
  const _loc7_: number = 1;
  const _loc8_: number = _loc7_ / _loc6_;
  _loc9_ = 0;
  while (_loc9_ < _loc6_) {
    _loc11_ = _loc8_ * _loc9_;
    // PDF: f(x) = (1-x) * x^λ — 幂函数形式的概率密度
    _loc4_[_loc9_] = (1 - _loc11_) * Math.pow(_loc11_, _loc3_);
    if (_loc9_ == 0) {
      _loc5_[_loc9_] = _loc4_[_loc9_];
    } else {
      // CDF: 累积求和
      _loc5_[_loc9_] = _loc5_[_loc9_ - 1] + _loc4_[_loc9_];
    }
    _loc9_++;
  }
  // 在CDF上插值查找，得到最终加权系数
  const _loc10_: number = Math.random() * _loc5_[_loc6_ - 1];
  _loc9_ = 0;
  while (_loc9_ < _loc6_) {
    if (_loc10_ < _loc5_[_loc9_]) {
      if (param1 < 50) {
        // balance < 50 时反转结果（倾向低值）
        return 1 - _loc8_ * _loc9_;
      }
      return _loc8_ * _loc9_;
    }
    _loc9_++;
  }
  return 1;
}

/**
 * 绘制扇形 - Flash Graphics API → Canvas 2D API
 * 
 * 在原游戏中用于绘制圆形进度条（如血条、经验条背景）。
 * 用 Canvas 2D 替代 Flash Graphics。
 *
 * @param ctx - Canvas 2D 渲染上下文
 * @param param2 - 圆心 X 坐标，默认 200
 * @param param3 - 圆心 Y 坐标，默认 200
 * @param param4 - 半径，默认 100
 * @param param5 - 扇形角度（度），默认 27
 * @param param6 - 起始角度（度），默认 270
 * @param param7 - 填充颜色（CSS色值），默认 '#ff0000'
 */
export function DrawSector(
  ctx: CanvasRenderingContext2D,
  param2: number = 200,
  param3: number = 200,
  param4: number = 100,
  param5: number = 27,
  param6: number = 270,
  param7: string = '#ff0000'
): void {
  ctx.beginPath();
  ctx.fillStyle = param7;
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 0;
  // 限制最大角度为 360
  param5 = Math.abs(param5) > 360 ? 360 : param5;
  const _loc8_: number = Math.ceil(Math.abs(param5) / 45);
  let _loc9_: number = param5 / _loc8_;
  _loc9_ = _loc9_ * Math.PI / 180;
  param6 = param6 * Math.PI / 180;
  // 移动到圆心
  ctx.moveTo(param2, param3);
  // 绘制弧线
  ctx.arc(param2, param3, param4, param6, param6 + (_loc9_ * _loc8_), param5 > 0);
  // 如果 < 360 度则闭合回圆心
  if (param5 != 360) {
    ctx.lineTo(param2, param3);
  }
  ctx.fill();
  ctx.stroke();
}

/**
 * 首字母大写 - 字符串工具函数
 *
 * @param param1 - 输入字符串
 * @returns 首字母大写后的字符串
 */
export function FirstLetterToUpper(param1: string): string {
  const _loc2_: string[] = param1.split('');
  _loc2_[0] = _loc2_[0].toUpperCase();
  return _loc2_.join('');
}

/**
 * 字符串替换 - 将字符串中的 param2 全部替换为 param3
 *
 * @param param1 - 原始字符串
 * @param param2 - 要替换的子串
 * @param param3 - 替换为的子串
 * @returns 替换后的字符串
 */
export function StringFormChange(param1: string, param2: string, param3: string): string {
  const _loc4_: string[] = param1.split(param2);
  return _loc4_.join(param3);
}

/**
 * 将字符串转换为十六进制表示 - 调试工具
 * 原始 AS3 使用 ByteArray.writeMultiByte
 * 这里用 TextEncoder 替代实现同等功能
 *
 * @param param1 - 输入字符串
 * @returns 十六进制表示的字符串（空格分隔）
 */
export function cast(param1: string): string {
  const encoder = new TextEncoder();
  const _loc2_: Uint8Array = encoder.encode(param1 + '@');
  let _loc3_: string = '';
  let _loc4_: number = 0;
  while (_loc4_ < _loc2_.length) {
    _loc3_ += _loc2_[_loc4_].toString(16) + ' ';
    _loc4_++;
  }
  return _loc3_;
}

/**
 * 简单混淆加密 - 对 number 类型
 * 公式：param1 / 2 + 1
 *
 * @param param1 - 原始数值
 * @returns 加密后的数值
 */
export function encryptNum(param1: number): number {
  return param1 / 2 + 1;
}

/**
 * 简单混淆解密 - 对 number 类型
 * 公式：(param1 - 1) * 2
 *
 * @param param1 - 加密数值
 * @returns 解密后的原始数值
 */
export function decryptNum(param1: number): number {
  return (param1 - 1) * 2;
}

/**
 * 简单混淆加密 - 对 int 类型
 * 公式：param1 + 5
 * 在原游戏中用于存档数据混淆（如 pet.level 存储）
 *
 * @param param1 - 原始整数值
 * @returns 加密后的整数值
 */
export function encryptInt(param1: number): number {
  return param1 + 5;
}

/**
 * 简单混淆解密 - 对 int 类型
 * 公式：param1 - 5
 * 在原游戏中用于从存档恢复数据（如 pet.level 读取）
 *
 * @param param1 - 加密整数值
 * @returns 解密后的原始整数值
 */
export function decryptInt(param1: number): number {
  return param1 - 5;
}

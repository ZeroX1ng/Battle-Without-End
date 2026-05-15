// ═══ Kongregate 平台集成 ═══
// AS3 原始: iGlobal.Global.kongregate
//
// Kongregate 是 Flash 时代的游戏平台，提供统计排行等 API。
// 原始 AS3 通过 ExternalInterface 与 Kongregate JS API 交互：
//   Global.kongregate.stats.submit("Forge", level)
//   Global.kongregate.stats.submit("Money", gold)
//   Global.kongregate.stats.submit("CP", combatPower)
//
// 由于 Flash 已被淘汰，Kongregate 平台也在转型，此处提供
// 可扩展的占位实现：
//   - 如果检测到 Kongregate JS SDK，自动初始化
//   - 否则静默忽略所有 submit 调用
//   - 保留与 AS3 一致的 API 接口

interface KongregateStats {
  submit(name: string, value: number): void
}

interface KongregateAPI {
  stats: KongregateStats
}

let _kongregate: KongregateAPI | null = null

const NOOP_STATS: KongregateStats = {
  submit(_name: string, _value: number) {
    // Kongregate 平台不可用时静默忽略
  },
}

const NOOP_API: KongregateAPI = {
  stats: NOOP_STATS,
}

/**
 * 初始化 Kongregate 集成
 * AS3 原始: 通过 ExternalInterface 在 SWF 加载时自动完成
 *
 * 在 React 应用中，应在应用启动时调用 initKongregate()
 */
export function initKongregate(): void {
  try {
    // 检查 Kongregate JS SDK 是否已加载（通过 script 标签注入）
    const kg = (window as any).kongregateAPI || (window as any).kongregate
    if (kg && typeof kg.services !== 'undefined') {
      kg.services.connect()
      // 等待 SDK 就绪后建立接口
      kg.addEventListener('ready', () => {
        _kongregate = {
          stats: {
            submit(name: string, value: number) {
              try {
                kg.stats.submit(name, value)
              } catch {
                // 静默忽略
              }
            },
          },
        }
      })
    }
  } catch {
    // Kongregate SDK 不可用
  }
}

/**
 * 获取 Kongregate API 对象
 * AS3 原始: Global.kongregate
 *
 * 始终返回有效对象（不可用时返回空实现），调用方可安全使用 .stats.submit()
 */
export function getKongregate(): KongregateAPI {
  return _kongregate || NOOP_API
}

/**
 * 提交统计数据到 Kongregate 平台
 * AS3 原始: Global.kongregate.stats.submit(name, value)
 *
 * @param name 统计项名称 (如 "Forge", "Money", "CP", "STR")
 * @param value 统计值
 */
export function submitStat(name: string, value: number): void {
  getKongregate().stats.submit(name, value)
}

/**
 * 批量提交玩家统计数据
 * AS3 原始: Player.updateAllInfo 中批量 submit
 */
export function submitPlayerStats(stats: Record<string, number>): void {
  const kg = getKongregate()
  for (const [name, value] of Object.entries(stats)) {
    kg.stats.submit(name, value)
  }
}

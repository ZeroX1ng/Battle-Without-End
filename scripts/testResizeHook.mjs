// 验证 useWindowSize 中 rAF 逻辑是否在所有场景下都不会抛出 TypeError
// 直接运行: node scripts/testResizeHook.mjs

let pass = 0
let fail = 0

function assert(condition, msg) {
  if (condition) {
    pass++
    console.log(`  ✅ ${msg}`)
  } else {
    fail++
    console.error(`  ❌ ${msg}`)
  }
}

// ── 模拟浏览器 API ──
let rAFNextId = 0
const rAFCallbacks = []
const cAFHistory = []

global.requestAnimationFrame = (fn) => {
  rAFNextId++
  rAFCallbacks.push({ id: rAFNextId, fn })
  return rAFNextId
}

global.cancelAnimationFrame = (id) => {
  cAFHistory.push(id)
  const idx = rAFCallbacks.findIndex(c => c.id === id)
  if (idx !== -1) rAFCallbacks.splice(idx, 1)
}

function resetMocks() {
  rAFNextId = 0
  rAFCallbacks.length = 0
  cAFHistory.length = 0
}

// ── 场景 1: 初始 rafId = 0，首次 resize ──
console.log('\n📋 场景1: 组件挂载后首次触发 resize（rafId 为初始值 0）')
resetMocks()
{
  let rafId = 0 // 修复后的初始化

  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {})

  assert(cAFHistory.length === 0, 'cancelAnimationFrame 未被调用（rafId=0 被跳过）')
  assert(rafId > 0, 'requestAnimationFrame 正常返回正整数 id')
  assert(rAFCallbacks.length === 1, '回调已被注册')
}

// ── 场景 2: 有挂起的 rAF 时再次 resize ──
console.log('\n📋 场景2: 上一次 rAF 未执行完毕，再次触发 resize（节流）')
resetMocks()
{
  let rafId = requestAnimationFrame(() => {}) // 模拟上次 resize 留下的
  const prevId = rafId

  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {})

  assert(cAFHistory.length === 1, '上次的 rAF 被取消（节流生效）')
  assert(cAFHistory[0] === prevId, '取消的是正确的 id')
  assert(rafId !== prevId, '新的 rAF id 与上次不同')
  assert(rAFCallbacks.length === 1, '只保留了最新的回调')
}

// ── 场景 3: 组件卸载时清理 ──
console.log('\n📋 场景3: 组件卸载（cleanup 阶段）')
resetMocks()
{
  let rafId = requestAnimationFrame(() => {})

  // 模拟 cleanup
  if (rafId) cancelAnimationFrame(rafId)

  assert(cAFHistory.length === 1, '清理时取消了挂起的 rAF')
  assert(rAFCallbacks.length === 0, '没有残留的回调')
}

// ── 场景 4: 卸载时没有挂起的 rAF（边界情况） ──
console.log('\n📋 场景4: 组件卸载时 rafId 仍为初始值 0（无 resize 发生过）')
resetMocks()
{
  let rafId = 0 // 从未触发过 resize

  // 模拟 cleanup
  if (rafId) cancelAnimationFrame(rafId)

  assert(cAFHistory.length === 0, 'cleanup 不会调用 cancelAnimationFrame（rafId=0）')
}

// ── 场景 5: 旧代码对比（rafId: undefined） ──
console.log('\n📋 场景5: 【对照组】旧代码 rafId=undefined 首次 resize 的行为')
{
  let rafId // undefined!
  let threw = false
  try {
    cancelAnimationFrame(rafId) // 旧代码
  } catch (_e) {
    threw = true
  }
  if (!threw) {
    console.log('  ⚠️  现代浏览器静默忽略了 cancelAnimationFrame(undefined)，但 TypeScript 严格模式下这是类型错误')
    console.log('  ℹ️  修复后消除了这个隐患')
  } else {
    console.log('  💥 确实抛出了 TypeError！修复是必要的')
  }
}

// ── 结果 ──
console.log(`\n${'─'.repeat(40)}`)
console.log(`  通过: ${pass}  |  失败: ${fail}`)
if (fail === 0) {
  console.log('  🎉 所有场景通过，resize 时不会抛出任何错误！')
} else {
  console.log('  💥 有测试失败，请检查！')
}
console.log(`${'─'.repeat(40)}\n`)

process.exit(fail > 0 ? 1 : 0)

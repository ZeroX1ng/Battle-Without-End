// ═══ 战利品统计面板 ═══
// AS3 原始: iPanel.iScene.iPanel.LootPanel.as
// 追踪当前地图 8 项掉落统计：金币/经验/6品质装备

import { useGameContext } from '../../state/GameContext'
import { QualityColor } from '../../core/constants'

const QUALITY_LABELS = [
  { key: 'basic' as const, label: '普通' },
  { key: 'magic' as const, label: '精品' },
  { key: 'rare' as const, label: '稀有' },
  { key: 'perfect' as const, label: '完美' },
  { key: 'epic' as const, label: '史诗' },
  { key: 'legendary' as const, label: '传说' },
]

export function LootPanel() {
  const { state } = useGameContext()
  const l = state.loot

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '10px 14px', width: 180, fontSize: 12,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 'bold', color: 'var(--color-text-bright)',
        marginBottom: 8, textAlign: 'center',
      }}>
        当前地图统计
      </div>

      <StatLine label="金币" value={l.money} color="#FFA640" />
      <StatLine label="经验" value={l.exp} color="#4a60d7" />

      <div style={{
        margin: '6px 0', borderTop: '1px solid var(--color-border)',
      }} />

      {QUALITY_LABELS.map(({ key, label }, i) => (
        <StatLine
          key={key}
          label={`${label}装备`}
          value={l[key]}
          color={QualityColor[i] || 'var(--color-text)'}
        />
      ))}
    </div>
  )
}

function StatLine({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '2px 0', fontSize: 11,
    }}>
      <span style={{ color: 'var(--color-text-dim)' }}>{label}</span>
      <span style={{ color: color || 'var(--color-text)', fontWeight: 'bold' }}>
        {value}
      </span>
    </div>
  )
}

// ═══ 战利品统计面板 ═══
// AS3 原始: iPanel.iScene.iPanel.LootPanel.as
// 追踪当前地图 8 项掉落统计：金币/经验/6品质装备

import { useGameContext } from '../../state/GameContext'
import { QualityColor } from '../../core/constants'

const LOOT_PANEL_WIDTH = 170
const LOOT_PANEL_MIN_HEIGHT = 220
const LOOT_PANEL_ROW_FONT_SIZE = 16

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
    <div data-bwe-loot-panel style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 12px', width: LOOT_PANEL_WIDTH, minHeight: LOOT_PANEL_MIN_HEIGHT, height: '100%',
      fontSize: LOOT_PANEL_ROW_FONT_SIZE, boxSizing: 'border-box',
    }}>
      <div style={{
        fontSize: 18, fontWeight: 'bold', color: 'var(--color-text-bright)',
        marginBottom: 7, textAlign: 'center',
      }}>
        当前地图统计
      </div>

      <StatLine label="金币" value={l.money} color="#FFA640" />
      <StatLine label="经验" value={l.exp} color="#4a60d7" />

      <div style={{
        margin: '5px 0', borderTop: '1px solid var(--color-border)',
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
    <div data-bwe-loot-stat-line style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1px 0', fontSize: LOOT_PANEL_ROW_FONT_SIZE, lineHeight: '20px',
    }}>
      <span style={{ color: 'var(--color-text-dim)' }}>{label}</span>
      <span data-bwe-loot-stat-value={label} style={{ color: color || 'var(--color-text)', fontWeight: 'bold' }}>
        {value}
      </span>
    </div>
  )
}

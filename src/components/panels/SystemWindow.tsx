// ═══ 系统设置窗口 ═══
// AS3 原始: iPanel.iScene.iPanel.iWindow.SystemWindow.as + iSystem.ToggleBox.as
//
// 整合日志显示过滤、道具拾取品质过滤、装备部位过滤、
// 自动出售开关、音效开关等功能。

import { useGameContext } from '../../state/GameContext'
import { QualityColor, QualityName } from '../../core/constants'
import type { GlobalConfig } from '../../core/types'

type ToggleKey = keyof GlobalConfig & string

interface ToggleGroup {
  title: string
  items: { label: string; key: ToggleKey; color?: string }[]
}

function SystemWindow() {
  const { state, dispatch } = useGameContext()
  const config = state.config

  const toggle = (key: ToggleKey) => {
    dispatch({ type: 'CONFIG_TOGGLE', key })
  }

  const groups: ToggleGroup[] = [
    {
      title: '日志显示',
      items: [
        { label: '战况', key: 'battle_toggle' },
        { label: '战果', key: 'battleIntro_toggle' },
        { label: '$', key: 'money_toggle' },
        { label: 'Exp', key: 'exp_toggle' },
        { label: '道具', key: 'item_toggle' },
      ],
    },
    {
      title: '道具品质',
      items: [
        { label: QualityName[0] ?? '基础', key: 'item0_toggle', color: QualityColor[0] },
        { label: QualityName[1] ?? '精品', key: 'item1_toggle', color: QualityColor[1] },
        { label: QualityName[2] ?? '稀有', key: 'item2_toggle', color: QualityColor[2] },
        { label: QualityName[3] ?? '完美', key: 'item3_toggle', color: QualityColor[3] },
        { label: QualityName[4] ?? '史诗', key: 'item4_toggle', color: QualityColor[4] },
        { label: QualityName[5] ?? '传奇', key: 'item5_toggle', color: QualityColor[5] },
      ],
    },
    {
      title: '武器',
      items: [
        { label: '剑', key: 'sword_toggle' },
        { label: '斧', key: 'axe_toggle' },
        { label: '弓', key: 'bow_toggle' },
        { label: '弩', key: 'crossbow_toggle' },
        { label: '权杖', key: 'sceptre_toggle' },
        { label: '法杖', key: 'staff_toggle' },
      ],
    },
    {
      title: '副手',
      items: [
        { label: '匕首', key: 'dagger_toggle' },
        { label: '书', key: 'tome_toggle' },
        { label: '盾', key: 'shield_toggle' },
      ],
    },
    {
      title: '头部',
      items: [
        { label: '轻甲', key: 'head_light_toggle' },
        { label: '中甲', key: 'head_medium_toggle' },
        { label: '重甲', key: 'head_heavy_toggle' },
      ],
    },
    {
      title: '身体',
      items: [
        { label: '轻甲', key: 'body_light_toggle' },
        { label: '中甲', key: 'body_medium_toggle' },
        { label: '重甲', key: 'body_heavy_toggle' },
      ],
    },
    {
      title: '足部',
      items: [
        { label: '轻甲', key: 'feet_light_toggle' },
        { label: '中甲', key: 'feet_medium_toggle' },
        { label: '重甲', key: 'feet_heavy_toggle' },
      ],
    },
    {
      title: '饰品',
      items: [
        { label: '戒指', key: 'ring_toggle' },
        { label: '项链', key: 'necklace_toggle' },
      ],
    },
    {
      title: '其他',
      items: [
        { label: '自动出售', key: 'autoSell_toggle' },
        { label: '音效', key: 'sound_toggle' },
      ],
    },
  ]

  return (
    <div style={containerStyle}>
      {/* 标题栏 */}
      <div style={headerStyle}>
        <b style={{ color: 'var(--color-text-bright)', fontSize: 15 }}>系统设置</b>
        <button
          onClick={() => dispatch({ type: 'UI_CLOSE_WINDOW' })}
          style={closeBtnStyle}
        >
          返回
        </button>
      </div>

      {/* 滚动区域 */}
      <div style={scrollStyle}>
        {groups.map((group) => (
          <div key={group.title} style={sectionStyle}>
            <div style={sectionTitleStyle}>{group.title}</div>
            <div style={toggleGridStyle}>
              {group.items.map((item) => {
                const checked = (config as any)[item.key] ?? true
                return (
                  <div
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    title={`${item.label}: ${checked ? '开启' : '关闭'}`}
                    style={toggleRowStyle}
                  >
                    {/* 自定义勾选框 */}
                    <div style={{
                      ...checkboxStyle,
                      borderColor: checked ? (item.color ?? 'var(--color-green)') : 'var(--color-border)',
                      background: checked ? (item.color ?? 'var(--color-green)') : 'transparent',
                    }}>
                      {checked && <span style={checkmarkStyle}>✓</span>}
                    </div>
                    <span style={{
                      ...labelStyle,
                      color: checked ? (item.color ?? 'var(--color-text)') : 'var(--color-text-dim)',
                    }}>
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 8px',
  borderBottom: '1px solid var(--color-border)',
  flexShrink: 0,
}

const closeBtnStyle: React.CSSProperties = {
  color: 'var(--color-text-dim)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
}

const scrollStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '6px 8px',
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 10,
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 'bold',
  color: 'var(--color-text-bright)',
  marginBottom: 4,
  paddingBottom: 2,
  borderBottom: '1px solid var(--color-border)',
}

const toggleGridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
}

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 6px',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  userSelect: 'none',
  fontSize: 12,
  minWidth: 60,
}

const checkboxStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: 2,
  border: '2px solid var(--color-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.15s ease',
}

const checkmarkStyle: React.CSSProperties = {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
  lineHeight: 1,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.4,
}

export { SystemWindow }

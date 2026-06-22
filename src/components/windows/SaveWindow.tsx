// ═══ 存档窗口 ═══
// AS3 原始: iPanel.iScene.iPanel 内联
// 快速存档到3个本地槽位

import { useGameContext } from '../../state/GameContext'
import { Button } from '../common/Common'
import { SAVE_LOCAL_STORAGE_KEYS } from '../../core/systems/SaveSystem'

export function SaveWindow() {
  const { dispatch } = useGameContext();
  const slots = ['slot1', 'slot2', 'slot3'];
  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <b style={{ color: 'var(--color-text)' }}>存档</b>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slots.map(slot => (
          <div key={slot} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <Button size="sm" onClick={() => dispatch({ type: 'SAVE_GAME', slot })}>
            存档至 {slot}
          </Button>
          <Button
            data-bwe-save-export={slot}
            size="sm"
            variant="primary"
            onClick={() => dispatch({ type: 'MANUAL_SAVE', slot })}
          >
            导出 .boe
          </Button>
          </div>
        ))}
      </div>
      <div
        data-bwe-save-window-storage-hint
        style={{
          marginTop: 8,
          color: 'var(--color-text-dim)',
          fontSize: 11,
          lineHeight: 1.45,
          wordBreak: 'break-all',
        }}
      >
        localStorage: {SAVE_LOCAL_STORAGE_KEYS.slice(0, slots.length).join(' / ')}
      </div>
    </div>
  )
}

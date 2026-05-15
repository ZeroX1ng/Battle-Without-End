// ═══ 存档窗口 ═══
// AS3 原始: iPanel.iScene.iPanel 内联
// 快速存档到3个本地槽位

import { useGameContext } from '../../state/GameContext'
import { Button } from '../common/Common'

export function SaveWindow() {
  const { state, dispatch } = useGameContext();
  const slots = ['slot1', 'slot2', 'slot3'];
  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <b style={{ color: 'var(--color-text)' }}>存档</b>
        <button onClick={() => dispatch({ type: 'UI_CLOSE_WINDOW' })}
          style={{ color: 'var(--color-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slots.map(slot => (
          <Button key={slot} size="sm" onClick={() => dispatch({ type: 'SAVE_GAME', slot })}>
            存档至 {slot}
          </Button>
        ))}
      </div>
    </div>
  )
}

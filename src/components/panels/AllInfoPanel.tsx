// ═══ 战斗日志面板 ═══
// AS3 原始: MainScene.allInfoPanel (AllInfoPanel)

import { useEffect, useRef } from 'react'
import { useGameContext } from '../../state/GameContext'

export function AllInfoPanel() {
  const { state } = useGameContext();
  const { infoMessages } = state.ui;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [infoMessages.length]);

  return (
    <div ref={scrollRef} style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 12px', height: 120, overflowY: 'auto',
      fontSize: 12, lineHeight: 1.6
    }}>
      {infoMessages.length === 0 && (
        <div style={{ color: 'var(--color-text-dim)', textAlign: 'center', paddingTop: 40 }}>
          等待战斗开始...
        </div>
      )}
      {infoMessages.map(msg => (
        <div key={msg.id} dangerouslySetInnerHTML={{ __html: msg.text }} />
      ))}
    </div>
  )
}

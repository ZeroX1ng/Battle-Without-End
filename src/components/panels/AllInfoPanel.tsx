// ═══ 战斗日志面板 ═══
// AS3 原始: MainScene.allInfoPanel (AllInfoPanel)
// 原版尺寸: 400 × 355

import { useEffect, useRef } from 'react'
import { useGameContext } from '../../state/GameContext'

export function AllInfoPanel() {
  const { state } = useGameContext();
  const { infoMessages } = state.ui;
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(infoMessages.length);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevLengthRef.current = infoMessages.length;
  }, [infoMessages.length]);

  return (
    <div ref={scrollRef} style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 12px', width: 400, height: 355, overflowY: 'auto',
      fontSize: 12, lineHeight: 1.6
    }}>
      {infoMessages.length === 0 && (
        <div style={{ color: 'var(--color-text-dim)', textAlign: 'center', paddingTop: 160 }}>
          等待战斗开始...
        </div>
      )}
      {infoMessages.map(msg => (
        <div key={msg.id} dangerouslySetInnerHTML={{ __html: msg.text }} />
      ))}
    </div>
  )
}

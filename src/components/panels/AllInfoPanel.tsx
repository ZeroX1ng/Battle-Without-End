// ═══ 战斗日志面板 ═══
// AS3 原始: MainScene.allInfoPanel (AllInfoPanel)
// 原版尺寸: 400 × 355
// 滚动策略: 默认跟随底部；用户向上查看历史时暂停跟随；滚回底部后恢复跟随

import { useLayoutEffect, useCallback, useRef } from 'react'
import { useGameContext } from '../../state/GameContext'

const BATTLE_LOG_BOTTOM_THRESHOLD = 24;

type BattleLogScrollState = Pick<HTMLDivElement, 'scrollTop' | 'scrollHeight' | 'clientHeight'>;

export function isBattleLogNearBottom(
  element: BattleLogScrollState,
  threshold = BATTLE_LOG_BOTTOM_THRESHOLD,
) {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
}

export function AllInfoPanel() {
  const { state } = useGameContext();
  const { infoMessages } = state.ui;
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);

  // 使用最后一条消息的 id 作为依赖，因为消息达到 200 条上限后 length 不再变化
  const lastMessageId = infoMessages.length > 0 ? infoMessages[infoMessages.length - 1].id : 0;

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element || !shouldStickToBottomRef.current) return;
    element.scrollTop = element.scrollHeight;
  }, [lastMessageId]);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    shouldStickToBottomRef.current = isBattleLogNearBottom(element);
  }, []);

  return (
    <div ref={scrollRef} onScroll={handleScroll} style={{
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

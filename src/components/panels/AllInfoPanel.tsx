// Battle log panel. AS3 source: MainScene.allInfoPanel (AllInfoPanel).
// Original size: 400 x 355.
// Scroll policy: follow the bottom by default, pause while reading history, resume at bottom.

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

  // Depend on the last id because the retained AS3-style log count is capped.
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
    <div
      ref={scrollRef}
      className="battle-log-panel"
      data-bwe-battle-log-panel
      onScroll={handleScroll}
    >
      {infoMessages.length === 0 && (
        <div className="battle-log-panel__empty">
          等待战斗开始...
        </div>
      )}
      {infoMessages.map(msg => (
        <div
          key={msg.id}
          className="battle-log-panel__message"
          data-bwe-battle-log-message-id={msg.id}
          dangerouslySetInnerHTML={{ __html: msg.text }}
        />
      ))}
    </div>
  )
}

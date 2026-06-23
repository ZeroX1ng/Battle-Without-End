// Battle log panel. AS3 source: MainScene.allInfoPanel (AllInfoPanel).
// Original size: 400 x 355.
// Scroll policy: follow the bottom by default, pause while reading history, resume at bottom.

import { useLayoutEffect, useCallback, useRef, useState, type CSSProperties } from 'react'
import { useGameContext } from '../../state/GameContext'

const BATTLE_LOG_BOTTOM_THRESHOLD = 24;
const MIN_BATTLE_LOG_FONT_SIZE = 15;
const MAX_BATTLE_LOG_FONT_SIZE = 22;
const DEFAULT_BATTLE_LOG_FONT_SIZE = 18;
const BATTLE_LOG_LINE_WIDTH_TARGET = 0.96;

type BattleLogScrollState = Pick<HTMLDivElement, 'scrollTop' | 'scrollHeight' | 'clientHeight'>;

function padClockPart(value: number) {
  return String(value).padStart(2, '0');
}

function formatBattleLogTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return `[${padClockPart(date.getHours())}:${padClockPart(date.getMinutes())}:${padClockPart(date.getSeconds())}]`;
}

function getPlainLogText(html: string): string {
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, '');
  }

  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent ?? '';
}

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
  const [battleLogFontSize, setBattleLogFontSize] = useState(DEFAULT_BATTLE_LOG_FONT_SIZE);

  // Depend on the last id because the retained AS3-style log count is capped.
  const lastMessageId = infoMessages.length > 0 ? infoMessages[infoMessages.length - 1].id : 0;

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element || !shouldStickToBottomRef.current) return;
    element.scrollTop = element.scrollHeight;
  }, [lastMessageId]);

  const updateBattleLogFontSize = useCallback(() => {
    const element = scrollRef.current;
    if (!element || typeof document === 'undefined') return;

    const style = getComputedStyle(element);
    const availableWidth = element.clientWidth
      - Number.parseFloat(style.paddingLeft || '0')
      - Number.parseFloat(style.paddingRight || '0');
    if (!Number.isFinite(availableWidth) || availableWidth <= 0) return;

    const longestLine = infoMessages
      .map(msg => `${formatBattleLogTimestamp(msg.timestamp)} ${getPlainLogText(msg.text)}`)
      .reduce((longest, candidate) => (
        candidate.length > longest.length ? candidate : longest
      ), '');

    if (!longestLine) {
      setBattleLogFontSize(DEFAULT_BATTLE_LOG_FONT_SIZE);
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const fontFamily = style.fontFamily || 'sans-serif';
    const targetWidth = availableWidth * BATTLE_LOG_LINE_WIDTH_TARGET;
    let low = MIN_BATTLE_LOG_FONT_SIZE;
    let high = MAX_BATTLE_LOG_FONT_SIZE;

    for (let i = 0; i < 8; i += 1) {
      const mid = (low + high) / 2;
      context.font = `${mid}px ${fontFamily}`;
      if (context.measureText(longestLine).width <= targetWidth) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const next = Number(low.toFixed(2));
    setBattleLogFontSize(current => (
      Math.abs(current - next) > 0.1 ? next : current
    ));
  }, [infoMessages]);

  useLayoutEffect(() => {
    updateBattleLogFontSize();
    const element = scrollRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(updateBattleLogFontSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateBattleLogFontSize]);

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
      style={{ '--bwe-battle-log-font-size': `${battleLogFontSize}px` } as CSSProperties}
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
        >
          <span className="battle-log-panel__timestamp">{formatBattleLogTimestamp(msg.timestamp)}</span>
          <span dangerouslySetInnerHTML={{ __html: msg.text }} />
        </div>
      ))}
    </div>
  )
}

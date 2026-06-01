// Title window.
// AS3 original: iPanel.iScene.iPanel.iWindow.TitleWindow.as + iTitle/TitleCell.as

import type { MouseEvent } from 'react'
import { useGameContext } from '../../state/GameContext'
import { getTitleDescription, TitleList } from '../../core/data/titleData'
import { ScrollList } from '../common/Common'
import { useInfoWindow } from '../common/InfoWindow'
import type { TitleData } from '../../core/types'

export function TitleWindow() {
  const { state, dispatch } = useGameContext();
  const player = state.player;
  const equipTitle = player.title as TitleData | null;
  const playerTitlesByName = new Map(player.titleList.map((title: TitleData) => [title.name, title]));
  const gotTitles: string[] = player.titleList.filter((t: TitleData) => t.isGot).map((t: TitleData) => t.name);

  const allTitles = TitleList.map((def) => {
    const playerTitle = playerTitlesByName.get(def.name);
    return { ...def, ...playerTitle, isGot: playerTitle?.isGot ?? false };
  });

  const handleEquip = (title: TitleData) => {
    if (!title.isGot) return;
    dispatch({ type: 'TITLE_SET', title });
  };

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ color: 'var(--color-text-bright)', fontSize: 15 }}>称号</b>
          <span style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>
            ({gotTitles.length}/{TitleList.length})
          </span>
          {equipTitle && (
            <span style={{ color: 'var(--color-yellow)', fontSize: 11 }}>
              当前: {equipTitle.realName}
            </span>
          )}
        </div>
        <button
          onClick={() => dispatch({ type: 'UI_CLOSE_WINDOW' })}
          style={{
            color: 'var(--color-text-dim)', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 14
          }}
        >
          x
        </button>
      </div>

      <ScrollList
        items={allTitles}
        maxHeight={360}
        renderItem={(item: TitleData) => (
          <TitleRow
            key={item.name}
            title={item}
            equipped={equipTitle?.name === item.name}
            onClick={() => handleEquip(item)}
          />
        )}
        emptyText="暂无称号"
      />
    </div>
  )
}

function TitleRow({ title, equipped, onClick }: {
  title: TitleData;
  equipped: boolean;
  onClick: () => void;
}) {
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow();

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    updateMouse(event.clientX, event.clientY);
    showItemInfo(getTitleDescription(title));
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    updateMouse(event.clientX, event.clientY);
  };

  const textColor = equipped
    ? 'rgb(255, 255, 255)'
    : title.isGot
      ? 'var(--color-text)'
      : 'rgba(0, 0, 0, 0.8)';

  const bgColor = equipped
    ? 'rgba(230, 179, 0, 0.95)'
    : title.isGot
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(200, 200, 200, 0.8)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={hideItemInfo}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: 200,
        minHeight: 50,
        padding: '0 10px',
        marginBottom: 0,
        cursor: title.isGot ? 'pointer' : 'default',
        background: bgColor,
        border: '1px solid rgba(205, 217, 237, 0.8)',
        borderRadius: 0,
        boxShadow: equipped ? '0 0 13px rgba(77, 77, 205, 0.66)' : undefined,
        transition: 'filter 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div
        style={{
          width: 180,
          minHeight: 24,
          color: textColor,
          fontSize: 13,
          fontWeight: 700,
          lineHeight: '24px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title.realName.toUpperCase()}
      </div>
    </div>
  )
}

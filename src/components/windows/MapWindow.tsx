// ═══ 地图窗口 ═══
// AS3 原始: iPanel.iScene.iPanel.iWindow.iSystem.iMap.MapPanel.as + MapCell.as
// 16张地图自由切换，切换时重置战利品面板+重新初始化战斗
// 地图按 MapData.x/y 坐标排列在网格中，当前所在地图高亮显示

import { useGameContext } from '../../state/GameContext'
import { Map } from '../../core/models/Map'
import { MapList } from '../../core/data/mapData'

export function MapWindow() {
  const { state, dispatch } = useGameContext();
  const currentMapName = (state.battle as any)?.map?.mapData?.name ?? MapList[0].name;

  const handleSwitch = (mapData: typeof MapList[number]) => {
    const newMap = new Map(mapData);
    dispatch({ type: 'MAP_SWITCH', map: newMap });
  };

  // 按坐标分组，计算网格范围
  const maxX = Math.max(...MapList.map(m => m.x), 3);
  const maxY = Math.max(...MapList.map(m => m.y), 3);
  const cols = maxX + 1;

  // 辅助：获取地图难度颜色
  const getDifficultyColor = (cp: number) => {
    if (cp <= 100) return { text: 'var(--color-green)', bg: 'rgba(75, 184, 20, 0.15)' };
    if (cp <= 400) return { text: 'var(--color-teal)', bg: 'rgba(33, 196, 175, 0.15)' };
    if (cp <= 800) return { text: 'var(--color-yellow)', bg: 'rgba(255, 166, 64, 0.15)' };
    if (cp <= 2000) return { text: 'var(--color-orange)', bg: 'rgba(255, 113, 0, 0.15)' };
    return { text: 'var(--color-red)', bg: 'rgba(255, 64, 64, 0.15)' };
  };

  // 辅助：获取地图难度标签
  const getDifficultyLabel = (cp: number) => {
    if (cp <= 100) return '简单';
    if (cp <= 400) return '普通';
    if (cp <= 800) return '困难';
    if (cp <= 2000) return '噩梦';
    return '地狱';
  };

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <b style={{ color: 'var(--color-text)', fontSize: 15 }}>世界地图</b>
        <button
          onClick={() => dispatch({ type: 'UI_CLOSE_WINDOW' })}
          style={{
            color: 'var(--color-text-dim)', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 14
          }}
        >
          返回
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 6,
        alignContent: 'start',
      }}>
        {MapList.map((mapData) => {
          const map = new Map(mapData);
          const cp = Math.floor(map.averageCp);
          const isCurrent = mapData.name === currentMapName;
          const monsterCount = mapData.monsterList.length;
          const diffColor = getDifficultyColor(cp);
          const diffLabel = getDifficultyLabel(cp);

          return (
            <div
              key={mapData.name}
              onClick={() => !isCurrent && handleSwitch(mapData)}
              title={isCurrent ? '当前所在地图' : `点击前往 ${mapData.realName}\n平均战力: ${cp}\n怪物种类: ${monsterCount}`}
              style={{
                gridColumn: mapData.x + 1,
                gridRow: mapData.y + 1,
                padding: '8px 10px',
                cursor: isCurrent ? 'default' : 'pointer',
                borderRadius: 'var(--radius-md)',
                border: isCurrent
                  ? '2px solid var(--color-yellow)'
                  : '1px solid var(--color-border)',
                background: isCurrent
                  ? 'rgba(255, 166, 64, 0.15)'
                  : 'var(--color-bg-panel)',
                opacity: isCurrent ? 1 : 0.85,
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 0,
              }}
              onMouseEnter={(e) => {
                 if (!isCurrent) {
                   (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-dark)';
                   (e.currentTarget as HTMLElement).style.borderColor = diffColor.text;
                   (e.currentTarget as HTMLElement).style.opacity = '1';
                 }
               }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-panel)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.opacity = '0.85';
                }
              }}
            >
              <div style={{
                fontSize: 12, fontWeight: 'bold',
                color: isCurrent ? 'var(--color-yellow)' : 'var(--color-text-bright)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {isCurrent && '📍 '}{mapData.realName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                 <span style={{
                   fontSize: 10, fontWeight: 'bold',
                   color: diffColor.text,
                   background: diffColor.bg,
                   padding: '1px 5px', borderRadius: 3,
                 }}>
                   {diffLabel}
                 </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>
                  CP {cp}
                </span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--color-text-dim)' }}>
                {monsterCount}种怪物 · ×{mapData.modifier}倍收益
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

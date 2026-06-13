// ═══ 地图窗口 ═══
// AS3 原始: iPanel.iScene.iPanel.iWindow.iSystem.iMap.MapPanel.as + MapCell.as
// 16张地图自由切换，切换时重置战利品面板+重新初始化战斗
// 地图按 MapData.x/y 坐标排列在网格中，以 map_icon 点状图标表示，
// 鼠标悬停时通过 infoWindow 显示详细信息（名称、难度、CP、怪物种类、倍率），点击切换地图

import { useMemo } from 'react'
import { useGameContext } from '../../state/GameContext'
import { Map as GameMap } from '../../core/models/Map'
import { MapList } from '../../core/data/mapData'
import { SpriteImage } from '../shared/SpriteImage'
import { useInfoWindow } from '../common/InfoWindow'

const MAP_WIDTH = 800;
const MAP_HEIGHT = 560;

interface MapInfo {
  cp: number;
  label: string;
  text: string;
  bg: string;
}

function getDifficultyInfo(cp: number): Omit<MapInfo, 'cp'> {
  if (cp <= 100) return { label: '简单', text: 'var(--color-green)', bg: 'rgba(75, 184, 20, 0.15)' };
  if (cp <= 400) return { label: '普通', text: 'var(--color-teal)', bg: 'rgba(33, 196, 175, 0.15)' };
  if (cp <= 800) return { label: '困难', text: 'var(--color-yellow)', bg: 'rgba(255, 166, 64, 0.15)' };
  if (cp <= 2000) return { label: '噩梦', text: 'var(--color-orange)', bg: 'rgba(255, 113, 0, 0.15)' };
  return { label: '地狱', text: 'var(--color-red)', bg: 'rgba(255, 64, 64, 0.15)' };
}

function computeMapInfo(mapData: typeof MapList[number]): MapInfo {
  const map = new GameMap(mapData);
  const cp = Math.floor(map.averageCp);
  return { cp, ...getDifficultyInfo(cp) };
}

export function MapWindow() {
  const { state, dispatch } = useGameContext();
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow();
  const currentMapName = (state.battle as any)?.map?.mapData?.name ?? MapList[0].name;

  const mapInfoCache = useMemo(() => {
    const cache = new Map<typeof MapList[number], MapInfo>();
    for (const mapData of MapList) {
      cache.set(mapData, computeMapInfo(mapData));
    }
    return cache;
  }, []);

  const handleSwitch = (mapData: typeof MapList[number]) => {
    const newMap = new GameMap(mapData);
    dispatch({ type: 'MAP_SWITCH', map: newMap });
  };

  function buildInfoHtml(mapData: typeof MapList[number]): string {
    const info = mapInfoCache.get(mapData)!;
    const monsterCount = mapData.monsterList.length;
    return [
      `<p align='center'><font color='${info.text}'><b>${mapData.realName}</b></font></p>`,
      `<p align='center'>${info.label} · CP ${info.cp}</p>`,
      `<p align='center'>${monsterCount}种怪物 · ×${mapData.modifier}倍收益</p>`,
    ].join('');
  }

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <b style={{ color: 'var(--color-text)', fontSize: 15 }}>世界地图</b>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        minHeight: 0,
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          minWidth: 280,
          aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
          minHeight: 360,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-dark)',
        }}>
          <SpriteImage
            name="map_mc"
            autoPlay={true}
            loop={true}
            fps={8}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />
        {MapList.map((mapData) => {
          const isCurrent = mapData.name === currentMapName;

          return (
            <div
              key={mapData.name}
              onClick={() => !isCurrent && handleSwitch(mapData)}
              onMouseEnter={(e: React.MouseEvent) => {
                showItemInfo(buildInfoHtml(mapData));
                updateMouse(e.clientX, e.clientY);
              }}
              onMouseMove={(e: React.MouseEvent) => {
                updateMouse(e.clientX, e.clientY);
              }}
              onMouseLeave={hideItemInfo}
              style={{
                position: 'absolute',
                left: `${(mapData.x / MAP_WIDTH) * 100}%`,
                top: `${(mapData.y / MAP_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 32,
                height: 32,
                cursor: isCurrent ? 'default' : 'pointer',
              }}
            >
              <SpriteImage
                name="map_icon"
                autoPlay={false}
                style={{
                  width: 32,
                  height: 32,
                  filter: isCurrent
                    ? 'drop-shadow(0 0 6px rgba(255, 166, 64, 0.9)) brightness(1.3)'
                    : undefined,
                  opacity: isCurrent ? 1 : 0.7,
                  transition: 'opacity 0.15s ease, filter 0.15s ease',
                }}
              />
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

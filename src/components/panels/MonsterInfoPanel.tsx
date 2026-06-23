// ═══ 怪物信息面板 ═══
// AS3 原始: iPanel.iScene.iPanel.MonsterInfoPanel
// 显示当前战斗怪物的名称、战力、头衔（含描述提示）、HP条和 BUFF

import { useEffect, type MouseEvent } from 'react'
import type { BuffData } from '../../core/types'
import { useGameContext } from '../../state/GameContext'
import { getCombatPower } from '../../core/models/Player'
import { Bar } from '../common/Common'
import { useInfoWindow } from '../common/InfoWindow'
import { getMonsterTitleDescription } from '../../core/data/monsterData'
import { SpriteImage } from '../shared/SpriteImage'

const MONSTER_INFO_PANEL_WIDTH = 170
const MONSTER_INFO_PANEL_MIN_HEIGHT = 112
const MONSTER_INFO_PANEL_BASE_FONT_SIZE = 13
const MONSTER_INFO_PANEL_TITLE_FONT_SIZE = 17
const MONSTER_INFO_PANEL_META_FONT_SIZE = 12
const MONSTER_INFO_PANEL_BAR_HEIGHT = 9
const MONSTER_INFO_PANEL_BUFF_ICON_SIZE = 18

function getBuffInfoHtml(buff: BuffData): string {
  const count = Math.floor(Number(buff.count) || 0);
  switch (buff.name) {
    case 'burn':
      return `<p align='center'><font size='16' color='#ff4040'>灼伤</font></p>每回合造成 <font color='#ff4040'>${count}</font> 点伤害。`;
    case 'frozen':
      return `<p align='center'><font size='16' color='#66ccff'>冰冻</font></p>剩余 <font color='#66ccff'>${count}</font> 回合，期间怪物无法行动。`;
    case 'poison':
      return `<p align='center'><font size='16' color='#66ff66'>中毒</font></p>每回合造成 <font color='#66ff66'>${count}</font> 点伤害。`;
    case 'corrosion':
      return `<p align='center'><font size='16' color='#d6a15b'>腐蚀</font></p>降低怪物护甲 <font color='#d6a15b'>${count}</font> 点。`;
    default:
      return `<p align='center'><font size='16'>${buff.name}</font></p>层数 / 数值：${count}`;
  }
}

export function MonsterInfoPanel() {
  const { state } = useGameContext();
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow();
  const battle = state.battle as any;
  const mon = battle?.monster ?? null;
  const hp = battle?.monsterHp ?? 0;
  const maxHp = mon?.hp ?? 0;
  const buffs: BuffData[] = mon && Array.isArray(mon.buffList) ? mon.buffList : [];
  const tooltipOwnerKey = mon
    ? `${mon.data?.name ?? mon.nameHtml ?? 'monster'}:${mon.title?.name ?? ''}:${mon.CP}:${maxHp}`
    : 'none';
  const monsterDead = !mon || hp <= 0;

  useEffect(() => {
    if (monsterDead) hideItemInfo();
    return () => hideItemInfo();
  }, [hideItemInfo, monsterDead, tooltipOwnerKey]);

  if (!mon) return null;

  const handleTitleMouseEnter = (event: MouseEvent<HTMLSpanElement>) => {
    if (!mon.title) return;
    updateMouse(event.clientX, event.clientY);
    showItemInfo(getMonsterTitleDescription(mon.title));
  };
  const handleTitleMouseMove = (event: MouseEvent<HTMLSpanElement>) => {
    updateMouse(event.clientX, event.clientY);
  };
  const handleBuffMouseEnter = (buff: BuffData, event: MouseEvent<HTMLSpanElement>) => {
    updateMouse(event.clientX, event.clientY);
    showItemInfo(getBuffInfoHtml(buff));
  };
  const handleBuffMouseMove = (event: MouseEvent<HTMLSpanElement>) => {
    updateMouse(event.clientX, event.clientY);
  };

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '10px 12px', width: MONSTER_INFO_PANEL_WIDTH, fontSize: MONSTER_INFO_PANEL_BASE_FONT_SIZE,
      minHeight: MONSTER_INFO_PANEL_MIN_HEIGHT, boxSizing: 'border-box',
    }}>
      <div
        style={{ fontSize: MONSTER_INFO_PANEL_TITLE_FONT_SIZE, fontWeight: 'bold', marginBottom: 5, lineHeight: 1.18 }}
        dangerouslySetInnerHTML={{ __html: mon.getNameHtml(getCombatPower(state.player)) }}
      />
      <div style={{ color: 'var(--color-text-dim)', fontSize: MONSTER_INFO_PANEL_META_FONT_SIZE, marginBottom: 5, lineHeight: 1.25 }}>
        CP: {mon.CP} ·{' '}
        {mon.title ? (
          <span
            dangerouslySetInnerHTML={{ __html: mon.title.name }}
            onMouseEnter={handleTitleMouseEnter}
            onMouseMove={handleTitleMouseMove}
            onMouseLeave={hideItemInfo}
            style={{ cursor: 'help', borderBottom: '1px dotted var(--color-text-dim)' }}
          />
        ) : ''}
      </div>
      <Bar value={hp} max={maxHp} color='var(--color-red)' label={`HP ${Math.floor(hp)}/${maxHp}`} height={MONSTER_INFO_PANEL_BAR_HEIGHT} />
      {buffs.length > 0 && (
        <div style={{ marginTop: 7, display: 'flex', gap: 5, flexWrap: 'wrap', minHeight: MONSTER_INFO_PANEL_BUFF_ICON_SIZE }}>
          {buffs.map((buff, index) => (
            <span
              key={`${buff.name}-${index}`}
              data-bwe-monster-buff-icon={buff.name}
              onMouseEnter={event => handleBuffMouseEnter(buff, event)}
              onMouseMove={handleBuffMouseMove}
              onMouseLeave={hideItemInfo}
              style={{ width: MONSTER_INFO_PANEL_BUFF_ICON_SIZE, height: MONSTER_INFO_PANEL_BUFF_ICON_SIZE, display: 'inline-flex', cursor: 'help' }}
            >
              <SpriteImage
                name={`buff_${buff.name}`}
                autoPlay={false}
                style={{ width: MONSTER_INFO_PANEL_BUFF_ICON_SIZE, height: MONSTER_INFO_PANEL_BUFF_ICON_SIZE, imageRendering: 'pixelated' }}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

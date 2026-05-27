// ═══ 怪物信息面板 ═══
// AS3 原始: iPanel.iScene.iPanel.MonsterInfoPanel
// 显示当前战斗怪物的名称、战力、头衔（含描述提示）、HP条、四维属性

import type { MouseEvent } from 'react'
import { useGameContext } from '../../state/GameContext'
import { getCombatPower } from '../../core/models/Player'
import { Bar } from '../common/Common'
import { useInfoWindow } from '../common/InfoWindow'
import { getMonsterTitleDescription } from '../../core/data/monsterData'

export function MonsterInfoPanel() {
  const { state } = useGameContext();
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow();
  const battle = state.battle as any;
  if (!battle?.monster) return null;

  const mon = battle.monster;
  const hp = battle.monsterHp;
  const maxHp = mon.hp;
  const handleTitleMouseEnter = (event: MouseEvent<HTMLSpanElement>) => {
    if (!mon.title) return;
    updateMouse(event.clientX, event.clientY);
    showItemInfo(getMonsterTitleDescription(mon.title));
  };
  const handleTitleMouseMove = (event: MouseEvent<HTMLSpanElement>) => {
    updateMouse(event.clientX, event.clientY);
  };

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '12px 16px', width: 185, fontSize: 13, minHeight: 135
    }}>
      <div
        style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}
        dangerouslySetInnerHTML={{ __html: mon.getNameHtml(getCombatPower(state.player)) }}
      />
      <div style={{ color: 'var(--color-text-dim)', fontSize: 11, marginBottom: 2 }}>
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
      <Bar value={hp} max={maxHp} color='var(--color-red)' label={`HP ${Math.floor(hp)}/${maxHp}`} height={10} />
      <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontSize: 11 }}>
        <StatLine label="攻击" value={Math.floor(mon.attack)} />
        <StatLine label="防御" value={Math.floor(mon.defence)} />
        <StatLine label="护甲" value={Math.floor(mon.protection)} />
        <StatLine label="暴击" value={`${Math.floor(mon.crit)}%`} />
      </div>
    </div>
  )
}

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--color-text-dim)' }}>{label}</span>
      <span style={{ color: 'var(--color-text)', fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}

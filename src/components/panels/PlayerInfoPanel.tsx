import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useGameContext } from '../../state/GameContext'
import { selectPlayerStats } from '../../state/selectors'
import { getAgeGrowthInfo } from '../../core/models/Player'
import { Bar } from '../common/Common'
import { useInfoWindow } from '../common/InfoWindow'

export function PlayerInfoPanel() {
  const { state } = useGameContext();
  const { showStringInfo, hideStringInfo, updateMouse } = useInfoWindow();
  const s = selectPlayerStats(state.player);
  const battleHp = state.battle?.playerHp ?? s.hp;
  const battleMp = state.battle?.playerMp ?? s.mp;
  const ageGrowthInfo = getAgeGrowthInfo(state.player);
  const ageRef = useRef<HTMLSpanElement | null>(null);
  const [isAgeHovered, setIsAgeHovered] = useState(false);
  const showAgeInfo = (event: React.MouseEvent<HTMLSpanElement>) => {
    setIsAgeHovered(true);
    updateMouse(event.clientX, event.clientY);
    showStringInfo(ageGrowthInfo.tooltip);
  };
  const hideAgeInfo = () => {
    setIsAgeHovered(false);
    hideStringInfo();
  };

  useEffect(() => {
    if (isAgeHovered) {
      showStringInfo(ageGrowthInfo.tooltip);
    }
  }, [ageGrowthInfo.tooltip, isAgeHovered, showStringInfo]);

  useEffect(() => {
    const ageElement = ageRef.current;
    if (!ageElement) return;
    const show = (event: MouseEvent) => {
      setIsAgeHovered(true);
      updateMouse(event.clientX, event.clientY);
      showStringInfo(ageGrowthInfo.tooltip);
    };
    const move = (event: MouseEvent) => updateMouse(event.clientX, event.clientY);
    const hide = () => {
      setIsAgeHovered(false);
      hideStringInfo();
    };
    ageElement.addEventListener('mouseover', show);
    ageElement.addEventListener('mousemove', move);
    ageElement.addEventListener('mouseleave', hide);
    return () => {
      ageElement.removeEventListener('mouseover', show);
      ageElement.removeEventListener('mousemove', move);
      ageElement.removeEventListener('mouseleave', hide);
    };
  }, [ageGrowthInfo.tooltip, hideStringInfo, showStringInfo, updateMouse]);

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 8px', width: 385, fontSize: 13, maxHeight: 220, overflowY: 'auto'
    }}>
      <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-red)', marginBottom: 4 }}>
        {s.playerName} <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Lv.{s.lv}</span>
      </div>

      <div style={{ color: 'var(--color-text-dim)', fontSize: 11, marginBottom: 2 }}>
        <span>{s.raceName} · </span>
        <span
          ref={ageRef}
          data-testid="player-age-growth"
          onMouseEnter={showAgeInfo}
          onMouseOver={showAgeInfo}
          onMouseMove={event => updateMouse(event.clientX, event.clientY)}
          onMouseLeave={hideAgeInfo}
          style={{ color: 'var(--color-yellow)', cursor: 'help' }}
        >
          {s.age}岁
        </span>
      </div>

      <Bar value={battleHp} max={s.hp} color='var(--color-hp)' label={`HP ${Math.floor(battleHp)}/${Math.floor(s.hp)}`} height={8} />
      <Bar value={battleMp} max={s.mp} color='var(--color-mp)' label={`MP ${Math.floor(battleMp)}/${Math.floor(s.mp)}`} height={8} />
      <Bar value={s.xp} max={s.maxXp} color='var(--color-exp)' label={`XP ${s.xp}/${s.maxXp}`} height={6} />

      <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 6px' }}>
        <StatLine label="AP" value={s.ap} color="#ff4040" />
        <StatLine label="金币" value={s.gold} color="#FFA640" />
        <StatLine label="力量" value={Math.floor(s.str)} />
        <StatLine label="敏捷" value={Math.floor(s.dex)} />
        <StatLine label="智力" value={Math.floor(s.intelligence)} />
        <StatLine label="意志" value={Math.floor(s.will)} />
        <StatLine label="幸运" value={Math.floor(s.luck)} />
        <StatLine label="防御" value={Math.floor(s.defence)} />
        <StatLine label="护甲" value={Math.floor(s.protection)} />
        <StatLine label="暴击" value={`${Math.floor(s.crit)}%`} />
        <StatLine label="攻击" value={Math.floor(s.attack)} />
        <StatLine label="平衡" value={Math.floor(s.balance)} />
        <StatLine label="暴击倍数" value={s.crit_mul.toFixed(1)} />
        <StatLine label="无视护甲" value={Math.floor(s.protectionIgnore)} />
        <StatLine label="战力" value={Math.floor(s.combatPower)} color="#21c4af" />
      </div>
    </div>
  )
}

function StatLine({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
      <span style={{ color: 'var(--color-text-dim)' }}>{label}</span>
      <span style={{ color: color || 'var(--color-text)', fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}

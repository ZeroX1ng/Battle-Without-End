// ═══ 玩家属性面板 ═══
// AS3 原始: iPanel.iCell.* (PlayerInfo相关)

import { useGameContext } from '../../state/GameContext'
import { selectPlayerStats } from '../../state/selectors'
import { Bar } from '../common/Common'

export function PlayerInfoPanel() {
  const { state } = useGameContext();
  const s = selectPlayerStats(state.player);

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '12px 16px', width: 220, fontSize: 13
    }}>
      <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-red)', marginBottom: 8 }}>
        {s.playerName} <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Lv.{s.lv}</span>
      </div>

      <div style={{ color: 'var(--color-text-dim)', fontSize: 11, marginBottom: 4 }}>
        {s.raceName} · {s.age}岁
      </div>

      <Bar value={s.hp} max={s.hp} color='var(--color-hp)' label={`HP ${Math.floor(s.hp)}`} height={10} />
      <div style={{ marginBottom: 2 }} />
      <Bar value={s.mp} max={s.mp} color='var(--color-mp)' label={`MP ${Math.floor(s.mp)}`} height={10} />
      <div style={{ marginBottom: 2 }} />
      <Bar value={s.xp} max={s.maxXp} color='var(--color-exp)' label={`XP ${s.xp}/${s.maxXp}`} height={8} />

      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
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
        <StatLine label="战力" value={Math.floor(s.combatPower)} color="#21c4af" />
      </div>
    </div>
  )
}

function StatLine({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
      <span style={{ color: 'var(--color-text-dim)' }}>{label}</span>
      <span style={{ color: color || 'var(--color-text)', fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}

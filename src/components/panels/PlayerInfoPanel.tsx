// ═══ 玩家属性面板 ═══
// AS3 原始: iPanel.iCell.* (PlayerInfo相关)
// 原版尺寸: 385 × 220

import { useGameContext } from '../../state/GameContext'
import { selectPlayerStats } from '../../state/selectors'
import { Bar } from '../common/Common'

export function PlayerInfoPanel() {
  const { state } = useGameContext();
  const s = selectPlayerStats(state.player);
  const battleHp = state.battle?.playerHp ?? s.hp;
  const battleMp = state.battle?.playerMp ?? s.mp;

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 8px', width: 385, fontSize: 13, maxHeight: 220, overflowY: 'auto'
    }}>
      <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-red)', marginBottom: 4 }}>
        {s.playerName} <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Lv.{s.lv}</span>
      </div>

      <div style={{ color: 'var(--color-text-dim)', fontSize: 11, marginBottom: 2 }}>
        {s.raceName} · {s.age}岁
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

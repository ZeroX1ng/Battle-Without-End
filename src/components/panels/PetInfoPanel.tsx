// ═══ 宠物信息面板 ═══
// AS3 原始: iPanel.iCell.* (PetInfo相关)

import { useGameContext } from '../../state/GameContext'
import { Bar } from '../common/Common'

export function PetInfoPanel() {
  const { state } = useGameContext();
  const battle = state.battle as any;
  const pet = state.player.pet;

  if (!pet && !battle?.pet) return null;

  const p = battle?.pet || pet;
  if (!p) return null;
  const hp = battle?.petHp ?? p.hp;
  const mp = battle?.petMp ?? p.mp;

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '10px 14px', width: 180, fontSize: 12
    }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-green)', marginBottom: 4 }}>
        {p.name || p.realName} <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Lv.{p.level}</span>
      </div>
      <div style={{ color: 'var(--color-text-dim)', fontSize: 10, marginBottom: 2 }}>{p.type}</div>
      <Bar value={hp} max={p.hp} color='var(--color-hp)' label={`HP ${Math.floor(hp)}/${p.hp}`} height={8} />
      <div style={{ marginBottom: 1 }} />
      <Bar value={mp} max={p.mp} color='var(--color-mp)' label={`MP ${Math.floor(mp)}/${p.mp}`} height={8} />
    </div>
  )
}

// ═══ 宠物信息面板 ═══
// AS3 原始: iPanel.iCell.* (PetInfo相关)
// 原版尺寸: 185 × 80

import { useGameContext } from '../../state/GameContext'
import { Bar } from '../common/Common'

export function PetInfoPanel() {
  const { state } = useGameContext();
  const battle = state.battle as any;
  const pet = state.player.pet;
  const p = battle?.pet || pet;
  // Treat battle.pet as the active-combat gate; petHp can be zero for a defeated pet.
  const inBattle = (battle?.pet) != null;
  const hp = inBattle ? battle.petHp : (p ? p.hp : 0);
  const exp = p ? (p.exp ?? 0) : 0;
  const expMax = p && typeof p.getLevelExp === 'function' ? p.getLevelExp() : 1;

  return (
    <div style={{
      background: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)',
      padding: '8px 10px', width: 185, minHeight: 80, fontSize: 12
    }}>
      {p ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-green)', marginBottom: 4 }}>
            {p.name || p.realName} <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Lv.{p.level}</span>
          </div>
          <div style={{ color: 'var(--color-text-dim)', fontSize: 10, marginBottom: 2 }}>{p.type}</div>
          <Bar value={hp} max={p.hp} color='var(--color-hp)' label={`HP ${Math.floor(hp)}/${p.hp}`} height={8} />
          <div style={{ marginBottom: 1 }} />
          <Bar value={exp} max={expMax} color='var(--color-exp)' label={`Exp ${Math.floor(exp)}/${expMax}`} height={8} />
        </>
      ) : (
        <div style={{
          color: 'var(--color-text-dim)', fontSize: 11, textAlign: 'center', paddingTop: 20
        }}>
          无宠物
        </div>
      )}
    </div>
  )
}

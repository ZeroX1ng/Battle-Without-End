// Active battle pet panel.
// AS3 kept this as a compact HP/Exp card. React also uses this battle-owned
// space for the active pet stat summary, so EquipWindow can stay equipment-only.

import type { MouseEvent as ReactMouseEvent } from 'react'
import { useGameContext } from '../../state/GameContext'
import { Bar } from '../common/Common'
import { useInfoWindow } from '../common/InfoWindow'

const PET_STATS: Array<{ label: string; getValue: (pet: any) => string }> = [
  { label: '宠物', getValue: pet => pet.realName ?? pet.name ?? '-' },
  { label: 'Hp', getValue: pet => String(Math.floor(pet.hp ?? 0)) },
  { label: 'Mp', getValue: pet => String(Math.floor(pet.mp ?? 0)) },
  { label: '攻击', getValue: pet => `${Math.floor(pet.attmin ?? 0)}~${Math.floor(pet.attmax ?? 0)}` },
  { label: '平衡', getValue: pet => String(Math.floor(pet.balance ?? 0)) },
  { label: '暴击', getValue: pet => String(Math.floor(pet.cri ?? 0)) },
  { label: '暴伤', getValue: pet => `${Math.floor(pet.crimul ?? 0)}%` },
  { label: '防御', getValue: pet => String(Math.floor(pet.defence ?? 0)) },
  { label: '护甲', getValue: pet => String(Math.floor(pet.pro ?? 0)) },
  { label: '魔攻', getValue: pet => `${Math.floor(pet.magicatt ?? 0)}%` },
]

function getPetSkillName(skill: any): string {
  return skill?.getRealName ? skill.getRealName() : skill?.skillData?.realName ?? skill?.skillData?.name ?? '-'
}

function getPetSkillDescription(skill: any): string {
  if (skill?.getDescription) return skill.getDescription()
  if (skill?.skillData?.desFunction) return skill.skillData.desFunction(skill)
  return getPetSkillName(skill)
}

export function PetInfoPanel() {
  const { state } = useGameContext()
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow()
  const battle = state.battle as any
  const pet = state.player.pet
  const p = battle?.pet || pet
  // Treat battle.pet as the active-combat gate; petHp can be zero for a defeated pet.
  const inBattle = (battle?.pet) != null
  const hp = inBattle ? battle.petHp : (p ? p.hp : 0)
  const mp = inBattle ? battle.petMp : (p ? p.mp : 0)
  const exp = p ? (p.exp ?? 0) : 0
  const expMax = p && typeof p.getLevelExp === 'function' ? p.getLevelExp() : 1

  const handlePetSkillHover = (skill: any, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    showItemInfo(getPetSkillDescription(skill))
  }

  return (
    <div
      data-bwe-battle-pet-panel
      style={{
        background: 'var(--color-bg-dark)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 10px',
        width: 185,
        minHeight: 80,
        fontSize: 12,
        boxSizing: 'border-box',
      }}
    >
      {p ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div data-bwe-battle-pet-summary>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', marginBottom: 3 }}>
              <div style={{ minWidth: 0, fontSize: 14, fontWeight: 'bold', color: 'var(--color-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name || p.realName}
                <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--color-text-dim)' }}>Lv.{p.level}</span>
              </div>
              <div style={{ flexShrink: 0, color: 'var(--color-text-dim)', fontSize: 11 }}>
                {p.getTypeLabel ? p.getTypeLabel() : p.type}
              </div>
            </div>
            <Bar value={hp} max={p.hp} color='var(--color-hp)' label={`HP ${Math.floor(hp)}/${p.hp}`} height={8} />
            <div style={{ marginBottom: 2 }} />
            <Bar value={mp} max={p.mp} color='var(--color-mp)' label={`MP ${Math.floor(mp)}/${p.mp}`} height={8} />
            <div style={{ marginBottom: 2 }} />
            <Bar value={exp} max={expMax} color='var(--color-exp)' label={`Exp ${Math.floor(exp)}/${expMax}`} height={8} />
          </div>

          <div
            data-bwe-battle-pet-stat-grid
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '4px 8px',
              paddingTop: 2,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {PET_STATS.map(stat => (
              <div key={stat.label} style={{ minWidth: 0 }}>
                <span style={{ color: 'var(--color-text-dim)', marginRight: 4 }}>{stat.label}</span>
                <span title={stat.getValue(p)} style={{ color: 'var(--color-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {stat.getValue(p)}
                </span>
              </div>
            ))}
          </div>

          <div
            data-bwe-battle-pet-skill-list
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
              minHeight: 24,
              alignItems: 'center',
            }}
          >
            {p.skillList?.length ? p.skillList.map((skill: any, index: number) => (
              <button
                key={`${skill.skillData?.name ?? 'pet-skill'}-${index}`}
                data-bwe-battle-pet-skill
                onMouseEnter={event => handlePetSkillHover(skill, event)}
                onMouseMove={event => handlePetSkillHover(skill, event)}
                onMouseLeave={hideItemInfo}
                title={getPetSkillName(skill)}
                style={{
                  height: 23,
                  minWidth: 34,
                  maxWidth: 76,
                  padding: '0 6px',
                  border: '1px solid rgba(205, 175, 95, 0.65)',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--color-text-bright)',
                  cursor: 'help',
                  fontSize: 11,
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getPetSkillName(skill)}
              </button>
            )) : (
              <span style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>暂无宠物技能</span>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            color: 'var(--color-text-dim)',
            fontSize: 11,
            textAlign: 'center',
            paddingTop: 20,
          }}
        >
          无宠物
        </div>
      )}
    </div>
  )
}

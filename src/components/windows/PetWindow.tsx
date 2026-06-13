// Pet management window.
// AS3 original: PetWindow / iPet.PetCell / PetInfoWindow / PetSkillCell.

import { useMemo, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useGameContext } from '../../state/GameContext'
import { ScrollPanel } from '../common/ScrollPanel'
import { useInfoWindow } from '../common/InfoWindow'
import { SpriteImage } from '../shared/SpriteImage'
import { getPetSelectionKey, resolveSelectedPet } from './petWindowSelection'

const PET_STATS: Array<{ label: string; getValue: (pet: any) => string }> = [
  { label: 'Hp', getValue: pet => String(Math.floor(pet.hp ?? 0)) },
  { label: 'Mp', getValue: pet => String(Math.floor(pet.mp ?? 0)) },
  { label: '攻击', getValue: pet => `${Math.floor(pet.attmin ?? 0)}~${Math.floor(pet.attmax ?? 0)}` },
  { label: '平衡', getValue: pet => String(Math.floor(pet.balance ?? 0)) },
  { label: '暴击率', getValue: pet => `${Math.floor(pet.cri ?? 0)}%` },
  { label: '暴击倍数', getValue: pet => `${Math.floor(pet.crimul ?? 0)}%` },
  { label: '防御', getValue: pet => String(Math.floor(pet.defence ?? 0)) },
  { label: '护甲', getValue: pet => String(Math.floor(pet.pro ?? 0)) },
  { label: '魔法攻击', getValue: pet => `${Math.floor(pet.magicatt ?? 0)}%` },
]

function getPetName(pet: any): string {
  return pet?.realName ?? pet?.name ?? '-'
}

function getPetDescription(pet: any): string {
  if (!pet) return ''
  return pet.getDescription ? pet.getDescription() : `<p align='center'>${getPetName(pet)} Lv.${pet.level ?? 1}</p>`
}

function getPetSkillName(skill: any): string {
  return skill?.getRealName ? skill.getRealName() : skill?.skillData?.realName ?? skill?.skillData?.name ?? '-'
}

function getPetSkillDescription(skill: any): string {
  if (skill?.getDescription) return skill.getDescription()
  const name = getPetSkillName(skill)
  const detail = skill?.skillData?.desFunction ? skill.skillData.desFunction(skill) : ''
  return `<p align='center'>${name}</p>${detail}`
}

function getPetSpriteName(pet: any): string {
  const rawName = String(pet?.mc_name ?? pet?.mc ?? '').trim()
  if (!rawName) return 'mc_mode'
  return rawName.startsWith('pet_') ? rawName : `pet_${rawName}`
}

function getPetSkillSpriteName(skill: any): string {
  const rawName = String(skill?.skillData?.name ?? '').trim().toLowerCase()
  return `pSkill_${rawName.replace(/\s+/g, '_')}`
}

export function PetWindow() {
  const { state, dispatch } = useGameContext()
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow()
  const { petList } = state.player
  const [selectedPetKey, setSelectedPetKey] = useState<string | null>(() => getPetSelectionKey(petList[0] ?? state.player.pet))

  const visibleSelectedPet = useMemo(() => {
    return resolveSelectedPet(petList, state.player.pet, selectedPetKey)
  }, [petList, selectedPetKey, state.player.pet])
  const visibleSelectedPetKey = getPetSelectionKey(visibleSelectedPet)
  const activePetKey = getPetSelectionKey(state.player.pet)
  const visibleSelectedPetEquipped = Boolean(activePetKey && activePetKey === visibleSelectedPetKey)

  const handlePetHover = (pet: any, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    showItemInfo(getPetDescription(pet))
  }

  const handlePetSkillHover = (skill: any, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    showItemInfo(getPetSkillDescription(skill))
  }

  const handleSetPet = (pet: any, event: ReactMouseEvent) => {
    event.stopPropagation()
    hideItemInfo()
    setSelectedPetKey(getPetSelectionKey(pet))
    dispatch({ type: 'PET_SET', pet })
  }

  const handleRemovePet = (pet: any, event: ReactMouseEvent) => {
    event.stopPropagation()
    hideItemInfo()
    const removedPetKey = getPetSelectionKey(pet)
    dispatch({ type: 'PET_REMOVE', pet })
    if (removedPetKey && removedPetKey === selectedPetKey) {
      setSelectedPetKey(null)
    }
  }

  const handleSelectPet = (pet: any) => {
    setSelectedPetKey(getPetSelectionKey(pet))
  }

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ color: 'var(--color-text)' }}>宠物 ({petList.length}/{state.player.PETMAX})</b>
        <button
          onClick={() => { hideItemInfo(); dispatch({ type: 'UI_CLOSE_WINDOW' }) }}
          style={{ color: 'var(--color-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          x
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 8, flex: 1, minHeight: 0 }}>
        <ScrollPanel height={302} style={{ minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 10 }}>
            {petList.length === 0 ? (
              <div style={{ color: 'var(--color-text-dim)', padding: 18, textAlign: 'center', fontSize: 12 }}>
                暂无宠物
              </div>
            ) : petList.map((pet: any, i: number) => (
              <PetCell
                key={getPetSelectionKey(pet) ?? `${getPetName(pet)}-${i}`}
                pet={pet}
                selected={getPetSelectionKey(pet) === visibleSelectedPetKey}
                onSelect={handleSelectPet}
                onHover={handlePetHover}
                onLeave={hideItemInfo}
                onSetPet={handleSetPet}
                onRemovePet={handleRemovePet}
              />
            ))}
          </div>
        </ScrollPanel>

        <PetDetailPanel
          pet={visibleSelectedPet}
          equipped={visibleSelectedPetEquipped}
          onSkillHover={handlePetSkillHover}
          onLeave={hideItemInfo}
          onSetPet={handleSetPet}
        />
      </div>
    </div>
  )
}

interface PetCellProps {
  pet: any
  selected: boolean
  onSelect: (pet: any) => void
  onHover: (pet: any, event: ReactMouseEvent) => void
  onLeave: () => void
  onSetPet: (pet: any, event: ReactMouseEvent) => void
  onRemovePet: (pet: any, event: ReactMouseEvent) => void
}

function PetCell({ pet, selected, onSelect, onHover, onLeave, onSetPet, onRemovePet }: PetCellProps) {
  const petSpriteName = getPetSpriteName(pet)
  const cellStyle: CSSProperties = {
    minHeight: 50,
    border: selected ? '1px solid var(--color-yellow)' : '1px solid rgba(205, 175, 95, 0.58)',
    borderRadius: 4,
    background: selected ? 'rgba(210, 154, 20, 0.22)' : 'rgba(255,255,255,0.05)',
    color: 'var(--color-text)',
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 8,
    padding: '6px 7px',
    cursor: 'pointer',
  }

  return (
    <div
      onClick={() => onSelect(pet)}
      onMouseEnter={event => onHover(pet, event)}
      onMouseMove={event => onHover(pet, event)}
      onMouseLeave={onLeave}
      style={cellStyle}
    >
      <div style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: '1px solid rgba(205, 175, 95, 0.58)',
        background: 'rgba(20, 18, 32, 0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-yellow)',
        fontSize: 11,
        fontWeight: 800,
        overflow: 'hidden',
      }} data-bwe-pet-icon={petSpriteName}>
        <SpriteImage name={petSpriteName} autoPlay={false} style={petIconImageStyle} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getPetName(pet)}
        </div>
        <div style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>
          Lv.{pet.level ?? 1}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={event => onSetPet(pet, event)} style={cellButtonStyle('var(--color-green)')}>出战</button>
        <button onClick={event => onRemovePet(pet, event)} style={cellButtonStyle('var(--color-red)')}>删除</button>
      </div>
    </div>
  )
}

function cellButtonStyle(color: string): CSSProperties {
  return {
    border: `1px solid ${color}`,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.04)',
    color,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 5px',
    minWidth: 34,
  }
}

interface PetDetailPanelProps {
  pet: any
  equipped: boolean
  onSkillHover: (skill: any, event: ReactMouseEvent) => void
  onLeave: () => void
  onSetPet: (pet: any, event: ReactMouseEvent) => void
}

function PetDetailPanel({ pet, equipped, onSkillHover, onLeave, onSetPet }: PetDetailPanelProps) {
  if (!pet) {
    return (
      <section style={detailPanelStyle}>
        <div style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>暂无宠物</div>
      </section>
    )
  }

  return (
    <section style={detailPanelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--color-text-bright)', fontSize: 15, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getPetName(pet)} Lv.{pet.level ?? 1}
          </div>
          <div style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>{pet.getTypeLabel ? pet.getTypeLabel() : pet.type}</div>
        </div>
        {equipped && (
          <button
            onClick={(event) => onSetPet(pet, event)}
            style={{
              border: '1px solid var(--color-red)',
              borderRadius: 4,
              background: 'rgba(255,64,64,0.12)',
              color: 'var(--color-red)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 6px',
            }}
          >
            取消出战
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '5px 10px', fontSize: 11 }}>
        {PET_STATS.map(stat => (
          <div key={stat.label} style={{ display: 'grid', gridTemplateColumns: '54px minmax(0, 1fr)', gap: 4 }}>
            <span style={{ color: 'var(--color-text-dim)' }}>{stat.label}</span>
            <span style={{ color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.getValue(pet)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, minHeight: 34, alignItems: 'center', flexWrap: 'wrap' }}>
        {pet.skillList?.length ? pet.skillList.map((skill: any, index: number) => {
          const skillSpriteName = getPetSkillSpriteName(skill)
          return (
            <button
            key={`${skill.skillData?.name ?? 'pet-skill'}-${index}`}
            onMouseEnter={event => onSkillHover(skill, event)}
            onMouseMove={event => onSkillHover(skill, event)}
            onMouseLeave={onLeave}
            title={getPetSkillName(skill)}
            data-bwe-pet-skill-icon={skillSpriteName}
            style={{
              width: 34,
              height: 30,
              border: skill.level ? '1px solid var(--color-red)' : '1px solid rgba(205, 175, 95, 0.58)',
              borderRadius: 4,
              background: skill.level ? 'rgba(255,64,64,0.12)' : 'rgba(255,255,255,0.08)',
              color: 'var(--color-text-bright)',
              cursor: 'help',
              fontSize: 10,
              fontWeight: 800,
              boxShadow: skill.level ? '0 0 8px rgba(255,64,64,0.28)' : 'none',
              overflow: 'hidden',
              padding: 0,
            }}
          >
              <SpriteImage name={skillSpriteName} autoPlay={false} style={petSkillIconImageStyle} />
            </button>
          )
        }) : <span style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>暂无宠物技能</span>}
      </div>
    </section>
  )
}

const detailPanelStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-panel)',
  padding: 10,
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const petIconImageStyle: CSSProperties = {
  width: 30,
  height: 30,
  objectFit: 'contain',
  display: 'block',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
}

const petSkillIconImageStyle: CSSProperties = {
  width: 28,
  height: 28,
  objectFit: 'contain',
  display: 'block',
  margin: '0 auto',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
}

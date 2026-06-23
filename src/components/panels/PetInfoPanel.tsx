// Active battle pet panel.
// AS3 kept this as a compact HP/Exp card. The full active-pet stat and skill
// detail belongs to EquipWindow.setPetInfo; this panel stays battle-readable.

import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useGameContext } from '../../state/GameContext'
import { useInfoWindow } from '../common/InfoWindow'
import { SpriteImage } from '../shared/SpriteImage'

const PET_INFO_PANEL_WIDTH = 170
const PET_INFO_PANEL_MIN_HEIGHT = 112
const PET_INFO_PANEL_BASE_FONT_SIZE = 13
const PET_INFO_PANEL_NAME_FONT_SIZE = 16
const PET_INFO_PANEL_META_FONT_SIZE = 12
const PET_INFO_PANEL_SKILL_SIZE = 34
const PET_INFO_PANEL_SKILL_ICON_SIZE = 32

function getPetSkillName(skill: any): string {
  return skill?.getRealName ? skill.getRealName() : skill?.skillData?.realName ?? skill?.skillData?.name ?? '-'
}

function getPetSkillDescription(skill: any): string {
  if (skill?.getDescription) return skill.getDescription()
  if (skill?.skillData?.desFunction) return skill.skillData.desFunction(skill)
  return getPetSkillName(skill)
}

function getPetDisplayName(pet: any): string {
  return pet?.realName ?? pet?.name ?? '-'
}

function getPetSkillSpriteName(skill: any): string {
  const rawName = String(skill?.skillData?.name ?? '').trim().toLowerCase()
  return `pSkill_${rawName.replace(/\s+/g, '_')}`
}

export function PetInfoPanel() {
  const { state } = useGameContext()
  const { showItemInfo, hideItemInfo, showStringInfo, hideStringInfo, updateMouse } = useInfoWindow()
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
        padding: '8px 12px',
        width: PET_INFO_PANEL_WIDTH,
        minHeight: PET_INFO_PANEL_MIN_HEIGHT,
        fontSize: PET_INFO_PANEL_BASE_FONT_SIZE,
        boxSizing: 'border-box',
      }}
    >
      {p ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div data-bwe-battle-pet-summary>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', marginBottom: 3 }}>
              <div style={{ minWidth: 0, fontSize: PET_INFO_PANEL_NAME_FONT_SIZE, fontWeight: 'bold', color: 'var(--color-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getPetDisplayName(p)}
                <span style={{ marginLeft: 4, fontSize: PET_INFO_PANEL_META_FONT_SIZE, color: 'var(--color-text-dim)' }}>Lv.{p.level}</span>
              </div>
              <div style={{ flexShrink: 0, color: 'var(--color-text-dim)', fontSize: PET_INFO_PANEL_META_FONT_SIZE }}>
                {p.getTypeLabel ? p.getTypeLabel() : p.type}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <PetBarRow
                label="HP"
                value={hp}
                max={p.hp}
                color="var(--color-hp)"
                onHoverValue={(value, max, event) => {
                  updateMouse(event.clientX, event.clientY)
                  showStringInfo(`${Math.floor(value)}/${Math.floor(max)}`)
                }}
                onMove={event => updateMouse(event.clientX, event.clientY)}
                onLeave={hideStringInfo}
              />
              <PetBarRow
                label="MP"
                value={mp}
                max={p.mp}
                color="var(--color-mp)"
                onHoverValue={(value, max, event) => {
                  updateMouse(event.clientX, event.clientY)
                  showStringInfo(`${Math.floor(value)}/${Math.floor(max)}`)
                }}
                onMove={event => updateMouse(event.clientX, event.clientY)}
                onLeave={hideStringInfo}
              />
              <PetBarRow
                label="EXP"
                value={exp}
                max={expMax}
                color="var(--color-exp)"
                onHoverValue={(value, max, event) => {
                  updateMouse(event.clientX, event.clientY)
                  showStringInfo(`${Math.floor(value)}/${Math.floor(max)}`)
                }}
                onMove={event => updateMouse(event.clientX, event.clientY)}
                onLeave={hideStringInfo}
              />
            </div>
          </div>

          <div
            data-bwe-battle-pet-skill-list
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
              minHeight: 28,
              alignItems: 'center',
              paddingTop: 2,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {p.skillList?.length ? p.skillList.map((skill: any, index: number) => {
              const skillSpriteName = getPetSkillSpriteName(skill)
              return (
                <button
                  key={`${skill.skillData?.name ?? 'pet-skill'}-${index}`}
                  data-bwe-battle-pet-skill
                  data-bwe-battle-pet-skill-icon={skillSpriteName}
                  onMouseEnter={event => handlePetSkillHover(skill, event)}
                  onMouseMove={event => handlePetSkillHover(skill, event)}
                  onMouseLeave={hideItemInfo}
                  title={getPetSkillName(skill)}
                  style={{
                    width: PET_INFO_PANEL_SKILL_SIZE,
                    height: PET_INFO_PANEL_SKILL_SIZE,
                    padding: 0,
                    border: skill.level ? '1px solid var(--color-red)' : '1px solid rgba(205, 175, 95, 0.65)',
                    borderRadius: 4,
                    background: skill.level ? 'rgba(255,64,64,0.12)' : 'rgba(255,255,255,0.08)',
                    color: 'var(--color-text-bright)',
                    cursor: 'help',
                    boxShadow: skill.level ? '0 0 8px rgba(255,64,64,0.28)' : undefined,
                    overflow: 'hidden',
                  }}
                >
                  <SpriteImage name={skillSpriteName} autoPlay={false} style={petSkillIconImageStyle} />
                </button>
              )
            }) : (
              <span style={{ color: 'var(--color-text-dim)', fontSize: PET_INFO_PANEL_META_FONT_SIZE }}>暂无宠物技能</span>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            color: 'var(--color-text-dim)',
            fontSize: PET_INFO_PANEL_META_FONT_SIZE,
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

function PetBarRow({
  label,
  value,
  max,
  color,
  onHoverValue,
  onMove,
  onLeave,
}: {
  label: string
  value: number
  max: number
  color: string
  onHoverValue: (value: number, max: number, event: ReactMouseEvent) => void
  onMove: (event: ReactMouseEvent) => void
  onLeave: () => void
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div
      data-bwe-battle-pet-bar={label}
      style={petBarRowStyle}
      onMouseEnter={event => onHoverValue(value, max, event)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span style={petBarLabelStyle}>{label}</span>
      <span style={petBarTrackStyle}>
        <span
          style={{
            width: `${pct}%`,
            height: '100%',
            display: 'block',
            background: color,
            borderRadius: 'var(--radius-sm)',
            transition: 'width 0.3s',
          }}
        />
      </span>
    </div>
  )
}

const petBarRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr)',
  alignItems: 'center',
  gap: 6,
  cursor: 'help',
}

const petBarLabelStyle: CSSProperties = {
  color: 'var(--color-text-dim)',
  fontSize: 11,
  lineHeight: '12px',
  fontWeight: 700,
}

const petBarTrackStyle: CSSProperties = {
  width: '100%',
  height: 8,
  background: 'var(--color-bar-track)',
  borderRadius: 'var(--radius-sm)',
  overflow: 'hidden',
}

const petSkillIconImageStyle: CSSProperties = {
  width: PET_INFO_PANEL_SKILL_ICON_SIZE,
  height: PET_INFO_PANEL_SKILL_ICON_SIZE,
  objectFit: 'contain',
  display: 'block',
  margin: '0 auto',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
}

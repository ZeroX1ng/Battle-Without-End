// Equipment window.
// AS3 original: iPanel.iScene.iPanel.iWindow.EquipWindow / iEquip.EquipCell.

import { useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { getEquipmentSpriteName } from '../common/Common'
import { useInfoWindow } from '../common/InfoWindow'
import { SpriteImage } from '../shared/SpriteImage'
import { useGameContext } from '../../state/GameContext'
type EquipSlotKey = 'head' | 'feet' | 'body' | 'necklace' | 'ring' | 'leftHand' | 'rightHand'

interface EquipSlotConfig {
  slot: EquipSlotKey
  label: string
}

const EQUIP_SLOTS: EquipSlotConfig[] = [
  { slot: 'head', label: '头部' },
  { slot: 'feet', label: '脚部' },
  { slot: 'body', label: '身体' },
  { slot: 'necklace', label: '项链' },
  { slot: 'ring', label: '戒指' },
  { slot: 'leftHand', label: '主手' },
  { slot: 'rightHand', label: '副手' },
]

const AS3_SKELETON_SCALE = 0.4
const AS3_SKELETON_Y = 100
const AS3_EQUIP_CELL_SIZE = 100
const EQUIP_SLOT_SIZE = AS3_EQUIP_CELL_SIZE * AS3_SKELETON_SCALE + 8
const EQUIP_SLOT_SOURCE_SIZE = EQUIP_SLOT_SIZE / AS3_SKELETON_SCALE
const EQUIP_SLOT_ICON_FRAME_SOURCE_SIZE = 40 / AS3_SKELETON_SCALE
const EQUIP_SLOT_ICON_IMAGE_SOURCE_SIZE = 48 / AS3_SKELETON_SCALE
const EQUIP_FIGURE_WIDTH = 224
const EQUIP_FIGURE_HEIGHT = 342

const AS3_SLOT_POSITIONS: Record<EquipSlotKey, { x: number; y: number }> = {
  head: { x: 210, y: -50 },
  feet: { x: 210, y: 480 },
  body: { x: 390, y: 300 },
  necklace: { x: 380, y: 100 },
  ring: { x: 10, y: 120 },
  leftHand: { x: 5, y: 230 },
  rightHand: { x: 415, y: 220 },
}

const SLOT_RECT_SEPARATION_OFFSETS: Partial<Record<EquipSlotKey, { x: number; y: number }>> = {
  body: { x: 0, y: 18 },
  leftHand: { x: 0, y: 6 },
}

const EQUIP_GUIDE_PLANE_WIDTH = 560
const EQUIP_GUIDE_ANCHORS: Record<EquipSlotKey, { x: number; y: number }> = {
  head: { x: 270, y: 62 },
  feet: { x: 266, y: 460 },
  body: { x: 286, y: 292 },
  necklace: { x: 278, y: 168 },
  ring: { x: 166, y: 230 },
  leftHand: { x: 152, y: 327 },
  rightHand: { x: 335, y: 278 },
}

const PET_STATS: Array<{ label: string; getValue: (pet: any) => string }> = [
  { label: '宠物', getValue: pet => pet?.realName ?? pet?.name ?? '-' },
  { label: 'Hp', getValue: pet => String(Math.floor(pet.hp ?? 0)) },
  { label: 'Mp', getValue: pet => String(Math.floor(pet.mp ?? 0)) },
  { label: '攻击', getValue: pet => `${Math.floor(pet.attmin ?? 0)}~${Math.floor(pet.attmax ?? 0)}` },
  { label: '平衡', getValue: pet => String(Math.floor(pet.balance ?? 0)) },
  { label: '暴击', getValue: pet => String(Math.floor(pet.cri ?? 0)) },
  { label: '暴倍', getValue: pet => `${Math.floor(pet.crimul ?? 0)}%` },
  { label: '防御', getValue: pet => String(Math.floor(pet.defence ?? 0)) },
  { label: '护甲', getValue: pet => String(Math.floor(pet.pro ?? 0)) },
  { label: '魔攻', getValue: pet => `${Math.floor(pet.magicatt ?? 0)}%` },
]

function slotIconFrameStyle(active: boolean, glow: string): CSSProperties {
  return {
    width: EQUIP_SLOT_ICON_FRAME_SOURCE_SIZE,
    height: EQUIP_SLOT_ICON_FRAME_SOURCE_SIZE,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.88)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: active ? '0 0 13px rgba(77,60,35,0.66)' : glow === 'none' ? undefined : glow,
  }
}

const slotIconImageStyle: CSSProperties = {
  width: EQUIP_SLOT_ICON_IMAGE_SOURCE_SIZE,
  height: EQUIP_SLOT_ICON_IMAGE_SOURCE_SIZE,
  objectFit: 'contain',
  display: 'block',
  pointerEvents: 'none',
}

const petSkillIconImageStyle: CSSProperties = {
  width: 30,
  height: 30,
  objectFit: 'contain',
  display: 'block',
  margin: '0 auto',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
}

function getSlotSourcePosition(slot: EquipSlotKey): { x: number; y: number } {
  const position = AS3_SLOT_POSITIONS[slot]
  const offset = SLOT_RECT_SEPARATION_OFFSETS[slot] ?? { x: 0, y: 0 }
  return {
    x: position.x + offset.x / AS3_SKELETON_SCALE,
    y: position.y + offset.y / AS3_SKELETON_SCALE,
  }
}

function getSlotSourcePositionStyle(slot: EquipSlotKey): CSSProperties {
  const position = getSlotSourcePosition(slot)
  return {
    left: position.x,
    top: position.y,
  }
}

function getSlotCenterSourcePosition(slot: EquipSlotKey): { x: number; y: number } {
  const position = getSlotSourcePosition(slot)
  return {
    x: position.x + EQUIP_SLOT_SOURCE_SIZE / 2,
    y: position.y + EQUIP_SLOT_SOURCE_SIZE / 2,
  }
}

function getSlotGuideLine(slot: EquipSlotKey): { from: { x: number; y: number }; to: { x: number; y: number } } {
  return {
    from: EQUIP_GUIDE_ANCHORS[slot],
    to: getSlotCenterSourcePosition(slot),
  }
}

function getItemName(equip: any): string {
  return equip?.getNameHTML ? equip.getNameHTML() : equip?.realName ?? ''
}

function getItemDescription(equip: any): string {
  return equip?.getDescription ? equip.getDescription() : getItemName(equip)
}

function getPetSkillName(skill: any): string {
  return skill?.getRealName ? skill.getRealName() : skill?.skillData?.realName ?? skill?.skillData?.name ?? '-'
}

function getPetSkillDescription(skill: any): string {
  if (skill?.getDescription) return skill.getDescription()
  if (skill?.skillData?.desFunction) return skill.skillData.desFunction(skill)
  return getPetSkillName(skill)
}

function getPetSkillSpriteName(skill: any): string {
  const rawName = String(skill?.skillData?.name ?? '').trim().toLowerCase()
  return `pSkill_${rawName.replace(/\s+/g, '_')}`
}

export function EquipWindow() {
  const { state, dispatch } = useGameContext()
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow()
  const player = state.player
  const [selectedSlot, setSelectedSlot] = useState<EquipSlotKey>('leftHand')

  const activePet = player.pet

  const handleHover = (equip: any, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    if (equip) showItemInfo(getItemDescription(equip))
  }

  const handlePetSkillHover = (skill: any, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    showItemInfo(getPetSkillDescription(skill))
  }

  const handleUnequip = (slot: EquipSlotKey) => {
    const equip = player[slot]
    if (!equip) return
    dispatch({ type: 'UNEQUIP_ITEM', slot })
    hideItemInfo()
  }

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ color: 'var(--color-text)' }}>装备栏</b>
      </div>

      <div
        data-bwe-equip-scroll-region
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: 2,
        }}
      >
        <div data-bwe-equip-content-column style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
            <div data-bwe-equip-figure-panel style={{
              position: 'relative',
              minHeight: EQUIP_FIGURE_HEIGHT,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: EQUIP_FIGURE_WIDTH,
                height: EQUIP_FIGURE_HEIGHT,
                transform: 'translateX(-50%)',
              }}>
                <div
                  data-bwe-equip-coordinate-plane
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: AS3_SKELETON_Y,
                    width: 449,
                    height: 605,
                    transform: `scale(${AS3_SKELETON_SCALE})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <div
                    data-bwe-equip-skeleton-layer="people_use1"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 449,
                      height: 453,
                      pointerEvents: 'none',
                    }}
                  >
                    <SpriteImage
                      name="people_use1"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div
                    data-bwe-equip-skeleton-layer="people_use2"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 350,
                      height: 605,
                      pointerEvents: 'none',
                    }}
                  >
                    <SpriteImage
                      name="people_use2"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  </div>

                  <svg
                    data-bwe-equip-guide-lines
                    width={EQUIP_GUIDE_PLANE_WIDTH}
                    height={605}
                    viewBox={`0 0 ${EQUIP_GUIDE_PLANE_WIDTH} 605`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      overflow: 'visible',
                      pointerEvents: 'none',
                    }}
                  >
                    {EQUIP_SLOTS.map(({ slot }) => {
                      const guideLine = getSlotGuideLine(slot)
                      const active = selectedSlot === slot
                      return (
                        <g key={slot} opacity={active ? 0.9 : 0.48}>
                          <line
                            data-bwe-equip-guide-line={slot}
                            x1={guideLine.from.x}
                            y1={guideLine.from.y}
                            x2={guideLine.to.x}
                            y2={guideLine.to.y}
                            stroke={active ? '#ffd24a' : 'rgba(205, 175, 95, 0.75)'}
                            strokeWidth={active ? 3 : 2}
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                          />
                          <circle
                            cx={guideLine.from.x}
                            cy={guideLine.from.y}
                            r={active ? 5 : 4}
                            fill={active ? '#ffd24a' : 'rgba(205, 175, 95, 0.82)'}
                          />
                        </g>
                      )
                    })}
                  </svg>

                  {EQUIP_SLOTS.map(({ slot, label }) => {
              const equip = player[slot]
              const active = selectedSlot === slot
              const glow = equip && equip.level >= 7 ? `0 0 ${equip.level + 3}px rgba(255, 64, 64, 0.7)` : 'none'
              const slotSpriteName = getEquipmentSpriteName(equip)
              return (
                <button
                  key={slot}
                  data-bwe-equip-slot={slot}
                  onClick={() => setSelectedSlot(slot)}
                  onDoubleClick={() => handleUnequip(slot)}
                  onMouseEnter={event => handleHover(equip, event)}
                  onMouseMove={event => handleHover(equip, event)}
                  onMouseLeave={hideItemInfo}
                  title={equip ? `${label}: 双击卸下` : `${label}: 空`}
                  style={{
                    position: 'absolute',
                    ...getSlotSourcePositionStyle(slot),
                    width: EQUIP_SLOT_SOURCE_SIZE,
                    height: EQUIP_SLOT_SOURCE_SIZE,
                    borderRadius: '50%',
                    border: active ? '2px solid var(--color-yellow)' : '1px solid rgba(205, 175, 95, 0.58)',
                    background: equip ? 'rgba(20, 18, 32, 0.96)' : 'rgba(255,255,255,0.035)',
                    cursor: 'pointer',
                    boxShadow: active ? `0 0 0 2px rgba(255, 215, 0, 0.12), ${glow}` : glow,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: 4,
                  }}
                >
                  <span style={slotIconFrameStyle(active, glow)} data-bwe-equip-slot-icon={slotSpriteName}>
                    <SpriteImage name={slotSpriteName} autoPlay={false} style={slotIconImageStyle} />
                  </span>
                </button>
              )
                  })}
                </div>
              </div>
          </div>

        </div>

        <div
          data-bwe-equip-detail-panel
          style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-panel)',
          padding: 10,
          minHeight: 190,
          flex: '1 1 190px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {activePet ? (
            <div data-bwe-equip-pet-info style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <div style={{ color: 'var(--color-text)', fontSize: 12, fontWeight: 700 }}>宠物</div>
                <div style={{ minWidth: 0, color: 'var(--color-green)', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activePet.realName ?? activePet.name}
                </div>
              </div>
              <div
                data-bwe-equip-pet-stat-grid
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '4px 10px',
                  fontSize: 12,
                  alignItems: 'start',
                }}
              >
                {PET_STATS.map(stat => (
                  <div key={stat.label} style={{ display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr)', gap: 5, minWidth: 0 }}>
                    <span style={{ color: 'var(--color-text-dim)', whiteSpace: 'nowrap' }}>{stat.label}</span>
                    <span title={stat.getValue(activePet)} style={{ color: 'var(--color-text)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {stat.getValue(activePet)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ color: 'var(--color-text)', fontSize: 12, fontWeight: 700, paddingTop: 2 }}>技能</div>
              <div
                data-bwe-equip-pet-skill-list
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  minHeight: 32,
                  alignItems: 'center',
                }}
              >
                {activePet.skillList?.length ? activePet.skillList.map((skill: any, index: number) => {
                  const skillSpriteName = getPetSkillSpriteName(skill)
                  return (
                    <button
                      key={`${skill.skillData?.name ?? 'pet-skill'}-${index}`}
                      data-bwe-equip-pet-skill
                      data-bwe-equip-pet-skill-icon={skillSpriteName}
                      onMouseEnter={event => handlePetSkillHover(skill, event)}
                      onMouseMove={event => handlePetSkillHover(skill, event)}
                      onMouseLeave={hideItemInfo}
                      title={getPetSkillName(skill)}
                      style={{
                        width: 32,
                        height: 32,
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
                  <span style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>暂无宠物技能</span>
                )}
              </div>
            </div>
          ) : (
            <div data-bwe-equip-pet-empty style={{ color: 'var(--color-text-dim)', fontSize: 12, lineHeight: 1.5 }}>
              当前没有出战宠物。装备宠物后，这里会显示 AS3 装备窗口中的宠物属性和技能。
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

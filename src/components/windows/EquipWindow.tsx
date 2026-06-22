// Equipment window.
// AS3 original: iPanel.iScene.iPanel.iWindow.EquipWindow / iEquip.EquipCell.

import { useMemo, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { getEquipmentSpriteName } from '../common/Common'
import { useInfoWindow } from '../common/InfoWindow'
import { SpriteImage } from '../shared/SpriteImage'
import { statTranslate } from '../../core/constants'
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

const STAT_ORDER = [
  'attackMin', 'attackMax', 'ATTACK', 'hp', 'mp', 'str', 'dex', 'intelligence', 'will', 'luck',
  'balance', 'crit', 'crit_mul', 'defence', 'protection', 'spellChance',
  'protectionIgnore', 'protectionReduce', 'magicDamage',
]

function getSlotComparison(equip: any): Array<{ name: string; value: number }> {
  const totals = new Map<string, number>()
  for (const stat of [...(equip?.basicStat ?? []), ...(equip?.qualityStat ?? []), ...(equip?.levelStat ?? [])]) {
    totals.set(stat.name, (totals.get(stat.name) ?? 0) + stat.value)
  }
  return STAT_ORDER
    .filter(name => totals.has(name))
    .map(name => ({ name, value: totals.get(name) ?? 0 }))
}

function formatValue(value: number): string {
  const delta = -value
  const rounded = Math.abs(delta) >= 10 ? Math.floor(Math.abs(delta)) : Math.round(Math.abs(delta) * 10) / 10
  if (rounded === 0) return '0'
  return delta > 0 ? `+${rounded}` : `-${rounded}`
}

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

function getSlotSourcePositionStyle(slot: EquipSlotKey): CSSProperties {
  const position = AS3_SLOT_POSITIONS[slot]
  const offset = SLOT_RECT_SEPARATION_OFFSETS[slot] ?? { x: 0, y: 0 }
  return {
    left: position.x + offset.x / AS3_SKELETON_SCALE,
    top: position.y + offset.y / AS3_SKELETON_SCALE,
  }
}

function getItemName(equip: any): string {
  return equip?.getNameHTML ? equip.getNameHTML() : equip?.realName ?? ''
}

function getItemDescription(equip: any): string {
  return equip?.getDescription ? equip.getDescription() : getItemName(equip)
}

export function EquipWindow() {
  const { state, dispatch } = useGameContext()
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow()
  const player = state.player
  const [selectedSlot, setSelectedSlot] = useState<EquipSlotKey>('leftHand')

  const selectedEquip = player[selectedSlot]
  const selectedConfig = EQUIP_SLOTS.find(s => s.slot === selectedSlot) ?? EQUIP_SLOTS[0]
  const comparison = useMemo(() => getSlotComparison(selectedEquip), [selectedEquip])

  const handleHover = (equip: any, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    if (equip) showItemInfo(getItemDescription(equip))
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
          <div style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>{selectedConfig.label}</div>
          {selectedEquip ? (
            <>
              <div style={{ color: 'var(--color-text-bright)', fontSize: 13, fontWeight: 700, lineHeight: 1.35 }}
                dangerouslySetInnerHTML={{ __html: getItemName(selectedEquip) }}
              />
              <div style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>
                {selectedEquip.getPositionLabel?.() ?? selectedConfig.label} / {selectedEquip.getTypeLabel?.() ?? selectedEquip.type}
              </div>
              <button
                onClick={() => handleUnequip(selectedSlot)}
                disabled={player.itemList.length >= player.BAGMAX}
                style={{
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 8px',
                  background: player.itemList.length >= player.BAGMAX ? 'var(--color-bg-dark)' : 'var(--color-red)',
                  color: '#fff',
                  cursor: player.itemList.length >= player.BAGMAX ? 'not-allowed' : 'pointer',
                  opacity: player.itemList.length >= player.BAGMAX ? 0.55 : 1,
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                卸下
              </button>
              {player.itemList.length >= player.BAGMAX && (
                <div style={{ color: 'var(--color-red)', fontSize: 11 }}>背包已满，无法卸下</div>
              )}
              <div style={{ color: 'var(--color-text)', fontSize: 12, fontWeight: 700 }}>卸下后的属性变化</div>
              <div
                data-bwe-equip-stat-grid
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))',
                  gap: '4px 10px',
                  fontSize: 11,
                  alignItems: 'start',
                }}
              >
                {comparison.length === 0 ? (
                  <span style={{ color: 'var(--color-text-dim)', gridColumn: '1 / -1' }}>这件装备没有属性加成</span>
                ) : comparison.map(stat => (
                  <div key={stat.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 6, minWidth: 0 }}>
                    <span style={{ color: 'var(--color-text-dim)' }}>{statTranslate(stat.name)}</span>
                    <span style={{ color: stat.value > 0 ? 'var(--color-red)' : 'var(--color-green)', textAlign: 'right' }}>{formatValue(stat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--color-text-dim)', fontSize: 12, lineHeight: 1.5 }}>
              这个位置还没有装备。可以在背包中选择合适的装备穿戴。
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

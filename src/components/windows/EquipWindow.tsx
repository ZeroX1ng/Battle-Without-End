// Equipment window.
// AS3 original: iPanel.iScene.iPanel.iWindow.EquipWindow / iEquip.EquipCell.

import { useMemo, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useInfoWindow } from '../common/InfoWindow'
import { QualityColor, statTranslate } from '../../core/constants'
import { useGameContext } from '../../state/GameContext'

type EquipSlotKey = 'head' | 'feet' | 'body' | 'necklace' | 'ring' | 'leftHand' | 'rightHand'

interface EquipSlotConfig {
  slot: EquipSlotKey
  label: string
  shortLabel: string
}

const EQUIP_SLOTS: EquipSlotConfig[] = [
  { slot: 'head', label: '头部', shortLabel: '头' },
  { slot: 'feet', label: '脚部', shortLabel: '脚' },
  { slot: 'body', label: '身体', shortLabel: '身' },
  { slot: 'necklace', label: '项链', shortLabel: '链' },
  { slot: 'ring', label: '戒指', shortLabel: '戒' },
  { slot: 'leftHand', label: '主手', shortLabel: '主' },
  { slot: 'rightHand', label: '副手', shortLabel: '副' },
]

const SLOT_POSITIONS: Record<EquipSlotKey, CSSProperties> = {
  head: { left: '50%', top: 10, transform: 'translateX(-50%)' },
  necklace: { right: 16, top: 76 },
  ring: { left: 16, top: 92 },
  leftHand: { left: 10, top: 172 },
  rightHand: { right: 10, top: 164 },
  body: { left: '50%', top: 156, transform: 'translateX(-50%)' },
  feet: { left: '50%', bottom: 14, transform: 'translateX(-50%)' },
}

const STAT_ORDER = [
  'attackMin', 'attackMax', 'ATTACK', 'hp', 'mp', 'str', 'dex', 'intelligence', 'will', 'luck',
  'balance', 'crit', 'crit_mul', 'defence', 'protection', 'spellChance',
  'protectionIgnore', 'protectionReduce', 'magicDamage',
]

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
  if (skill?.skillData?.desFunction) return skill.skillData.desFunction(skill)
  return getPetSkillName(skill)
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
        <button
          onClick={() => { hideItemInfo(); dispatch({ type: 'UI_CLOSE_WINDOW' }) }}
          style={{ color: 'var(--color-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          x
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 1fr) minmax(150px, 0.78fr)', gap: 8, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <div style={{
            position: 'relative',
            minHeight: 330,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 54,
              bottom: 58,
              width: 76,
              transform: 'translateX(-50%)',
              border: '1px solid rgba(205, 175, 95, 0.42)',
              borderRadius: 38,
              background: 'rgba(255,255,255,0.025)',
              boxShadow: 'inset 0 0 28px rgba(205, 175, 95, 0.08)',
            }} />

            {EQUIP_SLOTS.map(({ slot, label, shortLabel }) => {
              const equip = player[slot]
              const active = selectedSlot === slot
              const color = equip ? QualityColor[equip.quality] ?? 'var(--color-text-bright)' : 'var(--color-text-dim)'
              const glow = equip?.level >= 7 ? `0 0 ${equip.level + 3}px rgba(255, 64, 64, 0.7)` : 'none'
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  onDoubleClick={() => handleUnequip(slot)}
                  onMouseEnter={event => handleHover(equip, event)}
                  onMouseMove={event => handleHover(equip, event)}
                  onMouseLeave={hideItemInfo}
                  title={equip ? `${label}: 双击卸下` : `${label}: 空`}
                  style={{
                    position: 'absolute',
                    ...SLOT_POSITIONS[slot],
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: active ? '2px solid var(--color-yellow)' : '1px solid rgba(205, 175, 95, 0.58)',
                    background: equip ? 'rgba(20, 18, 32, 0.96)' : 'rgba(255,255,255,0.035)',
                    color,
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
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{shortLabel}</span>
                  <span style={{ fontSize: 10, color: equip ? color : 'var(--color-text-dim)', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {equip ? equip.type : '空'}
                  </span>
                  {equip?.level > 0 && <span style={{ fontSize: 10, color: '#FFD700' }}>+{equip.level}</span>}
                </button>
              )
            })}
          </div>

          <section style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-panel)',
            padding: 8,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '4px 10px',
            fontSize: 11,
          }}>
            {player.pet ? (
              <>
                {PET_STATS.map(stat => (
                  <div key={stat.label} style={{ display: 'grid', gridTemplateColumns: '38px minmax(0, 1fr)', gap: 4 }}>
                    <span style={{ color: 'var(--color-text-dim)' }}>{stat.label}</span>
                    <span style={{ color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.getValue(player.pet)}</span>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 6, minHeight: 28, paddingTop: 4 }}>
                  {player.pet?.skillList.length ? player.pet?.skillList.map((skill: any, index: number) => (
                    <button
                      key={`${skill.skillData?.name ?? 'pet-skill'}-${index}`}
                      onMouseEnter={event => handlePetSkillHover(skill, event)}
                      onMouseMove={event => handlePetSkillHover(skill, event)}
                      onMouseLeave={hideItemInfo}
                      title={getPetSkillName(skill)}
                      style={{
                        width: 32,
                        height: 26,
                        border: '1px solid rgba(205, 175, 95, 0.58)',
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.08)',
                        color: 'var(--color-text-bright)',
                        cursor: 'help',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {getPetSkillName(skill).slice(0, 2)}
                    </button>
                  )) : <span style={{ color: 'var(--color-text-dim)' }}>暂无宠物技能</span>}
                </div>
              </>
            ) : (
              <div style={{ gridColumn: '1 / -1', color: 'var(--color-text-dim)' }}>尚未装备宠物</div>
            )}
          </section>
        </div>

        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-panel)',
          padding: 10,
          minHeight: 0,
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
                }}
              >
                卸下
              </button>
              {player.itemList.length >= player.BAGMAX && (
                <div style={{ color: 'var(--color-red)', fontSize: 11 }}>背包已满，无法卸下</div>
              )}
              <div style={{ color: 'var(--color-text)', fontSize: 12, fontWeight: 700 }}>卸下后的属性变化</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 8px', fontSize: 11 }}>
                {comparison.length === 0 ? (
                  <span style={{ color: 'var(--color-text-dim)', gridColumn: '1 / -1' }}>这件装备没有属性加成</span>
                ) : comparison.map(stat => (
                  <div key={stat.name} style={{ display: 'contents' }}>
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
  )
}

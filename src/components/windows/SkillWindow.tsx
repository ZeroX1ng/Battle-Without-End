// Skill list window.
// AS3 original: iPanel.iScene.iPanel.iWindow.SkillWindow + iSkill/*Panel/SkillCell.

import { useMemo, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { SkillCategory, SkillType } from '../../core/constants'
import type { Skill } from '../../core/models/Skill'
import { useGameContext } from '../../state/GameContext'
import { ScrollPanel } from '../common/ScrollPanel'
import { useInfoWindow } from '../common/InfoWindow'
import { SpriteImage } from '../shared/SpriteImage'

type SkillTabId = 'combat' | 'magic' | 'passive'

interface SkillTab {
  id: SkillTabId
  label: string
  color: string
  panelName: string
}

const SKILL_TABS: SkillTab[] = [
  { id: 'combat', label: '战斗', color: '#ff4040', panelName: 'CombatInnerPanel' },
  { id: 'magic', label: '魔法', color: '#4a90ff', panelName: 'MagicInnerPanel' },
  { id: 'passive', label: '被动', color: '#ffd24a', panelName: 'PassiveInnerPanel' },
]

const SKILL_PANEL_META: Record<SkillTabId, { as3Panel: string; description: string }> = {
  combat: { as3Panel: 'CombatInnerPanel', description: 'ActiveSkill && category != MAGIC' },
  magic: { as3Panel: 'MagicInnerPanel', description: 'ActiveSkill && category == MAGIC' },
  passive: { as3Panel: 'PassiveInnerPanel', description: 'PassiveSkill' },
}

function isActiveSkill(skill: Skill): boolean {
  return skill.skillData.type === SkillType.ATTACK || skill.skillData.type === SkillType.DEFENCE
}

function isSkillInTab(skill: Skill, tab: SkillTabId): boolean {
  if (tab === 'passive') return skill.skillData.type === SkillType.PASSIVE
  if (!isActiveSkill(skill)) return false
  if (tab === 'magic') return skill.skillData.category === SkillCategory.MAGIC
  return skill.skillData.category !== SkillCategory.MAGIC
}

function getRankLabel(skill: Skill): string {
  return (15 - skill.level).toString(16).toUpperCase()
}

function getNextApCost(skill: Skill): number | null {
  if (skill.level >= 14) return null
  return skill.skillData.lvupCostList[skill.level + 1] ?? null
}

function getSkillDescription(skill: Skill): string {
  return skill.getDescription ? skill.getDescription() : skill.skillData.desFunction?.(skill) ?? skill.skillData.realName ?? skill.skillData.name
}

function getSkillSpriteName(skill: Skill): string {
  return `mc_${skill.skillData.name.toLowerCase().replace(/\s+/g, '_')}`
}

export function SkillWindow() {
  const { state, dispatch } = useGameContext()
  const { showItemInfo, hideItemInfo, updateMouse } = useInfoWindow()
  const [activeTab, setActiveTab] = useState<SkillTabId>('combat')

  const skillGroups = useMemo(() => {
    const groups: Record<SkillTabId, Skill[]> = { combat: [], magic: [], passive: [] }
    for (const skill of state.player.skillList as Skill[]) {
      for (const tab of SKILL_TABS) {
        if (isSkillInTab(skill, tab.id)) {
          groups[tab.id].push(skill)
          break
        }
      }
    }
    return groups
  }, [state.player.skillList])

  const skills = skillGroups[activeTab]

  const handleHover = (skill: Skill, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    showItemInfo(getSkillDescription(skill))
  }

  const handleLevelup = (skill: Skill, event: ReactMouseEvent) => {
    event.stopPropagation()
    if (!skill.canLevelup(state.player.ap)) return
    hideItemInfo()
    dispatch({ type: 'SKILL_LEVELUP', skill })
  }

  const handleToggleEquip = (skill: Skill) => {
    if (!isActiveSkill(skill)) return
    const isEquipped = state.player.equipSkillList.includes(skill)
    dispatch({ type: isEquipped ? 'SKILL_UNEQUIP' : 'SKILL_EQUIP', skill })
  }

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {SKILL_TABS.map(tab => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.panelName}
                style={{
                  width: 63,
                  height: 24,
                  border: active ? `1px solid ${tab.color}` : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: active ? `${tab.color}22` : 'var(--color-bg-dark)',
                  color: active ? tab.color : 'var(--color-text-dim)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--color-yellow)', fontSize: 12, fontWeight: 700 }}>AP {state.player.ap}</span>
          <button
            onClick={() => { hideItemInfo(); dispatch({ type: 'UI_CLOSE_WINDOW' }) }}
            style={{ color: 'var(--color-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            x
          </button>
        </div>
      </div>

      <div
        title={SKILL_PANEL_META[activeTab].description}
        style={{ color: 'var(--color-text-dim)', fontSize: 11, height: 14 }}
      >
        {SKILL_PANEL_META[activeTab].as3Panel}
      </div>

      <ScrollPanel height={286} style={{ flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 10 }}>
          {skills.length === 0 ? (
            <div style={{ color: 'var(--color-text-dim)', padding: 20, textAlign: 'center', fontSize: 12 }}>
              暂无技能
            </div>
          ) : skills.map(skill => (
            <SkillCell
              key={skill.skillData.name}
              skill={skill}
              ap={state.player.ap}
              equipped={state.player.equipSkillList.includes(skill)}
              equippable={isActiveSkill(skill)}
              onHover={handleHover}
              onLeave={hideItemInfo}
              onToggleEquip={handleToggleEquip}
              onLevelup={handleLevelup}
            />
          ))}
        </div>
      </ScrollPanel>
    </div>
  )
}

interface SkillCellProps {
  skill: Skill
  ap: number
  equipped: boolean
  equippable: boolean
  onHover: (skill: Skill, event: ReactMouseEvent) => void
  onLeave: () => void
  onToggleEquip: (skill: Skill) => void
  onLevelup: (skill: Skill, event: ReactMouseEvent) => void
}

function SkillCell({ skill, ap, equipped, equippable, onHover, onLeave, onToggleEquip, onLevelup }: SkillCellProps) {
  const nextCost = getNextApCost(skill)
  const canLevel = skill.canLevelup(ap)
  const rank = getRankLabel(skill)
  const name = skill.skillData.realName ?? skill.skillData.name
  const skillSpriteName = getSkillSpriteName(skill)

  const cellStyle: CSSProperties = {
    height: 50,
    border: '1px solid rgba(205, 175, 95, 0.62)',
    borderRadius: 4,
    background: equipped ? 'rgba(210, 154, 20, 0.32)' : 'rgba(255,255,255,0.94)',
    color: '#1d1830',
    cursor: equippable ? 'pointer' : 'default',
    display: 'grid',
    gridTemplateColumns: '34px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 8,
    padding: '0 8px 0 10px',
    boxShadow: equipped ? 'inset 0 0 0 1px rgba(255,255,255,0.35), 0 0 12px rgba(255,210,74,0.2)' : 'none',
  }

  return (
    <div
      onClick={() => onToggleEquip(skill)}
      onMouseEnter={event => onHover(skill, event)}
      onMouseMove={event => onHover(skill, event)}
      onMouseLeave={onLeave}
      title={equippable ? (equipped ? '点击卸下战斗技能' : '点击装备战斗技能') : '被动技能'}
      style={cellStyle}
    >
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 4,
        border: '1px solid rgba(29,24,48,0.28)',
        background: skill.skillData.category === SkillCategory.MAGIC ? '#dceaff' : skill.skillData.type === SkillType.PASSIVE ? '#fff2bf' : '#ffe1df',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 800,
        overflow: 'hidden',
      }} data-bwe-skill-icon={skillSpriteName}>
        <SpriteImage name={skillSpriteName} autoPlay={false} style={skillIconImageStyle} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name} {rank}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'rgba(29,24,48,0.7)' }}>
          <span>Rank {rank}</span>
          <span>{skill.skillData.category}</span>
          {nextCost !== null && <span>AP {nextCost}</span>}
          {equipped && <span style={{ color: '#9b6300', fontWeight: 700 }}>已装备</span>}
        </div>
      </div>
      <button
        onClick={event => onLevelup(skill, event)}
        disabled={!canLevel}
        title={nextCost === null ? '已达最高 Rank' : canLevel ? `消耗 ${nextCost} AP 升级` : `需要 ${nextCost} AP`}
        style={{
          width: 34,
          height: 24,
          border: 'none',
          borderRadius: 4,
          background: canLevel ? '#ff4040' : 'rgba(29,24,48,0.18)',
          color: canLevel ? '#fff' : 'rgba(29,24,48,0.45)',
          cursor: canLevel ? 'pointer' : 'not-allowed',
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        up
      </button>
    </div>
  )
}

const skillIconImageStyle: CSSProperties = {
  width: 30,
  height: 30,
  objectFit: 'contain',
  display: 'block',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
}

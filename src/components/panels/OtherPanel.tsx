import { useState, useCallback } from 'react'
import { ButtonCell, MenuButton } from '../common/Common'
import { SpriteImage } from '../shared/SpriteImage'
import { TitleWindow } from './TitleWindow'
import { SystemWindow } from './SystemWindow'
import {
  EquipWindow,
  ItemWindow,
  OtherWindow,
  PetWindow,
  SkillWindow,
} from '../windows'

type OtherPanelTabId = 'item' | 'equip' | 'pet' | 'skill' | 'title' | 'system' | 'other'

const tabDefs: Array<{
  id: OtherPanelTabId
  label: string
  beforeKey: string
  afterKey: string
  node: JSX.Element
}> = [
  { id: 'item', label: '背包', beforeKey: 'before_item', afterKey: 'after_item', node: <ItemWindow /> },
  { id: 'equip', label: '装备', beforeKey: 'before_equip', afterKey: 'after_equip', node: <EquipWindow /> },
  { id: 'pet', label: '宠物', beforeKey: 'before_pet', afterKey: 'after_pet', node: <PetWindow /> },
  { id: 'skill', label: '技能', beforeKey: 'before_skill', afterKey: 'after_skill', node: <SkillWindow /> },
  { id: 'title', label: '称号', beforeKey: 'before_title', afterKey: 'after_title', node: <TitleWindow /> },
  { id: 'system', label: '设置', beforeKey: 'before_system', afterKey: 'after_system', node: <SystemWindow /> },
  { id: 'other', label: '其他', beforeKey: 'before_info', afterKey: 'after_info', node: <OtherWindow /> },
]

const TAB_SIZE = 40
const VISIBLE_COUNT = 4
const VISIBLE_WIDTH = VISIBLE_COUNT * TAB_SIZE

const ARROW_FACE_BASE: React.CSSProperties = {
  width: 20,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  background: 'rgba(255,255,255,0.95)',
  border: '1px solid rgba(205,175,95,0.8)',
  boxSizing: 'border-box',
}

const ARROW_FACE_ACTIVE: React.CSSProperties = {
  ...ARROW_FACE_BASE,
  background: 'rgba(227,175,138,0.95)',
  boxShadow: '0 0 13px rgba(77,60,35,0.66)',
}

const ARROW_FACE_DIM: React.CSSProperties = {
  ...ARROW_FACE_BASE,
  opacity: 0.3,
}

function renderTabFace(tab: (typeof tabDefs)[number], selected: boolean) {
  return (
    <div style={{
      width: TAB_SIZE,
      height: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
    }}>
      <SpriteImage
        name={selected ? tab.afterKey : tab.beforeKey}
        autoPlay={false}
        style={{ width: 30, height: 30, imageRendering: 'pixelated' }}
      />
      <span style={{
        fontSize: 9,
        color: selected ? '#fff' : 'var(--color-text-dim)',
        fontWeight: selected ? 'bold' : 'normal',
        lineHeight: '10px',
      }}>
        {tab.label}
      </span>
    </div>
  )
}

export function OtherPanel() {
  const [activeTab, setActiveTab] = useState<OtherPanelTabId>('item')
  const [scrollOffset, setScrollOffset] = useState(0)

  const minOffset = 0
  const maxOffset = tabDefs.length - VISIBLE_COUNT

  const showLeft = scrollOffset > minOffset
  const showRight = scrollOffset < maxOffset

  const handleTabClick = useCallback((id: OtherPanelTabId) => {
    setActiveTab(id)
  }, [])

  const scrollLeft = useCallback(() => {
    const next = Math.max(scrollOffset - 1, minOffset)
    setScrollOffset(next)
  }, [scrollOffset])

  const scrollRight = useCallback(() => {
    const next = Math.min(scrollOffset + 1, maxOffset)
    setScrollOffset(next)
  }, [scrollOffset])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        height: 44,
      }}>
        <ButtonCell
          width={20}
          height={40}
          disabled={!showLeft}
          onClick={scrollLeft}
          style={{ flexShrink: 0 }}
          before={<div style={showLeft ? ARROW_FACE_BASE : ARROW_FACE_DIM}>{"\u25C0"}</div>}
          after={<div style={ARROW_FACE_ACTIVE}>{"\u25C0"}</div>}
        />

        <div style={{ width: VISIBLE_WIDTH, overflow: 'hidden', height: 44, flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            transform: `translateX(${-scrollOffset * TAB_SIZE}px)`,
            transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}>
            {tabDefs.map(tab => {
              const selected = activeTab === tab.id
              return (
                <MenuButton
                  key={tab.id}
                  label={tab.label}
                  info={tab.label}
                  selected={selected}
                  onClick={() => handleTabClick(tab.id)}
                  before={renderTabFace(tab, false)}
                  after={renderTabFace(tab, true)}
                  style={{
                    width: TAB_SIZE,
                    height: 40,
                    flexShrink: 0,
                  }}
                />
              )
            })}
          </div>
        </div>

        <ButtonCell
          width={20}
          height={40}
          disabled={!showRight}
          onClick={scrollRight}
          style={{ flexShrink: 0 }}
          before={<div style={showRight ? ARROW_FACE_BASE : ARROW_FACE_DIM}>{"\u25B6"}</div>}
          after={<div style={ARROW_FACE_ACTIVE}>{"\u25B6"}</div>}
        />
      </div>

      <div style={{
        flex: 1,
        minHeight: 0,
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {tabDefs.map(({ id, node }) => (
          <div
            key={id}
            style={{
              display: activeTab === id ? 'block' : 'none',
              height: '100%',
            }}
          >
            {node}
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { MenuButton } from '../common/Common'
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

const tabs: Array<{ id: OtherPanelTabId; label: string; node: JSX.Element }> = [
  { id: 'item', label: '背包', node: <ItemWindow /> },
  { id: 'equip', label: '装备', node: <EquipWindow /> },
  { id: 'pet', label: '宠物', node: <PetWindow /> },
  { id: 'skill', label: '技能', node: <SkillWindow /> },
  { id: 'title', label: '称号', node: <TitleWindow /> },
  { id: 'system', label: '设置', node: <SystemWindow /> },
  { id: 'other', label: '其他', node: <OtherWindow /> },
]

export function OtherPanel() {
  const [activeTab, setActiveTab] = useState<OtherPanelTabId>('item')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 8,
      }}>
        {tabs.map(({ id, label }) => (
          <MenuButton
            key={id}
            label={label.slice(0, 2)}
            info={label}
            selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            style={{
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      <div style={{
        flex: 1,
        minHeight: 0,
        background: 'var(--color-bg-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {tabs.map(({ id, node }) => (
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

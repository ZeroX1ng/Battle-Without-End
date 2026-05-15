import { useState } from 'react'
import { useGameContext } from '../../state/GameContext'
import { MenuButton } from '../common/Common'
import { HelpWindow } from './HelpWindow'
import { MapWindow } from './MapWindow'
import { SaveWindow } from './SaveWindow'
import { ShopWindow } from './ShopWindow'
import { SpecialShopWindow } from './SpecialShopWindow'

type OtherEntryId = 'map' | 'help' | 'shop' | 'specialshop' | 'save' | 'rebirth'

const otherEntries: Array<{ id: OtherEntryId; label: string }> = [
  { id: 'map', label: '地图' },
  { id: 'help', label: '帮助' },
  { id: 'shop', label: '商店' },
  { id: 'specialshop', label: '特殊商店' },
  { id: 'rebirth', label: '转生' },
  { id: 'save', label: '保存' },
]

const childWindows: Array<{ id: Exclude<OtherEntryId, 'rebirth'>; node: JSX.Element }> = [
  { id: 'map', node: <MapWindow /> },
  { id: 'help', node: <HelpWindow /> },
  { id: 'shop', node: <ShopWindow /> },
  { id: 'specialshop', node: <SpecialShopWindow /> },
  { id: 'save', node: <SaveWindow /> },
]

export function OtherWindow() {
  const { state, dispatch } = useGameContext()
  const [activeEntry, setActiveEntry] = useState<OtherEntryId>('map')
  const canRebirth = state.player.age >= 20

  const handleEntryClick = (id: OtherEntryId) => {
    if (id === 'rebirth') {
      if (canRebirth) {
        dispatch({ type: 'START_REBIRTH' })
      }
      return
    }

    setActiveEntry(id)
  }

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, gap: 10 }}>
      <div style={{
        width: 118,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {otherEntries.map(({ id, label }) => {
          const selected = activeEntry === id
          const disabled = id === 'rebirth' && !canRebirth

          return (
            <MenuButton
              key={id}
              label={label.slice(0, 2)}
              info={label}
              selected={selected}
              onClick={() => handleEntryClick(id)}
              disabled={disabled}
              style={{
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            />
          )
        })}

        <div style={{ marginTop: 2, fontSize: 11, lineHeight: 1.4, color: 'var(--color-text-dim)' }}>
          {canRebirth ? '已达到转生条件。' : '20 岁后可转生。'}
        </div>
      </div>

      <div style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        background: 'var(--color-bg-dark)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {childWindows.map(({ id, node }) => (
          <div
            key={id}
            style={{
              display: activeEntry === id ? 'block' : 'none',
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

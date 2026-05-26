import { useGameContext } from '../../state/GameContext'
import { MenuButton } from '../common/Common'

type OtherEntryId = 'map' | 'help' | 'shop' | 'specialshop' | 'save' | 'rebirth'

const otherEntries: Array<{ id: OtherEntryId; label: string }> = [
  { id: 'map', label: '地图' },
  { id: 'help', label: '帮助' },
  { id: 'shop', label: '商店' },
  { id: 'specialshop', label: '特殊商店' },
  { id: 'rebirth', label: '转生' },
  { id: 'save', label: '保存' },
]

export function OtherWindow() {
  const { state, dispatch } = useGameContext()
  const canRebirth = state.player.age >= 20

  const handleEntryClick = (id: OtherEntryId) => {
    if (id === 'rebirth') {
      if (canRebirth) {
        dispatch({ type: 'START_REBIRTH' })
      }
      return
    }

    dispatch({ type: 'UI_OPEN_WINDOW', window: id })
  }

  return (
    <div style={{ height: '100%', minHeight: 0 }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {otherEntries.map(({ id, label }) => {
          const selected = state.ui.activeWindow === id
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
    </div>
  )
}

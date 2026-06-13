import { useGameContext } from '../../state/GameContext'
import { MenuButton } from '../common/Common'
import { SpriteImage } from '../shared/SpriteImage'

type OtherEntryId = 'map' | 'help' | 'shop' | 'specialshop' | 'save' | 'rebirth'

const otherEntries: Array<{ id: OtherEntryId; label: string }> = [
  { id: 'map', label: '地图' },
  { id: 'help', label: '帮助' },
  { id: 'shop', label: '商店' },
  { id: 'specialshop', label: '特殊商店' },
  { id: 'rebirth', label: '转生' },
  { id: 'save', label: '保存' },
]

const otherEntryIconKeys: Record<OtherEntryId, string> = {
  map: 'button_map',
  help: 'button_help',
  shop: 'button_shop',
  specialshop: 'button_shop',
  rebirth: 'button_rebirth',
  save: 'button_save',
}

function renderOtherButtonIcon(iconKey: string, active: boolean) {
  return (
    <span style={otherButtonIconStyle} data-bwe-other-button-icon={iconKey}>
      <SpriteImage name="doubleCircle" autoPlay={false} style={otherButtonCircleStyle(active)} />
      <SpriteImage name={iconKey} autoPlay={false} style={otherButtonSpriteStyle(active)} />
    </span>
  )
}

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
          const iconKey = otherEntryIconKeys[id]

          return (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: disabled ? 0.45 : 1,
              }}
            >
              <MenuButton
                label={label}
                info={label}
                aria-label={label}
                selected={selected}
                onClick={() => handleEntryClick(id)}
                disabled={disabled}
                before={renderOtherButtonIcon(iconKey, false)}
                after={renderOtherButtonIcon(iconKey, true)}
                style={{
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              />
              <span style={{ color: 'var(--color-text)', fontSize: 13, fontWeight: 700 }}>{label}</span>
            </div>
          )
        })}

        <div style={{ marginTop: 2, fontSize: 11, lineHeight: 1.4, color: 'var(--color-text-dim)' }}>
          {canRebirth ? '已达到转生条件。' : '20 岁后可转生。'}
        </div>
      </div>
    </div>
  )
}

const otherButtonIconStyle: React.CSSProperties = {
  position: 'relative',
  width: 40,
  height: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function otherButtonCircleStyle(active: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    width: 34,
    height: 34,
    objectFit: 'contain',
    display: 'block',
    opacity: active ? 0.95 : 0.75,
    imageRendering: 'pixelated',
    pointerEvents: 'none',
  }
}

function otherButtonSpriteStyle(active: boolean): React.CSSProperties {
  return {
    position: 'relative',
    width: 22,
    height: 22,
    objectFit: 'contain',
    display: 'block',
    filter: active ? 'brightness(1.35)' : undefined,
    imageRendering: 'pixelated',
    pointerEvents: 'none',
  }
}

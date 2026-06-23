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
  const themeMode = state.ui.themeMode

  const handleEntryClick = (id: OtherEntryId) => {
    if (id === 'rebirth') {
      if (canRebirth) {
        dispatch({ type: 'START_REBIRTH' })
      }
      return
    }

    dispatch({ type: 'UI_OPEN_WINDOW', window: id })
  }

  const setThemeMode = (nextThemeMode: 'dark' | 'light') => {
    dispatch({ type: 'UI_SET_THEME', themeMode: nextThemeMode })
  }

  return (
    <div
      data-bwe-other-window-grid
      style={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridAutoRows: 46,
        gap: 6,
        alignContent: 'start',
        padding: 8,
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        display: 'contents',
      }}>
        {otherEntries.map(({ id, label }) => {
          const selected = state.ui.activeWindow === id
          const disabled = id === 'rebirth' && !canRebirth
          const iconKey = otherEntryIconKeys[id]

          return (
            <div
              key={id}
              data-bwe-other-entry={id}
              style={{
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: '38px minmax(0, 1fr)',
                alignItems: 'center',
                gap: 8,
                padding: '3px 6px',
                border: '1px solid rgba(205, 175, 95, 0.24)',
                background: selected ? 'rgba(227,175,138,0.12)' : 'rgba(255,255,255,0.025)',
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
              <span style={{
                minWidth: 0,
                color: 'var(--color-text)',
                fontSize: 13,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
          )
        })}

        <div style={{ gridColumn: '1 / -1', marginTop: 2, fontSize: 11, lineHeight: 1.4, color: 'var(--color-text-dim)' }}>
          {canRebirth ? '已达到转生条件。' : '20 岁后可转生。'}
        </div>

        <div
          data-bwe-theme-toggle
          style={{
            gridColumn: '1 / -1',
            display: 'grid',
            gridTemplateColumns: '72px repeat(2, minmax(0, 1fr))',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
            padding: '6px 7px',
            border: '1px solid rgba(205, 175, 95, 0.24)',
            background: 'rgba(255,255,255,0.025)',
          }}
        >
          <span style={{ color: 'var(--color-text-dim)', fontSize: 12, fontWeight: 700 }}>界面颜色</span>
          <button
            type="button"
            data-bwe-theme-toggle-button="dark"
            aria-pressed={themeMode === 'dark'}
            onClick={() => setThemeMode('dark')}
            style={themeButtonStyle(themeMode === 'dark')}
          >
            深色
          </button>
          <button
            type="button"
            data-bwe-theme-toggle-button="light"
            aria-pressed={themeMode === 'light'}
            onClick={() => setThemeMode('light')}
            style={themeButtonStyle(themeMode === 'light')}
          >
            浅色
          </button>
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

function themeButtonStyle(active: boolean): React.CSSProperties {
  return {
    height: 28,
    border: `1px solid ${active ? 'var(--color-yellow)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-sm)',
    background: active ? 'rgba(227, 163, 34, 0.18)' : 'var(--color-bg-dark)',
    color: active ? 'var(--color-text-bright)' : 'var(--color-text)',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  }
}

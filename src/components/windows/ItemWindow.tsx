import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useInfoWindow } from '../common/InfoWindow'
import { EquipmentCell } from '../common/Common'
import { QualityColor, QualityName } from '../../core/constants'
import { getAutoForgeTarget, getForgeCost, getForgeSuccessRate } from '../../core/systems/ForgeSystem'
import { getEquipmentComparisonSlot, getLuck } from '../../core/models/Player'
import { useGameContext } from '../../state/GameContext'

function btnStyle(bg: string, disabled: boolean = false): CSSProperties {
  return {
    padding: '3px 8px',
    fontSize: 11,
    fontWeight: 'bold',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: disabled ? 'var(--color-bg-dark)' : bg,
    color: disabled ? 'var(--color-text-dim)' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }
}

function getItemDescription(item: any): string {
  return item?.getDescription ? item.getDescription() : item?.getNameHTML?.() ?? item?.realName ?? ''
}

function getItemName(item: any): string {
  return item?.getNameHTML ? item.getNameHTML() : item?.realName ?? ''
}

export function ItemWindow() {
  const { state, dispatch } = useGameContext()
  const { showStringInfo, hideStringInfo, showItemInfo, hideItemInfo, updateMouse } = useInfoWindow()
  const items = state.player.itemList
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [autoEnhance, setAutoEnhance] = useState(false)

  const selectedIdx = selectedItem ? items.indexOf(selectedItem) : -1

  useEffect(() => {
    if (selectedItem && selectedIdx < 0) {
      setSelectedItem(null)
      hideItemInfo()
    }
  }, [hideItemInfo, selectedIdx, selectedItem])

  const blacksmithLevel = useMemo(() => {
    const bs = state.player.skillList.find((s: any) => s.skillData.name === 'BLACKSMITHING')
    return bs ? bs.level : 0
  }, [state.player.skillList])

  const forgeInfo = useMemo(() => {
    if (!selectedItem) return null
    const targetLevel = selectedItem.level + 1
    const rate = getForgeSuccessRate(targetLevel, getLuck(state.player), blacksmithLevel)
    const cost = getForgeCost(selectedItem.getMoney(), selectedItem.level)
    const canAfford = state.player.gold >= cost
    return {
      rate,
      cost,
      canAfford,
      maxed: selectedItem.level >= 15,
    }
  }, [blacksmithLevel, selectedItem, state.player])

  const autoForgeTarget = useMemo(() => {
    if (!selectedItem) return null
    return getAutoForgeTarget(selectedItem.level, blacksmithLevel)
  }, [blacksmithLevel, selectedItem])

  const autoForgeLabel = autoForgeTarget
    ? `自动+${autoForgeTarget - (selectedItem?.level ?? 0)}`
    : '自动锻造'

  const handleStringHover = (text: string, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    showStringInfo(text)
  }

  const handleItemHover = (item: any, event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    showItemInfo(getItemDescription(item))
  }

  const handleForge = () => {
    if (!selectedItem || selectedIdx < 0 || !forgeInfo?.canAfford || forgeInfo.maxed) return
    if (autoEnhance && autoForgeTarget && selectedItem.level < autoForgeTarget) {
      dispatch({ type: 'AUTO_FORGE_EQUIPMENT', equipIndex: selectedIdx, blacksmithLevel })
    } else {
      dispatch({ type: 'FORGE_EQUIPMENT', equipIndex: selectedIdx, blacksmithLevel })
    }
  }

  const closeWindow = () => {
    hideStringInfo()
    hideItemInfo()
    dispatch({ type: 'UI_CLOSE_WINDOW' })
    setSelectedItem(null)
  }

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px', alignItems: 'center', flex: 1 }}>
          <button
            onClick={() => dispatch({ type: 'ITEM_SORT', mode: 'value' })}
            onMouseMove={(event) => updateMouse(event.clientX, event.clientY)}
            onMouseEnter={(event) => {
              updateMouse(event.clientX, event.clientY)
              showStringInfo('按价值排列')
            }}
            onMouseLeave={hideStringInfo}
            style={sortBtnStyle}
          >
            价值
          </button>
          <b style={{ color: 'var(--color-text)', textAlign: 'center' }}>背包 ({items.length}/{state.player.BAGMAX})</b>
          <button
            onClick={() => dispatch({ type: 'ITEM_SORT', mode: 'type' })}
            onMouseMove={(event) => updateMouse(event.clientX, event.clientY)}
            onMouseEnter={(event) => {
              updateMouse(event.clientX, event.clientY)
              showStringInfo('按类型排列')
            }}
            onMouseLeave={hideStringInfo}
            style={sortBtnStyle}
          >
            类型
          </button>
        </div>
        <button
          onClick={closeWindow}
          style={{ color: 'var(--color-text-dim)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 6 }}
        >
          x
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: '1 1 55%', overflowY: 'auto', maxHeight: '100%' }}>
          {items.length === 0
            ? <div style={{ color: 'var(--color-text-dim)', textAlign: 'center', padding: 20 }}>背包是空的</div>
            : items.map((item: any, i: number) => (
                <EquipmentCell
                  key={`${item.name ?? item.realName}-${i}`}
                  equip={item}
                  currentEquip={getEquipmentComparisonSlot(item, state.player)}
                  selected={item === selectedItem}
                  onSelect={() => setSelectedItem(item === selectedItem ? null : item)}
                  onEquip={() => {
                    dispatch({ type: 'EQUIP_ITEM', item })
                    setSelectedItem(null)
                    hideItemInfo()
                  }}
                  onSell={() => {
                    dispatch({ type: 'ITEM_SELL', item })
                    if (item === selectedItem) setSelectedItem(null)
                    hideItemInfo()
                  }}
                  style={{
                    marginBottom: 4,
                  }}
                />
              ))
          }
        </div>

        {selectedItem && (
          <div style={detailPanelStyle}>
            <div
              style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--color-text-bright)' }}
              dangerouslySetInnerHTML={{ __html: getItemName(selectedItem) }}
            />

            <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>
              品质:{' '}
              <span style={{ color: QualityColor[selectedItem.quality] ?? 'var(--color-text)' }}>
                {QualityName[selectedItem.quality] ?? '未知'}
              </span>
              {' | '}等级:{' '}
              <span style={{ color: selectedItem.level > 0 ? '#FFD700' : 'var(--color-text-dim)' }}>+{selectedItem.level}</span>
            </div>

            {forgeInfo && !forgeInfo.maxed && (
              <>
                <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>锻造至 +{selectedItem.level + 1}</div>
                <div style={{ fontSize: 11, color: forgeInfo.rate >= 70 ? 'var(--color-green)' : forgeInfo.rate >= 40 ? 'var(--color-yellow)' : 'var(--color-red)' }}>
                  成功率 {forgeInfo.rate.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: forgeInfo.canAfford ? 'var(--color-yellow)' : 'var(--color-red)' }}>
                  费用: ${forgeInfo.cost.toLocaleString()}
                </div>
              </>
            )}
            {forgeInfo?.maxed && (
              <div style={{ fontSize: 11, color: 'var(--color-green)' }}>已达到最高强化等级 +15</div>
            )}

            <label
              onMouseMove={(event) => updateMouse(event.clientX, event.clientY)}
              onMouseEnter={(event) => {
                updateMouse(event.clientX, event.clientY)
                showStringInfo(autoForgeLabel)
              }}
              onMouseLeave={hideStringInfo}
              style={toggleStyle}
            >
              <input
                type="checkbox"
                checked={autoEnhance}
                disabled={!autoForgeTarget}
                onChange={(event) => setAutoEnhance(event.target.checked)}
              />
              {autoForgeLabel}
            </label>

            <label
              onMouseMove={(event) => updateMouse(event.clientX, event.clientY)}
              onMouseEnter={(event) => handleStringHover('音效', event)}
              onMouseLeave={hideStringInfo}
              style={toggleStyle}
            >
              <input
                type="checkbox"
                checked={state.config.sound_toggle}
                onChange={() => dispatch({ type: 'CONFIG_TOGGLE', key: 'sound_toggle' })}
              />
              音效
            </label>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <button
                onClick={() => { dispatch({ type: 'EQUIP_ITEM', item: selectedItem }); setSelectedItem(null); hideItemInfo() }}
                style={btnStyle('var(--color-blue)')}
              >
                穿戴
              </button>
              <button
                onClick={handleForge}
                disabled={!forgeInfo?.canAfford || forgeInfo?.maxed || selectedIdx < 0}
                style={btnStyle('var(--color-green)', !forgeInfo?.canAfford || forgeInfo?.maxed || selectedIdx < 0)}
              >
                锻造
              </button>
            </div>

            {blacksmithLevel <= 1 && (
              <div style={{ fontSize: 10, color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
                学习 Blacksmithing 后可解锁自动锻造。
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const sortBtnStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-panel)',
  color: 'var(--color-text)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontSize: 11,
  padding: '2px 4px',
}

const detailPanelStyle: CSSProperties = {
  flex: '1 1 45%',
  background: 'var(--color-bg-panel)',
  borderRadius: 'var(--radius-md)',
  padding: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const toggleStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  color: 'var(--color-text)',
  fontSize: 11,
  userSelect: 'none',
}

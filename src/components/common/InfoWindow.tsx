// ═══ 全局浮动提示窗口 ═══
// AS3 原始: iGlobal.Global.stringInfoWindow / itemInfoWindow
//          iPanel.iCell.StringInfoWindow / ItemInfoWindow
//
// StringInfoWindow: 鼠标跟随文本提示（悬浮菜单按钮/进度条等）
// ItemInfoWindow:   装备详情弹出面板（固定宽度，金线边框+发光效果）
//
// 通过 InfoWindowContext 全局管理，任何组件可调用 showStringInfo / showItemInfo

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { TextField } from '../../core/utils/fontFactory'

// ═══ 类型定义 ═══

interface InfoWindowState {
  stringText: string
  stringVisible: boolean
  itemHtml: string
  compareHtml: string
  itemVisible: boolean
  mouseX: number
  mouseY: number
  pinnedItemHtml: string
  pinnedCompareHtml: string
  pinnedVisible: boolean
  pinnedX: number
  pinnedY: number
}

interface InfoWindowContextType {
  showStringInfo: (text: string) => void
  hideStringInfo: () => void
  showItemInfo: (html: string, compareHtml?: string) => void
  hideItemInfo: () => void
  updateMouse: (x: number, y: number) => void
  showPinnedItemInfo: (html: string, compareHtml: string, x: number, y: number) => void
  hidePinnedItemInfo: () => void
}

const InfoWindowContext = createContext<InfoWindowContextType | null>(null)

// ═══ Provider ═══

export function InfoWindowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InfoWindowState>({
    stringText: '',
    stringVisible: false,
    itemHtml: '',
    compareHtml: '',
    itemVisible: false,
    mouseX: 0,
    mouseY: 0,
    pinnedItemHtml: '',
    pinnedCompareHtml: '',
    pinnedVisible: false,
    pinnedX: 0,
    pinnedY: 0,
  })

  const showStringInfo = useCallback((text: string) => {
    setState(s => ({ ...s, stringText: text, stringVisible: true }))
  }, [])

  const hideStringInfo = useCallback(() => {
    setState(s => ({ ...s, stringVisible: false }))
  }, [])

  const showItemInfo = useCallback((html: string, compareHtml: string = '') => {
    setState(s => ({ ...s, itemHtml: html, compareHtml, itemVisible: true }))
  }, [])

  const hideItemInfo = useCallback(() => {
    setState(s => ({ ...s, itemVisible: false, compareHtml: '' }))
  }, [])

  const updateMouse = useCallback((x: number, y: number) => {
    setState(s => ({ ...s, mouseX: x, mouseY: y }))
  }, [])

  const showPinnedItemInfo = useCallback((html: string, compareHtml: string, x: number, y: number) => {
    setState(s => ({ ...s, pinnedItemHtml: html, pinnedCompareHtml: compareHtml, pinnedVisible: true, pinnedX: x, pinnedY: y }))
  }, [])

  const hidePinnedItemInfo = useCallback(() => {
    setState(s => ({ ...s, pinnedVisible: false, pinnedCompareHtml: '' }))
  }, [])

  const value: InfoWindowContextType = {
    showStringInfo,
    hideStringInfo,
    showItemInfo,
    hideItemInfo,
    updateMouse,
    showPinnedItemInfo,
    hidePinnedItemInfo,
  }

  return (
    <InfoWindowContext.Provider value={value}>
      {children}
      <StringInfoWindow
        text={state.stringText}
        visible={state.stringVisible}
        mouseX={state.mouseX}
        mouseY={state.mouseY}
      />
      <ItemInfoWindow
        html={state.itemHtml}
        compareHtml={state.compareHtml}
        visible={state.itemVisible}
        mouseX={state.mouseX}
        mouseY={state.mouseY}
      />
      <ItemInfoWindow
        html={state.pinnedItemHtml}
        compareHtml={state.pinnedCompareHtml}
        visible={state.pinnedVisible}
        mouseX={state.pinnedX}
        mouseY={state.pinnedY}
        pinned
      />
    </InfoWindowContext.Provider>
  )
}

export function useInfoWindow(): InfoWindowContextType {
  const ctx = useContext(InfoWindowContext)
  if (!ctx) throw new Error('useInfoWindow must be used within InfoWindowProvider')
  return ctx
}

// ═══ 全局鼠标追踪 (挂载到 document) ═══

export function GlobalMouseTracker() {
  const { updateMouse } = useInfoWindow()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      updateMouse(e.clientX, e.clientY)
    }
    document.addEventListener('mousemove', handler)
    return () => document.removeEventListener('mousemove', handler)
  }, [updateMouse])

  return null
}

// ═══ StringInfoWindow — 文本悬浮提示 ═══
// AS3 原始: iPanel.iCell.StringInfoWindow
// 跟随鼠标位置，最大宽度200px，自动换行

interface StringInfoWindowProps {
  text: string
  visible: boolean
  mouseX: number
  mouseY: number
}

const GOLD_BORDER = 'rgba(205, 175, 95, 0.8)'
const GLOW_COLOR = 'rgba(77, 60, 35, 0.66)'
const INFO_BG = 'rgba(10, 8, 20, 0.92)'
const ITEM_INFO_PANEL_MIN_WIDTH = 130
const ITEM_INFO_PANEL_MAX_WIDTH = 180
const ITEM_INFO_PANEL_PREFERRED_WIDTH = 168
const ITEM_INFO_PANEL_GAP = 8
const ITEM_INFO_PANEL_MARGIN = 8
const ITEM_INFO_PANEL_OFFSET_X = 16
const ITEM_INFO_PANEL_OFFSET_Y = -10
const ITEM_INFO_PANEL_MIN_VISIBLE_HEIGHT = 140
const ITEM_INFO_PANEL_MAX_HEIGHT = 360
const ITEM_INFO_PANEL_MAX_STAGE_HEIGHT_RATIO = 0.52

type TooltipStageRect = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'>
type ItemInfoLayout = 'row' | 'column'

function getTooltipStageRect(): TooltipStageRect {
  if (typeof document !== 'undefined') {
    const stageElement =
      document.querySelector<HTMLElement>('.game-shell') ??
      document.querySelector<HTMLElement>('.main-scene')
    if (stageElement) {
      return stageElement.getBoundingClientRect()
    }
  }

  if (typeof window !== 'undefined') {
    return {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  return {
    left: 0,
    top: 0,
    right: 800,
    bottom: 600,
    width: 800,
    height: 600,
  }
}

function getTooltipStageScale(): number {
  if (typeof document !== 'undefined') {
    const layoutElement = document.querySelector<HTMLElement>('.game-layout')
    if (layoutElement) {
      const value = getComputedStyle(layoutElement).getPropertyValue('--bwe-stage-scale')
      const parsed = Number.parseFloat(value)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }
  }

  return 1
}

function clampToStage(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function StringInfoWindow({ text, visible, mouseX, mouseY }: StringInfoWindowProps) {
  if (!visible || !text) return null

  const visualScale = getTooltipStageScale()
  const offsetX = 16 * visualScale
  const offsetY = 16 * visualScale

  return (
    <div
      style={{
        position: 'fixed',
        left: mouseX + offsetX,
        top: mouseY + offsetY,
        maxWidth: 204,
        padding: '4px 6px',
        background: INFO_BG,
        border: `1px solid ${GOLD_BORDER}`,
        borderRadius: 4,
        boxShadow: `0 0 13px ${GLOW_COLOR}, 0 0 3px ${GOLD_BORDER}`,
        pointerEvents: 'none',
        zIndex: 10000,
        lineHeight: 1.4,
        transform: `scale(${visualScale})`,
        transformOrigin: 'top left',
      }}
    >
      <TextField size={20} color="#c8c8d4" multiline style={{ whiteSpace: 'pre-line' }}>
        {text}
      </TextField>
    </div>
  )
}

// ═══ ItemInfoWindow — 装备详情弹出面板 ═══
// AS3 原始: iPanel.iCell.ItemInfoWindow
// 固定宽度130px，显示装备HTML详情，金线边框+GlowFilter发光

interface ItemInfoWindowProps {
  html: string
  compareHtml?: string
  visible: boolean
  mouseX: number
  mouseY: number
  pinned?: boolean
}

function ItemInfoWindow({ html, compareHtml = '', visible, mouseX, mouseY, pinned = false }: ItemInfoWindowProps) {
  if (!visible || !html) return null

  const hasCompare = !!compareHtml
  const stageRect = getTooltipStageRect()
  const visualScale = getTooltipStageScale()
  const stageMargin = ITEM_INFO_PANEL_MARGIN * visualScale
  const toVisual = (value: number) => value * visualScale
  const stageInnerWidth = Math.max(
    ITEM_INFO_PANEL_MIN_WIDTH,
    (stageRect.width - stageMargin * 2) / visualScale,
  )
  const canFitCompareRow =
    hasCompare && stageInnerWidth >= ITEM_INFO_PANEL_MIN_WIDTH * 2 + ITEM_INFO_PANEL_GAP
  const layout: ItemInfoLayout = hasCompare && !canFitCompareRow ? 'column' : 'row'
  const paneCount = hasCompare && layout === 'row' ? 2 : 1
  const rowGap = paneCount === 2 ? ITEM_INFO_PANEL_GAP : 0
  const panelWidth = clampToStage(
    Math.floor((stageInnerWidth - rowGap) / paneCount),
    ITEM_INFO_PANEL_MIN_WIDTH,
    ITEM_INFO_PANEL_PREFERRED_WIDTH,
  )
  const cappedPanelWidth = Math.min(panelWidth, ITEM_INFO_PANEL_MAX_WIDTH)

  // For pinned panels, position directly at the provided coordinates without mouse-relative clamping.
  const totalWidth = hasCompare && layout === 'row'
    ? cappedPanelWidth * 2 + ITEM_INFO_PANEL_GAP
    : cappedPanelWidth
  const visualTotalWidth = toVisual(totalWidth)

  let adjustedX: number
  let adjustedY: number
  let tooltipMaxHeight: number

  if (pinned) {
    adjustedX = clampToStage(
      mouseX,
      stageRect.left + stageMargin,
      stageRect.right - stageMargin - visualTotalWidth,
    )
    adjustedY = clampToStage(
      mouseY,
      stageRect.top + stageMargin,
      stageRect.bottom - stageMargin - toVisual(ITEM_INFO_PANEL_MIN_VISIBLE_HEIGHT),
    )
    tooltipMaxHeight = Math.min(
      ITEM_INFO_PANEL_MAX_HEIGHT,
      (stageRect.bottom - adjustedY - stageMargin) / visualScale,
    )
  } else {
    const preferredX = mouseX + toVisual(ITEM_INFO_PANEL_OFFSET_X)
    const flippedX = mouseX - visualTotalWidth - toVisual(ITEM_INFO_PANEL_OFFSET_X)
    const rawX = preferredX + visualTotalWidth <= stageRect.right - stageMargin
      ? preferredX
      : flippedX
    adjustedX = clampToStage(
      rawX,
      stageRect.left + stageMargin,
      stageRect.right - stageMargin - visualTotalWidth,
    )
    const stageInnerHeight = Math.max(
      ITEM_INFO_PANEL_MIN_VISIBLE_HEIGHT,
      Math.min(
        (stageRect.height - stageMargin * 2) / visualScale,
        Math.floor((stageRect.height / visualScale) * ITEM_INFO_PANEL_MAX_STAGE_HEIGHT_RATIO),
        ITEM_INFO_PANEL_MAX_HEIGHT,
      ),
    )
    const minVisibleHeight = Math.min(ITEM_INFO_PANEL_MIN_VISIBLE_HEIGHT, stageInnerHeight)
    const preferredY = mouseY + toVisual(ITEM_INFO_PANEL_OFFSET_Y)
    const rawY = preferredY + toVisual(minVisibleHeight) <= stageRect.bottom - stageMargin
      ? preferredY
      : mouseY - toVisual(minVisibleHeight) - stageMargin
    adjustedY = clampToStage(
      rawY,
      stageRect.top + stageMargin,
      stageRect.bottom - stageMargin - toVisual(minVisibleHeight),
    )
    tooltipMaxHeight = Math.min(
      stageInnerHeight,
      Math.max(
        minVisibleHeight,
        (stageRect.bottom - adjustedY - stageMargin) / visualScale,
      ),
    )
  }
  const panelMaxHeight = hasCompare && layout === 'column'
    ? Math.max(80, Math.floor((tooltipMaxHeight - ITEM_INFO_PANEL_GAP) / 2))
    : tooltipMaxHeight
  const panelStyle: React.CSSProperties = {
    width: cappedPanelWidth,
    maxHeight: panelMaxHeight,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '6px 8px',
    background: INFO_BG,
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: 4,
    boxShadow: `0 0 13px ${GLOW_COLOR}, 0 0 3px ${GOLD_BORDER}`,
    overflowWrap: 'break-word',
  }

  return (
    <>
      <style>{`
        [data-bwe-item-info-window] font[size] { font-size: unset; }
        [data-bwe-item-info-window] font[size="14"] { font-size: 11px; }
        [data-bwe-item-info-window] font[size="16"] { font-size: 12px; }
        [data-bwe-item-info-window] font[size="20"] { font-size: 14px; }
        [data-bwe-item-info-window] font[size="24"] { font-size: 16px; }
      `}</style>
      <div
        data-bwe-item-info-window
        data-bwe-item-info-pinned={pinned ? '' : undefined}
        data-bwe-item-info-layout={layout}
        style={{
          position: 'fixed',
          left: adjustedX,
          top: adjustedY,
          display: 'flex',
          flexDirection: layout,
          gap: ITEM_INFO_PANEL_GAP,
          alignItems: 'flex-start',
          maxWidth: stageInnerWidth,
          maxHeight: tooltipMaxHeight,
          pointerEvents: 'none',
          zIndex: pinned ? 10000 : 10001,
          transform: `scale(${visualScale})`,
          transformOrigin: 'top left',
        }}
      >
        <div data-bwe-item-info-panel="candidate" style={panelStyle}>
          <TextField
            size={16}
            color="#c8c8d4"
            multiline
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        {hasCompare && (
          <div data-bwe-item-info-panel="current" style={panelStyle}>
            <TextField
              size={16}
              color="#c8c8d4"
              multiline
              dangerouslySetInnerHTML={{ __html: compareHtml }}
            />
          </div>
        )}
      </div>
    </>
  )
}

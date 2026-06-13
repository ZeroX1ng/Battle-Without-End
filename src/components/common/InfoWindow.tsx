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
}

interface InfoWindowContextType {
  showStringInfo: (text: string) => void
  hideStringInfo: () => void
  showItemInfo: (html: string, compareHtml?: string) => void
  hideItemInfo: () => void
  updateMouse: (x: number, y: number) => void
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

  const value: InfoWindowContextType = {
    showStringInfo,
    hideStringInfo,
    showItemInfo,
    hideItemInfo,
    updateMouse,
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

function clampToStage(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function StringInfoWindow({ text, visible, mouseX, mouseY }: StringInfoWindowProps) {
  if (!visible || !text) return null

  const offsetX = 16
  const offsetY = 16

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
}

function ItemInfoWindow({ html, compareHtml = '', visible, mouseX, mouseY }: ItemInfoWindowProps) {
  if (!visible || !html) return null

  const hasCompare = !!compareHtml
  const stageRect = getTooltipStageRect()
  const stageInnerWidth = Math.max(
    ITEM_INFO_PANEL_MIN_WIDTH,
    stageRect.width - ITEM_INFO_PANEL_MARGIN * 2,
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

  // Clamp against the AS3-like stage/game shell, not the browser viewport.
  const totalWidth = hasCompare && layout === 'row'
    ? cappedPanelWidth * 2 + ITEM_INFO_PANEL_GAP
    : cappedPanelWidth
  const preferredX = mouseX + ITEM_INFO_PANEL_OFFSET_X
  const flippedX = mouseX - totalWidth - ITEM_INFO_PANEL_OFFSET_X
  const rawX = preferredX + totalWidth <= stageRect.right - ITEM_INFO_PANEL_MARGIN
    ? preferredX
    : flippedX
  const adjustedX = clampToStage(
    rawX,
    stageRect.left + ITEM_INFO_PANEL_MARGIN,
    stageRect.right - ITEM_INFO_PANEL_MARGIN - totalWidth,
  )
  const stageInnerHeight = Math.max(
    ITEM_INFO_PANEL_MIN_VISIBLE_HEIGHT,
    Math.min(
      stageRect.height - ITEM_INFO_PANEL_MARGIN * 2,
      Math.floor(stageRect.height * ITEM_INFO_PANEL_MAX_STAGE_HEIGHT_RATIO),
      ITEM_INFO_PANEL_MAX_HEIGHT,
    ),
  )
  const minVisibleHeight = Math.min(ITEM_INFO_PANEL_MIN_VISIBLE_HEIGHT, stageInnerHeight)
  const preferredY = mouseY + ITEM_INFO_PANEL_OFFSET_Y
  const rawY = preferredY + minVisibleHeight <= stageRect.bottom - ITEM_INFO_PANEL_MARGIN
    ? preferredY
    : mouseY - minVisibleHeight - ITEM_INFO_PANEL_MARGIN
  const adjustedY = clampToStage(
    rawY,
    stageRect.top + ITEM_INFO_PANEL_MARGIN,
    stageRect.bottom - ITEM_INFO_PANEL_MARGIN - minVisibleHeight,
  )
  const tooltipMaxHeight = Math.min(
    stageInnerHeight,
    Math.max(
      minVisibleHeight,
      stageRect.bottom - adjustedY - ITEM_INFO_PANEL_MARGIN,
    ),
  )
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
    <div
      data-bwe-item-info-window
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
        zIndex: 10001,
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
  )
}

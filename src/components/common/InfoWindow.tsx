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

  const offsetX = 16
  const offsetY = -10
  const panelWidth = 300
  const gap = 10
  const hasCompare = !!compareHtml

  // 防止面板超出屏幕右侧
  const totalWidth = hasCompare ? panelWidth * 2 + gap : panelWidth
  const adjustedX = Math.min(mouseX + offsetX, window.innerWidth - totalWidth - 10)
  const adjustedY = Math.max(10, mouseY + offsetY)
  const panelStyle: React.CSSProperties = {
    width: panelWidth,
    padding: '8px 10px',
    background: INFO_BG,
    border: `1px solid ${GOLD_BORDER}`,
    borderRadius: 4,
    boxShadow: `0 0 13px ${GLOW_COLOR}, 0 0 3px ${GOLD_BORDER}`,
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        display: 'flex',
        gap,
        alignItems: 'flex-start',
        pointerEvents: 'none',
        zIndex: 10001,
      }}
    >
      <div style={panelStyle}>
        <TextField
          size={16}
          color="#c8c8d4"
          multiline
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {hasCompare && (
        <div style={panelStyle}>
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

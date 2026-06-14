import React, { useState, useEffect } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useInfoWindow } from './InfoWindow'
import { SpriteImage } from '../shared/SpriteImage'

const BASIC_BG = 'rgba(255,255,255,0.95)'
const BASIC_BORDER = 'rgba(205,175,95,0.8)'
const AFTER_BG = 'rgba(227,175,138,0.95)'
const GLOW = '0 0 13px rgba(77,60,35,0.66)'
const WEAPON_ICON_TYPES = new Set(['sword', 'axe', 'bow', 'crossbow', 'staff', 'sceptre', 'dagger', 'shield', 'tome'])
const WEAPON_POSITIONS = new Set(['onehand', 'twohand', 'offhand'])

export function getEquipmentSpriteName(equip: any | null | undefined): string {
  if (!equip) return 'mc_mode'
  const type = String(equip.type ?? '').trim()
  const position = String(equip.position ?? '').trim()
  if (!type) return 'mc_mode'
  if (equip.category || WEAPON_ICON_TYPES.has(type) || WEAPON_POSITIONS.has(position)) {
    return `mc_${type}`
  }
  return position ? `mc_${position}_${type}` : `mc_${type}`
}

interface BarProps {
  value: number
  max: number
  color?: string
  bgColor?: string
  height?: number
  label?: string
}

export function Bar({ value, max, color = 'var(--color-hp)', bgColor = 'var(--color-bg-dark)', height = 12, label }: BarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginBottom: 2 }}>{label}</div>}
      <div style={{ width: '100%', height, background: bgColor, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--radius-sm)', transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

interface BasicCellProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string
  height?: number | string
  bordered?: boolean
  children?: React.ReactNode
}

export function BasicCell({ width = '100%', height = 'auto', bordered = false, style, children, ...props }: BasicCellProps) {
  return (
    <div
      style={{
        width,
        height,
        background: BASIC_BG,
        border: bordered ? `1px solid ${BASIC_BORDER}` : undefined,
        boxSizing: 'border-box',
        color: '#101020',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

interface ButtonCellProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: number | string
  height?: number | string
  selected?: boolean
  downFunction?: () => void
  children?: React.ReactNode
  before?: React.ReactNode
  after?: React.ReactNode
}

export function ButtonCell({
  width = 'auto',
  height = 'auto',
  selected = false,
  downFunction,
  onMouseEnter,
  onMouseLeave,
  onClick,
  style,
  children,
  before,
  after,
  disabled,
  ...props
}: ButtonCellProps) {
  const [hovered, setHovered] = useState(false)
  const [internalDown, setInternalDown] = useState(false)

  useEffect(() => {
    if (!selected) setInternalDown(false)
  }, [selected])

  const buttonDown = selected || internalDown
  const afterVisible = !disabled && (hovered || buttonDown)

  const setAfter = () => setHovered(true)
  const setBefore = () => {
    setHovered(false)
    if (!selected) setInternalDown(false)
  }
  const setDown = () => {
    if (selected) {
      downFunction?.()
      return
    }
    setInternalDown(value => !value)
    downFunction?.()
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={event => {
        setAfter()
        onMouseEnter?.(event)
      }}
      onMouseLeave={event => {
        if (buttonDown) {
          setHovered(false)
        } else {
          setBefore()
        }
        onMouseLeave?.(event)
      }}
      onClick={event => {
        setDown()
        onClick?.(event)
      }}
      style={{
        position: 'relative',
        width,
        height,
        padding: 0,
        border: 0,
        background: 'transparent',
        color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        overflow: 'visible',
        ...style,
      }}
      {...props}
    >
      <span style={{ display: 'contents', visibility: afterVisible ? 'hidden' : 'visible' }}>
        {before ?? children}
      </span>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          visibility: afterVisible ? 'visible' : 'hidden',
        }}
      >
        {after ?? children}
      </span>
    </button>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'normal'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'normal', size = 'md', style, children, ...props }: ButtonProps) {
  const colors: Record<string, string> = {
    primary: 'var(--color-blue)',
    danger: 'var(--color-red)',
    normal: 'var(--color-border)',
  }
  return (
    <button
      style={{
        padding: size === 'sm' ? '4px 12px' : '8px 20px',
        fontSize: size === 'sm' ? 12 : 14,
        background: colors[variant],
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontWeight: 'bold',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

interface MenuButtonProps extends Omit<ButtonCellProps, 'before' | 'after'> {
  label: string
  info?: string
  before?: React.ReactNode
  after?: React.ReactNode
}

export function MenuButton({ label, info, before, after, selected, disabled, onMouseEnter, onMouseLeave, style, ...props }: MenuButtonProps) {
  const { showStringInfo, hideStringInfo, updateMouse } = useInfoWindow()

  const renderFace = (active: boolean) => (
    <BasicCell
      width={40}
      height={40}
      bordered
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? AFTER_BG : BASIC_BG,
        boxShadow: selected ? GLOW : undefined,
        filter: disabled ? 'grayscale(0.6)' : undefined,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.1,
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      {(active ? after : before) ?? label}
    </BasicCell>
  )

  return (
    <ButtonCell
      width={40}
      height={40}
      selected={selected}
      disabled={disabled}
      before={renderFace(false)}
      after={renderFace(true)}
      onMouseEnter={event => {
        updateMouse(event.clientX, event.clientY)
        if (info) showStringInfo(info)
        onMouseEnter?.(event)
      }}
      onMouseLeave={event => {
        hideStringInfo()
        onMouseLeave?.(event)
      }}
      style={{
        boxShadow: selected ? GLOW : undefined,
        ...style,
      }}
      {...props}
    />
  )
}

interface InfoTooltipProps {
  text: string
  visible?: boolean
}

export function InfoTooltip({ text, visible }: InfoTooltipProps) {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', top: 8, left: '50%', transform: 'translateX(-50%)',
      padding: '8px 16px', background: 'rgba(0,0,0,0.85)', color: '#fff',
      borderRadius: 'var(--radius-md)', fontSize: 13, zIndex: 9999,
      pointerEvents: 'none', whiteSpace: 'nowrap'
    }}>
      {text}
    </div>
  )
}

interface FlickerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md'
  glowColor?: string
}

export function FlickerButton({ size = 'md', glowColor, style, onMouseEnter, onMouseLeave, children, ...props }: FlickerButtonProps) {
  const [hovered, setHovered] = useState(false)
  const flickerStyle: React.CSSProperties = glowColor ? { '--flicker-color': glowColor } as React.CSSProperties : {}

  return (
    <button
      className={hovered ? 'flicker-button' : ''}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e) }}
      onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e) }}
      style={{
        padding: size === 'sm' ? '6px 16px' : '10px 24px',
        fontSize: size === 'sm' ? 13 : 14,
        background: 'none',
        color: hovered ? '#ffffff' : 'var(--color-text-dim)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'color 0.2s',
        ...flickerStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

interface StringInfoCellProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  info: string
  width?: number
  size?: number
}

export function StringInfoCell({ text, info, width = 100, size = 16, style, onMouseEnter, onMouseLeave, ...props }: StringInfoCellProps) {
  const { showStringInfo, hideStringInfo, updateMouse } = useInfoWindow()
  const shrink = Math.max(10, Math.min(size, Math.floor((width / Math.max(text.length, 1)) * 1.6)))

  return (
    <BasicCell
      onMouseMove={event => updateMouse(event.clientX, event.clientY)}
      onMouseEnter={event => {
        updateMouse(event.clientX, event.clientY)
        showStringInfo(info)
        onMouseEnter?.(event)
      }}
      onMouseLeave={event => {
        hideStringInfo()
        onMouseLeave?.(event)
      }}
      style={{
        display: 'inline-block',
        width: 'fit-content',
        maxWidth: width,
        padding: '1px 3px',
        borderRadius: 3,
        color: '#101020',
        fontSize: shrink,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxShadow: undefined,
        ...style,
      }}
      {...props}
    >
      {text}
    </BasicCell>
  )
}

interface EquipmentCellProps {
  equip: any
  currentEquip?: any
  getDescription?: (equip: any) => string
  showEquipAction?: boolean
  sellLabel?: string
  selected?: boolean
  disabled?: boolean
  onSelect?: (equip: any, event: ReactMouseEvent) => void
  onEquip?: (equip: any, event: ReactMouseEvent) => void
  onSell?: (equip: any, event: ReactMouseEvent) => void
  style?: CSSProperties
}

function getEquipHtml(equip: any): string {
  const name = equip?.getNameHTML ? equip.getNameHTML() : equip?.realName ?? ''
  const level = equip?.level ? ` +${equip.level}` : ''
  return `${name}${level}`
}

export function EquipmentCell({
  equip,
  currentEquip,
  getDescription,
  showEquipAction = true,
  sellLabel = '$',
  selected,
  disabled,
  onSelect,
  onEquip,
  onSell,
  style,
}: EquipmentCellProps) {
  const { showItemInfo, hideItemInfo, updateMouse, showPinnedItemInfo, hidePinnedItemInfo } = useInfoWindow()
  const [hovered, setHovered] = useState(false)
  const highLevelGlow = equip.level >= 7 ? `0 0 ${equip.level + 3}px rgba(255,0,0,0.66)` : undefined
  const equipmentSpriteName = getEquipmentSpriteName(equip)
  const active = selected || hovered

  const getCandidateHtml = () =>
    getDescription ? getDescription(equip) : equip?.getDescription ? equip.getDescription() : undefined
  const getCompareHtml = () =>
    currentEquip && currentEquip !== equip ? currentEquip.getDescription?.() : undefined

  const handleHover = (event: ReactMouseEvent) => {
    updateMouse(event.clientX, event.clientY)
    const candidateHtml = getCandidateHtml()
    if (candidateHtml) showItemInfo(candidateHtml, getCompareHtml())
  }

  const actionButton = (kind: 'equip' | 'sell', label: string, handler?: (equip: any, event: ReactMouseEvent) => void) => (
    <ButtonCell
      width={20}
      height={20}
      aria-label={kind}
      disabled={disabled}
      onClick={event => {
        event.stopPropagation()
        handler?.(equip, event)
      }}
      before={
        <span style={tinyButtonStyle(false)}>
          {label}
        </span>
      }
      after={
        <span style={tinyButtonStyle(true)}>
          {label}
        </span>
      }
    />
  )

  return (
    <div
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={event => {
        if (!disabled) {
          onSelect?.(equip, event)
          if (!selected) {
            setHovered(true)
            const candidateHtml = getCandidateHtml()
            const compareHtml = getCompareHtml()
            if (candidateHtml) {
              // Pinned panel: position to the LEFT of the cell when possible
              const rect = event.currentTarget.getBoundingClientRect()
              const totalWidth = compareHtml ? 344 : 168 // approximate panel widths
              const x = rect.left - totalWidth - 8
              showPinnedItemInfo(candidateHtml, compareHtml, x, rect.top)
            }
          } else {
            setHovered(false)
            hidePinnedItemInfo()
          }
        }
      }}
      onKeyDown={event => {
        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onSelect?.(equip, event as unknown as ReactMouseEvent)
        }
      }}
      onMouseEnter={event => {
        setHovered(true)
        handleHover(event)
      }}
      onMouseMove={handleHover}
      onMouseLeave={() => {
        setHovered(false)
        hideItemInfo()
      }}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1 }}
    >
      <BasicCell width="100%" height={50} bordered style={equipmentFaceStyle(active, active, highLevelGlow, style)}>
        <span style={iconStyle(active, highLevelGlow)} data-bwe-equipment-icon={equipmentSpriteName}>
          <SpriteImage name={equipmentSpriteName} autoPlay={false} style={equipmentIconImageStyle} />
        </span>
        <span style={nameStyle(active)} dangerouslySetInnerHTML={{ __html: getEquipHtml(equip) }} />
        <span style={actionsStyle}>
          {showEquipAction && actionButton('equip', 'E', onEquip)}
          {actionButton('sell', sellLabel, onSell)}
        </span>
      </BasicCell>
    </div>
  )
}

function tinyButtonStyle(active: boolean): CSSProperties {
  return {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: `1px solid ${BASIC_BORDER}`,
    background: active ? AFTER_BG : BASIC_BG,
    color: '#101020',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
    boxShadow: active ? GLOW : undefined,
  }
}

function equipmentFaceStyle(active: boolean, selected?: boolean, highLevelGlow?: string, extra?: CSSProperties): CSSProperties {
  return {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '42px minmax(0, 1fr) 48px',
    alignItems: 'center',
    gap: 8,
    padding: '8px 6px 8px 10px',
    background: active ? AFTER_BG : BASIC_BG,
    boxShadow: selected ? `${GLOW}${highLevelGlow ? `, ${highLevelGlow}` : ''}` : highLevelGlow,
    ...extra,
  }
}

const equipmentIconImageStyle: CSSProperties = {
  width: 30,
  height: 30,
  objectFit: 'contain',
  display: 'block',
  pointerEvents: 'none',
}

function iconStyle(active: boolean, highLevelGlow?: string): CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: `1px solid ${BASIC_BORDER}`,
    background: active ? '#fff' : 'rgba(255,255,255,0.8)',
    color: '#101020',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: active ? GLOW : highLevelGlow,
    flexShrink: 0,
  }
}

function nameStyle(active: boolean): CSSProperties {
  return {
    minWidth: 0,
    color: active ? '#fff' : '#101020',
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    filter: active ? 'drop-shadow(0 0 5px rgba(255,255,255,0.66))' : undefined,
  }
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  justifyContent: 'flex-end',
}

interface ScrollListProps {
  items: any[]
  maxHeight?: number
  renderItem: (item: any, index: number) => React.ReactNode
  emptyText?: string
}

export function ScrollList({ items, maxHeight = 300, renderItem, emptyText = 'Empty' }: ScrollListProps) {
  return (
    <div style={{ maxHeight, overflowY: 'auto', overflowX: 'hidden' }}>
      {items.length === 0
        ? <div style={{ textAlign: 'center', color: 'var(--color-text-dim)', padding: 20 }}>{emptyText}</div>
        : items.map((item, i) => <div key={i}>{renderItem(item, i)}</div>)
      }
    </div>
  )
}

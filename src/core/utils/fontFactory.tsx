// ═══ 嵌入字体工厂 ═══
// AS3 原始: iGlobal.Global.getTextField(size, color)
//
// Flash 中通过 Font.registerFont() 注册嵌入字体后，
// getTextField() 创建使用 "RTWS YueGothic Trial Regular" 字体的 TextField。
//
// React/HTML 版本通过 CSS font-family 变量 (--font-game) 实现等价效果，
// 返回 React.CSSProperties 对象，用于内联样式或组件封装。

import React from 'react'

export interface TextFieldOptions {
  size?: number
  color?: string
  bold?: boolean
  center?: boolean
  multiline?: boolean
}

/**
 * 创建文本字段样式对象
 * AS3 原始: Global.getTextField(param1=16, param2=0x7631988)
 *
 * @param size 字号 (AS3 默认 16px)
 * @param color 文字颜色 (AS3 默认 #747474 灰色)
 * @param options 额外选项
 * @returns React.CSSProperties 样式对象
 */
export function getTextFieldStyle(
  size: number = 16,
  color: string = '#747474',
  options: TextFieldOptions = {}
): React.CSSProperties {
  return {
    fontFamily: "var(--font-game), 'Nesobrite Cd', sans-serif",
    fontSize: options.size ?? size,
    color: options.color ?? color,
    fontWeight: options.bold ? 'bold' : 'normal',
    textAlign: options.center ? 'center' : 'left',
    whiteSpace: options.multiline ? 'normal' : 'nowrap',
    wordWrap: 'break-word',
    userSelect: 'none',
    lineHeight: 1.4,
  }
}

/**
 * 嵌入字体 TextField React 组件
 * AS3 原始: Global.getTextField() 返回的 TextField
 *
 * 使用 "var(--font-game)" 字体族，与 Flash 嵌入字体 "RTWS YueGothic Trial Regular" 等价
 */
interface TextFieldProps {
  size?: number
  color?: string
  bold?: boolean
  center?: boolean
  multiline?: boolean
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  as?: keyof JSX.IntrinsicElements
  dangerouslySetInnerHTML?: { __html: string }
}

export function TextField({
  size = 16,
  color = '#747474',
  bold = false,
  center = false,
  multiline = false,
  children,
  style,
  className,
  as: Tag = 'span',
  dangerouslySetInnerHTML,
}: TextFieldProps) {
  const baseStyle = getTextFieldStyle(size, color, { bold, center, multiline })
  return (
    <Tag
      style={{ ...baseStyle, ...style }}
      className={className}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </Tag>
  )
}

/**
 * 获取 AS3 默认字体颜色 (十六进制)
 * AS3 原始: Global.getTextField() 默认 param2=7631988
 */
export const AS3_DEFAULT_FONT_COLOR = '#747474'

/**
 * 字体名称常量，与 AS3 Flash 嵌入字体对应
 * AS3 原始: Font.registerFont(font_nesb) → "RTWS YueGothic Trial Regular"
 */
export const EMBED_FONT_NAME = 'RTWS YueGothic Trial Regular'

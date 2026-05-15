// ═══ 角色形象可视化 (StickFigure) ═══
// AS3 原始: iPanel.iScene.PeopleModel.as
//
// 根据年龄绘制 stick figure，年龄越大身体越高。
// hover/click 时有 glow 发光效果。
// 使用 SVG 替代 AS3 的 Graphics API 绘制。

import React from 'react'

interface StickFigureProps {
  age: number
  selected?: boolean
  onClick?: () => void
  size?: number
}

export function StickFigure({ age, selected = false, onClick, size = 1 }: StickFigureProps) {
  const [hovered, setHovered] = React.useState(false)
  const delta = Math.max(0, age - 10)

  const isActive = selected || hovered

  const figureColor = isActive ? '#ffffff' : '#747474'
  const bgColor = isActive ? 'rgba(180, 130, 60, 0.4)' : 'rgba(100, 80, 50, 0.25)'

  const yOffset = 15 - delta * 3

  const headR = 10
  const headX = 25
  const headY = 30

  const bodyX = 15
  const bodyY = 40
  const bodyW = 20
  const bodyH = 30 + delta

  const leftArmX = 9
  const leftArmY = 40
  const armW = 5
  const armH = 15 + delta * 2

  const rightArmX = 36
  const rightArmY = 40

  const leftLegX = 15
  const leftLegY = 70 + delta
  const legW = 5
  const legH = 8 + delta * 2

  const rightLegX = 30
  const rightLegY = 70 + delta

  const svgW = 50
  const svgH = 100 + delta * 3

  const scale = size

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'filter 0.2s, transform 0.15s',
        filter: isActive
          ? `drop-shadow(0 0 10px rgba(180,150,80,0.7)) drop-shadow(0 0 4px rgba(200,170,100,0.5))`
          : 'none',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <svg
        width={svgW * scale}
        height={svgH * scale}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block' }}
      >
        <g transform={`translate(0, ${yOffset})`}>
          <rect x={0} y={0} width={svgW} height={svgH} fill={bgColor} rx={2} />
          <g fill={figureColor}>
            <circle cx={headX} cy={headY} r={headR} />
            <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} />
            <rect x={leftArmX} y={leftArmY} width={armW} height={armH} />
            <rect x={rightArmX} y={rightArmY} width={armW} height={armH} />
            <rect x={leftLegX} y={leftLegY} width={legW} height={legH} />
            <rect x={rightLegX} y={rightLegY} width={legW} height={legH} />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default StickFigure

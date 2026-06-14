import type { CSSProperties } from 'react'
import { SpriteImage } from './SpriteImage'

const fillLayer: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'fill',
  pointerEvents: 'none',
}

const vortexBaseStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '46%',
  width: '44%',
  height: '18%',
  objectFit: 'fill',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
}

export function MapBackground() {
  return (
    <div
      aria-hidden="true"
      data-bwe-map-background="split"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <span data-bwe-map-layer="base">
        <SpriteImage name="DefineSprite_128" autoPlay={false} style={fillLayer} />
      </span>
      <span data-bwe-map-layer="vortex-134">
        <SpriteImage
          name="DefineSprite_134"
          fps={8}
          loop={true}
          style={{
            ...vortexBaseStyle,
            opacity: 0.95,
          }}
        />
      </span>
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'

type ImageMagnifierProps = {
  src: string
  alt?: string
  zoom?: number
  lensSize?: number
  className?: string
}

export default function ImageMagnifier({
  src,
  alt = 'preview',
  zoom = 2,
  lensSize = 160,
  className = ''
}: ImageMagnifierProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [imgDim, setImgDim] = useState({ w: 0, h: 0 })
  const [showLens, setShowLens] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const i = new Image()
    i.onload = () => setImgDim({ w: i.naturalWidth, h: i.naturalHeight })
    i.src = src
  }, [src])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = Math.max(0, Math.min(x, rect.width))
    const cy = Math.max(0, Math.min(y, rect.height))
    setLensPos({ x: cx, y: cy })
  }

  const rect = wrapperRef.current?.getBoundingClientRect() ?? { width: 0, height: 0 }
  const lensStyle: React.CSSProperties = {
    width: lensSize,
    height: lensSize,
    left: lensPos.x - lensSize / 2,
    top: lensPos.y - lensSize / 2,
    backgroundImage: `url(${src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${rect?.width * zoom}px ${rect?.height * zoom}px`,
    backgroundPosition: `-${lensPos.x * zoom - lensSize / 2}px -${lensPos.y * zoom - lensSize / 2}px`
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setShowLens(true)}
      onMouseLeave={() => setShowLens(false)}
      onMouseMove={handleMove}
      style={{ cursor: 'none' }}
    >
      {/* la imagen base */}
      <img src={src} alt={alt} className="block max-h-[90vh] object-contain rounded-lg shadow" />
      {/* lente */}
      {showLens && imgDim.w > 0 && (
        <div
          className="pointer-events-none absolute rounded-full border border-zinc-300 shadow-lg"
          style={lensStyle}
        />
      )}
    </div>
  )
}

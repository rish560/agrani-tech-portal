import { useEffect, useRef } from 'react'

export function HolographicGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    let time = 0

    const draw = () => {
      time += 0.002
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gridSize = 60
      const perspective = 800
      const horizonY = canvas.height * 0.4

      ctx.strokeStyle = `rgba(100, 220, 255, 0.08)`
      ctx.lineWidth = 0.5

      for (let z = 0; z < 30; z++) {
        const zPos = (z * gridSize + (time * 100) % gridSize)
        const scale = perspective / (perspective + zPos)
        const y = horizonY + (canvas.height - horizonY) * (1 - scale)
        
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.globalAlpha = scale * 0.4
        ctx.stroke()
      }

      const numLines = 40
      for (let i = 0; i < numLines; i++) {
        const x = (i / numLines) * canvas.width
        const centerOffset = Math.abs(x - canvas.width / 2) / (canvas.width / 2)
        
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2, horizonY)
        ctx.lineTo(x, canvas.height)
        ctx.globalAlpha = (1 - centerOffset * 0.7) * 0.15
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ zIndex: 0 }}
    />
  )
}

import { useEffect, useRef } from 'react'

interface DataNode {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  pulsePhase: number
  connections: number[]
}

export function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const nodesRef = useRef<DataNode[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initNodes()
    }

    const initNodes = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 25000)
      nodesRef.current = []

      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          pulsePhase: Math.random() * Math.PI * 2,
          connections: []
        })
      }

      nodesRef.current.forEach((node, i) => {
        const connectionCount = Math.floor(Math.random() * 3) + 1
        for (let j = 0; j < connectionCount; j++) {
          const targetIdx = Math.floor(Math.random() * nodesRef.current.length)
          if (targetIdx !== i && !node.connections.includes(targetIdx)) {
            node.connections.push(targetIdx)
          }
        }
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)

    let time = 0

    const draw = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const nodes = nodesRef.current

      nodes.forEach((node, i) => {
        node.connections.forEach(targetIdx => {
          const target = nodes[targetIdx]
          if (!target) return

          const dx = target.x - node.x
          const dy = target.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            const opacity = (1 - distance / 200) * 0.15

            const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y)
            gradient.addColorStop(0, `rgba(100, 220, 255, ${opacity})`)
            gradient.addColorStop(0.5, `rgba(160, 120, 255, ${opacity * 1.5})`)
            gradient.addColorStop(1, `rgba(100, 220, 255, ${opacity})`)

            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(target.x, target.y)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.5
            ctx.stroke()

            const pulsePos = (Math.sin(time * 2 + i) + 1) / 2
            const pulseX = node.x + dx * pulsePos
            const pulseY = node.y + dy * pulsePos

            ctx.beginPath()
            ctx.arc(pulseX, pulseY, 1.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(100, 220, 255, ${opacity * 3})`
            ctx.fill()
          }
        })
      })

      nodes.forEach(node => {
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 0.7
        const size = node.size * pulse

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 3)
        gradient.addColorStop(0, `rgba(100, 220, 255, ${0.8 * pulse})`)
        gradient.addColorStop(0.5, `rgba(160, 120, 255, ${0.3 * pulse})`)
        gradient.addColorStop(1, 'rgba(100, 220, 255, 0)')

        ctx.beginPath()
        ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 240, 255, ${0.9 * pulse})`
        ctx.fill()

        node.x += node.vx
        node.y += node.vy

        const dx = mouseRef.current.x - node.x
        const dy = mouseRef.current.y - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          node.vx += (dx / dist) * 0.02
          node.vy += (dy / dist) * 0.02
        }

        node.vx *= 0.99
        node.vy *= 0.99

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1
        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

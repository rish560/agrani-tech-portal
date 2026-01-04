import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

interface ParticleBackgroundProps {
  density?: number
  speed?: number
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'mixed'
  connectionDistance?: number
  className?: string
}

export function ParticleBackground({ 
  density = 0.00008,
  speed = 0.3,
  colorScheme = 'mixed',
  connectionDistance = 150,
  className = ''
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const mouseRef = useRef({ x: 0, y: 0, isActive: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) * density)
      particlesRef.current = []

      const getHue = () => {
        switch (colorScheme) {
          case 'primary':
            return 270
          case 'secondary':
            return 210
          case 'accent':
            return 330
          case 'mixed':
          default:
            return Math.random() > 0.5 ? (Math.random() > 0.5 ? 270 : 210) : 330
        }
      }

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          hue: getHue()
        })
      }
    }

    const drawParticle = (particle: Particle) => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${particle.hue}, 65%, 60%, ${particle.opacity})`
      ctx.fill()
    }

    const drawConnection = (p1: Particle, p2: Particle, distance: number) => {
      const opacity = (1 - distance / connectionDistance) * 0.3
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      
      const avgHue = (p1.hue + p2.hue) / 2
      ctx.strokeStyle = `hsla(${avgHue}, 65%, 60%, ${opacity})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    const updateParticle = (particle: Particle) => {
      particle.x += particle.vx
      particle.y += particle.vy

      if (mouseRef.current.isActive) {
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          const force = (150 - distance) / 150
          particle.vx += (dx / distance) * force * 0.1
          particle.vy += (dy / distance) * force * 0.1
        }
      }

      const damping = 0.99
      particle.vx *= damping
      particle.vy *= damping

      const maxSpeed = speed * 2
      const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
      if (currentSpeed > maxSpeed) {
        particle.vx = (particle.vx / currentSpeed) * maxSpeed
        particle.vy = (particle.vy / currentSpeed) * maxSpeed
      }

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      for (let i = 0; i < particles.length; i++) {
        updateParticle(particles[i])
        drawParticle(particles[i])

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            drawConnection(particles[i], particles[j], distance)
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        isActive: true
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false
    }

    resizeCanvas()
    animate()

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [density, speed, colorScheme, connectionDistance])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  )
}

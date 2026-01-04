import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  trail: { x: number; y: number; opacity: number }[]
}

interface SectionParticlesProps {
  sectionId: string
  density?: number
  speed?: number
  colorScheme?: 'primary' | 'secondary' | 'accent'
  showTrails?: boolean
}

export function SectionParticles({ 
  sectionId,
  density = 0.00005,
  speed = 0.2,
  colorScheme = 'primary',
  showTrails = false
}: SectionParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const section = document.getElementById(sectionId)
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [sectionId])

  useEffect(() => {
    if (!isVisible) return

    const canvas = canvasRef.current
    const section = document.getElementById(sectionId)
    if (!canvas || !section) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      const rect = section.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      initParticles()
    }

    const getHue = () => {
      switch (colorScheme) {
        case 'primary':
          return 270
        case 'secondary':
          return 210
        case 'accent':
          return 330
        default:
          return 270
      }
    }

    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) * density)
      particlesRef.current = []

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.2,
          hue: getHue(),
          trail: []
        })
      }
    }

    const drawParticle = (particle: Particle) => {
      if (showTrails && particle.trail.length > 0) {
        particle.trail.forEach((point, index) => {
          const trailOpacity = point.opacity * (index / particle.trail.length)
          ctx.beginPath()
          ctx.arc(point.x, point.y, particle.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${particle.hue}, 65%, 60%, ${trailOpacity})`
          ctx.fill()
        })
      }

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      )
      gradient.addColorStop(0, `hsla(${particle.hue}, 65%, 70%, ${particle.opacity})`)
      gradient.addColorStop(1, `hsla(${particle.hue}, 65%, 60%, 0)`)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    const updateParticle = (particle: Particle) => {
      if (showTrails) {
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity })
        if (particle.trail.length > 10) {
          particle.trail.shift()
        }
      }

      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -1
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -1
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))
      }

      particle.opacity = Math.sin(Date.now() * 0.001 + particle.x) * 0.2 + 0.3
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      for (const particle of particles) {
        updateParticle(particle)
        drawParticle(particle)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    updateCanvasSize()
    animate()

    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVisible, density, speed, colorScheme, showTrails, sectionId])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  )
}

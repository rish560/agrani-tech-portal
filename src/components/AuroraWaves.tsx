import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

export function AuroraWaves() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  
  const wave1Hue = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [270, 210, 330, 270, 240])
  const wave2Hue = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [210, 330, 270, 210, 300])
  const wave3Hue = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [330, 270, 210, 330, 270])
  
  const wave1Y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const wave2Y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])
  const wave3Y = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  
  const wave1X = useTransform(scrollYProgress, [0, 1], ['-50%', '-60%'])
  const wave2X = useTransform(scrollYProgress, [0, 1], ['50%', '40%'])
  const wave3X = useTransform(scrollYProgress, [0, 1], ['-50%', '-45%'])
  
  const wave1Scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.3, 0.9])
  const wave2Scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 1.4])
  const wave3Scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.5, 1.1])
  
  const wave1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.6, 0.8, 0.7, 0.5])
  const wave2Opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.5, 0.7, 0.8, 0.6])
  const wave3Opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.4, 0.6, 0.5, 0.7])

  const wave1Bg = useTransform(wave1Hue, (hue) => `oklch(0.6 0.25 ${hue})`)
  const wave2Bg = useTransform(wave2Hue, (hue) => `oklch(0.65 0.20 ${hue})`)
  const wave3Bg = useTransform(wave3Hue, (hue) => `oklch(0.7 0.22 ${hue})`)
  
  const gradientBg = useTransform(
    [wave1Hue, wave2Hue, wave3Hue],
    ([h1, h2, h3]) => `linear-gradient(135deg, 
      oklch(0.5 0.25 ${h1}) 0%,
      oklch(0.6 0.20 ${h2}) 50%,
      oklch(0.7 0.22 ${h3}) 100%
    )`
  )
  
  const gradientOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0.25, 0.20])
  
  const wave4Scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const wave4Opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.5, 0.4])
  const wave4Bg = useTransform(wave1Hue, (hue) => `oklch(0.75 0.18 ${hue + 60})`)
  
  const wave5Scale = useTransform(scrollYProgress, [0, 1], [1.1, 0.9])
  const wave5Opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.6, 0.5])
  const wave5Bg = useTransform(wave2Hue, (hue) => `oklch(0.68 0.23 ${hue - 30})`)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute w-[1200px] h-[800px] rounded-full blur-[120px]"
        style={{
          top: '10%',
          left: wave1X,
          y: wave1Y,
          scale: wave1Scale,
          opacity: wave1Opacity,
          background: wave1Bg,
        }}
      />
      
      <motion.div
        className="absolute w-[1000px] h-[1000px] rounded-full blur-[140px]"
        style={{
          top: '25%',
          left: wave2X,
          y: wave2Y,
          scale: wave2Scale,
          opacity: wave2Opacity,
          background: wave2Bg,
        }}
      />
      
      <motion.div
        className="absolute w-[1400px] h-[700px] rounded-full blur-[100px]"
        style={{
          top: '50%',
          left: wave3X,
          y: wave3Y,
          scale: wave3Scale,
          opacity: wave3Opacity,
          background: wave3Bg,
        }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: gradientBg,
          opacity: gradientOpacity,
          mixBlendMode: 'overlay',
        }}
      />
      
      <motion.div
        className="absolute w-[900px] h-[900px] rounded-full blur-[160px]"
        style={{
          bottom: '10%',
          right: '-20%',
          scale: wave4Scale,
          opacity: wave4Opacity,
          background: wave4Bg,
        }}
      />
      
      <motion.div
        className="absolute w-[800px] h-[600px] rounded-full blur-[130px]"
        style={{
          bottom: '30%',
          left: '-10%',
          scale: wave5Scale,
          opacity: wave5Opacity,
          background: wave5Bg,
        }}
      />
    </div>
  )
}

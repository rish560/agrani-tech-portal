import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check } from '@phosphor-icons/react'

interface LoadingScreenProps {
  onComplete: () => void
}

interface LoadingStep {
  id: string
  label: string
  status: 'pending' | 'loading' | 'complete'
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [steps, setSteps] = useState<LoadingStep[]>([
    { id: 'init', label: 'Initializing application', status: 'pending' },
    { id: 'assets', label: 'Loading visual assets', status: 'pending' },
    { id: 'neural', label: 'Preparing animations', status: 'pending' },
    { id: 'security', label: 'Establishing connection', status: 'pending' },
    { id: 'ui', label: 'Rendering interface', status: 'pending' },
  ])

  useEffect(() => {
    const loadAssets = async () => {
      setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'loading' } : s))
      
      await new Promise(resolve => setTimeout(resolve, 400))
      setProgress(15)
      setSteps(prev => prev.map((s, i) => 
        i === 0 ? { ...s, status: 'complete' } : 
        i === 1 ? { ...s, status: 'loading' } : s
      ))
      setCurrentStepIndex(1)

      const images = document.querySelectorAll('img')
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise(resolve => {
          img.onload = resolve
          img.onerror = resolve
        })
      })
      
      await Promise.race([
        Promise.all(imagePromises),
        new Promise(resolve => setTimeout(resolve, 600))
      ])
      
      setProgress(35)
      setSteps(prev => prev.map((s, i) => 
        i <= 1 ? { ...s, status: 'complete' } : 
        i === 2 ? { ...s, status: 'loading' } : s
      ))
      setCurrentStepIndex(2)

      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(55)
      setSteps(prev => prev.map((s, i) => 
        i <= 2 ? { ...s, status: 'complete' } : 
        i === 3 ? { ...s, status: 'loading' } : s
      ))
      setCurrentStepIndex(3)

      try {
        await window.spark.user()
      } catch {
      }
      
      await new Promise(resolve => setTimeout(resolve, 400))
      setProgress(80)
      setSteps(prev => prev.map((s, i) => 
        i <= 3 ? { ...s, status: 'complete' } : 
        i === 4 ? { ...s, status: 'loading' } : s
      ))
      setCurrentStepIndex(4)

      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(true)
        } else {
          window.addEventListener('load', () => resolve(true), { once: true })
          setTimeout(() => resolve(true), 500)
        }
      })
      
      setProgress(100)
      setSteps(prev => prev.map(s => ({ ...s, status: 'complete' })))
      
      await new Promise(resolve => setTimeout(resolve, 600))
      onComplete()
    }

    loadAssets()
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <div className="absolute inset-0 grid-futuristic opacity-20" />
      
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            style={{
              left: `${5 + i * 5}%`,
              height: '100%',
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ 
              scaleY: progress > i * 5 ? 1 : 0,
              opacity: progress > i * 5 ? 0.5 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent"
            style={{
              top: `${10 + i * 6}%`,
              width: '100%',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: progress > i * 7 ? 1 : 0,
              opacity: progress > i * 7 ? 0.3 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, oklch(0.75 0.18 195 / 0.15) 0%, transparent 70%)',
        }}
        animate={{ 
          scale: 0.5 + (progress / 100) * 1.5,
          opacity: progress < 100 ? 0.4 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.4, 0.25, 1],
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.22 280 / 0.1) 0%, transparent 70%)',
        }}
        animate={{ 
          scale: 0.3 + (progress / 100) * 2,
          opacity: progress < 100 ? 0.3 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.4, 0.25, 1],
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="absolute -inset-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, oklch(0.75 0.18 195 / 0.2) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            className="relative z-10"
          >
            <motion.circle
              cx="40"
              cy="40"
              r="35"
              stroke="url(#loadingGradient)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: progress / 100, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            />
            <motion.circle
              cx="40"
              cy="40"
              r="28"
              stroke="url(#loadingGradient2)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: progress / 100, opacity: 0.6 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            />
            <motion.path
              d="M40 20 L40 25 M40 55 L40 60 M20 40 L25 40 M55 40 L60 40"
              stroke="oklch(0.75 0.18 195)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: progress > 20 ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M26 26 L30 30 M50 50 L54 54 M26 54 L30 50 M50 30 L54 26"
              stroke="oklch(0.70 0.22 280)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: progress > 50 ? 0.6 : 0.2 }}
              transition={{ duration: 0.3 }}
            />
            <defs>
              <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.75 0.18 195)" />
                <stop offset="50%" stopColor="oklch(0.70 0.22 280)" />
                <stop offset="100%" stopColor="oklch(0.80 0.15 160)" />
              </linearGradient>
              <linearGradient id="loadingGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.70 0.22 280)" />
                <stop offset="100%" stopColor="oklch(0.75 0.18 195)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl font-medium tracking-tight mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="holo-text">AGRANI DIGITAL</span>
          </motion.h1>
          
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <motion.div
              className="w-8 h-px bg-gradient-to-r from-transparent to-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            />
            <span className="mono-text text-[10px] text-muted-foreground tracking-[0.3em]">
              {progress < 100 ? 'INITIALIZING' : 'READY'}
            </span>
            <motion.div
              className="w-8 h-px bg-gradient-to-l from-transparent to-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="relative w-64 h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ 
                duration: 0.3,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            />
            <motion.div
              className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '600%'] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          
          <motion.div
            className="mono-text text-xs text-primary font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {progress}%
          </motion.div>

          <motion.div
            className="mt-4 space-y-2 w-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: index <= currentStepIndex ? 1 : 0.3,
                  x: 0 
                }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {step.status === 'complete' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check size={14} weight="bold" className="text-accent" />
                    </motion.div>
                  ) : step.status === 'loading' ? (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className={`mono-text text-[10px] tracking-wide ${
                  step.status === 'complete' ? 'text-foreground' :
                  step.status === 'loading' ? 'text-primary' :
                  'text-muted-foreground/50'
                }`}>
                  {step.label.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute -bottom-24 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress < 100 ? 1 : 0 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/50"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          style={{
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: progress > i * 15 ? [0, 1, 0] : 0,
            scale: progress > i * 15 ? [0, 1.5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  )
}

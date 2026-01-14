import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloudArrowUp, 
  Brain, 
  ShieldCheck, 
  Database,
  Users,
  ArrowRight,
  CaretDown,
  CaretLeft,
  CaretRight,
  CircleNotch,
  List,
  X
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { HolographicGrid } from '@/components/HolographicGrid'
import { NeuralNetwork } from '@/components/NeuralNetwork'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useKV } from '@github/spark/hooks'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('home')
  const [currentPage, setCurrentPage] = useState(0)
  const [isTickerPaused, setIsTickerPaused] = useState(false)
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageDirection, setPageDirection] = useState(1)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Set light theme permanently
  useEffect(() => {
    document.documentElement.classList.add('light')
  }, [])
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    timeline: '',
    budget: '',
    message: ''
  })

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about-us', 'expertise', 'solutions', 'case-studies', 'careers', 'blogs', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.service || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const user = await window.spark.user()
      
      const promptText = `Generate a professional email notification for a new consultation request. Format it as a plain text email with the following information:

From: ${formData.fullName} (${formData.email})
Company: ${formData.company || 'Not provided'}
Phone: ${formData.phone || 'Not provided'}
Service Interest: ${formData.service}
Project Timeline: ${formData.timeline || 'Not specified'}
Estimated Budget: ${formData.budget || 'Not specified'}
Project Details: ${formData.message}

Format this as a clear, professional email that I would receive in my inbox. Include a subject line at the top starting with "Subject:". Make it concise and easy to scan.`

      const emailContent = await window.spark.llm(promptText, 'gpt-4o-mini')
      
      const timestamp = new Date().toISOString()
      const submissionKey = `consultation-${timestamp}`
      
      const recipientEmail = 'consult@agrani.digital'
      
      await window.spark.kv.set(submissionKey, {
        ...formData,
        timestamp,
        emailContent,
        recipientEmail
      })

      console.log('📧 Consultation Request Submitted')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(emailContent)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`\n📬 Email would be sent to: ${recipientEmail}`)
      console.log(`💾 Request saved with key: ${submissionKey}\n`)

      toast.success('Request transmitted successfully')
      
      setFormData({
        fullName: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        timeline: '',
        budget: '',
        message: ''
      })
      
      setTimeout(() => {
        setIsContactDrawerOpen(false)
      }, 1500)
      
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Transmission failed. Please retry.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const solutions = [
    {
      icon: CloudArrowUp,
      title: 'Digital Transformation',
      description: 'Modern cloud architecture for scalable enterprise solutions',
      details: [
        'Cloud-native infrastructure design',
        'Edge computing deployment',
        'CI/CD pipeline automation',
        'Microservices architecture',
        'API ecosystem development',
        'Legacy system modernization'
      ],
      technologies: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform']
    },
    {
      icon: Database,
      title: 'Data Intelligence',
      description: 'Real-time analytics powering data-driven decisions',
      details: [
        'Enterprise data warehousing',
        'Streaming analytics pipelines',
        'Data governance frameworks',
        'Business intelligence dashboards',
        'Advanced data visualization',
        'ETL/ELT optimization'
      ],
      technologies: ['Snowflake', 'Databricks', 'Apache Spark', 'dbt', 'Tableau']
    },
    {
      icon: Brain,
      title: 'AI & Machine Learning',
      description: 'Intelligent automation with cutting-edge AI solutions',
      details: [
        'Custom ML model development',
        'Natural language processing',
        'Computer vision solutions',
        'Predictive analytics',
        'MLOps implementation',
        'Responsible AI practices'
      ],
      technologies: ['OpenAI', 'TensorFlow', 'PyTorch', 'Hugging Face', 'Vertex AI']
    },
    {
      icon: ShieldCheck,
      title: 'Cybersecurity',
      description: 'Comprehensive security for zero-trust environments',
      details: [
        'Security architecture design',
        'Threat detection & response',
        'Identity & access management',
        'SOC implementation',
        'Compliance automation',
        'Penetration testing'
      ],
      technologies: ['CrowdStrike', 'Splunk', 'Okta', 'Palo Alto', 'Zscaler']
    }
  ]

  const bookPages = [
    {
      title: 'Cloud Architecture',
      icon: CloudArrowUp,
      content: 'Seamless multi-cloud orchestration with high availability',
      details: [
        'Hybrid cloud deployments',
        'Auto-scaling infrastructure',
        'Cost optimization strategies',
        'Disaster recovery planning'
      ]
    },
    {
      title: 'Data Analytics',
      icon: Database,
      content: 'Transform raw data into actionable business insights',
      details: [
        'Real-time data pipelines',
        'Data quality management',
        'Predictive modeling',
        'Interactive dashboards'
      ]
    },
    {
      title: 'DevOps Excellence',
      icon: Users,
      content: 'Accelerate delivery with modern DevOps practices',
      details: [
        'CI/CD pipeline design',
        'Infrastructure as Code',
        'Monitoring & observability',
        'GitOps workflows'
      ]
    },
    {
      title: 'Security Operations',
      icon: ShieldCheck,
      content: 'Enterprise-grade protection with proactive threat management',
      details: [
        'Zero-trust architecture',
        'SIEM implementation',
        'Incident response',
        'Compliance frameworks'
      ]
    }
  ]

  const nextPage = () => {
    if (currentPage < bookPages.length - 1) {
      setPageDirection(1)
      setCurrentPage(prev => prev + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setPageDirection(-1)
      setCurrentPage(prev => prev - 1)
    }
  }

  const caseStudies = [
    {
      company: 'Global Financial Services',
      industry: 'FinTech',
      challenge: 'Legacy systems blocking real-time transaction processing',
      solution: 'Cloud-native migration with modern microservices architecture',
      results: [
        '99.99% uptime achieved',
        '< 50ms transaction latency',
        'Zero-downtime deployments'
      ],
      technologies: ['AWS', 'Kubernetes', 'Redis']
    },
    {
      company: 'Healthcare Network Alpha',
      industry: 'Healthcare',
      challenge: 'Fragmented patient data across 200+ facilities',
      solution: 'Unified data lake with privacy-preserving analytics',
      results: [
        'Unified patient records',
        '60% faster diagnosis',
        '100% HIPAA compliance'
      ],
      technologies: ['Snowflake', 'Azure', 'Databricks']
    },
    {
      company: 'Retail Dynamics Corp',
      industry: 'Retail',
      challenge: 'Inability to predict demand in volatile market conditions',
      solution: 'ML-powered demand forecasting with real-time inventory sync',
      results: [
        '95% forecast accuracy',
        '40% reduction in waste',
        'Real-time inventory tracking'
      ],
      technologies: ['OpenAI', 'AWS', 'Tableau']
    },
    {
      company: 'Industrial Automation Ltd',
      industry: 'Manufacturing',
      challenge: 'Critical infrastructure vulnerable to cyber threats',
      solution: 'Zero-trust security architecture with 24/7 SOC',
      results: [
        'Zero breaches post-deployment',
        '99% threat detection rate',
        'Automated compliance reporting'
      ],
      technologies: ['CrowdStrike', 'Splunk', 'Okta']
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>
      
      <HolographicGrid />
      <NeuralNetwork />
      <Toaster />

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg shadow-md border-b bg-white/90 border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => scrollToSection('home')}
              className="group relative"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center"
              >
                <img 
                  src="/logo.png" 
                  alt="AGRANI DIGITAL" 
                  className="h-24 w-auto"
                />
              </motion.div>
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-cyan-100/60 hover:bg-cyan-200/60 border border-cyan-200 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={22} weight="bold" className="text-slate-900" />
                ) : (
                  <List size={22} weight="bold" className="text-slate-900" />
                )}
              </motion.button>
            
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-8">
                {['About Us', 'Expertise', 'Solutions', 'Case Studies', 'Careers', 'Blogs', 'Contact'].map((section) => (
                  <motion.button
                    key={section}
                    onClick={() => scrollToSection(section.toLowerCase().replace(' ', '-'))}
                    className={`text-base font-semibold tracking-wide relative transition-all ${
                      activeSection === section.toLowerCase().replace(' ', '-')
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mono-text text-xs">{section.toUpperCase()}</span>
                    {activeSection === section.toLowerCase().replace(' ', '-') && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-1">
                  {['About Us', 'Expertise', 'Solutions', 'Case Studies', 'Careers', 'Blogs', 'Contact'].map((section) => (
                    <motion.button
                      key={section}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setTimeout(() => {
                          scrollToSection(section.toLowerCase().replace(' ', '-'))
                        }, 300)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.toLowerCase().replace(' ', '-')
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="mono-text text-sm">{section.toUpperCase()}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <section id="home" className="min-h-screen flex items-center justify-center px-6 relative">
        <div className="absolute inset-0 grid-futuristic opacity-30" />
        
        <div className="max-w-5xl w-full pt-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2 glass-panel rounded-full mb-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
              <span className="mono-text text-sm text-muted-foreground tracking-widest font-medium">BORN IN THE CLOUD</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6">
              <span className="block holo-text">
                AGRANI
              </span>
              <span className="block text-foreground/90 mt-2">
                DIGITAL
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-16 font-normal leading-relaxed"
            >
              Pioneering the intersection of{' '}
              <span className="text-primary">cloud technology</span>,{' '}
              <span className="text-secondary">artificial intelligence</span>, and{' '}
              <span className="text-accent">enterprise security</span>
            </motion.p>

            {/* Vision and Mission Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16"
            >
              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="neo-card rounded-xl p-8 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain size={20} weight="duotone" className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Our Vision</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    To empower organizations worldwide to thrive in the digital era by delivering 
                    <span className="text-primary font-medium"> secure</span>,
                    <span className="text-secondary font-medium"> intelligent</span>, and
                    <span className="text-accent font-medium"> scalable</span> technology platforms 
                    that drive innovation, efficiency, and sustainable growth.
                  </p>
                </div>
              </motion.div>

              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="neo-card rounded-xl p-8 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck size={20} weight="duotone" className="text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base mb-4">
                    We simplify complex digital challenges by partnering with enterprises to deliver:
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Strategic digital transformation roadmaps',
                      'Robust cloud & data platforms',
                      'Responsible AI solutions',
                      'Enterprise-grade cybersecurity'
                    ].map((item, idx) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + idx * 0.1, duration: 0.4 }}
                        className="flex items-start gap-3 group/item"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary mt-2 group-hover/item:scale-150 transition-transform" />
                        <span className="text-foreground/90 text-sm font-medium">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground/80 mt-4 italic">
                    Business-led. Technology-driven. Results-focused.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <AnimatePresence mode="wait" custom={pageDirection}>
              <motion.div
                key={currentPage}
                custom={pageDirection}
                initial={{ opacity: 0, x: pageDirection > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: pageDirection > 0 ? -60 : 60 }}
                transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                className="neo-card rounded-xl p-8 sm:p-10 holo-border"
              >
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center glow-cyan">
                    {(() => {
                      const Icon = bookPages[currentPage].icon
                      return <Icon size={28} weight="light" className="text-primary" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-foreground">
                      {bookPages[currentPage].title}
                    </h2>
                    <p className="text-muted-foreground font-normal text-lg">
                      {bookPages[currentPage].content}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {bookPages[currentPage].details.map((detail, idx) => (
                    <motion.div
                      key={detail}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05, duration: 0.3 }}
                      className="flex items-start gap-3 glass-panel rounded-lg p-4 group hover:border-primary/40 transition-colors"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary mt-2 group-hover:w-2 transition-all" />
                      <span className="text-sm text-foreground/80 font-light">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <motion.button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-5 py-2.5 glass-panel rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 transition-all"
                whileHover={currentPage !== 0 ? { x: -2 } : {}}
                whileTap={currentPage !== 0 ? { scale: 0.98 } : {}}
              >
                <CaretLeft size={16} weight="light" />
                <span className="mono-text text-xs">PREV</span>
              </motion.button>

              <div className="flex gap-2">
                {bookPages.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      setPageDirection(idx > currentPage ? 1 : -1)
                      setCurrentPage(idx)
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentPage 
                        ? 'bg-gradient-to-r from-primary to-secondary w-8' 
                        : 'bg-border w-1.5 hover:bg-primary/50 hover:w-3'
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>

              <motion.button
                onClick={nextPage}
                disabled={currentPage === bookPages.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 glass-panel rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 transition-all"
                whileHover={currentPage !== bookPages.length - 1 ? { x: 2 } : {}}
                whileTap={currentPage !== bookPages.length - 1 ? { scale: 0.98 } : {}}
              >
                <span className="mono-text text-xs">NEXT</span>
                <CaretRight size={16} weight="light" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  onClick={() => scrollToSection('solutions')}
                  className="futuristic-button text-base font-semibold tracking-wide px-8"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    EXPLORE SOLUTIONS
                    <ArrowRight size={16} weight="light" />
                  </span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setIsContactDrawerOpen(true)}
                  className="glass-panel border-primary/30 hover:border-primary/60 text-base font-semibold tracking-wide px-8"
                >
                  INITIATE CONTACT
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          onClick={() => scrollToSection('solutions')}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          whileHover={{ y: -2 }}
        >
          <span className="mono-text text-[10px] tracking-widest">SCROLL</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <CaretDown size={20} weight="light" />
          </motion.div>
        </motion.button>
      </section>

      <section id="solutions" className="py-32 px-6 relative">
        <div className="absolute inset-0 grid-dots opacity-20" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <span className="mono-text text-sm text-primary tracking-widest mb-4 block font-semibold">CAPABILITIES</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Solutions
            </h2>
            <p className="text-muted-foreground font-light max-w-xl">
              Enterprise-grade technology solutions designed for modern businesses
            </p>
          </motion.div>

          <div className="space-y-6">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="neo-card border-0 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-[auto,1fr] gap-8">
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
                          <solution.icon size={24} className="text-primary" weight="light" />
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-semibold mb-2 text-foreground">{solution.title}</h3>
                          <p className="text-muted-foreground font-normal text-base">{solution.description}</p>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-2">
                          {solution.details.map((detail) => (
                            <div key={detail} className="flex items-start gap-2 text-base text-foreground/70 font-normal">
                              <div className="w-1 h-1 rounded-full bg-primary/60 mt-2" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {solution.technologies.map((tech) => (
                            <span 
                              key={tech}
                              className="mono-text text-[10px] px-3 py-1.5 glass-panel rounded-full text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onClick={() => scrollToSection('case-studies')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <CaretDown size={20} weight="light" />
          </motion.div>
        </motion.button>
      </section>

      <section id="case-studies" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
        
        <div className="max-w-5xl mx-auto px-6 mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mono-text text-sm text-secondary tracking-widest mb-4 block font-semibold">CASE STUDIES</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Client Outcomes
            </h2>
            <p className="text-muted-foreground font-light max-w-xl">
              Transformative results across industries
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -1 * (caseStudies.length * 400)] }}
            transition={{
              x: { repeat: Infinity, repeatType: "loop", duration: 50, ease: "linear" }
            }}
            style={{ animationPlayState: isTickerPaused ? 'paused' : 'running' }}
            onMouseEnter={() => setIsTickerPaused(true)}
            onMouseLeave={() => setIsTickerPaused(false)}
          >
            {[...caseStudies, ...caseStudies].map((study, index) => (
              <motion.div
                key={`${study.company}-${index}`}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="neo-card border-0 flex-shrink-0 w-[380px]">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-foreground">{study.company}</h3>
                      <span className="mono-text text-[10px] px-2.5 py-1 glass-panel rounded-full text-muted-foreground">
                        {study.industry}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="mono-text text-[10px] text-muted-foreground tracking-wider block mb-1">CHALLENGE</span>
                        <p className="text-base text-foreground/70 font-normal">{study.challenge}</p>
                      </div>

                      <div>
                        <span className="mono-text text-[10px] text-muted-foreground tracking-wider block mb-1">SOLUTION</span>
                        <p className="text-base text-foreground/70 font-normal">{study.solution}</p>
                      </div>

                      <div>
                        <span className="mono-text text-[10px] text-muted-foreground tracking-wider block mb-2">RESULTS</span>
                        <div className="space-y-1.5">
                          {study.results.map((result) => (
                            <div key={result} className="flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-accent mt-2" />
                              <span className="text-base text-foreground font-normal">{result}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {study.technologies.map((tech) => (
                          <span key={tech} className="mono-text text-[9px] px-2 py-1 glass-panel rounded text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          className="text-center mt-20 px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center gap-16">
            {[
              { value: '100+', label: 'PROJECTS' },
              { value: '$2B+', label: 'CLIENT VALUE' },
              { value: '98%', label: 'SATISFACTION' }
            ].map((stat) => (
              <motion.div key={stat.label} whileHover={{ y: -2 }} className="cursor-pointer">
                <div className="text-4xl font-bold holo-text mb-1">{stat.value}</div>
                <div className="mono-text text-[10px] text-muted-foreground tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="contact" className="py-32 px-6 relative">
        <div className="absolute inset-0 grid-futuristic opacity-20" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mono-text text-sm text-accent tracking-widest mb-4 block font-semibold">CONNECT</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Begin Your Transformation
            </h2>
            <p className="text-muted-foreground font-light mb-10 max-w-lg mx-auto">
              Ready to modernize your enterprise technology infrastructure
            </p>
          </motion.div>
          
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg"
              className="futuristic-button font-semibold tracking-wide px-10 py-6 text-lg"
              onClick={() => setIsContactDrawerOpen(true)}
            >
              <span className="relative z-10 flex items-center gap-3">
                SCHEDULE CONSULTATION
                <ArrowRight size={18} weight="light" />
              </span>
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="about-us" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 mb-20">
            <div>
              <span className="mono-text text-sm text-primary tracking-widest mb-4 block font-semibold">ABOUT US</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 text-foreground">
                Agrani Digital
              </h2>
              <div className="space-y-4 text-muted-foreground font-normal leading-relaxed text-lg">
                <p>
                  Founded on the principle that enterprises need cloud-native, 
                  scalable digital infrastructure, Agrani Digital architects resilient 
                  and high-performance technology ecosystems.
                </p>
                <p>
                  Our engineering teams combine deep platform expertise with emerging technologies 
                  in cloud computing, AI/ML, and enterprise security.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <span className="mono-text text-sm text-secondary tracking-widest block font-semibold">PRINCIPLES</span>
              {[
                { title: 'Cloud Native', desc: 'Infrastructure designed for scalability and resilience' },
                { title: 'Automation First', desc: 'Self-healing, automated system architectures' },
                { title: 'Zero Trust', desc: 'Identity-centric security at every layer' },
                { title: 'Data Driven', desc: 'Insights-powered decision making across operations' }
              ].map((item) => (
                <div key={item.title} className="border-l border-primary/30 pl-4 hover:border-primary/60 transition-colors">
                  <h4 className="font-semibold mb-1 text-foreground text-base">{item.title}</h4>
                  <p className="text-sm text-muted-foreground font-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>


        </div>
      </section>

      <section id="careers" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="mono-text text-sm text-accent tracking-widest mb-4 block font-semibold">CAREERS</span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight mb-4 text-foreground">
              Join the Future
            </h2>
            <p className="text-muted-foreground font-light max-w-lg mx-auto">
              Build tomorrow's technology infrastructure today
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                role: 'Cloud Platform Architect',
                location: 'Remote',
                type: 'Full-time',
                stack: ['AWS', 'Kubernetes', 'Terraform'],
                description: 'Design scalable cloud architectures for enterprise clients'
              },
              {
                role: 'Senior ML Engineer',
                location: 'Remote',
                type: 'Full-time',
                stack: ['Python', 'TensorFlow', 'MLOps'],
                description: 'Build and deploy production ML systems at scale'
              },
              {
                role: 'Security Architect',
                location: 'Remote',
                type: 'Full-time',
                stack: ['SIEM', 'Zero Trust', 'IAM'],
                description: 'Design and implement enterprise security solutions'
              }
            ].map((job) => (
              <Card key={job.role} className="neo-card border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-medium mb-1 text-foreground">{job.role}</h3>
                      <p className="text-sm text-muted-foreground font-light">{job.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className="mono-text text-[10px] px-3 py-1.5 glass-panel rounded-full">{job.location}</span>
                      <span className="mono-text text-[10px] px-3 py-1.5 glass-panel rounded-full">{job.type}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.stack.map((tech) => (
                      <span key={tech} className="mono-text text-[9px] px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className="glass-panel border-primary/30 hover:border-primary/60">
                <span className="mono-text text-xs">VIEW ALL POSITIONS</span>
                <ArrowRight className="ml-2" size={14} weight="light" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="expertise" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-16">
            <span className="mono-text text-xs text-primary tracking-widest mb-4 block">EXPERTISE</span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight mb-4 text-foreground">
              Technical Capabilities
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                category: 'Cloud Platforms',
                items: ['AWS Solutions Architect', 'Azure Cloud Design', 'GCP Infrastructure', 'Multi-cloud Strategy', 'FinOps & Cost Optimization', 'Container Orchestration']
              },
              {
                category: 'Data Systems',
                items: ['Data Warehouse Design', 'Stream Processing', 'Data Lake Architecture', 'ETL/ELT Pipelines', 'Business Intelligence', 'Data Governance']
              },
              {
                category: 'AI Platforms',
                items: ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'MLOps Implementation', 'Generative AI', 'Responsible AI']
              },
              {
                category: 'Security',
                items: ['Security Architecture', 'Threat Detection', 'Identity Management', 'SOC Operations', 'Compliance Automation', 'Penetration Testing']
              }
            ].map((expertise) => (
              <div key={expertise.category}>
                <h3 className="text-sm font-medium mb-4 text-foreground">{expertise.category}</h3>
                <ul className="space-y-2">
                  {expertise.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground font-light">
                      <div className="w-1 h-1 rounded-full bg-primary/50 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 neo-card rounded-xl p-8">
            <h3 className="text-lg font-medium mb-6 text-foreground">Certifications</h3>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: 'Cloud', items: ['AWS Solutions Architect Pro', 'Azure Solutions Expert', 'GCP Professional Architect', 'Kubernetes Administrator'] },
                { title: 'AI/ML', items: ['TensorFlow Developer', 'AWS ML Specialty', 'Google Cloud ML Engineer', 'MLOps Professional'] },
                { title: 'Security', items: ['CISSP', 'CISM', 'AWS Security Specialty', 'CompTIA Security+'] }
              ].map((cert) => (
                <div key={cert.title}>
                  <h4 className="mono-text text-[10px] text-primary tracking-wider mb-3">{cert.title.toUpperCase()}</h4>
                  <ul className="space-y-1.5">
                    {cert.items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground font-light">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-16 px-6 relative">
        <div className="absolute inset-0 grid-futuristic opacity-10" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <img 
                src="/logo.png" 
                alt="AGRANI DIGITAL" 
                className="h-14 w-auto mb-4"
              />
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Cloud-native digital transformation consulting
              </p>
            </div>
            
            {[
              { title: 'Solutions', items: ['Digital Transformation', 'Data Intelligence', 'AI & Machine Learning', 'Cybersecurity'] },
              { title: 'Company', items: ['About', 'Careers', 'Case Studies', 'Contact'] },
              { title: 'Expertise', items: ['Cloud Platforms', 'Data Systems', 'AI Platforms', 'Security'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mono-text text-[10px] text-muted-foreground tracking-wider mb-4">{col.title.toUpperCase()}</h4>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item}>
                      <button 
                        onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                        className="text-xs text-muted-foreground font-light hover:text-foreground transition-colors"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <Separator className="my-8 bg-border/50" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="mono-text text-[10px] text-muted-foreground">© 2026 AGRANI DIGITAL. ALL RIGHTS RESERVED.</p>
            <p className="mono-text text-[10px] text-muted-foreground">BORN IN THE CLOUD</p>
          </div>
        </div>
      </footer>

      <Sheet open={isContactDrawerOpen} onOpenChange={setIsContactDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0 glass-panel-strong border-l-primary/20">
          <div className="p-6">
            <SheetHeader className="p-0">
              <SheetTitle className="text-2xl font-bold text-foreground">Initiate Contact</SheetTitle>
              <SheetDescription className="text-muted-foreground font-normal text-base">
                Tell us about your transformation goals
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full-name" className="mono-text text-xs tracking-wider font-semibold">FULL NAME *</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Smith" 
                  required 
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  className="glass-panel border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="mono-text text-xs tracking-wider font-semibold">EMAIL *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@company.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="glass-panel border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="mono-text text-xs tracking-wider font-semibold">COMPANY</Label>
                <Input 
                  id="company" 
                  placeholder="Acme Corporation" 
                  value={formData.company}
                  onChange={(e) => handleFormChange('company', e.target.value)}
                  className="glass-panel border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service" className="mono-text text-xs tracking-wider font-semibold">SERVICE INTEREST *</Label>
                <Select 
                  required 
                  value={formData.service}
                  onValueChange={(value) => handleFormChange('service', value)}
                >
                  <SelectTrigger id="service" className="glass-panel border-border/50">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel-strong border-border/50">
                    <SelectItem value="digital-transformation">Digital Transformation</SelectItem>
                    <SelectItem value="data-intelligence">Data Intelligence</SelectItem>
                    <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="mono-text text-xs tracking-wider font-semibold">TIMELINE</Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => handleFormChange('timeline', value)}
                >
                  <SelectTrigger id="timeline" className="glass-panel border-border/50">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel-strong border-border/50">
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="short">1-3 Months</SelectItem>
                    <SelectItem value="medium">3-6 Months</SelectItem>
                    <SelectItem value="long">6+ Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="mono-text text-xs tracking-wider font-semibold">PROJECT DETAILS *</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your transformation goals..."
                  className="min-h-[100px] glass-panel border-border/50 focus:border-primary/50"
                  required
                  value={formData.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 futuristic-button" 
                  disabled={isSubmitting}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <CircleNotch size={16} className="animate-spin" />
                        TRANSMITTING
                      </>
                    ) : (
                      'SUBMIT REQUEST'
                    )}
                  </span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsContactDrawerOpen(false)}
                  disabled={isSubmitting}
                  className="glass-panel border-border/50 hover:border-primary/50"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default App

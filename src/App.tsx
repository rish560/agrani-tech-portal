import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
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
  X,
  EnvelopeSimple,
  Globe,
  Phone,
  LinkedinLogo,
  TwitterLogo,
  GithubLogo,
  YoutubeLogo
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
import BlogListPage from '@/pages/BlogListPage'
import BlogPostPage from '@/pages/BlogPostPage'

function App() {
  const location = useLocation();
  const isBlogRoute = location.pathname.startsWith('/blog');
  
  if (isBlogRoute) {
    return (
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </div>
    );
  }
  
  return <HomePage />;
}

function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('home')
  const [currentPage, setCurrentPage] = useState(0)
  const [isTickerPaused, setIsTickerPaused] = useState(false)
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageDirection, setPageDirection] = useState(1)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [headerOpacity, setHeaderOpacity] = useState(1)
  const [showNavbar, setShowNavbar] = useState(true)

  // Set light theme permanently
  useEffect(() => {
    document.documentElement.classList.add('light')
  }, [])
  
  // Handle scroll for header fade effect and scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const heroHeight = window.innerHeight
      
      // In hero section: always show navbar
      if (currentScrollY < heroHeight) {
        setShowNavbar(true)
        setHeaderOpacity(1)
      } else {
        // After hero section: hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > heroHeight + 50) {
          // Scrolling down & past hero section
          setShowNavbar(false)
          setHeaderOpacity(0)
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          setShowNavbar(true)
          setHeaderOpacity(1)
        }
      }
      
      setScrollY(currentScrollY)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])
  
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
  
  const navigate = useNavigate()
  
  const handleNavClick = (section: string) => {
    if (section === 'blogs') {
      navigate('/blog')
    } else {
      scrollToSection(section.toLowerCase().replace(' ', '-'))
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

      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
        style={{
          opacity: headerOpacity,
          transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
          pointerEvents: headerOpacity < 0.1 ? 'none' : 'auto',
          backdropFilter: 'none',
          backgroundColor: 'transparent',
          borderBottom: 'none',
          boxShadow: 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <button 
              onClick={() => scrollToSection('home')}
              className="group relative flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center"
              >
                <img 
                  src="/logo.png" 
                  alt="AGRANI DIGITAL" 
                  className="h-36 w-auto drop-shadow-sm"
                />
              </motion.div>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <div className="flex items-center gap-5">
              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 transition-all shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={24} weight="bold" className="text-primary" />
                ) : (
                  <List size={24} weight="bold" className="text-primary" />
                )}
              </motion.button>
            
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-8 lg:gap-10">
                {['About Us', 'Expertise', 'Solutions', 'Case Studies', 'Careers', 'Blogs', 'Contact'].map((section) => (
                  <motion.button
                    key={section}
                    onClick={() => handleNavClick(section.toLowerCase().replace(' ', '-'))}
                    className={`text-sm font-bold tracking-wider relative transition-all ${
                      activeSection === section.toLowerCase().replace(' ', '-')
                        ? 'text-primary'
                        : 'text-slate-700 hover:text-primary'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mono-text">{section.toUpperCase()}</span>
                    {activeSection === section.toLowerCase().replace(' ', '-') && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute -bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
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
                className="md:hidden overflow-hidden border-t border-gray-200/50"
              >
                <div className="py-6 space-y-2 bg-gradient-to-b from-white to-slate-50/50">
                  {['About Us', 'Expertise', 'Solutions', 'Case Studies', 'Careers', 'Blogs', 'Contact'].map((section) => (
                    <motion.button
                      key={section}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setTimeout(() => {
                          handleNavClick(section.toLowerCase().replace(' ', '-'))
                        }, 300)
                      }}
                      className={`w-full text-left px-6 py-4 rounded-xl transition-all ${
                        activeSection === section.toLowerCase().replace(' ', '-')
                          ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-bold border-l-4 border-primary shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-primary font-semibold'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="mono-text text-sm tracking-wide">{section.toUpperCase()}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <section id="home" className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-primary/5 to-secondary/5" />
        
        {/* Animated Gradient Orbs with More Movement */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-accent/30 to-primary/30 rounded-full blur-3xl"
        />
        
        {/* Additional Floating Elements */}
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-2xl"
        />
        
        {/* Enhanced Grid Pattern with Animation */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.1) 1px, transparent 0)`,
            backgroundSize: '64px 64px'
          }} />
        </motion.div>
        
        <div className="max-w-6xl w-full pt-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-center mb-16"
          >
            {/* Enhanced Main Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8"
            >
              <motion.span 
                className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: '200% auto' }}
              >
                AGRANI
              </motion.span>
              <span className="block text-slate-900 mt-4">
                DIGITAL
              </span>
            </motion.h1>
            
            {/* Hero Tagline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-2xl sm:text-3xl text-slate-600 max-w-4xl mx-auto mb-6 font-light leading-relaxed"
            >
              Digital Transformation, Cloud & AI Solutions for Modern Enterprises
            </motion.p>
            
            {/* Hero Description */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-lg text-slate-600 max-w-4xl mx-auto mb-12 font-normal leading-relaxed"
            >
              Agrani Digital helps organisations modernise their technology landscape through secure cloud platforms, data intelligence, AI-driven automation, and enterprise-grade cybersecurity.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Button
                size="lg"
                onClick={() => scrollToSection('contact')}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl hover:shadow-primary/20 text-white font-semibold px-8 py-7 text-lg rounded-xl group transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" weight="bold" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('case-studies')}
                className="border-2 border-slate-300 hover:border-primary bg-white/80 backdrop-blur-sm font-semibold px-8 py-7 text-lg rounded-xl group transition-all duration-300"
              >
                View Success Stories
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>
            
            {/* Key Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
            >
              {[
                { value: '100+', label: 'Projects' },
                { value: '$2B+', label: 'Value Created' },
                { value: '50+', label: 'Countries' },
                { value: '99.9%', label: 'Uptime' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + idx * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center cursor-default"
                >
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Vision & Mission - Design Approach 1: Hero Statement Style */}
          
          {/* Hero Vision Statement - Full Screen */}
          <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="w-screen relative left-1/2 right-1/2 -mx-[50vw] my-32 min-h-screen flex items-center justify-center overflow-hidden"
            >
              {/* Dark Gradient Background with Image Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900" />
              
              {/* Animated Subtle Grid */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
                  backgroundSize: '48px 48px'
                }} />
              </div>
              
              {/* Ambient Glow */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.35, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-3xl"
              />

              <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                {/* Vision Statement - LARGE Typography */}
                <motion.h2
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[1.05] mb-10 tracking-tight"
                >
                  Enable organisations
                  <br />
                  to thrive in the{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    digital era
                  </span>
                </motion.h2>

                {/* Minimal Supporting Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl md:text-3xl text-gray-300/90 max-w-4xl mx-auto font-light mb-16"
                >
                  Building secure, intelligent, and scalable technology platforms
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <Button 
                    size="lg"
                    onClick={() => scrollToSection('contact')}
                    className="bg-white text-slate-900 hover:bg-gray-100 text-lg px-10 py-7 rounded-full font-semibold shadow-2xl hover:shadow-white/20 transition-all duration-300"
                  >
                    Start Your Transformation
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Mission Section - Clean White Background */}
            <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] py-32 bg-white">
              <div className="max-w-5xl mx-auto px-6">
                {/* Mission Statement */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-20"
                >
                  <h3 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                    Simplify complex
                    <br />
                    digital challenges
                  </h3>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Deliver practical digital transformation strategies, robust cloud and data platforms, responsible AI solutions, and enterprise-grade cybersecurity
                  </p>
                </motion.div>

                {/* Four Solution Pillars - Minimal Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: CloudArrowUp,
                      title: 'Cloud',
                      description: 'Modern cloud-native architectures'
                    },
                    {
                      icon: Database,
                      title: 'Data',
                      description: 'Scalable data platforms & analytics'
                    },
                    {
                      icon: Brain,
                      title: 'AI',
                      description: 'Responsible AI with business impact'
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Security',
                      description: 'Zero-trust enterprise protection'
                    }
                  ].map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <div className="text-center p-8 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <item.icon size={32} className="text-primary" weight="duotone" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Values Strip - Subtle */}
            <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] py-16 bg-slate-50 border-y border-slate-200">
              <div className="max-w-5xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
                  {[
                    'Business-aligned',
                    'Technology-driven', 
                    'Measurable outcomes'
                  ].map((value, idx) => (
                    <motion.div
                      key={value}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-center"
                    >
                      <span className="text-lg font-semibold text-slate-700">
                        {value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

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
                <div className="mb-16 text-center">
                  <h3 className="text-4xl font-bold text-foreground mb-4">
                    Built on Three Pillars
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Our commitment to excellence is reflected in every solution we deliver
                  </p>
                </div>

                {/* Three Expandable Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Secure',
                      gradient: 'from-blue-500 to-cyan-500',
                      description: 'Enterprise-grade security and compliance built into every solution we deliver',
                      details: ['Zero-trust architecture', 'Compliance by design', 'Proactive threat protection']
                    },
                    {
                      icon: Brain,
                      title: 'Intelligent',
                      gradient: 'from-purple-500 to-pink-500',
                      description: 'AI and data-driven solutions that automate processes and enhance decision-making',
                      details: ['Responsible AI implementation', 'Predictive analytics', 'Intelligent automation']
                    },
                    {
                      icon: CloudArrowUp,
                      title: 'Scalable',
                      gradient: 'from-green-500 to-emerald-500',
                      description: 'Cloud-native platforms designed to grow seamlessly with your business',
                      details: ['Cloud-native architecture', 'Elastic infrastructure', 'Multi-cloud flexibility']
                    }
                  ].map((pillar, idx) => (
                    <motion.div
                      key={pillar.title}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15, duration: 0.6 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative"
                    >
                      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
                        <CardContent className="p-8">
                          {/* Icon */}
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 shadow-lg`}
                          >
                            <pillar.icon size={32} weight="duotone" className="text-white" />
                          </motion.div>

                          {/* Title */}
                          <h4 className="text-2xl font-bold text-foreground mb-4">
                            {pillar.title}
                          </h4>

                          {/* Description */}
                          <p className="text-base text-muted-foreground leading-relaxed mb-6">
                            {pillar.description}
                          </p>

                          {/* Expandable Details */}
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            whileHover={{ height: 'auto', opacity: 1 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-border/50 space-y-3">
                              {pillar.details.map((detail) => (
                                <div key={detail} className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${pillar.gradient}`} />
                                  <span className="text-sm text-foreground/80">{detail}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Hover Gradient Effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Section 3: Mission Journey - Darker Background */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] py-32 bg-gradient-to-br from-slate-50 via-gray-100 to-slate-50">
              <div className="max-wi-6xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-20"
                >
                  <span className="mono-text text-xs text-secondary tracking-[0.3em] font-semibold">OUR MISSION</span>
                  <h3 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6">
                    Simplifying Complex Digital Challenges
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Delivering practical solutions that drive measurable outcomes
                  </p>
                </motion.div>

                {/* Journey Steps - Visual Flow */}
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-20" />

                  <div className="grid md:grid-cols-4 gap-8 relative">
                    {[
                      {
                        icon: CloudArrowUp,
                        step: '01',
                        title: 'Cloud Transformation',
                        description: 'Modernise legacy systems with cloud-native and hybrid architectures'
                      },
                      {
                        icon: Database,
                        step: '02',
                        title: 'Data Platforms',
                        description: 'Build robust data warehouses and real-time analytics pipelines'
                      },
                      {
                        icon: Brain,
                        step: '03',
                        title: 'AI Solutions',
                        description: 'Deploy responsible AI with measurable business impact'
                      },
                      {
                        icon: ShieldCheck,
                        step: '04',
                        title: 'Cybersecurity',
                        description: 'Implement enterprise-grade security and zero-trust frameworks'
                      }
                    ].map((step, idx) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2, duration: 0.5 }}
                        className="relative text-center"
                      >
                        {/* Step Number */}
                        <div className="mono-text text-xs text-primary tracking-widest mb-4 font-bold">
                          {step.step}
                        </div>

                        {/* Icon Circle */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-24 h-24 mx-auto mb-6 rounded-full bg-white shadow-xl flex items-center justify-center relative z-10 border-4 border-white"
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                          <step.icon size={36} weight="duotone" className="text-primary relative z-10" />
                        </motion.div>

                        {/* Title */}
                        <h4 className="text-xl font-bold text-foreground mb-3">
                          {step.title}
                        </h4>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Values Footer - Minimal Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="w-screen relative left-1/2 right-1/2 -mx-[50vw] py-12 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"
            >
              <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                {[
                  { label: 'Business-aligned strategy', icon: '🎯' },
                  { label: 'Technology-driven solutions', icon: '⚡' },
                  { label: 'Measurable outcomes', icon: '�' }
                ].map((value, idx) => (
                  <motion.div
                    key={value.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-2xl">{value.icon}</span>
                    <span className="text-lg font-semibold text-foreground/80">{value.label}</span>
                  </motion.div>
                ))}
              </div>
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

      <section id="solutions" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="mono-text text-sm text-primary tracking-widest mb-4 block font-semibold">OUR DIGITAL TRANSFORMATION SERVICES</span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
              Solutions
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg">
              Enterprise-grade technology solutions designed for modern businesses
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-0">
                    {/* Visual Header with Icon and Illustrative Background */}
                    <div className="relative h-64 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <motion.div
                          animate={{
                            backgroundPosition: ['0% 0%', '100% 100%'],
                          }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
                            backgroundSize: '32px 32px'
                          }}
                        />
                      </div>
                      
                      {/* Decorative Circles */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/20 blur-2xl"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-secondary/20 blur-2xl"
                      />
                      
                      {/* Main Icon with Glow Effect */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10"
                      >
                        <div className="relative">
                          {/* Glow effect behind icon */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-50" />
                          {/* Icon container */}
                          <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-2xl flex items-center justify-center">
                            <solution.icon size={56} className="text-white" weight="duotone" />
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Gradient Overlay on Hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 transition-opacity duration-500"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                          {solution.title}
                        </h3>
                        <p className="text-muted-foreground font-normal text-base leading-relaxed">
                          {solution.description}
                        </p>
                      </div>
                      
                      {/* Key Features */}
                      <div className="space-y-2.5">
                        {solution.details.slice(0, 4).map((detail) => (
                          <div key={detail} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm text-foreground/70 font-normal">{detail}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Technologies */}
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex flex-wrap gap-2">
                          {solution.technologies.map((tech) => (
                            <span 
                              key={tech}
                              className="mono-text text-[10px] px-3 py-1.5 bg-primary/10 text-primary rounded-full font-semibold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Learn More Link */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="pt-2"
                      >
                        <button className="text-sm font-semibold text-primary flex items-center gap-2 group/link">
                          Learn More
                          <ArrowRight size={16} weight="bold" className="group-hover/link:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
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

      <section id="case-studies" className="py-32 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.08) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="mono-text text-sm text-secondary tracking-widest mb-4 block font-semibold">SUCCESS STORIES</span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
              Real-world Transformations
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg">
              Delivering measurable results through innovative solutions powered by Data, Cloud and AI
            </p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.company}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-0">
                    {/* Enhanced Visual Header with Animations */}
                    <div className="relative h-64 overflow-hidden group/header">
                      {/* Animated Gradient Background */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30"
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      />
                      
                      {/* Animated Pattern Overlay */}
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        style={{
                          backgroundImage: `linear-gradient(45deg, rgba(99, 102, 241, 0.1) 25%, transparent 25%, transparent 75%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1)), linear-gradient(45deg, rgba(99, 102, 241, 0.1) 25%, transparent 25%, transparent 75%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1))`,
                          backgroundSize: '60px 60px',
                          backgroundPosition: '0 0, 30px 30px'
                        }}
                      />
                      
                      {/* Floating Decorative Elements */}
                      <motion.div
                        animate={{
                          x: [0, 50, 0],
                          y: [0, -30, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
                      />
                      <motion.div
                        animate={{
                          x: [0, -40, 0],
                          y: [0, 40, 0],
                          scale: [1, 1.3, 1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-secondary/20 to-transparent blur-3xl"
                      />
                      
                      {/* Company Badge with Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          className="relative z-10 text-center"
                        >
                          {/* Company Icon */}
                          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl flex items-center justify-center border border-white/50 group-hover/header:shadow-primary/30 transition-shadow">
                            {index === 0 && <CloudArrowUp size={48} weight="duotone" className="text-primary" />}
                            {index === 1 && <Database size={48} weight="duotone" className="text-secondary" />}
                            {index === 2 && <Brain size={48} weight="duotone" className="text-accent" />}
                            {index === 3 && <ShieldCheck size={48} weight="duotone" className="text-primary" />}
                          </div>
                          
                          {/* Company Name */}
                          <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                            {study.company.split(' ')[0]}
                          </div>
                          
                          {/* Industry Badge */}
                          <span className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary shadow-lg">
                            {study.industry}
                          </span>
                        </motion.div>
                      </div>
                      
                      {/* Bottom Gradient Overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Hover Effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                          {study.company}
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="mono-text text-[10px] text-primary tracking-wider font-bold block mb-2">CHALLENGE</span>
                            <p className="text-sm text-foreground/80 leading-relaxed">{study.challenge}</p>
                          </div>

                          <div>
                            <span className="mono-text text-[10px] text-secondary tracking-wider font-bold block mb-2">SOLUTION</span>
                            <p className="text-sm text-foreground/80 leading-relaxed">{study.solution}</p>
                          </div>
                        </div>
                      </div>

                      {/* Results - Highlighted */}
                      <div className="pt-4 border-t border-border/50">
                        <span className="mono-text text-[10px] text-accent tracking-wider font-bold block mb-3">RESULTS</span>
                        <div className="grid grid-cols-1 gap-2.5">
                          {study.results.map((result) => (
                            <div key={result} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                              <span className="text-sm text-foreground font-semibold">{result}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {study.technologies.map((tech) => (
                          <span key={tech} className="mono-text text-[10px] px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div 
          className="text-center mt-24 px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-wrap justify-center gap-16 p-12 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200 shadow-xl">
              {[
                { value: '100+', label: 'PROJECTS DELIVERED' },
                { value: '$2B+', label: 'CLIENT VALUE CREATED' },
                { value: '98%', label: 'CLIENT SATISFACTION' }
              ].map((stat) => (
                <motion.div key={stat.label} whileHover={{ y: -4, scale: 1.05 }} className="cursor-pointer">
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">{stat.value}</div>
                  <div className="mono-text text-[11px] text-muted-foreground tracking-wider font-bold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
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

      <section id="about-us" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="mono-text text-sm text-primary tracking-widest mb-4 block font-semibold">ABOUT US</span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Agrani Digital
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              Agrani Digital is a technology consulting and engineering firm specialising in digital transformation, cloud computing, data platforms, artificial intelligence, and cybersecurity.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed mt-4">
              We partner with organisations to design, build, and manage scalable, secure, and future-ready digital solutions. Our approach is business-led, technology-driven, and focused on delivering measurable outcomes rather than theoretical innovation.
            </p>
          </motion.div>

          {/* Story Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-0 shadow-xl bg-white p-10">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <Users size={32} weight="duotone" className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Our Story</h3>
                  </div>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Agrani Digital is a technology consulting and engineering firm specialising in digital transformation, cloud computing, data platforms, artificial intelligence, and cybersecurity.
                    </p>
                    <p>
                      We partner with organisations to design, build, and manage scalable, secure, and future-ready digital solutions.
                    </p>
                    <p>
                      Our approach is business-led, technology-driven, and focused on delivering measurable outcomes rather than theoretical innovation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-0 shadow-xl bg-white p-10">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                      <Brain size={32} weight="duotone" className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Our Approach</h3>
                  </div>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      With deep expertise across modern cloud platforms, data engineering, AI, and security frameworks, Agrani Digital acts as a trusted technology partner for enterprises navigating complex digital change.
                    </p>
                    <p>
                      We believe in a business-first approach, aligning technology investments with strategic objectives to deliver measurable ROI and competitive advantage.
                    </p>
                    <p>
                      From strategy to execution, our end-to-end services ensure seamless digital transformation backed by proven methodologies and best practices.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Core Values Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <span className="mono-text text-sm text-secondary tracking-widest block font-semibold mb-3">CORE VALUES</span>
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground">What Drives Us</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: CloudArrowUp,
                  title: 'Cloud Native', 
                  desc: 'Infrastructure designed for scalability and resilience',
                  color: 'from-blue-500 to-cyan-500'
                },
                { 
                  icon: CircleNotch,
                  title: 'Automation First', 
                  desc: 'Self-healing, automated system architectures',
                  color: 'from-purple-500 to-pink-500'
                },
                { 
                  icon: ShieldCheck,
                  title: 'Zero Trust', 
                  desc: 'Identity-centric security at every layer',
                  color: 'from-green-500 to-emerald-500'
                },
                { 
                  icon: Database,
                  title: 'Data Driven', 
                  desc: 'Insights-powered decision making across operations',
                  color: 'from-orange-500 to-red-500'
                }
              ].map((value, idx) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
                    <CardContent className="p-8 text-center">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center shadow-xl`}
                      >
                        <value.icon size={40} weight="duotone" className="text-white" />
                      </motion.div>
                      <h4 className="text-xl font-bold text-foreground mb-3">
                        {value.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-12 border border-slate-200"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">By The Numbers</h3>
              <p className="text-muted-foreground">Our impact across industries and geographies</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: '15+', label: 'Years Experience', desc: 'Delivering excellence' },
                { value: '500+', label: 'Enterprise Clients', desc: 'Across industries' },
                { value: '50+', label: 'Countries', desc: 'Global presence' },
                { value: '1000+', label: 'Projects', desc: 'Successfully delivered' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Client Logo Showcase */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Trusted by Leading Enterprises
            </h3>
            <p className="text-muted-foreground font-light">
              Partnering with organizations across industries to drive digital excellence
            </p>
          </motion.div>

          {/* Logo Marquee */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
            
            <motion.div
              className="flex gap-16 items-center"
              animate={{ x: [0, -1000] }}
              transition={{
                x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" }
              }}
            >
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex gap-16 items-center">
                  {['AWS', 'Microsoft', 'Google Cloud', 'Salesforce', 'Oracle', 'IBM', 'SAP', 'Adobe'].map((company) => (
                    <div
                      key={`${company}-${setIndex}`}
                      className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
                    >
                      <span className="text-lg font-bold text-slate-600">{company}</span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-slate-200"
          >
            {[
              { value: '500+', label: 'Enterprise Clients' },
              { value: '50+', label: 'Countries Served' },
              { value: '99.9%', label: 'Client Retention' },
              { value: '24/7', label: 'Global Support' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="careers" className="py-32 px-6 relative overflow-hidden">
        {/* Dark Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }} />
        </div>
        
        {/* Ambient Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl"
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="mono-text text-sm text-accent tracking-widest mb-4 block font-semibold">CAREERS</span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-white">
              Shape the Future with Us
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
              Join a team of innovators building next-generation cloud platforms, AI solutions, and enterprise security systems
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
              {[
                { icon: '🌍', label: 'Remote-First Culture' },
                { icon: '💰', label: 'Competitive Compensation' },
                { icon: '📈', label: 'Career Growth' },
                { icon: '🎯', label: 'Cutting-Edge Projects' }
              ].map((benefit, idx) => (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <span className="text-lg">{benefit.icon}</span>
                  <span className="text-sm font-medium text-white">{benefit.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Open Positions */}
          <div className="space-y-6 mb-16">
            {[
              {
                role: 'Cloud Platform Architect',
                department: 'Engineering',
                location: 'Remote',
                type: 'Full-time',
                icon: CloudArrowUp,
                gradient: 'from-blue-500 to-cyan-500',
                stack: ['AWS', 'Kubernetes', 'Terraform', 'Python'],
                description: 'Design and implement scalable cloud architectures for enterprise clients. Lead technical discussions and mentor junior engineers.',
                responsibilities: ['Architecture design', 'Cloud migration strategy', 'Team leadership']
              },
              {
                role: 'Senior ML Engineer',
                department: 'AI & Data',
                location: 'Remote',
                type: 'Full-time',
                icon: Brain,
                gradient: 'from-purple-500 to-pink-500',
                stack: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
                description: 'Build and deploy production-grade ML systems at scale. Work on cutting-edge NLP and computer vision projects.',
                responsibilities: ['Model development', 'Production deployment', 'Research & innovation']
              },
              {
                role: 'Security Architect',
                department: 'Security',
                location: 'Remote',
                type: 'Full-time',
                icon: ShieldCheck,
                gradient: 'from-green-500 to-emerald-500',
                stack: ['SIEM', 'Zero Trust', 'IAM', 'Penetration Testing'],
                description: 'Design and implement enterprise security solutions. Lead security assessments and compliance initiatives.',
                responsibilities: ['Security architecture', 'Threat modeling', 'Compliance management']
              },
              {
                role: 'Data Platform Engineer',
                department: 'Data Engineering',
                location: 'Remote',
                type: 'Full-time',
                icon: Database,
                gradient: 'from-orange-500 to-red-500',
                stack: ['Spark', 'Airflow', 'Snowflake', 'DBT'],
                description: 'Build scalable data pipelines and analytics platforms. Work with petabyte-scale data processing systems.',
                responsibilities: ['Pipeline development', 'Data modeling', 'Performance optimization']
              }
            ].map((job, idx) => (
              <motion.div
                key={job.role}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ x: 8 }}
                className="group"
              >
                <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left Accent Bar with Icon */}
                      <div className={`md:w-2 bg-gradient-to-b ${job.gradient} flex-shrink-0`} />
                      
                      <div className="flex-1 p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          {/* Job Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                                <job.icon size={24} weight="duotone" className="text-white" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                    {job.role}
                                  </h3>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <span className="mono-text text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-semibold">
                                    {job.department}
                                  </span>
                                  <span className="mono-text text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                                    📍 {job.location}
                                  </span>
                                  <span className="mono-text text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                                    {job.type}
                                  </span>
                                </div>
                                
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                  {job.description}
                                </p>
                                
                                {/* Responsibilities */}
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Key Responsibilities</p>
                                  <div className="flex flex-wrap gap-2">
                                    {job.responsibilities.map((resp) => (
                                      <span key={resp} className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                                        • {resp}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Tech Stack */}
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Tech Stack</p>
                                  <div className="flex flex-wrap gap-2">
                                    {job.stack.map((tech) => (
                                      <span 
                                        key={tech}
                                        className={`mono-text text-xs px-3 py-1.5 bg-gradient-to-r ${job.gradient} text-white rounded-lg font-semibold shadow-sm`}
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Apply Button */}
                          <div className="flex-shrink-0">
                            <Button 
                              className={`bg-gradient-to-r ${job.gradient} text-white hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold`}
                            >
                              Apply Now
                              <ArrowRight size={16} className="ml-2" weight="bold" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-6 p-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Don't see a perfect fit?
                </h3>
                <p className="text-gray-300">
                  We're always looking for exceptional talent. Send us your resume.
                </p>
              </div>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-300 font-semibold"
              >
                <span className="mono-text text-sm">SUBMIT GENERAL APPLICATION</span>
                <ArrowRight className="ml-2" size={18} weight="bold" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="expertise" className="py-32 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.1) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="mono-text text-sm text-primary tracking-widest mb-4 block font-semibold">EXPERTISE</span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
              Technical Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Deep expertise across the full spectrum of modern enterprise technology
            </p>
          </motion.div>

          {/* Expertise Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              {
                category: 'Cloud Platforms',
                icon: CloudArrowUp,
                gradient: 'from-blue-500 to-cyan-500',
                items: ['AWS Solutions Architect', 'Azure Cloud Design', 'GCP Infrastructure', 'Multi-cloud Strategy', 'FinOps & Cost Optimization', 'Container Orchestration']
              },
              {
                category: 'Data Systems',
                icon: Database,
                gradient: 'from-purple-500 to-pink-500',
                items: ['Data Warehouse Design', 'Stream Processing', 'Data Lake Architecture', 'ETL/ELT Pipelines', 'Business Intelligence', 'Data Governance']
              },
              {
                category: 'AI Platforms',
                icon: Brain,
                gradient: 'from-green-500 to-emerald-500',
                items: ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'MLOps Implementation', 'Generative AI', 'Responsible AI']
              },
              {
                category: 'Security',
                icon: ShieldCheck,
                gradient: 'from-orange-500 to-red-500',
                items: ['Security Architecture', 'Threat Detection', 'Identity Management', 'SOC Operations', 'Compliance Automation', 'Penetration Testing']
              }
            ].map((expertise, idx) => (
              <motion.div
                key={expertise.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden">
                  <CardContent className="p-8">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${expertise.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <expertise.icon size={32} weight="duotone" className="text-white" />
                    </motion.div>

                    {/* Category Title */}
                    <h3 className="text-xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors">
                      {expertise.category}
                    </h3>

                    {/* Items List */}
                    <ul className="space-y-3">
                      {expertise.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${expertise.gradient} mt-2 flex-shrink-0`} />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Hover Gradient Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${expertise.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Certifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Industry Certifications
              </h3>
              <p className="text-muted-foreground font-light">
                Validated expertise from leading technology providers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Cloud Architecture',
                  icon: CloudArrowUp,
                  gradient: 'from-blue-500 to-cyan-500',
                  items: ['AWS Solutions Architect Professional', 'Azure Solutions Architect Expert', 'GCP Professional Cloud Architect', 'Certified Kubernetes Administrator']
                },
                { 
                  title: 'AI & Machine Learning',
                  icon: Brain,
                  gradient: 'from-purple-500 to-pink-500',
                  items: ['TensorFlow Developer Certificate', 'AWS Machine Learning Specialty', 'Google Cloud ML Engineer', 'MLOps Professional Certification']
                },
                { 
                  title: 'Security & Compliance',
                  icon: ShieldCheck,
                  gradient: 'from-green-500 to-emerald-500',
                  items: ['CISSP - Certified Information Systems Security Professional', 'CISM - Certified Information Security Manager', 'AWS Security Specialty', 'CompTIA Security+']
                }
              ].map((cert, idx) => (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  whileHover={{ y: -6 }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-white">
                    <CardContent className="p-8">
                      {/* Icon Header */}
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cert.gradient} flex items-center justify-center shadow-md`}>
                          <cert.icon size={24} weight="duotone" className="text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {cert.title}
                        </h4>
                      </div>

                      {/* Certification List */}
                      <ul className="space-y-3">
                        {cert.items.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${cert.gradient} mt-2 flex-shrink-0`} />
                            <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Technology Partners */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-20 text-center"
          >
            <div className="inline-flex flex-col items-center gap-6 p-10 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-slate-200">
              <p className="mono-text text-xs text-primary tracking-widest font-semibold">
                CERTIFIED PARTNERS
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {['AWS', 'Microsoft Azure', 'Google Cloud', 'Kubernetes', 'Terraform'].map((partner) => (
                  <span key={partner} className="text-base font-semibold text-slate-700">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Newsletter Section */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }} />
          </div>
          
          {/* Ambient Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/30 rounded-full blur-3xl"
          />

          <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Header */}
              <div className="mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
                  <EnvelopeSimple size={32} weight="duotone" className="text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Stay ahead of the curve
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Subscribe to receive expert insights on cloud innovation, AI developments, and digital transformation strategies.
                </p>
              </div>

              {/* Newsletter Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onSubmit={(e) => {
                  e.preventDefault()
                  toast.success('Thank you for subscribing! Check your inbox for confirmation.')
                }}
                className="max-w-xl mx-auto mb-12"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="your.email@company.com"
                    required
                    className="flex-1 h-14 px-6 text-base bg-white/95 backdrop-blur-sm border-0 focus:ring-2 focus:ring-primary/50 rounded-xl text-slate-900 placeholder:text-slate-500"
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    className="h-14 px-8 bg-white text-slate-900 hover:bg-gray-100 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Subscribe
                    <ArrowRight size={18} className="ml-2" weight="bold" />
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Join 10,000+ technology leaders. Unsubscribe anytime.
                </p>
              </motion.form>

              {/* Value Propositions - Professional Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="grid sm:grid-cols-3 gap-8 pt-12 border-t border-white/10"
              >
                {[
                  { 
                    icon: Database,
                    title: 'Industry Insights', 
                    desc: 'Quarterly reports & trend analysis'
                  },
                  { 
                    icon: Brain,
                    title: 'Expert Knowledge', 
                    desc: 'Best practices from our engineers'
                  },
                  { 
                    icon: CloudArrowUp,
                    title: 'Innovation Updates', 
                    desc: 'Latest in cloud & AI technology'
                  }
                ].map((benefit, idx) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="group"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm mb-4 group-hover:bg-white/20 transition-colors">
                      <benefit.icon size={24} weight="duotone" className="text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2 text-base">{benefit.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{benefit.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer Section */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
          {/* Main Footer Content */}
          <div className="border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
              {/* Top Section - Logo, Description & CTA */}
              <div className="grid lg:grid-cols-3 gap-12 mb-16 pb-16 border-b border-slate-200">
                {/* Brand Column */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <img 
                      src="/logo.png" 
                      alt="AGRANI DIGITAL" 
                      className="h-24 w-auto mb-6"
                    />
                    <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-sm">
                      Pioneering cloud-native solutions that empower enterprises to thrive in the digital era through secure, intelligent, and scalable platforms.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-semibold text-primary tracking-wide">BORN IN THE CLOUD</span>
                    </div>
                  </motion.div>
                </div>

                {/* Links Columns */}
                <div className="lg:col-span-2">
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                      { 
                        title: 'Solutions', 
                        items: [
                          { label: 'Cloud Transformation', section: 'solutions' },
                          { label: 'Data & Analytics', section: 'solutions' },
                          { label: 'AI & Machine Learning', section: 'solutions' },
                          { label: 'Cybersecurity', section: 'solutions' },
                          { label: 'Digital Strategy', section: 'solutions' }
                        ] 
                      },
                      { 
                        title: 'Company', 
                        items: [
                          { label: 'About Us', section: 'about-us' },
                          { label: 'Case Studies', section: 'case-studies' },
                          { label: 'Careers', section: 'careers' },
                          { label: 'Our Expertise', section: 'expertise' },
                          { label: 'Contact', section: 'contact' }
                        ] 
                      },
                      { 
                        title: 'Industries', 
                        items: [
                          { label: 'Financial Services', section: 'solutions' },
                          { label: 'Healthcare', section: 'solutions' },
                          { label: 'Retail & E-commerce', section: 'solutions' },
                          { label: 'Manufacturing', section: 'solutions' },
                          { label: 'Technology', section: 'solutions' }
                        ] 
                      },
                      { 
                        title: 'Resources', 
                        items: [
                          { label: 'Blog & Insights', section: 'blogs' },
                          { label: 'Whitepapers', section: 'case-studies' },
                          { label: 'Documentation', section: 'expertise' },
                          { label: 'Events', section: 'about-us' },
                          { label: 'Support', section: 'contact' }
                        ] 
                      }
                    ].map((column, idx) => (
                      <motion.div 
                        key={column.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                      >
                        <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-wide">
                          {column.title}
                        </h4>
                        <ul className="space-y-3">
                          {column.items.map((item) => (
                            <li key={item.label}>
                              <button 
                                onClick={() => scrollToSection(item.section)}
                                className="text-sm text-slate-600 hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block"
                              >
                                {item.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Section - Global Presence & Connect */}
              <div className="grid md:grid-cols-2 gap-12 mb-16 pb-16 border-b border-slate-200">
                {/* Global Presence */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Globe size={18} weight="duotone" className="text-primary" />
                    Global Presence
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { region: 'North America', locations: 'New York, Toronto' },
                      { region: 'Europe', locations: 'London, Amsterdam' },
                      { region: 'Asia Pacific', locations: 'Singapore, Mumbai' },
                      { region: 'Middle East', locations: 'Dubai, Riyadh' }
                    ].map((region) => (
                      <div key={region.region} className="group">
                        <p className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                          {region.region}
                        </p>
                        <p className="text-xs text-slate-500">
                          {region.locations}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Connect with Us */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h4 className="text-sm font-bold text-slate-900 mb-6">
                    Connect With Us
                  </h4>
                  <div className="space-y-4 mb-6">
                    <a 
                      href="mailto:hello@agranidigital.com" 
                      className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <EnvelopeSimple size={18} weight="duotone" className="text-slate-700 group-hover:text-primary" />
                      </div>
                      <span>hello@agranidigital.com</span>
                    </a>
                    <a 
                      href="tel:+1234567890" 
                      className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Phone size={18} weight="duotone" className="text-slate-700 group-hover:text-primary" />
                      </div>
                      <span>+1 (234) 567-890</span>
                    </a>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex gap-3">
                    {[
                      { icon: LinkedinLogo, label: 'LinkedIn', href: '#' },
                      { icon: TwitterLogo, label: 'Twitter', href: '#' },
                      { icon: GithubLogo, label: 'GitHub', href: '#' },
                      { icon: YoutubeLogo, label: 'YouTube', href: '#' }
                    ].map((social) => (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        whileHover={{ y: -4, scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-gradient-to-br hover:from-primary hover:to-secondary flex items-center justify-center transition-all duration-300 group"
                        aria-label={social.label}
                      >
                        <social.icon size={18} weight="fill" className="text-slate-700 group-hover:text-white transition-colors" />
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom Section - Copyright & Certifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                {/* Copyright & Legal */}
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 font-medium">
                    © 2026 Agrani Digital. All rights reserved.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <button className="hover:text-primary transition-colors">Privacy Policy</button>
                    <span>•</span>
                    <button className="hover:text-primary transition-colors">Terms of Service</button>
                    <span>•</span>
                    <button className="hover:text-primary transition-colors">Cookie Policy</button>
                    <span>•</span>
                    <button className="hover:text-primary transition-colors">Accessibility</button>
                  </div>
                </div>

                {/* Certifications & Partnerships */}
                <div className="flex flex-wrap items-center gap-4">
                  {[
                    { label: 'AWS Partner', gradient: 'from-orange-500 to-yellow-500' },
                    { label: 'Azure Verified', gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'ISO 27001', gradient: 'from-green-500 to-emerald-500' },
                    { label: 'SOC 2', gradient: 'from-purple-500 to-pink-500' }
                  ].map((cert) => (
                    <motion.div
                      key={cert.label}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group"
                    >
                      <span className={`text-xs font-semibold bg-gradient-to-r ${cert.gradient} bg-clip-text text-transparent group-hover:opacity-80 transition-opacity`}>
                        {cert.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative Bottom Gradient */}
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
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

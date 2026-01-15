import { useState, useEffect } from 'react'
import * as React from 'react'
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
  MapPin,
  LinkedinLogo,
  TwitterLogo,
  GithubLogo,
  YoutubeLogo,
  Check
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
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0)
  const [expandedCaseStudy, setExpandedCaseStudy] = useState<number | null>(null)

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

          {/* Vision Section - Wiz.io Inspired Bold Design with Authentic Cloud Animation */}
          
          {/* Hero Vision Section - Bold & Confident */}
          <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="w-screen relative left-1/2 right-1/2 -mx-[50vw] my-32 py-40 overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white"
            >
              {/* Wiz.io Style Outlined Cloud Animations */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Left Side Large Clouds - Artistic Outlined Style */}
                {[
                  { left: '-10%', top: '8%', scale: 1.2, duration: 120, delay: 0 },
                  { left: '-15%', top: '45%', scale: 1.4, duration: 140, delay: 8 },
                  { left: '-8%', top: '75%', scale: 1.1, duration: 130, delay: 15 },
                ].map((cloud, idx) => (
                  <motion.div
                    key={`left-cloud-${idx}`}
                    className="absolute"
                    style={{
                      left: cloud.left,
                      top: cloud.top,
                      transform: `scale(${cloud.scale})`,
                    }}
                    animate={{
                      x: ['0%', '8%', '0%'],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      x: { duration: cloud.duration, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 15, repeat: Infinity, ease: "easeInOut" },
                      delay: cloud.delay,
                    }}
                  >
                    <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Main cloud body - hand-drawn style */}
                      <path
                        d="M50,120 Q45,100 60,95 Q55,70 80,65 Q85,45 110,45 Q135,45 145,65 Q165,60 185,70 Q210,75 215,95 Q230,100 225,120 Q225,140 205,145 L75,145 Q50,140 50,120 Z"
                        fill="white"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.85"
                      />
                      {/* Inner detail curves */}
                      <path
                        d="M70,130 Q90,120 110,130"
                        stroke="#60A5FA"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.4"
                      />
                      <path
                        d="M130,125 Q155,115 175,125"
                        stroke="#60A5FA"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.4"
                      />
                      {/* Soft shadow/gradient effect */}
                      <ellipse cx="140" cy="135" rx="60" ry="8" fill="#3B82F6" opacity="0.08" />
                    </svg>
                  </motion.div>
                ))}

                {/* Right Side Large Clouds - Artistic Outlined Style */}
                {[
                  { right: '-10%', top: '12%', scale: 1.3, duration: 110, delay: 4 },
                  { right: '-12%', top: '50%', scale: 1.5, duration: 135, delay: 12 },
                  { right: '-8%', top: '80%', scale: 1.2, duration: 125, delay: 18 },
                ].map((cloud, idx) => (
                  <motion.div
                    key={`right-cloud-${idx}`}
                    className="absolute"
                    style={{
                      right: cloud.right,
                      top: cloud.top,
                      transform: `scale(${cloud.scale})`,
                    }}
                    animate={{
                      x: ['0%', '-8%', '0%'],
                      y: [0, 10, 0],
                    }}
                    transition={{
                      x: { duration: cloud.duration, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 14, repeat: Infinity, ease: "easeInOut" },
                      delay: cloud.delay,
                    }}
                  >
                    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Fluffy cloud shape */}
                      <path
                        d="M40,100 Q35,80 55,75 Q60,55 85,50 Q95,35 120,38 Q145,40 155,55 Q175,52 195,65 Q215,70 218,90 Q230,95 225,110 Q223,130 200,135 L65,135 Q40,130 40,100 Z"
                        fill="white"
                        stroke="#6366F1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.85"
                      />
                      {/* Decorative inner lines */}
                      <path
                        d="M65,110 Q85,100 105,110"
                        stroke="#818CF8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.4"
                      />
                      <path
                        d="M125,105 Q150,95 170,105"
                        stroke="#818CF8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.4"
                      />
                      {/* Shadow */}
                      <ellipse cx="130" cy="125" rx="55" ry="7" fill="#6366F1" opacity="0.08" />
                    </svg>
                  </motion.div>
                ))}

                {/* Medium Floating Clouds - Center Area */}
                {[
                  { left: '15%', top: '25%', scale: 0.8, duration: 180, delay: 2 },
                  { left: '65%', top: '30%', scale: 0.9, duration: 200, delay: 7 },
                  { left: '35%', top: '65%', scale: 0.85, duration: 190, delay: 10 },
                  { left: '75%', top: '68%', scale: 0.75, duration: 210, delay: 14 },
                ].map((cloud, idx) => (
                  <motion.div
                    key={`center-cloud-${idx}`}
                    className="absolute"
                    style={{
                      left: cloud.left,
                      top: cloud.top,
                      transform: `scale(${cloud.scale})`,
                    }}
                    animate={{
                      x: ['-2%', '2%', '-2%'],
                      y: [0, -4, 0],
                      rotate: [0, 0.5, 0, -0.5, 0],
                    }}
                    transition={{
                      x: { duration: cloud.duration, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 30, repeat: Infinity, ease: "easeInOut" },
                      delay: cloud.delay,
                    }}
                  >
                    <svg width="200" height="130" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M30,75 Q28,60 42,58 Q45,45 62,43 Q72,32 90,35 Q108,37 115,48 Q130,46 145,55 Q160,60 162,75 Q165,90 150,95 L45,95 Q30,92 30,75 Z"
                        fill="white"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.8"
                      />
                      <path
                        d="M50,80 Q70,73 85,80"
                        stroke="#A78BFA"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        opacity="0.35"
                      />
                      <ellipse cx="95" cy="88" rx="40" ry="5" fill="#8B5CF6" opacity="0.06" />
                    </svg>
                  </motion.div>
                ))}

                {/* Small Wispy Clouds */}
                {[...Array(12)].map((_, idx) => {
                  const isLeft = idx % 2 === 0;
                  const leftPos = isLeft ? `${Math.random() * 30}%` : 'auto';
                  const rightPos = !isLeft ? `${Math.random() * 30}%` : 'auto';
                  
                  return (
                    <motion.div
                      key={`wisp-${idx}`}
                      className="absolute"
                      style={{
                        left: leftPos,
                        right: rightPos,
                        top: `${10 + Math.random() * 80}%`,
                      }}
                      animate={{
                        x: isLeft ? ['-1.5%', '2%', '-1.5%'] : ['1.5%', '-2%', '1.5%'],
                        y: [0, -3, 0],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        x: { duration: 140 + Math.random() * 60, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 20 + Math.random() * 12, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 16, repeat: Infinity, ease: "easeInOut" },
                        delay: Math.random() * 10,
                      }}
                    >
                      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20,50 Q18,40 28,38 Q32,30 45,30 Q58,30 62,38 Q72,36 80,42 Q88,46 88,54 Q88,62 78,65 L32,65 Q20,62 20,50 Z"
                          fill="white"
                          stroke="#3B82F6"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.6"
                        />
                        <ellipse cx="54" cy="60" rx="25" ry="3" fill="#3B82F6" opacity="0.05" />
                      </svg>
                    </motion.div>
                  );
                })}

                {/* Decorative curved lines - Wiz.io style */}
                {[
                  { left: '5%', top: '15%', rotate: -25 },
                  { right: '5%', top: '20%', rotate: 25 },
                  { left: '8%', bottom: '18%', rotate: 15 },
                  { right: '8%', bottom: '15%', rotate: -20 },
                ].map((line, idx) => (
                  <motion.div
                    key={`line-${idx}`}
                    className="absolute"
                    style={{
                      left: line.left,
                      right: line.right,
                      top: line.top,
                      bottom: line.bottom,
                      transform: `rotate(${line.rotate}deg)`,
                    }}
                    animate={{
                      opacity: [0.15, 0.35, 0.15],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4 + idx,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 1.5,
                    }}
                  >
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10,40 Q25,25 40,40 Q55,55 70,40"
                        stroke="#6366F1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </motion.div>
                ))}
              </div>

              {/* Very subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none" />
              
              {/* Minimal dot pattern */}
              <div className="absolute inset-0 opacity-[0.012]">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.2) 1px, transparent 0)`,
                  backgroundSize: '48px 48px'
                }} />
              </div>

              {/* Main Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Small Label */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-8"
                >
                  <span className="inline-block px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold tracking-wider uppercase">
                    Our Vision
                  </span>
                </motion.div>

                {/* Massive Bold Headline - Wiz.io Style */}
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-center text-5xl md:text-6xl lg:text-8xl font-bold text-slate-900 leading-[1.05] mb-12 tracking-tight"
                >
                  Enable organisations
                  <br />
                  to <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">thrive</span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-full"
                    />
                  </span> in the
                  <br />
                  <span className="text-slate-900">digital era</span>
                </motion.h2>

                {/* Subheading */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed"
                >
                  Building secure, intelligent, and scalable technology platforms that transform businesses and drive innovation
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                  <Button 
                    size="lg"
                    onClick={() => scrollToSection('contact')}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-7 text-lg rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Start Your Transformation
                    <ArrowRight size={22} className="ml-2" weight="bold" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => scrollToSection('solutions')}
                    className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-10 py-7 text-lg rounded-xl font-bold transition-all duration-300"
                  >
                    Explore Platform
                  </Button>
                </motion.div>

                {/* Animated Platform Mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="relative mx-auto max-w-6xl"
                >
                  {/* Main Dashboard Card */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-200 bg-white">
                    {/* Top Bar */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b-2 border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="ml-4 flex-1 bg-white rounded px-4 py-1.5 text-sm text-slate-400 font-mono">
                          agrani.digital/platform
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                          { label: 'Cloud Infrastructure', value: '99.9%', status: 'Secure', color: 'from-green-500 to-emerald-500' },
                          { label: 'AI Models', value: '47', status: 'Active', color: 'from-blue-500 to-cyan-500' },
                          { label: 'Data Processed', value: '2.5PB', status: 'Live', color: 'from-purple-500 to-pink-500' },
                          { label: 'Deployments', value: '156', status: 'This Month', color: 'from-orange-500 to-red-500' },
                        ].map((stat, idx) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 + idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default"
                          >
                            <div className={`inline-block px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r ${stat.color} mb-2`}>
                              {stat.status}
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-xs text-slate-600 font-medium">{stat.label}</div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Animated Graph */}
                      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-slate-900">Platform Performance</h4>
                          <span className="text-sm text-green-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live
                          </span>
                        </div>
                        <div className="h-32 flex items-end gap-2">
                          {[...Array(24)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              whileInView={{ height: `${30 + Math.random() * 70}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: 1.2 + i * 0.02, duration: 0.6 }}
                              className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t opacity-80 hover:opacity-100 transition-opacity"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Feature Pills */}
                      <div className="flex flex-wrap gap-2">
                        {['Cloud Security', 'AI/ML Pipeline', 'Data Analytics', 'Real-time Monitoring', 'Auto-scaling', 'Zero Trust'].map((feature, idx) => (
                          <motion.span
                            key={feature}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.5 + idx * 0.05 }}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-xs font-bold border border-primary/20 cursor-default"
                          >
                            {feature}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <motion.div
                    initial={{ opacity: 0, x: -30, rotate: -5 }}
                    whileInView={{ opacity: 1, x: 0, rotate: -5 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5, type: "spring" }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                    className="absolute -left-4 top-1/4 bg-white rounded-2xl p-4 shadow-2xl border-2 border-green-200"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <ShieldCheck size={28} weight="bold" className="text-white" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">99.9%</div>
                      <div className="text-xs text-slate-600 font-medium">Secure</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 30, rotate: 5 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 5 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.7, type: "spring" }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                    className="absolute -right-4 bottom-1/4 bg-white rounded-2xl p-4 shadow-2xl border-2 border-purple-200"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Brain size={28} weight="bold" className="text-white" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">AI-First</div>
                      <div className="text-xs text-slate-600 font-medium">Powered</div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Trust Bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2 }}
                  className="mt-20 text-center"
                >
                  <p className="text-sm text-slate-500 font-semibold mb-8 uppercase tracking-wider">
                    Trusted by innovative organizations worldwide
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-12">
                    {[
                      { icon: ShieldCheck, text: 'Enterprise Security' },
                      { icon: CloudArrowUp, text: 'Cloud Native' },
                      { icon: Brain, text: 'AI-Powered' },
                      { icon: Database, text: 'Data Intelligence' },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2.1 + idx * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="flex items-center gap-3 cursor-default"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <item.icon size={20} weight="bold" className="text-primary" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
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
        {/* Animated Comic Book Style Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/50 to-pink-50/30" />
        
        {/* Comic Book Style Action Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="action-lines" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          {[...Array(20)].map((_, i) => (
            <motion.line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${50 + Math.cos((i * Math.PI * 2) / 20) * 100}%`}
              y2={`${50 + Math.sin((i * Math.PI * 2) / 20) * 100}%`}
              stroke="url(#action-lines)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </svg>

        {/* Floating Cartoon Clouds */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute"
            style={{
              top: `${20 + i * 15}%`,
              left: i % 2 === 0 ? '-10%' : '110%',
            }}
            animate={{
              x: i % 2 === 0 ? ['0%', '120vw'] : ['0%', '-120vw'],
            }}
            transition={{
              duration: 30 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <svg width="100" height="50" viewBox="0 0 100 50" className="opacity-30">
              <ellipse cx="25" cy="30" rx="20" ry="15" fill="#fff" />
              <ellipse cx="50" cy="25" rx="25" ry="18" fill="#fff" />
              <ellipse cx="75" cy="30" rx="20" ry="15" fill="#fff" />
            </svg>
          </motion.div>
        ))}

        {/* Anime-style Speed Lines */}
        <motion.div
          className="absolute inset-0 overflow-hidden opacity-5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, #f59e0b 35px, #f59e0b 36px)',
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="mono-text text-sm text-primary tracking-widest mb-4 block font-semibold">OUR DIGITAL TRANSFORMATION SERVICES</span>
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
              Solutions
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-lg">
              Enterprise-grade technology solutions designed for modern businesses
            </p>
          </motion.div>

          {/* Interactive Carousel */}
          <div className="relative">
            {/* Featured Solution Card - Large Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-5xl mx-auto mb-12"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSolutionIndex}
                  initial={{ opacity: 0, x: 100, rotateY: 45 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -100, rotateY: -45 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Card className="border-0 overflow-hidden bg-white shadow-2xl">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2">
                        {/* Left Side - Visual */}
                        <div className="relative h-96 md:h-auto bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                          {/* Comic-style Halftone Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <motion.div
                              animate={{
                                backgroundPosition: ['0% 0%', '100% 100%'],
                              }}
                              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0"
                              style={{
                                backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                              }}
                            />
                          </div>

                          {/* Animated Shapes */}
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-10 right-10 w-32 h-32 border-4 border-primary/20 rounded-full"
                          />
                          <motion.div
                            animate={{
                              rotate: [360, 0],
                              scale: [1, 0.9, 1],
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-10 left-10 w-40 h-40 border-4 border-secondary/20"
                            style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
                          />

                          {/* Large Icon with Comic Effect */}
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="relative"
                            >
                              {/* POW! style shadow */}
                              <motion.div
                                animate={{
                                  scale: [1, 1.05, 1],
                                  opacity: [0.5, 0.7, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-2xl"
                              />
                              {/* Main icon */}
                              <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl flex items-center justify-center border-4 border-white">
                                {React.createElement(solutions[currentSolutionIndex].icon, {
                                  size: 80,
                                  className: "text-white",
                                  weight: "duotone"
                                })}
                              </div>
                            </motion.div>
                          </motion.div>

                          {/* Comic-style Badge */}
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="absolute top-6 left-6 bg-yellow-400 text-slate-900 px-4 py-2 rounded-full font-black text-xs tracking-wider shadow-lg border-2 border-slate-900"
                            style={{ transform: 'rotate(-5deg)' }}
                          >
                            FEATURED
                          </motion.div>
                        </div>

                        {/* Right Side - Content */}
                        <div className="p-10 flex flex-col justify-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h3 className="text-4xl font-bold text-foreground mb-4">
                              {solutions[currentSolutionIndex].title}
                            </h3>
                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                              {solutions[currentSolutionIndex].description}
                            </p>

                            {/* Key Highlights - 3 max */}
                            <div className="space-y-3 mb-6">
                              {solutions[currentSolutionIndex].details.slice(0, 3).map((detail, idx) => (
                                <motion.div
                                  key={detail}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + idx * 0.1 }}
                                  className="flex items-center gap-3"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                    <Check size={14} className="text-white" weight="bold" />
                                  </div>
                                  <span className="text-foreground font-medium">{detail}</span>
                                </motion.div>
                              ))}
                            </div>

                            {/* Tech Stack Pills */}
                            <div className="flex flex-wrap gap-2">
                              {solutions[currentSolutionIndex].technologies.slice(0, 4).map((tech, idx) => (
                                <motion.span
                                  key={tech}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + idx * 0.05 }}
                                  className="mono-text text-xs px-3 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-full font-bold border border-primary/20"
                                >
                                  {tech}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Navigation Dots - Comic Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-6 mb-12"
            >
              {solutions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSolutionIndex(index)}
                  className="group relative"
                >
                  {/* Comic-style button */}
                  <motion.div
                    animate={{
                      scale: currentSolutionIndex === index ? 1 : 0.7,
                      rotate: currentSolutionIndex === index ? 0 : 45,
                    }}
                    whileHover={{ scale: 1.1 }}
                    className={`w-4 h-4 rounded-full border-2 border-slate-900 transition-colors ${
                      currentSolutionIndex === index
                        ? 'bg-gradient-to-r from-primary to-secondary'
                        : 'bg-white'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {solutions[index].title}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Arrow Navigation */}
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentSolutionIndex((prev) => (prev === 0 ? solutions.length - 1 : prev - 1))}
                className="w-12 h-12 rounded-full bg-white shadow-lg border-2 border-slate-200 flex items-center justify-center hover:border-primary transition-colors"
              >
                <CaretLeft size={20} weight="bold" className="text-slate-700" />
              </motion.button>

              <span className="mono-text text-sm text-muted-foreground font-bold">
                {currentSolutionIndex + 1} / {solutions.length}
              </span>

              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentSolutionIndex((prev) => (prev === solutions.length - 1 ? 0 : prev + 1))}
                className="w-12 h-12 rounded-full bg-white shadow-lg border-2 border-slate-200 flex items-center justify-center hover:border-primary transition-colors"
              >
                <CaretRight size={20} weight="bold" className="text-slate-700" />
              </motion.button>
            </div>
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

      <section id="case-studies" className="py-32 relative overflow-hidden bg-gradient-to-b from-pink-50/30 via-purple-50/30 to-blue-50/30">
        {/* Animated Paper Cutout Style Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/40 to-pink-50/30" />
        
        {/* Layered Paper Mountains - Parallax Effect */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-64"
          style={{ perspective: '1000px' }}
        >
          {/* Back Mountain Layer */}
          <motion.svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M0,150 Q300,50 600,150 T1200,150 L1200,300 L0,300 Z"
              fill="#c7d2fe"
              opacity="0.4"
            />
          </motion.svg>
          
          {/* Middle Mountain Layer */}
          <motion.svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <path
              d="M0,200 Q300,100 600,200 T1200,200 L1200,300 L0,300 Z"
              fill="#a5b4fc"
              opacity="0.5"
            />
          </motion.svg>
          
          {/* Front Mountain Layer */}
          <motion.svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <path
              d="M0,250 Q300,150 600,250 T1200,250 L1200,300 L0,300 Z"
              fill="#818cf8"
              opacity="0.6"
            />
          </motion.svg>
        </motion.div>

        {/* Cartoon Style Stars */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            style={{
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 51 48">
              <path
                d="M25.5 0L31.5 18H51L35.25 29.25L41.25 48L25.5 36.75L9.75 48L15.75 29.25L0 18H19.5L25.5 0Z"
                fill="#fbbf24"
                opacity="0.4"
              />
            </svg>
          </motion.div>
        ))}

        {/* Animated Doodle Arrows */}
        {[...Array(5)].map((_, i) => (
          <motion.svg
            key={`arrow-${i}`}
            className="absolute"
            width="80"
            height="80"
            viewBox="0 0 100 100"
            style={{
              top: `${20 + i * 15}%`,
              right: `${5 + i * 10}%`,
            }}
            animate={{
              rotate: [0, 10, -10, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <path
              d="M10,50 Q30,30 50,50 T90,50 M90,50 L75,40 M90,50 L75,60"
              stroke="#f59e0b"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
          </motion.svg>
        ))}
        
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
          {/* Minimal Expandable Cards */}
          <div className="space-y-6">
            {caseStudies.map((study, index) => {
              const isExpanded = expandedCaseStudy === index;
              const icons = [CloudArrowUp, Database, Brain, ShieldCheck];
              const Icon = icons[index];
              
              return (
                <motion.div
                  key={study.company}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group"
                >
                  <Card className="border-0 overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500">
                    <CardContent className="p-0">
                      {/* Collapsed View - Minimal Header */}
                      <motion.button
                        onClick={() => setExpandedCaseStudy(isExpanded ? null : index)}
                        className="w-full text-left"
                      >
                        <div className="relative p-8 flex items-center justify-between gap-6 cursor-pointer group-hover:bg-slate-50/50 transition-colors">
                          {/* Left Side - Icon & Info */}
                          <div className="flex items-center gap-6 flex-1">
                            {/* Icon Badge */}
                            <motion.div
                              animate={{
                                rotate: isExpanded ? 360 : 0,
                                scale: isExpanded ? 1.1 : 1,
                              }}
                              transition={{ duration: 0.5, type: "spring" }}
                              className="relative flex-shrink-0"
                            >
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                <Icon size={32} weight="duotone" className="text-primary" />
                              </div>
                              {/* Industry Badge */}
                              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full border-2 border-white shadow-lg">
                                #{index + 1}
                              </span>
                            </motion.div>

                            {/* Company Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                  {study.company}
                                </h3>
                                <span className="mono-text text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold whitespace-nowrap">
                                  {study.industry}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {study.challenge}
                              </p>
                            </div>
                          </div>

                          {/* Right Side - Quick Stats & Expand Button */}
                          <div className="flex items-center gap-6 flex-shrink-0">
                            {/* Quick Stats Preview */}
                            {!isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="hidden md:flex items-center gap-4"
                              >
                                <div className="flex items-center gap-2">
                                  <Check size={16} className="text-green-500" weight="bold" />
                                  <span className="text-sm font-semibold text-foreground">{study.results.length} Results</span>
                                </div>
                                <div className="flex -space-x-1">
                                  {study.technologies.slice(0, 3).map((tech, idx) => (
                                    <div
                                      key={tech}
                                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
                                      title={tech}
                                    >
                                      {tech.slice(0, 2).toUpperCase()}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                            {/* Expand/Collapse Button */}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                            >
                              <CaretDown size={20} weight="bold" className="text-primary" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.button>

                      {/* Expanded View - Full Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-slate-200">
                              {/* Visual Banner */}
                              <div className="relative h-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 overflow-hidden">
                                {/* Animated Pattern */}
                                <motion.div
                                  className="absolute inset-0 opacity-20"
                                  animate={{
                                    backgroundPosition: ['0% 0%', '100% 100%'],
                                  }}
                                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                  style={{
                                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
                                    backgroundSize: '32px 32px'
                                  }}
                                />
                                
                                {/* Floating shapes */}
                                <motion.div
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    x: [0, 30, 0],
                                  }}
                                  transition={{ duration: 6, repeat: Infinity }}
                                  className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl"
                                />
                              </div>

                              {/* Content Grid */}
                              <div className="p-8 grid md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                  {/* Challenge */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <span className="text-xs">⚠️</span>
                                      </div>
                                      <span className="mono-text text-xs text-red-600 tracking-wider font-bold">CHALLENGE</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                      {study.challenge}
                                    </p>
                                  </div>

                                  {/* Solution */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <span className="text-xs">💡</span>
                                      </div>
                                      <span className="mono-text text-xs text-blue-600 tracking-wider font-bold">SOLUTION</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                      {study.solution}
                                    </p>
                                  </div>

                                  {/* Technologies */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <span className="text-xs">🔧</span>
                                      </div>
                                      <span className="mono-text text-xs text-purple-600 tracking-wider font-bold">TECH STACK</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {study.technologies.map((tech) => (
                                        <span
                                          key={tech}
                                          className="mono-text text-[10px] px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full font-semibold"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column - Results */}
                                <div>
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                                      <Check size={14} weight="bold" className="text-green-600" />
                                    </div>
                                    <span className="mono-text text-xs text-green-600 tracking-wider font-bold">KEY RESULTS</span>
                                  </div>
                                  <div className="space-y-3">
                                    {study.results.map((result, idx) => (
                                      <motion.div
                                        key={result}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-transparent border-l-4 border-green-500"
                                      >
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <Check size={14} weight="bold" className="text-white" />
                                        </div>
                                        <span className="text-sm text-foreground font-semibold leading-relaxed">
                                          {result}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Access Hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                👆
              </span>
              Click on any card to explore the full case study
            </p>
          </motion.div>
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

      <section id="contact" className="py-32 px-6 relative overflow-hidden">
        {/* Anime-style Energy Burst Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-fuchsia-50/60 to-pink-50/50" />
        
        {/* Manga-style Impact Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="burst-gradient">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="50%" stopColor="#d946ef" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Radial Burst Lines */}
          {[...Array(32)].map((_, i) => {
            const angle = (i * 360) / 32;
            const rad = (angle * Math.PI) / 180;
            const startRadius = 100;
            const endRadius = 800;
            return (
              <motion.line
                key={`burst-${i}`}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${Math.cos(rad) * endRadius}px)`}
                y2={`calc(50% + ${Math.sin(rad) * endRadius}px)`}
                stroke="url(#burst-gradient)"
                strokeWidth={i % 4 === 0 ? "4" : "2"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.02,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </svg>

        {/* Anime-style Sparkles - Subtle */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20">
              <path
                d="M10 0 L11 9 L20 10 L11 11 L10 20 L9 11 L0 10 L9 9 Z"
                fill="#fbbf24"
                opacity="0.5"
              />
            </svg>
          </motion.div>
        ))}

        {/* Floating Japanese-style Wave Pattern */}
        <motion.svg
          className="absolute bottom-0 left-0 right-0 opacity-20"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          animate={{
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path
            d="M0,100 Q150,50 300,100 T600,100 T900,100 T1200,100 L1200,300 L0,300 Z"
            fill="#c084fc"
            opacity="0.3"
          />
          <path
            d="M0,150 Q200,100 400,150 T800,150 T1200,150 L1200,300 L0,300 Z"
            fill="#d946ef"
            opacity="0.2"
          />
        </motion.svg>

        {/* Comic Book Speech Bubble */}
        <motion.div
          className="absolute top-20 right-20 hidden lg:block"
          animate={{
            y: [0, -20, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          <svg width="200" height="120" viewBox="0 0 200 120">
            <path
              d="M20,20 Q20,10 30,10 L170,10 Q180,10 180,20 L180,70 Q180,80 170,80 L50,80 L30,100 L35,80 L30,80 Q20,80 20,70 Z"
              fill="white"
              stroke="#a855f7"
              strokeWidth="3"
            />
            <text x="100" y="50" textAnchor="middle" fill="#a855f7" fontSize="20" fontWeight="bold">
              Let's Talk!
            </text>
          </svg>
        </motion.div>
        
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
        {/* Animated Sketch/Doodle Style Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50/30 via-orange-50/40 to-slate-50/50" />
        
        {/* Hand-drawn Style Animated Circles */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          {[...Array(8)].map((_, i) => (
            <motion.circle
              key={`sketch-circle-${i}`}
              cx={`${20 + i * 12}%`}
              cy={`${30 + (i % 3) * 20}%`}
              r="40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ 
                pathLength: [0, 1],
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Squiggly Lines */}
          {[...Array(6)].map((_, i) => (
            <motion.path
              key={`squiggle-${i}`}
              d={`M${i * 200},100 Q${i * 200 + 50},50 ${i * 200 + 100},100 T${i * 200 + 200},100`}
              fill="none"
              stroke="#fb923c"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </svg>

        {/* Cartoon Character Elements - Floating Icons */}
        {[
          { emoji: '☁️', delay: 0 },
          { emoji: '⚡', delay: 0.5 },
          { emoji: '🚀', delay: 1 },
          { emoji: '💡', delay: 1.5 },
          { emoji: '🎯', delay: 2 },
        ].map((item, i) => (
          <motion.div
            key={`emoji-${i}`}
            className="absolute text-6xl"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + (i % 2) * 75}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [-10, 10, -10],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut"
            }}
          >
            <div className="filter drop-shadow-lg opacity-30">
              {item.emoji}
            </div>
          </motion.div>
        ))}

        {/* Animated Pencil Drawing Effect */}
        <motion.svg
          className="absolute top-10 right-10 opacity-20"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          animate={{
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          {/* Drawing a lightbulb */}
          <motion.path
            d="M100,50 Q100,30 100,40 L100,70 Q80,90 80,110 Q80,130 100,130 Q120,130 120,110 Q120,90 100,70 Z M95,135 L105,135 L105,145 L95,145 Z M90,145 L110,145"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </motion.svg>
        
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
      <section className="py-20 bg-gradient-to-b from-slate-50/50 via-slate-50 to-slate-100/80 border-y border-slate-200">
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
        {/* Light Background with smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-blue-50/40 to-purple-50/40" />
        
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
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Shape the Future with Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              Join a team of innovators building next-generation solutions
            </p>
          </motion.div>

          {/* Open Positions - Elegant Minimal Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              {
                role: 'Cloud Platform Architect',
                department: 'Engineering',
                location: 'Remote',
                icon: CloudArrowUp,
                gradient: 'from-blue-400/60 to-cyan-400/60',
                stack: ['AWS', 'Kubernetes', 'Terraform']
              },
              {
                role: 'Senior ML Engineer',
                department: 'AI & Data',
                location: 'Remote',
                icon: Brain,
                gradient: 'from-purple-400/60 to-pink-400/60',
                stack: ['Python', 'TensorFlow', 'PyTorch']
              },
              {
                role: 'Security Architect',
                department: 'Security',
                location: 'Remote',
                icon: ShieldCheck,
                gradient: 'from-green-400/60 to-emerald-400/60',
                stack: ['Zero Trust', 'IAM', 'SIEM']
              },
              {
                role: 'Data Platform Engineer',
                department: 'Data Engineering',
                location: 'Remote',
                icon: Database,
                gradient: 'from-orange-400/60 to-red-400/60',
                stack: ['Spark', 'Airflow', 'Snowflake']
              }
            ].map((job, idx) => (
              <motion.div
                key={job.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Gradient Top Bar */}
                    <div className={`h-2 bg-gradient-to-r ${job.gradient}`} />
                    
                    <div className="p-8">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${job.gradient} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <job.icon size={28} weight="duotone" className="text-white" />
                      </div>
                      
                      {/* Role Title */}
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {job.role}
                      </h3>
                      
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-sm text-muted-foreground font-medium">
                          {job.department}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-sm text-muted-foreground">
                          {job.location}
                        </span>
                      </div>
                      
                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {job.stack.map((tech) => (
                          <span 
                            key={tech}
                            className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      {/* Apply Button */}
                      <Button 
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg transition-all duration-300 font-semibold"
                      >
                        View Details
                        <ArrowRight size={16} className="ml-2" weight="bold" />
                      </Button>
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
            <div className="max-w-2xl mx-auto p-12 rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm border border-slate-200 shadow-lg">
              <h3 className="text-3xl font-bold text-foreground mb-3">
                Don't see the right role?
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We're always looking for exceptional talent. Share your profile with us.
              </p>
              <Button 
                size="lg"
                className="bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl transition-all duration-300 font-semibold px-8"
              >
                Send Your Resume
                <ArrowRight className="ml-2" size={18} weight="bold" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="expertise" className="py-32 px-6 relative overflow-hidden">
        {/* Background Elements with smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/40 via-blue-50/30 to-slate-50" />
        
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200/80" />
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm mb-6 border border-primary/30">
                  <EnvelopeSimple size={32} weight="duotone" className="text-primary" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  Stay ahead of the curve
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
                className="grid sm:grid-cols-3 gap-8 pt-12 border-t border-slate-300"
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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm mb-4 group-hover:bg-primary/20 transition-colors border border-primary/20">
                      <benefit.icon size={24} weight="duotone" className="text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2 text-base">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer Section */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-slate-200/80 via-slate-100 to-slate-50">
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
                                onClick={() => handleNavClick(item.section)}
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
                      href="mailto:consult@agrani.digital" 
                      className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <EnvelopeSimple size={18} weight="duotone" className="text-slate-700 group-hover:text-primary" />
                      </div>
                      <span>consult@agrani.digital</span>
                    </a>
                    <a 
                      href="tel:+919991804546" 
                      className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Phone size={18} weight="duotone" className="text-slate-700 group-hover:text-primary" />
                      </div>
                      <span>+91 99918 04546</span>
                    </a>
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={18} weight="duotone" className="text-slate-700" />
                      </div>
                      <div>
                        <p className="leading-relaxed">WW 43 Sohna Road, Malibu Towne,</p>
                        <p className="leading-relaxed">Sector 47, Gurgaon, Haryana 122018</p>
                      </div>
                    </div>
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

          {/* Wiz.io Style Animated Clouds at Footer Bottom */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50">
            {/* Animated Clouds - Bottom of Footer */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Large Bottom Clouds */}
              {[
                { left: '-8%', bottom: '-20%', scale: 1.4, duration: 45, delay: 0 },
                { left: '25%', bottom: '-25%', scale: 1.2, duration: 55, delay: 5 },
                { left: '55%', bottom: '-18%', scale: 1.5, duration: 50, delay: 10 },
                { left: '85%', bottom: '-22%', scale: 1.3, duration: 60, delay: 15 },
              ].map((cloud, idx) => (
                <motion.div
                  key={`footer-cloud-${idx}`}
                  className="absolute"
                  style={{
                    left: cloud.left,
                    bottom: cloud.bottom,
                    transform: `scale(${cloud.scale})`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    x: ['-5%', '5%', '-5%'],
                  }}
                  transition={{
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: cloud.duration, repeat: Infinity, ease: "easeInOut" },
                    delay: cloud.delay,
                  }}
                >
                  <svg width="250" height="150" viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Cute fluffy cloud */}
                    <path
                      d="M40,90 Q35,70 50,65 Q55,45 75,40 Q90,30 110,35 Q130,38 145,50 Q165,48 185,60 Q205,68 210,85 Q215,100 195,105 L60,105 Q40,105 40,90 Z"
                      fill="white"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    {/* Inner details */}
                    <path
                      d="M65,90 Q85,83 105,90"
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    <path
                      d="M125,88 Q150,80 170,88"
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    {/* Soft shadow */}
                    <ellipse cx="125" cy="100" rx="70" ry="8" fill="#3B82F6" opacity="0.08" />
                  </svg>
                </motion.div>
              ))}

              {/* Small Floating Clouds */}
              {[...Array(6)].map((_, idx) => {
                const leftPos = `${15 + idx * 15}%`;
                return (
                  <motion.div
                    key={`footer-small-cloud-${idx}`}
                    className="absolute"
                    style={{
                      left: leftPos,
                      bottom: `${-10 + (idx % 3) * 15}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      x: ['-8%', '8%', '-8%'],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      y: { duration: 5 + idx, repeat: Infinity, ease: "easeInOut" },
                      x: { duration: 40 + idx * 5, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      delay: idx * 2,
                    }}
                  >
                    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20,50 Q18,38 32,36 Q38,25 52,25 Q66,25 72,36 Q82,34 92,42 Q100,48 100,56 Q100,65 88,68 L34,68 Q20,65 20,50 Z"
                        fill="white"
                        stroke="#6366F1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.7"
                      />
                      <ellipse cx="56" cy="62" rx="30" ry="4" fill="#6366F1" opacity="0.06" />
                    </svg>
                  </motion.div>
                );
              })}

              {/* Decorative Stars/Sparkles */}
              {[...Array(8)].map((_, idx) => (
                <motion.div
                  key={`footer-sparkle-${idx}`}
                  className="absolute"
                  style={{
                    left: `${10 + idx * 12}%`,
                    top: `${20 + (idx % 3) * 20}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: idx * 0.8,
                    ease: "easeInOut",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path
                      d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z"
                      fill="#93C5FD"
                      opacity="0.6"
                    />
                  </svg>
                </motion.div>
              ))}

              {/* Curved decorative lines */}
              {[
                { left: '10%', rotate: -20 },
                { left: '45%', rotate: 15 },
                { left: '78%', rotate: -15 },
              ].map((line, idx) => (
                <motion.div
                  key={`footer-line-${idx}`}
                  className="absolute bottom-8"
                  style={{
                    left: line.left,
                    transform: `rotate(${line.rotate}deg)`,
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4 + idx,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 1.5,
                  }}
                >
                  <svg width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5,15 Q20,5 35,15 Q50,25 55,15"
                      stroke="#60A5FA"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </motion.div>
              ))}
            </div>

            {/* Gradient overlay for smooth blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-50/50 to-slate-100 pointer-events-none" />
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

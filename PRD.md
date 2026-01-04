# Planning Guide

A futuristic single-page marketing website for Agrani Digital, a quantum-era technology consultancy specializing in digital transformation, cognitive AI, data intelligence, and quantum security—designed with a 2035 aesthetic featuring minimalist design, holographic elements, and clean sci-fi visual language.

**Experience Qualities**:
1. **Futuristic** - The design embodies 2035 technology aesthetics through holographic gradients, neural network visualizations, and sleek glassmorphism that feels like looking into the next decade
2. **Minimalist** - Clean, uncluttered interfaces with generous negative space, precise typography, and intentional visual hierarchy that lets content breathe
3. **Artistic** - Subtle ambient animations, data-inspired visual patterns, and carefully curated color combinations that elevate the experience beyond typical corporate sites

**Complexity Level**: Content Showcase (information-focused)
  - This is a marketing landing page designed to present comprehensive information about quantum-era services and expertise with immersive visual storytelling but minimal interactive complexity.

## Essential Features

### Immersive Hero Section
- **Functionality**: Full-screen hero with holographic title treatment, neural network background animation, and interactive service carousel
- **Purpose**: Create immediate impact establishing Agrani Digital as a forward-thinking technology leader
- **Trigger**: Page load
- **Progression**: Page loads → Neural network animates → Holographic text reveals company name → Stats fade in → Carousel becomes interactive
- **Success criteria**: Visitors immediately understand the futuristic positioning and core service areas

### Solutions Architecture
- **Functionality**: Expandable solution cards for Digital Transformation, Data Intelligence, Cognitive AI, and Quantum Security
- **Purpose**: Communicate depth of expertise in emerging technology domains
- **Trigger**: User scrolls to solutions section
- **Progression**: Cards animate into view → User reads overview → Expands for detailed capabilities → Views technology stack
- **Success criteria**: Clear understanding of service offerings and technical depth

### Case Studies Ticker
- **Functionality**: Horizontal auto-scrolling ticker of client success stories with pause-on-hover
- **Purpose**: Build credibility through demonstrated results
- **Trigger**: User scrolls to case studies section
- **Progression**: Ticker animates continuously → User hovers to pause → Reads case study details → Sees measurable outcomes
- **Success criteria**: Concrete results displayed with industry context and technology used

### Contact Integration
- **Functionality**: Slide-out drawer form with LLM-powered email generation
- **Purpose**: Convert interested visitors into consultation requests
- **Trigger**: User clicks any CTA
- **Progression**: Drawer slides in → User fills form → Submits → LLM generates professional email → Confirmation displayed
- **Success criteria**: Smooth form submission with intelligent response generation

### Futuristic Loading Screen with Real Progress
- **Functionality**: Immersive loading screen displaying actual data fetching progress with step-by-step status indicators
- **Purpose**: Provide transparent feedback during initial page load while reinforcing the futuristic brand identity
- **Trigger**: Page load
- **Progression**: Screen appears → Progress bar fills based on real asset loading → Individual steps show loading/complete states → Neural animations respond to progress → Screen fades out when complete
- **Success criteria**: Users see genuine progress (not fake timers), each step clearly labeled with status indicators (pending, loading, complete)

## Edge Case Handling

- **Performance Optimization**: Canvas animations throttled on low-power devices, reduced particle density on mobile
- **Graceful Degradation**: Static gradients fallback if WebGL unavailable
- **Form Validation**: Required fields validated with inline error states
- **Mobile Experience**: Touch-optimized carousel, simplified animations, stacked layouts

## Design Direction

The design should evoke a vision of technology in 2035—clean, sophisticated, and quietly impressive. Visual language draws from sci-fi interfaces, data visualization, and contemporary minimalism. The aesthetic balances the cold precision of technology with warm, approachable interactions. Every element should feel intentional and refined, suggesting a company that operates at the cutting edge.

## Color Selection

A dark-mode futuristic palette with cyan, purple, and mint accents:

- **Primary Color**: Cyan (oklch(0.75 0.18 195)) - Represents technology, clarity, and innovation; the signature glow color
- **Secondary Color**: Purple (oklch(0.70 0.22 280)) - Adds depth and suggests AI/cognitive computing
- **Accent Color**: Mint (oklch(0.80 0.15 160)) - Fresh, optimistic highlight for success states and emphasis
- **Background**: Deep space (oklch(0.08 0.02 260)) - Near-black with subtle blue undertones for depth
- **Foreground/Background Pairings**:
  - Primary (Cyan): Dark background (oklch(0.08 0.02 260)) - Ratio 10.5:1 ✓
  - Secondary (Purple): Dark background (oklch(0.08 0.02 260)) - Ratio 8.2:1 ✓
  - Accent (Mint): Dark background (oklch(0.08 0.02 260)) - Ratio 12.3:1 ✓
  - Foreground text (oklch(0.95 0.01 260)): Background (oklch(0.08 0.02 260)) - Ratio 15.8:1 ✓

## Font Selection

Typography should feel futuristic yet readable, with monospace accents for technical precision.

- **Primary Font**: Space Grotesk - Geometric sans-serif with technical character, used for headings and brand elements
- **Monospace Font**: JetBrains Mono - For labels, technical details, and UI accents that suggest code/data

- **Typographic Hierarchy**:
  - H1 (Company Name): Space Grotesk Medium/72px/tight tracking (-0.02em) with holographic gradient
  - H2 (Section Titles): Space Grotesk Medium/32px/tight tracking (-0.01em)
  - H3 (Card Titles): Space Grotesk Medium/20px/normal tracking
  - Body: Space Grotesk Light/14px/relaxed line-height (1.6)
  - Labels: JetBrains Mono Regular/10px/wide tracking (0.05em) uppercase

## Animations

Animations should feel ambient and purposeful—more data visualization than UI flourish. Neural network background provides constant subtle movement. Holographic text gradients shift continuously. Cards and elements have minimal hover states with quick, precise transitions. Scroll-triggered reveals use simple fade-up with spring easing. The overall effect should feel like observing a living data system rather than triggering animations.

## Component Selection

- **Components**:
  - Card: Neo-morphic cards with gradient backgrounds and subtle glow effects
  - Button: Futuristic buttons with sweep animations and gradient fills
  - Sheet: Glassmorphism drawer for contact form
  - Select: Styled dropdowns matching dark theme
  - Input/Textarea: Glass-panel styling with subtle focus states
  - Separator: Gradient separators for section division
  
- **Customizations**:
  - HolographicGrid: Custom canvas component rendering perspective grid
  - NeuralNetwork: Custom canvas component rendering connected nodes with data pulses
  - Glass panels: Backdrop blur with semi-transparent backgrounds
  - Holo-text: Multi-color gradient text with continuous animation
  - Neo-cards: Dark cards with subtle gradient and glow on hover
  
- **States**:
  - Buttons: Gradient fill with sweep effect on hover, slight scale reduction on press
  - Cards: Border glow intensifies on hover, subtle lift
  - Inputs: Border brightens to primary on focus
  - Navigation: Gradient underline on active section
  
- **Icon Selection** (Phosphor Icons, light weight):
  - CloudArrowUp: Digital Transformation
  - Database: Data Intelligence
  - Brain: Cognitive AI
  - ShieldCheck: Quantum Security
  - Users: Enterprise clients
  - ArrowRight: CTAs and navigation
  - CaretDown/Left/Right: Scroll and carousel navigation
  - CircleNotch: Loading states
  
- **Spacing**:
  - Section padding: py-32 for generous breathing room
  - Container max-width: max-w-5xl for focused content width
  - Card padding: p-6 to p-8 for comfortable reading
  - Grid gaps: gap-4 to gap-6 for tight, clean layouts
  
- **Mobile**:
  - Simplified canvas animations (reduced particle count)
  - Stacked single-column layouts
  - Reduced padding (py-16 to py-24)
  - Touch-friendly carousel with swipe gestures
  - Full-width drawer for contact form

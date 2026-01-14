import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, CalendarBlank, Clock, Tag as TagIcon, ArrowRight, House, ArrowLeft } from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllBlogPosts, getAllTags, searchBlogPosts, formatDate } from '@/lib/blog';
import type { BlogMeta } from '@/types/blog';

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerOpacity, setHeaderOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      
      // Calculate opacity based on scroll position (always keep visible)
      const opacity = Math.max(0.95, Math.min(currentScrollY / 300, 1));
      setHeaderOpacity(opacity);
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  // Set document title for blog list page
  useEffect(() => {
    document.title = 'Blog | AGRANI DIGITAL';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Insights on digital transformation, cloud computing, AI, and cybersecurity from AGRANI DIGITAL experts.');
    }
    
    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'AGRANI DIGITAL | Quantum-Era Digital Transformation';
    };
  }, []);
  
  const allPosts = getAllBlogPosts();
  const allTags = getAllTags();
  
  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    
    if (searchQuery) {
      posts = searchBlogPosts(searchQuery);
    }
    
    if (selectedTag) {
      posts = posts.filter(post => 
        post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }
    
    return posts;
  }, [searchQuery, selectedTag, allPosts]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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
            <Link to="/" className="group relative flex-shrink-0">
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
            </Link>
            
            <motion.button
              onClick={() => navigate('/')}
              className="text-sm font-bold tracking-wider relative transition-all text-slate-700 hover:text-primary"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mono-text">HOME</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-primary/5 to-secondary/5" />
        
        {/* Decorative Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl"
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="mono-text text-sm text-primary tracking-widest mb-4 block font-semibold">
              INSIGHTS & PERSPECTIVES
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
              Agrani Digital Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Expert insights on digital transformation, cloud computing, AI, cybersecurity, and enterprise technology
            </p>
          </motion.div>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <MagnifyingGlass 
                size={20} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" 
                weight="bold"
              />
              <Input
                type="text"
                placeholder="Search articles by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base rounded-xl border-2 focus:border-primary"
              />
            </div>
          </motion.div>
          
          {/* Tag Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all ${
                selectedTag === null 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-primary/10'
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All Posts
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all ${
                  selectedTag === tag 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-primary/10'
                }`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Blog Posts Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-muted-foreground text-center">
              {filteredPosts.length === 0 ? (
                'No articles found'
              ) : (
                `Showing ${filteredPosts.length} ${filteredPosts.length === 1 ? 'article' : 'articles'}${
                  searchQuery ? ` matching "${searchQuery}"` : ''
                }${selectedTag ? ` in "${selectedTag}"` : ''}`
              )}
            </p>
          </div>
          
          {/* Posts Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${searchQuery}-${selectedTag}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPosts.map((post, index) => (
                <BlogPostCard key={post.slug} post={post} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
          
          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <MagnifyingGlass size={48} className="text-primary" weight="duotone" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
                className="text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function BlogPostCard({ post, index }: { post: BlogMeta; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/blog/${post.slug}`}>
        <Card className="h-full border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 group">
          <CardContent className="p-0">
            {/* Cover Image */}
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
              {post.coverImage && (
                <img 
                  src={post.coverImage} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback gradient if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Tags Overlay */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="backdrop-blur-sm bg-white/90 text-foreground font-semibold"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarBlank size={16} weight="duotone" />
                  <span>{formatDate(post.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} weight="duotone" />
                  <span>5 min read</span>
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                {post.description}
              </p>
              
              {/* Read More Link */}
              <div className="pt-2 flex items-center gap-2 text-primary font-semibold text-sm group/link">
                Read Article
                <ArrowRight 
                  size={16} 
                  weight="bold" 
                  className="group-hover/link:translate-x-1 transition-transform" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

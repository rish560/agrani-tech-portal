import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { 
  ArrowLeft, 
  CalendarBlank, 
  Clock, 
  User, 
  ShareNetwork,
  TwitterLogo,
  LinkedinLogo,
  Link as LinkIcon,
  House
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getBlogPostBySlug, formatDate, getAllBlogPosts } from '@/lib/blog';
import type { BlogPost } from '@/types/blog';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
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

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        navigate('/blog');
        return;
      }

      setLoading(true);
      const postData = await getBlogPostBySlug(slug);
      
      if (!postData) {
        navigate('/blog');
        return;
      }

      setPost(postData);
      
      // Update document title and meta tags
      document.title = `${postData.title} | AGRANI DIGITAL Blog`;
      
      // Helper function to update or create meta tag
      const updateMetaTag = (name: string, content: string, property?: string) => {
        const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
        let metaTag = document.querySelector(selector);
        
        if (metaTag) {
          metaTag.setAttribute('content', content);
        } else {
          const meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', property);
          } else {
            meta.setAttribute('name', name);
          }
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        }
      };
      
      // Update standard meta tags
      updateMetaTag('description', postData.description);
      updateMetaTag('author', postData.author);
      updateMetaTag('keywords', postData.tags.join(', '));
      
      // Update Open Graph tags for social media
      updateMetaTag('', postData.title, 'og:title');
      updateMetaTag('', postData.description, 'og:description');
      updateMetaTag('', 'article', 'og:type');
      updateMetaTag('', window.location.href, 'og:url');
      if (postData.coverImage) {
        updateMetaTag('', postData.coverImage, 'og:image');
      }
      
      // Update Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', postData.title);
      updateMetaTag('twitter:description', postData.description);
      if (postData.coverImage) {
        updateMetaTag('twitter:image', postData.coverImage);
      }
      
      // Configure marked for better rendering
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      
      if (postData.content) {
        const html = await marked.parse(postData.content);
        setHtmlContent(html);
      }
      
      setLoading(false);
    };

    loadPost();
    
    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'AGRANI DIGITAL | Quantum-Era Digital Transformation';
    };
  }, [slug, navigate]);

  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = window.location.href;
    const text = post?.title || '';

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        // You could add a toast notification here
        alert('Link copied to clipboard!');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const relatedPosts = getAllBlogPosts()
    .filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag)))
    .slice(0, 3);

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
            
            <div className="flex items-center gap-8">
              <motion.button
                onClick={() => navigate('/blog')}
                className="text-sm font-bold tracking-wider relative transition-all text-slate-700 hover:text-primary"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mono-text">ALL POSTS</span>
              </motion.button>
              
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 px-6 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {post.tags.map((tag) => (
              <Badge 
                key={tag}
                variant="secondary"
                className="backdrop-blur-sm bg-white/90 text-foreground font-semibold"
              >
                {tag}
              </Badge>
            ))}
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>
          
          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-6 text-gray-300 mb-8"
          >
            <div className="flex items-center gap-2">
              <User size={20} weight="duotone" />
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarBlank size={20} weight="duotone" />
              <span>{formatDate(post.date)}</span>
            </div>
            {post.readingTime && (
              <div className="flex items-center gap-2">
                <Clock size={20} weight="duotone" />
                <span>{post.readingTime} min read</span>
              </div>
            )}
          </motion.div>
          
          {/* Share Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <span className="text-gray-300 font-semibold mr-2">Share:</span>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => handleShare('twitter')}
            >
              <TwitterLogo size={18} weight="fill" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => handleShare('linkedin')}
            >
              <LinkedinLogo size={18} weight="fill" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => handleShare('copy')}
            >
              <LinkIcon size={18} weight="bold" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="prose prose-lg prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
              prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10
              prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-bold
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-slate-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-muted-foreground prose-li:mb-2
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic
              prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          
          <Separator className="my-12" />
          
          {/* Author Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/10"
          >
            <h3 className="text-xl font-bold mb-3 text-foreground">About the Author</h3>
            <p className="text-muted-foreground mb-4">
              The <strong>{post.author}</strong> is composed of experienced technology consultants specializing in digital transformation, 
              cloud computing, AI, and cybersecurity. We share insights from real-world enterprise implementations.
            </p>
            <Link to="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Work With Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center text-foreground">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.slug}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/blog/${relatedPost.slug}`}>
                    <div className="h-full border-0 rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 group">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                        {relatedPost.coverImage && (
                          <img 
                            src={relatedPost.coverImage} 
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {relatedPost.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
              Ready to Transform Your Enterprise?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's discuss how Agrani Digital can help you achieve your digital transformation goals
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-8 py-6 text-lg"
                >
                  Schedule a Consultation
                </Button>
              </Link>
              <Link to="/blog">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 px-8 py-6 text-lg"
                >
                  Read More Articles
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

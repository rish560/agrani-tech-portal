import { BlogPost, BlogMeta } from '../types/blog';

// In a real application, this would be generated at build time
// For now, we'll manually maintain this list
const blogPosts: BlogMeta[] = [
  {
    slug: 'zero-trust-security-enterprise-guide',
    title: 'Zero Trust Security: The Modern Enterprise Defense Strategy',
    date: '2026-01-14',
    author: 'Agrani Digital Team',
    description: 'Understanding and implementing Zero Trust architecture to protect your organization from evolving cybersecurity threats in the cloud era.',
    tags: ['Security', 'Zero Trust', 'Cybersecurity', 'Cloud Security'],
    coverImage: '/blog-images/zero-trust-security.jpg',
  },
  {
    slug: 'enterprise-ai-transformation-guide',
    title: 'Enterprise AI Transformation: A Practical Guide',
    date: '2026-01-12',
    author: 'Agrani Digital Team',
    description: 'A comprehensive guide to implementing AI solutions that deliver measurable business value while maintaining security, compliance, and ethical standards.',
    tags: ['AI', 'Machine Learning', 'Digital Transformation', 'Enterprise'],
    coverImage: '/blog-images/ai-transformation.jpg',
  },
  {
    slug: 'building-scalable-cloud-architectures-kubernetes',
    title: 'Building Scalable Cloud Architectures with Kubernetes',
    date: '2026-01-10',
    author: 'Agrani Digital Team',
    description: 'Learn how enterprise organizations are leveraging Kubernetes to build resilient, scalable cloud-native applications that drive digital transformation.',
    tags: ['Cloud', 'Kubernetes', 'DevOps', 'Architecture'],
    coverImage: '/blog-images/kubernetes-architecture.jpg',
  },
];

export const getAllBlogPosts = (): BlogMeta[] => {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Map slugs to actual filenames
const slugToFilename: Record<string, string> = {
  'zero-trust-security-enterprise-guide': 'zero-trust-security.md',
  'enterprise-ai-transformation-guide': 'ai-transformation-guide.md',
  'building-scalable-cloud-architectures-kubernetes': 'example-post.md',
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const meta = blogPosts.find(post => post.slug === slug);
  if (!meta) return null;

  try {
    // Get the actual filename from the slug mapping
    const filename = slugToFilename[slug];
    if (!filename) {
      console.error('No filename mapping found for slug:', slug);
      return null;
    }
    
    const response = await fetch(`/content/blog/${filename}`);
    if (!response.ok) {
      console.error('Failed to fetch blog post:', filename);
      return null;
    }
    
    const content = await response.text();
    // Extract content after frontmatter (everything after the second ---)
    const contentMatch = content.match(/---[\s\S]*?---\n\n([\s\S]*)/);
    
    return {
      ...meta,
      content: contentMatch ? contentMatch[1] : content,
      readingTime: calculateReadingTime(content),
    };
  } catch (error) {
    console.error('Error loading blog post:', error);
    return null;
  }
};

export const getBlogPostsByTag = (tag: string): BlogMeta[] => {
  return blogPosts
    .filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const searchBlogPosts = (query: string): BlogMeta[] => {
  const lowerQuery = query.toLowerCase();
  return blogPosts
    .filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

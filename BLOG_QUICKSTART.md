# Blog System Documentation

## Quick Start

The blog system is now fully integrated! Visit `/blog` to see all posts.

### File Structure

```
agrani-tech-portal/
├── content/blog/              # Source markdown files (for editing)
│   ├── example-post.md
│   ├── ai-transformation-guide.md
│   └── zero-trust-security.md
├── public/
│   ├── content/blog/          # Runtime-accessible markdown (copy from content/)
│   ├── blog-images/           # Blog cover images
│   ├── _redirects             # SPA routing config
│   └── _routes.json           # Cloudflare Pages routing
├── src/
│   ├── pages/
│   │   ├── BlogListPage.tsx   # Blog listing with search/filter
│   │   └── BlogPostPage.tsx   # Individual post view
│   ├── lib/
│   │   └── blog.ts            # Blog utilities and post registry
│   └── types/
│       └── blog.ts            # TypeScript types
└── BLOG_README.md             # Detailed blog documentation
```

## Adding a New Blog Post (3 Steps)

### Step 1: Create Markdown File

Create `content/blog/your-post-slug.md`:

```markdown
---
title: "Your Amazing Post Title"
date: "2026-01-15"
author: "Agrani Digital Team"
description: "Compelling SEO-friendly description"
tags: ["Cloud", "AI", "Security"]
coverImage: "/blog-images/your-image.jpg"
slug: "your-post-slug"
---

# Your Post Title

Your content in Markdown format...
```

### Step 2: Copy to Public Directory

```bash
copy content\blog\your-post-slug.md public\content\blog\your-post-slug.md
```

### Step 3: Register in blog.ts

Edit `src/lib/blog.ts` and add to `blogPosts` array at the TOP:

```typescript
{
  slug: 'your-post-slug',
  title: 'Your Amazing Post Title',
  date: '2026-01-15',
  author: 'Agrani Digital Team',
  description: 'Compelling SEO-friendly description',
  tags: ['Cloud', 'AI', 'Security'],
  coverImage: '/blog-images/your-image.jpg',
},
```

## Features

### ✅ Implemented
- **SEO-Friendly**: Meta tags, descriptions, structured data ready
- **Responsive Design**: Mobile-first, works on all devices
- **Search**: Full-text search across titles, descriptions, tags
- **Tag Filtering**: Click tags to filter posts
- **Markdown Support**: Full markdown with code syntax highlighting
- **Social Sharing**: Twitter, LinkedIn, copy link
- **Related Posts**: Automatic suggestions based on tags
- **Reading Time**: Auto-calculated from content
- **Modern UI**: Framer Motion animations, gradient effects
- **Accessible**: Proper semantic HTML and ARIA labels

### 🎨 Design
- Consistent with main site branding
- Professional typography (Inter font)
- Gradient accents matching primary/secondary/accent colors
- Glass-morphism effects
- Smooth animations and transitions

## Routes

- `/` - Homepage (existing SPA)
- `/blog` - Blog list with search and filters
- `/blog/:slug` - Individual blog post

## Deployment

The blog works as a client-side SPA with the following deployment files:

- `public/_redirects` - For Netlify/generic hosts
- `public/_routes.json` - For Cloudflare Pages

**Note**: For production SEO, consider:
1. Server-side rendering (SSR)
2. Static site generation (SSG)
3. Pre-rendering at build time

See `BLOG_README.md` for detailed implementation notes.

## Example Posts Included

1. **Kubernetes Architecture** - Cloud infrastructure guide
2. **AI Transformation** - Enterprise AI implementation  
3. **Zero Trust Security** - Cybersecurity best practices

## Navigation

The "BLOGS" link in the main navbar now routes to `/blog`. The blog pages include:
- Back to main site navigation
- Consistent header/navbar styling
- Call-to-action sections linking back to contact

## Technical Details

- **Router**: React Router v6
- **Markdown**: Marked.js for parsing
- **Icons**: Phosphor Icons (matching main site)
- **UI**: shadcn/ui components
- **Animations**: Framer Motion

## Support

See `BLOG_README.md` for comprehensive documentation including:
- Detailed setup instructions
- Customization guide
- SEO optimization tips
- Analytics integration
- Troubleshooting

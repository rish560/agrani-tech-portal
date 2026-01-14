# Blog Implementation Guide

## Overview

The blog system is fully integrated into the Agrani Digital website with SEO-friendly features, responsive design, and Markdown support.

## Adding a New Blog Post

### 1. Create the Markdown File

Create a new `.md` file in `content/blog/` directory with the following frontmatter structure:

```markdown
---
title: "Your Blog Post Title"
date: "YYYY-MM-DD"
author: "Agrani Digital Team"
description: "A compelling description that appears in search results and post cards"
tags: ["Cloud", "AI", "Security", "Data"]
coverImage: "/blog-images/your-image.jpg"
slug: "your-post-slug"
---

# Your Blog Post Title

Your content goes here...
```

### 2. Add Cover Image

- Place your cover image in `public/blog-images/`
- Recommended size: 1200x630px (Facebook/LinkedIn Open Graph size)
- Supported formats: JPG, PNG, WebP
- Update the `coverImage` field in frontmatter with the path

### 3. Register the Post

Edit `src/lib/blog.ts` and add your post to the `blogPosts` array:

```typescript
{
  slug: 'your-post-slug',
  title: 'Your Blog Post Title',
  date: '2026-01-15',
  author: 'Agrani Digital Team',
  description: 'Your description...',
  tags: ['Cloud', 'AI'],
  coverImage: '/blog-images/your-image.jpg',
}
```

**Important**: Add new posts at the top of the array for proper chronological sorting.

### 4. Copy to Public Directory

After creating the markdown file in `content/blog/`, copy it to `public/content/blog/`:

```bash
copy content\blog\your-post.md public\content\blog\your-post.md
```

Or update all:

```bash
xcopy content\blog\*.md public\content\blog\ /Y
```

## Markdown Features Supported

- **Headings**: # H1, ## H2, ### H3
- **Bold**: **text** or __text__
- **Italic**: *text* or _text_
- **Links**: [text](url)
- **Images**: ![alt](image-url)
- **Code Blocks**: ```language ... ```
- **Inline Code**: `code`
- **Lists**: Ordered and unordered
- **Blockquotes**: > quote
- **Horizontal Rules**: ---

## Styling

Blog posts use a custom prose styling that matches the site's design:

- Professional typography with Inter font
- Gradient primary color for links
- Code syntax highlighting
- Responsive images with rounded corners
- Proper spacing and line heights

## Routes

- **Blog List**: `/blog` - Shows all blog posts with search and filter
- **Blog Post**: `/blog/:slug` - Individual post page
- **Home**: `/` - Main website

## SEO Features

Each blog post page includes:

- Dynamic title tags
- Meta descriptions from frontmatter
- Author attribution
- Publication dates
- Structured data (can be added for Article schema)
- Social sharing buttons (Twitter, LinkedIn)

## Search & Filter

The blog list page includes:

- **Search**: Searches titles, descriptions, and tags
- **Tag Filter**: Click any tag to filter posts
- **Responsive**: Works on all device sizes
- **Empty State**: Shows when no results found

## Deployment Notes

### For Cloudflare Pages/Vite Static Hosting

The blog works as a client-side rendered SPA. For true pre-rendering and SEO:

1. Consider using a static site generator like Astro or Next.js for the blog
2. Or implement a build script to generate static HTML for each post
3. Add `_redirects` file for SPA routing:

```
/blog/* /index.html 200
/* /index.html 200
```

### Current Implementation

- Blog posts are loaded dynamically via fetch()
- Markdown is parsed client-side with `marked`
- Content is in `public/content/blog/` for runtime access
- Images are in `public/blog-images/`

## Customization

### Changing Colors

Edit `src/pages/BlogPostPage.tsx` and `src/pages/BlogListPage.tsx`:

- Primary color: `text-primary`, `bg-primary`
- Hover states: Adjust `hover:` classes
- Gradients: Modify `bg-gradient-to-r from-primary via-secondary to-accent`

### Adding Categories

Currently uses tags. To add hierarchical categories:

1. Add `category` field to frontmatter
2. Update `BlogMeta` type in `src/types/blog.ts`
3. Add category filter in `BlogListPage.tsx`
4. Update `blog.ts` functions

### Analytics

Add tracking to blog pages:

```typescript
useEffect(() => {
  // Google Analytics
  gtag('event', 'page_view', {
    page_title: post.title,
    page_path: window.location.pathname
  });
}, [post]);
```

## Example Posts Included

1. **Kubernetes Architecture** - Cloud infrastructure guide
2. **AI Transformation** - Enterprise AI implementation
3. **Zero Trust Security** - Cybersecurity best practices

## Support

For questions or issues with the blog implementation, contact the development team.

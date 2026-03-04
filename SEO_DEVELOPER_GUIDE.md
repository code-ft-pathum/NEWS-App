# SEO Developer Guide

## Quick Reference for Maintaining SEO

### When Adding New Pages

1. **Create Metadata**
   ```typescript
   export async function generateMetadata(): Promise<Metadata> {
     return {
       title: "Your Page Title | News Today",
       description: "Compelling meta description...",
       openGraph: {
         title: "Your Page Title | News Today",
         description: "OG description...",
         url: "https://today-news-pathum.vercel.app/your-page",
         images: [{ url: "/og-image.png", width: 512, height: 512 }],
       },
       twitter: {
         title: "Your Page Title | News Today",
         description: "Twitter description...",
       },
       alternates: {
         canonical: "https://today-news-pathum.vercel.app/your-page",
       },
     };
   }
   ```

2. **Add to Sitemap**
   Update `src/app/sitemap.ts`:
   ```typescript
   const newPages: MetadataRoute.Sitemap = [
     {
       url: `${baseUrl}/your-page`,
       lastModified: new Date(),
       changeFrequency: 'weekly', // or appropriate frequency
       priority: 0.8,
     },
   ];
   ```

3. **Update Robots.txt if Needed**
   If the page should be indexed, ensure it's not in the `disallow` list in `src/app/robots.ts`

### When Modifying Components

#### For Content Components
- Use semantic HTML: `<article>`, `<section>`, `<nav>`
- Add proper ARIA labels: `aria-label`, `aria-current`
- Use descriptive link text (avoid "click here")
- Add `alt` text to all images

#### For Internal Links
```typescript
import Link from "next/link";

<Link 
  href="/path"
  title="Descriptive title for the link"
  aria-label="Descriptive label if needed"
>
  Link text
</Link>
```

#### For External Links
```typescript
<a 
  href="https://external-site.com"
  target="_blank"
  rel="noopener noreferrer"
  title="What to expect when clicking"
>
  External link
</a>
```

### When Using Images

```typescript
<img
  src="/path/to/image.webp"
  alt="Descriptive text about the image"
  title="Optional title on hover"
  loading="lazy" // For below-the-fold images
  width={600}
  height={400}
/>
```

For Next.js Image component:
```typescript
import Image from "next/image";

<Image
  src="/path/to/image.webp"
  alt="Descriptive text"
  width={600}
  height={400}
  priority // Only for above-the-fold images
/>
```

### When Adding Structured Data

For news articles in components:
```typescript
const newsSchema = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": articleTitle,
  "description": articleDescription,
  "image": articleImage,
  "datePublished": publishDate,
  "author": {
    "@type": "Person",
    "name": authorName
  },
  "publisher": {
    "@type": "Organization",
    "name": "News Today",
    "logo": "https://today-news-pathum.vercel.app/logo.png"
  }
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
/>
```

### SEO Best Practices Checklist

- [ ] Page has unique title (50-60 characters)
- [ ] Page has unique meta description (150-160 characters)
- [ ] Primary keyword naturally included in title and description
- [ ] H1 tag used once per page
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Descriptive alt text on all images
- [ ] Internal links have descriptive anchor text
- [ ] External links have rel="noopener noreferrer"
- [ ] Mobile-friendly design verified
- [ ] Page load time acceptable (<3 seconds)
- [ ] No duplicate content issues
- [ ] Proper charset defined (UTF-8)
- [ ] Viewport meta tag present
- [ ] Canonical URL present when needed
- [ ] Open Graph tags correctly configured
- [ ] Twitter Card tags present
- [ ] Schema.org markup where appropriate
- [ ] No broken links (internal or external)
- [ ] Proper redirects for removed pages (301)

### Testing Before Deployment

1. **Local Testing**
   ```bash
   npm run build
   npm run start
   ```

2. **Check Meta Tags**
   - Right-click → View Page Source
   - Look for: `<title>`, `<meta>` tags, JSON-LD scripts

3. **Validate JSON-LD**
   - Use: https://validator.schema.org/
   - Check for errors or warnings

4. **Mobile Test**
   - Chrome DevTools → Device toolbar
   - Test on multiple screen sizes
   - Check: Touch targets, readability

5. **Performance**
   - Chrome DevTools → Lighthouse
   - Run audit for Mobile and Desktop
   - Fix reported issues

6. **Accessibility**
   - Use: axe DevTools extension
   - Check: WCAG AA compliance
   - Test keyboard navigation

### Common SEO Mistakes to Avoid

❌ **DON'T:**
- Duplicate page titles
- Meta descriptions over 160 characters
- Poor internal linking
- Broken links
- Thin content
- Keyword stuffing
- Missing alt text on images
- Unoptimized images (large file sizes)
- Poor mobile experience
- Slow page load times
- External links without rel attributes
- Inconsistent URL structure
- Too many redirects
- Excessive ads/pop-ups
- Auto-playing videos/audio

✅ **DO:**
- Write unique, compelling titles and descriptions
- Use descriptive, natural language
- Optimize images (compress, use WebP)
- Create quality, substantial content
- Use proper heading hierarchy
- Include internal links naturally
- Keep URLs clean and descriptive
- Implement structured data
- Mobile-first design approach
- Monitor performance metrics
- Regular content updates
- Build quality backlinks
- Submit sitemaps to search engines

### Monitoring & Maintenance

**Weekly:**
- Check Google Search Console for errors
- Monitor ranking changes
- Review bounce rate in Analytics

**Monthly:**
- Analyze top-performing pages
- Check for crawl issues
- Review backlink profile
- Test page load performance

**Quarterly:**
- Full SEO audit
- Update stale content
- Verify all external links work
- Review competitor strategies

## File Locations

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root metadata and structured data |
| `src/app/page.tsx` | Homepage metadata and generateMetadata |
| `src/app/sitemap.ts` | Sitemap generation |
| `src/app/robots.ts` | Robots.txt rules |
| `src/lib/seo.ts` | SEO configuration and utilities |
| `src/lib/seo-checklist.ts` | SEO verification checklist |
| `next.config.ts` | Next.js optimization config |
| `SEO_GUIDE.md` | Comprehensive SEO documentation |
| `verify-seo.sh` | Automated verification script |

## Support

For questions or issues:
1. Check `SEO_GUIDE.md`
2. Review this document
3. Consult `src/lib/seo-checklist.ts`
4. Run `./verify-seo.sh` for diagnostics

---

**Version**: 1.0  
**Last Updated**: March 4, 2026

# SEO Monitoring & Performance Guide

## Overview
This guide documents the SEO setup for News Today application.

## Implemented SEO Features

### 1. Sitemap
- **Location**: `/sitemap.xml` (auto-generated)
- **Coverage**: 
  - Homepage (priority 1.0)
  - All 7 news category pages (priority 0.9)
  - Dashboard login (priority 0.3)
  - Updated: Every time the app deploys/rebuilds
  - Change frequency: Hourly for main pages, Monthly for dashboard

### 2. Robots.txt
- **Location**: `/robots.xml` (auto-generated)
- **Features**:
  - Special rules for Googlebot (no crawl delay)
  - Special rules for Bingbot (1 second crawl delay)
  - General rules for other bots (5 second crawl delay)
  - Blocks `/dashboard/` directory from crawling
  - Allows `/?category=*` query parameters
  - References the sitemap

### 3. Structured Data (Schema.org)
Implemented markup includes:
- **NewsMediaOrganization**: Organization details, logo, description
- **WebSite**: Search action integration for category search
- **BreadcrumbList**: Navigation breadcrumbs
- **NewsArticle**: Individual article metadata (headlines, dates, authors, images)
- **AggregateOffer**: Indicates free access to all content

### 4. Meta Tags & Open Graph
- **Title Tags**: Dynamic titles per category
- **Meta Descriptions**: Category-specific, compelling descriptions
- **Open Graph (OG)**: 
  - Images: 512x512px branded images
  - URLs: Canonical URLs per category
  - Type: website
  - Locale: en_US
- **Twitter Cards**: 
  - Card type: summary_large_image
  - Dynamic titles and descriptions
  - Branded images
- **Canonical URLs**: Prevents duplicate content issues

### 5. Performance Optimizations
- **Image Optimization**: WebP and AVIF formats, remote pattern allowlist
- **Compression**: gzip/brotli compression enabled
- **Caching Headers**: 1-year cache for immutable assets
- **Security Headers**:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: Enabled
  - Referrer-Policy: Strict
  - Permissions Policy: Privacy-focused

### 6. Accessibility Features
- **ARIA Labels**: Navigation, main content, buttons
- **Semantic HTML**: Proper use of `<header>`, `<main>`, `<nav>`, `<footer>`
- **Alt Text**: Images have descriptive alt text
- **Link Titles**: All navigation links have titles
- **Role Attributes**: Proper ARIA roles for content regions
- **Current Page Indication**: `aria-current="page"` for active category

### 7. Link Structure
- **Internal Links**: Proper linking between categories
- **External Links**: `rel="noopener noreferrer"` for external news sources
- **Query Parameters**: Proper handling of `?category=` parameters

## URL Structure
```
/                          - Homepage (general category)
/?category=business        - Business news
/?category=technology      - Technology news
/?category=science         - Science news
/?category=entertainment   - Entertainment news
/?category=health          - Health news
/?category=sports          - Sports news
/dashboard/login           - Admin login (noindex)
```

## Content Strategy

### Category Pages
Each category page has:
- ✅ Unique meta title
- ✅ Unique meta description
- ✅ Category-specific OG tags
- ✅ Correct canonical URLs
- ✅ Proper schema.org markup

### Homepage
- ✅ Branded title and description
- ✅ Company schema markup
- ✅ Search integration schema
- ✅ Highest priority (1.0)
- ✅ Hourly change frequency

## Monitoring & Maintenance

### Google Search Console
To verify your site:
1. Go to Google Search Console
2. Add property: `https://today-news-pathum.vercel.app`
3. Verify ownership using provided verification code
4. Submit sitemap: `/sitemap.xml`
5. Monitor:
   - Indexing status
   - Core Web Vitals
   - Mobile usability
   - Search analytics

### Bing Webmaster Tools
1. Go to Bing Webmaster Tools
2. Add your site
3. Submit sitemap XML
4. Monitor crawl stats and keywords

### What to Monitor
- Indexing rate (target: >90% of pages indexed)
- Click-through rate (CTR) in search results
- Average search position
- Mobile usability issues
- Core Web Vitals (LCP, FID, CLS)
- Crawl errors

## Technical SEO Checklist

- [x] Sitemap XML generated and valid
- [x] Robots.txt configured
- [x] Canonical URLs implemented
- [x] Open Graph tags added
- [x] Twitter Card tags added
- [x] Schema.org markup in place
- [x] Semantic HTML5 structure
- [x] Mobile responsiveness
- [x] Fast page load (compression enabled)
- [x] HTTPS enabled (Vercel)
- [x] 404 error handling
- [x] Internal linking structure
- [x] Image optimization (WebP, AVIF)
- [x] Accessibility (WCAG)
- [x] Security headers configured

## Future Enhancements

- [ ] Implement JSON-LD for SearchAction full integration
- [ ] Add FAQ schema for common questions
- [ ] Implement image lazy loading
- [ ] Add Core Web Vitals monitoring
- [ ] Setup email notifications for SEO issues
- [ ] Create blog/article detail pages with full schema
- [ ] Implement link pagination for older articles
- [ ] Add hreflang tags for multi-language support (if applicable)
- [ ] Setup Google News sitemap (if eligible)
- [ ] Implement AMP pages (optional)

## SEO File Locations

- Sitemap generation: `src/app/sitemap.ts`
- Robots configuration: `src/app/robots.ts`
- Root layout metadata: `src/app/layout.tsx`
- Page metadata: `src/app/page.tsx`
- SEO utilities: `src/lib/seo.ts`
- Next.js config: `next.config.ts`
- News card schema: `src/components/NewsCard.tsx`

## Key Metrics to Track

1. **Organic Traffic**: Monitor Google Analytics
2. **Keyword Rankings**: Use Google Search Console
3. **Conversion Rate**: Click-through rate from search results
4. **Page Load Speed**: Use Google PageSpeed Insights
5. **Mobile Usability**: Test on multiple devices
6. **Crawl Budget**: Monitor in Google Search Console
7. **Backlink Profile**: Use Ahrefs or Moz
8. **Bounce Rate**: Analyze in Google Analytics

---

**Last Updated**: March 4, 2026
**Maintained By**: Development Team

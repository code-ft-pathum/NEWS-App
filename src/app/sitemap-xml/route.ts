import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = 'https://today-news-pathum.vercel.app';
    const categories = [
        'general',
        'business',
        'technology',
        'science',
        'entertainment',
        'health',
        'sports',
    ];

    const now = new Date().toISOString().split('T')[0];

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Category pages -->
  ${categories
    .map(
      (category) => `  <url>
    <loc>${baseUrl}/?category=${category}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}

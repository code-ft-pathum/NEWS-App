import Link from "next/link";
import { getNews } from "@/lib/news";
import NewsCard from "@/components/NewsCard";
import { Metadata } from "next";

interface SearchParams {
  category?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { category = "general" } = await searchParams;
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${categoryTitle} News | News Today • The Future of News`,
    description: `Stay updated with the latest ${category} news. Breaking stories, insights, and analysis delivered with premium AI precision.`,
    openGraph: {
      title: `${categoryTitle} News | News Today`,
      description: `Latest ${category} news and updates from around the world.`,
      url: `https://today-news-pathum.vercel.app/?category=${category}`,
      siteName: "News Today",
      images: [
        {
          url: "/android-chrome-512x512.png",
          width: 512,
          height: 512,
          alt: `News Today - ${categoryTitle}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryTitle} News | News Today`,
      description: `Latest ${category} news from News Today.`,
      images: ["/android-chrome-512x512.png"],
    },
    alternates: {
      canonical: `https://today-news-pathum.vercel.app/?category=${category}`,
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category = "general" } = await searchParams;
  const articles = await getNews(category);

  const categories = [
    "general",
    "business",
    "technology",
    "science",
    "entertainment",
    "health",
    "sports",
  ];

  return (
    <div className="container fade-in">
      <div className="page-header">
        <div className="title-row">
          <h1 className="title slide-in">THE <span>GRID</span></h1>
          <a href={`/?category=${category}`} className="refresh-btn" aria-label="Refresh news">
            <i className="fa-solid fa-rotate"></i> REFRESH
          </a>
        </div>
        <p className="subtitle">LATEST UPDATES FROM THE CORE</p>
      </div>

      <nav className="category-nav" aria-label="News categories">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/?category=${cat}`}
            className={`category-link ${category === cat ? "active" : ""}`}
            aria-current={category === cat ? "page" : undefined}
          >
            {cat.toUpperCase()}
          </Link>
        ))}
      </nav>

      <div className="news-grid" role="main" aria-label={`${category} news articles`}>
        {articles && articles.length > 0 ? (
          articles.map((article, index) => (
            <NewsCard key={index} article={article} index={index} />
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
            <p>No articles found for this category. Please try another.</p>
          </div>
        )}
      </div>
    </div>
  );
}

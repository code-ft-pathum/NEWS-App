import Link from "next/link";
import { getNews } from "@/lib/news";
import NewsCard from "@/components/NewsCard";

interface SearchParams {
  category?: string;
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
          <a href={`/?category=${category}`} className="refresh-btn">
            <i className="fa-solid fa-rotate"></i> REFRESH
          </a>
        </div>
        <p className="subtitle">LATEST UPDATES FROM THE CORE</p>
      </div>

      <nav className="category-nav">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/?category=${cat}`}
            className={`category-link ${category === cat ? "active" : ""}`}
          >
            {cat.toUpperCase()}
          </Link>
        ))}
      </nav>

      <div className="news-grid">
        {articles.map((article, index) => (
          <NewsCard key={index} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}

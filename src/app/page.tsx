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

      <style dangerouslySetInnerHTML={{
        __html: `
        .page-header {
           margin-bottom: 3.5rem;
           border-bottom: 2px solid var(--primary);
           padding-bottom: 1rem;
           display: flex;
           flex-direction: column;
           gap: 0.5rem;
        }

        .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .refresh-btn {
            background: var(--glass);
            border: 1px solid var(--card-border);
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 1px;
            color: var(--muted);
            transition: all 0.2s ease;
        }

        .refresh-btn:hover {
            color: var(--foreground);
            background: var(--glass-hover);
            transform: rotate(15deg);
        }

        .title {
            font-size: 3.5rem;
            font-weight: 800;
            letter-spacing: -2px;
            color: var(--foreground);
            text-transform: uppercase;
        }

        .title span {
            color: var(--primary);
        }

        .subtitle {
            color: var(--muted);
            letter-spacing: 5px;
            font-size: 0.75rem;
            font-weight: 700;
        }

        .category-nav {
            display: flex;
            gap: 1rem;
            margin-bottom: 3.5rem;
            overflow-x: auto;
            padding-bottom: 1rem;
            scrollbar-width: none;
        }

        .category-nav::-webkit-scrollbar {
            display: none;
        }

        .category-link {
            padding: 0.6rem 1.4rem;
            background: var(--glass);
            border: 1px solid var(--card-border);
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--muted);
            letter-spacing: 1px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            white-space: nowrap;
        }

        .category-link:hover {
            background: var(--glass-hover);
            color: var(--foreground);
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .category-link.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            box-shadow: 0 4px 15px rgba(255, 62, 62, 0.3);
        }

        .news-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2.5rem;
        }

        @media (max-width: 768px) {
            .title { font-size: 2.5rem; }
            .news-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}

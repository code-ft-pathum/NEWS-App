import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getNews } from "@/lib/news";
import DashboardGrid from "@/components/DashboardGrid";
import Link from "next/link";
import AutomationToggle from "@/components/AutomationToggle";

interface SearchParams {
    category?: string;
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");

    // Primitive auth check
    if (authCookie?.value !== "admin-secret") {
        redirect("/dashboard/login");
    }

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
            <div className="page-header dashboard-header">
                <div className="title-section">
                    <h1 className="title">COMMAND <span>CENTER</span></h1>
                    <p className="subtitle">CONTROL PANEL • MANAGE THE NEWS FEED</p>
                </div>
                <div className="admin-actions">
                    <a href="/" className="back-link">
                        <i className="fa-solid fa-arrow-left"></i> BACK TO GRID
                    </a>
                    <form action={async () => {
                        "use server";
                        const cookieStore = await cookies();
                        cookieStore.delete("auth");
                        redirect("/dashboard/login");
                    }}>
                        <button type="submit" className="logout-btn">
                            <i className="fa-solid fa-power-off"></i> TERMINATE SESSION
                        </button>
                    </form>
                </div>
            </div>

            <section className="dashboard-intro">
                <div className="status-grid">
                    <div className="status-item">
                        <label>SYSTEM STATUS</label>
                        <span>ACTIVE</span>
                    </div>
                    <div className="status-item">
                        <label>ACTIVE CATEGORY</label>
                        <span className="cat-badge">{category.toUpperCase()}</span>
                    </div>
                    <AutomationToggle />
                    <div className="status-item">
                        <label>ADMIN ACCESS</label>
                        <span>AUTHORIZED</span>
                    </div>
                </div>

                <nav className="dashboard-cat-nav">
                    {categories.map((cat) => (
                        <Link
                            key={cat}
                            href={`/dashboard?category=${cat}`}
                            className={`dash-cat-link ${category === cat ? "active" : ""}`}
                        >
                            {cat.toUpperCase()}
                        </Link>
                    ))}
                </nav>
            </section>

            <DashboardGrid articles={articles} />

            <style dangerouslySetInnerHTML={{
                __html: `
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 3.5rem;
                border-bottom: 2px solid var(--primary);
                padding-bottom: 1rem;
            }

            .admin-actions {
                display: flex;
                gap: 1.5rem;
                align-items: center;
            }

            .back-link {
                color: var(--muted);
                font-size: 0.75rem;
                font-weight: 800;
                letter-spacing: 1px;
                padding: 0.6rem 1.2rem;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .back-link:hover {
                color: var(--foreground);
            }

            .logout-btn {
                background: rgba(255, 62, 62, 0.1);
                border: 1px solid rgba(255, 62, 62, 0.3);
                color: var(--primary);
                padding: 0.6rem 1.2rem;
                border-radius: 8px;
                font-size: 0.7rem;
                font-weight: 800;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .logout-btn:hover {
                background: var(--primary);
                color: white;
                box-shadow: 0 0 20px rgba(255, 62, 62, 0.4);
            }

            .dashboard-intro {
               margin-bottom: 3.5rem;
               padding: 2.5rem;
               background: var(--card-bg);
               border: 1px solid var(--card-border);
               border-radius: var(--radius);
               display: flex;
               flex-direction: column;
               gap: 2.5rem;
            }

            .status-grid {
               display: flex;
               gap: 4rem;
               flex-wrap: wrap;
            }

            .status-item {
               display: flex;
               flex-direction: column;
               gap: 0.5rem;
            }

            .status-item label {
               font-size: 0.65rem;
               font-weight: 800;
               letter-spacing: 2px;
               color: var(--muted);
            }

            .status-item span {
               font-size: 1.1rem;
               font-weight: 800;
               color: var(--primary);
            }

            .cat-badge {
                background: rgba(255, 62, 62, 0.1);
                padding: 0.2rem 0.6rem;
                border-radius: 4px;
                border: 1px solid rgba(255, 62, 62, 0.2);
            }

            .dashboard-cat-nav {
                display: flex;
                gap: 0.8rem;
                flex-wrap: wrap;
                padding-top: 1.5rem;
                border-top: 1px solid var(--card-border);
            }

            .dash-cat-link {
                padding: 0.5rem 1rem;
                font-size: 0.7rem;
                font-weight: 700;
                color: var(--muted);
                border: 1px solid var(--card-border);
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .dash-cat-link:hover {
                color: var(--foreground);
                border-color: var(--muted);
            }

            .dash-cat-link.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            @media (max-width: 768px) {
               .dashboard-header { flex-direction: column; gap: 1.5rem; }
               .status-grid { gap: 1.5rem; }
            }
        `}} />
        </div>
    );
}

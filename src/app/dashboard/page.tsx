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

        </div>
    );
}

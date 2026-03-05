import { getNews } from "@/lib/news";
import DashboardGrid from "@/components/DashboardGrid";
import ManualSync from "@/components/ManualSync";
import AutomationControls from "@/components/AutomationControls";
import Link from "next/link";
import { cookies } from "next/headers";

interface SearchParams {
    category?: string;
}

// Simple Server Action for Login
async function login(formData: FormData) {
    "use server";
    const user = formData.get("username") as string;
    const pass = formData.get("password") as string;

    const validUser = process.env.DASHBOARD_USERNAME?.trim() || "NEWSAPP";
    const validPass = process.env.DASHBOARD_PASSWORD?.trim() || "Today@news";

    if (user === validUser && pass === validPass) {
        const cookieStore = await cookies();
        cookieStore.set("auth", "yes", { path: "/" });
    }
}

// Simple Server Action for Logout
async function logout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("auth");
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("auth")?.value === "yes";

    // Show simple login form if not authenticated
    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <form action={login} style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "350px", background: "#111827", padding: "30px", borderRadius: "12px", border: "1px solid #374151" }}>
                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                        <h2 style={{ margin: "0 0 5px 0", color: "white" }}>RESTRICTED AREA</h2>
                        <p style={{ margin: 0, fontSize: "14px", color: "#9ca3af" }}>Please enter credentials to continue</p>
                    </div>

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                        style={{ padding: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid #374151", color: "white", borderRadius: "6px" }}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        style={{ padding: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid #374151", color: "white", borderRadius: "6px" }}
                    />

                    <button type="submit" style={{ padding: "12px", background: "#10b981", border: "none", color: "white", fontWeight: "bold", borderRadius: "6px", cursor: "pointer", marginTop: "5px" }}>
                        LOGIN
                    </button>
                    <a href="/" style={{ textAlign: "center", color: "#9ca3af", fontSize: "12px", textDecoration: "none", marginTop: "10px" }}>&larr; Back to Home</a>
                </form>
            </div>
        );
    }

    // --- Authenticated Dashboard Below ---

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
                    <h1 className="title">COMMAND <span>CENTER</span> <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: '#10b981', color: 'black', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '10px' }}>v2.1</span></h1>
                    <p className="subtitle">CONTROL PANEL • MANAGE THE NEWS FEED</p>
                </div>
                <div className="admin-actions">
                    <a href="/" className="back-link">
                        <i className="fa-solid fa-arrow-left"></i> BACK TO GRID
                    </a>
                    <form action={logout}>
                        <button type="submit" style={{ background: "rgba(255, 62, 62, 0.1)", border: "1px solid rgba(255, 62, 62, 0.3)", color: "#ff3e3e", padding: "0.6rem 1.2rem", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "800", cursor: "pointer" }}>
                            <i className="fa-solid fa-power-off"></i> LOGOUT
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
                </div>

                <div className="sync-section">
                    <AutomationControls />
                    <ManualSync />
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

            <DashboardGrid articles={articles} category={category} />

        </div>
    );
}

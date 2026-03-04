import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "News Today • The Future of News",
  description: "A premium, lightning-fast news reader powered by AI.",
  keywords: ["news", "latest", "technology", "news viewer", "next.js"],
  authors: [{ name: "News Today Team" }],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-content">
            <div className="logo slide-in">
              <a href="/">NEWS <span>TODAY</span></a>
            </div>
            <nav className="header-nav fade-in">
              <a href="/dashboard" className="nav-link">DASHBOARD</a>
              <span className="separator">|</span>
              <span className="header-meta">
                Premium News Experience
              </span>
            </nav>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} News Today. Fueled by NewsAPI.org</p>
          </div>
        </footer>

        <style dangerouslySetInnerHTML={{
          __html: `
          .header {
            position: sticky;
            top: 0;
            left: 0;
            width: 100%;
            height: var(--header-height);
            background: rgba(8, 8, 8, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--card-border);
            z-index: 1000;
            display: flex;
            align-items: center;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-nav {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }

          .nav-link {
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 1px;
            color: var(--muted);
            transition: all 0.3s ease;
          }

          .nav-link:hover {
             color: var(--primary);
             text-shadow: 0 0 10px rgba(255, 62, 62, 0.4);
          }

          .separator {
            color: var(--card-border);
          }

          .logo {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
            letter-spacing: -1px;
          }

          .logo span {
            color: white;
            opacity: 0.9;
          }

          .header-meta {
            color: var(--muted);
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 2px;
          }

          .main-content {
            min-height: calc(100vh - var(--header-height) - 100px);
            padding: 3rem 0;
          }

          .footer {
            padding: 3rem 0;
            text-align: center;
            border-top: 1px solid var(--card-border);
            color: var(--muted);
            font-size: 0.85rem;
          }

          @media (max-width: 600px) {
            .header-meta {
              display: none;
            }
          }
        `}} />
      </body>
    </html>
  );
}

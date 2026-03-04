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
  verification: {
    google: "qRQ4bNmp5tZqAdnpnWTBDRBY9isLJ8w-OufkJ0fFgV4",
  },
  alternates: {
    canonical: "https://today-news-pathum.vercel.app/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  openGraph: {
    title: "News Today • Global Perspective",
    description: "Breaking news and deep dives from across the globe, delivered with premium AI precision.",
    url: "https://today-news-pathum.vercel.app/",
    siteName: "News Today",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "News Today • Stay Ahead of the Curve",
    description: "The world's most advanced news reader.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              "name": "News Today",
              "url": "https://today-news-pathum.vercel.app/",
              "logo": "https://today-news-pathum.vercel.app/android-chrome-512x512.png",
              "sameAs": [
                "https://www.facebook.com/NewsTodayPathum"
              ]
            })
          }}
        />
        <header className="header">
          <div className="container header-content">
            <div className="logo slide-in">
              <a href="/">NEWS <span>TODAY</span></a>
            </div>
            <nav className="header-nav fade-in">
              <span className="header-meta">
                Global News Experience • Premium AI Feed
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
      </body>
    </html>
  );
}

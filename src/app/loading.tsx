export default function Loading() {
    return (
        <div className="container">
            <div className="loading-container">
                <div className="shimmer-header"></div>
                <div className="shimmer-nav"></div>
                <div className="loading-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="shimmer-card">
                            <div className="shimmer-img"></div>
                            <div className="shimmer-line"></div>
                            <div className="shimmer-line short"></div>
                            <div className="shimmer-line"></div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .loading-container {
            padding: 2rem 0;
            animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.8; }
            100% { opacity: 0.6; }
        }

        .shimmer-header {
            height: 60px;
            width: 300px;
            background: var(--glass);
            border-radius: var(--radius);
            margin-bottom: 2rem;
        }

        .shimmer-nav {
            height: 40px;
            width: 100%;
            background: var(--glass);
            border-radius: 100px;
            margin-bottom: 3.5rem;
        }

        .loading-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2.5rem;
        }

        .shimmer-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: var(--radius);
            height: 450px;
            overflow: hidden;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .shimmer-img {
            height: 200px;
            background: var(--glass-hover);
            border-radius: 8px;
            margin: -1.5rem -1.5rem 0.5rem -1.5rem;
        }

        .shimmer-line {
            height: 20px;
            background: var(--glass);
            border-radius: 4px;
            width: 100%;
        }

        .shimmer-line.short {
            width: 60%;
        }
      `}} />
        </div>
    );
}

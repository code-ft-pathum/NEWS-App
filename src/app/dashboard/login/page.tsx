"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate simple login
        if (username === "NEWSAPP" && password === "Today@news") {
            // Set a cookie (simple version)
            document.cookie = "auth=admin-secret; path=/;";
            router.push("/dashboard");
        } else {
            setError("Invalid credentials. Access Denied.");
        }
    };

    return (
        <div className="login-container fade-in">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="title">ACCESS <span>CONTROL</span></h1>
                    <p className="subtitle">RESTRICTED TERMINAL</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>IDENTIFIER</label>
                        <input
                            type="text"
                            placeholder="Username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>ENCRYPTION KEY</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" className="login-btn">AUTHORIZE SESSION</button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 200px);
        }

        .login-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            padding: 3rem;
            border-radius: var(--radius);
            width: 100%;
            max-width: 450px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .login-header {
            margin-bottom: 2.5rem;
            text-align: center;
        }

        .title {
            font-size: 2rem;
            letter-spacing: -1px;
        }

        .title span { color: var(--primary); }

        .subtitle {
            font-size: 0.7rem;
            letter-spacing: 4px;
            color: var(--muted);
            margin-top: 0.5rem;
        }

        .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
        }

        .input-group label {
            font-size: 0.65rem;
            font-weight: 800;
            letter-spacing: 1px;
            color: var(--muted);
        }

        .input-group input {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--card-border);
            padding: 1rem;
            border-radius: 8px;
            color: white;
            font-family: inherit;
            transition: all 0.2s ease;
        }

        .input-group input:focus {
            border-color: var(--primary);
            background: rgba(255,255,255,0.05);
            outline: none;
        }

        .error-msg {
            color: #ff3e3e;
            font-size: 0.75rem;
            text-align: center;
            font-weight: 600;
        }

        .login-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 800;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 62, 62, 0.3);
        }
      `}} />
        </div>
    );
}

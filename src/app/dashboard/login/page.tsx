"use client";

import { useState } from "react";
import { handleLogin } from "./actions";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const result = await handleLogin(username, password);
            if (result?.success) {
                // Hard redirect so the browser picks up the new auth cookie
                window.location.href = "/dashboard";
            } else {
                setError(result?.error || "Invalid credentials.");
                setLoading(false);
            }
        } catch {
            // Next.js NEXT_REDIRECT throws — this means login succeeded, redirect is in progress
            window.location.href = "/dashboard";
        }
    }

    return (
        <div className="login-container fade-in">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="title">ACCESS <span>CONTROL</span></h1>
                    <p className="subtitle">RESTRICTED TERMINAL</p>
                </div>

                <form onSubmit={onSubmit} className="login-form">
                    <div className="input-group">
                        <label>IDENTIFIER</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username..."
                            defaultValue=""
                            disabled={loading}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="input-group">
                        <label>ENCRYPTION KEY</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            disabled={loading}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "AUTHENTICATING..." : "AUTHORIZE SESSION"}
                    </button>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <div className="login-container fade-in">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="title">ACCESS <span>CONTROL</span></h1>
                    <p className="subtitle">RESTRICTED TERMINAL</p>
                </div>

                {/* Plain HTML form → POST to /api/auth/login route handler */}
                {/* This is the most reliable way to set cookies in Next.js */}
                <form method="POST" action="/api/auth/login" className="login-form">
                    <div className="input-group">
                        <label>IDENTIFIER</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username..."
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
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error === "invalid" && (
                        <p className="login-error">Invalid credentials. Access Denied.</p>
                    )}
                    <button type="submit" className="login-btn">
                        AUTHORIZE SESSION
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}

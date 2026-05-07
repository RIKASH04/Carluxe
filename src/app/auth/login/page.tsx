"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Chrome, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup" | "forgot";

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const supabase = createClient();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) { setError(error.message); setLoading(false); }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (mode === "forgot") {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) setError(error.message);
            else setSuccess("Password reset link sent to your email!");
            setLoading(false);
            return;
        }

        if (mode === "signup") {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) setError(error.message);
            else setSuccess("Account created! Check your email to verify.");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); setLoading(false); }
        else if (data.user) {
            const isAdmin = data.user.email === "resulthub001@gmail.com";
            router.push(isAdmin ? "/admin" : "/dashboard");
        }
    };

    const modeTitle = mode === "login" ? "Sign in to your account" : mode === "signup" ? "Create your account" : "Reset your password";
    const modeSubtitle = mode === "login" ? "Welcome back! Enter your details below." : mode === "signup" ? "Start your premium car care experience." : "We&apos;ll send you a password reset link.";
    const modeTag = mode === "login" ? "Welcome back" : mode === "signup" ? "Join Carluxe" : "Reset Password";

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#f1f5f9" }}>
            {/* ── Left: Image Panel ── */}
            <div style={{ flex: "0 0 52%", position: "relative", overflow: "hidden" }} className="auth-left-panel">
                <Image
                    src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1000&q=90"
                    alt="Carluxe premium car wash"
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                />
                {/* Overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(15,23,42,0.75) 0%, rgba(30,64,175,0.65) 50%, rgba(0,0,0,0.55) 100%)" }} />

                {/* Content */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: 40 }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", width: "fit-content" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Car style={{ width: 20, height: 20, color: "white" }} />
                        </div>
                        <span style={{ fontWeight: 900, fontSize: 22, color: "white", letterSpacing: "-0.02em" }}>Carluxe</span>
                    </Link>

                    {/* Bottom text */}
                    <div style={{ marginTop: "auto" }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            <h2 style={{ color: "white", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, lineHeight: 1.18, marginBottom: 14 }}>
                                Smart Car Wash<br />
                                <span style={{ color: "#93c5fd" }}>Starts Here</span>
                            </h2>
                            <p style={{ color: "rgba(191,219,254,0.85)", fontSize: 16, lineHeight: 1.65, maxWidth: 340, marginBottom: 32 }}>
                                Join thousands of car owners experiencing the future of premium auto care.
                            </p>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {["12,500+ Cars", "4.9★ Rating", "Real-Time Queue"].map(badge => (
                                    <div key={badge} style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 600 }}>
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ── Right: Auth Form ── */}
            <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "40px 32px",
                background: "linear-gradient(135deg, #f8faff 0%, #eff6ff 50%, #f0f4ff 100%)",
                position: "relative", overflow: "hidden"
            }}>
                {/* Subtle bg blobs */}
                <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent)", pointerEvents: "none" }} />

                <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 10 }}>
                    {/* Mobile Logo */}
                    <div style={{ display: "none", justifyContent: "center", marginBottom: 32 }} className="mobile-logo">
                        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Car style={{ width: 18, height: 18, color: "white" }} />
                            </div>
                            <span className="gradient-text" style={{ fontWeight: 900, fontSize: 20 }}>Carluxe</span>
                        </Link>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.28 }}
                            style={{
                                background: "white",
                                borderRadius: 24,
                                boxShadow: "0 4px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
                                padding: 36,
                            }}
                        >
                            {/* Header */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                                    <Sparkles style={{ width: 16, height: 16, color: "#2563eb" }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{modeTag}</span>
                                </div>
                                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#111827", marginBottom: 6, lineHeight: 1.25 }}>
                                    {modeTitle}
                                </h1>
                                <p style={{ fontSize: 14, color: "#6b7280" }}>{modeSubtitle}</p>
                            </div>

                            {/* Google Button */}
                            {mode !== "forgot" && (
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    id="google-auth-btn"
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                        padding: "12px 20px", borderRadius: 12, border: "2px solid #e5e7eb",
                                        background: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151",
                                        transition: "all 0.2s ease", marginBottom: 20,
                                        opacity: loading ? 0.6 : 1
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#bfdbfe"; (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                                >
                                    <Chrome style={{ width: 18, height: 18, color: "#2563eb" }} />
                                    Continue with Google
                                </button>
                            )}

                            {mode !== "forgot" && (
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                                    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>OR</span>
                                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                {/* Email */}
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 7 }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="input-premium"
                                            placeholder="you@example.com"
                                            style={{ paddingLeft: 42 }}
                                            required
                                            id="email-input"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                {mode !== "forgot" && (
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                                            <label style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Password</label>
                                            {mode === "login" && (
                                                <button type="button" onClick={() => { setMode("forgot"); setError(""); }}
                                                    style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
                                            <input
                                                type={showPass ? "text" : "password"}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="input-premium"
                                                placeholder="Enter password"
                                                style={{ paddingLeft: 42, paddingRight: 44 }}
                                                required
                                                id="password-input"
                                            />
                                            <button type="button" onClick={() => setShowPass(!showPass)}
                                                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
                                                {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ padding: "12px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}>
                                        {error}
                                    </motion.div>
                                )}

                                {/* Success */}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ padding: "12px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#16a34a", display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <CheckCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                                        {success}
                                    </motion.div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    id="auth-submit-btn"
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        width: "100%", padding: "13px 20px", borderRadius: 12,
                                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                        color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer",
                                        boxShadow: "0 4px 14px rgba(37,99,235,0.35)", transition: "all 0.3s ease",
                                        opacity: loading ? 0.7 : 1
                                    }}
                                    onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 25px rgba(37,99,235,0.45)"; } }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; }}
                                >
                                    {loading ? (
                                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                                    ) : (
                                        <>
                                            {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                                            <ArrowRight style={{ width: 16, height: 16 }} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Mode switcher */}
                            <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginTop: 22 }}>
                                {mode === "login" ? (
                                    <>Don&apos;t have an account?{" "}
                                        <button onClick={() => { setMode("signup"); setError(""); }} style={{ color: "#2563eb", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>Already have an account?{" "}
                                        <button onClick={() => { setMode("login"); setError(""); }} style={{ color: "#2563eb", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                            Sign in
                                        </button>
                                    </>
                                )}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 900px) {
                    .auth-left-panel { display: none !important; }
                    .mobile-logo { display: flex !important; }
                }
            `}</style>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Car, Users, Calendar, Clock, CheckCircle, XCircle, Zap,
    LogOut, TrendingUp, Search, Filter, RefreshCw, Eye, Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO } from "date-fns";

type Booking = {
    id: string;
    user_id: string;
    service_type: string;
    base_time: string;
    assigned_time: string;
    batch_number: number;
    queue_position: number;
    status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
    created_at: string;
    booking_date: string;
    vehicle_type: string;
    location?: string;
    phone?: string;
};

type Stats = { totalUsers: number; totalBookings: number; todayBookings: number };

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string; border: string }> = {
    pending: { label: "Pending", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    confirmed: { label: "Confirmed", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    in_progress: { label: "In Progress", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    completed: { label: "Completed", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const STAT_CONFIGS = [
    { key: "totalUsers", label: "Total Users", icon: Users, bg: "#eff6ff", color: "#2563eb", liveColor: "#3b82f6" },
    { key: "totalBookings", label: "Total Bookings", icon: Calendar, bg: "#f5f3ff", color: "#7c3aed", liveColor: "#8b5cf6" },
    { key: "todayBookings", label: "Today's Bookings", icon: TrendingUp, bg: "#fffbeb", color: "#d97706", liveColor: "#f59e0b" },
    { key: "completed", label: "Completed", icon: CheckCircle, bg: "#f0fdf4", color: "#16a34a", liveColor: "#22c55e" },
];

function AnimatedCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setDisplay(0);
        let current = 0;
        const steps = 40;
        const increment = value / steps;
        ref.current = setInterval(() => {
            current = Math.min(current + increment, value);
            setDisplay(Math.floor(current));
            if (current >= value) {
                if (ref.current) clearInterval(ref.current);
                setDisplay(value);
            }
        }, 30);
        return () => { if (ref.current) clearInterval(ref.current); };
    }, [value]);

    return <span>{display}</span>;
}

export default function AdminClient({
    initialStats,
    initialBookings,
}: {
    initialStats: Stats;
    initialBookings: Booking[];
}) {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [stats, setStats] = useState<Stats>(initialStats);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [updating, setUpdating] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const channel = supabase
            .channel("admin-bookings")
            .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    setBookings((prev) => [payload.new as Booking, ...prev]);
                    setStats((s) => ({ ...s, totalBookings: s.totalBookings + 1 }));
                } else if (payload.eventType === "UPDATE") {
                    setBookings((prev) =>
                        prev.map((b) => (b.id === (payload.new as Booking).id ? (payload.new as Booking) : b))
                    );
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    const updateStatus = async (id: string, status: string) => {
        setUpdating(id);
        const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
        if (!error) {
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status: status as Booking["status"] } : b))
            );
        }
        setUpdating(null);
    };

    const clearAllHistory = async () => {
        if (!confirm("Are you sure you want to delete ALL booking history? This cannot be undone.")) return;
        setUpdating("all");
        const { error } = await supabase.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (!error) {
            setBookings([]);
            setStats({ totalUsers: 0, totalBookings: 0, todayBookings: 0 });
        } else {
            alert("Failed to delete history: " + error.message);
        }
        setUpdating(null);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const filtered = bookings.filter((b) => {
        const q = search.toLowerCase();
        const matchSearch = b.id.includes(q) || b.user_id.includes(q) ||
            b.service_type?.toLowerCase().includes(q) || b.status?.includes(q);
        const matchStatus = filterStatus === "all" || b.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayBookingsList = bookings.filter((b) => b.booking_date === todayStr);
    const queueGroups = todayBookingsList.reduce<Record<string, Booking[]>>((acc, b) => {
        const key = b.base_time || "unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(b);
        return acc;
    }, {});

    const completedCount = bookings.filter(b => b.status === "completed").length;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

            {/* ── Header ── */}
            <header style={{
                background: "white", borderBottom: "1px solid #f1f5f9",
                position: "sticky", top: 0, zIndex: 30,
                boxShadow: "0 1px 20px rgba(0,0,0,0.06)"
            }}>
                <div className="container-app" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Car style={{ width: 18, height: 18, color: "white" }} />
                            </div>
                            <span className="gradient-text" style={{ fontWeight: 900, fontSize: 18 }}>Carluxe</span>
                        </div>
                        <span style={{ padding: "4px 12px", borderRadius: 999, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Admin
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Live Updates</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "#6b7280", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            id="admin-signout-btn"
                        >
                            <LogOut style={{ width: 16, height: 16 }} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <div className="container-app" style={{ paddingTop: 32, paddingBottom: 48 }}>

                {/* ── Dashboard Header ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.02em" }}>Admin Dashboard</h1>
                    <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                        {format(new Date(), "EEEE, MMMM d, yyyy")} &bull; Real-time queue management
                    </p>
                </motion.div>

                {/* ── Stats Cards ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }} className="admin-stats-grid">
                    {STAT_CONFIGS.map((cfg, i) => {
                        const value = cfg.key === "completed" ? completedCount : (stats as unknown as Record<string, number>)[cfg.key] ?? 0;
                        return (
                            <motion.div
                                key={cfg.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{
                                    background: "white", borderRadius: 20, padding: "24px 22px",
                                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
                                    transition: "all 0.3s ease"
                                }}
                                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <cfg.icon style={{ width: 20, height: 20, color: cfg.color }} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.liveColor, letterSpacing: "0.05em" }}>Live</span>
                                </div>
                                <p style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", lineHeight: 1, marginBottom: 6 }}>
                                    <AnimatedCounter value={value} />
                                </p>
                                <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{cfg.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Today's Live Queue ── */}
                {Object.keys(queueGroups).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: "white", borderRadius: 20, padding: 24,
                            boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
                            marginBottom: 28
                        }}
                    >
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Clock style={{ width: 18, height: 18, color: "#2563eb" }} />
                            Today&apos;s Live Queue
                        </h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                            {Object.entries(queueGroups)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([time, slotBookings]) => (
                                    <div key={time} style={{ flex: "1 1 100px", minWidth: 100, background: "#eff6ff", borderRadius: 16, padding: 16, border: "1px solid #bfdbfe" }}>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: "#1d4ed8", marginBottom: 6 }}>{time}</p>
                                        <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{slotBookings.length}</p>
                                        <p style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600, marginBottom: 8 }}>bookings</p>
                                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                            {slotBookings.map((b) => {
                                                const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                                                return (
                                                    <span key={b.id} style={{ padding: "2px 8px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 10, fontWeight: 700 }}>
                                                        #{b.queue_position}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Bookings Table ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: "white", borderRadius: 20, overflow: "hidden",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)"
                    }}
                >
                    {/* Controls */}
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search bookings..."
                                className="input-premium"
                                style={{ paddingLeft: 38, paddingTop: 9, paddingBottom: 9, fontSize: 14 }}
                                id="admin-search-input"
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Filter style={{ width: 15, height: 15, color: "#9ca3af" }} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-premium"
                                style={{ paddingTop: 9, paddingBottom: 9, fontSize: 14, minWidth: 140 }}
                                id="status-filter"
                            >
                                <option value="all">All Status</option>
                                {Object.entries(STATUS_STYLES).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => router.refresh()}
                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", color: "#6b7280", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                            onMouseLeave={e => (e.currentTarget.style.background = "white")}
                            id="refresh-btn"
                        >
                            <RefreshCw style={{ width: 15, height: 15 }} />
                            Refresh
                        </button>
                        <button
                            onClick={clearAllHistory}
                            disabled={updating === "all"}
                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", cursor: updating === "all" ? "not-allowed" : "pointer", color: "#dc2626", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
                            onMouseEnter={e => { if (updating !== "all") e.currentTarget.style.background = "#fee2e2" }}
                            onMouseLeave={e => { if (updating !== "all") e.currentTarget.style.background = "#fef2f2" }}
                            id="clear-history-btn"
                        >
                            {updating === "all" ? (
                                <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid #fca5a5", borderTopColor: "#dc2626", animation: "spin 0.7s linear infinite" }} />
                            ) : (
                                <Trash2 style={{ width: 15, height: 15 }} />
                            )}
                            Clear History
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["ID", "Service", "Date", "Assigned Time", "Queue", "Contact", "Status", "Actions"].map(col => (
                                        <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ padding: "64px 24px", textAlign: "center" }}>
                                                <Car style={{ width: 40, height: 40, color: "#e2e8f0", margin: "0 auto 12px" }} />
                                                <p style={{ color: "#94a3b8", fontSize: 14 }}>No bookings found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((booking, i) => {
                                            const s = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
                                            return (
                                                <motion.tr
                                                    key={booking.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                                >
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>
                                                            {booking.id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, textTransform: "capitalize" }}>
                                                            {booking.service_type?.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <span style={{ fontSize: 14, color: "#475569" }}>
                                                            {booking.booking_date ? format(parseISO(booking.booking_date), "MMM d") : "—"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                                                            {booking.assigned_time || booking.base_time || "—"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <span style={{ fontWeight: 700, color: "#475569", fontSize: 14 }}>#{booking.queue_position || 1}</span>
                                                    </td>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                            <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{booking.phone || "—"}</span>
                                                            <span style={{ fontSize: 11, color: "#64748b", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={booking.location}>{booking.location || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <span style={{ padding: "4px 12px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 12, fontWeight: 700 }}>
                                                            {s.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                            {updating === booking.id ? (
                                                                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #bfdbfe", borderTopColor: "#2563eb", animation: "spin 0.7s linear infinite" }} />
                                                            ) : (
                                                                <>
                                                                    {booking.status === "pending" && (
                                                                        <button onClick={() => updateStatus(booking.id, "confirmed")}
                                                                            title="Confirm"
                                                                            style={{ padding: 7, borderRadius: 8, border: "none", background: "#eff6ff", cursor: "pointer", color: "#2563eb", transition: "background 0.2s" }}
                                                                            onMouseEnter={e => (e.currentTarget.style.background = "#dbeafe")}
                                                                            onMouseLeave={e => (e.currentTarget.style.background = "#eff6ff")}
                                                                        >
                                                                            <Zap style={{ width: 14, height: 14 }} />
                                                                        </button>
                                                                    )}
                                                                    {booking.status === "confirmed" && (
                                                                        <button onClick={() => updateStatus(booking.id, "in_progress")}
                                                                            title="Start"
                                                                            style={{ padding: 7, borderRadius: 8, border: "none", background: "#f5f3ff", cursor: "pointer", color: "#7c3aed", transition: "background 0.2s" }}
                                                                            onMouseEnter={e => (e.currentTarget.style.background = "#ede9fe")}
                                                                            onMouseLeave={e => (e.currentTarget.style.background = "#f5f3ff")}
                                                                        >
                                                                            <Clock style={{ width: 14, height: 14 }} />
                                                                        </button>
                                                                    )}
                                                                    {booking.status === "in_progress" && (
                                                                        <button onClick={() => updateStatus(booking.id, "completed")}
                                                                            title="Complete"
                                                                            style={{ padding: 7, borderRadius: 8, border: "none", background: "#f0fdf4", cursor: "pointer", color: "#16a34a", transition: "background 0.2s" }}
                                                                            onMouseEnter={e => (e.currentTarget.style.background = "#dcfce7")}
                                                                            onMouseLeave={e => (e.currentTarget.style.background = "#f0fdf4")}
                                                                        >
                                                                            <CheckCircle style={{ width: 14, height: 14 }} />
                                                                        </button>
                                                                    )}
                                                                    {!["completed", "cancelled"].includes(booking.status) && (
                                                                        <button onClick={() => updateStatus(booking.id, "cancelled")}
                                                                            title="Cancel"
                                                                            style={{ padding: 7, borderRadius: 8, border: "none", background: "#fef2f2", cursor: "pointer", color: "#dc2626", transition: "background 0.2s" }}
                                                                            onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                                                                            onMouseLeave={e => (e.currentTarget.style.background = "#fef2f2")}
                                                                        >
                                                                            <XCircle style={{ width: 14, height: 14 }} />
                                                                        </button>
                                                                    )}
                                                                    <Link href={`/tracking/${booking.id}`}
                                                                        title="View"
                                                                        style={{ padding: 7, borderRadius: 8, background: "#f8fafc", color: "#64748b", display: "flex", alignItems: "center", transition: "background 0.2s" }}
                                                                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#f1f5f9")}
                                                                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc")}
                                                                    >
                                                                        <Eye style={{ width: 14, height: 14 }} />
                                                                    </Link>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>Showing {filtered.length} of {bookings.length} bookings</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                            Real-time updates active
                        </span>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 1024px) { .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 640px) { .admin-stats-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
}

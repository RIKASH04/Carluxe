"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Car, Clock, Users, ArrowLeft, CheckCircle, Zap, Timer, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO, differenceInSeconds } from "date-fns";

type Booking = {
    id: string;
    service_type: string;
    base_time: string;
    assigned_time: string;
    batch_number: number;
    queue_position: number;
    status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
    created_at: string;
    booking_date: string;
    vehicle_type: string;
};

const STATUS_STEPS = ["pending", "confirmed", "in_progress", "completed"];

const STATUS_MESSAGES: Record<string, (mins: number) => string> = {
    pending: () => "Your booking is being processed...",
    confirmed: (mins) =>
        mins > 0 ? `Your car wash starts in ${mins} minute${mins !== 1 ? "s" : ""}` : "Your slot starts very soon!",
    in_progress: () => "Your car is being washed right now! ✨",
    completed: () => "Your car is sparkling clean! Enjoy the shine! 🎉",
    cancelled: () => "This booking has been cancelled.",
};

function CountdownTimer({ assignedTime, date }: { assignedTime: string; date: string }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isPast, setIsPast] = useState(false);

    useEffect(() => {
        const tick = () => {
            const [hours, minutes] = assignedTime.split(":").map(Number);
            const target = parseISO(date);
            target.setHours(hours, minutes, 0, 0);
            const diff = differenceInSeconds(target, new Date());
            if (diff <= 0) {
                setIsPast(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setIsPast(false);
                setTimeLeft({
                    hours: Math.floor(diff / 3600),
                    minutes: Math.floor((diff % 3600) / 60),
                    seconds: diff % 60,
                });
            }
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [assignedTime, date]);

    if (isPast) {
        return (
            <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#16a34a" }}>It&apos;s time! 🚗</span>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {[
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds },
            ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(37,99,235,0.35)" }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: "white", fontVariantNumeric: "tabular-nums" }}>
                            {String(value).padStart(2, "0")}
                        </span>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                </div>
            ))}
        </div>
    );
}

function ProgressBar({ status }: { status: string }) {
    const idx = STATUS_STEPS.indexOf(status);
    const progress = idx >= 0 ? ((idx + 1) / STATUS_STEPS.length) * 100 : 0;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                {STATUS_STEPS.map((step, i) => {
                    const isActive = i <= STATUS_STEPS.indexOf(status);
                    const isCurrent = i === STATUS_STEPS.indexOf(status);
                    return (
                        <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <motion.div
                                initial={false}
                                animate={{ backgroundColor: isActive ? "#2563eb" : "#e2e8f0", scale: isCurrent ? 1.2 : 1 }}
                                style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isActive ? "0 4px 12px rgba(37,99,235,0.3)" : "none" }}
                            >
                                {isActive ? (
                                    <CheckCircle style={{ width: 16, height: 16, color: "white" }} />
                                ) : (
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8" }} />
                                )}
                            </motion.div>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: isActive ? "#2563eb" : "#94a3b8" }}>
                                {step.replace("_", " ")}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div style={{ position: "relative", height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #2563eb, #7c3aed)" }}
                />
            </div>
        </div>
    );
}

export default function TrackingClient({ booking: initialBooking }: { booking: Booking }) {
    const [booking, setBooking] = useState<Booking>(initialBooking);
    const supabase = createClient();

    const getMinutesUntil = useCallback(() => {
        if (!booking.assigned_time || !booking.booking_date) return 0;
        const [hours, minutes] = booking.assigned_time.split(":").map(Number);
        const target = parseISO(booking.booking_date);
        target.setHours(hours, minutes, 0, 0);
        return Math.max(0, Math.floor((target.getTime() - Date.now()) / 60000));
    }, [booking.assigned_time, booking.booking_date]);

    useEffect(() => {
        const channel = supabase
            .channel("tracking-" + booking.id)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${booking.id}` },
                (payload) => { setBooking(payload.new as Booking); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase, booking.id]);

    const statusMsg = STATUS_MESSAGES[booking.status]?.(getMinutesUntil()) || "";
    const isCompleted = booking.status === "completed";
    const isInProgress = booking.status === "in_progress";

    const bannerBg = isCompleted
        ? "linear-gradient(135deg, #16a34a, #15803d)"
        : isInProgress
            ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
            : "linear-gradient(135deg, #2563eb, #1d4ed8)";

    const statusBadgeStyle: Record<string, { bg: string; color: string; border: string }> = {
        pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
        confirmed: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
        in_progress: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
        completed: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
        cancelled: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    };
    const sb = statusBadgeStyle[booking.status] || statusBadgeStyle.pending;

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)", position: "relative", overflowX: "hidden" }}>

            {/* Bg orbs */}
            <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 8, repeat: Infinity }}
                    style={{ position: "absolute", top: 80, left: 80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, #2563eb, transparent)" }} />
                <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                    style={{ position: "absolute", bottom: 80, right: 80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, #7c3aed, transparent)" }} />
            </div>

            {/* Header */}
            <header style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.4)", position: "sticky", top: 0, zIndex: 20 }}>
                <div className="container-app" style={{ height: 56, display: "flex", alignItems: "center", gap: 12 }}>
                    <Link href="/dashboard"
                        style={{ padding: 8, borderRadius: 10, background: "transparent", display: "flex", alignItems: "center", transition: "background 0.2s" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.6)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
                    >
                        <ArrowLeft style={{ width: 20, height: 20, color: "#475569" }} />
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Car style={{ width: 14, height: 14, color: "white" }} />
                        </div>
                        <span className="gradient-text" style={{ fontWeight: 900, fontSize: 16 }}>Carluxe</span>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>Live Tracking</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div className="status-dot active" />
                            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>Live</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-app" style={{ paddingTop: 32, paddingBottom: 48, position: "relative", zIndex: 10, maxWidth: 680 }}>

                {/* Status Banner */}
                <motion.div key={booking.status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: bannerBg, borderRadius: 24, padding: "32px 24px", marginBottom: 24, textAlign: "center", boxShadow: "0 12px 40px rgba(37,99,235,0.25)" }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div key={booking.status} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
                        >
                            {isCompleted ? (
                                <CheckCircle style={{ width: 52, height: 52, color: "white" }} />
                            ) : isInProgress ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                                    <Sparkles style={{ width: 52, height: 52, color: "white" }} />
                                </motion.div>
                            ) : (
                                <Timer style={{ width: 52, height: 52, color: "white" }} />
                            )}
                            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 500 }}>{statusMsg}</p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Main Tracking Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.7)", overflow: "hidden", marginBottom: 20 }}
                >
                    {/* Booking ID + Badge */}
                    <div style={{ padding: "22px 24px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`, fontSize: 12, fontWeight: 700, textTransform: "capitalize", marginBottom: 8 }}>
                                    {booking.service_type?.replace("_", " ")} Wash
                                </span>
                                <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Booking #{booking.id.slice(0, 8).toUpperCase()}</h1>
                                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                                    {booking.booking_date ? format(parseISO(booking.booking_date), "EEEE, MMMM d, yyyy") : "—"}
                                </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Batch</p>
                                <p style={{ fontSize: 28, fontWeight: 900, color: "#2563eb" }}>#{booking.batch_number || 1}</p>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid #f1f5f9" }}>
                        {[
                            { icon: Clock, label: "Assigned Time", value: booking.assigned_time || booking.base_time || "—" },
                            { icon: Users, label: "Queue Position", value: `#${booking.queue_position || 1}` },
                            { icon: Zap, label: "Status", value: booking.status?.replace("_", " ") },
                        ].map(({ icon: Icon, label, value }, i) => (
                            <div key={label} style={{ padding: "18px 12px", textAlign: "center", borderRight: i < 2 ? "1px solid #f1f5f9" : "none" }}>
                                <Icon style={{ width: 16, height: 16, color: "#2563eb", margin: "0 auto 6px" }} />
                                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</p>
                                <p style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", textTransform: "capitalize" }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Countdown Timer */}
                    {(booking.status === "confirmed" || booking.status === "pending") && booking.assigned_time && (
                        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textAlign: "center", marginBottom: 16 }}>Time Until Your Slot</p>
                            <CountdownTimer assignedTime={booking.assigned_time} date={booking.booking_date} />
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div style={{ padding: "24px" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 16 }}>Wash Progress</p>
                        <ProgressBar status={booking.status} />
                    </div>
                </motion.div>

                {/* Info Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderRadius: 18, padding: 20, border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                    >
                        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>Vehicle Type</p>
                        <p style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", textTransform: "capitalize" }}>{booking.vehicle_type || "Sedan"}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderRadius: 18, padding: 20, border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                    >
                        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>Base Time Slot</p>
                        <p style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{booking.base_time || "—"}</p>
                    </motion.div>
                </div>

                {/* Smart Queue Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ background: "#eff6ff", borderRadius: 18, padding: 20, border: "1px solid #bfdbfe", marginBottom: 24 }}
                >
                    <div style={{ display: "flex", gap: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Zap style={{ width: 18, height: 18, color: "#2563eb" }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e3a8a", marginBottom: 4 }}>Smart Queue System</p>
                            <p style={{ fontSize: 13, color: "#3b82f6", lineHeight: 1.6 }}>
                                Your car is in batch #{booking.batch_number || 1}. Every 3 cars batch together, then the queue shifts by 15 minutes to prevent overcrowding. Your assigned time reflects your exact position.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link href="/dashboard" className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", minWidth: 140 }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                        Back to Dashboard
                    </Link>
                    {booking.status === "completed" && (
                        <Link href="/dashboard" className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", minWidth: 140 }}>
                            Book Another Wash
                            <Sparkles style={{ width: 16, height: 16 }} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

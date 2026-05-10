"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Car, Calendar, Clock, Plus, LogOut, User, ChevronRight,
    Sparkles, CheckCircle, XCircle, Timer, Zap, X, Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { format, parseISO } from "date-fns";

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
    user_id: string;
    location?: string;
    phone?: string;
};

const SERVICES = [
    { id: "basic", name: "Basic Wash", price: 299, duration: "30 min", desc: "Exterior foam wash & dry" },
    { id: "premium", name: "Premium Detail", price: 699, duration: "60 min", desc: "Full exterior + interior" },
    { id: "luxury", name: "Luxury Package", price: 1299, duration: "120 min", desc: "Complete detailing + ceramic" },
];

const TIME_SLOTS = [
    "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45",
    "11:00", "11:15", "11:30", "11:45", "12:00", "13:00", "13:15", "13:30",
    "14:00", "14:15", "14:30", "15:00", "15:15", "15:30", "16:00", "16:15",
];

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "badge-yellow", icon: Timer },
    confirmed: { label: "Confirmed", color: "badge-blue", icon: Check },
    in_progress: { label: "In Progress", color: "badge-blue", icon: Zap },
    completed: { label: "Completed", color: "badge-green", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "badge-red", icon: XCircle },
};

export default function DashboardClient({
    user,
    initialBookings,
}: {
    user: SupabaseUser;
    initialBookings: Booking[];
}) {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [vehicleType, setVehicleType] = useState("sedan");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
    const [error, setError] = useState("");
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const channel = supabase
            .channel("user-bookings")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        setBookings((prev) => [payload.new as Booking, ...prev]);
                    } else if (payload.eventType === "UPDATE") {
                        setBookings((prev) =>
                            prev.map((b) => (b.id === (payload.new as Booking).id ? (payload.new as Booking) : b))
                        );
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, user.id]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleBooking = async () => {
        setLoading(true);
        setError("");

        try {
            const { data, error: rpcError } = await supabase.rpc("create_smart_booking", {
                p_user_id: user.id,
                p_service_type: selectedService,
                p_base_time: selectedTime,
                p_booking_date: selectedDate,
                p_vehicle_type: vehicleType,
                p_location: location,
                p_phone: phone,
            });

            if (rpcError) throw rpcError;

            setBookingSuccess(data as Booking);
            setShowBookingModal(false);
            setTimeout(() => setBookingSuccess(null), 5000);
        } catch (err: any) {
            console.error("Booking error:", err);
            const message = err.message || err.details || (typeof err === 'string' ? err : "Booking failed. Please try again.");
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const resetBookingModal = () => {
        setShowBookingModal(false);
        setStep(1);
        setSelectedService("");
        setSelectedDate("");
        setSelectedTime("");
        setLocation("");
        setPhone("");
        setError("");
    };

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return (
        <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
            {/* Header */}
            <header style={{ background: "white", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}>
                <div className="container-app" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Car style={{ width: 16, height: 16, color: "white" }} />
                        </div>
                        <span className="gradient-text" style={{ fontWeight: 900, fontSize: 18 }}>Carluxe</span>
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#eff6ff", borderRadius: 10 }}>
                            <User style={{ width: 14, height: 14, color: "#2563eb" }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user.email}
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "#6b7280", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            id="signout-btn"
                        >
                            <LogOut style={{ width: 16, height: 16 }} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <div className="container-app" style={{ paddingTop: 32, paddingBottom: 40 }}>
                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: "relative",
                        background: "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1d4ed8 100%)",
                        borderRadius: 24, padding: "36px 40px", marginBottom: 28, overflow: "hidden"
                    }}
                >
                    <div style={{ position: "absolute", right: -20, top: -20, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                    <div style={{ position: "absolute", right: 80, bottom: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                    <div style={{ position: "relative", zIndex: 10 }}>
                        <p style={{ color: "rgba(191,219,254,0.9)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Welcome back 👋</p>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 8, textTransform: "capitalize" }}>
                            {user.email?.split("@")[0]}
                        </h1>
                        <p style={{ color: "rgba(191,219,254,0.8)", fontSize: 14, marginBottom: 24 }}>
                            Ready for your next premium wash?
                        </p>
                        <button
                            onClick={() => setShowBookingModal(true)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                padding: "10px 20px", background: "white", color: "#2563eb",
                                fontWeight: 700, fontSize: 14, borderRadius: 12, border: "none",
                                cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "none"; }}
                            id="new-booking-btn"
                        >
                            <Plus style={{ width: 16, height: 16 }} />
                            Book New Wash
                        </button>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                    {[
                        { label: "Total Bookings", value: bookings.length, icon: Calendar, bg: "#eff6ff", color: "#2563eb" },
                        { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: CheckCircle, bg: "#f0fdf4", color: "#16a34a" },
                        { label: "Active", value: bookings.filter(b => ["pending", "confirmed", "in_progress"].includes(b.status)).length, icon: Timer, bg: "#fffbeb", color: "#d97706" },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: "white", borderRadius: 20, padding: "24px 20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                                <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
                            </div>
                            <p style={{ fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, marginTop: 6 }}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Bookings List */}
                <div style={{ background: "white", borderRadius: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827" }}>My Bookings</h2>
                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="btn-primary"
                            style={{ padding: "8px 16px", fontSize: 13 }}
                            id="add-booking-btn"
                        >
                            <Plus style={{ width: 15, height: 15 }} />
                            New Booking
                        </button>
                    </div>

                    {bookings.length === 0 ? (
                        <div style={{ padding: "64px 24px", textAlign: "center" }}>
                            <Car style={{ width: 52, height: 52, color: "#e2e8f0", margin: "0 auto 16px" }} />
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 8 }}>No bookings yet</h3>
                            <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>Book your first premium car wash experience</p>
                            <button onClick={() => setShowBookingModal(true)}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
                            >
                                <Plus style={{ width: 16, height: 16 }} /> Book Now
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: "8px 16px 16px" }}>
                            {bookings.map((booking, i) => {
                                const STATUS_INLINE: Record<string, { label: string; bg: string; color: string; border: string }> = {
                                    pending: { label: "Pending", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
                                    confirmed: { label: "Confirmed", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
                                    in_progress: { label: "In Progress", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
                                    completed: { label: "Completed", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
                                    cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
                                };
                                const s = STATUS_INLINE[booking.status] || STATUS_INLINE.pending;
                                return (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                                            padding: "16px 14px", marginTop: 10,
                                            background: "white", borderRadius: 16,
                                            border: "1px solid #f1f5f9",
                                            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.borderColor = "#e0e7ff"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 8px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9"; }}
                                    >
                                        {/* Left: Icon + Info */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                                            <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #bfdbfe" }}>
                                                <Car style={{ width: 20, height: 20, color: "#2563eb" }} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                {/* Title + Badge */}
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                                                    <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", textTransform: "capitalize" }}>
                                                        {booking.service_type?.replace("_", " ")} Wash
                                                    </span>
                                                    <span style={{ padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                                {/* Meta row */}
                                                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                                                        <Calendar style={{ width: 13, height: 13 }} />
                                                        {booking.booking_date ? format(parseISO(booking.booking_date), "MMM d, yyyy") : "—"}
                                                    </span>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                                                        <Clock style={{ width: 13, height: 13 }} />
                                                        {booking.assigned_time || booking.base_time || "—"}
                                                    </span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "3px 9px", borderRadius: 6 }}>
                                                        Queue #{booking.queue_position}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Track link */}
                                        <Link
                                            href={`/tracking/${booking.id}`}
                                            style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: 13, fontWeight: 700, textDecoration: "none", flexShrink: 0, padding: "6px 12px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", transition: "all 0.2s" }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#dbeafe"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#93c5fd"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#eff6ff"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#bfdbfe"; }}
                                        >
                                            Track
                                            <ChevronRight style={{ width: 14, height: 14 }} />
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
                        onClick={(e) => e.target === e.currentTarget && resetBookingModal()}
                    >
                        <motion.div
                            initial={{ scale: 0.93, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.93, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ background: "white", borderRadius: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}
                        >
                            {/* Modal Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", borderBottom: "1px solid #f1f5f9" }}>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 2 }}>Book a Wash</h2>
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Step {step} of 4</p>
                                </div>
                                <button onClick={resetBookingModal}
                                    style={{ padding: 8, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "#64748b", transition: "background 0.2s" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    <X style={{ width: 20, height: 20 }} />
                                </button>
                            </div>

                            {/* Step Indicator */}
                            <div style={{ display: "flex", gap: 8, padding: "16px 24px 0" }}>
                                {[1, 2, 3, 4].map((s) => (
                                    <div key={s} style={{ flex: 1, height: 5, borderRadius: 999, background: s <= step ? "#2563eb" : "#e2e8f0", transition: "background 0.3s" }} />
                                ))}
                            </div>

                            <div style={{ padding: 24 }}>
                                <AnimatePresence mode="wait">

                                    {/* ── Step 1: Choose Service ── */}
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            style={{ display: "flex", flexDirection: "column", gap: 14 }}
                                        >
                                            <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Select Service</p>

                                            {SERVICES.map((svc) => {
                                                const isSelected = selectedService === svc.id;
                                                return (
                                                    <div key={svc.id} onClick={() => setSelectedService(svc.id)} id={`service-${svc.id}`}
                                                        style={{
                                                            padding: "16px 18px", borderRadius: 16, cursor: "pointer",
                                                            border: isSelected ? "2px solid #2563eb" : "2px solid #e2e8f0",
                                                            background: isSelected ? "#eff6ff" : "white",
                                                            transition: "all 0.2s ease",
                                                            display: "flex", alignItems: "center", justifyContent: "space-between"
                                                        }}
                                                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "#bfdbfe"; }}
                                                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; }}
                                                    >
                                                        <div>
                                                            <p style={{ fontWeight: 800, color: isSelected ? "#1d4ed8" : "#0f172a", fontSize: 15, marginBottom: 3 }}>{svc.name}</p>
                                                            <p style={{ fontSize: 12, color: "#64748b" }}>{svc.desc} &bull; {svc.duration}</p>
                                                        </div>
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                                            <span style={{ fontWeight: 900, fontSize: 17, color: "#2563eb" }}>₹{svc.price}</span>
                                                            {isSelected && (
                                                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                    <Check style={{ width: 11, height: 11, color: "white" }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Vehicle Type</label>
                                                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="input-premium" id="vehicle-type-select">
                                                    <option value="sedan">Sedan / Hatchback</option>
                                                    <option value="suv">SUV / Crossover</option>
                                                    <option value="premium">Premium / Luxury</option>
                                                </select>
                                            </div>

                                            <button onClick={() => setStep(2)} disabled={!selectedService} id="next-step-btn"
                                                style={{
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                                    width: "100%", padding: "13px 20px", borderRadius: 12, border: "none",
                                                    background: selectedService ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#e2e8f0",
                                                    color: selectedService ? "white" : "#94a3b8", fontWeight: 700, fontSize: 15,
                                                    cursor: selectedService ? "pointer" : "not-allowed",
                                                    boxShadow: selectedService ? "0 4px 14px rgba(37,99,235,0.3)" : "none",
                                                    transition: "all 0.3s ease"
                                                }}
                                            >
                                                Next: Choose Date
                                                <ChevronRight style={{ width: 17, height: 17 }} />
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* ── Step 2: Date & Time ── */}
                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            style={{ display: "flex", flexDirection: "column", gap: 18 }}
                                        >
                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Select Date</label>
                                                <input type="date" value={selectedDate} min={today} onChange={(e) => setSelectedDate(e.target.value)} className="input-premium" id="date-input" />
                                            </div>

                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Select Time Slot</label>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
                                                    {(selectedDate === today
                                                        ? TIME_SLOTS.filter(slot => {
                                                            const [h, m] = slot.split(':').map(Number);
                                                            const d = new Date();
                                                            return h > d.getHours() || (h === d.getHours() && m > d.getMinutes());
                                                        })
                                                        : TIME_SLOTS
                                                    ).map((slot) => (
                                                        <button key={slot} onClick={() => setSelectedTime(slot)} id={`time-slot-${slot}`}
                                                            style={{
                                                                padding: "10px 4px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700,
                                                                cursor: "pointer", transition: "all 0.2s ease",
                                                                background: selectedTime === slot ? "#2563eb" : "#f1f5f9",
                                                                color: selectedTime === slot ? "white" : "#475569",
                                                                boxShadow: selectedTime === slot ? "0 4px 10px rgba(37,99,235,0.3)" : "none"
                                                            }}
                                                            onMouseEnter={e => { if (selectedTime !== slot) { (e.currentTarget as HTMLButtonElement).style.background = "#dbeafe"; (e.currentTarget as HTMLButtonElement).style.color = "#1d4ed8"; } }}
                                                            onMouseLeave={e => { if (selectedTime !== slot) { (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; } }}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: 12 }}>
                                                <button onClick={() => setStep(1)}
                                                    style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "2px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#475569", transition: "all 0.2s" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1"; (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                                                >Back</button>
                                                <button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} id="next-step-2-btn"
                                                    style={{
                                                        flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
                                                        background: (!selectedDate || !selectedTime) ? "#e2e8f0" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                                        color: (!selectedDate || !selectedTime) ? "#94a3b8" : "white",
                                                        cursor: (!selectedDate || !selectedTime) ? "not-allowed" : "pointer",
                                                        fontWeight: 700, fontSize: 14,
                                                        boxShadow: (!selectedDate || !selectedTime) ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                                                        transition: "all 0.3s"
                                                    }}
                                                >Next: Contact Details</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── Step 3: Contact & Location ── */}
                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            style={{ display: "flex", flexDirection: "column", gap: 18 }}
                                        >
                                            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1px dashed #cbd5e1", marginBottom: 4 }}>
                                                <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Booking for:</p>
                                                <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{SERVICES.find(s => s.id === selectedService)?.name} • {selectedTime}</p>
                                            </div>

                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Service Location</label>
                                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter full address" className="input-premium" id="location-input" />
                                            </div>

                                            <div>
                                                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Phone Number</label>
                                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" className="input-premium" id="phone-input" />
                                            </div>

                                            <div style={{ display: "flex", gap: 12 }}>
                                                <button onClick={() => setStep(2)}
                                                    style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "2px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#475569", transition: "all 0.2s" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1"; (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                                                >Back</button>
                                                <button onClick={() => setStep(4)} disabled={!location || !phone} id="next-step-3-btn"
                                                    style={{
                                                        flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
                                                        background: (!location || !phone) ? "#e2e8f0" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                                        color: (!location || !phone) ? "#94a3b8" : "white",
                                                        cursor: (!location || !phone) ? "not-allowed" : "pointer",
                                                        fontWeight: 700, fontSize: 14,
                                                        boxShadow: (!location || !phone) ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                                                        transition: "all 0.3s"
                                                    }}
                                                >Next: Review Summary</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── Step 4: Booking Summary ── */}
                                    {step === 4 && (
                                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            style={{ display: "flex", flexDirection: "column", gap: 16 }}
                                        >
                                            <div style={{ background: "#eff6ff", borderRadius: 16, padding: 20, border: "1px solid #bfdbfe" }}>
                                                <h3 style={{ fontWeight: 800, color: "#1e3a8a", fontSize: 15, marginBottom: 14 }}>Booking Summary</h3>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                                    {[
                                                        { label: "Service", value: SERVICES.find(s => s.id === selectedService)?.name },
                                                        { label: "Vehicle", value: vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1) },
                                                        { label: "Date", value: selectedDate ? format(parseISO(selectedDate), "MMMM d, yyyy") : "" },
                                                        { label: "Base Time", value: selectedTime },
                                                        { label: "Location", value: location },
                                                        { label: "Phone", value: phone },
                                                        { label: "Price", value: `₹${SERVICES.find(s => s.id === selectedService)?.price}` },
                                                    ].map(({ label, value }) => (
                                                        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                            <span style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600 }}>{label}</span>
                                                            <span style={{ fontSize: 14, fontWeight: 800, color: "#1e3a8a", textAlign: "right", maxWidth: "60%" }}>{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {error && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    style={{ padding: "12px 14px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}
                                                >
                                                    {error}
                                                </motion.div>
                                            )}

                                            <div style={{ display: "flex", gap: 12 }}>
                                                <button onClick={() => setStep(3)}
                                                    style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "2px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#475569", transition: "all 0.2s" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1"; (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                                                >Back</button>
                                                <button onClick={handleBooking} disabled={loading} id="confirm-booking-btn"
                                                    style={{
                                                        flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
                                                        background: loading ? "#e2e8f0" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                                        color: loading ? "#94a3b8" : "white",
                                                        cursor: loading ? "not-allowed" : "pointer",
                                                        fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                                        boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                                                        transition: "all 0.3s"
                                                    }}
                                                >
                                                    {loading ? (
                                                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                                                    ) : (
                                                        <><Sparkles style={{ width: 16, height: 16 }} />Confirm Booking</>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Booking Success Toast */}
            <AnimatePresence>
                {bookingSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.92 }}
                        style={{
                            position: "fixed", bottom: 24, right: 24, zIndex: 50,
                            background: "white", borderRadius: 20,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(22,163,74,0.1)",
                            border: "1px solid #dcfce7", padding: 20, maxWidth: 340
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <CheckCircle style={{ width: 20, height: 20, color: "#16a34a" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: 800, color: "#0f172a", fontSize: 15, marginBottom: 4 }}>Booking Confirmed! 🎉</h4>
                                <p style={{ fontSize: 13, color: "#64748b" }}>
                                    Assigned: <strong style={{ color: "#0f172a" }}>{bookingSuccess.assigned_time}</strong> &bull; Queue #{bookingSuccess.queue_position}
                                </p>
                                <Link href={`/tracking/${bookingSuccess.id}`}
                                    style={{ fontSize: 13, color: "#2563eb", fontWeight: 700, textDecoration: "none", display: "inline-block", marginTop: 6 }}
                                >
                                    Track your car →
                                </Link>
                            </div>
                            <button onClick={() => setBookingSuccess(null)}
                                style={{ padding: 4, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", transition: "color 0.2s" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#475569")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
                            >
                                <X style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

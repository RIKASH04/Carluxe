"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Shield, Clock, Zap, ChevronRight, Check, ArrowRight,
  Car, Sparkles, Award, Users, Phone, Mail, MapPin, Menu, X
} from "lucide-react";

const SERVICES = [
  {
    id: "basic",
    name: "Basic Wash",
    price: "₹299",
    duration: "30 min",
    description: "Exterior foam wash, rinse, and hand dry. Perfect for a quick refresh.",
    features: ["Exterior foam wash", "High-pressure rinse", "Hand dry", "Window cleaning"],
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&q=80",
    btnGradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium Detail",
    price: "₹699",
    duration: "60 min",
    description: "Full exterior + interior cleaning with premium foam and UV protection.",
    features: ["Everything in Basic", "Interior vacuum", "Dashboard polish", "Tire dressing", "UV protection"],
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80",
    btnGradient: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    iconBg: "#f5f3ff",
    iconColor: "#7c3aed",
    popular: true,
  },
  {
    id: "luxury",
    name: "Luxury Package",
    price: "₹1,299",
    duration: "120 min",
    description: "Complete detailing with ceramic coating, deep clean, and premium finish.",
    features: ["Everything in Premium", "Ceramic coating", "Engine bay clean", "Odor treatment", "Paint correction", "VIP treatment"],
    image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=600&q=80",
    btnGradient: "linear-gradient(135deg, #d97706, #b45309)",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    popular: false,
  },
];

const STATS = [
  { value: "12,500+", label: "Cars Washed", icon: Car, bg: "#eff6ff", color: "#2563eb" },
  { value: "4.9★", label: "Average Rating", icon: Star, bg: "#fef9c3", color: "#ca8a04" },
  { value: "98%", label: "Happy Customers", icon: Users, bg: "#f0fdf4", color: "#16a34a" },
  { value: "5 min", label: "Avg Queue Wait", icon: Clock, bg: "#faf5ff", color: "#7c3aed" },
];

const TESTIMONIALS = [
  {
    name: "Rahul Sharma",
    role: "BMW Owner",
    avatar: "RS",
    text: "Carluxe transformed my car. The smart queue system is brilliant — no waiting, just show up and they're ready for you!",
    rating: 5,
    gradient: "linear-gradient(135deg, #2563eb, #7c3aed)",
  },
  {
    name: "Priya Mehta",
    role: "Audi Owner",
    avatar: "PM",
    text: "The real-time tracking is a game changer. I tracked my car's progress from home. Absolutely premium experience.",
    rating: 5,
    gradient: "linear-gradient(135deg, #7c3aed, #db2777)",
  },
  {
    name: "Arjun Nair",
    role: "Mercedes Owner",
    avatar: "AN",
    text: "Professional, punctual, and perfect results. The ceramic coating package gave my car a showroom look.",
    rating: 5,
    gradient: "linear-gradient(135deg, #d97706, #dc2626)",
  },
];

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "0 1px 30px rgba(0,0,0,0.08)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.3)" : "none",
      }}
    >
      <div className="container-app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car style={{ width: 18, height: 18, color: "white" }} />
          </div>
          <span className="gradient-text" style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em" }}>Carluxe</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
          {["Services", "How It Works", "Pricing", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#2563eb")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="desktop-cta">
          <Link href="/auth/login" className="btn-secondary" style={{ padding: "8px 20px", fontSize: 14 }}>Sign In</Link>
          <Link href="/auth/login" className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>Book Now <ArrowRight style={{ width: 15, height: 15 }} /></Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          style={{ display: "none", padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" }}
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          id="mobile-menu-btn"
        >
          {menuOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: "rgba(255,255,255,0.95)", borderTop: "1px solid #f3f4f6", backdropFilter: "blur(20px)" }}
          >
            <div className="container-app" style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {["Services", "How It Works", "Pricing", "Testimonials"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{ fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
                <Link href="/auth/login" className="btn-secondary" style={{ textAlign: "center", justifyContent: "center" }}>Sign In</Link>
                <Link href="/auth/login" className="btn-primary" style={{ justifyContent: "center" }}>Book Now</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.header>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f8faff 0%, #eff6ff 35%, #f0f4ff 65%, #f8f9ff 100%)",
      }}
    >
      {/* Background orbs */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 80, right: 40, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.12), transparent)", }} />
        <div style={{ position: "absolute", bottom: 80, left: 40, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent)" }} />
      </div>

      <div className="container-app" style={{ position: "relative", zIndex: 10, paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="hero-grid">
          {/* Left Content */}
          <motion.div style={{ y, opacity }}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 999,
                background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)",
                marginBottom: 24
              }}
            >
              <Sparkles style={{ width: 15, height: 15, color: "#2563eb" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>Smart Booking System</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              style={{ fontWeight: 900, lineHeight: 1.12, letterSpacing: "-0.025em", color: "#111827", marginBottom: 20 }}
              className="hero-heading"
            >
              Your Car Deserves<br />
              <span className="gradient-text">Luxury Care</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              style={{ color: "#6b7280", fontSize: 18, lineHeight: 1.7, maxWidth: 440, marginBottom: 36 }}
            >
              Experience the future of car washing. Smart queue management, real-time
              tracking, and premium detailing — all in one elegant platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}
            >
              <Link href="/auth/login" className="btn-primary" style={{ fontSize: 15, padding: "13px 28px" }}>
                <Zap style={{ width: 18, height: 18 }} />
                Book Your Slot
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <a href="#how-it-works" className="btn-secondary" style={{ fontSize: 15, padding: "13px 28px" }}>
                <Car style={{ width: 18, height: 18 }} />
                How It Works
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}
            >
              {[
                { icon: Shield, text: "Insured & Certified" },
                { icon: Award, text: "Premium Quality" },
                { icon: Clock, text: "On-Time Guarantee" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
                  <Icon style={{ width: 14, height: 14, color: "#3b82f6" }} />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Floating Car Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
            style={{ position: "relative" }}
            className="hero-image-col"
          >
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(37,99,235,0.15), transparent)", filter: "blur(40px)" }} />

            <div className="float-anim" style={{ position: "relative" }}>
              <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 80px rgba(37,99,235,0.22), 0 8px 30px rgba(0,0,0,0.12)" }}>
                <Image
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=780&q=85"
                  alt="Premium luxury car — Carluxe"
                  width={780}
                  height={460}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)" }} />
              </div>

              {/* Floating confirmed card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", bottom: -20, left: -24,
                  background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
                  borderRadius: 18, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(255,255,255,0.7)", padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check style={{ width: 18, height: 18, color: "#16a34a" }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Booking Confirmed</p>
                  <p style={{ fontSize: 13, color: "#111827", fontWeight: 700 }}>9:15 AM • Slot #4</p>
                </div>
              </motion.div>

              {/* Floating rating card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{
                  position: "absolute", top: -12, right: -16,
                  background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
                  borderRadius: 18, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(255,255,255,0.7)", padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Star style={{ width: 18, height: 18, color: "white", fill: "white" }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Rating</p>
                  <p style={{ fontSize: 13, color: "#111827", fontWeight: 700 }}>4.9 / 5.0 ⭐</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}
        onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</span>
        <div style={{ width: 20, height: 32, borderRadius: 10, border: "2px solid #d1d5db", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 4 }}>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }}
          />
        </div>
      </motion.div>

      <style>{`
        .hero-heading { font-size: clamp(2.2rem, 4vw, 3.5rem); }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-image-col { display: none; }
        }
      `}</style>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="stats" style={{ padding: "72px 0", background: "white" }}>
      <div className="container-app">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="stats-grid">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="stats-card"
              style={{ textAlign: "center" }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
                background: stat.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 14px ${stat.bg}`
              }}>
                <stat.icon style={{ width: 24, height: 24, color: stat.color }} />
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{stat.value}</p>
              <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

function ServicesSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent, idx: number) => {
    const card = cardRefs.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) scale(1.02)`;
    card.style.boxShadow = `0 20px 50px rgba(0,0,0,0.12)`;
  };

  const handleMouseLeave = (idx: number) => {
    const card = cardRefs.current[idx];
    if (card) {
      card.style.transform = "perspective(1000px) rotateY(0) rotateX(0) scale(1)";
      card.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";
    }
  };

  return (
    <section id="services" style={{ padding: "96px 0", background: "#f9fafb" }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <span className="badge badge-blue" style={{ marginBottom: 16, display: "inline-flex" }}>Our Services</span>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>
            Premium Packages for<br />
            <span className="gradient-text">Every Car & Budget</span>
          </h2>
          <p style={{ color: "#6b7280", maxWidth: 520, margin: "0 auto", fontSize: 17, lineHeight: 1.65 }}>
            From quick washes to museum-quality detailing — choose the package that makes your car shine.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }} className="services-grid">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              ref={(el) => { cardRefs.current[i] = el; }}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => handleMouseLeave(i)}
              style={{
                position: "relative", borderRadius: 24, overflow: "hidden",
                background: "white", cursor: "pointer",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                transition: "transform 0.2s ease, box-shadow 0.3s ease"
              }}
            >
              {service.popular && (
                <div style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}>
                  <span className="badge badge-blue">Most Popular</span>
                </div>
              )}

              {/* Image */}
              <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: 14, left: 16 }}>
                  <span style={{ color: "white", fontSize: 26, fontWeight: 900 }}>{service.price}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginLeft: 4 }}>/ session</span>
                </div>
              </div>

              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 19, color: "#111827" }}>{service.name}</h3>
                  <span className="badge badge-gray">{service.duration}</span>
                </div>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{service.description}</p>

                <ul style={{ listStyle: "none", margin: "0 0 22px 0", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                  {service.features.map((feat) => (
                    <li key={feat} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: "#4b5563" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: service.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check style={{ width: 11, height: 11, color: service.iconColor }} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/login"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", padding: "12px 20px", borderRadius: 12,
                    background: service.btnGradient, color: "white",
                    fontWeight: 700, fontSize: 14, textDecoration: "none",
                    transition: "all 0.3s ease", boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)"; }}
                >
                  Book {service.name}
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .services-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 640px) and (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Choose a Service", desc: "Browse our premium packages and select the one that fits your car's needs and budget.", icon: Sparkles, color: "#2563eb", bg: "#eff6ff" },
    { num: "02", title: "Pick a Time Slot", desc: "Our smart system shows real-time availability. Dynamic batching guarantees no overcrowding.", icon: Clock, color: "#7c3aed", bg: "#f5f3ff" },
    { num: "03", title: "Get Smart Queued", desc: "AI assigns you the optimal time. Every 3 bookings auto-shifts to the next slot.", icon: Zap, color: "#d97706", bg: "#fffbeb" },
    { num: "04", title: "Track in Real-Time", desc: "Watch your car's progress live. Get notified when it's done. Seamless, luxury experience.", icon: Shield, color: "#059669", bg: "#f0fdf4" },
  ];

  return (
    <section id="how-it-works" style={{ padding: "96px 0", background: "white" }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <span className="badge badge-blue" style={{ marginBottom: 16, display: "inline-flex" }}>Process</span>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>
            How <span className="gradient-text">Carluxe</span> Works
          </h2>
          <p style={{ color: "#6b7280", maxWidth: 480, margin: "0 auto", fontSize: 17, lineHeight: 1.65 }}>
            From booking to sparkle — a seamless process designed for your convenience.
          </p>
        </motion.div>

        <div style={{ position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute", top: 40, left: "12.5%", right: "12.5%", height: 2,
            background: "linear-gradient(90deg, #bfdbfe, #c4b5fd, #bbf7d0, #6ee7b7)",
            borderRadius: 2
          }} className="connector-line" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="steps-grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: 20, marginBottom: 20,
                  background: step.bg, border: `2px solid ${step.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", zIndex: 10,
                  boxShadow: `0 8px 24px ${step.bg}`
                }}>
                  <step.icon style={{ width: 28, height: 28, color: step.color }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#d1d5db", textTransform: "uppercase", marginBottom: 8 }}>
                  {step.num}
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .connector-line { display: none; }
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

function VehicleSection() {
  const vehicles = [
    { name: "SUV & Crossovers", image: "https://images.unsplash.com/photo-1519648023493-d82b5f8d7b8a?w=700&q=80", desc: "Specialized care for your large vehicles" },
    { name: "Sedans & Hatchbacks", image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=700&q=80", desc: "Precision detailing for every curve" },
  ];

  return (
    <section id="pricing" style={{ padding: "96px 0", background: "#f9fafb" }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <span className="badge badge-blue" style={{ marginBottom: 16, display: "inline-flex" }}>All Vehicles</span>
          <h2 className="section-heading">
            We Care for <span className="gradient-text">Every Vehicle</span>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="vehicles-grid">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7 }}
              style={{ position: "relative", borderRadius: 24, overflow: "hidden", cursor: "pointer", height: 300 }}
              className="vehicle-card"
            >
              <Image src={v.image} alt={v.name} fill style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")}
                onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
                <h3 style={{ color: "white", fontSize: 24, fontWeight: 900, marginBottom: 6 }}>{v.name}</h3>
                <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14 }}>{v.desc}</p>
              </div>
              <div style={{ position: "absolute", bottom: 24, right: 24 }}>
                <Link href="/auth/login" className="btn-primary" style={{ fontSize: 13, padding: "8px 16px", opacity: 0 }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0")}
                >Book Now</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 640px) { .vehicles-grid { grid-template-columns: 1fr !important; } .vehicle-card { height: 220px !important; } }`}</style>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ padding: "96px 0", background: "white" }}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <span className="badge badge-blue" style={{ marginBottom: 16, display: "inline-flex" }}>Testimonials</span>
          <h2 className="section-heading">
            Loved by <span className="gradient-text">Car Enthusiasts</span>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{
                background: "white", borderRadius: 20, padding: 28,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease"
              }}
              whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(37,99,235,0.08)" }}
            >
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} style={{ width: 16, height: 16, color: "#f59e0b", fill: "#f59e0b" }} />
                ))}
              </div>
              <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 20, fontSize: 15, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ padding: "96px 0", background: "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1d4ed8 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 380, height: 380, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      </div>
      <div className="container-app" style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: 600, margin: "0 auto" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 14, fontWeight: 600, marginBottom: 32 }}>
            <Sparkles style={{ width: 15, height: 15 }} />
            Start Today — It&apos;s Free!
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 20 }}>
            Your Car&apos;s Next<br />Luxury Wash Awaits
          </h2>
          <p style={{ color: "rgba(191,219,254,0.9)", fontSize: 17, lineHeight: 1.65, marginBottom: 40 }}>
            Join thousands of car owners who trust Carluxe for professional, reliable, and luxurious car care.
          </p>
          <Link
            href="/auth/login"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", background: "white", color: "#2563eb", fontWeight: 800, fontSize: 16, borderRadius: 14, textDecoration: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", transition: "all 0.3s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
          >
            <Zap style={{ width: 20, height: 20 }} />
            Book Your First Wash
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "64px 0", background: "#0f172a" }}>
      <div className="container-app">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }} className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Car style={{ width: 18, height: 18, color: "white" }} />
              </div>
              <span className="gradient-text" style={{ fontWeight: 900, fontSize: 18 }}>Carluxe</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
              Premium car wash and detailing platform with smart queue management and real-time tracking.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: Phone, text: "+91 98765 43210" },
                { icon: Mail, text: "hello@carluxe.in" },
                { icon: MapPin, text: "Bengaluru, Karnataka, India" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                  <Icon style={{ width: 14, height: 14 }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Services</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Basic Wash", "Premium Detail", "Luxury Package", "Fleet Washing", "Ceramic Coating"].map(s => (
                <li key={s} style={{ fontSize: 13, color: "#64748b", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLLIElement).style.color = "#94a3b8")}
                  onMouseLeave={e => ((e.currentTarget as HTMLLIElement).style.color = "#64748b")}
                >{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["About Us", "Careers", "Privacy Policy", "Terms of Service", "Contact"].map(s => (
                <li key={s} style={{ fontSize: 13, color: "#64748b", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLLIElement).style.color = "#94a3b8")}
                  onMouseLeave={e => ((e.currentTarget as HTMLLIElement).style.color = "#64748b")}
                >{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#475569" }}>© 2025 Carluxe. All rights reserved.</p>
          <p style={{ fontSize: 13, color: "#475569" }}>Crafted with ❤️ for car enthusiasts</p>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }`}</style>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main>
      <NavBar />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <HowItWorksSection />
      <VehicleSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

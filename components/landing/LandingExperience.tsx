"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  Facebook,
  ImagePlus,
  Instagram,
  Layers,
  Rocket,
  Sparkles,
  Star,
  Zap,
  X,
  Store,
  Scissors,
  Dumbbell,
  ShoppingBag,
  Camera,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  ctaHref: string;
  isAuthenticated: boolean;
  proPriceLabel: string;
};

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const faqs = [
  {
    q: "Biztonságos a fiókom csatlakoztatása?",
    a: "Teljesen biztonságos. A Meta hivatalos OAuth rendszerén keresztül csatlakozunk — a jelszavadat soha nem mentjük el. A tokeneket titkosítással tároljuk.",
  },
  {
    q: "Kell marketing tudás a használathoz?",
    a: "Egyáltalán nem. A PostRocket-et épp azok számára terveztük, akiknek nincs marketing tapasztalatuk.",
  },
  {
    q: "Mennyi idő beállítani?",
    a: "Átlagosan 5–10 perc. Összekapcsolod a fiókodat, beütemezel egy posztot, és már kész is. Nincs bonyolult konfiguráció.",
  },
  {
    q: "Lemondhatom bármikor?",
    a: "Igen, nincs kötöttség és nincs lemondási díj. A Stripe portálon egy kattintással lemondható az előfizetés.",
  },
  {
    q: "Milyen platformokat támogat?",
    a: "Jelenleg Facebook oldalt és Instagram üzleti fiókot. Hamarosan érkezik TikTok és X is.",
  },
  {
    q: "Mi történik, ha nem tetszik?",
    a: "Az ingyenes csomaggal kockázat nélkül kipróbálhatod. Ha nem tetszik, nem kell semmit csinálnod — bankkártyaszámot sem kérünk.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${open ? "border-[#CC5833]/30 bg-white shadow-lg" : "border-gray-200 bg-white/50 hover:bg-white hover:border-gray-300 shadow-sm"}`}
    >
      <button
        className="flex w-full items-center justify-between p-6 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={`text-base font-bold pr-6 transition-colors md:text-lg ${open ? "text-[#CC5833]" : "text-[#1A1A1A]"}`}
        >
          {q}
        </span>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${open ? "bg-[#CC5833]/10 rotate-180" : "bg-gray-100"}`}
        >
          <ChevronDown
            className={`h-5 w-5 transition-colors ${open ? "text-[#CC5833]" : "text-[#6b7280]"}`}
          />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-[0.95rem] leading-relaxed text-[#6b7280]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LandingExperience({
  ctaHref,
  isAuthenticated,
  proPriceLabel,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      // Navbar fade in from top
      gsap.fromTo(
        navRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.05 },
      );

      // Hero stagger — fast, immediate
      gsap.fromTo(
        "[data-hero]",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.55,
          ease: "power3.out",
          delay: 0.15,
        },
      );

      // Hero floating card — animate in with hero, then float
      gsap.fromTo(
        "[data-float]",
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          delay: 0.3,
          onComplete: () => {
            gsap.to("[data-float]", {
              y: -16,
              duration: 4.5,
              repeat: -1,
              yoyo: true,
              ease: "power1.inOut",
            });
          },
        },
      );

      // Scroll-triggered section reveals — earlier trigger, faster duration
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 95%", once: true },
          },
        );
      });

      // Timeline line grow
      if (timelineLineRef.current) {
        gsap.fromTo(
          timelineLineRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: timelineLineRef.current,
              start: "top 90%",
              once: true,
            },
          },
        );
      }

      // Stagger bento cards — faster
      gsap.fromTo(
        "[data-bento]",
        { opacity: 0, y: 22, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.06,
          duration: 0.45,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-bento-section]",
            start: "top 90%",
            once: true,
          },
        },
      );

      // Pricing cards stagger
      gsap.fromTo(
        "[data-price-card]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.45,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-pricing-section]",
            start: "top 90%",
            once: true,
          },
        },
      );
    }, rootRef);

    // Navbar pill on scroll
    const handleScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 60) {
        navRef.current.classList.add("nav-scrolled");
      } else {
        navRef.current.classList.remove("nav-scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-hidden bg-[#F2F0E9]">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[20%] top-[5%] h-[600px] w-[600px] rounded-full bg-[#2E4036]/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-[30%] h-[500px] w-[500px] rounded-full bg-[#CC5833]/10 blur-[130px]" />
        <div className="absolute left-[30%] top-[65%] h-[400px] w-[400px] rounded-full bg-[#2E4036]/10 blur-[120px]" />
        <div className="absolute right-[20%] bottom-[5%] h-[350px] w-[350px] rounded-full bg-[#CC5833]/5 blur-[110px]" />
      </div>
      {/* ── 1. NAVBAR ─────────────────────────────────────── */}
      <header className="landing-nav fixed top-0 left-0 right-0 z-50 px-4 md:px-8">
        <nav
          ref={navRef}
          className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-[#2E4036]/10 bg-[#F2F0E9]/80 px-5 py-3 shadow-[0_2px_20px_-4px_rgba(46,64,54,0.12)] backdrop-blur-xl md:px-8"
          style={{ marginTop: "0.75rem" }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2E4036]">
              <Rocket className="h-4 w-4 text-[#F2F0E9]" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#1A1A1A]">
              PostRocket
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              ["#funkciok", "Funkciók"],
              ["#arak", "Árak"],
              ["#gyik", "GYIK"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="nav-link text-sm font-semibold text-[#2c2c2c] hover:text-black"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href={ctaHref} className="hidden md:block">
              <button className="btn-clay px-5 py-2.5 text-sm">
                Bejelentkezés <ArrowRight className="h-4 w-4" />
              </button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-[#2E4036]/10 bg-white/50 text-[#1A1A1A]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menü megnyitása"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-[#2E4036]/10 bg-[#F2F0E9]/95 p-4 shadow-xl backdrop-blur-xl animate-in slide-in-from-top-2 fade-in">
            <div className="flex flex-col space-y-3">
              {[
                ["#funkciok", "Funkciók"],
                ["#arak", "Árak"],
                ["#gyik", "GYIK"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg px-4 py-3 pb-2 text-base font-bold text-[#1A1A1A] hover:bg-[#2E4036]/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div className="pt-2 border-t border-[#2E4036]/10">
                <Link href={ctaHref} onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="btn-clay flex w-full justify-center px-5 py-3 text-base">
                    Bejelentkezés{" "}
                    <ArrowRight className="h-4 w-4 ml-2 mt-[2px]" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-24 md:pt-52 md:pb-40">
        {/* Background radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-[-10%] h-[600px] w-[600px] rounded-full bg-[#2E4036]/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-[#CC5833]/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid items-center gap-14 md:grid-cols-2 lg:gap-20">
            {/* Left col */}
            <div className="space-y-8">
              <div
                data-hero
                className="inline-flex mb-5 items-center gap-2 rounded-full border border-[#CC5833]/30 bg-[#CC5833]/10 px-4 py-2 text-sm font-semibold text-[#CC5833]"
              >
                <Rocket className="h-3.5 w-3.5" /> Automatizált marketing
              </div>

              <div data-hero>
                <h1 className="text-5xl font-bold leading-[1.0] tracking-tight text-[#1A1A1A] md:text-6xl lg:text-7xl">
                  Automatizált
                  <span className="display-serif block text-[1.05em]">
                    {" "}
                    social media
                  </span>
                  <span className="text-[#2E4036]">posztolás</span>
                </h1>
                <p className="mt-4 text-lg font-semibold text-[#CC5833]">
                  Több poszt. Kevesebb munka.
                </p>
                <p className="mt-3 max-w-lg text-[1.05rem] leading-relaxed text-[#1A1A1A]">
                  Automatizáld a tartalomkészítést és időzítést percek alatt —
                  technikai tudás nélkül.
                </p>
              </div>

              <div data-hero className="flex flex-wrap gap-3">
                <Link href={ctaHref}>
                  <button className="btn-clay px-8 py-3.5 text-base">
                    Ingyenes kipróbálás <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="#arak">
                  <button className="btn-outline-moss px-8 py-3.5 text-base">
                    Csomagok megtekintése
                  </button>
                </Link>
              </div>

              <div data-hero className="flex flex-wrap items-center gap-5 pt-1">
                {[
                  "Nincs bankkártya",
                  "5 perc beállítani",
                  "Magyar nyelven",
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#2E4036]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#2E4036]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right col — floating dashboard mockup */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#CC5833]/12 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-[#2E4036]/12 blur-3xl" />

              <div
                data-float
                className="relative w-full max-w-sm md:max-w-md"
                style={{ transform: "rotate(-1.5deg)" }}
              >
                <div className="glass-panel p-6 shadow-[0_32px_80px_-12px_rgba(46,64,54,0.28)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="label-moss">Ütemező Naptár</p>
                      <p className="mt-0.5 text-base font-bold text-[#1A1A1A]">
                        Március 2026
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2E4036]">
                      <Calendar className="h-4 w-4 text-[#F2F0E9]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => (
                      <div
                        key={d}
                        className="py-1 text-center text-[10px] font-semibold text-[#4a4a4a]"
                      >
                        {d}
                      </div>
                    ))}
                    {[...Array(6)].map((_, i) => (
                      <div key={`p${i}`} className="h-8 rounded-lg" />
                    ))}
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                      <div
                        key={d}
                        className={`flex h-8 items-center justify-center rounded-lg text-xs font-medium ${d === 5 ? "bg-[#CC5833] text-white shadow-sm" : d === 10 || d === 14 ? "bg-[#2E4036]/10 text-[#2E4036] border border-[#2E4036]/20" : "text-[#4a4a4a] hover:bg-[#2E4036]/10"}`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2.5 rounded-xl bg-[#2E4036]/10 px-3 py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FF1493]">
                        <Instagram className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1A1A]">
                          Instagram — Már. 5. 09:30
                        </p>
                        <p className="truncate text-[10px] text-[#4a4a4a]">
                          Tavaszi akció ✨ Foglalj most!
                        </p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-[#2E4036]" />
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-[#2E4036]/10 px-3 py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2]">
                        <Facebook className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1A1A]">
                          Facebook — Már. 10. 10:00
                        </p>
                        <p className="truncate text-[10px] text-[#4a4a4a]">
                          Hétvégi különlegesség! 🎉
                        </p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-[#CC5833]" />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#2E4036]/10 p-2.5 text-center">
                      <p className="text-[10px] font-mono text-[#4a4a4a]">
                        ÜTEMEZVE
                      </p>
                      <p className="text-lg font-bold text-[#2E4036]">3</p>
                    </div>
                    <div className="rounded-xl bg-[#CC5833]/10 p-2.5 text-center">
                      <p className="text-[10px] font-mono text-[#4a4a4a]">
                        MEGJELENT
                      </p>
                      <p className="text-lg font-bold text-[#CC5833]">18</p>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -right-6 top-4 flex items-center gap-1.5 rounded-full border border-[#CC5833]/25 bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-[#CC5833]" />
                  <span className="text-xs font-bold text-[#CC5833]">
                    AI aktív
                  </span>
                </div>
                <div className="absolute -left-6 bottom-8 flex items-center gap-1.5 rounded-full border border-[#2E4036]/20 bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#2E4036]" />
                  <span className="text-xs font-bold text-[#2E4036]">
                    Automatizálva
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TARGET AUDIENCE / USE CASES ──────────────────── */}
      <section className="relative bg-[#1A1A1A] pt-20 pb-32 overflow-hidden">
        {/* Grid background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Subtle center glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2E4036]/25 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-6 md:px-10 relative">
          <div data-reveal className="mb-14 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#F5F3EE] md:text-5xl">
              Kisvállalkozások számára
              <span className="display-serif block text-6xl"> tervezve</span>
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-[#F5F3EE]">
              Nincs időd posztokat írni? Nem tudod mit posztolj?{" "}
              <span className="font-bold text-[#CC5833]">
                Akkor a PostRocket neked készült.
              </span>
            </p>
          </div>

          {/* Masonry-style card grid matching Stitch design */}
          <div data-reveal className="grid gap-4 md:grid-cols-3">
            {/* Row 1 — 3 equal cards */}
            {[
              {
                icon: <Store className="h-7 w-7" />,
                iconBg: "bg-[#c1e8d1]",
                iconColor: "text-[#2E4036]",
                title: "Helyi üzletek",
                desc: "Bolt, szalon, szolgáltatás. Érj el több vevőt a környékeden automatikusan.",
              },
              {
                icon: <Coffee className="h-7 w-7" />,
                iconBg: "bg-[#f5ddb8]",
                iconColor: "text-[#CC5833]",
                title: "Éttermek és kávézók",
                desc: "Menü, akciók, rendezvények. Ínycsiklandó posztok pillanatok alatt.",
              },
              {
                icon: <Scissors className="h-7 w-7" />,
                iconBg: "bg-[#eadcfa]",
                iconColor: "text-[#7C3AED]",
                title: "Szépségipar",
                desc: "Fodrász, kozmetika, köröm. Mutasd meg munkáidat stílusosan.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border-2 border-[#cc5833]/10 bg-gradient-to-br from-[#FFF3EE] to-white py-5 px-6 shadow-[0_8px_30px_rgba(204,88,51,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(204,88,51,0.15)] group"
              >
                <div
                  className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor} shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  {item.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#6b7280]">
                  {item.desc}
                </p>
              </div>
            ))}

            {/* Row 2 — wide card + narrow card */}
            <div className="rounded-3xl border-2 flex items-center border-[#cc5833]/10 bg-gradient-to-br from-[#FFF3EE] to-white py-5 px-6 shadow-[0_8px_30px_rgba(204,88,51,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(204,88,51,0.15)] md:col-span-2 group">
              <div className="flex items-start gap-6">
                <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ccddf4] text-[#2563EB] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Dumbbell className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                    Edzők, coachok
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6b7280]">
                    PT, jóga, wellness. Motiváld követőidet napi szinten
                    anélkül, hogy órákat töltenél a telefonodon.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border-2 flex flex-col justify-center border-[#cc5833]/10 bg-gradient-to-br from-[#FFF3EE] to-white py-5 px-6 shadow-[0_8px_30px_rgba(204,88,51,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(204,88,51,0.15)] group">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#daf0ff] text-[#0284C7] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                Webshopok
              </h3>
              <p className="text-sm leading-relaxed text-[#6b7280]">
                Termékek, promók, újdonságok. Növeld az eladásokat.
              </p>
            </div>

            {/* Row 3 — full-width card with CTA */}
            <div className="rounded-3xl border-2 border-[#cc5833]/10 bg-gradient-to-br from-[#FFF3EE] to-white px-6 py-8 shadow-[0_8px_30px_rgba(204,88,51,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(204,88,51,0.15)] md:col-span-3 group">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-6">
                  <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFE4E6] text-[#E11D48] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <Camera className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col items-start justify-center">
                    <h3 className="mb-1.5 text-xl font-bold text-[#1A1A1A]">
                      Tartalomkészítők & Influencerek
                    </h3>
                    <p className="text-sm leading-relaxed text-[#6b7280]">
                      Creator, brand építők. Fókuszálj a tartalomgyártásra, az
                      AI kezeli a feliratokat, hashtageket és az időzítést.
                    </p>
                  </div>
                </div>
                <Link href={ctaHref} className="shrink-0">
                  <button className="btn-clay px-5 py-2.5 text-sm">
                    Tudj meg többet <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS — TIMELINE ──────────────────────── */}
      <section
        id="hogyan"
        className="relative bg-[#F2F0E9] py-20 overflow-hidden"
      >
        {/* Giant background rocket — decorative, half off right edge */}
        <div className="pointer-events-none absolute -right-30 top-30 z-0 opacity-[0.3]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[800px] h-[800px] -rotate-80"
            aria-hidden="true"
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        </div>

        {/* Colorful gradient blobs */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/60 to-transparent z-10" />
        <div className="pointer-events-none absolute left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-[#CC5833]/15 blur-[120px] mix-blend-multiply" />
        <div className="pointer-events-none absolute right-[5%] top-[40%] h-[600px] w-[600px] rounded-full bg-[#2E4036]/15 blur-[140px] mix-blend-multiply" />
        <div className="pointer-events-none absolute -left-[10%] bottom-[5%] h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[100px] mix-blend-multiply" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div data-reveal className="mb-12 max-w-2xl">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl">
              Így működik a
              <span className="display-serif text-7xl"> PostRocket</span>
            </h2>
          </div>

          <div className="relative mx-auto max-w-3xl">
            {/* Connecting vertical line */}
            <div
              ref={timelineLineRef}
              className="absolute left-10 top-18 hidden h-[calc(100%-80px)] w-0.5 md:block"
              style={{
                background:
                  "linear-gradient(to bottom, #2E4036 0%, #CC5833 50%, transparent 100%)",
              }}
            />

            <div className="space-y-10">
              {[
                {
                  num: "01",
                  icon: LinkIcon,
                  title: "Kapcsold össze a fiókjaidat",
                  desc: "Egy kattintással csatlakoztatod az Instagram vagy Facebook oldaladat. Biztonságos Meta OAuth segítségével - jelszó elmentése nélkül.",
                  pill: "2 perc",
                  color: "bg-[#2E4036]",
                },
                {
                  num: "02",
                  icon: Bot,
                  title: "AI segít a tartalom elkészítésében",
                  desc: "Add meg a témát és a hangvételt, az AI megírja a tökéletes posztot. Neked csak jóvá kell hagynod.",
                  pill: "3 perc",
                  color: "bg-[#CC5833]",
                },
                {
                  num: "03",
                  icon: Rocket,
                  title: "Időzítés és közzététel",
                  desc: "Kiválasztod a napot és időpontot, a PostRocket automatikusan kiposztolja a tartalmat a beállított időpontban.",
                  pill: "Egy kattintás",
                  color: "bg-[#1A1A1A]",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  data-reveal
                  className="flex flex-col gap-6 justify-center items-center md:flex-row md:items-start md:gap-12"
                >
                  <div
                    className={`relative z-10 my-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-8 ring-[#F2F0E9] ${step.color}`}
                  >
                    <step.icon className="h-8 w-8 text-[#F2F0E9]" />
                  </div>
                  <div className="glass-panel flex-1 p-8 transition-shadow duration-500 hover:shadow-[0_12px_40px_-8px_rgba(46,64,54,0.16)]">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#4a4a4a]">
                        Lépés {step.num}
                      </span>
                      <span className="rounded-full bg-[#2E4036]/10 px-2.5 py-0.5 text-xs font-bold text-[#2E4036]">
                        {step.pill}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A1A1A]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-[#4a4a4a]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. SAVINGS — OLD VS NEW ──────────────────────────── */}
      <section className="relative bg-[#1A1A1A] pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(46,64,54,0.4)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div data-reveal className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F2F0E9]/10 px-4 py-1.5 text-sm font-mono font-semibold uppercase tracking-widest text-[#F2F0E9]/70">
              Összehasonlítás
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-[#F2F0E9] md:text-5xl">
              Miért érdemes váltani?
            </h2>
          </div>

          <div className="relative grid items-stretch gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Left — Agency */}
            <div
              data-reveal
              className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-red-500/5 p-8 md:p-10"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/10 blur-2xl" />
              <div className="relative">
                <p className="mb-6 text-sm font-mono font-bold uppercase tracking-widest text-red-400">
                  Marketing ügynökség
                </p>
                <div className="space-y-4">
                  {[
                    "80 000 – 150 000 Ft / hó",
                    "Hetekig tartó egyeztetések",
                    "Nincs valódi kontroll",
                    "Drága módosítások",
                    "Általános tartalom",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                        <X className="h-3.5 w-3.5 text-red-400" />
                      </div>
                      <span className="text-[0.95rem] font-medium text-[#F2F0E9]/70">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — PostRocket */}
            <div
              data-reveal
              className="relative overflow-hidden rounded-3xl border border-[#2E4036]/40 bg-[#2E4036]/15 p-8 md:p-10"
            >
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#2E4036]/30 blur-2xl" />
              <div className="relative">
                <p className="mb-6 text-sm font-mono font-bold uppercase tracking-widest text-[#4ade80]">
                  PostRocket
                </p>
                <div className="space-y-4">
                  {[
                    "0 – 7 999 Ft / hó",
                    "10 perc beállítani",
                    "Teljes kontroll",
                    "Azonnali módosítások",
                    "AI által személyre szabott tartalom",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2E4036]/40">
                        <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                      </div>
                      <span className="text-[0.95rem] font-medium text-[#F2F0E9]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div data-reveal className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#F2F0E9]/10 bg-[#F2F0E9]/5 px-6 py-4">
              <Coffee className="h-5 w-5 text-[#CC5833]" />
              <p className="text-lg font-bold text-[#F2F0E9]">
                Egy marketinges ára helyett egy kávé ára.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FEATURES BENTO GRID ─────────────────────────── */}
      <section
        id="funkciok"
        data-bento-section
        className="relative bg-[#F5F3EE] pt-20 pb-24 overflow-hidden"
      >
        <div className="relative mx-auto max-w-6xl px-6 md:px-10">
          {/* Section header */}
          <div data-reveal className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] md:text-5xl">
              Minden, amire szükséged van
              <span className="display-serif block italic text-[#CC5833] text-5xl">
                {" "}
                a tökéletes posztoláshoz
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[#1A1A1A]">
              Egyetlen platformon — külön eszközök nélkül.
            </p>
          </div>

          {/* Bento Grid — matches Stitch layout exactly */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:grid-rows-2">
            {/* ── 01 // PLAN — Premium Visual Calendar hero: col-span-3 row-span-2 */}
            <div
              data-bento
              className="group relative overflow-hidden rounded-3xl bg-[#2E4036] p-8 shadow-[0_24px_60px_-12px_rgba(46,64,54,0.4)] transition-all duration-500 hover:shadow-[0_36px_80px_-12px_rgba(46,64,54,0.6)] md:col-span-3 md:row-span-2"
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#CC5833]/20 blur-3xl transition-transform duration-700 group-hover:scale-110" />
              <div className="pointer-events-none absolute -left-12 bottom-0 h-64 w-64 rounded-full bg-black/40 blur-3xl" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(242,240,233,1) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="relative flex h-full flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F0E9]/10 shadow-inner">
                      <Calendar className="h-6 w-6 text-[#F2F0E9]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#F2F0E9]">
                        Vizuális Naptár
                      </h3>
                      <div className="text-sm text-[#F2F0E9]/60">
                        Egyszerű időzítés
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-[#F2F0E9]/50 rounded-full border border-[#F2F0E9]/15 px-3 py-1">
                    01 // PLAN
                  </span>
                </div>

                {/* Live Premium Calendar Interface */}
                <div className="relative mt-auto flex-1 rounded-2xl border border-[#F2F0E9]/10 bg-[#1A1A1A]/40 p-4 shadow-2xl backdrop-blur-sm">
                  <div className="mb-3 grid grid-cols-7 gap-2">
                    {["H", "K", "SZE", "CS", "P", "SZO", "V"].map((d) => (
                      <div
                        key={d}
                        className="text-center text-[12px] font-bold tracking-widest text-[#F2F0E9]/50"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 h-[460px]">
                    {Array.from({ length: 31 }).map((_, i) => {
                      // Post slots
                      const hasPost1 = i === 3; // Wed
                      const hasPost2 = i === 9; // Wed next week
                      const hasPost3 = i === 12; // Sat next week
                      const hasPost4 = i === 14; // Sat next week
                      const hasPost5 = i === 18; // Sat next week
                      const hasPost6 = i === 19; // Sat next week
                      const hasPost7 = i === 23; // Sat next week
                      const hasPost8 = i === 27; // Sat next week
                      const hasPost9 = i === 29; // Sat next week

                      return (
                        <div
                          key={i}
                          className={`relative w-9 h-20 md:w-12 md:h-20 lg:w-18 lg:h-24 overflow-hidden rounded-xl border border-[#F2F0E9]/5 p-2 transition-all duration-200 ${
                            hasPost1
                              ? "bg-gradient-to-b from-[#CC5833]/20 to-[#CC5833]/5 border-[#CC5833]/40 shadow-[0_4px_16px_rgba(204,88,51,0.2)]"
                              : hasPost2
                                ? "bg-gradient-to-b from-[#1877F2]/20 to-[#1877F2]/5 border-[#1877F2]/40 shadow-[0_4px_16px_rgba(24,119,242,0.2)]"
                                : hasPost3
                                  ? "bg-gradient-to-b from-[#CC5833]/20 to-[#CC5833]/5 border-[#CC5833]/40 shadow-[0_4px_16px_rgba(204,88,51,0.2)]"
                                  : hasPost4
                                    ? "bg-gradient-to-b from-[#1877F2]/20 to-[#1877F2]/5 border-[#1877F2]/40 shadow-[0_4px_16px_rgba(24,119,242,0.2)]"
                                    : hasPost5
                                      ? "bg-gradient-to-b from-[#CC5833]/20 to-[#CC5833]/5 border-[#CC5833]/40 shadow-[0_4px_16px_rgba(204,88,51,0.2)]"
                                      : hasPost6
                                        ? "bg-gradient-to-b from-[#1877F2]/20 to-[#1877F2]/5 border-[#1877F2]/40 shadow-[0_4px_16px_rgba(24,119,242,0.2)]"
                                        : hasPost7
                                          ? "bg-gradient-to-b from-[#CC5833]/20 to-[#CC5833]/5 border-[#CC5833]/40 shadow-[0_4px_16px_rgba(204,88,51,0.2)]"
                                          : hasPost8
                                            ? "bg-gradient-to-b from-[#1877F2]/20 to-[#1877F2]/5 border-[#1877F2]/40 shadow-[0_4px_16px_rgba(24,119,242,0.2)]"
                                            : hasPost9
                                              ? "bg-gradient-to-b from-[#1877F2]/20 to-[#1877F2]/5 border-[#1877F2]/40 shadow-[0_4px_16px_rgba(24,119,242,0.2)]"
                                              : "bg-[#F2F0E9]/[0.02] hover:bg-[#F2F0E9]/[0.05]"
                          }`}
                        >
                          <div className="text-[10px] font-semibold text-[#F2F0E9]/80 mb-1">
                            {i + 1}
                          </div>
                          {hasPost1 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#CC5833]/80 animate-pulse" />
                              <div className="h-1.5 w-2/3 rounded bg-[#CC5833]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#DD2A7B]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost2 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#1877F2]/80" />
                              <div className="h-1.5 w-3/4 rounded bg-[#1877F2]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#1877F2]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost3 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#CC5833]/80 animate-pulse" />
                              <div className="h-1.5 w-2/3 rounded bg-[#CC5833]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#DD2A7B]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost4 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#1877F2]/80" />
                              <div className="h-1.5 w-3/4 rounded bg-[#1877F2]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#1877F2]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost5 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#CC5833]/80 animate-pulse" />
                              <div className="h-1.5 w-2/3 rounded bg-[#CC5833]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#DD2A7B]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost6 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#1877F2]/80" />
                              <div className="h-1.5 w-3/4 rounded bg-[#1877F2]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#1877F2]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost7 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#CC5833]/80 animate-pulse" />
                              <div className="h-1.5 w-2/3 rounded bg-[#CC5833]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#DD2A7B]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost8 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#1877F2]/80" />
                              <div className="h-1.5 w-3/4 rounded bg-[#1877F2]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#1877F2]/80" />
                              </div>
                            </div>
                          )}
                          {hasPost9 && (
                            <div className="mt-1 space-y-1.5">
                              <div className="h-2.5 w-full rounded bg-[#1877F2]/80" />
                              <div className="h-1.5 w-3/4 rounded bg-[#1877F2]/40" />
                              <div className="absolute bottom-2.5 right-2.5 flex gap-0.5">
                                <div className="h-[10px] w-[10px] rounded bg-[#1877F2]/80" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 02 // WRITE — Premium AI Writer: col-span-2 */}
            <div
              data-bento
              className="group relative overflow-hidden rounded-3xl bg-[#1B1B1B] p-7 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] md:col-span-2"
            >
              <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-[#CC5833]/90 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-125" />

              <div className="relative flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CC5833] shadow-inner">
                    <Sparkles className="h-6 w-6 text-[#FFF3EE]" />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-[#FFF3EE] rounded-full border border-[#FFF3EE]/80 px-3 py-1 bg-[#FFF3EE]/5">
                    02 // WRITE
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-extrabold text-[#FFF3EE]">
                  AI Szövegírás
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#FFF3EE]/80">
                  Másodpercek alatt kész a poszt —{" "}
                  <span className="font-bold text-[#CC5833]">
                    te csak jóváhagyod.
                  </span>
                </p>

                {/* Mock AI interface */}
                <div className="mt-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#CC5833] to-[#FF8C66] p-1 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="h-1.5 w-28 rounded-full bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded bg-gray-200" />
                    <div className="h-2 w-5/6 rounded bg-gray-200" />
                    <div className="flex gap-1 pt-2">
                      <span className="text-[12px] font-bold text-[#1877F2]">
                        #tavasz
                      </span>
                      <span className="text-[12px] font-bold text-[#DD2A7B]">
                        #újkollekció
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 03 // SYNC — Premium Platform Sync: col-span-2 */}
            <div
              data-bento
              className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] md:col-span-2"
            >
              <div className="absolute -left-4 -bottom-14 h-40 w-40 rounded-full bg-gradient-to-br from-[#1877F2]/90 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-125" />
              <div className="absolute -right-10 -bottom-14 h-40 w-40 rounded-full bg-gradient-to-br from-[#DD2A7B]/90 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-125" />

              <div className="relative flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B1B1B] shadow-inner">
                    <Layers className="h-6 w-6 text-[#FFF3EE]" />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-[#FFF3EE] rounded-full border border-[#FFF3EE] px-3 py-1 bg-[#1B1B1B]/90">
                    03 // SYNC
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-extrabold text-[#1B1B1B] leading-tight">
                  Egy kattintás,
                  <br />
                  két platform
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#1B1B1B]/90">
                  Instagram + Facebook egyszerre. Felejtsd el a másolgatást!
                </p>

                {/* Connecting platforms visual */}
                <div className="mt-auto relative mx-auto flex w-full max-w-[310px] items-center justify-between px-2 py-4">
                  {/* Connection line */}
                  <div className="absolute left-1/2 top-1/2 h-0.5 w-3/4 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#1877F2]/30 via-gray-200 to-[#DD2A7B]/30" />
                  <div className="absolute left-1/2 top-1/2 h-1 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden">
                    <div className="h-full w-24 bg-[#CC5833]/40 blur-sm animate-[translateX_1.5s_infinite_linear]" />
                  </div>

                  {/* Icons */}
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-[0_8px_24px_rgba(24,119,242,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Facebook className="h-7 w-7" />
                  </div>
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B1B1B] text-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <Rocket className="h-7 w-7" />
                  </div>
                  <div
                    className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_8px_24px_rgba(220,39,67,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{
                      background:
                        "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                    }}
                  >
                    <Instagram className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. PRICING — DARK THEME ───────────────────────────── */}
      <section
        id="arak"
        data-pricing-section
        className="relative bg-[#1A1A1A] py-20 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(204,88,51,0.08),transparent)]" />
        <div className="pointer-events-none absolute left-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[#2E4036]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div data-reveal className="mb-16 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#F2F0E9] md:text-5xl lg:text-6xl">
              Egyszerű árak.
              <span className="display-serif block mt-2 text-[#CC5833]">
                {" "}
                Rejtett költségek nélkül.
              </span>
            </h2>
            <p className="mt-6 text-lg text-[#F2F0E9]/60">
              Bármikor lemondható. Nincs kockázat.
              <span className="font-bold text-[#F2F0E9] bg-[#CC5833]/90 rounded-full px-3 py-1 ml-2 text-base">
                Korai hozzáférés!
              </span>
            </p>
          </div>

          <div className="grid items-center gap-6 md:grid-cols-3">
            {/* Free */}
            <div
              data-price-card
              className="rounded-3xl border border-[#F2F0E9]/10 bg-[#F2F0E9]/[0.02] p-8 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:border-[#F2F0E9]/20"
            >
              <p className="mb-2 text-xs font-mono font-bold uppercase tracking-widest text-[#F2F0E9]/50">
                Ingyenes
              </p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-[#F2F0E9]">
                  0 Ft
                </span>
                <span className="text-[#F2F0E9]/50 ml-1">/hó</span>
              </div>
              <p className="mb-6 text-sm text-[#F2F0E9]/50">
                Örökre ingyenes. Bankkártya nélkül.
              </p>
              <ul className="mb-8 space-y-4">
                {[
                  "3 előre beütemezhető poszt",
                  "Facebook + Instagram",
                  "Kézi szerkesztő",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-[#F2F0E9]/80"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ade80]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={ctaHref} className="block mt-auto">
                <button className="w-full rounded-2xl border border-[#F2F0E9]/20 py-4 text-sm font-bold text-[#F2F0E9] transition hover:bg-[#F2F0E9]/10">
                  Ingyenes kezdés
                </button>
              </Link>
            </div>

            {/* Pro — Popular */}
            <div
              data-price-card
              className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#2E4036] to-[rgba(46,64,54,0.4)] p-8 shadow-[0_24px_80px_-12px_rgba(46,64,54,0.6)] border border-[#4ade80]/20 z-10"
              style={{ transform: "scale(1.05)" }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#CC5833]/30 blur-3xl animate-pulse" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#1877F2]/20 blur-3xl" />

              <div className="relative">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#CC5833] to-[#FF8C66] px-3 py-1 text-sm font-bold text-white shadow-lg shadow-[#CC5833]/30">
                    <Star className="h-3 w-3 fill-white" /> Legnépszerűbb
                  </div>
                </div>
                <p className="mb-2 text-base font-mono font-bold uppercase tracking-widest text-[#4ade80]">
                  Pro
                </p>
                <div className="mb-1">
                  <div className="flex items-baseline gap-2 -mb-1">
                    <span className="text-xl line-through text-[#F2F0E9]/60 font-medium">
                      4 999 Ft
                    </span>
                  </div>
                  <span className="text-5xl font-extrabold text-[#F2F0E9]">
                    3 999 Ft
                  </span>
                  <span className="text-[#F2F0E9]/60 ml-1">/hó</span>
                </div>
                <p className="mb-6 text-sm text-[#F2F0E9]/80">
                  Kis és középvállalkozásoknak.
                </p>
                <ul className="mb-8 space-y-4">
                  {[
                    "20 előre beütemezhető poszt",
                    "Facebook + Instagram",
                    "Kézi szerkesztő",
                    "AI szövegírás",
                    "Elsőbbségi támogatás",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-sm font-medium text-[#F2F0E9]"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4ade80]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={ctaHref} className="block mt-auto">
                  <button className="w-full rounded-2xl bg-[#CC5833] py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(204,88,51,0.4)] transition hover:bg-[#b84d2e] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(204,88,51,0.5)]">
                    Pro előfizetés
                  </button>
                </Link>
              </div>
            </div>

            {/* Elite */}
            <div
              data-price-card
              className="rounded-3xl border border-[#F2F0E9]/10 bg-[#F2F0E9]/[0.02] p-8 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:border-[#F2F0E9]/20"
            >
              <p className="mb-2 text-base font-mono font-bold uppercase tracking-widest text-[#CC5833]">
                Elite
              </p>
              <div className="mb-1">
                <div className="flex items-baseline gap-2 -mb-1">
                  <span className="text-xl line-through text-[#F2F0E9]/50 font-medium">
                    9 999 Ft
                  </span>
                </div>
                <span className="text-4xl font-extrabold text-[#F2F0E9]">
                  7 999 Ft
                </span>
                <span className="text-[#F2F0E9]/50 ml-1">/hó</span>
              </div>
              <p className="mb-6 text-sm text-[#F2F0E9]/50">
                Növekvő vállalkozásoknak.
              </p>
              <ul className="mb-8 space-y-4">
                {[
                  "50 előre beütemezhető poszt",
                  "Facebook + Instagram",
                  "Kézi szerkesztő",
                  "KORLÁTLAN AI szövegírás",
                  "AI képgenerálás (hamarosan)",
                  "Elsőbbségi támogatás",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-[#F2F0E9]/80"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#CC5833]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={ctaHref} className="block mt-auto">
                <button className="w-full rounded-2xl border border-transparent bg-[#2E4036] py-4 text-sm font-bold text-[#F2F0E9] shadow-[0_8px_24px_rgba(46,64,54,0.3)] transition hover:bg-[#25332b] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(46,64,54,0.4)]">
                  Elite előfizetés
                </button>
              </Link>
            </div>
          </div>

          <div
            data-reveal
            className="mt-16 text-center text-sm text-[#F2F0E9]/40"
          >
            Kérdésed van? Írj:{" "}
            <a
              href="mailto: leventebiznisz123@gmail.com"
              className="font-semibold text-[#F2F0E9]/80 underline decoration-[#CC5833]/50 hover:text-[#CC5833] hover:decoration-[#CC5833]"
            >
              leventebiznisz123@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ — LIGHT THEME ───────────────────────────── */}
      <section
        id="gyik"
        className="relative bg-[#FFF3EE] py-20 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,88,51,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#2E4036]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-6 md:px-10">
          <div data-reveal className="mb-16 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] md:text-5xl">
              Kérdések és
              <span className="display-serif text-[#CC5833]"> válaszok</span>
            </h2>
            <p className="mt-5 text-lg text-[#1A1A1A]">
              Minden, amit tudnod kell a belevágás előtt.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} data-reveal>
                <FAQItem q={faq.q} a={faq.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CTA — Stitch matched ─────────────────────── */}
      <section className="relative bg-[#1A1A1A] py-20 overflow-hidden">
        {/* Grid background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,240,233,1) 1px, transparent 1px), linear-gradient(90deg, rgba(242,240,233,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Subtle center glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2E4036]/25 blur-[120px]" />

        <div className="relative mx-auto max-w-3xl px-6 text-center md:px-10">
          {/* Badge */}
          <div data-reveal className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F2F0E9]/35 bg-[#F2F0E9]/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#cc5833]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CC5833] animate-pulse" />
              Bevezetési időszak
            </div>
          </div>

          {/* Headline */}
          <h2
            data-reveal
            className="mb-6 text-5xl font-extrabold tracking-tight text-[#F2F0E9] md:text-6xl lg:text-7xl"
          >
            Csatlakozz az
            <span className="display-serif block italic text-[#CC5833]">
              első felhasználókhoz
            </span>
          </h2>

          {/* Subtext */}
          <p
            data-reveal
            className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[#F2F0E9]/55"
          >
            Közvetlen visszajelzést adhatsz a fejlesztésbe, és elsőként éred el
            az új funkciókat.{" "}
            <span className="font-bold text-[#F2F0E9]/85">
              Korai hozzáférés!
            </span>
          </p>

          {/* CTA buttons */}
          <div
            data-reveal
            className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href={ctaHref}>
              <button className="inline-flex items-center gap-2 rounded-full bg-[#CC5833] px-8 py-4 text-base font-bold text-white shadow-[0_8px_32px_rgba(204,88,51,0.4)] transition duration-300 hover:bg-[#b84d2e] hover:shadow-[0_12px_40px_rgba(204,88,51,0.5)] hover:scale-105">
                Ingyenes kezdés <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>

          {/* Social proof — avatar stack */}
          <div data-reveal className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[
                  { bg: "#7B9E8A", label: "A" },
                  { bg: "#CC7A5A", label: "B" },
                  { bg: "#5A7A8A", label: "C" },
                  { bg: "#CC5833", label: "D" },
                ].map(({ bg, label }) => (
                  <div
                    key={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1A1A1A] text-xs font-bold text-white"
                    style={{ backgroundColor: bg }}
                  >
                    {label}
                  </div>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1A1A1A] bg-[#2E4036] text-xs font-bold text-[#F2F0E9]">
                  +
                </div>
              </div>
            </div>
            <p className="text-sm text-[#F2F0E9]/45">
              Már több mint{" "}
              <span className="font-bold text-[#F2F0E9]/75">
                {" "}
                15+ vállalkozó
              </span>{" "}
              csatlakozott a programhoz.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-[#F2F0E9]/10 bg-[#1A1A1A] py-7">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2E4036]">
                <Rocket className="h-3 w-3 text-[#F2F0E9]" />
              </div>
              <span className="text-sm font-bold text-[#F2F0E9]/60">
                PostRocket
              </span>
            </div>
            <p className="text-xs text-[#F2F0E9]/30">
              © 2026 PostRocket. Minden jog fenntartva.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

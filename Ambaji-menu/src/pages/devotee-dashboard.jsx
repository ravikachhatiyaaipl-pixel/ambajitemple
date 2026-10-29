/***
 *  I3EMS - AMT ERP | Devotee Dashboard (design: screen.png)
 *  Single file · Responsive · EN / ગુજ toggle
 *  Live data:
 *    - temple clock, status, next aarti, schedule  -> landingdata.js (TIMINGS) + useTempleClock
 *    - donations (gold / bullion)                  -> DonationApi.getPortalDonations()
 *    - article donations                           -> ArticleDonationApi.getMyDonations()
 *    - seva bookings                               -> GET /portal/seva/bookings
 *  Static text (services, footer, contacts)        -> landingdata.js (DEVOTEE_*)
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Award, Bell, CalendarDays, CalendarX, Clock, Coins, Flame, HandHeart, Landmark, Lock,
  LogOut, MapPin, Moon, Package, Plus, Radio, ReceiptText, ShieldCheck, Sun, Sunrise,
  Users, Utensils, IndianRupee,
} from "lucide-react";
import DonationApi from "./services/donationapi";
import ArticleDonationApi from "./services/articleDonationApi";
import useTempleClock from "./landing/usetempleclock";
import {
  TIMINGS, OPEN_TIME, CLOSE_TIME, TEMPLE_NAME,
  DEVOTEE_PORTAL, DEVOTEE_SERVICES, DEVOTEE_FOOTER,
  toMinutes, format12, isTempleOpen, getNextAarti,
} from "./landing/landingdata";

/* NOTE: blue / purple / violet Tailwind classes are remapped to red in index.css,
   so every colour on this page uses explicit hex values. */

const ICONS = { sunrise: Sunrise, sun: Sun, food: Utensils, flame: Flame, moon: Moon, lock: Lock };
const SERVICE_ICONS = { donate: HandHeart, gold: Coins, article: Package, food: Utensils, receipt: ReceiptText };

const TILE = {
  orange: { bg: "#FDEBDD", fg: "#EA6A0A", btn: "#E8780C" },
  red: { bg: "#FDECEC", fg: "#C62828", btn: "#C62828" },
  amber: { bg: "#FEF3C7", fg: "#D97706", btn: "#E58A0B" },
  purple: { bg: "#F3E8FF", fg: "#9333EA", btn: "#9333EA" },
  blue: { bg: "#E8F0FE", fg: "#2563EB", btn: "#2563EB" },
};
const CHIP = {
  amber: { bg: "#FEF3C7", fg: "#B45309" },
  green: { bg: "#DCFCE7", fg: "#15803D" },
  purple: { bg: "#F3E8FF", fg: "#7E22CE" },
  blue: { bg: "#DBEAFE", fg: "#1D4ED8" },
};

const LABELS = {
  en: {
    status: "Temple Status", next: "Next Aarti", donated: "Total Donated", bookings: "My Bookings",
    open: "Open", closed: "Closed", active: "Active", viewAll: "View All", bookSlot: "Book Slot",
    services: "SERVICES", servicesGu: "(સેવા અને સુવિધાઓ)", quick: "Quick Access",
    schedule: "Today's Aarti & Darshan Schedule", scheduleGu: "(આરતી દર્શન સમયપત્રક)",
    scheduleSub: "Timings as published by the temple", templeOpen: "Temple open", templeClosed: "Temple closed",
    byType: "By service type", none: "No bookings yet", noneSub: "You haven't booked any darshan slots, poojas, or accommodation yet.",
    bookNow: "Book Darshan Now", completed: "Completed", scheduled: "Scheduled", night: "Night Rest",
    upNext: "UPCOMING NEXT", temple: "Temple Time (IST)", darshanOpen: "Darshan Open", darshanClosed: "Darshan Closed",
    live: "Live Active", logout: "Logout",
  },
  gu: {
    status: "મંદિર સ્થિતિ", next: "આગામી આરતી", donated: "કુલ દાન", bookings: "મારા બુકિંગ",
    open: "ખુલ્લું", closed: "બંધ", active: "સક્રિય", viewAll: "બધું જુઓ", bookSlot: "સ્લોટ બુક કરો",
    services: "સેવાઓ", servicesGu: "(Services & Facilities)", quick: "ઝડપી ઍક્સેસ",
    schedule: "આજનું આરતી અને દર્શન સમયપત્રક", scheduleGu: "(Aarti & Darshan)",
    scheduleSub: "મંદિર દ્વારા પ્રસિદ્ધ સમય", templeOpen: "મંદિર ખુલ્લું", templeClosed: "મંદિર બંધ",
    byType: "સેવા પ્રકાર મુજબ", none: "હજી કોઈ બુકિંગ નથી", noneSub: "આપે હજી કોઈ દર્શન સ્લોટ, પૂજા કે રહેઠાણ બુક કર્યું નથી.",
    bookNow: "હમણાં દર્શન બુક કરો", completed: "પૂર્ણ", scheduled: "નિર્ધારિત", night: "રાત્રિ વિશ્રામ",
    upNext: "આગામી", temple: "મંદિર સમય (IST)", darshanOpen: "દર્શન ચાલુ", darshanClosed: "દર્શન બંધ",
    live: "લાઇવ સક્રિય", logout: "લૉગઆઉટ",
  },
};

const INACTIVE = ["COMPLETED", "CANCELLED", "REJECTED"];
const rupee = (n) => `\u20B9 ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const toGrams = (w, unit) => {
  const v = Number(w) || 0;
  return /^kg|kilo/i.test(String(unit || "")) ? v * 1000 : v;
};
const awayText = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `In ${h} hr ${m} min` : `In ${m} min`;
};
const prettyStatus = (s) => String(s || "").replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

/* ---------- small building blocks ---------- */
const Card = ({ children, className = "", style }) => (
  <div className={`rounded-2xl border border-[#EFE8DF] bg-white shadow-[0_1px_3px_rgba(60,40,20,0.06)] ${className}`} style={style}>
    {children}
  </div>
);

const IconTile = ({ tone, size = "h-11 w-11", children }) => (
  <span className={`flex ${size} shrink-0 items-center justify-center rounded-xl`} style={{ background: TILE[tone].bg, color: TILE[tone].fg }}>
    {children}
  </span>
);

const Chip = ({ tone, children }) => (
  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none" style={{ background: CHIP[tone].bg, color: CHIP[tone].fg }}>
    {children}
  </span>
);

/* ---------- Main ---------- */
const DevoteeDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const clock = useTempleClock();

  const [lang, setLang] = useState(() => localStorage.getItem("devotee_lang") || "en");
  const [donations, setDonations] = useState([]);
  const [articles, setArticles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const L = LABELS[lang] || LABELS.en;

  const displayName = user?.name || user?.username || "Devotee";
  const email = user?.email || "";

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("devotee_lang", l);
  };

  /* ---- live data (each call is independent; one failing never blanks the page) ---- */
  useEffect(() => {
    let alive = true;
    const base = import.meta.env.VITE_API_URL;
    const headers = { Authorization: `Bearer ${localStorage.getItem("auth_token")}` };
    (async () => {
      const [don, art, bk] = await Promise.allSettled([
        DonationApi.getPortalDonations(),
        ArticleDonationApi.getMyDonations(),
        axios.get(`${base}/portal/seva/bookings`, { headers }),
      ]);
      if (!alive) return;
      if (don.status === "fulfilled") setDonations(don.value?.data || []);
      if (art.status === "fulfilled") setArticles(art.value?.data || []);
      if (bk.status === "fulfilled") setBookings(bk.value?.data?.data?.data || []);
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  /* ---- derived values ---- */
  const open = isTempleOpen(clock.minutes);
  const next = getNextAarti(clock.minutes);
  const sandhya = TIMINGS.find((t) => t.id === "sandhya") || TIMINGS.find((t) => t.aarti);

  const current = useMemo(() => {
    const started = TIMINGS.filter((t) => t.id !== "close" && toMinutes(t.time) <= clock.minutes);
    return started.length ? started[started.length - 1] : null;
  }, [clock.minutes]);

  const totalDonated = donations.reduce((s, r) => s + Number(r.purchase_price || 0), 0);
  const bullionGrams = donations.reduce((s, r) => s + toGrams(r.weight, r.unit?.unit_name), 0);
  const activeBookings = bookings.filter((b) => !INACTIVE.includes(String(b.status)));
  const pendingTokens = bookings.filter((b) => b.status === "PENDING_PAYMENT" || b.status === "QUERY_RAISED").length;

  const bookingsByService = useMemo(() => {
    const map = new Map();
    activeBookings.forEach((b) => {
      const name = b.service?.name || "Seva";
      map.set(name, (map.get(name) || 0) + 1);
    });
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [activeBookings]);

  const clockParts = /^(\d+):(\d+):(\d+)\s*(am|pm)$/i.exec(clock.display || "") || [];
  const clockMain = clockParts.length ? `${clockParts[1].padStart(2, "0")}:${clockParts[2]}:${clockParts[3]}` : clock.display;
  const clockAp = clockParts[4] ? clockParts[4].toUpperCase() : "";

  const dateTag = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  });
  const hour = Math.floor(clock.minutes / 60);
  const greetEn = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetGu = hour < 12 ? "સુપ્રભાત" : hour < 17 ? "શુભ બપોર" : "શુભ સંધ્યા";

  const serviceFoot = (s) => {
    if (s.id === "receipts" && donations.length) return `${donations.length} donation${donations.length > 1 ? "s" : ""} recorded`;
    if (s.id === "article" && articles.length) return `${articles.length} offering${articles.length > 1 ? "s" : ""} made`;
    return s.foot;
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-gray-800">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-30 border-b border-[#EFE8DF] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <button onClick={() => navigate("/")} className="flex min-w-0 items-center gap-3 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#F5B800] bg-white shadow-sm">
              <img src="/ambajilogo.png" alt="Ambaji Temple" className="h-8 w-8 object-contain" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-[15px] font-bold leading-tight text-gray-900">{TEMPLE_NAME}</span>
                <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">{DEVOTEE_PORTAL.badge}</span>
              </span>
              <span className="block truncate text-[11px] leading-tight text-[#B71C1C]">
                {DEVOTEE_PORTAL.subtitleGu} <span className="text-gray-400">|</span> <span className="text-gray-500">{DEVOTEE_PORTAL.subtitleEn}</span>
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* language toggle */}
            <div className="flex overflow-hidden rounded-md border border-[#E8DCCB] text-[11px] font-bold">
              {[["gu", "ગુજ"], ["en", "ENG"]].map(([k, t]) => (
                <button
                  key={k}
                  onClick={() => changeLang(k)}
                  className={`px-2.5 py-1.5 transition-colors ${lang === k ? "bg-[#E8780C] text-white" : "bg-white text-gray-600 hover:bg-[#FFF4E8]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            {/* <button
              onClick={() => navigate("/seva-portal")}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {pendingTokens > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E53935] ring-2 ring-white" />}
            </button> */}
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-semibold leading-tight text-gray-900">{displayName}</p>
              {email && <p className="text-[11px] leading-tight text-gray-500">{email}</p>}
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C62828] text-sm font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <button
              onClick={onLogout}
              title={L.logout}
              aria-label={L.logout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F3C9C9] text-[#C62828] hover:bg-[#FDECEC]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-full space-y-6 px-4 py-6 sm:px-6">
        {/* ============ HERO ============ */}
        <section
          className="relative overflow-hidden rounded-2xl px-6 py-7 text-white shadow-lg shadow-[#B71C1C]/20 sm:px-8"
          style={{ background: "linear-gradient(110deg,#F97316 0%,#DC2626 55%,#A71515 100%)" }}
        >
          <svg className="pointer-events-none absolute -right-10 top-1/2 h-[340px] w-[340px] -translate-y-1/2 opacity-25" viewBox="0 0 200 200" fill="none" stroke="#fff" strokeWidth="0.6" aria-hidden="true">
            {[95, 78, 62, 46, 30].map((r) => <circle key={r} cx="100" cy="100" r={r} />)}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI) / 6;
              return <line key={i} x1="100" y1="100" x2={100 + 95 * Math.cos(a)} y2={100 + 95 * Math.sin(a)} />;
            })}
          </svg>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                <CalendarDays className="h-3.5 w-3.5" /> {dateTag}
                <span className="inline-flex items-center gap-1 text-[#BBF7D0] normal-case tracking-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> શુભ દિવસ
                </span>
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                જય માતાજી, <span className="text-[#FFD54F]">{displayName}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90">
                {greetEn}! Welcome to Shree Ambaji Mata Temple Devotee Portal. મા અંબાના આશીર્વાદ આપ અને આપના પરિવાર પર સદા રહે.
              </p>
              <p className="mt-0.5 text-xs text-white/70">{greetGu}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/90">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#FFD54F]" /> {DEVOTEE_PORTAL.location}</span>
                <span className="inline-flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-[#FFD54F]" /> {DEVOTEE_PORTAL.liveDarshan}</span>
                {sandhya && (
                  <span className="inline-flex items-center gap-1.5"><Bell className="h-3.5 w-3.5 text-[#FFD54F]" /> Evening Aarti: {format12(sandhya.time)}</span>
                )}
              </div>
            </div>

            <div className="shrink-0 rounded-xl border border-white/25 bg-white/10 px-6 py-4 backdrop-blur-sm">
              <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-[#FFD54F]">{L.temple}</p>
              <p className="mt-1 text-center font-mono text-3xl font-bold tabular-nums">
                {clockMain} <span className="font-sans text-sm font-semibold">{clockAp}</span>
              </p>
              <div className="mt-3 flex items-center justify-between gap-6 border-t border-white/20 pt-2 text-[11px]">
                <span className="text-white/80">{open ? L.darshanOpen : L.darshanClosed}</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#86EFAC]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> {L.live}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STAT CARDS ============ */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{L.status}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{open ? L.open : L.closed}</p>
                <p className="mt-1 text-[11px] text-gray-500">Darshan {format12(OPEN_TIME)} {"\u2013"} {format12(CLOSE_TIME)}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: open ? "#DCFCE7" : "#EEF1F5", color: open ? "#15803D" : "#475569" }}>
                <Landmark className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 inline-flex w-full items-center gap-1.5 rounded-md bg-[#ECFDF5] px-2.5 py-1.5 text-[11px] text-[#047857]">
              <Users className="h-3.5 w-3.5" /> Crowd Flow: <b>{DEVOTEE_PORTAL.crowdFlow}</b>
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{L.next}</p>
                <p className="mt-2 text-2xl font-bold text-[#DC2626]">{format12(next.item.time)}</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {next.item.title} {"\u2022"} {awayText(next.minsAway).toLowerCase()}{next.tomorrow ? " (tomorrow)" : ""}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDECEC] text-[#DC2626]">
                <Flame className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">
                {open && current ? `${current.title} in progress` : `Reopens ${format12(OPEN_TIME)}`}
              </span>
              <button
                onClick={() => document.getElementById("aarti-schedule")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="font-semibold text-[#DC2626] hover:underline"
              >
                {L.viewAll}
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{L.donated}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{loaded ? rupee(totalDonated) : "\u2014"}</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Bullion: {bullionGrams.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} g
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706]">
                <IndianRupee className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 inline-flex w-full items-center gap-1.5 rounded-md bg-[#FFFBEB] px-2.5 py-1.5 text-[11px] text-[#B45309]">
              <Award className="h-3.5 w-3.5" /> Gold/Diamond ledger recorded
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{L.bookings}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{loaded ? activeBookings.length : "\u2014"} {L.active}</p>
                <p className="mt-1 text-[11px] text-gray-500">Puja, darshan & more</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#2563EB]">
                <CalendarDays className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">{pendingTokens ? `${pendingTokens} pending token${pendingTokens > 1 ? "s" : ""}` : "No pending tokens"}</span>
              <button onClick={() => navigate("/seva-portal")} className="font-semibold text-[#2563EB] hover:underline">{L.bookSlot} {"\u2192"}</button>
            </div>
          </Card>
        </section>

        {/* ============ SERVICES ============ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wide text-gray-800">
              <span className="text-base">{"\uD83D\uDE4F"}</span> {L.services}
              <span className="text-xs font-medium text-[#B71C1C]">{L.servicesGu}</span>
            </h2>
            <span className="text-[11px] text-gray-500">{L.quick}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DEVOTEE_SERVICES.map((s) => {
              const Icon = SERVICE_ICONS[s.icon];
              const tone = TILE[s.tone];
              return (
                <Card key={s.id} className="flex flex-col p-5">
                  <div className="flex items-start gap-3">
                    <IconTile tone={s.tone}>{Icon ? <Icon className="h-5 w-5" /> : <span className="text-lg">{"\uD83D\uDE4F"}</span>}</IconTile>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{s.title}</p>
                        {s.tag && <Chip tone={s.tag.tone}>{s.tag.text}</Chip>}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{s.text}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="text-[11px] text-gray-400">{serviceFoot(s)}</span>
                    <button
                      onClick={() => navigate(s.to)}
                      className="rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90"
                      style={s.soft
                        ? { background: "#FFFBEB", color: "#1F2937", border: "1px solid #F3E2A9" }
                        : { background: tone.btn, color: "#fff" }}
                    >
                      {s.cta} {"\u2192"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ============ SCHEDULE + BOOKINGS ============ */}
        <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div id="aarti-schedule" className="scroll-mt-24">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Bell className="h-4 w-4 text-[#E8780C]" /> {L.schedule}
                  </h2>
                  <p className="mt-1 text-[11px] text-gray-500">{L.scheduleSub} {L.scheduleGu}</p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: open ? "#DCFCE7" : "#EEF1F5", color: open ? "#15803D" : "#475569" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: open ? "#22C55E" : "#94A3B8" }} />
                  {open ? L.templeOpen : L.templeClosed}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-transparent border-t border-[#EFE8DF] pt-3">
                {TIMINGS.map((t) => {
                  const Icon = ICONS[t.icon] || Clock;
                  const isClose = t.id === "close";
                  const done = !isClose && toMinutes(t.time) <= clock.minutes;
                  const isNext = !next.tomorrow && next.item.id === t.id;
                  const statusText = isClose ? L.night : isNext ? awayText(next.minsAway) : done ? L.completed : L.scheduled;
                  const statusColor = isNext ? "#DC2626" : isClose ? "#9CA3AF" : done ? "#9CA3AF" : "#D97706";
                  return (
                    <li key={t.id} className="py-1">
                      <div
                        className={`relative flex items-center justify-between gap-3 rounded-xl px-3 py-3 ${isNext ? "mt-3 border border-[#E8B4B4] bg-white shadow-sm" : isClose ? "bg-[#F7F4EF]" : ""}`}
                      >
                        {isNext && (
                          <span className="absolute -top-2.5 left-4 rounded bg-[#C62828] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
                            {L.upNext}
                          </span>
                        )}
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                            style={isNext
                              ? { background: "#C62828", color: "#fff" }
                              : isClose || done
                                ? { background: "#F1EFEC", color: "#6B7280" }
                                : { background: "#FFF7E0", color: "#D97706", border: "1px solid #F5E3A8" }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className={`text-[13px] font-semibold ${isNext ? "text-gray-900" : "text-gray-800"}`}>{t.title}</p>
                            <p className="truncate text-[11px]" style={{ color: isNext ? "#C62828" : "#6B7280" }}>{t.note}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-[13px] font-bold tabular-nums ${isNext ? "text-[#DC2626]" : "text-gray-800"}`}>{format12(t.time)}</p>
                          <p className="text-[10px]" style={{ color: statusColor }}>{statusText}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">{L.bookings}</h2>
              <span className="text-[11px] text-gray-400">{L.byType}</span>
            </div>

            {bookingsByService.length === 0 ? (
              <div className="flex flex-col items-center px-2 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4E8] text-[#E8780C]">
                  <CalendarX className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-gray-900">{L.none}</p>
                <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-gray-400">{L.noneSub}</p>
                <button
                  onClick={() => navigate("/seva-portal")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#C62828] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#B71C1C]"
                >
                  <Plus className="h-3.5 w-3.5" /> {L.bookNow}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {bookingsByService.map((g) => (
                  <div key={g.name}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="truncate font-medium text-gray-800">{g.name}</span>
                      <span className="ml-3 shrink-0 font-bold text-[#C62828]">{g.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-[#F3EEE8]">
                      <div className="h-1.5 rounded-full bg-[#E8780C]" style={{ width: `${(g.count / activeBookings.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <div className="space-y-2 border-t border-[#EFE8DF] pt-4">
                  {activeBookings.slice(0, 3).map((b) => (
                    <div key={b.booking_id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate text-gray-600">{b.service?.name} {b.perform_date ? `\u2022 ${b.perform_date}` : ""}</span>
                      <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2 py-0.5 font-semibold text-[#B45309]">{prettyStatus(b.status)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/seva-portal")} className="text-xs font-semibold text-[#C62828] hover:underline">
                  {L.viewAll} {"\u2192"}
                </button>
              </div>
            )}
          </Card>
        </section>

        {/* ============ BLESSING ============ */}
        <section className="rounded-2xl border border-[#F3E2A9] bg-[#FFF8E1] px-6 py-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FDE9B8] text-lg">{"\uD83D\uDE4F"}</span>
          <h3 className="mt-3 text-lg font-bold text-gray-900">શ્રી અંબાજી માતાજી મંદિર</h3>
          <p className="mx-auto mt-1.5 max-w-2xl text-[13px] leading-relaxed text-gray-700">
            આપનું હૃદયથી સ્વાગત છે. માતાજી પર પ્રેમ, શ્રધ્ધા અને સેવા જ આપણું ધ્યેય છે.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C62828]">
            <ShieldCheck className="h-3.5 w-3.5" /> {DEVOTEE_PORTAL.managementLine}
          </p>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="mt-4 border-t border-[#EFE8DF] bg-white">
        <div className="mx-auto grid max-w-full gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/ambajilogo.png" alt="" className="h-6 w-6 object-contain" />
              <span className="text-sm font-semibold text-gray-900">{TEMPLE_NAME}</span>
            </div>
            <p className="mt-3 max-w-[260px] text-[11px] leading-relaxed text-gray-500">{DEVOTEE_FOOTER.about}</p>
          </div>

          {DEVOTEE_FOOTER.columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">{col.title}</h4>
              <ul className="mt-3 space-y-2 text-[11px] text-gray-500">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? <button onClick={() => navigate(l.to)} className="hover:text-[#C62828]">{l.label}</button> : l.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">{DEVOTEE_FOOTER.emergency.title}</h4>
            <div className="mt-3 space-y-1.5 text-[11px] text-gray-500">
              <p>{DEVOTEE_FOOTER.emergency.helpdesk}</p>
              <p className="text-xs font-bold text-gray-900">{DEVOTEE_FOOTER.emergency.phones}</p>
              <p>Email: {DEVOTEE_FOOTER.emergency.email}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EFE8DF]">
          <div className="flex w-full flex-col gap-2 px-4 py-4 text-[11px] text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between">
            <p>{"\u00A9"} {new Date().getFullYear()} {DEVOTEE_PORTAL.trustName}. All Rights Reserved.</p>
            <p className="flex flex-wrap items-center gap-x-2">
              {DEVOTEE_FOOTER.legal.map((x, i) => (
                <span key={x}>{i > 0 && <span className="mr-2">{"\u2022"}</span>}{x}</span>
              ))}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DevoteeDashboard;

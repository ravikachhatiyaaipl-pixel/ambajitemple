// /***
//  *  I3EMS - AMT ERP | Devotee Dashboard
//  *  Live temple status + aarti schedule come from the landing-page data (landingdata.js).
//  *  Donation / booking charts are fed by an OPTIONAL endpoint (DEVOTEE_SUMMARY_ENDPOINT).
//  *  Expected response:  { success: true, data: {
//  *     totalDonated: 0, donationCount: 0, bookingCount: 0,
//  *     donationTrend: [{ label: "Jan", value: 0 }],
//  *     bookingsByType: [{ label: "Puja", value: 0 }],
//  *     upcoming: [{ title: "Puja Booking", meta: "12 Nov, 7:00 AM", status: "Confirmed" }],
//  *     recent: [{ title: "Gold Donation", meta: "03 Oct 2026", value: "₹ 1,100" }] } }
//  *  If the endpoint is missing the sections show friendly empty states.
//  */
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   User, Mail, Phone, LogOut, Heart, Clock, Flame, Sun, Sunrise, Moon, Utensils, Lock,
//   IndianRupee, CalendarCheck, ReceiptText, ShieldCheck, MapPin, Sparkles,
// } from "lucide-react";
// import {
//   PortalPage, HeroBanner, StatCard, StatGrid, Panel, TrendChart, DonutChart, EmptyState,
//   Badge, greeting, todayLabel, CREAM,
// } from "../components/dashboard/portalkit";
// import { inrShort } from "../components/dashboard/dashboardkit";
// import useTempleClock from "./landing/usetempleclock";
// import {
//   TIMINGS, SERVICES, CONTACT, OPEN_TIME, CLOSE_TIME,
//   toMinutes, format12, isTempleOpen, getNextAarti, formatAway,
// } from "./landing/landingdata";

// const DEVOTEE_SUMMARY_ENDPOINT = "/devotee/summary";

// const ICONS = { sunrise: Sunrise, sun: Sun, food: Utensils, flame: Flame, moon: Moon, lock: Lock };

// const DevoteeDashboard = ({ user, onLogout }) => {
//   const navigate = useNavigate();
//   const clock = useTempleClock();
//   const [summary, setSummary] = useState(null);

//   const displayName = user?.name || user?.username || "Devotee";
//   const email = user?.email || "";
//   const mobile = user?.apiUserData?.Usr_Mobile || "";

//   useEffect(() => {
//     let alive = true;
//     axios
//       .get(`${import.meta.env.VITE_API_URL}${DEVOTEE_SUMMARY_ENDPOINT}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
//       })
//       .then((r) => { if (alive && r.data?.success) setSummary(r.data.data); })
//       .catch(() => { });
//     return () => { alive = false; };
//   }, []);

//   const open = isTempleOpen(clock.minutes);
//   const next = getNextAarti(clock.minutes);
//   const upcoming = summary?.upcoming || [];
//   const recent = summary?.recent || [];

//   return (
//     <div className="min-h-screen" style={{ background: CREAM }}>
//       {/* Top bar */}
//       <header className="sticky top-0 z-20 border-b border-red-100 bg-white/95 backdrop-blur">
//         <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3 sm:px-6">
//           <div className="flex items-center gap-3">
//             <img src="/ambajilogo.png" alt="Ambaji Temple" className="h-10 w-10 object-contain" />
//             <div>
//               <p className="text-sm font-bold leading-tight text-gray-900">Ambaji Temple</p>
//               <p className="text-[11px] leading-tight text-gray-500">Devotee Portal</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="hidden text-right sm:block">
//               <p className="text-sm font-medium text-gray-900">{displayName}</p>
//               {email && <p className="text-xs text-gray-500">{email}</p>}
//             </div>
//             <button
//               onClick={() => navigate("/seva-portal")}
//               className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
//             >
//               <Sparkles className="h-4 w-4" /> Pooja Services
//             </button>
//             <button onClick={onLogout}
//               className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
//               <LogOut className="h-4 w-4" /> Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <PortalPage>
//         <HeroBanner
//           eyebrow={todayLabel()}
//           title={`જય માતાજી, ${displayName}`}
//           subtitle={`${greeting()}! Welcome to Shree Ambaji Mata Temple`}
//           actions={
//             <div className="rounded-xl bg-white/15 px-4 py-2 text-right border border-white/30">
//               <p className="text-[11px] uppercase tracking-wide text-white/80">Temple time (IST)</p>
//               <p className="text-xl font-bold tabular-nums">{clock.display}</p>
//             </div>
//           }
//         />

//         <StatGrid cols={4}>
//           <StatCard label="Temple Status" value={open ? "Open" : "Closed"} sub={`Darshan ${format12(OPEN_TIME)} – ${format12(CLOSE_TIME)}`}
//             icon={open ? Sun : Moon} tone={open ? "green" : "slate"} />
//           <StatCard label="Next Aarti" value={format12(next.item.time)} sub={`${next.item.title} · ${formatAway(next.minsAway)}${next.tomorrow ? " (tomorrow)" : ""}`}
//             icon={Flame} tone="red" />
//           <StatCard label="Total Donated" value={summary ? inrShort(summary.totalDonated) : "—"} sub={summary ? `${summary.donationCount ?? 0} contributions` : "Your giving history"}
//             icon={IndianRupee} tone="gold" />
//           <StatCard label="My Bookings" value={summary ? summary.bookingCount ?? 0 : "—"} sub="Puja, darshan & more" icon={CalendarCheck} tone="teal" />
//         </StatGrid>

//         {/* Schedule + profile */}
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//           <Panel title="Today's Aarti & Darshan Schedule" subtitle="Timings as published by the temple" className="lg:col-span-2"
//             action={<Badge kind={open ? "success" : "neutral"}>{open ? "Temple open" : "Temple closed"}</Badge>}>
//             <ol className="relative space-y-3 border-l-2 border-red-100 pl-5">
//               {TIMINGS.map((t) => {
//                 const Icon = ICONS[t.icon] || Clock;
//                 const done = toMinutes(t.time) <= clock.minutes;
//                 const isNext = !next.tomorrow && next.item.id === t.id;
//                 return (
//                   <li key={t.id} className="relative">
//                     <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white"
//                       style={{ borderColor: isNext ? "#E53935" : done ? "#D1D5DB" : "#FCA5A5" }}>
//                       <Icon className="h-3 w-3" style={{ color: isNext ? "#E53935" : done ? "#9CA3AF" : "#F87171" }} />
//                     </span>
//                     <div className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 ${isNext ? "ring-1 ring-red-300" : ""}`}
//                       style={{ background: isNext ? "#FDECEC" : CREAM }}>
//                       <div className="min-w-0">
//                         <p className={`text-sm font-semibold ${done ? "text-gray-400" : "text-gray-900"}`}>{t.title}</p>
//                         <p className="truncate text-xs text-gray-500">{t.note}</p>
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         {isNext && <Badge kind="danger">Next</Badge>}
//                         <span className={`text-sm font-bold tabular-nums ${done ? "text-gray-400" : "text-red-700"}`}>{format12(t.time)}</span>
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ol>
//           </Panel>

//           <Panel title="My Profile">
//             <div className="flex items-center gap-3">
//               <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
//                 style={{ background: "linear-gradient(135deg,#E53935,#B71C1C)" }}>
//                 {displayName.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <p className="font-semibold text-gray-900">{displayName}</p>
//                 <Badge kind="danger"><Heart className="h-3 w-3" /> ભક્ત (Devotee)</Badge>
//               </div>
//             </div>
//             <dl className="mt-5 space-y-3 text-sm">
//               {[
//                 { icon: User, label: "Username", value: displayName },
//                 { icon: Mail, label: "Email", value: email },
//                 { icon: Phone, label: "Mobile", value: mobile },
//                 { icon: MapPin, label: "Temple", value: CONTACT.address },
//               ].filter((r) => r.value).map((r) => (
//                 <div key={r.label} className="flex items-start gap-3">
//                   <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
//                   <div className="min-w-0">
//                     <dt className="text-[11px] uppercase tracking-wide text-gray-400">{r.label}</dt>
//                     <dd className="break-words font-medium text-gray-800">{r.value}</dd>
//                   </div>
//                 </div>
//               ))}
//             </dl>
//           </Panel>
//         </div>

//         {/* Activity charts */}
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//           <Panel title="My Donations" subtitle="Month-wise contribution" className="lg:col-span-2">
//             {summary?.donationTrend?.length ? (
//               <TrendChart data={summary.donationTrend} series={[{ key: "value", name: "Donation", color: "#B71C1C" }]} />
//             ) : (
//               <EmptyState icon={IndianRupee} text="Your donations will appear here once you contribute" />
//             )}
//           </Panel>
//           <Panel title="My Bookings" subtitle="By service type">
//             {summary?.bookingsByType?.length ? (
//               <DonutChart data={summary.bookingsByType} centerValue={summary.bookingCount ?? 0} centerLabel="bookings" />
//             ) : (
//               <EmptyState icon={CalendarCheck} text="No bookings yet" />
//             )}
//           </Panel>
//         </div>

//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//           <Panel title="Upcoming Bookings">
//             {upcoming.length === 0 ? (
//               <EmptyState icon={CalendarCheck} text="No upcoming bookings" height={140} />
//             ) : (
//               <div className="divide-y divide-gray-100">
//                 {upcoming.map((u, i) => (
//                   <div key={i} className="flex items-center justify-between py-2.5">
//                     <div><p className="text-sm font-medium text-gray-900">{u.title}</p><p className="text-xs text-gray-500">{u.meta}</p></div>
//                     {u.status && <Badge kind="success">{u.status}</Badge>}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Panel>
//           <Panel title="Recent Contributions">
//             {recent.length === 0 ? (
//               <EmptyState icon={ReceiptText} text="No contributions yet" height={140} />
//             ) : (
//               <div className="divide-y divide-gray-100">
//                 {recent.map((r, i) => (
//                   <div key={i} className="flex items-center justify-between py-2.5">
//                     <div><p className="text-sm font-medium text-gray-900">{r.title}</p><p className="text-xs text-gray-500">{r.meta}</p></div>
//                     <span className="text-sm font-semibold text-gray-800">{r.value}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Panel>
//         </div>

//         {/* Services */}
//         <Panel title="Temple Services" subtitle="Seva and facilities offered by the temple">
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {SERVICES.map((s) => (
//               <div key={s.title} className="rounded-xl border border-gray-100 p-4" style={{ background: CREAM }}>
//                 <div className="flex items-center justify-between gap-2">
//                   <p className="text-sm font-semibold text-gray-900">{s.title}</p>
//                   {s.badge && <Badge kind="warning">{s.badge}</Badge>}
//                 </div>
//                 <p className="mt-1 text-xs leading-relaxed text-gray-600">{s.text}</p>
//               </div>
//             ))}
//           </div>
//         </Panel>

//         {/* Blessing */}
//         <div className="rounded-2xl border border-red-100 p-6 text-center" style={{ background: "linear-gradient(135deg,#ffffff,#FFF4E8)" }}>
//           <Sparkles className="mx-auto h-6 w-6 text-amber-500" />
//           <h3 className="mt-2 text-lg font-semibold text-gray-900">શ્રી અંબાજી માતાજી મંદિર</h3>
//           <p className="mx-auto mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
//             આપનું હૃદયથી સ્વાગત છે. માતાજી પર પ્રેમ, શ્રધ્ધા અને સેવા જ આપણું ધ્યેય છે.
//           </p>
//           <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
//             <ShieldCheck className="h-3.5 w-3.5" /> Ambaji Temple Management
//           </p>
//         </div>
//       </PortalPage>
//     </div>
//   );
// };

// export default DevoteeDashboard;

/***
 *  I3EMS - AMT ERP | Devotee Dashboard (Refined UI v2)
 *  Single file · Responsive · Multi-service header navigation
 *  Live temple status + aarti schedule from landingdata.js
 *  Donation / booking charts from optional endpoint.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Mail, Phone, LogOut, Heart, Clock, Flame, Sun, Sunrise, Moon, Utensils, Lock,
  IndianRupee, CalendarCheck, ReceiptText, ShieldCheck, MapPin, Sparkles, ChevronDown,
  ChevronRight, Menu, X, LayoutDashboard, Gift, BookOpen, Camera, Home, Bell,
} from "lucide-react";
import {
  PortalPage, HeroBanner, StatCard, StatGrid, Panel, TrendChart, DonutChart, EmptyState,
  Badge, greeting, todayLabel, CREAM,
} from "../components/dashboard/portalkit";
import { inrShort } from "../components/dashboard/dashboardkit";
import useTempleClock from "./landing/usetempleclock";
import {
  TIMINGS, SERVICES, CONTACT, OPEN_TIME, CLOSE_TIME,
  toMinutes, format12, isTempleOpen, getNextAarti, formatAway,
} from "./landing/landingdata";

const DEVOTEE_SUMMARY_ENDPOINT = "/devotee/summary";
const ICONS = { sunrise: Sunrise, sun: Sun, food: Utensils, flame: Flame, moon: Moon, lock: Lock };

/* ---------- Navigation config (easy to extend) ---------- */
const NAV_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/devotee-dashboard", active: true },
  {
    label: "Services",
    icon: Gift,
    items: [
      { label: "Pooja Services", icon: Sparkles, to: "/seva-portal", desc: "Book a puja or seva" },
      { label: "Darshan Booking", icon: Camera, to: "/darshan-booking", desc: "Reserve darshan slot" },
      { label: "Donations", icon: Heart, to: "/devotee-donation-entry", desc: "Contribute to the temple" },
      { label: "Article Donation", icon: Gift, to: "/devotee-article-donation-entry", desc: "Donate articles / items" },
      { label: "Prasad & Annadan", icon: Utensils, to: "/prasad", desc: "Order prasad / annadan" },
      { label: "Pilgrimage Stay", icon: Home, to: "/stay", desc: "Dharamshala booking" },
      { label: "Puja Guide", icon: BookOpen, to: "/guide", desc: "Learn rituals & mantras" },
    ],
  },
  { label: "My Bookings", icon: CalendarCheck, to: "/my-bookings" },
  { label: "Donations", icon: IndianRupee, to: "/devotee-donations" },
  { label: "Article Donations", icon: Gift, to: "/devotee-article-donations" },
  { label: "Contact", icon: Phone, to: "/contact" },
];

/* ---------- Reusable nav dropdown ---------- */
const NavDropdown = ({ item, navigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const Icon = item.icon;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          open ? "bg-rose-50 text-rose-700" : "text-gray-700 hover:bg-gray-100 hover:text-rose-700"
        }`}
      >
        <Icon className="h-4 w-4" />
        {item.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60">
          {item.items.map((s) => {
            const SIcon = s.icon;
            return (
              <button
                key={s.label}
                onClick={() => { setOpen(false); navigate(s.to); }}
                className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gradient-to-r hover:from-rose-50 hover:to-amber-50"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100/70 text-amber-700 group-hover:bg-amber-200">
                  <SIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-800">{s.label}</span>
                  <span className="block text-xs text-gray-500">{s.desc}</span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 group-hover:text-rose-500" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---------- Main Dashboard ---------- */
const DevoteeDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const clock = useTempleClock();
  const [summary, setSummary] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const displayName = user?.name || user?.username || "Devotee";
  const email = user?.email || "";
  const mobile = user?.apiUserData?.Usr_Mobile || "";

  useEffect(() => {
    let alive = true;
    axios
      .get(`${import.meta.env.VITE_API_URL}${DEVOTEE_SUMMARY_ENDPOINT}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })
      .then((r) => { if (alive && r.data?.success) setSummary(r.data.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const open = isTempleOpen(clock.minutes);
  const next = getNextAarti(clock.minutes);
  const upcoming = summary?.upcoming || [];
  const recent = summary?.recent || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50/40 to-orange-50">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-30 border-b border-rose-100/70 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Brand */}
          <button onClick={() => navigate("/")} className="flex shrink-0 items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-200/60 blur-md" />
              <img src="/ambajilogo.png" alt="Ambaji Temple" className="relative h-10 w-10 object-contain drop-shadow" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold leading-tight text-rose-900">Ambaji Temple</p>
              <p className="text-[10px] font-semibold leading-tight tracking-widest text-amber-700">DEVOTEE PORTAL</p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((item) =>
              item.items ? (
                <NavDropdown key={item.label} item={item} navigate={navigate} />
              ) : (
                <button
                  key={item.label}
                  onClick={() => navigate(item.to)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.active ? "bg-rose-50 text-rose-700" : "text-gray-700 hover:bg-gray-100 hover:text-rose-700"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="relative hidden rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-rose-600 sm:inline-flex">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold leading-tight text-gray-900">{displayName}</p>
              {email && <p className="text-[11px] leading-tight text-gray-500">{email}</p>}
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:shadow-lg hover:shadow-rose-500/40 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ============ MOBILE NAV ============ */}
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white/95 px-4 py-3 lg:hidden">
            <div className="space-y-1">
              {NAV_LINKS.map((item) =>
                item.items ? (
                  <div key={item.label}>
                    <button
                      onClick={() => setMobileServicesOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <span className="inline-flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-rose-500" />
                        {item.label}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                    </button>
                    {mobileServicesOpen && (
                      <div className="ml-3 mt-1 space-y-1 border-l-2 border-amber-100 pl-3">
                        {item.items.map((s) => (
                          <button
                            key={s.label}
                            onClick={() => { setMobileOpen(false); navigate(s.to); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-amber-50"
                          >
                            <s.icon className="h-4 w-4 text-amber-600" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => { setMobileOpen(false); navigate(item.to); }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      item.active ? "bg-rose-50 text-rose-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4 text-rose-500" />
                    {item.label}
                  </button>
                )
              )}
              <div className="mt-2 border-t border-gray-100 pt-2">
                <button
                  onClick={() => { setMobileOpen(false); onLogout(); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <PortalPage>
        {/* ---- Hero ---- */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-700 via-red-700 to-orange-800 p-6 text-white shadow-xl shadow-rose-900/20 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-rose-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">{todayLabel()}</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">જય માતાજી, {displayName} 🙏</h1>
              <p className="mt-1.5 max-w-xl text-sm text-rose-100/90">
                {greeting()}! Welcome back — your spiritual seva journey continues here.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/seva-portal")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-rose-700 shadow-md transition hover:bg-white active:scale-95"
                >
                  <Sparkles className="h-4 w-4" /> Book a Pooja
                </button>
                <button
                  onClick={() => navigate("/devotee-donation-entry")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
                >
                  <Heart className="h-4 w-4" /> Donate
                </button>
              </div>
            </div>
            <div className="flex flex-col items-start gap-1.5 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 backdrop-blur-md md:items-end">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-200/80">Temple Time (IST)</p>
              <p className="text-2xl font-bold tabular-nums tracking-tight">{clock.display}</p>
              <Badge kind={open ? "success" : "neutral"}>{open ? "● Temple Open" : "● Temple Closed"}</Badge>
            </div>
          </div>
        </div>

        {/* ---- Stats ---- */}
        <StatGrid cols={4}>
          <StatCard label="Temple Status" value={open ? "Open" : "Closed"} sub={`Darshan ${format12(OPEN_TIME)} – ${format12(CLOSE_TIME)}`} icon={open ? Sun : Moon} tone={open ? "green" : "slate"} />
          <StatCard label="Next Aarti" value={format12(next.item.time)} sub={`${next.item.title} · ${formatAway(next.minsAway)}${next.tomorrow ? " (tomorrow)" : ""}`} icon={Flame} tone="red" />
          <StatCard label="Total Donated" value={summary ? inrShort(summary.totalDonated) : "—"} sub={summary ? `${summary.donationCount ?? 0} contributions` : "Your giving history"} icon={IndianRupee} tone="gold" />
          <StatCard label="My Bookings" value={summary ? summary.bookingCount ?? 0 : "—"} sub="Puja, darshan & more" icon={CalendarCheck} tone="teal" />
        </StatGrid>

        {/* ---- Quick Actions ---- */}
        <Panel title="Quick Actions" subtitle="One tap to your most-used services">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Book Pooja", icon: Sparkles, to: "/seva-portal", color: "from-amber-400 to-orange-500" },
              { label: "Darshan", icon: Camera, to: "/darshan-booking", color: "from-rose-400 to-red-500" },
              { label: "Donate", icon: Heart, to: "/devotee-donation-entry", color: "from-pink-400 to-rose-500" },
              { label: "Prasad", icon: Utensils, to: "/prasad", color: "from-emerald-400 to-teal-500" },
              { label: "Stay", icon: Home, to: "/stay", color: "from-sky-400 to-blue-500" },
              { label: "Guide", icon: BookOpen, to: "/guide", color: "from-violet-400 to-purple-500" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        </Panel>

        {/* ---- Schedule + Profile ---- */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel
              title="Today's Aarti & Darshan Schedule"
              subtitle="Timings as published by the temple"
              action={<Badge kind={open ? "success" : "neutral"}>{open ? "Temple open" : "Temple closed"}</Badge>}
            >
              <ol className="relative space-y-2.5 border-l-2 border-rose-200 pl-5">
                {TIMINGS.map((t) => {
                  const Icon = ICONS[t.icon] || Clock;
                  const done = toMinutes(t.time) <= clock.minutes;
                  const isNext = !next.tomorrow && next.item.id === t.id;
                  return (
                    <li key={t.id} className="relative">
                      <span className={`absolute -left-[33px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-all ${isNext ? "scale-110 border-rose-500 ring-4 ring-rose-100" : done ? "border-gray-300" : "border-rose-300"}`}>
                        <Icon className={`h-3.5 w-3.5 ${isNext ? "text-rose-600" : done ? "text-gray-400" : "text-rose-400"}`} />
                      </span>
                      <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all ${isNext ? "border-rose-200 bg-rose-50/70 shadow-sm" : "border-transparent bg-gradient-to-r from-amber-50/50 to-transparent hover:from-amber-50"}`}>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${done ? "text-gray-400" : "text-gray-900"}`}>{t.title}</p>
                          <p className="truncate text-xs text-gray-500">{t.note}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {isNext && <Badge kind="danger">Next</Badge>}
                          <span className={`text-sm font-bold tabular-nums ${done ? "text-gray-400" : "text-rose-700"}`}>{format12(t.time)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          </div>

          <Panel title="My Profile">
            <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 px-4 py-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-300/50 blur-lg" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg ring-4 ring-white" style={{ background: "linear-gradient(135deg,#E53935,#B71C1C)" }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="mt-3 text-base font-bold text-gray-900">{displayName}</p>
              <div className="mt-1.5"><Badge kind="danger"><Heart className="h-3 w-3" /> ભક્ત · Devotee</Badge></div>
            </div>
            <dl className="mt-5 space-y-3">
              {[
                { icon: User, label: "Username", value: displayName },
                { icon: Mail, label: "Email", value: email },
                { icon: Phone, label: "Mobile", value: mobile },
                { icon: MapPin, label: "Temple", value: CONTACT.address },
              ].filter((r) => r.value).map((r) => (
                <div key={r.label} className="flex items-start gap-3 rounded-xl bg-gray-50/70 px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <r.icon className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{r.label}</dt>
                    <dd className="break-words text-[13px] font-medium text-gray-800">{r.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        {/* ---- Charts ---- */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel title="My Donations" subtitle="Month-wise contribution">
              {summary?.donationTrend?.length ? (
                <TrendChart data={summary.donationTrend} series={[{ key: "value", name: "Donation", color: "#B71C1C" }]} />
              ) : (
                <EmptyState icon={IndianRupee} text="Your donations will appear here once you contribute" />
              )}
            </Panel>
          </div>
          <Panel title="My Bookings" subtitle="By service type">
            {summary?.bookingsByType?.length ? (
              <DonutChart data={summary.bookingsByType} centerValue={summary.bookingCount ?? 0} centerLabel="bookings" />
            ) : (
              <EmptyState icon={CalendarCheck} text="No bookings yet" />
            )}
          </Panel>
        </div>

        {/* ---- Activity Lists ---- */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel title="Upcoming Bookings" action={<button onClick={() => navigate("/my-bookings")} className="text-xs font-semibold text-rose-600 hover:text-rose-700">View all →</button>}>
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarCheck} text="No upcoming bookings" height={140} />
            ) : (
              <div className="space-y-2">
                {upcoming.map((u, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/70 px-4 py-3 transition-shadow hover:shadow-sm">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{u.title}</p>
                      <p className="text-xs text-gray-500">{u.meta}</p>
                    </div>
                    {u.status && <Badge kind="success">{u.status}</Badge>}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Recent Contributions" action={<button onClick={() => navigate("/devotee-donations")} className="text-xs font-semibold text-rose-600 hover:text-rose-700">View all →</button>}>
            {recent.length === 0 ? (
              <EmptyState icon={ReceiptText} text="No contributions yet" height={140} />
            ) : (
              <div className="space-y-2">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/70 px-4 py-3 transition-shadow hover:shadow-sm">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.meta}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700">{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* ---- Services ---- */}
        <Panel title="Temple Services" subtitle="Seva and facilities offered by the temple">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="group cursor-default rounded-2xl border border-amber-100/80 bg-gradient-to-br from-white via-amber-50/40 to-rose-50/30 p-4 transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-rose-700">{s.title}</p>
                  {s.badge && <Badge kind="warning">{s.badge}</Badge>}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* ---- Blessing Footer ---- */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-white via-amber-50 to-orange-100 p-8 text-center shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-rose-300/20 blur-3xl" />
          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-rose-900">શ્રી અંબાજી માતાજી મંદિર</h3>
            <p className="mx-auto mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">
              આપનું હૃદયથી સ્વાગત છે. માતાજી પર પ્રેમ, શ્રધ્ધા અને સેવા જ આપણું ધ્યેય છે.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" /> Ambaji Temple Management
            </p>
          </div>
        </div>
      </PortalPage>
    </div>
  );
};

export default DevoteeDashboard;
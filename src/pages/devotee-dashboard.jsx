/***
 *  I3EMS - AMT ERP | Devotee Dashboard
 *  Live temple status + aarti schedule come from the landing-page data (landingdata.js).
 *  Donation / booking charts are fed by an OPTIONAL endpoint (DEVOTEE_SUMMARY_ENDPOINT).
 *  Expected response:  { success: true, data: {
 *     totalDonated: 0, donationCount: 0, bookingCount: 0,
 *     donationTrend: [{ label: "Jan", value: 0 }],
 *     bookingsByType: [{ label: "Puja", value: 0 }],
 *     upcoming: [{ title: "Puja Booking", meta: "12 Nov, 7:00 AM", status: "Confirmed" }],
 *     recent: [{ title: "Gold Donation", meta: "03 Oct 2026", value: "₹ 1,100" }] } }
 *  If the endpoint is missing the sections show friendly empty states.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Mail, Phone, LogOut, Heart, Clock, Flame, Sun, Sunrise, Moon, Utensils, Lock,
  IndianRupee, CalendarCheck, ReceiptText, ShieldCheck, MapPin, Sparkles,
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

const DevoteeDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const clock = useTempleClock();
  const [summary, setSummary] = useState(null);
  const [myDonations, setMyDonations] = useState([]);

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
      .catch(() => { });
    return () => { alive = false; };
  }, []);

  // Apni donation entries (portal API)
  useEffect(() => {
    let alive = true;
    axios
      .get(`${import.meta.env.VITE_API_URL}/portal/donation/entries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })
      .then((r) => { if (alive && r.data?.success) setMyDonations(r.data.data || []); })
      .catch(() => { });
    return () => { alive = false; };
  }, []);

  const open = isTempleOpen(clock.minutes);
  const next = getNextAarti(clock.minutes);
  const upcoming = summary?.upcoming || [];
  const recent = summary?.recent || [];

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-red-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/ambajilogo.png" alt="Ambaji Temple" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900">Ambaji Temple</p>
              <p className="text-[11px] leading-tight text-gray-500">Devotee Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              {email && <p className="text-xs text-gray-500">{email}</p>}
            </div>
            <button
              onClick={() => navigate("/seva-portal")}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              <Sparkles className="h-4 w-4" /> Pooja Services
            </button>
            <button
              onClick={() => navigate("/devotee-donation-entry")}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <IndianRupee className="h-4 w-4" /> Donate
            </button>
            <button
              onClick={() => navigate("/devotee-donations")}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <ReceiptText className="h-4 w-4" /> My Donations
            </button>
            <button onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <PortalPage>
        <HeroBanner
          eyebrow={todayLabel()}
          title={`જય માતાજી, ${displayName}`}
          subtitle={`${greeting()}! Welcome to Shree Ambaji Mata Temple`}
          actions={
            <div className="rounded-xl bg-white/15 px-4 py-2 text-right border border-white/30">
              <p className="text-[11px] uppercase tracking-wide text-white/80">Temple time (IST)</p>
              <p className="text-xl font-bold tabular-nums">{clock.display}</p>
            </div>
          }
        />

        <StatGrid cols={4}>
          <StatCard label="Temple Status" value={open ? "Open" : "Closed"} sub={`Darshan ${format12(OPEN_TIME)} – ${format12(CLOSE_TIME)}`}
            icon={open ? Sun : Moon} tone={open ? "green" : "slate"} />
          <StatCard label="Next Aarti" value={format12(next.item.time)} sub={`${next.item.title} · ${formatAway(next.minsAway)}${next.tomorrow ? " (tomorrow)" : ""}`}
            icon={Flame} tone="red" />
          <StatCard label="Total Donated" value={summary ? inrShort(summary.totalDonated) : "—"} sub={summary ? `${summary.donationCount ?? 0} contributions` : "Your giving history"}
            icon={IndianRupee} tone="gold" />
          <StatCard label="My Bookings" value={summary ? summary.bookingCount ?? 0 : "—"} sub="Puja, darshan & more" icon={CalendarCheck} tone="teal" />
        </StatGrid>

        {/* Schedule + profile */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Today's Aarti & Darshan Schedule" subtitle="Timings as published by the temple" className="lg:col-span-2"
            action={<Badge kind={open ? "success" : "neutral"}>{open ? "Temple open" : "Temple closed"}</Badge>}>
            <ol className="relative space-y-3 border-l-2 border-red-100 pl-5">
              {TIMINGS.map((t) => {
                const Icon = ICONS[t.icon] || Clock;
                const done = toMinutes(t.time) <= clock.minutes;
                const isNext = !next.tomorrow && next.item.id === t.id;
                return (
                  <li key={t.id} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white"
                      style={{ borderColor: isNext ? "#E53935" : done ? "#D1D5DB" : "#FCA5A5" }}>
                      <Icon className="h-3 w-3" style={{ color: isNext ? "#E53935" : done ? "#9CA3AF" : "#F87171" }} />
                    </span>
                    <div className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 ${isNext ? "ring-1 ring-red-300" : ""}`}
                      style={{ background: isNext ? "#FDECEC" : CREAM }}>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${done ? "text-gray-400" : "text-gray-900"}`}>{t.title}</p>
                        <p className="truncate text-xs text-gray-500">{t.note}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isNext && <Badge kind="danger">Next</Badge>}
                        <span className={`text-sm font-bold tabular-nums ${done ? "text-gray-400" : "text-red-700"}`}>{format12(t.time)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="My Profile">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ background: "linear-gradient(135deg,#E53935,#B71C1C)" }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{displayName}</p>
                <Badge kind="danger"><Heart className="h-3 w-3" /> ભક્ત (Devotee)</Badge>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                { icon: User, label: "Username", value: displayName },
                { icon: Mail, label: "Email", value: email },
                { icon: Phone, label: "Mobile", value: mobile },
                { icon: MapPin, label: "Temple", value: CONTACT.address },
              ].filter((r) => r.value).map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wide text-gray-400">{r.label}</dt>
                    <dd className="break-words font-medium text-gray-800">{r.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        {/* Activity charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="My Donations" subtitle="Gold / Silver / Diamond contributions" className="lg:col-span-2"
            action={
              <button
                onClick={() => navigate("/devotee-donations")}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                View all
              </button>
            }>
            {myDonations.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {myDonations.slice(0, 5).map((d) => (
                  <div key={d.transaction_id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {d.category?.category_name || "Donation"} ·{" "}
                        {Number(d.weight_in_gram || 0).toFixed(3)} g
                      </p>
                      <p className="text-xs text-gray-500">
                        {d.receipt_no} ·{" "}
                        {String(d.donation_date).slice(0, 10)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {inrShort(d.valuation_amount || 0)}
                      </p>
                      <p className="text-xs text-gray-500">{d.status_name || d.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : summary?.donationTrend?.length ? (
              <TrendChart data={summary.donationTrend} series={[{ key: "value", name: "Donation", color: "#B71C1C" }]} />
            ) : (
              <EmptyState icon={IndianRupee} text="Your donations will appear here once you contribute" />
            )}
          </Panel>
          <Panel title="My Bookings" subtitle="By service type">
            {summary?.bookingsByType?.length ? (
              <DonutChart data={summary.bookingsByType} centerValue={summary.bookingCount ?? 0} centerLabel="bookings" />
            ) : (
              <EmptyState icon={CalendarCheck} text="No bookings yet" />
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Upcoming Bookings">
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarCheck} text="No upcoming bookings" height={140} />
            ) : (
              <div className="divide-y divide-gray-100">
                {upcoming.map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div><p className="text-sm font-medium text-gray-900">{u.title}</p><p className="text-xs text-gray-500">{u.meta}</p></div>
                    {u.status && <Badge kind="success">{u.status}</Badge>}
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Recent Contributions">
            {recent.length === 0 ? (
              <EmptyState icon={ReceiptText} text="No contributions yet" height={140} />
            ) : (
              <div className="divide-y divide-gray-100">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div><p className="text-sm font-medium text-gray-900">{r.title}</p><p className="text-xs text-gray-500">{r.meta}</p></div>
                    <span className="text-sm font-semibold text-gray-800">{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Services */}
        <Panel title="Temple Services" subtitle="Seva and facilities offered by the temple">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-xl border border-gray-100 p-4" style={{ background: CREAM }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                  {s.badge && <Badge kind="warning">{s.badge}</Badge>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Blessing */}
        <div className="rounded-2xl border border-red-100 p-6 text-center" style={{ background: "linear-gradient(135deg,#ffffff,#FFF4E8)" }}>
          <Sparkles className="mx-auto h-6 w-6 text-amber-500" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">શ્રી અંબાજી માતાજી મંદિર</h3>
          <p className="mx-auto mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            આપનું હૃદયથી સ્વાગત છે. માતાજી પર પ્રેમ, શ્રધ્ધા અને સેવા જ આપણું ધ્યેય છે.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Ambaji Temple Management
          </p>
        </div>
      </PortalPage>
    </div>
  );
};

export default DevoteeDashboard;

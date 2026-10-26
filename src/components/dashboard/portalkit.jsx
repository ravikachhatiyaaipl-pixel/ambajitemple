/***
 *  I3EMS - AMT ERP
 *  Component: PortalKit — shared building blocks for the Admin / Devotee / Applicant dashboards.
 *  Theme: cream (#ffffff) canvas, brand red (#E53935 / #B71C1C), temple gold accents.
 *  NOTE: blue/indigo/violet/purple/sky Tailwind classes are remapped to red in index.css,
 *        so tones here use explicit hex values.
 */
import React from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { inrShort } from "./dashboardkit";

export const CREAM = "#ffffff";
export const CHART_COLORS = [
  "#B71C1C", "#F5B800", "#059669", "#E53935", "#0891b2", "#7c3aed", "#d97706", "#64748b",
];

export const TONES = {
  red: { fg: "#B71C1C", bg: "#FDECEC", grad: "linear-gradient(135deg,#E53935,#B71C1C)" },
  gold: { fg: "#B45309", bg: "#FEF6D8", grad: "linear-gradient(135deg,#F5B800,#D97706)" },
  green: { fg: "#047857", bg: "#E6F8F0", grad: "linear-gradient(135deg,#10B981,#047857)" },
  teal: { fg: "#0E7490", bg: "#E3F6F9", grad: "linear-gradient(135deg,#06B6D4,#0E7490)" },
  violet: { fg: "#6D28D9", bg: "#F0EAFE", grad: "linear-gradient(135deg,#8B5CF6,#6D28D9)" },
  slate: { fg: "#334155", bg: "#EEF1F5", grad: "linear-gradient(135deg,#64748B,#334155)" },
};

export const greeting = () => {
  const h = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(new Date())
  ) % 24;
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  });

/* ------------------------------- Page shell ------------------------------ */
export const PortalPage = ({ children, narrow = false }) => (
  <div className="min-h-screen" style={{ background: CREAM }}>
    <div className={`${narrow ? "max-w-6xl" : "max-w-7xl"} mx-auto px-4 sm:px-6 py-6 space-y-6`}>
      {children}
    </div>
  </div>
);

export const PortalLoader = ({ text = "Loading dashboard..." }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto" />
      <p className="mt-3 text-sm text-gray-500">{text}</p>
    </div>
  </div>
);

/* ------------------------------- Hero banner ----------------------------- */
export const HeroBanner = ({ eyebrow, title, subtitle, actions, children }) => (
  <div
    className="relative overflow-hidden rounded-2xl px-6 py-6 sm:px-8 sm:py-7 text-white shadow-md"
    style={{ background: "linear-gradient(120deg,#B71C1C 0%,#E53935 55%,#F5B800 140%)" }}
  >
    <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10" />
    <div className="pointer-events-none absolute right-24 -bottom-16 h-40 w-40 rounded-full bg-white/10" />
    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/85">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {children && <div className="relative mt-5">{children}</div>}
  </div>
);

export const HeroButton = ({ onClick, icon: Icon, children, solid = false }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${solid ? "bg-white text-red-700 hover:bg-red-50" : "bg-white/15 text-white hover:bg-white/25 border border-white/30"
      }`}
  >
    {Icon && <Icon className="h-4 w-4" />}
    {children}
  </button>
);

/* -------------------------------- Stat card ------------------------------ */
export const StatCard = ({ label, value, sub, icon: Icon, tone = "red", to }) => {
  const t = TONES[tone] || TONES.red;
  const body = (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 truncate">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: t.grad }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
};

export const StatGrid = ({ children, cols = 4 }) => {
  // Use only as many columns as there are cards, so a hidden card never leaves an empty slot.
  const count = React.Children.toArray(children).length;
  const n = Math.min(cols, Math.max(count, 1));
  const lg = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" };
  const sm = count > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1";
  return <div className={`grid grid-cols-1 ${sm} ${lg[n]} gap-4`}>{children}</div>;
};

/* --------------------------------- Panel --------------------------------- */
export const Panel = ({ title, subtitle, action, children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
    {(title || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

export const EmptyState = ({ icon: Icon, text = "No data available yet", height = 220 }) => (
  <div className="flex flex-col items-center justify-center text-center text-gray-400" style={{ minHeight: height }}>
    {Icon && <Icon className="h-9 w-9 text-gray-300" />}
    <p className="mt-2 text-sm">{text}</p>
  </div>
);

/* --------------------------------- Charts -------------------------------- */
const hasData = (d) => Array.isArray(d) && d.length > 0;

export const TrendChart = ({ data, xKey = "label", series, height = 250, money = true }) => {
  if (!hasData(data)) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`pk-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color || CHART_COLORS[i]} stopOpacity={0.35} />
              <stop offset="95%" stopColor={s.color || CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={money ? 70 : 40}
          tickFormatter={(v) => (money ? inrShort(v) : v)} />
        <Tooltip formatter={(v) => (money ? inrShort(v) : v)} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key}
            stroke={s.color || CHART_COLORS[i]} fill={`url(#pk-${s.key})`} strokeWidth={2.5} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const BarsChart = ({ data, xKey = "label", bars, height = 250, money = false, horizontal = false }) => {
  if (!hasData(data)) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 12, left: horizontal ? 24 : 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
              tickFormatter={(v) => (money ? inrShort(v) : v)} />
            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={money ? 70 : 36}
              tickFormatter={(v) => (money ? inrShort(v) : v)} />
          </>
        )}
        <Tooltip formatter={(v) => (money ? inrShort(v) : v)} cursor={{ fill: "rgba(229,57,53,0.06)" }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.name || b.key} fill={b.color || CHART_COLORS[i]}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DonutChart = ({ data, height = 230, money = false, centerLabel, centerValue }) => {
  const rows = (data || []).filter((d) => Number(d.value) > 0);
  if (!rows.length) return <EmptyState height={height} />;
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="86%" paddingAngle={2} stroke="none">
            {rows.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => (money ? inrShort(v) : v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue !== undefined && (
        <div className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-2xl font-bold text-gray-900">{centerValue}</p>
          {centerLabel && <p className="text-[11px] text-gray-500">{centerLabel}</p>}
        </div>
      )}
    </div>
  );
};

/* ------------------------------- Small bits ------------------------------ */
const BADGE = {
  success: { bg: "#E6F8F0", fg: "#047857" },
  warning: { bg: "#FEF3C7", fg: "#B45309" },
  danger: { bg: "#FDECEC", fg: "#B71C1C" },
  info: { bg: "#E3F6F9", fg: "#0E7490" },
  neutral: { bg: "#EEF1F5", fg: "#475569" },
};
export const Badge = ({ kind = "neutral", children }) => {
  const c = BADGE[kind] || BADGE.neutral;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.fg }}>
      {children}
    </span>
  );
};

export const stageKind = (stage = "") => {
  const s = String(stage).toLowerCase();
  if (s.includes("approv") || s.includes("accept") || s.includes("complete")) return "success";
  if (s.includes("reject") || s.includes("cancel") || s.includes("declin")) return "danger";
  return "warning";
};

export const ProgressRow = ({ label, value, total, color = "#E53935" }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value} · {pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

export const ActionTile = ({ to, onClick, icon: Icon, label, hint, tone = "red" }) => {
  const t = TONES[tone] || TONES.red;
  const inner = (
    <div className="flex h-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: t.bg }}>
        {Icon && <Icon className="h-5 w-5" style={{ color: t.fg }} />}
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-semibold text-gray-900">{label}</p>
        {hint && <p className="truncate text-xs text-gray-500">{hint}</p>}
      </div>
    </div>
  );
  if (to) return <Link to={to} className="block">{inner}</Link>;
  return <button type="button" onClick={onClick} className="block w-full">{inner}</button>;
};

/** Counts rows by a key and returns [{label, value}] sorted desc. */
export const countBy = (rows, getKey) => {
  const m = new Map();
  (rows || []).forEach((r) => {
    const k = getKey(r) || "Other";
    m.set(k, (m.get(k) || 0) + 1);
  });
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};

/** Groups dates into last N months → [{label, value}] */
export const monthlyCounts = (rows, getDate, months = 6) => {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-IN", { month: "short" }), value: 0 });
  }
  (rows || []).forEach((r) => {
    const raw = getDate(r);
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d)) return;
    const b = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (b) b.value += 1;
  });
  return buckets;
};

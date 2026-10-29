/***
 *  I3EMS - AMT ERP
 *  Component: DashboardKit  (reusable building blocks for department dashboards)
 *
 *  Provides: KpiTile, KpiRow, DashboardSection, PendingList, AlertList,
 *            QuickActions, TrendAreaChart, CategoryBarChart, MiniDonut,
 *            DashboardShell.
 *
 *  Charts use `recharts` (add with:  npm i recharts  inside i3ems/).
 *  Currency = Indian format. Styling matches existing Tailwind reports.
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import BackButton from "../backbutton";

/* Accessible, consistent categorical palette (color-blind safe) */
export const PALETTE = [
  "#E53935", "#059669", "#d97706", "#dc2626",
  "#C62828", "#0891b2", "#db2777", "#65a30d",
];

export const inr = (n, withSymbol = true) => {
  if (n ==  undefined || n ==  null || isNaN(n)) return withSymbol ? "₹ 0" : "0";
  const num = parseFloat(n);
  const s = num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return withSymbol ? `₹ ${s}` : s;
};

export const inrShort = (n) => {
  const num = parseFloat(n) || 0;
  const abs = Math.abs(num);
  if (abs >= 1e7) return `₹ ${(num / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹ ${(num / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `₹ ${(num / 1e3).toFixed(1)} K`;
  return `₹ ${num.toFixed(0)}`;
};

/* --------------------------------- KPI ---------------------------------- */
export const KpiTile = ({
  label,
  value,
  sub,
  delta,
  deltaSuffix = "%",
  icon: Icon,
  accent = "blue",
  to,
}) => {
  const accents = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    red: "from-rose-500 to-red-600",
    violet: "from-violet-500 to-purple-600",
    cyan: "from-cyan-500 to-sky-600",
  };
  const up = delta > 0;
  const body = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div
            className={`h-11 w-11 rounded-xl bg-gradient-to-br ${accents[accent]} text-white flex items-center justify-center shadow`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {delta !=  undefined && delta !=  null && !isNaN(delta) && (
        <div
          className={`mt-3 inline-flex items-center text-xs font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}
        >
          {up ? <FiArrowUpRight className="mr-1" /> : <FiArrowDownRight className="mr-1" />}
          {Math.abs(delta).toFixed(2)}
          {deltaSuffix}
          <span className="text-gray-400 font-normal ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

export const KpiRow = ({ children, cols = 4 }) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-4 mb-6`}
  >
    {children}
  </div>
);

/* ------------------------------ Sections -------------------------------- */
export const DashboardSection = ({ title, action, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

export const PendingList = ({ items = [], emptyText = "Nothing pending" }) => (
  <div className="divide-y divide-gray-100">
    {items.length ==  0 && (
      <p className="text-sm text-gray-400 py-4 text-center">{emptyText}</p>
    )}
    {items.map((it, i) => (
      <Link
        key={i}
        to={it.to || "#"}
        className="flex items-center justify-between py-2.5 group"
      >
        <div className="min-w-0">
          <p className="text-sm text-gray-800 truncate">{it.title}</p>
          {it.meta && <p className="text-xs text-gray-400">{it.meta}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {it.value !=  undefined && (
            <span className="text-sm font-semibold text-gray-700">{it.value}</span>
          )}
          <FiChevronRight className="text-gray-300 group-hover:text-blue-600 transition-colors" />
        </div>
      </Link>
    ))}
  </div>
);

export const AlertList = ({ items = [] }) => (
  <div className="space-y-2">
    {items.length ==  0 && (
      <p className="text-sm text-gray-400 py-2 text-center">No alerts</p>
    )}
    {items.map((a, i) => {
      const tone =
        a.level ==  "danger"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : a.level ==  "warning"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-sky-50 text-sky-700 border-sky-200";
      return (
        <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${tone}`}>
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <span>{a.text}</span>
        </div>
      );
    })}
  </div>
);

export const QuickActions = ({ actions = [] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {actions.map((a, i) => (
      <Link
        key={i}
        to={a.to}
        className="flex flex-col items-start gap-2 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        {a.icon && <a.icon className="h-5 w-5 text-blue-600" />}
        <span className="text-sm font-medium text-gray-800">{a.label}</span>
      </Link>
    ))}
  </div>
);

/* ------------------------------- Charts --------------------------------- */
export const TrendAreaChart = ({ data = [], xKey = "label", series = [], height = 260 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={s.color || PALETTE[i]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={s.color || PALETTE[i]} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => inrShort(v)} width={70} />
      <Tooltip formatter={(v) => inr(v)} />
      {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
      {series.map((s, i) => (
        <Area
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.name || s.key}
          stroke={s.color || PALETTE[i]}
          fill={`url(#g-${s.key})`}
          strokeWidth={2}
        />
      ))}
    </AreaChart>
  </ResponsiveContainer>
);

export const CategoryBarChart = ({ data = [], xKey = "label", barKey = "value", color = PALETTE[0], height = 260, money = true }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (money ? inrShort(v) : v)} width={70} />
      <Tooltip formatter={(v) => (money ? inr(v) : v)} />
      <Bar dataKey={barKey} fill={color} radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const MiniDonut = ({ data = [], height = 220, money = false }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
        {data.map((_, i) => (
          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(v) => (money ? inr(v) : v)} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
    </PieChart>
  </ResponsiveContainer>
);

/* ---------------------------- Dashboard shell --------------------------- */
export const DashboardShell = ({ title, subtitle, filters, children, loading }) => (
  <div className="min-h-screen bg-gray-100 px-4 py-6">
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div className="flex items-center">
          <BackButton fallback="/dashboard" className="mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {filters && <div className="flex items-end gap-3">{filters}</div>}
      </div>
      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading dashboard...</p>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

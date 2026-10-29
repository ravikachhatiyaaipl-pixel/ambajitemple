/**
 *  AMT I3EMS — shared UI theme tokens (matches the existing Menu Management / Master design).
 *  Light canvas · white rounded cards · BLUE primary · pastel stat tiles · L1–L4 level badges.
 *  Import these class strings so every new screen reads as one system with the old screens.
 */
export const T = {
  page:      "min-h-screen bg-[#f5f6f8] px-4 py-6",
  wrap:      "max-w-7xl mx-auto",
  h1:        "text-xl font-bold text-gray-900",
  sub:       "text-xs text-gray-500 mt-1",
  card:      "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
  btnPrimary:"px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium",
  btnGhost:  "px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm",
  thead:     "bg-gray-50",
  th:        "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap",
  td:        "px-4 py-3 text-sm text-gray-800 whitespace-nowrap",
  input:     "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm",
  toastOk:   "mb-4 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm",
};
/** Level badge (L1..L4) colours, matching the Menu Management screen. */
export const LEVEL_BADGE = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-emerald-100 text-emerald-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-pink-100 text-pink-700",
};
/** Status pill tones. */
export const STATUS_TONE = {
  DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-sky-100 text-sky-700",
  APPROVED: "bg-blue-100 text-blue-700", SELECTED: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-blue-100 text-blue-700", JOINED: "bg-emerald-100 text-emerald-700",
  ISSUED: "bg-violet-100 text-violet-700", OPEN: "bg-sky-100 text-sky-700",
  VISIBLE: "bg-emerald-100 text-emerald-700", ACTIVE: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700", CANCELLED: "bg-rose-100 text-rose-700",
  HIDDEN: "bg-gray-100 text-gray-600",
  RECEIVED: "bg-amber-100 text-amber-700", SCHEDULED: "bg-amber-100 text-amber-700",
  PROPOSED: "bg-amber-100 text-amber-700", FINALIZED: "bg-emerald-100 text-emerald-700",
  POSTED: "bg-blue-100 text-blue-700", PAID: "bg-emerald-100 text-emerald-700",
  IMPLEMENTED: "bg-emerald-100 text-emerald-700",
};
/** Soft pastel stat-tile styles (used by dashboards / list headers). */
export const STAT_TONES = [
  "bg-blue-50 text-blue-700",   "bg-emerald-50 text-emerald-700", "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700", "bg-pink-50 text-pink-700",     "bg-teal-50 text-teal-700",
  "bg-gray-50 text-gray-700",   "bg-orange-50 text-orange-700",
];

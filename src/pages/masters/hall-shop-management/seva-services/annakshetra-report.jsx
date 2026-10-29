import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AnnakshetraReport() {
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${localStorage.getItem("auth_token")}` };
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({});
  const [services, setServices] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [period, setPeriod] = useState("day");
  const [serviceId, setServiceId] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setBusy(true);
      const res = await axios.get(`${base}/seva/annakshetra/report`, {
        headers,
        params: {
          from: from || undefined,
          to: to || undefined,
          period,
          service_id: serviceId || undefined,
        },
      });
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || {});
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load the Annakshetra report");
    } finally {
      setBusy(false);
    }
  }, [base, from, to, period, serviceId]);

  useEffect(() => {
    axios.get(`${base}/seva/services?service_mode=ANNASHETRA_DONATION&active_only=1`, { headers })
      .then((res) => setServices(res.data?.data?.data || res.data?.data || []))
      .catch((e) => toast.error(e.response?.data?.message || "Could not load Annakshetra services"));
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = useMemo(() => ({
    donations: Number(totals.donations ?? rows.reduce((s, r) => s + Number(r.donations || 0), 0)),
    paid: Number(totals.paid_count ?? rows.reduce((s, r) => s + Number(r.paid_count || 0), 0)),
    amount: Number(totals.amount ?? rows.reduce((s, r) => s + Number(r.amount || 0), 0)),
    collected: Number(totals.paid ?? rows.reduce((s, r) => s + Number(r.paid || 0), 0)),
  }), [totals, rows]);

  const periodLabel = { day: "Daily", week: "Weekly", month: "Monthly", year: "Yearly" }[period];

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Annakshetra Report</h1>
        <p className="text-sm text-gray-500">Annakshetra sponsorship donations — how many devotees donated, the amount promised, and the amount collected.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
        <label className="text-xs text-gray-600">Report period
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 block rounded border p-2">
            <option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option><option value="year">Yearly</option>
          </select>
        </label>
        <label className="text-xs text-gray-600">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded border p-2" /></label>
        <label className="text-xs text-gray-600">To<input type="date" min={from || undefined} value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded border p-2" /></label>
        <label className="text-xs text-gray-600">Annakshetra service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="mt-1 block min-w-48 rounded border p-2">
            <option value="">All services</option>{services.map((service) => <option key={service.service_id} value={service.service_id}>{service.name}</option>)}
          </select>
        </label>
        <button onClick={load} disabled={busy} className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Loading…" : "Refresh report"}</button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Donations", cards.donations], ["Paid donations", cards.paid], ["Donation value", `₹${cards.amount.toFixed(2)}`], ["Collected", `₹${cards.collected.toFixed(2)}`]].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-bold text-gray-900">{value}</p></div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">{periodLabel} period</th><th className="px-4 py-3">Donations</th><th className="px-4 py-3">Paid donations</th><th className="px-4 py-3">Donation value</th><th className="px-4 py-3">Collected</th><th className="px-4 py-3">Pending</th></tr></thead>
          <tbody className="divide-y">
            {rows.map((row, index) => {
              const pending = Number(row.amount || 0) - Number(row.paid || 0);
              return <tr key={`${row.period_key}-${index}`}>
                <td className="px-4 py-3">{row.period_label || row.perform_date}</td><td className="px-4 py-3">{row.donations}</td><td className="px-4 py-3">{row.paid_count}</td><td className="px-4 py-3">₹{Number(row.amount || 0).toFixed(2)}</td><td className="px-4 py-3">₹{Number(row.paid || 0).toFixed(2)}</td><td className="px-4 py-3">₹{pending.toFixed(2)}</td>
              </tr>;
            })}
            {!rows.length && <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-500">No Annakshetra donations match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

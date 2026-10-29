import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function TithiBhojanReport() {
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${localStorage.getItem("auth_token")}` };
  const [rows, setRows] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponTotals, setCouponTotals] = useState({});
  const [services, setServices] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [period, setPeriod] = useState("day");
  const [serviceId, setServiceId] = useState("");
  const [slot, setSlot] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setBusy(true);
      const filter = { from: from || undefined, to: to || undefined, service_id: serviceId || undefined };
      const [reportRes, couponRes] = await Promise.all([
        axios.get(`${base}/seva/tithi-bhojan/report`, { headers, params: { ...filter, period } }),
        axios.get(`${base}/seva/tithi-bhojan/coupon-report`, { headers, params: filter }),
      ]);
      setRows(reportRes.data?.data || []);
      setCoupons(couponRes.data?.data || []);
      setCouponTotals(couponRes.data?.totals || {});
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load the Tithi Bhojan report");
    } finally {
      setBusy(false);
    }
  }, [base, from, to, period, serviceId]);

  useEffect(() => {
    axios.get(`${base}/seva/services?service_mode=TITHI_BHOJAN&active_only=1`, { headers })
      .then((res) => setServices(res.data?.data?.data || res.data?.data || []))
      .catch((e) => toast.error(e.response?.data?.message || "Could not load Tithi Bhojan services"));
  }, []);

  useEffect(() => { load(); }, [load]);

  const slots = useMemo(() => [...new Set(rows.map((row) => row.slot).filter(Boolean))].sort(), [rows]);
  const visibleRows = useMemo(() => slot ? rows.filter((row) => row.slot === slot) : rows, [rows, slot]);
  const totals = useMemo(() => visibleRows.reduce((result, row) => ({
    bookings: result.bookings + Number(row.bookings || 0),
    people: result.people + Number(row.people_booked || 0),
    attended: result.attended + Number(row.people_attended || 0),
    amount: result.amount + Number(row.amount || 0),
    paid: result.paid + Number(row.paid || 0),
  }), { bookings: 0, people: 0, attended: 0, amount: 0, paid: 0 }), [visibleRows]);

  const visibleCoupons = useMemo(() => slot ? coupons.filter((row) => row.slot === slot) : coupons, [coupons, slot]);
  const couponCards = useMemo(() => ({
    issued: Number(couponTotals.coupons_issued ?? visibleCoupons.reduce((s, r) => s + Number(r.coupons_issued || 0), 0)),
    redeemed: Number(couponTotals.coupons_redeemed ?? visibleCoupons.reduce((s, r) => s + Number(r.coupons_redeemed || 0), 0)),
    persons: Number(couponTotals.persons_issued ?? visibleCoupons.reduce((s, r) => s + Number(r.persons_issued || 0), 0)),
    served: Number(couponTotals.people_served ?? visibleCoupons.reduce((s, r) => s + Number(r.people_served || 0), 0)),
  }), [couponTotals, visibleCoupons]);

  const periodLabel = { day: "Daily", week: "Weekly", month: "Monthly", year: "Yearly" }[period];

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tithi Bhojan Report</h1>
        <p className="text-sm text-gray-500">Filter bookings by date, meal slot, and service. View daily, weekly, monthly, or yearly totals and the meal coupons issued.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
        <label className="text-xs text-gray-600">Report period
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 block rounded border p-2">
            <option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option><option value="year">Yearly</option>
          </select>
        </label>
        <label className="text-xs text-gray-600">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded border p-2" /></label>
        <label className="text-xs text-gray-600">To<input type="date" min={from || undefined} value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded border p-2" /></label>
        <label className="text-xs text-gray-600">Tithi Bhojan service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="mt-1 block min-w-48 rounded border p-2">
            <option value="">All services</option>{services.map((service) => <option key={service.service_id} value={service.service_id}>{service.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-600">Meal slot
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="mt-1 block min-w-36 rounded border p-2">
            <option value="">All slots</option>{slots.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button onClick={load} disabled={busy} className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Loading…" : "Refresh report"}</button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[["Bookings", totals.bookings], ["People booked", totals.people], ["People attended", totals.attended], ["Booking value", `₹${totals.amount.toFixed(2)}`], ["Paid", `₹${totals.paid.toFixed(2)}`]].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-bold text-gray-900">{value}</p></div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">{periodLabel} period</th><th className="px-4 py-3">Slot</th><th className="px-4 py-3">Bookings</th><th className="px-4 py-3">Booked people</th><th className="px-4 py-3">Attended people</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Paid</th></tr></thead>
          <tbody className="divide-y">
            {visibleRows.map((row, index) => <tr key={`${row.period_key}-${row.slot}-${index}`}>
              <td className="px-4 py-3">{row.period_label || row.perform_date}</td><td className="px-4 py-3">{row.slot}</td><td className="px-4 py-3">{row.bookings}</td><td className="px-4 py-3">{row.people_booked}</td><td className="px-4 py-3">{row.people_attended}</td><td className="px-4 py-3">₹{Number(row.amount || 0).toFixed(2)}</td><td className="px-4 py-3">₹{Number(row.paid || 0).toFixed(2)}</td>
            </tr>)}
            {!visibleRows.length && <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-500">No Tithi Bhojan bookings match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">Meal coupons issued</h2>
        <p className="text-sm text-gray-500">How many meal coupons were generated and served, by meal date and slot.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Coupons issued", couponCards.issued], ["Coupons redeemed", couponCards.redeemed], ["Persons on coupons", couponCards.persons], ["People served", couponCards.served]].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-bold text-gray-900">{value}</p></div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Meal date</th><th className="px-4 py-3">Slot</th><th className="px-4 py-3">Coupons issued</th><th className="px-4 py-3">Coupons redeemed</th><th className="px-4 py-3">Persons on coupons</th><th className="px-4 py-3">People served</th><th className="px-4 py-3">Amount</th></tr></thead>
          <tbody className="divide-y">
            {visibleCoupons.map((row, index) => <tr key={`${row.coupon_date}-${row.slot}-${index}`}>
              <td className="px-4 py-3">{row.coupon_date}</td><td className="px-4 py-3">{row.slot}</td><td className="px-4 py-3">{row.coupons_issued}</td><td className="px-4 py-3">{row.coupons_redeemed}</td><td className="px-4 py-3">{row.persons_issued}</td><td className="px-4 py-3">{row.people_served}</td><td className="px-4 py-3">₹{Number(row.amount || 0).toFixed(2)}</td>
            </tr>)}
            {!visibleCoupons.length && <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-500">No meal coupons issued in this range yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

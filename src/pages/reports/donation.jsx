import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  IndianRupee,
  Scale,
  Users,
  Package,
  Clock,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import jspdfAutotable from "jspdf-autotable";
import DonationApi from "../services/donationapi";

/**
 * S16 - DONATION REPORTS DASHBOARD
 *
 * 8 reports:
 *  1. Donor-wise   2. Category-wise  3. Date-wise   4. Purity-wise
 *  5. Storage-wise 6. Pending         7. Valuation  8. Audit Trail
 */
const DonationReports = ({ user }) => {
  const navigate = useNavigate();

  const [tab, setTab] = useState("summary");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 8) + "01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const TABS = [
    { key: "summary", label: "Dashboard" },
    { key: "donor-wise", label: "Donor-wise" },
    { key: "category-wise", label: "Category-wise" },
    { key: "date-wise", label: "Date-wise" },
    { key: "purity-wise", label: "Purity-wise" },
    { key: "storage-wise", label: "Storage-wise" },
    { key: "pending", label: "Pending" },
    { key: "valuation", label: "Valuation" },
    { key: "audit-trail", label: "Audit Trail" },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const params = { from, to };

      if (tab === "summary") {
        const res = await DonationApi.getSummary(params);
        setSummary(res?.data || null);
        setRows(res?.data?.by_category || []);
      } else {
        const res = await DonationApi.getReport(tab, params);
        setRows(res?.data || []);
        setSummary(null);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, from, to]);

  // ---------------- EXPORT ----------------
  const exportExcel = () => {
    if (!rows.length) return toast.error("No data to export");
    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Donation Report");
      XLSX.writeFile(wb, `donation-${tab}-${Date.now()}.xlsx`);
      toast.success("Excel exported");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const exportPdf = () => {
    if (!rows.length) return toast.error("No data to export");
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(
        `Donation Report - ${TABS.find((t) => t.key === tab)?.label || tab}`,
        14,
        16
      );
      doc.setFontSize(9);
      doc.text(`From ${from} to ${to}`, 14, 22);

      const columns = Object.keys(rows[0]).map((k) => ({
        header: k.replace(/_/g, " ").toUpperCase(),
        data: rows.map((r) => String(r[k] ?? "")),
      }));

      jspdfAutotable(doc, {
        startY: 26,
        head: [columns.map((c) => c.header)],
        body: columns[0].data.map((_, i) =>
          columns.map((c) => c.data[i])
        ),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [185, 28, 28] },
      });

      doc.save(`donation-${tab}-${Date.now()}.pdf`);
      toast.success("PDF exported");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  // ---------------- TABLE CONFIG ----------------
  const columnsFor = (t) => {
    if (!rows.length) return [];
    return Object.keys(rows[0]).map((k) => ({
      key: k,
      label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      isNumber: typeof rows[0][k] === "number",
    }));
  };

  const renderCell = (row, key) => {
    const v = row[key];
    if (v === null || v === undefined) return "--";
    if (typeof v === "number") {
      if (key.includes("valuation") || key.includes("price")) {
        return `-${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
      }
      if (key.includes("gram")) return `${v.toFixed(4)} g`;
      return v.toLocaleString("en-IN");
    }
    return String(v);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Donation Reports
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Donor, category, date, purity, storage, valuation & audit reports
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
          <button
            onClick={load}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {tab === "summary" && summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
          {[
            [
              "Total Donations",
              summary.total_donations,
              Package,
              "text-gray-900",
            ],
            [
              "Total Valuation",
              `-${Number(summary.total_valuation || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}`,
              IndianRupee,
              "text-emerald-600",
            ],
            [
              "Total Weight (g)",
              Number(summary.total_weight_gram || 0).toFixed(3),
              Scale,
              "text-blue-600",
            ],
            [
              "Total Donors",
              summary.total_donors,
              Users,
              "text-indigo-600",
            ],
            [
              "Pending Approvals",
              summary.pending_approvals,
              Clock,
              "text-amber-600",
            ],
            [
              "Pending Storage",
              summary.pending_storage,
              Building2,
              "text-red-600",
            ],
          ].map(([label, value, Icon, color]) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{label}</p>
                <Icon className="h-4 w-4 text-gray-300" />
              </div>
              <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              tab === t.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Export buttons */}
      {tab !== "summary" && (
        <div className="flex justify-end gap-2 mb-3">
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
          </button>
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 text-red-600" /> PDF
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {columnsFor(tab).map((c) => (
                  <th
                    key={c.key}
                    className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={Math.max(columnsFor(tab).length, 1)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {columnsFor(tab).map((c) => (
                      <td
                        key={c.key}
                        className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap"
                      >
                        {renderCell(r, c.key)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={Math.max(columnsFor(tab).length, 1)}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No data for this report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationReports;

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Package,
  Scale,
  Users,
  Clock,
  CheckCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import jspdfAutotable from "jspdf-autotable";
import ArticleDonationApi from "../../services/articleDonationApi";

/**
 * ARTICLE & MATERIAL DONATION REPORTS DASHBOARD
 * Design - Donation (Gold) Reports jaisa same: summary cards, tabs,
 * Excel / PDF export, from-to date filter.
 */
const ArticleDonationReports = ({ user }) => {
  const navigate = useNavigate();

  const [tab, setTab] = useState("summary");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 8) + "01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const statusLabel = (s) => {
    const m = { 32: "Pending", 33: "HOD Approved", 34: "Admin Approved", 35: "Query", 36: "Sent Back", 37: "Rejected" };
    return m[s] || String(s);
  };

  const TABS = [
    { key: "summary", label: "Dashboard" },
    { key: "all", label: "All Articles" },
    { key: "status-wise", label: "Status-wise" },
    { key: "donor-wise", label: "Donor-wise" },
    { key: "date-wise", label: "Date-wise" },
    { key: "storage-wise", label: "Storage-wise" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const params = { from, to };
      const res = await ArticleDonationApi.getReport(params);
      const all = res?.data || [];
      setRows(Array.isArray(all) ? all : []);
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

  // ---------------- DATA SHAPING PER TAB ----------------
  const summary = useMemo(() => {
    const byStatus = {};
    rows.forEach((r) => {
      const k = statusLabel(r.status);
      byStatus[k] = (byStatus[k] || 0) + 1;
    });
    return {
      total_articles: rows.length,
      total_quantity: rows.reduce((s, r) => s + (Number(r.article_quantity) || 0), 0),
      total_weight: rows.reduce((s, r) => s + (Number(r.article_weight) || 0), 0),
      total_donors: new Set(rows.map((r) => r.donor_phone || r.donor_name)).size,
      pending_approvals: rows.filter((r) => Number(r.status) === 32).length,
      fully_approved: rows.filter((r) => Number(r.status) === 34).length,
      by_status: byStatus,
    };
  }, [rows]);

  const tableRows = useMemo(() => {
    if (tab === "summary") return [];
    if (tab === "all")
      return rows.map((r) => ({
        article_id: r.article_id,
        article_name: r.article_name,
        size: r.article_size || "",
        quantity: r.article_quantity || 0,
        weight_kg: Number(r.article_weight || 0).toFixed(3),
        donor_name: r.donor_name || "",
        donor_phone: r.donor_phone || "",
        storage: r.storage_location?.SPM_Name || "",
        status: statusLabel(r.status),
        date: r.purchase_date || "",
      }));
    if (tab === "status-wise") {
      const g = {};
      rows.forEach((r) => {
        const k = statusLabel(r.status);
        g[k] = g[k] || { status: k, count: 0, quantity: 0, weight_kg: 0 };
        g[k].count++;
        g[k].quantity += Number(r.article_quantity) || 0;
        g[k].weight_kg += Number(r.article_weight) || 0;
      });
      return Object.values(g).map((x) => ({ ...x, weight_kg: Number(x.weight_kg).toFixed(3) }));
    }
    if (tab === "donor-wise") {
      const g = {};
      rows.forEach((r) => {
        const k = `${r.donor_name || "--"} (${r.donor_phone || "--"})`;
        g[k] = g[k] || { donor: k, donations: 0, quantity: 0, weight_kg: 0 };
        g[k].donations++;
        g[k].quantity += Number(r.article_quantity) || 0;
        g[k].weight_kg += Number(r.article_weight) || 0;
      });
      return Object.values(g).map((x) => ({ ...x, weight_kg: Number(x.weight_kg).toFixed(3) }));
    }
    if (tab === "date-wise") {
      const g = {};
      rows.forEach((r) => {
        const k = (r.purchase_date || "").slice(0, 10) || "--";
        g[k] = g[k] || { date: k, donations: 0, quantity: 0, weight_kg: 0 };
        g[k].donations++;
        g[k].quantity += Number(r.article_quantity) || 0;
        g[k].weight_kg += Number(r.article_weight) || 0;
      });
      return Object.values(g)
        .map((x) => ({ ...x, weight_kg: Number(x.weight_kg).toFixed(3) }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    if (tab === "storage-wise") {
      const g = {};
      rows.forEach((r) => {
        const k = r.storage_location?.SPM_Name || "Not Allocated";
        g[k] = g[k] || { storage: k, articles: 0, quantity: 0, weight_kg: 0 };
        g[k].articles++;
        g[k].quantity += Number(r.article_quantity) || 0;
        g[k].weight_kg += Number(r.article_weight) || 0;
      });
      return Object.values(g).map((x) => ({ ...x, weight_kg: Number(x.weight_kg).toFixed(3) }));
    }
    if (tab === "pending")
      return rows
        .filter((r) => [32, 35, 36].includes(Number(r.status)))
        .map((r) => ({
          article_id: r.article_id,
          article_name: r.article_name,
          donor_name: r.donor_name || "",
          donor_phone: r.donor_phone || "",
          quantity: r.article_quantity || 0,
          status: statusLabel(r.status),
          date: r.purchase_date || "",
        }));
    if (tab === "approved")
      return rows
        .filter((r) => Number(r.status) === 34)
        .map((r) => ({
          article_id: r.article_id,
          article_name: r.article_name,
          donor_name: r.donor_name || "",
          storage: r.storage_location?.SPM_Name || "",
          quantity: r.article_quantity || 0,
          weight_kg: Number(r.article_weight || 0).toFixed(3),
          date: r.purchase_date || "",
        }));
    return [];
  }, [rows, tab]);

  // ---------------- EXPORT ----------------
  const exportExcel = () => {
    if (!tableRows.length) return toast.error("No data to export");
    try {
      const ws = XLSX.utils.json_to_sheet(tableRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Article Donation Report");
      XLSX.writeFile(wb, `article-donation-${tab}-${Date.now()}.xlsx`);
      toast.success("Excel exported");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const exportPdf = () => {
    if (!tableRows.length) return toast.error("No data to export");
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(
        `Article Donation Report - ${TABS.find((t) => t.key === tab)?.label || tab}`,
        14,
        16
      );
      doc.setFontSize(9);
      doc.text(`From ${from} to ${to}`, 14, 22);

      const columns = Object.keys(tableRows[0]).map((k) => ({
        header: k.replace(/_/g, " ").toUpperCase(),
        data: tableRows.map((r) => String(r[k] ?? "")),
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

      doc.save(`article-donation-${tab}-${Date.now()}.pdf`);
      toast.success("PDF exported");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  // ---------------- TABLE CONFIG ----------------
  const columnsFor = () => {
    if (!tableRows.length) return [];
    return Object.keys(tableRows[0]).map((k) => ({
      key: k,
      label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      isNumber: typeof tableRows[0][k] === "number",
    }));
  };

  const renderCell = (row, key) => {
    const v = row[key];
    if (v === null || v === undefined) return "--";
    return String(v);
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Article &amp; Material Donation Reports
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Status, donor, date, storage &amp; pending reports
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
      {tab === "summary" && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
          {[
            ["Total Articles", summary.total_articles, Package, "text-gray-900"],
            ["Total Quantity", summary.total_quantity, Scale, "text-blue-600"],
            [
              "Total Weight (kg)",
              summary.total_weight.toFixed(3),
              Scale,
              "text-emerald-600",
            ],
            ["Total Donors", summary.total_donors, Users, "text-indigo-600"],
            ["Pending Approvals", summary.pending_approvals, Clock, "text-amber-600"],
            ["Fully Approved", summary.fully_approved, CheckCircle, "text-green-600"],
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

      {/* Summary status breakdown (dashboard tab) */}
      {tab === "summary" && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
          {Object.entries(summary.by_status).map(([status, count]) => (
            <div
              key={status}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{status}</p>
                <ShieldCheck className="h-4 w-4 text-gray-300" />
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
          {Object.keys(summary.by_status).length === 0 && (
            <p className="text-sm text-gray-500 col-span-6 text-center py-4">
              No data for the selected date range.
            </p>
          )}
        </div>
      )}

      {/* Table */}
      {tab !== "summary" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {columnsFor().map((c) => (
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
                      colSpan={Math.max(columnsFor().length, 1)}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                      </div>
                    </td>
                  </tr>
                ) : tableRows.length > 0 ? (
                  tableRows.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {columnsFor().map((c) => (
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
                      colSpan={Math.max(columnsFor().length, 1)}
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
      )}
    </div>
  );
};

export default ArticleDonationReports;

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Eye,
  Heart,
  FileText,
  Package,
  Calendar,
  AlertCircle,
  X,
  User,
  Phone,
  Hash,
  MapPin,
  ExternalLink,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArticleDonationApi from "./services/articleDonationApi";

/**
 * DEVOTEE - MY ARTICLE DONATIONS
 * Design - Devotee "My Donations" (gold) layout: stat cards, table,
 * detail modal with donation information.
 */

const DOT = "\u2022"; // safe separator (encoding-proof)

const statusLabel = (s) => {
  const m = { 32: "Pending", 33: "HOD Approved", 34: "Admin Approved", 35: "Query", 36: "Sent Back", 37: "Rejected" };
  return m[s] || String(s);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DevoteeArticleDonations = ({ user }) => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ArticleDonationApi.getMyDonations();
      setRows(res?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load article donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = (t) => setDetail(t);

  const statusBadge = (t) => {
    const name = t.status_name || statusLabel(t.status);
    const lower = String(name).toLowerCase();
    let cls = "bg-yellow-100 text-yellow-800";
    if (lower.includes("reject")) cls = "bg-red-100 text-red-800";
    else if (lower.includes("query") || lower.includes("sent back"))
      cls = "bg-orange-100 text-orange-800";
    else if (lower.includes("admin approved")) cls = "bg-green-100 text-green-800";
    else if (lower.includes("hod")) cls = "bg-blue-100 text-blue-800";
    else if (lower.includes("pend")) cls = "bg-yellow-100 text-yellow-800";

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
      >
        {String(name)}
      </span>
    );
  };

  const docViewUrl = (d) =>
    `${import.meta.env.VITE_API_URL}/article-donation/documents/${d.doc_id}/view`;

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/devotee-dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Article Donations
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Your article and material donation history
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={load}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => navigate("/devotee-article-donation-entry")}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center"
          >
            <Heart className="h-4 w-4 mr-2" />
            New Article Donation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          ["Total Articles", rows.length, "text-gray-900"],
          [
            "Pending",
            rows.filter((r) => [32, 35, 36].includes(Number(r.status))).length,
            "text-amber-600",
          ],
          [
            "HOD Approved",
            rows.filter((r) => Number(r.status) === 33).length,
            "text-blue-600",
          ],
          [
            "Fully Approved",
            rows.filter((r) => Number(r.status) === 34).length,
            "text-green-600",
          ],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Article",
                  "Date",
                  "Qty / Weight",
                  "Documents",
                  "Storage",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((t) => (
                  <tr
                    key={t.article_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm mr-3">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {t.article_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID #{t.article_id}
                            {t.article_size ? ` ${DOT} ${t.article_size}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {formatDate(t.purchase_date || t.created_at)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      <div>Qty: {t.article_quantity || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {t.article_weight
                          ? `${Number(t.article_weight).toFixed(3)} kg`
                          : "--"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          (t.missing_documents || []).length
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {(t.documents || []).length} uploaded
                        {(t.missing_documents || []).length > 0 && (
                          <span className="text-[10px]">
                            ({t.missing_documents.length} pending)
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {t.storage_location?.SPM_Name || "Approval ke baad"}
                    </td>
                    <td className="px-5 py-4">{statusBadge(t)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openDetail(t)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No article donations yet
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Start by making an article donation
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Hash className="h-4 w-4 text-gray-400" />
                  {detail.article_name} (#{detail.article_id})
                </h3>
                <p className="text-xs text-gray-500">
                  {formatDate(detail.purchase_date || detail.created_at)}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {/* Article details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Size</span>
                  <span className="font-medium text-gray-900">
                    {detail.article_size || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-medium text-gray-900">
                    {detail.article_quantity || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium text-gray-900">
                    {detail.article_weight
                      ? `${Number(detail.article_weight).toFixed(4)} kg`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  {statusBadge(detail)}
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-500">Description</span>
                  <span className="font-medium text-gray-900 text-right">
                    {detail.article_description || "-"}
                  </span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-500">Storage</span>
                  <span className="font-medium text-gray-900">
                    {detail.storage_location?.SPM_Name || "Approval ke baad"}
                  </span>
                </div>
              </div>

              {/* Donor details */}
              <div className="rounded-lg border border-gray-200 p-3 text-sm">
                <p className="mb-2 text-xs font-medium text-gray-600">
                  Donor Details
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate text-gray-900">
                      {detail.donor_name || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-900">
                      {detail.donor_phone || "-"}
                    </span>
                  </div>
                  {Array.isArray(detail.co_donors) && detail.co_donors.length > 0 && (
                    <div className="col-span-2 pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                        <Users className="h-3 w-3 text-amber-600" /> Co-Donors:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.co_donors.map((cd, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            <User className="h-2.5 w-2.5 text-amber-600" />
                            {typeof cd === "object" ? cd.name : cd}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(detail.documents || []).length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-600">
                    Uploaded Documents
                  </p>
                  <div className="space-y-2">
                    {detail.documents.map((d) => (
                      <div
                        key={d.doc_id}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {d.doc_name || `Document #${d.doctype_id}`}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {d.doc_size_kb
                              ? `${Number(d.doc_size_kb).toFixed(0)} KB`
                              : ""}
                          </p>
                        </div>
                        <a
                          href={docViewUrl(d)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(detail.missing_documents || []).length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Documents pending for upload</p>
                    <p className="text-xs">
                      {detail.missing_documents.join(", ")}
                    </p>
                    <button
                      onClick={() => {
                        setDetail(null);
                        navigate("/devotee-article-donation-entry");
                      }}
                      className="mt-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Upload now
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setDetail(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevoteeArticleDonations;

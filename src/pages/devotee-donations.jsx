import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Eye,
  Heart,
  FileText,
  Scale,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Circle,
  User,
  Phone,
  Hash,
  MapPin,
  IndianRupee,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DonationApi from "./services/donationapi";

/**
 * DEVOTEE - MY DONATIONS
 */

// Currency formatter (Intl se "₹" render hota hai - source me literal
// rupee sign nahi likha, warna file encoding corrupt hone par
// "â,¹" jaisa mojibake dikhta hai)
const formatCurrency = (amount) => {
  let val = Number(amount || 0);
  if (!isFinite(val) || val < 0) val = 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DOT = "\u2022"; // safe separator (encoding-proof)

const DevoteeDonations = ({ user }) => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await DonationApi.getPortalDonations();
      setRows(res?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (t) => {
    setDetail(t);
    setDetailLoading(true);
    try {
      const res = await DonationApi.getPortalDonation(t.transaction_id);
      if (res?.data) setDetail(res.data);
    } catch (e) {
      // fallback - row data already set
    } finally {
      setDetailLoading(false);
    }
  };

  const statusBadge = (t) => {
    const name = t.status_name || t.status || "Pending";
    const lower = String(name).toLowerCase();
    let cls = "bg-yellow-100 text-yellow-800";
    if (lower.includes("reject")) cls = "bg-red-100 text-red-800";
    else if (lower.includes("query") || lower.includes("sent back"))
      cls = "bg-orange-100 text-orange-800";
    else if (lower.includes("approv")) cls = "bg-green-100 text-green-800";
    else if (lower.includes("pend") || lower.includes("wait"))
      cls = "bg-yellow-100 text-yellow-800";

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
      >
        {String(name).replace(/_/g, " ")}
      </span>
    );
  };

  // Valuation approval ke baad hi set hota hai - devotee ko Purchase Price
  // (jo usne entry ke samay diya) dikhta hai
  const totalValue = rows.reduce(
    (s, r) => s + Number(r.purchase_price || 0),
    0
  );

  // Approval flow progress steps (done / current / waiting)
  const ProgressSteps = ({ progress }) => {
    if (!progress?.steps?.length) return null;
    return (
      <div>
        <p className="mb-2 text-xs font-medium text-gray-600">
          Approval Flow
        </p>
        <div className="space-y-2">
          {progress.steps.map((s) => {
            const stateCls =
              s.state === "done"
                ? "border-emerald-200 bg-emerald-50"
                : s.state === "current"
                ? "border-amber-200 bg-amber-50"
                : "border-gray-200 bg-gray-50";
            const icon =
              s.state === "done" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : s.state === "current" ? (
                <Clock className="h-4 w-4 shrink-0 text-amber-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-300" />
              );
            const titleCls =
              s.state === "done"
                ? "text-emerald-800"
                : s.state === "current"
                ? "text-amber-800"
                : "text-gray-500";
            return (
              <div
                key={s.Act_Id}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${stateCls}`}
              >
                <span className="mt-0.5">{icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${titleCls}`}>
                      {s.St_Name}
                    </span>
                    {s.state === "current" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Waiting for approval
                      </span>
                    )}
                    {s.state === "waiting" && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        Waiting
                      </span>
                    )}
                    {s.state === "done" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Approved
                      </span>
                    )}
                  </div>
                  {s.state === "done" && s.approver && (
                    <p className="text-[11px] text-gray-500">
                      by {s.approver}
                      {s.action_date
                        ? ` ${DOT} ${new Date(s.action_date).toLocaleString("en-IN")}`
                        : ""}
                    </p>
                  )}
                  {s.state === "done" && s.remarks && (
                    <p className="text-[11px] italic text-gray-500">
                      {s.remarks}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {progress.note && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{progress.note}</span>
          </div>
        )}
        {progress.is_final && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Donation fully approved
          </div>
        )}
      </div>
    );
  };

  const docViewUrl = (d) => d.doc_url || d.doc_path;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/devotee-dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Aapki seva bhav ki donation history
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
            onClick={() => navigate("/devotee-donation-entry")}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center"
          >
            <Heart className="h-4 w-4 mr-2" />
            New Donation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          ["Total Donations", rows.length, "text-gray-900"],
          [
            "Total Purchase Value",
            formatCurrency(totalValue),
            "text-emerald-600",
          ],
          [
            "Pending",
            rows.filter((r) => r.status === 26 || r.status === 27).length,
            "text-amber-600",
          ],
          [
            "Approved",
            rows.filter((r) => r.status === 28).length,
            "text-blue-600",
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
                  "Receipt",
                  "Category",
                  "Donation Date",
                  "Weight",
                  "Purchase Price",
                  "Documents",
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((t) => (
                  <tr
                    key={t.transaction_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-blue-600">
                        {t.receipt_no}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {t.category?.category_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t.type?.type_name} {DOT} {t.purity?.purity_name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {formatDate(t.donation_date)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Scale className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {Number(t.weight || 0).toFixed(4)}{" "}
                        {t.unit?.unit_name || "g"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(t.purchase_price)}
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No donations yet
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Seva Bhav se donate karna shuru karein
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
                  {detail.receipt_no}
                </h3>
                <p className="text-xs text-gray-500">
                  {detail.category?.category_name} {DOT}{" "}
                  {formatDate(detail.donation_date)}
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
              {detailLoading && (
                <div className="flex items-center justify-center py-1 text-xs text-gray-400">
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Updating details...
                </div>
              )}

              {/* Donation details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">
                    {detail.type?.type_name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purity</span>
                  <span className="font-medium text-gray-900">
                    {detail.purity?.purity_name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium text-gray-900">
                    <Scale className="mr-1 inline h-3.5 w-3.5 text-gray-400" />
                    {Number(detail.weight || 0).toFixed(4)}{" "}
                    {detail.unit?.unit_name || ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight (gram)</span>
                  <span className="font-medium text-gray-900">
                    {Number(detail.weight_in_gram || 0).toFixed(4)} g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purchase Price</span>
                  <span className="font-medium text-gray-900">
                    <IndianRupee className="mr-1 inline h-3.5 w-3.5 text-gray-400" />
                    {formatCurrency(detail.purchase_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill No / Date</span>
                  <span className="font-medium text-gray-900">
                    {detail.purchase_bill_no || "-"} {DOT}{" "}
                    {formatDate(detail.purchase_bill_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  {statusBadge(detail)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Storage</span>
                  <span className="font-medium text-gray-900">
                    {detail.storageLocation?.SPM_Name || "Approval ke baad"}
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
                      {detail.donor?.donor_name || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-900">
                      {detail.donor?.donor_phone || "-"}
                    </span>
                  </div>
                  {detail.donor?.donor_pan && (
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-mono text-xs text-gray-900">
                        PAN: {detail.donor.donor_pan}
                      </span>
                    </div>
                  )}
                  {detail.donor?.donor_address && (
                    <div className="col-span-2 flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="text-xs text-gray-700">
                        {detail.donor.donor_address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval flow - first approval tak next sab WAITING */}
              {detail.approval_progress && (
                <ProgressSteps progress={detail.approval_progress} />
              )}

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
                            {d.doc_type?.name || `Document #${d.doctype_id}`}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {d.doc_name}
                            {d.doc_size_kb
                              ? ` (${Number(d.doc_size_kb).toFixed(0)} KB)`
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
                    <p className="font-medium">Documents upload karne baaki</p>
                    <p className="text-xs">
                      {detail.missing_documents.join(", ")}
                    </p>
                    <button
                      onClick={() => {
                        setDetail(null);
                        navigate("/devotee-donation-entry");
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

export default DevoteeDonations;

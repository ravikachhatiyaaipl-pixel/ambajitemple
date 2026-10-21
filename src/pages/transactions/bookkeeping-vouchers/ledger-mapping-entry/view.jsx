import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  AlertCircle,
  File,
  Eye as EyeIcon,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  FileText,
  Folder,
  PieChart,
  Gift,
  IndianRupee,
  Hash,
  Globe,
  Tag,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
});

const STATUS_BADGE = {
  D:  { label: "Draft",         color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  R:  { label: "Revised",       color: "bg-blue-100 text-blue-800 border-blue-200" },
  P:  { label: "Approved",      color: "bg-green-100 text-green-800 border-green-200" },
  F:  { label: "Freeze",        color: "bg-purple-100 text-purple-800 border-purple-200" },
  A:  { label: "Active",        color: "bg-teal-100 text-teal-800 border-teal-200" },
  I:  { label: "Inactive",      color: "bg-gray-100 text-gray-800 border-gray-200" },
  RR: { label: "Re-Revised",    color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  RJ: { label: "Rejected",      color: "bg-red-100 text-red-800 border-red-200" },
  J:  { label: "Justification", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const formatAmount = (val) => {
  const n = parseFloat(val) || 0;
  return "₹ " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (str) => {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return str; }
};

/* ── Labelled field ── */
const Field = ({ label, value, icon: Icon, full = false }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      {label}
    </dt>
    <dd className="text-sm text-gray-900 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200 min-h-[40px] flex items-center">
      {value !=  undefined && value !=  null && value !=  ""
        ? value
        : <span className="text-gray-400">—</span>}
    </dd>
  </div>
);

/* ── Section header ── */
const SectionHead = ({ icon: Icon, title, gradient }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${gradient}`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
  </div>
);

/* ══════════════════════════════════════════════════════ */
const LedgerMappingView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRecord(); }, [id]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/combined-lgr-grt-bgt/${id}`, authHeader());
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        toast.error("Record not found");
        navigate("/transactions/bookkeeping-vouchers/ledger-mapping-entry");
      }
    } catch {
      toast.error("Failed to load record");
      navigate("/transactions/bookkeeping-vouchers/ledger-mapping-entry");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading record...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Record not found</p>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const lg       = data.ledger || {};
  const entries  = data.budget_entries || [];
  const lgBhId   = lg.Bh_Id;
  const mappingDeptId = data.grant_mappings?.[0]?.Dept_Id;

  // Find the entry that matches ledger's budget head AND grant_mapping's department
  const matchedEntry = (() => {
    // Priority 1: is_latest + matching Bh_Id + matching Dept_id
    const strictLatest = entries.find(
      (e) => e.is_latest && e.Bh_Id == lgBhId && e.Dpt_id == mappingDeptId
    );
    if (strictLatest) return strictLatest;

    // Priority 2: is_latest + matching Bh_Id (any dept)
    const bhLatest = entries.find((e) => e.is_latest && e.Bh_Id == lgBhId);
    if (bhLatest) return bhLatest;

    // Priority 3: matching Bh_Id + matching Dept_id (not necessarily latest)
    const strictAny = entries.find(
      (e) => e.Bh_Id == lgBhId && e.Dpt_id == mappingDeptId
    );
    if (strictAny) return strictAny;

    // Fallback: first is_latest, then first entry
    return entries.find((e) => e.is_latest) || entries[0] || null;
  })();

  const latestEntry = matchedEntry;

  const deptName =
    mappingDeptId
      ? (data.grant_mappings[0]?.department?.Dpt_Desc || data.grant_mappings[0]?.department?.Dpt_Name)
      : (latestEntry?.department?.desc || latestEntry?.department?.name) ||
        "—";

  const fyCode =
    latestEntry?.financial_year?.financial_year_code ||
    latestEntry?.financial_year?.financial_year_name ||
    "—";

  const latestBadge = latestEntry
    ? STATUS_BADGE[latestEntry.status] || { label: latestEntry.status_text || latestEntry.status, color: "bg-gray-100 text-gray-800 border-gray-200" }
    : null;

  /* ════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/transactions/bookkeeping-vouchers/ledger-mapping-entry")}
            className="flex items-center px-3 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-gray-800">
              Ledger / Grant / Budget — View
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Ledger ID #{lg.Lg_Id}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/transactions/bookkeeping-vouchers/ledger-mapping-entry/edit/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
      </div>

      {/* ── Summary strip (3 cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Ledger Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          {lg.Lg_Status
            ? <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
            : <XCircle     className="h-8 w-8 text-gray-400  flex-shrink-0" />}
          <div>
            <p className="text-xs text-gray-500 font-medium">Ledger Status</p>
            <p className={`text-sm font-semibold ${lg.Lg_Status ? "text-green-700" : "text-gray-500"}`}>
              {lg.Lg_Status ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {/* Budget Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Budget Status</p>
            {latestBadge ? (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${latestBadge.color}`}>
                {latestBadge.label}
              </span>
            ) : <p className="text-sm text-gray-400">—</p>}
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <IndianRupee className="h-8 w-8 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Budget Amount</p>
            <p className="text-sm font-semibold text-gray-900">
              {latestEntry?.formatted_amount || formatAmount(latestEntry?.amount)}
            </p>
          </div>
        </div>

      </div>

      {/* ── Ledger Details ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <SectionHead icon={FileText} title="Ledger Details" gradient="bg-gradient-to-r from-blue-500 to-cyan-600" />
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Ledger Name"  value={lg.Lg_Name}     icon={FileText} />
          <Field label="English Name" value={lg.Lg_Eng_Name} icon={Globe} />
          <Field label="Ledger Code"  value={lg.Lg_Code}     icon={Hash} />
          <Field
            label="Sub Ledger"
            value={lg.Lg_Sub ==  "yes" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Tag className="h-3 w-3" /> Yes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                <Tag className="h-3 w-3" /> No
              </span>
            )}
            icon={Tag}
          />
          <Field label="Group" value={lg.ledger_group?.Gr_Nm} icon={Folder} />
          <Field
            label="Budget Head"
            value={lg.budget_head ? (
              <div>
                <p>{lg.budget_head.Gr_Nm}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{lg.budget_head.Gr_Cd}</p>
              </div>
            ) : null}
            icon={PieChart}
          />
          <Field label="Grant Type"  value={lg.grant_type?.GT_Name} icon={Gift} />
          <Field label="Last Updated" value={formatDate(lg.updated_at)} icon={Clock} />
        </dl>
      </div>

      {/* ── Budget Entry ── */}
      {latestEntry && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionHead icon={IndianRupee} title="Budget Entry" gradient="bg-gradient-to-r from-emerald-500 to-teal-600" />
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Financial Year"   value={latestEntry.financial_year?.financial_year_name || fyCode} icon={Calendar} />
            <Field label="Department"       value={deptName} icon={Building2} />
            <Field
              label="Amount"
              value={latestEntry.formatted_amount || formatAmount(latestEntry.amount)}
              icon={IndianRupee}
            />
            <Field
              label="Suggested Amount"
              value={latestEntry.formatted_sug_amount || formatAmount(latestEntry.sug_amount)}
              icon={IndianRupee}
            />
            <Field
              label="Status"
              value={latestBadge ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${latestBadge.color}`}>
                  {latestBadge.label}
                </span>
              ) : null}
            />
            <Field label="Can Edit"   value={latestEntry.can_edit ? "Yes" : "No"} />
            <Field label="Entry Date" value={formatDate(latestEntry.created_at)} icon={Clock} />
            <Field label="Updated"    value={formatDate(latestEntry.updated_at)} icon={Clock} />
          </dl>

          {/* Documents */}
          {Array.isArray(latestEntry.Beg_Doc) && latestEntry.Beg_Doc.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <File className="h-3.5 w-3.5 text-gray-400" />
                Documents ({latestEntry.document_count ?? latestEntry.Beg_Doc.length})
              </p>
              <div className="space-y-2">
                {latestEntry.Beg_Doc.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {doc.name || `Document ${i + 1}`}
                    </span>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                        <EyeIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LedgerMappingView;

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Calendar, Building2, User, Clock, Hash,
  CheckCircle, AlertCircle, Copy, UserCheck, ShieldAlert,
  MessageSquare, Check, Eye, Scale, FileText, IndianRupee,
  Package, RefreshCw, Loader2, MapPin, Phone, Mail,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import DonationApi from "../../services/donationapi";

const DonationApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [actionModal, setActionModal] = useState(null);
  const [actionRemark, setActionRemark] = useState("");
  const [storageId, setStorageId] = useState("");
  const [docPreview, setDocPreview] = useState(null);

  const isImage = (doc) => {
    const name = doc?.doc_name || doc?.doc_path || "";
    return /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(name);
  };

  // Backend signed doc_url (relative/legacy doc_path fallback)
  const docUrl = (d) => d?.doc_url || d?.doc_path || "#";

  const openDocPreview = (doc) => {
    setDocPreview(doc);
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await DonationApi.getApprovalDetail(id);
      if (res?.success) {
        setItem(res.data);
        setChain(res.chain || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load approval");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null || amount === "") return "0.00";
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) return "0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getStatusBadge = () => {
    if (!item) return null;
    const statusName = item.status_name || "Pending";
    let colorClass = "bg-yellow-100 text-yellow-800";
    const lower = statusName.toLowerCase();
    if (lower.includes("approv")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (lower.includes("reject") || lower.includes("query") || lower.includes("sent back")) {
      colorClass = "bg-red-100 text-red-800";
    } else if (lower.includes("pend") || lower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    }
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
          <Clock className="h-4 w-4 mr-2" />
          {statusName}
        </span>
        {item.status === 29 && item.status_remark && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            Query: {item.status_remark}
          </span>
        )}
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleAction = async () => {
    if (!actionModal) return;

    const isQuery = actionModal.Act_Id === 29;
    const effectiveRemark = isQuery ? queryRemark : actionRemark;

    if (isQuery && !effectiveRemark.trim()) {
      return toast.error("Please provide query details");
    }
    const creatorType = item?.creator_type || "admin";
    if (item?.is_final_step && creatorType === "devotee" && !storageId) {
      return toast.error("Please select the storage location (estate master)");
    }

    setIsUpdating(true);
    try {
      const res = await DonationApi.act(id, {
        action_id: actionModal.Act_Id,
        remarks: effectiveRemark.trim() || null,
        storage_location_id:
          item?.is_final_step && item?.creator_type === "devotee"
            ? storageId || null
            : null,
      });

      if (res?.success === false) {
        toast.error(res.message || "Action failed");
        return;
      }
      toast.success(`Donation ${actionModal.St_Name.toLowerCase()} successfully!`);
      setActionModal(null);
      setActionRemark("");
      setQueryModal(false);
      setQueryRemark("");
      navigate("/transactions/donation/approval");
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const openAction = (action) => {
    setActionRemark("");
    setQueryRemark("");
    if (action.Act_Id === 29) {
      setQueryModal(true);
      setActionModal(action);
    } else {
      setActionModal(action);
      setQueryModal(false);
    }
  };

  const forwardAction = (item?.allowed_actions || []).find((a) => a.Is_Forward === "Y");
  const backwardActions = (item?.allowed_actions || []).filter((a) => a.Is_Forward === "N");
  const queryAction = backwardActions.find((a) => a.Act_Id === 29);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading donation details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Donation Not Found</h2>
          <p className="text-gray-600 mb-6">The donation with ID #{id} does not exist.</p>
          <Link
            to="/transactions/donation/approval"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Approvals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions/donation/approval")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donation Approval</h1>
            <p className="text-gray-600 mt-1">
              Receipt <span className="font-semibold font-mono">{item.receipt_no}</span>
              <button
                onClick={() => copyToClipboard(item.receipt_no)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy receipt no"
              >
                <Copy className="h-3 w-3 inline" />
              </button>
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* CONTENT */}
      <div className="space-y-6">
        {/* Donation Information */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Donation Information</h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Receipt No</p>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-mono font-semibold text-gray-900">{item.receipt_no}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Donation Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{formatDate(item.donation_date)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Entry Time</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : "--"}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Category</p>
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">{item.category?.category_name || "--"}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Type / Purity</p>
                <span className="text-sm text-gray-900">
                  {item.type?.type_name || "--"} - {item.purity?.purity_name || "--"}
                </span>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Valuation</p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.valuation_amount)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Approval Flow Progress - first approval tak next sab WAITING */}
        {item.approval_progress?.steps?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Approval Flow</h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {item.approval_progress.steps.map((s) => {
                  const stateCls =
                    s.state === "done"
                      ? "border-emerald-200 bg-emerald-50"
                      : s.state === "current"
                      ? "border-amber-300 bg-amber-50"
                      : "border-gray-200 bg-gray-50";
                  const titleCls =
                    s.state === "done"
                      ? "text-emerald-800"
                      : s.state === "current"
                      ? "text-amber-800"
                      : "text-gray-500";
                  return (
                    <div key={s.Act_Id} className={`rounded-lg border px-4 py-3 ${stateCls}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-semibold ${titleCls}`}>
                          {s.step_no}. {s.St_Name}
                        </span>
                        {s.state === "done" && (
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                        {s.state === "current" && (
                          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                        )}
                        {s.state === "waiting" && (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                            Waiting
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {s.state === "done"
                          ? `Approved${s.approver ? ` by ${s.approver}` : ""}${
                              s.action_date
                                ? ` ${new Date(s.action_date).toLocaleString("en-IN")}`
                                : ""
                            }`
                          : s.state === "current"
                          ? "Waiting for approval"
                          : "This step has not started yet"}
                      </p>
                      {s.state === "done" && s.remarks && (
                        <p className="mt-0.5 text-xs italic text-gray-500">{s.remarks}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {item.approval_progress.note && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {item.approval_progress.note}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weight & Purchase */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Weight & Purchase Details</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Weight</p>
                <div className="flex items-center gap-1">
                  <Scale className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {Number(item.weight).toFixed(4)} {item.unit?.unit_name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">= {Number(item.weight_in_gram).toFixed(4)} gram</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Purchase Bill</p>
                <div className="text-sm text-gray-900">
                  <div>No: {item.purchase_bill_no}</div>
                  <div className="text-xs text-gray-500">Date: {formatDate(item.purchase_bill_date)}</div>
                  <div className="text-xs text-gray-500">Price: {formatCurrency(item.purchase_price)}</div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Hallmark No</p>
                <span className="text-sm text-gray-900">{item.hallmark_no || "--"}</span>
                <p className="text-xs text-gray-500 mt-1">Storage: {item.storageLocation?.location_name || "--"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Donor */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Donor Details</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">{item.donor?.donor_name || "--"}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">{item.donor?.donor_phone || "--"}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900 truncate">{item.donor?.donor_email || "--"}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">PAN</p>
                <span className="text-sm font-mono text-gray-900">{item.donor?.donor_pan || "--"}</span>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">{item.donor?.donor_address || "--"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Uploaded Documents ({(item.documents || []).length})
            </h2>
          </div>
          <div className="px-5 py-4">
            {(item.documents || []).length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No documents uploaded.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.documents.map((d) => (
                  <div
                    key={d.doc_id || d.document_id || Math.random()}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {d.doc_type?.name || d.doctype_name || d.document_name || "Document"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {d.doc_name || d.document_name || "Document"}
                      </p>
                    </div>
                    {d.doc_type?.is_required && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        Mandatory
                      </span>
                    )}
                    <button
                      onClick={() => openDocPreview(d)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <a
                      href={docUrl(d)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                      title="Open in new tab"
                    >
                      <Package className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            {!item.has_mandatory_documents && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4" />
                Mandatory documents are not uploaded - approval blocked.
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        {docPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDocPreview(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{docPreview.doc_type?.name || "Document"}</h3>
                  <p className="text-sm text-gray-500">{docPreview.doc_name}</p>
                </div>
                <button
                  onClick={() => setDocPreview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                {isImage(docPreview) ? (
                  <img
                    src={docUrl(docPreview)}
                    alt={docPreview.doc_name}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh]">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">PDF Document - Click below to open</p>
                    <a
                      href={docUrl(docPreview)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Package className="h-4 w-4" /> Open in New Tab
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval History */}
        {(item.approvals || []).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Approval History</h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              {item.approvals.map((a) => (
                <div
                  key={a.approval_id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <UserCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-gray-900">
                    {a.action?.St_Name || `Action ${a.action_id}`}
                  </span>
                  <span className="text-gray-600">by {a.approver?.Usr_Name || "--"}</span>
                  <span className="text-gray-400">
                    {a.action_date ? new Date(a.action_date).toLocaleString("en-IN") : ""}
                  </span>
                  {a.remarks && (
                    <span className="ml-auto text-gray-500 truncate max-w-xs">{a.remarks}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {item.can_approve && (forwardAction || queryAction) && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Approval Actions</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Review this donation and take appropriate action
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-center items-center flex-wrap">
              {queryAction && (
                <div className="flex-1 w-full md:w-auto max-w-xs">
                  <button
                    onClick={() => openAction(queryAction)}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 text-white rounded-lg flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        {isUpdating ? "Processing..." : queryAction.St_Name}
                      </div>
                      <div className="text-[10px] font-normal opacity-80">
                        Return to clerk for clarification
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {forwardAction && (
                <div className="flex-1 w-full md:w-auto max-w-xs">
                  <button
                    onClick={() => openAction(forwardAction)}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        {isUpdating ? "Processing..." : forwardAction.St_Name}
                      </div>
                      <div className="text-[10px] font-normal opacity-80">
                        Forward to next stage
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!item.can_approve && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
            {forwardAction ? (
              <>
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Waiting for Another Approver</h3>
                <p className="text-gray-600 text-sm mt-1">
                  The next step is <strong>{forwardAction.St_Name}</strong>. You do not have permission to perform this action.
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">No Action Required</h3>
                <p className="text-gray-600 text-sm mt-1">
                  This donation has been fully processed and does not require any further approval.
                </p>
              </>
            )}
          </div>
        )}
      </div>
      {/* END CONTENT */}

      {/* ACTION MODAL (forward/reject) */}
      {actionModal && !queryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{actionModal.St_Name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {actionModal.Act_Id === 28
                  ? "Approve donation and forward to next stage"
                  : actionModal.Act_Id === 30
                  ? "Send donation back to clerk for correction"
                  : "Donation will be rejected"}
              </p>
            </div>

            <div className="p-6">
              {item?.is_final_step && item?.creator_type === "devotee" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location (Estate Master) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={storageId}
                    onChange={(e) => setStorageId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">-- select storage --</option>
                    {(item?.storage_locations || []).map((s) => (
                      <option key={s.location_id} value={s.location_id}>
                        {s.location_name} ({s.location_type})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-gray-500">
                    Final approval will store donation at this estate location
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setActionModal(null);
                    setActionRemark("");
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" /> {actionModal.St_Name}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUERY MODAL (single popup — no Swal) */}
      {queryModal && actionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionModal.St_Name || "Raise Query"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide details for returning to the clerk
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={queryRemark}
                  onChange={(e) => setQueryRemark(e.target.value)}
                  placeholder="Enter your query details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-32"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will be saved in the approval history
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setQueryModal(false);
                    setActionModal(null);
                    setQueryRemark("");
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={isUpdating || !queryRemark.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" /> {actionModal.St_Name || "Raise Query"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationApprovalView;
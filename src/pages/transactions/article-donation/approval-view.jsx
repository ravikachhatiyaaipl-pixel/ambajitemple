import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Calendar, Building2, User, Clock, Hash,
  CheckCircle, AlertCircle, Copy, UserCheck, ShieldAlert,
  MessageSquare, Check, Eye, FileText, Package,
  RefreshCw, Loader2, MapPin, Phone, Mail, X, Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ArticleDonationApi from "../../services/articleDonationApi";

const ArticleDonationApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
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

  const docUrl = (d) =>
    `${import.meta.env.VITE_API_URL}/article-donation/documents/${d.doc_id}/view`;

  const openDocPreview = (doc) => setDocPreview(doc);

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await ArticleDonationApi.getApprovalDetail(id);
      if (res?.success) {
        setItem(res.data);
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

  const getStatusBadge = () => {
    if (!item) return null;
    const statusName = item.status_name || "Pending";
    let colorClass = "bg-yellow-100 text-yellow-800";
    const lower = statusName.toLowerCase();
    if (lower.includes("admin approved")) colorClass = "bg-green-100 text-green-800";
    else if (lower.includes("hod")) colorClass = "bg-blue-100 text-blue-800";
    else if (lower.includes("reject") || lower.includes("query") || lower.includes("sent back")) {
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
        {Number(item.status) === 35 && item.status_remark && (
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

    const isQuery = Number(actionModal.Act_Id) === 35 || actionModal.Is_Forward === "N";
    const effectiveRemark = queryModal ? queryRemark : actionRemark;

    if (queryModal && !effectiveRemark.trim()) {
      return toast.error("Please provide query details");
    }
    const creatorType = item?.creator_type || "admin";
    if (item?.is_final_step && creatorType === "devotee" && !storageId) {
      return toast.error("Please select the storage location (estate master)");
    }

    setIsUpdating(true);
    try {
      const res = await ArticleDonationApi.act(id, {
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
      toast.success(`Article donation ${actionModal.St_Name.toLowerCase()} successfully!`);
      setActionModal(null);
      setActionRemark("");
      setQueryModal(false);
      setQueryRemark("");
      navigate("/transactions/article-donation/approval");
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const openAction = (action) => {
    setActionRemark("");
    setQueryRemark("");
    if (action.Is_Forward === "N") {
      setQueryModal(true);
      setActionModal(action);
    } else {
      setActionModal(action);
      setQueryModal(false);
    }
  };

  const forwardAction = (item?.allowed_actions || []).find((a) => a.Is_Forward === "Y");
  const backwardActions = (item?.allowed_actions || []).filter((a) => a.Is_Forward === "N");
  const queryAction = backwardActions[0];

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading article donation details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Article Donation Not Found</h2>
          <p className="text-gray-600 mb-6">The article donation with ID #{id} does not exist.</p>
          <Link
            to="/transactions/article-donation/approval"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Approvals
          </Link>
        </div>
      </div>
    );
  }

  const finalApproved = Number(item.status) === 34;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions/article-donation/approval")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Article Donation Approval</h1>
            <p className="text-gray-600 mt-1">
              Article <span className="font-semibold font-mono">#{item.article_id}</span>
              <button
                onClick={() => copyToClipboard(item.article_id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy article id"
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
        {/* Article Information */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Article Information</h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Article ID</p>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-mono font-semibold text-gray-900">#{item.article_id}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Article Name</p>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">{item.article_name || "--"}</span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Purchase / Donation Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{formatDate(item.purchase_date)}</span>
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
                <p className="text-xs text-gray-500 mb-0.5">Qty / Weight</p>
                <span className="text-sm text-gray-900">
                  {item.article_quantity ?? "--"} {item.article_weight ? `- ${Number(item.article_weight).toFixed(3)} kg` : ""}
                </span>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Storage</p>
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">
                    {item.storage_location?.SPM_Name || "Not allocated"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Article & Remarks Details */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Article Details</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Size</p>
                <span className="text-sm text-gray-900">{item.article_size || "--"}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Weight</p>
                <span className="text-sm text-gray-900">
                  {item.article_weight ? `${Number(item.article_weight).toFixed(4)} kg` : "--"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Quantity</p>
                <span className="text-sm text-gray-900">{item.article_quantity ?? "--"}</span>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-0.5">Description</p>
                <span className="text-sm text-gray-900">{item.article_description || "--"}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Entry By</p>
                <span className="text-sm text-gray-900">
                  {item.creator_type === "devotee" ? "Devotee Portal" : "Admin Office"}
                </span>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-500 mb-0.5">Remarks</p>
                <span className="text-sm text-gray-900">{item.remarks || "--"}</span>
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
                  <span className="text-sm text-gray-900">{item.donor_name || "--"}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">{item.donor_phone || "--"}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900 truncate">{item.donor_email || "--"}</span>
                </div>
              </div>
            </div>

            {/* Co-Donors List */}
            {Array.isArray(item.co_donors) && item.co_donors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-amber-600" /> Co-Donors
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.co_donors.map((cd, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      <User className="h-3 w-3 text-amber-600" />
                      {typeof cd === "object" ? cd.name : cd}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                    key={d.doc_id}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {d.doc_name || "Document"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {d.doc_size_kb ? `${Number(d.doc_size_kb).toFixed(0)} KB` : "Document"}
                      </p>
                    </div>
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

            {(item.missing_documents || []).length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4" />
                Mandatory documents pending: {(item.missing_documents || []).join(", ")} - approval blocked.
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
                  <h3 className="text-lg font-semibold text-gray-900">{docPreview.doc_name || "Document"}</h3>
                  <p className="text-sm text-gray-500">{docPreview.doc_size_kb ? `${Number(docPreview.doc_size_kb).toFixed(0)} KB` : ""}</p>
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

        {/* Action Buttons */}
        {Boolean(forwardAction || queryAction) && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Approval Actions</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Review this article donation and take appropriate action
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

        {!forwardAction && !queryAction && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
            {finalApproved ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Approved &amp; Completed</h3>
                <p className="text-gray-600 text-sm mt-1">
                  This article donation has been fully approved and processed.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Waiting for Next Approver</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Current stage: <strong>{item.status_name}</strong>. You do not have pending actions on this article donation.
                </p>
              </>
            )}
          </div>
        )}
      </div>
      {/* END CONTENT */}

      {/* ACTION MODAL (forward) */}
      {actionModal && !queryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{actionModal.St_Name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {forwardAction && actionModal.Act_Id === forwardAction.Act_Id
                  ? "Approve article donation and forward to next stage"
                  : "Article donation will be rejected"}
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
                    Final approval will store article at this estate location
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={actionRemark}
                  onChange={(e) => setActionRemark(e.target.value)}
                  placeholder="Optional remarks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  rows={2}
                />
              </div>

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

      {/* QUERY MODAL */}
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

export default ArticleDonationApprovalView;

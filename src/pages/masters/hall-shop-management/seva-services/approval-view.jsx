import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import SevaApprovalApi from "../../../services/sevaapprovalapi";
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  Clock,
  Hash,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Printer,
  Copy,
  UserCheck,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  Check,
  X,
  Eye,
  CreditCard,
  Package,
  IndianRupee,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  RefreshCw,
} from "lucide-react";
import { canPerformAction } from "../../../../utils/approvalPermission";

/**
 * Seva Booking Approval - VIEW page
 *
 * Design: Shop Rent Application Approval view jaisa (same cards, same
 * Approval Actions block, same modals).
 *
 * Flow: Booking -> HOD Approved -> Admin Approved -> (final) Approved
 *        (Action Master stage SEV se 100% dynamic)
 */
const SevaApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [chain, setChain] = useState([]);
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [priestId, setPriestId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [bRes, pRes, cRes] = await Promise.all([
        SevaApprovalApi.getById(id),
        SevaApprovalApi.getPriests().catch(() => ({ data: [] })),
        SevaApprovalApi.getApprovalChain("SEV").catch(() => ({ data: [] })),
      ]);

      if (bRes?.success) setItem(bRes.data);
      if (pRes?.success) setPriests(pRes.data || []);
      if (cRes?.success) setChain(cRes.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Current step (jo perform karna hai)
  const currentAction = useMemo(
    () => chain.find((s) => String(s.Act_Id) === String(item?.action_id)),
    [chain, item]
  );

  // Next forward step
  const nextAction = useMemo(
    () =>
      chain.find(
        (s) =>
          String(s.Previous_Status) === String(item?.action_id) && s.Is_Forward === "Y"
      ),
    [chain, item]
  );

  // Query (backward) step
  const backwardAction = useMemo(
    () =>
      chain.find(
        (s) =>
          String(s.Previous_Status) === String(item?.action_id) && s.Is_Forward === "N"
      ),
    [chain, item]
  );

  // Authority CURRENT step ki (Seva flow jaisa)
  const canApprove = useMemo(() => {
    if (!currentAction) return false;
    return canPerformAction(user, currentAction);
  }, [currentAction, user]);

  const showApproveButton = canApprove && !!nextAction;
  const showQueryButton = canApprove && !!backwardAction;

  const isFinal =
    ["APPROVED", "COMPLETED", "PERFORMED", "CANCELLED", "REJECTED"].includes(
      item?.status
    );

  const handleApprove = async () => {
    if (!nextAction) {
      toast.error("Cannot determine next status");
      return;
    }

    // Shop approval view jaisa - confirmation popup
    const result = await Swal.fire({
      title: `${nextAction.St_Name} Booking?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this seva booking?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${nextAction.St_Name}`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsUpdating(true);
      const res = await SevaApprovalApi.approve(id, { remarks: "Approved" });
      if (res?.success) {
        toast.success(
          res?.data?.status === "APPROVED"
            ? "Booking approved successfully"
            : `Approved - moved to ${nextAction.St_Name}`
        );
        navigate("/masters/hall-shop-management/seva-bookings-approval");
      } else {
        toast.error(res?.message || "Approval failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRaiseQuery = async () => {
    if (!queryRemark.trim()) {
      toast.error("Please provide query details");
      return;
    }
    try {
      setIsUpdating(true);
      const res = await SevaApprovalApi.raiseQuery(id, queryRemark.trim());
      if (res?.success) {
        toast.success("Query raised successfully");
        setQueryModal(false);
        setQueryRemark("");
        navigate("/masters/hall-shop-management/seva-bookings-approval");
      } else {
        toast.error(res?.message || "Failed to raise query");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to raise query");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }
    try {
      setIsUpdating(true);
      const res = await SevaApprovalApi.reject(id, rejectReason.trim());
      if (res?.success) {
        toast.success("Booking rejected");
        setRejectModal(false);
        setRejectReason("");
        navigate("/masters/hall-shop-management/seva-bookings-approval");
      } else {
        toast.error(res?.message || "Failed to reject");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to reject");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignPriest = async () => {
    if (!priestId) {
      toast.error("Please select a priest");
      return;
    }
    try {
      setIsUpdating(true);
      const res = await SevaApprovalApi.assignPriest(id, priestId, "LEAD");
      if (res?.success) {
        toast.success("Priest assigned successfully");
        setPriestId("");
        load();
      } else {
        toast.error(res?.message || "Failed to assign priest");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to assign priest");
    } finally {
      setIsUpdating(false);
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
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = () => {
    if (!item) return null;

    const statusName = item.status || "Pending";
    const lower = statusName.toLowerCase();

    let colorClass = "bg-yellow-100 text-yellow-800";

    if (lower.includes("approv")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (lower.includes("reject") || lower.includes("query")) {
      colorClass = "bg-red-100 text-red-800";
    } else if (lower.includes("pend") || lower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (lower.includes("schedul")) {
      colorClass = "bg-indigo-100 text-indigo-800";
    } else if (lower.includes("complet") || lower.includes("perform")) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
        >
          <Clock className="h-4 w-4 mr-2" />
          {statusName.replace(/_/g, " ")}
        </span>
        {item.status === "QUERY_RAISED" && item.remarks && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            Query: {item.remarks}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The booking with ID #{id} does not exist.
          </p>
          <button
            onClick={() =>
              navigate("/masters/hall-shop-management/seva-bookings-approval")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Approvals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/hall-shop-management/seva-bookings-approval")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Approval</h1>
            <p className="text-gray-600 mt-1">
              Booking for{" "}
              <span className="font-semibold">
                {item.service?.name || "—"}
              </span>
              <button
                onClick={() => copyToClipboard(item.service?.name || "")}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy seva name"
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

      {/* Main Content */}
      <div className="space-y-6">
        {/* Booking Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Booking Information
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Receipt No</p>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {item.receipt_no}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Booking Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">
                    {formatDate(item.booking_date)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Seva</p>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">
                    {item.service?.name || "—"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Package</p>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">
                    {item.package?.name || "—"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.total_amount)}
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

        {/* Seva Details Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Seva Details</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Perform Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(item.perform_date)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Time Slot</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.slot
                      ? `${String(item.slot.start_time).slice(0, 5)} - ${String(
                          item.slot.end_time
                        ).slice(0, 5)}`
                      : "Any time"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Persons</p>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.group_size ?? item.persons} group · {item.persons} served
                  </span>
                </div>
              </div>
              {item.package?.included_list?.length > 0 && (
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500 mb-1">What's included</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {item.package.included_list.map((inc, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-sm text-gray-700"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Devotee Details Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Devotee Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {item.devotee_name || "—"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mobile</p>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {item.devotee_mobile || "—"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900 truncate">
                    {item.devotee_email || "—"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Gotra</p>
                <span className="text-sm text-gray-900">{item.gotra || "—"}</span>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {item.address || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        {(item.documents || []).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Uploaded Documents
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.documents.map((d) => (
                  <div
                    key={d.document_id}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {d.doc_type}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {d.file_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Priest Assignment Card */}
        {item.service?.priest_required && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-amber-50 to-amber-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Priest Assignment
              </h2>
            </div>
            <div className="px-5 py-4">
              {item.priest_id ? (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-gray-900">
                    Priest assigned:{" "}
                    <strong>
                      {item.priest_assignments?.[0]?.priest?.name ||
                        `#${item.priest_id}`}
                    </strong>
                  </span>
                </div>
              ) : isFinal ? (
                <p className="text-sm text-gray-600">
                  No priest was assigned to this booking.
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    This seva requires a priest. Please assign one before
                    approving.
                  </p>
                  <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <select
                      value={priestId}
                      onChange={(e) => setPriestId(e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="">— select priest —</option>
                      {priests.map((p) => (
                        <option key={p.priest_id} value={p.priest_id}>
                          {p.name}
                          {p.gadi ? ` · ${p.gadi}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignPriest}
                      disabled={isUpdating || !priestId}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm whitespace-nowrap"
                    >
                      {isUpdating ? "Assigning..." : "Assign Priest"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Approval Actions */}
        {(showApproveButton || showQueryButton) && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Approval Actions
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Review this seva booking and take appropriate action
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
              {showQueryButton && backwardAction && (
                <div className="flex-1 w-full md:w-auto max-w-xs">
                  <button
                    onClick={() => setQueryModal(true)}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        {isUpdating ? "Processing..." : backwardAction.St_Name}
                      </div>
                      <div className="text-[10px] font-normal opacity-80">
                        Return to previous stage
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {!showQueryButton && <div className="flex-1"></div>}

              {showApproveButton && nextAction && (
                <div className="flex-1 w-full md:w-auto max-w-xs">
                  <button
                    onClick={handleApprove}
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
                        {isUpdating ? "Processing..." : nextAction.St_Name}
                      </div>
                      <div className="text-[10px] font-normal opacity-80">
                        Forward to next stage
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {!showApproveButton && <div className="flex-1"></div>}
            </div>
          </div>
        )}

        {/* No Action Required Message */}
        {!showApproveButton && !showQueryButton && item.status && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
            {nextAction ? (
              <>
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Waiting for Another Approver
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  The next step is <strong>{nextAction.St_Name}</strong>. You do
                  not have permission to perform this action.
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  No Action Required
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  This booking has been fully processed and does not require any
                  further approval.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Query Modal */}
      {queryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {backwardAction?.St_Name || "Raise Query"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide details for returning to previous stage
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
                  The booking will go back to the devotee for clarification
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setQueryModal(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRaiseQuery}
                  disabled={isUpdating || !queryRemark.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {backwardAction?.St_Name || "Raise Query"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reject Booking</h3>
              <p className="text-sm text-gray-600 mt-1">
                The devotee will be informed and the amount will be refunded.
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-32"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setRejectModal(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isUpdating || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SevaApprovalView;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  Hash,
  Banknote,
  Receipt,
  Printer,
  Copy,
  Loader2,
  AlertCircle,
  Eye,
  UserCheck,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { newChallanFlowService } from "../../../services/newchallanflowservice";
import {
  generateToken as generateKotakToken,
  getPaymentStatus,
  getCmsStatusLabel,
  aggregateInstrumentPyStatus,
  pickPrimaryUtr,
} from "../../../services/kotakcmspaymentapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ManagePaymentsView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();
  const [summary, setSummary] = useState({
    total: 0,
    cash: 0,
    bank: 0,
    cheque: 0,
    dd: 0,
    online: 0,
    card: 0,
  });
  const [totalPenalty, setTotalPenalty] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
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

  // Get status from status_master or RStatus
  const getStatusDisplay = () => {
    if (voucher?.RStatus) {
      return voucher.RStatus.St_Name || "Pending";
    }
    if (voucher?.status_master) {
      return voucher.status_master.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = () => {
    const statusName = getStatusDisplay();

    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (
      statusLower.includes("approv") ||
      statusLower.includes("accept") ||
      statusLower.includes("verify") ||
      statusLower.includes("success") ||
      statusLower.includes("complete")
    ) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("decline") ||
      statusLower.includes("query") ||
      statusLower.includes("failed")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (
      statusLower.includes("pend") ||
      statusLower.includes("wait") ||
      statusLower.includes("initiate")
    ) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (
      statusLower.includes("verif") ||
      statusLower.includes("check") ||
      statusLower.includes("pending")
    ) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        <Clock className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  const getBranchDisplay = () => {
    if (!voucher?.department) return "N/A";
    const dept = voucher.department;
    let displayText = dept.Dpt_Desc || "";
    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }
    return displayText;
  };

  const getLedgerDisplay = (detail) => {
    if (!detail.ledger) return detail.Lg_Name || "N/A";
    const ledger = detail.ledger;
    let displayText = ledger.Lg_Name || "";
    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      displayText += ` (${ledger.Lg_Eng_Name})`;
    }
    if (ledger.Lg_Code) {
      displayText += ` - ${ledger.Lg_Code}`;
    }
    return displayText;
  };

  const getPaymentModeBadge = (mode) => {
    const styles = {
      Cash: "bg-green-100 text-green-800",
      Bank: "bg-blue-100 text-blue-800",
      Cheque: "bg-yellow-100 text-yellow-800",
      DD: "bg-orange-100 text-orange-800",
      Online: "bg-purple-100 text-purple-800",
      Card: "bg-pink-100 text-pink-800",
      MChallan: "bg-teal-100 text-teal-800",
    };
    return styles[mode] || "bg-gray-100 text-gray-800";
  };

  const getTotalAmount = () => {
    if (!voucher?.Net_Amount) return 0;
    return parseFloat(voucher.Net_Amount) || 0;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const loadVoucher = async () => {
    setLoading(true);
    try {
      const response = await newChallanFlowService.getById(id);
      const voucherData =
        response.data && response.data[0] ? response.data[0] : response.data;
      setVoucher(voucherData);

      let totalPenaltyAmount = 0;
      if (voucherData?.details) {
        voucherData.details.forEach((detail) => {
          totalPenaltyAmount += parseFloat(detail.Penalty_Amount) || 0;
        });
        const calcSummary = newChallanFlowService.calculateSummary(
          voucherData.details,
        );
        setSummary(calcSummary);
        setTotalPenalty(totalPenaltyAmount);
      }
    } catch (error) {
      console.error("Error loading voucher:", error);
      toast.error("Failed to load voucher data!");
      navigate("/transactions/bookkeeping-vouchers/manage-payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoucher();
  }, [id]);

  const handleRefreshCmsStatus = async () => {
    if (!voucher?.Cms_Message_Id) {
      toast.error(
        "No CMS MessageId on this voucher. Initiate payment from the list first.",
      );
      return;
    }

    setRefreshingStatus(true);
    try {
      const tokenResult = await generateKotakToken();
      if (!tokenResult.success) {
        toast.error(tokenResult.error || "Token generation failed");
        return;
      }

      const statusResult = await getPaymentStatus(
        {
          messageId: voucher.Cms_Message_Id,
          instRefNo: voucher.Cms_Inst_Ref_No || undefined,
        },
        tokenResult.access_token,
      );

      if (!statusResult.success) {
        toast.error(statusResult.error || "Status enquiry failed");
        return;
      }

      const detailsStatus = statusResult.details || [];
      const pyStatus = aggregateInstrumentPyStatus(detailsStatus);
      const utr = pickPrimaryUtr(detailsStatus);
      const cmsStatus =
        detailsStatus[0]?.statusCode ||
        detailsStatus[0]?.Status_Code ||
        statusResult.statusCode ||
        voucher.Cms_Status;

      await newChallanFlowService.bulkUpdateStatus([voucher.CV_Id], {
        Py_Status: pyStatus,
        Cms_Message_Id: voucher.Cms_Message_Id,
        Cms_Inst_Ref_No:
          voucher.Cms_Inst_Ref_No || statusResult.instRefNo || "",
        Cms_Status: cmsStatus,
        Cms_Utr: utr,
        Cms_Pay_Mode: voucher.Cms_Pay_Mode || "",
      });

      toast.success(
        pyStatus == "success"
          ? `Payment confirmed${utr ? ` (UTR: ${utr})` : ""}`
          : pyStatus == "failed"
            ? `Payment failed: ${getCmsStatusLabel(cmsStatus)}`
            : `Still pending: ${getCmsStatusLabel(cmsStatus)}`,
      );
      await loadVoucher();
    } catch (error) {
      console.error("Refresh CMS status error:", error);
      toast.error(error.message || "Failed to refresh payment status");
    } finally {
      setRefreshingStatus(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!voucher) return;

    const result = await Swal.fire({
      title: "Process Payment",
      html: `
        <div style="text-align: left;">
          <p><strong>Open the Manage Payments list to initiate Kotak CMS payment.</strong></p>
          <p class="text-sm text-gray-600 mt-2">Voucher: ${voucher.CV_No}</p>
          <p class="text-sm text-gray-600 mt-1">Amount: ${formatCurrency(getTotalAmount())}</p>
          <p class="text-sm text-amber-700 mt-2">CMS initiate requires debit bank selection and organisation context from the list screen.</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Go to List",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;
    navigate("/transactions/bookkeeping-vouchers/manage-payments");
  };

  // Print Report Content - Same as NewExpenseChallanApprovalView
  const PrintReportContent = () => {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Payment Voucher Report</h2>
        <div className="mb-4">
          <p>
            <strong>Voucher No:</strong> {voucher?.CV_No}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(voucher?.Ch_Date)}
          </p>
          <p>
            <strong>Branch:</strong> {getBranchDisplay()}
          </p>
          <p>
            <strong>Status:</strong> {getStatusDisplay()}
          </p>
          <p>
            <strong>Total Amount:</strong> {formatCurrency(summary.total)}
          </p>
          <p>
            <strong>Net Payable:</strong> {formatCurrency(getTotalAmount())}
          </p>
        </div>
        {voucher?.details && voucher.details.length > 0 && (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">
                  Sr.
                </th>
                <th className="border border-gray-300 px-2 py-1 text-left">
                  Ledger
                </th>
                <th className="border border-gray-300 px-2 py-1 text-left">
                  Vendor
                </th>
                <th className="border border-gray-300 px-2 py-1 text-left">
                  Payment Mode
                </th>
                <th className="border border-gray-300 px-2 py-1 text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {voucher.details.map((detail, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-2 py-1">
                    {detail.CV_Sr}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {getLedgerDisplay(detail)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {detail.SL_Nm || "—"}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {detail.Payment_Mode}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatCurrency(detail.Amount)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td
                  colSpan="4"
                  className="border border-gray-300 px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {formatCurrency(summary.total)}
                </td>
              </tr>
              <tr className="bg-green-50 font-bold">
                <td
                  colSpan="4"
                  className="border border-gray-300 px-2 py-1 text-right"
                >
                  Net Payable
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right text-green-600">
                  {formatCurrency(getTotalAmount())}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">Not Found</h2>
        <button
          onClick={() =>
            navigate("/transactions/bookkeeping-vouchers/manage-payments")
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Layout - Same as NewExpenseChallanApprovalView */}
      {showPrint && (
        <PrintLayout
          title="Payment Voucher Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      {/* Header - Same as NewExpenseChallanApprovalView */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate("/transactions/bookkeeping-vouchers/manage-payments")
              }
              className="mr-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Payment Voucher Details
              </h1>
              <p className="text-sm text-gray-500">
                Voucher No:{" "}
                <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                  {voucher.CV_No}
                </span>
                <button
                  onClick={() => copyToClipboard(voucher.CV_No)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  title="Copy voucher number"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrint(true)}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            {(voucher.Py_Status == "pending" ||
              voucher.Py_Status == "failed") &&
              voucher.Cms_Message_Id && (
              <button
                onClick={handleRefreshCmsStatus}
                disabled={refreshingStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                {refreshingStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Status
              </button>
            )}
            {voucher.Py_Status == "initiate" && (
              <button
                onClick={handleProcessPayment}
                disabled={processingPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
              >
                {processingPayment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Banknote className="h-4 w-4 mr-2" />
                )}
                Pay via Kotak
              </button>
            )}
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="p-4 mx-auto max-w-full">
        <div className="space-y-6">
          {/* Voucher Information - Same as NewExpenseChallanApprovalView */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Voucher Information
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
                <div className="flex-1 px-4 first:pl-0 min-w-[150px]">
                  <p className="text-xs text-gray-500 mb-0.5">Bill No.</p>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 break-all">
                      {voucher.CV_No}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4 min-w-[150px]">
                  <p className="text-xs text-gray-500 mb-0.5">Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">
                      {formatDate(voucher.Ch_Date)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4 min-w-[150px]">
                  <p className="text-xs text-gray-500 mb-0.5">Branch</p>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">
                      {getBranchDisplay()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4 min-w-[150px]">
                  <p className="text-xs text-gray-500 mb-0.5">Tender Type</p>
                  <div className="flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">
                      {voucher.tender_type?.TnT_Name || "—"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4 min-w-[150px]">
                  <p className="text-xs text-gray-500 mb-0.5">Status</p>
                  {getStatusBadge()}
                </div>
                {voucher.HOD_User?.Usr_Name && (
                  <div className="flex-1 px-4 min-w-[150px]">
                    <p className="text-xs text-gray-500 mb-0.5">Verified By</p>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900">
                        {voucher.HOD_User.Usr_Name}
                      </span>
                    </div>
                  </div>
                )}
                {voucher.Acc_Chl_No && (
                  <div className="flex-1 px-4 min-w-[150px]">
                    <p className="text-xs text-gray-500 mb-0.5">Voucher No.</p>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-600">
                        {voucher.Acc_Chl_No}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kotak CMS Payment Info */}
          {(voucher.Cms_Message_Id ||
            voucher.Cms_Utr ||
            voucher.Cms_Status ||
            voucher.Cms_Pay_Mode ||
            voucher.Py_Status == "pending" ||
            voucher.Py_Status == "success" ||
            voucher.Py_Status == "failed") && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-5 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-base font-semibold text-gray-900">
                  Kotak CMS Payment
                </h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Pay Mode</p>
                  <p className="font-medium text-gray-900">
                    {voucher.Cms_Pay_Mode || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Message Id</p>
                  <p className="font-mono text-gray-900 break-all">
                    {voucher.Cms_Message_Id || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Inst Ref No</p>
                  <p className="font-mono text-gray-900 break-all">
                    {voucher.Cms_Inst_Ref_No || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Bank Status</p>
                  <p className="font-medium text-gray-900">
                    {voucher.Cms_Status
                      ? `${getCmsStatusLabel(voucher.Cms_Status)} (${voucher.Cms_Status})`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">UTR</p>
                  <p className="font-mono font-semibold text-green-700 break-all">
                    {voucher.Cms_Utr || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Challan Details - Same as NewExpenseChallanApprovalView */}
          {voucher.details && voucher.details.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Challan Details ({voucher.details.length} items)
                </h2>
              </div>
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Sr.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Ledger Account
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Vendor Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          GST No
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Payment Mode
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Cheque/DD No.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Cheque/DD Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Bank Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Account No.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          IFSC Code
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Receipt Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          File No.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Remarks
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          Amount (₹)
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          Penalty (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {voucher.details.map((detail, idx) => {
                        const isCheque =
                          detail.Payment_Mode == "Cheque" ||
                          detail.Payment_Mode == "DD";
                        const isBank =
                          detail.Payment_Mode == "Bank" ||
                          detail.Payment_Mode == "Online" ||
                          detail.Payment_Mode == "Card";
                        const penalty = parseFloat(detail.Penalty_Amount) || 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-center">
                              {detail.CV_Sr}
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs font-medium">
                                {getLedgerDisplay(detail)}
                              </div>
                              {detail.budget_head && (
                                <div className="text-[10px] text-gray-500">
                                  Budget: {detail.budget_head.Gr_Nm}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {detail.SL_Nm || "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {detail.GST_No || "—"}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getPaymentModeBadge(detail.Payment_Mode)}`}
                              >
                                {detail.Payment_Mode}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isCheque ? detail.Chq_No || "—" : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isCheque ? formatDate(detail.Chq_Date) : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isBank || isCheque
                                ? detail.Bank_Name || "—"
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isBank ? detail.Acc_No || "—" : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isBank ? detail.IFSC_Code || "—" : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {formatDate(detail.Rec_Date)}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {detail.FileNo || "—"}
                            </td>
                            <td className="px-3 py-2 text-xs max-w-[200px] break-words">
                              {detail.Remarks || detail.remark || "—"}
                            </td>
                            <td className="px-3 py-2 text-xs text-right font-medium">
                              {formatCurrency(detail.Amount)}
                            </td>
                            <td className="px-3 py-2 text-xs text-right text-red-600">
                              {penalty > 0 ? formatCurrency(penalty) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100 border-t-2 border-gray-300">
                        <td
                          colSpan="13"
                          className="px-3 py-3 text-right text-xs font-semibold text-gray-800"
                        >
                          Total Amount:
                        </td>
                        <td className="px-3 py-3 text-right text-xs font-semibold text-gray-800">
                          {formatCurrency(summary.total)}
                        </td>
                        <td className="px-3 py-3 text-right text-xs font-semibold text-red-600">
                          {totalPenalty > 0
                            ? formatCurrency(totalPenalty)
                            : "—"}
                        </td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td
                          colSpan="13"
                          className="px-3 py-3 text-right text-xs font-bold text-gray-900"
                        >
                          Net Payable:
                        </td>
                        <td className="px-3 py-3 text-right text-xs font-bold text-green-600">
                          {formatCurrency(getTotalAmount())}
                        </td>
                        <td className="px-3 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePaymentsView;

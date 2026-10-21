import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Building,
  Users,
  CreditCard,
  Receipt,
  Printer,
  AlertCircle,
  Info,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Percent,
  Plus,
  Minus,
  Calendar,
  Hash,
  DollarSign,
  BookOpen,
  Briefcase,
  Copy,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { BillChallanEntryApi } from "../../../services/billchallanentryapi";

const ViewBillChallanEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    loadVoucherData();
  }, [id]);

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const response = await BillChallanEntryApi.getById(id);
      if (response.success && response.data) {
        setVoucher(response.data);
      } else {
        toast.error("Failed to load payment voucher details");
        navigate("/transactions/vendor-payments/bill-challan-entry");
      }
    } catch (error) {
      toast.error("Failed to load payment voucher details");
      console.error(error);
      navigate("/transactions/vendor-payments/bill-challan-entry");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
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

  const getStatusBadge = (status, remarks = null) => {
    const statusConfig = {
      draft: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        label: "Draft",
        icon: Clock,
        bgColor: "bg-yellow-50",
      },
      hod_app: {
        color: "bg-green-100 text-green-800 border border-green-200",
        label: "HOD Approved",
        icon: CheckCircle,
        bgColor: "bg-green-50",
      },
      hod_query: {
        color: "bg-amber-100 text-amber-800 border border-amber-200",
        label: "HOD Query",
        icon: AlertCircle,
        bgColor: "bg-amber-50",
      },
      acco_app: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        label: "Accounts Approved",
        icon: TrendingUp,
        bgColor: "bg-blue-50",
      },
      acco_query: {
        color: "bg-orange-100 text-orange-800 border border-orange-200",
        label: "Accounts Query",
        icon: XCircle,
        bgColor: "bg-orange-50",
      },
      paid: {
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        label: "Paid",
        icon: DollarSign,
        bgColor: "bg-purple-50",
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <div className="flex flex-col gap-2">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${config.color}`}
        >
          <IconComponent className="h-3 w-3 mr-1.5" />
          {config.label}
        </span>

        {/* Show query remarks for query statuses */}
        {(status?.toLowerCase() == "hod_query" ||
          status?.toLowerCase() == "acco_query") &&
          remarks && (
            <div
              className={`mt-1 p-2 ${config.bgColor} border ${config.color.replace("text-", "border-").split(" ")[0]} rounded-lg`}
            >
              <div className="flex items-start">
                <HelpCircle className="h-3 w-3 text-current mt-0.5 mr-1.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-medium mb-0.5">
                    {status?.toLowerCase() == "hod_query"
                      ? "HOD Query:"
                      : "Accounts Query:"}
                  </div>
                  <div className="whitespace-pre-line">{remarks}</div>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const calculateTotals = () => {
    const grossAmount = parseFloat(voucher?.Gross_Amt || 0);
    const addAmount = parseFloat(voucher?.Add_Amt || 0);
    const lessAmount = parseFloat(voucher?.Less_Amt || 0);
    const netAmount = parseFloat(voucher?.Net_Amt || 0);

    // Process pay_details for breakdown
    const taxBreakdown = [];
    const penaltyBreakdown = [];

    if (voucher?.pay_details && Array.isArray(voucher.pay_details)) {
      voucher.pay_details.forEach((detail) => {
        const isAdd = parseInt(detail.Add_Dedu) == 1;
        const amount = parseFloat(detail.IC_Amt || 0);
        const isTax = detail.PD_Ty == "TAX";

        const item = {
          type: detail.PD_Ty,
          tax_type: detail.PD_Ty == "TAX" ? "Tax" : "Penalty",
          tax_name: detail.PD_Ty == "TAX" ? "Tax" : "Penalty",
          tax_percentage: parseFloat(detail.Percent || 0),
          calculated_amount: amount,
          add_deduct: isAdd ? 1 : 0,
          isAdd: isAdd,
          pvd_sr: parseInt(detail.PVD_Sr || 0),
          vip_id: detail.VIP_Id,
          ic_id: detail.IC_Id,
          lg_id: detail.Lg_Id,
          tender_type: detail.tender_type,
          vendor_parameter: detail.vendor_parameter,
          invoice_charge: detail.invoice_charge,
          ledger: detail.ledger,
          formula: detail.Formula || "",
        };

        if (isTax) {
          taxBreakdown.push(item);
        } else {
          penaltyBreakdown.push(item);
        }
      });
    }

    // Sort by PVD_Sr to maintain sequence
    taxBreakdown.sort((a, b) => a.pvd_sr - b.pvd_sr);
    penaltyBreakdown.sort((a, b) => a.pvd_sr - b.pvd_sr);

    return {
      grossAmount,
      addAmount,
      lessAmount,
      netAmount,
      taxBreakdown,
      penaltyBreakdown,
      hasTaxes: taxBreakdown.length > 0 || penaltyBreakdown.length > 0,
    };
  };

  const totals = calculateTotals();

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      const printContent = document.getElementById("printable-voucher");
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();

      setIsPrinting(false);
    }, 100);
  };

  // Check if edit button should be shown
  const canEditVoucher = () => {
    if (!voucher) return false;
    const editableStatuses = ["draft", "hod_query", "acco_query"];
    return editableStatuses.includes(voucher.Status?.toLowerCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">
            Loading payment voucher details...
          </p>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment Voucher Not Found
          </h3>
          <button
            onClick={() =>
              navigate("/transactions/vendor-payments/bill-challan-entry")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Vouchers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/vendor-payments/bill-challan-entry")
            }
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment Voucher Details
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Voucher No:{" "}
              <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                {voucher.PV_No}
              </span>
              <button
                onClick={() => copyToClipboard(voucher.PV_No)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy voucher number"
              >
                <Copy className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm disabled:opacity-50 shadow-sm"
          >
            {isPrinting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            {isPrinting ? "Printing..." : "Print Voucher"}
          </button>

          {canEditVoucher() && (
            <button
              onClick={() =>
                navigate(
                  `/transactions/vendor-payments/bill-challan-entry/edit/${id}`,
                )
              }
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit Voucher
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Voucher Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voucher Summary Card - Improved design to match list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-200 mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">
                    Voucher Summary
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(voucher.Status, voucher.Remarks)}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side - Voucher details */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill Date
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDate(voucher.PV_Chln_Date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Hash className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voucher Number
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {voucher.PV_No}
                        </span>
                        <button
                          onClick={() => copyToClipboard(voucher.PV_No)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy voucher number"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Department & Ledger combined (matching list) */}
                <div className="space-y-4">
                  {/* Department Section */}
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {voucher.department?.Dpt_Desc || "N/A"}
                      </div>
                      {voucher.department?.Dpt_Name && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {voucher.department.Dpt_Name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ledger Section */}
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ledger Details
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {voucher.ledger?.Lg_Name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {voucher.ledger?.Lg_Eng_Name || ""}
                      </div>
                      {voucher.ledger?.Lg_Code && (
                        <div className="text-xs text-gray-500 italic">
                          {voucher.ledger.Lg_Code}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor & Work Description Card (matching list) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-sm shadow-yellow-200 mr-3">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  Vendor / Work Description
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vendor Section */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Name
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {voucher.sub_ledger?.SL_Name || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Description Section */}
                {voucher.work_allocation?.tender && (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Work Description
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          {voucher.work_allocation.tender.Description || "N/A"}
                        </div>
                        {voucher.work_allocation.tender.tendertype && (
                          <div className="text-xs text-gray-500 mt-2">
                            Type:{" "}
                            {voucher.work_allocation.tender.tendertype.TnT_Name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          {voucher.sub_ledger &&
            (voucher.sub_ledger.Bank_Name ||
              voucher.sub_ledger.Account_Number) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm shadow-purple-200 mr-3">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-semibold text-gray-900">
                      Bank Details
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Bank Name
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.Bank_Name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Account Number
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.Account_Number || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        IFSC Code
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.IFSC_Code || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Account Type
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.Account_Type || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Remarks Card */}
          {voucher.Remarks && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center shadow-sm shadow-gray-200 mr-3">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">Remarks</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-line text-sm text-gray-700">
                  {voucher.Remarks}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Amount Details */}
        <div className="space-y-6">
          {/* Amount Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-sm shadow-green-200 mr-3">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">Amount Details</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Bill Gross Amount */}
                <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        Bill Gross Amount
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      {formatCurrency(totals.grossAmount)}
                    </div>
                  </div>
                </div>

                {/* Tax Breakdown */}
                {totals.hasTaxes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-3">
                      Tax Breakdown
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {/* Tax items - displayed in sequence by PVD_Sr */}
                      {totals.taxBreakdown.map((tax) => (
                        <div
                          key={`tax-${tax.pvd_sr}`}
                          className={`p-3 rounded-lg ${
                            tax.isAdd
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-xs">
                                {tax.invoice_charge?.IC_Name || "Tax"}
                              </div>
                              <div className="flex items-center mt-1">
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    tax.isAdd
                                      ? "bg-green-200 text-green-800"
                                      : "bg-red-200 text-red-800"
                                  }`}
                                >
                                  {tax.isAdd ? "Addition" : "Deduction"}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`text-sm font-bold whitespace-nowrap ml-3 ${tax.isAdd ? "text-green-600" : "text-red-600"}`}
                            >
                              {tax.isAdd ? "+" : "-"}
                              {formatCurrency(tax.calculated_amount)}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Penalty items - displayed in sequence by PVD_Sr */}
                      {totals.penaltyBreakdown.map((penalty) => (
                        <div
                          key={`penalty-${penalty.pvd_sr}`}
                          className={`p-3 rounded-lg ${
                            penalty.isAdd
                              ? "bg-amber-50 border border-amber-200"
                              : "bg-orange-50 border border-orange-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-xs">
                                {penalty.ledger?.Lg_Name || "Penalty"}
                                {" "}(Penalty)
                                {penalty.tax_percentage > 0 && String(penalty.formula || "").trim() != "*"
                                  ? ` (${penalty.tax_percentage}%)`
                                  : ""}
                              </div>
                              <div className="flex items-center mt-1">
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    penalty.isAdd
                                      ? "bg-amber-200 text-amber-800"
                                      : "bg-orange-200 text-orange-800"
                                  }`}
                                >
                                  {penalty.isAdd ? "Addition" : "Deduction"}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`text-sm font-bold whitespace-nowrap ml-3 ${penalty.isAdd ? "text-green-600" : "text-red-600"}`}
                            >
                              {penalty.isAdd ? "+" : "-"}
                              {formatCurrency(penalty.calculated_amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tax Totals */}
                    <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-700 font-medium text-sm">
                          Total Additions:
                        </span>
                        <span className="font-bold text-green-600 text-sm">
                          +{formatCurrency(totals.addAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-700 font-medium text-sm">
                          Total Deductions:
                        </span>
                        <span className="font-bold text-red-600 text-sm">
                          -{formatCurrency(totals.lessAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Amount */}
                <div className="bg-gradient-to-r from-green-100 to-green-50 p-5 rounded-xl border-2 border-green-300 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">
                        Net Payable Amount
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(totals.netAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Content (Hidden) */}
      <div id="printable-voucher" className="hidden">
        <div className="p-8">
          {/* Government Header */}
          <div className="text-center border-b-4 border-blue-900 pb-4 mb-8">
            <div className="bg-blue-900 text-white py-4 mb-4">
              <h1 className="text-3xl font-bold">
                Ambaji Temple
              </h1>
              <h2 className="text-2xl font-semibold mt-2">PAYMENT VOUCHER</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 text-left">
              <div>
                <p>
                  <strong>Voucher No:</strong> {voucher.PV_No}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(voucher.PV_Chln_Date)}
                </p>
                <p>
                  <strong>PV Type:</strong> {voucher.PV_Ty || "VEND"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {voucher.Status?.toUpperCase() || "DRAFT"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Department:</strong>{" "}
                  {voucher.department?.Dpt_Desc || "N/A"}
                </p>
                <p>
                  <strong>Ledger:</strong>{" "}
                  {voucher.ledger
                    ? `${voucher.ledger.Lg_Code} - ${voucher.ledger.Lg_Name}`
                    : `ID: ${voucher.Lg_Id}`}
                </p>
                <p>
                  <strong>Vendor:</strong>{" "}
                  {voucher.sub_ledger
                    ? `${voucher.sub_ledger.SL_Name} (${voucher.sub_ledger.SL_Code})`
                    : `ID: ${voucher.SL_Id}`}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Details */}
          {voucher.sub_ledger && (
            <div className="mb-8">
              <h3 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
                VENDOR DETAILS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Vendor Name:</strong> {voucher.sub_ledger.SL_Name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Work Description */}
          {voucher.work_allocation?.tender && (
            <div className="mb-8">
              <h3 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
                WORK DESCRIPTION
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Work Allocation ID:</strong>{" "}
                    {voucher.work_allocation.WA_Id}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {voucher.work_allocation.tender.Description}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Tender Type:</strong>{" "}
                    {voucher.work_allocation.tender.tendertype?.TnT_Name ||
                      "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          {voucher.Remarks && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg mb-8">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-800">Remarks</h4>
                  <div className="mt-2 text-gray-700">{voucher.Remarks}</div>
                </div>
              </div>
            </div>
          )}

          {/* Amount Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
              AMOUNT DETAILS
            </h3>
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-3 text-left">
                    Sr No.
                  </th>
                  <th className="border border-gray-400 p-3 text-left">
                    Description
                  </th>
                  <th className="border border-gray-400 p-3 text-right">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-3 text-center">-</td>
                  <td className="border border-gray-400 p-3 font-semibold">
                    Bill Gross Amount
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-semibold">
                    {formatCurrency(totals.grossAmount)}
                  </td>
                </tr>

                {/* Tax Breakdown - in sequence */}
                {totals.taxBreakdown.map((tax) => (
                  <tr key={`print-tax-${tax.pvd_sr}`}>
                    <td className="border border-gray-400 p-3 text-center">
                      {tax.pvd_sr}
                    </td>
                    <td className="border border-gray-400 p-3">
                      <div className="font-medium">
                        {tax.invoice_charge?.IC_Name || "Tax"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {tax.isAdd ? "Addition" : "Deduction"}
                      </div>
                      {tax.tender_type && (
                        <div className="text-xs text-gray-500">
                          Tender: {tax.tender_type.TnT_Name}
                        </div>
                      )}
                    </td>
                    <td
                      className={`border border-gray-400 p-3 text-right font-medium ${
                        tax.isAdd ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tax.isAdd ? "+" : "-"}
                      {formatCurrency(tax.calculated_amount)}
                    </td>
                  </tr>
                ))}

                {/* Penalty Breakdown - in sequence */}
                {totals.penaltyBreakdown.map((penalty) => (
                  <tr key={`print-penalty-${penalty.pvd_sr}`}>
                    <td className="border border-gray-400 p-3 text-center">
                      {penalty.pvd_sr}
                    </td>
                    <td className="border border-gray-400 p-3">
                      <div className="font-medium">
                        {penalty.ledger?.Lg_Name || "Penalty"}
                        {" "}(Penalty)
                        {penalty.tax_percentage > 0 && String(penalty.formula || "").trim() != "*"
                          ? ` (${penalty.tax_percentage}%)`
                          : ""}
                      </div>
                      <div className="text-xs text-gray-600">
                        {penalty.isAdd ? "Addition" : "Deduction"}
                      </div>
                    </td>
                    <td
                      className={`border border-gray-400 p-3 text-right font-medium ${
                        penalty.isAdd ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {penalty.isAdd ? "+" : "-"}
                      {formatCurrency(penalty.calculated_amount)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-50">
                  <td
                    className="border border-gray-400 p-3 text-center"
                    colSpan="2"
                  >
                    <span className="font-semibold">Total Additions</span>
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-semibold text-green-600">
                    +{formatCurrency(totals.addAmount)}
                  </td>
                </tr>

                <tr className="bg-gray-50">
                  <td
                    className="border border-gray-400 p-3 text-center"
                    colSpan="2"
                  >
                    <span className="font-semibold">Total Deductions</span>
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-semibold text-red-600">
                    -{formatCurrency(totals.lessAmount)}
                  </td>
                </tr>

                <tr className="bg-blue-100">
                  <td
                    className="border border-gray-400 p-3 text-center"
                    colSpan="2"
                  >
                    <span className="font-bold text-lg">
                      NET PAYABLE AMOUNT
                    </span>
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-bold text-lg text-blue-700">
                    {formatCurrency(totals.netAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Authorization Section */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4 mt-16"></div>
              <p className="font-bold mt-2">Prepared By</p>
              <p className="text-sm text-gray-600">Finance Department</p>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4 mt-16"></div>
              <p className="font-bold mt-2">Checked By</p>
              <p className="text-sm text-gray-600">Accounts Officer</p>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4 mt-16"></div>
              <p className="font-bold mt-2">Authorized Signatory</p>
              <p className="text-sm text-gray-600">Chief Financial Officer</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t-2 border-gray-300 text-center text-sm text-gray-600">
            <p>
              Generated on: {new Date().toLocaleDateString("en-IN")} | System
              Generated Document
            </p>
            <p className="mt-1">
              This is a computer generated voucher and does not require physical
              signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBillChallanEntry;

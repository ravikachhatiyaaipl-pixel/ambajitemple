// src/pages/Transactions/BookkeepingVouchers/NewExpenseChallanUpdate/View.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Clock,
  Printer,
  AlertCircle,
  Building,
  Layers,
  Hash,
  DollarSign,
  FileText,
  CreditCard,
  Landmark,
  Receipt,
  Banknote,
  XCircle,
  CheckCircle,
  Info,
  Shield,
  UserCheck,
  Percent,
  Calculator,
  Plus as PlusIcon,
  Minus as MinusIcon,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";
import { newChallanFlowService } from "../../../services/newchallanflowservice";

const ViewNewExpenseChallanUpdate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();
  const [activityLogs, setActivityLogs] = useState([]);
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
  const [taxPopup, setTaxPopup] = useState(null); // stores detail.pay_details of clicked row

  const openTaxPopup = (taxes) => {
    setTaxPopup(taxes);
    document.body.style.overflow = "hidden";
  };

  const closeTaxPopup = () => {
    setTaxPopup(null);
    document.body.style.overflow = "";
  };
  const [taxCalculation, setTaxCalculation] = useState({
    grossAmount: 0,
    netAmount: 0,
    taxBreakdown: [],
    totalAdd: 0,
    totalLess: 0,
    totalTax: 0,
  });



  //-------------------



  // Move useEffect to the correct position (after function definitions)
  useEffect(() => {
    loadVoucherData();
    // Remove loadActivityLogs() from here - it will be called after voucher loads
  }, [id]);

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const challanResponse = await newChallanFlowService.getById(id);
      const voucherData =
        challanResponse.data && challanResponse.data[0]
          ? challanResponse.data[0]
          : challanResponse;
      setVoucher(voucherData);

      let totalPenaltyAmount = 0;
      if (voucherData?.details) {
        voucherData.details.forEach((detail) => {
          totalPenaltyAmount += parseFloat(detail.Penalty_Amount) || 0;
        });

        const calcSummary = newChallanFlowService.calculateSummary(voucherData.details);
        setSummary(calcSummary);
        setTotalPenalty(totalPenaltyAmount);

        // Calculate tax directly from detail.pay_details (same as new-challan-update reference)
        const allPayDetails = voucherData.details.flatMap((d) => d.pay_details || []);
        const taxItems = allPayDetails.filter((p) => p.PD_Ty == "TAX");

        const taxMap = {};
        taxItems.forEach((t) => {
          const key = t.IC_Id;
          if (!taxMap[key]) {
            taxMap[key] = {
              ...t,
              calculatedAmount: parseFloat(t.IC_Amt) || 0,
              displayText: t.invoice_charge?.IC_Name || t.IC_Name || "",
              isAdd: t.Add_Dedu == 1 || t.Add_Dedu == "1",
              type: "tax",
              percentage: parseFloat(t.Percent),
            };
          } else {
            taxMap[key].calculatedAmount += parseFloat(t.IC_Amt) || 0;
          }
        });

        const taxBreakdown = Object.values(taxMap);
        const grossAmount = calcSummary.total;
        const totalAdd = taxBreakdown.filter((t) => t.isAdd).reduce((s, t) => s + t.calculatedAmount, 0);
        const totalLess = taxBreakdown.filter((t) => !t.isAdd).reduce((s, t) => s + t.calculatedAmount, 0);
        const netAmount = parseFloat(voucherData.Net_Amount) || grossAmount + totalAdd - totalLess;

        setTaxCalculation({
          grossAmount,
          netAmount,
          taxBreakdown,
          totalAdd,
          totalLess,
          totalTax: totalAdd - totalLess,
        });
      }

      // ✅ Call loadActivityLogs here with the CV_No from voucherData
      await loadActivityLogs(voucherData.CV_No);

    } catch (error) {
      console.error("Error loading challan voucher:", error);
      toast.error(
        error.response?.data?.message || "Failed to load challan voucher data!",
      );
      navigate("/transactions/bookkeeping-vouchers/new-expense-challan-update");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update loadActivityLogs to accept a parameter
  const loadActivityLogs = async (cvNo) => {
    if (!cvNo) {
      console.log("No CV_No provided, skipping activity logs fetch");
      setActivityLogs([]);
      return;
    }

    try {
      console.log("Fetching activity logs for CV_No:", cvNo);
      const response = await newChallanFlowService.getActivityLogs(cvNo);
      console.log("Activity Logs Response:", response);

      if (response.success && response.data) {
        setActivityLogs(response.data);
        console.log("Activity Logs set successfully:", response.data);
      } else {
        console.log("No activity logs found or API returned unsuccessful");
        setActivityLogs([]);
      }

    } catch (error) {
      console.error("Error loading activity logs:", error);
      setActivityLogs([]);
    }
  };


  //-------------------



  const handleDeleteVoucher = async () => {
    const result = await Swal.fire({
      title: "Delete Expense Challan Voucher?",
      text: `Are you sure you want to delete voucher "${voucher?.CV_No}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await newChallanFlowService.delete(id);
      toast.success(`Voucher "${voucher?.CV_No}" deleted successfully!`);
      navigate("/transactions/bookkeeping-vouchers/new-expense-challan-update");
    } catch (error) {
      console.error("Error deleting challan voucher:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete challan voucher",
      );
    }
  };

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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    };
    return styles[mode] || "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = () => {
    if (voucher?.RStatus) {
      return voucher.RStatus.St_Name || "Pending";
    }
    if (voucher?.status_master) {
      return voucher.status_master.St_Name || "Pending";
    }
    if (voucher?.CHL_HDT) {
      return "Approved";
    }
    return "Pending";
  };

  const getStatusBadge = () => {
    const statusName = getStatusDisplay();

    let colorClass = "bg-gray-100 text-gray-800";
    const statusLower = statusName.toLowerCase();

    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("query")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("verif") || statusLower.includes("check")) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        <Clock className="h-4 w-4 mr-2" />
        {statusName}
      </span>
    );
  };

  // Helper function to check if formula is simple (* or single letter)
  const isSimpleFormula = (formula) => {
    if (!formula) return true;
    const trimmed = formula.toString().trim().toUpperCase();
    return trimmed == "*" || (trimmed.length == 1 && /^[A-Z]$/.test(trimmed));
  };

  // Tax & Penalty Calculation Card Component - Right Side
  const TaxCalculationDisplay = () => {
    const hasTaxItems =
      taxCalculation?.taxBreakdown?.some((item) => item.type == "tax") ||
      false;
    const hasPenaltyItems =
      taxCalculation?.taxBreakdown?.some((item) => item.type == "penalty") ||
      false;
    const hasAnyItems = hasTaxItems || hasPenaltyItems || totalPenalty > 0;

    if (!hasAnyItems) {
      return null;
    }

    const taxItems =
      taxCalculation.taxBreakdown?.filter((item) => item.type == "tax") || [];
    const penaltyItems =
      taxCalculation.taxBreakdown?.filter((item) => item.type == "penalty") ||
      [];

    let finalNetAmount = taxCalculation.netAmount;
    if (penaltyItems.length == 0 && totalPenalty > 0) {
      finalNetAmount = (taxCalculation.netAmount || summary.total) - totalPenalty;
    }
    if (!finalNetAmount && summary.total > 0) {
      finalNetAmount = summary.total - totalPenalty;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mr-2">
              <Calculator className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Tax & Penalty Calculation
              </h2>
              <p className="text-xs text-gray-500">Applied on total amount</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Total Amount</span>
              <span className="font-medium text-gray-900 text-sm">
                {formatAmount(taxCalculation.grossAmount || summary.total)}
              </span>
            </div>

            {taxItems.map((tax, index) => {
              const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
              const showPercentage = !isSimpleFormula(tax.Formula);

              let displayText = tax.displayText;
              if (isSimpleFormula(tax.Formula)) {
                displayText = tax.invoice_charge?.IC_Code || tax.IC_Code || "";
              }

              // Add percentage to display text if available
              const displayWithPercent = showPercentage && tax.percentage
                ? `${displayText} (${tax.percentage}%)`
                : displayText;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-1 border-b border-gray-50"
                >
                  <div className="flex items-center gap-1">
                    {isAdd ? (
                      <PlusIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <MinusIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-gray-600 text-xs">{displayWithPercent}</span>
                  </div>
                  <div
                    className={`text-xs font-medium ${isAdd ? "text-green-600" : "text-red-600"}`}
                  >
                    {isAdd ? "+" : "-"}
                    {formatAmount(tax.calculatedAmount)}
                  </div>
                </div>
              );
            })}

            {taxCalculation.totalAdd > 0 && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">Total Additions</span>
                <span className="text-green-600 text-xs font-medium">
                  +{formatAmount(taxCalculation.totalAdd)}
                </span>
              </div>
            )}

            {taxCalculation.totalLess > 0 && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">Total Deductions</span>
                <span className="text-red-600 text-xs font-medium">
                  -{formatAmount(taxCalculation.totalLess)}
                </span>
              </div>
            )}

            {/* Penalty Section */}
            {(penaltyItems.length > 0 || totalPenalty > 0) && (
              <div className="border-t border-gray-200 pt-2 mt-1">
                <div className="flex items-center mb-1">
                  <AlertCircle className="h-3 w-3 text-orange-500 mr-1" />
                  <span className="text-xs font-semibold text-gray-700">
                    Penalty
                  </span>
                </div>
                {penaltyItems.map((penalty, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 pl-3"
                  >
                    <span className="text-gray-600 text-xs">
                      Penalty Amount
                    </span>
                    <div className="text-xs font-medium text-red-600">
                      -{formatAmount(penalty.calculatedAmount)}
                    </div>
                  </div>
                ))}
                {penaltyItems.length == 0 && totalPenalty > 0 && (
                  <div className="flex items-center justify-between py-1 pl-3">
                    <span className="text-gray-600 text-xs">
                      Penalty Amount
                    </span>
                    <div className="text-xs font-medium text-red-600">
                      -{formatAmount(totalPenalty)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between py-2 mt-2 bg-green-50 rounded-lg px-3 border border-green-100">
              <span className="text-sm font-semibold text-gray-800">
                Net Payable
              </span>
              <span className="text-base font-bold text-green-700">
                {formatAmount(finalNetAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const PrintReportContent = () => {
  let penaltyTotal = 0;
  if (voucher?.details) {
    voucher.details.forEach((detail) => {
      penaltyTotal += parseFloat(detail.Penalty_Amount) || 0;
    });
  }

  const penaltyItems =
    taxCalculation.taxBreakdown?.filter((item) => item.type == "penalty") ||
    [];
  const displayPenaltyTotal =
    penaltyItems.length > 0
      ? penaltyItems.reduce((sum, p) => sum + p.calculatedAmount, 0)
      : penaltyTotal;

  // Calculate net payable correctly
  const grossAmount = summary.total || 0;
  const totalTaxAmount = taxCalculation.totalTax || 0;
  const netPayable = grossAmount + totalTaxAmount - displayPenaltyTotal;

  const filteredLogs1 = activityLogs.filter(
    log => log.Action != null && log.Action?.St_Name !=  "DYMC Approval"
  );

  // Find specific status logs for signatures
  const dymcLog = activityLogs.find(
    log => log.Action?.St_Name ==  "DYMC Approval"
  );
  
  const filteredLogs = filteredLogs1.filter(
    log => log.Action != null && log.Action?.St_Name !=  "Payment HOD Verify"
  );
  const hodLog = activityLogs.find(
    log => log.Action?.St_Name ==  "Payment HOD Verify"
  );

  // Check if Acc_Chl_No exists and is not empty
  const hasVoucherNumber = voucher?.Acc_Chl_No && voucher.Acc_Chl_No.trim() !=  "";

  const styles = {
    section: { marginBottom: "12px" },
    sectionTitle: {
      backgroundColor: "#f3f4f6",
      padding: "4px 8px",
      margin: "6px 0",
      fontWeight: "600",
      borderLeft: "3px solid #EF5350",
      fontSize: "11px",
      color: "#1f2937",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      margin: "4px 0",
      fontSize: "10px",
    },
    th: {
      backgroundColor: "#f1f5f9",
      fontWeight: "600",
      padding: "4px 6px",
      border: "1px solid #cbd5e0",
      textAlign: "left",
    },
    thRight: {
      backgroundColor: "#f1f5f9",
      fontWeight: "600",
      padding: "4px 6px",
      border: "1px solid #cbd5e0",
      textAlign: "right",
    },
    td: {
      padding: "4px 6px",
      border: "1px solid #e5e7eb",
      verticalAlign: "top",
    },
    tdRight: {
      padding: "4px 6px",
      border: "1px solid #e5e7eb",
      verticalAlign: "top",
      textAlign: "right",
    },
    textBold: { fontWeight: "600" },
  };

  const getChequeNumber = (detail) => {
    return detail.Chq_No || detail.Cheque_No || detail.ChequeNumber || detail.DD_No || detail.DDNumber || "";
  };

  const getChequeDate = (detail) => {
    return detail.Chq_Date || detail.Cheque_Date || detail.ChequeDate || detail.DD_Date || detail.DDDate || "";
  };

  // Format signature info
  const formatSignatureInfo = (log) => {
    if (!log) return null;
    const userName = log.User?.Usr_Name || "—";
    const timestamp = log.formatted_time || "—";
    return `${userName} / ${timestamp}`;
  };

  return (
    <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
      {/* Challan Information */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Challan Information</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Field</th>
              <th style={styles.th}>Details</th>
              <th style={styles.th}>Field</th>
              <th style={styles.th}>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...styles.td, ...styles.textBold }}>Bill No.</td>
              <td style={styles.td}>{voucher?.CV_No}</td>
              <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
              <td style={styles.td}>{formatDate(voucher?.Ch_Date)}</td>
            </tr>
            <tr>
              <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
              <td style={styles.td}>{getBranchDisplay()}</td>
              <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
              <td style={styles.td}>{getStatusDisplay()}</td>
            </tr>
            <tr>
              <td style={{ ...styles.td, ...styles.textBold }}>Voucher No.</td>
              <td style={styles.td}>{voucher?.Acc_Chl_No || "—"}</td>
              <td style={{ ...styles.td, ...styles.textBold }}>Voucher Date</td>
              <td style={styles.td}>{formatDate(voucher?.Acc_Chl_Date)}</td>
            </tr>
            {voucher?.Status_Remark && (
              <tr>
                <td style={{ ...styles.td, ...styles.textBold, backgroundColor: "#fffbeb" }}>Query</td>
                <td style={{ ...styles.td, backgroundColor: "#fffbeb" }} colSpan="3">
                  <span style={{ color: "#92400e" }}>{voucher.Status_Remark}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Details - UPDATED with Budget Columns */}
      {voucher?.details && voucher.details.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Bill Details</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>SR.</th>
                <th style={styles.th}>Ledger Account</th>
                <th style={styles.th}>Vendor Name / GST No</th>
                <th style={styles.th}>File No. / Remark</th>
                <th style={styles.th}>TAX</th>
                <th style={styles.thRight}>Amount (₹)</th>
                <th style={styles.thRight}>Approved Budget (₹)</th>
                <th style={styles.thRight}>Used Budget (₹)</th>
                <th style={styles.thRight}>Remaining Budget (₹)</th>
              </tr>
            </thead>
            <tbody>
              {voucher.details.map((detail, index) => {
                const rowTaxes = (detail.pay_details || []).filter(
                  p => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0
                );
                const penalty = parseFloat(detail.Penalty_Amount) || 0;
                
                return (
                  <tr key={index}>
                    <td style={{ ...styles.td, textAlign: "center" }}>{detail.CV_Sr}</td>
                    <td style={styles.td}>
                      <div>{getLedgerDisplay(detail)}</div>
                      {detail.budget_head && (
                        <div style={{ fontSize: "8px", color: "#6b7280" }}>
                          Budget: {detail.budget_head.Gr_Nm}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div><strong>Vendor:</strong> {detail.SL_Nm || "—"}</div>
                      <div style={{ fontSize: "9px", color: "#6b7280" }}>
                        <strong>GST:</strong> {detail.GST_No || "—"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div><strong>File No.:</strong> {detail.FileNo || "—"}</div>
                      <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>
                        <strong>Remark:</strong> {detail.Remarks || detail.remark || "—"}
                      </div>
                      {penalty > 0 && (
                        <div style={{ fontSize: "9px", color: "#dc2626", marginTop: "2px" }}>
                          <strong>Penalty:</strong> {formatCurrency(penalty)}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {rowTaxes.length > 0 ? (
                        <div style={{ fontSize: "9px" }}>
                          {rowTaxes.map((tax, ti) => {
                            const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
                            const taxLabel = tax.invoice_charge?.IC_Name || tax.IC_Name || "Tax";
                            const taxAmount = parseFloat(tax.IC_Amt) || 0;
                            return (
                              <div key={ti} style={{ marginBottom: "2px" }}>
                                {isAdd ? "+" : "-"} {taxLabel}: {formatCurrency(taxAmount)}
                              </div>
                            );
                          })}
                        </div>
                      ) : "—"}
                    </td>
                    <td style={styles.tdRight}>{formatCurrency(detail.Amount)}</td>
                    <td style={styles.tdRight}>
                      {detail.Appr_Budg ? formatCurrency(parseFloat(detail.Appr_Budg)) : "—"}
                    </td>
                    <td style={styles.tdRight}>
                      {detail.Used_Budg ? formatCurrency(parseFloat(detail.Used_Budg)) : "—"}
                    </td>
                    <td style={{ ...styles.tdRight, color: parseFloat(detail.Remain_Budg) < 0 ? "#dc2626" : "#059669" }}>
                      {detail.Remain_Budg ? formatCurrency(parseFloat(detail.Remain_Budg)) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Section */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Summary</div>
        <table style={{ ...styles.table, width: "50%", marginLeft: "auto" }}>
          <tbody>
            <tr>
              <td style={{ ...styles.td, fontWeight: "600" }}>Total Amount:</td>
              <td style={{ ...styles.tdRight, fontWeight: "600" }}>
                {formatCurrency(grossAmount)}
              </td>
            </tr>
            {totalTaxAmount != 0 && (
              <tr>
                <td style={{ ...styles.td, fontWeight: "600" }}>
                  Tax Amount: {totalTaxAmount >= 0 ? "(+)" : "(-)"}
                </td>
                <td style={{ ...styles.tdRight, fontWeight: "600", color: totalTaxAmount >= 0 ? "#10b981" : "#ef4444" }}>
                  {formatCurrency(Math.abs(totalTaxAmount))}
                </td>
              </tr>
            )}
            {displayPenaltyTotal > 0 && (
              <tr>
                <td style={{ ...styles.td, fontWeight: "600", color: "#dc2626" }}>
                  Penalty Amount: (-)
                </td>
                <td style={{ ...styles.tdRight, fontWeight: "600", color: "#dc2626" }}>
                  {formatCurrency(displayPenaltyTotal)}
                </td>
              </tr>
            )}
            <tr style={{ backgroundColor: "#f0fdf4" }}>
              <td style={{ ...styles.td, fontWeight: "bold", fontSize: "11px" }}>Net Payable:</td>
              <td style={{ ...styles.tdRight, fontWeight: "bold", fontSize: "11px", color: "#10b981" }}>
                {formatCurrency(netPayable)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Mode Details */}
      {voucher?.details && voucher.details.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Payment Mode Details</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sr.</th>
                <th style={styles.th}>Payment Mode</th>
                <th style={styles.th}>Bank Details</th>
                <th style={styles.th}>Cheque/DD Details</th>
                <th style={styles.thRight}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {voucher.details.map((detail, index) => {
                const isCheque = detail.Payment_Mode == "Cheque" || detail.Payment_Mode == "DD";
                const isBank = detail.Payment_Mode == "Bank" || detail.Payment_Mode == "Online" || detail.Payment_Mode == "Card";
                
                const hasBankInfo = (detail.Bank_Name && detail.Bank_Name != "null" && detail.Bank_Name != "") ||
                                   (detail.Acc_No && detail.Acc_No != "null" && detail.Acc_No != "") ||
                                   (detail.IFSC_Code && detail.IFSC_Code != "null" && detail.IFSC_Code != "");
                
                const chequeNumber = getChequeNumber(detail);
                const chequeDate = getChequeDate(detail);
                const hasChequeInfo = (chequeNumber && chequeNumber != "null" && chequeNumber != "") ||
                                     (chequeDate && chequeDate != "null" && chequeDate != "");
                
                const showBankDetails = hasBankInfo || isBank;
                
                const bankDetails = showBankDetails ? (
                  <div style={{ fontSize: "9px" }}>
                    {detail.Bank_Name && detail.Bank_Name != "null" && detail.Bank_Name != "" ? (
                      <div><strong>Bank:</strong> {detail.Bank_Name}</div>
                    ) : null}
                    {detail.Acc_No && detail.Acc_No != "null" && detail.Acc_No != "" ? (
                      <div><strong>A/C No.:</strong> {detail.Acc_No}</div>
                    ) : null}
                    {detail.IFSC_Code && detail.IFSC_Code != "null" && detail.IFSC_Code != "" ? (
                      <div><strong>IFSC:</strong> {detail.IFSC_Code}</div>
                    ) : null}
                    {!hasBankInfo && "—"}
                  </div>
                ) : "—";
                
                const chequeDetails = hasChequeInfo ? (
                  <div style={{ fontSize: "9px" }}>
                    {chequeNumber && chequeNumber != "null" && chequeNumber != "" ? (
                      <div><strong>No.:</strong> {chequeNumber}</div>
                    ) : null}
                    {chequeDate && chequeDate != "null" && chequeDate != "" ? (
                      <div><strong>Date:</strong> {formatDate(chequeDate)}</div>
                    ) : null}
                  </div>
                ) : "—";

                const rowTaxes = (detail.pay_details || []).filter(p => p.PD_Ty == "TAX");
                const rowTaxTotal = rowTaxes.reduce((sum, tax) => {
                  const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
                  const taxAmt = parseFloat(tax.IC_Amt) || 0;
                  return sum + (isAdd ? taxAmt : -taxAmt);
                }, 0);
                const rowPenalty = parseFloat(detail.Penalty_Amount) || 0;
                const netAmountForRow = (parseFloat(detail.Amount) || 0) + rowTaxTotal - rowPenalty;

                return (
                  <tr key={index}>
                    <td style={{ ...styles.td, textAlign: "center" }}>{detail.CV_Sr}</td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: "500" }}>{detail.Payment_Mode || "—"}</span>
                    </td>
                    <td style={styles.td}>{bankDetails}</td>
                    <td style={styles.td}>{chequeDetails}</td>
                    <td style={styles.tdRight}>{formatCurrency(netAmountForRow)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Verification Text - Two lines (BEFORE Activity Logs) */}
      <div style={{ 
        marginTop: "8px",
        marginBottom: "8px",
        padding: "6px 8px",
        backgroundColor: "#fafafa",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        fontSize: "9px",
        lineHeight: "1.5"
      }}>
        <div style={{ marginBottom: "2px" }}>
          • બિલ ની દરેક પ્રકાર ની ચકાસણી કરતા બિલ બરાબર હોવાનું માલુમ પડેલ છે. આ બિલ ની રકમ નું અગાઉ ચુકવણું કરવામાં આવેલ નથી તેની ખાતરી લેવામાં આવી છે.
        </div>
        <div>
          • સ.બ.બ. કામગીરી G.M.C. ના હેતુ થી કરવામાં આવેલ છે તેમજ કામગીરી સંતોષકારક પૂર્ણ કરેલ છે.
        </div>
      </div>

      {/* Activity Logs Section */}
      {filteredLogs.length > 0 && (
        <div style={{ ...styles.section, marginBottom: "8px" }}>
          <div style={styles.sectionTitle}>Activity Logs</div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr 1fr", 
            gap: "6px",
            marginTop: "4px"
          }}>
            {filteredLogs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: "3px 0",
                  borderBottom: Math.floor(index / 3) == Math.floor((filteredLogs.length - 1) / 3) ? "none" : "1px solid #e5e7eb"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "8px", marginBottom: "1px", color: "#374151" }}>
                  {log.User?.Usr_Name || "—"} / {log.formatted_time || "—"}
                </div>
                <div style={{ fontSize: "8px", color: "#6b7280" }}>
                  {log.Action?.St_Name || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Section - Dynamic signatures from activity logs */}
      {hasVoucherNumber && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          paddingTop: "8px",
          borderTop: "1px solid #e5e7eb"
        }}>
          {/* Account HOD Signature */}
          <div style={{ width: "45%", textAlign: "center" }}>
            <div style={{ 
              borderBottom: "1px solid #000", 
              padding: "8px 0",
              marginBottom: "4px",
              minHeight: "30px"
            }}>
              {hodLog ? (
                <div style={{ fontSize: "10px", color: "#1f2937" }}>
                  {formatSignatureInfo(hodLog)}
                </div>
              ) : (
                <span style={{ fontSize: "9px", color: "#9ca3af" }}>—</span>
              )}
            </div>
            <div style={{ fontSize: "10px", fontWeight: "600" }}>
              Account HOD
            </div>
          </div>

          {/* DYMC Signature */}
          <div style={{ width: "45%", textAlign: "center" }}>
            <div style={{ 
              borderBottom: "1px solid #000", 
              padding: "8px 0",
              marginBottom: "4px",
              minHeight: "30px"
            }}>
              {dymcLog ? (
                <div style={{ fontSize: "10px", color: "#1f2937" }}>
                  {formatSignatureInfo(dymcLog)}
                </div>
              ) : (
                <span style={{ fontSize: "9px", color: "#9ca3af" }}>—</span>
              )}
            </div>
            <div style={{ fontSize: "10px", fontWeight: "600" }}>
              DYMC
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading Expense challan voucher details...
        </p>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Expense Challan Voucher Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The expense challan voucher with ID #{id} does not exist or has been
            removed.
          </p>
          <Link
            to="/transactions/bookkeeping-vouchers/new-expense-challan-update"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          title="Expense Challan Voucher Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/bookkeeping-vouchers/new-expense-challan-update",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Expense Challan Voucher Details
            </h1>
            <p className="text-gray-600 mt-1">Voucher #{voucher.CV_No}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrint(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <Link
            to={`/transactions/bookkeeping-vouchers/new-expense-challan-update/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDeleteVoucher}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="space-y-6">
        {/* Voucher Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Voucher Information
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200">
              <div className="flex-1 px-4 first:pl-0">
                <p className="text-xs text-gray-500 mb-0.5">Bill No.</p>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900 break-all">{voucher.CV_No}</span>
                </div>
              </div>
              <div className="flex-1 px-4">
                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{formatDate(voucher.Ch_Date)}</span>
                </div>
              </div>
              <div className="flex-1 px-4">
                <p className="text-xs text-gray-500 mb-0.5">Branch</p>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{getBranchDisplay()}</span>
                </div>
              </div>
              <div className="flex-1 px-4">
                <p className="text-xs text-gray-500 mb-0.5">Tender Type</p>
                <div className="flex items-center gap-1">
                  <Receipt className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{voucher.tender_type?.TnT_Name || "—"}</span>
                </div>
              </div>
              <div className="flex-1 px-4">
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                {getStatusBadge()}
              </div>
              {voucher.HOD_User?.Usr_Name && (
                <div className="flex-1 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Approved By</p>
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">{voucher.HOD_User.Usr_Name}</span>
                  </div>
                </div>
              )}
              {voucher.Acc_Chl_No && (
                <div className="flex-1 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Voucher No.</p>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-600">{voucher.Acc_Chl_No}</span>
                  </div>
                </div>
              )}
            </div>
            {voucher?.Status_Remark && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Query</label>
                    <p className="text-sm text-amber-900 mt-1">{voucher.Status_Remark}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Challan Details Card - WITH Bank and Cheque columns for main view (keeping existing) */}
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
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Taxation
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
                            {(isBank || isCheque) ? detail.Bank_Name || "—" : "—"}
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
                          <td className="px-3 py-2 text-xs text-center">
                            {(() => {
                              const rowTaxes = (detail.pay_details || []).filter(
                                (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0
                              );
                              if (rowTaxes.length == 0) return "—";
                              return (
                                <button
                                  onClick={() => openTaxPopup(rowTaxes)}
                                  className="px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                                >
                                  View Tax ({rowTaxes.length})
                                </button>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 border-t-2 border-gray-300">
                      <td colSpan="13" className="px-3 py-3 text-right text-xs font-semibold text-gray-800">
                        Total Amount:
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-semibold text-gray-800">
                        {formatCurrency(summary.total)}
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-semibold text-red-600">
                        {totalPenalty > 0 ? formatCurrency(totalPenalty) : "—"}
                      </td>
                      <td className="px-3 py-3"></td>
                    </tr>
                    {taxCalculation.totalTax != 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan="13" className="px-3 py-2 text-right text-xs text-gray-700">
                          Tax Amount: {taxCalculation.totalTax >= 0 ? "(+)" : "(-)"}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-gray-700">
                          {formatCurrency(Math.abs(taxCalculation.totalTax))}
                        </td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2"></td>
                      </tr>
                    )}
                    <tr className="bg-gray-100">
                      <td colSpan="13" className="px-3 py-3 text-right text-xs font-bold text-gray-900">
                        Net Payable:
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-gray-900">
                        {formatCurrency(taxCalculation.netAmount || summary.total)}
                      </td>
                      <td className="px-3 py-3"></td>
                      <td className="px-3 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Additional Details for Cheque/DD entries */}
              {voucher.details.some(
                (d) => d.Payment_Mode == "Cheque" || d.Payment_Mode == "DD",
              ) && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <Info className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-yellow-800">
                          Cheque/DD Details
                        </h4>
                        <div className="mt-1 space-y-0.5 text-xs text-yellow-700">
                          {voucher.details
                            .filter(
                              (d) =>
                                d.Payment_Mode == "Cheque" ||
                                d.Payment_Mode == "DD",
                            )
                            .map((detail, idx) => (
                              <div key={idx} className="grid grid-cols-4 gap-2">
                                <span>Sr. {detail.CV_Sr}:</span>
                                <span>Bank: {detail.Bank_Name || "—"}</span>
                                <span>No: {detail.Chq_No || "—"}</span>
                                <span>Date: {formatDate(detail.Chq_Date)}</span>
                                <span>
                                  Receipt: {formatDate(detail.Rec_Date)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Additional Details for Bank Transfer entries */}
              {voucher.details.some(
                (d) =>
                  d.Payment_Mode == "Bank" ||
                  d.Payment_Mode == "Online" ||
                  d.Payment_Mode == "Card",
              ) && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Landmark className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-blue-800">
                          Bank Transfer Details
                        </h4>
                        <div className="mt-1 space-y-0.5 text-xs text-blue-700">
                          {voucher.details
                            .filter(
                              (d) =>
                                d.Payment_Mode == "Bank" ||
                                d.Payment_Mode == "Online" ||
                                d.Payment_Mode == "Card",
                            )
                            .map((detail, idx) => (
                              <div key={idx} className="grid grid-cols-4 gap-2">
                                <span>Sr. {detail.CV_Sr}:</span>
                                <span>Bank: {detail.Bank_Name || "—"}</span>
                                <span>Acc: {detail.Acc_No || "—"}</span>
                                <span>IFSC: {detail.IFSC_Code || "—"}</span>
                                <span className="col-span-4">
                                  Receipt: {formatDate(detail.Rec_Date)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Tax Details Modal */}
      {taxPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeTaxPopup}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Tax Details</h3>
              </div>
              <button onClick={closeTaxPopup} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Tax Name</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600">Type</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taxPopup.map((t, i) => {
                    const isAdd = t.Add_Dedu == 1 || t.Add_Dedu == "1";
                    const label = t.invoice_charge?.IC_Name || t.IC_Name || "Tax";
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-800">{label}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isAdd ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {isAdd ? "+ Add" : "- Deduct"}
                          </span>
                        </td>
                        <td className={`px-3 py-2 text-right font-medium ${isAdd ? "text-green-700" : "text-red-600"}`}>
                          {formatCurrency(parseFloat(t.IC_Amt))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan="2" className="px-3 py-2 font-semibold text-gray-800">Net Tax Effect</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">
                      {formatCurrency(
                        taxPopup.reduce((sum, t) => {
                          const isAdd = t.Add_Dedu == 1 || t.Add_Dedu == "1";
                          return sum + (isAdd ? parseFloat(t.IC_Amt) : -parseFloat(t.IC_Amt));
                        }, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNewExpenseChallanUpdate;
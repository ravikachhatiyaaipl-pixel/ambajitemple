// src/pages/Transactions/BookkeepingVouchers/NewChallanUpdate/View.jsx

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

const ViewNewChallanUpdate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [taxCalculation, setTaxCalculation] = useState({
    grossAmount: 0,
    netAmount: 0,
    taxBreakdown: [],
    totalAdd: 0,
    totalLess: 0,
    totalTax: 0,
  });

  useEffect(() => {
    loadVoucherData();
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

      if (voucherData?.details) {
        const calcSummary = {
          total: 0,
          cash: 0,
          bank: 0,
          cheque: 0,
          dd: 0,
          online: 0,
          card: 0,
        };
        voucherData.details.forEach((d) => {
          const amt = parseFloat(d.Amount) || 0;
          calcSummary.total += amt;
          const mode = (d.Payment_Mode || "").toLowerCase();
          if (mode == "cash") calcSummary.cash += amt;
          else if (mode == "cheque") calcSummary.cheque += amt;
          else if (mode == "dd") calcSummary.dd += amt;
          else if (mode.includes("online") || mode.includes("pos"))
            calcSummary.online += amt;
          else if (mode == "card") calcSummary.card += amt;
          else calcSummary.bank += amt;
        });
        setSummary(calcSummary);

        const allPayDetails = voucherData.details.flatMap(
          (d) => d.pay_details || [],
        );
        const taxItems = allPayDetails.filter((p) => p.PD_Ty == "TAX");

        const taxMap = {};
        taxItems.forEach((t) => {
          const key = t.IC_Id;
          if (!taxMap[key]) {
            taxMap[key] = {
              ...t,
              calculatedAmount: parseFloat(t.IC_Amt) || 0,
              displayText: `${t.invoice_charge?.IC_Name || ""} (${t.Percent}%)`,
              isAdd: t.Add_Dedu == 1 || t.Add_Dedu == "1",
              isTax: true,
              type: "tax",
              percentage: parseFloat(t.Percent),
            };
          } else {
            taxMap[key].calculatedAmount += parseFloat(t.IC_Amt) || 0;
          }
        });

        const taxBreakdown = Object.values(taxMap);
        const grossAmount = calcSummary.total;
        const totalAdd = taxBreakdown
          .filter((t) => t.isAdd)
          .reduce((s, t) => s + t.calculatedAmount, 0);
        const totalLess = taxBreakdown
          .filter((t) => !t.isAdd)
          .reduce((s, t) => s + t.calculatedAmount, 0);

        let netAmount;
        netAmount =
          parseFloat(voucherData.Net_Amount) ||
          grossAmount + totalAdd - totalLess;

        setTaxCalculation({
          grossAmount,
          netAmount,
          taxBreakdown,
          totalAdd,
          totalLess,
          totalTax: totalAdd - totalLess,
        });
      }
    } catch (error) {
      console.error("Error loading challan voucher:", error);
      toast.error(
        error.response?.data?.message || "Failed to load challan voucher data!",
      );
      navigate("/transactions/bookkeeping-vouchers/new-challan-update");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async () => {
    const result = await Swal.fire({
      title: "Delete Challan Voucher?",
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
      navigate("/transactions/bookkeeping-vouchers/new-challan-update");
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
    if (voucher?.CHl_HOD) {
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

  const isSimpleFormula = (formula) => {
    if (!formula) return true;
    const trimmed = formula.toString().trim().toUpperCase();
    return trimmed == "*" || (trimmed.length == 1 && /^[A-Z]$/.test(trimmed));
  };

  const TaxCalculationDisplay = () => {
    if (
      !taxCalculation.taxBreakdown ||
      taxCalculation.taxBreakdown.length == 0
    ) {
      return null;
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
                Tax Calculation
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
                {formatAmount(taxCalculation.grossAmount)}
              </span>
            </div>

            {taxCalculation.taxBreakdown.map((tax, index) => {
              const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
              const showPercentage = !isSimpleFormula(tax.Formula);

              let displayText = tax.displayText;
              if (isSimpleFormula(tax.Formula)) {
                displayText = tax.invoice_charge?.IC_Code || tax.IC_Code || "";
              }

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
                    <span className="text-gray-600 text-xs">{displayText}</span>
                    {showPercentage && (
                      <span className="text-gray-400 text-xs">
                        ({tax.percentage}%)
                      </span>
                    )}
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

            <div className="flex items-center justify-between py-2 mt-2 bg-green-50 rounded-lg px-3 border border-green-100">
              <span className="text-sm font-semibold text-gray-800">
                Net Receivable
              </span>
              <span className="text-base font-bold text-green-700">
                {formatAmount(taxCalculation.netAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PrintReportContent = () => {
    const printSummary = {
      totalAmount: 0,
      totalTaxAmount: 0,
      netPayable: 0,
    };

    if (voucher?.details) {
      voucher.details.forEach((detail) => {
        const amount = parseFloat(detail.Amount) || 0;
        printSummary.totalAmount += amount;

        const rowTaxes = (detail.pay_details || []).filter(
          (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
        );

        rowTaxes.forEach((tax) => {
          const taxAmount = parseFloat(tax.IC_Amt) || 0;
          const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
          if (isAdd) {
            printSummary.totalTaxAmount += taxAmount;
          } else {
            printSummary.totalTaxAmount -= taxAmount;
          }
        });
      });

      // Check if payment mode is Cheque - if so, don't add tax to net payable

      printSummary.netPayable =
        printSummary.totalAmount + printSummary.totalTaxAmount;
    }

    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "12px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "6px 0",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "right",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      tdRight: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
        textAlign: "right",
      },
      textBold: { fontWeight: "600" },
    };

    const getChequeNumber = (detail) => {
      return (
        detail.Chq_No ||
        detail.Cheque_No ||
        detail.ChequeNumber ||
        detail.DD_No ||
        detail.DDNumber ||
        ""
      );
    };

    const getChequeDate = (detail) => {
      return (
        detail.Chq_Date ||
        detail.Cheque_Date ||
        detail.ChequeDate ||
        detail.DD_Date ||
        detail.DDDate ||
        ""
      );
    };

    // Format date to show as "14 July 2026" format
    const formatDisplayDate = (dateString) => {
      if (!dateString) return "—";
      try {
        // Check if date is already in DD-MM-YYYY format
        if (
          typeof dateString == "string" &&
          dateString.match(/^\d{2}-\d{2}-\d{4}$/)
        ) {
          // Parse DD-MM-YYYY to Date object
          const parts = dateString.split("-");
          const date = new Date(parts[2], parts[1] - 1, parts[0]);
          return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
        // Handle standard date formats
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch (error) {
        return "—";
      }
    };

    // Format Receipt Date - handles formatted_Acc_Chl_Date which is already in DD-MM-YYYY format
    const formatReceiptDate = (dateString) => {
      if (!dateString) return "—";
      try {
        // If it's already in DD-MM-YYYY format
        if (
          typeof dateString == "string" &&
          dateString.match(/^\d{2}-\d{2}-\d{4}$/)
        ) {
          const parts = dateString.split("-");
          const date = new Date(parts[2], parts[1] - 1, parts[0]);
          return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
        // Try parsing as normal date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch (error) {
        return "—";
      }
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
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
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Challan No.
                </td>
                <td style={styles.td}>{voucher?.CV_No}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
                <td style={styles.td}>{formatDisplayDate(voucher?.Ch_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>{getBranchDisplay()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>{getStatusDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Approved By
                </td>
                <td style={styles.td}>{voucher?.HOD_User?.Usr_Name || "—"}</td>
                {voucher?.Acc_Chl_No ? (
                  <>
                    <td style={{ ...styles.td, ...styles.textBold }}>
                      Receipt No.
                    </td>
                    <td style={styles.td}>{voucher.Acc_Chl_No}</td>
                  </>
                ) : (
                  <>
                    <td style={{ ...styles.td, ...styles.textBold }}></td>
                    <td style={styles.td}></td>
                  </>
                )}
              </tr>
              {/* Receipt Date row - separate row */}
              {voucher?.Acc_Chl_No && (
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Receipt Date
                  </td>
                  <td style={styles.td}>
                    {formatReceiptDate(voucher.formatted_Acc_Chl_Date) ||
                      formatReceiptDate(voucher.Acc_Chl_Date)}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}></td>
                  <td style={styles.td}></td>
                </tr>
              )}
              {voucher?.Status_Remark && (
                <tr>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textBold,
                      backgroundColor: "#fffbeb",
                    }}
                  >
                    Query
                  </td>
                  <td
                    style={{ ...styles.td, backgroundColor: "#fffbeb" }}
                    colSpan="3"
                  >
                    <span style={{ color: "#92400e" }}>
                      {voucher.Status_Remark}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {voucher?.details && voucher.details.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Challan Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SR.</th>
                  <th style={styles.th}>Ledger Account</th>
                  <th style={styles.th}>Vendor Name / GST No</th>
                  <th style={styles.th}>File No. / Remark</th>
                  <th style={styles.th}>TAX</th>
                  <th style={styles.thRight}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {voucher.details.map((detail, index) => {
                  const rowTaxes = (detail.pay_details || []).filter(
                    (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
                  );

                  return (
                    <tr key={index}>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {detail.CV_Sr}
                      </td>
                      <td style={styles.td}>
                        <div>{getLedgerDisplay(detail)}</div>
                        {detail.budget_head && (
                          <div style={{ fontSize: "8px", color: "#6b7280" }}>
                            Budget: {detail.budget_head.Gr_Nm}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div>
                          <strong>Vendor:</strong> {detail.SL_Nm || "—"}
                        </div>
                        <div style={{ fontSize: "9px", color: "#6b7280" }}>
                          <strong>GST:</strong> {detail.GST_No || "—"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div>
                          <strong>File No.:</strong> {detail.FileNo || "—"}
                        </div>
                        <div
                          style={{
                            fontSize: "9px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          <strong>Remark:</strong>{" "}
                          {detail.Remarks || detail.remark || "—"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        {rowTaxes.length > 0 ? (
                          <div style={{ fontSize: "9px" }}>
                            {rowTaxes.map((tax, ti) => {
                              const isAdd =
                                tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
                              const taxLabel =
                                tax.invoice_charge?.IC_Name ||
                                tax.IC_Name ||
                                "Tax";
                              const taxAmount = parseFloat(tax.IC_Amt) || 0;
                              return (
                                <div key={ti} style={{ marginBottom: "2px" }}>
                                  {isAdd ? "+" : "-"} {taxLabel}:{" "}
                                  {formatCurrency(taxAmount)}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={styles.tdRight}>
                        {formatCurrency(detail.Amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Summary</div>
          <table style={{ ...styles.table, width: "50%", marginLeft: "auto" }}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, fontWeight: "600" }}>
                  Total Amount:
                </td>
                <td style={{ ...styles.tdRight, fontWeight: "600" }}>
                  {formatCurrency(printSummary.totalAmount)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, fontWeight: "600" }}>
                  Tax Amount: {printSummary.totalTaxAmount >= 0 ? "(+)" : "(-)"}
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "600",
                    color:
                      printSummary.totalTaxAmount >= 0 ? "#10b981" : "#ef4444",
                  }}
                >
                  {formatCurrency(Math.abs(printSummary.totalTaxAmount))}
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f0fdf4" }}>
                <td
                  style={{ ...styles.td, fontWeight: "bold", fontSize: "11px" }}
                >
                  Net Receivable:
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    fontSize: "11px",
                    color: "#10b981",
                  }}
                >
                  {formatCurrency(printSummary.netPayable)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
                  <th style={styles.thRight}>Tax Amount (₹)</th>
                  <th style={styles.thRight}>Net Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {voucher.details.map((detail, index) => {
                  const paymentMode = (detail.Payment_Mode || "").toLowerCase();

                  const hasBankInfo =
                    (detail.Bank_Name &&
                      detail.Bank_Name != "null" &&
                      detail.Bank_Name != "") ||
                    (detail.Acc_No &&
                      detail.Acc_No != "null" &&
                      detail.Acc_No != "") ||
                    (detail.IFSC_Code &&
                      detail.IFSC_Code != "null" &&
                      detail.IFSC_Code != "");

                  const chequeNumber = getChequeNumber(detail);
                  const chequeDate = getChequeDate(detail);
                  const hasChequeInfo =
                    (chequeNumber &&
                      chequeNumber != "null" &&
                      chequeNumber != "") ||
                    (chequeDate && chequeDate != "null" && chequeDate != "");

                  const showBankDetails =
                    hasBankInfo ||
                    paymentMode == "bank" ||
                    paymentMode == "online" ||
                    paymentMode == "card" ||
                    paymentMode == "pos - collection" ||
                    paymentMode == "pos - online";

                  const bankDetails = showBankDetails ? (
                    <div style={{ fontSize: "9px" }}>
                      {detail.Bank_Name &&
                      detail.Bank_Name != "null" &&
                      detail.Bank_Name != "" ? (
                        <div>
                          <strong>Bank:</strong> {detail.Bank_Name}
                        </div>
                      ) : null}
                      {detail.Acc_No &&
                      detail.Acc_No != "null" &&
                      detail.Acc_No != "" ? (
                        <div>
                          <strong>A/C No.:</strong> {detail.Acc_No}
                        </div>
                      ) : null}
                      {detail.IFSC_Code &&
                      detail.IFSC_Code != "null" &&
                      detail.IFSC_Code != "" ? (
                        <div>
                          <strong>IFSC:</strong> {detail.IFSC_Code}
                        </div>
                      ) : null}
                      {!hasBankInfo && "—"}
                    </div>
                  ) : (
                    "—"
                  );

                  const chequeDetails = hasChequeInfo ? (
                    <div style={{ fontSize: "9px" }}>
                      {chequeNumber &&
                      chequeNumber != "null" &&
                      chequeNumber != "" ? (
                        <div>
                          <strong>No.:</strong> {chequeNumber}
                        </div>
                      ) : null}
                      {chequeDate &&
                      chequeDate != "null" &&
                      chequeDate != "" ? (
                        <div>
                          <strong>Date:</strong> {formatDisplayDate(chequeDate)}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    "—"
                  );

                  // Calculate tax for this specific detail
                  const detailTaxes = (detail.pay_details || []).filter(
                    (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
                  );

                  let taxAmount = 0;
                  detailTaxes.forEach((tax) => {
                    const taxAmt = parseFloat(tax.IC_Amt) || 0;
                    const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
                    if (isAdd) {
                      taxAmount += taxAmt;
                    } else {
                      taxAmount -= taxAmt;
                    }
                  });

                  const detailAmount = parseFloat(detail.Amount) || 0;
                  const netAmount = detailAmount + taxAmount;

                  return (
                    <tr key={index}>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {detail.CV_Sr}
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: "500" }}>
                          {detail.Payment_Mode || "—"}
                        </span>
                      </td>
                      <td style={styles.td}>{bankDetails}</td>
                      <td style={styles.td}>{chequeDetails}</td>
                      <td style={styles.tdRight}>
                        {formatCurrency(detailAmount)}
                      </td>
                      <td
                        style={{
                          ...styles.tdRight,
                          color: taxAmount >= 0 ? "#10b981" : "#ef4444",
                        }}
                      >
                        {taxAmount != 0
                          ? formatCurrency(Math.abs(taxAmount))
                          : "—"}
                      </td>
                      <td
                        style={{
                          ...styles.tdRight,
                          fontWeight: "500",
                          color: "#10b981",
                        }}
                      >
                        {formatCurrency(netAmount)}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Row */}
                <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                  <td colSpan="4" style={{ ...styles.td, textAlign: "right" }}>
                    Total:
                  </td>
                  <td style={{ ...styles.tdRight, fontWeight: "600" }}>
                    {formatCurrency(printSummary.totalAmount)}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color:
                        printSummary.totalTaxAmount >= 0
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {printSummary.totalTaxAmount != 0
                      ? formatCurrency(Math.abs(printSummary.totalTaxAmount))
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color: "#10b981",
                    }}
                  >
                    {formatCurrency(printSummary.netPayable)}
                  </td>
                </tr>
              </tbody>
            </table>
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
          Loading Income challan voucher details...
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
            Challan Voucher Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The challan voucher with ID #{id} does not exist or has been
            removed.
          </p>
          <Link
            to="/transactions/bookkeeping-vouchers/new-challan-update"
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
      {showPrint && (
        <PrintLayout
          title="Income Challan Voucher Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/bookkeeping-vouchers/new-challan-update")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Income Challan Voucher Details
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
            to={`/transactions/bookkeeping-vouchers/new-challan-update/edit/${id}`}
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

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Voucher Information
            </h2>
          </div>
          <div className="px-4 py-3">
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 ${voucher.Acc_Chl_No ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}
            >
              <div>
                <div className="text-xs text-gray-500">Challan No.</div>
                <div className="text-sm font-medium text-gray-900 mt-0.5">
                  {voucher.CV_No}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="text-sm font-medium text-gray-900 mt-0.5">
                  {formatDate(voucher.Ch_Date)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Branch</div>
                <div className="text-sm font-medium text-gray-900 mt-0.5">
                  {getBranchDisplay()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-0.5">{getStatusBadge()}</div>
              </div>
              {voucher.Acc_Chl_No && (
                <div>
                  <div className="text-xs text-gray-500">Receipt No.</div>
                  <div className="text-sm font-medium text-blue-600 mt-0.5">
                    {voucher.Acc_Chl_No}
                  </div>
                </div>
              )}
            </div>
            {voucher?.Status_Remark && (
              <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    Query:{" "}
                  </span>
                  <span className="text-xs text-amber-900">
                    {voucher.Status_Remark}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

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
                        Remarks
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Taxation
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {voucher.details.map((detail, idx) => {
                      const isCheque =
                        detail.Payment_Mode == "Cheque" ||
                        detail.Payment_Mode == "DD" ||
                        detail.Chq_No;
                      const isBank =
                        detail.Payment_Mode == "Bank" ||
                        detail.Payment_Mode == "Online" ||
                        detail.Payment_Mode == "Card" ||
                        (!detail.Chq_No && (detail.Acc_No || detail.IFSC_Code));

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
                            {isBank || isCheque ? detail.Bank_Name || "—" : "—"}
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
                          <td className="px-3 py-2 text-xs max-w-[200px] break-words">
                            {detail.Remarks || detail.remark || "—"}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {(() => {
                              const rowTaxes = (
                                detail.pay_details || []
                              ).filter(
                                (p) =>
                                  p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
                              );
                              if (rowTaxes.length == 0) return "—";
                              return (
                                <div className="space-y-0.5">
                                  {rowTaxes.map((t, ti) => {
                                    const label =
                                      t.invoice_charge?.IC_Name ||
                                      t.IC_Name ||
                                      "Tax";
                                    return (
                                      <div
                                        key={ti}
                                        className="text-gray-700 text-[10px]"
                                      >
                                        <span className="font-medium">
                                          {label}:
                                        </span>{" "}
                                        {formatCurrency(parseFloat(t.IC_Amt))}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-2 text-xs text-right font-medium">
                            {formatCurrency(detail.Amount)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Summary Row at the bottom of table */}
                    <tr className="bg-gray-100 border-t-2 border-gray-300">
                      <td
                        colSpan="13"
                        className="px-3 py-3 text-right text-xs font-semibold text-gray-800"
                      >
                        Total Amount:
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-semibold text-gray-800">
                        {formatCurrency(taxCalculation.grossAmount)}
                      </td>
                    </tr>
                    {taxCalculation.totalTax != 0 && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan="13"
                          className="px-3 py-2 text-right text-xs text-gray-700"
                        >
                          Tax Amount:{" "}
                          {taxCalculation.totalTax >= 0 ? "(+)" : "(-)"}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-gray-700">
                          {formatCurrency(Math.abs(taxCalculation.totalTax))}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-100 font-semibold">
                      <td
                        colSpan="13"
                        className="px-3 py-3 text-right text-xs font-bold text-gray-900"
                      >
                        Net Receivable:
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-gray-900">
                        {formatCurrency(taxCalculation.netAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

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
    </div>
  );
};

export default ViewNewChallanUpdate;

import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiX,
  FiSearch,
  FiCalendar,
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiFolder,
  FiFileText,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiPrinter as FiPrinterIcon,
} from "react-icons/fi";
import axios from "axios";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

// Format currency
const formatCurrency = (amount) => {
  if (amount == undefined || amount == null || amount == 0) return "-";
  const num = typeof amount == "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "-";
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  if (num < 0) {
    return `(${formatted})`;
  }
  return formatted;
};

// Helper to get deduction items as array from new API format
const getDeductionItems = (deductionHeadAmount) => {
  if (!deductionHeadAmount || !Array.isArray(deductionHeadAmount)) return [];
  return deductionHeadAmount.map(item => ({
    label: item.Deduction_Head,
    amount: parseFloat(item.Amount) || 0
  }));
};

// Helper to get total deduction amount
const getTotalDeduction = (deductionHeadAmount) => {
  if (!deductionHeadAmount || !Array.isArray(deductionHeadAmount)) return 0;
  return deductionHeadAmount.reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);
};

const SummaryExpenseReport = ({ user }) => {
  const navigate = useNavigate(); // Added useNavigate hook
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [pageTitle, setPageTitle] = useState("Summary Challan/Expense Report");
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [totalChequeAmount, setTotalChequeAmount] = useState(0);

  // Filter states
  const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    from_date: null,
    to_date: null,
  });
  const [hasGenerated, setHasGenerated] = useState(false);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  // Get dynamic page title
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/cash-bank/summary-expense-report";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Fetch report data from new API
  const fetchReportData = async (filters = null) => {
    setLoading(true);
    try {
      const activeFilters = filters || appliedFilters;

      const params = new URLSearchParams();

      if (activeFilters.from_date)
        params.append("start_date", activeFilters.from_date);
      if (activeFilters.to_date)
        params.append("end_date", activeFilters.to_date);

      const url = `${
        import.meta.env.VITE_API_URL
      }/chl-voucher/bank-payment-reciept-report?${params.toString()}`;
      const response = await axios.get(url,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });
      
      if (response.data?.success) {
        // Directly use the data array from response
        const transactions = response.data.data || [];
        
        // Sort by SrNo (they come sorted from API)
        const sortedTransactions = [...transactions].sort((a, b) => (a.SrNo || 0) - (b.SrNo || 0));
        
        setReportData(sortedTransactions);
        setTotalBillAmount(parseFloat(response.data.total_bill_amount) || 0);
        setTotalChequeAmount(parseFloat(response.data.total_cheque_amount) || 0);
      } else {
        setReportData([]);
        setTotalBillAmount(0);
        setTotalChequeAmount(0);
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading report data",
        type: "error",
      });
      setReportData([]);
      setTotalBillAmount(0);
      setTotalChequeAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setReportData([]);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    const emptyFilters = {
      from_date: null,
      to_date: null,
    };
    setAppliedFilters(emptyFilters);
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    const newFilters = {
      from_date: dateFrom || null,
      to_date: dateTo || null,
    };

    setAppliedFilters(newFilters);
    setHasGenerated(true);

    await fetchReportData(newFilters);
  };

  // Render transaction table with exact columns as per image
  const renderTransactionTable = () => {
    if (!reportData.length) return null;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Sr No.
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Voucher No
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200 whitespace-nowrap">
                  Trans. Date
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Party Name
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Bill No
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Cheque
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-700 border border-gray-200">
                  Bill Amount
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-700 border border-gray-200">
                  Cheque Amount
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Deduction Head | Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((transaction, idx) => {
                const deductionItems = getDeductionItems(transaction.Deduction_Head_Amount);
                const totalDeduction = getTotalDeduction(transaction.Deduction_Head_Amount);
                const billAmount = parseFloat(transaction.Bill_Amount) || 0;
                const chequeAmount = parseFloat(transaction.Cheque_Amount) || 0;
                
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-2 py-2 text-xs text-gray-600 border border-gray-200">
                      {transaction.SrNo || idx + 1}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {/* Added hyperlink for Voucher No */}
                      <button
  onClick={() =>
    window.open(
      `/transactions/bookkeeping-vouchers/new-expense-challan-update/view/${transaction.CV_Id}`,
      '_blank'
    )
  }
  className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
>
  {transaction.Voucher_No || "-"}
</button>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200 whitespace-nowrap">
                      {transaction.Trans_Date || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {transaction.Party_Name || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {transaction.Bill_No || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {transaction.Cheque || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono text-gray-700 border border-gray-200 whitespace-nowrap">
                      {formatCurrency(billAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono text-gray-700 border border-gray-200 whitespace-nowrap">
                      {formatCurrency(chequeAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {deductionItems.length > 0 ? (
                        <div className="border border-gray-200 rounded overflow-hidden">
                          <table className="w-full text-xs">
                            <tbody>
                              {deductionItems.map((item, i) => (
                                <tr key={i} className={i < deductionItems.length - 1 ? "border-b border-gray-100" : ""}>
                                  <td className="px-2 py-1 font-medium text-gray-700">{item.label}</td>
                                  <td className="px-2 py-1 text-right font-mono text-black-600">{formatCurrency(item.amount)}</td>
                                </tr>
                              ))}
                              {totalDeduction > 0 && (
                                <tr className="border-t border-gray-200 bg-gray-50">
                                  <td className="px-2 py-1 font-semibold text-gray-800">Total</td>
                                  <td className="px-2 py-1 text-right font-mono font-semibold text-black-700">{formatCurrency(totalDeduction)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
              <tr>
                <td colSpan="6" className="px-2 py-2 text-xs font-semibold text-gray-700 border border-gray-200">
                  Total
                </td>
                <td className="px-2 py-2 text-xs text-right font-mono font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  {formatCurrency(totalBillAmount)}
                </td>
                <td className="px-2 py-2 text-xs text-right font-mono font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  {formatCurrency(totalChequeAmount)}
                </td>
                <td className="px-2 py-2 text-xs text-right font-mono font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  {formatCurrency(totalBillAmount - totalChequeAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Render filters
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-1 h-3 w-3" /> Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-1 h-3 w-3" /> Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <FiSearch className="h-4 w-4 mr-2" />
              Generate Report
            </button>
            {(hasGenerated ||
              appliedFilters.from_date ||
              appliedFilters.to_date) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading report data...</p>
    </div>
  );

  // Render no data state
  const renderNoData = () =>
    !hasGenerated ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generate report to view results
        </h3>
        <p className="text-gray-600">
          Select filters and click{" "}
          <span className="font-medium">Generate Report</span> to fetch data.
        </p>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Records Found
        </h3>
        <p className="text-gray-600">
          No expense records found for the selected filters.
        </p>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );

  const hasData = reportData.length > 0;

  // Export to Excel
  const handleExcelExport = () => {
    const excelData = reportData.map((transaction) => {
      const deductionItems = getDeductionItems(transaction.Deduction_Head_Amount);
      const totalDeduction = getTotalDeduction(transaction.Deduction_Head_Amount);
      let deductionStr = "";
      if (deductionItems.length > 0) {
        deductionStr = deductionItems.map(item => `${item.label}: ${formatCurrency(item.amount)}`).join(", ");
      }
      return {
        "Sr No.": transaction.SrNo,
        "Voucher No": transaction.Voucher_No || "-",
        "Trans. Date": transaction.Trans_Date || "-",
        "Party Name": transaction.Party_Name || "-",
        "Bill No": transaction.Bill_No || "-",
        "Cheque": transaction.Cheque || "-",
        "Bill Amount": parseFloat(transaction.Bill_Amount) || 0,
        "Cheque Amount": parseFloat(transaction.Cheque_Amount) || 0,
        "Deduction Head | Amount": deductionStr || "-",
        "Total Deduction": totalDeduction,
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expense Transactions");

    // Adjust column widths
    ws["!cols"] = [
      { wch: 8 },   // Sr No.
      { wch: 12 },  // Voucher No
      { wch: 12 },  // Trans. Date
      { wch: 30 },  // Party Name
      { wch: 25 },  // Bill No
      { wch: 15 },  // Cheque
      { wch: 15 },  // Bill Amount
      { wch: 15 },  // Cheque Amount
      { wch: 40 },  // Deduction Head | Amount
      { wch: 15 },  // Total Deduction
    ];

    const fileName = `Expense_Transactions_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`${pageTitle}`}
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <div>
            <style>
              {`
                @media print {
                  .print-hidden {
                    display: none !important;
                  }
                  table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                  }
                  th, td {
                    border: 1px solid #ddd !important;
                    padding: 4px !important;
                    text-align: left !important;
                    font-size: 10px !important;
                  }
                  .no-print-border {
                    border: none !important;
                  }
                }
              `}
            </style>
            <h1 className="text-xl font-bold text-center mb-4">{pageTitle}</h1>
            {appliedFilters.from_date && appliedFilters.to_date && (
              <p className="text-center text-sm mb-4">
                Period: {appliedFilters.from_date} to {appliedFilters.to_date}
              </p>
            )}
            <div className="print-container">
              <table
                className="min-w-full"
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Sr No.
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Voucher No
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300 whitespace-nowrap">
                      Trans. Date
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Party Name
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Bill No
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Cheque
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-semibold border border-gray-300">
                      Bill Amount
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-semibold border border-gray-300">
                      Cheque Amount
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Deduction Head | Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((transaction, idx) => {
                    const deductionItems = getDeductionItems(transaction.Deduction_Head_Amount);
                    const totalDeduction = getTotalDeduction(transaction.Deduction_Head_Amount);
                    const billAmount = parseFloat(transaction.Bill_Amount) || 0;
                    const chequeAmount = parseFloat(transaction.Cheque_Amount) || 0;
                    
                    return (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {transaction.SrNo || idx + 1}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {/* Added hyperlink for Voucher No in print view */}
                          <span className="text-blue-600 font-medium">
                            {transaction.Voucher_No || "-"}
                          </span>
                        </td>
                        <td style={{padding:"3px 4px", border:"1px solid #ddd", fontSize:"10px", whiteSpace:"nowrap"}}>
                          {transaction.Trans_Date || "-"}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {transaction.Party_Name || "-"}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {transaction.Bill_No || "-"}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {transaction.Cheque || "-"}
                        </td>
                        <td className="px-2 py-2 text-xs text-right font-mono border border-gray-300">
                          {formatCurrency(billAmount)}
                        </td>
                        <td className="px-2 py-2 text-xs text-right font-mono border border-gray-300">
                          {formatCurrency(chequeAmount)}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {deductionItems.length > 0 ? (
                            <div className="border border-gray-200 rounded overflow-hidden">
                              <table className="w-full text-xs">
                                <tbody>
                                  {deductionItems.map((item, i) => (
                                    <tr key={i} className={i < deductionItems.length - 1 ? "border-b border-gray-100" : ""}>
                                      <td className="px-2 py-1 font-medium text-gray-700">{item.label}</td>
                                      <td className="px-2 py-1 text-right font-mono text-black-600">{formatCurrency(item.amount)}</td>
                                    </tr>
                                  ))}
                                  {totalDeduction > 0 && (
                                    <tr className="border-t border-gray-200 bg-gray-50">
                                      <td className="px-2 py-1 font-semibold text-gray-800">Total</td>
                                      <td className="px-2 py-1 text-right font-mono font-semibold text-black-700">{formatCurrency(totalDeduction)}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan="6" className="px-2 py-2 text-xs font-semibold border border-gray-300">
                      Total
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono font-bold border border-gray-300">
                      {formatCurrency(totalBillAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono font-bold border border-gray-300">
                      {formatCurrency(totalChequeAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono font-bold border border-gray-300">
                      {formatCurrency(totalBillAmount - totalChequeAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Signature Line - Print */}
            <div className="signature-block" style={{ display: "flex", justifyContent: "space-between", marginTop: "48px", padding: "0 8px" }}>
              <div className="signature-item" style={{ textAlign: "center" }}>
                <div className="signature-line" style={{ borderTop: "1px solid #1f2937", width: "160px", marginBottom: "4px" }}></div>
                <p className="signature-label" style={{ fontSize: "10px", fontWeight: "600" }}>Account HOD</p>
              </div>
              <div className="signature-item" style={{ textAlign: "center" }}>
                <div className="signature-line" style={{ borderTop: "1px solid #1f2937", width: "160px", marginBottom: "4px" }}></div>
                <p className="signature-label" style={{ fontSize: "10px", fontWeight: "600" }}>DYMC</p>
              </div>
            </div>
          </div>
        </PrintLayout>
      )}

      <div className="px-4 py-6 max-w-full">
        {/* Header with back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-grey-600 hover:text-grey-600 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors shadow-sm"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors shadow-sm"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Header with dynamic title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
            <p className="text-center text-sm text-gray-500 mt-1">
              Expense Transaction Details
            </p>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Period Display */}
          {hasGenerated &&
            appliedFilters.from_date &&
            appliedFilters.to_date && (
              <div className="mb-4 p-2 bg-blue-50 rounded-lg text-center text-sm text-blue-700 border border-blue-200">
                Report Period: {appliedFilters.from_date} to{" "}
                {appliedFilters.to_date}
              </div>
            )}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* No Data State */}
          {!loading && !hasData && renderNoData()}

          {/* Data Display - Transaction Table */}
          {!loading && hasData && renderTransactionTable()}

          {/* Signature Line */}
          {!loading && hasData && (
            <div className="flex justify-between mt-10 px-4">
              <div className="text-center">
                <div className="border-t border-gray-800 w-48 mb-1"></div>
                <p className="text-sm font-semibold text-gray-700">Account HOD</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 w-48 mb-1"></div>
                <p className="text-sm font-semibold text-gray-700">DYMC</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryExpenseReport;
import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiX,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import axios from "axios";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
const SLIP_DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

const DenominationDialog = ({ onConfirm, onCancel, dateWiseTotals }) => {
  const [pieces, setPieces] = useState({});
  const [error, setError] = useState("");
  const denomTotal = DENOMINATIONS.reduce(
    (sum, d) => sum + d * (parseInt(pieces[d]) || 0),
    0,
  );
  const cashTotal = dateWiseTotals.reduce((s, r) => s + r.total, 0);
  const currentPieces = pieces;

  const handleConfirm = () => {
    if (denomTotal != cashTotal) {
      setError(
        `Denomination total ₹${denomTotal.toLocaleString("en-IN")} does not match cash total ₹${cashTotal.toLocaleString("en-IN")}. Please correct the entries.`,
      );
      return;
    }
    setError("");
    onConfirm(denomTotal, currentPieces);
  };
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[520px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Cash Denomination
        </h3>

        {/* Date-wise Cash Totals */}
        {dateWiseTotals.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Date-wise Cash Total
            </p>
            <table className="w-full mb-1">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-600 px-3 py-2">
                    Total Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {dateWiseTotals.map(({ date, total }) => (
                  <tr key={date} className="border-t border-gray-100">
                    <td className="px-3 py-1.5 text-sm text-gray-700">
                      {date}
                    </td>
                    <td className="px-3 py-1.5 text-sm text-right font-mono text-gray-800">
                      {total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="px-3 pt-2 text-sm font-semibold text-gray-800">
                    Total
                  </td>
                  <td className="px-3 pt-2 text-right text-sm font-bold font-mono text-gray-900">
                    {dateWiseTotals
                      .reduce((s, r) => s + r.total, 0)
                      .toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Denomination Entry */}
        <p className="text-sm font-medium text-gray-700 mb-2">
          Enter Denomination
        </p>
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-gray-600 pb-2">
                Denomination (₹)
              </th>
              <th className="text-left text-sm font-medium text-gray-600 pb-2">
                No. of Pieces
              </th>
              <th className="text-right text-sm font-medium text-gray-600 pb-2">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {DENOMINATIONS.map((d) => (
              <tr key={d} className="border-t border-gray-100">
                <td className="py-1.5 text-sm text-gray-700">{d}</td>
                <td className="py-1.5">
                  <input
                    type="number"
                    min="0"
                    value={pieces[d] || ""}
                    onChange={(e) =>
                      setPieces((p) => ({ ...p, [d]: e.target.value }))
                    }
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="0"
                  />
                </td>
                <td className="py-1.5 text-right text-sm font-mono text-gray-700">
                  {d * (parseInt(pieces[d]) || 0) > 0
                    ? (d * parseInt(pieces[d])).toLocaleString("en-IN")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td
                colSpan="2"
                className="pt-2 text-sm font-semibold text-gray-800"
              >
                Total
              </td>
              <td className="pt-2 text-right text-sm font-bold font-mono text-gray-900">
                {denomTotal > 0 ? denomTotal.toLocaleString("en-IN") : "-"}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Confirm
          </button>
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckDepositSlipReport = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [pageTitle, setPageTitle] = useState("Deposit Slip Report");
  const [paymentType, setPaymentType] = useState("cheque");
  const [showDenomDialog, setShowDenomDialog] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(null);
  const [dateWiseTotals, setDateWiseTotals] = useState([]);
  const [denomPieces, setDenomPieces] = useState({});

  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const [appliedFilters, setAppliedFilters] = useState({
    from_date: null,
    to_date: null,
    payment_type: "cheque",
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == "/reports/core-ledger/check-deposit-slip",
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {}
  }, []);

  const transformReportData = (apiData, mode = "cheque") => {
    if (!apiData || !Array.isArray(apiData)) return [];
    const transactions = [];
    let sr = 1;
    apiData.forEach((item) => {
      // Filter by Payment Mode - only Cheque and DD
      const isChequeDD =
        item["Payment Mode"] == "Cheque" || item["Payment Mode"] == "DD";
      if (
        (mode == "cheque" && isChequeDD) ||
        (mode == "cash" && item["Payment Mode"] == "Cash") ||
        (mode == "both" && (isChequeDD || item["Payment Mode"] == "Cash"))
      ) {
        transactions.push({
          sr_no: sr++,
          cv_no: item.Receipt_No || item.CV_Id || "",
          party_name: item.Description || item.Bill_No || "",
          amount: item["Net Payable Amount"] || item.Base_Amount || 0,
          cheque_no: item["Payment Mode"] == "Cheque" ? item["Chq/DD No"] : "-",
          dd_no: item["Payment Mode"] == "DD" ? item["Chq/DD No"] : "-",
          payment_mode: item["Payment Mode"],
          ch_date: item.Trans_Date || item.Chalan_Date || "",
          bank_name: item["Bank Name"] || "",
          chq_dd_date: item["Chq/DD Date"] || "",
          base_amount: item.Base_Amount || 0,
          add_amount: item.Add_Amount || 0,
          deduct_amount: item.Deduct_Amount || 0,
          net_payable: item["Net Payable Amount"] || 0,
        });
      }
    });
    return transactions;
  };

  const fetchReportData = async (filters) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = new URLSearchParams();
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ch-income-summary-report?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
      if (response.data?.success && response.data?.data) {
        const transformed = transformReportData(
          response.data.data,
          filters.payment_type,
        );
        setReportData(transformed);
        if (transformed.length == 0)
          setMessage({
            text: "No transactions found for the selected filters",
            type: "info",
          });
      } else {
        setReportData([]);
        setMessage({
          text: response.data?.message || "No data found",
          type: "info",
        });
      }
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message ||
          err.message ||
          "Error loading report data",
        type: "error",
      });
      setReportData([]);
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
    setDateFrom(today);
    setDateTo(today);
    setPaymentType("cheque");
    setAppliedFilters({
      from_date: null,
      to_date: null,
      payment_type: "cheque",
    });
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    const newFilters = {
      from_date: dateFrom || null,
      to_date: dateTo || null,
      payment_type: paymentType,
    };
    if (paymentType == "cash" || paymentType == "both") {
      setPendingFilters(newFilters);
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (newFilters.from_date)
          params.append("from_date", newFilters.from_date);
        if (newFilters.to_date) params.append("to_date", newFilters.to_date);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ch-income-summary-report?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          },
        );
        if (response.data?.success && response.data?.data) {
          const cashData = transformReportData(response.data.data, "cash");
          const allData =
            newFilters.payment_type == "both"
              ? transformReportData(response.data.data, "both")
              : cashData;
          const dateMap = {};
          cashData.forEach((r) => {
            const d = r.ch_date || "Unknown";
            dateMap[d] = (dateMap[d] || 0) + (parseFloat(r.amount) || 0);
          });
          setDateWiseTotals(
            Object.entries(dateMap)
              .sort()
              .map(([date, total]) => ({ date, total })),
          );
          setPendingFilters({
            ...newFilters,
            _cachedData: cashData,
            _allData: allData,
          });
        } else {
          setDateWiseTotals([]);
          setPendingFilters({ ...newFilters, _cachedData: [], _allData: [] });
        }
      } catch {
        setDateWiseTotals([]);
        setPendingFilters({ ...newFilters, _cachedData: [] });
      } finally {
        setLoading(false);
      }
      setShowDenomDialog(true);
      return;
    }
    setAppliedFilters(newFilters);
    setHasGenerated(true);
    await fetchReportData(newFilters);
  };

  const handleDenomConfirm = (total, pieces) => {
    if (!pendingFilters) return;
    setShowDenomDialog(false);
    setDenomPieces(pieces || {});
    const { _cachedData, _allData, ...filters } = pendingFilters;
    setAppliedFilters(filters);
    setReportData(
      filters.payment_type == "both" ? _allData || [] : _cachedData || [],
    );
    setHasGenerated(true);
    if (
      !(filters.payment_type == "both" ? _allData?.length : _cachedData?.length)
    )
      setMessage({
        text: "No transactions found for the selected filters",
        type: "info",
      });
    setPendingFilters(null);
    setDateWiseTotals([]);
  };

  const formatCurrency = (amount) => {
    if (amount == undefined || amount == null || amount == 0) return "-";
    const num = typeof amount == "number" ? amount : parseFloat(amount);
    if (isNaN(num)) return "-";
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(num));
    return num < 0 ? `(${formatted})` : formatted;
  };

  const grandTotal = reportData.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0,
  );

  const isCash = appliedFilters.payment_type == "cash";
  const isBoth = appliedFilters.payment_type == "both";

  const numberToWords = (num) => {
    if (!num || num == 0) return "Zero";
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + inWords(n % 100000) : "")
        );
      return (
        inWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + inWords(n % 10000000) : "")
      );
    };
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    let words = inWords(intPart) + " Rupees";
    if (decPart > 0) words += " and " + inWords(decPart) + " Paise";
    return words + " Only";
  };

  const SingleSlip = ({
    forPrint = false,
    slipType,
    rows,
    slipPieces = denomPieces,
  }) => {
    const org = organization || {};
    const slipDate =
      appliedFilters.to_date || appliedFilters.from_date || today;
    const isSlipCash = slipType == "cash";
    const slipTotal = rows.reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0,
    );
    const chequeCount = rows.filter(
      (r) => r.payment_mode == "Cheque" || r.payment_mode == "DD",
    ).length;
    const textSm = forPrint ? "text-[9px]" : "text-xs";
    const textXs = forPrint ? "text-[8px]" : "text-[11px]";
    const border = "border border-gray-700";

    return (
      <div
        className={`${forPrint ? "w-full" : "max-w-2xl mx-auto"} font-sans mb-6`}
      >
        <div className={`${border} rounded`}>
          <div
            className={`grid grid-cols-3 ${border} divide-x divide-gray-700`}
          >
            <div
              className="p-2 flex flex-col justify-between"
              style={{ minHeight: "60px" }}
            >
              <img
                src="/kotak-mahindra-logo.png"
                alt="Bank Logo"
                className="w-20 h-8 object-cover"
                style={{ transform: "scale(1.5)", transformOrigin: "left" }}
              />

              <div className="mt-1">
                <div className="text-gray-900 font-bold">
                  {org.bank_name || "Bank Name:"}
                </div>
                <div className={`${textXs} text-gray-900 font-bold`}>
                  {org.branch_name || "Branch:"}
                </div>
              </div>
            </div>
            <div className={`p-2 ${textSm}`}>
              <div className="flex justify-between">
                <span className="text-gray-900 font-bold">Slip No:</span>
                <span className="font-mono"></span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-900 font-bold">Seal No:</span>
                <span className="font-mono"></span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-900 font-bold">Date:</span>
                <span className="font-semibold">{slipDate}</span>
              </div>
            </div>
            <div className={`p-2 ${textSm}`}>
              <div className="flex justify-between">
                <span className="text-gray-900 font-bold">GENERAL:</span>
                <span className="font-mono"></span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-semibold">BRANCH:</span>
              </div>
              <div className="text-gray-900 font-bold mt-1">
                <span className="text-gray-900">Saving/Depositing Branch:</span>
              </div>
              <div className="font-bold mt-1">
                <span className="text-gray-900">A/C NO:</span>
              </div>
              <div
                className={`font-bold text-right ${forPrint ? "text-[10px]" : "text-sm"}`}
              >
                {org.account_no || ""}
              </div>
            </div>
          </div>

          <div
            className={`grid grid-cols-2 ${border} divide-x divide-gray-700`}
          >
            <div className={`p-2 ${textSm}`}>
              <span className="text-gray-900">Saving /Depositing Branch: </span>
              <span className="font-semibold">{org.saving_branch || ""}</span>
            </div>
            <div className={`p-2 ${textSm}`}>
              <span className="text-gray-900">Full Name: </span>
              <span className="font-semibold">
                {org.org_name || org.name || ""}
              </span>
            </div>
          </div>

          <div
            className={`grid grid-cols-2 ${border} divide-x divide-gray-700`}
          >
            <div className={`p-2 ${textXs}`}>
              <span className="text-gray-900">Contact ph/Mob.no: </span>
              <span>{org.contact_no || ""}</span>
            </div>
            <div className={`p-2 ${textXs}`}>
              <span className="text-gray-900">PAN No above Rs49999: </span>
              <span>{org.pan_no || ""}</span>
            </div>
          </div>

          <div
            className={`grid ${isSlipCash ? "grid-cols-2" : "grid-cols-1"} ${border} divide-x divide-gray-700`}
          >
            <div>
              {isSlipCash ? (
                <div
                  className={`p-2 text-center font-bold ${forPrint ? "text-[10px]" : "text-sm"} text-gray-700 border-b border-gray-700`}
                >
                  જનરલ ટેક્સ આવક &nbsp;&nbsp; રોકડા
                </div>
              ) : (
                <div className={`p-2 ${textSm}`}>
                  <table
                    className="w-full"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className={`text-left ${textXs} py-1 px-1`}>
                          Bank
                        </th>
                        <th className={`text-left ${textXs} py-1 px-1`}>
                          Branch
                        </th>
                        <th className={`text-left ${textXs} py-1 px-1`}>
                          Cheque No.
                        </th>
                        <th className={`text-right ${textXs} py-1 px-1`}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className={`${textXs} py-0.5 px-1`}>
                            {row.bank_name || org.bank_name || ""}
                          </td>
                          <td className={`${textXs} py-0.5 px-1`}>
                            {org.branch_name || ""}
                          </td>
                          <td className={`${textXs} py-0.5 px-1`}>
                            {row.payment_mode == "Cheque"
                              ? row.cheque_no
                              : row.dd_no}
                          </td>
                          <td className={`${textXs} py-0.5 px-1 text-right`}>
                            {formatCurrency(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={`mt-2 ${textSm} font-semibold`}>
                    NO OF CHEQUES:{" "}
                    <span className="font-bold">{chequeCount}</span>
                  </div>
                  <div className={`${textXs} text-gray-500`}>
                    AS PER STATEMENT
                  </div>
                </div>
              )}
            </div>
            {isSlipCash && (
              <div className={`p-2 ${textXs}`}>
                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr className="border-b border-gray-400">
                      <th className={`text-left ${textXs} py-1`}>
                        Denomination
                      </th>
                      <th className={`text-center ${textXs} py-1`}>
                        No. of Piece
                      </th>
                      <th className={`text-right ${textXs} py-1`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SLIP_DENOMINATIONS.map((d) => {
                      const p = parseInt(slipPieces[d]) || 0;
                      return (
                        <tr key={d} className="border-b border-gray-100">
                          <td className={`${textXs} py-0.5`}>{d}</td>
                          <td className={`${textXs} py-0.5 text-center`}>
                            {p > 0 ? p : ""}
                          </td>
                          <td className={`${textXs} py-0.5 text-right`}>
                            {p > 0 ? (d * p).toLocaleString("en-IN") : ""}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className={`${textXs} py-0.5`}>Notes/coins</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td className={`${textXs} py-0.5`}>Diff.(C)</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-400">
                      <td className={`${textXs} font-semibold py-1`}>Total</td>
                      <td></td>
                      <td className={`${textXs} font-bold text-right py-1`}>
                        {formatCurrency(slipTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className={`${border} p-2 flex justify-between items-center`}>
            <div className={`${textSm}`}>
              <span className="text-gray-500">Rupees: </span>
              <span className="font-semibold">{numberToWords(slipTotal)}</span>
            </div>
            <div className="border border-gray-500 rounded px-4 py-3 text-center min-w-[160px]">
              <div className={`${textXs} text-gray-500`}>ACCOUNTS OFFICER,</div>
              <div className={`${textSm} font-semibold text-gray-800 mt-1`}>
                Ambaji Temple
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DepositSlip = ({ forPrint = false }) => {
    const cashRows = reportData.filter((r) => r.payment_mode == "Cash");
    const chequeRows = reportData.filter(
      (r) => r.payment_mode == "Cheque" || r.payment_mode == "DD",
    );
    if (isBoth)
      return (
        <div>
          {chequeRows.length > 0 && (
            <SingleSlip
              forPrint={forPrint}
              slipType="cheque"
              rows={chequeRows}
            />
          )}
          {cashRows.length > 0 && (
            <SingleSlip forPrint={forPrint} slipType="cash" rows={cashRows} />
          )}
        </div>
      );
    return (
      <SingleSlip
        forPrint={forPrint}
        slipType={isCash ? "cash" : "cheque"}
        rows={reportData}
      />
    );
  };

  const renderTable = () => <DepositSlip />;

  const PrintSlip = ({ slipType, rows, slipPieces = denomPieces }) => {
    const org = organization || {};
    const slipDate =
      appliedFilters.to_date || appliedFilters.from_date || today;
    const isSlipCash = slipType == "cash";
    const slipTotal = rows.reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0,
    );
    const chequeCount = rows.filter(
      (r) => r.payment_mode == "Cheque" || r.payment_mode == "DD",
    ).length;
    const b = "1px solid #374151";
    const s = { fontFamily: "sans-serif", fontSize: "9px", color: "#000000" };
    const p2 = "2px 5px";
    const cellStyle = {
      padding: p2,
      fontSize: "9px",
      color: "#000000",
      border: "none",
      borderBottom: "1px solid #e5e7eb",
    };
    const thStyle = {
      padding: p2,
      fontSize: "9px",
      color: "#000000",
      fontWeight: "700",
      border: "none",
      borderBottom: "1px solid #374151",
      textAlign: "left",
    };
    return (
      <div
        style={{ ...s, marginBottom: "12px", border: b, borderRadius: "4px" }}
      >
        {/* Slip Title */}
        <div
          style={{
            padding: "3px 6px",
            borderBottom: b,
            textAlign: "center",
            backgroundColor: "#f3f4f6",
          }}
        >
          <span style={{ fontSize: "9px", color: "#4b5563" }}>
            Report Period: {appliedFilters.from_date} to{" "}
            {appliedFilters.to_date} | Payment Type:{" "}
            {isSlipCash ? "Cash" : "Bank"}
          </span>
        </div>
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: b,
          }}
        >
          <div
            style={{
              padding: p2,
              borderRight: b,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <img
              src="/kotak-mahindra logo.png"
              alt="Bank Logo"
              style={{ width: "80px", height: "32px", objectFit: "cover" }}
            />
            <div
              style={{ fontWeight: "700", fontSize: "10px", color: "#000000" }}
            >
              {org.bank_name || "Bank Name"}
            </div>
            <div style={{ fontSize: "9px", color: "#000000" }}>
              {org.branch_name || "Branch"}
            </div>
          </div>
          <div style={{ padding: p2, borderRight: b }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "2px" }}>
              <span style={{ fontSize: "9px", fontWeight: "600" }}>
                Slip No:
              </span>
            </div>
            <div style={{ display: "flex", gap: "4px", marginBottom: "2px" }}>
              <span style={{ fontSize: "9px", fontWeight: "600" }}>
                Seal No:
              </span>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ fontSize: "9px", fontWeight: "600" }}>Date:</span>
              <span style={{ fontSize: "9px", fontWeight: "700" }}>
                {slipDate}
              </span>
            </div>
          </div>
          <div style={{ padding: p2 }}>
            <div style={{ fontSize: "9px", fontWeight: "700" }}>GENERAL:</div>
            <div style={{ fontSize: "9px", fontWeight: "700" }}>BRANCH:</div>
            <div style={{ fontSize: "9px", fontWeight: "700" }}>
              Saving/Depositing Branch:{" "}
              <span style={{ fontWeight: "400" }}>
                {org.saving_branch || ""}
              </span>
            </div>
            <div style={{ fontSize: "9px", fontWeight: "700" }}>
              A/C NO:{" "}
              <span style={{ fontWeight: "400" }}>{org.account_no || ""}</span>
            </div>
          </div>
        </div>
        {/* Saving Branch + Full Name */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: b,
          }}
        >
          <div style={{ padding: p2, borderRight: b }}>
            <span style={{ fontSize: "9px", fontWeight: "600" }}>
              Saving /Depositing Branch:{" "}
            </span>
            <span style={{ fontSize: "9px" }}>{org.saving_branch || ""}</span>
          </div>
          <div style={{ padding: p2 }}>
            <span style={{ fontSize: "9px", fontWeight: "600" }}>
              Full Name:{" "}
            </span>
            <span style={{ fontSize: "9px" }}>
              {org.org_name || org.name || ""}
            </span>
          </div>
        </div>
        {/* Contact / PAN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: b,
          }}
        >
          <div style={{ padding: p2, borderRight: b }}>
            <span style={{ fontSize: "9px", fontWeight: "600" }}>
              Contact ph/Mob.no:{" "}
            </span>
            <span style={{ fontSize: "9px" }}>{org.contact_no || ""}</span>
          </div>
          <div style={{ padding: p2 }}>
            <span style={{ fontSize: "9px", fontWeight: "600" }}>
              PAN No above Rs49999:{" "}
            </span>
            <span style={{ fontSize: "9px" }}>{org.pan_no || ""}</span>
          </div>
        </div>
        {/* Main content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isSlipCash ? "1fr 1fr" : "1fr",
            borderBottom: b,
          }}
        >
          <div style={{ borderRight: isSlipCash ? b : "none" }}>
            {isSlipCash ? (
              <div
                style={{
                  padding: p2,
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: "10px",
                  color: "#000000",
                  borderBottom: b,
                }}
              >
                જનરલ ટેક્સ આવક &nbsp;&nbsp; રોકડા
              </div>
            ) : (
              <div style={{ padding: p2 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Bank</th>
                      <th style={thStyle}>Branch</th>
                      <th style={thStyle}>Cheque No.</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={cellStyle}>
                          {row.bank_name || org.bank_name || ""}
                        </td>
                        <td style={cellStyle}>{org.branch_name || ""}</td>
                        <td style={cellStyle}>
                          {row.payment_mode == "Cheque"
                            ? row.cheque_no
                            : row.dd_no}
                        </td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>
                          {formatCurrency(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  style={{
                    marginTop: "2px",
                    fontSize: "9px",
                    fontWeight: "700",
                  }}
                >
                  NO OF CHEQUES: {chequeCount}
                </div>
                <div style={{ fontSize: "8px" }}>AS PER STATEMENT</div>
              </div>
            )}
          </div>
          {isSlipCash && (
            <div style={{ padding: p2 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Denomination</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      No. of Piece
                    </th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {SLIP_DENOMINATIONS.map((d) => {
                    const p = parseInt(slipPieces[d]) || 0;
                    return (
                      <tr key={d}>
                        <td style={cellStyle}>{d}</td>
                        <td style={{ ...cellStyle, textAlign: "center" }}>
                          {p > 0 ? p : ""}
                        </td>
                        <td style={{ ...cellStyle, textAlign: "right" }}>
                          {p > 0 ? (d * p).toLocaleString("en-IN") : ""}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={cellStyle}>Notes/coins</td>
                    <td style={cellStyle}></td>
                    <td style={cellStyle}></td>
                  </tr>
                  <tr>
                    <td style={cellStyle}>Diff.(C)</td>
                    <td style={cellStyle}></td>
                    <td style={cellStyle}></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: "700",
                        borderTop: "1px solid #374151",
                        borderBottom: "none",
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        borderTop: "1px solid #374151",
                        borderBottom: "none",
                      }}
                    ></td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        fontWeight: "700",
                        borderTop: "1px solid #374151",
                        borderBottom: "none",
                      }}
                    >
                      {formatCurrency(slipTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: p2,
          }}
        >
          <div style={{ fontSize: "9px", flex: 1, paddingRight: "8px" }}>
            <span style={{ fontWeight: "600" }}>Rupees: </span>
            <span style={{ fontWeight: "700" }}>
              {numberToWords(slipTotal)}
            </span>
          </div>
          <div
            style={{
              border: "1px solid #374151",
              borderRadius: "4px",
              padding: "4px 10px",
              textAlign: "center",
              minWidth: "140px",
            }}
          >
            <div style={{ fontSize: "8px", fontWeight: "600" }}>
              ACCOUNTS OFFICER,
            </div>
            <div
              style={{ fontSize: "9px", fontWeight: "700", color: "#E53935" }}
            >
              Ambaji Temple
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PrintReportContent = () => {
    const cashRows = reportData.filter((r) => r.payment_mode == "Cash");
    const chequeRows = reportData.filter(
      (r) => r.payment_mode == "Cheque" || r.payment_mode == "DD",
    );
    if (isBoth)
      return (
        <div>
          {chequeRows.length > 0 && (
            <PrintSlip slipType="cheque" rows={chequeRows} />
          )}
          {cashRows.length > 0 && <PrintSlip slipType="cash" rows={cashRows} />}
        </div>
      );
    return (
      <PrintSlip slipType={isCash ? "cash" : "cheque"} rows={reportData} />
    );
  };

  const handleExcelExport = () => {
    const exportData = reportData.map((row) => ({
      "SR. NO.": row.sr_no,
      "CHALLAN NO": row.cv_no,
      DATE: row.ch_date,
      "PARTY NAME": row.party_name,
      "AMOUNT (₹)": row.amount,
      ...(!isCash && {
        "CHEQUE / DD NO":
          row.payment_mode == "Cheque" ? row.cheque_no : row.dd_no,
      }),
    }));
    exportData.push({
      "SR. NO.": "",
      "CHALLAN NO": "",
      DATE: "",
      "PARTY NAME": "GRAND TOTAL",
      "AMOUNT (₹)": grandTotal,
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deposit_Slip");
    XLSX.writeFile(
      wb,
      `Deposit_Slip_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const hasData = reportData.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {showDenomDialog && (
        <DenominationDialog
          onConfirm={handleDenomConfirm}
          onCancel={() => {
            setShowDenomDialog(false);
            setPendingFilters(null);
            setDateWiseTotals([]);
          }}
          dateWiseTotals={dateWiseTotals}
        />
      )}
      {showPrint && (
        <PrintLayout
          title={pageTitle}
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="px-4 py-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center transition-colors shadow-sm disabled:opacity-50"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center transition-colors shadow-sm disabled:opacity-50"
            >
              <FiPrinter className="h-4 w-4 mr-2" /> Print
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {pageTitle}
          </h2>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiCalendar className="inline mr-1 h-3 w-3" /> Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    if (hasGenerated) invalidateReport();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiCalendar className="inline mr-1 h-3 w-3" /> Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    if (hasGenerated) invalidateReport();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => {
                    setPaymentType(e.target.value);
                    if (hasGenerated) invalidateReport();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm"
                >
                  <option value="cheque">Cheque/DD</option>
                  <option value="cash">Cash</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center disabled:opacity-60 transition-colors"
                >
                  <FiSearch className="h-4 w-4 mr-2" /> Generate Report
                </button>
                {(hasGenerated ||
                  appliedFilters.from_date ||
                  appliedFilters.to_date) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
                  >
                    <FiX className="h-4 w-4 mr-2" /> Clear
                  </button>
                )}
              </div>
            </div>

            {message.text && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-center ${message.type == "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-gray-100 text-gray-700 border border-gray-200"}`}
              >
                <FiAlertCircle className="h-4 w-4 mr-2" /> {message.text}
              </div>
            )}
          </div>

          {hasGenerated &&
            appliedFilters.from_date &&
            appliedFilters.to_date && (
              <div className="mb-4 p-2 bg-gray-100 rounded-lg text-center text-sm text-gray-700 border border-gray-200">
                Report Period: {appliedFilters.from_date} to{" "}
                {appliedFilters.to_date} | Payment Type:{" "}
                {appliedFilters.payment_type == "cash"
                  ? "Cash"
                  : appliedFilters.payment_type == "both"
                    ? "Cash & Cheque/DD"
                    : "Cheque/DD"}
              </div>
            )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading report data...</p>
            </div>
          )}

          {!loading && !hasData && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasGenerated
                  ? "No Records Found"
                  : "Generate report to view results"}
              </h3>
              <p className="text-gray-600">
                {hasGenerated ? (
                  "No transactions found for the selected filters."
                ) : (
                  <>
                    Select filters and click{" "}
                    <span className="font-medium">Generate Report</span> to
                    fetch data.
                  </>
                )}
              </p>
            </div>
          )}

          {!loading && hasData && renderTable()}
        </div>
      </div>
    </div>
  );
};

export default CheckDepositSlipReport;

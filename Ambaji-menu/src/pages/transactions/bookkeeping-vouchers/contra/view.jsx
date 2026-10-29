import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiPrinter,
  FiEye,
  FiAlertCircle,
  FiCalendar,
  FiFileText,
  FiEdit,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrintLayout from "../../../../components/printlayout";

const ContraVoucherView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organisationData, setOrganisationData] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const [groupedEntries, setGroupedEntries] = useState([]);
  const [viewTotals, setViewTotals] = useState({ debit: 0, credit: 0 });

  useEffect(() => {
    fetchOrganisationData();
    fetchVoucherData();
  }, [id]);

  const fetchOrganisationData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-org-master`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      if (response.data.success && response.data.data.length > 0) {
        setOrganisationData(response.data.data[0]);
      }
    } catch (err) {
      console.error("Error fetching organisation data:", err);
    }
  };

  const fetchVoucherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/finan-trns/vouchers?Vou_Ty=CON&Vou_Id=${id}`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.success && response.data.data.length > 0) {
        const voucherData = response.data.data[0];
        setVoucher(voucherData);

        const grouped = groupEntriesByLedger(voucherData.voucher_rows || []);
        setGroupedEntries(grouped);

        const totals = calculateViewTotals(voucherData.voucher_rows || []);
        setViewTotals(totals);
      } else {
        setError("Voucher not found");
      }
    } catch (err) {
      console.error("Error fetching voucher:", err);
      setError("Failed to load voucher details");
      toast.error("Failed to load voucher details", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateViewTotals = (rows) => {
    let totalDebit = 0;
    let totalCredit = 0;

    rows?.forEach((row) => {
      if (row.V_Mode == "G") {
        const debitAmount = parseFloat(row.Dr_Amt) || 0;
        const creditAmount = parseFloat(row.Cr_Amt) || 0;

        totalDebit += debitAmount;
        totalCredit += creditAmount;
      }
    });

    return { debit: totalDebit, credit: totalCredit };
  };

  const groupEntriesByLedger = (rows) => {
    const groups = {};

    rows?.forEach((row) => {
      const ledgerId = row.Lg_Id;
      if (!ledgerId) return;

      if (!groups[ledgerId]) {
        groups[ledgerId] = {
          ledger: row.ledger,
          subLedgerEntries: [],
          gEntry: null,
        };
      }

      if (row.V_Mode == "S" && row.sub_ledger) {
        groups[ledgerId].subLedgerEntries.push({
          subLedgerName: row.sub_ledger.SL_Name,
          subLedgerCode: row.sub_ledger.SL_Code,
          amount: row.SL_Amt || "0",
          isDebit: row.Dr_Amt && parseFloat(row.Dr_Amt) > 0,
          Dr_Amt: row.Dr_Amt,
          Cr_Amt: row.Cr_Amt,
        });
      } else if (row.V_Mode == "G") {
        groups[ledgerId].gEntry = {
          Dr_Amt: row.Dr_Amt,
          Cr_Amt: row.Cr_Amt,
          amount: parseFloat(row.Dr_Amt) || parseFloat(row.Cr_Amt) || 0,
        };
      }
    });

    return Object.values(groups).map((group, index) => ({
      id: index + 1,
      account: group.ledger,
      debitAmount: group.gEntry?.Dr_Amt || "0",
      creditAmount: group.gEntry?.Cr_Amt || "0",
      subLedgerEntries: group.subLedgerEntries.map((subEntry) => ({
        subLedgerName: subEntry.subLedgerName,
        subLedgerCode: subEntry.subLedgerCode,
        amount: subEntry.amount,
        Dr_Amt: subEntry.Dr_Amt,
        Cr_Amt: subEntry.Cr_Amt,
        isDebit: subEntry.isDebit,
      })),
      totalAmount: group.gEntry?.amount || 0,
    }));
  };

  const handlePrint = () => {
    setShowPrint(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const parts = dateString.split("/");
      if (parts.length == 3) {
        const [day, month, year] = parts;
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString("en-GB");
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getBalanceStatus = () => {
    if (!voucher) return "Unknown";
    return Math.abs(viewTotals.debit - viewTotals.credit) < 0.01
      ? "Balanced"
      : "Not Balanced";
  };

  const PrintReportContent = () => {
    if (!voucher) return null;

    const totalDebit = viewTotals.debit;
    const totalCredit = viewTotals.credit;

    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #E53935",
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
      td: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textBold: { fontWeight: "600" },
      textRight: { textAlign: "right" },
      currency: { fontFamily: "'Courier New', monospace" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Contra Voucher Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Voucher ID</td>
                <td style={styles.td}>{voucher.Vou_Id}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Type</td>
                <td style={styles.td}>Contra (CON)</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
                <td style={styles.td}>{formatDate(voucher.Vou_Dt)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Entries</td>
                <td style={styles.td}>{voucher.voucher_rows?.length || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Voucher Entries</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Particulars</th>
                <th style={{ ...styles.th, ...styles.textRight }}>Debit (₹)</th>
                <th style={{ ...styles.th, ...styles.textRight }}>
                  Credit (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedEntries.map((entry, index) => (
                <React.Fragment key={entry.id}>
                  <tr>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.textBold}>
                        {entry.account?.Lg_Name || "N/A"}
                      </div>
                      <div style={{ fontSize: "9px", color: "#6b7280" }}>
                        {entry.account?.Lg_Code || "N/A"}
                        {entry.account?.Lg_Eng_Name &&
                          ` | ${entry.account.Lg_Eng_Name}`}
                        {entry.account?.isBankAccount && (
                          <span style={{ color: "#059669", marginLeft: "4px" }}>
                            (Bank)
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...styles.currency,
                      }}
                    >
                      {parseFloat(entry.debitAmount) > 0
                        ? `₹${formatAmount(entry.debitAmount)}`
                        : ""}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...styles.currency,
                      }}
                    >
                      {parseFloat(entry.creditAmount) > 0
                        ? `₹${formatAmount(entry.creditAmount)}`
                        : ""}
                    </td>
                  </tr>

                  {entry.subLedgerEntries.map((subEntry, subIndex) => (
                    <tr
                      key={`${entry.id}-${subIndex}`}
                      style={{ backgroundColor: "#f9fafb" }}
                    >
                      <td style={styles.td}></td>
                      <td style={styles.td}>
                        <div style={{ paddingLeft: "20px" }}>
                          <div style={{ fontSize: "10px" }}>
                            {subEntry.subLedgerName}
                          </div>
                          {subEntry.subLedgerCode && (
                            <div style={{ fontSize: "8px", color: "#6b7280" }}>
                              Code: {subEntry.subLedgerCode}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#4b5563",
                              marginTop: "2px",
                            }}
                          >
                            Amount: ₹{formatAmount(subEntry.amount)}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan="2"
                  style={{
                    ...styles.td,
                    ...styles.textBold,
                    ...styles.textRight,
                  }}
                >
                  Totals:
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.textRight,
                    ...styles.currency,
                    ...styles.textBold,
                  }}
                >
                  ₹{formatAmount(totalDebit)}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.textRight,
                    ...styles.currency,
                    ...styles.textBold,
                  }}
                >
                  ₹{formatAmount(totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Timeline Information</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Voucher Created</td>
                <td style={styles.td}>{new Date().toLocaleString("en-IN")}</td>
                <td style={styles.td}>Report Generated</td>
                <td style={styles.td}>{new Date().toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading voucher details...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-black-100 flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="h-8 w-8 text-black-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {error || "Voucher Not Found"}
        </h3>
        <p className="text-gray-600 mb-6">
          The requested voucher could not be found.
        </p>
        <button
          onClick={() =>
            navigate("/transactions/bookkeeping-vouchers/contra-entries")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiChevronLeft className="h-5 w-5 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {showPrint && (
        <PrintLayout
          title="Contra Voucher Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organisationData}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <ToastContainer />

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/transactions/bookkeeping-vouchers/contra-entries"
              className="flex items-center px-3 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow"
            >
              <FiChevronLeft className="h-5 w-5" />
            </Link>

            <h1 className="text-2xl font-serif font-semibold text-gray-800">
              Contra Voucher Details
            </h1>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
            >
              <FiPrinter className="mr-2" />
              Print Report
            </button>

            <Link
              to={`/transactions/bookkeeping-vouchers/contra-entries/edit/${id}`}
              className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
            >
              <FiEdit className="mr-2" />
              Edit Voucher
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <FiFileText className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Voucher Information
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Voucher ID
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {voucher.Vou_Id}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Date
                    </label>
                    <div className="flex items-center text-gray-900">
                      <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(voucher.Vou_Dt)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Type
                    </label>
                    <div className="text-gray-900">Contra (CON)</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Number of Entries
                    </label>
                    <div className="flex items-center text-gray-900">
                      <FiEye className="h-4 w-4 text-gray-400 mr-2" />
                      {voucher.voucher_rows?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiFileText className="h-5 w-5 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Voucher Entries
                  </h2>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-7/12">
                      Particulars
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right w-2/12">
                      Debit (₹)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right w-2/12">
                      Credit (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedEntries.map((entry, index) => (
                    <React.Fragment key={entry.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.account?.Lg_Name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entry.account?.Lg_Code || "N/A"}
                            {entry.account?.Lg_Eng_Name &&
                              ` | ${entry.account.Lg_Eng_Name}`}
                            {entry.account?.isBankAccount && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Bank
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black-600 text-right">
                          {parseFloat(entry.debitAmount) > 0
                            ? `₹${formatAmount(entry.debitAmount)}`
                            : ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black-600 text-right">
                          {parseFloat(entry.creditAmount) > 0
                            ? `₹${formatAmount(entry.creditAmount)}`
                            : ""}
                        </td>
                      </tr>

                      {entry.subLedgerEntries.map((subEntry, subIndex) => (
                        <tr
                          key={`${entry.id}-${subIndex}`}
                          className="bg-gray-50 hover:bg-gray-100"
                        >
                          <td className="px-6 py-2"></td>
                          <td className="px-6 py-2 pl-12">
                            <div className="text-sm text-gray-700">
                              <div className="font-medium">
                                {subEntry.subLedgerName}
                              </div>
                              {subEntry.subLedgerCode && (
                                <div className="text-xs text-gray-500">
                                  Code: {subEntry.subLedgerCode}
                                </div>
                              )}
                              <div className="text-xs text-black-600 mt-1 font-semibold">
                                Amount: ₹{formatAmount(subEntry.amount)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-2 text-right"></td>
                          <td className="px-6 py-2 text-right"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-900"
                    >
                      Totals:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black-600 text-right">
                      ₹{formatAmount(viewTotals.debit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black-600 text-right">
                      ₹{formatAmount(viewTotals.credit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContraVoucherView;

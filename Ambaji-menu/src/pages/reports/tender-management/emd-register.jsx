import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const EmdRegister = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [pageTitle, setPageTitle] = useState("EMD Register");
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tenderId, setTenderId] = useState("");
  const [vendorId, setVendorId] = useState("");

  const [tenders, setTenders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tenderSearch, setTenderSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [showTenderDrop, setShowTenderDrop] = useState(false);
  const [showVendorDrop, setShowVendorDrop] = useState(false);

  const { organization } = useOrganization();

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [tRes, vRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/tender-entries/all`,{ 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/sub-ledgers/all`,{ 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }),
        ]);
        if (tRes.data?.success) setTenders(tRes.data.data || []);
        if (vRes.data?.success) setVendors(vRes.data.data || []);
      } catch (e) {}
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".tender-drop")) setShowTenderDrop(false);
      if (!e.target.closest(".vendor-drop")) setShowVendorDrop(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const item = menuDetails.find(
        (i) => i.Menu_Links == "/reports/tender-management/emd-register",
      );
      if (item?.Fnc_Title) setPageTitle(item.Fnc_Title);
    } catch (e) {}
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    setHasGenerated(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);
      if (tenderId) params.append("tender_id", tenderId);
      if (vendorId) params.append("vendor_id", vendorId);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/emd-register?${params.toString()}`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (response.data?.success) {
        setReportData(response.data.data);
        setMessage({
          text: response.data.message || "Report generated successfully",
          type: "success",
        });
      } else {
        setReportData(null);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      setReportData(null);
      setMessage({
        text: err.response?.data?.message || "Error loading EMD register",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setTenderId("");
    setVendorId("");
    setTenderSearch("");
    setVendorSearch("");
    setReportData(null);
    setHasGenerated(false);
    setMessage({ text: "", type: "" });
  };

  const entries = reportData?.entries || [];
  const summary = reportData?.summary || null;
  const hasData = entries.length > 0;

  const handleExcelExport = () => {
    const rows = entries.map((e) => ({
      "Tender Date": formatDate(e.tender_date),
      "Amount Proposed": e.amount_proposed || "",
      "Vendor Name": e.vendor_name || "",
      "EMD Date": formatDate(e.emd_submission_date),
      "EMD Amount": e.emd_amount || "",
      "Maturity Date": formatDate(e.maturity_date),
      Status: e.status_name || "",
    }));
    if (summary) {
      rows.push({
        "Tender Date": "TOTAL EMD AMOUNT",
        "Amount Proposed": "",
        "Vendor Name": "",
        "EMD Date": "",
        "EMD Amount": summary.total_emd_amount,
        "Maturity Date": "",
        Status: "",
      });
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EMD Register");
    XLSX.writeFile(wb, `EMDRegister.xlsx`);
  };

  const PrintReportContent = () => {
    const styles = {
      page: { fontFamily: "Arial, sans-serif", fontSize: "11px" },
      table: { width: "100%", borderCollapse: "collapse", fontSize: "10px" },
      th: {
        backgroundColor: "#ffffff",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #333",
        textAlign: "left",
        color: "#000000",
      },
      thRight: {
        backgroundColor: "#ffffff",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #333",
        textAlign: "right",
        color: "#000000",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #333",
        verticalAlign: "top",
        color: "#000000",
      },
      tdRight: {
        padding: "5px 8px",
        border: "1px solid #333",
        textAlign: "right",
        color: "#000000",
      },
    };
    return (
      <div style={styles.page}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tender Date</th>
              <th style={styles.thRight}>Amount Proposed</th>
              <th style={styles.th}>Vendor Name</th>
              <th style={styles.th}>EMD Date</th>
              <th style={styles.thRight}>EMD Amount</th>
              <th style={styles.th}>Maturity Date</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td style={styles.td}>{formatDate(e.tender_date)}</td>
                <td style={styles.tdRight}>{e.amount_proposed || ""}</td>
                <td style={styles.td}>{e.vendor_name || ""}</td>
                <td style={styles.td}>{formatDate(e.emd_submission_date)}</td>
                <td style={styles.tdRight}>{e.emd_amount || ""}</td>
                <td style={styles.td}>{formatDate(e.maturity_date)}</td>
                <td style={styles.td}>{e.status_name || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {summary && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              backgroundColor: "#ffffff",
              borderTop: "2px solid #333",
              fontWeight: "bold",
              fontSize: "12px",
              color: "#000000",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>TOTAL EMD AMOUNT</span>
            <span>₹ {summary.total_emd_amount}</span>
          </div>
        )}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              if (hasGenerated) {
                setHasGenerated(false);
                setReportData(null);
              }
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              if (hasGenerated) {
                setHasGenerated(false);
                setReportData(null);
              }
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[150px] relative tender-drop">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tender
          </label>
          <div
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            onClick={() => setShowTenderDrop((v) => !v)}
          >
            <span className={tenderId ? "text-gray-900" : "text-gray-400"}>
              {tenderId
                ? tenders.find((t) => t.TE_Id == parseInt(tenderId))
                    ?.Description || `Tender #${tenderId}`
                : "Select Tender"}
            </span>
            <span className="text-gray-400">▾</span>
          </div>
          {showTenderDrop && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
              <div className="p-2 border-b">
                <input
                  autoFocus
                  type="text"
                  value={tenderSearch}
                  onChange={(e) => setTenderSearch(e.target.value)}
                  placeholder="Search tender..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none text-sm"
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                <div
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-500"
                  onClick={() => {
                    setTenderId("");
                    setVendorId("");
                    setTenderSearch("");
                    setShowTenderDrop(false);
                    if (hasGenerated) {
                      setHasGenerated(false);
                      setReportData(null);
                    }
                  }}
                >
                  All Tenders
                </div>
                {tenders
                  .filter(
                    (t) =>
                      !tenderSearch ||
                      (t.Description || "")
                        .toLowerCase()
                        .includes(tenderSearch.toLowerCase()),
                  )
                  .map((t) => (
                    <div
                      key={t.TE_Id}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${tenderId == String(t.TE_Id) ? "bg-blue-100 font-medium" : ""}`}
                      onClick={() => {
                        setTenderId(String(t.TE_Id));
                        setVendorId("");
                        setTenderSearch("");
                        setShowTenderDrop(false);
                        if (hasGenerated) {
                          setHasGenerated(false);
                          setReportData(null);
                        }
                      }}
                    >
                      {t.Description || `Tender #${t.TE_Id}`}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[150px] relative vendor-drop">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor
          </label>
          <div
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            onClick={() => setShowVendorDrop((v) => !v)}
          >
            <span className={vendorId ? "text-gray-900" : "text-gray-400"}>
              {vendorId
                ? vendors.find((v) => v.SL_Id == parseInt(vendorId))?.SL_Name ||
                  `Vendor #${vendorId}`
                : "Select Vendor"}
            </span>
            <span className="text-gray-400">▾</span>
          </div>
          {showVendorDrop && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
              <div className="p-2 border-b">
                <input
                  autoFocus
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search vendor..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none text-sm"
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                <div
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-500"
                  onClick={() => {
                    setVendorId("");
                    setVendorSearch("");
                    setShowVendorDrop(false);
                    if (hasGenerated) {
                      setHasGenerated(false);
                      setReportData(null);
                    }
                  }}
                >
                  All Vendors
                </div>
                {vendors
                  .filter(
                    (v) =>
                      !vendorSearch ||
                      (v.SL_Name || "")
                        .toLowerCase()
                        .includes(vendorSearch.toLowerCase()),
                  )
                  .map((v) => (
                    <div
                      key={v.SL_Id}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${vendorId == String(v.SL_Id) ? "bg-blue-100 font-medium" : ""}`}
                      onClick={() => {
                        setVendorId(String(v.SL_Id));
                        setVendorSearch("");
                        setShowVendorDrop(false);
                        if (hasGenerated) {
                          setHasGenerated(false);
                          setReportData(null);
                        }
                      }}
                    >
                      {v.SL_Name}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiCheck className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          {(hasGenerated || fromDate || toDate || tenderId || vendorId) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <FiX className="h-4 w-4 mr-2" />
              Clear Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="space-y-2">
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Amount Proposed
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Vendor Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  EMD Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  EMD Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Maturity Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {entries.map((e, i) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {formatDate(e.tender_date) || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">
                    {e.amount_proposed || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {e.vendor_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {formatDate(e.emd_submission_date) || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">
                    {e.emd_amount || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {formatDate(e.maturity_date) || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        e.status_name?.toLowerCase() == "active"
                          ? "bg-green-100 text-green-800"
                          : e.status_name?.toLowerCase() == "released"
                            ? "bg-blue-100 text-blue-800"
                            : e.status_name?.toLowerCase() == "forfeited"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {e.status_name || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {summary && (
              <tfoot>
                <tr className="bg-white font-bold text-black border-t-2 border-gray-300">
                  <td colSpan={4} className="px-4 py-3 text-sm">
                    TOTAL EMD AMOUNT ({summary.total_records} records)
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    ₹ {summary.total_emd_amount}
                  </td>
                  <td colSpan={2} className="px-4 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
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

      <div className="px-2 py-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
          </div>

          {renderFilters()}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading EMD register data...</p>
            </div>
          )}

          {!loading && message.type == "error" && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

          {!loading && !hasGenerated && message.type != "error" && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generate report to view results
              </h3>
              <p className="text-gray-600">
                Apply filters if needed, then click{" "}
                <span className="font-medium">Generate Report</span>.
              </p>
            </div>
          )}

          {!loading && hasGenerated && !hasData && message.type != "error" && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No EMD Data Found
              </h3>
              <p className="text-gray-600 mb-4">
                No EMD entries available for the selected filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <FiX className="h-4 w-4 mr-2" /> Clear Filter
              </button>
            </div>
          )}

          {!loading && hasData && renderTable()}
        </div>
      </div>
    </div>
  );
};

export default EmdRegister;

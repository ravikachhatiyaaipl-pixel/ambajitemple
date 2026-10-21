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
import { Link } from "react-router-dom";
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

// Helper to get deduction items as array
const getDeductionItems = (deductionHeadAmount) => {
  if (!deductionHeadAmount || !Array.isArray(deductionHeadAmount)) return [];
  return deductionHeadAmount.map((item) => ({
    label: item.Deduction_Head,
    amount: parseFloat(item.Amount) || 0,
  }));
};

// Helper to get total deduction amount
const getTotalDeduction = (deductionHeadAmount) => {
  if (!deductionHeadAmount || !Array.isArray(deductionHeadAmount)) return 0;
  return deductionHeadAmount.reduce(
    (sum, item) => sum + (parseFloat(item.Amount) || 0),
    0,
  );
};

const SubLedgerBillSummaryReport = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [subLedgerLoading, setSubLedgerLoading] = useState(false);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [pageTitle, setPageTitle] = useState("Sub Ledger Bill Summary Report");
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [totalNetAmount, setTotalNetAmount] = useState(0);

  // Filter states
  const [dateFrom, setDateFrom] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [selectedSubLedger, setSelectedSubLedger] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLedger, setSelectedLedger] = useState("");
  const [subLedgerOptions, setSubLedgerOptions] = useState([]);
  const [filteredSubLedgerOptions, setFilteredSubLedgerOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [filteredDepartmentOptions, setFilteredDepartmentOptions] = useState(
    [],
  );
  const [ledgerOptions, setLedgerOptions] = useState([]);
  const [filteredLedgerOptions, setFilteredLedgerOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    from_date: null,
    to_date: null,
    SL_Id: null,
    Dpt_Id: null,
    Lg_Id: null,
  });
  const [hasGenerated, setHasGenerated] = useState(false);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();
  const dropdownRef = useRef(null);
  const departmentDropdownRef = useRef(null);
  const ledgerDropdownRef = useRef(null);

  // Get dynamic page title
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/cash-bank/sub-ledger-bill-summary-report";
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

  // Fetch sub-ledgers, departments, and ledgers on component mount
  useEffect(() => {
    fetchSubLedgers();
    fetchDepartments();
    fetchLedgers();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target)
      ) {
        setIsDepartmentDropdownOpen(false);
      }
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setIsLedgerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter sub-ledgers based on search term
  useEffect(() => {
    if (searchTerm.trim() == "") {
      setFilteredSubLedgerOptions(subLedgerOptions);
    } else {
      const filtered = subLedgerOptions.filter(
        (option) =>
          option.SL_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (option.SL_Id && option.SL_Id.toString().includes(searchTerm)),
      );
      setFilteredSubLedgerOptions(filtered);
    }
  }, [searchTerm, subLedgerOptions]);

  // Filter departments based on search term
  useEffect(() => {
    if (departmentSearchTerm.trim() == "") {
      setFilteredDepartmentOptions(departmentOptions);
    } else {
      const filtered = departmentOptions.filter(
        (option) =>
          option.Dpt_Name.toLowerCase().includes(
            departmentSearchTerm.toLowerCase(),
          ) ||
          (option.Dpt_id &&
            option.Dpt_id.toString().includes(departmentSearchTerm)),
      );
      setFilteredDepartmentOptions(filtered);
    }
  }, [departmentSearchTerm, departmentOptions]);

  // Filter ledgers based on search term - FIXED with null checks
  useEffect(() => {
    if (ledgerSearchTerm.trim() == "") {
      setFilteredLedgerOptions(ledgerOptions);
    } else {
      const filtered = ledgerOptions.filter((option) => {
        const searchLower = ledgerSearchTerm.toLowerCase();
        const lgName = option.Lg_Name || "";
        const lgEngName = option.Lg_Eng_Name || "";
        const lgCode = option.Lg_Code || "";
        const lgId = option.Lg_Id ? option.Lg_Id.toString() : "";

        return (
          lgName.toLowerCase().includes(searchLower) ||
          lgEngName.toLowerCase().includes(searchLower) ||
          lgCode.toLowerCase().includes(searchLower) ||
          lgId.includes(searchLower)
        );
      });
      setFilteredLedgerOptions(filtered);
    }
  }, [ledgerSearchTerm, ledgerOptions]);

  // Fetch sub-ledgers dropdown data
  const fetchSubLedgers = async () => {
    setSubLedgerLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/sub-ledgers/all`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.success) {
        const options = response.data.data || [];
        setSubLedgerOptions(options);
        setFilteredSubLedgerOptions(options);
      } else {
        setSubLedgerOptions([]);
        setFilteredSubLedgerOptions([]);
      }
    } catch (err) {
      console.error("Error fetching sub-ledgers:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading sub-ledgers",
        type: "error",
      });
      setSubLedgerOptions([]);
      setFilteredSubLedgerOptions([]);
    } finally {
      setSubLedgerLoading(false);
    }
  };

  // Fetch departments dropdown data
  const fetchDepartments = async () => {
    setDepartmentLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.success) {
        const options = response.data.data || [];
        setDepartmentOptions(options);
        setFilteredDepartmentOptions(options);
      } else {
        setDepartmentOptions([]);
        setFilteredDepartmentOptions([]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading departments",
        type: "error",
      });
      setDepartmentOptions([]);
      setFilteredDepartmentOptions([]);
    } finally {
      setDepartmentLoading(false);
    }
  };

  const fetchLedgers = async () => {
    setLedgerLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/ledgers/all/data`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.success) {
        const options = response.data.data || [];
        // Filter out ledgers where Lg_Buk = "Y"
        const filteredOptions = options.filter(
          (ledger) => ledger.Lg_Buk != "Y",
        );
        setLedgerOptions(filteredOptions);
        setFilteredLedgerOptions(filteredOptions);
      } else {
        setLedgerOptions([]);
        setFilteredLedgerOptions([]);
      }
    } catch (err) {
      console.error("Error fetching ledgers:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading ledgers",
        type: "error",
      });
      setLedgerOptions([]);
      setFilteredLedgerOptions([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Fetch report data
  const fetchReportData = async (filters = null) => {
    setLoading(true);
    try {
      const activeFilters = filters || appliedFilters;

      const params = new URLSearchParams();

      if (activeFilters.from_date)
        params.append("start_date", activeFilters.from_date);
      if (activeFilters.to_date)
        params.append("end_date", activeFilters.to_date);
      if (activeFilters.SL_Id) params.append("SL_Id", activeFilters.SL_Id);
      if (activeFilters.Dpt_Id) params.append("Dpt_Id", activeFilters.Dpt_Id);
      if (activeFilters.Lg_Id) params.append("Lg_Id", activeFilters.Lg_Id);

      const url = `${import.meta.env.VITE_API_URL}/chl-voucher/sub-ledger-bill-report?${params.toString()}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.success) {
        const transactions = response.data.data || [];
        setReportData(transactions);
        setTotalBillAmount(parseFloat(response.data.total_bill_amount) || 0);
        setTotalNetAmount(parseFloat(response.data.total_net_amount) || 0);
      } else {
        setReportData([]);
        setTotalBillAmount(0);
        setTotalNetAmount(0);
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading report data",
        type: "error",
      });
      setReportData([]);
      setTotalBillAmount(0);
      setTotalNetAmount(0);
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
    setSelectedSubLedger("");
    setSearchTerm("");
    setSelectedDepartment("");
    setDepartmentSearchTerm("");
    setSelectedLedger("");
    setLedgerSearchTerm("");
    const emptyFilters = {
      from_date: null,
      to_date: null,
      SL_Id: null,
      Dpt_Id: null,
      Lg_Id: null,
    };
    setAppliedFilters(emptyFilters);
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    const newFilters = {
      from_date: dateFrom || null,
      to_date: dateTo || null,
      SL_Id: selectedSubLedger || null,
      Dpt_Id: selectedDepartment || null,
      Lg_Id: selectedLedger || null,
    };

    setAppliedFilters(newFilters);
    setHasGenerated(true);

    await fetchReportData(newFilters);
  };

  // Select sub-ledger
  const handleSelectSubLedger = (slId, slName) => {
    setSelectedSubLedger(slId);
    setSearchTerm(slName);
    setIsDropdownOpen(false);
  };

  // Select department
  const handleSelectDepartment = (dptId, dptName) => {
    setSelectedDepartment(dptId);
    setDepartmentSearchTerm(dptName);
    setIsDepartmentDropdownOpen(false);
  };

  // Select ledger - Updated to show code in search field
  const handleSelectLedger = (lgId, lgName, lgEngName, lgCode) => {
    setSelectedLedger(lgId);
    const displayName = lgEngName || lgName || "Unnamed";
    const displayText = lgCode ? `${displayName} (${lgCode})` : displayName;
    setLedgerSearchTerm(displayText);
    setIsLedgerDropdownOpen(false);
  };

  // Render transaction table
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
                  Bill No
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200 whitespace-nowrap">
                  Bill Date
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Payment Mode
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-700 border border-gray-200">
                  Amount
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-700 border border-gray-200">
                  Net Amount
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  Deduction Head | Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((transaction, idx) => {
                const deductionItems = getDeductionItems(
                  transaction.Deduction_Head_Amount,
                );
                const totalDeduction = getTotalDeduction(
                  transaction.Deduction_Head_Amount,
                );
                const billAmount = parseFloat(transaction.Bill_Amount) || 0;
                const netAmount = parseFloat(transaction.Net_Amount) || 0;
                const cvId = transaction.CV_Id;
                const billNoLink = cvId
                  ? `/transactions/bookkeeping-vouchers/new-expense-challan-update/view/${cvId}`
                  : "#";

                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-2 py-2 text-xs text-gray-600 border border-gray-200">
                      {transaction.SrNo || idx + 1}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {cvId ? (
                        <Link
                          to={billNoLink}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {transaction.CV_No || "-"}
                        </Link>
                      ) : (
                        transaction.CV_No || "-"
                      )}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200 whitespace-nowrap">
                      {transaction.Cv_Date || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {transaction.Py_Mode || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono text-gray-700 border border-gray-200 whitespace-nowrap">
                      {formatCurrency(billAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono text-gray-700 border border-gray-200 whitespace-nowrap">
                      {formatCurrency(netAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                      {deductionItems.length > 0 ? (
                        <div className="border border-gray-200 rounded overflow-hidden">
                          <table className="w-full text-xs">
                            <tbody>
                              {deductionItems.map((item, i) => (
                                <tr
                                  key={i}
                                  className={
                                    i < deductionItems.length - 1
                                      ? "border-b border-gray-100"
                                      : ""
                                  }
                                >
                                  <td className="px-2 py-1 font-medium text-gray-700">
                                    {item.label}
                                  </td>
                                  <td className="px-2 py-1 text-right font-mono text-gray-600">
                                    {formatCurrency(item.amount)}
                                  </td>
                                </tr>
                              ))}
                              {totalDeduction > 0 && (
                                <tr className="border-t border-gray-200 bg-gray-50">
                                  <td className="px-2 py-1 font-semibold text-gray-800">
                                    Total
                                  </td>
                                  <td className="px-2 py-1 text-right font-mono font-semibold text-gray-700">
                                    {formatCurrency(totalDeduction)}
                                  </td>
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
                <td
                  colSpan="4"
                  className="px-2 py-2 text-xs font-semibold text-gray-700 border border-gray-200"
                >
                  Total
                </td>
                <td className="px-2 py-2 text-xs text-right font-mono font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  {formatCurrency(totalBillAmount)}
                </td>
                <td className="px-2 py-2 text-xs text-right font-mono font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  {formatCurrency(totalNetAmount)}
                </td>
                <td className="px-2 py-2 text-xs text-right font-mono font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  {formatCurrency(totalBillAmount - totalNetAmount)}
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
    const selectedSubLedgerName =
      subLedgerOptions.find(
        (option) => option.SL_Id == parseInt(selectedSubLedger),
      )?.SL_Name || "";

    const selectedDepartmentName =
      departmentOptions.find(
        (option) => option.Dpt_id == parseInt(selectedDepartment),
      )?.Dpt_Name || "";

    const selectedLedgerName =
      ledgerOptions.find((option) => option.Lg_Id == parseInt(selectedLedger))
        ?.Lg_Name || "";

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
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
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Ledger
            </label>
            <div
              className="relative cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <input
                type="text"
                placeholder="Search Sub Ledger..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                onFocus={() => setIsDropdownOpen(true)}
              />
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {subLedgerLoading ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Loading...
                  </div>
                ) : filteredSubLedgerOptions.length == 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No sub-ledgers found
                  </div>
                ) : (
                  filteredSubLedgerOptions.map((option) => (
                    <div
                      key={option.SL_Id}
                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm ${
                        selectedSubLedger == option.SL_Id.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                      onClick={() =>
                        handleSelectSubLedger(option.SL_Id, option.SL_Name)
                      }
                    >
                      {option.SL_Name}{" "}
                      {option.SL_Id ? `(ID: ${option.SL_Id})` : ""}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="relative" ref={departmentDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <div
              className="relative cursor-pointer"
              onClick={() =>
                setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
              }
            >
              <input
                type="text"
                placeholder="Search Department..."
                value={departmentSearchTerm}
                onChange={(e) => {
                  setDepartmentSearchTerm(e.target.value);
                  setIsDepartmentDropdownOpen(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                onFocus={() => setIsDepartmentDropdownOpen(true)}
              />
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {isDepartmentDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {departmentLoading ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Loading...
                  </div>
                ) : filteredDepartmentOptions.length == 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No departments found
                  </div>
                ) : (
                  filteredDepartmentOptions.map((option) => (
                    <div
                      key={option.Dpt_id}
                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm ${
                        selectedDepartment == option.Dpt_id.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                      onClick={() =>
                        handleSelectDepartment(option.Dpt_id, option.Dpt_Name)
                      }
                    >
                      {option.Dpt_Name}{" "}
                      {option.Dpt_id ? `(ID: ${option.Dpt_id})` : ""}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="relative" ref={ledgerDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ledger
            </label>
            <div
              className="relative cursor-pointer"
              onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
            >
              <input
                type="text"
                placeholder="Search Ledger..."
                value={ledgerSearchTerm}
                onChange={(e) => {
                  setLedgerSearchTerm(e.target.value);
                  setIsLedgerDropdownOpen(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                onFocus={() => setIsLedgerDropdownOpen(true)}
              />
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {isLedgerDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {ledgerLoading ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Loading...
                  </div>
                ) : filteredLedgerOptions.length == 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No ledgers found
                  </div>
                ) : (
                  filteredLedgerOptions.map((option) => (
                    <div
                      key={option.Lg_Id}
                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm ${
                        selectedLedger == option.Lg_Id.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                      onClick={() =>
                        handleSelectLedger(
                          option.Lg_Id,
                          option.Lg_Name,
                          option.Lg_Eng_Name,
                          option.Lg_Code,
                        )
                      }
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {option.Lg_Eng_Name || option.Lg_Name || "Unnamed"}
                        </span>
                        <div className="flex gap-2 text-xs text-gray-500">
                          {option.Lg_Name &&
                            option.Lg_Name != option.Lg_Eng_Name && (
                              <span>{option.Lg_Name}</span>
                            )}
                          {option.Lg_Code && (
                            <span>Code: {option.Lg_Code}</span>
                          )}
                          {option.Lg_Id && <span>ID: {option.Lg_Id}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            appliedFilters.to_date ||
            appliedFilters.SL_Id ||
            appliedFilters.Dpt_Id ||
            appliedFilters.Lg_Id) && (
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
          No records found for the selected filters.
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
      const deductionItems = getDeductionItems(
        transaction.Deduction_Head_Amount,
      );
      const totalDeduction = getTotalDeduction(
        transaction.Deduction_Head_Amount,
      );
      let deductionStr = "";
      if (deductionItems.length > 0) {
        deductionStr = deductionItems
          .map((item) => `${item.label}: ${formatCurrency(item.amount)}`)
          .join(", ");
      }
      return {
        "Sr No.": transaction.SrNo,
        "Bill No": transaction.CV_No || "-",
        "Bill Date": transaction.Cv_Date || "-",
        "Payment Mode": transaction.Py_Mode || "-",
        Amount: parseFloat(transaction.Bill_Amount) || 0,
        "Net Amount": parseFloat(transaction.Net_Amount) || 0,
        "Deduction Head | Amount": deductionStr || "-",
        "Total Deduction": totalDeduction,
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sub Ledger Bills");

    // Adjust column widths
    ws["!cols"] = [
      { wch: 8 }, // Sr No.
      { wch: 30 }, // Bill No
      { wch: 12 }, // Bill Date
      { wch: 15 }, // Payment Mode
      { wch: 15 }, // Amount
      { wch: 15 }, // Net Amount
      { wch: 40 }, // Deduction Head | Amount
      { wch: 15 }, // Total Deduction
    ];

    const fileName = `Sub_Ledger_Bills_${
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
            {appliedFilters.SL_Id && (
              <p className="text-center text-sm mb-4">
                Sub Ledger:{" "}
                {subLedgerOptions.find(
                  (opt) => opt.SL_Id == parseInt(appliedFilters.SL_Id),
                )?.SL_Name || appliedFilters.SL_Id}
              </p>
            )}
            {appliedFilters.Dpt_Id && (
              <p className="text-center text-sm mb-4">
                Department:{" "}
                {departmentOptions.find(
                  (opt) => opt.Dpt_id == parseInt(appliedFilters.Dpt_Id),
                )?.Dpt_Name || appliedFilters.Dpt_Id}
              </p>
            )}
            {appliedFilters.Lg_Id && (
              <p className="text-center text-sm mb-4">
                Ledger:{" "}
                {ledgerOptions.find(
                  (opt) => opt.Lg_Id == parseInt(appliedFilters.Lg_Id),
                )?.Lg_Name || appliedFilters.Lg_Id}
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
                      Bill No
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300 whitespace-nowrap">
                      Bill Date
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Payment Mode
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-semibold border border-gray-300">
                      Amount
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-semibold border border-gray-300">
                      Net Amount
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold border border-gray-300">
                      Deduction Head | Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((transaction, idx) => {
                    const deductionItems = getDeductionItems(
                      transaction.Deduction_Head_Amount,
                    );
                    const totalDeduction = getTotalDeduction(
                      transaction.Deduction_Head_Amount,
                    );
                    const billAmount = parseFloat(transaction.Bill_Amount) || 0;
                    const netAmount = parseFloat(transaction.Net_Amount) || 0;

                    return (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {transaction.SrNo || idx + 1}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {transaction.CV_No || "-"}
                        </td>
                        <td
                          style={{
                            padding: "3px 4px",
                            border: "1px solid #ddd",
                            fontSize: "10px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {transaction.Cv_Date || "-"}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {transaction.Py_Mode || "-"}
                        </td>
                        <td className="px-2 py-2 text-xs text-right font-mono border border-gray-300">
                          {formatCurrency(billAmount)}
                        </td>
                        <td className="px-2 py-2 text-xs text-right font-mono border border-gray-300">
                          {formatCurrency(netAmount)}
                        </td>
                        <td className="px-2 py-2 text-xs border border-gray-300">
                          {deductionItems.length > 0 ? (
                            <div className="border border-gray-200 rounded overflow-hidden">
                              <table className="w-full text-xs">
                                <tbody>
                                  {deductionItems.map((item, i) => (
                                    <tr
                                      key={i}
                                      className={
                                        i < deductionItems.length - 1
                                          ? "border-b border-gray-100"
                                          : ""
                                      }
                                    >
                                      <td className="px-2 py-1 font-medium text-gray-700">
                                        {item.label}
                                      </td>
                                      <td className="px-2 py-1 text-right font-mono text-gray-600">
                                        {formatCurrency(item.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                  {totalDeduction > 0 && (
                                    <tr className="border-t border-gray-200 bg-gray-50">
                                      <td className="px-2 py-1 font-semibold text-gray-800">
                                        Total
                                      </td>
                                      <td className="px-2 py-1 text-right font-mono font-semibold text-gray-700">
                                        {formatCurrency(totalDeduction)}
                                      </td>
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
                    <td
                      colSpan="4"
                      className="px-2 py-2 text-xs font-semibold border border-gray-300"
                    >
                      Total
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono font-bold border border-gray-300">
                      {formatCurrency(totalBillAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono font-bold border border-gray-300">
                      {formatCurrency(totalNetAmount)}
                    </td>
                    <td className="px-2 py-2 text-xs text-right font-mono font-bold border border-gray-300">
                      {formatCurrency(totalBillAmount - totalNetAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Signature Line - Print */}
            <div
              className="signature-block"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "48px",
                padding: "0 8px",
              }}
            >
              <div className="signature-item" style={{ textAlign: "center" }}>
                <div
                  className="signature-line"
                  style={{
                    borderTop: "1px solid #1f2937",
                    width: "160px",
                    marginBottom: "4px",
                  }}
                ></div>
                <p
                  className="signature-label"
                  style={{ fontSize: "10px", fontWeight: "600" }}
                >
                  Account HOD
                </p>
              </div>
              <div className="signature-item" style={{ textAlign: "center" }}>
                <div
                  className="signature-line"
                  style={{
                    borderTop: "1px solid #1f2937",
                    width: "160px",
                    marginBottom: "4px",
                  }}
                ></div>
                <p
                  className="signature-label"
                  style={{ fontSize: "10px", fontWeight: "600" }}
                >
                  DYMC
                </p>
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
              Sub Ledger Bill Summary Details
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
                {appliedFilters.SL_Id && (
                  <span className="ml-4">
                    Sub Ledger:{" "}
                    {subLedgerOptions.find(
                      (opt) => opt.SL_Id == parseInt(appliedFilters.SL_Id),
                    )?.SL_Name || appliedFilters.SL_Id}
                  </span>
                )}
                {appliedFilters.Dpt_Id && (
                  <span className="ml-4">
                    Department:{" "}
                    {departmentOptions.find(
                      (opt) => opt.Dpt_id == parseInt(appliedFilters.Dpt_Id),
                    )?.Dpt_Name || appliedFilters.Dpt_Id}
                  </span>
                )}
                {appliedFilters.Lg_Id && (
                  <span className="ml-4">
                    Ledger:{" "}
                    {ledgerOptions.find(
                      (opt) => opt.Lg_Id == parseInt(appliedFilters.Lg_Id),
                    )?.Lg_Name || appliedFilters.Lg_Id}
                  </span>
                )}
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
                <p className="text-sm font-semibold text-gray-700">
                  Account HOD
                </p>
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

export default SubLedgerBillSummaryReport;

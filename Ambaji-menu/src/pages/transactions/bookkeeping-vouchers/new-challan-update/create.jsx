import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Building,
  Layers,
  AlertCircle,
  Trash2,
  Plus,
  ChevronDown,
  Search,
  Check,
  Loader,
  XCircle,
  Hash,
  FileText,
  CreditCard,
  Lock,
  Banknote,
  Landmark,
  Receipt,
  Percent,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Pencil,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { newChallanFlowService } from "../../../services/newchallanflowservice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// =========  EXCEL IMPORT/EXPORT FUNCTIONS ==========

// Sample Data Template for Download
const getSampleChallanData = () => {
  return [
    {
      "Ledger Code": "10814A",
      "Party Name": "Sample Party Name",
      "GST No.": "24AAAAA0000A1Z",
      "Amount (₹)": "1000",
      "Payment Mode": "Cash",
      "File No.": "FILE001",
      Remarks: "Sample remark for testing",
      "Cheque/DD No.": "",
      "Cheque/DD Date": "",
      "Receipt Date": "",
      "Bank Name": "",
      "Account No.": "",
      "IFSC Code": "",
    },
    {
      "Ledger Code": "10808",
      "Party Name": "Another Party",
      "GST No.": "24BBBBB0000B2Z",
      "Amount (₹)": "2500",
      "Payment Mode": "Bank",
      "File No.": "FILE002",
      Remarks: "Bank transfer example",
      "Cheque/DD No.": "",
      "Cheque/DD Date": "",
      "Receipt Date": "2026-04-02",
      "Bank Name": "State Bank of India",
      "Account No.": "123456789012",
      "IFSC Code": "SBIN0001234",
    },
  ];
};

// Download Sample Excel Template
const downloadSampleTemplate = () => {
  const sampleData = getSampleChallanData();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const colWidths = [
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
  ];
  ws["!cols"] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Challan Template");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, "challan_template.xlsx");
};

// Parse Excel file and convert to Challan Details
const parseExcelToChallanDetails = async (file, ledgers, paymentModes) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const challanDetails = [];
        const warnings = [];

        const cleanChequeNumber = (value) => {
          if (!value) return "";
          return value.toString().trim().replace(/\D/g, "");
        };

        const ledgerByCodeMap = new Map();
        const ledgerByNameMap = new Map();

        ledgers.forEach((ledger) => {
          if (ledger.Lg_Code)
            ledgerByCodeMap.set(ledger.Lg_Code.toLowerCase(), ledger);
          if (ledger.Lg_Name)
            ledgerByNameMap.set(ledger.Lg_Name.toLowerCase(), ledger);
          if (ledger.Lg_Eng_Name)
            ledgerByNameMap.set(ledger.Lg_Eng_Name.toLowerCase(), ledger);
        });

        const validPaymentModeNames = paymentModes.map((mode) => mode.value);

        // Fuzzy match: find best payment mode from API list
        // paymentModes items have: { value: PayMd_Name, label, PayMd_ID, PayMd_Code, Is_Cash, Is_Digital }
        const matchPaymentMode = (input) => {
          if (!input) return null;
          const inputLower = input.trim().toLowerCase();

          // 1. Exact match on name or code (case-insensitive)
          const exact = paymentModes.find(
            (m) =>
              m.value.toLowerCase() == inputLower ||
              (m.PayMd_Code && m.PayMd_Code.toLowerCase() == inputLower),
          );
          if (exact)
            return {
              PayMd_ID: exact.PayMd_ID,
              Py_Mode: exact.value,
              fuzzy: false,
            };

          // 2. Starts-with match on name
          const startsWith = paymentModes.find(
            (m) =>
              m.value.toLowerCase().startsWith(inputLower) ||
              inputLower.startsWith(m.value.toLowerCase()),
          );
          if (startsWith)
            return {
              PayMd_ID: startsWith.PayMd_ID,
              Py_Mode: startsWith.value,
              fuzzy: true,
            };

          // 3. Contains match on name
          const contains = paymentModes.find(
            (m) =>
              m.value.toLowerCase().includes(inputLower) ||
              inputLower.includes(m.value.toLowerCase()),
          );
          if (contains)
            return {
              PayMd_ID: contains.PayMd_ID,
              Py_Mode: contains.value,
              fuzzy: true,
            };

          // 4. Word-level partial match on name
          const inputWords = inputLower.split(/\s+/);
          const wordMatch = paymentModes.find((m) => {
            const mWords = m.value.toLowerCase().split(/\s+/);
            return inputWords.some(
              (w) =>
                w.length > 1 &&
                mWords.some((mw) => mw.includes(w) || w.includes(mw)),
            );
          });
          if (wordMatch)
            return {
              PayMd_ID: wordMatch.PayMd_ID,
              Py_Mode: wordMatch.value,
              fuzzy: true,
            };

          return null;
        };

        for (let index = 0; index < jsonData.length; index++) {
          const row = jsonData[index];
          const rowNum = index + 2;

          let ledger = null;
          const ledgerCode = row["Ledger Code"]?.toString().trim();
          const ledgerName = row["Ledger Name"]?.toString().trim();

          if (ledgerCode) {
            ledger = ledgerByCodeMap.get(ledgerCode.toLowerCase());
            if (!ledger)
              warnings.push(
                `Row ${rowNum}: Ledger code "${ledgerCode}" not found.`,
              );
          } else if (ledgerName) {
            ledger = ledgerByNameMap.get(ledgerName.toLowerCase());
            if (!ledger)
              warnings.push(
                `Row ${rowNum}: Ledger name "${ledgerName}" not found.`,
              );
          }

          const amount = parseFloat(row["Amount (₹)"]);
          if (isNaN(amount) || amount <= 0) {
            warnings.push(`Row ${rowNum}: Invalid amount. Skipping.`);
            continue;
          }

          const paymentModeRaw = row["Payment Mode"]?.toString().trim() || "";
          const matchResult = matchPaymentMode(paymentModeRaw);
          let resolvedPayMode = ""; // PayMd_Name for display
          let resolvedPayMdID = null; // PayMd_ID FK for API

          if (!paymentModeRaw) {
            warnings.push(
              `Row ${rowNum}: Payment Mode is empty — please set it manually after import.`,
            );
          } else if (!matchResult) {
            warnings.push(
              `Row ${rowNum}: Payment Mode "${paymentModeRaw}" not found — please set it manually after import.`,
            );
          } else if (matchResult.fuzzy) {
            warnings.push(
              `Row ${rowNum}: Payment Mode "${paymentModeRaw}" matched as "${matchResult.Py_Mode}".`,
            );
            resolvedPayMode = matchResult.Py_Mode;
            resolvedPayMdID = matchResult.PayMd_ID;
          } else {
            resolvedPayMode = matchResult.Py_Mode;
            resolvedPayMdID = matchResult.PayMd_ID;
          }

          const rawChqNo = row["Cheque/DD No."]?.toString().trim() || "";
          const cleanedChqNo = cleanChequeNumber(rawChqNo);

          challanDetails.push({
            CV_Sr: challanDetails.length + 1,
            Lg_Id: ledger?.Lg_Id?.toString() || "",
            Bh_Id: ledger?.budget_head?.Bh_Id?.toString() || null,
            SL_Nm: row["Party Name"]?.toString().trim() || "",
            GST_No: row["GST No."]?.toString().trim() || "",
            Amount: amount.toString(),
            PayMd_ID: resolvedPayMdID, // FK for API
            Py_Mode: resolvedPayMode, // display name
            FileNo: row["File No."]?.toString().trim() || "",
            Remarks: row["Remarks"]?.toString().trim() || "",
            Chq_Date: row["Cheque/DD Date"]?.toString().trim() || "",
            Bank_Name: row["Bank Name"]?.toString().trim() || "",
            Acc_No: row["Account No."]?.toString().trim() || "",
            IFSC_Code: row["IFSC Code"]?.toString().trim() || "",
            Chq_No: cleanedChqNo,
            Rec_Date: row["Receipt Date"]?.toString().trim() || "",
          });
        }

        if (challanDetails.length == 0) {
          reject({
            errors: ["No valid data found in the Excel file."],
            partialData: [],
          });
        } else {
          // Always resolve — warnings are informational, not blocking
          resolve({ data: challanDetails, warnings });
        }
      } catch (error) {
        reject({
          errors: [`Failed to parse Excel file: ${error.message}`],
          partialData: [],
        });
      }
    };
    reader.onerror = () =>
      reject({ errors: ["Failed to read file"], partialData: [] });
    reader.readAsArrayBuffer(file);
  });
};

// Export current challan details to Excel
const exportToExcel = (challanDetails, ledgers) => {
  const exportData = challanDetails.map((detail) => {
    const ledger = ledgers.find((l) => l.Lg_Id == parseInt(detail.Lg_Id));
    return {
      "Ledger Code": ledger?.Lg_Code || "",
      "Party Name": detail.SL_Nm || "",
      "GST No.": detail.GST_No || "",
      "Amount (₹)": detail.Amount || "0",
      "Payment Mode": detail.Py_Mode || "",
      "File No.": detail.FileNo || "",
      Remarks: detail.Remarks || "",
      "Cheque/DD No.": detail.Chq_No || "",
      "Cheque/DD Date": detail.Chq_Date || "",
      "Receipt Date": detail.Rec_Date || "",
      "Bank Name": detail.Bank_Name || "",
      "Account No.": detail.Acc_No || "",
      "IFSC Code": detail.IFSC_Code || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const colWidths = [
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
  ];
  ws["!cols"] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Challan Data");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, `challan_data_${new Date().toISOString().split("T")[0]}.xlsx`);
};

// =========  SEARCHABLE DROPDOWN COMPONENT ==========
const SearchableDropdown = ({
  label,
  value,
  error,
  required = false,
  icon: Icon,
  isOpen,
  setIsOpen,
  searchTerm,
  setSearchTerm,
  items,
  filteredItems,
  highlightedIndex,
  onSelect,
  onKeyDown,
  onSearchKeyDown,
  onItemKeyDown,
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  itemRefs,
  listRef,
  disabled = false,
  renderItem,
}) => {
  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}
        <button
          ref={buttonRef}
          type="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={!disabled ? onKeyDown : undefined}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors overflow-hidden`}
        >
          {value ? (
            <span className="text-gray-900 block truncate w-full">
              {getSelectedDisplay()}
            </span>
          ) : (
            <span className="text-gray-500 truncate block w-full">
              {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
            </span>
          )}
        </button>
        {!disabled && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
        {error && (
          <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "300px" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div ref={listRef} className="overflow-y-auto max-h-64">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <button
                  key={item.Dpt_id || item.Cht_Id || item.Lg_Id || idx}
                  ref={(el) => {
                    if (el && itemRefs.current) itemRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => onSelect(item)}
                  onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                    highlightedIndex == idx ? "bg-blue-100" : "text-gray-700"
                  }`}
                  tabIndex={0}
                >
                  {renderItem ? renderItem(item) : item.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No items found</p>
              </div>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// =========  CHALLAN DETAIL ROW COMPONENT ==========
const ChallanDetailRow = ({
  index,
  detail,
  onChange,
  onRemove,
  showRemove,
  ledgers,
  loadingLedgers,
  paymentModes,
  errors,
  ledgerRefs,
  slNameRefs,
  gstNoRefs,
  amountRefs,
  pyModeRefs,
  fileNoRefs,
  remarksRefs,
  chqDateRefs,
  ifscRefs,
  accNoRefs,
  chqNoRefs,
  recDateRefs,
  bankNameRefs,
  isEditMode,
  hideRow2 = false,
  subLedgers = [],
  onPaymentModeSelect,
  filteredLedgersForBranch = [],
  branchBudgetHeadIds = [],
}) => {
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerButtonRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const ledgerListRef = useRef(null);

  // Party name: combo — typed input + dropdown
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [partyInputValue, setPartyInputValue] = useState(detail.SL_Nm || "");
  const [filteredParties, setFilteredParties] = useState([]);
  const [partyHighlightedIndex, setPartyHighlightedIndex] = useState(-1);
  const partyDropdownRef = useRef(null);
  const partyInputRef = useRef(null);
  const partyItemRefs = useRef([]);
  const partyListRef = useRef(null);

  // GST lookup loading state
  const [gstLookupLoading, setGstLookupLoading] = useState(false);

  // Sync partyInputValue when detail.SL_Nm changes externally (edit mode load)
  useEffect(() => {
    setPartyInputValue(detail.SL_Nm || "");
  }, [detail.SL_Nm]);

  useEffect(() => {
    const term = partyInputValue.trim().toLowerCase();
    if (!term) {
      setFilteredParties(subLedgers.slice(0, 100));
    } else {
      setFilteredParties(
        subLedgers
          .filter(
            (p) =>
              (p.SL_Name || p.SL_Nm || "").toLowerCase().includes(term) ||
              (p.GSTIN || "").toLowerCase().includes(term) ||
              (p.SL_Code || "").toLowerCase().includes(term),
          )
          .slice(0, 100),
      );
    }
    setPartyHighlightedIndex(-1);
  }, [partyInputValue, subLedgers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        partyDropdownRef.current &&
        !partyDropdownRef.current.contains(event.target)
      ) {
        setIsPartyDropdownOpen(false);
        setPartyHighlightedIndex(-1);
        // Commit typed value as SL_Nm if changed
        const trimmed = partyInputValue.trim();
        if (trimmed != detail.SL_Nm) {
          onChange(index, {
            SL_Nm: trimmed,
            SL_Id: null,
            GST_No: "",
            Bank_Name: "",
            Acc_No: "",
            IFSC_Code: "",
          });
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [partyInputValue, detail.SL_Nm]);

  const handlePartySelect = (party) => {
    const gst = party.GSTIN || party.SL_GST || party.GST_No || "";
    const name = party.SL_Name || party.SL_Nm || "";

    const bankName = party.Bank_Name || "";
    const accountNumber = party.Account_Number || "";
    const ifscCode = party.IFSC_Code || "";
    const accountType = party.Account_Type || "";

    setPartyInputValue(name);
    onChange(index, {
      SL_Nm: name,
      GST_No: gst,
      SL_Id: party.SL_Id || null,
      Bank_Name: bankName,
      Acc_No: accountNumber,
      IFSC_Code: ifscCode,
      Account_Type: accountType,
    });
    setIsPartyDropdownOpen(false);
    setPartyHighlightedIndex(-1);
    setTimeout(() => {
      if (gstNoRefs.current?.[index]) {
        gstNoRefs.current[index].focus();
      }
    }, 100);
  };

  // UPDATED: Clear bank details when manually typing
  const handlePartyInputChange = (e) => {
    const val = e.target.value;
    setPartyInputValue(val);
    setIsPartyDropdownOpen(true);
    if (!val.trim()) {
      // Clear all party-related fields when input is cleared
      onChange(index, {
        SL_Nm: "",
        SL_Id: null,
        GST_No: "",
        Bank_Name: "",
        Acc_No: "",
        IFSC_Code: "",
      });
    } else {
      // When typing manually, clear the SL_Id and bank details since it's not a selected party
      onChange(index, {
        SL_Nm: val.trim(),
        SL_Id: null,
        GST_No: "",
        Bank_Name: "",
        Acc_No: "",
        IFSC_Code: "",
      });
    }
  };

  // UPDATED: Handle Enter key with manual entry
  const handlePartyInputKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredParties.length > 0) {
        setIsPartyDropdownOpen(true);
        setPartyHighlightedIndex(0);
        setTimeout(() => partyItemRefs.current[0]?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPartyDropdownOpen(false);
      setPartyHighlightedIndex(-1);
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (
        isPartyDropdownOpen &&
        partyHighlightedIndex >= 0 &&
        filteredParties[partyHighlightedIndex]
      ) {
        handlePartySelect(filteredParties[partyHighlightedIndex]);
      } else if (isPartyDropdownOpen && filteredParties.length > 0) {
        handlePartySelect(filteredParties[0]);
      } else {
        const trimmed = partyInputValue.trim();
        // When manually entering a new party, clear all bank details and SL_Id
        onChange(index, {
          SL_Nm: trimmed,
          SL_Id: null,
          GST_No: "",
          Bank_Name: "",
          Acc_No: "",
          IFSC_Code: "",
        });
        setIsPartyDropdownOpen(false);
        setTimeout(() => gstNoRefs.current?.[index]?.focus(), 50);
      }
    } else if (e.key == "Tab") {
      setIsPartyDropdownOpen(false);
      const trimmed = partyInputValue.trim();
      if (trimmed != detail.SL_Nm) {
        // When tabbing out with manual entry, clear bank details
        onChange(index, {
          SL_Nm: trimmed,
          SL_Id: null,
          GST_No: "",
          Bank_Name: "",
          Acc_No: "",
          IFSC_Code: "",
        });
      }
    }
  };

  const handlePartyItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredParties.length) {
        setPartyHighlightedIndex(nextIndex);
        setTimeout(() => partyItemRefs.current[nextIndex]?.focus(), 0);
      } else {
        setPartyHighlightedIndex(-1);
        setTimeout(() => partyInputRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setPartyHighlightedIndex(-1);
        setTimeout(() => partyInputRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setPartyHighlightedIndex(prevIndex);
        setTimeout(() => partyItemRefs.current[prevIndex]?.focus(), 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handlePartySelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPartyDropdownOpen(false);
      setPartyHighlightedIndex(-1);
      setTimeout(() => partyInputRef.current?.focus(), 0);
    }
  };

  const renderPartyItem = (party) => {
    const name = party.SL_Name || party.SL_Nm || "";
    const gstin = party.GSTIN || party.SL_GST || party.GST_No || "";
    const code = party.SL_Code || "";
    const bankName = party.Bank_Name || "";
    return (
      <div className="py-1">
        <div className="font-medium text-gray-900 truncate">{name}</div>
        {gstin && (
          <div className="text-xs text-gray-500 mt-0.5">GST: {gstin}</div>
        )}
        {code && (
          <div className="text-xs text-gray-400 mt-0.5">Code: {code}</div>
        )}
        {bankName && (
          <div className="text-xs text-blue-600 mt-0.5">Bank: {bankName}</div>
        )}
      </div>
    );
  };

  // GST No lookup on blur — check if GSTIN already belongs to an existing SL
  const handleGstBlur = async (e) => {
    const gstVal = e.target.value.trim().toUpperCase();
    if (!gstVal || gstVal.length < 15) return;
    setGstLookupLoading(true);
    try {
      const res = await newChallanFlowService.getSubLedgerByGSTIN(gstVal);
      if (res.success && res.data) {
        const found = res.data;
        // Don't prompt if the user already selected this exact SL
        if (detail.SL_Id && detail.SL_Id == found.SL_Id) return;
        const result = await Swal.fire({
          title: "Sub-Ledger Found",
          html: `A sub-ledger already exists with this GST No.<br/><br/><b>${found.SL_Name}</b><br/><span style="font-size:12px;color:#6b7280">GST: ${found.GSTIN}</span><br/><br/>Do you want to use this existing sub-ledger?`,
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#EF5350",
          cancelButtonColor: "#ef4444",
          confirmButtonText: "Yes, use it",
          cancelButtonText: "No, clear GST",
        });
        if (result.isConfirmed) {
          setPartyInputValue(found.SL_Name);
          onChange(index, {
            SL_Nm: found.SL_Name,
            GST_No: found.GSTIN,
            SL_Id: found.SL_Id,
          });
        } else {
          onChange(index, { GST_No: "" });
        }
      }
      // data == null means GSTIN not found — new GST, allow it
    } catch (_err) {
      // Silently ignore network errors for GST lookup
    } finally {
      setGstLookupLoading(false);
    }
  };

  useEffect(() => {
    const ledgersToUse = filteredLedgersForBranch || ledgers;
    if (!ledgerSearchTerm.trim()) {
      setFilteredLedgers(ledgersToUse.slice(0, 100));
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      setFilteredLedgers(
        ledgersToUse
          .filter(
            (ledger) =>
              ledger.Lg_Name?.toLowerCase().includes(term) ||
              (ledger.Lg_Eng_Name &&
                ledger.Lg_Eng_Name.toLowerCase().includes(term)) ||
              (ledger.Lg_Code && ledger.Lg_Code.toLowerCase().includes(term)),
          )
          .slice(0, 100),
      );
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, filteredLedgersForBranch, ledgers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setIsLedgerDropdownOpen(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isLedgerDropdownOpen]);

  const handleLedgerSelect = (ledger) => {
    onChange(index, {
      Lg_Id: ledger.Lg_Id?.toString(),
      Bh_Id: ledger.budget_head?.Bh_Id?.toString() || null,
    });
    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);
    setTimeout(() => {
      if (partyInputRef.current) {
        partyInputRef.current.focus();
      }
    }, 100);
  };

  const getSelectedLedgerDisplay = () => {
    if (!detail.Lg_Id) return "";
    const selected = ledgers.find((l) => l.Lg_Id == parseInt(detail.Lg_Id));
    if (!selected) return `Ledger ID: ${detail.Lg_Id}`;
    let displayText = selected.Lg_Name || "";
    if (selected.Lg_Eng_Name && selected.Lg_Eng_Name != selected.Lg_Name)
      displayText += ` (${selected.Lg_Eng_Name})`;
    if (selected.Lg_Code) displayText += ` - ${selected.Lg_Code}`;
    return displayText;
  };

  const renderLedgerItem = (ledger) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">
        {ledger.Lg_Name || "No Name"}
      </div>
      {ledger.Lg_Eng_Name && (
        <div className="text-xs text-gray-600 mt-0.5">{ledger.Lg_Eng_Name}</div>
      )}
      {ledger.Lg_Code && (
        <div className="text-xs text-gray-500 mt-1">
          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
            {ledger.Lg_Code}
          </span>
        </div>
      )}
    </div>
  );

  const handleLedgerKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (!detail.Lg_Id) {
        setIsLedgerDropdownOpen(true);
        setLedgerSearchTerm("");
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      } else if (partyInputRef.current) {
        partyInputRef.current.focus();
      }
    } else if (["ArrowDown", "ArrowUp", " "].includes(e.key)) {
      e.preventDefault();
      setIsLedgerDropdownOpen(true);
      setLedgerSearchTerm("");
      setLedgerHighlightedIndex(-1);
      setTimeout(() => ledgerSearchRef.current?.focus(), 0);
    }
  };

  const handleLedgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLedgers.length > 0) {
        setLedgerHighlightedIndex(0);
        setTimeout(() => {
          if (ledgerItemRefs.current[0]) {
            ledgerItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredLedgers.length > 0 && ledgerHighlightedIndex >= 0) {
        handleLedgerSelect(filteredLedgers[ledgerHighlightedIndex]);
      } else if (filteredLedgers.length > 0) {
        handleLedgerSelect(filteredLedgers[0]);
      }
    }
  };

  const handleLedgerItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLedgers.length) {
        setLedgerHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (ledgerItemRefs.current[nextIndex]) {
            ledgerItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setLedgerHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (ledgerItemRefs.current[prevIndex]) {
            ledgerItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleLedgerSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Challan Detail #{index + 1}
        </h4>
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3 overflow-visible">
        {/* Ledger Account Dropdown */}
        <div className="overflow-visible">
          <div
            ref={ledgerDropdownRef}
            className="relative flex items-center gap-3 overflow-visible"
          >
            <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
              Ledger Account *
            </label>
            <div className="relative flex-1 min-w-0">
              <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <button
                ref={(el) => {
                  ledgerButtonRef.current = el;
                  if (ledgerRefs.current) ledgerRefs.current[index] = el;
                }}
                type="button"
                onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
                onKeyDown={handleLedgerKeyDown}
                className={`w-full pl-10 pr-10 py-2.5 border ${
                  errors[`ChallanDetail_${index}_Lg_Id`]
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white text-sm`}
                disabled={loadingLedgers}
              >
                {loadingLedgers ? (
                  <span className="text-gray-500 block truncate">
                    Loading ledgers...
                  </span>
                ) : detail.Lg_Id ? (
                  <span className="text-gray-900 block truncate">
                    {getSelectedLedgerDisplay()}
                  </span>
                ) : (
                  <span className="text-gray-500 block truncate">
                    {filteredLedgersForBranch &&
                    filteredLedgersForBranch.length == 0 &&
                    branchBudgetHeadIds.length > 0
                      ? "No ledgers for this branch"
                      : filteredLedgersForBranch &&
                          filteredLedgersForBranch.length == 0 &&
                          branchBudgetHeadIds.length == 0
                        ? "No budget heads for this branch"
                        : "Select Ledger Account"}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            {isLedgerDropdownOpen && (
              <div
                className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl"
                style={{ minWidth: "320px" }}
              >
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={ledgerSearchRef}
                      type="text"
                      value={ledgerSearchTerm}
                      onChange={(e) => {
                        setLedgerSearchTerm(e.target.value);
                        setLedgerHighlightedIndex(-1);
                      }}
                      onKeyDown={handleLedgerSearchKeyDown}
                      placeholder="Search by name, code..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div ref={ledgerListRef} className="overflow-y-auto max-h-80">
                  {filteredLedgers.length > 0 ? (
                    filteredLedgers.map((ledger, idx) => (
                      <button
                        key={ledger.Lg_Id}
                        ref={(el) => {
                          ledgerItemRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => handleLedgerSelect(ledger)}
                        onKeyDown={(e) =>
                          handleLedgerItemKeyDown(e, ledger, idx)
                        }
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                          ledgerHighlightedIndex == idx
                            ? "bg-blue-100"
                            : "text-gray-700"
                        }`}
                        tabIndex={0}
                      >
                        {renderLedgerItem(ledger)}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      {branchBudgetHeadIds.length == 0 ? (
                        <p>No budget heads found for this branch</p>
                      ) : (
                        <p>
                          No ledgers available for this branch's budget heads
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Party Name — combo input + dropdown */}
        <div className="overflow-visible">
          <div
            ref={partyDropdownRef}
            className="relative flex items-center gap-3 overflow-visible"
          >
            <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
              Party Name
            </label>
            <div className="relative flex-1 min-w-0">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <input
                ref={(el) => {
                  partyInputRef.current = el;
                  if (slNameRefs.current) slNameRefs.current[index] = el;
                }}
                type="text"
                value={partyInputValue}
                onChange={handlePartyInputChange}
                onFocus={() => setIsPartyDropdownOpen(true)}
                onKeyDown={handlePartyInputKeyDown}
                placeholder="Type or select party name"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {detail.SL_Id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : partyInputValue.trim() ? (
                  <span className="text-xs text-orange-500 font-semibold">
                    New
                  </span>
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            {isPartyDropdownOpen && (
              <div
                className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl"
                style={{ minWidth: "320px" }}
              >
                <div className="overflow-y-auto max-h-64">
                  {filteredParties.length > 0 ? (
                    filteredParties.map((party, idx) => (
                      <button
                        key={party.SL_Id}
                        ref={(el) => {
                          partyItemRefs.current[idx] = el;
                        }}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handlePartySelect(party);
                        }}
                        onKeyDown={(e) => handlePartyItemKeyDown(e, party, idx)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                          partyHighlightedIndex == idx
                            ? "bg-blue-100"
                            : "text-gray-700"
                        }`}
                        tabIndex={0}
                      >
                        {renderPartyItem(party)}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-gray-500 text-sm">
                      <p>No match found.</p>
                      {partyInputValue.trim() && (
                        <p className="text-xs text-orange-500 mt-1">
                          "{partyInputValue.trim()}" will be added as a new
                          party.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {filteredParties.length > 0 && (
                  <div className="border-t border-gray-200 p-2 bg-gray-50">
                    <div className="text-xs text-gray-500 text-center">
                      {filteredParties.length} party(s) found
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GST No — with GSTIN lookup on blur */}
        <div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
              GST No.
            </label>
            <div className="relative flex-1">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={(el) => {
                  if (gstNoRefs.current) gstNoRefs.current[index] = el;
                }}
                type="text"
                value={detail.GST_No || ""}
                onChange={(e) =>
                  onChange(index, "GST_No", e.target.value.toUpperCase())
                }
                onBlur={handleGstBlur}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                    amountRefs.current?.[index]?.focus();
                  }
                }}
                className={`w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase ${gstLookupLoading ? "bg-gray-50" : ""}`}
                placeholder="Enter GST Number"
                maxLength={15}
              />
              {gstLookupLoading && (
                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
              Amount (₹) *
            </label>
            <div className="relative flex-1">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                ₹
              </div>
              <input
                ref={(el) => {
                  if (amountRefs.current) amountRefs.current[index] = el;
                }}
                type="text"
                value={detail.Amount || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value == "" || /^\d*\.?\d*$/.test(value))
                    onChange(index, "Amount", value);
                }}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                  }
                }}
                className="w-full pl-6 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-left"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========  DATE FORMAT HELPER ==========
// Converts yyyy-mm-dd (HTML date input) to dd-mm-yyyy for display
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "-";
  // Handle ISO date strings like "2026-05-18T00:00:00.000Z"
  const clean = dateStr.split("T")[0];
  const parts = clean.split("-");
  if (parts.length == 3 && parts[0].length == 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// =========  TAX CALCULATION CARD COMPONENT ==========
const TaxCalculationCard = ({
  taxCalculation,
  loading,
  totalAmount,
  onTaxAmountChange,
  manualAmounts,
}) => {
  const [localAmounts, setLocalAmounts] = useState({});

  const isManualFormula = (formula) => {
    if (!formula) return false;
    const trimmed = formula.trim();
    return trimmed == "*" || trimmed == "* " || trimmed == " *";
  };

  const computedBreakdown = (() => {
    if (
      !taxCalculation?.taxBreakdown?.length ||
      !totalAmount ||
      totalAmount <= 0
    ) {
      return (
        taxCalculation?.taxBreakdown?.map((t) => ({
          ...t,
          calculatedAmount: 0,
        })) || []
      );
    }
    return taxCalculation.taxBreakdown.map((t) => {
      if (isManualFormula(t.formula)) {
        const override = manualAmounts?.[t.CIP_Id];
        return {
          ...t,
          calculatedAmount:
            override != undefined ? parseFloat(override) || 0 : 0,
        };
      }
      const pct = parseFloat(t.percentage) || 0;
      const amt = Math.round(((totalAmount * pct) / 100) * 100) / 100;
      return { ...t, calculatedAmount: amt };
    });
  })();

  useEffect(() => {
    if (computedBreakdown.length > 0) {
      const initialAmounts = {};
      computedBreakdown.forEach((tax, index) => {
        if (isManualFormula(tax.formula)) {
          const amount =
            totalAmount > 0 && manualAmounts?.[tax.CIP_Id] != undefined
              ? manualAmounts[tax.CIP_Id]
              : (tax.calculatedAmount ?? 0);
          initialAmounts[index] = amount.toString();
        }
      });
      setLocalAmounts(initialAmounts);
    }
  }, [taxCalculation.taxBreakdown, taxCalculation, manualAmounts, totalAmount]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center">
          <Loader className="h-6 w-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading tax parameters...</span>
        </div>
      </div>
    );
  }

  if (!taxCalculation?.taxBreakdown?.length) return null;

  const formatAmount = (amount) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleInputChange = (index, value) => {
    if (value == "" || /^\d*\.?\d*$/.test(value)) {
      setLocalAmounts((prev) => ({ ...prev, [index]: value }));
      const newAmount = parseFloat(value);
      if (!isNaN(newAmount) && newAmount >= 0 && onTaxAmountChange) {
        onTaxAmountChange(index, newAmount);
      } else if (value == "" && onTaxAmountChange) {
        onTaxAmountChange(index, 0);
      }
    }
  };

  const nonZeroTaxes = computedBreakdown.filter((tax) => {
    if (isManualFormula(tax.formula)) return true;
    return tax.calculatedAmount != 0 && tax.calculatedAmount != null;
  });

  const totalTaxAmount = nonZeroTaxes.reduce(
    (sum, tax) => sum + (tax.calculatedAmount || 0),
    0,
  );
  const netAmount = (totalAmount || 0) + totalTaxAmount;

  return (
    <div className="overflow-hidden">
      {nonZeroTaxes.map((tax, index) => {
        const originalIndex = computedBreakdown.findIndex(
          (t) => t.CIP_Id == tax.CIP_Id,
        );
        const isManual = isManualFormula(tax.formula);
        const currentValue =
          localAmounts[originalIndex] != undefined
            ? localAmounts[originalIndex]
            : totalAmount > 0
              ? tax.calculatedAmount?.toString() || "0"
              : "0";

        return (
          <div key={index} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-1">
              {tax.isAdd ? (
                <PlusIcon className="h-3 w-3 text-green-500" />
              ) : (
                <MinusIcon className="h-3 w-3 text-red-500" />
              )}
              <Percent className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 font-medium">
                {tax.displayText}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${tax.isAdd ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {tax.isAdd ? "Add" : "Deduct"}
              </span>
            </div>
            <div className="ml-2">
              {isManual ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">
                    {tax.isAdd ? "+" : "-"}
                  </span>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) =>
                      handleInputChange(originalIndex, e.target.value)
                    }
                    className="w-24 px-2 py-1 text-right text-xs border border-yellow-400 rounded focus:ring-1 focus:ring-yellow-500 bg-white"
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <span
                  className={`text-xs font-semibold ${tax.isAdd ? "text-green-600" : "text-red-600"}`}
                >
                  {tax.isAdd ? "+" : "-"}
                  {formatAmount(tax.calculatedAmount)}
                </span>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-gray-200">
        <span className="text-xs text-gray-600">Amount</span>
        <span className="text-xs font-semibold text-gray-900">
          {formatAmount(totalAmount || 0)}
        </span>
      </div>

      {nonZeroTaxes.length > 0 && (
        <div className="flex items-center justify-between py-0.5">
          <span className="text-xs text-gray-600">+ Tax Amount</span>
          <span className="text-xs font-semibold text-green-600">
            + {formatAmount(totalTaxAmount)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1.5 mt-1 border-t-2 border-gray-300">
        <span className="text-sm font-bold text-gray-900">
          Net Payable Amount
        </span>
        <span className="text-base font-bold text-green-700">
          {formatAmount(netAmount)}
        </span>
      </div>
    </div>
  );
};

// =========  MAIN COMPONENT ==========
const CreateNewChallanUpdate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [loadingTaxParameters, setLoadingTaxParameters] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [manualTaxAmounts, setManualTaxAmounts] = useState({});
  const [importing, setImporting] = useState(false);
  const [editingDetailIndex, setEditingDetailIndex] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const fileInputRef = useRef(null);
  const [newPartyDialog, setNewPartyDialog] = useState({
    open: false,
    partyName: "",
    resolve: null,
  });
  const [branchBudgetHeadIds, setBranchBudgetHeadIds] = useState([]);
  const [filteredLedgersForBranch, setFilteredLedgersForBranch] = useState([]);
  const [nextVoucherNumber, setNextVoucherNumber] = useState(null);
  const [isFetchingVoucherNo, setIsFetchingVoucherNo] = useState(false);

  const userId = (() => {
    if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
    if (user?.Usr_Id) return user.Usr_Id;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      }
    } catch (e) {}
    return null;
  })();

  const currentModule = (() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details"));
      const item = menuDetails?.find(
        (m) =>
          m.Menu_Links ==
          "/transactions/bookkeeping-vouchers/new-challan-update",
      );
      return item?.Mod_Code || "";
    } catch {
      return "";
    }
  })();

  const [challanTypeTaxParameters, setChallanTypeTaxParameters] = useState([]);
  const [taxCalculation, setTaxCalculation] = useState({
    grossAmount: 0,
    netAmount: 0,
    taxBreakdown: [],
    totalAdd: 0,
    totalLess: 0,
    totalTax: 0,
  });

  const [currentStage, setCurrentStage] = useState(null);
  const [initialActionId, setInitialActionId] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [actionsList, setActionsList] = useState([]);

  const [flattenedBranches, setFlattenedBranches] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    branches: [],
    ledgers: [],
    challanTypes: [],
    paymentModes: [],
    subLedgers: [],
  });

  // Branch dropdown states
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchHighlightedIndex, setBranchHighlightedIndex] = useState(-1);
  const branchDropdownRef = useRef(null);
  const branchSearchRef = useRef(null);
  const branchItemRefs = useRef([]);
  const branchListRef = useRef(null);
  const branchButtonRef = useRef(null);

  // Challan Type dropdown states
  const [filteredChallanTypes, setFilteredChallanTypes] = useState([]);
  const [challanTypeSearchTerm, setChallanTypeSearchTerm] = useState("");
  const [isChallanTypeDropdownOpen, setIsChallanTypeDropdownOpen] =
    useState(false);
  const [challanTypeHighlightedIndex, setChallanTypeHighlightedIndex] =
    useState(-1);
  const challanTypeDropdownRef = useRef(null);
  const challanTypeSearchRef = useRef(null);
  const challanTypeItemRefs = useRef([]);
  const challanTypeListRef = useRef(null);
  const challanTypeButtonRef = useRef(null);

  // Refs for focus management
  const dateInputRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const ledgerRefs = useRef([]);
  const slNameRefs = useRef([]);
  const gstNoRefs = useRef([]);
  const amountRefs = useRef([]);
  const pyModeRefs = useRef([]);
  const fileNoRefs = useRef([]);
  const remarksRefs = useRef([]);
  const chqDateRefs = useRef([]);
  const ifscRefs = useRef([]);
  const accNoRefs = useRef([]);
  const chqNoRefs = useRef([]);
  const recDateRefs = useRef([]);
  const bankNameRefs = useRef([]);

  // Payment Mode dropdown state (for right panel)
  const [isPaymentModeOpen, setIsPaymentModeOpen] = useState(false);
  const [paymentModeSearch, setPaymentModeSearch] = useState("");
  const [paymentModeHighlightedIndex, setPaymentModeHighlightedIndex] =
    useState(-1);
  const paymentModeDropdownRef = useRef(null);
  const paymentModeSearchRef = useRef(null);
  const paymentModeItemRefs = useRef([]);

  const filteredPaymentModes = (dropdownData.paymentModes || []).filter(
    (m) =>
      !paymentModeSearch.trim() ||
      m.label.toLowerCase().includes(paymentModeSearch.toLowerCase()),
  );

  const [formData, setFormData] = useState({
    Ch_Date: new Date().toISOString().split("T")[0],
    CV_No: "",
    Dpt_Id: "",
    CV_Ty: "",
    Total_Amount: "",
    Net_Amount: "",
    Challan_Detail: [
      {
        CV_Sr: 1,
        Lg_Id: "",
        Bh_Id: "",
        SL_Nm: "",
        GST_No: "",
        SL_Id: null,
        Amount: "",
        Py_Mode: "",
        FileNo: "",
        Remarks: "",
        Chq_Date: "",
        IFSC_Code: "",
        Acc_No: "",
        Chq_No: "",
        Rec_Date: "",
        Bank_Name: "",
        pay_details: [],
        taxSnapshot: [],
      },
    ],
  });

  const [selectedBranch, setSelectedBranch] = useState(null);

  const calculateTotalAmount = (details) => {
    if (!details || !Array.isArray(details)) return 0;
    return details.reduce(
      (sum, detail) => sum + (parseFloat(detail.Amount) || 0),
      0,
    );
  };

  const customRound = (value) => {
    if (value == undefined || value == null || isNaN(value)) return 0;
    const decimal = value - Math.floor(value);
    return decimal >= 0.5 ? Math.ceil(value) : Math.round(value * 100) / 100;
  };

  const isManualFormula = (formula) => {
    if (!formula) return false;
    const trimmed = formula.trim();
    return trimmed == "*" || trimmed == "* " || trimmed == " *";
  };

  const calculateTaxes = (totalAmt, taxParams, manualOverrides = {}) => {
    if (!totalAmt || totalAmt <= 0 || !taxParams || taxParams.length == 0) {
      setTaxCalculation({
        grossAmount: totalAmt || 0,
        netAmount: totalAmt || 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
      setFormData((prev) => ({
        ...prev,
        Net_Amount: totalAmt?.toString() || "0",
      }));
      setManualTaxAmounts({});
      return;
    }

    const taxBreakdown = [];
    let totalAdd = 0,
      totalLess = 0,
      runningAmount = totalAmt;
    const calculatedTaxAmounts = { GROS: totalAmt };
    const roundHalfUp = (num) => Math.round(num * 100) / 100;

    taxParams.forEach((param) => {
      let taxAmount = 0;
      const taxPercentage = parseFloat(param.Percent) || 0;
      const taxType = param.invoice_charge?.IC_Code || param.IC_Code;
      const isAdd =
        param.Add_Dedu == "Add" || param.Add_Dedu == 1 || param.Add_Dedu == "1";
      const formula = String(param.Formula || "").toUpperCase();
      const isManual = isManualFormula(formula);

      if (isManual && manualOverrides[param.CIP_Id] != undefined) {
        taxAmount = parseFloat(manualOverrides[param.CIP_Id]) || 0;
      } else if (isManual) {
        taxAmount = 0;
      } else {
        taxAmount = (totalAmt * taxPercentage) / 100;
      }

      taxAmount = roundHalfUp(taxAmount);
      calculatedTaxAmounts[taxType] = taxAmount;

      if (isAdd) {
        runningAmount += taxAmount;
        totalAdd += taxAmount;
      } else {
        runningAmount -= taxAmount;
        totalLess += taxAmount;
      }

      taxBreakdown.push({
        ...param,
        calculatedAmount: taxAmount,
        displayText: isManual ? `${taxType}` : `${taxType} (${taxPercentage}%)`,
        isAdd: isAdd,
        isTax: true,
        type: "tax",
        CIP_Id: param.CIP_Id,
        IC_Id: param.IC_Id,
        Lg_Id: param.Lg_Id,
        percentage: taxPercentage,
        formula: formula,
        isManual: isManual,
      });
    });

    const netAmount = roundHalfUp(runningAmount);
    setTaxCalculation({
      grossAmount: roundHalfUp(totalAmt),
      netAmount,
      taxBreakdown,
      totalAdd: roundHalfUp(totalAdd),
      totalLess: roundHalfUp(totalLess),
      totalTax: roundHalfUp(totalAdd - totalLess),
    });
    setFormData((prev) => ({ ...prev, Net_Amount: netAmount.toString() }));
  };

  const fetchNextVoucherNumber = async (branch = selectedBranch) => {
    if (isEditMode) return;
    setIsFetchingVoucherNo(true);
    try {
      const response = await newChallanFlowService.getNextVoucherNumber();
      if (response.success) {
        const nextNo = response.next_cv_no || 1;
        setNextVoucherNumber(nextNo);
        const formattedNo = newChallanFlowService.formatCvNo(branch, nextNo);
        setFormData((prev) => ({ ...prev, CV_No: formattedNo }));
        return formattedNo;
      }
    } catch (error) {
      console.error("Error fetching next voucher number:", error);
      toast.error("Failed to fetch next voucher number");
    } finally {
      setIsFetchingVoucherNo(false);
    }
  };

  const handleTaxAmountChange = (taxIndex, newAmount) => {
    const tax = taxCalculation.taxBreakdown[taxIndex];
    if (!tax || !tax.isManual) return;
    const newManualOverrides = { ...manualTaxAmounts, [tax.CIP_Id]: newAmount };
    setManualTaxAmounts(newManualOverrides);
    // Use current row's amount
    const lastIdx =
      editingDetailIndex != null
        ? editingDetailIndex
        : formData.Challan_Detail.length - 1;
    const currentRowAmount =
      parseFloat(formData.Challan_Detail[lastIdx]?.Amount) || 0;
    calculateTaxes(
      currentRowAmount,
      challanTypeTaxParameters,
      newManualOverrides,
    );
  };

  // =========  ENHANCED PAYMENT MODE HANDLER WITH AUTO-FILL ==========
  const handlePaymentModeSelect = (mode, index) => {
    const detail = formData.Challan_Detail[index];
    const selectedParty = dropdownData.subLedgers.find(
      (p) => p.SL_Id == detail.SL_Id,
    );

    // If party exists and has bank details, auto-fill based on payment mode
    if (selectedParty) {
      const bankName = selectedParty.Bank_Name || "";
      const accountNumber = selectedParty.Account_Number || "";
      const ifscCode = selectedParty.IFSC_Code || "";

      // For Bank mode (Digital): auto-fill all bank details
      if (mode.Is_Digital == 1) {
        handleDetailChange(index, {
          Py_Mode: mode.value,
          PayMd_ID: mode.PayMd_ID,
          Bank_Name: bankName,
          Acc_No: accountNumber,
          IFSC_Code: ifscCode,
        });
      }
      // For Cheque mode (neither cash nor digital): auto-fill only Bank Name
      else if (mode.Is_Cash == 0 && mode.Is_Digital == 0) {
        handleDetailChange(index, {
          Py_Mode: mode.value,
          PayMd_ID: mode.PayMd_ID,
          Bank_Name: bankName,
        });
      }
      // For Cash mode: clear bank details
      else if (mode.Is_Cash == 1) {
        handleDetailChange(index, {
          Py_Mode: mode.value,
          PayMd_ID: mode.PayMd_ID,
          Bank_Name: "",
          Acc_No: "",
          IFSC_Code: "",
        });
      } else {
        // Fallback: just set the mode
        handleDetailChange(index, {
          Py_Mode: mode.value,
          PayMd_ID: mode.PayMd_ID,
        });
      }
    } else {
      // No party selected, just set the payment mode
      handleDetailChange(index, {
        Py_Mode: mode.value,
        PayMd_ID: mode.PayMd_ID,
      });
    }
  };

  const loadTaxParametersForChallanType = async (challanTypeId) => {
    if (!challanTypeId) {
      setChallanTypeTaxParameters([]);
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
      return;
    }

    setLoadingTaxParameters(true);
    try {
      const response =
        await newChallanFlowService.getTaxParametersByChallanType(
          challanTypeId,
        );
      if (response.success && response.data && response.data.length > 0) {
        const parameters = response.data[0].parameters || [];
        const processedParams = parameters.map((param) => ({
          ...param,
          Add_Dedu:
            param.Add_Dedu == 1 ||
            param.Add_Dedu == "1" ||
            param.Add_Dedu == "Add"
              ? "Add"
              : "Deduct",
          Percent: param.Percent,
          Formula: param.Formula || "*",
          IC_Id: param.IC_Id,
          Lg_Id: param.Lg_Id,
          CIP_Id: param.CIP_Id,
          invoice_charge: param.invoice_charge,
          ledger: param.ledger,
        }));
        setChallanTypeTaxParameters(processedParams);
        if (!isEditMode && totalAmount > 0) {
          setManualTaxAmounts({});
          calculateTaxes(totalAmount, processedParams, {});
        }
      } else {
        setChallanTypeTaxParameters([]);
      }
    } catch (error) {
      console.error("Error loading tax parameters:", error);
      toast.error("Failed to load tax parameters");
      setChallanTypeTaxParameters([]);
    } finally {
      setLoadingTaxParameters(false);
    }
  };

  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);
    const deptId =
      user?.departmentData?.Dpt_id ||
      user?.apiUserData?.employee?.department?.Dpt_id;
    setUserDeptId(deptId ? parseInt(deptId) : null);
    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);
    loadMenuAndStage();
  }, [user]);

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/bookkeeping-vouchers/new-challan-update";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.action?.stage) {
        setCurrentStage(currentMenuItem.action.stage);
        await loadActionsForStage(currentMenuItem.action.stage);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  };

  const loadActionsForStage = async (stage) => {
    if (!stage) return;
    try {
      const response = await newChallanFlowService.getAllByStage(stage);
      if (response.status && response.data) {
        setActionsList(response.data);
        const initialAction = response.data.find(
          (action) => !action.Previous_Status,
        );
        if (initialAction) setInitialActionId(initialAction.Act_Id);
        if (!isAdmin && userDesignationId) {
          const hasPermission = response.data.some(
            (action) =>
              action.authorities_details?.some(
                (auth) => parseInt(auth.Dsg_id) == userDesignationId,
              ) && !action.Previous_Status,
          );
          setHasCreatePermission(hasPermission);
          if (!hasPermission && !isEditMode) {
            toast.error(
              "You don't have permission to create new challan vouchers",
            );
            navigate("/transactions/bookkeeping-vouchers/new-challan-update");
          }
        } else if (isAdmin) {
          setHasCreatePermission(true);
        }
      }
    } catch (error) {
      console.error("Error loading actions for stage:", error);
    }
  };

  useEffect(() => {
    // Only sum committed rows (those with Lg_Id + Amount + Py_Mode), not the trailing empty row
    const committedDetails = formData.Challan_Detail.filter(
      (d) => d.Lg_Id && d.Amount && parseFloat(d.Amount) > 0,
    );
    const total = calculateTotalAmount(committedDetails);
    setTotalAmount(total);
    setFormData((prev) => ({ ...prev, Total_Amount: total.toString() }));
  }, [formData.Challan_Detail]);

  useEffect(() => {
    const hasValidDetail = formData.Challan_Detail.some(
      (detail) =>
        detail.Lg_Id &&
        detail.Amount &&
        parseFloat(detail.Amount) > 0 &&
        detail.Py_Mode,
    );
    const hasBasicInfo = formData.Ch_Date && formData.Dpt_Id;
    setIsFormValid(hasBasicInfo && hasValidDetail);
  }, [formData.Challan_Detail, formData.Ch_Date, formData.Dpt_Id]);

  useEffect(() => {
    // Only auto-recalculate when NOT editing an existing row
    // (editing uses the row's own amount loaded in the edit handler)
    if (editingDetailIndex != null) return;

    const lastIdx = formData.Challan_Detail.length - 1;
    const currentRowAmount =
      parseFloat(formData.Challan_Detail[lastIdx]?.Amount) || 0;

    if (challanTypeTaxParameters.length > 0 && currentRowAmount > 0) {
      calculateTaxes(
        currentRowAmount,
        challanTypeTaxParameters,
        manualTaxAmounts,
      );
    } else if (currentRowAmount == 0) {
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown:
          challanTypeTaxParameters.length > 0
            ? challanTypeTaxParameters.map((p) => ({
                ...p,
                calculatedAmount: 0,
                displayText: `${p.invoice_charge?.IC_Code || p.IC_Code || ""}`,
                isAdd: p.Add_Dedu == "Add",
                isTax: true,
                type: "tax",
                isManual: isManualFormula(p.Formula || ""),
              }))
            : [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
      setFormData((prev) => ({ ...prev, Net_Amount: "0" }));
    }
  }, [formData.Challan_Detail, challanTypeTaxParameters, editingDetailIndex]);

  const buildBranchTree = (branches) => {
    const map = {},
      roots = [];
    branches.forEach((branch) => {
      map[branch.Dpt_id] = { ...branch, children: [] };
    });
    branches.forEach((branch) => {
      const upGroup = branch.UpGrp;
      if (upGroup && map[upGroup] && upGroup != branch.Dpt_id) {
        map[upGroup].children.push(map[branch.Dpt_id]);
      } else {
        roots.push(map[branch.Dpt_id]);
      }
    });
    return roots;
  };

  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, treeLevel: level });
      if (node.children?.length) flattenTree(node.children, level + 1, result);
    });
    return result;
  };

  useEffect(() => {
    loadDropdownData();
    if (id && id != "create") {
      setIsEditMode(true);
      loadVoucherData();
    }
    const handleClickOutside = (event) => {
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target)
      ) {
        setIsBranchDropdownOpen(false);
        setBranchHighlightedIndex(-1);
        setBranchSearchTerm("");
      }
      if (
        challanTypeDropdownRef.current &&
        !challanTypeDropdownRef.current.contains(event.target)
      ) {
        setIsChallanTypeDropdownOpen(false);
        setChallanTypeHighlightedIndex(-1);
        setChallanTypeSearchTerm("");
      }
      if (
        paymentModeDropdownRef.current &&
        !paymentModeDropdownRef.current.contains(event.target)
      ) {
        setIsPaymentModeOpen(false);
        setPaymentModeSearch("");
        setPaymentModeHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  useEffect(() => {
    if (formData.CV_Ty && !isEditMode)
      loadTaxParametersForChallanType(formData.CV_Ty);
  }, [formData.CV_Ty, isEditMode]);

  useEffect(() => {
    if (!loading && !isEditMode)
      setTimeout(() => dateInputRef.current?.focus(), 100);
  }, [loading, isEditMode]);

  useEffect(() => {
    if (!dropdownData.branches.length) {
      setFilteredBranches([]);
      return;
    }
    const tree = buildBranchTree(dropdownData.branches);
    const flattened = flattenTree(tree);
    setFlattenedBranches(flattened);
    if (!branchSearchTerm.trim()) {
      setFilteredBranches(flattened);
    } else {
      const term = branchSearchTerm.toLowerCase();
      setFilteredBranches(
        flattened.filter(
          (b) =>
            (b.Dpt_Desc?.toLowerCase() || "").includes(term) ||
            (b.Dpt_Name?.toLowerCase() || "").includes(term),
        ),
      );
    }
    setBranchHighlightedIndex(-1);
  }, [branchSearchTerm, dropdownData.branches]);

  useEffect(() => {
    if (!challanTypeSearchTerm.trim()) {
      setFilteredChallanTypes(dropdownData.challanTypes);
    } else {
      const term = challanTypeSearchTerm.toLowerCase();
      setFilteredChallanTypes(
        dropdownData.challanTypes.filter(
          (t) =>
            t.Cht_Name?.toLowerCase().includes(term) ||
            t.Cht_Code?.toLowerCase().includes(term),
        ),
      );
    }
    setChallanTypeHighlightedIndex(-1);
  }, [challanTypeSearchTerm, dropdownData.challanTypes]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [branches, allLedgers, challanTypes, paymentModes, subLedgers] =
        await Promise.all([
          newChallanFlowService.getBranches(),
          newChallanFlowService.getAllLedgers(),
          newChallanFlowService.getChallanTypes(),
          newChallanFlowService.getPaymentModes(),
          newChallanFlowService.getSubLedgers(),
        ]);

      const filterBranches = branches.filter((b) =>
        user.departmentData?.Dpt_id
          ? b.Dpt_id == user.departmentData.Dpt_id
          : true,
      );
      const filterPaymentModes = paymentModes.filter((b) => b.Is_Chl == 1);
      const branchesToUse = filterBranches.length ? filterBranches : branches;
      const ledgersToUse = allLedgers.filter(
        (l) => l.ledger_group?.Gr_Buk == "N",
      );

      setDropdownData({
        branches: branchesToUse,
        ledgers: ledgersToUse,
        challanTypes: challanTypes || [],
        paymentModes: filterPaymentModes || [],
        subLedgers: subLedgers || [],
      });

      setFilteredLedgersForBranch(ledgersToUse);

      // Set default challan type to "General Work" in create mode
      if (!id || id == "create") {
        const generalWork = (challanTypes || []).find(
          (t) => t.Cht_Name == "General Work",
        );
        if (generalWork) {
          setFormData((prev) => ({
            ...prev,
            CV_Ty: generalWork.Cht_Id?.toString(),
          }));
        }
      }

      // If editing mode, fetch budget heads for the branch
      if (isEditMode && formData.Dpt_Id) {
        // Wait for state to update or pass ledgers directly
        const deptId = parseInt(formData.Dpt_Id);
        if (deptId) {
          setLoadingLedgers(true);
          try {
            const response =
              await newChallanFlowService.getGrantDeptMap(deptId);
            // API returns data as an array — take the first mapping entry
            const mappingEntry = Array.isArray(response.data)
              ? response.data[0]
              : response.data;
            if (response.success && mappingEntry) {
              // Normalise Bh_Id list to numbers for reliable comparison
              const rawBhIds = mappingEntry.Bh_Id || [];
              const bhIds = rawBhIds.map(Number);
              setBranchBudgetHeadIds(bhIds);

              // Use all_budget_heads if present to build a Set for O(1) lookups
              const allBudgetHeads = mappingEntry.all_budget_heads || [];
              const bhIdSet = new Set(
                allBudgetHeads.length > 0
                  ? allBudgetHeads.map((bh) => Number(bh.Bh_Id))
                  : bhIds,
              );

              const filtered = ledgersToUse.filter(
                (ledger) =>
                  ledger.budget_head &&
                  bhIdSet.has(Number(ledger.budget_head.Bh_Id)),
              );
              setFilteredLedgersForBranch(filtered);
            }
          } catch (error) {
            console.error("Error fetching budget heads:", error);
          } finally {
            setLoadingLedgers(false);
          }
        }
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    if (!isEditMode && selectedBranch && !formData.CV_No) {
      fetchNextVoucherNumber(selectedBranch);
    }
  }, [selectedBranch, isEditMode]);

  const handleDownloadSample = () => downloadSampleTemplate();
  const handleExport = () => {
    if (!formData.Challan_Detail.length)
      return toast.error("No data to export");
    exportToExcel(formData.Challan_Detail, dropdownData.ledgers);
    toast.success("Exported successfully!");
  };
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const extension = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension)) {
      return toast.error("Please upload an Excel file (.xlsx, .xls, or .csv)");
    }
    setImporting(true);
    try {
      const result = await parseExcelToChallanDetails(
        file,
        dropdownData.ledgers,
        dropdownData.paymentModes,
      );
      const importedRows = result?.data || [];
      const warnings = result?.warnings || [];

      if (importedRows.length == 0) {
        toast.error("No valid data found in the Excel file.");
        return;
      }

      // Build details list with trailing empty row for the right panel
      const importedDetails = importedRows.map((detail, idx) => ({
        ...detail,
        CV_Sr: idx + 1,
        SL_Id: detail.SL_Id || null,
        taxSnapshot: [],
      }));
      importedDetails.push({
        CV_Sr: importedDetails.length + 1,
        Lg_Id: "",
        Bh_Id: "",
        SL_Nm: "",
        GST_No: "",
        SL_Id: null,
        Amount: "",
        Py_Mode: "",
        FileNo: "",
        Remarks: "",
        Chq_Date: "",
        IFSC_Code: "",
        Acc_No: "",
        Chq_No: "",
        Rec_Date: "",
        Bank_Name: "",
        pay_details: [],
        taxSnapshot: [],
      });

      setFormData((prev) => ({ ...prev, Challan_Detail: importedDetails }));
      setManualTaxAmounts({});
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
      setEditingDetailIndex(null);

      if (warnings.length > 0) {
        // Show warnings as info toasts — import still succeeded
        toast.success(
          `Imported ${importedRows.length} row(s) with ${warnings.length} notice(s).`,
        );
        // Show each warning individually (max 5 to avoid flooding)
        warnings.slice(0, 5).forEach((w, i) => {
          setTimeout(() => toast(w, { icon: "⚠️", duration: 5000 }), i * 400);
        });
        if (warnings.length > 5) {
          setTimeout(
            () =>
              toast(`...and ${warnings.length - 5} more notice(s).`, {
                icon: "ℹ️",
              }),
            warnings.slice(0, 5).length * 400,
          );
        }
      } else {
        toast.success(
          `Successfully imported ${importedRows.length} row(s)! Edit each row to align tax.`,
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      // Only hard errors (parse failure, no data) reach here now
      const msg = error?.errors?.[0] || "Failed to import file";
      toast.error(msg);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const challanResponse = await newChallanFlowService.getById(id);
      const voucherData =
        challanResponse.data?.[0] || challanResponse.data || challanResponse;

      const allLedgers = await newChallanFlowService.getAllLedgers();
      const ledgersToUse = allLedgers.filter(
        (l) => l.ledger_group?.Gr_Buk == "N",
      );
      setDropdownData((prev) => ({ ...prev, ledgers: ledgersToUse }));

      const existingDetails = (voucherData.details || []).map(
        (detail, idx) => ({
          CV_Sr: idx + 1,
          Lg_Id: detail.Lg_Id?.toString() || "",
          Bh_Id: detail.Bh_Id?.toString() || "",
          PayMd_ID: detail.PayMd_ID?.toString() || "",
          SL_Id: detail.SL_Id || detail.sub_ledger?.SL_Id || null,
          SL_Nm: detail.SL_Nm || detail.sub_ledger?.SL_Name || "",
          GST_No: detail.GST_No || "",
          Amount: detail.Amount?.toString() || "",
          Py_Mode: detail.Payment_Mode || detail.Py_Mode || "",
          FileNo: detail.FileNo || "",
          Remarks: detail.Remarks || "",
          Chq_Date: detail.Chq_Date || "",
          IFSC_Code: detail.IFSC_Code || "",
          Acc_No:
            detail.Acc_No != null &&
            String(detail.Acc_No).trim() &&
            !/^0+$/.test(String(detail.Acc_No).trim())
              ? String(detail.Acc_No).trim()
              : "",
          Chq_No:
            detail.Chq_No != null &&
            String(detail.Chq_No).trim() &&
            !/^0+$/.test(String(detail.Chq_No).trim())
              ? String(detail.Chq_No).trim()
              : "",
          Rec_Date: detail.Rec_Date || "",
          Bank_Name: detail.Bank_Name || "",
          pay_details: detail.pay_details || [],
          taxSnapshot: [],
        }),
      );

      existingDetails.forEach((detail) => {
        if (detail.pay_details && detail.pay_details.length > 0) {
          const rowAmount = parseFloat(detail.Amount) || 0;
          detail.taxSnapshot = detail.pay_details
            .filter((p) => p.PD_Ty == "TAX")
            .map((payDetail) => {
              const isManual = isManualFormula(payDetail.Formula || "");
              const pct = parseFloat(payDetail.Percent) || 0;
              // Recalculate per-row amount from percentage; for manual formula use stored IC_Amt
              const calculatedAmount = isManual
                ? parseFloat(payDetail.IC_Amt) || 0
                : Math.round(((rowAmount * pct) / 100) * 100) / 100;
              return {
                displayText:
                  payDetail.invoice_charge?.IC_Name ||
                  payDetail.challan_parameter?.CIP_Name ||
                  "Tax",
                calculatedAmount,
                isAdd: payDetail.Add_Dedu == 1 || payDetail.Add_Dedu == "1",
                CIP_Id: payDetail.CIP_Id,
                IC_Id: payDetail.IC_Id,
                Lg_Id: payDetail.Lg_Id,
                percentage: payDetail.Percent,
                formula: payDetail.Formula,
              };
            });
        }
      });

      const newFormData = {
        Ch_Date: voucherData?.Ch_Date
          ? new Date(voucherData.Ch_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        CV_No: voucherData?.CV_No || "",
        Dpt_Id:
          voucherData?.department?.Dpt_id?.toString() ||
          voucherData?.Dpt_Id?.toString() ||
          "",
        CV_Ty:
          voucherData?.challan_type?.Cht_Id?.toString() ||
          voucherData?.CV_Ty?.toString() ||
          "",
        Total_Amount: voucherData?.Total_Amount?.toString() || "",
        Net_Amount: voucherData?.Net_Amount?.toString() || "",
        Challan_Detail: [
          ...existingDetails,
          {
            CV_Sr: existingDetails.length + 1,
            Lg_Id: "",
            Bh_Id: "",
            SL_Nm: "",
            GST_No: "",
            SL_Id: null,
            Amount: "",
            Py_Mode: "",
            FileNo: "",
            Remarks: "",
            Chq_Date: "",
            IFSC_Code: "",
            Acc_No: "",
            Chq_No: "",
            Rec_Date: "",
            Bank_Name: "",
            pay_details: [],
            taxSnapshot: [],
          },
        ],
      };

      if (voucherData?.department || voucherData?.Dpt_Id) {
        setSelectedBranch(
          voucherData.department || { Dpt_id: voucherData.Dpt_Id },
        );
      }

      setFormData(newFormData);
      const calcTotal = calculateTotalAmount(existingDetails);
      setTotalAmount(calcTotal);

      const challanTypeId =
        voucherData?.challan_type?.Cht_Id || voucherData?.CV_Ty;
      if (challanTypeId) {
        setLoadingTaxParameters(true);
        try {
          const response =
            await newChallanFlowService.getTaxParametersByChallanType(
              challanTypeId,
            );
          let processedParams = [];
          if (response.success && response.data?.length) {
            const parameters = response.data[0].parameters || [];
            processedParams = parameters.map((param) => ({
              ...param,
              Add_Dedu: param.Add_Dedu == "Add" ? "Add" : "Deduct",
              Percent: param.Percent,
              Formula: param.Formula || "*",
              IC_Id: param.IC_Id,
              Lg_Id: param.Lg_Id,
              CIP_Id: param.CIP_Id,
              invoice_charge: param.invoice_charge,
              ledger: param.ledger,
            }));
            setChallanTypeTaxParameters(processedParams);
          }

          const hasPayDetails = existingDetails.some(
            (d) => d.pay_details && d.pay_details.length > 0,
          );
          if (hasPayDetails) {
            // taxSnapshot is already built with per-row amounts above.
            // For the right panel (empty last row), reset to zero state with tax structure visible
            setManualTaxAmounts({});
            if (processedParams.length > 0) {
              setTaxCalculation({
                grossAmount: 0,
                netAmount: 0,
                taxBreakdown: processedParams.map((p) => ({
                  ...p,
                  calculatedAmount: 0,
                  displayText: `${p.invoice_charge?.IC_Code || p.IC_Code || ""}`,
                  isAdd: p.Add_Dedu == "Add",
                  isTax: true,
                  type: "tax",
                  isManual: isManualFormula(p.Formula || ""),
                })),
                totalAdd: 0,
                totalLess: 0,
                totalTax: 0,
              });
            } else {
              setTaxCalculation({
                grossAmount: 0,
                netAmount: 0,
                taxBreakdown: [],
                totalAdd: 0,
                totalLess: 0,
                totalTax: 0,
              });
            }
            // Compute correct Net_Amount from taxSnapshots
            let netTaxSum = 0;
            existingDetails.forEach((detail) => {
              (detail.taxSnapshot || []).forEach((t) => {
                netTaxSum += t.isAdd
                  ? t.calculatedAmount || 0
                  : -(t.calculatedAmount || 0);
              });
            });
            const correctNetAmount = calcTotal + netTaxSum;
            setFormData((prev) => ({
              ...prev,
              Net_Amount: correctNetAmount.toString(),
            }));
          } else if (processedParams.length && calcTotal > 0) {
            calculateTaxes(calcTotal, processedParams, {});
          }
        } catch (error) {
          console.error("Error loading tax parameters:", error);
        } finally {
          setLoadingTaxParameters(false);
        }
      }
      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading challan voucher:", error);
      toast.error("Failed to load challan voucher data!");
      navigate("/transactions/bookkeeping-vouchers/new-challan-update");
    } finally {
      setLoading(false);
    }
  };
  const fetchBudgetHeadsForBranch = async (deptId) => {
    if (!deptId) {
      setBranchBudgetHeadIds([]);
      setFilteredLedgersForBranch(dropdownData.ledgers);
      return;
    }

    setLoadingLedgers(true);
    try {
      const response = await newChallanFlowService.getGrantDeptMap(deptId);
      // API returns data as an array — take the first mapping entry
      const mappingEntry = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      if (response.success && mappingEntry) {
        // Normalise Bh_Id list to numbers for reliable comparison
        const rawBhIds = mappingEntry.Bh_Id || [];
        const bhIds = rawBhIds.map(Number);
        setBranchBudgetHeadIds(bhIds);

        // Use all_budget_heads if present to build a Set for O(1) lookups
        const allBudgetHeads = mappingEntry.all_budget_heads || [];
        const bhIdSet = new Set(
          allBudgetHeads.length > 0
            ? allBudgetHeads.map((bh) => Number(bh.Bh_Id))
            : bhIds,
        );

        const filtered = dropdownData.ledgers.filter(
          (ledger) =>
            ledger.budget_head && bhIdSet.has(Number(ledger.budget_head.Bh_Id)),
        );
        setFilteredLedgersForBranch(filtered);

        if (filtered.length == 0) {
          const deptName = mappingEntry.department?.Dpt_Name || "this branch";
          toast.info(`No ledgers found for ${deptName}'s budget heads.`);
        }
      } else {
        setBranchBudgetHeadIds([]);
        setFilteredLedgersForBranch([]);
        toast.warning(`No budget head mapping found for this branch.`);
      }
    } catch (error) {
      console.error("Error fetching budget heads:", error);
      toast.error("Failed to load budget heads for branch.");
      setBranchBudgetHeadIds([]);
      setFilteredLedgersForBranch([]);
    } finally {
      setLoadingLedgers(false);
    }
  };

  const handleBranchSelect = async (branch) => {
    setFormData((prev) => ({
      ...prev,
      Dpt_Id: branch.Dpt_id?.toString(),
      ...(isEditMode ? {} : { CV_No: "" }),
    }));
    setSelectedBranch(branch);
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);
    if (errors.Dpt_Id) setErrors((prev) => ({ ...prev, Dpt_Id: "" }));
    await fetchBudgetHeadsForBranch(branch.Dpt_id);
    if (!isEditMode) {
      await fetchNextVoucherNumber(branch);
    }
    setTimeout(() => challanTypeButtonRef.current?.focus(), 200);
  };

  const handleChallanTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, CV_Ty: type.Cht_Id?.toString() }));
    setIsChallanTypeDropdownOpen(false);
    setChallanTypeSearchTerm("");
    setChallanTypeHighlightedIndex(-1);
    if (errors.CV_Ty) setErrors((prev) => ({ ...prev, CV_Ty: "" }));
    setTimeout(() => ledgerRefs.current[0]?.focus(), 100);
  };

  const handleDetailChange = (index, field, value) => {
    if (typeof field == "object") {
      const updatedDetails = [...formData.Challan_Detail];
      updatedDetails[index] = { ...updatedDetails[index], ...field };
      setFormData((prev) => ({ ...prev, Challan_Detail: updatedDetails }));
      const newTotal = calculateTotalAmount(updatedDetails);
      setTotalAmount(newTotal);
      // Tax calculation will trigger via useEffect
      return;
    }
    const updatedDetails = [...formData.Challan_Detail];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setFormData((prev) => ({ ...prev, Challan_Detail: updatedDetails }));
    const newTotal = calculateTotalAmount(updatedDetails);
    setTotalAmount(newTotal);
    // Tax calculation will trigger via useEffect
  };

  const addNewDetailRow = () => {
    if (editingDetailIndex != null) {
      // Save edited row — capture current taxCalculation as taxSnapshot
      const taxSnapshot = [...(taxCalculation.taxBreakdown || [])].map((t) => ({
        displayText: t.displayText,
        calculatedAmount: t.calculatedAmount,
        isAdd: t.isAdd,
        CIP_Id: t.CIP_Id,
        IC_Id: t.IC_Id,
        Lg_Id: t.Lg_Id,
        percentage: t.percentage,
        formula: t.formula,
      }));
      setFormData((prev) => {
        const updatedDetails = [...prev.Challan_Detail];
        updatedDetails[editingDetailIndex] = {
          ...updatedDetails[editingDetailIndex],
          taxSnapshot,
        };
        return { ...prev, Challan_Detail: updatedDetails };
      });
      setEditingDetailIndex(null);
      // Reset tax panel for the next (last empty) row
      setManualTaxAmounts({});
      if (challanTypeTaxParameters.length > 0) {
        setTaxCalculation({
          grossAmount: 0,
          netAmount: 0,
          taxBreakdown: challanTypeTaxParameters.map((p) => ({
            ...p,
            calculatedAmount: 0,
            displayText: `${p.invoice_charge?.IC_Code || p.IC_Code || ""}`,
            isAdd: p.Add_Dedu == "Add",
            isTax: true,
            type: "tax",
            isManual: isManualFormula(p.Formula || ""),
          })),
          totalAdd: 0,
          totalLess: 0,
          totalTax: 0,
        });
      } else {
        setTaxCalculation({
          grossAmount: 0,
          netAmount: 0,
          taxBreakdown: [],
          totalAdd: 0,
          totalLess: 0,
          totalTax: 0,
        });
      }
      return;
    }

    const currentIdx = formData.Challan_Detail.length - 1;
    const currentDetail = formData.Challan_Detail[currentIdx];
    const newErrors = { ...errors };
    let hasError = false;

    // Check if current row is empty (no data filled)
    const isEmptyRow =
      !currentDetail.Lg_Id &&
      !currentDetail.Amount &&
      !currentDetail.Py_Mode &&
      !currentDetail.SL_Nm;

    // If row is empty, don't add new row, just show error
    if (isEmptyRow) {
      toast.error("Please fill the challan details before adding a new one.");
      return;
    }

    const isCurrentValid =
      currentDetail.Lg_Id &&
      currentDetail.Amount &&
      parseFloat(currentDetail.Amount) > 0 &&
      currentDetail.Py_Mode;

    if (!isCurrentValid) {
      toast.error(
        "Please fill all required fields (Ledger Account, Amount, and Payment Mode) before adding a new row.",
      );
      return;
    }

    if (!currentDetail.Lg_Id) {
      newErrors[`ChallanDetail_${currentIdx}_Lg_Id`] =
        "Ledger Account selection is required";
      hasError = true;
    }
    if (!currentDetail.Amount || parseFloat(currentDetail.Amount) <= 0) {
      newErrors[`ChallanDetail_${currentIdx}_Amount`] = "Amount is required";
      hasError = true;
    }
    if (!currentDetail.Py_Mode) {
      newErrors[`ChallanDetail_${currentIdx}_Py_Mode`] =
        "Payment Mode is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Save tax snapshot for the current detail before adding new row
    const taxSnapshot = [...(taxCalculation.taxBreakdown || [])].map((t) => ({
      displayText: t.displayText,
      calculatedAmount: t.calculatedAmount,
      isAdd: t.isAdd,
      CIP_Id: t.CIP_Id,
      IC_Id: t.IC_Id,
      Lg_Id: t.Lg_Id,
      percentage: t.percentage,
      formula: t.formula,
    }));

    const newSr = formData.Challan_Detail.length + 1;

    // Update current row with taxSnapshot and add a new empty row
    setFormData((prev) => {
      const updatedDetails = [...prev.Challan_Detail];
      updatedDetails[currentIdx] = {
        ...updatedDetails[currentIdx],
        taxSnapshot,
      };

      // Add new empty row
      updatedDetails.push({
        CV_Sr: newSr,
        Lg_Id: "",
        Bh_Id: "",
        SL_Nm: "",
        GST_No: "",
        SL_Id: null,
        Amount: "",
        Py_Mode: "",
        FileNo: "",
        Remarks: "",
        Chq_Date: "",
        IFSC_Code: "",
        Acc_No: "",
        Chq_No: "",
        Rec_Date: "",
        Bank_Name: "",
        pay_details: [],
        taxSnapshot: [],
      });

      return { ...prev, Challan_Detail: updatedDetails };
    });

    // Reset tax calculation for next row
    setManualTaxAmounts({});
    if (challanTypeTaxParameters.length > 0) {
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: challanTypeTaxParameters.map((p) => ({
          ...p,
          calculatedAmount: 0,
          displayText: `${p.invoice_charge?.IC_Code || p.IC_Code || ""}`,
          isAdd: p.Add_Dedu == "Add",
          isTax: true,
          type: "tax",
          isManual: isManualFormula(p.Formula || ""),
        })),
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
    } else {
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
    }
    setEditingDetailIndex(null);

    // Clear errors for the new row
    setErrors({});

    // Focus on the ledger field of the new row
    setTimeout(() => {
      if (
        ledgerRefs.current &&
        ledgerRefs.current[formData.Challan_Detail.length]
      ) {
        ledgerRefs.current[formData.Challan_Detail.length].focus();
      }
    }, 100);
  };

  const removeDetailRow = (index) => {
    if (formData.Challan_Detail.length == 1) {
      toast.error("At least one challan detail is required");
      return;
    }
    const updatedDetails = formData.Challan_Detail.filter((_, i) => i != index);
    updatedDetails.forEach((detail, i) => (detail.CV_Sr = i + 1));
    setFormData((prev) => ({ ...prev, Challan_Detail: updatedDetails }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Ch_Date) newErrors.Ch_Date = "Date is required";
    if (!formData.Dpt_Id) newErrors.Dpt_Id = "Branch selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const allDetails = formData.Challan_Detail;
    const committedDetails = allDetails.filter(
      (detail) =>
        detail.Lg_Id &&
        detail.Amount &&
        parseFloat(detail.Amount) > 0 &&
        detail.Py_Mode,
    );

    if (committedDetails.length == 0) {
      toast.error(
        "At least one completed challan detail is required. Please fill in the challan details and click 'Add' before creating the voucher.",
      );
      return;
    }

    const incompleteDetails = committedDetails.filter(
      (detail) =>
        !detail.Lg_Id ||
        !detail.Amount ||
        parseFloat(detail.Amount) <= 0 ||
        !detail.Py_Mode,
    );

    if (incompleteDetails.length > 0) {
      toast.error(
        "Please complete all fields (Ledger Account, Amount, and Payment Mode) for all challan details before submitting.",
      );
      return;
    }

    // Any detail with a party name but no SL_Id is a new party that needs to be created
    const newParties = committedDetails.filter(
      (d) => d.SL_Nm && d.SL_Nm.trim() && !d.SL_Id,
    );

    // Build a local updated copy of committedDetails with SL_Id filled in after creation
    let updatedCommittedDetails = committedDetails.map((d) => ({ ...d }));

    for (const detail of newParties) {
      const confirmed = await new Promise((resolve) => {
        setNewPartyDialog({ open: true, partyName: detail.SL_Nm, resolve });
      });
      if (confirmed) {
        try {
          const res = await newChallanFlowService.createSubLedger({
            SL_Name: detail.SL_Nm,
            GSTIN: detail.GST_No ? detail.GST_No.toUpperCase() : null,
            Lg_Id: detail.Lg_Id ? [parseInt(detail.Lg_Id)] : [],
          });
          const newSLId = res?.data?.SL_Id || res?.SL_Id || null;
          // Update local copy immediately (no async state delay)
          updatedCommittedDetails = updatedCommittedDetails.map((d) =>
            d.SL_Nm == detail.SL_Nm && !d.SL_Id ? { ...d, SL_Id: newSLId } : d,
          );
          // Also sync back to formData state for UI consistency
          setFormData((prev) => ({
            ...prev,
            Challan_Detail: prev.Challan_Detail.map((d) =>
              d.SL_Nm == detail.SL_Nm && !d.SL_Id
                ? { ...d, SL_Id: newSLId }
                : d,
            ),
          }));
          toast.success(`Party "${detail.SL_Nm}" added successfully`);
        } catch (err) {
          toast.error(`Failed to create party "${detail.SL_Nm}"`);
        }
      } else {
        // User declined — remove party name from local copy and state
        updatedCommittedDetails = updatedCommittedDetails.filter(
          (d) => !(d.SL_Nm == detail.SL_Nm && !d.SL_Id),
        );
        setFormData((prev) => ({
          ...prev,
          Challan_Detail: prev.Challan_Detail.map((d) =>
            d.SL_Nm == detail.SL_Nm && !d.SL_Id
              ? { ...d, SL_Nm: "", GST_No: "", SL_Id: null }
              : d,
          ),
        }));
      }
    }

    // Use the locally-updated array (has correct SL_Id values, no async state lag)
    const finalCommittedDetails = updatedCommittedDetails.filter(
      (detail) =>
        detail.Lg_Id &&
        detail.Amount &&
        parseFloat(detail.Amount) > 0 &&
        detail.Py_Mode,
    );

    // ✅ SHOW CONFIRMATION DIALOG FIRST
    const result = await Swal.fire({
      title: isEditMode
        ? "Update Challan Voucher?"
        : "Create New Challan Voucher?",
      text: isEditMode
        ? "Are you sure you want to update this challan voucher?"
        : "Are you sure you want to create this new challan voucher?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      let latestVoucherNo = formData.CV_No;

      if (!isEditMode) {
        const latestResponse =
          await newChallanFlowService.getNextVoucherNumber();
        if (latestResponse.success) {
          const nextNo = latestResponse.next_cv_no || 1;
          const formattedNo = newChallanFlowService.formatCvNo(
            selectedBranch,
            nextNo,
          );
          latestVoucherNo = formattedNo;
          setNextVoucherNumber(nextNo);
          setFormData((prev) => ({ ...prev, CV_No: formattedNo }));
        }
      }

      // Compute Net_Amount = Total_Amount + sum of all tax amounts across all committed details
      let totalTaxSum = 0;
      finalCommittedDetails.forEach((detail) => {
        (detail.taxSnapshot || []).forEach((t) => {
          if (t.isAdd) totalTaxSum += t.calculatedAmount || 0;
          else totalTaxSum -= t.calculatedAmount || 0;
        });
      });
      if (
        finalCommittedDetails.every(
          (d) => !d.taxSnapshot || d.taxSnapshot.length == 0,
        ) &&
        taxCalculation.taxBreakdown?.length
      ) {
        taxCalculation.taxBreakdown.forEach((t) => {
          if (t.isAdd) totalTaxSum += t.calculatedAmount || 0;
          else totalTaxSum -= t.calculatedAmount || 0;
        });
      }
      const computedNetAmount =
        parseFloat(formData.Total_Amount || 0) + totalTaxSum;

      // 🔥 SECOND: Use the latest voucher number in the payload
      const challanVoucherData = {
        Ch_Date: formData.Ch_Date,
        CV_No: String(latestVoucherNo),
        Dpt_Id: formData.Dpt_Id ? parseInt(formData.Dpt_Id) : null,
        CV_Ty: formData.CV_Ty ? parseInt(formData.CV_Ty) : null,
        Is_income: "Y",
        Total_Amount: parseFloat(formData.Total_Amount) || 0,
        Net_Amount: Math.round(computedNetAmount * 100) / 100,
        Status: initialActionId || "",
        UserId: userId,
        Mod_Code: currentModule,
        Challan_Detail: finalCommittedDetails.map((detail, detailIdx) => {
          const rowTaxSnapshot =
            detail.taxSnapshot && detail.taxSnapshot.length > 0
              ? detail.taxSnapshot
              : taxCalculation.taxBreakdown || [];

          const rowPayDetails = [];
          let pvdSr = 1;
          rowTaxSnapshot.forEach((t) => {
            if (!t.CIP_Id) return;
            const taxAmount = Math.round((t.calculatedAmount || 0) * 100) / 100;
            if (taxAmount == 0) return;
            rowPayDetails.push({
              PD_Ty: "TAX",
              Cht_Id: formData.CV_Ty ? parseInt(formData.CV_Ty) : null,
              PVD_Sr: pvdSr++,
              CIP_Id: t.CIP_Id,
              IC_Id: t.IC_Id,
              Lg_Id: t.Lg_Id,
              Percent: t.percentage,
              Formula: t.formula || "",
              IC_Amt: taxAmount,
              Add_Dedu: t.isAdd ? 1 : 0,
            });
          });

          return {
            CV_Sr: detail.CV_Sr,
            Lg_Id: detail.Lg_Id ? parseInt(detail.Lg_Id) : null,
            Bh_Id: detail.Bh_Id ? parseInt(detail.Bh_Id) : null,
            PayMd_ID: detail.PayMd_ID ? parseInt(detail.PayMd_ID) : null,
            SL_Id: detail.SL_Id ? parseInt(detail.SL_Id) : null,
            SL_Nm: detail.SL_Nm || null,
            GST_No: detail.GST_No || null,
            Amount: parseFloat(detail.Amount),
            Py_Mode: detail.Py_Mode,
            FileNo: detail.FileNo || null,
            Remarks: detail.Remarks || null,
            Chq_Date: detail.Chq_Date || null,
            Bank_Name: detail.Bank_Name || null,
            IFSC_Code: detail.IFSC_Code || null,
            Acc_No: detail.Acc_No || null,
            Chq_No: detail.Chq_No ? String(detail.Chq_No) : null,
            Rec_Date: detail.Rec_Date || null,
            pay_details: rowPayDetails,
          };
        }),
      };

      if (isEditMode) {
        await newChallanFlowService.update(id, challanVoucherData);
        toast.success("Challan voucher updated successfully!");
      } else {
        await newChallanFlowService.create(challanVoucherData);

        toast.success(
          `Challan voucher created successfully! Voucher No: ${latestVoucherNo}`,
        );
      }

      setTimeout(
        () => navigate("/transactions/bookkeeping-vouchers/new-challan-update"),
        1500,
      );
    } catch (error) {
      console.error("Error saving challan voucher:", error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach(
          (key) => (newErrors[key] = backendErrors[key][0]),
        );
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to save challan voucher",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () =>
    navigate("/transactions/bookkeeping-vouchers/new-challan-update");

  const NewPartyDialog = () => {
    if (!newPartyDialog.open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            New Party Name
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            <strong>{newPartyDialog.partyName}</strong> is a new party not found
            in the list.
            <br />
            Do you want to add it as a new party?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setNewPartyDialog({
                  open: false,
                  partyName: "",
                  resolve: null,
                });
                newPartyDialog.resolve(false);
              }}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              No
            </button>
            <button
              type="button"
              onClick={() => {
                setNewPartyDialog({
                  open: false,
                  partyName: "",
                  resolve: null,
                });
                newPartyDialog.resolve(true);
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formatAmount = (amount) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate totals for the challan details summary
  const totalTaxAmountForSummary = (() => {
    let total = 0;
    const committedDetails = formData.Challan_Detail.slice(0, -1); // exclude last empty row
    // Sum tax from each committed detail's taxSnapshot
    committedDetails.forEach((detail) => {
      if (detail.taxSnapshot && detail.taxSnapshot.length > 0) {
        detail.taxSnapshot.forEach((tax) => {
          if (tax.calculatedAmount && tax.calculatedAmount != 0) {
            total += tax.isAdd ? tax.calculatedAmount : -tax.calculatedAmount;
          }
        });
      }
    });
    return total;
  })();

  const netAmountForSummary = totalAmount + totalTaxAmountForSummary;

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading challan voucher data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <NewPartyDialog />
      <div className="flex items-center justify-between mb-6">
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
              {isEditMode
                ? "Edit Income Challan Voucher"
                : "New Income Challan Voucher"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update challan voucher information"
                : "Create new Income challan voucher with automatic tax calculation"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Voucher Details Box */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Voucher Details
                </h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={dateInputRef}
                      type="date"
                      name="Ch_Date"
                      tabIndex={1}
                      value={formData.Ch_Date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          Ch_Date: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key == "Enter") {
                          e.preventDefault();
                          branchButtonRef.current?.focus();
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.Ch_Date ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    />
                  </div>
                  {errors.Ch_Date && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.Ch_Date}
                    </p>
                  )}
                </div>

                {/* Challan No. - Non-editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challan No.
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                      {formData.CV_No || "Generating..."}
                    </div>
                    {formData.CV_No && (
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Branch Dropdown */}
                <SearchableDropdown
                  label="Branch"
                  value={formData.Dpt_Id}
                  error={errors.Dpt_Id}
                  required={true}
                  icon={Building}
                  isOpen={isBranchDropdownOpen}
                  setIsOpen={setIsBranchDropdownOpen}
                  searchTerm={branchSearchTerm}
                  setSearchTerm={setBranchSearchTerm}
                  items={flattenedBranches}
                  filteredItems={filteredBranches}
                  highlightedIndex={branchHighlightedIndex}
                  onSelect={handleBranchSelect}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)
                    ) {
                      e.preventDefault();
                      setIsBranchDropdownOpen(true);
                      setBranchSearchTerm("");
                      setTimeout(() => branchSearchRef.current?.focus(), 0);
                    }
                  }}
                  onSearchKeyDown={(e) => {
                    if (e.key == "ArrowDown" && filteredBranches.length) {
                      e.preventDefault();
                      setBranchHighlightedIndex(0);
                      setTimeout(() => branchItemRefs.current[0]?.focus(), 0);
                    } else if (e.key == "Escape") {
                      e.preventDefault();
                      setIsBranchDropdownOpen(false);
                      setBranchSearchTerm("");
                      branchButtonRef.current?.focus();
                    } else if (
                      e.key == "Enter" &&
                      filteredBranches.length > 0
                    ) {
                      e.preventDefault();
                      const target =
                        branchHighlightedIndex >= 0
                          ? filteredBranches[branchHighlightedIndex]
                          : filteredBranches[0];
                      if (target) handleBranchSelect(target);
                    }
                  }}
                  onItemKeyDown={(e, item, idx) => {
                    if (e.key == "ArrowDown") {
                      e.preventDefault();
                      if (idx + 1 < filteredBranches.length) {
                        setBranchHighlightedIndex(idx + 1);
                        setTimeout(
                          () => branchItemRefs.current[idx + 1]?.focus(),
                          0,
                        );
                      } else {
                        setBranchHighlightedIndex(-1);
                        setTimeout(() => branchSearchRef.current?.focus(), 0);
                      }
                    } else if (e.key == "ArrowUp") {
                      e.preventDefault();
                      if (idx == 0) {
                        setBranchHighlightedIndex(-1);
                        setTimeout(() => branchSearchRef.current?.focus(), 0);
                      } else {
                        setBranchHighlightedIndex(idx - 1);
                        setTimeout(
                          () => branchItemRefs.current[idx - 1]?.focus(),
                          0,
                        );
                      }
                    } else if (e.key == "Enter") {
                      e.preventDefault();
                      handleBranchSelect(item);
                    } else if (e.key == "Escape") {
                      e.preventDefault();
                      setIsBranchDropdownOpen(false);
                      setBranchSearchTerm("");
                      setBranchHighlightedIndex(-1);
                      branchButtonRef.current?.focus();
                    }
                  }}
                  getSelectedDisplay={() => {
                    const selected = flattenedBranches.find(
                      (b) => b.Dpt_id?.toString() == formData.Dpt_Id,
                    );
                    if (!selected) return "";
                    const level = parseInt(selected.GrStt, 10) || 1;
                    const indent = "    ".repeat(level - 1);
                    const desc = selected.Dpt_Desc || "";
                    const name = selected.Dpt_Name;
                    if (name && name != desc)
                      return `${indent}${desc} (${name})`;
                    return `${indent}${desc}`;
                  }}
                  loading={loadingDropdowns}
                  placeholder="Select Branch"
                  searchPlaceholder="Search by description or name..."
                  buttonRef={branchButtonRef}
                  dropdownRef={branchDropdownRef}
                  searchRef={branchSearchRef}
                  itemRefs={branchItemRefs}
                  listRef={branchListRef}
                  renderItem={(branch) => {
                    const level = parseInt(branch.GrStt, 10) || 1;
                    const levelColors = {
                      1: "bg-blue-100 text-blue-600",
                      2: "bg-green-100 text-green-600",
                      3: "bg-amber-100 text-amber-600",
                      4: "bg-purple-100 text-purple-600",
                    };
                    const colorClass =
                      levelColors[level] || "bg-gray-100 text-gray-600";
                    const desc = branch.Dpt_Desc || "";
                    const name = branch.Dpt_Name;
                    return (
                      <div className="py-1">
                        <div className="flex items-start">
                          <div
                            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
                          >
                            <span className="text-xs font-bold">L{level}</span>
                          </div>
                          <div className="flex-1">
                            <div
                              className="text-sm font-medium text-gray-900 whitespace-pre-wrap"
                              style={{ marginLeft: `${(level - 1) * 20}px` }}
                            >
                              {desc}
                            </div>
                            {name && name != desc && (
                              <div
                                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                                style={{ marginLeft: `${(level - 1) * 20}px` }}
                              >
                                {name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Challan Type Dropdown */}
                <SearchableDropdown
                  label="Challan Type"
                  value={formData.CV_Ty}
                  error={errors.CV_Ty}
                  required={false}
                  icon={Receipt}
                  isOpen={isChallanTypeDropdownOpen}
                  setIsOpen={setIsChallanTypeDropdownOpen}
                  searchTerm={challanTypeSearchTerm}
                  setSearchTerm={setChallanTypeSearchTerm}
                  items={dropdownData.challanTypes}
                  filteredItems={filteredChallanTypes}
                  highlightedIndex={challanTypeHighlightedIndex}
                  onSelect={handleChallanTypeSelect}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)
                    ) {
                      e.preventDefault();
                      setIsChallanTypeDropdownOpen(true);
                      setChallanTypeSearchTerm("");
                      setTimeout(
                        () => challanTypeSearchRef.current?.focus(),
                        0,
                      );
                    }
                  }}
                  onSearchKeyDown={(e) => {
                    if (e.key == "ArrowDown" && filteredChallanTypes.length) {
                      e.preventDefault();
                      setChallanTypeHighlightedIndex(0);
                      setTimeout(
                        () => challanTypeItemRefs.current[0]?.focus(),
                        0,
                      );
                    } else if (e.key == "Escape") {
                      e.preventDefault();
                      setIsChallanTypeDropdownOpen(false);
                      setChallanTypeSearchTerm("");
                      challanTypeButtonRef.current?.focus();
                    } else if (
                      e.key == "Enter" &&
                      filteredChallanTypes.length > 0
                    ) {
                      e.preventDefault();
                      const target =
                        challanTypeHighlightedIndex >= 0
                          ? filteredChallanTypes[challanTypeHighlightedIndex]
                          : filteredChallanTypes[0];
                      if (target) handleChallanTypeSelect(target);
                    }
                  }}
                  onItemKeyDown={(e, item, idx) => {
                    if (
                      e.key == "ArrowDown" &&
                      idx + 1 < filteredChallanTypes.length
                    ) {
                      e.preventDefault();
                      setChallanTypeHighlightedIndex(idx + 1);
                      setTimeout(
                        () => challanTypeItemRefs.current[idx + 1]?.focus(),
                        0,
                      );
                    } else if (e.key == "ArrowUp" && idx > 0) {
                      e.preventDefault();
                      setChallanTypeHighlightedIndex(idx - 1);
                      setTimeout(
                        () => challanTypeItemRefs.current[idx - 1]?.focus(),
                        0,
                      );
                    } else if (e.key == "Enter") {
                      e.preventDefault();
                      handleChallanTypeSelect(item);
                    } else if (e.key == "Escape") {
                      e.preventDefault();
                      setIsChallanTypeDropdownOpen(false);
                      setChallanTypeSearchTerm("");
                      setChallanTypeHighlightedIndex(-1);
                      challanTypeButtonRef.current?.focus();
                    }
                  }}
                  getSelectedDisplay={() => {
                    const selected = dropdownData.challanTypes.find(
                      (t) => t.Cht_Id == parseInt(formData.CV_Ty),
                    );
                    return selected ? selected.Cht_Name : "";
                  }}
                  loading={loadingDropdowns}
                  placeholder="Select Challan Type (Optional)"
                  searchPlaceholder="Search by type name or code..."
                  buttonRef={challanTypeButtonRef}
                  dropdownRef={challanTypeDropdownRef}
                  searchRef={challanTypeSearchRef}
                  itemRefs={challanTypeItemRefs}
                  listRef={challanTypeListRef}
                  renderItem={(type) => (
                    <div className="py-1">
                      <div className="font-medium text-gray-900">
                        {type.Cht_Name}
                      </div>
                      {type.Cht_Code && (
                        <div className="text-xs text-gray-500 mt-1">
                          Code: {type.Cht_Code}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Challan Details Box */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-7 w-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-2">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Challan Details
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleImportClick}
                    disabled={importing}
                    className="flex items-center px-2.5 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Loader className="h-3 w-3 mr-1 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 mr-1" />
                        Import
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="flex items-center px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Sample
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileImport}
                className="hidden"
              />
              <div
                className="overflow-x-auto"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className="bg-gray-100 text-gray-600">
                      <th className="text-left px-2 py-2">#</th>
                      <th className="text-left px-2 py-2">Ledger</th>
                      <th className="text-left px-2 py-2">Party Name</th>
                      <th className="text-left px-2 py-2">GST</th>
                      <th className="text-right px-2 py-2">Amount</th>
                      <th className="text-left px-2 py-2">Payment Mode</th>
                      <th className="text-left px-2 py-2">Payment Details</th>
                      <th className="text-left px-2 py-2">File No./Remarks</th>
                      <th className="text-left px-2 py-2">Taxation</th>
                      <th className="text-center px-2 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(editingDetailIndex != null
                      ? formData.Challan_Detail.filter(
                          (_, i) => i != editingDetailIndex,
                        )
                      : formData.Challan_Detail.slice(0, -1)
                    ).map((detail, idx) => {
                      const originalIdx =
                        editingDetailIndex != null
                          ? idx >= editingDetailIndex
                            ? idx + 1
                            : idx
                          : idx;
                      const ledger = dropdownData.ledgers.find(
                        (l) => l.Lg_Id == parseInt(detail.Lg_Id),
                      );
                      const selectedMode = dropdownData.paymentModes.find(
                        (m) => m.value == detail.Py_Mode,
                      );
                      const isCheque =
                        detail.Py_Mode &&
                        selectedMode?.Is_Cash == 0 &&
                        selectedMode?.Is_Digital == 0;
                      const isBank =
                        detail.Py_Mode && selectedMode?.Is_Digital == 1; // Guard against "0", "000", null, "null", empty string
                      const cleanStr = (v) => {
                        if (v == null || v == undefined) return "";
                        const s = String(v).trim();
                        if (
                          !s ||
                          s == "null" ||
                          s == "undefined" ||
                          /^0+$/.test(s)
                        )
                          return "";
                        return s;
                      };
                      const displayBankName = cleanStr(detail.Bank_Name);
                      return (
                        <tr key={originalIdx} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-500">
                            {originalIdx + 1}
                          </td>
                          <td className="px-2 py-1.5 text-gray-800 max-w-[120px]">
                            <div className="truncate">
                              {ledger?.Lg_Name ||
                                (detail.Lg_Id ? `ID: ${detail.Lg_Id}` : "-")}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-gray-800">
                            {detail.SL_Nm || "-"}
                          </td>
                          <td className="px-2 py-1.5 text-gray-800 font-mono text-xs">
                            {detail.GST_No || "-"}
                          </td>
                          <td className="px-2 py-1.5 text-green-700 font-semibold text-right">
                            {detail.Amount
                              ? `₹${parseFloat(detail.Amount).toLocaleString("en-IN")}`
                              : "-"}
                          </td>
                          <td className="px-2 py-1.5 text-gray-800">
                            {detail.Py_Mode || "-"}
                          </td>
                          <td className="px-2 py-1.5 text-gray-800 text-xs">
                            {isCheque || isBank ? (
                              <div className="space-y-0.5">
                                {isCheque && cleanStr(detail.Bank_Name) && (
                                  <div>Bank: {cleanStr(detail.Bank_Name)}</div>
                                )}
                                {isCheque && cleanStr(detail.Chq_No) && (
                                  <div>Chq: {cleanStr(detail.Chq_No)}</div>
                                )}
                                {isCheque && detail.Chq_Date && (
                                  <div>
                                    Date: {formatDateDisplay(detail.Chq_Date)}
                                  </div>
                                )}
                                {isCheque && detail.Rec_Date && (
                                  <div>
                                    Receipt:{" "}
                                    {formatDateDisplay(detail.Rec_Date)}
                                  </div>
                                )}
                                {isBank &&
                                  !isCheque &&
                                  cleanStr(detail.Bank_Name) && (
                                    <div>
                                      Bank: {cleanStr(detail.Bank_Name)}
                                    </div>
                                  )}
                                {isBank &&
                                  !isCheque &&
                                  cleanStr(detail.Acc_No) && (
                                    <div>A/C: {cleanStr(detail.Acc_No)}</div>
                                  )}
                                {isBank &&
                                  !isCheque &&
                                  cleanStr(detail.IFSC_Code) && (
                                    <div>
                                      IFSC: {cleanStr(detail.IFSC_Code)}
                                    </div>
                                  )}
                                {isBank && !isCheque && detail.Rec_Date && (
                                  <div>
                                    Receipt:{" "}
                                    {formatDateDisplay(detail.Rec_Date)}
                                  </div>
                                )}
                                {!cleanStr(detail.Bank_Name) &&
                                  !cleanStr(detail.Chq_No) &&
                                  !cleanStr(detail.Acc_No) &&
                                  !cleanStr(detail.IFSC_Code) &&
                                  !detail.Rec_Date &&
                                  !detail.Chq_Date && <span>-</span>}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-gray-800 text-xs">
                            {detail.FileNo && <div>{detail.FileNo}</div>}
                            {detail.Remarks && (
                              <div className="text-gray-500">
                                {detail.Remarks}
                              </div>
                            )}
                            {!detail.FileNo && !detail.Remarks && "-"}
                          </td>
                          <td className="px-2 py-1.5">
                            {(detail.taxSnapshot || []).filter(
                              (t) => (t.calculatedAmount || 0) != 0,
                            ).length > 0 ? (
                              <div className="space-y-0.5">
                                {(detail.taxSnapshot || [])
                                  .filter((t) => (t.calculatedAmount || 0) != 0)
                                  .map((t, ti) => (
                                    <div
                                      key={ti}
                                      className={`text-xs ${t.isAdd ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {t.displayText}: ₹
                                      {t.calculatedAmount?.toLocaleString(
                                        "en-IN",
                                        { minimumFractionDigits: 2 },
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDetailIndex(originalIdx);
                                  // Load this row's tax snapshot into taxCalculation for editing
                                  const editDetail =
                                    formData.Challan_Detail[originalIdx];
                                  const rowAmount =
                                    parseFloat(editDetail.Amount) || 0;
                                  if (
                                    editDetail.taxSnapshot &&
                                    editDetail.taxSnapshot.length > 0
                                  ) {
                                    const manualOverrides = {};
                                    let totalAdd = 0,
                                      totalLess = 0,
                                      runningAmount = rowAmount;
                                    editDetail.taxSnapshot.forEach((t) => {
                                      manualOverrides[t.CIP_Id] =
                                        t.calculatedAmount || 0;
                                      if (t.isAdd) {
                                        runningAmount +=
                                          t.calculatedAmount || 0;
                                        totalAdd += t.calculatedAmount || 0;
                                      } else {
                                        runningAmount -=
                                          t.calculatedAmount || 0;
                                        totalLess += t.calculatedAmount || 0;
                                      }
                                    });
                                    setManualTaxAmounts(manualOverrides);
                                    setTaxCalculation({
                                      grossAmount: rowAmount,
                                      netAmount: runningAmount,
                                      taxBreakdown: editDetail.taxSnapshot.map(
                                        (t) => ({
                                          ...t,
                                          isTax: true,
                                          type: "tax",
                                          isManual: isManualFormula(
                                            t.formula || "",
                                          ),
                                        }),
                                      ),
                                      totalAdd,
                                      totalLess,
                                      totalTax: totalAdd - totalLess,
                                    });
                                  } else if (
                                    challanTypeTaxParameters.length > 0
                                  ) {
                                    setManualTaxAmounts({});
                                    calculateTaxes(
                                      rowAmount,
                                      challanTypeTaxParameters,
                                      {},
                                    );
                                  } else {
                                    setManualTaxAmounts({});
                                    setTaxCalculation({
                                      grossAmount: 0,
                                      netAmount: 0,
                                      taxBreakdown: [],
                                      totalAdd: 0,
                                      totalLess: 0,
                                      totalTax: 0,
                                    });
                                  }
                                }}
                                className="text-blue-500 hover:text-blue-700 p-0.5"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeDetailRow(originalIdx)}
                                className="text-red-500 hover:text-red-700 p-0.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Summary Row */}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold sticky bottom-0">
                      <td
                        colSpan="4"
                        className="px-2 py-2 text-right text-sm font-bold text-gray-800"
                      >
                        Totals:
                      </td>
                      <td className="px-2 py-2 text-right text-sm font-bold text-green-700">
                        {formatAmount(totalAmount)}
                      </td>
                      <td colSpan="1" className="px-2 py-2"></td>
                      <td
                        colSpan="2"
                        className="px-2 py-2 text-right text-sm font-bold text-gray-800"
                      >
                        Tax Amount:
                      </td>
                      <td className="px-2 py-2 text-left text-sm font-bold text-green-700">
                        {totalTaxAmountForSummary != 0
                          ? `+ ${formatAmount(totalTaxAmountForSummary)}`
                          : "-"}
                      </td>
                      <td className="px-2 py-2"></td>
                    </tr>
                    <tr className="border-t border-gray-200 bg-gray-50 font-semibold sticky bottom-0">
                      <td
                        colSpan="4"
                        className="px-2 py-2 text-right text-sm font-bold text-gray-800"
                      >
                        Net Amount:
                      </td>
                      <td className="px-2 py-2 text-right text-base font-bold text-blue-700">
                        {formatAmount(netAmountForSummary)}
                      </td>
                      <td colSpan="5" className="px-2 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Challan Entry - Right (1/3) */}
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:col-span-1 overflow-visible">
            {(() => {
              const lastIdx =
                editingDetailIndex != null
                  ? editingDetailIndex
                  : formData.Challan_Detail.length - 1;
              const detail = formData.Challan_Detail[lastIdx];
              const selectedMode = dropdownData.paymentModes.find(
                (m) => m.value == detail.Py_Mode,
              );
              const isCashMode = selectedMode?.Is_Cash == 1;
              const isDigitalMode = selectedMode?.Is_Digital == 1;
              const showChequeSection =
                detail.Py_Mode && !isCashMode && !isDigitalMode;
              const showBankSection = detail.Py_Mode && isDigitalMode;

              return (
                <div className="space-y-3 overflow-visible">
                  <ChallanDetailRow
                    index={lastIdx}
                    detail={detail}
                    onChange={handleDetailChange}
                    onRemove={removeDetailRow}
                    showRemove={false}
                    ledgers={
                      filteredLedgersForBranch.length > 0
                        ? filteredLedgersForBranch
                        : dropdownData.ledgers
                    }
                    loadingLedgers={loadingLedgers}
                    paymentModes={dropdownData.paymentModes}
                    errors={errors}
                    ledgerRefs={ledgerRefs}
                    slNameRefs={slNameRefs}
                    gstNoRefs={gstNoRefs}
                    amountRefs={amountRefs}
                    pyModeRefs={pyModeRefs}
                    fileNoRefs={fileNoRefs}
                    remarksRefs={remarksRefs}
                    chqDateRefs={chqDateRefs}
                    ifscRefs={ifscRefs}
                    accNoRefs={accNoRefs}
                    chqNoRefs={chqNoRefs}
                    recDateRefs={recDateRefs}
                    bankNameRefs={bankNameRefs}
                    isEditMode={isEditMode}
                    hideRow2={true}
                    subLedgers={dropdownData.subLedgers}
                    filteredLedgersForBranch={filteredLedgersForBranch}
                    branchBudgetHeadIds={branchBudgetHeadIds}
                  />

                  <TaxCalculationCard
                    taxCalculation={taxCalculation}
                    loading={loadingTaxParameters}
                    totalAmount={parseFloat(detail.Amount) || 0}
                    onTaxAmountChange={handleTaxAmountChange}
                    manualAmounts={manualTaxAmounts}
                  />

                  <div className="space-y-3">
                    {/* Payment Mode */}
                    <div
                      className="flex items-center gap-3"
                      ref={paymentModeDropdownRef}
                    >
                      <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
                        Payment Mode *
                      </label>
                      <div className="relative flex-1">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                        <button
                          ref={(el) => {
                            if (pyModeRefs.current)
                              pyModeRefs.current[lastIdx] = el;
                          }}
                          type="button"
                          onClick={() => {
                            setIsPaymentModeOpen(!isPaymentModeOpen);
                            setPaymentModeSearch("");
                            setPaymentModeHighlightedIndex(-1);
                            setTimeout(
                              () => paymentModeSearchRef.current?.focus(),
                              0,
                            );
                          }}
                          onKeyDown={(e) => {
                            if (e.key == "Enter" && !isPaymentModeOpen) {
                              e.preventDefault();
                              if (detail.Py_Mode) {
                                fileNoRefs.current?.[lastIdx]?.focus();
                              } else {
                                setIsPaymentModeOpen(true);
                                setPaymentModeSearch("");
                                setPaymentModeHighlightedIndex(-1);
                                setTimeout(
                                  () => paymentModeSearchRef.current?.focus(),
                                  0,
                                );
                              }
                            } else if (
                              ["ArrowDown", "ArrowUp", " "].includes(e.key)
                            ) {
                              e.preventDefault();
                              setIsPaymentModeOpen(true);
                              setPaymentModeSearch("");
                              setPaymentModeHighlightedIndex(-1);
                              setTimeout(
                                () => paymentModeSearchRef.current?.focus(),
                                0,
                              );
                            }
                          }}
                          className={`w-full pl-10 pr-8 py-2.5 border ${errors[`ChallanDetail_${lastIdx}_Py_Mode`] ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 text-left bg-white text-sm`}
                        >
                          {detail.Py_Mode ? (
                            <span className="text-gray-900 truncate block">
                              {dropdownData.paymentModes.find(
                                (m) => m.value == detail.Py_Mode,
                              )?.label || detail.Py_Mode}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Select Payment Mode *
                            </span>
                          )}
                        </button>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        {isPaymentModeOpen && (
                          <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-2 border-b border-gray-100">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  ref={paymentModeSearchRef}
                                  type="text"
                                  value={paymentModeSearch}
                                  onChange={(e) => {
                                    setPaymentModeSearch(e.target.value);
                                    setPaymentModeHighlightedIndex(-1);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key == "ArrowDown") {
                                      e.preventDefault();
                                      if (filteredPaymentModes.length > 0) {
                                        setPaymentModeHighlightedIndex(0);
                                        setTimeout(
                                          () =>
                                            paymentModeItemRefs.current[0]?.focus(),
                                          0,
                                        );
                                      }
                                    } else if (e.key == "Escape") {
                                      e.preventDefault();
                                      setIsPaymentModeOpen(false);
                                      setPaymentModeSearch("");
                                      pyModeRefs.current?.[lastIdx]?.focus();
                                    } else if (e.key == "Enter") {
                                      e.preventDefault();
                                      const target =
                                        paymentModeHighlightedIndex >= 0
                                          ? filteredPaymentModes[
                                              paymentModeHighlightedIndex
                                            ]
                                          : filteredPaymentModes[0];
                                      if (target) {
                                        handlePaymentModeSelect(
                                          target,
                                          lastIdx,
                                        );
                                        setIsPaymentModeOpen(false);
                                        setPaymentModeSearch("");
                                        fileNoRefs.current?.[lastIdx]?.focus();
                                      }
                                    }
                                  }}
                                  placeholder="Search payment mode..."
                                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                            </div>
                            <div className="overflow-y-auto max-h-48">
                              {filteredPaymentModes.length > 0 ? (
                                filteredPaymentModes.map((mode, idx) => (
                                  <button
                                    key={mode.value}
                                    ref={(el) => {
                                      paymentModeItemRefs.current[idx] = el;
                                    }}
                                    type="button"
                                    onClick={() => {
                                      handlePaymentModeSelect(mode, lastIdx);
                                      setIsPaymentModeOpen(false);
                                      setPaymentModeSearch("");
                                      setTimeout(
                                        () =>
                                          fileNoRefs.current?.[
                                            lastIdx
                                          ]?.focus(),
                                        50,
                                      );
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key == "ArrowDown") {
                                        e.preventDefault();
                                        const next = idx + 1;
                                        if (
                                          next < filteredPaymentModes.length
                                        ) {
                                          setPaymentModeHighlightedIndex(next);
                                          setTimeout(
                                            () =>
                                              paymentModeItemRefs.current[
                                                next
                                              ]?.focus(),
                                            0,
                                          );
                                        } else {
                                          setPaymentModeHighlightedIndex(-1);
                                          setTimeout(
                                            () =>
                                              paymentModeSearchRef.current?.focus(),
                                            0,
                                          );
                                        }
                                      } else if (e.key == "ArrowUp") {
                                        e.preventDefault();
                                        if (idx == 0) {
                                          setPaymentModeHighlightedIndex(-1);
                                          setTimeout(
                                            () =>
                                              paymentModeSearchRef.current?.focus(),
                                            0,
                                          );
                                        } else {
                                          setPaymentModeHighlightedIndex(
                                            idx - 1,
                                          );
                                          setTimeout(
                                            () =>
                                              paymentModeItemRefs.current[
                                                idx - 1
                                              ]?.focus(),
                                            0,
                                          );
                                        }
                                      } else if (e.key == "Enter") {
                                        e.preventDefault();
                                        handlePaymentModeSelect(mode, lastIdx);
                                        setIsPaymentModeOpen(false);
                                        setPaymentModeSearch("");
                                        setTimeout(
                                          () =>
                                            fileNoRefs.current?.[
                                              lastIdx
                                            ]?.focus(),
                                          50,
                                        );
                                      } else if (e.key == "Escape") {
                                        e.preventDefault();
                                        setIsPaymentModeOpen(false);
                                        setPaymentModeSearch("");
                                        pyModeRefs.current?.[lastIdx]?.focus();
                                      }
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm border-b border-gray-50 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 ${paymentModeHighlightedIndex == idx || detail.Py_Mode == mode.value ? "bg-blue-50 text-blue-700" : "text-gray-800"}`}
                                    tabIndex={0}
                                  >
                                    {mode.label}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-4 text-center text-sm text-gray-400">
                                  No modes found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* File No. */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
                        File No.
                      </label>
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={(el) => {
                            if (fileNoRefs.current)
                              fileNoRefs.current[lastIdx] = el;
                          }}
                          type="text"
                          value={detail.FileNo || ""}
                          onChange={(e) =>
                            handleDetailChange(
                              lastIdx,
                              "FileNo",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key == "Enter") {
                              e.preventDefault();
                              remarksRefs.current?.[lastIdx]?.focus();
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="File No."
                        />
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
                        Remarks
                      </label>
                      <div className="relative flex-1">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={(el) => {
                            if (remarksRefs.current)
                              remarksRefs.current[lastIdx] = el;
                          }}
                          type="text"
                          value={detail.Remarks || ""}
                          onChange={(e) =>
                            handleDetailChange(
                              lastIdx,
                              "Remarks",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key == "Enter") {
                              e.preventDefault();
                              if (
                                showChequeSection &&
                                bankNameRefs.current?.[lastIdx]
                              ) {
                                bankNameRefs.current[lastIdx].focus();
                              } else if (
                                showBankSection &&
                                bankNameRefs.current?.[lastIdx]
                              ) {
                                bankNameRefs.current[lastIdx].focus();
                              }
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Remarks"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cheque/DD Details Section */}
                  {showChequeSection && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-700 flex items-center mb-3">
                        <Banknote className="h-4 w-4 mr-2" /> Cheque/DD Details
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Bank Name
                          </label>
                          <input
                            ref={(el) => {
                              if (bankNameRefs.current)
                                bankNameRefs.current[lastIdx] = el;
                            }}
                            type="text"
                            value={detail.Bank_Name || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "Bank_Name",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                chqNoRefs.current?.[lastIdx]?.focus();
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Bank Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cheque/DD No.
                          </label>
                          <input
                            ref={(el) => {
                              if (chqNoRefs.current)
                                chqNoRefs.current[lastIdx] = el;
                            }}
                            type="text"
                            value={detail.Chq_No || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "Chq_No",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                chqDateRefs.current?.[lastIdx]?.focus();
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Only numbers"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cheque/DD Date
                          </label>
                          <input
                            ref={(el) => {
                              if (chqDateRefs.current)
                                chqDateRefs.current[lastIdx] = el;
                            }}
                            type="date"
                            value={detail.Chq_Date || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "Chq_Date",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                recDateRefs.current?.[lastIdx]?.focus();
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Receipt Date
                          </label>
                          <input
                            ref={(el) => {
                              if (recDateRefs.current)
                                recDateRefs.current[lastIdx] = el;
                            }}
                            type="date"
                            value={detail.Rec_Date || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "Rec_Date",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Details Section */}
                  {showBankSection && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700 flex items-center mb-3">
                        <Landmark className="h-4 w-4 mr-2" /> Bank Transfer
                        Details
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Bank Name
                          </label>
                          <input
                            ref={(el) => {
                              if (bankNameRefs.current)
                                bankNameRefs.current[lastIdx] = el;
                            }}
                            type="text"
                            value={detail.Bank_Name || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "Bank_Name",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                accNoRefs.current?.[lastIdx]?.focus();
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Bank Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Account No.
                          </label>
                          <input
                            ref={(el) => {
                              if (accNoRefs.current)
                                accNoRefs.current[lastIdx] = el;
                            }}
                            type="text"
                            value={detail.Acc_No || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "Acc_No",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                ifscRefs.current?.[lastIdx]?.focus();
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Account No."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            IFSC Code
                          </label>
                          <input
                            ref={(el) => {
                              if (ifscRefs.current)
                                ifscRefs.current[lastIdx] = el;
                            }}
                            type="text"
                            value={detail.IFSC_Code || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "IFSC_Code",
                                e.target.value.toUpperCase(),
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                recDateRefs.current?.[lastIdx]?.focus();
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                            placeholder="IFSC Code"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Receipt Date
                          </label>
                          <input
                            ref={(el) => {
                              if (recDateRefs.current)
                                recDateRefs.current[lastIdx] = el;
                            }}
                            type="date"
                            value={detail.Rec_Date || ""}
                            onChange={(e) =>
                              handleDetailChange(
                                lastIdx,
                                "Rec_Date",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add/Update Button */}
                  <div className="flex justify-end gap-2">
                    {editingDetailIndex != null && (
                      <button
                        type="button"
                        onClick={() => setEditingDetailIndex(null)}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addNewDetailRow}
                      className={`flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
                        editingDetailIndex != null
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {editingDetailIndex != null ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Update
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            {!isFormValid && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Please add at least one completed challan detail (Ledger
                Account, Amount, and Payment Mode) to enable the{" "}
                {isEditMode ? "Update" : "Create"} button.
              </p>
            )}
            {taxCalculation.netAmount > 0 &&
              taxCalculation.netAmount != totalAmount && (
                <p className="text-xs text-green-600 mt-1">
                  Tax applied: Net amount ={" "}
                  {formatAmount(taxCalculation.netAmount)}
                </p>
              )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving || !isFormValid}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Voucher" : "Create Voucher"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateNewChallanUpdate;

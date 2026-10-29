 import { useState, useEffect, useRef, use } from "react";
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
  Calculator,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Info,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { newChallanVoucherApi } from "../../../services/newchallanvoucher";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// =========  EXCEL IMPORT/EXPORT FUNCTIONS ==========

// Sample Data Template for Download (with Ledger Code instead of Ledger Name)
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
    {
      "Ledger Code": "10808",
      "Party Name": "Cheque Party",
      "GST No.": "24CCCCC0000C3Z",
      "Amount (₹)": "5000",
      "Payment Mode": "Cheque",
      "File No.": "FILE003",
      Remarks: "Cheque payment example",
      "Cheque/DD No.": "12345678",
      "Cheque/DD Date": "2026-04-02",
      "Receipt Date": "2026-04-02",
      "Bank Name": "",
      "Account No.": "",
      "IFSC Code": "",
    },
  ];
};

// Download Sample Excel Template
const downloadSampleTemplate = () => {
  const sampleData = getSampleChallanData();
  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Ledger Code
    { wch: 20 }, // Party Name
    { wch: 18 }, // GST No.
    { wch: 12 }, // Amount
    { wch: 12 }, // Payment Mode
    { wch: 12 }, // File No.
    { wch: 25 }, // Remarks
    { wch: 15 }, // Cheque/DD No.
    { wch: 15 }, // Cheque/DD Date
    { wch: 15 }, // Receipt Date
    { wch: 20 }, // Bank Name
    { wch: 15 }, // Account No.
    { wch: 12 }, // IFSC Code
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Challan Template");

  // Add instructions sheet
  const instructions = [
    ["INSTRUCTIONS FOR IMPORTING CHALLAN DATA"],
    [""],
    ["1. All fields are OPTIONAL except:"],
    ["   - Amount (₹) - Must be a positive number"],
    [
      "   - Payment Mode - Must be one of: Cash, Bank, Cheque, DD, Online, Card",
    ],
    [""],
    ["2. Ledger Code:"],
    ["   - If provided, system will try to match with existing ledger codes"],
    [
      "   - If ledger code not found, the row will still be imported but you'll need to select ledger manually",
    ],
    [
      "   - This field is optional - you can leave it blank and select ledger later",
    ],
    [""],
    ["3. Other Optional Fields:"],
    ["   - Party Name, GST No., File No., Remarks"],
    ["   - Cheque/DD No. (for Cheque/DD payment mode)"],
    ["   - Cheque/DD Date (for Cheque/DD payment mode)"],
    ["   - Receipt Date (for Cheque/DD/Bank/Online/Card payment modes)"],
    ["   - Bank Name (for Bank/Online/Card payment modes)"],
    ["   - Account No. (for Bank/Online/Card payment modes)"],
    ["   - IFSC Code (for Bank/Online/Card payment modes)"],
    [""],
    ["4. Date Format: YYYY-MM-DD (e.g., 2026-04-02)"],
    [""],
    ["5. IMPORTANT:"],
    ["   - All fields except Amount and Payment Mode are optional"],
    [
      "   - If ledger code is not found, you can manually select ledger from the form after import",
    ],
    [
      "   - No validation will block the import - you can fix missing data later",
    ],
    [""],
    ["Available Ledger Codes (for reference):"],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, "challan_template.xlsx");
};

// Parse Excel file and convert to Challan Details - All fields optional
const parseExcelToChallanDetails = async (file, ledgers) => {
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

        // Helper function to clean cheque number - only keep digits
        const cleanChequeNumber = (value) => {
          if (!value) return "";
          const strValue = value.toString().trim();
          const digitsOnly = strValue.replace(/\D/g, "");
          return digitsOnly;
        };

        // Create maps for quick ledger lookup by code and name
        const ledgerByCodeMap = new Map();
        const ledgerByNameMap = new Map();

        ledgers.forEach((ledger) => {
          if (ledger.Lg_Code) {
            ledgerByCodeMap.set(ledger.Lg_Code.toLowerCase(), ledger);
          }
          if (ledger.Lg_Name) {
            ledgerByNameMap.set(ledger.Lg_Name.toLowerCase(), ledger);
          }
          if (ledger.Lg_Eng_Name) {
            ledgerByNameMap.set(ledger.Lg_Eng_Name.toLowerCase(), ledger);
          }
        });

        for (let index = 0; index < jsonData.length; index++) {
          const row = jsonData[index];
          const rowNum = index + 2;

          // Try to find ledger by code first, then by name (backward compatibility)
          let ledger = null;

          // Check for Ledger Code column (primary)
          const ledgerCode = row["Ledger Code"]?.toString().trim();
          // Check for Ledger Name column (backward compatibility)
          const ledgerName = row["Ledger Name"]?.toString().trim();

          if (ledgerCode) {
            ledger = ledgerByCodeMap.get(ledgerCode.toLowerCase());
            if (!ledger) {
              warnings.push(
                `Row ${rowNum}: Ledger code "${ledgerCode}" not found. You'll need to select ledger manually.`,
              );
            }
          } else if (ledgerName) {
            ledger = ledgerByNameMap.get(ledgerName.toLowerCase());
            if (!ledger) {
              warnings.push(
                `Row ${rowNum}: Ledger name "${ledgerName}" not found. You'll need to select ledger manually.`,
              );
            }
          }

          // Validate Amount (required)
          const amount = parseFloat(row["Amount (₹)"]);
          if (isNaN(amount) || amount <= 0) {
            warnings.push(`Row ${rowNum}: Invalid amount. Skipping this row.`);
            continue;
          }

          // Validate Payment Mode (required)
          const paymentMode = row["Payment Mode"]?.toString().trim();
          const validPaymentModes = [
            "Cash",
            "Bank",
            "Cheque",
            "DD",
            "Online",
            "Card",
          ];
          if (!paymentMode || !validPaymentModes.includes(paymentMode)) {
            warnings.push(
              `Row ${rowNum}: Invalid Payment Mode "${paymentMode}". Must be one of: ${validPaymentModes.join(", ")}. Skipping this row.`,
            );
            continue;
          }

          // Clean the cheque number - extract only digits
          const rawChqNo = row["Cheque/DD No."]?.toString().trim() || "";
          const cleanedChqNo = cleanChequeNumber(rawChqNo);

          if (rawChqNo && rawChqNo != cleanedChqNo) {
            warnings.push(
              `Row ${rowNum}: Cheque/DD No. "${rawChqNo}" was cleaned to "${cleanedChqNo}" (only numbers allowed)`,
            );
          }

          // Create challan detail - ALL fields optional except Amount and Payment Mode
          challanDetails.push({
            CV_Sr: challanDetails.length + 1,
            Lg_Id: ledger?.Lg_Id?.toString() || "",
            Bh_Id: ledger?.budget_head?.Bh_Id?.toString() || null,
            SL_Nm: row["Party Name"]?.toString().trim() || "",
            GST_No: row["GST No."]?.toString().trim() || "",
            Amount: amount.toString(),
            Py_Mode: paymentMode,
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
            errors: [
              "No valid data found in the Excel file. Please check that Amount and Payment Mode columns have valid values.",
            ],
            partialData: [],
          });
        } else {
          if (warnings.length > 0) {
            reject({ errors: warnings, partialData: challanDetails });
          } else {
            resolve(challanDetails);
          }
        }
      } catch (error) {
        reject({
          errors: [`Failed to parse Excel file: ${error.message}`],
          partialData: [],
        });
      }
    };
    reader.onerror = () => {
      reject({ errors: ["Failed to read file"], partialData: [] });
    };
    reader.readAsArrayBuffer(file);
  });
};

// Export current challan details to Excel (with Ledger Code)
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
    { wch: 20 }, // Ledger Code
    { wch: 20 }, // Party Name
    { wch: 18 }, // GST No.
    { wch: 12 }, // Amount
    { wch: 12 }, // Payment Mode
    { wch: 12 }, // File No.
    { wch: 25 }, // Remarks
    { wch: 15 }, // Cheque/DD No.
    { wch: 15 }, // Cheque/DD Date
    { wch: 15 }, // Receipt Date
    { wch: 20 }, // Bank Name
    { wch: 15 }, // Account No.
    { wch: 12 }, // IFSC Code
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
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  const handleSearchChange = (e) => {
    if (typeof setSearchTerm == "function") {
      setSearchTerm(e.target.value);
    }
  };

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
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={!disabled ? onKeyDown : undefined}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors`}
        >
          {value ? (
            <span className="text-gray-900 truncate block">
              {getSelectedDisplay()}
            </span>
          ) : (
            <span className="text-gray-500">
              {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
            </span>
          )}
        </button>

        {loading ? (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )
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
                onChange={handleSearchChange}
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

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId =
                  item?.Dpt_id || item?.Lg_Id || item?.Cht_Id || `item-${idx}`;

                return (
                  <button
                    key={itemId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => onSelect(item)}
                    onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && itemId && value == itemId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem ? renderItem(item) : item.name}
                    {value && itemId && value == itemId.toString() && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No items found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} items found</span>
            </div>
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
  handleEnterKey,
  isEditMode,
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

  // Filter ledgers based on search
  useEffect(() => {
    if (!ledgerSearchTerm.trim()) {
      setFilteredLedgers(ledgers);
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      const filtered = ledgers.filter(
        (ledger) =>
          ledger.Lg_Name?.toLowerCase().includes(term) ||
          (ledger.Lg_Eng_Name &&
            ledger.Lg_Eng_Name.toLowerCase().includes(term)) ||
          (ledger.Lg_Code && ledger.Lg_Code.toLowerCase().includes(term)),
      );
      setFilteredLedgers(filtered);
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, ledgers]);

  // Close dropdown when clicking outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isLedgerDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      isLedgerDropdownOpen &&
      ledgerHighlightedIndex >= 0 &&
      ledgerListRef.current
    ) {
      const container = ledgerListRef.current;
      const item = ledgerItemRefs.current[ledgerHighlightedIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [ledgerHighlightedIndex, isLedgerDropdownOpen]);

  // Ledger keyboard handlers
  const handleLedgerKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
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

  const handleLedgerSelect = (ledger) => {
    onChange(index, {
      Lg_Id: ledger.Lg_Id?.toString(),
      Bh_Id: ledger.budget_head?.Bh_Id?.toString() || null,
    });

    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);

    setTimeout(() => {
      if (slNameRefs.current && slNameRefs.current[index]) {
        slNameRefs.current[index].focus();
      }
    }, 100);
  };

  const getSelectedLedgerDisplay = () => {
    if (!detail.Lg_Id) return "";

    const selected = ledgers.find((l) => l.Lg_Id == parseInt(detail.Lg_Id));

    if (!selected) {
      return `Ledger ID: ${detail.Lg_Id}`;
    }

    let displayText = selected.Lg_Name || "";
    if (selected.Lg_Eng_Name && selected.Lg_Eng_Name != selected.Lg_Name) {
      displayText += ` (${selected.Lg_Eng_Name})`;
    }
    if (selected.Lg_Code) {
      displayText += ` - ${selected.Lg_Code}`;
    }

    return displayText;
  };

  const renderLedgerItem = (ledger) => {
    const hasBudget = ledger.budget_head && ledger.budget_head.Bh_Id;
    const isExpense = ledger.budget_head && ledger.budget_head.Gr_Exp != "Y";

    return (
      <div className="py-1">
        <div className="font-medium text-gray-900">
          {ledger.Lg_Name || "No Name"}
        </div>
        {ledger.Lg_Eng_Name && (
          <div className="text-xs text-gray-600 mt-0.5">
            {ledger.Lg_Eng_Name}
          </div>
        )}
        {ledger.Lg_Code && (
          <div className="text-xs text-gray-500 mt-1">
            <span className="bg-gray-100 px-1.5 py-0.5 rounded">
              {ledger.Lg_Code}
            </span>
          </div>
        )}
        {hasBudget && (
          <div className="text-xs mt-1">
            <span
              className={`px-1.5 py-0.5 rounded ${isExpense ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {ledger.budget_head.Gr_Nm || "Budget Head"}
            </span>
          </div>
        )}
        {!hasBudget && <div className="text-xs text-red-500 mt-1"></div>}
      </div>
    );
  };

  const showChequeFields = detail.Py_Mode == "Cheque" || detail.Py_Mode == "DD";
  const showBankFields =
    detail.Py_Mode == "Bank" ||
    detail.Py_Mode == "Online" ||
    detail.Py_Mode == "Card";

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Challan Detail #{index + 1}
        </h4>
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Remove this row"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Row 1: Ledger, Party Name, GST No, Amount */}
      <div className="flex flex-wrap items-start gap-4 mb-4">
        {/* Ledger Dropdown */}
        <div ref={ledgerDropdownRef} className="relative flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ledger Account *
          </label>
          <div className="relative">
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
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
            >
              {detail.Lg_Id ? (
                <span className="text-gray-900 truncate block">
                  {getSelectedLedgerDisplay()}
                </span>
              ) : (
                <span className="text-gray-500">Select Ledger Account</span>
              )}
            </button>
            {loadingLedgers ? (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <button
                type="button"
                onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
            {errors[`ChallanDetail_${index}_Lg_Id`] && (
              <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>

          {/* Dropdown Menu */}
          {isLedgerDropdownOpen && (
            <div
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-2xl"
              style={{ minWidth: "320px" }}
            >
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={ledgerSearchRef}
                    type="text"
                    value={ledgerSearchTerm}
                    onChange={(e) => setLedgerSearchTerm(e.target.value)}
                    onKeyDown={handleLedgerSearchKeyDown}
                    placeholder="Search by name, code..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    autoFocus
                  />
                  {ledgerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setLedgerSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
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
                      onKeyDown={(e) => handleLedgerItemKeyDown(e, ledger, idx)}
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
                    <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p>No ledgers found</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{filteredLedgers.length} items found</span>
                </div>
              </div>
            </div>
          )}

          {errors[`ChallanDetail_${index}_Lg_Id`] && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors[`ChallanDetail_${index}_Lg_Id`]}
            </p>
          )}
        </div>

        {/* Party Name */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Party Name
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={(el) => {
                if (slNameRefs.current) slNameRefs.current[index] = el;
              }}
              type="text"
              value={detail.SL_Nm || ""}
              onChange={(e) => onChange(index, "SL_Nm", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (gstNoRefs.current && gstNoRefs.current[index]) {
                    gstNoRefs.current[index].focus();
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter party name"
            />
          </div>
        </div>

        {/* GST No */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GST No.
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={(el) => {
                if (gstNoRefs.current) gstNoRefs.current[index] = el;
              }}
              type="text"
              value={detail.GST_No || ""}
              onChange={(e) => onChange(index, "GST_No", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (amountRefs.current[index]) {
                    amountRefs.current[index].focus();
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              placeholder="Enter GST Number"
            />
          </div>
        </div>

        {/* Amount */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹) *
          </label>
          <div className="relative">
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
                if (value == "" || /^\d*\.?\d*$/.test(value)) {
                  onChange(index, "Amount", value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (pyModeRefs.current[index]) {
                    pyModeRefs.current[index].focus();
                  }
                }
              }}
              className={`w-full pl-6 pr-4 py-2.5 border ${
                errors[`ChallanDetail_${index}_Amount`]
                  ? "border-red-300"
                  : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Amount"
            />
            {errors[`ChallanDetail_${index}_Amount`] && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Payment Mode, File No, Remarks */}
      <div className="flex flex-wrap items-start gap-4 mb-4">
        {/* Payment Mode */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Mode *
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <select
              ref={(el) => {
                if (pyModeRefs.current) pyModeRefs.current[index] = el;
              }}
              value={detail.Py_Mode || ""}
              onChange={(e) => onChange(index, "Py_Mode", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (fileNoRefs.current[index]) {
                    fileNoRefs.current[index].focus();
                  }
                }
              }}
              className={`w-full pl-10 pr-4 py-2.5 border ${
                errors[`ChallanDetail_${index}_Py_Mode`]
                  ? "border-red-300"
                  : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
            >
              <option value="">Select</option>
              {paymentModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* File No */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File No.
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={(el) => {
                if (fileNoRefs.current) fileNoRefs.current[index] = el;
              }}
              type="text"
              value={detail.FileNo || ""}
              onChange={(e) => onChange(index, "FileNo", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (remarksRefs.current[index]) {
                    remarksRefs.current[index].focus();
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="File No."
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={(el) => {
                if (remarksRefs.current) remarksRefs.current[index] = el;
              }}
              type="text"
              value={detail.Remarks || ""}
              onChange={(e) => onChange(index, "Remarks", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (showChequeFields || showBankFields) {
                    if (chqDateRefs.current[index]) {
                      chqDateRefs.current[index].focus();
                    }
                  } else if (index + 1 < ledgerRefs.current.length) {
                    setTimeout(() => {
                      if (ledgerRefs.current[index + 1]) {
                        ledgerRefs.current[index + 1].focus();
                      }
                    }, 100);
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Remarks"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Cheque/DD Fields */}
      {showChequeFields && (
        <div className="flex flex-wrap items-start gap-4 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-700 flex items-center">
            <Banknote className="h-4 w-4 mr-2" />
            Cheque/DD Details
          </div>

          {/* Bank Name — first, required for Cheque */}
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => {
                if (bankNameRefs.current) bankNameRefs.current[index] = el;
              }}
              type="text"
              value={detail.Bank_Name || ""}
              onChange={(e) => onChange(index, "Bank_Name", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (chqNoRefs.current && chqNoRefs.current[index]) {
                    chqNoRefs.current[index].focus();
                  }
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors[`ChallanDetail_${index}_Bank_Name`]
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Bank Name"
            />
            {errors[`ChallanDetail_${index}_Bank_Name`] && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors[`ChallanDetail_${index}_Bank_Name`]}
              </p>
            )}
          </div>

          {/* Cheque/DD No. */}
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cheque/DD No.
            </label>
            <input
              ref={(el) => {
                if (chqNoRefs.current) chqNoRefs.current[index] = el;
              }}
              type="text"
              value={detail.Chq_No || ""}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                onChange(index, "Chq_No", digitsOnly);
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (chqDateRefs.current[index]) {
                    chqDateRefs.current[index].focus();
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter only numbers"
            />
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cheque/DD Date
            </label>
            <input
              ref={(el) => {
                if (chqDateRefs.current) chqDateRefs.current[index] = el;
              }}
              type="date"
              value={detail.Chq_Date || ""}
              onChange={(e) => onChange(index, "Chq_Date", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (recDateRefs.current[index]) {
                    recDateRefs.current[index].focus();
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Receipt Date
            </label>
            <input
              ref={(el) => {
                if (recDateRefs.current) recDateRefs.current[index] = el;
              }}
              type="date"
              value={detail.Rec_Date || ""}
              onChange={(e) => onChange(index, "Rec_Date", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (index + 1 < ledgerRefs.current.length) {
                    setTimeout(() => {
                      if (ledgerRefs.current[index + 1]) {
                        ledgerRefs.current[index + 1].focus();
                      }
                    }, 100);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Row 4: Bank Transfer Fields */}
      {showBankFields && (
        <div className="flex flex-wrap items-start gap-4 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-700 flex items-center">
            <Landmark className="h-4 w-4 mr-2" />
            Bank Transfer Details
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => {
                if (bankNameRefs.current) bankNameRefs.current[index] = el;
              }}
              type="text"
              value={detail.Bank_Name || ""}
              onChange={(e) => onChange(index, "Bank_Name", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (accNoRefs.current && accNoRefs.current[index]) {
                    accNoRefs.current[index].focus();
                  }
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors[`ChallanDetail_${index}_Bank_Name`]
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Bank Name"
            />
            {errors[`ChallanDetail_${index}_Bank_Name`] && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors[`ChallanDetail_${index}_Bank_Name`]}
              </p>
            )}
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Account No.
            </label>
            <input
              ref={(el) => {
                if (accNoRefs.current) accNoRefs.current[index] = el;
              }}
              type="text"
              value={detail.Acc_No || ""}
              onChange={(e) => onChange(index, "Acc_No", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (ifscRefs.current[index]) {
                    ifscRefs.current[index].focus();
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Account No."
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              IFSC Code
            </label>
            <input
              ref={(el) => {
                if (ifscRefs.current) ifscRefs.current[index] = el;
              }}
              type="text"
              value={detail.IFSC_Code || ""}
              onChange={(e) =>
                onChange(index, "IFSC_Code", e.target.value.toUpperCase())
              }
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (recDateRefs.current[index]) {
                    recDateRefs.current[index].focus();
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="IFSC Code"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Receipt Date
            </label>
            <input
              ref={(el) => {
                if (recDateRefs.current) recDateRefs.current[index] = el;
              }}
              type="date"
              value={detail.Rec_Date || ""}
              onChange={(e) => onChange(index, "Rec_Date", e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  if (index + 1 < ledgerRefs.current.length) {
                    setTimeout(() => {
                      if (ledgerRefs.current[index + 1]) {
                        ledgerRefs.current[index + 1].focus();
                      }
                    }, 100);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {errors[`ChallanDetail_${index}_Py_Mode`] && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errors[`ChallanDetail_${index}_Py_Mode`]}
        </p>
      )}
      {errors[`ChallanDetail_${index}_Amount`] && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errors[`ChallanDetail_${index}_Amount`]}
        </p>
      )}
    </div>
  );
};

// =========  TAX CALCULATION CARD COMPONENT ==========
const TaxCalculationCard = ({
  taxCalculation,
  loading,
  totalAmount,
  onTaxAmountChange,
  isEditMode,
  manualAmounts,
}) => {
  const [localAmounts, setLocalAmounts] = useState({});

  const isManualFormula = (formula) => {
    if (!formula) return false;
    const trimmed = formula.trim();
    return trimmed == "*" || trimmed == "* " || trimmed == " *";
  };

  useEffect(() => {
    if (
      taxCalculation &&
      taxCalculation.taxBreakdown &&
      taxCalculation.taxBreakdown.length > 0
    ) {
      const initialAmounts = {};
      taxCalculation.taxBreakdown.forEach((tax, index) => {
        const isManual = isManualFormula(tax.formula);
        if (isManual) {
          const overrideKey = tax.CIP_Id;
          let amount = manualAmounts?.[overrideKey];

          if (amount == undefined) {
            amount = tax.calculatedAmount;
          }

          initialAmounts[index] =
            amount != undefined && amount != null && amount != 0
              ? amount.toString()
              : "0";
        }
      });
      setLocalAmounts(initialAmounts);
    }
  }, [taxCalculation.taxBreakdown, taxCalculation, manualAmounts]);

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

  if (
    !taxCalculation ||
    !taxCalculation.taxBreakdown ||
    taxCalculation.taxBreakdown.length == 0
  ) {
    return null;
  }

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleInputChange = (index, value) => {
    if (value == "" || /^\d*\.?\d*$/.test(value)) {
      setLocalAmounts((prev) => ({ ...prev, [index]: value }));

      const newAmount = parseFloat(value);
      if (!isNaN(newAmount) && newAmount >= 0) {
        if (onTaxAmountChange) {
          onTaxAmountChange(index, newAmount);
        }
      } else if (value == "") {
        if (onTaxAmountChange) {
          onTaxAmountChange(index, 0);
        }
      }
    }
  };

  const handleBlur = (index, value) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      numValue = 0;
    }
    setLocalAmounts((prev) => ({ ...prev, [index]: numValue.toFixed(2) }));
    if (onTaxAmountChange) {
      onTaxAmountChange(index, numValue);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
            <Calculator className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tax Calculation
            </h2>
            <p className="text-sm text-gray-600">
              {taxCalculation.taxBreakdown.some((t) =>
                isManualFormula(t.formula),
              )
                ? "Manual tax entry mode (Enter amounts directly)"
                : "Formula-based tax calculation"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {/* Total Amount */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-700 font-medium">Total Amount</span>
            <div className="text-right font-medium text-gray-900">
              {formatAmount(totalAmount)}
            </div>
          </div>

          {/* Tax Breakdown */}
          {taxCalculation.taxBreakdown.map((tax, index) => {
            const isManual = isManualFormula(tax.formula);
            const currentValue =
              localAmounts[index] != undefined
                ? localAmounts[index]
                : tax.calculatedAmount?.toString() || "0";

            return (
              <div
                key={index}
                className={`flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-3 ${
                  isManual ? "bg-yellow-50/30" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {tax.isAdd ? (
                        <PlusIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <MinusIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <Percent className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 font-medium">
                          {tax.displayText}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            tax.isAdd
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tax.isAdd ? "Add" : "Deduct"}
                        </span>
                        {isManual && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                            Manual Entry
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4 min-w-[140px]">
                  {isManual ? (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-gray-500 text-sm font-medium">
                        {tax.isAdd ? "+" : "-"}
                      </span>
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onBlur={(e) => handleBlur(index, e.target.value)}
                        className="w-32 px-3 py-1.5 text-right border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <div
                      className={`text-lg font-semibold ${tax.isAdd ? "text-green-600" : "text-red-600"}`}
                    >
                      {tax.isAdd ? "+" : "-"}
                      {formatAmount(tax.calculatedAmount)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Total Additions */}
          {taxCalculation.totalAdd > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700 font-medium">Total Additions</span>
              <div className="text-right font-semibold text-green-600">
                +{formatAmount(taxCalculation.totalAdd)}
              </div>
            </div>
          )}

          {/* Total Deductions */}
          {taxCalculation.totalLess > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700 font-medium">
                Total Deductions
              </span>
              <div className="text-right font-semibold text-red-600">
                -{formatAmount(taxCalculation.totalLess)}
              </div>
            </div>
          )}

          {/* Net Amount */}
          <div className="flex items-center justify-between py-4 mt-4 bg-gradient-to-r from-green-50 to-white rounded-lg px-4 border border-green-100">
            <div>
              <span className="text-lg font-bold text-gray-900">
                Net Payable Amount
              </span>
              <div className="text-xs text-gray-600 mt-1">
                Total amount after tax adjustments
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {formatAmount(taxCalculation.netAmount)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Final payment amount
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========  MAIN COMPONENT ==========
const AddEditNewChallanUpdate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [loadingTaxParameters, setLoadingTaxParameters] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [genVoucherConfig, setGenVoucherConfig] = useState(null);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState({
    total: 0,
    cash: 0,
    bank: 0,
    cheque: 0,
    dd: 0,
    online: 0,
    card: 0,
  });
  const [manualTaxAmounts, setManualTaxAmounts] = useState({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const userId = (() => {
    // Try from component props
    if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
    if (user?.Usr_Id) return user.Usr_Id;
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch(e) {}
    }
    
    // Try from sessionStorage
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      try {
        const userData = JSON.parse(sessionUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch(e) {}
    }
    
    // Try from direct localStorage key

    const storedUserId = localStorage.getItem('menu_details');
    if (storedUserId) return parseInt(storedUserId);
    
    return null;
  })();

  const currentModule = (() => {
    var cModule;

    try {
      const menuDetails = JSON.parse(localStorage.getItem('menu_details'));
      for(var i=0; i<menuDetails.length;i++){
      if(menuDetails[i].Menu_Links == "/transactions/bookkeeping-vouchers/new-challan-update"){
          cModule = menuDetails[i].Mod_Code
      }
    }

    if(cModule){
      return cModule;
    }
    else{
      return "";
    }
      
      
      
    } catch (error) {
      return 'CHAL';
    }
  })();


  // Tax calculation states - applied on total amount
  const [challanTypeTaxParameters, setChallanTypeTaxParameters] = useState([]);
  const [taxCalculation, setTaxCalculation] = useState({
    grossAmount: 0,
    netAmount: 0,
    taxBreakdown: [],
    totalAdd: 0,
    totalLess: 0,
    totalTax: 0,
  });

  // Permission and approval states
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

  // Refs for Challan Detail rows
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
      },
    ],
  });

  const [selectedBranch, setSelectedBranch] = useState(null);

  const customRound = (value) => {
    if (value == undefined || value == null || isNaN(value)) return 0;
    const decimal = value - Math.floor(value);
    if (decimal >= 0.5) {
      return Math.ceil(value);
    }
    return Math.round(value * 100) / 100;
  };

  const formatAmountForAPI = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return 0;
    const roundedAmount = customRound(amount);
    return parseFloat(roundedAmount.toFixed(2));
  };

  const isManualFormula = (formula) => {
    if (!formula) return false;
    const trimmed = formula.trim();
    return trimmed == "*" || trimmed == "* " || trimmed == " *";
  };

  // Calculate taxes for total amount using tax parameters
  const calculateTaxes = (totalAmount, taxParams, manualOverrides = {}) => {
    if (
      !totalAmount ||
      totalAmount <= 0 ||
      !taxParams ||
      taxParams.length == 0
    ) {
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
      setFormData((prev) => ({ ...prev, Net_Amount: "0" }));
      setManualTaxAmounts({});
      return;
    }

    const taxBreakdown = [];
    let totalAdd = 0;
    let totalLess = 0;
    let runningAmount = totalAmount;
    const calculatedTaxAmounts = { GROS: totalAmount };

    const roundHalfUp = (num) => Math.round(num * 100) / 100;

    taxParams.forEach((param, idx) => {
      let taxAmount = 0;
      const taxPercentage = parseFloat(param.Percent) || 0;
      const taxType = param.invoice_charge?.IC_Code || param.IC_Code;
      const isAdd =
        param.Add_Dedu == "Add" || param.Add_Dedu == 1 || param.Add_Dedu == "1";
      const formula = String(param.Formula || "").toUpperCase();
      const isManual = isManualFormula(formula);
      const overrideKey = param.CIP_Id;

      if (isManual && manualOverrides[overrideKey] != undefined) {
        taxAmount = parseFloat(manualOverrides[overrideKey]) || 0;
      } else if (isManual) {
        taxAmount = 0;
      } else if (formula && formula != "*") {
        try {
          let expression = formula;
          expression = expression.replace(
            /\b([A-Z]{2,})\b/g,
            (match, varName) => {
              if (varName == "GROS") {
                return totalAmount.toString();
              }
              const value = calculatedTaxAmounts[varName];
              if (value != undefined && value != null) {
                return value.toString();
              }
              return match;
            },
          );

          const originalVars = formula.match(/\b([A-Z]{2,})\b/g) || [];
          const unresolvedVars = originalVars.filter(
            (v) => !(v in calculatedTaxAmounts) && v != "GROS",
          );
          if (unresolvedVars.length > 0 && taxPercentage > 0) {
            unresolvedVars.forEach((varName) => {
              const regex = new RegExp(`\\b${varName}\\b`, "g");
              expression = expression.replace(regex, taxPercentage.toString());
            });
          }

          expression = expression
            .replace(/undefined/g, "0")
            .replace(/null/g, "0")
            .replace(/[^0-9+\-*/().% ]/g, "");

          let evaluatedResult;
          try {
            evaluatedResult = new Function(
              '"use strict"; return (' + expression + ")",
            )();
          } catch {
            evaluatedResult = eval(expression);
          }

          taxAmount = parseFloat(evaluatedResult) || 0;
        } catch (error) {
          console.error(`Error calculating tax for ${taxType}:`, error);
          taxAmount = (totalAmount * taxPercentage) / 100;
        }
      } else {
        taxAmount = (totalAmount * taxPercentage) / 100;
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

      runningAmount = roundHalfUp(runningAmount);

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

    const newTaxCalc = {
      grossAmount: roundHalfUp(totalAmount),
      netAmount,
      taxBreakdown,
      totalAdd: roundHalfUp(totalAdd),
      totalLess: roundHalfUp(totalLess),
      totalTax: roundHalfUp(totalAdd - totalLess),
    };

    setTaxCalculation(newTaxCalc);
    setFormData((prev) => ({ ...prev, Net_Amount: netAmount.toString() }));
  };

  const handleTaxAmountChange = (taxIndex, newAmount) => {
    const tax = taxCalculation.taxBreakdown[taxIndex];
    if (!tax || !tax.isManual) return;

    const overrideKey = tax.CIP_Id;
    const newManualOverrides = {
      ...manualTaxAmounts,
      [overrideKey]: newAmount,
    };
    setManualTaxAmounts(newManualOverrides);

    calculateTaxes(summary.total, challanTypeTaxParameters, newManualOverrides);
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
        await newChallanVoucherApi.getTaxParametersByChallanType(challanTypeId);

      if (response.success && response.data && response.data.length > 0) {
        const taxData = response.data[0];
        const parameters = taxData.parameters || [];

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

        if (!isEditMode && summary.total > 0) {
          setManualTaxAmounts({});
          calculateTaxes(summary.total, processedParams, {});
        }
      } else {
        setChallanTypeTaxParameters([]);
        toast.info("No tax parameters found for this challan type");
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

      if (
        currentMenuItem &&
        currentMenuItem.action &&
        currentMenuItem.action.stage
      ) {
        const stage = currentMenuItem.action.stage;
        setCurrentStage(stage);
        await loadActionsForStage(stage);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  };

  const loadActionsForStage = async (stage) => {
    if (!stage) return;

    try {
      const response = await newChallanVoucherApi.getAllByStage(stage);

      if (response.status && response.data) {
        const actions = response.data;
        setActionsList(actions);

        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
        }

        if (!isAdmin && userDesignationId) {
          const hasPermission = actions.some((action) => {
            const isAuthority = action.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
            );
            return isAuthority && !action.Previous_Status;
          });

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
    const newSummary = newChallanVoucherApi.calculateSummary(
      formData.Challan_Detail,
    );
    setSummary(newSummary);
    setFormData((prev) => ({
      ...prev,
      Total_Amount: newSummary.total.toString(),
    }));
  }, [formData.Challan_Detail]);

  useEffect(() => {
    if (
      !isEditMode &&
      dropdownData.challanTypes.length > 0 &&
      !formData.CV_Ty
    ) {
      const generalWork = dropdownData.challanTypes.find(
        (type) => type.Cht_Name == "General Work" || type.Cht_Id == 9,
      );
      if (generalWork) {
        setFormData((prev) => ({
          ...prev,
          CV_Ty: generalWork.Cht_Id?.toString(),
        }));
      }
    }
  }, [dropdownData.challanTypes, isEditMode, formData.CV_Ty]);

  useEffect(() => {
    if (challanTypeTaxParameters.length > 0 && summary.total > 0) {
      calculateTaxes(summary.total, challanTypeTaxParameters, manualTaxAmounts);
    } else if (challanTypeTaxParameters.length == 0 && !isEditMode) {
      setTaxCalculation({
        grossAmount: summary.total,
        netAmount: summary.total,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
    }
  }, [summary.total, challanTypeTaxParameters, manualTaxAmounts]);

  useEffect(() => {
    if (taxCalculation.netAmount > 0) {
      setFormData((prev) => ({
        ...prev,
        Net_Amount: taxCalculation.netAmount.toString(),
      }));
    }
  }, [taxCalculation.netAmount]);

  const buildBranchTree = (branches) => {
    const map = {};
    const roots = [];

    branches.forEach((branch) => {
      map[branch.Dpt_id] = {
        ...branch,
        children: [],
        Dpt_id: branch.Dpt_id,
        Dpt_Name: branch.Dpt_Name,
        Dpt_Desc: branch.Dpt_Desc,
        GrStt: branch.GrStt,
        GrCod: branch.GrCod,
        UpGrp: branch.UpGrp,
      };
    });

    branches.forEach((branch) => {
      const branchId = branch.Dpt_id;
      const upGroup = branch.UpGrp;
      const currentBranch = map[branchId];

      if (currentBranch && upGroup && map[upGroup] && upGroup != branchId) {
        map[upGroup].children.push(currentBranch);
      } else if (currentBranch) {
        roots.push(currentBranch);
      }
    });

    return roots;
  };

  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, treeLevel: level });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const menuItem = menuDetails.find(
        (m) => m.Menu_Links == "/transactions/bookkeeping-vouchers/new-challan-update"
      );
      const gvnNo = menuItem?.gvn_no ?? menuItem?.gen_voucher_no?.gvn_no;
      if (gvnNo) {
        fetch(`${import.meta.env.VITE_API_URL}/gen-voucher/${gvnNo}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`          
          },
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.success && json.data) {
              setGenVoucherConfig(json.data);
            }
          })
          .catch((e) => console.error("Failed to fetch gen voucher config:", e));
      }
    } catch (e) {
      console.error("Error reading gvn_no from menu_details:", e);
    }

    axios.get(`${import.meta.env.VITE_API_URL}/fy-master`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` },
    })
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          const currentFY = res.data.data.find((fy) => fy.is_current_year == true)
            || res.data.data[0];
          if (currentFY) setCurrentFinancialYear(currentFY);
        }
      })
      .catch((e) => console.error("Failed to fetch financial year:", e));

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  useEffect(() => {
    if (
      isEditMode &&
      taxCalculation.taxBreakdown &&
      taxCalculation.taxBreakdown.length > 0
    ) {
      return;
    }

    const loadTaxParams = async () => {
      if (formData.CV_Ty) {
        await loadTaxParametersForChallanType(formData.CV_Ty);
      } else {
        setChallanTypeTaxParameters([]);
        setTaxCalculation({
          grossAmount: 0,
          netAmount: 0,
          taxBreakdown: [],
          totalAdd: 0,
          totalLess: 0,
          totalTax: 0,
        });
      }
    };

    loadTaxParams();
  }, [formData.CV_Ty, isEditMode]);

  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  useEffect(() => {
    if (isBranchDropdownOpen && branchSearchRef.current) {
      setTimeout(() => branchSearchRef.current.focus(), 0);
    }
  }, [isBranchDropdownOpen]);

  useEffect(() => {
    if (isChallanTypeDropdownOpen && challanTypeSearchRef.current) {
      setTimeout(() => challanTypeSearchRef.current.focus(), 0);
    }
  }, [isChallanTypeDropdownOpen]);

  const scrollIntoView = (listRef, itemRefs, highlightedIndex, isOpen) => {
    if (isOpen && highlightedIndex >= 0 && listRef) {
      const container = listRef.current;
      const item = itemRefs.current[highlightedIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  };

  useEffect(() => {
    scrollIntoView(
      branchListRef,
      branchItemRefs,
      branchHighlightedIndex,
      isBranchDropdownOpen,
    );
  }, [branchHighlightedIndex, isBranchDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      challanTypeListRef,
      challanTypeItemRefs,
      challanTypeHighlightedIndex,
      isChallanTypeDropdownOpen,
    );
  }, [challanTypeHighlightedIndex, isChallanTypeDropdownOpen]);

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
      const filtered = flattened.filter(
        (branch) =>
          (branch.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (branch.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (branch.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredBranches(filtered);
    }
    setBranchHighlightedIndex(-1);
  }, [branchSearchTerm, dropdownData.branches]);

  useEffect(() => {
    if (!challanTypeSearchTerm.trim()) {
      setFilteredChallanTypes(dropdownData.challanTypes);
    } else {
      const term = challanTypeSearchTerm.toLowerCase();
      const filtered = dropdownData.challanTypes.filter(
        (type) =>
          type.Cht_Name?.toLowerCase().includes(term) ||
          type.Cht_Code?.toLowerCase().includes(term),
      );
      setFilteredChallanTypes(filtered);
    }
    setChallanTypeHighlightedIndex(-1);
  }, [challanTypeSearchTerm, dropdownData.challanTypes]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [branches, allLedgers, challanTypes, paymentModes] =
        await Promise.all([
          newChallanVoucherApi.getBranches(),
          newChallanVoucherApi.getAllLedgers(),
          newChallanVoucherApi.getChallanTypes(),
          newChallanVoucherApi.getPaymentModes(),
        ]);

      const filterBranches = [];
      for (const branch of branches) {
        if (
          user.departmentData != null &&
          user.departmentData.Dpt_id != null &&
          branch.Dpt_id == user.departmentData.Dpt_id
        ) {
          filterBranches.push(branch);
        }
      }
      if (filterBranches.length == 0) {
        for (const branch of branches) {
          filterBranches.push(branch);
        }
      }

      let ledgersToUse = allLedgers;

      ledgersToUse = allLedgers.filter(
        (ledger) => ledger.ledger_group && ledger.ledger_group.Gr_Buk == "N",
      );

      setDropdownData((prev) => ({
        ...prev,
        branches: filterBranches || [],
        ledgers: ledgersToUse,
        challanTypes: challanTypes || [],
        paymentModes: paymentModes || [],
      }));
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    if (!isEditMode && selectedBranch && !formData.CV_No) {
      fetchNextCVNo(selectedBranch.Dpt_id);
    }
  }, [selectedBranch, isEditMode, genVoucherConfig, currentFinancialYear]);

  const generateCVNo = (branch) => {
    if (!branch) return "";

    if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
      // Serial is fetched from API in fetchNextCVNo — this path
      // is only reached if the API call failed, so show a placeholder.
      const c        = genVoucherConfig;
      const fyCode   = currentFinancialYear?.FY_Code || "2026-27";
      const deptCode = branch.Dpt_Desc || branch.Dpt_id?.toString() || "";
      const serial   = "????";

      const segs = [];
      if (c.prifix)                  segs.push({ v: c.prifix,   sep: c.prifix_dev_type || c.dev_type || "/" });
      if (c.Dept == "Y" && deptCode) segs.push({ v: deptCode,   sep: c.dept_dev_type   || c.dev_type || "/" });
      if (c.Text)                    segs.push({ v: c.Text,      sep: c.text_dev_type   || c.dev_type || "/" });
      segs.push(                                 { v: serial,    sep: c.no_dev_type     || c.dev_type || "/" });
      if (c.FY == "Y")               segs.push({ v: fyCode,     sep: null });

      return segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join("");
    }

    return newChallanVoucherApi.generateVoucherNumber(branch, []);
  };

 
  const fetchNextCVNo = async (deptId) => {
    if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
      try {
        const params = new URLSearchParams({ is_income: "Y" });
        if (genVoucherConfig.No == "Dept_Series" && deptId) params.append("dept_id", deptId);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/new-chl-voucher/next-vou-no/data/by-cv-no?${params}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
            },
          }
        );

        if (res.data.success && res.data.next_cv_no != null) {
          const c        = genVoucherConfig;
          const fyCode   = currentFinancialYear?.FY_Code || "2026-27";
          const serial   = String(res.data.next_cv_no);
          const deptCode = selectedBranch?.Dpt_Desc || selectedBranch?.Dpt_id?.toString() || "";

          const segs = [];
          if (c.prifix)                  segs.push({ v: c.prifix,   sep: c.prifix_dev_type || c.dev_type || "/" });
          if (c.Dept == "Y" && deptCode) segs.push({ v: deptCode,   sep: c.dept_dev_type   || c.dev_type || "/" });
          if (c.Text)                    segs.push({ v: c.Text,      sep: c.text_dev_type   || c.dev_type || "/" });
          segs.push(                                 { v: serial,    sep: c.no_dev_type     || c.dev_type || "/" });
          if (c.FY == "Y")               segs.push({ v: fyCode,     sep: null });

          const cvNo = segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join("");
          setFormData((prev) => ({ ...prev, CV_No: cvNo }));
          return;
        }
      } catch (err) {
        console.error("Failed to fetch next CV No:", err);
      }
    }

    setFormData((prev) => ({ ...prev, CV_No: generateCVNo(selectedBranch) }));
  };

  const handleDownloadSample = () => {
    downloadSampleTemplate();
  };

  const handleExport = () => {
    if (formData.Challan_Detail.length == 0) {
      toast.error("No data to export");
      return;
    }
    exportToExcel(formData.Challan_Detail, dropdownData.ledgers);
    toast.success("Exported successfully!");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension)) {
      toast.error("Please upload an Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    setImporting(true);
    try {
      const result = await parseExcelToChallanDetails(
        file,
        dropdownData.ledgers,
      );

      if (result && result.length > 0) {
        const importedDetails = result.map((detail, idx) => ({
          ...detail,
          CV_Sr: idx + 1,
        }));

        setFormData((prev) => ({
          ...prev,
          Challan_Detail: importedDetails,
        }));

        toast.success(
          `Successfully imported ${result.length} challan detail(s)!`,
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      if (error.errors && error.errors.length > 0) {
        const warningMessage = error.errors.slice(0, 5).join("\n");
        if (error.errors.length > 5) {
          toast.error(
            `Import completed with ${error.errors.length} warnings:\n${warningMessage}\n... and ${error.errors.length - 5} more warnings`,
            { duration: 8000 },
          );
        } else {
          toast.error(`Import completed with warnings:\n${warningMessage}`, {
            duration: 8000,
          });
        }

        if (error.partialData && error.partialData.length > 0) {
          const partialDetails = error.partialData.map((detail, idx) => ({
            ...detail,
            CV_Sr: idx + 1,
          }));
          setFormData((prev) => ({
            ...prev,
            Challan_Detail: partialDetails,
          }));
          toast.info(
            `Loaded ${partialDetails.length} records. Missing ledger information can be manually selected from the form.`,
            { duration: 5000 },
          );
        }
      } else {
        toast.error(error.errors?.[0] || "Failed to import file");
      }
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const challanResponse = await newChallanVoucherApi.getById(id);
      const voucherData =
        challanResponse.data && challanResponse.data[0]
          ? challanResponse.data[0]
          : challanResponse;

      let paymentData = null;
      if (voucherData?.CV_No) {
        try {
          const paymentResponse =
            await newChallanVoucherApi.getPaymentVoucherByPVNo(voucherData.CV_No);
          if (paymentResponse.success && paymentResponse.data) {
            paymentData = paymentResponse.data;
          }
        } catch (error) {
          console.error("Error loading payment voucher:", error);
        }
      }

      const allLedgers = await newChallanVoucherApi.getAllLedgers();
      const ledgersToUse = allLedgers.filter(
        (ledger) => ledger.ledger_group && ledger.ledger_group.Gr_Buk == "N",
      );

      setDropdownData((prev) => ({
        ...prev,
        ledgers: ledgersToUse,
      }));

      const newFormData = {
        Ch_Date: voucherData?.Ch_Date
          ? new Date(voucherData.Ch_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        CV_No: voucherData?.CV_No || "",
        Dpt_Id: voucherData?.department?.Dpt_id?.toString() || "",
        CV_Ty: voucherData?.challan_type?.Cht_Id?.toString() || "",
        Total_Amount:
          voucherData?.Total_Amount?.toString() ||
          paymentData?.Gross_Amt?.toString() ||
          "",
        Net_Amount:
          voucherData?.Net_Amount?.toString() ||
          paymentData?.Net_Amt?.toString() ||
          "",
        Challan_Detail: (voucherData?.details || []).map((detail, idx) => ({
          CV_Sr: idx + 1,
          Lg_Id: detail.Lg_Id?.toString() || "",
          Bh_Id: detail.Bh_Id?.toString() || "",
          SL_Nm: detail.SL_Nm || "",
          GST_No: detail.GST_No || "",
          Amount: detail.Amount?.toString() || "",
          Py_Mode: detail.Payment_Mode || "",
          FileNo: detail.FileNo || "",
          Remarks: detail.Remarks || "",
          Chq_Date: detail.Chq_Date || "",
          IFSC_Code: detail.IFSC_Code || "",
          Acc_No: detail.Acc_No?.toString() || "",
          Chq_No: detail.Chq_No?.toString() || "",
          Rec_Date: detail.Rec_Date || "",
          Bank_Name: detail.Bank_Name || "",
        })),
      };

      if (voucherData?.department) {
        setSelectedBranch(voucherData.department);
      }

      setFormData(newFormData);

      const calcSummary = newChallanVoucherApi.calculateSummary(
        newFormData.Challan_Detail,
      );
      setSummary(calcSummary);

      if (voucherData?.challan_type?.Cht_Id) {
        setLoadingTaxParameters(true);
        try {
          const response =
            await newChallanVoucherApi.getTaxParametersByChallanType(voucherData.challan_type.Cht_Id);

          let processedParams = [];
          if (response.success && response.data && response.data.length > 0) {
            const taxData = response.data[0];
            const parameters = taxData.parameters || [];

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

          if (
            paymentData &&
            paymentData.pay_details &&
            paymentData.pay_details.length > 0
          ) {
            const manualOverridesFromPayment = {};
            const taxBreakdownItems = [];
            let totalAdd = 0;
            let totalLess = 0;
            let runningAmount = calcSummary.total;

            paymentData.pay_details
              .filter((detail) => detail.PD_Ty == "TAX")
              .forEach((detail) => {
                const isAdd = detail.Add_Dedu == 1 || detail.Add_Dedu == "1";
                const taxPercentage = parseFloat(detail.Percent) || 0;
                const taxAmount = parseFloat(detail.IC_Amt) || 0;
                const formula = detail.Formula || "*";
                const isManual = isManualFormula(formula);

                manualOverridesFromPayment[detail.CIP_Id] = taxAmount;

                if (isAdd) {
                  runningAmount += taxAmount;
                  totalAdd += taxAmount;
                } else {
                  runningAmount -= taxAmount;
                  totalLess += taxAmount;
                }

                taxBreakdownItems.push({
                  CIP_Id: detail.CIP_Id,
                  IC_Id: detail.IC_Id,
                  Lg_Id: detail.Lg_Id,
                  calculatedAmount: taxAmount,
                  displayText: isManual
                    ? `${detail.invoice_charge?.IC_Code || ""}`
                    : `${detail.invoice_charge?.IC_Code || ""} (${taxPercentage}%)`,
                  isAdd: isAdd,
                  isTax: true,
                  type: "tax",
                  percentage: taxPercentage,
                  formula: formula,
                  isManual: isManual,
                  Add_Dedu: isAdd ? "Add" : "Deduct",
                  Percent: taxPercentage,
                });
              });

            setManualTaxAmounts(manualOverridesFromPayment);

            setTaxCalculation({
              grossAmount: calcSummary.total,
              netAmount: runningAmount,
              taxBreakdown: taxBreakdownItems,
              totalAdd: totalAdd,
              totalLess: totalLess,
              totalTax: totalAdd - totalLess,
            });

            setFormData((prev) => ({
              ...prev,
              Net_Amount: runningAmount.toString(),
            }));
          } else if (processedParams.length > 0) {
            calculateTaxes(calcSummary.total, processedParams, {});
          } else {
            setTaxCalculation({
              grossAmount: calcSummary.total,
              netAmount: calcSummary.total,
              taxBreakdown: [],
              totalAdd: 0,
              totalLess: 0,
              totalTax: 0,
            });
          }
        } catch (error) {
          console.error("Error loading tax parameters:", error);
          toast.error("Failed to load tax parameters");
        } finally {
          setLoadingTaxParameters(false);
        }
      } else {
        setTaxCalculation({
          grossAmount: calcSummary.total,
          netAmount: calcSummary.total,
          taxBreakdown: [],
          totalAdd: 0,
          totalLess: 0,
          totalTax: 0,
        });
        setChallanTypeTaxParameters([]);
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

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleBranchKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsBranchDropdownOpen(true);
      setBranchSearchTerm("");
      setBranchHighlightedIndex(-1);
      setTimeout(() => branchSearchRef.current?.focus(), 0);
    }
  };

  const handleBranchSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredBranches.length > 0) {
        setBranchHighlightedIndex(0);
        setTimeout(() => {
          if (branchItemRefs.current[0]) {
            branchItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBranchDropdownOpen(false);
      setBranchHighlightedIndex(-1);
      setBranchSearchTerm("");
      branchButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredBranches.length > 0 && branchHighlightedIndex >= 0) {
        handleBranchSelect(filteredBranches[branchHighlightedIndex]);
      } else if (filteredBranches.length > 0) {
        handleBranchSelect(filteredBranches[0]);
      }
    }
  };

  const handleBranchItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredBranches.length) {
        setBranchHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (branchItemRefs.current[nextIndex]) {
            branchItemRefs.current[nextIndex].focus();
          }
        }, 0);
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
        const prevIndex = idx - 1;
        setBranchHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (branchItemRefs.current[prevIndex]) {
            branchItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleBranchSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBranchDropdownOpen(false);
      setBranchHighlightedIndex(-1);
      setBranchSearchTerm("");
      branchButtonRef.current?.focus();
    }
  };

  const handleBranchSelect = async (branch) => {
    const branchId = branch.Dpt_id?.toString();
    setFormData((prev) => ({
      ...prev,
      Dpt_Id: branchId,
      CV_No: "",
    }));
    setSelectedBranch(branch);
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);

    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: "" }));
    }

    if (!isEditMode) {
      fetchNextCVNo(branch.Dpt_id);
    }

    setTimeout(() => {
      if (challanTypeButtonRef.current) {
        challanTypeButtonRef.current.focus();
      }
    }, 200);
  };

  const getSelectedBranchDisplay = () => {
    if (!formData.Dpt_Id) return "";
    const selected = flattenedBranches.find(
      (branch) => branch.Dpt_id?.toString() == formData.Dpt_Id,
    );
    if (!selected) return "Selected branch not found";

    const level = parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || "No Description";
    const name = selected.Dpt_Name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  const renderBranchItem = (branch) => {
    const level = parseInt(branch.GrStt, 10) || 1;
    const desc = branch.Dpt_Desc || "No Description";
    const name = branch.Dpt_Name;

    const levelColors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
    };
    const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";

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
  };

  const handleChallanTypeKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsChallanTypeDropdownOpen(true);
      setChallanTypeSearchTerm("");
      setChallanTypeHighlightedIndex(-1);
      setTimeout(() => challanTypeSearchRef.current?.focus(), 0);
    }
  };

  const handleChallanTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredChallanTypes.length > 0) {
        setChallanTypeHighlightedIndex(0);
        setTimeout(() => {
          if (challanTypeItemRefs.current[0]) {
            challanTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsChallanTypeDropdownOpen(false);
      setChallanTypeHighlightedIndex(-1);
      setChallanTypeSearchTerm("");
      challanTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredChallanTypes.length > 0 && challanTypeHighlightedIndex >= 0) {
        handleChallanTypeSelect(
          filteredChallanTypes[challanTypeHighlightedIndex],
        );
      } else if (filteredChallanTypes.length > 0) {
        handleChallanTypeSelect(filteredChallanTypes[0]);
      }
    }
  };

  const handleChallanTypeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredChallanTypes.length) {
        setChallanTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (challanTypeItemRefs.current[nextIndex]) {
            challanTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setChallanTypeHighlightedIndex(-1);
        setTimeout(() => challanTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setChallanTypeHighlightedIndex(-1);
        setTimeout(() => challanTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setChallanTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (challanTypeItemRefs.current[prevIndex]) {
            challanTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleChallanTypeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsChallanTypeDropdownOpen(false);
      setChallanTypeHighlightedIndex(-1);
      setChallanTypeSearchTerm("");
      challanTypeButtonRef.current?.focus();
    }
  };

  const handleChallanTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      CV_Ty: type.Cht_Id?.toString(),
    }));
    setIsChallanTypeDropdownOpen(false);
    setChallanTypeSearchTerm("");
    setChallanTypeHighlightedIndex(-1);

    if (errors.CV_Ty) {
      setErrors((prev) => ({ ...prev, CV_Ty: "" }));
    }

    setTimeout(() => {
      if (ledgerRefs.current[0]) {
        ledgerRefs.current[0].focus();
      }
    }, 100);
  };

  const getSelectedChallanTypeName = () => {
    if (!formData.CV_Ty) return "";
    const selectedType = dropdownData.challanTypes.find(
      (type) => type.Cht_Id == parseInt(formData.CV_Ty),
    );
    return selectedType ? `${selectedType.Cht_Name}` : "";
  };

  const renderChallanTypeItem = (type) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{type.Cht_Name}</div>
      {type.Cht_Code && (
        <div className="text-xs text-gray-500 mt-1">Code: {type.Cht_Code}</div>
      )}
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDetailChange = (index, field, value) => {
    if (typeof field == "object") {
      const updates = field;
      const updatedDetails = [...formData.Challan_Detail];
      updatedDetails[index] = {
        ...updatedDetails[index],
        ...updates,
      };
      setFormData((prev) => ({
        ...prev,
        Challan_Detail: updatedDetails,
      }));
      Object.keys(updates).forEach((f) => {
        if (errors[`ChallanDetail_${index}_${f}`]) {
          setErrors((prev) => ({
            ...prev,
            [`ChallanDetail_${index}_${f}`]: "",
          }));
        }
      });

      const newSummary = newChallanVoucherApi.calculateSummary(updatedDetails);
      setSummary(newSummary);
      if (newSummary.total == 0) {
        setTaxCalculation({
          grossAmount: 0,
          netAmount: 0,
          taxBreakdown: [],
          totalAdd: 0,
          totalLess: 0,
          totalTax: 0,
        });
        setFormData((prev) => ({
          ...prev,
          Net_Amount: "0",
          Total_Amount: "0",
        }));
        setManualTaxAmounts({});
      } else if (challanTypeTaxParameters.length > 0) {
        calculateTaxes(
          newSummary.total,
          challanTypeTaxParameters,
          manualTaxAmounts,
        );
      }
      return;
    }

    const updatedDetails = [...formData.Challan_Detail];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      Challan_Detail: updatedDetails,
    }));

    if (errors[`ChallanDetail_${index}_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`ChallanDetail_${index}_${field}`]: "",
      }));
    }

    const newSummary = newChallanVoucherApi.calculateSummary(updatedDetails);
    setSummary(newSummary);

    if (newSummary.total == 0) {
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
      setFormData((prev) => ({ ...prev, Net_Amount: "0", Total_Amount: "0" }));
      setManualTaxAmounts({});
    } else if (challanTypeTaxParameters.length > 0 && newSummary.total > 0) {
      calculateTaxes(
        newSummary.total,
        challanTypeTaxParameters,
        manualTaxAmounts,
      );
    }
  };

  const addNewDetailRow = () => {
    const newSr = formData.Challan_Detail.length + 1;
    setFormData((prev) => ({
      ...prev,
      Challan_Detail: [
        ...prev.Challan_Detail,
        {
          CV_Sr: newSr,
          Lg_Id: "",
          Bh_Id: "",
          SL_Nm: "",
          GST_No: "",
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
        },
      ],
    }));

    setTimeout(() => {
      if (ledgerRefs.current[formData.Challan_Detail.length]) {
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

    updatedDetails.forEach((detail, i) => {
      detail.CV_Sr = i + 1;
    });

    setFormData((prev) => ({
      ...prev,
      Challan_Detail: updatedDetails,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Ch_Date) {
      newErrors.Ch_Date = "Date is required";
    }

    if (!formData.Dpt_Id) {
      newErrors.Dpt_Id = "Branch selection is required";
    }

    formData.Challan_Detail.forEach((detail, index) => {
      if (!detail.Lg_Id) {
        newErrors[`ChallanDetail_${index}_Lg_Id`] =
          "Ledger account selection is required";
      } else {
        const selectedLedger = dropdownData.ledgers.find(
          (l) => l.Lg_Id == parseInt(detail.Lg_Id),
        );
        if (!selectedLedger) {
          newErrors[`ChallanDetail_${index}_Lg_Id`] =
            "Selected ledger is not valid";
        }
      }

      if (!detail.Amount) {
        newErrors[`ChallanDetail_${index}_Amount`] = "Amount is required";
      } else if (parseFloat(detail.Amount) <= 0) {
        newErrors[`ChallanDetail_${index}_Amount`] =
          "Amount must be greater than 0";
      }
      if (!detail.Py_Mode) {
        newErrors[`ChallanDetail_${index}_Py_Mode`] =
          "Payment mode is required";
      }
      // Bank Name required for Bank and Cheque modes
      if (
        (detail.Py_Mode == "Bank" || detail.Py_Mode == "Cheque") &&
        !detail.Bank_Name?.trim()
      ) {
        newErrors[`ChallanDetail_${index}_Bank_Name`] =
          "Bank Name is required for " + detail.Py_Mode + " payment mode";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

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

    let latestCVNo = formData.CV_No;

    if (!isEditMode) {
      if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
        try {
          const params = new URLSearchParams({ is_income: "Y" });
          if (genVoucherConfig.No == "Dept_Series" && formData.Dpt_Id) {
            params.append("dept_id", formData.Dpt_Id);
          }
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/new-chl-voucher/next-vou-no/data/by-cv-no?${params}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` } }
          );
          if (res.data.success && res.data.next_cv_no != null) {
            const c        = genVoucherConfig;
            const fyCode   = currentFinancialYear?.FY_Code || "2026-27";
            const serial   = String(res.data.next_cv_no);
            const deptCode = selectedBranch?.Dpt_Desc || selectedBranch?.Dpt_id?.toString() || "";
            const segs     = [];
            if (c.prifix)                  segs.push({ v: c.prifix,   sep: c.prifix_dev_type || c.dev_type || "/" });
            if (c.Dept == "Y" && deptCode) segs.push({ v: deptCode,   sep: c.dept_dev_type   || c.dev_type || "/" });
            if (c.Text)                    segs.push({ v: c.Text,      sep: c.text_dev_type   || c.dev_type || "/" });
            segs.push(                                 { v: serial,    sep: c.no_dev_type     || c.dev_type || "/" });
            if (c.FY == "Y")               segs.push({ v: fyCode,     sep: null });
            latestCVNo = segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join("");
            setFormData((prev) => ({ ...prev, CV_No: latestCVNo }));
          }
        } catch (err) {
          console.error("Failed to re-fetch CV No before save:", err);
        }

        let countdown = 5;
        let apiDone = false;
        const swalState = { apiDone: false };
        Swal.fire({
          title: "Saving Voucher...",
          html: `Your voucher number is <strong>${latestCVNo}</strong><br/><br/>Please wait <b>${countdown}</b> second(s)...`,
          icon: "info",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            const interval = setInterval(() => {
              countdown--;
              const htmlEl = Swal.getHtmlContainer();
              if (htmlEl) {
                if (swalState.apiDone) {
                  htmlEl.innerHTML = `✅ Voucher <strong>${latestCVNo}</strong> saved!<br/><br/>Redirecting in <b>${countdown}</b> second(s)...`;
                } else {
                  htmlEl.innerHTML = `Your voucher number is <strong>${latestCVNo}</strong><br/><br/>Please wait <b>${countdown}</b> second(s)...`;
                }
              }
              if (countdown <= 0) {
                clearInterval(interval);
                Swal.close();
              }
            }, 1000);
          },
        });
        window.__challanSwalState = swalState;
      }
    }

    setSaving(true);
    try {
      const payDetails = [];

      if (
        taxCalculation.taxBreakdown &&
        taxCalculation.taxBreakdown.length > 0
      ) {
        taxCalculation.taxBreakdown.forEach((tax, idx) => {
          const taxAmount = formatAmountForAPI(tax.calculatedAmount);
          if (taxAmount == 0) {
            return;
          }
          payDetails.push({
            PD_Ty: "TAX",
            Cht_Id: formData.CV_Ty ? parseInt(formData.CV_Ty) : null,
            PVD_Sr: idx + 1,
            CIP_Id: tax.CIP_Id,
            IC_Id: tax.IC_Id,
            Lg_Id: tax.Lg_Id,
            Percent: tax.percentage,
            Formula: tax.formula || "",
            IC_Amt: formatAmountForAPI(tax.calculatedAmount),
            Add_Dedu: tax.isAdd ? 1 : 0,
          });
        });
      }

      const challanVoucherData = {
        Ch_Date: formData.Ch_Date,
        CV_No: latestCVNo,
        Dpt_Id: formData.Dpt_Id ? parseInt(formData.Dpt_Id) : null,
        CV_Ty: formData.CV_Ty ? parseInt(formData.CV_Ty) : null,
        Is_income: "Y",
        Total_Amount: parseFloat(formData.Total_Amount) || 0,
        Net_Amount: parseFloat(formData.Net_Amount) || 0,
        Status: initialActionId ? initialActionId : "",
        // 🔥 ADD UserId AND Mod_Code HERE
        UserId: userId,
        Mod_Code: currentModule,
        Challan_Detail: formData.Challan_Detail.map((detail) => ({
          CV_Sr: detail.CV_Sr,
          Lg_Id: detail.Lg_Id ? parseInt(detail.Lg_Id) : null,
          Bh_Id: detail.Bh_Id ? parseInt(detail.Bh_Id) : null,
          SL_Nm: detail.SL_Nm || null,
          GST_No: detail.GST_No || null,
          Amount: parseFloat(detail.Amount),
          Py_Mode: detail.Py_Mode,
          FileNo: detail.FileNo || null,
          Remarks: detail.Remarks || null,
          Chq_Date: detail.Chq_Date || null,
          IFSC_Code: detail.IFSC_Code || null,
          Acc_No: detail.Acc_No || null,
          Chq_No: detail.Chq_No ? Number(detail.Chq_No) : null,
          Rec_Date: detail.Rec_Date || null,
          Bank_Name: detail.Bank_Name || null,
        })),
      };

      const paymentVoucherData = {
        PV_Ty: "D_Chl",
        PV_No: latestCVNo,
        PV_Chln_Date: formData.Ch_Date,
        Dpt_Id: formData.Dpt_Id ? parseInt(formData.Dpt_Id) : null,
        Gross_Amt: formatAmountForAPI(taxCalculation.grossAmount),
        Add_Amt: formatAmountForAPI(taxCalculation.totalAdd),
        Less_Amt: formatAmountForAPI(taxCalculation.totalLess),
        Net_Amt: formatAmountForAPI(taxCalculation.netAmount),
        Remarks: null,
        // 🔥 ADD UserId AND Mod_Code HERE
        UserId: userId,
        Mod_Code: currentModule,
        pay_details: payDetails,
      };

      if (!isEditMode) {
        paymentVoucherData.Status = initialActionId ? initialActionId : "";
      }

      let challanResponse, paymentResponse;

      if (isEditMode) {
        let paymentId = null;
        try {
          const paymentDataResponse =
            await newChallanVoucherApi.getPaymentVoucherByPVNo(formData.CV_No);
          if (paymentDataResponse.success && paymentDataResponse.data) {
            paymentId = paymentDataResponse.data.PV_Id;
          }
        } catch (error) {
          console.error("Error getting payment ID:", error);
        }

        challanResponse = await newChallanVoucherApi.updateChallanVoucher(
          id,
          challanVoucherData,
          {
            UserId: userId,
            Mod_Code: currentModule
          }
        );

        if (paymentId) {
          paymentResponse = await newChallanVoucherApi.updatePaymentVoucher(
            paymentId,
            paymentVoucherData,
            {
              UserId: userId,
              Mod_Code: currentModule
            }
          );
        } else {
          paymentResponse = await newChallanVoucherApi.updatePaymentVoucher(
            id,
            paymentVoucherData,
            {
              UserId: userId,
              Mod_Code: currentModule
            }
          );
        }

        toast.success("Challan voucher updated successfully!");
      } else {
        challanResponse =
          await newChallanVoucherApi.createChallanVoucher(challanVoucherData);
        paymentResponse =
          await newChallanVoucherApi.createPaymentVoucher(paymentVoucherData);
        if (window.__challanSwalState) window.__challanSwalState.apiDone = true;
        toast.success(
          genVoucherConfig?.Is_Active == "Y"
            ? `Challan voucher created! Voucher No: ${latestCVNo}`
            : "Challan voucher created successfully!",
          { duration: 6000 }
        );
      }

      setTimeout(() => {
        navigate("/transactions/bookkeeping-vouchers/new-challan-update");
      }, !isEditMode && genVoucherConfig?.Is_Active == "Y" ? 5500 : 1500);
    } catch (error) {
      console.error("Error saving challan voucher:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            (isEditMode
              ? "Failed to update challan voucher. Please try again."
              : "Failed to create challan voucher. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/bookkeeping-vouchers/new-challan-update");
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Takes 2/3 of the space */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voucher Information Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Voucher Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={dateInputRef}
                      type="date"
                      name="Ch_Date"
                      value={formData.Ch_Date}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, branchButtonRef)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.Ch_Date ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    />
                    {errors.Ch_Date && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {errors.Ch_Date && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.Ch_Date}
                    </p>
                  )}
                </div>

                {/* Challan No - Non-editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challan No.
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                      {formData.CV_No || "Generating..."}
                    </div>
                    {formData.CV_No && (
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-generated voucher number (non-editable)
                  </p>
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
                  onKeyDown={handleBranchKeyDown}
                  onSearchKeyDown={handleBranchSearchKeyDown}
                  onItemKeyDown={handleBranchItemKeyDown}
                  getSelectedDisplay={getSelectedBranchDisplay}
                  loading={loadingDropdowns}
                  placeholder="Select Branch"
                  searchPlaceholder="Search by description or name..."
                  buttonRef={branchButtonRef}
                  dropdownRef={branchDropdownRef}
                  searchRef={branchSearchRef}
                  itemRefs={branchItemRefs}
                  listRef={branchListRef}
                  renderItem={renderBranchItem}
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
                  onKeyDown={handleChallanTypeKeyDown}
                  onSearchKeyDown={handleChallanTypeSearchKeyDown}
                  onItemKeyDown={handleChallanTypeItemKeyDown}
                  getSelectedDisplay={getSelectedChallanTypeName}
                  loading={loadingDropdowns}
                  placeholder="Select Challan Type (Optional)"
                  searchPlaceholder="Search by type name or code..."
                  buttonRef={challanTypeButtonRef}
                  dropdownRef={challanTypeDropdownRef}
                  searchRef={challanTypeSearchRef}
                  itemRefs={challanTypeItemRefs}
                  listRef={challanTypeListRef}
                  renderItem={renderChallanTypeItem}
                />
              </div>
            </div>

            {/* Challan Details Section - With Import/Export Buttons */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Challan Details
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Import Button */}
                  <button
                    type="button"
                    onClick={handleImportClick}
                    disabled={importing}
                    className="flex items-center px-2.5 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    title="Import data from Excel file"
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

                  {/* Download Sample Button */}
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="flex items-center px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    title="Download sample Excel template"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Sample
                  </button>

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center px-2.5 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                    title="Export data to Excel"
                  >
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                    Export
                  </button>

                  {/* Add Row Button */}
                  <button
                    type="button"
                    onClick={addNewDetailRow}
                    className="flex items-center px-2.5 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                    title="Add new row manually"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileImport}
                className="hidden"
              />

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {formData.Challan_Detail.map((detail, index) => (
                  <ChallanDetailRow
                    key={index}
                    index={index}
                    detail={detail}
                    onChange={handleDetailChange}
                    onRemove={removeDetailRow}
                    showRemove={formData.Challan_Detail.length > 1}
                    ledgers={dropdownData.ledgers}
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
                    handleEnterKey={handleEnterKey}
                    isEditMode={isEditMode}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Takes 1/3 of the space for Tax Calculation */}
          <div className="lg:col-span-1">
            <TaxCalculationCard
              taxCalculation={taxCalculation}
              loading={loadingTaxParameters}
              totalAmount={summary.total}
              onTaxAmountChange={handleTaxAmountChange}
              isEditMode={isEditMode}
              manualAmounts={manualTaxAmounts}
            />
          </div>
        </div>

        {/* Action Buttons - Full width */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            {taxCalculation.netAmount > 0 &&
              taxCalculation.netAmount != summary.total && (
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
              disabled={saving}
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

export default AddEditNewChallanUpdate;



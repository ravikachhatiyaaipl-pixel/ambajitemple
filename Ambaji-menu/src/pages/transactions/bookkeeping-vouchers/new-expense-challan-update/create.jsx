import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
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
  Pencil,
  Upload,
  Download,
  FileSpreadsheet,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { newChallanFlowService } from "../../../services/newchallanflowservice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// =========  DATE FORMAT HELPER ==========
// Converts yyyy-mm-dd (HTML date input) to dd-mm-yyyy for display
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "-";
  const clean = dateStr.split("T")[0];
  const parts = clean.split("-");
  if (parts.length == 3 && parts[0].length == 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// =========  FIXED GST VALIDATION FUNCTION ==========
const validateGSTNumber = (gstNumber) => {
  if (!gstNumber || gstNumber.trim() == "") return false;
  const cleaned = gstNumber.toUpperCase().trim();

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const gstRegexLenient = /^[0-9]{2}[A-Z]{5}[0-9A-Z]{8}$/;

  return true;
};

const getSampleBillData = () => {
  return [
    {
      "Ledger Code": "10814A",
      "Party Name": "Sample Party Name",
      "GST No.": "24AAAAA0000A1Z",
      "Amount (₹)": "1000",
      "Penalty Amount (₹)": "0",
      "Payment Mode": "Cash",
      "File No.": "FILE001",
      Remarks: "Sample remark for testing",
      "Cheque/DD No.": "",
      "Cheque/DD Date": "",
      "Receipt Date": "",
      "Bank Name": "",
      "Account No.": "",
      "IFSC Code": "",
      "Tax Name": "CGST",
      "Tax Amount": "90",
      "Tax Name 1": "SGST",
      "Tax Amount 1": "90",
    },
    {
      "Ledger Code": "10808",
      "Party Name": "Another Party",
      "GST No.": "24BBBBB0000B2Z",
      "Amount (₹)": "2500",
      "Penalty Amount (₹)": "100",
      "Payment Mode": "Bank",
      "File No.": "FILE002",
      Remarks: "Bank transfer example with penalty",
      "Cheque/DD No.": "",
      "Cheque/DD Date": "",
      "Receipt Date": "2026-04-02",
      "Bank Name": "State Bank of India",
      "Account No.": "123456789012",
      "IFSC Code": "SBIN0001234",
      "Tax Name": "CGST",
      "Tax Amount": "225",
      "Tax Name 1": "SGST",
      "Tax Amount 1": "225",
    },
    {
      "Ledger Code": "10808",
      "Party Name": "Cheque Party",
      "GST No.": "24CCCCC0000C3Z",
      "Amount (₹)": "5000",
      "Penalty Amount (₹)": "50",
      "Payment Mode": "Cheque",
      "File No.": "FILE003",
      Remarks: "Cheque payment example",
      "Cheque/DD No.": "12345678",
      "Cheque/DD Date": "2026-04-02",
      "Receipt Date": "2026-04-02",
      "Bank Name": "",
      "Account No.": "",
      "IFSC Code": "",
      "Tax Name": "CGST",
      "Tax Amount": "450",
      "Tax Name 1": "SGST",
      "Tax Amount 1": "450",
    },
  ];
};

const downloadSampleTemplate = () => {
  const sampleData = getSampleBillData();
  const ws = XLSX.utils.json_to_sheet(sampleData);

  const colWidths = [
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 }, // Tax Name & Amount columns
    { wch: 15 },
    { wch: 15 }, // Tax Name 1 & Amount 1
    { wch: 15 },
    { wch: 15 }, // Tax Name 2 & Amount 2
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bill Template");

  const instructions = [
    ["INSTRUCTIONS FOR IMPORTING BILL DATA"],
    [""],
    ["1. All fields are OPTIONAL except:"],
    ["   - Amount (₹) - Must be a positive number"],
    ["   - Payment Mode - Must be one of the available payment modes"],
    ["   - GST No. - Required for all entries (Format: 24AAAAA0000A1Z)"],
    ["   - Bank Name - Required for Bank, Online, Card payment modes"],
    [""],
    ["2. GST Number Format:"],
    [
      "   - 15 characters: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric",
    ],
    ["   - Example: 24AAAAA0000A1Z"],
    [""],
    ["3. TAX COLUMNS:"],
    ["   - You can add multiple Tax Name and Tax Amount column pairs"],
    ["   - Format: 'Tax Name' and 'Tax Amount' columns (must appear together)"],
    [
      "   - For multiple taxes: 'Tax Name 1', 'Tax Amount 1', 'Tax Name 2', 'Tax Amount 2', etc.",
    ],
    [
      "   - IMPORTANT: ALL Tax Names must match with the selected Tender Type's tax parameters",
    ],
    [
      "   - If ANY Tax Name does not match, the ENTIRE import will be cancelled",
    ],
    [""],
    ["4. Ledger Code:"],
    ["   - If provided, system will try to match with existing ledger codes"],
    [
      "   - If ledger code not found, the row will still be imported but you'll need to select ledger manually",
    ],
    [""],
    ["5. Other Optional Fields:"],
    ["   - Party Name, File No., Remarks, Penalty Amount"],
    ["   - Cheque/DD No. (for Cheque/DD payment mode)"],
    ["   - Cheque/DD Date (for Cheque/DD payment mode)"],
    ["   - Receipt Date (for Cheque/DD/Bank/Online/Card payment modes)"],
    ["   - Account No. (for Bank/Online/Card payment modes)"],
    ["   - IFSC Code (for Bank/Online/Card payment modes)"],
    [""],
    ["6. Date Format: YYYY-MM-DD (e.g., 2026-04-02)"],
    [""],
    ["7. IMPORTANT:"],
    ["   - GST No. is REQUIRED for all entries and must be in valid format"],
    [
      "   - Bank Name is REQUIRED for Bank, Online, Card, Cheque, DD payment modes",
    ],
    [
      "   - ALL Tax Names must match with the selected Tender Type's tax parameters",
    ],
    ["   - If ANY tax doesn't match, the ENTIRE import will be cancelled"],
    [""],
    ["Available Payment Modes (for reference):"],
    ["   - Cash, Bank, Cheque, DD, Online, Card"],
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
  saveAs(data, "bill_template.xlsx");
};

const parseExcelToBillDetails = async (file, ledgers, paymentModes) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const billDetails = [];
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

        // Fuzzy payment mode matching
        const matchPaymentMode = (input) => {
          if (!input) return null;
          const inputLower = input.trim().toLowerCase();
          const exact = paymentModes.find(
            (m) =>
              (m.PayMd_Name || m.value || "").toLowerCase() == inputLower ||
              (m.PayMd_Code && m.PayMd_Code.toLowerCase() == inputLower),
          );
          if (exact)
            return {
              PayMd_ID: exact.PayMd_ID,
              Py_Mode: exact.PayMd_Name || exact.value,
              fuzzy: false,
            };
          const startsWith = paymentModes.find(
            (m) =>
              (m.PayMd_Name || m.value || "")
                .toLowerCase()
                .startsWith(inputLower) ||
              inputLower.startsWith(
                (m.PayMd_Name || m.value || "").toLowerCase(),
              ),
          );
          if (startsWith)
            return {
              PayMd_ID: startsWith.PayMd_ID,
              Py_Mode: startsWith.PayMd_Name || startsWith.value,
              fuzzy: true,
            };
          const contains = paymentModes.find(
            (m) =>
              (m.PayMd_Name || m.value || "")
                .toLowerCase()
                .includes(inputLower) ||
              inputLower.includes(
                (m.PayMd_Name || m.value || "").toLowerCase(),
              ),
          );
          if (contains)
            return {
              PayMd_ID: contains.PayMd_ID,
              Py_Mode: contains.PayMd_Name || contains.value,
              fuzzy: true,
            };
          return null;
        };

        // Helper to parse tax columns
        const parseTaxColumns = (row) => {
          const taxPairs = [];
          const taxNames = [];

          // Find all "Tax Name" columns
          Object.keys(row).forEach((key) => {
            if (key == "Tax Name" || key.startsWith("Tax Name")) {
              taxNames.push(key);
            }
          });

          // For each Tax Name found, look for matching Tax Amount
          taxNames.forEach((taxNameKey) => {
            const taxName = row[taxNameKey]?.toString().trim();
            if (taxName) {
              let taxAmountKey = null;
              const indexMatch = taxNameKey.match(/Tax Name\s*(\d*)/);
              if (indexMatch) {
                const index = indexMatch[1] || "";
                const possibleKeys = [
                  `Tax Amount${index ? ` ${index}` : ""}`,
                  `Tax Amount${index}`,
                  `Tax Amount`,
                ];
                for (const key of possibleKeys) {
                  if (row[key] != undefined) {
                    taxAmountKey = key;
                    break;
                  }
                }
              } else {
                if (row["Tax Amount"] != undefined) {
                  taxAmountKey = "Tax Amount";
                }
              }

              if (taxAmountKey) {
                const taxAmount = parseFloat(row[taxAmountKey]);
                if (!isNaN(taxAmount) && taxAmount > 0) {
                  taxPairs.push({
                    name: taxName,
                    amount: taxAmount,
                  });
                }
              }
            }
          });

          return taxPairs;
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
                `Row ${rowNum}: Ledger code "${ledgerCode}" not found — select manually.`,
              );
          } else if (ledgerName) {
            ledger = ledgerByNameMap.get(ledgerName.toLowerCase());
            if (!ledger)
              warnings.push(
                `Row ${rowNum}: Ledger name "${ledgerName}" not found — select manually.`,
              );
          }

          const amount = parseFloat(row["Amount (₹)"]);
          if (isNaN(amount) || amount <= 0) {
            warnings.push(`Row ${rowNum}: Invalid amount. Skipping.`);
            continue;
          }

          const paymentModeRaw = row["Payment Mode"]?.toString().trim() || "";
          const matchResult = matchPaymentMode(paymentModeRaw);
          let resolvedPayMode = "";
          let resolvedPayMdID = null;
          if (!paymentModeRaw) {
            warnings.push(
              `Row ${rowNum}: Payment Mode is empty — set manually after import.`,
            );
          } else if (!matchResult) {
            warnings.push(
              `Row ${rowNum}: Payment Mode "${paymentModeRaw}" not found — set manually after import.`,
            );
          } else {
            if (matchResult.fuzzy)
              warnings.push(
                `Row ${rowNum}: Payment Mode "${paymentModeRaw}" matched as "${matchResult.Py_Mode}".`,
              );
            resolvedPayMode = matchResult.Py_Mode;
            resolvedPayMdID = matchResult.PayMd_ID;
          }

          const gstNo = (row["GST No."]?.toString().trim() || "").toUpperCase();
          if (gstNo && !validateGSTNumber(gstNo)) {
            warnings.push(
              `Row ${rowNum}: GST No. "${gstNo}" format invalid — will be cleared.`,
            );
          }

          let penaltyAmount = 0;
          if (
            row["Penalty Amount (₹)"] != null &&
            row["Penalty Amount (₹)"] != ""
          ) {
            const p = parseFloat(row["Penalty Amount (₹)"]);
            penaltyAmount = isNaN(p) || p < 0 ? 0 : p;
          }

          const rawChqNo = row["Cheque/DD No."]?.toString().trim() || "";
          const cleanedChqNo = cleanChequeNumber(rawChqNo);
          if (rawChqNo && rawChqNo != cleanedChqNo) {
            warnings.push(
              `Row ${rowNum}: Cheque/DD No. cleaned to "${cleanedChqNo}" (digits only).`,
            );
          }

          // Parse tax columns
          const taxPairs = parseTaxColumns(row);

          billDetails.push({
            CV_Sr: billDetails.length + 1,
            Lg_Id: ledger?.Lg_Id?.toString() || "",
            Bh_Id: ledger?.budget_head?.Bh_Id?.toString() || null,
            SL_Nm: row["Party Name"]?.toString().trim() || "",
            GST_No: gstNo && validateGSTNumber(gstNo) ? gstNo : "",
            SL_Id: null,
            Amount: amount.toString(),
            Penalty_Amount: penaltyAmount.toString(),
            PayMd_ID: resolvedPayMdID,
            Py_Mode: resolvedPayMode,
            FileNo: row["File No."]?.toString().trim() || "",
            Remarks: row["Remarks"]?.toString().trim() || "",
            Chq_Date: row["Cheque/DD Date"]?.toString().trim() || "",
            Bank_Name: row["Bank Name"]?.toString().trim() || "",
            Acc_No: row["Account No."]?.toString().trim() || "",
            IFSC_Code: row["IFSC Code"]?.toString().trim() || "",
            Chq_No: cleanedChqNo,
            Rec_Date: row["Receipt Date"]?.toString().trim() || "",
            _taxes: taxPairs,
          });
        }

        if (billDetails.length == 0) {
          reject({
            errors: [
              "No valid data found in the Excel file. Check that Amount column has valid values.",
            ],
          });
        } else {
          resolve({ data: billDetails, warnings });
        }
      } catch (error) {
        reject({ errors: [`Failed to parse Excel file: ${error.message}`] });
      }
    };
    reader.onerror = () => reject({ errors: ["Failed to read file"] });
    reader.readAsArrayBuffer(file);
  });
};

// =========  TAXATION PREVIEW POPUP COMPONENT ==========
const TaxPreviewPopup = ({
  isOpen,
  onClose,
  taxCalculation,
  totalAmount,
  totalPenalty,
}) => {
  if (!isOpen) return null;

  const formatAmount = (amount) =>
    `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const taxItems =
    taxCalculation?.taxBreakdown?.filter((item) => item.type == "tax") || [];

  // Filter out zero amount items
  const liveTaxItems = taxItems
    .map((tax) => {
      const pct = parseFloat(tax.percentage) || 0;
      const isManual =
        tax.isManual || (tax.formula && tax.formula.trim() == "*");
      let calcAmt = tax.calculatedAmount || 0;
      if (!isManual && totalAmount > 0 && calcAmt == 0) {
        calcAmt = Math.round(((totalAmount * pct) / 100) * 100) / 100;
      }
      return { ...tax, calculatedAmount: calcAmt, isManual };
    })
    .filter((tax) => tax.calculatedAmount != 0);

  const totalAdd = liveTaxItems
    .filter((t) => t.isAdd)
    .reduce((s, t) => s + (t.calculatedAmount || 0), 0);
  const totalLess = liveTaxItems
    .filter((t) => !t.isAdd)
    .reduce((s, t) => s + (t.calculatedAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Taxation Summary
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {liveTaxItems.length > 0 ? (
            <div className="space-y-2">
              {liveTaxItems.map((tax, idx) => {
                const displayText =
                  tax.displayText ||
                  (tax.isManual
                    ? tax.taxType
                    : parseFloat(tax.percentage) > 0
                      ? `${tax.taxType} (${tax.percentage}%)`
                      : tax.taxType);
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 pl-2 border-l-2 border-blue-200"
                  >
                    <div className="flex items-center gap-2">
                      {tax.isAdd ? (
                        <PlusIcon className="h-3 w-3 text-green-500" />
                      ) : (
                        <MinusIcon className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-sm text-gray-700">
                        {displayText}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${tax.isAdd ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {tax.isAdd ? "Add" : "Deduct"}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${tax.isAdd ? "text-green-600" : "text-red-600"}`}
                    >
                      {tax.isAdd ? "+" : "-"}
                      {formatAmount(tax.calculatedAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calculator className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No tax items configured</p>
            </div>
          )}

          {(totalAdd > 0 || totalLess > 0) && (
            <div className="pt-3 mt-2 border-t border-gray-200">
              {totalAdd > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium text-gray-600">
                    Total Additions
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    +{formatAmount(totalAdd)}
                  </span>
                </div>
              )}
              {totalLess > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium text-gray-600">
                    Total Deductions
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatAmount(totalLess)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
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
                  item?.Dpt_id || item?.Lg_Id || item?.TnT_ID || `item-${idx}`;

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

// =========  TAX CALCULATION CARD COMPONENT ==========
const TaxCalculationCard = memo(
  ({
    taxCalculation,
    loading,
    totalAmount,
    totalPenalty,
    onTaxAmountChange,
    isEditMode,
    isTaxEditMode = false,
    manualAmounts,
    onPreview,
  }) => {
    const [localAmounts, setLocalAmounts] = useState({});

    const isManualFormula = (formula) => {
      if (!formula) return false;
      const trimmed = formula.trim();
      return trimmed == "*" || trimmed == "* " || trimmed == " *";
    };

    // Build a stable key from the breakdown structure (VIP_Ids) to detect when params change
    const breakdownKey = useMemo(
      () => (taxCalculation?.taxBreakdown || []).map((t) => t.VIP_Id).join(","),
      [taxCalculation?.taxBreakdown],
    );

    useEffect(() => {
      if (
        taxCalculation &&
        taxCalculation.taxBreakdown &&
        taxCalculation.taxBreakdown.length > 0
      ) {
        const initialAmounts = {};
        taxCalculation.taxBreakdown.forEach((tax, index) => {
          // Allow editing if manual formula OR in tax edit mode
          if (isManualFormula(tax.formula) || isTaxEditMode) {
            const overrideKey = tax.VIP_Id;
            let amount = manualAmounts?.[overrideKey];
            if (amount == undefined) amount = tax.calculatedAmount;
            initialAmounts[index] =
              amount != undefined && amount != null && amount != 0
                ? amount.toString()
                : "0";
          }
        });
        setLocalAmounts(initialAmounts);
      } else {
        setLocalAmounts({});
      }
      // Only reset localAmounts when the breakdown structure changes (different params), not on every recalc
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [breakdownKey, isTaxEditMode]);

    // ADDED: handleTaxInputChange function
    const handleTaxInputChange = (index, value, tax) => {
      if (value == "" || /^\d*\.?\d*$/.test(value)) {
        setLocalAmounts((prev) => ({ ...prev, [index]: value }));
        const newAmount = parseFloat(value);
        if (!isNaN(newAmount) && newAmount >= 0 && onTaxAmountChange) {
          onTaxAmountChange(tax.VIP_Id, newAmount);
        } else if (value == "" && onTaxAmountChange) {
          onTaxAmountChange(tax.VIP_Id, 0);
        }
      }
    };

    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white px-3 py-2 border-b border-blue-100 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="text-gray-800 font-semibold text-sm">
              Taxation Summary
            </span>
          </div>
          <div className="p-4 flex items-center justify-center gap-2">
            <Loader className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-gray-500 text-xs">
              Loading tax parameters...
            </span>
          </div>
        </div>
      );
    }

    // Never return null — always render the card so layout stays stable
    const safeTotal =
      typeof totalAmount == "number" && !isNaN(totalAmount) ? totalAmount : 0;
    const hasTaxParams = taxCalculation?.taxBreakdown?.length > 0;

    const formatAmount = (amount) =>
      `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const taxItems =
      taxCalculation?.taxBreakdown?.filter((item) => item.type == "tax") || [];
    const penaltyItems =
      taxCalculation?.taxBreakdown?.filter((item) => item.type == "penalty") ||
      [];

    const liveTaxItems = taxItems.map((tax) => {
      // Allow editing if manual formula OR in tax edit mode
      const isManual = isManualFormula(tax.formula) || isTaxEditMode;
      let calcAmt = tax.calculatedAmount || 0;
      if (!isManual && safeTotal > 0) {
        const pct = parseFloat(tax.percentage) || 0;
        calcAmt = Math.round(((safeTotal * pct) / 100) * 100) / 100;
      } else if (!isManual && safeTotal == 0) {
        calcAmt = 0;
      }
      return { ...tax, calculatedAmount: calcAmt, isManual };
    });

    const liveTotalAdd = liveTaxItems
      .filter((t) => t.isAdd)
      .reduce((s, t) => s + t.calculatedAmount, 0);
    const liveTotalLess = liveTaxItems
      .filter((t) => !t.isAdd)
      .reduce((s, t) => s + t.calculatedAmount, 0);
    const liveNetBeforePenalty = safeTotal + liveTotalAdd - liveTotalLess;

    const penaltyDeduction =
      penaltyItems.length > 0
        ? penaltyItems.reduce((sum, p) => sum + (p.calculatedAmount || 0), 0)
        : totalPenalty || 0;
    const finalNetAmount = liveNetBeforePenalty - penaltyDeduction;

    const handleBlur = (index, value, tax) => {
      let numValue = parseFloat(value);
      if (isNaN(numValue)) numValue = 0;
      setLocalAmounts((prev) => ({ ...prev, [index]: numValue.toFixed(2) }));
      if (onTaxAmountChange) onTaxAmountChange(tax.VIP_Id, numValue);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header — always visible */}
        <div className="bg-gradient-to-r from-blue-50 to-white px-3 py-2 border-b border-blue-100 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-blue-600" />
          <span className="text-gray-800 font-semibold text-sm">
            Taxation Summary
          </span>
          {isTaxEditMode && (
            <span className="ml-2 text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
              Edit Mode
            </span>
          )}
        </div>

        <div className="p-3 space-y-1.5">
          {/* Gross Amount — always shown */}
          <div
            className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg"
            onMouseDown={(e) => e.preventDefault()}
          >
            <span className="text-gray-600 text-xs font-medium">
              Gross Amount
            </span>
            <span className="font-semibold text-gray-900 text-sm">
              {formatAmount(safeTotal)}
            </span>
          </div>

          {/* Tax line items — always render all rows, just show 0 when no amount */}
          {hasTaxParams ? (
            <div className="space-y-1">
              {liveTaxItems.map((tax, index) => {
                const isManual = isManualFormula(tax.formula) || isTaxEditMode;
                const currentValue =
                  localAmounts[index] != undefined
                    ? localAmounts[index]
                    : (tax.calculatedAmount || 0).toString();
                const displayText =
                  tax.displayText ||
                  (tax.isManual
                    ? tax.taxType
                    : parseFloat(tax.percentage) > 0
                      ? `${tax.taxType} (${tax.percentage}%)`
                      : tax.taxType);

                return (
                  <div
                    key={`tax-${tax.VIP_Id || index}`}
                    className={`flex items-center justify-between border border-gray-100 rounded-lg px-2 py-1.5 ${isManual ? "bg-yellow-50" : "bg-white"}`}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      {tax.isAdd ? (
                        <PlusIcon className="h-3 w-3 text-green-500 shrink-0" />
                      ) : (
                        <MinusIcon className="h-3 w-3 text-red-500 shrink-0" />
                      )}
                      <span className="text-gray-700 text-xs truncate">
                        {displayText}
                      </span>
                      <span
                        className={`text-xs px-1 py-0.5 rounded-full shrink-0 ${tax.isAdd ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {tax.isAdd ? "Add" : "Deduct"}
                      </span>
                      {isTaxEditMode && (
                        <span className="text-[10px] text-yellow-600 bg-yellow-100 px-1 py-0.5 rounded">
                          editable
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      {isManual ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 text-xs">
                            {tax.isAdd ? "+" : "-"}
                          </span>
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) =>
                              handleTaxInputChange(index, e.target.value, tax)
                            }
                            onBlur={(e) =>
                              handleBlur(index, e.target.value, tax)
                            }
                            className="w-20 px-1 py-0.5 text-right text-xs border border-yellow-400 rounded focus:ring-1 focus:ring-yellow-500 bg-white"
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
            </div>
          ) : (
            <div className="px-2 py-2 text-xs text-gray-400 italic text-center">
              No tax parameters configured for selected tender type
            </div>
          )}

          {/* Amount after tax — always reserve space, show dash when zero */}
          <div className="flex items-center justify-between px-2 py-1 border-t border-dashed border-gray-200">
            <span className="text-xs text-gray-500">Amount after tax</span>
            <span className="text-xs font-semibold text-gray-800">
              {hasTaxParams
                ? formatAmount(liveNetBeforePenalty)
                : formatAmount(safeTotal)}
            </span>
          </div>

          {/* Penalty row — always reserve space */}
          <div
            className={`flex items-center justify-between border rounded-lg px-2 py-1.5 ${penaltyDeduction > 0 ? "border-red-100 bg-red-50" : "border-gray-100 bg-gray-50"}`}
          >
            <div className="flex items-center gap-1">
              <MinusIcon className="h-3 w-3 text-red-400 shrink-0" />
              <span className="text-gray-600 text-xs">Penalty</span>
              <span className="text-xs px-1 py-0.5 rounded-full bg-red-100 text-red-700">
                Deduct
              </span>
            </div>
            <span
              className={`text-xs font-semibold ${penaltyDeduction > 0 ? "text-red-600" : "text-gray-400"}`}
            >
              {penaltyDeduction > 0
                ? `-${formatAmount(penaltyDeduction)}`
                : "₹0.00"}
            </span>
          </div>

          {/* Net Payable — always shown */}
          <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-3 py-2.5 border border-green-200">
            <span className="text-sm font-bold text-gray-900">Net Payable</span>
            <span className="text-base font-bold text-green-700">
              {formatAmount(finalNetAmount)}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

// =========  BILL DETAIL ROW COMPONENT ==========
const BillDetailRow = memo(
  ({
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
    penaltyAmountRefs,
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
    isTaxEditMode = false,
    subLedgers = [],
    taxCalculation,
    loadingTaxParameters,
    onTaxAmountChange,
    manualAmounts,
    ledgerBalanceData,
    loadingBalance,
    onCheckBalance,
    filteredLedgersForBranch = [],
    branchBudgetHeadIds = [],
  }) => {
    // ---- Ledger dropdown state ----
    const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
    const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
    const [filteredLedgers, setFilteredLedgers] = useState([]);
    const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
    const ledgerDropdownRef = useRef(null);
    const ledgerSearchRef = useRef(null);
    const ledgerButtonRef = useRef(null);
    const ledgerItemRefs = useRef([]);
    const ledgerListRef = useRef(null);

    // ---- Party name: combo input + dropdown ----
    const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
    const [partyInputValue, setPartyInputValue] = useState(detail.SL_Nm || "");
    const [filteredParties, setFilteredParties] = useState([]);
    const [partyHighlightedIndex, setPartyHighlightedIndex] = useState(-1);
    const partyDropdownRef = useRef(null);
    const partyInputRef = useRef(null);
    const partyItemRefs = useRef([]);

    // ---- GST lookup loading ----
    const [gstLookupLoading, setGstLookupLoading] = useState(false);

    // ---- Budget warning acknowledged state ----
    const [warningAcknowledged, setWarningAcknowledged] = useState(false);

    // ---- Local text input state (prevents parent re-render on every keystroke) ----
    const [localGST, setLocalGST] = useState(detail.GST_No || "");
    const [localAmount, setLocalAmount] = useState(detail.Amount || "");
    const [localPenalty, setLocalPenalty] = useState(
      detail.Penalty_Amount || "",
    );
    const [localFileNo, setLocalFileNo] = useState(detail.FileNo || "");
    const [localRemarks, setLocalRemarks] = useState(detail.Remarks || "");
    const [localBankName, setLocalBankName] = useState(detail.Bank_Name || "");
    const [localAccNo, setLocalAccNo] = useState(detail.Acc_No || "");
    const [localIFSC, setLocalIFSC] = useState(detail.IFSC_Code || "");
    const [localChqNo, setLocalChqNo] = useState(detail.Chq_No || "");

    // Sync local state when detail changes externally (edit mode load / row switch)
    useEffect(() => {
      setLocalGST(detail.GST_No || "");
    }, [detail.GST_No]);
    useEffect(() => {
      setLocalAmount(detail.Amount || "");
    }, [detail.Amount]);
    useEffect(() => {
      setLocalPenalty(detail.Penalty_Amount || "");
    }, [detail.Penalty_Amount]);
    useEffect(() => {
      setLocalFileNo(detail.FileNo || "");
    }, [detail.FileNo]);
    useEffect(() => {
      setLocalRemarks(detail.Remarks || "");
    }, [detail.Remarks]);
    useEffect(() => {
      setLocalBankName(detail.Bank_Name || "");
    }, [detail.Bank_Name]);
    useEffect(() => {
      setLocalAccNo(detail.Acc_No || "");
    }, [detail.Acc_No]);
    useEffect(() => {
      setLocalIFSC(detail.IFSC_Code || "");
    }, [detail.IFSC_Code]);
    useEffect(() => {
      setLocalChqNo(detail.Chq_No || "");
    }, [detail.Chq_No]);

    // Reset warning acknowledgment and fetch balance when ledger changes
    useEffect(() => {
      setWarningAcknowledged(false);
      if (detail.Lg_Id && onCheckBalance) {
        onCheckBalance(detail.Lg_Id);
      }
    }, [detail.Lg_Id]);

    // ---- Payment Mode searchable dropdown ----
    const [isPayModeOpen, setIsPayModeOpen] = useState(false);
    const [payModeSearch, setPayModeSearch] = useState("");
    const payModeDropdownRef = useRef(null);
    const payModeSearchRef = useRef(null);
    const payModeItemRefs = useRef([]);
    const [payModeHighlightedIndex, setPayModeHighlightedIndex] = useState(-1);

    const filteredPayModes = payModeSearch.trim()
      ? paymentModes.filter((m) =>
          (m.label || m.PayMd_Name || "")
            .toLowerCase()
            .includes(payModeSearch.toLowerCase()),
        )
      : paymentModes;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          payModeDropdownRef.current &&
          !payModeDropdownRef.current.contains(event.target)
        ) {
          setIsPayModeOpen(false);
          setPayModeSearch("");
          setPayModeHighlightedIndex(-1);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isPayModeOpen && payModeSearchRef.current) {
        setTimeout(() => payModeSearchRef.current.focus(), 0);
      }
    }, [isPayModeOpen]);

    // =========  ENHANCED PAYMENT MODE HANDLER WITH AUTO-FILL ==========
    const handlePayModeSelect = (mode) => {
      const val = mode.value || mode.PayMd_Name;
      const id = mode.PayMd_ID;
      const selectedParty = subLedgers.find((p) => p.SL_Id == detail.SL_Id);

      // If party exists and has bank details, auto-fill based on payment mode
      if (selectedParty) {
        const bankName = selectedParty.Bank_Name || "";
        const accountNumber = selectedParty.Account_Number || "";
        const ifscCode = selectedParty.IFSC_Code || "";
        const isDigital = mode.Is_Digital == 1 || mode.Is_Digital == "1";
        const isCash = mode.Is_Cash == 1 || mode.Is_Cash == "1";

        // For Bank mode (Digital): auto-fill all bank details
        if (isDigital) {
          onChange(index, {
            Py_Mode: val,
            PayMd_ID: id,
            Bank_Name: bankName,
            Acc_No: accountNumber,
            IFSC_Code: ifscCode,
          });
        }
        // For Cheque mode (neither cash nor digital): auto-fill only Bank Name
        else if (!isCash && !isDigital) {
          onChange(index, {
            Py_Mode: val,
            PayMd_ID: id,
            Bank_Name: bankName,
          });
        }
        // For Cash mode: clear bank details
        else if (isCash) {
          onChange(index, {
            Py_Mode: val,
            PayMd_ID: id,
            Bank_Name: "",
            Acc_No: "",
            IFSC_Code: "",
          });
        } else {
          // Fallback: just set the mode
          onChange(index, { Py_Mode: val, PayMd_ID: id });
        }
      } else {
        // No party selected, just set the payment mode
        onChange(index, { Py_Mode: val, PayMd_ID: id });
      }

      setIsPayModeOpen(false);
      setPayModeSearch("");
      setPayModeHighlightedIndex(-1);
      setTimeout(() => fileNoRefs.current?.[index]?.focus(), 50);
    };

    const getPayModeDisplay = () => {
      if (!detail.Py_Mode) return "";
      const found = paymentModes.find(
        (m) => (m.value || m.PayMd_Name) == detail.Py_Mode,
      );
      return found ? found.label || found.PayMd_Name : detail.Py_Mode;
    };

    // Persist amount/penalty before Taxation Summary receives focus (avoids stale parent state on blur)
    const flushAmountsBeforeTaxFocus = () => {
      if (String(localAmount ?? "") != String(detail.Amount ?? "")) {
        onChange(index, "Amount", localAmount);
      }
      if (String(localPenalty ?? "") != String(detail.Penalty_Amount ?? "")) {
        onChange(index, "Penalty_Amount", localPenalty);
      }
    };

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
          const trimmed = partyInputValue.trim();
          if (trimmed != detail.SL_Nm) {
            // When clicking outside with manual entry, clear all fields
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [partyInputValue, detail.SL_Nm]);

    // UPDATED: Enhanced handlePartySelect with bank auto-fill
    const handlePartySelect = (party) => {
      const gst = (
        party.GSTIN ||
        party.SL_GST ||
        party.GST_No ||
        ""
      ).toUpperCase();
      const name = party.SL_Name || party.SL_Nm || "";

      // Auto-fill bank details from the selected party
      const bankName = party.Bank_Name || "";
      const accountNumber = party.Account_Number || "";
      const ifscCode = party.IFSC_Code || "";

      setPartyInputValue(name);
      onChange(index, {
        SL_Nm: name,
        GST_No: gst,
        SL_Id: party.SL_Id || null,
        Bank_Name: bankName,
        Acc_No: accountNumber,
        IFSC_Code: ifscCode,
      });
      setIsPartyDropdownOpen(false);
      setPartyHighlightedIndex(-1);
      setTimeout(() => {
        if (gstNoRefs.current?.[index]) gstNoRefs.current[index].focus();
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
        // Clear bank details when escape is pressed
        const trimmed = partyInputValue.trim();
        onChange(index, {
          SL_Nm: trimmed,
          SL_Id: null,
          GST_No: "",
          Bank_Name: "",
          Acc_No: "",
          IFSC_Code: "",
        });
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

    // Updated renderPartyItem to show bank details
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

    const handleGstBlur = async (e) => {
      const gstVal = localGST.trim().toUpperCase();
      // Always commit the local value to parent on blur
      onChange(index, { GST_No: gstVal });
      if (!gstVal || gstVal.length < 15) return;

      // Validate GST format first
      if (!validateGSTNumber(gstVal)) {
        setLocalGST("");
        onChange(index, { GST_No: "" });
        toast.error(
          "Invalid GST Number format. Expected format: 24AAAAA0000A1Z",
        );
        return;
      }

      setGstLookupLoading(true);
      try {
        const res = await newChallanFlowService.getSubLedgerByGSTIN(gstVal);
        if (res.success && res.data) {
          const found = res.data;
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
            setLocalGST(found.GSTIN);
            // Auto-fill bank details from found party
            onChange(index, {
              SL_Nm: found.SL_Name,
              GST_No: found.GSTIN,
              SL_Id: found.SL_Id,
              Bank_Name: found.Bank_Name || "",
              Acc_No: found.Account_Number || "",
              IFSC_Code: found.IFSC_Code || "",
            });
          } else {
            setLocalGST("");
            onChange(index, { GST_No: "" });
          }
        }
      } catch (_err) {
        // Silently ignore network errors for GST lookup
      } finally {
        setGstLookupLoading(false);
      }
    };

    // ---- Ledger filter effect ----
    useEffect(() => {
      // Use filteredLedgersForBranch if available, otherwise use all ledgers
      const ledgersToUse =
        filteredLedgersForBranch.length > 0
          ? filteredLedgersForBranch
          : ledgers;

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
    }, [ledgerSearchTerm, ledgers, filteredLedgersForBranch]);

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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isLedgerDropdownOpen && ledgerSearchRef.current) {
        setTimeout(() => ledgerSearchRef.current.focus(), 0);
      }
    }, [isLedgerDropdownOpen]);

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

    const handleLedgerSelect = (ledger) => {
      onChange(index, {
        Lg_Id: ledger.Lg_Id?.toString(),
        Bh_Id: ledger.budget_head?.Bh_Id?.toString() || null,
      });
      setIsLedgerDropdownOpen(false);
      setLedgerSearchTerm("");
      setLedgerHighlightedIndex(-1);

      if (ledger.Lg_Id && onCheckBalance) {
        onCheckBalance(ledger.Lg_Id);
      }

      setTimeout(() => {
        if (partyInputRef.current) {
          partyInputRef.current.focus();
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
      const isExpense = ledger.budget_head && ledger.budget_head.Gr_Exp != "N";

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
        </div>
      );
    };

    const selectedPayMode = paymentModes.find(
      (m) => (m.value || m.PayMd_Name) == detail.Py_Mode,
    );
    const isCashMode =
      selectedPayMode?.Is_Cash == 1 ||
      selectedPayMode?.Is_Cash == "1" ||
      detail.Py_Mode == "Cash";
    const isDigitalMode =
      selectedPayMode?.Is_Digital == 1 || selectedPayMode?.Is_Digital == "1";
    const showChequeFields = !!detail.Py_Mode && !isCashMode && !isDigitalMode;
    const showBankFields = !!detail.Py_Mode && isDigitalMode;

    // UPDATED: handleAmountBlur with warning acknowledgment
    const handleAmountBlur = () => {
      onChange(index, "Amount", localAmount);
      if (detail.Lg_Id && ledgerBalanceData && !warningAcknowledged) {
        const availableBalance = parseFloat(ledgerBalanceData.available_balance) || 0;
        const amount = parseFloat(localAmount) || 0;
        const penalty = parseFloat(localPenalty) || 0;
        const total = amount + penalty;

        if (total > availableBalance) {
          Swal.fire({
            title: "⚠️ Budget Exceeded",
            html: `
              <div style="text-align: left; padding: 10px;">
                <p style="font-weight: 600; color: #dc2626;">Warning: Amount exceeds available balance!</p>
                <div style="margin-top: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <p><strong>Ledger:</strong> ${ledgerBalanceData.ledger_info?.Lg_Name || 'N/A'}</p>
                  <p><strong>Available Balance:</strong> ₹${Number(availableBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p><strong>Requested Amount:</strong> ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  ${ledgerBalanceData.budget_info?.budget_head_name ? `<p><strong>Budget Head:</strong> ${ledgerBalanceData.budget_info.budget_head_name}</p>` : ''}
                </div>
                <p style="margin-top: 10px; font-size: 13px; color: #6b7280;">You can continue with this amount, but it will exceed the available budget.</p>
              </div>
            `,
            icon: "warning",
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Continue Anyway",
            showCancelButton: true,
            cancelButtonColor: "#6b7280",
            cancelButtonText: "Adjust Amount",
          }).then((result) => {
            if (result.isConfirmed) {
              toast.info("Proceeding with amount exceeding available balance");
              setWarningAcknowledged(true);
            } else {
              setTimeout(() => amountRefs.current?.[index]?.focus(), 100);
            }
          });
        }
      }
    };

    // UPDATED: handlePenaltyBlur with warning acknowledgment
    const handlePenaltyBlur = () => {
      onChange(index, "Penalty_Amount", localPenalty);
      if (detail.Lg_Id && ledgerBalanceData && !warningAcknowledged) {
        const availableBalance = parseFloat(ledgerBalanceData.available_balance) || 0;
        const amount = parseFloat(localAmount) || 0;
        const penalty = parseFloat(localPenalty) || 0;
        const total = amount + penalty;

        if (total > availableBalance) {
          Swal.fire({
            title: "⚠️ Budget Exceeded",
            html: `
              <div style="text-align: left; padding: 10px;">
                <p style="font-weight: 600; color: #dc2626;">Warning: Amount + Penalty exceeds available balance!</p>
                <div style="margin-top: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <p><strong>Ledger:</strong> ${ledgerBalanceData.ledger_info?.Lg_Name || 'N/A'}</p>
                  <p><strong>Available Balance:</strong> ₹${Number(availableBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p><strong>Requested Amount:</strong> ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  ${ledgerBalanceData.budget_info?.budget_head_name ? `<p><strong>Budget Head:</strong> ${ledgerBalanceData.budget_info.budget_head_name}</p>` : ''}
                </div>
                <p style="margin-top: 10px; font-size: 13px; color: #6b7280;">You can continue with this amount, but it will exceed the available budget.</p>
              </div>
            `,
            icon: "warning",
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Continue Anyway",
            showCancelButton: true,
            cancelButtonColor: "#6b7280",
            cancelButtonText: "Adjust Amount",
          }).then((result) => {
            if (result.isConfirmed) {
              toast.info("Proceeding with amount exceeding available balance");
              setWarningAcknowledged(true);
            } else {
              setTimeout(() => penaltyAmountRefs.current?.[index]?.focus(), 100);
            }
          });
        }
      }
    };

    // Show balance info when a ledger is selected (including while loading)
    const showBalanceInfo =
      !!detail.Lg_Id && (!!ledgerBalanceData || loadingBalance);

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            {detail.Lg_Id || detail.Amount || detail.GST_No
              ? `Bill Detail #${index + 1}`
              : `New Bill Entry`}
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
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${ledgerHighlightedIndex == idx ? "bg-blue-100" : "text-gray-700"}`}
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
            {errors[`ChallanDetail_${index}_Lg_Id`] && (
              <p className="mt-1 text-xs text-red-600 flex items-center ml-[7.5rem]">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors[`ChallanDetail_${index}_Lg_Id`]}
              </p>
            )}
          </div>

          {showBalanceInfo && (
            <div className="flex items-center gap-3 ml-[7.5rem]">
              <div className={`flex-1 px-3 py-1.5 rounded-lg text-xs ${parseFloat(ledgerBalanceData?.available_balance) < 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                {loadingBalance && !ledgerBalanceData ? (
                  <div className="flex items-center gap-1 text-blue-500">
                    <Loader className="h-3 w-3 animate-spin" />
                    <span className="text-[10px]">Checking balance...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Available Balance:</span>
                      <span className={`font-bold ${parseFloat(ledgerBalanceData?.available_balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{Number(ledgerBalanceData?.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ledgerBalanceData?.status ==  'Over Budget' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {ledgerBalanceData?.status || 'Available'}
                      </span>
                    </div>
                    {ledgerBalanceData?.budget_info?.budget_head_name && (
                      <div className="text-gray-500 text-[10px] mt-0.5 truncate">
                        {ledgerBalanceData.budget_info.budget_head_name}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

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
                          onKeyDown={(e) =>
                            handlePartyItemKeyDown(e, party, idx)
                          }
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${partyHighlightedIndex == idx ? "bg-blue-100" : "text-gray-700"}`}
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
                  value={localGST}
                  onChange={(e) => setLocalGST(e.target.value.toUpperCase())}
                  onBlur={handleGstBlur}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      handleGstBlur(e);
                      setTimeout(
                        () => amountRefs.current?.[index]?.focus(),
                        50,
                      );
                    }
                  }}
                  className={`w-full pl-10 pr-8 py-2.5 border ${errors[`ChallanDetail_${index}_GST_No`] ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 uppercase ${gstLookupLoading ? "bg-gray-50" : ""}`}
                  placeholder="Enter GST Number (e.g., 24AAAAA0000A1Z)"
                  maxLength={15}
                />
                {gstLookupLoading && (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>
            </div>
            {errors[`ChallanDetail_${index}_GST_No`] && (
              <p className="mt-1 text-xs text-red-600 flex items-center ml-[7.5rem]">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors[`ChallanDetail_${index}_GST_No`]}
              </p>
            )}
          </div>

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
                  value={localAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v == "" || /^\d*\.?\d*$/.test(v)) setLocalAmount(v);
                  }}
                  onBlur={handleAmountBlur}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      onChange(index, "Amount", localAmount);
                      setTimeout(
                        () => penaltyAmountRefs.current?.[index]?.focus(),
                        50,
                      );
                    }
                  }}
                  className={`w-full pl-6 pr-4 py-2.5 border ${errors[`ChallanDetail_${index}_Amount`] ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 text-left`}
                  placeholder="0.00"
                />
              </div>
            </div>
            {errors[`ChallanDetail_${index}_Amount`] && (
              <p className="mt-1 text-xs text-red-600 flex items-center ml-[7.5rem]">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors[`ChallanDetail_${index}_Amount`]}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
                Penalty (₹)
              </label>
              <div className="relative flex-1">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </div>
                <input
                  ref={(el) => {
                    if (penaltyAmountRefs.current)
                      penaltyAmountRefs.current[index] = el;
                  }}
                  type="text"
                  value={localPenalty}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v == "" || /^\d*\.?\d*$/.test(v)) setLocalPenalty(v);
                  }}
                  onBlur={handlePenaltyBlur}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      onChange(index, "Penalty_Amount", localPenalty);
                      setTimeout(
                        () => pyModeRefs.current?.[index]?.focus(),
                        50,
                      );
                    }
                  }}
                  className="w-full pl-6 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Taxation Summary — shown after Penalty, before Payment Mode */}
          <div onMouseDown={flushAmountsBeforeTaxFocus}>
            <TaxCalculationCard
              taxCalculation={taxCalculation || { taxBreakdown: [] }}
              loading={loadingTaxParameters || false}
              totalAmount={parseFloat(localAmount) || 0}
              totalPenalty={parseFloat(localPenalty) || 0}
              onTaxAmountChange={onTaxAmountChange}
              isEditMode={isEditMode}
              isTaxEditMode={isTaxEditMode}
              manualAmounts={manualAmounts}
              onPreview={null}
            />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
                Payment Mode *
              </label>
              <div className="relative flex-1" ref={payModeDropdownRef}>
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                <button
                  ref={(el) => {
                    if (pyModeRefs.current) pyModeRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => {
                    setIsPayModeOpen(!isPayModeOpen);
                    setPayModeSearch("");
                    setPayModeHighlightedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key == "Enter" && !isPayModeOpen) {
                      e.preventDefault();
                      if (detail.Py_Mode) {
                        fileNoRefs.current?.[index]?.focus();
                      } else {
                        setIsPayModeOpen(true);
                        setPayModeSearch("");
                        setTimeout(() => payModeSearchRef.current?.focus(), 0);
                      }
                    } else if (["ArrowDown", "ArrowUp", " "].includes(e.key)) {
                      e.preventDefault();
                      setIsPayModeOpen(true);
                      setPayModeSearch("");
                      setPayModeHighlightedIndex(-1);
                      setTimeout(() => payModeSearchRef.current?.focus(), 0);
                    }
                  }}
                  className={`w-full pl-10 pr-8 py-2.5 border ${errors[`ChallanDetail_${index}_Py_Mode`] ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 text-left bg-white text-sm`}
                >
                  {detail.Py_Mode ? (
                    <span className="text-gray-900 truncate block">
                      {getPayModeDisplay()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select Payment Mode</span>
                  )}
                </button>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

                {isPayModeOpen && (
                  <div
                    className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                    style={{ minWidth: "220px" }}
                  >
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={payModeSearchRef}
                          type="text"
                          value={payModeSearch}
                          onChange={(e) => {
                            setPayModeSearch(e.target.value);
                            setPayModeHighlightedIndex(-1);
                          }}
                          onKeyDown={(e) => {
                            if (e.key == "ArrowDown") {
                              e.preventDefault();
                              if (filteredPayModes.length > 0) {
                                setPayModeHighlightedIndex(0);
                                setTimeout(
                                  () => payModeItemRefs.current[0]?.focus(),
                                  0,
                                );
                              }
                            } else if (e.key == "Escape") {
                              e.preventDefault();
                              setIsPayModeOpen(false);
                              setPayModeSearch("");
                              setPayModeHighlightedIndex(-1);
                              pyModeRefs.current?.[index]?.focus();
                            } else if (e.key == "Enter") {
                              e.preventDefault();
                              const target =
                                payModeHighlightedIndex >= 0
                                  ? filteredPayModes[payModeHighlightedIndex]
                                  : filteredPayModes[0];
                              if (target) handlePayModeSelect(target);
                            }
                          }}
                          placeholder="Search payment mode..."
                          className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {payModeSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayModeSearch("");
                              setPayModeHighlightedIndex(-1);
                              payModeSearchRef.current?.focus();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-48">
                      {filteredPayModes.length > 0 ? (
                        filteredPayModes.map((mode, idx) => {
                          const modeVal = mode.value || mode.PayMd_Name;
                          const modeLabel = mode.label || mode.PayMd_Name;
                          return (
                            <button
                              key={mode.PayMd_ID || modeVal}
                              ref={(el) => {
                                payModeItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() => handlePayModeSelect(mode)}
                              onKeyDown={(e) => {
                                if (e.key == "ArrowDown") {
                                  e.preventDefault();
                                  const next = idx + 1;
                                  if (next < filteredPayModes.length) {
                                    setPayModeHighlightedIndex(next);
                                    setTimeout(
                                      () =>
                                        payModeItemRefs.current[next]?.focus(),
                                      0,
                                    );
                                  } else {
                                    setPayModeHighlightedIndex(-1);
                                    setTimeout(
                                      () => payModeSearchRef.current?.focus(),
                                      0,
                                    );
                                  }
                                } else if (e.key == "ArrowUp") {
                                  e.preventDefault();
                                  if (idx == 0) {
                                    setPayModeHighlightedIndex(-1);
                                    setTimeout(
                                      () => payModeSearchRef.current?.focus(),
                                      0,
                                    );
                                  } else {
                                    setPayModeHighlightedIndex(idx - 1);
                                    setTimeout(
                                      () =>
                                        payModeItemRefs.current[
                                          idx - 1
                                        ]?.focus(),
                                      0,
                                    );
                                  }
                                } else if (e.key == "Enter") {
                                  e.preventDefault();
                                  handlePayModeSelect(mode);
                                } else if (e.key == "Escape") {
                                  e.preventDefault();
                                  setIsPayModeOpen(false);
                                  setPayModeSearch("");
                                  setPayModeHighlightedIndex(-1);
                                  pyModeRefs.current?.[index]?.focus();
                                }
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm border-b border-gray-50 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 ${
                                payModeHighlightedIndex == idx ||
                                detail.Py_Mode == modeVal
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-800"
                              }`}
                              tabIndex={0}
                            >
                              {modeLabel}
                              {detail.Py_Mode == modeVal && (
                                <Check className="inline h-3.5 w-3.5 ml-2 text-blue-600" />
                              )}
                            </button>
                          );
                        })
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
            {errors[`ChallanDetail_${index}_Py_Mode`] && (
              <p className="mt-1 text-xs text-red-600 flex items-center ml-[7.5rem]">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors[`ChallanDetail_${index}_Py_Mode`]}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
                File No.
              </label>
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={(el) => {
                    if (fileNoRefs.current) fileNoRefs.current[index] = el;
                  }}
                  type="text"
                  value={localFileNo}
                  onChange={(e) => setLocalFileNo(e.target.value)}
                  onBlur={() => onChange(index, "FileNo", localFileNo)}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      onChange(index, "FileNo", localFileNo);
                      setTimeout(
                        () => remarksRefs.current?.[index]?.focus(),
                        50,
                      );
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="File No."
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 w-28 shrink-0">
                Remarks
              </label>
              <div className="relative flex-1">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={(el) => {
                    if (remarksRefs.current) remarksRefs.current[index] = el;
                  }}
                  type="text"
                  value={localRemarks}
                  onChange={(e) => setLocalRemarks(e.target.value)}
                  onBlur={() => onChange(index, "Remarks", localRemarks)}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      onChange(index, "Remarks", localRemarks);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Remarks"
                />
              </div>
            </div>
          </div>

          {showChequeFields && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              <div className="text-sm font-medium text-blue-700 flex items-center">
                <Banknote className="h-4 w-4 mr-2" />
                Cheque/DD Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Bank Name <span className="text-red-500"></span>
                  </label>
                  <input
                    ref={(el) => {
                      if (bankNameRefs.current)
                        bankNameRefs.current[index] = el;
                    }}
                    type="text"
                    value={localBankName}
                    onChange={(e) => setLocalBankName(e.target.value)}
                    onBlur={() => onChange(index, "Bank_Name", localBankName)}
                    className={`w-full px-3 py-2 border ${
                      errors[`ChallanDetail_${index}_Bank_Name`]
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="Bank Name (Required)"
                  />
                  {errors[`ChallanDetail_${index}_Bank_Name`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`ChallanDetail_${index}_Bank_Name`]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cheque/DD No.
                  </label>
                  <input
                    ref={(el) => {
                      if (chqNoRefs.current) chqNoRefs.current[index] = el;
                    }}
                    type="text"
                    value={localChqNo}
                    onChange={(e) =>
                      setLocalChqNo(e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={() => onChange(index, "Chq_No", localChqNo)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter only numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cheque/DD Date
                  </label>
                  <input
                    ref={(el) => {
                      if (chqDateRefs.current) chqDateRefs.current[index] = el;
                    }}
                    type="date"
                    value={detail.Chq_Date || ""}
                    onChange={(e) =>
                      onChange(index, "Chq_Date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Receipt Date
                  </label>
                  <input
                    ref={(el) => {
                      if (recDateRefs.current) recDateRefs.current[index] = el;
                    }}
                    type="date"
                    value={detail.Rec_Date || ""}
                    onChange={(e) =>
                      onChange(index, "Rec_Date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {showBankFields && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-3">
              <div className="text-sm font-medium text-green-700 flex items-center">
                <Landmark className="h-4 w-4 mr-2" />
                Bank Transfer Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Bank Name <span className="text-red-500"></span>
                  </label>
                  <input
                    ref={(el) => {
                      if (bankNameRefs.current)
                        bankNameRefs.current[index] = el;
                    }}
                    type="text"
                    value={localBankName}
                    onChange={(e) => setLocalBankName(e.target.value)}
                    onBlur={() => onChange(index, "Bank_Name", localBankName)}
                    className={`w-full px-3 py-2 border ${
                      errors[`ChallanDetail_${index}_Bank_Name`]
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="Bank Name (Required)"
                  />
                  {errors[`ChallanDetail_${index}_Bank_Name`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`ChallanDetail_${index}_Bank_Name`]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Account No.
                  </label>
                  <input
                    ref={(el) => {
                      if (accNoRefs.current) accNoRefs.current[index] = el;
                    }}
                    type="text"
                    value={localAccNo}
                    onChange={(e) => setLocalAccNo(e.target.value)}
                    onBlur={() => onChange(index, "Acc_No", localAccNo)}
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
                      if (ifscRefs.current) ifscRefs.current[index] = el;
                    }}
                    type="text"
                    value={localIFSC}
                    onChange={(e) => setLocalIFSC(e.target.value.toUpperCase())}
                    onBlur={() => onChange(index, "IFSC_Code", localIFSC)}
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
                      if (recDateRefs.current) recDateRefs.current[index] = el;
                    }}
                    type="date"
                    value={detail.Rec_Date || ""}
                    onChange={(e) =>
                      onChange(index, "Rec_Date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

// ==========  MAIN COMPONENT ==========
const CreateNewExpenseChallanUpdate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [loadingTaxParameters, setLoadingTaxParameters] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTaxEditMode, setIsTaxEditMode] = useState(false);
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
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [manualTaxAmounts, setManualTaxAmounts] = useState({});
  const [importing, setImporting] = useState(false);
  const [editingDetailIndex, setEditingDetailIndex] = useState(null);
  const editingDetailIndexRef = useRef(null);
  const [branchBudgetHeadIds, setBranchBudgetHeadIds] = useState([]);
  const [filteredLedgersForBranch, setFilteredLedgersForBranch] = useState([]);
  const [nextVoucherNumber, setNextVoucherNumber] = useState(null);
  const [isFetchingVoucherNo, setIsFetchingVoucherNo] = useState(false);

  // Keep ref in sync with state so useCallback closures can read latest value
  useEffect(() => {
    editingDetailIndexRef.current = editingDetailIndex;
  }, [editingDetailIndex]);
  const fileInputRef = useRef(null);
  const [newPartyDialog, setNewPartyDialog] = useState({
    open: false,
    partyName: "",
    partyCount: 0,
    currentIndex: 0,
    newParties: [],
    resolve: null,
  });

  // Ledger Balance states
  const [ledgerBalanceData, setLedgerBalanceData] = useState(null);
  const [lastCheckedLedgerId, setLastCheckedLedgerId] = useState(null);

  const [taxPopup, setTaxPopup] = useState({
    open: false,
    taxes: null,
    rowIndex: null,
  });

  const openRowTaxPopup = (taxes, rowIndex) => {
    setTaxPopup({ open: true, taxes: [...taxes], rowIndex });
    document.body.style.overflow = "hidden";
  };

  const closeRowTaxPopup = () => {
    setTaxPopup({ open: false, taxes: null, rowIndex: null });
    document.body.style.overflow = "";
  };

  const handleTaxPopupAmountChange = (taxIdx, value) => {
    if (value == "" || /^\d*\.?\d*$/.test(value)) {
      setTaxPopup((prev) => {
        const updated = [...prev.taxes];
        updated[taxIdx] = { ...updated[taxIdx], _editValue: value };
        return { ...prev, taxes: updated };
      });
    }
  };
  const isManualFormula = (formula) => {
    if (!formula) return false;
    const trimmed = formula.trim();
    return trimmed == "*" || trimmed == "* " || trimmed == " *";
  };
  // Helper function to merge tax snapshot with tender type parameters
  const mergeTaxesWithTenderParams = useCallback(
    (snapshotTaxes, tenderParams, amount) => {
      if (!tenderParams || tenderParams.length == 0) {
        return {
          taxBreakdown: [],
          totalAdd: 0,
          totalLess: 0,
          netAmount: amount || 0,
        };
      }

      const snapshotMap = {};
      (snapshotTaxes || []).forEach((t) => {
        if (t.VIP_Id) {
          snapshotMap[t.VIP_Id] = t;
        }
      });

      let totalAdd = 0;
      let totalLess = 0;
      let runningAmount = amount || 0;

      const taxBreakdown = tenderParams.map((param) => {
        const taxType =
          param.invoice_charge?.IC_Name ||
          param.invoice_charge?.IC_Code ||
          param.IC_Name ||
          param.IC_Code ||
          "Tax";
        const isManual = isManualFormula(param.Formula ?? "");
        const existing = snapshotMap[param.VIP_Id];
        const calculatedAmount = existing ? existing.calculatedAmount || 0 : 0;
        const isAdd = param.Add_Dedu == 1 || param.Add_Dedu == "1";

        if (isAdd) {
          totalAdd += calculatedAmount;
        } else {
          totalLess += calculatedAmount;
        }

        return {
          ...param,
          calculatedAmount,
          displayText: existing
            ? existing.displayText || `${taxType} (${param.Percent || 0}%)`
            : isManual
              ? taxType
              : `${taxType} (${param.Percent || 0}%)`,
          taxType,
          isAdd,
          isTax: true,
          type: "tax",
          isManual: isManual || (existing ? existing.isManual : false),
          percentage: parseFloat(param.Percent) || 0,
          formula: param.Formula ?? null,
          VIP_Id: param.VIP_Id,
          IC_Id: param.IC_Id,
          Lg_Id: param.Lg_Id,
        };
      });

      return {
        taxBreakdown,
        totalAdd,
        totalLess,
        netAmount: (amount || 0) + totalAdd - totalLess,
      };
    },
    [isManualFormula],
  );

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
      toast.info(`No ledgers found for this branch's budget heads.`);
      setBranchBudgetHeadIds([]);
      setFilteredLedgersForBranch([]);
    } finally {
      setLoadingLedgers(false);
    }
  };

  const saveTaxPopupChanges = () => {
    const { taxes, rowIndex } = taxPopup;
    if (rowIndex == null) {
      closeRowTaxPopup();
      return;
    }
    // Build updated snapshot — apply _editValue for manual taxes
    const updatedSnapshot = taxes.map((t) => ({
      ...t,
      calculatedAmount:
        t.isManual && t._editValue != undefined
          ? parseFloat(t._editValue) || 0
          : t.calculatedAmount || 0,
      _editValue: undefined,
    }));
    setFormData((prev) => {
      const updatedDetails = [...prev.Challan_Detail];
      updatedDetails[rowIndex] = {
        ...updatedDetails[rowIndex],
        taxSnapshot: updatedSnapshot,
      };
      return { ...prev, Challan_Detail: updatedDetails };
    });
    closeRowTaxPopup();
    toast.success("Tax updated successfully");
  };

  const [tenderTaxParameters, setTenderTaxParameters] = useState([]);
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
    tenderTypes: [],
    paymentModes: [],
    subLedgers: [],
  });

  const [filteredBranches, setFilteredBranches] = useState([]);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchHighlightedIndex, setBranchHighlightedIndex] = useState(-1);
  const branchDropdownRef = useRef(null);
  const branchSearchRef = useRef(null);
  const branchItemRefs = useRef([]);
  const branchListRef = useRef(null);
  const branchButtonRef = useRef(null);

  const [filteredTenderTypes, setFilteredTenderTypes] = useState([]);
  const [tenderTypeSearchTerm, setTenderTypeSearchTerm] = useState("");
  const [isTenderTypeDropdownOpen, setIsTenderTypeDropdownOpen] =
    useState(false);
  const [tenderTypeHighlightedIndex, setTenderTypeHighlightedIndex] =
    useState(-1);
  const tenderTypeDropdownRef = useRef(null);
  const tenderTypeSearchRef = useRef(null);
  const tenderTypeItemRefs = useRef([]);
  const tenderTypeListRef = useRef(null);
  const tenderTypeButtonRef = useRef(null);

  const dateInputRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const ledgerRefs = useRef([]);
  const slNameRefs = useRef([]);
  const gstNoRefs = useRef([]);
  const amountRefs = useRef([]);
  const penaltyAmountRefs = useRef([]);
  const pyModeRefs = useRef([]);
  const fileNoRefs = useRef([]);
  const remarksRefs = useRef([]);
  const chqDateRefs = useRef([]);
  const ifscRefs = useRef([]);
  const accNoRefs = useRef([]);
  const chqNoRefs = useRef([]);
  const recDateRefs = useRef([]);
  const bankNameRefs = useRef([]);
  const taxRecalcTimerRef = useRef(null);
  const recalcFnRef = useRef(null);

  const [formData, setFormData] = useState({
    Ch_Date: new Date().toISOString().split("T")[0],
    CV_No: "",
    Dpt_Id: "",
    TnT_Id: "",
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
        Penalty_Amount: "",
        Py_Mode: "",
        FileNo: "",
        Remarks: "",
        Chq_Date: "",
        Bank_Name: "",
        IFSC_Code: "",
        Acc_No: "",
        Chq_No: "",
        Rec_Date: "",
      },
    ],
  });

  const [selectedBranch, setSelectedBranch] = useState(null);

  const userId = (() => {
    if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
    if (user?.Usr_Id) return user.Usr_Id;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch (e) {}
    }
    const sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
      try {
        const userData = JSON.parse(sessionUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch (e) {}
    }
    return null;
  })();

  const currentModule = (() => {
    var cModule;
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details"));
      for (var i = 0; i < menuDetails.length; i++) {
        if (
          menuDetails[i].Menu_Links ==
          "/transactions/bookkeeping-vouchers/new-expense-challan-update"
        ) {
          cModule = menuDetails[i].Mod_Code;
        }
      }
      if (cModule) {
        return cModule;
      } else {
        return "";
      }
    } catch (error) {
      return "CHAL";
    }
  })();

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

  const fetchingLedgerRef = useRef(null);

  const checkLedgerBalance = useCallback(
    async (lgId) => {
      if (!lgId) {
        setLedgerBalanceData(null);
        setLastCheckedLedgerId(null);
        fetchingLedgerRef.current = null;
        return;
      }

      if (lastCheckedLedgerId == lgId && ledgerBalanceData) {
        return;
      }

      if (fetchingLedgerRef.current == lgId) {
        return;
      }

      fetchingLedgerRef.current = lgId;
      if (lastCheckedLedgerId != lgId) {
        setLedgerBalanceData(null);
      }
      setLoadingBalance(true);
      try {
        const response =
          await newChallanFlowService.getLedgerAvailableBalance(lgId);
        if (response.success) {
          setLedgerBalanceData(response.data);
          setLastCheckedLedgerId(lgId);
        } else {
          toast.error("Failed to fetch ledger balance");
          setLedgerBalanceData(null);
        }
      } catch (error) {
        console.error("Error checking ledger balance:", error);
        toast.error(error.message || "Failed to fetch ledger balance");
        setLedgerBalanceData(null);
      } finally {
        if (fetchingLedgerRef.current == lgId) {
          fetchingLedgerRef.current = null;
        }
        setLoadingBalance(false);
      }
    },
    [lastCheckedLedgerId, ledgerBalanceData],
  );

  const calculateTotals = () => {
    let total = 0;
    let totalPenaltyAmount = 0;
    let cash = 0;
    let bank = 0;
    let cheque = 0;
    let dd = 0;
    let online = 0;
    let card = 0;

    // Only count committed rows (all except the last new-entry row)
    const committedRows = formData.Challan_Detail.slice(0, -1);

    committedRows.forEach((detail) => {
      const amount = parseFloat(detail.Amount) || 0;
      const penalty = parseFloat(detail.Penalty_Amount) || 0;

      total += amount;
      totalPenaltyAmount += penalty;

      const mode = detail.Py_Mode;
      switch (mode) {
        case "Cash":
          cash += amount;
          break;
        case "Bank":
          bank += amount;
          break;
        case "Cheque":
          cheque += amount;
          break;
        case "DD":
          dd += amount;
          break;
        case "Online":
          online += amount;
          break;
        case "Card":
          card += amount;
          break;
        default:
          break;
      }
    });

    return {
      total,
      cash,
      bank,
      cheque,
      dd,
      online,
      card,
      totalPenalty: totalPenaltyAmount,
    };
  };

  // Compute Net_Amount from committed rows' taxSnapshots
  const computeNetAmountFromSnapshots = (details) => {
    const committed = details.slice(0, -1);
    let net = 0;
    committed.forEach((d) => {
      const amount = parseFloat(d.Amount) || 0;
      const penalty = parseFloat(d.Penalty_Amount) || 0;
      const snap = d.taxSnapshot || [];
      const taxAdd = snap
        .filter((t) => t.isAdd)
        .reduce((s, t) => s + (t.calculatedAmount || 0), 0);
      const taxLess = snap
        .filter((t) => !t.isAdd)
        .reduce((s, t) => s + (t.calculatedAmount || 0), 0);
      net += amount + taxAdd - taxLess - penalty;
    });
    return net;
  };

  useEffect(() => {
    const newSummary = calculateTotals();
    setSummary({
      total: newSummary.total,
      cash: newSummary.cash,
      bank: newSummary.bank,
      cheque: newSummary.cheque,
      dd: newSummary.dd,
      online: newSummary.online,
      card: newSummary.card,
    });
    setTotalPenalty(newSummary.totalPenalty);
    setFormData((prev) => ({
      ...prev,
      Total_Amount: newSummary.total.toString(),
    }));

    // Net_Amount = sum of each committed row's (amount + taxAdd - taxLess - penalty)
    const netFromSnapshots = computeNetAmountFromSnapshots(
      formData.Challan_Detail,
    );
    setFormData((prev) => ({
      ...prev,
      Net_Amount: netFromSnapshots > 0 ? netFromSnapshots.toString() : "0",
    }));

    // Only reset live tax when there is no committed total AND the active entry row has no amount.
    // Summary totals exclude the last (in-progress) row, so focusing Taxation Summary must not clear tax.
    if (newSummary.total == 0) {
      const activeIdx =
        editingDetailIndexRef.current != null
          ? editingDetailIndexRef.current
          : formData.Challan_Detail.length - 1;
      const activeAmount =
        parseFloat(formData.Challan_Detail[activeIdx]?.Amount) || 0;
      if (activeAmount <= 0) {
        setTaxCalculation({
          grossAmount: 0,
          netAmount: 0,
          taxBreakdown: [],
          totalAdd: 0,
          totalLess: 0,
          totalTax: 0,
        });
        setManualTaxAmounts({});
      }
    }
  }, [formData.Challan_Detail]);

  const recalculateTaxesWithManualOverrides = (
    totalAmount,
    taxParams,
    manualOverrides = {},
  ) => {
    if (
      !totalAmount ||
      totalAmount <= 0 ||
      !taxParams ||
      taxParams.length == 0
    ) {
      return {
        grossAmount: totalAmount || 0,
        netAmount: totalAmount || 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      };
    }

    const taxBreakdown = [];
    let totalAdd = 0;
    let totalLess = 0;
    let runningAmount = totalAmount;
    const calculatedTaxAmounts = { GROS: totalAmount };

    const roundHalfUp = (num) => Math.round(num * 100) / 100;

    taxParams.forEach((param) => {
      let taxAmount = 0;
      const taxPercentage = parseFloat(param.Percent) || 0;
      const taxType =
        param.invoice_charge?.IC_Name ||
        param.invoice_charge?.IC_Code ||
        param.IC_Name ||
        param.IC_Code ||
        "Tax";
      const isAdd = param.Add_Dedu == 1 || param.Add_Dedu == "1";
      const formula = String(param.Formula || "").toUpperCase();
      const isManual = isManualFormula(formula);
      const overrideKey = param.VIP_Id;

      if (
        isManual &&
        manualOverrides &&
        manualOverrides[overrideKey] != undefined &&
        manualOverrides[overrideKey] != null
      ) {
        taxAmount = parseFloat(manualOverrides[overrideKey]) || 0;
      } else if (!isManual) {
        if (formula && formula != "*") {
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
                expression = expression.replace(
                  regex,
                  taxPercentage.toString(),
                );
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
        displayText: isManual
          ? taxType
          : taxPercentage > 0
            ? `${taxType} (${taxPercentage}%)`
            : taxType,
        taxType: taxType,
        isAdd: isAdd,
        isTax: true,
        type: "tax",
        VIP_Id: param.VIP_Id,
        IC_Id: param.IC_Id,
        Lg_Id: param.Lg_Id,
        percentage: taxPercentage,
        formula: formula,
        isManual: isManual,
      });
    });

    const netAmount = roundHalfUp(runningAmount);

    return {
      grossAmount: roundHalfUp(totalAmount),
      netAmount,
      taxBreakdown,
      totalAdd: roundHalfUp(totalAdd),
      totalLess: roundHalfUp(totalLess),
      totalTax: roundHalfUp(totalAdd - totalLess),
    };
  };

  const calculateTaxes = (totalAmount, taxParams, manualOverrides = {}) => {
    const result = recalculateTaxesWithManualOverrides(
      totalAmount,
      taxParams,
      manualOverrides,
    );
    setTaxCalculation(result);
    // Net_Amount is now driven by committed rows' snapshots — don't set it here
  };

  // Keep recalcFnRef always pointing to the latest recalculateTaxesWithManualOverrides
  recalcFnRef.current = recalculateTaxesWithManualOverrides;

  const handleTaxPreview = (previewData) => {
    setTaxPopup({
      open: true,
      taxCalculation: previewData.taxCalculation,
      totalAmount: previewData.totalAmount,
      totalPenalty: previewData.totalPenalty,
    });
  };

  useEffect(() => {
    if (tenderTaxParameters.length > 0) {
      // Only recalculate the live entry form's taxCalculation — do NOT touch Net_Amount here
      // Net_Amount is driven by committed rows' snapshots in the Challan_Detail useEffect
      const activeIdx =
        editingDetailIndex != null
          ? editingDetailIndex
          : formData.Challan_Detail.length - 1;
      const activeAmount =
        parseFloat(formData.Challan_Detail[activeIdx]?.Amount) || 0;
      const recalc = recalculateTaxesWithManualOverrides(
        activeAmount,
        tenderTaxParameters,
        manualTaxAmounts,
      );
      setTaxCalculation(recalc);
    } else if (tenderTaxParameters.length == 0 && !isEditMode) {
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
    }
  }, [
    tenderTaxParameters,
    manualTaxAmounts,
    formData.Challan_Detail,
    editingDetailIndex,
  ]);

  const loadTaxParametersForTenderType = async (
    tenderTypeId,
    existingManualOverrides = null,
  ) => {
    if (!tenderTypeId) {
      setTenderTaxParameters([]);
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
        await newChallanFlowService.getTaxParametersByTenderType(tenderTypeId);

      if (response.success && response.data && response.data.length > 0) {
        const taxData = response.data[0];
        const parameters = taxData.parameters || [];

        const processedParams = parameters.map((param) => ({
          ...param,
          Add_Dedu: param.Add_Dedu == 1 || param.Add_Dedu == "1" ? 1 : 0,
          Percent: param.Percent,
          Formula: param.Formula ?? null,
          IC_Id: param.IC_Id,
          Lg_Id: param.Lg_Id,
          VIP_Id: param.VIP_Id,
          invoice_charge: param.invoice_charge,
          ledger: param.ledger,
        }));

        setTenderTaxParameters(processedParams);

        if (
          existingManualOverrides &&
          Object.keys(existingManualOverrides).length > 0
        ) {
          setManualTaxAmounts(existingManualOverrides);
          calculateTaxes(
            summary.total,
            processedParams,
            existingManualOverrides,
          );
        } else if (!isEditMode) {
          setManualTaxAmounts({});
          calculateTaxes(summary.total, processedParams, {});
        }
      } else {
        setTenderTaxParameters([]);
        if (!isEditMode) {
          toast.info("No tax parameters found for this tender type");
        }
      }
    } catch (error) {
      console.error("Error loading tax parameters:", error);
      if (!isEditMode) {
        toast.error("Failed to load tax parameters");
      }
      setTenderTaxParameters([]);
    } finally {
      setLoadingTaxParameters(false);
    }
  };

  useEffect(() => {
    if (
      !isEditMode &&
      dropdownData.tenderTypes.length > 0 &&
      !formData.TnT_Id
    ) {
      const generalWork = dropdownData.tenderTypes.find(
        (type) =>
          type.TnT_Name == "General Work" ||
          type.TnT_Name?.toLowerCase().includes("general"),
      );
      if (generalWork) {
        setFormData((prev) => ({
          ...prev,
          TnT_Id: generalWork.TnT_ID?.toString(),
        }));
      }
    }
  }, [dropdownData.tenderTypes, isEditMode, formData.TnT_Id]);

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
        "/transactions/bookkeeping-vouchers/new-expense-challan-update";
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
      const response = await newChallanFlowService.getAllByStage(stage);

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
            toast.error("You don't have permission to create Expense Bill");
            navigate(
              "/transactions/bookkeeping-vouchers/new-expense-challan-update",
            );
          }
        } else if (isAdmin) {
          setHasCreatePermission(true);
        }
      }
    } catch (error) {
      console.error("Error loading actions for stage:", error);
    }
  };

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
        tenderTypeDropdownRef.current &&
        !tenderTypeDropdownRef.current.contains(event.target)
      ) {
        setIsTenderTypeDropdownOpen(false);
        setTenderTypeHighlightedIndex(-1);
        setTenderTypeSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  useEffect(() => {
    if (!isEditMode && formData.TnT_Id) {
      loadTaxParametersForTenderType(formData.TnT_Id);
    } else if (!isEditMode && !formData.TnT_Id) {
      setTenderTaxParameters([]);
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: [],
        totalAdd: 0,
        totalLess: 0,
        totalTax: 0,
      });
    }
  }, [formData.TnT_Id, isEditMode]);

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
    if (isTenderTypeDropdownOpen && tenderTypeSearchRef.current) {
      setTimeout(() => tenderTypeSearchRef.current.focus(), 0);
    }
  }, [isTenderTypeDropdownOpen]);

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
      tenderTypeListRef,
      tenderTypeItemRefs,
      tenderTypeHighlightedIndex,
      isTenderTypeDropdownOpen,
    );
  }, [tenderTypeHighlightedIndex, isTenderTypeDropdownOpen]);

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
    if (!tenderTypeSearchTerm.trim()) {
      setFilteredTenderTypes(dropdownData.tenderTypes);
    } else {
      const term = tenderTypeSearchTerm.toLowerCase();
      const filtered = dropdownData.tenderTypes.filter(
        (type) =>
          type.TnT_Name?.toLowerCase().includes(term) ||
          (type.TnT_Code && type.TnT_Code.toLowerCase().includes(term)),
      );
      setFilteredTenderTypes(filtered);
    }
    setTenderTypeHighlightedIndex(-1);
  }, [tenderTypeSearchTerm, dropdownData.tenderTypes]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [
        branches,
        allLedgers,
        tenderTypes,
        paymentModesFromApi,
        subLedgers,
      ] = await Promise.all([
        newChallanFlowService.getBranches(),
        newChallanFlowService.getAllLedgers(),
        newChallanFlowService.getTenderTypes(),
        newChallanFlowService.getPaymentModes(),
        newChallanFlowService.getSubLedgers(),
      ]);

      const filterPaymentModes = paymentModesFromApi.filter(
        (b) => b.Is_Chl == 0,
      );

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
        tenderTypes: tenderTypes || [],
        paymentModes: filterPaymentModes || [],
        subLedgers: subLedgers || [],
      }));

      // Initially set filtered ledgers to all ledgers
      setFilteredLedgersForBranch(ledgersToUse);

      // If editing mode, fetch budget heads for the branch
      if (isEditMode && formData.Dpt_Id) {
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

  // Load tax parameters when in edit mode and tender type is set
  useEffect(() => {
    if (isEditMode && formData.TnT_Id && tenderTaxParameters.length == 0) {
      const loadTaxParams = async () => {
        setLoadingTaxParameters(true);
        try {
          const response =
            await newChallanFlowService.getTaxParametersByTenderType(
              formData.TnT_Id,
            );
          if (response.success && response.data && response.data.length > 0) {
            const taxData = response.data[0];
            const parameters = taxData.parameters || [];
            const processedParams = parameters.map((param) => ({
              ...param,
              Add_Dedu: param.Add_Dedu == 1 || param.Add_Dedu == "1" ? 1 : 0,
              Percent: param.Percent,
              Formula: param.Formula ?? null,
              IC_Id: param.IC_Id,
              Lg_Id: param.Lg_Id,
              VIP_Id: param.VIP_Id,
              invoice_charge: param.invoice_charge,
              ledger: param.ledger,
            }));
            setTenderTaxParameters(processedParams);

            // Show all taxes with 0 for the new row
            const allTaxBreakdown = processedParams.map((param) => {
              const taxType =
                param.invoice_charge?.IC_Name ||
                param.invoice_charge?.IC_Code ||
                param.IC_Name ||
                param.IC_Code ||
                "Tax";
              return {
                ...param,
                calculatedAmount: 0,
                displayText: isManualFormula(param.Formula ?? "")
                  ? taxType
                  : `${taxType} (${param.Percent || 0}%)`,
                taxType: taxType,
                isAdd: param.Add_Dedu == 1 || param.Add_Dedu == "1",
                isTax: true,
                type: "tax",
                isManual: isManualFormula(param.Formula ?? ""),
                percentage: parseFloat(param.Percent) || 0,
                formula: param.Formula ?? null,
                VIP_Id: param.VIP_Id,
                IC_Id: param.IC_Id,
                Lg_Id: param.Lg_Id,
              };
            });

            setTaxCalculation({
              grossAmount: 0,
              netAmount: 0,
              taxBreakdown: allTaxBreakdown,
              totalAdd: 0,
              totalLess: 0,
              totalTax: 0,
            });
          }
        } catch (error) {
          console.error("Error loading tax parameters in edit mode:", error);
        } finally {
          setLoadingTaxParameters(false);
        }
      };
      loadTaxParams();
    }
  }, [isEditMode, formData.TnT_Id, tenderTaxParameters.length]);

  const handleDownloadSample = () => downloadSampleTemplate();

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension)) {
      return toast.error("Please upload an Excel file (.xlsx, .xls, or .csv)");
    }

    // Check if tender type is selected
    if (!formData.TnT_Id) {
      toast.error("Please select a Tender Type first before importing.");
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImporting(true);
    try {
      const result = await parseExcelToBillDetails(
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

      // Get tax parameters for matching
      const taxParams = tenderTaxParameters;

      // Check ALL rows for tax name matching
      let allTaxesMatch = true;
      const unmatchedTaxes = new Set();
      const rowsWithTaxes = [];
      const rowsWithoutTaxes = [];

      importedRows.forEach((detail, idx) => {
        const rowNum = idx + 1;

        if (detail._taxes && detail._taxes.length > 0) {
          rowsWithTaxes.push(rowNum);

          detail._taxes.forEach((importedTax) => {
            const taxNameLower = importedTax.name.toLowerCase().trim();

            // Check if this tax name exists in the tender's tax parameters
            const matchedParam = taxParams.find((p) => {
              const icName = (p.invoice_charge?.IC_Name || p.IC_Name || "")
                .toLowerCase()
                .trim();
              const icCode = (p.invoice_charge?.IC_Code || p.IC_Code || "")
                .toLowerCase()
                .trim();

              return icName == taxNameLower || icCode == taxNameLower;
            });

            if (!matchedParam) {
              allTaxesMatch = false;
              unmatchedTaxes.add(importedTax.name);
            }
          });
        } else {
          // Row has no taxes
          rowsWithoutTaxes.push(rowNum);
        }
      });

      // If any tax doesn't match, cancel ENTIRE import
      if (!allTaxesMatch) {
        const unmatchedList = Array.from(unmatchedTaxes).join(", ");
        toast.error(
          `Tax '${unmatchedList}' not found in tax parameters for the selected Tender Type. Import cancelled.`,
        );
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // ALL taxes match in ALL rows - proceed with import
      // Build details with tax snapshots from imported data
      const importedDetails = importedRows.map((detail, idx) => {
        const taxSnapshot = [];

        // Build tax snapshot from matched taxes
        if (detail._taxes && detail._taxes.length > 0) {
          detail._taxes.forEach((importedTax) => {
            const taxNameLower = importedTax.name.toLowerCase().trim();

            // Find matching parameter again (we already know it exists)
            const matchedParam = taxParams.find((p) => {
              const icName = (p.invoice_charge?.IC_Name || p.IC_Name || "")
                .toLowerCase()
                .trim();
              const icCode = (p.invoice_charge?.IC_Code || p.IC_Code || "")
                .toLowerCase()
                .trim();

              return (
                icName == taxNameLower ||
                icCode == taxNameLower ||
                icName.includes(taxNameLower) ||
                taxNameLower.includes(icName)
              );
            });

            if (matchedParam) {
              taxSnapshot.push({
                VIP_Id: matchedParam.VIP_Id,
                IC_Id: matchedParam.IC_Id,
                Lg_Id: matchedParam.Lg_Id,
                taxType: importedTax.name,
                displayText: importedTax.name,
                calculatedAmount: importedTax.amount,
                isAdd:
                  matchedParam.Add_Dedu == 1 || matchedParam.Add_Dedu == "1",
                isManual: false,
                percentage: parseFloat(matchedParam.Percent) || 0,
                formula: matchedParam.Formula || null,
              });
            }
          });
        }

        // Remove _taxes from the detail
        const { _taxes, ...cleanDetail } = detail;

        return {
          ...cleanDetail,
          CV_Sr: idx + 1,
          taxSnapshot: taxSnapshot,
        };
      });

      // Add trailing empty row
      importedDetails.push({
        CV_Sr: importedDetails.length + 1,
        Lg_Id: "",
        Bh_Id: "",
        SL_Nm: "",
        GST_No: "",
        SL_Id: null,
        Amount: "",
        Penalty_Amount: "",
        Py_Mode: "",
        FileNo: "",
        Remarks: "",
        Chq_Date: "",
        Bank_Name: "",
        IFSC_Code: "",
        Acc_No: "",
        Chq_No: "",
        Rec_Date: "",
        taxSnapshot: [],
      });

      setFormData((prev) => ({ ...prev, Challan_Detail: importedDetails }));
      setManualTaxAmounts({});
      setEditingDetailIndex(null);

      // Count total taxes imported
      let totalTaxCount = 0;
      importedDetails.slice(0, -1).forEach((d) => {
        if (d.taxSnapshot && d.taxSnapshot.length > 0) {
          totalTaxCount += d.taxSnapshot.length;
        }
      });

      // Set up tax calculation for the active row
      if (importedDetails.length > 1 && taxParams.length > 0) {
        const firstRowWithTaxes = importedDetails
          .slice(0, -1)
          .find((d) => d.taxSnapshot && d.taxSnapshot.length > 0);

        if (firstRowWithTaxes) {
          // Build tax parameters from the matched taxes
          const matchedTaxParams = firstRowWithTaxes.taxSnapshot.map((t) => ({
            VIP_Id: t.VIP_Id,
            IC_Id: t.IC_Id,
            Lg_Id: t.Lg_Id,
            Percent: t.percentage || 0,
            Formula: t.formula || "*",
            Add_Dedu: t.isAdd ? 1 : 0,
            invoice_charge: { IC_Name: t.taxType, IC_Code: t.taxType },
            calculatedAmount: t.calculatedAmount || 0,
            taxType: t.taxType,
            isAdd: t.isAdd,
            isManual: false,
            percentage: t.percentage || 0,
            formula: t.formula || "*",
            displayText: t.displayText || t.taxType,
          }));

          // Set manual overrides
          const manualOverrides = {};
          firstRowWithTaxes.taxSnapshot.forEach((t) => {
            if (t.VIP_Id) manualOverrides[t.VIP_Id] = t.calculatedAmount || 0;
          });

          setTenderTaxParameters(matchedTaxParams);
          setManualTaxAmounts(manualOverrides);

          // Calculate tax for the active row
          const activeRow = importedDetails[importedDetails.length - 2];
          const activeAmount = parseFloat(activeRow?.Amount) || 0;

          if (activeAmount > 0) {
            const recalc = recalculateTaxesWithManualOverrides(
              activeAmount,
              matchedTaxParams,
              manualOverrides,
            );
            setTaxCalculation(recalc);
          } else {
            const zeroRecalc = recalculateTaxesWithManualOverrides(
              0,
              matchedTaxParams,
              manualOverrides,
            );
            setTaxCalculation(zeroRecalc);
          }
        }
      }

      // Show success message
      toast.success(`✅ Successfully imported ${importedRows.length} row(s).`);

      // Show warnings if any
      if (warnings.length > 0) {
        warnings
          .slice(0, 5)
          .forEach((w) => toast(w, { icon: "⚠️", duration: 4000 }));
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error?.errors?.[0] || "Failed to import file");
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
        (ledger) => ledger.ledger_group && ledger.ledger_group.Gr_Buk == "N",
      );
      setDropdownData((prev) => ({ ...prev, ledgers: ledgersToUse }));

      let taxParametersFromDetails = [];
      let manualOverridesFromDetails = {};
      let totalPenaltyFromDetails = 0;
      let taxBreakdownFromDetails = [];
      let totalAddAmount = 0;
      let totalLessAmount = 0;

      const existingDetails = voucherData?.details || [];

      if (existingDetails.length > 0) {
        const firstDetailPayDetails = existingDetails[0]?.pay_details || [];

        const taxParams = firstDetailPayDetails
          .filter((pd) => pd.PD_Ty == "TAX")
          .map((pd) => ({
            VIP_Id: pd.VIP_Id,
            IC_Id: pd.IC_Id,
            Lg_Id: pd.Lg_Id,
            Percent: pd.Percent?.toString() || "0",
            Formula: pd.Formula ?? null,
            Add_Dedu: pd.Add_Dedu == "1" || pd.Add_Dedu == 1 ? 1 : 0,
            invoice_charge: pd.invoice_charge,
            ledger: pd.ledger,
            calculatedAmount: parseFloat(pd.IC_Amt) || 0,
          }));

        taxParametersFromDetails = taxParams;

        firstDetailPayDetails
          .filter((pd) => pd.PD_Ty == "TAX")
          .forEach((pd) => {
            if (isManualFormula(pd.Formula || "")) {
              manualOverridesFromDetails[pd.VIP_Id] =
                parseFloat(pd.IC_Amt) || 0;
            }
          });

        taxBreakdownFromDetails = firstDetailPayDetails.map((pd) => {
          const isAdd = pd.Add_Dedu == "1" || pd.Add_Dedu == 1;
          const amount = parseFloat(pd.IC_Amt) || 0;
          const isPenalty = pd.PD_Ty == "PENLTY";
          const isManual = isManualFormula(pd.Formula || "");

          if (isPenalty) totalPenaltyFromDetails += amount;
          if (isAdd) totalAddAmount += amount;
          else totalLessAmount += amount;

          return {
            ...pd,
            calculatedAmount: amount,
            displayText: isPenalty
              ? "Penalty Amount"
              : `${pd.invoice_charge?.IC_Name || pd.invoice_charge?.IC_Code || pd.IC_Name || pd.IC_Code || "Tax"}${parseFloat(pd.Percent) > 0 ? ` (${pd.Percent}%)` : ""}`,
            isAdd,
            isTax: !isPenalty,
            isPenalty,
            type: isPenalty ? "penalty" : "tax",
            percentage: isPenalty ? 0 : parseFloat(pd.Percent),
            formula: pd.Formula,
            VIP_Id: pd.VIP_Id,
            IC_Id: pd.IC_Id,
            Lg_Id: pd.Lg_Id,
            taxType:
              pd.invoice_charge?.IC_Name ||
              pd.invoice_charge?.IC_Code ||
              pd.IC_Name ||
              pd.IC_Code ||
              "Tax",
          };
        });
      }

      const newFormData = {
        Ch_Date: voucherData?.Ch_Date
          ? new Date(voucherData.Ch_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        CV_No: voucherData?.CV_No || "",
        Dpt_Id:
          voucherData?.department?.Dpt_id?.toString() ||
          voucherData?.Dpt_Id?.toString() ||
          "",
        TnT_Id:
          voucherData?.tender_type?.TnT_ID?.toString() ||
          voucherData?.TnT_Id?.toString() ||
          "",
        Total_Amount: voucherData?.Total_Amount?.toString() || "",
        Net_Amount: voucherData?.Net_Amount?.toString() || "",
        Challan_Detail: existingDetails.map((detail, idx) => {
          const penaltyEntry = (detail.pay_details || []).find(
            (pd) => pd.PD_Ty == "PENLTY",
          );
          const penaltyAmt = penaltyEntry
            ? parseFloat(penaltyEntry.IC_Amt) || 0
            : parseFloat(detail.Penalty_Amount) || 0;

          // Build taxSnapshot from this row's pay_details
          const rowTaxSnapshot = (detail.pay_details || [])
            .filter((pd) => pd.PD_Ty == "TAX")
            .map((pd) => {
              const icName =
                pd.invoice_charge?.IC_Name ||
                pd.invoice_charge?.IC_Code ||
                pd.IC_Name ||
                pd.IC_Code ||
                "Tax";
              const pct = parseFloat(pd.Percent) || 0;
              return {
                VIP_Id: pd.VIP_Id,
                IC_Id: pd.IC_Id,
                Lg_Id: pd.Lg_Id,
                taxType: icName,
                displayText: isManualFormula(pd.Formula ?? "")
                  ? icName
                  : pct > 0
                    ? `${icName} (${pd.Percent}%)`
                    : icName,
                calculatedAmount: parseFloat(pd.IC_Amt) || 0,
                isAdd: pd.Add_Dedu == "1" || pd.Add_Dedu == 1,
                isManual: isManualFormula(pd.Formula ?? ""),
                percentage: pct,
                formula: pd.Formula ?? null,
              };
            });

          return {
            CV_Sr: idx + 1,
            Lg_Id: detail.Lg_Id?.toString() || "",
            Bh_Id: detail.Bh_Id?.toString() || "",
            SL_Nm: detail.SL_Nm || "",
            GST_No: (detail.GST_No || "").toUpperCase(),
            SL_Id: detail.SL_Id || null,
            Amount: detail.Amount?.toString() || "",
            Penalty_Amount: penaltyAmt.toString(),
            PayMd_ID: detail.PayMd_ID?.toString() || null,
            Py_Mode: detail.Payment_Mode || detail.Py_Mode || "",
            FileNo: detail.FileNo || "",
            Remarks: detail.Remarks || "",
            Chq_Date: detail.Chq_Date || "",
            Bank_Name: detail.Bank_Name || "",
            IFSC_Code: detail.IFSC_Code || "",
            Acc_No: detail.Acc_No?.toString() || "",
            Chq_No: detail.Chq_No?.toString() || "",
            Rec_Date: detail.Rec_Date || "",
            taxSnapshot: rowTaxSnapshot,
          };
        }),
      };

      // Append a trailing empty row so the table (slice(0,-1)) shows all existing rows
      newFormData.Challan_Detail.push({
        CV_Sr: newFormData.Challan_Detail.length + 1,
        Lg_Id: "",
        Bh_Id: "",
        SL_Nm: "",
        GST_No: "",
        SL_Id: null,
        Amount: "",
        Penalty_Amount: "",
        Py_Mode: "",
        FileNo: "",
        Remarks: "",
        Chq_Date: "",
        Bank_Name: "",
        IFSC_Code: "",
        Acc_No: "",
        Chq_No: "",
        Rec_Date: "",
        taxSnapshot: [],
      });

      if (voucherData?.department || voucherData?.Dpt_Id) {
        setSelectedBranch(
          voucherData.department || { Dpt_id: voucherData.Dpt_Id },
        );
      }

      setFormData(newFormData);

      const calcTotal = newFormData.Challan_Detail.slice(0, -1).reduce(
        (sum, d) => sum + (parseFloat(d.Amount) || 0),
        0,
      );
      const calcPenalty = newFormData.Challan_Detail.slice(0, -1).reduce(
        (sum, d) => sum + (parseFloat(d.Penalty_Amount) || 0),
        0,
      );
      setSummary((prev) => ({ ...prev, total: calcTotal }));
      setTotalPenalty(calcPenalty > 0 ? calcPenalty : totalPenaltyFromDetails);

      // Compute Net_Amount from snapshots
      const netFromSnaps = computeNetAmountFromSnapshots(
        newFormData.Challan_Detail,
      );
      setFormData((prev) => ({
        ...prev,
        Net_Amount:
          netFromSnaps > 0
            ? netFromSnaps.toString()
            : voucherData?.Net_Amount?.toString() || "0",
      }));

      // ALWAYS load ALL tax parameters from the tender type
      if (voucherData?.tender_type?.TnT_ID || voucherData?.TnT_Id) {
        const tenderTypeId =
          voucherData?.tender_type?.TnT_ID || voucherData?.TnT_Id;
        setLoadingTaxParameters(true);
        try {
          const response =
            await newChallanFlowService.getTaxParametersByTenderType(
              tenderTypeId,
            );
          if (response.success && response.data && response.data.length > 0) {
            const taxData = response.data[0];
            const parameters = taxData.parameters || [];

            // Process ALL tax parameters from tender type
            const allTaxParams = parameters.map((param) => ({
              ...param,
              Add_Dedu: param.Add_Dedu == 1 || param.Add_Dedu == "1" ? 1 : 0,
              Percent: param.Percent,
              Formula: param.Formula ?? null,
              IC_Id: param.IC_Id,
              Lg_Id: param.Lg_Id,
              VIP_Id: param.VIP_Id,
              invoice_charge: param.invoice_charge,
              ledger: param.ledger,
            }));

            setTenderTaxParameters(allTaxParams);

            // Merge with existing tax amounts from the first row
            let allTaxBreakdown = allTaxParams.map((param) => {
              // Find if this tax exists in the saved voucher data
              const existingTax = taxParametersFromDetails.find(
                (p) => p.VIP_Id == param.VIP_Id,
              );

              const taxType =
                param.invoice_charge?.IC_Name ||
                param.invoice_charge?.IC_Code ||
                param.IC_Name ||
                param.IC_Code ||
                "Tax";
              const isManual = isManualFormula(param.Formula ?? "");

              return {
                ...param,
                calculatedAmount: existingTax
                  ? existingTax.calculatedAmount || 0
                  : 0,
                displayText: isManual
                  ? taxType
                  : `${taxType} (${param.Percent || 0}%)`,
                taxType: taxType,
                isAdd: param.Add_Dedu == 1 || param.Add_Dedu == "1",
                isTax: true,
                type: "tax",
                isManual: isManual,
                percentage: parseFloat(param.Percent) || 0,
                formula: param.Formula ?? null,
                VIP_Id: param.VIP_Id,
                IC_Id: param.IC_Id,
                Lg_Id: param.Lg_Id,
              };
            });

            // Set manual overrides for existing taxes
            const manualOverrides = {};
            taxParametersFromDetails.forEach((t) => {
              if (t.VIP_Id) {
                manualOverrides[t.VIP_Id] = t.calculatedAmount || 0;
              }
            });
            setManualTaxAmounts(manualOverrides);

            // Calculate running amounts
            let runningAmount = 0;
            let totalAdd = 0;
            let totalLess = 0;

            allTaxBreakdown.forEach((tax) => {
              const amt = tax.calculatedAmount || 0;
              if (tax.isAdd) {
                runningAmount += amt;
                totalAdd += amt;
              } else {
                runningAmount -= amt;
                totalLess += amt;
              }
            });

            setTaxCalculation({
              grossAmount: 0,
              netAmount: runningAmount,
              taxBreakdown: allTaxBreakdown,
              totalAdd,
              totalLess,
              totalTax: totalAdd - totalLess,
            });
          }
        } catch (error) {
          console.error("Error loading tax parameters:", error);
        } finally {
          setLoadingTaxParameters(false);
        }
      } else {
        // No tender type, clear taxes
        setTenderTaxParameters([]);
        setTaxCalculation({
          grossAmount: 0,
          netAmount: 0,
          taxBreakdown: [],
          totalAdd: 0,
          totalLess: 0,
          totalTax: 0,
        });
      }

      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading Bill voucher:", error);
      toast.error("Failed to load Bill voucher data!");
      navigate("/transactions/bookkeeping-vouchers/new-expense-challan-update");
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
      ...(isEditMode ? {} : { CV_No: "" }),
    }));
    setSelectedBranch(branch);
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);
    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: "" }));
    }

    await fetchBudgetHeadsForBranch(branch.Dpt_id);

    if (!isEditMode) {
      await fetchNextVoucherNumber(branch);
    }

    setTimeout(() => {
      if (tenderTypeButtonRef.current) {
        tenderTypeButtonRef.current.focus();
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

  const handleTenderTypeKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsTenderTypeDropdownOpen(true);
      setTenderTypeSearchTerm("");
      setTenderTypeHighlightedIndex(-1);
      setTimeout(() => tenderTypeSearchRef.current?.focus(), 0);
    }
  };

  const handleTenderTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredTenderTypes.length > 0) {
        setTenderTypeHighlightedIndex(0);
        setTimeout(() => {
          if (tenderTypeItemRefs.current[0]) {
            tenderTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderTypeDropdownOpen(false);
      setTenderTypeHighlightedIndex(-1);
      setTenderTypeSearchTerm("");
      tenderTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredTenderTypes.length > 0 && tenderTypeHighlightedIndex >= 0) {
        handleTenderTypeSelect(filteredTenderTypes[tenderTypeHighlightedIndex]);
      } else if (filteredTenderTypes.length > 0) {
        handleTenderTypeSelect(filteredTenderTypes[0]);
      }
    }
  };

  const handleTenderTypeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredTenderTypes.length) {
        setTenderTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (tenderTypeItemRefs.current[nextIndex]) {
            tenderTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setTenderTypeHighlightedIndex(-1);
        setTimeout(() => tenderTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setTenderTypeHighlightedIndex(-1);
        setTimeout(() => tenderTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setTenderTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (tenderTypeItemRefs.current[prevIndex]) {
            tenderTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleTenderTypeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderTypeDropdownOpen(false);
      setTenderTypeHighlightedIndex(-1);
      setTenderTypeSearchTerm("");
      tenderTypeButtonRef.current?.focus();
    }
  };

  const handleTenderTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, TnT_Id: type.TnT_ID?.toString() }));
    setIsTenderTypeDropdownOpen(false);
    setTenderTypeSearchTerm("");
    setTenderTypeHighlightedIndex(-1);
    if (errors.TnT_Id) {
      setErrors((prev) => ({ ...prev, TnT_Id: "" }));
    }
    setTimeout(() => {
      if (ledgerRefs.current[0]) {
        ledgerRefs.current[0].focus();
      }
    }, 100);
  };

  const getSelectedTenderTypeName = () => {
    if (!formData.TnT_Id) return "";
    const selectedType = dropdownData.tenderTypes.find(
      (type) => type.TnT_ID == parseInt(formData.TnT_Id),
    );
    return selectedType ? `${selectedType.TnT_Name}` : "";
  };

  const renderTenderTypeItem = (type) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{type.TnT_Name}</div>
      {type.TnT_Code && (
        <div className="text-xs text-gray-500 mt-1">Code: {type.TnT_Code}</div>
      )}
    </div>
  );

  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else if (typeof e == "object" && e.name != undefined) {
      // Handle case where it's called with { name, value } directly
      const { name, value } = e;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleDetailChange = useCallback((index, field, value) => {
    if (typeof field == "object") {
      const updates = field;
      setFormData((prev) => {
        const updatedDetails = [...prev.Challan_Detail];
        updatedDetails[index] = { ...updatedDetails[index], ...updates };
        return { ...prev, Challan_Detail: updatedDetails };
      });
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(updates).forEach((f) => {
          delete next[`ChallanDetail_${index}_${f}`];
        });
        return next;
      });
      return;
    }

    setFormData((prev) => {
      const updatedDetails = [...prev.Challan_Detail];
      updatedDetails[index] = { ...updatedDetails[index], [field]: value };
      return { ...prev, Challan_Detail: updatedDetails };
    });
    setErrors((prev) => {
      if (!prev[`ChallanDetail_${index}_${field}`]) return prev;
      const next = { ...prev };
      delete next[`ChallanDetail_${index}_${field}`];
      return next;
    });

    // Debounce tax recalculation when Amount changes
    if (field == "Amount") {
      if (taxRecalcTimerRef.current) clearTimeout(taxRecalcTimerRef.current);
      taxRecalcTimerRef.current = setTimeout(() => {
        setTenderTaxParameters((params) => {
          if (params.length > 0) {
            const newAmount = parseFloat(value) || 0;
            setManualTaxAmounts((overrides) => {
              if (recalcFnRef.current) {
                const recalc = recalcFnRef.current(
                  newAmount,
                  params,
                  overrides,
                );
                setTaxCalculation(recalc);
              }
              return overrides;
            });
          }
          return params;
        });
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTaxAmountChange = useCallback((vipId, newAmount) => {
    setManualTaxAmounts((prev) => {
      const newManualOverrides = { ...prev, [vipId]: newAmount };
      setTenderTaxParameters((params) => {
        if (params.length > 0) {
          setFormData((fd) => {
            const activeIdx =
              editingDetailIndexRef.current != null
                ? editingDetailIndexRef.current
                : fd.Challan_Detail.length - 1;
            const activeAmount =
              parseFloat(fd.Challan_Detail[activeIdx]?.Amount) || 0;
            if (recalcFnRef.current) {
              const recalculated = recalcFnRef.current(
                activeAmount,
                params,
                newManualOverrides,
              );
              setTaxCalculation(recalculated);
            }
            return fd;
          });
        }
        return params;
      });
      return newManualOverrides;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNewDetailRow = () => {
    // ---- UPDATE path: save edited row with fresh taxSnapshot ----
    if (editingDetailIndex != null) {
      const editedDetail = formData.Challan_Detail[editingDetailIndex];
      const newErrors = { ...errors };
      let hasError = false;

      if (!editedDetail.Lg_Id) {
        newErrors[`ChallanDetail_${editingDetailIndex}_Lg_Id`] =
          "Ledger Account selection is required";
        hasError = true;
      }
      if (!editedDetail.Amount || parseFloat(editedDetail.Amount) <= 0) {
        newErrors[`ChallanDetail_${editingDetailIndex}_Amount`] =
          "Amount is required";
        hasError = true;
      }
      if (!editedDetail.Py_Mode) {
        newErrors[`ChallanDetail_${editingDetailIndex}_Py_Mode`] =
          "Payment Mode is required";
        hasError = true;
      }

      if (hasError) {
        setErrors(newErrors);
        toast.error(
          "Please fill all required fields correctly before updating",
        );
        return;
      }

      // Save current taxCalculation as taxSnapshot - include ALL taxes from taxBreakdown
      const updatedTaxSnapshot = (taxCalculation.taxBreakdown || [])
        .filter((t) => t.type == "tax") // Only include tax items
        .map((t) => ({
          VIP_Id: t.VIP_Id,
          IC_Id: t.IC_Id,
          Lg_Id: t.Lg_Id,
          taxType: t.taxType,
          displayText:
            t.displayText ||
            (t.isManual ? t.taxType : `${t.taxType} (${t.percentage || 0}%)`),
          calculatedAmount: t.calculatedAmount || 0,
          isAdd: t.isAdd,
          isManual: t.isManual || isTaxEditMode,
          percentage: t.percentage,
          formula: t.formula,
        }));

      const updatedDetails = [...formData.Challan_Detail];
      updatedDetails[editingDetailIndex] = {
        ...updatedDetails[editingDetailIndex],
        taxSnapshot: updatedTaxSnapshot,
      };
      setFormData((prev) => ({ ...prev, Challan_Detail: updatedDetails }));

      // Reset to the last (new) row
      setEditingDetailIndex(null);
      setIsTaxEditMode(false);
      setManualTaxAmounts({});
      const lastRowIdx = updatedDetails.length - 1;
      const lastRowAmount = parseFloat(updatedDetails[lastRowIdx]?.Amount) || 0;

      // Reload tax parameters from tender type for the new row
      if (tenderTaxParameters.length > 0) {
        const recalc = recalculateTaxesWithManualOverrides(
          lastRowAmount,
          tenderTaxParameters,
          {},
        );
        setTaxCalculation(recalc);
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
      toast.success("Bill detail updated successfully");
      return;
    }

    // ---- ADD path: validate and commit current new row ----
    const currentIdx = formData.Challan_Detail.length - 1;
    const currentDetail = formData.Challan_Detail[currentIdx];
    const newErrors = { ...errors };
    let hasError = false;

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
      toast.error(
        "Please fill all required fields correctly before adding new row",
      );
      return;
    }

    // Build taxSnapshot for the current row before adding a new one
    const rowAmount = parseFloat(currentDetail.Amount) || 0;
    const taxSnapshot = (taxCalculation.taxBreakdown || []).map((t) => ({
      VIP_Id: t.VIP_Id,
      IC_Id: t.IC_Id,
      Lg_Id: t.Lg_Id,
      taxType: t.taxType,
      displayText:
        t.displayText ||
        (t.isManual ? t.taxType : `${t.taxType} (${t.percentage}%)`),
      calculatedAmount: t.calculatedAmount || 0,
      isAdd: t.isAdd,
      isManual: t.isManual || isTaxEditMode,
      percentage: t.percentage,
      formula: t.formula,
    }));

    // Save snapshot onto the current row
    const updatedDetails = [...formData.Challan_Detail];
    updatedDetails[currentIdx] = { ...updatedDetails[currentIdx], taxSnapshot };

    const newSr = formData.Challan_Detail.length + 1;
    setFormData((prev) => ({
      ...prev,
      Challan_Detail: [
        ...updatedDetails,
        {
          CV_Sr: newSr,
          Lg_Id: "",
          Bh_Id: "",
          SL_Nm: "",
          GST_No: "",
          SL_Id: null,
          Amount: "",
          Penalty_Amount: "",
          Py_Mode: "",
          FileNo: "",
          Remarks: "",
          Chq_Date: "",
          Bank_Name: "",
          IFSC_Code: "",
          Acc_No: "",
          Chq_No: "",
          Rec_Date: "",
          taxSnapshot: [],
        },
      ],
    }));

    setManualTaxAmounts({});

    if (tenderTaxParameters.length > 0) {
      setTaxCalculation({
        grossAmount: 0,
        netAmount: 0,
        taxBreakdown: tenderTaxParameters.map((p) => ({
          ...p,
          calculatedAmount: 0,
          displayText: (() => {
            const name =
              p.invoice_charge?.IC_Name ||
              p.invoice_charge?.IC_Code ||
              p.IC_Name ||
              p.IC_Code ||
              "";
            const pct = parseFloat(p.Percent) || 0;
            const manual = isManualFormula(p.Formula ?? "");
            return manual ? name : pct > 0 ? `${name} (${pct}%)` : name;
          })(),
          taxType:
            p.invoice_charge?.IC_Name ||
            p.invoice_charge?.IC_Code ||
            p.IC_Name ||
            p.IC_Code ||
            "",
          isAdd: p.Add_Dedu == 1 || p.Add_Dedu == "1",
          isTax: true,
          type: "tax",
          isManual: isManualFormula(p.Formula ?? ""),
          percentage: parseFloat(p.Percent) || 0,
          formula: p.Formula ?? null,
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

    setTimeout(() => {
      if (ledgerRefs.current[formData.Challan_Detail.length]) {
        ledgerRefs.current[formData.Challan_Detail.length].focus();
      }
    }, 100);
  };

  const removeDetailRow = (index) => {
    // Must keep at least the trailing empty row + 1 committed row
    if (formData.Challan_Detail.length <= 2) {
      toast.error("At least one Bill detail is required");
      return;
    }
    const updatedDetails = formData.Challan_Detail.filter((_, i) => i != index);
    updatedDetails.forEach((detail, i) => {
      detail.CV_Sr = i + 1;
    });
    setFormData((prev) => ({ ...prev, Challan_Detail: updatedDetails }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Ch_Date) {
      newErrors.Ch_Date = "Date is required";
    }
    if (!formData.Dpt_Id) {
      newErrors.Dpt_Id = "Branch selection is required";
    }

    const committedDetails = formData.Challan_Detail.slice(0, -1);
    if (committedDetails.length == 0) {
      toast.error("At least 1 bill detail record is required");
      setErrors(newErrors);
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const validateAllGSTNumbers = () => {
    const committedDetails = formData.Challan_Detail.slice(0, -1);
    let allValid = true;
    const newErrors = { ...errors };

    committedDetails.forEach((detail, idx) => {
      if (!detail.GST_No) {
        newErrors[`ChallanDetail_${idx}_GST_No`] = "GST No. is required";
        allValid = false;
      } else if (!validateGSTNumber(detail.GST_No)) {
        newErrors[`ChallanDetail_${idx}_GST_No`] =
          "Invalid GST Number format. Example: 24AAAAA0000A1Z";
        allValid = false;
      }
    });

    setErrors(newErrors);
    return allValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    const committedDetails = formData.Challan_Detail.slice(0, -1);

    // Identify new parties
    const newParties = committedDetails.filter(
      (d) =>
        d.SL_Nm &&
        !d.SL_Id &&
        !dropdownData.subLedgers.some(
          (s) =>
            (s.SL_Name || s.SL_Nm || "").toLowerCase() == d.SL_Nm.toLowerCase(),
        ),
    );

    if (newParties.length > 0) {
      let skipAll = false;

      for (let i = 0; i < newParties.length; i++) {
        if (skipAll) {
          break;
        }

        const detail = newParties[i];

        const confirmed = await new Promise((resolve) => {
          setNewPartyDialog({
            open: true,
            partyName: detail.SL_Nm,
            partyCount: newParties.length,
            currentIndex: i,
            newParties: newParties,
            resolve: (result) => {
              setNewPartyDialog((prev) => ({ ...prev, open: false }));
              resolve(result);
            },
          });
        });

        if (confirmed == "skipAll") {
          skipAll = true;
          setFormData((prev) => ({
            ...prev,
            Challan_Detail: prev.Challan_Detail.map((d) =>
              newParties.some((p) => p.SL_Nm == d.SL_Nm && !d.SL_Id)
                ? { ...d, SL_Nm: "", GST_No: "" }
                : d,
            ),
          }));
          break;
        } else if (confirmed) {
          try {
            const res = await newChallanFlowService.createSubLedger({
              SL_Name: detail.SL_Nm,
              GSTIN: detail.GST_No ? detail.GST_No.toUpperCase() : null,
              Lg_Id: detail.Lg_Id ? [parseInt(detail.Lg_Id)] : [],
            });
            const newSLId = res?.data?.SL_Id || res?.SL_Id || null;
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
            toast.error(
              err.response?.data?.message ||
                `Failed to create party "${detail.SL_Nm}"`,
            );
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            Challan_Detail: prev.Challan_Detail.map((d) =>
              d.SL_Nm == detail.SL_Nm && !d.SL_Id
                ? { ...d, SL_Nm: "", GST_No: "" }
                : d,
            ),
          }));
        }
      }
    }

    // ✅ ALWAYS show the Swal confirmation dialog - regardless of Skip All
    try {
      const result = await Swal.fire({
        title: isEditMode ? "Update Bill Voucher?" : "Create Bill Voucher?",
        text: isEditMode
          ? "Are you sure you want to update this Bill voucher?"
          : "Are you sure you want to create this Bill voucher?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return;
      }
    } catch (error) {
      console.error("Swal error:", error);
      return;
    }

    // Create voucher
    setSaving(true);
    try {
      // 🔥 FIRST: Get the latest voucher number BEFORE creating (for new mode only)
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

      const currentManualAmounts = { ...manualTaxAmounts };

      let finalGrossAmount = 0;
      for (const detail of committedDetails) {
        finalGrossAmount += parseFloat(detail.Amount) || 0;
      }

      let finalTotalAdd = 0;
      let finalTotalLess = 0;
      let finalNetAmount = 0;
      const payDetails = [];

      let totalPenaltyAmount = 0;
      for (const detail of committedDetails) {
        totalPenaltyAmount += parseFloat(detail.Penalty_Amount) || 0;
      }

      // Build pay_details and net amount from each row's taxSnapshot
      committedDetails.forEach((detail, idx) => {
        const rowAmount = parseFloat(detail.Amount) || 0;
        const snap = (detail.taxSnapshot || []).filter(
          (t) => (t.calculatedAmount || 0) > 0,
        );
        let rowNet = rowAmount;

        snap.forEach((tax, ti) => {
          const taxAmount = formatAmountForAPI(tax.calculatedAmount);
          if (taxAmount <= 0) return;
          if (tax.isAdd) {
            rowNet += taxAmount;
            finalTotalAdd += taxAmount;
          } else {
            rowNet -= taxAmount;
            finalTotalLess += taxAmount;
          }
          payDetails.push({
            PD_Ty: "TAX",
            TnT_Id: formData.TnT_Id ? parseInt(formData.TnT_Id) : null,
            PVD_Sr: payDetails.length + 1,
            VIP_Id: tax.VIP_Id,
            IC_Id: tax.IC_Id,
            Lg_Id: tax.Lg_Id,
            Percent: tax.percentage,
            Formula: tax.formula || "*",
            IC_Amt: taxAmount,
            Add_Dedu: tax.isAdd ? 1 : 0,
            Bill_Detail_Sr: detail.CV_Sr,
          });
        });

        finalNetAmount += rowNet;
      });

      const penaltyEntries = [];
      committedDetails.forEach((detail, idx) => {
        const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
        if (penaltyAmount > 0) {
          penaltyEntries.push({
            PD_Ty: "PENLTY",
            TnT_Id: formData.TnT_Id ? parseInt(formData.TnT_Id) : null,
            PVD_Sr: payDetails.length + penaltyEntries.length + 1,
            VIP_Id: null,
            IC_Id: null,
            Lg_Id: detail.Lg_Id ? parseInt(detail.Lg_Id) : null,
            Percent: "0",
            Formula: "Penalty Amount",
            IC_Amt: formatAmountForAPI(penaltyAmount),
            Add_Dedu: 0,
            Bill_Detail_Sr: detail.CV_Sr,
          });
        }
      });

      payDetails.push(...penaltyEntries);

      const calculatedTotalPenalty = penaltyEntries.reduce(
        (sum, p) => sum + parseFloat(p.IC_Amt || 0),
        0,
      );
      const finalNetAmountAfterPenalty = formatAmountForAPI(
        finalNetAmount - calculatedTotalPenalty,
      );
      const finalLessAmount = formatAmountForAPI(
        finalTotalLess + calculatedTotalPenalty,
      );
      const finalAddAmount = formatAmountForAPI(finalTotalAdd);
      const finalGrossAmountFormatted = formatAmountForAPI(finalGrossAmount);

      // 🔥 SECOND: Use the latest voucher number in the payload
      const challanVoucherData = {
        Ch_Date: formData.Ch_Date,
        CV_No: String(latestVoucherNo), // ✅ Use the latest number here
        Dpt_Id: formData.Dpt_Id ? parseInt(formData.Dpt_Id) : null,
        TnT_Id: formData.TnT_Id ? parseInt(formData.TnT_Id) : null,
        Is_income: "N",
        UserId: userId,
        Mod_Code: currentModule,
        Total_Amount: finalGrossAmountFormatted,
        Net_Amount: finalNetAmountAfterPenalty,
        Status: initialActionId || "",
        Challan_Detail: committedDetails.map((detail, detailIdx) => {
          const rowPayDetails = [];
          let pvdSr = 1;

          const snap = (detail.taxSnapshot || []).filter(
            (t) => (t.calculatedAmount || 0) > 0,
          );
          snap.forEach((tax) => {
            const taxAmount = formatAmountForAPI(tax.calculatedAmount);
            if (taxAmount <= 0) return;
            rowPayDetails.push({
              PD_Ty: "TAX",
              TnT_ID: formData.TnT_Id ? parseInt(formData.TnT_Id) : null,
              PVD_Sr: pvdSr++,
              VIP_Id: tax.VIP_Id,
              IC_Id: tax.IC_Id,
              Cht_Id: null,
              CIP_Id: null,
              Lg_Id: tax.Lg_Id,
              Percent: tax.percentage,
              Formula: tax.formula || "*",
              IC_Amt: taxAmount,
              Add_Dedu: tax.isAdd ? 1 : 0,
            });
          });

          const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
          if (penaltyAmount > 0) {
            rowPayDetails.push({
              PD_Ty: "PENLTY",
              TnT_ID: formData.TnT_Id ? parseInt(formData.TnT_Id) : null,
              PVD_Sr: pvdSr++,
              VIP_Id: null,
              IC_Id: null,
              Cht_Id: null,
              CIP_Id: null,
              Lg_Id: detail.Lg_Id ? parseInt(detail.Lg_Id) : null,
              Percent: "0",
              Formula: "Penalty Amount",
              IC_Amt: formatAmountForAPI(penaltyAmount),
              Add_Dedu: 0,
            });
          }

          return {
            CV_Sr: detail.CV_Sr,
            Lg_Id: detail.Lg_Id ? parseInt(detail.Lg_Id) : null,
            Bh_Id: detail.Bh_Id ? parseInt(detail.Bh_Id) : null,
            PayMd_ID: detail.PayMd_ID ? parseInt(detail.PayMd_ID) : null,
            SL_Id: detail.SL_Id ? parseInt(detail.SL_Id) : null,
            SL_Nm: detail.SL_Nm || null,
            GST_No: detail.GST_No ? detail.GST_No.toUpperCase() : null,
            Amount: parseFloat(detail.Amount),
            Penalty_Amount: penaltyAmount,
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

      let challanResponse;

      if (isEditMode) {
        challanResponse = await newChallanFlowService.update(
          id,
          challanVoucherData,
        );
        toast.success("Bill voucher updated successfully!");
      } else {
        challanResponse =
          await newChallanFlowService.create(challanVoucherData);

        toast.success(
          `Bill voucher created successfully! Voucher No: ${latestVoucherNo}`,
        );
      }

      setTimeout(() => {
        navigate(
          "/transactions/bookkeeping-vouchers/new-expense-challan-update",
        );
      }, 1500);
    } catch (error) {
      console.error("Error saving Bill voucher:", error);
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
              ? "Failed to update Bill voucher. Please try again."
              : "Failed to create Bill voucher. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/bookkeeping-vouchers/new-expense-challan-update");
  };

  const NewPartyDialog = ({
    open,
    partyName,
    partyCount,
    currentIndex,
    onYes,
    onNo,
    onSkipAll,
  }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            New Party Found
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>{partyName}</strong> is a new party not found in the list.
          </p>
          {partyCount > 1 && (
            <p className="text-xs text-gray-500 mb-4">
              This is party {currentIndex + 1} of {partyCount} new parties.
            </p>
          )}
          <p className="text-sm text-gray-600 mb-5">
            Do you want to add it as a new party?
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {partyCount > 1 && (
              <button
                type="button"
                onClick={onSkipAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                Skip All
              </button>
            )}
            <button
              type="button"
              onClick={onNo}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
            >
              No
            </button>
            <button
              type="button"
              onClick={onYes}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Bill voucher data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <NewPartyDialog
        open={newPartyDialog.open}
        partyName={newPartyDialog.partyName}
        partyCount={newPartyDialog.partyCount}
        currentIndex={newPartyDialog.currentIndex}
        onYes={() => newPartyDialog.resolve(true)}
        onNo={() => newPartyDialog.resolve(false)}
        onSkipAll={() => newPartyDialog.resolve("skipAll")}
      />

      {/* Row Tax Details Modal */}
      {taxPopup.open && taxPopup.taxes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeRowTaxPopup}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Tax Details
                </h3>
              </div>
              <button
                onClick={closeRowTaxPopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Tax Name
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600">
                      Type
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taxPopup.taxes.map((t, i) => {
                    const isManual = t.isManual;
                    const currentVal =
                      t._editValue != undefined
                        ? t._editValue
                        : (t.calculatedAmount || 0).toFixed(2);
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-800">
                          {t.displayText || t.taxType}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${t.isAdd ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {t.isAdd ? "+ Add" : "- Deduct"}
                          </span>
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-medium ${t.isAdd ? "text-green-700" : "text-red-600"}`}
                        >
                          {isManual ? (
                            <input
                              type="text"
                              value={currentVal}
                              onChange={(e) =>
                                handleTaxPopupAmountChange(i, e.target.value)
                              }
                              className="w-24 px-2 py-1 text-right text-xs border border-yellow-400 rounded focus:ring-1 focus:ring-yellow-500 bg-white"
                              placeholder="0.00"
                            />
                          ) : (
                            `₹${(t.calculatedAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td
                      colSpan="2"
                      className="px-3 py-2 font-semibold text-gray-800"
                    >
                      Net Tax Effect
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">
                      ₹
                      {Math.abs(
                        taxPopup.taxes.reduce((sum, t, i) => {
                          const amt =
                            t.isManual && t._editValue != undefined
                              ? parseFloat(t._editValue) || 0
                              : t.calculatedAmount || 0;
                          return sum + (t.isAdd ? amt : -amt);
                        }, 0),
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeRowTaxPopup}
                className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveTaxPopupChanges}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
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
              {isEditMode
                ? "Edit Expense Bill Voucher"
                : "Expense Bill Voucher"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update Expense Bill voucher information"
                : "Create Expense Bill voucher with automatic tax calculation"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
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
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          Ch_Date: e.target.value,
                        }));
                        if (errors.Ch_Date)
                          setErrors((prev) => ({ ...prev, Ch_Date: "" }));
                      }}
                      onKeyDown={(e) => handleEnterKey(e, branchButtonRef)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.Ch_Date ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill No.
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                      {isFetchingVoucherNo ? (
                        <div className="flex items-center">
                          <Loader className="h-4 w-4 mr-2 animate-spin text-blue-500" />
                          Generating...
                        </div>
                      ) : formData.CV_No ? (
                        formData.CV_No
                      ) : (
                        "Select branch to generate"
                      )}
                    </div>
                    {formData.CV_No && (
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>

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

                <SearchableDropdown
                  label="Tender Type"
                  value={formData.TnT_Id}
                  error={errors.TnT_Id}
                  required={false}
                  icon={Receipt}
                  isOpen={isTenderTypeDropdownOpen}
                  setIsOpen={setIsTenderTypeDropdownOpen}
                  searchTerm={tenderTypeSearchTerm}
                  setSearchTerm={setTenderTypeSearchTerm}
                  items={dropdownData.tenderTypes}
                  filteredItems={filteredTenderTypes}
                  highlightedIndex={tenderTypeHighlightedIndex}
                  onSelect={handleTenderTypeSelect}
                  onKeyDown={handleTenderTypeKeyDown}
                  onSearchKeyDown={handleTenderTypeSearchKeyDown}
                  onItemKeyDown={handleTenderTypeItemKeyDown}
                  getSelectedDisplay={getSelectedTenderTypeName}
                  loading={loadingDropdowns}
                  placeholder="Select Tender Type (Optional)"
                  searchPlaceholder="Search by type name or code..."
                  buttonRef={tenderTypeButtonRef}
                  dropdownRef={tenderTypeDropdownRef}
                  searchRef={tenderTypeSearchRef}
                  itemRefs={tenderTypeItemRefs}
                  listRef={tenderTypeListRef}
                  renderItem={renderTenderTypeItem}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-7 w-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-2">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Bill Details
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleImportClick}
                      disabled={importing}
                      className="flex items-center px-2.5 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
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
                      className="flex items-center px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
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

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                        <th className="text-left px-2 py-2 font-medium w-8">
                          #
                        </th>
                        <th className="text-left px-2 py-2 font-medium">
                          Ledger
                        </th>
                        <th className="text-left px-2 py-2 font-medium">
                          Party Name
                        </th>
                        <th className="text-left px-2 py-2 font-medium">
                          GST No.
                        </th>
                        <th className="text-right px-2 py-2 font-medium">
                          Amount (₹)
                        </th>
                        <th className="text-right px-2 py-2 font-medium">
                          Penalty (₹)
                        </th>
                        <th className="text-left px-2 py-2 font-medium">
                          Payment Mode
                        </th>
                        <th className="text-left px-2 py-2 font-medium">
                          Payment Details
                        </th>
                        <th className="text-left px-2 py-2 font-medium">
                          Taxation
                        </th>
                        <th className="text-left px-2 py-2 font-medium">
                          File No. / Remarks
                        </th>
                        <th className="text-center px-2 py-2 font-medium w-12">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingDetailIndex != null
                        ? formData.Challan_Detail.filter(
                            (_, i) => i != editingDetailIndex,
                          )
                        : formData.Challan_Detail.slice(0, -1)
                      ).map((detail, index) => {
                        const originalIndex =
                          editingDetailIndex != null
                            ? index >= editingDetailIndex
                              ? index + 1
                              : index
                            : index;
                        const ledger = dropdownData.ledgers.find(
                          (l) => l.Lg_Id == parseInt(detail.Lg_Id),
                        );
                        const ledgerName = ledger
                          ? ledger.Lg_Name || ""
                          : detail.Lg_Id
                            ? `ID: ${detail.Lg_Id}`
                            : "-";
                        const rowAmount = parseFloat(detail.Amount) || 0;
                        const rowPenalty =
                          parseFloat(detail.Penalty_Amount) || 0;

                        return (
                          <tr
                            key={originalIndex}
                            className="hover:bg-gray-50 border-b border-gray-100"
                          >
                            <td className="px-2 py-2 text-gray-500">
                              {originalIndex + 1}
                            </td>
                            <td
                              className="px-2 py-2 text-gray-800 max-w-[120px] truncate"
                              title={ledgerName}
                            >
                              {ledgerName}
                            </td>
                            <td className="px-2 py-2 text-gray-800">
                              <div className="flex items-center gap-1">
                                <span
                                  className="truncate max-w-[80px]"
                                  title={detail.SL_Nm}
                                >
                                  {detail.SL_Nm || "-"}
                                </span>
                                {detail.SL_Id && (
                                  <Check className="h-3 w-3 text-green-500 shrink-0" />
                                )}
                                {!detail.SL_Id && detail.SL_Nm && (
                                  <span className="text-orange-500 font-semibold text-xs shrink-0">
                                    New
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2 text-gray-700 font-mono">
                              {detail.GST_No || "-"}
                            </td>
                            <td className="px-2 py-2 text-green-700 font-semibold text-right">
                              {rowAmount > 0
                                ? `₹${rowAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                                : "-"}
                            </td>
                            <td className="px-2 py-2 text-red-600 text-right">
                              {rowPenalty > 0
                                ? `₹${rowPenalty.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                                : "-"}
                            </td>
                            <td className="px-2 py-2 text-gray-800">
                              {detail.Py_Mode || "-"}
                            </td>
                            <td className="px-2 py-1.5 text-gray-800 text-xs">
                              {(() => {
                                const selectedMode =
                                  dropdownData.paymentModes.find(
                                    (m) =>
                                      (m.value || m.PayMd_Name) ==
                                      detail.Py_Mode,
                                  );
                                const isCheque =
                                  !!detail.Py_Mode &&
                                  selectedMode?.Is_Cash == 0 &&
                                  selectedMode?.Is_Digital == 0;
                                const isBank =
                                  !!detail.Py_Mode &&
                                  selectedMode?.Is_Digital == 1;
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
                                if (isCheque || isBank) {
                                  return (
                                    <div className="space-y-0.5">
                                      {isCheque &&
                                        cleanStr(detail.Bank_Name) && (
                                          <div>
                                            Bank: {cleanStr(detail.Bank_Name)}
                                          </div>
                                        )}
                                      {isCheque && cleanStr(detail.Chq_No) && (
                                        <div>
                                          Chq: {cleanStr(detail.Chq_No)}
                                        </div>
                                      )}
                                      {isCheque && detail.Chq_Date && (
                                        <div>
                                          Date:{" "}
                                          {formatDateDisplay(detail.Chq_Date)}
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
                                          <div>
                                            A/C: {cleanStr(detail.Acc_No)}
                                          </div>
                                        )}
                                      {isBank &&
                                        !isCheque &&
                                        cleanStr(detail.IFSC_Code) && (
                                          <div>
                                            IFSC: {cleanStr(detail.IFSC_Code)}
                                          </div>
                                        )}
                                      {isBank &&
                                        !isCheque &&
                                        detail.Rec_Date && (
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
                                  );
                                }
                                return <span>-</span>;
                              })()}
                            </td>
                            <td className="px-2 py-2">
                              {(() => {
                                const rowTaxes = (
                                  detail.taxSnapshot || []
                                ).filter((t) => (t.calculatedAmount || 0) != 0);
                                if (rowTaxes.length == 0)
                                  return (
                                    <span className="text-gray-400 text-xs">
                                      -
                                    </span>
                                  );
                                return (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openRowTaxPopup(rowTaxes, originalIndex)
                                    }
                                    className="px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                                  >
                                    View Tax ({rowTaxes.length})
                                  </button>
                                );
                              })()}
                            </td>
                            <td className="px-2 py-2 text-gray-700 max-w-[100px]">
                              {detail.FileNo && (
                                <div className="truncate">{detail.FileNo}</div>
                              )}
                              {detail.Remarks && (
                                <div className="text-gray-400 truncate">
                                  {detail.Remarks}
                                </div>
                              )}
                              {!detail.FileNo && !detail.Remarks && "-"}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDetailIndex(originalIndex);
                                    setIsTaxEditMode(true);
                                    const editDetail =
                                      formData.Challan_Detail[originalIndex];
                                    const editAmount =
                                      parseFloat(editDetail.Amount) || 0;

                                    // Get existing taxes from snapshot
                                    const existingTaxes =
                                      editDetail.taxSnapshot || [];
                                    const taxParams = [...tenderTaxParameters]; // Now contains ALL taxes from tender type

                                    if (taxParams.length > 0) {
                                      // Build map of existing taxes by VIP_Id
                                      const existingTaxMap = {};
                                      existingTaxes.forEach((t) => {
                                        if (t.VIP_Id) {
                                          existingTaxMap[t.VIP_Id] = t;
                                        }
                                      });

                                      // Build merged tax breakdown - include ALL taxes from tender type
                                      const mergedTaxBreakdown = taxParams.map(
                                        (param) => {
                                          const taxType =
                                            param.invoice_charge?.IC_Name ||
                                            param.invoice_charge?.IC_Code ||
                                            param.IC_Name ||
                                            param.IC_Code ||
                                            "Tax";
                                          const isManual = isManualFormula(
                                            param.Formula ?? "",
                                          );
                                          const existingTax =
                                            existingTaxMap[param.VIP_Id];

                                          return {
                                            ...param,
                                            calculatedAmount: existingTax
                                              ? existingTax.calculatedAmount ||
                                                0
                                              : 0,
                                            displayText: existingTax
                                              ? existingTax.displayText ||
                                                `${taxType} (${param.Percent || 0}%)`
                                              : isManual
                                                ? taxType
                                                : `${taxType} (${param.Percent || 0}%)`,
                                            taxType: taxType,
                                            isAdd:
                                              param.Add_Dedu == 1 ||
                                              param.Add_Dedu == "1",
                                            isTax: true,
                                            type: "tax",
                                            isManual:
                                              isManual ||
                                              (existingTax
                                                ? existingTax.isManual
                                                : false),
                                            percentage:
                                              parseFloat(param.Percent) || 0,
                                            formula: param.Formula ?? null,
                                            VIP_Id: param.VIP_Id,
                                            IC_Id: param.IC_Id,
                                            Lg_Id: param.Lg_Id,
                                          };
                                        },
                                      );

                                      // Build manual overrides for existing taxes
                                      const manualOverrides = {};
                                      existingTaxes.forEach((t) => {
                                        if (t.VIP_Id) {
                                          manualOverrides[t.VIP_Id] =
                                            t.calculatedAmount || 0;
                                        }
                                      });
                                      setManualTaxAmounts(manualOverrides);

                                      // Calculate running amounts
                                      let runningAmount = editAmount;
                                      let totalAdd = 0;
                                      let totalLess = 0;

                                      mergedTaxBreakdown.forEach((tax) => {
                                        const amount =
                                          tax.calculatedAmount || 0;
                                        if (tax.isAdd) {
                                          runningAmount += amount;
                                          totalAdd += amount;
                                        } else {
                                          runningAmount -= amount;
                                          totalLess += amount;
                                        }
                                      });

                                      setTaxCalculation({
                                        grossAmount: editAmount,
                                        netAmount: runningAmount,
                                        taxBreakdown: mergedTaxBreakdown,
                                        totalAdd,
                                        totalLess,
                                        totalTax: totalAdd - totalLess,
                                      });
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
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeDetailRow(originalIndex)}
                                  className="text-red-500 hover:text-red-700 p-0.5"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300 sticky bottom-0">
                        <td
                          colSpan={4}
                          className="px-2 py-2 text-right text-sm font-bold text-gray-800"
                        >
                          Totals:
                        </td>
                        <td className="px-2 py-2 text-right text-sm font-bold text-green-700">
                          ₹
                          {formData.Challan_Detail.slice(0, -1)
                            .reduce(
                              (sum, d) => sum + (parseFloat(d.Amount) || 0),
                              0,
                            )
                            .toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                        </td>
                        <td className="px-2 py-2 text-right text-sm font-bold text-red-600">
                          {formData.Challan_Detail.slice(0, -1).reduce(
                            (sum, d) =>
                              sum + (parseFloat(d.Penalty_Amount) || 0),
                            0,
                          ) > 0
                            ? `₹${formData.Challan_Detail.slice(0, -1)
                                .reduce(
                                  (sum, d) =>
                                    sum + (parseFloat(d.Penalty_Amount) || 0),
                                  0,
                                )
                                .toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}`
                            : "-"}
                        </td>
                        <td
                          colSpan={3}
                          className="px-2 py-2 text-right text-sm font-bold text-gray-800"
                        >
                          Tax Amount:
                        </td>
                        <td className="px-2 py-2 text-left text-sm font-bold">
                          {(() => {
                            let totalAdd = 0;
                            let totalLess = 0;
                            formData.Challan_Detail.slice(0, -1).forEach(
                              (d) => {
                                const snap = d.taxSnapshot || [];
                                snap.forEach((t) => {
                                  const amt = t.calculatedAmount || 0;
                                  if (t.isAdd) totalAdd += amt;
                                  else totalLess += amt;
                                });
                              },
                            );
                            const net = totalAdd - totalLess;
                            if (totalAdd == 0 && totalLess == 0)
                              return <span className="text-gray-400">-</span>;
                            return (
                              <span
                                className={
                                  net >= 0 ? "text-green-700" : "text-red-600"
                                }
                              >
                                {net >= 0 ? "+" : ""}₹
                                {Math.abs(net).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            );
                          })()}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                      {parseFloat(formData.Net_Amount || 0) > 0 && (
                        <tr className="bg-blue-50 border-t border-blue-200 sticky bottom-0">
                          <td
                            colSpan={4}
                            className="px-2 py-2 text-right text-sm font-bold text-gray-800"
                          >
                            Net Payable:
                          </td>
                          <td className="px-2 py-2 text-right text-base font-bold text-blue-700">
                            ₹
                            {parseFloat(
                              formData.Net_Amount || 0,
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td colSpan={6}></td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 lg:col-span-1 overflow-visible">
            {(() => {
              const lastIdx =
                editingDetailIndex != null
                  ? editingDetailIndex
                  : formData.Challan_Detail.length - 1;
              const detail = formData.Challan_Detail[lastIdx];
              const currentRowAmount = parseFloat(detail.Amount) || 0;
              const currentRowPenalty = parseFloat(detail.Penalty_Amount) || 0;
              return (
                <div className="space-y-4 overflow-visible">
                  <BillDetailRow
                    key={`entry-${lastIdx}`}
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
                    penaltyAmountRefs={penaltyAmountRefs}
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
                    isTaxEditMode={isTaxEditMode}
                    subLedgers={dropdownData.subLedgers}
                    taxCalculation={taxCalculation}
                    loadingTaxParameters={loadingTaxParameters}
                    onTaxAmountChange={handleTaxAmountChange}
                    manualAmounts={manualTaxAmounts}
                    ledgerBalanceData={ledgerBalanceData}
                    loadingBalance={loadingBalance}
                    onCheckBalance={checkLedgerBalance}
                    filteredLedgersForBranch={filteredLedgersForBranch}
                    branchBudgetHeadIds={branchBudgetHeadIds}
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    {editingDetailIndex != null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDetailIndex(null);
                          setIsTaxEditMode(false);
                          setManualTaxAmounts({});
                          const newRowIdx = formData.Challan_Detail.length - 1;
                          const newRowAmount =
                            parseFloat(
                              formData.Challan_Detail[newRowIdx]?.Amount,
                            ) || 0;

                          // Show ALL taxes from tender type with 0 amount
                          if (tenderTaxParameters.length > 0) {
                            const allTaxBreakdown = tenderTaxParameters.map(
                              (param) => {
                                const taxType =
                                  param.invoice_charge?.IC_Name ||
                                  param.invoice_charge?.IC_Code ||
                                  param.IC_Name ||
                                  param.IC_Code ||
                                  "Tax";
                                return {
                                  ...param,
                                  calculatedAmount: 0,
                                  displayText: isManualFormula(
                                    param.Formula ?? "",
                                  )
                                    ? taxType
                                    : `${taxType} (${param.Percent || 0}%)`,
                                  taxType: taxType,
                                  isAdd:
                                    param.Add_Dedu == 1 ||
                                    param.Add_Dedu == "1",
                                  isTax: true,
                                  type: "tax",
                                  isManual: isManualFormula(
                                    param.Formula ?? "",
                                  ),
                                  percentage: parseFloat(param.Percent) || 0,
                                  formula: param.Formula ?? null,
                                  VIP_Id: param.VIP_Id,
                                  IC_Id: param.IC_Id,
                                  Lg_Id: param.Lg_Id,
                                };
                              },
                            );

                            setTaxCalculation({
                              grossAmount: 0,
                              netAmount: 0,
                              taxBreakdown: allTaxBreakdown,
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
                        }}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addNewDetailRow}
                      className={`flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${editingDetailIndex != null ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              GST Format: 24AAAAA0000A1Z (15 characters)
            </p>
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

export default CreateNewExpenseChallanUpdate;

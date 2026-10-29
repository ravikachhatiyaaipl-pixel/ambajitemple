/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

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
  Briefcase,
  ChevronDown,
  Search,
  Check,
  Loader,
  XCircle,
  PieChart,
  Hash,
  User,
  DollarSign,
  FileText,
  CreditCard,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChallanVoucherApi } from "../../../services/challanvoucherapi";

// =============  SEARCHABLE DROPDOWN COMPONENT ==============
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
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
  showAsText = false,
  lockedValue = "",
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  const handleSearchChange = (e) => {
    if (typeof setSearchTerm == "function") {
      setSearchTerm(e);
    }
  };

  if (showAsText) {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          )}
          <div
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700`}
          >
            {lockedValue || "Auto-filled"}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Auto-filled from selection (non-editable)
        </p>
      </div>
    );
  }

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
            <span className="text-gray-900">{getSelectedDisplay()}</span>
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
                  onClick={() => {
                    if (typeof setSearchTerm == "function") {
                      setSearchTerm("");
                    }
                  }}
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
                  item?.Dpt_id ||
                  item?.Bh_Id ||
                  item?.Lg_Id ||
                  item?.Cht_Id ||
                  item?.SL_Id ||
                  `item-${idx}`;

                return (
                  <button
                    key={itemId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                    }}
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
                    {renderItem ? renderItem(item) : getSelectedDisplay()}
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

// =============  CHALLAN DETAIL ROW COMPONENT ==============
// =============  CHALLAN DETAIL ROW COMPONENT (FIXED) ==============
// =============  CHALLAN DETAIL ROW COMPONENT (SINGLE LINE LAYOUT) ==============
const ChallanDetailRow = ({
  index,
  detail,
  onChange,
  onRemove,
  showRemove,
  subLedgers,
  loadingSubLedgers,
  paymentModes,
  errors,
  amountRefs,
  fileNoRefs,
  remarksRefs,
  slIdRefs,
  slNameRefs,
  pyModeRefs,
  handleEnterKey,
}) => {
  const [isSubLedgerDropdownOpen, setIsSubLedgerDropdownOpen] = useState(false);
  const [subLedgerSearchTerm, setSubLedgerSearchTerm] = useState("");
  const [filteredSubLedgers, setFilteredSubLedgers] = useState([]);
  const [subLedgerHighlightedIndex, setSubLedgerHighlightedIndex] =
    useState(-1);

  const subLedgerDropdownRef = useRef(null);
  const subLedgerSearchRef = useRef(null);
  const subLedgerButtonRef = useRef(null);
  const subLedgerItemRefs = useRef([]);
  const subLedgerListRef = useRef(null);

  // Filter sub-ledgers based on search
  useEffect(() => {
    if (!subLedgerSearchTerm.trim()) {
      setFilteredSubLedgers(subLedgers);
    } else {
      const term = subLedgerSearchTerm.toLowerCase();
      const filtered = subLedgers.filter(
        (sl) =>
          sl.SL_Name?.toLowerCase().includes(term) ||
          sl.SL_Code?.toLowerCase().includes(term),
      );
      setFilteredSubLedgers(filtered);
    }
    setSubLedgerHighlightedIndex(-1);
  }, [subLedgerSearchTerm, subLedgers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subLedgerDropdownRef.current &&
        !subLedgerDropdownRef.current.contains(event.target)
      ) {
        setIsSubLedgerDropdownOpen(false);
        setSubLedgerHighlightedIndex(-1);
        setSubLedgerSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isSubLedgerDropdownOpen && subLedgerSearchRef.current) {
      setTimeout(() => subLedgerSearchRef.current.focus(), 0);
    }
  }, [isSubLedgerDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      isSubLedgerDropdownOpen &&
      subLedgerHighlightedIndex >= 0 &&
      subLedgerListRef.current
    ) {
      const container = subLedgerListRef.current;
      const item = subLedgerItemRefs.current[subLedgerHighlightedIndex];
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
  }, [subLedgerHighlightedIndex, isSubLedgerDropdownOpen]);

  // Sub-ledger keyboard handlers
  const handleSubLedgerKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsSubLedgerDropdownOpen(true);
      setSubLedgerSearchTerm("");
      setSubLedgerHighlightedIndex(-1);
      setTimeout(() => subLedgerSearchRef.current?.focus(), 0);
    }
  };

  const handleSubLedgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredSubLedgers.length > 0) {
        setSubLedgerHighlightedIndex(0);
        setTimeout(() => {
          if (subLedgerItemRefs.current[0]) {
            subLedgerItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsSubLedgerDropdownOpen(false);
      setSubLedgerHighlightedIndex(-1);
      setSubLedgerSearchTerm("");
      subLedgerButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredSubLedgers.length > 0 && subLedgerHighlightedIndex >= 0) {
        handleSubLedgerSelect(filteredSubLedgers[subLedgerHighlightedIndex]);
      } else if (filteredSubLedgers.length > 0) {
        handleSubLedgerSelect(filteredSubLedgers[0]);
      }
    }
  };

  const handleSubLedgerItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredSubLedgers.length) {
        setSubLedgerHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (subLedgerItemRefs.current[nextIndex]) {
            subLedgerItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setSubLedgerHighlightedIndex(-1);
        setTimeout(() => subLedgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setSubLedgerHighlightedIndex(-1);
        setTimeout(() => subLedgerSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setSubLedgerHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (subLedgerItemRefs.current[prevIndex]) {
            subLedgerItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleSubLedgerSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsSubLedgerDropdownOpen(false);
      setSubLedgerHighlightedIndex(-1);
      setSubLedgerSearchTerm("");
      subLedgerButtonRef.current?.focus();
    }
  };

  const handleSubLedgerSelect = (sl) => {
    onChange(index, "SL_Id", sl.SL_Id?.toString());

    setIsSubLedgerDropdownOpen(false);
    setSubLedgerSearchTerm("");
    setSubLedgerHighlightedIndex(-1);

    // Focus on vendor name field after selection
    setTimeout(() => {
      if (slNameRefs.current[index]) {
        slNameRefs.current[index].focus();
      }
    }, 100);
  };

  const getSelectedSubLedgerDisplay = () => {
    if (!detail.SL_Id) return "";
    const selected = subLedgers.find(
      (sl) => sl.SL_Id?.toString() == detail.SL_Id,
    );
    return selected ? `${selected.SL_Name}` : "";
  };

  const renderSubLedgerItem = (sl) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{sl.SL_Name}</div>
      {sl.SL_Code && (
        <div className="text-xs text-gray-500 mt-1">Code: {sl.SL_Code}</div>
      )}
      <div className="text-xs text-blue-500 mt-1">
        Click to select this vendor
      </div>
    </div>
  );

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

      {/* SINGLE LINE LAYOUT - All fields in one row */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Sub-Ledger (Vendor) Dropdown - 3 columns */}
        <div
          ref={subLedgerDropdownRef}
          className="relative flex-1 min-w-[200px]"
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub-Ledger (Vendor) *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <button
              ref={(el) => {
                subLedgerButtonRef.current = el;
                if (slIdRefs.current) slIdRefs.current[index] = el;
              }}
              type="button"
              onClick={() =>
                setIsSubLedgerDropdownOpen(!isSubLedgerDropdownOpen)
              }
              onKeyDown={handleSubLedgerKeyDown}
              className={`w-full pl-10 pr-10 py-2.5 border ${
                errors[`ChallanDetail_${index}_SL_Id`]
                  ? "border-red-300"
                  : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
            >
              {detail.SL_Id ? (
                <span className="text-gray-900 truncate block">
                  {getSelectedSubLedgerDisplay()}
                </span>
              ) : (
                <span className="text-gray-500">Select Vendor</span>
              )}
            </button>
            {loadingSubLedgers ? (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <button
                type="button"
                onClick={() =>
                  setIsSubLedgerDropdownOpen(!isSubLedgerDropdownOpen)
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
            {errors[`ChallanDetail_${index}_SL_Id`] && (
              <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>

          {isSubLedgerDropdownOpen && (
            <div
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
              style={{ minWidth: "300px" }}
            >
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={subLedgerSearchRef}
                    type="text"
                    value={subLedgerSearchTerm}
                    onChange={(e) => setSubLedgerSearchTerm(e.target.value)}
                    onKeyDown={handleSubLedgerSearchKeyDown}
                    placeholder="Search by name, code..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    autoFocus
                  />
                  {subLedgerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setSubLedgerSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div ref={subLedgerListRef} className="overflow-y-auto max-h-64">
                {filteredSubLedgers.length > 0 ? (
                  filteredSubLedgers.map((sl, idx) => (
                    <button
                      key={sl.SL_Id}
                      ref={(el) => {
                        subLedgerItemRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => handleSubLedgerSelect(sl)}
                      onKeyDown={(e) => handleSubLedgerItemKeyDown(e, sl, idx)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                        subLedgerHighlightedIndex == idx
                          ? "bg-blue-100"
                          : "text-gray-700"
                      }`}
                      tabIndex={0}
                    >
                      {renderSubLedgerItem(sl)}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p>No vendors found</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{filteredSubLedgers.length} items found</span>
                </div>
              </div>
            </div>
          )}

          {errors[`ChallanDetail_${index}_SL_Id`] && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors[`ChallanDetail_${index}_SL_Id`]}
            </p>
          )}
        </div>

        {/* Vendor Name (Optional) - 2 columns */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor Name (Optional)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  if (fileNoRefs.current[index]) {
                    fileNoRefs.current[index].focus();
                  }
                }
              }}
              className={`w-full pl-10 pr-4 py-2.5 border ${
                errors[`ChallanDetail_${index}_SL_Nm`]
                  ? "border-red-300"
                  : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter vendor name"
            />
          </div>
        </div>

        {/* File No. - 1.5 columns */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File No.
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  if (amountRefs.current[index]) {
                    amountRefs.current[index].focus();
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="File No."
            />
          </div>
        </div>

        {/* Amount - 1.5 columns */}
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
          {errors[`ChallanDetail_${index}_Amount`] && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors[`ChallanDetail_${index}_Amount`]}
            </p>
          )}
        </div>

        {/* Payment Mode - 2 columns */}
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
                  if (remarksRefs.current[index]) {
                    remarksRefs.current[index].focus();
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
            {errors[`ChallanDetail_${index}_Py_Mode`] && (
              <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>
          {errors[`ChallanDetail_${index}_Py_Mode`] && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors[`ChallanDetail_${index}_Py_Mode`]}
            </p>
          )}
        </div>

        {/* Remarks - 2 columns */}
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
                  // Focus on next row's sub-ledger or add new row
                  if (index + 1 < slIdRefs.current.length) {
                    setTimeout(() => {
                      if (slIdRefs.current[index + 1]) {
                        slIdRefs.current[index + 1].focus();
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
    </div>
  );
};

const AddEditChallanVoucher = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingBudgetHeads, setLoadingBudgetHeads] = useState(false);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [loadingSubLedgers, setLoadingSubLedgers] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [fncId, setFncId] = useState(null);
  const [existingVouchers, setExistingVouchers] = useState([]);

  // Tree-structured data
  const [flattenedBranches, setFlattenedBranches] = useState([]);
  const [flattenedBudgetHeads, setFlattenedBudgetHeads] = useState([]);

  const [dropdownData, setDropdownData] = useState({
    branches: [],
    budgetHeads: [],
    ledgerAccounts: [],
    challanTypes: [],
    subLedgers: [],
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

  // Budget Head dropdown states
  const [filteredBudgetHeads, setFilteredBudgetHeads] = useState([]);
  const [budgetHeadSearchTerm, setBudgetHeadSearchTerm] = useState("");
  const [isBudgetHeadDropdownOpen, setIsBudgetHeadDropdownOpen] =
    useState(false);
  const [budgetHeadHighlightedIndex, setBudgetHeadHighlightedIndex] =
    useState(-1);
  const budgetHeadDropdownRef = useRef(null);
  const budgetHeadSearchRef = useRef(null);
  const budgetHeadItemRefs = useRef([]);
  const budgetHeadListRef = useRef(null);
  const budgetHeadButtonRef = useRef(null);

  // Ledger dropdown states
  const [filteredLedgerAccounts, setFilteredLedgerAccounts] = useState([]);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const ledgerListRef = useRef(null);
  const ledgerButtonRef = useRef(null);

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
  const slIdRefs = useRef([]);
  const slNameRefs = useRef([]);
  const fileNoRefs = useRef([]);
  const amountRefs = useRef([]);
  const pyModeRefs = useRef([]);
  const remarksRefs = useRef([]);

  const [formData, setFormData] = useState({
    Ch_Start_Date: new Date().toISOString().split("T")[0],
    Ch_End_Date: new Date().toISOString().split("T")[0],
    Ch_Date: new Date().toISOString().split("T")[0], // NEW FIELD ADDED - Single Date
    CV_No: "",
    Dpt_Id: "",
    Bh_Id: "",
    Lg_Id: "",
    CV_Ty: "",
    Challan_Detail: [
      {
        CV_Sr: 1,
        SL_Id: "",
        SL_Nm: "",
        Py_Mode: "",
        Amount: "",
        FileNo: "",
        Remarks: "",
      },
    ],
  });

  // Store selected objects for reference
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/bookkeeping-vouchers/challan-voucher";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Id) {
        setFncId(currentMenuItem.Fnc_Id);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // =============  BUILD TREE STRUCTURE FOR BRANCHES ==============
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

  // =============  BUILD TREE STRUCTURE FOR BUDGET HEADS ==============
  const buildBudgetHeadTree = (heads) => {
    const map = {};
    const roots = [];

    heads.forEach((head) => {
      map[head.Bh_Id] = {
        ...head,
        children: [],
        Bh_Id: head.Bh_Id,
        Gr_Nm: head.Gr_Nm,
        Gr_Cd: head.Gr_Cd,
        Gr_St: head.Gr_St,
        Up_Gr: head.Up_Gr,
      };
    });

    heads.forEach((head) => {
      const headId = head.Bh_Id;
      const upGroup = head.Up_Gr;
      const currentHead = map[headId];

      if (currentHead && upGroup && map[upGroup] && upGroup != headId) {
        map[upGroup].children.push(currentHead);
      } else if (currentHead) {
        roots.push(currentHead);
      }
    });

    return roots;
  };

  // =============  FLATTEN TREE FOR DISPLAY ==============
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
    loadExistingVouchers();

    if (id && id != "create") {
      setIsEditMode(true);
      loadVoucherData();
    }

    // Close dropdowns when clicking outside
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
        budgetHeadDropdownRef.current &&
        !budgetHeadDropdownRef.current.contains(event.target)
      ) {
        setIsBudgetHeadDropdownOpen(false);
        setBudgetHeadHighlightedIndex(-1);
        setBudgetHeadSearchTerm("");
      }
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setIsLedgerDropdownOpen(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
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

  // Focus on date field after loading (only for add mode)
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isBranchDropdownOpen && branchSearchRef.current) {
      setTimeout(() => branchSearchRef.current.focus(), 0);
    }
  }, [isBranchDropdownOpen]);

  useEffect(() => {
    if (isBudgetHeadDropdownOpen && budgetHeadSearchRef.current) {
      setTimeout(() => budgetHeadSearchRef.current.focus(), 0);
    }
  }, [isBudgetHeadDropdownOpen]);

  useEffect(() => {
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isLedgerDropdownOpen]);

  useEffect(() => {
    if (isChallanTypeDropdownOpen && challanTypeSearchRef.current) {
      setTimeout(() => challanTypeSearchRef.current.focus(), 0);
    }
  }, [isChallanTypeDropdownOpen]);

  // Scroll highlighted item into view
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
      budgetHeadListRef,
      budgetHeadItemRefs,
      budgetHeadHighlightedIndex,
      isBudgetHeadDropdownOpen,
    );
  }, [budgetHeadHighlightedIndex, isBudgetHeadDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      ledgerListRef,
      ledgerItemRefs,
      ledgerHighlightedIndex,
      isLedgerDropdownOpen,
    );
  }, [ledgerHighlightedIndex, isLedgerDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      challanTypeListRef,
      challanTypeItemRefs,
      challanTypeHighlightedIndex,
      isChallanTypeDropdownOpen,
    );
  }, [challanTypeHighlightedIndex, isChallanTypeDropdownOpen]);

  // Filter branches with hierarchy
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

  // Filter budget heads with hierarchy
  useEffect(() => {
    if (!dropdownData.budgetHeads.length) {
      setFilteredBudgetHeads([]);
      return;
    }

    const tree = buildBudgetHeadTree(dropdownData.budgetHeads);
    const flattened = flattenTree(tree);
    setFlattenedBudgetHeads(flattened);

    if (!budgetHeadSearchTerm.trim()) {
      setFilteredBudgetHeads(flattened);
    } else {
      const term = budgetHeadSearchTerm.toLowerCase();
      const filtered = flattened.filter((head) =>
        (head.Gr_Nm?.toLowerCase() || "").includes(term),
      );
      setFilteredBudgetHeads(filtered);
    }
    setBudgetHeadHighlightedIndex(-1);
  }, [budgetHeadSearchTerm, dropdownData.budgetHeads]);

  // Filter ledgers based on search
  useEffect(() => {
    if (!ledgerSearchTerm.trim()) {
      setFilteredLedgerAccounts(dropdownData.ledgerAccounts);
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      const filtered = dropdownData.ledgerAccounts.filter(
        (account) =>
          account.Lg_Name?.toLowerCase().includes(term) ||
          (account.Lg_Eng_Name &&
            account.Lg_Eng_Name.toLowerCase().includes(term)) ||
          (account.Lg_Code && account.Lg_Code.toLowerCase().includes(term)),
      );
      setFilteredLedgerAccounts(filtered);
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, dropdownData.ledgerAccounts]);

  // Filter challan types based on search
  // useEffect(() => {
  //   if (!challanTypeSearchTerm.trim()) {
  //     setFilteredChallanTypes(dropdownData.challanTypes);
  //   } else {
  //     const term = challanTypeSearchTerm.toLowerCase();
  //     const filtered = dropdownData.challanTypes.filter(
  //       (type) =>
  //         type.Cht_Name?.toLowerCase().includes(term) ||
  //         type.Cht_Code?.toLowerCase().includes(term)
  //     );
  //     setFilteredChallanTypes(filtered);
  //   }
  //   setChallanTypeHighlightedIndex(-1);
  // }, [challanTypeSearchTerm, dropdownData.challanTypes]);

  // Generate voucher number when branch and ledger are selected

  useEffect(() => {
    if (!isEditMode && selectedBranch && formData.Bh_Id) {
      // Find the selected budget head
      const selectedBudgetHead = dropdownData.budgetHeads.find(
        (head) => head.Bh_Id?.toString() == formData.Bh_Id,
      );

      if (selectedBudgetHead) {
        const generatedNo = ChallanVoucherApi.generateVoucherNumber(
          selectedBranch,
          selectedBudgetHead,
          selectedLedger,
          existingVouchers,
        );
        setFormData((prev) => ({ ...prev, CV_No: generatedNo }));
      }
    }
  }, [selectedBranch, formData.Bh_Id, isEditMode, existingVouchers]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [branches, challanTypes, subLedgers, paymentModes] =
        await Promise.all([
          ChallanVoucherApi.getBranches(),
          ChallanVoucherApi.getChallanTypes(),
          ChallanVoucherApi.getSubLedgers(),
          ChallanVoucherApi.getPaymentModes(),
        ]);

      setDropdownData((prev) => ({
        ...prev,
        branches: branches || [],
        challanTypes: challanTypes || [],
        subLedgers: subLedgers || [],
        paymentModes: paymentModes || [],
      }));
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadExistingVouchers = async () => {
    try {
      const result = await ChallanVoucherApi.getAll(1, 1000);
      setExistingVouchers(result.vouchers || []);
    } catch (error) {
      console.error("Error loading existing vouchers:", error);
    }
  };

  const loadBudgetHeadsByBranch = async (branchId) => {
    if (!branchId) {
      setDropdownData((prev) => ({ ...prev, budgetHeads: [] }));
      setFilteredBudgetHeads([]);
      return;
    }

    setLoadingBudgetHeads(true);
    try {
      const response = await ChallanVoucherApi.getBudgetHeadsByBranch(branchId);

      console.log(response);
      // Extract all budget heads from all mappings
      let allBudgetHeads = [];
      if (response && Array.isArray(response)) {
        response.forEach((mapping) => {
          if (
            mapping.all_budget_heads &&
            Array.isArray(mapping.all_budget_heads)
          ) {
            allBudgetHeads = [...allBudgetHeads, ...mapping.all_budget_heads];
          }
        });

        // CRITICAL FIX: Filter out budget heads where Gr_Exp ==  "N" (Expenditure = No)
        // Only show heads where Gr_Exp != "N" (Expenditure = Yes or other values)
        const filteredBudgetHeads = allBudgetHeads.filter(
          (head) => head.Gr_Exp != "Y",
        );

        // Remove duplicates by Bh_Id
        const uniqueBudgetHeads = Array.from(
          new Map(
            filteredBudgetHeads.map((head) => [head.Bh_Id, head]),
          ).values(),
        );

        setDropdownData((prev) => ({
          ...prev,
          budgetHeads: filteredBudgetHeads,
        }));

        // Update filtered budget heads for search
        setFilteredBudgetHeads(uniqueBudgetHeads);

        // Clear ledger if current budget head is no longer available
        if (formData.Bh_Id) {
          const budgetHeadExists = uniqueBudgetHeads.some(
            (head) => head.Bh_Id == parseInt(formData.Bh_Id),
          );
          if (!budgetHeadExists) {
            setFormData((prev) => ({ ...prev, Bh_Id: "", Lg_Id: "" }));
            setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
            setFilteredLedgerAccounts([]);

            // Show toast notification if budget head was filtered out
            if (formData.Bh_Id) {
              toast.info(
                "Selected budget head is no longer available (Expenditure = No)",
              );
            }
          }
        }
      } else {
        setDropdownData((prev) => ({ ...prev, budgetHeads: [] }));
        setFilteredBudgetHeads([]);
      }
    } catch (error) {
      console.error(
        `Error loading budget heads for branch ${branchId}:`,
        error,
      );
      setDropdownData((prev) => ({ ...prev, budgetHeads: [] }));
      setFilteredBudgetHeads([]);
      toast.error("Failed to load budget heads");
    } finally {
      setLoadingBudgetHeads(false);
    }
  };

  const loadLedgersByBudgetHead = async (budgetHeadId) => {
    if (!budgetHeadId) {
      setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
      setFilteredLedgerAccounts([]);
      return;
    }

    setLoadingLedgers(true);
    try {
      const response =
        await ChallanVoucherApi.getLedgersByBudgetHead(budgetHeadId);

      const ledgers = response || [];

      setDropdownData((prev) => ({
        ...prev,
        ledgerAccounts: ledgers,
      }));
      setFilteredLedgerAccounts(ledgers);

      if (formData.Lg_Id && ledgers.length > 0) {
        const ledgerExists = ledgers.some(
          (ledger) => ledger.Lg_Id == parseInt(formData.Lg_Id),
        );
        if (!ledgerExists) {
          setFormData((prev) => ({ ...prev, Lg_Id: "" }));
        }
      }
    } catch (error) {
      console.error(
        `Error loading ledgers for budget head ${budgetHeadId}:`,
        error,
      );
      setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
      setFilteredLedgerAccounts([]);
      toast.error("Failed to load ledger accounts");
    } finally {
      setLoadingLedgers(false);
    }
  };

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const response = await ChallanVoucherApi.getById(id);
      const voucherData =
        response.data && response.data[0] ? response.data[0] : response.data;

      // Set form data with correct field mapping including the new Ch_Date
      const newFormData = {
        Ch_Start_Date: voucherData?.Ch_Start_Date
          ? new Date(voucherData.Ch_Start_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        Ch_End_Date: voucherData?.Ch_End_Date
          ? new Date(voucherData.Ch_End_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        Ch_Date: voucherData?.Ch_Date // NEW FIELD - Load single date
          ? new Date(voucherData.Ch_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        CV_No: voucherData?.CV_No || "",
        Dpt_Id: voucherData?.Dpt_Id?.toString() || "",
        Bh_Id: voucherData?.Bh_Id?.toString() || "",
        Lg_Id: voucherData?.Lg_Id?.toString() || "",
        CV_Ty: voucherData?.CV_Ty?.toString() || "",
        Challan_Detail: (
          voucherData?.details ||
          voucherData?.Challan_Detail ||
          []
        ).map((detail) => ({
          CV_Sr: parseInt(detail.CV_Sr) || 1,
          SL_Id: detail.SL_Id?.toString() || "",
          SL_Nm: detail.SL_Name || "",
          Py_Mode: detail.Payment_Mode || "",
          Amount: detail.Amount?.toString() || "",
          FileNo: detail.FileNo || "",
          Remarks: detail.Remarks || "",
        })),
      };

      // Set selected branch for reference
      if (voucherData?.department) {
        setSelectedBranch(voucherData.department);
      }

      setFormData(newFormData);

      // Load budget heads if branch exists
      if (newFormData.Dpt_Id) {
        await loadBudgetHeadsByBranch(newFormData.Dpt_Id);

        // Load ledgers if budget head exists
        if (newFormData.Bh_Id) {
          await loadLedgersByBudgetHead(newFormData.Bh_Id);

          // Set selected ledger for reference
          if (voucherData?.ledger) {
            setSelectedLedger(voucherData.ledger);
          }
        }
      }

      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading challan voucher:", error);
      toast.error("Failed to load challan voucher data!");
      navigate("/transactions/bookkeeping-vouchers/challan-voucher");
    } finally {
      setLoading(false);
    }
  };

  // General keyboard navigation for Enter key
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Branch keyboard handlers
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
      Bh_Id: "",
      Lg_Id: "",
    }));
    setSelectedBranch(branch);
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);

    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: "" }));
    }

    // Reset budget heads and ledgers
    setDropdownData((prev) => ({
      ...prev,
      budgetHeads: [],
      ledgerAccounts: [],
    }));
    setFilteredBudgetHeads([]);
    setFilteredLedgerAccounts([]);
    setSelectedLedger(null);

    // Load budget heads for selected branch
    await loadBudgetHeadsByBranch(branchId);

    setTimeout(() => {
      if (budgetHeadButtonRef.current) {
        budgetHeadButtonRef.current.focus();
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
    const indent = "    ".repeat(level - 1);
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

  // Budget Head keyboard handlers
  const handleBudgetHeadKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      if (!formData.Dpt_Id) {
        toast.error("Please select a branch first");
        return;
      }
      setIsBudgetHeadDropdownOpen(true);
      setBudgetHeadSearchTerm("");
      setBudgetHeadHighlightedIndex(-1);
      setTimeout(() => budgetHeadSearchRef.current?.focus(), 0);
    }
  };

  const handleBudgetHeadSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredBudgetHeads.length > 0) {
        setBudgetHeadHighlightedIndex(0);
        setTimeout(() => {
          if (budgetHeadItemRefs.current[0]) {
            budgetHeadItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBudgetHeadDropdownOpen(false);
      setBudgetHeadHighlightedIndex(-1);
      setBudgetHeadSearchTerm("");
      budgetHeadButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredBudgetHeads.length > 0 && budgetHeadHighlightedIndex >= 0) {
        handleBudgetHeadSelect(filteredBudgetHeads[budgetHeadHighlightedIndex]);
      } else if (filteredBudgetHeads.length > 0) {
        handleBudgetHeadSelect(filteredBudgetHeads[0]);
      }
    }
  };

  const handleBudgetHeadItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredBudgetHeads.length) {
        setBudgetHeadHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (budgetHeadItemRefs.current[nextIndex]) {
            budgetHeadItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setBudgetHeadHighlightedIndex(-1);
        setTimeout(() => budgetHeadSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setBudgetHeadHighlightedIndex(-1);
        setTimeout(() => budgetHeadSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setBudgetHeadHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (budgetHeadItemRefs.current[prevIndex]) {
            budgetHeadItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleBudgetHeadSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBudgetHeadDropdownOpen(false);
      setBudgetHeadHighlightedIndex(-1);
      setBudgetHeadSearchTerm("");
      budgetHeadButtonRef.current?.focus();
    }
  };

  const handleBudgetHeadSelect = async (head) => {
    const budgetHeadId = head.Bh_Id?.toString();
    setFormData((prev) => ({
      ...prev,
      Bh_Id: budgetHeadId,
      Lg_Id: "",
    }));
    setIsBudgetHeadDropdownOpen(false);
    setBudgetHeadSearchTerm("");
    setBudgetHeadHighlightedIndex(-1);

    if (errors.Bh_Id) {
      setErrors((prev) => ({ ...prev, Bh_Id: "" }));
    }

    // Reset ledgers
    setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
    setFilteredLedgerAccounts([]);
    setSelectedLedger(null);

    // Load ledgers for selected budget head
    await loadLedgersByBudgetHead(budgetHeadId);

    setTimeout(() => {
      if (ledgerButtonRef.current) {
        ledgerButtonRef.current.focus();
      }
    }, 100);
  };

  const renderBudgetHeadItem = (head) => {
    const level = parseInt(head.Gr_St) || 1;
    const indent = "    ".repeat(level - 1);
    const name = head.Gr_Nm || "";

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
            <div className="text-sm font-medium text-gray-900">
              <span className="whitespace-pre">{indent}</span>
              {name}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getSelectedBudgetHeadDisplay = () => {
    if (!formData.Bh_Id) return "";
    const selected = flattenedBudgetHeads.find(
      (head) => head.Bh_Id?.toString() == formData.Bh_Id,
    );
    if (!selected) return "Selected budget head not found";

    const level = parseInt(selected.Gr_St) || 1;
    const indent = "    ".repeat(level - 1);
    const name = selected.Gr_Nm || "";

    return name ? `${indent}${name}` : ``;
  };

  // Ledger keyboard handlers
  const handleLedgerKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      if (!formData.Bh_Id) {
        toast.error("Please select a budget head first");
        return;
      }
      setIsLedgerDropdownOpen(true);
      setLedgerSearchTerm("");
      setLedgerHighlightedIndex(-1);
      setTimeout(() => ledgerSearchRef.current?.focus(), 0);
    }
  };

  const handleLedgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLedgerAccounts.length > 0) {
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
      if (filteredLedgerAccounts.length > 0 && ledgerHighlightedIndex >= 0) {
        handleLedgerSelect(filteredLedgerAccounts[ledgerHighlightedIndex]);
      } else if (filteredLedgerAccounts.length > 0) {
        handleLedgerSelect(filteredLedgerAccounts[0]);
      }
    }
  };

  const handleLedgerItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLedgerAccounts.length) {
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

  const handleLedgerSelect = async (ledger) => {
    setFormData((prev) => ({
      ...prev,
      Lg_Id: ledger.Lg_Id.toString(),
    }));
    setSelectedLedger(ledger);
    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);

    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }

    // Focus on first challan detail row's sub-ledger after ledger selection
    setTimeout(() => {
      if (challanTypeButtonRef.current) {
        challanTypeButtonRef.current.focus();
      }
    }, 100);
  };

  const getSelectedLedgerName = () => {
    if (!formData.Lg_Id) return "";
    const selectedLedger = dropdownData.ledgerAccounts.find(
      (account) => account.Lg_Id == parseInt(formData.Lg_Id),
    );

    if (!selectedLedger) return "";

    let displayText = selectedLedger.Lg_Name || "";

    if (
      selectedLedger.Lg_Eng_Name &&
      selectedLedger.Lg_Eng_Name != selectedLedger.Lg_Name
    ) {
      displayText += ` (${selectedLedger.Lg_Eng_Name})`;
    }

    if (selectedLedger.Lg_Code) {
      displayText += ` - ${selectedLedger.Lg_Code}`;
    }

    return displayText;
  };

  const renderLedgerItem = (account) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">
        {account.Lg_Name || "No Name"}
      </div>
      {account.Lg_Eng_Name && (
        <div className="text-xs text-gray-600 mt-0.5">
          {account.Lg_Eng_Name}
        </div>
      )}
      {account.Lg_Code && (
        <div className="text-xs text-gray-500 mt-1">
          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
            {account.Lg_Code}
          </span>
        </div>
      )}
    </div>
  );

  // Challan Type keyboard handlers
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

    // Focus on first challan detail row's sub-ledger
    setTimeout(() => {
      if (slIdRefs.current[0]) {
        slIdRefs.current[0].focus();
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

  // Handle input change for main form
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "CV_No" && value.length > 50) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle challan detail change
  const handleDetailChange = (index, field, value) => {
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
  };

  // Add new challan detail row
  const addNewDetailRow = () => {
    const newSr = formData.Challan_Detail.length + 1;
    setFormData((prev) => ({
      ...prev,
      Challan_Detail: [
        ...prev.Challan_Detail,
        {
          CV_Sr: newSr,
          SL_Id: "",
          SL_Nm: "",
          Py_Mode: "",
          Amount: "",
          FileNo: "",
          Remarks: "",
        },
      ],
    }));

    // Focus on new row's sub-ledger after adding
    setTimeout(() => {
      if (slIdRefs.current[formData.Challan_Detail.length]) {
        slIdRefs.current[formData.Challan_Detail.length].focus();
      }
    }, 100);
  };

  // Remove challan detail row
  const removeDetailRow = (index) => {
    if (formData.Challan_Detail.length == 1) {
      toast.error("At least one challan detail is required");
      return;
    }

    const updatedDetails = formData.Challan_Detail.filter((_, i) => i != index);

    // Recalculate serial numbers
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

    if (!formData.Ch_Start_Date) {
      newErrors.Ch_Start_Date = "Start date is required";
    }

    if (!formData.Ch_End_Date) {
      newErrors.Ch_End_Date = "End date is required";
    } else if (
      new Date(formData.Ch_End_Date) < new Date(formData.Ch_Start_Date)
    ) {
      newErrors.Ch_End_Date = "End date cannot be before start date";
    }

    // NEW FIELD validation
    if (!formData.Ch_Date) {
      newErrors.Ch_Date = "Date is required";
    }

    if (!formData.Dpt_Id) {
      newErrors.Dpt_Id = "Branch selection is required";
    }

    if (!formData.Bh_Id) {
      newErrors.Bh_Id = "Budget head selection is required";
    }

    if (!formData.Lg_Id) {
      newErrors.Lg_Id = "Ledger account selection is required";
    }

    // Validate challan details
    formData.Challan_Detail.forEach((detail, index) => {
      if (!detail.SL_Id) {
        newErrors[`ChallanDetail_${index}_SL_Id`] =
          "Sub-ledger selection is required";
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

    setSaving(true);
    try {
      // Prepare data for API including the new Ch_Date
      const voucherData = {
        Ch_Start_Date: formData.Ch_Start_Date,
        Ch_End_Date: formData.Ch_End_Date,
        Ch_Date: formData.Ch_Date, // NEW FIELD - Include in API data
        CV_No: formData.CV_No,
        Dpt_Id: parseInt(formData.Dpt_Id),
        Bh_Id: parseInt(formData.Bh_Id),
        Lg_Id: parseInt(formData.Lg_Id),
        Is_income: "Y",
        CV_Ty: formData.CV_Ty ? parseInt(formData.CV_Ty) : null,
        Challan_Detail: formData.Challan_Detail.map((detail) => ({
          CV_Sr: detail.CV_Sr,
          SL_Id: detail.SL_Id ? parseInt(detail.SL_Id) : null,
          SL_Nm: detail.SL_Nm || null,
          Py_Mode: detail.Py_Mode,
          Amount: parseFloat(detail.Amount),
          FileNo: detail.FileNo || null,
          Remarks: detail.Remarks || null,
        })),
      };

      let response;
      if (isEditMode) {
        response = await ChallanVoucherApi.update(id, voucherData);
        toast.success("Challan voucher updated successfully!");
      } else {
        response = await ChallanVoucherApi.create(voucherData);
        toast.success("Challan voucher created successfully!");
      }

      setTimeout(() => {
        navigate("/transactions/bookkeeping-vouchers/challan-voucher");
      }, 1500);
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
    navigate("/transactions/bookkeeping-vouchers/challan-voucher");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
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
              navigate("/transactions/bookkeeping-vouchers/challan-voucher")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Challan Voucher" : "New Challan Voucher"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update challan voucher information"
                : "Create new challan voucher"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
            {/* NEW FIELD - Single Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
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
                Challan No. {!isEditMode && "(Auto-generated)"}
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                  {formData.CV_No || (
                    <span className="text-gray-400">
                      {selectedBranch && selectedLedger
                        ? "Generating..."
                        : "Select branch and ledger to generate"}
                    </span>
                  )}
                </div>
                {formData.CV_No && (
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated based on branch and ledger selection (not
                editable)
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  name="Ch_Start_Date"
                  value={formData.Ch_Start_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, branchButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Ch_Start_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.Ch_Start_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Ch_Start_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Ch_Start_Date}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="Ch_End_Date"
                  value={formData.Ch_End_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, branchButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Ch_End_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.Ch_End_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Ch_End_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Ch_End_Date}
                </p>
              )}
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
              setSearchTerm={(e) => {
                if (typeof e == "string" || typeof e == "undefined") {
                  setBranchSearchTerm(e || "");
                } else if (e && e.target) {
                  setBranchSearchTerm(e.target.value);
                }
              }}
              items={flattenedBranches}
              filteredItems={filteredBranches}
              highlightedIndex={branchHighlightedIndex}
              onSelect={handleBranchSelect}
              onKeyDown={handleBranchKeyDown}
              onSearchKeyDown={handleBranchSearchKeyDown}
              onItemKeyDown={(e, item, idx) =>
                handleBranchItemKeyDown(e, item, idx)
              }
              getSelectedDisplay={getSelectedBranchDisplay}
              loading={loadingDropdowns}
              placeholder="Select Branch"
              searchPlaceholder="Search by description or name..."
              buttonRef={branchButtonRef}
              dropdownRef={branchDropdownRef}
              searchRef={branchSearchRef}
              itemRefs={branchItemRefs}
              listRef={branchListRef}
              getId={(item) => item.Dpt_id?.toString()}
              renderItem={renderBranchItem}
            />

            {/* Budget Head Dropdown */}
            <SearchableDropdown
              label="Budget Head"
              value={formData.Bh_Id}
              error={errors.Bh_Id}
              required={true}
              icon={PieChart}
              isOpen={isBudgetHeadDropdownOpen}
              setIsOpen={setIsBudgetHeadDropdownOpen}
              searchTerm={budgetHeadSearchTerm}
              setSearchTerm={(e) => {
                if (typeof e == "string" || typeof e == "undefined") {
                  setBudgetHeadSearchTerm(e || "");
                } else if (e && e.target) {
                  setBudgetHeadSearchTerm(e.target.value);
                }
              }}
              items={flattenedBudgetHeads}
              filteredItems={filteredBudgetHeads}
              highlightedIndex={budgetHeadHighlightedIndex}
              onSelect={handleBudgetHeadSelect}
              onKeyDown={handleBudgetHeadKeyDown}
              onSearchKeyDown={handleBudgetHeadSearchKeyDown}
              onItemKeyDown={(e, item, idx) =>
                handleBudgetHeadItemKeyDown(e, item, idx)
              }
              getSelectedDisplay={getSelectedBudgetHeadDisplay}
              loading={loadingBudgetHeads}
              placeholder={
                formData.Dpt_Id ? "Select Budget Head" : "Select Branch first"
              }
              searchPlaceholder="Search by name..."
              buttonRef={budgetHeadButtonRef}
              dropdownRef={budgetHeadDropdownRef}
              searchRef={budgetHeadSearchRef}
              itemRefs={budgetHeadItemRefs}
              listRef={budgetHeadListRef}
              getId={(item) => item.Bh_Id?.toString()}
              renderItem={renderBudgetHeadItem}
              disabled={!formData.Dpt_Id}
            />

            {/* Ledger Dropdown */}
            <SearchableDropdown
              label="Ledger Account"
              value={formData.Lg_Id}
              error={errors.Lg_Id}
              required={true}
              icon={Layers}
              isOpen={isLedgerDropdownOpen}
              setIsOpen={setIsLedgerDropdownOpen}
              searchTerm={ledgerSearchTerm}
              setSearchTerm={(e) => {
                if (typeof e == "string" || typeof e == "undefined") {
                  setLedgerSearchTerm(e || "");
                } else if (e && e.target) {
                  setLedgerSearchTerm(e.target.value);
                }
              }}
              items={dropdownData.ledgerAccounts}
              filteredItems={filteredLedgerAccounts}
              highlightedIndex={ledgerHighlightedIndex}
              onSelect={handleLedgerSelect}
              onKeyDown={handleLedgerKeyDown}
              onSearchKeyDown={handleLedgerSearchKeyDown}
              onItemKeyDown={(e, item, idx) =>
                handleLedgerItemKeyDown(e, item, idx)
              }
              getSelectedDisplay={getSelectedLedgerName}
              loading={loadingLedgers}
              placeholder={
                formData.Bh_Id
                  ? "Select Ledger Account"
                  : "Select Budget Head first"
              }
              searchPlaceholder="Search by name, english name or code..."
              buttonRef={ledgerButtonRef}
              dropdownRef={ledgerDropdownRef}
              searchRef={ledgerSearchRef}
              itemRefs={ledgerItemRefs}
              listRef={ledgerListRef}
              getId={(item) => item.Lg_Id?.toString()}
              renderItem={renderLedgerItem}
              disabled={!formData.Bh_Id}
            />

            {/* Challan Type Dropdown */}
            {/* <SearchableDropdown
              label="Challan Type"
              value={formData.CV_Ty}
              error={errors.CV_Ty}
              required={true}
              icon={Briefcase}
              isOpen={isChallanTypeDropdownOpen}
              setIsOpen={setIsChallanTypeDropdownOpen}
              searchTerm={challanTypeSearchTerm}
              setSearchTerm={(e) => {
                if (typeof e ==  'string' || typeof e ==  'undefined') {
                  setChallanTypeSearchTerm(e || '');
                } else if (e && e.target) {
                  setChallanTypeSearchTerm(e.target.value);
                }
              }}
              items={dropdownData.challanTypes}
              filteredItems={filteredChallanTypes}
              highlightedIndex={challanTypeHighlightedIndex}
              onSelect={handleChallanTypeSelect}
              onKeyDown={handleChallanTypeKeyDown}
              onSearchKeyDown={handleChallanTypeSearchKeyDown}
              onItemKeyDown={(e, item, idx) => handleChallanTypeItemKeyDown(e, item, idx)}
              getSelectedDisplay={getSelectedChallanTypeName}
              loading={loadingDropdowns}
              placeholder="Select Challan Type"
              searchPlaceholder="Search by type name or code..."
              buttonRef={challanTypeButtonRef}
              dropdownRef={challanTypeDropdownRef}
              searchRef={challanTypeSearchRef}
              itemRefs={challanTypeItemRefs}
              listRef={challanTypeListRef}
              getId={(item) => item.Cht_Id?.toString()}
              renderItem={renderChallanTypeItem}
            /> */}
          </div>
        </div>

        {/* Challan Details Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Challan Details
              </h2>
            </div>
            <button
              type="button"
              onClick={addNewDetailRow}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Row
            </button>
          </div>

          <div className="space-y-4">
            {formData.Challan_Detail.map((detail, index) => (
              <ChallanDetailRow
                key={index}
                index={index}
                detail={detail}
                onChange={handleDetailChange}
                onRemove={removeDetailRow}
                showRemove={formData.Challan_Detail.length > 1}
                subLedgers={dropdownData.subLedgers}
                loadingSubLedgers={loadingSubLedgers}
                paymentModes={dropdownData.paymentModes}
                errors={errors}
                slIdRefs={slIdRefs}
                slNameRefs={slNameRefs}
                fileNoRefs={fileNoRefs}
                amountRefs={amountRefs}
                pyModeRefs={pyModeRefs}
                remarksRefs={remarksRefs}
                handleEnterKey={handleEnterKey}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
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

export default AddEditChallanVoucher;

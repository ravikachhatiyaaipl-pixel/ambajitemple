import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  BookOpen,
  Hash,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  FileText,
  Info,
  Users,
  Search,
  ChevronDown,
  Printer,
  CreditCard,
  Loader,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequeBooksApi } from "../../../services/chequebooksapi";
import axios from "axios";

// SearchableDropdown Component
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
                  item?.Lg_Id || item?.cheque_format_id || `item-${idx}`;

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

const AddEditChequeBooks = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Payment Mode states (Book Account)
  const [paymentModes, setPaymentModes] = useState([]);
  const [loadingPaymentModes, setLoadingPaymentModes] = useState(false);
  const [filteredPaymentModes, setFilteredPaymentModes] = useState([]);
  const [paymentModeSearchTerm, setPaymentModeSearchTerm] = useState("");
  const [isPaymentModeDropdownOpen, setIsPaymentModeDropdownOpen] =
    useState(false);
  const [paymentModeHighlightedIndex, setPaymentModeHighlightedIndex] =
    useState(-1);
  const paymentModeDropdownRef = useRef(null);
  const paymentModeSearchRef = useRef(null);
  const paymentModeItemRefs = useRef([]);
  const paymentModeListRef = useRef(null);
  const paymentModeButtonRef = useRef(null);

  // Cheque Format states
  const [chequeFormats, setChequeFormats] = useState([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const [filteredFormats, setFilteredFormats] = useState([]);
  const [formatSearchTerm, setFormatSearchTerm] = useState("");
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const [formatHighlightedIndex, setFormatHighlightedIndex] = useState(-1);
  const formatDropdownRef = useRef(null);
  const formatSearchRef = useRef(null);
  const formatItemRefs = useRef([]);
  const formatListRef = useRef(null);
  const formatButtonRef = useRef(null);

  // Form state - matches API payload
  const [formData, setFormData] = useState({
    Lg_Id: "",
    leaf_from: "",
    leaf_to: "",
    total_leaves: "",
    received_date: "",
    cheque_format_id: "",
    status: "",
  });

  const paymentModeLoadedRef = useRef(false);
  const paymentModeNameInitializedRef = useRef(false);
  const formatNameInitializedRef = useRef(false);

  // Refs for focus management
  const receivedDateRef = useRef(null);
  const leafFromRef = useRef(null);
  const leafToRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Load payment modes for the Book Account dropdown
  const loadPaymentModes = useCallback(async () => {
    if (paymentModeLoadedRef.current) return;
    paymentModeLoadedRef.current = true;
    setLoadingPaymentModes(true);
    try {
      const modes = await ChequeBooksApi.getPaymentModes();
      // Filter to only include items that have a ledger (Lg_Id is not null)
      const modesWithLedger = modes.filter(
        (mode) => mode.Lg_Id != null && mode.Lg_Id != undefined,
      );
      setPaymentModes(modesWithLedger);
      setFilteredPaymentModes(modesWithLedger);
    } catch (error) {
      console.error("Error loading payment modes:", error);
      toast.error("Failed to load payment modes");
      paymentModeLoadedRef.current = false;
    } finally {
      setLoadingPaymentModes(false);
    }
  }, []);

  // Load cheque formats
  const loadChequeFormats = useCallback(async () => {
    setLoadingFormats(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/cheque-formats/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data.success) {
        const activeFormats = response.data.data.filter(
          (format) => format.is_active == true || format.status == 12,
        );
        setChequeFormats(activeFormats);
        setFilteredFormats(activeFormats);
      }
    } catch (error) {
      console.error("Error loading cheque formats:", error);
      toast.error("Failed to load cheque formats");
    } finally {
      setLoadingFormats(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadPaymentModes();
    loadChequeFormats();
  }, [loadPaymentModes, loadChequeFormats]);

  // Load cheque book data if editing
  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadChequeBookData();
    }
  }, [id]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        paymentModeDropdownRef.current &&
        !paymentModeDropdownRef.current.contains(event.target)
      ) {
        setIsPaymentModeDropdownOpen(false);
        setPaymentModeHighlightedIndex(-1);
        setPaymentModeSearchTerm("");
      }
      if (
        formatDropdownRef.current &&
        !formatDropdownRef.current.contains(event.target)
      ) {
        setIsFormatDropdownOpen(false);
        setFormatHighlightedIndex(-1);
        setFormatSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter payment modes based on search
  useEffect(() => {
    if (!paymentModeSearchTerm.trim()) {
      setFilteredPaymentModes(paymentModes);
    } else {
      const term = paymentModeSearchTerm.toLowerCase().trim();
      const filtered = paymentModes.filter(
        (mode) =>
          mode.PayMd_Name?.toLowerCase().includes(term) ||
          mode.PayMd_Code?.toLowerCase().includes(term) ||
          mode.ledger?.Lg_Name?.toLowerCase().includes(term) ||
          mode.ledger?.Lg_Eng_Name?.toLowerCase().includes(term),
      );
      setFilteredPaymentModes(filtered);
    }
    setPaymentModeHighlightedIndex(-1);
  }, [paymentModeSearchTerm, paymentModes]);

  // Filter formats based on search
  useEffect(() => {
    if (!formatSearchTerm.trim()) {
      setFilteredFormats(chequeFormats);
    } else {
      const term = formatSearchTerm.toLowerCase().trim();
      const filtered = chequeFormats.filter(
        (format) =>
          format.format_name?.toLowerCase().includes(term) ||
          format.bank?.bank_name?.toLowerCase().includes(term) ||
          format.description?.toLowerCase().includes(term),
      );
      setFilteredFormats(filtered);
    }
    setFormatHighlightedIndex(-1);
  }, [formatSearchTerm, chequeFormats]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isPaymentModeDropdownOpen && paymentModeSearchRef.current) {
      setTimeout(() => paymentModeSearchRef.current.focus(), 0);
    }
  }, [isPaymentModeDropdownOpen]);

  useEffect(() => {
    if (isFormatDropdownOpen && formatSearchRef.current) {
      setTimeout(() => formatSearchRef.current.focus(), 0);
    }
  }, [isFormatDropdownOpen]);

  // Scroll highlighted item into view
  const scrollIntoView = (container, items, highlightedIndex, isOpen) => {
    if (isOpen && highlightedIndex >= 0 && container) {
      const containerEl = container.current;
      const itemEl = items.current[highlightedIndex];
      if (itemEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const itemRect = itemEl.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  };

  useEffect(() => {
    scrollIntoView(
      paymentModeListRef,
      paymentModeItemRefs,
      paymentModeHighlightedIndex,
      isPaymentModeDropdownOpen,
    );
  }, [paymentModeHighlightedIndex, isPaymentModeDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      formatListRef,
      formatItemRefs,
      formatHighlightedIndex,
      isFormatDropdownOpen,
    );
  }, [formatHighlightedIndex, isFormatDropdownOpen]);

  // General keyboard navigation for Enter key - Sequential flow
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // ============= PAYMENT MODE KEYBOARD HANDLERS =============
  const handlePaymentModeKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsPaymentModeDropdownOpen(true);
      setPaymentModeSearchTerm("");
      setPaymentModeHighlightedIndex(-1);
      setTimeout(() => paymentModeSearchRef.current?.focus(), 0);
    }
  };

  const handlePaymentModeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredPaymentModes.length > 0) {
        setPaymentModeHighlightedIndex(0);
        setTimeout(() => {
          if (paymentModeItemRefs.current[0]) {
            paymentModeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPaymentModeDropdownOpen(false);
      setPaymentModeHighlightedIndex(-1);
      setPaymentModeSearchTerm("");
      paymentModeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredPaymentModes.length > 0 && paymentModeHighlightedIndex >= 0) {
        handlePaymentModeSelect(
          filteredPaymentModes[paymentModeHighlightedIndex],
        );
      } else if (filteredPaymentModes.length > 0) {
        handlePaymentModeSelect(filteredPaymentModes[0]);
      }
    }
  };

  const handlePaymentModeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredPaymentModes.length) {
        setPaymentModeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (paymentModeItemRefs.current[nextIndex]) {
            paymentModeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setPaymentModeHighlightedIndex(-1);
        setTimeout(() => paymentModeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setPaymentModeHighlightedIndex(-1);
        setTimeout(() => paymentModeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setPaymentModeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (paymentModeItemRefs.current[prevIndex]) {
            paymentModeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handlePaymentModeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPaymentModeDropdownOpen(false);
      setPaymentModeHighlightedIndex(-1);
      setPaymentModeSearchTerm("");
      paymentModeButtonRef.current?.focus();
    }
  };

  const handlePaymentModeSelect = (paymentMode) => {
    // Use the Lg_Id directly from the payment mode
    const lgId = paymentMode.Lg_Id;

    if (!lgId) {
      toast.error("Selected payment mode does not have an associated ledger");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      Lg_Id: lgId.toString(),
    }));

    // Display the payment mode name in the search field
    setPaymentModeSearchTerm(paymentMode.PayMd_Name || "");
    setIsPaymentModeDropdownOpen(false);
    setPaymentModeHighlightedIndex(-1);

    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }

    setTimeout(() => {
      if (receivedDateRef.current) {
        receivedDateRef.current.focus();
      }
    }, 100);
  };

  const getSelectedPaymentModeDisplay = () => {
    if (!formData.Lg_Id) return "";
    // Find the payment mode that has this Lg_Id
    const selected = paymentModes.find(
      (mode) => mode.Lg_Id == parseInt(formData.Lg_Id),
    );
    if (selected) {
      return selected.PayMd_Name || "";
    }
    return paymentModeSearchTerm || "Selected account";
  };

  const renderPaymentModeItem = (paymentMode) => {
    const ledger = paymentMode.ledger;
    return (
      <div className="py-1">
        <div className="font-medium text-gray-900 truncate">
          {paymentMode.PayMd_Name}
        </div>

        {ledger && (
          <div className="text-xs text-gray-400 flex items-center space-x-2">
            <span>Ledger: {ledger.Lg_Name || ledger.Lg_Eng_Name}</span>
          </div>
        )}
      </div>
    );
  };

  // ============= CHEQUE FORMAT KEYBOARD HANDLERS =============
  const handleFormatKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsFormatDropdownOpen(true);
      setFormatSearchTerm("");
      setFormatHighlightedIndex(-1);
      setTimeout(() => formatSearchRef.current?.focus(), 0);
    }
  };

  const handleFormatSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredFormats.length > 0) {
        setFormatHighlightedIndex(0);
        setTimeout(() => {
          if (formatItemRefs.current[0]) {
            formatItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsFormatDropdownOpen(false);
      setFormatHighlightedIndex(-1);
      setFormatSearchTerm("");
      formatButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredFormats.length > 0 && formatHighlightedIndex >= 0) {
        handleFormatSelect(filteredFormats[formatHighlightedIndex]);
      } else if (filteredFormats.length > 0) {
        handleFormatSelect(filteredFormats[0]);
      }
    }
  };

  const handleFormatItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredFormats.length) {
        setFormatHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (formatItemRefs.current[nextIndex]) {
            formatItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setFormatHighlightedIndex(-1);
        setTimeout(() => formatSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setFormatHighlightedIndex(-1);
        setTimeout(() => formatSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setFormatHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (formatItemRefs.current[prevIndex]) {
            formatItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleFormatSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsFormatDropdownOpen(false);
      setFormatHighlightedIndex(-1);
      setFormatSearchTerm("");
      formatButtonRef.current?.focus();
    }
  };

  const handleFormatSelect = (format) => {
    setFormData((prev) => ({
      ...prev,
      cheque_format_id: format.cheque_format_id.toString(),
    }));
    setFormatSearchTerm(format.format_name || "");
    setIsFormatDropdownOpen(false);
    setFormatHighlightedIndex(-1);

    if (errors.cheque_format_id) {
      setErrors((prev) => ({ ...prev, cheque_format_id: "" }));
    }

    // Focus moves to Save button after selecting format
    setTimeout(() => {
      if (saveButtonRef.current) {
        saveButtonRef.current.focus();
      }
    }, 100);
  };

  const getSelectedFormatDisplay = () => {
    if (!formData.cheque_format_id) return "";
    const selected = chequeFormats.find(
      (f) => f.cheque_format_id == parseInt(formData.cheque_format_id),
    );
    if (!selected) return formatSearchTerm || "Selected format";
    return selected.format_name || "";
  };

  const renderFormatItem = (format) => (
    <div className="py-1">
      <div className="font-medium text-gray-900 truncate">
        {format.format_name}
      </div>
      {format.description && (
        <div className="text-sm text-gray-500 truncate">
          {format.description}
        </div>
      )}
      <div className="text-xs text-gray-400 flex items-center space-x-2">
        {format.bank && <></>}
        {format.is_active && (
          <>
            <span> </span>
          </>
        )}
      </div>
    </div>
  );

  const loadChequeBookData = async () => {
    setLoading(true);
    try {
      const data = await ChequeBooksApi.getById(id);
      console.log("Loaded data:", data);

      let formattedReceivedDate = "";
      if (data.received_date) {
        const dateObj = new Date(data.received_date);
        if (!isNaN(dateObj.getTime())) {
          formattedReceivedDate = dateObj.toISOString().split("T")[0];
        }
      }

      // Get Lg_Id from bank_account object
      const lgId = data?.bank_account?.Lg_Id
        ? data.bank_account.Lg_Id.toString()
        : "";
      const bankAccountName =
        data?.bank_account?.Lg_Name || data?.bank_account?.Lg_Eng_Name || "";

      console.log("Setting Lg_Id:", lgId);
      console.log("Setting bank account name:", bankAccountName);

      setFormData({
        Lg_Id: lgId,
        leaf_from: data.leaf_from || "",
        leaf_to: data.leaf_to || "",
        total_leaves: data.total_leaves || "",
        received_date: formattedReceivedDate,
        cheque_format_id: data.cheque_format_id
          ? data.cheque_format_id.toString()
          : "",
        status: data.status || "",
      });

      // Set payment mode search term from bank_account object
      if (bankAccountName) {
        setPaymentModeSearchTerm(bankAccountName);
      }

      // Set format search term
      if (data.cheque_format_id) {
        const selectedFormat = chequeFormats.find(
          (f) => f.cheque_format_id == parseInt(data.cheque_format_id),
        );
        if (selectedFormat) {
          setFormatSearchTerm(selectedFormat.format_name || "");
          formatNameInitializedRef.current = true;
        }
      }

      // Mark payment mode as initialized
      if (lgId) {
        paymentModeNameInitializedRef.current = true;
      }
    } catch (error) {
      console.error("Error loading cheque book:", error);
      toast.error("Failed to load cheque book data!");
      navigate("/masters/financial-accounting/cheque-books");
    } finally {
      setLoading(false);
    }
  };

  // Update payment mode search term when payment modes load and we have a Lg_Id
  useEffect(() => {
    if (
      formData.Lg_Id &&
      paymentModes.length > 0 &&
      !paymentModeNameInitializedRef.current
    ) {
      const selectedMode = paymentModes.find(
        (mode) => mode.Lg_Id == parseInt(formData.Lg_Id),
      );
      if (selectedMode) {
        setPaymentModeSearchTerm(selectedMode.PayMd_Name || "");
        paymentModeNameInitializedRef.current = true;
      }
    }
  }, [paymentModes, formData.Lg_Id]);

  // Update format search term when formats load
  useEffect(() => {
    if (
      formData.cheque_format_id &&
      chequeFormats.length > 0 &&
      !formatNameInitializedRef.current
    ) {
      const selectedFormat = chequeFormats.find(
        (f) => f.cheque_format_id == parseInt(formData.cheque_format_id),
      );
      if (selectedFormat) {
        setFormatSearchTerm(selectedFormat.format_name || "");
        formatNameInitializedRef.current = true;
      }
    }
  }, [chequeFormats, formData.cheque_format_id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));

    if (name == "leaf_from" || name == "leaf_to") {
      const leafFrom = name == "leaf_from" ? value : formData.leaf_from;
      const leafTo = name == "leaf_to" ? value : formData.leaf_to;

      if (
        leafFrom &&
        leafTo &&
        !isNaN(parseInt(leafFrom)) &&
        !isNaN(parseInt(leafTo))
      ) {
        const total = parseInt(leafTo) - parseInt(leafFrom) + 1;
        if (total > 0) {
          setFormData((prev) => ({
            ...prev,
            total_leaves: total.toString(),
          }));
        }
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Only required fields with * are validated
    if (!formData.Lg_Id) {
      newErrors.Lg_Id = "Bank account is required";
    }

    if (!formData.received_date) {
      newErrors.received_date = "Received date is required";
    }

    if (!formData.cheque_format_id) {
      newErrors.cheque_format_id = "Cheque format is required";
    }

    // Leaf fields are NOT required (no *), but if provided, validate them
    if (formData.leaf_from && isNaN(parseInt(formData.leaf_from))) {
      newErrors.leaf_from = "Leaf from must be a number";
    }

    if (formData.leaf_to && isNaN(parseInt(formData.leaf_to))) {
      newErrors.leaf_to = "Leaf to must be a number";
    }

    if (
      formData.leaf_from &&
      formData.leaf_to &&
      parseInt(formData.leaf_to) <= parseInt(formData.leaf_from)
    ) {
      newErrors.leaf_to = "Leaf to must be greater than leaf from";
    }

    // Total leaves - only validate if both leaf fields are provided
    if (formData.leaf_from && formData.leaf_to) {
      if (!formData.total_leaves) {
        newErrors.total_leaves = "Total leaves calculation is required";
      } else if (parseInt(formData.total_leaves) <= 0) {
        newErrors.total_leaves = "Total leaves must be greater than 0";
      } else if (parseInt(formData.total_leaves) > 1000) {
        newErrors.total_leaves = "Total leaves cannot exceed 1000";
      }
    }

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
      title: isEditMode ? "Update Cheque Book?" : "Create New Cheque Book?",
      text: isEditMode
        ? "Are you sure you want to update this cheque book information?"
        : "Are you sure you want to create this new cheque book?",
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
      const chequeBookData = {
        Lg_Id: parseInt(formData.Lg_Id),
        received_date: formData.received_date,
        cheque_format_id: parseInt(formData.cheque_format_id),
        // Optional fields - only send if they have values
        ...(formData.leaf_from && {
          leaf_from: formData.leaf_from.padStart(6, "0"),
        }),
        ...(formData.leaf_to && { leaf_to: formData.leaf_to.padStart(6, "0") }),
        ...(formData.leaf_from &&
          formData.leaf_to && {
            total_leaves: parseInt(formData.total_leaves),
          }),
        status: formData.status || null,
      };

      console.log("Submitting data:", chequeBookData);

      if (isEditMode) {
        await ChequeBooksApi.update(id, chequeBookData);
        toast.success("Cheque book updated successfully!");
      } else {
        await ChequeBooksApi.create(chequeBookData);
        toast.success("Cheque book created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/cheque-books");
      }, 1500);
    } catch (error) {
      console.error("Error saving cheque book:", error);

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
              ? "Failed to update cheque book. Please try again."
              : "Failed to create cheque book. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/cheque-books");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cheque book data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/cheque-books")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Cheque Book" : "Add New Cheque Book"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update cheque book master information"
                : "Create a new cheque book master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Book Account - Required */}
            <SearchableDropdown
              label="Book Account"
              value={formData.Lg_Id}
              error={errors.Lg_Id}
              required={true}
              icon={Users}
              isOpen={isPaymentModeDropdownOpen}
              setIsOpen={setIsPaymentModeDropdownOpen}
              searchTerm={paymentModeSearchTerm}
              setSearchTerm={setPaymentModeSearchTerm}
              items={paymentModes}
              filteredItems={filteredPaymentModes}
              highlightedIndex={paymentModeHighlightedIndex}
              onSelect={handlePaymentModeSelect}
              onKeyDown={handlePaymentModeKeyDown}
              onSearchKeyDown={handlePaymentModeSearchKeyDown}
              onItemKeyDown={handlePaymentModeItemKeyDown}
              getSelectedDisplay={getSelectedPaymentModeDisplay}
              loading={loadingPaymentModes}
              placeholder="Search and select payment mode..."
              searchPlaceholder="Search by payment mode name, code, or ledger..."
              buttonRef={paymentModeButtonRef}
              dropdownRef={paymentModeDropdownRef}
              searchRef={paymentModeSearchRef}
              itemRefs={paymentModeItemRefs}
              listRef={paymentModeListRef}
              renderItem={renderPaymentModeItem}
            />

            {/* 2. Received Date - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={receivedDateRef}
                  type="date"
                  name="received_date"
                  value={formData.received_date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, leafFromRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.received_date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {errors.received_date ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.received_date}
                </p>
              ) : null}
            </div>

            {/* 3. Leaf From - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leaf From
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={leafFromRef}
                  type="text"
                  name="leaf_from"
                  value={formData.leaf_from}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, leafToRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.leaf_from ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 000001 (optional)"
                  maxLength={6}
                />
              </div>
              {errors.leaf_from ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.leaf_from}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Starting leaf number (optional)
                </p>
              )}
            </div>

            {/* 4. Leaf To - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leaf To
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={leafToRef}
                  type="text"
                  name="leaf_to"
                  value={formData.leaf_to}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, formatButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.leaf_to ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 000100 (optional)"
                  maxLength={6}
                />
              </div>
              {errors.leaf_to ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.leaf_to}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Ending leaf number (optional)
                </p>
              )}
            </div>

            {/* 5. Total Leaves - Auto Calculated (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Leaves
              </label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="total_leaves"
                  value={formData.total_leaves}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
              {errors.total_leaves ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.total_leaves}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Auto-calculated when both leaf fields are provided
                </p>
              )}
            </div>

            {/* 6. Cheque Format - Required */}
            <SearchableDropdown
              label="Cheque Format"
              value={formData.cheque_format_id}
              error={errors.cheque_format_id}
              required={true}
              icon={Printer}
              isOpen={isFormatDropdownOpen}
              setIsOpen={setIsFormatDropdownOpen}
              searchTerm={formatSearchTerm}
              setSearchTerm={setFormatSearchTerm}
              items={chequeFormats}
              filteredItems={filteredFormats}
              highlightedIndex={formatHighlightedIndex}
              onSelect={handleFormatSelect}
              onKeyDown={handleFormatKeyDown}
              onSearchKeyDown={handleFormatSearchKeyDown}
              onItemKeyDown={handleFormatItemKeyDown}
              getSelectedDisplay={getSelectedFormatDisplay}
              loading={loadingFormats}
              placeholder="Search and select cheque format..."
              searchPlaceholder="Search by format name, bank, or description..."
              buttonRef={formatButtonRef}
              dropdownRef={formatDropdownRef}
              searchRef={formatSearchRef}
              itemRefs={formatItemRefs}
              listRef={formatListRef}
              renderItem={renderFormatItem}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Leaf From, Leaf To, and Total Leaves are optional
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Cheque Book" : "Create Cheque Book"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditChequeBooks;

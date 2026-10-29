import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  Hash,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  CheckCircle,
  XCircle,
  Info,
  X,
  Receipt,
  Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentBookingTransactionApi from "../../../services/hall-rent-booking-transaction-api";

// Searchable Dropdown Component
const SearchableDropdown = ({
  label, required, items, selectedId, onSelect, loading,
  error: fieldError, getItemLabel, getItemId, placeholder = "Select",
  nextFocusRef, triggerRef, icon: Icon, disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const internalButtonRef = useRef(null);
  const buttonRef = triggerRef || internalButtonRef;

  const filteredItems = items.filter(i =>
    getItemLabel(i).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedItem = items.find(i => getItemId(i) == selectedId);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false); setSearchTerm(""); setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const item = itemRefs.current[highlightedIndex];
      if (item) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (itemId) => {
    onSelect(itemId);
    setIsOpen(false); setSearchTerm(""); setHighlightedIndex(-1);
    if (nextFocusRef?.current) setTimeout(() => nextFocusRef.current.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      if (items.length > 0) {
        setIsOpen(true); setSearchTerm(""); setHighlightedIndex(-1);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredItems.length > 0) { 
        setHighlightedIndex(0); 
        setTimeout(() => itemRefs.current[0]?.focus(), 0); 
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsOpen(false); setSearchTerm(""); setHighlightedIndex(-1); 
      buttonRef.current?.focus();
    } else if (e.key == "Enter" && filteredItems.length == 1) {
      e.preventDefault(); 
      handleSelect(getItemId(filteredItems[0]));
    } else if (e.key == "Tab") {
      setIsOpen(false); setSearchTerm(""); setHighlightedIndex(-1);
    }
  };

  const handleItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const next = idx + 1;
      if (next < filteredItems.length) { 
        setHighlightedIndex(next); 
        setTimeout(() => itemRefs.current[next]?.focus(), 0); 
      } else { 
        setHighlightedIndex(-1); 
        setTimeout(() => searchRef.current?.focus(), 0); 
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) { 
        setHighlightedIndex(-1); 
        setTimeout(() => searchRef.current?.focus(), 0); 
      } else { 
        const prev = idx - 1; 
        setHighlightedIndex(prev); 
        setTimeout(() => itemRefs.current[prev]?.focus(), 0); 
      }
    } else if (e.key == "Enter") {
      e.preventDefault(); 
      handleSelect(getItemId(item));
    } else if (e.key == "Escape") {
      e.preventDefault(); 
      setIsOpen(false); setSearchTerm(""); 
      buttonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsOpen(false); setSearchTerm(""); setHighlightedIndex(-1);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <div ref={dropdownRef} className="relative">
        {loading ? (
          <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : (
          <>
            <button 
              ref={buttonRef} 
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)} 
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white text-sm flex items-center ${
                fieldError ? "border-red-500 bg-red-50" : "border-gray-300"
              } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />}
              <span className="flex-1 truncate">
                {selectedId && selectedItem
                  ? <span className="text-gray-900">{getItemLabel(selectedItem)}</span>
                  : <span className="text-gray-400">{placeholder}</span>
                }
              </span>
            </button>
            {!disabled && (
              <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </>
        )}
        {isOpen && !loading && !disabled && (
          <div className="absolute z-[100] mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  ref={searchRef} 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setHighlightedIndex(-1); }}
                  onKeyDown={handleSearchKeyDown} 
                  placeholder="Search..."
                  className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={() => setSearchTerm("")} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div ref={listRef} className="overflow-y-auto max-h-44">
              {filteredItems.length > 0 ? filteredItems.map((item, idx) => {
                const isSel = getItemId(item) == selectedId;
                return (
                  <button 
                    key={getItemId(item)} 
                    ref={(el) => { itemRefs.current[idx] = el; }}
                    type="button" 
                    tabIndex={0}
                    onClick={() => handleSelect(getItemId(item))}
                    onKeyDown={(e) => handleItemKeyDown(e, item, idx)}
                    className={`w-full px-4 py-2.5 text-left text-sm border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx ? "bg-blue-100" : isSel ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={isSel ? "text-blue-600 font-medium" : "text-gray-900"}>{getItemLabel(item)}</span>
                      {isSel && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              }) : <div className="px-4 py-6 text-center text-sm text-gray-500">No results found</div>}
            </div>
            <div className="border-t border-gray-200 px-3 py-1.5 bg-gray-50">
              <span className="text-xs text-gray-400">{filteredItems.length} items</span>
            </div>
          </div>
        )}
      </div>
      {fieldError && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{fieldError}</p>}
    </div>
  );
};

const AddEditHallRentBookingTransaction = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingHalls, setLoadingHalls] = useState(false);
  const [loadingCCCs, setLoadingCCCs] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Hall Rent Booking Transaction");
  const [allBookings, setAllBookings] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [cccs, setCccs] = useState([]);
  const [filteredCccs, setFilteredCccs] = useState([]);
  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedCcc, setSelectedCcc] = useState(null);

  // ===== MISSING STATE VARIABLES =====
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionsList, setActionsList] = useState([]);
  const [initialActionId, setInitialActionId] = useState(null);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  // ===================================

  // Refs for focus management - User Experience Flow
  const bookingButtonRef = useRef(null);
  const bookingSearchRef = useRef(null);
  const hallButtonRef = useRef(null);
  const hallSearchRef = useRef(null);
  const cccButtonRef = useRef(null);
  const cccSearchRef = useRef(null);
  const dateRef = useRef(null);
  const typeRef = useRef(null);
  const amountRef = useRef(null);
  const billNoRef = useRef(null);
  const cdRef = useRef(null);
  const remarkRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const bookingDropdownRef = useRef(null);
  const hallDropdownRef = useRef(null);
  const cccDropdownRef = useRef(null);
  const bookingListRef = useRef(null);
  const hallListRef = useRef(null);
  const cccListRef = useRef(null);
  const bookingItemRefs = useRef([]);
  const hallItemRefs = useRef([]);
  const cccItemRefs = useRef([]);

  const [formData, setFormData] = useState({
    HLRBTRN_Date: new Date().toISOString().split("T")[0],
    HLRBTRN_Type: "Rent",
    HLRB_Id: "",
    HLM_Id: "",
    HLRBTRN_Amt: "",
    HLRBTRN_BlNo: "",
    HLRBTRN_CD: "C",
    HLRBTRN_RCntr: "",
    HLRBTRN_Remark: "",
  });

  // Get user ID
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
    return null;
  })();

  // Get Fnc_Id and stage from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/hall-rent-booking-transaction";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);

      if (currentMenuItem?.action?.stage) {
        const stage = currentMenuItem.action.stage;
        setCurrentStage(stage);
        loadActionsForStage(stage);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    // Set admin check
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);
  }, [user]);

  // Load actions for stage
  const loadActionsForStage = async (stage) => {
    try {
      const response = await HallRentBookingTransactionApi.getActionsByStage(stage);
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
        } else if (isAdmin) {
          setHasCreatePermission(true);
        }
      }
      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading actions:", error);
      setPermissionsLoaded(true);
    }
  };

  // Load bookings, halls, and CCCs with filtering
  useEffect(() => {
    initAndLoad();
    if (isEditMode) loadData();
    else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        HLRBTRN_Date: today,
      }));
      setTimeout(() => bookingButtonRef.current?.focus(), 100);
    }
  }, [id]);

  const initAndLoad = async () => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");

      // Get the approval stage from the hall-rent-booking-approval menu
      const approvalPath = "/masters/hall-shop-management/hall-rent-booking-approval";
      const approvalMenuItem = menuDetails.find((item) => item.Menu_Links == approvalPath);
      const stage = approvalMenuItem?.action?.stage || null;

      // Resolve the last-approved Act_Id from the stage's action chain
      let lastStatusId = null;
      if (stage) {
        const actionsRes = await HallRentBookingTransactionApi.getActionsByStage(stage);
        const actions = actionsRes?.data || [];

        // Forward actions only
        const forwardActions = actions.filter((a) => a.Is_Forward == "Y");

        // Last approval = forward action whose Act_Id is NOT used as
        // Previous_Status by any other forward action (terminal node in chain)
        const usedAsPrevious = new Set(
          forwardActions.map((a) => a.Previous_Status?.toString())
        );
        const terminal = forwardActions.find(
          (a) => !usedAsPrevious.has(a.Act_Id?.toString())
        );
        lastStatusId = terminal?.Act_Id ?? null;
      }

      setLastApprovedStatus(lastStatusId);
      await loadDropdowns(lastStatusId);
    } catch (e) {
      console.error("Error during init:", e);
      await loadDropdowns(null);
    }
  };

  const loadDropdowns = async (statusId) => {
    setLoadingBookings(true);
    setLoadingHalls(true);
    setLoadingCCCs(true);
    try {
      const [bookingsRes, hallsRes, cccsRes] = await Promise.all([
        HallRentBookingTransactionApi.getAllHallRentBookings(),
        HallRentBookingTransactionApi.getAllHalls(),
        HallRentBookingTransactionApi.getAllCCCs(),
      ]);

      const allBookingsData = bookingsRes?.data || [];
      setAllBookings(allBookingsData);

      // Filter bookings on frontend based on statusId
      let filteredBookingsData = allBookingsData;
      if (statusId) {
        filteredBookingsData = allBookingsData.filter(booking => 
          booking.HLRB_Status == statusId || booking.HLRB_R_Status == statusId
        );
      }
      setApprovedBookings(filteredBookingsData);
      
      setHalls(hallsRes?.data || []);
      setFilteredHalls(hallsRes?.data || []);
      setCccs(cccsRes?.data || []);
      setFilteredCccs(cccsRes?.data || []);
    } catch (error) {
      console.error("Error loading dropdowns:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingBookings(false);
      setLoadingHalls(false);
      setLoadingCCCs(false);
      setPermissionsLoaded(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentBookingTransactionApi.getById(id);
      const d = res?.data;
      
      setFormData({
        HLRBTRN_Date: d.HLRBTRN_Date ? new Date(d.HLRBTRN_Date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        HLRBTRN_Type: d.HLRBTRN_Type || "Rent",
        HLRB_Id: d.HLRB_Id || "",
        HLM_Id: d.HLM_Id || "",
        HLRBTRN_Amt: d.HLRBTRN_Amt || "",
        HLRBTRN_BlNo: d.HLRBTRN_BlNo || "",
        HLRBTRN_CD: d.HLRBTRN_CD || "C",
        HLRBTRN_RCntr: d.HLRBTRN_RCntr || "",
        HLRBTRN_Remark: d.HLRBTRN_Remark || "",
      });

      if (d.HLRB_Id && d.booking) {
        setSelectedBooking(d.booking);
      }

      if (d.HLM_Id && d.hall) {
        setSelectedHall(d.hall);
      }

      if (d.HLRBTRN_RCntr && d.recovery_center) {
        setSelectedCcc(d.recovery_center);
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rent-booking-transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    
    // When booking changes, find and store the selected booking
    if (field == "HLRB_Id") {
      const booking = allBookings.find(b => b.HLRB_Id == parseInt(value));
      setSelectedBooking(booking);
    }
  };

  const getBookingLabel = (booking) => {
    if (!booking) return "";
    return `${booking.HLRB_EvNm || "N/A"} - ${booking.hall?.HLM_Name || "N/A"} (${booking.HLRB_Date || ""})`;
  };

  const getHallLabel = (hall) => {
    if (!hall) return "";
    return hall.HLM_Name || "N/A";
  };

  const getCccLabel = (ccc) => {
    if (!ccc) return "";
    return `${ccc.CCC_Name || "N/A"} (${ccc.CCC_Code || ""})`;
  };

  const validate = () => {
    const newErrors = {};

    // Required: Date
    if (!formData.HLRBTRN_Date) {
      newErrors.HLRBTRN_Date = "Transaction date is required";
    }

    // Required: Type
    if (!formData.HLRBTRN_Type) {
      newErrors.HLRBTRN_Type = "Transaction type is required";
    }

    // Required: Amount
    if (!formData.HLRBTRN_Amt) {
      newErrors.HLRBTRN_Amt = "Amount is required";
    } else if (isNaN(formData.HLRBTRN_Amt) || Number(formData.HLRBTRN_Amt) < 0) {
      newErrors.HLRBTRN_Amt = "Amount must be a positive number";
    }

    // Required: C/D
    if (!formData.HLRBTRN_CD) {
      newErrors.HLRBTRN_CD = "Credit/Debit is required";
    }

    // Optional validations
    if (formData.HLRBTRN_BlNo && formData.HLRBTRN_BlNo.length > 25) {
      newErrors.HLRBTRN_BlNo = "Bill number must not exceed 25 characters";
    }

    if (formData.HLRBTRN_Remark && formData.HLRBTRN_Remark.length > 255) {
      newErrors.HLRBTRN_Remark = "Remark must not exceed 255 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const inputClasses = (name) =>
    `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${
      errors[name] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
        if (firstErrorKey == "HLRBTRN_Date") {
          dateRef.current?.focus();
        } else if (firstErrorKey == "HLRBTRN_Type") {
          typeRef.current?.focus();
        } else if (firstErrorKey == "HLRBTRN_Amt") {
          amountRef.current?.focus();
        } else if (firstErrorKey == "HLRBTRN_CD") {
          cdRef.current?.focus();
        } else if (firstErrorKey == "HLRBTRN_BlNo") {
          billNoRef.current?.focus();
        } else if (firstErrorKey == "HLRBTRN_Remark") {
          remarkRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this transaction?"
        : "Are you sure you want to create this transaction?",
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
      const payload = {
        HLRBTRN_Date: formData.HLRBTRN_Date,
        HLRBTRN_Type: formData.HLRBTRN_Type,
        HLRB_Id: formData.HLRB_Id || null,
        HLM_Id: formData.HLM_Id || null,
        HLRBTRN_Amt: Number(formData.HLRBTRN_Amt),
        HLRBTRN_BlNo: formData.HLRBTRN_BlNo?.trim() || null,
        HLRBTRN_CD: formData.HLRBTRN_CD,
        HLRBTRN_RCntr: formData.HLRBTRN_RCntr || null,
        HLRBTRN_Remark: formData.HLRBTRN_Remark?.trim() || null,
        ...(!isEditMode && { HLRBTRN_Status: initialActionId }),
      };

      if (isEditMode) {
        await HallRentBookingTransactionApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await HallRentBookingTransactionApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/hall-rent-booking-transaction"),
        1000,
      );
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });
        setErrors(newErrors);
        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey) {
          toast.error(backendErrors[firstErrorKey][0]);
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/hall-shop-management/hall-rent-booking-transaction");
  };

  if (loading || !permissionsLoaded) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!hasCreatePermission && !isEditMode && !isAdmin) {
    return (
      <div className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Permission Denied
        </h3>
        <p className="text-gray-600">
          You don't have permission to create hall rent booking transactions.
        </p>
        <button
          onClick={() =>
            navigate("/masters/hall-shop-management/hall-rent-booking-transaction")
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${pageTitle}` : `Add New ${pageTitle}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update transaction information"
                : "Create a new transaction"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <Receipt className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Booking - Only shows approved bookings */}
            <SearchableDropdown
              label="Booking"
              required={false}
              items={approvedBookings}
              selectedId={formData.HLRB_Id}
              onSelect={(v) => handleDropdownChange("HLRB_Id", v)}
              loading={loadingBookings}
              error={errors.HLRB_Id}
              getItemId={(i) => i.HLRB_Id?.toString()}
              getItemLabel={getBookingLabel}
              placeholder="Select an approved booking"
              icon={Calendar}
              triggerRef={bookingButtonRef}
              nextFocusRef={hallButtonRef}
            />

            {/* Hall - Second field */}
            <SearchableDropdown
              label="Hall"
              required={false}
              items={halls}
              selectedId={formData.HLM_Id}
              onSelect={(v) => handleDropdownChange("HLM_Id", v)}
              loading={loadingHalls}
              error={errors.HLM_Id}
              getItemId={(i) => i.HLM_Id?.toString()}
              getItemLabel={getHallLabel}
              placeholder="Select a Hall"
              icon={Building}
              triggerRef={hallButtonRef}
              nextFocusRef={cccButtonRef}
            />

            {/* CCC - Third field */}
            <SearchableDropdown
              label="Recovery Center"
              required={false}
              items={cccs}
              selectedId={formData.HLRBTRN_RCntr}
              onSelect={(v) => handleDropdownChange("HLRBTRN_RCntr", v)}
              loading={loadingCCCs}
              error={errors.HLRBTRN_RCntr}
              getItemId={(i) => i.CCC_Id?.toString()}
              getItemLabel={getCccLabel}
              placeholder="Select a Recovery Center"
              icon={Users}
              triggerRef={cccButtonRef}
              nextFocusRef={dateRef}
            />

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateRef}
                  type="date"
                  name="HLRBTRN_Date"
                  value={formData.HLRBTRN_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, typeRef)}
                  className={`${inputClasses("HLRBTRN_Date")} pl-10`}
                />
              </div>
              {errors.HLRBTRN_Date && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRBTRN_Date}
                </p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  ref={typeRef}
                  name="HLRBTRN_Type"
                  value={formData.HLRBTRN_Type}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, amountRef)}
                  className={`${inputClasses("HLRBTRN_Type")} pl-10 bg-white`}
                >
                  <option value="SD">Security Deposit</option>
                  <option value="Rent">Rent</option>
                  <option value="Adj">Adjustment</option>
                  <option value="FFT">Food & Facility Tax</option>
                  <option value="LtFe">Late Fee</option>
                  <option value="Tax">Tax</option>
                  <option value="Trf">Transfer</option>
                  <option value="AdOn">Add-on</option>
                  <option value="Rfnd">Refund</option>
                  <option value="RfCn">Refund Cancellation</option>
                </select>
              </div>
              {errors.HLRBTRN_Type && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRBTRN_Type}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  name="HLRBTRN_Amt"
                  value={formData.HLRBTRN_Amt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, billNoRef)}
                  placeholder="Enter amount"
                  className={`${inputClasses("HLRBTRN_Amt")} pl-10`}
                />
              </div>
              {errors.HLRBTRN_Amt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRBTRN_Amt}
                </p>
              )}
            </div>

            {/* Bill Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Bill Number <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.HLRBTRN_BlNo.length}/25
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={billNoRef}
                  type="text"
                  name="HLRBTRN_BlNo"
                  value={formData.HLRBTRN_BlNo}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, cdRef)}
                  maxLength="25"
                  placeholder="Enter bill number"
                  className={`${inputClasses("HLRBTRN_BlNo")} pl-10`}
                />
              </div>
              {errors.HLRBTRN_BlNo && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRBTRN_BlNo}
                </p>
              )}
            </div>

            {/* Credit / Debit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit / Debit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  ref={cdRef}
                  name="HLRBTRN_CD"
                  value={formData.HLRBTRN_CD}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, remarkRef)}
                  className={`${inputClasses("HLRBTRN_CD")} pl-10 bg-white`}
                >
                  <option value="C">Credit</option>
                  <option value="D">Debit</option>
                </select>
              </div>
              {errors.HLRBTRN_CD && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRBTRN_CD}
                </p>
              )}
            </div>

            {/* Remark */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Remark <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.HLRBTRN_Remark.length}/255
                </span>
              </div>
              <input
                ref={remarkRef}
                type="text"
                name="HLRBTRN_Remark"
                value={formData.HLRBTRN_Remark}
                onChange={handleInputChange}
                maxLength="255"
                placeholder="Enter remark"
                className={inputClasses("HLRBTRN_Remark")}
              />
              {errors.HLRBTRN_Remark && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRBTRN_Remark}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Transaction will be submitted for approval
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
              className="px-6 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? `Update ${pageTitle}` : `Submit Transaction`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallRentBookingTransaction;
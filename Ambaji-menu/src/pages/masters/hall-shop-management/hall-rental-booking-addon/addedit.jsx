import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Calendar,
  Package,
  DollarSign,
  Percent,
  Hash,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  CheckCircle,
  XCircle,
  Info,
  X,
  Users,
  FileText,
  Tag
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentalBookingAddonApi from "../../../services/hall-rental-booking-addon-api";

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

const AddEditHallRentalBookingAddon = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [loadingAddonDetails, setLoadingAddonDetails] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Hall Rental Booking Addon");
  const [allBookings, setAllBookings] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [addons, setAddons] = useState([]);
  const [filteredAddons, setFilteredAddons] = useState([]);
  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [autoFilledData, setAutoFilledData] = useState({
    HLA_Amt: "",
    HLA_Qty: "",
    HLA_TXP: "",
  });

  // Refs for focus management - User Experience Flow
  const bookingButtonRef = useRef(null);
  const bookingSearchRef = useRef(null);
  const addonButtonRef = useRef(null);
  const addonSearchRef = useRef(null);
  const srRef = useRef(null);
  const amountRef = useRef(null);
  const qtyRef = useRef(null);
  const taxRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const bookingDropdownRef = useRef(null);
  const addonDropdownRef = useRef(null);
  const bookingListRef = useRef(null);
  const addonListRef = useRef(null);
  const bookingItemRefs = useRef([]);
  const addonItemRefs = useRef([]);

  const [formData, setFormData] = useState({
    HLRB_Id: "",
    HLBA_Sr: "",
    HLA_Id: "",
    HLA_Amt: "",
    HLA_Qty: "",
    HLA_TXP: "",
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

  // Get Fnc_Id from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/hall-rental-booking-addon";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Load bookings and addons with filtering
  useEffect(() => {
    initAndLoad();
    if (isEditMode) loadData();
    else {
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
        const actionsRes = await HallRentalBookingAddonApi.getActionsByStage(stage);
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
    setLoadingAddons(true);
    try {
      const [bookingsRes, addonsRes] = await Promise.all([
        HallRentalBookingAddonApi.getAllHallRentBookings(),
        HallRentalBookingAddonApi.getAllHallAddons(),
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
      
      setAddons(addonsRes?.data || []);
      setFilteredAddons(addonsRes?.data || []);
    } catch (error) {
      console.error("Error loading dropdowns:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingBookings(false);
      setLoadingAddons(false);
      setPermissionsLoaded(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentalBookingAddonApi.getById(id);
      const d = res?.data;
      
      setFormData({
        HLRB_Id: d.HLRB_Id || "",
        HLBA_Sr: d.HLBA_Sr || "",
        HLA_Id: d.HLA_Id || "",
        HLA_Amt: d.HLA_Amt || "",
        HLA_Qty: d.HLA_Qty || "",
        HLA_TXP: d.HLA_TXP || "",
      });

      setAutoFilledData({
        HLA_Amt: d.HLA_Amt || "",
        HLA_Qty: d.HLA_Qty || "",
        HLA_TXP: d.HLA_TXP || "",
      });

      if (d.HLRB_Id && d.booking) {
        setSelectedBooking(d.booking);
      }

      if (d.HLA_Id && d.addon) {
        setSelectedAddon(d.addon);
        // Auto-fill from loaded data
        setFormData((prev) => ({
          ...prev,
          HLA_Amt: d.HLA_Amt || "",
          HLA_Qty: d.HLA_Qty || "",
          HLA_TXP: d.HLA_TXP || "",
        }));
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rental-booking-addon");
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
    
    // When addon changes, auto-fill amount, quantity, and tax
    if (field == "HLA_Id") {
      const addon = addons.find(a => a.HLA_Id == parseInt(value));
      if (addon) {
        setSelectedAddon(addon);
        setAutoFilledData({
          HLA_Amt: addon.HLA_Amt || "",
          HLA_Qty: addon.HLA_Qty || "",
          HLA_TXP: addon.HLA_TXP || "",
        });
        setFormData((prev) => ({
          ...prev,
          HLA_Amt: addon.HLA_Amt || "",
          HLA_Qty: addon.HLA_Qty || "",
          HLA_TXP: addon.HLA_TXP || "",
        }));
      }
    }
  };

  const getBookingLabel = (booking) => {
    if (!booking) return "";
    return `${booking.HLRB_EvNm || "N/A"} - ${booking.hall?.HLM_Name || "N/A"} (${booking.HLRB_Date || ""})`;
  };

  const getAddonLabel = (addon) => {
    if (!addon) return "";
    return `${addon.HLA_Name || "N/A"} (${addon.HLA_Code || ""})`;
  };

  const validate = () => {
    const newErrors = {};

    // Required: Booking
    if (!formData.HLRB_Id) {
      newErrors.HLRB_Id = "Please select a booking";
    }

    // Required: Addon
    if (!formData.HLA_Id) {
      newErrors.HLA_Id = "Please select an addon";
    }

    // Optional: Sr No validation
    if (formData.HLBA_Sr && (isNaN(formData.HLBA_Sr) || Number(formData.HLBA_Sr) < 0)) {
      newErrors.HLBA_Sr = "Serial number must be a positive number";
    }

    // Quantity validation (auto-filled but can be changed)
    if (formData.HLA_Qty && (isNaN(formData.HLA_Qty) || Number(formData.HLA_Qty) < 1)) {
      newErrors.HLA_Qty = "Quantity must be at least 1";
    }

    // Tax validation (auto-filled but can be changed)
    if (formData.HLA_TXP && (isNaN(formData.HLA_TXP) || Number(formData.HLA_TXP) < 0)) {
      newErrors.HLA_TXP = "Tax must be a positive number";
    }

    // Amount validation (auto-filled but can be changed)
    if (formData.HLA_Amt && (isNaN(formData.HLA_Amt) || Number(formData.HLA_Amt) < 0)) {
      newErrors.HLA_Amt = "Amount must be a positive number";
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
        if (firstErrorKey == "HLRB_Id") {
          bookingButtonRef.current?.focus();
        } else if (firstErrorKey == "HLA_Id") {
          addonButtonRef.current?.focus();
        } else if (firstErrorKey == "HLBA_Sr") {
          srRef.current?.focus();
        } else if (firstErrorKey == "HLA_Qty") {
          qtyRef.current?.focus();
        } else if (firstErrorKey == "HLA_TXP") {
          taxRef.current?.focus();
        } else if (firstErrorKey == "HLA_Amt") {
          amountRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this addon?"
        : "Are you sure you want to create this addon?",
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
        HLRB_Id: parseInt(formData.HLRB_Id),
        HLA_Id: parseInt(formData.HLA_Id),
        HLBA_Sr: formData.HLBA_Sr ? parseInt(formData.HLBA_Sr) : null,
        HLA_Amt: formData.HLA_Amt ? parseFloat(formData.HLA_Amt) : null,
        HLA_Qty: formData.HLA_Qty ? parseInt(formData.HLA_Qty) : null,
        HLA_TXP: formData.HLA_TXP ? parseFloat(formData.HLA_TXP) : null,
      };

      if (isEditMode) {
        await HallRentalBookingAddonApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await HallRentalBookingAddonApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/hall-rental-booking-addon"),
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
    navigate("/masters/hall-shop-management/hall-rental-booking-addon");
  };

  if (loading || !permissionsLoaded) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
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
                ? "Update booking addon information"
                : "Add a new addon to a booking"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Addon Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Booking Selection - Only shows approved bookings */}
            <SearchableDropdown
              label="Booking"
              required={true}
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
              nextFocusRef={addonButtonRef}
            />

            {/* Addon Selection - Second field */}
            <SearchableDropdown
              label="Addon"
              required={true}
              items={addons}
              selectedId={formData.HLA_Id}
              onSelect={(v) => handleDropdownChange("HLA_Id", v)}
              loading={loadingAddons}
              error={errors.HLA_Id}
              getItemId={(i) => i.HLA_Id?.toString()}
              getItemLabel={getAddonLabel}
              placeholder="Select an Addon"
              icon={Package}
              triggerRef={addonButtonRef}
              nextFocusRef={srRef}
            />

            {/* Serial Number - Third field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <input
                  ref={srRef}
                  type="number"
                  name="HLBA_Sr"
                  value={formData.HLBA_Sr}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, amountRef)}
                  placeholder="Enter serial number"
                  className={inputClasses("HLBA_Sr")}
                />
              </div>
              {errors.HLBA_Sr && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLBA_Sr}
                </p>
              )}
            </div>

            {/* Amount - Auto-filled from addon, editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-gray-400 text-xs">(auto-filled)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  name="HLA_Amt"
                  value={formData.HLA_Amt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, qtyRef)}
                  placeholder="Auto-filled from addon"
                  className={`${inputClasses("HLA_Amt")} pl-10 ${!isEditMode ? "bg-gray-50" : ""}`}
                  readOnly={!isEditMode}
                />
              </div>
              {errors.HLA_Amt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLA_Amt}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Amount is auto-filled from addon selection
              </p>
            </div>

            {/* Quantity - Auto-filled from addon, editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-gray-400 text-xs">(auto-filled)</span>
              </label>
              <input
                ref={qtyRef}
                type="number"
                min="1"
                name="HLA_Qty"
                value={formData.HLA_Qty}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, taxRef)}
                placeholder="Auto-filled from addon"
                className={`${inputClasses("HLA_Qty")} ${!isEditMode ? "bg-gray-50" : ""}`}
                readOnly={!isEditMode}
              />
              {errors.HLA_Qty && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLA_Qty}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Quantity is auto-filled from addon selection
              </p>
            </div>

            {/* Tax - Auto-filled from addon, editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax % <span className="text-gray-400 text-xs">(auto-filled)</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={taxRef}
                  type="number"
                  step="0.01"
                  name="HLA_TXP"
                  value={formData.HLA_TXP}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from addon"
                  className={`${inputClasses("HLA_TXP")} pl-10 ${!isEditMode ? "bg-gray-50" : ""}`}
                  readOnly={!isEditMode}
                />
              </div>
              {errors.HLA_TXP && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLA_TXP}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tax is auto-filled from addon selection
              </p>
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
              Amount, Quantity, and Tax are auto-filled from addon selection
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
                  {isEditMode ? `Update ${pageTitle}` : `Save Addon`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallRentalBookingAddon;
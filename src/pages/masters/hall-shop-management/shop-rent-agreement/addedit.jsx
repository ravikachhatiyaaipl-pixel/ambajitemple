import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Calendar,
  User,
  Clock,
  DollarSign,
  FileCheck,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Percent,
  CreditCard,
  Hash,
  XCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopRentAgreementApi from "../../../services/shoprentagreementapi";

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

const AddEditShopRentAgreement = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Shop Rent Agreement");
  const [allApplications, setAllApplications] = useState([]); // All fetched applications
  const [approvedApplications, setApprovedApplications] = useState([]); // Filtered approved applications
  const [shops, setShops] = useState([]);
  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Refs for Enter-key tab flow
  const appButtonRef = useRef(null);
  const shopButtonRef = useRef(null);
  const dateRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const dueDateRef = useRef(null);
  const monthlyRentRef = useRef(null);
  const securityMonthsRef = useRef(null);
  const securityAmountRef = useRef(null);
  const securityPercentRef = useRef(null);
  const taxPercentRef = useRef(null);
  const lateFeeRef = useRef(null);
  const annualRentRef = useRef(null);
  const increasePercentRef = useRef(null);
  const transferFeeRef = useRef(null);
  const decYnRef = useRef(null);
  const statusRef = useRef(null);
  const sdSttRef = useRef(null);
  const stRefRef = useRef(null);
  const rentNoteRef = useRef(null);
  const reasonRef = useRef(null);
  const remarkRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    SPRA_Id: "",
    SPM_Id: "",
    SPRG_Date: new Date().toISOString().split("T")[0],
    SPRG_StDt: "",
    SPRG_EdDt: "",
    SPRG_DuDt: "",
    SPRG_MnRt: "",
    SPRG_SdMn: "",
    SPRG_SdAm: "",
    SPRG_SdPr: "",
    SPRG_TaxP: "",
    SPRG_LtFe: "",
    SPRG_AtRn: "",
    SPRG_IncPr: "",
    SPRG_TrfFe: "",
    SPRG_DcYn: "N",
    SPRG_Status: "ACTIVE",
    SPRG_SdStt: "HELD",
    SPRG_StRef: "",
    SPRG_RnNt: "",
    SPRG_Reason: "",
    SPRG_Remark: "",
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

  // On mount: resolve last-approved status, then load dropdowns
  useEffect(() => {
    initAndLoad();
    if (isEditMode) loadData();
    else setTimeout(() => appButtonRef.current?.focus(), 150);
  }, [id]);

  const initAndLoad = async () => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");

      // Page title
      const currentPath = "/masters/hall-shop-management/shop-rent-agreement";
      const currentMenuItem = menuDetails.find((item) => item.Menu_Links == currentPath);
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);

      // Get the approval stage from the shop-rent-application-approval menu
      const approvalPath = "/masters/hall-shop-management/shop-rent-application-approval";
      const approvalMenuItem = menuDetails.find((item) => item.Menu_Links == approvalPath);
      const stage = approvalMenuItem?.action?.stage || null;

      // Resolve the last-approved Act_Id from the stage's action chain
      let lastStatusId = null;
      if (stage) {
        const actionsRes = await ShopRentAgreementApi.getActionsByStage(stage);
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
    setLoadingApplications(true);
    setLoadingShops(true);
    try {
      // Load all data first
      const [appsRes, shopsRes] = await Promise.all([
        ShopRentAgreementApi.getAllShopRentApplications(),
        ShopRentAgreementApi.getAllShops(),
      ]);

      const allApps = appsRes?.data || [];
      setAllApplications(allApps);

      // Filter applications on frontend based on statusId
      let filteredApps = allApps;
      if (statusId) {
        filteredApps = allApps.filter(app => 
          app.SPRA_Status == statusId || app.SPRA_R_Status == statusId
        );
      }
      setApprovedApplications(filteredApps);
      
      setShops(shopsRes?.data || []);
    } catch (error) {
      console.error("Error loading dropdowns:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingApplications(false);
      setLoadingShops(false);
      setPermissionsLoaded(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ShopRentAgreementApi.getById(id);
      const d = res?.data;
      setFormData({
        SPRA_Id: d.SPRA_Id || "",
        SPM_Id: d.SPM_Id || "",
        SPRG_Date: d.SPRG_Date || new Date().toISOString().split("T")[0],
        SPRG_StDt: d.SPRG_StDt || "",
        SPRG_EdDt: d.SPRG_EdDt || "",
        SPRG_DuDt: d.SPRG_DuDt || "",
        SPRG_MnRt: d.SPRG_MnRt || "",
        SPRG_SdMn: d.SPRG_SdMn || "",
        SPRG_SdAm: d.SPRG_SdAm || "",
        SPRG_SdPr: d.SPRG_SdPr || "",
        SPRG_TaxP: d.SPRG_TaxP || "",
        SPRG_LtFe: d.SPRG_LtFe || "",
        SPRG_AtRn: d.SPRG_AtRn || "",
        SPRG_IncPr: d.SPRG_IncPr || "",
        SPRG_TrfFe: d.SPRG_TrfFe || "",
        SPRG_DcYn: d.SPRG_DcYn || "N",
        SPRG_Status: d.SPRG_Status || "ACTIVE",
        SPRG_SdStt: d.SPRG_SdStt || "HELD",
        SPRG_StRef: d.SPRG_StRef || "",
        SPRG_RnNt: d.SPRG_RnNt || "",
        SPRG_Reason: d.SPRG_Reason || "",
        SPRG_Remark: d.SPRG_Remark || "",
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-rent-agreement");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const getApplicationLabel = (app) => {
    if (!app) return "";
    // Format: Business Name - Application Date
    let displayText = app.Busi_Name || "N/A";
    if (app.SPRA_Date) displayText += ` (${app.SPRA_Date})`;
    return displayText;
  };

  const getShopLabel = (shop) => {
    if (!shop) return "";
    return shop.SPM_Name || "N/A";
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.SPRG_Date) {
      newErrors.SPRG_Date = "Agreement date is required";
    }

    if (!formData.SPRG_StDt) {
      newErrors.SPRG_StDt = "Start date is required";
    }

    if (!formData.SPRG_EdDt) {
      newErrors.SPRG_EdDt = "End date is required";
    } else if (
      formData.SPRG_StDt &&
      formData.SPRG_EdDt &&
      formData.SPRG_EdDt <= formData.SPRG_StDt
    ) {
      newErrors.SPRG_EdDt = "End date must be after start date";
    }

    if (!formData.SPRG_MnRt) {
      newErrors.SPRG_MnRt = "Monthly rent is required";
    } else if (parseFloat(formData.SPRG_MnRt) < 0) {
      newErrors.SPRG_MnRt = "Monthly rent cannot be negative";
    }

    if (formData.SPRG_SdMn && parseInt(formData.SPRG_SdMn) < 0) {
      newErrors.SPRG_SdMn = "Security deposit months cannot be negative";
    }

    if (formData.SPRG_SdAm && parseFloat(formData.SPRG_SdAm) < 0) {
      newErrors.SPRG_SdAm = "Security deposit amount cannot be negative";
    }

    if (
      formData.SPRG_SdPr &&
      (parseFloat(formData.SPRG_SdPr) < 0 ||
        parseFloat(formData.SPRG_SdPr) > 100)
    ) {
      newErrors.SPRG_SdPr =
        "Security deposit percentage must be between 0 and 100";
    }

    if (
      formData.SPRG_TaxP &&
      (parseFloat(formData.SPRG_TaxP) < 0 ||
        parseFloat(formData.SPRG_TaxP) > 100)
    ) {
      newErrors.SPRG_TaxP = "Tax percentage must be between 0 and 100";
    }

    if (formData.SPRG_LtFe && parseFloat(formData.SPRG_LtFe) < 0) {
      newErrors.SPRG_LtFe = "Late fee cannot be negative";
    }

    if (formData.SPRG_AtRn && parseFloat(formData.SPRG_AtRn) < 0) {
      newErrors.SPRG_AtRn = "Annual rent cannot be negative";
    }

    if (
      formData.SPRG_IncPr &&
      (parseFloat(formData.SPRG_IncPr) < 0 ||
        parseFloat(formData.SPRG_IncPr) > 100)
    ) {
      newErrors.SPRG_IncPr = "Increase percentage must be between 0 and 100";
    }

    if (formData.SPRG_TrfFe && parseFloat(formData.SPRG_TrfFe) < 0) {
      newErrors.SPRG_TrfFe = "Transfer fee cannot be negative";
    }

    if (formData.SPRG_StRef && formData.SPRG_StRef.length > 100) {
      newErrors.SPRG_StRef = "Reference must not exceed 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") { e.preventDefault(); nextRef?.current?.focus(); }
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
        const refMap = {
          SPRG_Date: dateRef,
          SPRG_StDt: startDateRef,
          SPRG_EdDt: endDateRef,
          SPRG_DuDt: dueDateRef,
          SPRG_MnRt: monthlyRentRef,
          SPRG_SdMn: securityMonthsRef,
          SPRG_SdAm: securityAmountRef,
          SPRG_SdPr: securityPercentRef,
          SPRG_TaxP: taxPercentRef,
          SPRG_LtFe: lateFeeRef,
          SPRG_AtRn: annualRentRef,
          SPRG_IncPr: increasePercentRef,
          SPRG_TrfFe: transferFeeRef,
          SPRG_StRef: stRefRef,
        };
        if (refMap[firstErrorKey]) {
          refMap[firstErrorKey].current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this agreement?"
        : "Are you sure you want to create this agreement?",
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
        SPRA_Id: formData.SPRA_Id ? parseInt(formData.SPRA_Id) : null,
        SPM_Id: formData.SPM_Id ? parseInt(formData.SPM_Id) : null,
        SPRG_Date: formData.SPRG_Date,
        SPRG_StDt: formData.SPRG_StDt,
        SPRG_EdDt: formData.SPRG_EdDt,
        SPRG_DuDt: formData.SPRG_DuDt || null,
        SPRG_MnRt: parseFloat(formData.SPRG_MnRt),
        SPRG_SdMn: formData.SPRG_SdMn ? parseInt(formData.SPRG_SdMn) : null,
        SPRG_SdAm: formData.SPRG_SdAm ? parseFloat(formData.SPRG_SdAm) : null,
        SPRG_SdPr: formData.SPRG_SdPr ? parseFloat(formData.SPRG_SdPr) : null,
        SPRG_TaxP: formData.SPRG_TaxP ? parseFloat(formData.SPRG_TaxP) : null,
        SPRG_LtFe: formData.SPRG_LtFe ? parseFloat(formData.SPRG_LtFe) : null,
        SPRG_AtRn: formData.SPRG_AtRn ? parseFloat(formData.SPRG_AtRn) : null,
        SPRG_IncPr: formData.SPRG_IncPr
          ? parseFloat(formData.SPRG_IncPr)
          : null,
        SPRG_TrfFe: formData.SPRG_TrfFe
          ? parseFloat(formData.SPRG_TrfFe)
          : null,
        SPRG_DcYn: formData.SPRG_DcYn || "N",
        SPRG_Status: formData.SPRG_Status,
        SPRG_SdStt: formData.SPRG_SdStt,
        SPRG_StRef: formData.SPRG_StRef?.trim() || null,
        SPRG_RnNt: formData.SPRG_RnNt?.trim() || null,
        SPRG_Reason: formData.SPRG_Reason?.trim() || null,
        SPRG_Remark: formData.SPRG_Remark?.trim() || null,
      };

      if (isEditMode) {
        await ShopRentAgreementApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await ShopRentAgreementApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/shop-rent-agreement"),
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
    navigate("/masters/hall-shop-management/shop-rent-agreement");
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
                ? "Update shop rent agreement information"
                : "Create a new shop rent agreement"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <FileCheck className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Agreement Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Application Selection - Only shows approved applications */}
            <SearchableDropdown
              label="Application"
              required={false}
              items={approvedApplications}
              selectedId={formData.SPRA_Id}
              onSelect={(v) => handleDropdownChange("SPRA_Id", v)}
              loading={loadingApplications}
              error={errors.SPRA_Id}
              getItemId={(i) => i.SPRA_Id?.toString()}
              getItemLabel={getApplicationLabel}
              placeholder="Select an approved application"
              icon={FileCheck}
              triggerRef={appButtonRef}
              nextFocusRef={shopButtonRef}
            />

            {/* Shop Selection */}
            <SearchableDropdown
              label="Shop"
              required={false}
              items={shops}
              selectedId={formData.SPM_Id}
              onSelect={(v) => handleDropdownChange("SPM_Id", v)}
              loading={loadingShops}
              error={errors.SPM_Id}
              getItemId={(i) => i.SPM_Id?.toString()}
              getItemLabel={getShopLabel}
              placeholder="Select a Shop"
              icon={Building}
              triggerRef={shopButtonRef}
              nextFocusRef={dateRef}
            />

            {/* Agreement Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agreement Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateRef}
                  type="date"
                  name="SPRG_Date"
                  value={formData.SPRG_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, startDateRef)}
                  className={`${inputClasses("SPRG_Date")} pl-10`}
                />
              </div>
              {errors.SPRG_Date && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_Date}
                </p>
              )}
            </div>

            {/* Reference */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Reference{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.SPRG_StRef.length}/100
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={stRefRef}
                  type="text"
                  name="SPRG_StRef"
                  value={formData.SPRG_StRef}
                  onChange={handleInputChange}
                  maxLength="100"
                  placeholder="e.g. AGR-2026-001"
                  className={`${inputClasses("SPRG_StRef")} pl-10`}
                />
              </div>
              {errors.SPRG_StRef && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_StRef}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={startDateRef}
                  type="date"
                  name="SPRG_StDt"
                  value={formData.SPRG_StDt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, endDateRef)}
                  className={`${inputClasses("SPRG_StDt")} pl-10`}
                />
              </div>
              {errors.SPRG_StDt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_StDt}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={endDateRef}
                  type="date"
                  name="SPRG_EdDt"
                  value={formData.SPRG_EdDt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, dueDateRef)}
                  className={`${inputClasses("SPRG_EdDt")} pl-10`}
                />
              </div>
              {errors.SPRG_EdDt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_EdDt}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dueDateRef}
                  type="date"
                  name="SPRG_DuDt"
                  value={formData.SPRG_DuDt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, monthlyRentRef)}
                  className={`${inputClasses("SPRG_DuDt")} pl-10`}
                />
              </div>
              {errors.SPRG_DuDt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_DuDt}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Details Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Financial Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={monthlyRentRef}
                  type="number"
                  step="0.01"
                  name="SPRG_MnRt"
                  value={formData.SPRG_MnRt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, securityMonthsRef)}
                  placeholder="Enter monthly rent"
                  className={`${inputClasses("SPRG_MnRt")} pl-10`}
                />
              </div>
              {errors.SPRG_MnRt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_MnRt}
                </p>
              )}
            </div>

            {/* Security Deposit Months */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (Months){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                ref={securityMonthsRef}
                type="number"
                name="SPRG_SdMn"
                value={formData.SPRG_SdMn}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, securityAmountRef)}
                min="0"
                placeholder="e.g. 2"
                className={inputClasses("SPRG_SdMn")}
              />
              {errors.SPRG_SdMn && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_SdMn}
                </p>
              )}
            </div>

            {/* Security Deposit Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (₹){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={securityAmountRef}
                  type="number"
                  step="0.01"
                  name="SPRG_SdAm"
                  value={formData.SPRG_SdAm}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, securityPercentRef)}
                  placeholder="Enter security deposit amount"
                  className={`${inputClasses("SPRG_SdAm")} pl-10`}
                />
              </div>
              {errors.SPRG_SdAm && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_SdAm}
                </p>
              )}
            </div>

            {/* Security Deposit Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (%){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={securityPercentRef}
                  type="number"
                  step="0.01"
                  name="SPRG_SdPr"
                  value={formData.SPRG_SdPr}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, taxPercentRef)}
                  min="0"
                  max="100"
                  placeholder="e.g. 10"
                  className={`${inputClasses("SPRG_SdPr")} pl-10`}
                />
              </div>
              {errors.SPRG_SdPr && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_SdPr}
                </p>
              )}
            </div>

            {/* Tax Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Percentage (%){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={taxPercentRef}
                  type="number"
                  step="0.01"
                  name="SPRG_TaxP"
                  value={formData.SPRG_TaxP}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, lateFeeRef)}
                  min="0"
                  max="100"
                  placeholder="e.g. 18"
                  className={`${inputClasses("SPRG_TaxP")} pl-10`}
                />
              </div>
              {errors.SPRG_TaxP && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_TaxP}
                </p>
              )}
            </div>

            {/* Late Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Fee (₹){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={lateFeeRef}
                  type="number"
                  step="0.01"
                  name="SPRG_LtFe"
                  value={formData.SPRG_LtFe}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, annualRentRef)}
                  min="0"
                  placeholder="Enter late fee amount"
                  className={`${inputClasses("SPRG_LtFe")} pl-10`}
                />
              </div>
              {errors.SPRG_LtFe && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_LtFe}
                </p>
              )}
            </div>

            {/* Annual Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Rent (₹){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={annualRentRef}
                  type="number"
                  step="0.01"
                  name="SPRG_AtRn"
                  value={formData.SPRG_AtRn}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, increasePercentRef)}
                  placeholder="Enter annual rent"
                  className={`${inputClasses("SPRG_AtRn")} pl-10`}
                />
              </div>
              {errors.SPRG_AtRn && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_AtRn}
                </p>
              )}
            </div>

            {/* Increase Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Increase Percentage (%){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={increasePercentRef}
                  type="number"
                  step="0.01"
                  name="SPRG_IncPr"
                  value={formData.SPRG_IncPr}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, transferFeeRef)}
                  min="0"
                  max="100"
                  placeholder="e.g. 10"
                  className={`${inputClasses("SPRG_IncPr")} pl-10`}
                />
              </div>
              {errors.SPRG_IncPr && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_IncPr}
                </p>
              )}
            </div>

            {/* Transfer Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer Fee (₹){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={transferFeeRef}
                  type="number"
                  step="0.01"
                  name="SPRG_TrfFe"
                  value={formData.SPRG_TrfFe}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, decYnRef)}
                  min="0"
                  placeholder="Enter transfer fee"
                  className={`${inputClasses("SPRG_TrfFe")} pl-10`}
                />
              </div>
              {errors.SPRG_TrfFe && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_TrfFe}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status & Additional Details Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Status & Additional Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Declaration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Declaration{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <select
                ref={decYnRef}
                name="SPRG_DcYn"
                value={formData.SPRG_DcYn}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, statusRef)}
                className={inputClasses("SPRG_DcYn")}
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
              {errors.SPRG_DcYn && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_DcYn}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <select
                ref={statusRef}
                name="SPRG_Status"
                value={formData.SPRG_Status}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, sdSttRef)}
                className={inputClasses("SPRG_Status")}
              >
                <option value="PENDING_AGREEMENT">Pending Agreement</option>
                          <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="TERMINATED">Terminated</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              {errors.SPRG_Status && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_Status}
                </p>
              )}
            </div>

            {/* Security Deposit Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit Status{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <select
                ref={sdSttRef}
                name="SPRG_SdStt"
                value={formData.SPRG_SdStt}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, rentNoteRef)}
                className={inputClasses("SPRG_SdStt")}
              >
                <option value="HELD">Held</option>
                <option value="REFUNDED">Refunded</option>
                <option value="FORFEITED">Forfeited</option>
                <option value="PARTIAL_REFUND">Partial Refund</option>
              </select>
              {errors.SPRG_SdStt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_SdStt}
                </p>
              )}
            </div>

            {/* Rent Note */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Rent Note{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
              </div>
              <textarea
                ref={rentNoteRef}
                name="SPRG_RnNt"
                value={formData.SPRG_RnNt}
                onChange={handleInputChange}
                rows="2"
                placeholder="Enter rent note or special conditions..."
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {errors.SPRG_RnNt && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_RnNt}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Reason{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
              </div>
              <input
                ref={reasonRef}
                type="text"
                name="SPRG_Reason"
                value={formData.SPRG_Reason}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, remarkRef)}
                placeholder="Reason for agreement"
                className={inputClasses("SPRG_Reason")}
              />
              {errors.SPRG_Reason && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_Reason}
                </p>
              )}
            </div>

            {/* Remark */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Remark{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
              </div>
              <input
                ref={remarkRef}
                type="text"
                name="SPRG_Remark"
                value={formData.SPRG_Remark}
                onChange={handleInputChange}
                placeholder="Additional remarks"
                className={inputClasses("SPRG_Remark")}
              />
              {errors.SPRG_Remark && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_Remark}
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
          </div>
          <div className="flex items-center gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center disabled:opacity-50 transition-all shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? `Update ${pageTitle}` : `Create ${pageTitle}`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditShopRentAgreement;
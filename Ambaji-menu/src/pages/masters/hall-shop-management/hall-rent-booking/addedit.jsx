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
  DollarSign,
  Percent,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentBookingApi from "../../../services/hall-rent-booking-api";

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

const AddEditHallRentBooking = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingHalls, setLoadingHalls] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Hall Rent Booking");
  const [allApplications, setAllApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [halls, setHalls] = useState([]);
  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  
  // Missing state variables
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionsList, setActionsList] = useState([]);
  const [initialActionId, setInitialActionId] = useState(null);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [userDesignationId, setUserDesignationId] = useState(null);

  // Refs for focus management - User Experience Flow
  const appButtonRef = useRef(null);
  const appSearchRef = useRef(null);
  const hallButtonRef = useRef(null);
  const hallSearchRef = useRef(null);
  const bookingDateRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const modeRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const eventTypeRef = useRef(null);
  const eventNameRef = useRef(null);
  const hallRentRef = useRef(null);
  const hallSdRef = useRef(null);
  const hallClcRef = useRef(null);
  const taxPRef = useRef(null);
  const sdSttRef = useRef(null);
  const reasonRef = useRef(null);
  const remarkRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const appDropdownRef = useRef(null);
  const hallDropdownRef = useRef(null);
  const appListRef = useRef(null);
  const hallListRef = useRef(null);
  const appItemRefs = useRef([]);
  const hallItemRefs = useRef([]);

  const [formData, setFormData] = useState({
    HLRB_Date: new Date().toISOString().split("T")[0],
    HLRA_Id: "",
    HLM_Id: "",
    HLRB_StDt: "",
    HLRB_EdDt: "",
    HLRB_Mode: "FullDay",
    HLRB_SLSt: "",
    HLRB_SlEd: "",
    HLRB_EvTy: "",
    HLRB_EvNm: "",
    HLRB_HlRt: "",
    HLRB_HlSd: "",
    HLRB_HClC: "",
    HLRB_TaxP: "",
    HLRB_SdStt: "",
    HLRB_Reason: "",
    HLRB_Remark: "",
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
      const currentPath = "/masters/hall-shop-management/hall-rent-booking";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);

      if (currentMenuItem?.action?.stage) {
        const stage = currentMenuItem.action.stage;
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
      const response = await HallRentBookingApi.getActionsByStage(stage);
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

  // Load applications and halls with filtering
  useEffect(() => {
    initAndLoad();
    if (isEditMode) loadData();
    else {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        HLRB_Date: today,
      }));
      setTimeout(() => appButtonRef.current?.focus(), 150);
    }
  }, [id]);

  const initAndLoad = async () => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");

      // Get the approval stage from the hall-rent-application-approval menu
      const approvalPath = "/masters/hall-shop-management/hall-rent-application-approval";
      const approvalMenuItem = menuDetails.find((item) => item.Menu_Links == approvalPath);
      const stage = approvalMenuItem?.action?.stage || null;

      // Resolve the last-approved Act_Id from the stage's action chain
      let lastStatusId = null;
      if (stage) {
        const actionsRes = await HallRentBookingApi.getActionsByStage(stage);
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
    setLoadingHalls(true);
    try {
      const [appsRes, hallsRes] = await Promise.all([
        HallRentBookingApi.getAllHallApplications(),
        HallRentBookingApi.getAllHalls(),
      ]);

      const allApps = appsRes?.data || [];
      setAllApplications(allApps);

      // Filter applications on frontend based on statusId
      let filteredApps = allApps;
      if (statusId) {
        filteredApps = allApps.filter(app => 
          app.HLRA_Status == statusId || app.HLRA_R_Status == statusId
        );
      }
      setApprovedApplications(filteredApps);
      
      setHalls(hallsRes?.data || []);
    } catch (error) {
      console.error("Error loading dropdowns:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingApplications(false);
      setLoadingHalls(false);
      setPermissionsLoaded(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentBookingApi.getById(id);
      const d = res?.data;

      // Format time values - remove seconds (H:i format only)
      const formatTime = (time) => {
        if (!time) return "";
        if (time.split(":").length == 3) {
          return time.substring(0, 5);
        }
        return time;
      };

      setFormData({
        HLRB_Date: d.HLRB_Date || new Date().toISOString().split("T")[0],
        HLRA_Id: d.HLRA_Id || "",
        HLM_Id: d.HLM_Id || "",
        HLRB_StDt: d.HLRB_StDt || "",
        HLRB_EdDt: d.HLRB_EdDt || "",
        HLRB_Mode: d.HLRB_Mode || "FullDay",
        HLRB_SLSt: formatTime(d.HLRB_SLSt),
        HLRB_SlEd: formatTime(d.HLRB_SlEd),
        HLRB_EvTy: d.HLRB_EvTy || "",
        HLRB_EvNm: d.HLRB_EvNm || "",
        HLRB_HlRt: d.HLRB_HlRt || "",
        HLRB_HlSd: d.HLRB_HlSd || "",
        HLRB_HClC: d.HLRB_HClC || "",
        HLRB_TaxP: d.HLRB_TaxP || "",
        HLRB_SdStt: d.HLRB_SdStt || "",
        HLRB_Reason: d.HLRB_Reason || "",
        HLRB_Remark: d.HLRB_Remark || "",
      });

      if (d.HLRA_Id && d.application) {
        setSelectedApplication(d.application);
      }

      if (d.HLM_Id && d.hall) {
        setSelectedHall(d.hall);
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rent-booking");
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
    
    // When application changes, find and store the selected application
    if (field == "HLRA_Id") {
      const app = allApplications.find(a => a.HLRA_Id == parseInt(value));
      setSelectedApplication(app);
    }
  };

  const getApplicationLabel = (app) => {
    if (!app) return "";
    return `${app.rental?.hall?.HLM_Name || "N/A"} - ${app.applicant?.Usr_Name || "N/A"} (${app.HLRA_Date || ""})`;
  };

  const getHallLabel = (hall) => {
    if (!hall) return "";
    return hall.HLM_Name || "N/A";
  };

  const validate = () => {
    const newErrors = {};

    // Required: Booking Date
    if (!formData.HLRB_Date) {
      newErrors.HLRB_Date = "Booking date is required";
    }

    // Required: Application
    if (!formData.HLRA_Id) {
      newErrors.HLRA_Id = "Please select an application";
    }

    // Required: Hall
    if (!formData.HLM_Id) {
      newErrors.HLM_Id = "Please select a hall";
    }

    // Required: Start Date
    if (!formData.HLRB_StDt) {
      newErrors.HLRB_StDt = "Start date is required";
    }

    // Required: End Date
    if (!formData.HLRB_EdDt) {
      newErrors.HLRB_EdDt = "End date is required";
    } else if (formData.HLRB_StDt && formData.HLRB_EdDt) {
      if (formData.HLRB_EdDt < formData.HLRB_StDt) {
        newErrors.HLRB_EdDt = "End date must be after or equal to start date";
      }
    }

    // Required: Mode
    if (!formData.HLRB_Mode) {
      newErrors.HLRB_Mode = "Mode is required";
    }

    // Required: Event Name
    if (!formData.HLRB_EvNm.trim()) {
      newErrors.HLRB_EvNm = "Event name is required";
    } else if (formData.HLRB_EvNm.length > 255) {
      newErrors.HLRB_EvNm = "Event name must not exceed 255 characters";
    }

    // Required: Hall Rent
    if (!formData.HLRB_HlRt) {
      newErrors.HLRB_HlRt = "Hall rent is required";
    } else if (isNaN(formData.HLRB_HlRt) || Number(formData.HLRB_HlRt) < 0) {
      newErrors.HLRB_HlRt = "Hall rent must be a positive number";
    }

    // Optional validations
    if (formData.HLRB_EvTy && formData.HLRB_EvTy.length > 100) {
      newErrors.HLRB_EvTy = "Event type must not exceed 100 characters";
    }

    if (
      formData.HLRB_HlSd &&
      (isNaN(formData.HLRB_HlSd) || Number(formData.HLRB_HlSd) < 0)
    ) {
      newErrors.HLRB_HlSd = "Security deposit must be a positive number";
    }

    if (
      formData.HLRB_HClC &&
      (isNaN(formData.HLRB_HClC) || Number(formData.HLRB_HClC) < 0)
    ) {
      newErrors.HLRB_HClC = "Cleaning charges must be a positive number";
    }

    if (
      formData.HLRB_TaxP &&
      (isNaN(formData.HLRB_TaxP) || Number(formData.HLRB_TaxP) < 0)
    ) {
      newErrors.HLRB_TaxP = "Tax must be a positive number";
    }

    if (formData.HLRB_SdStt && formData.HLRB_SdStt.length > 100) {
      newErrors.HLRB_SdStt = "Security status must not exceed 100 characters";
    }

    if (formData.HLRB_Reason && formData.HLRB_Reason.length > 255) {
      newErrors.HLRB_Reason = "Reason must not exceed 255 characters";
    }

    if (formData.HLRB_Remark && formData.HLRB_Remark.length > 255) {
      newErrors.HLRB_Remark = "Remark must not exceed 255 characters";
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
        const refMap = {
          HLRB_Date: bookingDateRef,
          HLRA_Id: appButtonRef,
          HLM_Id: hallButtonRef,
          HLRB_StDt: startDateRef,
          HLRB_EdDt: endDateRef,
          HLRB_Mode: modeRef,
          HLRB_EvNm: eventNameRef,
          HLRB_HlRt: hallRentRef,
          HLRB_EvTy: eventTypeRef,
          HLRB_HlSd: hallSdRef,
          HLRB_HClC: hallClcRef,
          HLRB_TaxP: taxPRef,
          HLRB_SdStt: sdSttRef,
          HLRB_Reason: reasonRef,
          HLRB_Remark: remarkRef,
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
        ? "Are you sure you want to update this booking?"
        : "Are you sure you want to create this booking?",
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
        HLRB_Date: formData.HLRB_Date,
        HLRA_Id: parseInt(formData.HLRA_Id),
        HLM_Id: parseInt(formData.HLM_Id),
        HLRB_StDt: formData.HLRB_StDt,
        HLRB_EdDt: formData.HLRB_EdDt,
        HLRB_Mode: formData.HLRB_Mode,
        HLRB_SLSt: formData.HLRB_SLSt || null,
        HLRB_SlEd: formData.HLRB_SlEd || null,
        HLRB_EvTy: formData.HLRB_EvTy?.trim() || null,
        HLRB_EvNm: formData.HLRB_EvNm.trim(),
        HLRB_HlRt: Number(formData.HLRB_HlRt),
        HLRB_HlSd: formData.HLRB_HlSd ? Number(formData.HLRB_HlSd) : null,
        HLRB_HClC: formData.HLRB_HClC ? Number(formData.HLRB_HClC) : null,
        HLRB_TaxP: formData.HLRB_TaxP ? Number(formData.HLRB_TaxP) : null,
        HLRB_SdStt: formData.HLRB_SdStt?.trim() || null,
        HLRB_Reason: formData.HLRB_Reason?.trim() || null,
        HLRB_Remark: formData.HLRB_Remark?.trim() || null,
        ...(!isEditMode && { HLRB_Status: initialActionId }),
      };

      if (isEditMode) {
        await HallRentBookingApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await HallRentBookingApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/hall-rent-booking"),
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
    navigate("/masters/hall-shop-management/hall-rent-booking");
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
          You don't have permission to create hall rent bookings.
        </p>
        <button
          onClick={() =>
            navigate("/masters/hall-shop-management/hall-rent-booking")
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
                ? "Update hall rent booking information"
                : "Create a new hall rent booking"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Booking Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Application Selection - Only shows approved applications */}
            <SearchableDropdown
              label="Application"
              required={true}
              items={approvedApplications}
              selectedId={formData.HLRA_Id}
              onSelect={(v) => handleDropdownChange("HLRA_Id", v)}
              loading={loadingApplications}
              error={errors.HLRA_Id}
              getItemId={(i) => i.HLRA_Id?.toString()}
              getItemLabel={getApplicationLabel}
              placeholder="Select an approved application"
              icon={FileText}
              triggerRef={appButtonRef}
              nextFocusRef={hallButtonRef}
            />

            {/* Hall Selection */}
            <SearchableDropdown
              label="Hall"
              required={true}
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
              nextFocusRef={bookingDateRef}
            />

            {/* Remaining fields in 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Booking Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={bookingDateRef}
                    type="date"
                    name="HLRB_Date"
                    value={formData.HLRB_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, startDateRef)}
                    className={`${inputClasses("HLRB_Date")} pl-10`}
                  />
                </div>
                {errors.HLRB_Date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_Date}
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
                    name="HLRB_StDt"
                    value={formData.HLRB_StDt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, endDateRef)}
                    className={`${inputClasses("HLRB_StDt")} pl-10`}
                  />
                </div>
                {errors.HLRB_StDt && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_StDt}
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
                    name="HLRB_EdDt"
                    value={formData.HLRB_EdDt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, modeRef)}
                    className={`${inputClasses("HLRB_EdDt")} pl-10`}
                  />
                </div>
                {errors.HLRB_EdDt && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_EdDt}
                  </p>
                )}
              </div>

              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    ref={modeRef}
                    name="HLRB_Mode"
                    value={formData.HLRB_Mode}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, startTimeRef)}
                    className={`${inputClasses("HLRB_Mode")} pl-10 bg-white`}
                  >
                    <option value="FullDay">Full Day</option>
                    <option value="HalfDay">Half Day</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                {errors.HLRB_Mode && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_Mode}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={startTimeRef}
                    type="time"
                    name="HLRB_SLSt"
                    value={formData.HLRB_SLSt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, endTimeRef)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={endTimeRef}
                    type="time"
                    name="HLRB_SlEd"
                    value={formData.HLRB_SlEd}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, eventTypeRef)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={eventTypeRef}
                    type="text"
                    name="HLRB_EvTy"
                    value={formData.HLRB_EvTy}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, eventNameRef)}
                    maxLength="100"
                    placeholder="e.g. Wedding, Seminar"
                    className={`${inputClasses("HLRB_EvTy")} pl-10`}
                  />
                </div>
                {errors.HLRB_EvTy && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_EvTy}
                  </p>
                )}
              </div>

              {/* Event Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    {formData.HLRB_EvNm.length}/255
                  </span>
                </div>
                <input
                  ref={eventNameRef}
                  type="text"
                  name="HLRB_EvNm"
                  value={formData.HLRB_EvNm}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, hallRentRef)}
                  maxLength="255"
                  placeholder="Enter event name"
                  className={inputClasses("HLRB_EvNm")}
                />
                {errors.HLRB_EvNm && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_EvNm}
                  </p>
                )}
              </div>

              {/* Hall Rent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hall Rent <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={hallRentRef}
                    type="number"
                    step="0.01"
                    name="HLRB_HlRt"
                    value={formData.HLRB_HlRt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, hallSdRef)}
                    placeholder="Enter hall rent"
                    className={`${inputClasses("HLRB_HlRt")} pl-10`}
                  />
                </div>
                {errors.HLRB_HlRt && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_HlRt}
                  </p>
                )}
              </div>

              {/* Security Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={hallSdRef}
                    type="number"
                    step="0.01"
                    name="HLRB_HlSd"
                    value={formData.HLRB_HlSd}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, hallClcRef)}
                    placeholder="Security deposit"
                    className={`${inputClasses("HLRB_HlSd")} pl-10`}
                  />
                </div>
                {errors.HLRB_HlSd && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_HlSd}
                  </p>
                )}
              </div>

              {/* Cleaning Charges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cleaning Charges{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={hallClcRef}
                    type="number"
                    step="0.01"
                    name="HLRB_HClC"
                    value={formData.HLRB_HClC}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, taxPRef)}
                    placeholder="Cleaning charges"
                    className={`${inputClasses("HLRB_HClC")} pl-10`}
                  />
                </div>
                {errors.HLRB_HClC && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_HClC}
                  </p>
                )}
              </div>

              {/* Tax Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax %{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={taxPRef}
                    type="number"
                    step="0.01"
                    name="HLRB_TaxP"
                    value={formData.HLRB_TaxP}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, sdSttRef)}
                    placeholder="Tax percentage"
                    className={`${inputClasses("HLRB_TaxP")} pl-10`}
                  />
                </div>
                {errors.HLRB_TaxP && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_TaxP}
                  </p>
                )}
              </div>

              {/* Security Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Status{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  ref={sdSttRef}
                  type="text"
                  name="HLRB_SdStt"
                  value={formData.HLRB_SdStt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, reasonRef)}
                  maxLength="100"
                  placeholder="e.g. HELD, RELEASED"
                  className={inputClasses("HLRB_SdStt")}
                />
                {errors.HLRB_SdStt && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.HLRB_SdStt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Additional Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reason */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Reason{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.HLRB_Reason.length}/255
                </span>
              </div>
              <input
                ref={reasonRef}
                type="text"
                name="HLRB_Reason"
                value={formData.HLRB_Reason}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, remarkRef)}
                maxLength="255"
                placeholder="Reason for booking"
                className={inputClasses("HLRB_Reason")}
              />
              {errors.HLRB_Reason && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRB_Reason}
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
                <span className="text-xs text-gray-400">
                  {formData.HLRB_Remark.length}/255
                </span>
              </div>
              <input
                ref={remarkRef}
                type="text"
                name="HLRB_Remark"
                value={formData.HLRB_Remark}
                onChange={handleInputChange}
                maxLength="255"
                placeholder="Additional remarks"
                className={inputClasses("HLRB_Remark")}
              />
              {errors.HLRB_Remark && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLRB_Remark}
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
              Booking will be submitted for approval
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
                  {isEditMode ? `Update ${pageTitle}` : `Submit Booking`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallRentBooking;
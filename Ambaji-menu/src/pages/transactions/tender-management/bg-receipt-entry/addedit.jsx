import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Calendar,
  AlertCircle,
  ChevronDown,
  Search,
  ChevronUp,
  Check,
  Hash,
  Receipt,
  XCircle,
  Briefcase,
  Users,
  DollarSign,
  Building,
  Layers,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { WorkBgApi } from "../../../services/workbgapi";

const AddEditWorkBg = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("BG Receipt Entry");

  // Work Allocation dropdown state
  const [workAllocationData, setWorkAllocationData] = useState([]);
  const [filteredWorkAllocations, setFilteredWorkAllocations] = useState([]);
  const [workAllocationSearchTerm, setWorkAllocationSearchTerm] = useState("");
  const [isWorkAllocationDropdownOpen, setIsWorkAllocationDropdownOpen] =
    useState(false);
  const [workAllocationHighlightedIndex, setWorkAllocationHighlightedIndex] =
    useState(-1);
  const workAllocationDropdownRef = useRef(null);
  const workAllocationSearchRef = useRef(null);
  const workAllocationItemRefs = useRef([]);
  const workAllocationListRef = useRef(null);

  // Subledger dropdown state
  const [subledgerData, setSubledgerData] = useState([]);
  const [filteredSubledgers, setFilteredSubledgers] = useState([]);
  const [subledgerSearchTerm, setSubledgerSearchTerm] = useState("");
  const [isSubledgerDropdownOpen, setIsSubledgerDropdownOpen] = useState(false);
  const [subledgerHighlightedIndex, setSubledgerHighlightedIndex] =
    useState(-1);
  const subledgerDropdownRef = useRef(null);
  const subledgerSearchRef = useRef(null);
  const subledgerItemRefs = useRef([]);
  const subledgerListRef = useRef(null);

  // Selected work allocation details to display
  const [selectedWorkAllocation, setSelectedWorkAllocation] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    WBT_Date: new Date().toISOString().split("T")[0],
    // WBT_Type is removed from form - will be set to "Receipt" in payload
    SL_Id: "",
    WA_Id: "",
    BG_Amt: "",
    // WNE_Id and WBT_BillNo removed
  });

  // Refs for focus management
  const dateInputRef = useRef(null);
  const workAllocationButtonRef = useRef(null);
  const subledgerButtonRef = useRef(null);
  const bgAmountRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  useEffect(() => {
    // Get page title from menu details
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/tender-management/work-bg-receipt-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadDropdownData();

    if (id && id != "create") {
      setIsEditMode(true);
      loadEntryData();
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        workAllocationDropdownRef.current &&
        !workAllocationDropdownRef.current.contains(event.target)
      ) {
        setIsWorkAllocationDropdownOpen(false);
        setWorkAllocationHighlightedIndex(-1);
        setWorkAllocationSearchTerm("");
      }
      if (
        subledgerDropdownRef.current &&
        !subledgerDropdownRef.current.contains(event.target)
      ) {
        setIsSubledgerDropdownOpen(false);
        setSubledgerHighlightedIndex(-1);
        setSubledgerSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // Focus on date field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isWorkAllocationDropdownOpen && workAllocationSearchRef.current) {
      setTimeout(() => workAllocationSearchRef.current.focus(), 0);
    }
  }, [isWorkAllocationDropdownOpen]);

  useEffect(() => {
    if (isSubledgerDropdownOpen && subledgerSearchRef.current) {
      setTimeout(() => subledgerSearchRef.current.focus(), 0);
    }
  }, [isSubledgerDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      isWorkAllocationDropdownOpen &&
      workAllocationHighlightedIndex >= 0 &&
      workAllocationListRef.current
    ) {
      const container = workAllocationListRef.current;
      const item =
        workAllocationItemRefs.current[workAllocationHighlightedIndex];
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
  }, [workAllocationHighlightedIndex, isWorkAllocationDropdownOpen]);

  useEffect(() => {
    if (
      isSubledgerDropdownOpen &&
      subledgerHighlightedIndex >= 0 &&
      subledgerListRef.current
    ) {
      const container = subledgerListRef.current;
      const item = subledgerItemRefs.current[subledgerHighlightedIndex];
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
  }, [subledgerHighlightedIndex, isSubledgerDropdownOpen]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Load dropdowns in parallel
      const [workAllocationsRes, subledgersRes] = await Promise.all([
        WorkBgApi.getAllWorkAllocations(),
        WorkBgApi.getAllSubledgers(),
      ]);

      if (workAllocationsRes.success && workAllocationsRes.data) {
        setWorkAllocationData(workAllocationsRes.data);
        setFilteredWorkAllocations(workAllocationsRes.data);
      }

      if (subledgersRes.success && subledgersRes.data) {
        setSubledgerData(subledgersRes.data);
        setFilteredSubledgers(subledgersRes.data);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const response = await WorkBgApi.getById(id);
      console.log("Loaded BG entry response for edit:", response);

      const entry = response?.data || response;

      setFormData({
        WBT_Date: entry?.WBT_Date
          ? new Date(entry.WBT_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        SL_Id: entry?.SL_Id?.toString() || "",
        WA_Id: entry?.WA_Id?.toString() || "",
        BG_Amt: entry?.BG_Amt?.toString() || "",
      });

      // Find and set selected work allocation details
      if (entry?.WA_Id && entry?.work_allocation) {
        setSelectedWorkAllocation(entry.work_allocation);
      }

      // Focus on date field after loading edit mode
      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading BG entry:", error);
      toast.error("Failed to load entry data!");
      navigate("/transactions/tender-management/work-bg-receipt-entry");
    } finally {
      setLoading(false);
    }
  };

  // Filter work allocations
  useEffect(() => {
    if (!workAllocationSearchTerm.trim()) {
      setFilteredWorkAllocations(workAllocationData);
    } else {
      const term = workAllocationSearchTerm.toLowerCase();
      const filtered = workAllocationData.filter(
        (item) =>
          item.tender?.Description?.toLowerCase().includes(term) ||
          item.WA_RefId?.toLowerCase().includes(term) ||
          item.WO_Amount?.toString().includes(term) ||
          item.subledger?.SL_Name?.toLowerCase().includes(term),
      );
      setFilteredWorkAllocations(filtered);
    }
    setWorkAllocationHighlightedIndex(-1);
  }, [workAllocationSearchTerm, workAllocationData]);

  // Filter subledgers
  useEffect(() => {
    if (!subledgerSearchTerm.trim()) {
      setFilteredSubledgers(subledgerData);
    } else {
      const term = subledgerSearchTerm.toLowerCase();
      const filtered = subledgerData.filter(
        (item) =>
          item.SL_Name?.toLowerCase().includes(term) ||
          item.SL_Code?.toLowerCase().includes(term),
      );
      setFilteredSubledgers(filtered);
    }
    setSubledgerHighlightedIndex(-1);
  }, [subledgerSearchTerm, subledgerData]);

  // Work Allocation keyboard handlers
  const handleWorkAllocationKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsWorkAllocationDropdownOpen(true);
      setWorkAllocationSearchTerm("");
      setWorkAllocationHighlightedIndex(-1);
      setTimeout(() => workAllocationSearchRef.current?.focus(), 0);
    }
  };

  const handleWorkAllocationSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredWorkAllocations.length > 0) {
        setWorkAllocationHighlightedIndex(0);
        setTimeout(() => {
          if (workAllocationItemRefs.current[0]) {
            workAllocationItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsWorkAllocationDropdownOpen(false);
      setWorkAllocationHighlightedIndex(-1);
      setWorkAllocationSearchTerm("");
      workAllocationButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (
        filteredWorkAllocations.length > 0 &&
        workAllocationHighlightedIndex >= 0
      ) {
        handleWorkAllocationSelect(
          filteredWorkAllocations[workAllocationHighlightedIndex],
        );
      } else if (filteredWorkAllocations.length > 0) {
        handleWorkAllocationSelect(filteredWorkAllocations[0]);
      }
    }
  };

  const handleWorkAllocationItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredWorkAllocations.length) {
        setWorkAllocationHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (workAllocationItemRefs.current[nextIndex]) {
            workAllocationItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setWorkAllocationHighlightedIndex(-1);
        setTimeout(() => workAllocationSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setWorkAllocationHighlightedIndex(-1);
        setTimeout(() => workAllocationSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setWorkAllocationHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (workAllocationItemRefs.current[prevIndex]) {
            workAllocationItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleWorkAllocationSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsWorkAllocationDropdownOpen(false);
      setWorkAllocationHighlightedIndex(-1);
      setWorkAllocationSearchTerm("");
      workAllocationButtonRef.current?.focus();
    }
  };

  const handleWorkAllocationSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      WA_Id: item.WA_Id.toString(),
    }));

    setSelectedWorkAllocation(item);
    setIsWorkAllocationDropdownOpen(false);
    setWorkAllocationSearchTerm("");
    setWorkAllocationHighlightedIndex(-1);

    if (errors.WA_Id) {
      setErrors((prev) => ({ ...prev, WA_Id: "" }));
    }

    setTimeout(() => subledgerButtonRef.current?.focus(), 100);
  };

  // Subledger keyboard handlers
  const handleSubledgerKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsSubledgerDropdownOpen(true);
      setSubledgerSearchTerm("");
      setSubledgerHighlightedIndex(-1);
      setTimeout(() => subledgerSearchRef.current?.focus(), 0);
    }
  };

  const handleSubledgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredSubledgers.length > 0) {
        setSubledgerHighlightedIndex(0);
        setTimeout(() => {
          if (subledgerItemRefs.current[0]) {
            subledgerItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsSubledgerDropdownOpen(false);
      setSubledgerHighlightedIndex(-1);
      setSubledgerSearchTerm("");
      subledgerButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredSubledgers.length > 0 && subledgerHighlightedIndex >= 0) {
        handleSubledgerSelect(filteredSubledgers[subledgerHighlightedIndex]);
      } else if (filteredSubledgers.length > 0) {
        handleSubledgerSelect(filteredSubledgers[0]);
      }
    }
  };

  const handleSubledgerItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredSubledgers.length) {
        setSubledgerHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (subledgerItemRefs.current[nextIndex]) {
            subledgerItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setSubledgerHighlightedIndex(-1);
        setTimeout(() => subledgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setSubledgerHighlightedIndex(-1);
        setTimeout(() => subledgerSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setSubledgerHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (subledgerItemRefs.current[prevIndex]) {
            subledgerItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleSubledgerSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsSubledgerDropdownOpen(false);
      setSubledgerHighlightedIndex(-1);
      setSubledgerSearchTerm("");
      subledgerButtonRef.current?.focus();
    }
  };

  const handleSubledgerSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      SL_Id: item.SL_Id.toString(),
    }));

    setIsSubledgerDropdownOpen(false);
    setSubledgerSearchTerm("");
    setSubledgerHighlightedIndex(-1);

    if (errors.SL_Id) {
      setErrors((prev) => ({ ...prev, SL_Id: "" }));
    }

    setTimeout(() => bgAmountRef.current?.focus(), 100);
  };

  const getSelectedWorkAllocationDisplay = () => {
    if (!formData.WA_Id || !selectedWorkAllocation) return "";

    const tender = selectedWorkAllocation.tender;
    if (tender?.Description) {
      return tender.Description;
    }

    const selected = workAllocationData.find(
      (item) => item.WA_Id == parseInt(formData.WA_Id),
    );
    return selected?.tender?.Description || `Allocation #${formData.WA_Id}`;
  };

  const getSelectedSubledgerName = () => {
    if (!formData.SL_Id) return "";
    const selected = subledgerData.find(
      (item) => item.SL_Id == parseInt(formData.SL_Id),
    );
    return selected ? selected.SL_Name || "" : "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric fields
    if (name == "BG_Amt" && value != "") {
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.WBT_Date) {
      newErrors.WBT_Date = "Date is required";
    }

    if (!formData.WA_Id) {
      newErrors.WA_Id = "Work allocation selection is required";
    }

    if (!formData.SL_Id) {
      newErrors.SL_Id = "Subledger selection is required";
    }

    if (!formData.BG_Amt) {
      newErrors.BG_Amt = "BG amount is required";
    } else if (parseFloat(formData.BG_Amt) <= 0) {
      newErrors.BG_Amt = "BG amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const preparePayload = () => {
    const payload = {
      WBT_Date: formData.WBT_Date,
      WBT_Type: "Receipt", // Always set to Receipt
      SL_Id: parseInt(formData.SL_Id),
      WA_Id: parseInt(formData.WA_Id),
      BG_Amt: parseFloat(formData.BG_Amt),
    };

    return payload;
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
      title: isEditMode ? "Update BG Entry?" : "Create New BG Entry?",
      text: isEditMode
        ? "Are you sure you want to update this BG entry?"
        : "Are you sure you want to create this new BG entry?",
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
      const payload = preparePayload();

      let response;
      if (isEditMode) {
        response = await WorkBgApi.update(id, payload);
        toast.success("BG entry updated successfully!");
      } else {
        response = await WorkBgApi.create(payload);
        toast.success("BG entry created successfully!");
      }

      console.log("API response:", response);

      setTimeout(() => {
        navigate("/transactions/tender-management/work-bg-receipt-entry");
      }, 1500);
    } catch (error) {
      console.error("Error saving BG entry:", error);
      console.error("Error details:", error.response?.data);

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
              ? "Failed to update entry. Please try again."
              : "Failed to create entry. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/tender-management/work-bg-receipt-entry");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading BG entry data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/tender-management/work-bg-receipt-entry")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit" : "New"} {pageTitle}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update BG receipt entry information"
                : "Create new BG receipt entry"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              BG Receipt Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  name="WBT_Date"
                  value={formData.WBT_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, workAllocationButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.WBT_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.WBT_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.WBT_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.WBT_Date}
                </p>
              )}
            </div>

            {/* Work Allocation Dropdown */}
            <div ref={workAllocationDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Allocation *{" "}
                <span className="text-xs text-gray-500">
                  (Select allocation)
                </span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingDropdowns ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">
                      Loading work allocations...
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={workAllocationButtonRef}
                      type="button"
                      onClick={() =>
                        setIsWorkAllocationDropdownOpen(
                          !isWorkAllocationDropdownOpen,
                        )
                      }
                      onKeyDown={handleWorkAllocationKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.WA_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.WA_Id ? (
                        <span className="text-gray-900 block truncate">
                          {getSelectedWorkAllocationDisplay()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select a Work Allocation
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsWorkAllocationDropdownOpen(
                          !isWorkAllocationDropdownOpen,
                        )
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isWorkAllocationDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.WA_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}

                {/* Work Allocation Dropdown Menu */}
                {isWorkAllocationDropdownOpen && !loadingDropdowns && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={workAllocationSearchRef}
                          type="text"
                          value={workAllocationSearchTerm}
                          onChange={(e) =>
                            setWorkAllocationSearchTerm(e.target.value)
                          }
                          onKeyDown={handleWorkAllocationSearchKeyDown}
                          placeholder="Search by tender description, reference ID..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {workAllocationSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setWorkAllocationSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Work Allocation List */}
                    <div
                      ref={workAllocationListRef}
                      className="overflow-y-auto max-h-64"
                    >
                      {filteredWorkAllocations.length > 0 ? (
                        filteredWorkAllocations.map((item, idx) => (
                          <button
                            key={item.WA_Id}
                            ref={(el) => {
                              workAllocationItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleWorkAllocationSelect(item)}
                            onKeyDown={(e) =>
                              handleWorkAllocationItemKeyDown(e, item, idx)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              workAllocationHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.WA_Id == item.WA_Id.toString()
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                          >
                            {/* First line - Tender Description */}
                            <div className="font-medium text-sm text-gray-900">
                              {item.tender?.Description ||
                                `Tender #${item.TE_Id}`}
                            </div>

                            {/* Second line - Allocation Info */}
                            <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                              {item.WA_RefId && (
                                <span className="inline-flex items-center">
                                  <Hash className="h-3 w-3 mr-1" />
                                  Ref: {item.WA_RefId}
                                </span>
                              )}
                              <span className="inline-flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Amount: ₹ {formatCurrency(item.WO_Amount)}
                              </span>
                              <span className="inline-flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Date: {formatDate(item.WO_Date)}
                              </span>
                            </div>

                            {/* Third line - Subledger Info */}
                            {item.subledger && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                Vendor: {item.subledger.SL_Name}
                              </div>
                            )}
                            {/* Fourth line - Branch and Ledger */}
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                              {item.department && (
                                <span className="inline-flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {item.department.Dpt_Desc || "N/A"}
                                  {item.department.Dpt_Name && (
                                    <span className="ml-1 text-gray-400">
                                      ({item.department.Dpt_Name || "N/A"})
                                    </span>
                                  )}
                                </span>
                              )}
                              {item.ledger && (
                                <span className="inline-flex items-center">
                                  <Layers className="h-3 w-3 mr-1" />
                                  {item.ledger.Lg_Name}
                                  {item.ledger.Lg_Eng_Name && (
                                    <span className="ml-1 text-gray-400">
                                      ({item.ledger.Lg_Eng_Name})
                                    </span>
                                  )}
                                  {item.ledger.Lg_Code && (
                                    <span className="ml-1 text-gray-400">
                                      ({item.ledger.Lg_Code})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>

                            {formData.WA_Id == item.WA_Id.toString() && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p>No work allocations found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {filteredWorkAllocations.length} allocations found
                        </span>
                        <span>
                          Total: {workAllocationData.length} allocations
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.WA_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.WA_Id}
                </p>
              )}
            </div>

            {/* Subledger Dropdown */}
            <div ref={subledgerDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subledger *{" "}
                <span className="text-xs text-gray-500">
                  (Select subledger)
                </span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingDropdowns ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading subledgers...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={subledgerButtonRef}
                      type="button"
                      onClick={() =>
                        setIsSubledgerDropdownOpen(!isSubledgerDropdownOpen)
                      }
                      onKeyDown={handleSubledgerKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.SL_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.SL_Id ? (
                        <span className="text-gray-900 block truncate">
                          {getSelectedSubledgerName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select a Subledger
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsSubledgerDropdownOpen(!isSubledgerDropdownOpen)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isSubledgerDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.SL_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}

                {/* Subledger Dropdown Menu */}
                {isSubledgerDropdownOpen && !loadingDropdowns && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={subledgerSearchRef}
                          type="text"
                          value={subledgerSearchTerm}
                          onChange={(e) =>
                            setSubledgerSearchTerm(e.target.value)
                          }
                          onKeyDown={handleSubledgerSearchKeyDown}
                          placeholder="Search by name or code..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {subledgerSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setSubledgerSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subledger List */}
                    <div
                      ref={subledgerListRef}
                      className="overflow-y-auto max-h-64"
                    >
                      {filteredSubledgers.length > 0 ? (
                        filteredSubledgers.map((item, idx) => (
                          <button
                            key={item.SL_Id}
                            ref={(el) => {
                              subledgerItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleSubledgerSelect(item)}
                            onKeyDown={(e) =>
                              handleSubledgerItemKeyDown(e, item, idx)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              subledgerHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.SL_Id == item.SL_Id.toString()
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                          >
                            <div className="font-medium text-gray-900">
                              {item.SL_Name || "Unnamed Subledger"}
                            </div>

                            {formData.SL_Id == item.SL_Id.toString() && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p>No subledgers found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {filteredSubledgers.length} subledgers found
                        </span>
                        <span>Total: {subledgerData.length} subledgers</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.SL_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SL_Id}
                </p>
              )}
            </div>

            {/* BG Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BG Amount (₹) *
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </div>

                <input
                  ref={bgAmountRef}
                  type="text"
                  name="BG_Amt"
                  value={formData.BG_Amt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                  className={`w-full pl-6 pr-4 py-2.5 border ${
                    errors.BG_Amt ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter BG amount"
                  required
                />

                {errors.BG_Amt && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {errors.BG_Amt && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.BG_Amt}
                </p>
              )}
            </div>
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
                  {isEditMode ? "Update Entry" : "Create Entry"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditWorkBg;

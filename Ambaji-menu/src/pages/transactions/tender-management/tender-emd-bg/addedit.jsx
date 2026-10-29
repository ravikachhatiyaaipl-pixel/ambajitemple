import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Calendar,
  Layers,
  AlertCircle,
  ChevronDown,
  Search,
  ChevronUp,
  Check,
  Hash,
  DollarSign,
  Receipt,
  XCircle,
  Building,
  Tag,
  Briefcase,
  Eye,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileDigit,
  Percent,
  CreditCard,
  FileType,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { TenderEmdBgApi } from "../../../services/tenderemdbgapi";

const AddEditTenderEmdBg = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Tender EMD/BG Receipt Entry");
  const [currentStage, setCurrentStage] = useState(null);
  const [initialActionId, setInitialActionId] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);

  // Selected tender details for preview
  const [selectedTenderDetails, setSelectedTenderDetails] = useState(null);
  const [showTenderPreview, setShowTenderPreview] = useState(false);

  // Dropdown data states
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

  const [tenderData, setTenderData] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [tenderSearchTerm, setTenderSearchTerm] = useState("");
  const [isTenderDropdownOpen, setIsTenderDropdownOpen] = useState(false);
  const [tenderHighlightedIndex, setTenderHighlightedIndex] = useState(-1);
  const tenderDropdownRef = useRef(null);
  const tenderSearchRef = useRef(null);
  const tenderItemRefs = useRef([]);
  const tenderListRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    TES_Date: new Date().toISOString().split("T")[0],
    TEE_Date: new Date().toISOString().split("T")[0],
    TE_Date: new Date().toISOString().split("T")[0], // NEW FIELD ADDED
    SL_Id: "",
    TE_Id: "",
    EMD_Amt: "",
    For_Acc: "NO",
  });

  // Refs for focus management
  const dateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const tenderDateInputRef = useRef(null); // NEW FIELD REF
  const subledgerButtonRef = useRef(null);
  const tenderButtonRef = useRef(null);
  const emdAmountRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  useEffect(() => {
    // Check if user is admin
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    // Get user's department ID
    const deptId =
      user?.departmentData?.Dpt_id ||
      user?.apiUserData?.employee?.department?.Dpt_id;
    setUserDeptId(deptId ? parseInt(deptId) : null);

    // Get user's designation ID
    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);

    // Load menu and stage
    loadMenuAndStage();

    // Load dropdown data
    loadDropdownData();

    if (id && id != "create") {
      setIsEditMode(true);
      loadEntryData();
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        subledgerDropdownRef.current &&
        !subledgerDropdownRef.current.contains(event.target)
      ) {
        setIsSubledgerDropdownOpen(false);
        setSubledgerHighlightedIndex(-1);
        setSubledgerSearchTerm("");
      }
      if (
        tenderDropdownRef.current &&
        !tenderDropdownRef.current.contains(event.target)
      ) {
        setIsTenderDropdownOpen(false);
        setTenderHighlightedIndex(-1);
        setTenderSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, user]);

  // Load menu action and get stage from it
  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/tender-management/tender-emd-bg-receipt-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || currentMenuItem.Fnc_Desc);

        // Get stage from the action object
        if (currentMenuItem.action && currentMenuItem.action.stage) {
          const stage = currentMenuItem.action.stage;
          setCurrentStage(stage);
          console.log("Current Stage from menu action:", stage);

          // Load actions for this stage
          await loadActionsForStage(stage);
        } else {
          console.warn("No stage found in menu action");
        }
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  };

  // Load actions for the current stage
  const loadActionsForStage = async (stage) => {
    if (!stage) return;

    try {
      const response = await TenderEmdBgApi.getAllByStage(stage);
      console.log(`Actions for stage ${stage}:`, response);

      if (response.status && response.data) {
        const actions = response.data;

        // Find initial action (Previous_Status = null)
        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
          console.log("Initial Action ID set to:", initialAction.Act_Id);
        }

        // Check if user has permission to create (for non-admin)
        if (!isAdmin && userDesignationId && userDeptId) {
          const hasPermission = actions.some((action) => {
            const deptMatch = parseInt(action.Dpt_id) == userDeptId;
            const isAuthority = action.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
            );
            return deptMatch && isAuthority && !action.Previous_Status;
          });

          setHasCreatePermission(hasPermission);

          if (!hasPermission && !isEditMode) {
            toast.error("You don't have permission to create new entries");
            navigate(
              "/transactions/tender-management/tender-emd-bg-receipt-entry",
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

  // Focus on date field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isSubledgerDropdownOpen && subledgerSearchRef.current) {
      setTimeout(() => subledgerSearchRef.current.focus(), 0);
    }
  }, [isSubledgerDropdownOpen]);

  useEffect(() => {
    if (isTenderDropdownOpen && tenderSearchRef.current) {
      setTimeout(() => tenderSearchRef.current.focus(), 0);
    }
  }, [isTenderDropdownOpen]);

  // Scroll highlighted item into view
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

  useEffect(() => {
    if (
      isTenderDropdownOpen &&
      tenderHighlightedIndex >= 0 &&
      tenderListRef.current
    ) {
      const container = tenderListRef.current;
      const item = tenderItemRefs.current[tenderHighlightedIndex];
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
  }, [tenderHighlightedIndex, isTenderDropdownOpen]);

  // Update selected tender details when TE_Id changes
  useEffect(() => {
    if (formData.TE_Id) {
      const selected = tenderData.find(
        (tender) => tender.TE_Id == parseInt(formData.TE_Id),
      );
      setSelectedTenderDetails(selected || null);
      setShowTenderPreview(!!selected);
    } else {
      setSelectedTenderDetails(null);
      setShowTenderPreview(false);
    }
  }, [formData.TE_Id, tenderData]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [subledgerResponse, tenderResponse] = await Promise.all([
        TenderEmdBgApi.getAllSubledgers(),
        TenderEmdBgApi.getAllTenders(),
      ]);

      if (subledgerResponse.success && subledgerResponse.data) {
        setSubledgerData(subledgerResponse.data);
        setFilteredSubledgers(subledgerResponse.data);
      }

      if (tenderResponse.success && tenderResponse.data) {
        setTenderData(tenderResponse.data);
        setFilteredTenders(tenderResponse.data);
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
      const response = await TenderEmdBgApi.getById(id);
      console.log("Loaded entry response for edit:", response);

      const entry = response?.data || response;

      setFormData({
        TES_Date: entry?.TES_Date
          ? new Date(entry.TES_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        TEE_Date: entry?.TEE_Date
          ? new Date(entry.TEE_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        TE_Date: entry?.TE_Date // NEW FIELD ADDED
          ? new Date(entry.TE_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        SL_Id: entry?.SL_Id?.toString() || "",
        TE_Id: entry?.TE_Id?.toString() || "",
        EMD_Amt: entry?.EMD_Amt?.toString() || "",
        For_Acc: entry?.For_Acc || "NO",
      });

      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load entry data!");
      navigate("/transactions/tender-management/tender-emd-bg-receipt-entry");
    } finally {
      setLoading(false);
    }
  };

  // Filter subledgers
  useEffect(() => {
    if (!subledgerSearchTerm.trim()) {
      setFilteredSubledgers(subledgerData);
    } else {
      const term = subledgerSearchTerm.toLowerCase();
      const filtered = subledgerData.filter((item) =>
        item.SL_Name?.toLowerCase().includes(term),
      );
      setFilteredSubledgers(filtered);
    }
    setSubledgerHighlightedIndex(-1);
  }, [subledgerSearchTerm, subledgerData]);

  // Filter tenders
  useEffect(() => {
    if (!tenderSearchTerm.trim()) {
      setFilteredTenders(tenderData);
    } else {
      const term = tenderSearchTerm.toLowerCase();
      const filtered = tenderData.filter(
        (tender) =>
          tender.Description?.toLowerCase().includes(term) ||
          tender.TnT_ID?.toString().includes(term) ||
          tender.tendertype?.TnT_Name?.toLowerCase().includes(term) ||
          tender.department?.Dpt_Desc?.toLowerCase().includes(term) ||
          tender.department?.Dpt_Name?.toLowerCase().includes(term) ||
          tender.ledger?.Lg_Name?.toLowerCase().includes(term),
      );
      setFilteredTenders(filtered);
    }
    setTenderHighlightedIndex(-1);
  }, [tenderSearchTerm, tenderData]);

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

    setTimeout(() => tenderButtonRef.current?.focus(), 100);
  };

  const getSelectedSubledgerName = () => {
    if (!formData.SL_Id) return "";
    const selected = subledgerData.find(
      (item) => item.SL_Id == parseInt(formData.SL_Id),
    );
    return selected ? selected.SL_Name || "" : "";
  };

  // Tender keyboard handlers
  const handleTenderKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsTenderDropdownOpen(true);
      setTenderSearchTerm("");
      setTenderHighlightedIndex(-1);
      setTimeout(() => tenderSearchRef.current?.focus(), 0);
    }
  };

  const handleTenderSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredTenders.length > 0) {
        setTenderHighlightedIndex(0);
        setTimeout(() => {
          if (tenderItemRefs.current[0]) {
            tenderItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredTenders.length > 0 && tenderHighlightedIndex >= 0) {
        handleTenderSelect(filteredTenders[tenderHighlightedIndex]);
      } else if (filteredTenders.length > 0) {
        handleTenderSelect(filteredTenders[0]);
      }
    }
  };

  const handleTenderItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredTenders.length) {
        setTenderHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (tenderItemRefs.current[nextIndex]) {
            tenderItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setTenderHighlightedIndex(-1);
        setTimeout(() => tenderSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setTenderHighlightedIndex(-1);
        setTimeout(() => tenderSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setTenderHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (tenderItemRefs.current[prevIndex]) {
            tenderItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleTenderSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    }
  };

  const handleTenderSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      TE_Id: item.TE_Id.toString(),
    }));
    setIsTenderDropdownOpen(false);
    setTenderSearchTerm("");
    setTenderHighlightedIndex(-1);

    if (errors.TE_Id) {
      setErrors((prev) => ({ ...prev, TE_Id: "" }));
    }

    setTimeout(() => emdAmountRef.current?.focus(), 100);
  };

  const getSelectedTenderDescription = () => {
    if (!formData.TE_Id) return "";
    const selected = tenderData.find(
      (tender) => tender.TE_Id == parseInt(formData.TE_Id),
    );
    if (!selected) return "";

    return selected.Description || `Tender #${selected.TE_Id}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "EMD_Amt" && value != "") {
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

  const handleForAccToggle = () => {
    setFormData((prev) => ({
      ...prev,
      For_Acc: prev.For_Acc == "YES" ? "NO" : "YES",
    }));

    if (errors.For_Acc) {
      setErrors((prev) => ({ ...prev, For_Acc: "" }));
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.TES_Date) {
      newErrors.TES_Date = "Date is required";
    }

    if (!formData.TEE_Date) {
      newErrors.TEE_Date = "End Date is required";
    }

    if (!formData.TE_Date) {
      // NEW FIELD VALIDATION
      newErrors.TE_Date = "Tender Date is required";
    }

    if (!formData.SL_Id) {
      newErrors.SL_Id = "Subledger selection is required";
    }

    if (!formData.TE_Id) {
      newErrors.TE_Id = "Tender selection is required";
    }

    if (!formData.EMD_Amt) {
      newErrors.EMD_Amt = "EMD amount is required";
    } else if (parseFloat(formData.EMD_Amt) <= 0) {
      newErrors.EMD_Amt = "EMD amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  // Prepare payload with Status field from action master
  const preparePayload = () => {
    const payload = {
      TES_Date: formData.TES_Date,
      TEE_Date: formData.TEE_Date,
      TE_Date: formData.TE_Date, // NEW FIELD ADDED
      SL_Id: parseInt(formData.SL_Id),
      TE_Id: parseInt(formData.TE_Id),
      EMD_Amt: parseFloat(formData.EMD_Amt),
      For_Acc: formData.For_Acc,
    };

    // For new entries (create), set TET_CD and Status from action master
    if (!isEditMode) {
      payload.TET_CD = "Credit";
      // Use the initial action ID from action master
      if (initialActionId) {
        payload.Status = initialActionId;
        console.log("Setting Status to initial action ID:", initialActionId);
      }
    }
    // For edit mode, we don't send Status field
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
      title: isEditMode ? "Update EMD/BG Entry?" : "Create New EMD/BG Entry?",
      text: isEditMode
        ? "Are you sure you want to update this EMD/BG receipt entry?"
        : "Are you sure you want to create this new EMD/BG receipt entry?",
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
        response = await TenderEmdBgApi.update(id, payload);
        toast.success("EMD/BG entry updated successfully!");
      } else {
        response = await TenderEmdBgApi.create(payload);
        toast.success("EMD/BG entry created successfully!");
      }

      console.log("API response:", response);

      setTimeout(() => {
        navigate("/transactions/tender-management/tender-emd-bg-receipt-entry");
      }, 1500);
    } catch (error) {
      console.error("Error saving entry:", error);
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
    navigate("/transactions/tender-management/tender-emd-bg-receipt-entry");
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getBranchDisplay = () => {
    if (!selectedTenderDetails?.department) return "N/A";
    const dept = selectedTenderDetails.department;
    let displayText = dept.Dpt_Desc || "";
    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }
    return displayText;
  };

  const getBudgetHeadDisplay = () => {
    if (!selectedTenderDetails?.budget_head) return "N/A";
    const head = selectedTenderDetails.budget_head;
    return head.Gr_Nm || "";
  };

  const getLedgerDisplay = () => {
    if (!selectedTenderDetails?.ledger) return "N/A";
    const ledger = selectedTenderDetails.ledger;
    let displayText = ledger.Lg_Name || "";
    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      displayText += ` (${ledger.Lg_Eng_Name})`;
    }
    if (ledger.Lg_Code) {
      displayText += ` - ${ledger.Lg_Code}`;
    }
    return displayText;
  };

  const getUploadedDocuments = () => {
    if (!selectedTenderDetails) return [];
    return selectedTenderDetails.Documents || [];
  };

  // Show loading if permissions are being checked
  if (loading && !isEditMode) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  const uploadedDocuments = getUploadedDocuments();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/tender-management/tender-emd-bg-receipt-entry",
              )
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
                ? "Update EMD/BG receipt entry information"
                : "Create new EMD/BG receipt entry"}
            </p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Dept ID: {userDeptId} | Desg ID: {userDesignationId} | Stage:{" "}
                {currentStage}
              </p>
            )}
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
              EMD/BG Receipt Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NEW Tender Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={tenderDateInputRef}
                  type="date"
                  name="TE_Date"
                  value={formData.TE_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, subledgerButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.TE_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.TE_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TE_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TE_Date}
                </p>
              )}
            </div>

            {/* Subledger Dropdown */}
            <div ref={subledgerDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Party *
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingDropdowns ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading Party...</span>
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
                        <span className="text-gray-900">
                          {getSelectedSubledgerName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Party</span>
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
                          placeholder="Search by name..."
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

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  name="TES_Date"
                  value={formData.TES_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, endDateInputRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.TES_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.TES_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TES_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TES_Date}
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
                  ref={endDateInputRef}
                  type="date"
                  name="TEE_Date"
                  value={formData.TEE_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, tenderDateInputRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.TEE_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.TEE_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TEE_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TEE_Date}
                </p>
              )}
            </div>

            {/* Tender Dropdown */}
            <div ref={tenderDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender *{" "}
                <span className="text-xs text-gray-500">(Select tender)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingDropdowns ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading tenders...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={tenderButtonRef}
                      type="button"
                      onClick={() =>
                        setIsTenderDropdownOpen(!isTenderDropdownOpen)
                      }
                      onKeyDown={handleTenderKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.TE_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.TE_Id ? (
                        <span className="text-gray-900 block truncate">
                          {getSelectedTenderDescription()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Tender</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsTenderDropdownOpen(!isTenderDropdownOpen)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isTenderDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.TE_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}

                {/* Tender Dropdown Menu */}
                {isTenderDropdownOpen && !loadingDropdowns && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={tenderSearchRef}
                          type="text"
                          value={tenderSearchTerm}
                          onChange={(e) => setTenderSearchTerm(e.target.value)}
                          onKeyDown={handleTenderSearchKeyDown}
                          placeholder="Search by description, work type, or branch..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {tenderSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setTenderSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      ref={tenderListRef}
                      className="overflow-y-auto max-h-64"
                    >
                      {filteredTenders.length > 0 ? (
                        filteredTenders.map((tender, idx) => (
                          <button
                            key={tender.TE_Id}
                            ref={(el) => {
                              tenderItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleTenderSelect(tender)}
                            onKeyDown={(e) =>
                              handleTenderItemKeyDown(e, tender, idx)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              tenderHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.TE_Id == tender.TE_Id.toString()
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                          >
                            <div className="font-medium text-sm line-clamp-2 text-gray-900">
                              {tender.Description || `Tender #${tender.TE_Id}`}
                            </div>

                            <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                              {tender.department && (
                                <span className="inline-flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {tender.department.Dpt_Desc ||
                                    tender.department.Dpt_Name ||
                                    "N/A"}
                                </span>
                              )}
                              {tender.tendertype && (
                                <span className="inline-flex items-center">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {tender.tendertype.TnT_Name}
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                              <span>
                                Proposal:{" "}
                                {formatCurrency(tender.Proposal_Amount)}
                              </span>
                              <span>
                                Approved:{" "}
                                {formatCurrency(tender.Approved_Amount)}
                              </span>
                              <span>Date: {formatDate(tender.Tnd_Date)}</span>
                            </div>

                            {tender.ledger && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                Ledger: {tender.ledger.Lg_Name}
                                {tender.ledger.Lg_Code && (
                                  <span className="ml-1 text-gray-400">
                                    ({tender.ledger.Lg_Code})
                                  </span>
                                )}
                              </div>
                            )}

                            {formData.TE_Id == tender.TE_Id.toString() && (
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
                          <p>No tenders found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{filteredTenders.length} tenders found</span>
                        <span>Total: {tenderData.length} tenders</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.TE_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TE_Id}
                </p>
              )}
            </div>

            {/* EMD Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMD Amount (₹) *
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </div>
                <input
                  ref={emdAmountRef}
                  type="text"
                  name="EMD_Amt"
                  value={formData.EMD_Amt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                  className={`w-full pl-6 pr-4 py-2.5 border ${
                    errors.EMD_Amt ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter EMD amount"
                  required
                />
                {errors.EMD_Amt && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.EMD_Amt && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EMD_Amt}
                </p>
              )}
            </div>

            {/* For_Acc Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forward To Account *
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <button
                  type="button"
                  onClick={handleForAccToggle}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.For_Acc == "YES" ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      formData.For_Acc == "YES"
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {formData.For_Acc == "YES" ? "YES" : "NO"}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formData.For_Acc == "YES"
                    ? "This entry is for account"
                    : "This entry is not for account"}
                </span>
              </div>
              {errors.For_Acc && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.For_Acc}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tender Preview Card */}
        {showTenderPreview && selectedTenderDetails && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mr-3">
                  <Eye className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Tender Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTenderPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <FileDigit className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-500">
                        Tender
                      </span>
                    </div>
                    {selectedTenderDetails.Tender_No && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {selectedTenderDetails.Tender_No}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mt-2 leading-relaxed">
                    {selectedTenderDetails.Description ||
                      "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-xs font-medium text-gray-500">
                        Proposal Amount
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedTenderDetails.Proposal_Amount)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-xs font-medium text-gray-500">
                        Approved Amount
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedTenderDetails.Approved_Amount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-xs font-medium text-gray-500">
                        Start Date
                      </span>
                    </div>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(selectedTenderDetails.TE_St_Date)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-xs font-medium text-gray-500">
                        End Date
                      </span>
                    </div>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(selectedTenderDetails.TE_Ed_Date) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedTenderDetails.department && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Building className="h-4 w-4 text-blue-600 mr-2" />
                      Branch / Department
                    </h4>
                    <p className="text-sm font-medium text-gray-900">
                      {getBranchDisplay()}
                    </p>
                  </div>
                )}

                {selectedTenderDetails.tendertype && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Briefcase className="h-4 w-4 text-green-600 mr-2" />
                      Work Type
                    </h4>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedTenderDetails.tendertype.TnT_Name}
                    </p>
                    {selectedTenderDetails.tendertype.TnT_Code && (
                      <p className="text-xs text-gray-500 mt-1">
                        Code: {selectedTenderDetails.tendertype.TnT_Code}
                      </p>
                    )}
                  </div>
                )}

                {selectedTenderDetails.budget_head && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Layers className="h-4 w-4 text-purple-600 mr-2" />
                      Budget Head
                    </h4>
                    <p className="text-sm font-medium text-gray-900">
                      {getBudgetHeadDisplay()}
                    </p>
                  </div>
                )}

                {selectedTenderDetails.ledger && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Tag className="h-4 w-4 text-indigo-600 mr-2" />
                      Ledger Account
                    </h4>
                    <p className="text-sm font-medium text-gray-900">
                      {getLedgerDisplay()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddEditTenderEmdBg;

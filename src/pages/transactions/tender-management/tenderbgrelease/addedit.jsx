import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  AlertCircle,
  ChevronDown,
  Search,
  ChevronUp,
  Check,
  XCircle,
  Building,
  Users,
  Briefcase,
  Tag,
  Filter,
  CheckCircle,
  RefreshCw,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { TenderBgReleaseApi } from "../../../services/tenderbgreleaseapi";

const AddEditTenderBgRelease = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("BG Release Entry");
  const [selectedIds, setSelectedIds] = useState([]);

  // Tender dropdown state
  const [tenderData, setTenderData] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [tenderSearchTerm, setTenderSearchTerm] = useState("");
  const [isTenderDropdownOpen, setIsTenderDropdownOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [tenderHighlightedIndex, setTenderHighlightedIndex] = useState(-1);
  const tenderDropdownRef = useRef(null);
  const tenderSearchRef = useRef(null);
  const tenderItemRefs = useRef([]);
  const tenderListRef = useRef(null);
  const tenderButtonRef = useRef(null);

  // Data states
  const [bgData, setBgData] = useState([]);
  const [nocData, setNocData] = useState([]);
  const [filteredBgList, setFilteredBgList] = useState([]);
  const [bgSearchTerm, setBgSearchTerm] = useState("");

  // Store which allocated SLs have NOC approval
  const [allocatedSlWithNoc, setAllocatedSlWithNoc] = useState(new Set());
  const [allocatedSlWithoutNoc, setAllocatedSlWithoutNoc] = useState(new Set());
  const [hasMissingNocApproval, setHasMissingNocApproval] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    TE_Id: "",
  });

  // Refs for focus management
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  useEffect(() => {
    // Get page title from menu details
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/tender-management/tender-bg-release";
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

    // Focus on tender button after loading
    setTimeout(() => tenderButtonRef.current?.focus(), 100);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
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
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isTenderDropdownOpen && tenderSearchRef.current) {
      setTimeout(() => tenderSearchRef.current.focus(), 0);
    }
  }, [isTenderDropdownOpen]);

  // Scroll highlighted item into view
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

  // Create Sets of allocated SLs with and without NOC Approval
  useEffect(() => {
    const nocSet = new Set();

    nocData.forEach((noc) => {
      if (noc.WA_Id) {
        nocSet.add(
          `${noc.SL_Id?.toString()}_${noc.WA_Id?.toString()}_${noc.work_allocation?.TE_Id?.toString()}`,
        );
      }
    });

    setAllocatedSlWithNoc(nocSet);
  }, [nocData]);

  // Filter Bank Guarantee list based on selected tender
  useEffect(() => {
    if (!selectedTender) {
      setFilteredBgList([]);
      setHasMissingNocApproval(false);
      return;
    }

    // Get all BG entries for selected tender with WBT_CD = "Credit"
    const tenderBgWithCredit = bgData.filter(
      (bg) =>
        bg.work_allocation?.TE_Id?.toString() ==
          selectedTender.TE_Id?.toString() && bg.WBT_CD == "Credit",
    );

    // Process each BG entry and check NOC status
    const processedList = tenderBgWithCredit.map((bg) => {
      // Check if this combination has NOC Approval
      const nocKey = `${bg.SL_Id?.toString()}_${bg.WA_Id?.toString()}_${bg.work_allocation?.TE_Id?.toString()}`;
      const hasNocApproval = allocatedSlWithNoc.has(nocKey);

      return {
        ...bg,
        hasNocApproval,
      };
    });

    // Update the set of allocated SLs without NOC
    const noNoc = new Set(
      processedList
        .filter((item) => !item.hasNocApproval)
        .map((item) => item.WBT_Id),
    );
    setAllocatedSlWithoutNoc(noNoc);
    setHasMissingNocApproval(noNoc.size > 0);

    // Apply search filter
    let filtered = processedList;
    if (bgSearchTerm.trim()) {
      const term = bgSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.subledger?.SL_Name?.toLowerCase().includes(term) ||
          item.BG_Amt?.toString().includes(term),
      );
    }

    setFilteredBgList(filtered);
  }, [selectedTender, bgData, allocatedSlWithNoc, bgSearchTerm]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Load all required data in parallel
      const [tenderResponse, bgResponse, nocResponse] = await Promise.all([
        TenderBgReleaseApi.getAllTenders(),
        TenderBgReleaseApi.getAllBankGuarantees(),
        TenderBgReleaseApi.getAllNocApprovals(),
      ]);

      if (tenderResponse.success && tenderResponse.data) {
        setTenderData(tenderResponse.data);
        setFilteredTenders(tenderResponse.data);
      }

      if (bgResponse.success && bgResponse.data) {
        // Filter for Credit entries only
        const creditEntries = bgResponse.data.filter(
          (bg) => bg.WBT_CD == "Credit",
        );
        setBgData(creditEntries);
      }

      if (nocResponse.success && nocResponse.data) {
        setNocData(nocResponse.data);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Filter tenders
  useEffect(() => {
    if (!tenderSearchTerm.trim()) {
      setFilteredTenders(tenderData);
    } else {
      const term = tenderSearchTerm.toLowerCase();
      const filtered = tenderData.filter(
        (tender) =>
          tender.Description?.toLowerCase().includes(term) ||
          tender.tendertype?.TnT_Name?.toLowerCase().includes(term) ||
          tender.department?.Dpt_Desc?.toLowerCase().includes(term) ||
          tender.department?.Dpt_Name?.toLowerCase().includes(term) ||
          tender.ledger?.Lg_Name?.toLowerCase().includes(term) ||
          tender.ledger?.Lg_Eng_Name?.toLowerCase().includes(term) ||
          tender.ledger?.Lg_Code?.toLowerCase().includes(term),
      );
      setFilteredTenders(filtered);
    }
    setTenderHighlightedIndex(-1);
  }, [tenderSearchTerm, tenderData]);

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

  const handleTenderSelect = (tender) => {
    setSelectedTender(tender);
    setFormData((prev) => ({
      ...prev,
      TE_Id: tender.TE_Id.toString(),
    }));
    setIsTenderDropdownOpen(false);
    setTenderSearchTerm("");
    setTenderHighlightedIndex(-1);
    setSelectedIds([]);
    setBgSearchTerm("");
    setAllocatedSlWithoutNoc(new Set());
    setHasMissingNocApproval(false);

    if (errors.TE_Id) {
      setErrors((prev) => ({ ...prev, TE_Id: "" }));
    }
  };

  const handleSelectAll = () => {
    // If any allocated SL is missing NOC Approval, cannot select any SL
    if (hasMissingNocApproval) {
      toast.error("Cannot select any SLs until all SLs have NOC Approval");
      return;
    }

    const allIds = filteredBgList.map((item) => item.WBT_Id);
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSelectVisible = () => {
    // If any allocated SL is missing NOC Approval, cannot select any SL
    if (hasMissingNocApproval) {
      toast.error("Cannot select any SLs until all SLs have NOC Approval");
      return;
    }

    const visibleIds = filteredBgList.map((item) => item.WBT_Id);
    setSelectedIds(visibleIds);
  };

  const handleRowSelect = (id) => {
    // If any allocated SL is missing NOC Approval, cannot select any SL
    if (hasMissingNocApproval) {
      toast.error("Cannot select any SLs until all SLs have NOC Approval");
      return;
    }

    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId != id);
      } else {
        return [...prev, id];
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedTender) {
      newErrors.TE_Id = "Tender selection is required";
    }

    if (selectedIds.length == 0) {
      newErrors.selectedIds =
        "At least one bank guarantee must be selected for release";
    }

    // Check if any allocated SL is missing NOC Approval
    if (hasMissingNocApproval) {
      // Get the names of allocated SLs without NOC for better error message
      const itemsWithoutNoc = filteredBgList.filter(
        (item) => !item.hasNocApproval,
      );
      const namesWithoutNoc = itemsWithoutNoc
        .map((item) => item.subledger?.SL_Name)
        .join(", ");

      newErrors.nocApproval = `Cannot release: The following SLs are missing NOC Approval: ${namesWithoutNoc}`;
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

    const selectedCount = selectedIds.length;

    const result = await Swal.fire({
      title: "Release Bank Guarantee?",
      html: `
        <div class="text-left">
          <p class="mb-2">Are you sure you want to release Bank Guarantee for ${selectedCount} Selected entries?</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, release!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const payload = {
        ids: selectedIds,
        WBT_CD: "Debit",
      };

      const response = await TenderBgReleaseApi.bulkUpdate(payload);

      if (response.success) {
        toast.success(
          `${selectedCount} Bank Guarantee entries released successfully!`,
        );
        setTimeout(() => {
          navigate("/dashboard");
        }, 5000);
      } else {
        throw new Error(
          response.message || "Failed to release Bank Guarantee entries",
        );
      }
    } catch (error) {
      console.error("Error releasing Bank Guarantee entries:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        toast.error(Object.values(backendErrors).flat().join(", "));
      } else {
        toast.error(
          error.message ||
            "Failed to release Bank Guarantee entries. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const refreshData = () => {
    loadDropdownData();
    toast.success("Data refreshed!");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading BG release data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              New {pageTitle}
            </h1>
            <p className="text-gray-600 mt-1">
              Release Bank Guarantee for selected entries (Requires NOC
              Approval)
            </p>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              BG Release Details
            </h2>
          </div>

          <div className="space-y-6">
            {/* Tender Selection - Required */}
            <div ref={tenderDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender Selection *
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
                      {selectedTender ? (
                        <span className="text-gray-900 block truncate">
                          {selectedTender.Description ||
                            `Tender #${selectedTender.TE_Id}`}
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
              </div>
              {errors.TE_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TE_Id}
                </p>
              )}

              {/* Tender Dropdown Menu */}
              {isTenderDropdownOpen && !loadingDropdowns && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={tenderSearchRef}
                        type="text"
                        value={tenderSearchTerm}
                        onChange={(e) => setTenderSearchTerm(e.target.value)}
                        onKeyDown={handleTenderSearchKeyDown}
                        placeholder="Search by description, work type, department..."
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

                  {/* Tender List */}
                  <div ref={tenderListRef} className="overflow-y-auto max-h-64">
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
                              : selectedTender?.TE_Id == tender.TE_Id
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                          }`}
                          tabIndex={0}
                        >
                          {/* First line - Description */}
                          <div className="font-medium text-sm text-gray-900">
                            {tender.Description || `Tender #${tender.TE_Id}`}
                          </div>

                          {/* Second line - Department and Work Type */}
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

                          {/* Third line - Amounts */}
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                            <span>
                              Proposal: ₹{" "}
                              {formatCurrency(tender.Proposal_Amount)}
                            </span>
                            <span>
                              Approved: ₹{" "}
                              {formatCurrency(tender.Approved_Amount)}
                            </span>
                          </div>

                          {/* Fourth line - Ledger */}
                          {tender.ledger && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              Ledger: {tender.ledger.Lg_Name}
                              {tender.ledger.Lg_Eng_Name && (
                                <span className="ml-1 text-gray-400">
                                  ({tender.ledger.Lg_Eng_Name})
                                </span>
                              )}
                              {tender.ledger.Lg_Code && (
                                <span className="ml-1 text-gray-400">
                                  ({tender.ledger.Lg_Code})
                                </span>
                              )}
                            </div>
                          )}

                          {selectedTender?.TE_Id == tender.TE_Id && (
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

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredTenders.length} tenders found</span>
                      <span>Total: {tenderData.length} tenders</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Guarantee List Container - Show only after tender selection */}
        {selectedTender && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <Shield className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Bank Guarantee Entries
              </h2>
              <div className="ml-auto text-sm text-gray-600">
                Selected: {selectedIds.length} | Total: {filteredBgList.length}
                {hasMissingNocApproval && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Some SLs missing NOC Approval
                  </span>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Sub Ledger name or amount..."
                  value={bgSearchTerm}
                  onChange={(e) => setBgSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {bgSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setBgSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={hasMissingNocApproval}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                  hasMissingNocApproval
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Select All
              </button>
              <button
                type="button"
                onClick={handleSelectVisible}
                disabled={hasMissingNocApproval}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                  hasMissingNocApproval
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                <Filter className="h-3 w-3 mr-1" />
                Select Visible
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Deselect All
              </button>
            </div>

            {/* Bank Guarantee List Table */}
            <div
              className={`border rounded-lg overflow-hidden ${errors.selectedIds ? "border-red-300" : "border-gray-300"}`}
            >
              <div className="max-h-96 overflow-y-auto">
                {filteredBgList.length == 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">
                      No Bank Guarantee entries found
                    </p>
                    <p className="text-sm mt-1">
                      No Credit BG entries found for this tender
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="w-12 px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={
                              filteredBgList.length > 0 &&
                              filteredBgList.every((item) =>
                                selectedIds.includes(item.WBT_Id),
                              )
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSelectVisible();
                              } else {
                                const visibleIds = filteredBgList.map(
                                  (item) => item.WBT_Id,
                                );
                                setSelectedIds((prev) =>
                                  prev.filter((id) => !visibleIds.includes(id)),
                                );
                              }
                            }}
                            disabled={hasMissingNocApproval}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Sub Ledger Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          BG Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          BG Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          NOC Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBgList.map((item) => {
                        const isSelected = selectedIds.includes(item.WBT_Id);
                        // Can only select if NO allocated SLs are missing NOC Approval
                        const canSelect = !hasMissingNocApproval;

                        return (
                          <tr
                            key={item.WBT_Id}
                            className={`hover:bg-gray-50 transition-colors ${
                              canSelect
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-60"
                            } ${isSelected ? "bg-blue-50" : ""}`}
                            onClick={() =>
                              canSelect && handleRowSelect(item.WBT_Id)
                            }
                          >
                            <td
                              className="px-4 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  canSelect && handleRowSelect(item.WBT_Id)
                                }
                                disabled={!canSelect}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {item.subledger?.SL_Name || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-900 font-medium">
                                ₹ {formatCurrency(item.BG_Amt)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-600">
                                {new Date(item.WBT_Date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {item.hasNocApproval ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Missing
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {errors.nocApproval && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.nocApproval}
              </p>
            )}
            {errors.selectedIds && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.selectedIds}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Click anywhere on a row to select/unselect. Use checkboxes for
              bulk selection.
              {hasMissingNocApproval &&
                " Cannot select any entries until all SLs have NOC Approval."}
            </p>
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
              disabled={
                saving ||
                !selectedTender ||
                selectedIds.length == 0 ||
                hasMissingNocApproval
              }
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Releasing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Release BG
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditTenderBgRelease;

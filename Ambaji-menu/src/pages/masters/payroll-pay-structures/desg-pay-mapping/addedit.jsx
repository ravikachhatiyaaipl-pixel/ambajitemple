import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Check,
  AlertCircle,
  Users,
  RefreshCw,
  Search,
  ChevronDown,
  XCircle,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DsgPayMapApi } from "../../../services/dsgpaymapapi";

const AddEditDsgPayMapping = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // =============  DESIGNATION DROPDOWN STATES ==============
  const [designations, setDesignations] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [isDesgDropdownOpen, setIsDesgDropdownOpen] = useState(false);
  const [desgSearchTerm, setDesgSearchTerm] = useState("");
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [desgHighlightedIndex, setDesgHighlightedIndex] = useState(-1);
  const desgDropdownRef = useRef(null);
  const desgSearchRef = useRef(null);
  const desgButtonRef = useRef(null);
  const desgItemRefs = useRef([]);

  // =============  REFS FOR FOCUS MANAGEMENT ==============
  const pcSelectRef = useRef(null);
  const pstSelectRef = useRef(null);
  const psSelectRef = useRef(null);
  const pbSelectRef = useRef(null);
  const egmSelectRef = useRef(null);
  const plSelectRef = useRef(null);
  const prbSelectRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Dropdown data states
  const [commissions, setCommissions] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);
  const [scales, setScales] = useState([]);
  const [bands, setBands] = useState([]);
  const [grades, setGrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [payrollBills, setPayrollBills] = useState([]);

  // Loading states for dropdowns
  const [dropdownLoading, setDropdownLoading] = useState({
    commissions: false,
    structureTypes: false,
    scales: false,
    bands: false,
    grades: false,
    levels: false,
    payrollBills: false,
  });

  // Form data state
  const [formData, setFormData] = useState({
    Dsg_id: "",
    PC_id: "",
    PST_id: "",
    PS_id: "",
    PB_id: "",
    PL_Id: "",
    PRB_id: "",
    EGM_Id: "",
  });

  // =============  HELPER FUNCTION FOR INDENTED NAME ==============
  const getIndentedName = (designation) => {
    const level = parseInt(designation.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const displayName =
      designation.Dsg_Desc ||
      designation.Dsg_Title ||
      designation.Dsg_EName ||
      "";
    return `${indent}${displayName} (Level ${level})`;
  };

  // =============  CLICK OUTSIDE HANDLER ==============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desgDropdownRef.current &&
        !desgDropdownRef.current.contains(event.target)
      ) {
        setIsDesgDropdownOpen(false);
        setDesgHighlightedIndex(-1);
        setDesgSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =============  FOCUS SEARCH WHEN DROPDOWN OPENS ==============
  useEffect(() => {
    if (isDesgDropdownOpen && desgSearchRef.current) {
      setTimeout(() => desgSearchRef.current.focus(), 0);
    }
  }, [isDesgDropdownOpen]);

  // =============  SCROLL HIGHLIGHTED ITEM INTO VIEW ==============
  useEffect(() => {
    if (
      isDesgDropdownOpen &&
      desgHighlightedIndex >= 0 &&
      desgItemRefs.current[desgHighlightedIndex]
    ) {
      desgItemRefs.current[desgHighlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [desgHighlightedIndex, isDesgDropdownOpen]);

  // =============  FILTER DESIGNATIONS ==============
  useEffect(() => {
    if (!desgSearchTerm.trim()) {
      const sorted = [...designations].sort(
        (a, b) => (parseInt(a.GrStt, 10) || 1) - (parseInt(b.GrStt, 10) || 1),
      );
      setFilteredDesignations(sorted);
    } else {
      const term = desgSearchTerm.toLowerCase();
      const filtered = designations.filter(
        (desg) =>
          (desg.Dsg_Title?.toLowerCase() || "").includes(term) ||
          (desg.Dsg_Desc?.toLowerCase() || "").includes(term) ||
          (desg.Dsg_EName?.toLowerCase() || "").includes(term) ||
          (desg.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredDesignations(
        filtered.sort(
          (a, b) => (parseInt(a.GrStt, 10) || 1) - (parseInt(b.GrStt, 10) || 1),
        ),
      );
    }
    setDesgHighlightedIndex(-1);
  }, [desgSearchTerm, designations]);

  // =============  PERFECT KEYBOARD NAVIGATION ==============
  useEffect(() => {
    // Focus on designation button when page loads
    const timer = setTimeout(() => {
      if (desgButtonRef.current) {
        desgButtonRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDesgSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredDesignations.length > 0) {
        setDesgHighlightedIndex(0);
        setTimeout(() => {
          if (desgItemRefs.current[0]) {
            desgItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (desgHighlightedIndex == -1) {
        // Already in search, do nothing
      } else {
        setDesgHighlightedIndex(-1);
        setTimeout(() => desgSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDesgDropdownOpen(false);
      setDesgHighlightedIndex(-1);
      setDesgSearchTerm("");
      desgButtonRef.current?.focus();
    }
  };

  const handleDesignationKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isDesgDropdownOpen) {
        setIsDesgDropdownOpen(true);
        setDesgSearchTerm("");
        setDesgHighlightedIndex(-1);
        setTimeout(() => desgSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isDesgDropdownOpen) {
        setIsDesgDropdownOpen(false);
        setDesgHighlightedIndex(-1);
        setDesgSearchTerm("");
      }
    }
  };

  useEffect(() => {
    if (isDesgDropdownOpen && desgHighlightedIndex >= 0) {
      setTimeout(() => {
        if (desgItemRefs.current[desgHighlightedIndex]) {
          desgItemRefs.current[desgHighlightedIndex].focus();
        }
      }, 50);
    }
  }, [desgHighlightedIndex, isDesgDropdownOpen]);

  // =============  SELECT HANDLERS WITH AUTO FOCUS ==============
  const handleDesignationSelect = (designationId) => {
    if (designationId) {
      setFormData((prev) => ({
        ...prev,
        Dsg_id: designationId.toString(),
      }));
    }
    setIsDesgDropdownOpen(false);
    setDesgSearchTerm("");
    setDesgHighlightedIndex(-1);

    if (errors.Dsg_id) {
      setErrors((prev) => ({ ...prev, Dsg_id: "" }));
    }

    // Focus on Pay Commission after selection
    setTimeout(() => pcSelectRef.current?.focus(), 100);
  };

  // =============  SELECT FIELD KEYBOARD NAVIGATION ==============
  const handleSelectKeyDown = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      // Go back to previous field based on current field
      const fieldName = e.target.name;
      if (fieldName == "PC_id") {
        desgButtonRef.current?.focus();
      } else if (fieldName == "PST_id") {
        pcSelectRef.current?.focus();
      } else if (fieldName == "PS_id") {
        pstSelectRef.current?.focus();
      } else if (fieldName == "PB_id") {
        psSelectRef.current?.focus();
      } else if (fieldName == "EGM_Id") {
        pbSelectRef.current?.focus();
      } else if (fieldName == "PL_Id") {
        egmSelectRef.current?.focus();
      } else if (fieldName == "PRB_id") {
        plSelectRef.current?.focus();
      }
    }
  };

  // Load all initial dropdowns
  useEffect(() => {
    loadInitialDropdowns();
  }, []);

  // Load mapping data if in edit mode
  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadMappingData();
    }
  }, [id]);

  // Load filtered data when commission changes
  useEffect(() => {
    if (formData.PC_id) {
      loadFilteredDataByCommission(formData.PC_id);
    } else {
      setScales([]);
      setBands([]);
      setGrades([]);
      setLevels([]);
    }
  }, [formData.PC_id]);

  // Load levels when both commission and scale are selected
  useEffect(() => {
    if (formData.PC_id && formData.PS_id) {
      loadLevelsByCommissionAndScale(formData.PC_id, formData.PS_id);
    } else {
      setLevels([]);
    }
  }, [formData.PC_id, formData.PS_id]);

  const loadInitialDropdowns = async () => {
    setDropdownLoading((prev) => ({
      ...prev,
      designations: true,
      commissions: true,
      structureTypes: true,
      payrollBills: true,
    }));

    try {
      const [desigsData, commsData, structTypesData, billsData] =
        await Promise.all([
          DsgPayMapApi.getDesignations(),
          DsgPayMapApi.getPayCommissions(),
          DsgPayMapApi.getPayStructureTypes(),
          DsgPayMapApi.getPayrollBills(),
        ]);

      const sortedDesigs = (desigsData || []).sort(
        (a, b) => (parseInt(a.GrStt, 10) || 1) - (parseInt(b.GrStt, 10) || 1),
      );
      setDesignations(sortedDesigs);
      setFilteredDesignations(sortedDesigs);
      setCommissions(commsData || []);
      setStructureTypes(structTypesData || []);
      setPayrollBills(billsData || []);
    } catch (error) {
      toast.error("Failed to load dropdown data");
      console.error(error);
    } finally {
      setDropdownLoading((prev) => ({
        ...prev,
        designations: false,
        commissions: false,
        structureTypes: false,
        payrollBills: false,
      }));
    }
  };

  const loadFilteredDataByCommission = async (commissionId) => {
    setDropdownLoading((prev) => ({
      ...prev,
      scales: true,
      bands: true,
      grades: true,
    }));

    try {
      const [scalesData, bandsData, gradesData] = await Promise.all([
        DsgPayMapApi.getPayScales(commissionId),
        DsgPayMapApi.getPayBands(commissionId),
        DsgPayMapApi.getPayGrades(commissionId),
      ]);

      setScales(scalesData || []);
      setBands(bandsData || []);
      setGrades(gradesData || []);
    } catch (error) {
      toast.error("Failed to load commission-specific data");
      console.error(error);
    } finally {
      setDropdownLoading((prev) => ({
        ...prev,
        scales: false,
        bands: false,
        grades: false,
      }));
    }
  };

  const loadLevelsByCommissionAndScale = async (commissionId, scaleId) => {
    setDropdownLoading((prev) => ({ ...prev, levels: true }));
    try {
      const levelsData = await DsgPayMapApi.getPayLevels(commissionId, scaleId);
      setLevels(levelsData || []);
    } catch (error) {
      toast.error("Failed to load pay levels");
      console.error(error);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, levels: false }));
    }
  };

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const mapping = await DsgPayMapApi.getById(id);

      setFormData({
        Dsg_id: mapping.Dsg_id?.toString() || "",
        PC_id: mapping.PC_id?.toString() || "",
        PST_id: mapping.PST_id?.toString() || "",
        PS_id: mapping.PS_id?.toString() || "",
        PB_id: mapping.PB_id?.toString() || "",
        PL_Id: mapping.PL_Id?.toString() || "",
        PRB_id: mapping.PRB_id?.toString() || "",
        EGM_Id: mapping.EGM_Id?.toString() || "",
      });
    } catch (error) {
      toast.error("Failed to load mapping data!");
      navigate("/masters/payroll-pay-structures/desg-pay-mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "PC_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        PS_id: "",
        PB_id: "",
        EGM_Id: "",
        PL_Id: "",
      }));
    } else if (name == "PS_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        PL_Id: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getDesignationDisplay = (desig) => {
    if (!desig) return "";
    return getIndentedName(desig);
  };

  const getSelectedDesignationDisplay = () => {
    if (!formData.Dsg_id) return "";
    const selected = designations.find(
      (d) => (d.Dsg_id || d.id)?.toString() == formData.Dsg_id,
    );
    return selected
      ? getDesignationDisplay(selected)
      : "Selected designation not found";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Dsg_id) {
      newErrors.Dsg_id = "Designation is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Designation Pay Mapping?"
        : "Create New Designation Pay Mapping?",
      text: isEditMode
        ? "Are you sure you want to update this mapping?"
        : "Are you sure you want to create this mapping?",
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
      const mappingData = {
        Dsg_id: parseInt(formData.Dsg_id),
        PC_id: formData.PC_id ? parseInt(formData.PC_id) : null,
        PST_id: formData.PST_id ? parseInt(formData.PST_id) : null,
        PS_id: formData.PS_id ? parseInt(formData.PS_id) : null,
        PB_id: formData.PB_id ? parseInt(formData.PB_id) : null,
        PL_Id: formData.PL_Id ? parseInt(formData.PL_Id) : null,
        PRB_id: formData.PRB_id ? parseInt(formData.PRB_id) : null,
        EGM_Id: formData.EGM_Id ? parseInt(formData.EGM_Id) : null,
      };

      if (isEditMode) {
        await DsgPayMapApi.update(id, mappingData);
        toast.success("Designation Pay Mapping updated successfully!");
      } else {
        await DsgPayMapApi.create(mappingData);
        toast.success("Designation Pay Mapping created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/desg-pay-mapping");
      }, 1500);
    } catch (error) {
      console.error("Error saving mapping:", error);

      if (error.errors) {
        const newErrors = {};
        Object.keys(error.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update mapping. Please try again."
            : "Failed to create mapping. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/payroll-pay-structures/desg-pay-mapping");
  };

  const refreshDropdown = async (type) => {
    try {
      switch (type) {
        case "designations":
          setDropdownLoading((prev) => ({ ...prev, designations: true }));
          const desigs = await DsgPayMapApi.getDesignations();
          const sortedDesigs = (desigs || []).sort(
            (a, b) =>
              (parseInt(a.GrStt, 10) || 1) - (parseInt(b.GrStt, 10) || 1),
          );
          setDesignations(sortedDesigs);
          setFilteredDesignations(sortedDesigs);
          toast.success("Designations refreshed!");
          break;
        case "commissions":
          setDropdownLoading((prev) => ({ ...prev, commissions: true }));
          const comms = await DsgPayMapApi.getPayCommissions();
          setCommissions(comms);
          toast.success("Pay Commissions refreshed!");
          break;
        case "structureTypes":
          setDropdownLoading((prev) => ({ ...prev, structureTypes: true }));
          const types = await DsgPayMapApi.getPayStructureTypes();
          setStructureTypes(types);
          toast.success("Structure Types refreshed!");
          break;
        case "payrollBills":
          setDropdownLoading((prev) => ({ ...prev, payrollBills: true }));
          const bills = await DsgPayMapApi.getPayrollBills();
          setPayrollBills(bills);
          toast.success("Payroll Bills refreshed!");
          break;
      }
    } catch (error) {
      toast.error(`Failed to refresh ${type}`);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading mapping data...</p>
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
              navigate("/masters/payroll-pay-structures/desg-pay-mapping")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Designation Pay Mapping"
                : "Add New Designation Pay Mapping"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update designation pay mapping information"
                : "Create a new designation pay mapping record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Designation Pay Mapping Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Designation - Required with Search Dropdown */}
            <div ref={desgDropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => refreshDropdown("designations")}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${
                      dropdownLoading.designations ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

                {dropdownLoading.designations ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <Loader className="animate-spin h-4 w-4 text-indigo-600 mr-2" />
                    <span className="text-gray-500">
                      Loading designations...
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={desgButtonRef}
                      type="button"
                      onClick={() => setIsDesgDropdownOpen(!isDesgDropdownOpen)}
                      onKeyDown={handleDesignationKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.Dsg_id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.Dsg_id ? (
                        <span className="text-gray-900">
                          {getSelectedDesignationDisplay()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select Designation
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDesgDropdownOpen(!isDesgDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </>
                )}

                {errors.Dsg_id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Dropdown Menu */}
              {isDesgDropdownOpen && !dropdownLoading.designations && (
                <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={desgSearchRef}
                        type="text"
                        value={desgSearchTerm}
                        onChange={(e) => setDesgSearchTerm(e.target.value)}
                        onKeyDown={handleDesgSearchKeyDown}
                        placeholder="Search by title, name, description, code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
                      />
                      {desgSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setDesgSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Designations List */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredDesignations.length > 0 ? (
                      filteredDesignations.map((desig, idx) => {
                        const isSelected =
                          formData.Dsg_id == desig.Dsg_id?.toString();
                        return (
                          <button
                            key={desig.Dsg_id}
                            ref={(el) => {
                              if (el) desgItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() =>
                              handleDesignationSelect(desig.Dsg_id)
                            }
                            onKeyDown={(e) => {
                              if (e.key == "ArrowDown") {
                                e.preventDefault();
                                const nextIndex = idx + 1;
                                if (nextIndex < filteredDesignations.length) {
                                  setDesgHighlightedIndex(nextIndex);
                                }
                              } else if (e.key == "ArrowUp") {
                                e.preventDefault();
                                if (idx == 0) {
                                  setDesgHighlightedIndex(-1);
                                  setTimeout(
                                    () => desgSearchRef.current?.focus(),
                                    0,
                                  );
                                } else {
                                  setDesgHighlightedIndex(idx - 1);
                                }
                              } else if (e.key == "Enter") {
                                e.preventDefault();
                                handleDesignationSelect(desig.Dsg_id);
                              }
                            }}
                            onMouseEnter={() => setDesgHighlightedIndex(idx)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              desgHighlightedIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={desgHighlightedIndex == idx ? 0 : -1}
                          >
                            <div className="font-medium">
                              {getDesignationDisplay(desig)}
                            </div>
                            {isSelected && (
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
                        <p>No designations found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredDesignations.length} items found</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.Dsg_id && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Dsg_id}
                </p>
              )}
            </div>

            {/* Pay Commission */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Commission{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => refreshDropdown("commissions")}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${
                      dropdownLoading.commissions ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
              <select
                ref={pcSelectRef}
                name="PC_id"
                value={formData.PC_id}
                onChange={handleInputChange}
                onKeyDown={(e) => handleSelectKeyDown(e, pstSelectRef)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select Pay Commission</option>
                {commissions.map((comm) => (
                  <option key={comm.PC_Id} value={comm.PC_Id}>
                    {comm.PC_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Structure Type */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Structure Type{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => refreshDropdown("structureTypes")}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${
                      dropdownLoading.structureTypes ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
              <select
                ref={pstSelectRef}
                name="PST_id"
                value={formData.PST_id}
                onChange={handleInputChange}
                onKeyDown={(e) => handleSelectKeyDown(e, psSelectRef)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select Structure Type</option>
                {structureTypes.map((type) => (
                  <option key={type.PST_Id} value={type.PST_Id}>
                    {type.PST_Type}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Scale - Depends on Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Scale{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                ref={psSelectRef}
                name="PS_id"
                value={formData.PS_id}
                onChange={handleInputChange}
                onKeyDown={(e) => handleSelectKeyDown(e, pbSelectRef)}
                disabled={!formData.PC_id || dropdownLoading.scales}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.PC_id
                    ? "Select commission first"
                    : dropdownLoading.scales
                      ? "Loading scales..."
                      : "Select Pay Scale"}
                </option>
                {scales.map((scale) => (
                  <option key={scale.PS_Id} value={scale.PS_Id}>
                    {scale.Scl_Code} - ₹
                    {parseFloat(scale.St_Basic).toLocaleString()} to ₹
                    {parseFloat(scale.Max_Basic).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Band - Depends on Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Band{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                ref={pbSelectRef}
                name="PB_id"
                value={formData.PB_id}
                onChange={handleInputChange}
                onKeyDown={(e) => handleSelectKeyDown(e, egmSelectRef)}
                disabled={!formData.PC_id || dropdownLoading.bands}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.PC_id
                    ? "Select commission first"
                    : dropdownLoading.bands
                      ? "Loading bands..."
                      : "Select Pay Band"}
                </option>
                {bands.map((band) => (
                  <option key={band.PB_Id} value={band.PB_Id}>
                    {band.PB_Code} - ₹
                    {parseFloat(band.Min_Pay).toLocaleString()} to ₹
                    {parseFloat(band.Max_Pay).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Grade - Depends on Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Grade{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                ref={egmSelectRef}
                name="EGM_Id"
                value={formData.EGM_Id}
                onChange={handleInputChange}
                onKeyDown={(e) => handleSelectKeyDown(e, plSelectRef)}
                disabled={!formData.PC_id || dropdownLoading.grades}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.PC_id
                    ? "Select commission first"
                    : dropdownLoading.grades
                      ? "Loading grades..."
                      : "Select Pay Grade"}
                </option>
                {grades.map((grade) => (
                  <option key={grade.EGM_Id} value={grade.EGM_Id}>
                    {grade.EGM_Name} - ₹
                    {grade.pay_band
                      ? parseFloat(grade.pay_band.Min_Pay).toLocaleString()
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Level - Depends on Commission and Scale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Level{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                ref={plSelectRef}
                name="PL_Id"
                value={formData.PL_Id}
                onChange={handleInputChange}
                onKeyDown={(e) => handleSelectKeyDown(e, prbSelectRef)}
                disabled={
                  !formData.PC_id || !formData.PS_id || dropdownLoading.levels
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.PC_id
                    ? "Select commission first"
                    : !formData.PS_id
                      ? "Select scale first"
                      : dropdownLoading.levels
                        ? "Loading levels..."
                        : "Select Pay Level"}
                </option>
                {levels.map((level) => (
                  <option key={level.PL_Id} value={level.PL_Id}>
                    {level.PL_Code} - ₹
                    {parseFloat(level.St_Basic).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Payroll Bill */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Payroll Bill{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => refreshDropdown("payrollBills")}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${
                      dropdownLoading.payrollBills ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
              <select
                ref={prbSelectRef}
                name="PRB_id"
                value={formData.PRB_id}
                onChange={handleInputChange}
                onKeyDown={(e) => handleSelectKeyDown(e, saveButtonRef)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                disabled={dropdownLoading.payrollBills}
              >
                <option value="">
                  {dropdownLoading.payrollBills
                    ? "Loading payroll bills..."
                    : "Select Payroll Bill"}
                </option>
                {payrollBills.map((bill) => (
                  <option key={bill.PRB_id} value={bill.PRB_id}>
                    {bill.PayBill_Code} - {bill.Description || "No Description"}
                    {bill.ledger && ` (${bill.ledger.Lg_Name})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div></div>
          <div className="flex items-center space-x-3">
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
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Mapping" : "Create Mapping"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditDsgPayMapping;

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Check,
  CheckCircle,
  AlertCircle,
  Users,
  RefreshCw,
  Search,
  ChevronDown,
  XCircle,
  Loader,
  Briefcase,
  Calendar,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DesPostBookApi } from "../../../services/despostbookapi";

const AddEditDesPostBook = ({ user }) => {
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
  const permPostRef = useRef(null);
  const tempPostRef = useRef(null);
  const dateRef = useRef(null);
  const ageMinRef = useRef(null);
  const ageMaxRef = useRef(null);
  const renewalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    Dsg_id: "",
    Perm_Post: "",
    Temp_Post: "",
    Date: new Date().toISOString().split("T")[0], // Today's date as default
    Noc_Reg: "N",
    Excepted_Age_Min: "",
    Excepted_Age_Max: "",
    Periodic_Renewal: "99",
  });

  // Calculate total posts
  const totalPosts =
    (parseFloat(formData.Perm_Post) || 0) +
    (parseFloat(formData.Temp_Post) || 0);

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

    // Focus on Date after selection
    setTimeout(() => dateRef.current?.focus(), 100);
  };

  // =============  SELECT FIELD KEYBOARD NAVIGATION ==============
  const handleInputKeyDown = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      // Go back to previous field based on current field
      const fieldName = e.target.name;
      if (fieldName == "Date") {
        desgButtonRef.current?.focus();
      } else if (fieldName == "Perm_Post") {
        dateRef.current?.focus();
      } else if (fieldName == "Temp_Post") {
        permPostRef.current?.focus();
      }
    }
  };

  // Load designations
  useEffect(() => {
    loadDesignations();
  }, []);

  // Load entry data if in edit mode
  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadEntryData();
    }
  }, [id]);

  const loadDesignations = async () => {
    setLoadingDesignations(true);
    try {
      const data = await DesPostBookApi.getDesignations();
      const sortedData = (data || []).sort(
        (a, b) => (parseInt(a.GrStt, 10) || 1) - (parseInt(b.GrStt, 10) || 1),
      );
      setDesignations(sortedData);
      setFilteredDesignations(sortedData);
    } catch (error) {
      toast.error("Failed to load designations");
      console.error(error);
    } finally {
      setLoadingDesignations(false);
    }
  };

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const entry = await DesPostBookApi.getById(id);

      setFormData({
        Dsg_id: entry.Dsg_id?.toString() || "",
        Perm_Post: entry.Perm_Post?.toString() || "",
        Temp_Post: entry.Temp_Post?.toString() || "",
        Date: entry.Date || new Date().toISOString().split("T")[0],
        Noc_Reg: entry.Noc_Reg || "N",
        Excepted_Age_Min:
          entry.Excepted_Age_Min != null && entry.Excepted_Age_Min != ""
            ? String(entry.Excepted_Age_Min)
            : "",
        Excepted_Age_Max:
          entry.Excepted_Age_Max != null && entry.Excepted_Age_Max != ""
            ? String(entry.Excepted_Age_Max)
            : "",
        Periodic_Renewal:
          entry.Periodic_Renewal != null && entry.Periodic_Renewal != ""
            ? String(entry.Periodic_Renewal)
            : "99",
      });
    } catch (error) {
      toast.error("Failed to load entry data!");
      navigate("/masters/administrative-masters/des-post-book");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers and decimal point for numeric fields
    if (name == "Perm_Post" || name == "Temp_Post") {
      if (value == "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (
      name == "Excepted_Age_Min" ||
      name == "Excepted_Age_Max" ||
      name == "Periodic_Renewal"
    ) {
      if (value == "" || /^\d{0,2}$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
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

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (!formData.Date) {
      newErrors.Date = "Date is required";
    }
    if (!formData.Noc_Reg || !["Y", "N"].includes(formData.Noc_Reg)) {
      newErrors.Noc_Reg = "NOC-Reg is required (Y or N)";
    }
    const ageMin = formData.Excepted_Age_Min
      ? parseInt(formData.Excepted_Age_Min, 10)
      : null;
    const ageMax = formData.Excepted_Age_Max
      ? parseInt(formData.Excepted_Age_Max, 10)
      : null;
    if (ageMin != null && (ageMin < 0 || ageMin > 99)) {
      newErrors.Excepted_Age_Min = "Age min must be between 0 and 99";
    }
    if (ageMax != null && (ageMax < 0 || ageMax > 99)) {
      newErrors.Excepted_Age_Max = "Age max must be between 0 and 99";
    }
    if (ageMin != null && ageMax != null && ageMax < ageMin) {
      newErrors.Excepted_Age_Max =
        "Age max must be greater than or equal to age min";
    }
    const renewal = formData.Periodic_Renewal
      ? parseInt(formData.Periodic_Renewal, 10)
      : null;
    if (renewal == null || Number.isNaN(renewal)) {
      newErrors.Periodic_Renewal = "Periodic renewal is required";
    } else if (renewal < 1 || renewal > 99) {
      newErrors.Periodic_Renewal = "Periodic renewal must be between 1 and 99";
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
        ? "Update Designation Post Book Entry?"
        : "Create New Designation Post Book Entry?",
      text: isEditMode
        ? "Are you sure you want to update this entry?"
        : "Are you sure you want to create this entry?",
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
      const entryData = {
        Dsg_id: parseInt(formData.Dsg_id),
        Perm_Post: formData.Perm_Post ? parseFloat(formData.Perm_Post) : null,
        Temp_Post: formData.Temp_Post ? parseFloat(formData.Temp_Post) : null,
        Date: formData.Date,
        Noc_Reg: formData.Noc_Reg || "N",
        Excepted_Age_Min: formData.Excepted_Age_Min
          ? parseInt(formData.Excepted_Age_Min, 10)
          : null,
        Excepted_Age_Max: formData.Excepted_Age_Max
          ? parseInt(formData.Excepted_Age_Max, 10)
          : null,
        Periodic_Renewal: formData.Periodic_Renewal
          ? parseInt(formData.Periodic_Renewal, 10)
          : 99,
      };

      if (isEditMode) {
        await DesPostBookApi.update(id, entryData);
        toast.success("Designation Post Book entry updated successfully!");
      } else {
        await DesPostBookApi.create(entryData);
        toast.success("Designation Post Book entry created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/des-post-book");
      }, 1500);
    } catch (error) {
      console.error("Error saving entry:", error);

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
            ? "Failed to update entry. Please try again."
            : "Failed to create entry. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/administrative-masters/des-post-book");
  };

  const refreshDesignations = async () => {
    try {
      setLoadingDesignations(true);
      const data = await DesPostBookApi.getDesignations();
      const sortedData = (data || []).sort(
        (a, b) => (parseInt(a.GrStt, 10) || 1) - (parseInt(b.GrStt, 10) || 1),
      );
      setDesignations(sortedData);
      setFilteredDesignations(sortedData);
      toast.success("Designations refreshed!");
    } catch (error) {
      toast.error("Failed to refresh designations");
    } finally {
      setLoadingDesignations(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading entry data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/administrative-masters/des-post-book")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Designation Post Book Entry"
                : "Add New Designation Post Book Entry"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update designation post book information"
                : "Create a new designation post book entry"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 text-purple-600 mr-2" />
              Designation Post Book Details
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Row 1: Designation and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Designation - Required */}
              <div ref={desgDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={refreshDesignations}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <RefreshCw
                      className={`h-3 w-3 mr-1 ${
                        loadingDesignations ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

                  {loadingDesignations ? (
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
                        onClick={() =>
                          setIsDesgDropdownOpen(!isDesgDropdownOpen)
                        }
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
                        onClick={() =>
                          setIsDesgDropdownOpen(!isDesgDropdownOpen)
                        }
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
                {isDesgDropdownOpen && !loadingDesignations && (
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

              {/* Date - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  ref={dateRef}
                  type="date"
                  name="Date"
                  value={formData.Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleInputKeyDown(e, permPostRef)}
                  className={`w-full px-4 py-2.5 border ${
                    errors.Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                {errors.Date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Date}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Permanent Post, Temporary Post, Total Posts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Permanent Post */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permanent Post{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  ref={permPostRef}
                  type="text"
                  name="Perm_Post"
                  value={formData.Perm_Post}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleInputKeyDown(e, tempPostRef)}
                  className={`w-full px-4 py-2.5 border ${
                    errors.Perm_Post ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="0"
                />
                {errors.Perm_Post && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Perm_Post}
                  </p>
                )}
              </div>

              {/* Temporary Post */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Post{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  ref={tempPostRef}
                  type="text"
                  name="Temp_Post"
                  value={formData.Temp_Post}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleInputKeyDown(e, ageMinRef)}
                  className={`w-full px-4 py-2.5 border ${
                    errors.Temp_Post ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="0"
                />
                {errors.Temp_Post && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Temp_Post}
                  </p>
                )}
              </div>

              {/* Total Posts - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Posts
                </label>
                <div className="w-full px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-semibold">
                  {totalPosts.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Row 3: NOC-Reg and Periodic Renewal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NOC-Reg <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6 px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="Noc_Reg"
                      value="Y"
                      checked={formData.Noc_Reg == "Y"}
                      onChange={(e) =>
                        handleRadioChange("Noc_Reg", e.target.value)
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />{" "}
                      Yes (Y)
                    </span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="Noc_Reg"
                      value="N"
                      checked={formData.Noc_Reg == "N"}
                      onChange={(e) =>
                        handleRadioChange("Noc_Reg", e.target.value)
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" /> No (N)
                    </span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 flex items-start">
                  <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  Whether NOC (No Objection Certificate) registration is
                  required for this designation.
                </p>
                {errors.Noc_Reg && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Noc_Reg}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periodic Renewal (Years){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  ref={renewalRef}
                  type="text"
                  name="Periodic_Renewal"
                  value={formData.Periodic_Renewal}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleInputKeyDown(e, saveButtonRef)}
                  className={`w-full px-4 py-2.5 border ${
                    errors.Periodic_Renewal
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="99"
                />
                <p className="mt-1 text-xs text-gray-500 flex items-start">
                  <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  Years after which this post must be reviewed. Default 99 means
                  no periodic renewal (lifetime).
                </p>
                {errors.Periodic_Renewal && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Periodic_Renewal}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Excepted Age Min / Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excepted Age Range{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    ref={ageMinRef}
                    type="text"
                    name="Excepted_Age_Min"
                    value={formData.Excepted_Age_Min}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleInputKeyDown(e, ageMaxRef)}
                    className={`w-full px-4 py-2.5 border ${
                      errors.Excepted_Age_Min
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Min age (e.g. 18)"
                  />
                  {errors.Excepted_Age_Min && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.Excepted_Age_Min}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    ref={ageMaxRef}
                    type="text"
                    name="Excepted_Age_Max"
                    value={formData.Excepted_Age_Max}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleInputKeyDown(e, renewalRef)}
                    className={`w-full px-4 py-2.5 border ${
                      errors.Excepted_Age_Max
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Max age (e.g. 58)"
                  />
                  {errors.Excepted_Age_Max && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.Excepted_Age_Max}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 flex items-start">
                <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                Eligible age band for this designation (years). Leave blank if
                there is no age restriction. Max must be greater than or equal
                to min.
              </p>
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
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

export default AddEditDesPostBook;

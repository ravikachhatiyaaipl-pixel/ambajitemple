import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Percent,
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  X,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentalApi from "../../../services/hall-rental-api";

const AddEditHallRental = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHalls, setLoadingHalls] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Hall Rental");
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hallSearch, setHallSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs for focus management
  const hallButtonRef = useRef(null);
  const hallSearchRef = useRef(null);
  const dateRef = useRef(null);
  const fdrRef = useRef(null);
  const hdrRef = useRef(null);
  const hhrRef = useRef(null);
  const sdrRef = useRef(null);
  const clcRef = useRef(null);
  const txpRef = useRef(null);
  const abdRef = useRef(null);
  const mbdRef = useRef(null);
  const statusToggleRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  const [formData, setFormData] = useState({
    HLM_Id: "",
    HLR_Date: "",
    HLR_FDR: "",
    HLR_HDR: "",
    HLR_HHR: "",
    HLR_SDR: "",
    HLR_CLC: "",
    HLR_TXP: "",
    HLR_ABD: "",
    HLR_MBD: "",
    HLR_Status: true,
  });

  // Get Fnc_Id from menu details (optional - for future use)
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/hall-rental";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        setHallSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load halls
  useEffect(() => {
    loadHalls();
  }, []);

  // Filter halls when search changes
  useEffect(() => {
    if (!hallSearch.trim()) {
      setFilteredHalls(halls);
    } else {
      const searchLower = hallSearch.toLowerCase();
      const filtered = halls.filter(
        (hall) =>
          hall.HLM_Name.toLowerCase().includes(searchLower) ||
          (hall.HLM_Code && hall.HLM_Code.toLowerCase().includes(searchLower)),
      );
      setFilteredHalls(filtered);
    }
    setHighlightedIndex(-1);
  }, [hallSearch, halls]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && hallSearchRef.current) {
      setTimeout(() => hallSearchRef.current.focus(), 0);
    }
  }, [isDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isDropdownOpen && highlightedIndex >= 0 && listRef.current) {
      const container = listRef.current;
      const item = itemRefs.current[highlightedIndex];
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
  }, [highlightedIndex, isDropdownOpen]);

  useEffect(() => {
    if (isEditMode) loadData();
    else setTimeout(() => hallButtonRef.current?.focus(), 100);
  }, [id]);

  const loadHalls = async () => {
    setLoadingHalls(true);
    try {
      const res = await HallRentalApi.getAllHalls();
      setHalls(res?.data || []);
      setFilteredHalls(res?.data || []);
    } catch (error) {
      console.error("Error loading halls:", error);
      toast.error("Failed to load halls");
    } finally {
      setLoadingHalls(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentalApi.getById(id);
      const d = res?.data;
      setFormData({
        HLM_Id: d.HLM_Id || "",
        HLR_Date: d.HLR_Date || "",
        HLR_FDR: d.HLR_FDR || "",
        HLR_HDR: d.HLR_HDR || "",
        HLR_HHR: d.HLR_HHR || "",
        HLR_SDR: d.HLR_SDR || "",
        HLR_CLC: d.HLR_CLC || "",
        HLR_TXP: d.HLR_TXP || "",
        HLR_ABD: d.HLR_ABD || "",
        HLR_MBD: d.HLR_MBD || "",
        HLR_Status: d.HLR_Status ?? true,
      });

      if (d.HLM_Id && d.hall) {
        setHallSearch(d.hall.HLM_Name);
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rental");
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

  // Hall dropdown keyboard handlers
  const handleHallKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHallSearch("");
      setHighlightedIndex(-1);
      setTimeout(() => hallSearchRef.current?.focus(), 0);
    }
  };

  const handleHallSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredHalls.length > 0) {
        setHighlightedIndex(0);
        setTimeout(() => {
          if (itemRefs.current[0]) {
            itemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setHallSearch("");
      hallButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredHalls.length > 0 && highlightedIndex >= 0) {
        handleHallSelect(filteredHalls[highlightedIndex]);
      } else if (filteredHalls.length > 0) {
        handleHallSelect(filteredHalls[0]);
      }
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setHallSearch("");
    }
  };

  const handleHallItemKeyDown = (e, hall, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredHalls.length) {
        setHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (itemRefs.current[nextIndex]) {
            itemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setHighlightedIndex(-1);
        setTimeout(() => hallSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedIndex(-1);
        setTimeout(() => hallSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (itemRefs.current[prevIndex]) {
            itemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleHallSelect(hall);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setHallSearch("");
      hallButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setHallSearch("");
    }
  };

  const handleHallSelect = (hall) => {
    setFormData((prev) => ({
      ...prev,
      HLM_Id: hall.HLM_Id,
    }));
    setHallSearch(hall.HLM_Name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    if (errors.HLM_Id) setErrors((prev) => ({ ...prev, HLM_Id: "" }));
    setTimeout(() => dateRef.current?.focus(), 100);
  };

  const handleHallSearchChange = (e) => {
    setHallSearch(e.target.value);
    setIsDropdownOpen(true);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.HLM_Id) {
      newErrors.HLM_Id = "Please select a hall";
    }

    if (!formData.HLR_Date) {
      newErrors.HLR_Date = "Date is required";
    }

    if (!formData.HLR_ABD) {
      newErrors.HLR_ABD = "Advance booking days is required";
    } else if (isNaN(formData.HLR_ABD) || Number(formData.HLR_ABD) < 0) {
      newErrors.HLR_ABD = "Advance booking days must be a positive number";
    }

    if (!formData.HLR_MBD) {
      newErrors.HLR_MBD = "Maximum booking days is required";
    } else if (isNaN(formData.HLR_MBD) || Number(formData.HLR_MBD) < 0) {
      newErrors.HLR_MBD = "Maximum booking days must be a positive number";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
        if (firstErrorKey == "HLM_Id") {
          hallButtonRef.current?.focus();
        } else if (firstErrorKey == "HLR_Date") {
          dateRef.current?.focus();
        } else if (firstErrorKey == "HLR_ABD") {
          abdRef.current?.focus();
        } else if (firstErrorKey == "HLR_MBD") {
          mbdRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this record?"
        : "Are you sure you want to create this record?",
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
        HLM_Id: formData.HLM_Id,
        HLR_Date: formData.HLR_Date,
        HLR_FDR: formData.HLR_FDR || null,
        HLR_HDR: formData.HLR_HDR || null,
        HLR_HHR: formData.HLR_HHR || null,
        HLR_SDR: formData.HLR_SDR || null,
        HLR_CLC: formData.HLR_CLC || null,
        HLR_TXP: formData.HLR_TXP || null,
        HLR_ABD: Number(formData.HLR_ABD),
        HLR_MBD: Number(formData.HLR_MBD),
        HLR_Status: formData.HLR_Status ? 1 : 0,
      };

      if (isEditMode) {
        await HallRentalApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await HallRentalApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/hall-rental"),
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
    navigate("/masters/hall-shop-management/hall-rental");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rental data...</p>
      </div>
    );
  }

  const getSelectedHallName = () => {
    if (formData.HLM_Id) {
      const selected = halls.find(
        (h) => h.HLM_Id == parseInt(formData.HLM_Id),
      );
      return selected ? selected.HLM_Name : "";
    }
    return "";
  };

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
                ? "Update hall rental information"
                : "Create a new hall rental record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <Building className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Rental Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hall Selection */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hall <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingHalls ? (
                  <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading halls...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={hallButtonRef}
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onKeyDown={handleHallKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.HLM_Id ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.HLM_Id ? (
                        <span className="text-gray-900">
                          {getSelectedHallName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Hall</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.HLM_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Hall Dropdown Menu */}
              {isDropdownOpen && !loadingHalls && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={hallSearchRef}
                        type="text"
                        value={hallSearch}
                        onChange={handleHallSearchChange}
                        onKeyDown={handleHallSearchKeyDown}
                        placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {hallSearch && (
                        <button
                          type="button"
                          onClick={() => setHallSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={listRef} className="overflow-y-auto max-h-64">
                    {filteredHalls.length > 0 ? (
                      filteredHalls.map((hall, idx) => {
                        const isSelected = formData.HLM_Id == hall.HLM_Id;

                        return (
                          <button
                            key={hall.HLM_Id}
                            ref={(el) => {
                              itemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleHallSelect(hall)}
                            onKeyDown={(e) =>
                              handleHallItemKeyDown(e, hall, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              highlightedIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                H{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {hall.HLM_Name}
                                </div>
                              
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-600 ml-2" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No halls found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredHalls.length} halls found</span>
                      <span>Total: {halls.length} halls</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.HLM_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLM_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a hall from the list (required)
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateRef}
                  type="date"
                  name="HLR_Date"
                  value={formData.HLR_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, fdrRef)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLR_Date ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.HLR_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.HLR_Date}
                </p>
              )}
            </div>

            {/* Full Day Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Day Rent <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={fdrRef}
                  type="number"
                  step="0.01"
                  name="HLR_FDR"
                  value={formData.HLR_FDR}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, hdrRef)}
                  placeholder="Full day rent"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Half Day Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Half Day Rent <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={hdrRef}
                  type="number"
                  step="0.01"
                  name="HLR_HDR"
                  value={formData.HLR_HDR}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, hhrRef)}
                  placeholder="Half day rent"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Hourly Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rent <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={hhrRef}
                  type="number"
                  step="0.01"
                  name="HLR_HHR"
                  value={formData.HLR_HHR}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, sdrRef)}
                  placeholder="Hourly rent"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Security Deposit Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={sdrRef}
                  type="number"
                  step="0.01"
                  name="HLR_SDR"
                  value={formData.HLR_SDR}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, clcRef)}
                  placeholder="Security deposit"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Cleaning Charges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cleaning Charges <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={clcRef}
                  type="number"
                  step="0.01"
                  name="HLR_CLC"
                  value={formData.HLR_CLC}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, txpRef)}
                  placeholder="Cleaning charges"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Tax Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax % <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={txpRef}
                  type="number"
                  step="0.01"
                  name="HLR_TXP"
                  value={formData.HLR_TXP}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, abdRef)}
                  placeholder="Tax percentage"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Advance Booking Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Booking Days <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={abdRef}
                  type="number"
                  name="HLR_ABD"
                  value={formData.HLR_ABD}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, mbdRef)}
                  placeholder="Advance booking days"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLR_ABD ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.HLR_ABD && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.HLR_ABD}
                </p>
              )}
            </div>

            {/* Maximum Booking Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Booking Days <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={mbdRef}
                  type="number"
                  name="HLR_MBD"
                  value={formData.HLR_MBD}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, statusToggleRef)}
                  placeholder="Maximum booking days"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLR_MBD ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.HLR_MBD && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.HLR_MBD}
                </p>
              )}
            </div>

            {/* Status Toggle */}
            <div ref={statusToggleRef} className="flex items-center justify-between pt-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="HLR_Status"
                    checked={formData.HLR_Status}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        e.preventDefault();
                        setFormData((prev) => ({
                          ...prev,
                          HLR_Status: !prev.HLR_Status,
                        }));
                      } else if (e.key == "Tab") {
                        e.preventDefault();
                        saveButtonRef.current?.focus();
                      }
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.HLR_Status ? "bg-green-500" : "bg-gray-300"
                    } transition-colors duration-200`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                      formData.HLR_Status ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-sm font-medium">
                  {formData.HLR_Status ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Inactive
                    </span>
                  )}
                </div>
              </label>
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
                  {isEditMode ? `Update ${pageTitle}` : `Save ${pageTitle}`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallRental;
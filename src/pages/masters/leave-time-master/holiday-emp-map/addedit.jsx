import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Users,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { HolidayEmpMapApi } from "../../../services/holidayemptymapapi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AddEditHolidayEmpMapping = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // State for dropdown options
  const [holidays, setHolidays] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Search and filter states for holidays
  const [holidaySearchTerm, setHolidaySearchTerm] = useState("");
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [isHolidayDropdownOpen, setIsHolidayDropdownOpen] = useState(false);
  const holidayDropdownRef = useRef(null);

  // Search and filter states for employee types
  const [empTypeSearchTerm, setEmpTypeSearchTerm] = useState("");
  const [filteredEmployeeTypes, setFilteredEmployeeTypes] = useState([]);
  const [isEmpTypeDropdownOpen, setIsEmpTypeDropdownOpen] = useState(false);
  const empTypeDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    HL_Id: "",
    ETy_Id: "",
    HET_Status: true,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        holidayDropdownRef.current &&
        !holidayDropdownRef.current.contains(event.target)
      ) {
        setIsHolidayDropdownOpen(false);
      }
      if (
        empTypeDropdownRef.current &&
        !empTypeDropdownRef.current.contains(event.target)
      ) {
        setIsEmpTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter holidays when search term changes
  useEffect(() => {
    if (!holidaySearchTerm.trim()) {
      setFilteredHolidays(holidays);
    } else {
      const term = holidaySearchTerm.toLowerCase();
      const filtered = holidays.filter(
        (holiday) =>
          holiday.HL_Name?.toLowerCase().includes(term) ||
          holiday.HL_Code?.toLowerCase().includes(term) ||
          holiday.HL_Date?.includes(term),
      );
      setFilteredHolidays(filtered);
    }
  }, [holidaySearchTerm, holidays]);

  // Filter employee types when search term changes
  useEffect(() => {
    if (!empTypeSearchTerm.trim()) {
      setFilteredEmployeeTypes(employeeTypes);
    } else {
      const term = empTypeSearchTerm.toLowerCase();
      const filtered = employeeTypes.filter(
        (type) =>
          type.ETy_Name?.toLowerCase().includes(term) ||
          type.ETy_Code?.toLowerCase().includes(term) ||
          type.ETy_Desc?.toLowerCase().includes(term),
      );
      setFilteredEmployeeTypes(filtered);
    }
  }, [empTypeSearchTerm, employeeTypes]);

  // Fetch dropdown options (Holidays and Employee Types)
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      // Fetch holidays from /holiday/all
      const holidaysResponse = await axios.get(`${API_BASE_URL}/holiday/all`,
             {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
      );

      // Fetch employee types from /emp-type/all
      const empTypesResponse = await axios.get(`${API_BASE_URL}/emp-type/all`,
             {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
      );

      // Extract data correctly from the response
      const holidaysData = holidaysResponse.data?.data || [];
      const empTypesData = empTypesResponse.data?.data || [];

      // Filter only active holidays if needed (HL_Status = true)
      const activeHolidays = holidaysData.filter(
        (holiday) => holiday.HL_Status == true,
      );

      // Filter only active employee types if needed (Is_Active = "1")
      const activeEmpTypes = empTypesData.filter(
        (type) => type.Is_Active == "1",
      );

      setHolidays(Array.isArray(activeHolidays) ? activeHolidays : []);
      setFilteredHolidays(Array.isArray(activeHolidays) ? activeHolidays : []);

      setEmployeeTypes(Array.isArray(activeEmpTypes) ? activeEmpTypes : []);
      setFilteredEmployeeTypes(
        Array.isArray(activeEmpTypes) ? activeEmpTypes : [],
      );
    } catch (error) {
      console.error("Error fetching options:", error);
      toast.error("Failed to load holidays or employee types");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadMappingData();
    }
  }, [id]);

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const mapping = await HolidayEmpMapApi.getById(id);

      setFormData({
        HL_Id: mapping.HL_Id?.toString() || "",
        ETy_Id: mapping.ETy_Id?.toString() || "",
        HET_Status: mapping.HET_Status == true || mapping.HET_Status == 1,
      });
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/masters/leave-time-master/holiday-emp-map");
    } finally {
      setLoading(false);
    }
  };

  const handleHolidaySelect = (holidayId) => {
    setFormData((prev) => ({
      ...prev,
      HL_Id: holidayId.toString(),
    }));
    setIsHolidayDropdownOpen(false);
    setHolidaySearchTerm("");

    if (errors.HL_Id) {
      setErrors((prev) => ({ ...prev, HL_Id: "" }));
    }
  };

  const handleEmpTypeSelect = (empTypeId) => {
    setFormData((prev) => ({
      ...prev,
      ETy_Id: empTypeId.toString(),
    }));
    setIsEmpTypeDropdownOpen(false);
    setEmpTypeSearchTerm("");

    if (errors.ETy_Id) {
      setErrors((prev) => ({ ...prev, ETy_Id: "" }));
    }
  };

  const getSelectedHolidayName = () => {
    if (!formData.HL_Id) return "";
    const selected = holidays.find((h) => h.HL_Id.toString() == formData.HL_Id);
    return selected ? `${selected.HL_Name} (${selected.HL_Date})` : "";
  };

  const getSelectedEmpTypeName = () => {
    if (!formData.ETy_Id) return "";
    const selected = employeeTypes.find(
      (t) => t.ETy_Id.toString() == formData.ETy_Id,
    );
    return selected ? `${selected.ETy_Name} (${selected.ETy_Code || ""})` : "";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.HL_Id) {
      newErrors.HL_Id = "Please select a holiday";
    }
    if (!formData.ETy_Id) {
      newErrors.ETy_Id = "Please select an employee type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if mapping already exists (optional)
    if (!isEditMode) {
      try {
        const exists = await HolidayEmpMapApi.checkExists(
          formData.HL_Id,
          formData.ETy_Id,
        );
        if (exists) {
          toast.error("This holiday-employee type mapping already exists!");
          return;
        }
      } catch (error) {
        console.error("Error checking existence:", error);
      }
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Mapping?" : "Create New Mapping?",
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
      const payload = {
        HL_Id: parseInt(formData.HL_Id),
        ETy_Id: parseInt(formData.ETy_Id),
        HET_Status: formData.HET_Status ? 1 : 0,
      };

      if (isEditMode) {
        await HolidayEmpMapApi.update(id, payload);
        toast.success("Mapping updated successfully!");
      } else {
        await HolidayEmpMapApi.create(payload);
        toast.success("Mapping created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/leave-time-master/holiday-emp-map");
      }, 1500);
    } catch (error) {
      console.error("Error saving mapping:", error);

      // Handle validation errors from backend
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
            ? "Failed to update mapping."
            : "Failed to create mapping.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/leave-time-master/holiday-emp-map");
  };

  if (loading || loadingOptions) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {loading ? "Loading mapping data..." : "Loading options..."}
        </p>
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
              navigate("/masters/leave-time-master/holiday-emp-map")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Mapping" : "Add New Mapping"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update holiday employee type mapping"
                : "Create a new holiday employee type mapping"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mapping Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Mapping Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Holiday Selection with Search */}
            <div ref={holidayDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

                {/* Always show the dropdown button, even in edit mode */}
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setIsHolidayDropdownOpen(!isHolidayDropdownOpen)
                    }
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.HL_Id ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left bg-white ${
                      isEditMode ? "bg-white" : ""
                    }`}
                  >
                    {formData.HL_Id ? (
                      <span className="text-gray-900">
                        {getSelectedHolidayName()}
                      </span>
                    ) : (
                      <span className="text-gray-500">Select a holiday</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIsHolidayDropdownOpen(!isHolidayDropdownOpen)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </>

                {errors.HL_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Holiday Dropdown Menu */}
              {isHolidayDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={holidaySearchTerm}
                        onChange={(e) => setHolidaySearchTerm(e.target.value)}
                        placeholder="Search by holiday name, code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        autoFocus
                      />
                      {holidaySearchTerm && (
                        <button
                          type="button"
                          onClick={() => setHolidaySearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Holiday List */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredHolidays.length > 0 ? (
                      filteredHolidays.map((holiday) => (
                        <button
                          key={holiday.HL_Id}
                          type="button"
                          onClick={() => handleHolidaySelect(holiday.HL_Id)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                            formData.HL_Id == holiday.HL_Id.toString()
                              ? "bg-purple-50 text-purple-600"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{holiday.HL_Name}</div>
                          <div className="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>Date: {holiday.HL_Date}</span>
                            {holiday.HL_Code && (
                              <span>Code: {holiday.HL_Code}</span>
                            )}
                          </div>
                          {formData.HL_Id == holiday.HL_Id.toString() && (
                            <div className="text-xs text-purple-600 mt-1 flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No holidays found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredHolidays.length} holidays found</span>
                      <span>Total: {holidays.length} holidays</span>
                    </div>
                  </div>
                </div>
              )}

              {errors.HL_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_Id}
                </p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Holiday cannot be changed in edit mode
                </p>
              )}
            </div>

            {/* Employee Type Selection with Search */}
            <div ref={empTypeDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

                {/* Always show the dropdown button, even in edit mode */}
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setIsEmpTypeDropdownOpen(!isEmpTypeDropdownOpen)
                    }
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.ETy_Id ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left bg-white ${
                      isEditMode ? "bg-white" : ""
                    }`}
                  >
                    {formData.ETy_Id ? (
                      <span className="text-gray-900">
                        {getSelectedEmpTypeName()}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Select an employee type
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIsEmpTypeDropdownOpen(!isEmpTypeDropdownOpen)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </>

                {errors.ETy_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Employee Type Dropdown Menu - always show when open */}
              {isEmpTypeDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={empTypeSearchTerm}
                        onChange={(e) => setEmpTypeSearchTerm(e.target.value)}
                        placeholder="Search by type name, code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        autoFocus
                      />
                      {empTypeSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setEmpTypeSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Employee Type List */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredEmployeeTypes.length > 0 ? (
                      filteredEmployeeTypes.map((type) => (
                        <button
                          key={type.ETy_Id}
                          type="button"
                          onClick={() => handleEmpTypeSelect(type.ETy_Id)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                            formData.ETy_Id == type.ETy_Id.toString()
                              ? "bg-purple-50 text-purple-600"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{type.ETy_Name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {type.ETy_Code && ` • Code: ${type.ETy_Code}`}
                          </div>
                          {formData.ETy_Id == type.ETy_Id.toString() && (
                            <div className="text-xs text-purple-600 mt-1 flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No employee types found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredEmployeeTypes.length} types found</span>
                      <span>Total: {employeeTypes.length} types</span>
                    </div>
                  </div>
                </div>
              )}

              {errors.ETy_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.ETy_Id}
                </p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Employee type cannot be changed in edit mode
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="HET_Status"
                    checked={formData.HET_Status == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, HET_Status: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="HET_Status"
                    checked={formData.HET_Status == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, HET_Status: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <span className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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

export default AddEditHolidayEmpMapping;

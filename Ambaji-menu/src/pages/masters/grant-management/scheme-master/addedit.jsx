/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Hash,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  FileText,
  Check,
  AlertCircle,
  ChevronDown,
  Search,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SchemeMasterApi } from "../../../services/schememasterapi";

const AddEditScheme = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [grantTypes, setGrantTypes] = useState([]);
  const [filteredGrantTypes, setFilteredGrantTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingGrantTypes, setLoadingGrantTypes] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    Sch_Code: "",
    Sch_Name: "",
    GT_Id: "",
    St_Date: "",
    Ed_Date: "",
    Budget: "",
    Status: "ACTIVE",
    Is_Active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadGrantTypes();
    if (id && id != "create") {
      setIsEditMode(true);
      loadSchemeData();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  const loadGrantTypes = async () => {
    setLoadingGrantTypes(true);
    try {
      const response = await SchemeMasterApi.getGrantTypes();
      const data = response.data || response;
      setGrantTypes(data);
      setFilteredGrantTypes(data);
    } catch (error) {
      console.error("Error loading grant types:", error);
      toast.error("Failed to load grant types");
    } finally {
      setLoadingGrantTypes(false);
    }
  };

  const loadSchemeData = async () => {
    setLoading(true);
    try {
      const scheme = await SchemeMasterApi.getById(id);

      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        Sch_Code: scheme.Sch_Code || "",
        Sch_Name: scheme.Sch_Name || "",
        GT_Id: scheme.GT_Id ? scheme.GT_Id.toString() : "",
        St_Date: formatDateForInput(scheme.St_Date),
        Ed_Date: formatDateForInput(scheme.Ed_Date),
        Budget: scheme.Budget || "",
        Status: scheme.Status || "ACTIVE",
        Is_Active: scheme.Is_Active != undefined ? scheme.Is_Active : true,
      });
    } catch (error) {
      toast.error("Failed to load scheme data!");
      navigate("/masters/grant-management/scheme-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "Sch_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else if (name == "Budget") {
      const regex = /^\d*\.?\d*$/;
      if (value == "" || regex.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value.trim() == "") {
      setFilteredGrantTypes(grantTypes);
    } else {
      const filtered = grantTypes.filter(
        (grant) =>
          grant.GT_Code?.toLowerCase().includes(value) ||
          grant.GT_Name?.toLowerCase().includes(value) ||
          `${grant.GT_Code} - ${grant.GT_Name}`.toLowerCase().includes(value) ||
          grant.GT_Nature?.toLowerCase().includes(value) ||
          grant.grant_authority?.GA_Name?.toLowerCase().includes(value),
      );
      setFilteredGrantTypes(filtered);
    }
  };

  const handleGrantTypeSelect = (grantTypeId) => {
    setFormData((prev) => ({
      ...prev,
      GT_Id: grantTypeId.toString(),
    }));
    setIsDropdownOpen(false);
    setSearchTerm("");
    setFilteredGrantTypes(grantTypes);

    if (errors.GT_Id) {
      setErrors((prev) => ({ ...prev, GT_Id: "" }));
    }
  };

  const getSelectedGrantTypeName = () => {
    if (!formData.GT_Id) return "";
    const selectedGrant = grantTypes.find(
      (grant) => grant.GT_Id == parseInt(formData.GT_Id),
    );
    return selectedGrant
      ? `${selectedGrant.GT_Code} - ${selectedGrant.GT_Name}`
      : "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Sch_Code.trim()) {
      newErrors.Sch_Code = "Scheme code is required";
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(formData.Sch_Code)) {
      newErrors.Sch_Code =
        "Scheme code must start with uppercase letter and can only contain uppercase letters, numbers, and underscores";
    } else if (formData.Sch_Code.length > 30) {
      newErrors.Sch_Code = "Scheme code cannot exceed 30 characters";
    }

    if (!formData.Sch_Name.trim()) {
      newErrors.Sch_Name = "Scheme name is required";
    } else if (formData.Sch_Name.length > 50) {
      newErrors.Sch_Name = "Scheme name cannot exceed 50 characters";
    }

    if (formData.GT_Id) {
      const grantId = parseInt(formData.GT_Id);
      if (isNaN(grantId) || grantId <= 0) {
        newErrors.GT_Id = "Invalid grant type selection";
      }
    }

    if (formData.St_Date) {
      const startDate = new Date(formData.St_Date);
      if (isNaN(startDate.getTime())) {
        newErrors.St_Date = "Invalid start date";
      }
    }

    if (formData.Ed_Date) {
      const endDate = new Date(formData.Ed_Date);
      if (isNaN(endDate.getTime())) {
        newErrors.Ed_Date = "Invalid end date";
      } else if (formData.St_Date) {
        const startDate = new Date(formData.St_Date);
        if (endDate < startDate) {
          newErrors.Ed_Date = "End date must be after or equal to start date";
        }
      }
    }

    if (formData.Budget && formData.Budget.trim() != "") {
      const budget = parseFloat(formData.Budget);
      if (isNaN(budget)) {
        newErrors.Budget = "Budget must be a valid number";
      } else if (budget < 0) {
        newErrors.Budget = "Budget cannot be negative";
      }
    }

    if (formData.Status && formData.Status.length > 15) {
      newErrors.Status = "Status cannot exceed 15 characters";
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
      title: isEditMode ? "Update Scheme?" : "Create New Scheme?",
      text: isEditMode
        ? "Are you sure you want to update this scheme information?"
        : "Are you sure you want to create this new scheme?",
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
      const schemeData = {
        Sch_Code: formData.Sch_Code.toUpperCase(),
        Sch_Name: formData.Sch_Name.trim(),
        GT_Id: formData.GT_Id ? parseInt(formData.GT_Id) : null,
        St_Date: formData.St_Date || null,
        Ed_Date: formData.Ed_Date || null,
        Budget:
          formData.Budget && formData.Budget.trim() != ""
            ? parseFloat(formData.Budget)
            : null,
        Status: formData.Status || null,
        Is_Active: formData.Is_Active,
      };

      let response;
      if (isEditMode) {
        response = await SchemeMasterApi.update(id, schemeData);
        toast.success("Scheme updated successfully!");
      } else {
        response = await SchemeMasterApi.create(schemeData);
        toast.success("Scheme created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/grant-management/scheme-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving scheme:", error);
      toast.error(error.message || "Failed to save scheme");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/grant-management/scheme-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading scheme data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details as requested */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/grant-management/scheme-master")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Scheme" : "Add New Scheme"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update scheme master information"
                : "Create a new scheme master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Scheme Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Target className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Scheme Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Scheme Code - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Scheme Code <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Sch_Code.length > 25
                      ? formData.Sch_Code.length >= 30
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Sch_Code.length}/30 characters
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Sch_Code"
                  value={formData.Sch_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Sch_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., SMART_CITY, INFRA_001"
                  required
                  maxLength={30}
                />
                {formData.Sch_Code && !errors.Sch_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Sch_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Sch_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Sch_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Uppercase letters, numbers, and underscores only (max 30
                  characters)
                </p>
              )}
            </div>

            {/* Scheme Name - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Scheme Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Sch_Name.length > 40
                      ? formData.Sch_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Sch_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Sch_Name"
                  value={formData.Sch_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Sch_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Infrastructure Development Scheme"
                  required
                  maxLength={50}
                />
                {formData.Sch_Name && !errors.Sch_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Sch_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Sch_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Sch_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Descriptive name for the scheme (max 50 characters)
                </p>
              )}
            </div>

            {/* Grant Type Dropdown with Search - Optional */}
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grant Type{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingGrantTypes ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">
                      Loading grant types...
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.GT_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.GT_Id ? (
                        <span className="text-gray-900">
                          {getSelectedGrantTypeName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select a Grant Type (Optional)
                        </span>
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
                {errors.GT_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}

                {/* Dropdown Menu */}
                {isDropdownOpen && !loadingGrantTypes && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Search by code, name, nature, or authority..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Grant Type List */}
                    <div className="overflow-y-auto max-h-64">
                      {filteredGrantTypes.length > 0 ? (
                        filteredGrantTypes.map((grant) => (
                          <button
                            key={grant.GT_Id}
                            type="button"
                            onClick={() => handleGrantTypeSelect(grant.GT_Id)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                              formData.GT_Id == grant.GT_Id.toString()
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            <div className="font-medium">
                              {grant.GT_Code} - {grant.GT_Name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded mr-2 ${
                                  grant.GT_Nature == "Revenue"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {grant.GT_Nature || "N/A"}
                              </span>
                              <span className="text-gray-400">
                                {grant.grant_authority?.GA_Name || "N/A"}
                              </span>
                            </div>
                            {formData.GT_Id == grant.GT_Id.toString() && (
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
                          <p>No grant types found</p>
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
                          {filteredGrantTypes.length} grant types found
                        </span>
                        <span>Total: {grantTypes.length} grant types</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.GT_Id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the grant type associated with this scheme (optional)
                </p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="St_Date"
                    value={formData.St_Date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.St_Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.St_Date && (
                  <p className="mt-1 text-xs text-red-600">{errors.St_Date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="Ed_Date"
                    value={formData.Ed_Date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Ed_Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.Ed_Date && (
                  <p className="mt-1 text-xs text-red-600">{errors.Ed_Date}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (₹){" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="text"
                  name="Budget"
                  value={formData.Budget}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Budget ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 5000000"
                />
                {formData.Budget && !errors.Budget && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Budget && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Budget ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Budget}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Total allocated budget for the scheme (optional, numeric, min
                  0)
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="Status"
                  value={formData.Status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.Status ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., ACTIVE, COMPLETED, PENDING"
                  maxLength={15}
                />
                {formData.Status && !errors.Status && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Status && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Status ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Status}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Current status of the scheme (optional, max 15 characters)
                </p>
              )}
            </div>

            {/* Is_Active Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Scheme Status
                </label>
                <div className="flex items-center">
                  <label className="flex cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="Is_Active"
                        checked={formData.Is_Active}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          formData.Is_Active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          formData.Is_Active ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {formData.Is_Active ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Active schemes are available for use in the system
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Note: Scheme code must be unique across all schemes
            </p>
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Scheme" : "Create Scheme"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditScheme;

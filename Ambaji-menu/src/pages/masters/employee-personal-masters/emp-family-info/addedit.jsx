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

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Check,
  AlertCircle,
  Copy,
  Users,
  Heart,
  UserCircle,
  ChevronDown,
  Loader,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { FamilyInfoApi } from "../../../services/familyinfoapi";
import axios from "axios";

const AddEditEmpFamilyInfo = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [relationships, setRelationships] = useState([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [formData, setFormData] = useState({
    Emp_id: "",
    Member_name: "",
    Gender: "",
    Rela_Id: "",
    Dob: "",
    Phone: "",
    IsActive: 1,
  });

  // Fetch relationships from API
  useEffect(() => {
    fetchRelationships();
    fetchEmployees();
  }, []);

  const fetchRelationships = async () => {
    setLoadingRelationships(true);
    try {
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
      const response = await axios.get(`${API_BASE_URL}/relmaster/all`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      console.log("Relationships API Response:", response.data);

      if (response.data && response.data.data) {
        setRelationships(response.data.data);
      } else if (Array.isArray(response.data)) {
        setRelationships(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setRelationships([]);
      }
    } catch (error) {
      console.error("Error fetching relationships:", error);
      toast.error("Failed to load relationship data");
      setRelationships([]);
    } finally {
      setLoadingRelationships(false);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`,
            {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      console.log("Employees API Response:", response.data);

      if (response.data && response.data.status == true) {
        setEmployees(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else if (response.data && response.data.data) {
        setEmployees(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employee data");
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadFamilyInfoData();
    }
  }, [id]);

  const loadFamilyInfoData = async () => {
    setLoading(true);
    try {
      const response = await FamilyInfoApi.getById(id);
      console.log("Loaded Family Info Response:", response);

      // Check if response has success flag and data
      if (response.success && response.data) {
        const familyInfo = response.data;
        setFormData({
          Emp_id: familyInfo.Emp_id?.toString() || "",
          Member_name: familyInfo.Member_name || "",
          Gender: familyInfo.Gender || "",
          Rela_Id: familyInfo.Rela_Id?.toString() || "",
          Dob: familyInfo.Dob ? familyInfo.Dob.split("T")[0] : "",
          Phone: familyInfo.Phone || "",
          IsActive: familyInfo.Is_Active ? 1 : 0,
        });
      } else {
        toast.error("Failed to load family information data!");
        navigate("/masters/employee-personal-masters/emp-family-info");
      }
    } catch (error) {
      console.error("Error loading family info:", error);
      toast.error(error.message || "Failed to load family information data!");
      navigate("/masters/employee-personal-masters/emp-family-info");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name == "Member_name") {
      processedValue = value.replace(/[^A-Za-z\s]/g, "");
    }
    if (name == "Phone") {
      processedValue = value.replace(/[^0-9]/g, "");
      if (processedValue.length > 15) {
        processedValue = processedValue.substring(0, 15);
      }
    }
    // For Emp_id and Rela_Id, we keep the value as is from select dropdown

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee validation - REQUIRED
    if (!formData.Emp_id || formData.Emp_id.trim() == "") {
      newErrors.Emp_id = "Employee is required";
    }

    // Member name validation - REQUIRED
    if (!formData.Member_name || formData.Member_name.trim() == "") {
      newErrors.Member_name = "Member name is required";
    } else if (formData.Member_name.length > 50) {
      newErrors.Member_name = "Member name must not exceed 50 characters";
    }

    // Gender validation - Optional, but must be valid if provided
    if (
      formData.Gender &&
      !["male", "female", "other"].includes(formData.Gender)
    ) {
      newErrors.Gender = "Gender must be male, female, or other";
    }

    // Phone validation
    if (formData.Phone && formData.Phone.length > 15) {
      newErrors.Phone = "Phone number must not exceed 15 digits";
    }

    // Date of birth validation - cannot be in future
    if (formData.Dob) {
      const dobDate = new Date(formData.Dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.Dob = "Date of birth cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form first
    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    // Prepare payload
    const familyInfoData = {
      Emp_id: formData.Emp_id ? parseInt(formData.Emp_id) : null,
      Member_name: formData.Member_name.trim(),
      Gender: formData.Gender || null,
      Rela_Id: formData.Rela_Id ? parseInt(formData.Rela_Id) : null,
      Dob: formData.Dob || null,
      Phone: formData.Phone || null,
      IsActive: formData.IsActive ? 1 : 0,
    };

    console.log("Submitting Payload:", familyInfoData);

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Family Information?"
        : "Create New Family Information?",
      text: isEditMode
        ? "Are you sure you want to update this family information?"
        : "Are you sure you want to create this new family information?",
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
      let response;
      if (isEditMode) {
        response = await FamilyInfoApi.update(id, familyInfoData);
        console.log("Update Response:", response);
        toast.success("Family information updated successfully!");
      } else {
        response = await FamilyInfoApi.create(familyInfoData);
        console.log("Create Response:", response);
        toast.success("Family information created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/employee-personal-masters/emp-family-info");
      }, 1500);
    } catch (error) {
      console.error("Error saving family information:", error);
      console.error("Error Response:", error.response?.data);

      // Handle API validation errors
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors = {};

        Object.keys(apiErrors).forEach((key) => {
          newErrors[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key];
        });

        setErrors(newErrors);

        // Show first error as toast
        const firstErrorKey = Object.keys(apiErrors)[0];
        if (firstErrorKey) {
          toast.error(apiErrors[firstErrorKey][0] || apiErrors[firstErrorKey]);
        } else {
          toast.error("Please fix the validation errors");
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update family information. Please try again."
            : "Failed to create family information. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/employee-personal-masters/emp-family-info");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  // Helper function to get employee ID from different possible field names
  const getEmployeeId = (emp) => {
    return emp.Emp_id || emp.Emp_Id || emp.id;
  };

  // Helper function to get relationship ID from different possible field names
  const getRelationshipId = (rel) => {
    return rel.Rela_Id || rel.id;
  };

  // Helper function to get relationship display name
  const getRelationshipDisplay = (rel) => {
    return rel.Rela_Name || rel.name || `Relationship ${rel.Rela_Id || rel.id}`;
  };

  // Helper function to get employee display name
  const getEmployeeDisplay = (emp) => {
    const empId = getEmployeeId(emp);

    if (emp.First_Name && emp.Last_Name) {
      return `${emp.First_Name} ${emp.Last_Name} ${emp.Emp_Code ? `(${emp.Emp_Code})` : ""}`;
    }
    if (emp.First_Name) {
      return `${emp.First_Name} ${emp.Emp_Code ? `(${emp.Emp_Code})` : ""}`;
    }
    if (emp.Emp_Code) {
      return emp.Emp_Code;
    }
    return `Employee ${empId || ""}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading family information...</p>
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
              navigate("/masters/employee-personal-masters/emp-family-info")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Family Information"
                : "Add New Family Information"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update family information master record"
                : "Create a new family information master record"}
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
              Family Member Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Employee - Dropdown from API (Required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="Emp_id"
                  value={formData.Emp_id}
                  onChange={handleInputChange}
                  disabled={loadingEmployees}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Emp_id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">
                    {loadingEmployees
                      ? "Loading employees..."
                      : "Select Employee"}
                  </option>
                  {employees.map((emp) => {
                    const empId = getEmployeeId(emp);
                    // Convert both to strings for comparison
                    const empIdStr = empId?.toString();
                    const selectedEmpIdStr = formData.Emp_id?.toString();

                    return empId ? (
                      <option
                        key={empId}
                        value={empIdStr}
                        selected={empIdStr == selectedEmpIdStr}
                      >
                        {getEmployeeDisplay(emp)}
                      </option>
                    ) : null;
                  })}
                </select>
                {loadingEmployees ? (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                )}
              </div>
              {errors.Emp_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Emp_id}
                </p>
              )}
              {!loadingEmployees && employees.length == 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No employees found. Please contact administrator.
                </p>
              )}
            </div>

            {/* Member Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Member Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Member_name.length > 40
                      ? formData.Member_name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Member_name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Member_name"
                  value={formData.Member_name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Member_name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., John Doe"
                  required
                  maxLength={50}
                />
                {formData.Member_name && !errors.Member_name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Member_name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Member_name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Member_name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Full name of the family member (required, max 50 characters)
                </p>
              )}
            </div>

            {/* Gender - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Gender ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.Gender && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Gender}
                </p>
              )}
            </div>

            {/* Relationship - Dropdown from API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="Rela_Id"
                  value={formData.Rela_Id}
                  onChange={handleInputChange}
                  disabled={loadingRelationships}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Rela_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">
                    {loadingRelationships
                      ? "Loading relationships..."
                      : "Select Relationship"}
                  </option>
                  {relationships.map((rel) => {
                    const relId = getRelationshipId(rel);
                    // Convert both to strings for comparison
                    const relIdStr = relId?.toString();
                    const selectedRelIdStr = formData.Rela_Id?.toString();

                    return relId ? (
                      <option
                        key={relId}
                        value={relIdStr}
                        selected={relIdStr == selectedRelIdStr}
                      >
                        {getRelationshipDisplay(rel)}
                      </option>
                    ) : null;
                  })}
                </select>
                {loadingRelationships ? (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                )}
              </div>
              {errors.Rela_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Rela_Id}
                </p>
              )}
            </div>

            {/* Date of Birth - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="Dob"
                  value={formData.Dob}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Dob ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
              {errors.Dob && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Dob}
                </p>
              )}
            </div>

            {/* Phone - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <span
                  className={`text-xs ${
                    formData.Phone.length > 12
                      ? formData.Phone.length >= 15
                        ? "text-amber-600"
                        : "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Phone.length}/15 digits
                </span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Phone ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 1234567890"
                  maxLength={15}
                />
                {formData.Phone && !errors.Phone && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Phone && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.Phone && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Phone)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy phone number"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Phone ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Phone}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Contact phone number (max 15 digits)
                </p>
              )}
            </div>

            {/* IsActive Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="IsActive"
                    value={1}
                    checked={formData.IsActive == 1}
                    onChange={() => setFormData({ ...formData, IsActive: 1 })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="IsActive"
                    value={0}
                    checked={formData.IsActive == 0}
                    onChange={() => setFormData({ ...formData, IsActive: 0 })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
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
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
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
                  {isEditMode
                    ? "Update Family Information"
                    : "Create Family Information"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEmpFamilyInfo;

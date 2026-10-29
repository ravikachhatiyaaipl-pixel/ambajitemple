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
  Home,
  MapPin,
  Building,
  Key,
  AlertCircle,
  Check,
  Copy,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import CccsApi from "../../../services/cccsapi";

const AddEditCCC = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [wards, setWards] = useState([]);
  const [wardLoading, setWardLoading] = useState(true);
  const [codeError, setCodeError] = useState("");

  const [formData, setFormData] = useState({
    CCC_Code: "",
    CCC_Name: "",
    Wrd_Id: "",
    Is_Active: true, // UI uses boolean (true/false)
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadWards();
    if (id && id != "create") {
      setIsEditMode(true);
      loadCCCData();
    }
  }, [id]);

  const loadWards = async () => {
    setWardLoading(true);
    try {
      const response = await CccsApi.getWards();
      if (response.success) {
        const wardsData = response.data || [];

        // Filter active wards based on Is_Active field (capital I)
        const activeWards = Array.isArray(wardsData)
          ? wardsData.filter(
              (ward) => ward.Is_Active == true || ward.Is_Active == 1,
            )
          : [];
        setWards(activeWards);
      } else {
        toast.error("Failed to load wards!");
      }
    } catch (error) {
      console.error("Error loading wards:", error);
      toast.error("Failed to load wards!");
    } finally {
      setWardLoading(false);
    }
  };

  const loadCCCData = async () => {
    setLoading(true);
    try {
      const response = await CccsApi.getById(id);
      if (response.success && response.data) {
        const ccc = response.data;

        let isActiveBoolean = true;

        if (ccc.Is_Active != undefined) {
          isActiveBoolean = ccc.Is_Active == true || ccc.Is_Active == 1;
        } else if (ccc.Is_Active != undefined) {
          isActiveBoolean = ccc.Is_Active == true || ccc.Is_Active == 1;
        } else if (ccc.Is_Active != undefined) {
          isActiveBoolean = ccc.Is_Active == true || ccc.Is_Active == 1;
        }

        setFormData({
          CCC_Code: ccc.CCC_Code || "",
          CCC_Name: ccc.CCC_Name || "",
          Wrd_Id: ccc.Wrd_Id ? ccc.Wrd_Id.toString() : "",
          Is_Active: isActiveBoolean, // Store as boolean for UI
        });
      } else {
        toast.error("Failed to load CCC data!");
        navigate("/masters/organization-management/city-civic-centers-master");
      }
    } catch (error) {
      console.error("Error loading CCC data:", error);
      toast.error("Failed to load CCC data!");
      navigate("/masters/organization-management/city-civic-centers-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "CCC_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
      setCodeError("");
    } else if (name == "Is_Active") {
      // Handle checkbox toggle - store as boolean for UI
      setFormData((prev) => ({
        ...prev,
        Is_Active: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.CCC_Name.trim();
    if (!name) return [];

    const suggestions = [];

    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
      }
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      suggestions.push(word.substring(0, 2).toUpperCase() + "1");
      suggestions.push(word.substring(0, 3).toUpperCase() + "1");
    } else if (words.length >= 2) {
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);

      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
      suggestions.push(firstLetters + "1");
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.CCC_Code && formData.CCC_Code.length > 20) {
      newErrors.CCC_Code = "Maximum 20 characters allowed";
    } else if (formData.CCC_Code && !/^[A-Z0-9]+$/.test(formData.CCC_Code)) {
      newErrors.CCC_Code = "Only uppercase letters and numbers allowed";
    }

    if (!formData.CCC_Name.trim()) {
      newErrors.CCC_Name = "CCC name is required";
    } else if (formData.CCC_Name.length > 50) {
      newErrors.CCC_Name = "Maximum 50 characters allowed";
    }

    if (!formData.Wrd_Id) {
      newErrors.Wrd_Id = "Ward selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update CCC?" : "Create New CCC?",
      text: isEditMode
        ? "Are you sure you want to update this CCC?"
        : "Are you sure you want to create this new CCC?",
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
      const submitData = {
        CCC_Code: formData.CCC_Code ? formData.CCC_Code.toUpperCase() : null,
        CCC_Name: formData.CCC_Name.trim(),
        Wrd_Id: parseInt(formData.Wrd_Id),
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      let response;
      if (isEditMode) {
        response = await CccsApi.update(id, submitData);
        if (response.success) {
          toast.success("CCC updated successfully!");
        } else {
          throw new Error(response.message);
        }
      } else {
        response = await CccsApi.create(submitData);
        if (response.success) {
          toast.success("CCC created successfully!");
        } else {
          throw new Error(response.message);
        }
      }

      setTimeout(() => {
        navigate("/masters/organization-management/city-civic-centers-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving CCC:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update CCC. Please try again."
            : "Failed to create CCC. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/organization-management/city-civic-centers-master");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const suggestions = generateCodeSuggestions();
  const selectedWard = wards.find(
    (w) => w.Wrd_Id.toString() == formData.Wrd_Id,
  );

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading CCC data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details as requested */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/organization-management/city-civic-centers-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit CCC" : "Add New CCC"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update CCC information and ward assignment"
                : "Create a new Citizen Collection Center for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <Home className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* CCC Name - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  CCC Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.CCC_Name.length > 40
                      ? formData.CCC_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.CCC_Name.length}/50 characters
                </span>
              </div>
              <input
                type="text"
                name="CCC_Name"
                value={formData.CCC_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.CCC_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Central CCC, North Zone CCC, Main Collection Center"
                required
                maxLength={50}
              />
              {errors.CCC_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.CCC_Name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Descriptive name for the CCC (max 50 characters)
              </p>
            </div>

            {/* CCC Code - Optional with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  CCC Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.CCC_Code.length > 15
                        ? formData.CCC_Code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.CCC_Code.length}/20 characters
                  </span>
                  {suggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              CCC_Code: suggestion,
                            }));
                            if (errors.CCC_Code) {
                              setErrors((prev) => ({
                                ...prev,
                                CCC_Code: null,
                              }));
                            }
                          }}
                          className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="CCC_Code"
                  value={formData.CCC_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.CCC_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="C01, NC01, MCC (optional)"
                  maxLength={20}
                />
                {formData.CCC_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.CCC_Code)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.CCC_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.CCC_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Unique code in uppercase letters/numbers only (max
                  20 characters)
                </p>
              )}
            </div>

            {/* Ward Selection - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ward <span className="text-red-500">*</span>
                </label>
              </div>
              {wardLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading wards...</p>
                </div>
              ) : wards.length == 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">No wards available</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please create wards first
                  </p>
                </div>
              ) : (
                <select
                  name="Wrd_Id"
                  value={formData.Wrd_Id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Wrd_Id ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select a Ward</option>
                  {wards.map((ward) => (
                    <option key={ward.Wrd_Id} value={ward.Wrd_Id}>
                      {ward.Wrd_Name}
                      {ward.zone && ` - ${ward.zone.Zon_Name}`}
                    </option>
                  ))}
                </select>
              )}
              {errors.Wrd_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Wrd_Id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card - Matching other masters UI */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                CCC Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this CCC
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive CCCs won't be available for assignments
              </p>
            </div>
            <div className="flex">
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
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
                  {isEditMode ? "Update CCC" : "Create CCC"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditCCC;

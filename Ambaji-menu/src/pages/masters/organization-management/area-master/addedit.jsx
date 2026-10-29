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
  MapPin,
  Key,
  AlertCircle,
  Check,
  Info,
  Building,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import AreaMasterApi from "../../../services/areamasterapi";
import axios from "axios";

const AddEditArea = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [pageTitle, setPageTitle] = useState("Area Master");

  const [formData, setFormData] = useState({
    Are_Code: "",
    Are_Name: "",
    Wrd_Id: "",
    is_active: true, // UI uses boolean (true/false)
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/organization-management/area-master";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadAreaData();
    }
  }, [id]);

  const loadAreaData = async () => {
    setLoading(true);
    try {
      const response = await AreaMasterApi.getById(id);

      if (response.success && response.data) {
        const area = response.data;

        // Convert API response to UI boolean (is_active: true/false)
        let isActiveBoolean = true;

        // Check for different possible field names in response
        if (area.Is_Active != undefined) {
          // Handle boolean value (true/false) or numeric (1/0)
          isActiveBoolean = area.Is_Active == true || area.Is_Active == 1;
        } else if (area.is_active != undefined) {
          // Handle lowercase is_active
          isActiveBoolean = area.is_active == true || area.is_active == 1;
        } else if (area.active != undefined) {
          // Handle active field
          isActiveBoolean = area.active == true || area.active == 1;
        }

        setFormData({
          Are_Code: area.Are_Code || "",
          Are_Name: area.Are_Name || "",
          Wrd_Id: area.Wrd_Id ? area.Wrd_Id.toString() : "",
          is_active: isActiveBoolean, // Store as boolean for UI
        });
      } else {
        toast.error(response.message || "Failed to load area data!");
        navigate("/masters/organization-management/area-master");
      }
    } catch (error) {
      console.error("Error loading area data:", error);
      toast.error("Failed to load area data!");
      navigate("/masters/organization-management/area-master");
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async () => {
    setLoadingWards(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wards/all`,
         {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
      );

      if (response.data.success) {
        const wardsData = response.data.data || [];
        const activeWards = Array.isArray(wardsData)
          ? wardsData.filter(
              (ward) => ward.Is_Active == true || ward.Is_Active == 1,
            )
          : [];
        setWards(activeWards);
      } else {
        toast.error(response.data.message || "Failed to load wards");
        setWards([]);
      }
    } catch (error) {
      console.error("Error loading wards:", error);
      toast.error("Failed to load wards");
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "Are_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else if (name == "is_active") {
      // Handle checkbox toggle - store as boolean for UI
      setFormData((prev) => ({
        ...prev,
        is_active: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name == "Are_Code") {
      setCodeError("");
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.Are_Name.trim();
    if (!name) return [];

    const suggestions = [];

    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      suggestions.push(word.substring(0, 2).toUpperCase());
    } else if (words.length >= 2) {
      suggestions.push(
        words
          .map((w) => w.charAt(0))
          .join("")
          .toUpperCase(),
      );
      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
    }

    return Array.from(new Set(suggestions));
  };

  const validateAreaCode = async () => {
    if (!formData.Are_Code.trim()) {
      setCodeError("Area code is required");
      return false;
    }

    if (formData.Are_Code.length > 5) {
      setCodeError("Area code must not exceed 5 characters");
      return false;
    }

    if (!/^[A-Z0-9]+$/.test(formData.Are_Code)) {
      setCodeError("Area code must contain only uppercase letters and numbers");
      return false;
    }

    try {
      const response = await AreaMasterApi.getAll();

      let areas = [];
      if (response.success && Array.isArray(response.data)) {
        areas = response.data;
      }

      const exists = areas.some((area) => {
        const areaId = area.Are_Id;
        const areaCode = area.Are_Code;

        return (
          areaCode == formData.Are_Code.toUpperCase() &&
          (!isEditMode || areaId != parseInt(id))
        );
      });

      if (exists) {
        setCodeError("This area code already exists");
        return false;
      }

      setCodeError("");
      return true;
    } catch (error) {
      console.error("Error checking area code:", error);
      return true;
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.Are_Code.trim()) {
      newErrors.Are_Code = "Area code is required";
    } else if (formData.Are_Code.length > 5) {
      newErrors.Are_Code = "Area code must not exceed 5 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.Are_Code)) {
      newErrors.Are_Code =
        "Area code must contain only uppercase letters and numbers";
    }

    if (!formData.Are_Name.trim()) {
      newErrors.Are_Name = "Area name is required";
    } else if (formData.Are_Name.length > 255) {
      newErrors.Are_Name = "Area name must not exceed 255 characters";
    }

    if (!formData.Wrd_Id) {
      newErrors.Wrd_Id = "Ward selection is required";
    }

    const isCodeValid = await validateAreaCode();
    if (!isCodeValid && codeError) {
      newErrors.Are_Code = codeError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validateForm())) {
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Area?" : "Create New Area?",
      text: isEditMode
        ? "Are you sure you want to update this area?"
        : "Are you sure you want to create this new area?",
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
      // Convert UI boolean (is_active) to API payload (Is_Active: 0/1)
      const submitData = {
        Are_Code: formData.Are_Code.toUpperCase(),
        Are_Name: formData.Are_Name.trim(),
        Wrd_Id: parseInt(formData.Wrd_Id),
        Is_Active: formData.is_active ? 1 : 0, // Convert boolean to 0/1 for API
      };

      let response;
      if (isEditMode) {
        response = await AreaMasterApi.update(id, submitData);
        if (response.success) {
          toast.success("Area updated successfully!");
        } else {
          throw new Error(response.message);
        }
      } else {
        response = await AreaMasterApi.create(submitData);
        if (response.success) {
          toast.success("Area created successfully!");
        } else {
          throw new Error(response.message);
        }
      }

      setTimeout(() => {
        navigate("/masters/organization-management/area-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving area:", error);

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
          error.message ||
            (isEditMode
              ? "Failed to update area. Please try again."
              : "Failed to create area. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/organization-management/area-master");
  };

  const suggestions = generateCodeSuggestions();
  const selectedWard = wards.find(
    (w) => w.Wrd_Id.toString() == formData.Wrd_Id,
  );

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading area data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - Aligned with other masters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/organization-management/area-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update area information"
                : "Create a new geographical area"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Area Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Area Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Area Name with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Area Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Are_Name.length > 200
                      ? formData.Are_Name.length >= 255
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Are_Name.length}/255 characters
                </span>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Are_Name"
                  value={formData.Are_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.Are_Name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., Downtown Area, Suburban Area, Industrial Area"
                  required
                  maxLength={255}
                />
              </div>
              {errors.Are_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Are_Name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Descriptive name for the area (max 255 characters)
              </p>
            </div>

            {/* Area Code with Character Counter and Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Area Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Are_Code.length > 4
                        ? formData.Are_Code.length >= 5
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Are_Code.length}/5 characters
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
                              Are_Code: suggestion,
                            }));
                            if (codeError) {
                              setCodeError("");
                            }
                            if (errors.Are_Code) {
                              setErrors((prev) => ({
                                ...prev,
                                Are_Code: null,
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
                  name="Are_Code"
                  value={formData.Are_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Are_Code || codeError
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase`}
                  placeholder="e.g., AR01, DT01, IND01"
                  required
                  maxLength={5}
                />
                {formData.Are_Code && !errors.Are_Code && !codeError && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {(errors.Are_Code || codeError) && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Are_Code || codeError ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Are_Code || codeError}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code in uppercase letters and numbers only (max 5
                  characters)
                </p>
              )}
            </div>

            {/* Ward Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ward <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <select
                  name="Wrd_Id"
                  value={formData.Wrd_Id || ""}
                  onChange={handleInputChange}
                  disabled={loadingWards}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    loadingWards
                      ? "bg-gray-50 cursor-not-allowed"
                      : "border-gray-300"
                  } ${errors.Wrd_Id ? "border-red-300" : ""}`}
                  required
                >
                  <option value="">
                    {loadingWards ? "Loading wards..." : "Select Ward"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.Wrd_Id} value={ward.Wrd_Id}>
                      {ward.Wrd_Name}
                      {ward.zone && ` - ${ward.zone.Zon_Name}`}
                    </option>
                  ))}
                </select>
                {loadingWards && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
                  </div>
                )}
              </div>
              {errors.Wrd_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Wrd_Id}
                </p>
              )}
              {wards.length == 0 && !loadingWards && (
                <p className="mt-2 text-sm text-yellow-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  No active wards available. Please create a ward first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card - Matching Ward and Zone Master UI */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Area Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this area
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive areas won't be available for assignments
              </p>
            </div>
            <div className="flex">
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.is_active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.is_active ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {formData.is_active ? (
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
              disabled={saving || loadingWards || wards.length == 0}
              className={`px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center transition-all shadow-sm ${
                saving || loadingWards || wards.length == 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Area" : "Create Area"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditArea;

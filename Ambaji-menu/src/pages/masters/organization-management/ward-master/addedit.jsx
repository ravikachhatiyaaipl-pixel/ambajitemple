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
  Copy,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import WardsApi from "../../../services/wardsapi";

const AddEditWard = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [zones, setZones] = useState([]);
  const [zoneLoading, setZoneLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Ward Master");

  const [formData, setFormData] = useState({
    Wrd_Code: "",
    Wrd_Name: "",
    Zon_Id: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/organization-management/ward-master";

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
    loadZones();
    if (id && id != "create") {
      setIsEditMode(true);
      loadWardData();
    }
  }, [id]);

  const loadZones = async () => {
    setZoneLoading(true);
    try {
      const response = await WardsApi.getZones();

      if (response.success && response.data) {
        const zonesData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        setZones(zonesData);
      } else {
        toast.error("Failed to load zones!");
        setZones([]);
      }
    } catch (error) {
      console.error("Error loading zones:", error);
      toast.error("Failed to load zones!");
      setZones([]);
    } finally {
      setZoneLoading(false);
    }
  };

  const loadWardData = async () => {
    setLoading(true);
    try {
      const response = await WardsApi.getById(id);

      if (response.success && response.data) {
        const ward = response.data;

        // Convert API response to UI boolean (is_active: true/false)
        let isActiveBoolean = true;

        // Check for different possible field names in response
        if (ward.Is_Active != undefined) {
          // Handle boolean value (true/false) or numeric (1/0)
          isActiveBoolean = ward.Is_Active == true || ward.Is_Active == 1;
        } else if (ward.is_active != undefined) {
          // Handle lowercase is_active
          isActiveBoolean = ward.is_active == true || ward.is_active == 1;
        } else if (ward.active != undefined) {
          // Handle active field
          isActiveBoolean = ward.active == true || ward.active == 1;
        }

        console.log("Ward data loaded:", ward); // For debugging
        console.log("Is_Active value:", ward.Is_Active); // For debugging
        console.log("isActiveBoolean:", isActiveBoolean); // For debugging

        setFormData({
          Wrd_Code: ward.Wrd_Code || "",
          Wrd_Name: ward.Wrd_Name || "",
          Zon_Id: ward.Zon_Id || "",
          is_active: isActiveBoolean, // Store as boolean for UI
        });
      } else {
        toast.error(response.message || "Failed to load ward data!");
        navigate("/masters/organization-management/ward-master");
      }
    } catch (error) {
      console.error("Error loading ward data:", error);
      toast.error("Failed to load ward data!");
      navigate("/masters/organization-management/ward-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "Wrd_Code") {
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
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.Wrd_Name.trim();
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Wrd_Code.trim()) {
      newErrors.Wrd_Code = "Ward code is required";
    } else if (!/^[A-Z0-9]+$/.test(formData.Wrd_Code)) {
      newErrors.Wrd_Code = "Only uppercase letters and numbers allowed";
    } else if (formData.Wrd_Code.length > 5) {
      newErrors.Wrd_Code = "Maximum 5 characters allowed";
    }

    if (!formData.Wrd_Name.trim()) {
      newErrors.Wrd_Name = "Ward name is required";
    } else if (formData.Wrd_Name.length > 25) {
      newErrors.Wrd_Name = "Maximum 25 characters allowed";
    }

    if (!formData.Zon_Id) {
      newErrors.Zon_Id = "Zone selection is required";
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
      title: isEditMode ? "Update Ward?" : "Create New Ward?",
      text: isEditMode
        ? "Are you sure you want to update this ward?"
        : "Are you sure you want to create this new ward?",
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
        Wrd_Code: formData.Wrd_Code ? formData.Wrd_Code.toUpperCase() : "",
        Wrd_Name: formData.Wrd_Name.trim(),
        Zon_Id: parseInt(formData.Zon_Id),
        Is_Active: formData.is_active ? 1 : 0, // Convert boolean to 0/1 for API
      };

      let response;
      if (isEditMode) {
        response = await WardsApi.update(id, submitData);
        if (response.success) {
          toast.success("Ward updated successfully!");
        } else {
          throw new Error(response.message);
        }
      } else {
        response = await WardsApi.create(submitData);
        if (response.success) {
          toast.success("Ward created successfully!");
        } else {
          throw new Error(response.message);
        }
      }

      setTimeout(() => {
        navigate("/masters/organization-management/ward-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving ward:", error);

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
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update ward. Please try again."
            : "Failed to create ward. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/organization-management/ward-master");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const suggestions = generateCodeSuggestions();
  const selectedZone = zones.find((z) => z.Zon_Id == formData.Zon_Id);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ward data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/organization-management/ward-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update ward information and zone assignment"
                : "Create a new ward for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Ward Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ward Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Wrd_Name.length > 20
                      ? formData.Wrd_Name.length >= 25
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Wrd_Name.length}/25 characters
                </span>
              </div>
              <input
                type="text"
                name="Wrd_Name"
                value={formData.Wrd_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Wrd_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Ward One, North Ward, Central Zone Ward"
                required
                maxLength={25}
              />
              {errors.Wrd_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Wrd_Name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Descriptive name for the ward (max 25 characters)
              </p>
            </div>

            {/* Ward Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ward Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Wrd_Code.length > 4
                        ? formData.Wrd_Code.length >= 5
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Wrd_Code.length}/5 characters
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
                              Wrd_Code: suggestion,
                            }));
                            if (errors.Wrd_Code) {
                              setErrors((prev) => ({
                                ...prev,
                                Wrd_Code: null,
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
                  name="Wrd_Code"
                  value={formData.Wrd_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Wrd_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="W01, NW01, CZW"
                  required
                  maxLength={5}
                />
                {formData.Wrd_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Wrd_Code)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Wrd_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Wrd_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code in uppercase letters/numbers only (max 5
                  characters)
                </p>
              )}
            </div>

            {/* Zone Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Zone <span className="text-red-500">*</span>
                </label>
              </div>
              {zoneLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading zones...</p>
                </div>
              ) : zones.length == 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">No zones available</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please create zones first
                  </p>
                </div>
              ) : (
                <>
                  <select
                    name="Zon_Id"
                    value={formData.Zon_Id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.Zon_Id ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Select a Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.Zon_Id} value={zone.Zon_Id}>
                        {zone.Zon_Name}
                      </option>
                    ))}
                  </select>
                  {errors.Zon_Id && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.Zon_Id}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ward Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this ward
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive wards won't be available for assignment
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
                  {isEditMode ? "Update Ward" : "Create Ward"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditWard;

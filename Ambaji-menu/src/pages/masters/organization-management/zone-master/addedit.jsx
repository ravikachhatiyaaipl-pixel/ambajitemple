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
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  MapPin,
  Key,
  AlertCircle,
  Copy,
  Info,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ZoneMasterApi from "../../../services/zonemasterapi";

const AddEditZone = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [pageTitle, setPageTitle] = useState("Zone Master");

  const [formData, setFormData] = useState({
    Zon_Code: "",
    Zon_Name: "",
    Org_Id: null,
    is_active: true, // UI uses boolean (true/false)
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/organization-management/zone-master";

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
      loadZoneData();
    }
  }, [id]);

  const loadZoneData = async () => {
    setLoading(true);
    try {
      const response = await ZoneMasterApi.getById(id);
      if (response.success) {
        const zone = response.data;

        // Convert API response to UI boolean (is_active: true/false)
        let isActiveBoolean = true;

        // Check for different possible field names in response
        if (zone.Is_Active != undefined) {
          // Handle boolean value (true/false) - most common
          isActiveBoolean = zone.Is_Active == true || zone.Is_Active == 1;
        } else if (zone.is_active != undefined) {
          // Handle lowercase is_active
          isActiveBoolean = zone.is_active == true || zone.is_active == 1;
        } else if (zone.active != undefined) {
          // Handle active field
          isActiveBoolean = zone.active == true || zone.active == 1;
        }

        console.log("Zone data loaded:", zone); // For debugging
        console.log("Is_Active value:", zone.Is_Active); // For debugging
        console.log("isActiveBoolean:", isActiveBoolean); // For debugging

        setFormData({
          Zon_Code: zone.Zon_Code || "",
          Zon_Name: zone.Zon_Name || "",
          Org_Id: zone.Org_Id || null,
          is_active: isActiveBoolean, // Store as boolean for UI
        });
      } else {
        toast.error("Failed to load zone data!");
        navigate("/masters/organization-management/zone-master");
      }
    } catch (error) {
      console.error("Error loading zone data:", error);
      toast.error("Failed to load zone data!");
      navigate("/masters/organization-management/zone-master");
    } finally {
      setLoading(false);
    }
  };

  const loadOrganization = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/lst-org-master`,
         {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
      );
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const org = data.data[0];
        setOrganization(org);
        setFormData((prev) => ({
          ...prev,
          Org_Id: org.Org_Id,
        }));
      }
    } catch (error) {
      console.error("Error loading organization:", error);
      const defaultOrg = {
        Org_Id: 1,
        Org_Name: "Ambaji Mata Temple",
        Org_Code: "AMT01",
      };
      setOrganization(defaultOrg);
      setFormData((prev) => ({
        ...prev,
        Org_Id: defaultOrg.Org_Id,
      }));
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "Zon_Code") {
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.Zon_Name.trim();
    if (!name) return [];

    const suggestions = [];
    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(`Z${word.substring(0, 2).toUpperCase()}`);
      }
      if (word.length >= 3) {
        suggestions.push(`Z${word.substring(0, 3).toUpperCase()}`);
      }
    } else if (words.length >= 2) {
      suggestions.push(
        `Z${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase(),
      );
      if (words[0].length >= 2) {
        suggestions.push(`Z${words[0].substring(0, 2)}`.toUpperCase());
      }
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.Zon_Code) {
      if (!/^[A-Z0-9]+$/.test(formData.Zon_Code)) {
        newErrors.Zon_Code = "Only uppercase letters and numbers allowed";
      } else if (formData.Zon_Code.length > 5) {
        newErrors.Zon_Code = "Maximum 5 characters allowed";
      }
    }

    if (!formData.Zon_Name.trim()) {
      newErrors.Zon_Name = "Zone name is required";
    } else if (formData.Zon_Name.length > 25) {
      newErrors.Zon_Name = "Maximum 25 characters allowed";
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
      title: isEditMode ? "Update Zone?" : "Create New Zone?",
      text: isEditMode
        ? "Are you sure you want to update this zone?"
        : "Are you sure you want to create this new zone?",
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
        Zon_Code: formData.Zon_Code ? formData.Zon_Code.toUpperCase() : "",
        Zon_Name: formData.Zon_Name.trim(),
        Org_Id: formData.Org_Id,
        Is_Active: formData.is_active ? 1 : 0, // Convert boolean to 0/1 for API
      };

      let response;
      if (isEditMode) {
        response = await ZoneMasterApi.update(id, submitData);
        toast.success("Zone updated successfully!");
      } else {
        response = await ZoneMasterApi.create(submitData);
        toast.success("Zone created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/organization-management/zone-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving zone:", error);

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
            ? "Failed to update zone. Please try again."
            : "Failed to create zone. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/organization-management/zone-master");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading zone data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - Aligned with RoleMasterList and ZoneList pattern */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/organization-management/zone-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update zone information"
                : "Create a new geographical zone"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Zone Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Zone Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Zone Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Zone Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Zon_Name.length > 20
                      ? formData.Zon_Name.length >= 25
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Zon_Name.length}/25 characters
                </span>
              </div>
              <input
                type="text"
                name="Zon_Name"
                value={formData.Zon_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Zon_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., North Zone, Central Zone, South Zone"
                required
                maxLength={25}
              />
              {errors.Zon_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Zon_Name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Descriptive name for the zone (max 25 characters)
              </p>
            </div>

            {/* Zone Code - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Zone Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Zon_Code.length > 4
                        ? formData.Zon_Code.length >= 5
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Zon_Code.length}/5 characters
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
                              Zon_Code: suggestion,
                            }));
                            if (errors.Zon_Code) {
                              setErrors((prev) => ({
                                ...prev,
                                Zon_Code: null,
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
                  name="Zon_Code"
                  value={formData.Zon_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Zon_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="ZN01, ZN02, ZC01 (optional)"
                  maxLength={5}
                />
                {formData.Zon_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Zon_Code)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Zon_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Zon_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Unique code in uppercase letters and numbers only
                  (max 5 characters)
                </p>
              )}
            </div>

            {/* Hidden Organization Field - Will be sent automatically */}
            <input type="hidden" name="Org_Id" value={formData.Org_Id || ""} />
          </div>
        </div>

        {/* Status Card - Matching Ward Master UI */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Zone Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this zone
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive zones won't be available for ward assignment
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
                  {isEditMode ? "Update Zone" : "Create Zone"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditZone;

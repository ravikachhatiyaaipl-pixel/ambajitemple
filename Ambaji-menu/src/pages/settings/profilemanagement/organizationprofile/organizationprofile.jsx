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
import { useNavigate } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Building,
  Phone,
  Mail,
  Globe,
  Hash,
  FileText,
  AlertCircle,
  Key,
  Copy,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Percent,
  FileDigit,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import OrganizationApi from "../../../services/organizationapi";

const OrganizationProfile = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [pageTitle, setPageTitle] = useState("Organization Profile");
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/profile-management/organization-profile";
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

  const [formData, setFormData] = useState({
    Org_Name: "",
    Org_Code: "",
    Org_Short_Name: "",
    Org_Email: "",
    Org_Mobile: "",
    Org_Address: "",
    Org_City: "",
    Org_State: "",
    Org_Pin: "",
    Org_GST_No: "",
    Org_TDS_No: "",
    Org_PAN_No: "",
    Org_URL: "",
    Org_Logo: "",
    Is_Active: 1,
  });

  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

const loadProfileData = async () => {
  setLoading(true);
  try {
    const response = await OrganizationApi.getAll();

    if (!response) {
      console.error("Response is null or undefined");
      toast.error("Invalid response from server");
      return;
    }

    // Check if response has the expected structure
    if (response.success) {
      // The data is nested: response.data.data is the array
      const orgData = response.data?.data || [];
      
      if (orgData.length > 0) {
        const org = orgData[0];
        setProfileExists(true);
        setFormData({
          Org_Name: org.Org_Name || "",
          Org_Code: org.Org_Code || "",
          Org_Short_Name: org.Org_Short_Name || "",
          Org_Email: org.Org_Email || "",
          Org_Mobile: org.Org_Mobile || "",
          Org_Address: org.Org_Address || "",
          Org_City: org.Org_City || "",
          Org_State: org.Org_State || "",
          Org_Pin: org.Org_Pin || "",
          Org_GST_No: org.Org_GST_No || "",
          Org_TDS_No: org.Org_TDS_No || "",
          Org_PAN_No: org.Org_PAN_No || "",
          Org_URL: org.Org_URL || "",
          Org_Logo: org.Org_Logo || "",
          Is_Active: org.Is_Active != undefined ? org.Is_Active : 1,
        });

        if (org.Org_Logo) {
          setLogoPreview(org.Org_Logo);
        }
      } else {
        setProfileExists(false);
      }
    } else {
      console.error("API returned success: false", response);
      toast.error(response.message || "Failed to load organization data");
    }
  } catch (error) {
    console.error("Error in loadProfileData:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
      toast.error(`Server error: ${error.response.status}`);
    } else if (error.request) {
      console.error("No response received:", error.request);
      toast.error("No response from server. Check your connection.");
    } else {
      console.error("Error message:", error.message);
      toast.error(`Error: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  const generateOrgCode = () => {
    const name = formData.Org_Name.trim();
    if (!name) return;

    let code = "";
    const words = name.split(" ").filter((word) => word.length > 0);

    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 3) {
        code = word.substring(0, 3).toUpperCase();
      }
    } else if (words.length >= 2) {
      code = (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }

    if (code) {
      setFormData((prev) => ({ ...prev, Org_Code: code }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type == "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked ? 1 : 0,
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

    if (name == "Org_Name" && !profileExists) {
      setTimeout(() => generateOrgCode(), 100);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, JPG, PNG, WEBP)");
        return;
      }

      // Validate file size (2MB max as per backend)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setFormData((prev) => ({ ...prev, Org_Logo: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Org_Name: required|string|max:100
    if (!formData.Org_Name?.trim()) {
      newErrors.Org_Name = "Organization name is required";
    } else if (formData.Org_Name.length > 100) {
      newErrors.Org_Name = "Maximum 100 characters allowed";
    }

    // Org_Code: nullable|string|max:25
    if (formData.Org_Code && formData.Org_Code.length > 25) {
      newErrors.Org_Code = "Maximum 25 characters allowed";
    }

    // Org_Email: nullable|email|max:50
    if (formData.Org_Email) {
      if (formData.Org_Email.length > 50) {
        newErrors.Org_Email = "Maximum 50 characters allowed";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Org_Email)) {
        newErrors.Org_Email = "Invalid email format";
      }
    }

    // Org_Mobile: nullable|string|max:15
    if (formData.Org_Mobile && formData.Org_Mobile.length > 15) {
      newErrors.Org_Mobile = "Maximum 15 characters allowed";
    }

    // Org_City: nullable|string|max:50
    if (formData.Org_City && formData.Org_City.length > 50) {
      newErrors.Org_City = "Maximum 50 characters allowed";
    }

    // Org_State: nullable|string|max:50
    if (formData.Org_State && formData.Org_State.length > 50) {
      newErrors.Org_State = "Maximum 50 characters allowed";
    }

    // Org_Pin: nullable|string|max:10
    if (formData.Org_Pin && formData.Org_Pin.length > 10) {
      newErrors.Org_Pin = "Maximum 10 characters allowed";
    }

    // Org_GST_No: nullable|string|max:50
    if (formData.Org_GST_No && formData.Org_GST_No.length > 50) {
      newErrors.Org_GST_No = "Maximum 50 characters allowed";
    }

    // Org_TDS_No: nullable|string|max:50
    if (formData.Org_TDS_No && formData.Org_TDS_No.length > 50) {
      newErrors.Org_TDS_No = "Maximum 50 characters allowed";
    }

    // Org_PAN_No: nullable|string|max:50
    if (formData.Org_PAN_No && formData.Org_PAN_No.length > 50) {
      newErrors.Org_PAN_No = "Maximum 50 characters allowed";
    }

    // Org_URL: nullable|url|max:150
    if (formData.Org_URL) {
      if (formData.Org_URL.length > 150) {
        newErrors.Org_URL = "Maximum 150 characters allowed";
      } else {
        try {
          new URL(formData.Org_URL);
        } catch {
          newErrors.Org_URL =
            "Invalid URL format (must start with http:// or https://)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const actionText = profileExists ? "Update" : "Create";
    const result = await Swal.fire({
      title: `${actionText} Organization Profile?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} this organization profile?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${actionText.toLowerCase()}!`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (
          key != "Org_Logo" &&
          formData[key] != null &&
          formData[key] != undefined
        ) {
          submitData.append(key, formData[key]);
        }
      });

      // Append logo file if changed
      if (logoFile) {
        submitData.append("Org_Logo", logoFile);
      }

      let response;
      if (profileExists) {
        const existingResponse = await OrganizationApi.getAll();
        if (
          existingResponse.success &&
          existingResponse.data?.data &&
          existingResponse.data.data.length > 0
        ) {
          const existingId = existingResponse.data.data[0].Org_Id;
          response = await OrganizationApi.update(existingId, submitData);
          toast.success("Organization profile updated successfully!");
        } else {
          throw new Error("Profile not found for update");
        }
      } else {
        response = await OrganizationApi.create(submitData);
        setProfileExists(true);
        toast.success("Organization profile created successfully!");
      }

      await loadProfileData();
    } catch (error) {
      console.error("Error saving organization profile:", error);

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
          profileExists
            ? "Failed to update organization profile. Please try again."
            : "Failed to create organization profile. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const handleReload = () => {
    loadProfileData();
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading organization profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center mr-3">
              <Building className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                name="Org_Name"
                value={formData.Org_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Org_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Ambaji Temple"
                required
                maxLength={100}
              />
              {errors.Org_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_Name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Full organization name (max 100 characters)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Org_Code"
                  value={formData.Org_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Org_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="AMT, CORP, ORG01"
                  maxLength={25}
                  style={{ textTransform: "uppercase" }}
                />
                {formData.Org_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Org_Code)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Org_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code (max 25 characters)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Name
              </label>
              <input
                type="text"
                name="Org_Short_Name"
                value={formData.Org_Short_Name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AMT"
                maxLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">
                Abbreviated name (max 10 characters)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Organization logo"
                        className="h-24 w-24 rounded-lg border-2 border-gray-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Remove logo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">
                        No logo
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-colors">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPEG, JPG, PNG, WEBP only. Max 2MB
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="Org_Address"
                value={formData.Org_Address}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete address of the organization"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="Org_City"
                value={formData.Org_City}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Org_City ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Ambaji"
                maxLength={50}
              />
              {errors.Org_City && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_City}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="Org_State"
                value={formData.Org_State}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Org_State ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Gujarat"
                maxLength={50}
              />
              {errors.Org_State && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_State}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                name="Org_Pin"
                value={formData.Org_Pin}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Org_Pin ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="385110"
                maxLength={10}
              />
              {errors.Org_Pin && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_Pin}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Max 10 characters</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="Org_Email"
                  value={formData.Org_Email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Org_Email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="info@organization.com"
                  maxLength={50}
                />
              </div>
              {errors.Org_Email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_Email}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Max 50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="Org_Mobile"
                  value={formData.Org_Mobile}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Org_Mobile ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="9876543210"
                  maxLength={15}
                />
              </div>
              {errors.Org_Mobile && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_Mobile}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Max 15 characters</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  name="Org_URL"
                  value={formData.Org_URL}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Org_URL ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="https://www.organization.com"
                  maxLength={150}
                />
              </div>
              {errors.Org_URL && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_URL}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Max 150 characters</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tax & Legal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Org_GST_No"
                  value={formData.Org_GST_No}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Org_GST_No ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="27AAAAA0000A1Z5"
                  maxLength={50}
                  style={{ textTransform: "uppercase" }}
                />
                {formData.Org_GST_No && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Org_GST_No)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy GST"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Org_GST_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_GST_No}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Max 50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number
              </label>
              <div className="relative">
                <FileDigit className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Org_PAN_No"
                  value={formData.Org_PAN_No}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Org_PAN_No ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="ABCDE1234F"
                  maxLength={50}
                  style={{ textTransform: "uppercase" }}
                />
                {formData.Org_PAN_No && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Org_PAN_No)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy PAN"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Org_PAN_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_PAN_No}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Max 50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TDS Number
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Org_TDS_No"
                  value={formData.Org_TDS_No}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Org_TDS_No ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="TAN/ASD12345B"
                  maxLength={50}
                />
                {formData.Org_TDS_No && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Org_TDS_No)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy TDS"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Org_TDS_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_TDS_No}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Max 50 characters</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                  formData.Is_Active == 1
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {formData.Is_Active == 1 ? (
                  <UserCheck className="h-5 w-5" />
                ) : (
                  <UserX className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Organization Status
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.Is_Active == 1
                    ? "Organization is currently active and operational"
                    : "Organization is inactive and not in use"}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="Is_Active"
                checked={formData.Is_Active == 1}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.Is_Active == 1 ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-xs text-gray-500 mt-1">
              {profileExists
                ? `This profile is currently ${formData.Is_Active == 1 ? "active" : "inactive"} and ${formData.Is_Active == 1 ? "in use" : "not in use"}`
                : "Create your organization profile to continue"}
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
                  {profileExists ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {profileExists ? "Update Profile" : "Create Profile"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrganizationProfile;

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
  MapPin,
  Home,
  Landmark,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import BranchApi from "../../../services/branchapi";

const BranchProfile = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isNewBranch, setIsNewBranch] = useState(false);
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [pageTitle, setPageTitle] = useState("Branch Profile");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/profile-management/branch-profile";
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
    Br_Name: "",
    Br_Code: "",
    Br_GST_No: "",
    Br_TDS_No: "",
    Br_PAN_No: "",
    Br_Address: "",
    Br_City: "",
    Br_State: "",
    Br_Pin: "",
    Br_Email: "",
    Br_Mobile: "",
    Br_URL: "",
    Br_Logo: "",
    Is_Active: 1,
  });

  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId && !isNewBranch) {
      loadBranchData(selectedBranchId);
    } else if (isNewBranch) {
      resetForm();
    }
  }, [selectedBranchId, isNewBranch]);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const response = await BranchApi.getAll();

      if (!response) {
        console.error("Response is null or undefined");
        toast.error("Invalid response from server");
        return;
      }

      if (response.success) {
        // Handle both paginated and non-paginated responses
        let branchesData = [];

        if (response.data && Array.isArray(response.data)) {
          // Direct array response
          branchesData = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          // Paginated response (data.data contains the array)
          branchesData = response.data.data;
        } else if (
          response.pagination &&
          response.data &&
          Array.isArray(response.data)
        ) {
          // Alternative paginated structure
          branchesData = response.data;
        }

        setBranches(branchesData);

        if (branchesData.length > 0 && !selectedBranchId && !isNewBranch) {
          setSelectedBranchId(branchesData[0].Br_Id);
        }
      } else {
        console.error("Unexpected response structure:", response);
        toast.error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error in loadBranches:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadBranchData = async (id) => {
    setLoading(true);
    try {
      const response = await BranchApi.getById(id);

      if (!response) {
        console.error("Response is null or undefined");
        toast.error("Invalid response from server");
        return;
      }

      if (response.success && response.data) {
        const branch = response.data;
        setFormData({
          Br_Name: branch.Br_Name || "",
          Br_Code: branch.Br_Code || "",
          Br_GST_No: branch.Br_GST_No || "",
          Br_TDS_No: branch.Br_TDS_No || "",
          Br_PAN_No: branch.Br_PAN_No || "",
          Br_Address: branch.Br_Address || "",
          Br_City: branch.Br_City || "",
          Br_State: branch.Br_State || "",
          Br_Pin: branch.Br_Pin || "",
          Br_Email: branch.Br_Email || "",
          Br_Mobile: branch.Br_Mobile || "",
          Br_URL: branch.Br_URL || "",
          Br_Logo: branch.Br_Logo || "",
          Is_Active: branch.Is_Active != undefined ? branch.Is_Active : 1,
        });

        if (branch.Br_Logo) {
          setLogoPreview(branch.Br_Logo);
        } else {
          setLogoPreview(null);
        }
        setLogoFile(null);
      } else {
        console.error("Unexpected response structure:", response);
        toast.error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error in loadBranchData:", error);
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

  const resetForm = () => {
    setFormData({
      Br_Name: "",
      Br_Code: "",
      Br_GST_No: "",
      Br_TDS_No: "",
      Br_PAN_No: "",
      Br_Address: "",
      Br_City: "",
      Br_State: "",
      Br_Pin: "",
      Br_Email: "",
      Br_Mobile: "",
      Br_URL: "",
      Br_Logo: "",
      Is_Active: 1,
    });
    setLogoPreview(null);
    setLogoFile(null);
    setErrors({});
  };

  const handleNewBranch = () => {
    setIsNewBranch(true);
    setSelectedBranchId(null);
    resetForm();
    setShowBranchSelector(false);
  };

  const handleSelectBranch = (id) => {
    setSelectedBranchId(id);
    setIsNewBranch(false);
    setShowBranchSelector(false);
  };

  const generateBranchCode = () => {
    const name = formData.Br_Name.trim();
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

    // Add random number for uniqueness if needed
    if (code) {
      const randomSuffix = Math.floor(Math.random() * 1000);
      code = `${code}${randomSuffix}`;
      setFormData((prev) => ({ ...prev, Br_Code: code }));
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

    if (name == "Br_Name" && isNewBranch) {
      setTimeout(() => generateBranchCode(), 100);
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
    setFormData((prev) => ({ ...prev, Br_Logo: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Br_Name: required|string|max:100
    if (!formData.Br_Name?.trim()) {
      newErrors.Br_Name = "Branch name is required";
    } else if (formData.Br_Name.length > 100) {
      newErrors.Br_Name = "Maximum 100 characters allowed";
    }

    // Br_Code: nullable|string|max:25|unique
    if (formData.Br_Code && formData.Br_Code.length > 25) {
      newErrors.Br_Code = "Maximum 25 characters allowed";
    }

    // Br_GST_No: nullable|string|max:50|unique
    if (formData.Br_GST_No && formData.Br_GST_No.length > 50) {
      newErrors.Br_GST_No = "Maximum 50 characters allowed";
    }

    // Br_TDS_No: nullable|string|max:50
    if (formData.Br_TDS_No && formData.Br_TDS_No.length > 50) {
      newErrors.Br_TDS_No = "Maximum 50 characters allowed";
    }

    // Br_PAN_No: nullable|string|max:50|unique
    if (formData.Br_PAN_No && formData.Br_PAN_No.length > 50) {
      newErrors.Br_PAN_No = "Maximum 50 characters allowed";
    }

    // Br_Email: nullable|email|max:50
    if (formData.Br_Email) {
      if (formData.Br_Email.length > 50) {
        newErrors.Br_Email = "Maximum 50 characters allowed";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Br_Email)) {
        newErrors.Br_Email = "Invalid email format";
      }
    }

    // Br_Mobile: nullable|string|max:15
    if (formData.Br_Mobile && formData.Br_Mobile.length > 15) {
      newErrors.Br_Mobile = "Maximum 15 characters allowed";
    }

    // Br_City: nullable|string|max:50
    if (formData.Br_City && formData.Br_City.length > 50) {
      newErrors.Br_City = "Maximum 50 characters allowed";
    }

    // Br_State: nullable|string|max:50
    if (formData.Br_State && formData.Br_State.length > 50) {
      newErrors.Br_State = "Maximum 50 characters allowed";
    }

    // Br_Pin: nullable|string|max:10
    if (formData.Br_Pin && formData.Br_Pin.length > 10) {
      newErrors.Br_Pin = "Maximum 10 characters allowed";
    }

    // Br_URL: nullable|url|max:150
    if (formData.Br_URL) {
      if (formData.Br_URL.length > 150) {
        newErrors.Br_URL = "Maximum 150 characters allowed";
      } else {
        try {
          new URL(formData.Br_URL);
        } catch {
          newErrors.Br_URL =
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

    const actionText = isNewBranch ? "Create" : "Update";
    const result = await Swal.fire({
      title: `${actionText} Branch?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} this branch?`,
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
          key != "Br_Logo" &&
          formData[key] != null &&
          formData[key] != undefined
        ) {
          submitData.append(key, formData[key]);
        }
      });

      // Append logo file if changed
      if (logoFile) {
        submitData.append("Br_Logo", logoFile);
      }

      let response;
      if (!isNewBranch && selectedBranchId) {
        response = await BranchApi.update(selectedBranchId, submitData);
        toast.success("Branch updated successfully!");
      } else {
        response = await BranchApi.create(submitData);
        toast.success("Branch created successfully!");
        setIsNewBranch(false);
      }

      // Reload branches and select the updated/created branch
      await loadBranches();

      if (!isNewBranch && selectedBranchId) {
        // Stay on current branch
        await loadBranchData(selectedBranchId);
      } else if (response.data && response.data.Br_Id) {
        // Select the newly created branch
        setSelectedBranchId(response.data.Br_Id);
        await loadBranchData(response.data.Br_Id);
      }
    } catch (error) {
      console.error("Error saving branch:", error);

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
          isNewBranch
            ? "Failed to create branch. Please try again."
            : "Failed to update branch. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBranchId || isNewBranch) return;

    const result = await Swal.fire({
      title: "Delete Branch?",
      text: "Are you sure you want to delete this branch? This action can be reversed later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      await BranchApi.delete(selectedBranchId);
      toast.success("Branch deleted successfully!");

      // Reload branches
      await loadBranches();

      // Select first branch or set to new
      if (branches.length > 1) {
        const remainingBranches = branches.filter(
          (b) => b.Br_Id != selectedBranchId,
        );
        if (remainingBranches.length > 0) {
          setSelectedBranchId(remainingBranches[0].Br_Id);
        } else {
          handleNewBranch();
        }
      } else {
        handleNewBranch();
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast.error("Failed to delete branch. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleReload = () => {
    if (selectedBranchId && !isNewBranch) {
      loadBranchData(selectedBranchId);
    } else {
      loadBranches();
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  // Get current branch name for display
  const getCurrentBranchName = () => {
    if (isNewBranch) return "New Branch";
    const branch = branches.find((b) => b.Br_Id == selectedBranchId);
    return branch ? branch.Br_Name : "Select Branch";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading branch profile...</p>
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

      {/* Branch Selector */}
      {/* <div className="mb-6 bg-white rounded-xl shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <Landmark className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Current Branch:</span>
                        <div className="relative ml-2">
                            <button
                                type="button"
                                onClick={() => setShowBranchSelector(!showBranchSelector)}
                                className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {getCurrentBranchName()}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </button>

                            {showBranchSelector && (
                                <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <div className="p-2">
                                        <button
                                            onClick={handleNewBranch}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center"
                                        >
                                            <Plus className="h-4 w-4 mr-2 text-green-500" />
                                            Add New Branch
                                        </button>
                                        <div className="border-t my-2"></div>
                                        {branches.map((branch) => (
                                            <button
                                                key={branch.Br_Id}
                                                onClick={() => handleSelectBranch(branch.Br_Id)}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center ${selectedBranchId ==  branch.Br_Id
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <Building className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="truncate">{branch.Br_Name}</span>
                                                {branch.Br_Code && (
                                                    <span className="ml-2 text-xs text-gray-500">({branch.Br_Code})</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isNewBranch && selectedBranchId && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={saving}
                            className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Branch
                        </button>
                    )}
                </div>
            </div> */}

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
                Branch Name *
              </label>
              <input
                type="text"
                name="Br_Name"
                value={formData.Br_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Br_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Ambaji Branch"
                required
                maxLength={100}
              />
              {errors.Br_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_Name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Full branch name (max 100 characters)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Br_Code"
                  value={formData.Br_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Br_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="AMT001, CORP01"
                  maxLength={25}
                  style={{ textTransform: "uppercase" }}
                />
                {formData.Br_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Br_Code)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Br_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code (max 25 characters)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Branch logo"
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
                name="Br_Address"
                value={formData.Br_Address}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete address of the branch"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="Br_City"
                value={formData.Br_City}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Br_City ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Ambaji"
                maxLength={50}
              />
              {errors.Br_City && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_City}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="Br_State"
                value={formData.Br_State}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Br_State ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Gujarat"
                maxLength={50}
              />
              {errors.Br_State && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_State}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                name="Br_Pin"
                value={formData.Br_Pin}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Br_Pin ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="385110"
                maxLength={10}
              />
              {errors.Br_Pin && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_Pin}
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
                  name="Br_Email"
                  value={formData.Br_Email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Br_Email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="branch@organization.com"
                  maxLength={50}
                />
              </div>
              {errors.Br_Email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_Email}
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
                  name="Br_Mobile"
                  value={formData.Br_Mobile}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Br_Mobile ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="9876543210"
                  maxLength={15}
                />
              </div>
              {errors.Br_Mobile && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_Mobile}
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
                  name="Br_URL"
                  value={formData.Br_URL}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Br_URL ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="https://www.branch.com"
                  maxLength={150}
                />
              </div>
              {errors.Br_URL && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_URL}
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
                  name="Br_GST_No"
                  value={formData.Br_GST_No}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Br_GST_No ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="27AAAAA0000A1Z5"
                  maxLength={50}
                  style={{ textTransform: "uppercase" }}
                />
                {formData.Br_GST_No && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Br_GST_No)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy GST"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Br_GST_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_GST_No}
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
                  name="Br_PAN_No"
                  value={formData.Br_PAN_No}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.Br_PAN_No ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="ABCDE1234F"
                  maxLength={50}
                  style={{ textTransform: "uppercase" }}
                />
                {formData.Br_PAN_No && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Br_PAN_No)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy PAN"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Br_PAN_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_PAN_No}
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
                  name="Br_TDS_No"
                  value={formData.Br_TDS_No}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Br_TDS_No ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="TAN/ASD12345B"
                  maxLength={50}
                />
                {formData.Br_TDS_No && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Br_TDS_No)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy TDS"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Br_TDS_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Br_TDS_No}
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
                <h3 className="font-medium text-gray-900">Branch Status</h3>
                <p className="text-sm text-gray-600">
                  {formData.Is_Active == 1
                    ? "Branch is currently active and operational"
                    : "Branch is inactive and not in use"}
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
              {isNewBranch
                ? "Create a new branch profile"
                : `This branch is currently ${formData.Is_Active == 1 ? "active" : "inactive"}`}
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
                  {isNewBranch ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNewBranch ? "Create Branch" : "Update Branch"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BranchProfile;

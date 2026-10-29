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
  User,
  Mail,
  Phone,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  RefreshCw,
  Calendar,
  Lock,
  Smartphone,
  AtSign,
  Copy,
  Globe,
  MapPin,
  CreditCard,
  Users,
  Home,
  FileText,
  Percent,
  Fingerprint,
  Cake,
  Heart,
  UserCog,
  Banknote,
  Landmark,
  PhoneCall,
  Map,
  Building2,
  Languages,
  UsersRound,
  UserCircle,
  UserRoundCog,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    First_Name: "",
    Last_Name: "",
    Phone: "",
    Email_Id: "",
    Alt_Phone: "",
    Emp_Add1: "",
    Emp_Add2: "",
    Emp_Add3: "",
    Birth_Date: "",
    Bank_AcNo: "",
    Bank_Name: "",
    Bank_Br_Name: "",
    BkAc_Type: "",
    UID_AdharNo: "",
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast.error("Authentication token not found");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (response.data.status) {
        const data = response.data.data;
        setProfileData(data);

        setFormData((prev) => ({
          ...prev,
          First_Name: data.First_Name || "",
          Last_Name: data.Last_Name || "",
          Phone: data.Phone || "",
          Email_Id: data.Email_Id || "",
          Alt_Phone: data.Alt_Phone || "",
          Emp_Add1: data.Emp_Add1 || "",
          Emp_Add2: data.Emp_Add2 || "",
          Emp_Add3: data.Emp_Add3 || "",
          Birth_Date: data.Birth_Date ? data.Birth_Date.split("T")[0] : "",
          Bank_AcNo: data.Bank_AcNo || "",
          Bank_Name: data.Bank_Name || "",
          Bank_Br_Name: data.Bank_Br_Name || "",
          BkAc_Type: data.BkAc_Type || "",
          UID_AdharNo: data.UID_AdharNo || "",
        }));
      } else {
        toast.error(response.data.message || "Failed to load employee profile");
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error);

      if (error.response?.status == 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        console.log("employee not foud");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.First_Name && formData.First_Name.length > 50) {
      newErrors.First_Name = `Maximum 50 characters allowed (${formData.First_Name.length}/50)`;
    }

    if (formData.Last_Name && formData.Last_Name.length > 50) {
      newErrors.Last_Name = `Maximum 50 characters allowed (${formData.Last_Name.length}/50)`;
    }

    if (formData.Phone && formData.Phone.length > 15) {
      newErrors.Phone = `Maximum 15 characters allowed (${formData.Phone.length}/15)`;
    }

    if (formData.Email_Id) {
      if (formData.Email_Id.length > 100) {
        newErrors.Email_Id = `Maximum 100 characters allowed (${formData.Email_Id.length}/100)`;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email_Id)) {
        newErrors.Email_Id = "Invalid email format";
      }
    }

    if (formData.Alt_Phone && formData.Alt_Phone.length > 15) {
      newErrors.Alt_Phone = `Maximum 15 characters allowed (${formData.Alt_Phone.length}/15)`;
    }

    if (formData.Emp_Add1 && formData.Emp_Add1.length > 255) {
      newErrors.Emp_Add1 = `Maximum 255 characters allowed (${formData.Emp_Add1.length}/255)`;
    }

    if (formData.Emp_Add2 && formData.Emp_Add2.length > 255) {
      newErrors.Emp_Add2 = `Maximum 255 characters allowed (${formData.Emp_Add2.length}/255)`;
    }

    if (formData.Emp_Add3 && formData.Emp_Add3.length > 255) {
      newErrors.Emp_Add3 = `Maximum 255 characters allowed (${formData.Emp_Add3.length}/255)`;
    }

    if (formData.Birth_Date && isNaN(new Date(formData.Birth_Date).getTime())) {
      newErrors.Birth_Date = "Invalid date format";
    }

    if (formData.Bank_AcNo && formData.Bank_AcNo.length > 50) {
      newErrors.Bank_AcNo = `Maximum 50 characters allowed (${formData.Bank_AcNo.length}/50)`;
    }

    if (formData.Bank_Name && formData.Bank_Name.length > 100) {
      newErrors.Bank_Name = `Maximum 100 characters allowed (${formData.Bank_Name.length}/100)`;
    }

    if (formData.Bank_Br_Name && formData.Bank_Br_Name.length > 100) {
      newErrors.Bank_Br_Name = `Maximum 100 characters allowed (${formData.Bank_Br_Name.length}/100)`;
    }

    if (formData.BkAc_Type && formData.BkAc_Type.length > 20) {
      newErrors.BkAc_Type = `Maximum 20 characters allowed (${formData.BkAc_Type.length}/20)`;
    }

    if (formData.UID_AdharNo && formData.UID_AdharNo.length > 20) {
      newErrors.UID_AdharNo = `Maximum 20 characters allowed (${formData.UID_AdharNo.length}/20)`;
    } else if (formData.UID_AdharNo && !/^\d{12}$/.test(formData.UID_AdharNo)) {
      newErrors.UID_AdharNo = "Aadhar number must be 12 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: "Update Employee Profile?",
      text: "Are you sure you want to update your employee information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E53935",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/employee/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.data.status) {
        toast.success("Employee profile updated successfully!");
        setEditMode(false);
        await fetchEmployeeProfile();
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating employee profile:", error);

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
      } else if (error.response?.status == 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        First_Name: profileData.First_Name || "",
        Last_Name: profileData.Last_Name || "",
        Phone: profileData.Phone || "",
        Email_Id: profileData.Email_Id || "",
        Alt_Phone: profileData.Alt_Phone || "",
        Emp_Add1: profileData.Emp_Add1 || "",
        Emp_Add2: profileData.Emp_Add2 || "",
        Emp_Add3: profileData.Emp_Add3 || "",
        Birth_Date: profileData.Birth_Date
          ? profileData.Birth_Date.split("T")[0]
          : "",
        Bank_AcNo: profileData.Bank_AcNo || "",
        Bank_Name: profileData.Bank_Name || "",
        Bank_Br_Name: profileData.Bank_Br_Name || "",
        BkAc_Type: profileData.BkAc_Type || "",
        UID_AdharNo: profileData.UID_AdharNo || "",
      });
    }
    setErrors({});
    setEditMode(false);
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLanguagesDisplay = (languages) => {
    if (!languages || languages.length == 0) return "None";
    return languages.map((lang) => lang.Elg_Name).join(", ");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center   p-6 rounded-lg">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-yellow-700">No employee profile found.</p>
      </div>
    );
  }

  const {
    user,
    department,
    caste,
    quota,
    category,
    languages,
    personal_profile,
  } = profileData;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Employee Profile
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your employee information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchEmployeeProfile}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Profile Header Card - Matching Layout gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/50">
              <span className="text-3xl font-bold text-white">
                {profileData.First_Name?.charAt(0)?.toUpperCase() || "E"}
                {profileData.Last_Name?.charAt(0)?.toUpperCase() || ""}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profileData.First_Name} {profileData.Last_Name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center transition-colors shadow-md"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center transition-colors backdrop-blur border border-white/30"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs - Using indigo color scheme */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("personal")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "personal"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "contact"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Contact & Address
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "bank"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Landmark className="h-4 w-4 inline mr-2" />
            Bank Details
          </button>
          <button
            onClick={() => setActiveTab("additional")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "additional"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Additional Info
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details Tab */}
            {activeTab == "personal" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="First_Name"
                          value={formData.First_Name}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.First_Name
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter first name"
                          maxLength={50}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.First_Name || "—"}
                        </div>
                      )}
                    </div>
                    {errors.First_Name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.First_Name}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 50 characters
                    </p>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Last_Name"
                          value={formData.Last_Name}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Last_Name
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter last name"
                          maxLength={50}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Last_Name || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Last_Name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Last_Name}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 50 characters
                    </p>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="date"
                          name="Birth_Date"
                          value={formData.Birth_Date}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Birth_Date
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {formatDate(profileData.Birth_Date)}
                        </div>
                      )}
                    </div>
                    {errors.Birth_Date && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Birth_Date}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                        {profileData.F_M || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Aadhar Number */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="UID_AdharNo"
                          value={formData.UID_AdharNo}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.UID_AdharNo
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter Aadhar number"
                          maxLength={20}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.UID_AdharNo ? (
                            <div className="flex items-center justify-between">
                              <span>{profileData.UID_AdharNo}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyToClipboard(profileData.UID_AdharNo)
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </div>
                      )}
                    </div>
                    {errors.UID_AdharNo && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.UID_AdharNo}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      12 digits required
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Address Tab */}
            {activeTab == "contact" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="tel"
                          name="Phone"
                          value={formData.Phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Phone ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="Enter phone number"
                          maxLength={15}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Phone || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Phone}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 15 characters
                    </p>
                  </div>

                  {/* Alternate Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Phone
                    </label>
                    <div className="relative">
                      <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="tel"
                          name="Alt_Phone"
                          value={formData.Alt_Phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Alt_Phone
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter alternate phone"
                          maxLength={15}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Alt_Phone || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Alt_Phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Alt_Phone}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 15 characters
                    </p>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="email"
                          name="Email_Id"
                          value={formData.Email_Id}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Email_Id
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter email address"
                          maxLength={100}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Email_Id || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Email_Id && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Email_Id}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 100 characters
                    </p>
                  </div>

                  {/* Address Line 1 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Emp_Add1"
                          value={formData.Emp_Add1}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Emp_Add1
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter address line 1"
                          maxLength={255}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Emp_Add1 || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Emp_Add1 && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Emp_Add1}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Emp_Add2"
                          value={formData.Emp_Add2}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Emp_Add2
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter address line 2"
                          maxLength={255}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Emp_Add2 || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Emp_Add2 && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Emp_Add2}
                      </p>
                    )}
                  </div>

                  {/* Address Line 3 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 3
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Emp_Add3"
                          value={formData.Emp_Add3}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Emp_Add3
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter address line 3"
                          maxLength={255}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Emp_Add3 || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Emp_Add3 && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Emp_Add3}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details Tab */}
            {activeTab == "bank" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Landmark className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bank Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Bank_AcNo"
                          value={formData.Bank_AcNo}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Bank_AcNo
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter account number"
                          maxLength={50}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Bank_AcNo ? (
                            <div className="flex items-center justify-between">
                              <span>{profileData.Bank_AcNo}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyToClipboard(profileData.Bank_AcNo)
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </div>
                      )}
                    </div>
                    {errors.Bank_AcNo && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Bank_AcNo}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 50 characters
                    </p>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Bank_Name"
                          value={formData.Bank_Name}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Bank_Name
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter bank name"
                          maxLength={100}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Bank_Name || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Bank_Name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Bank_Name}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 100 characters
                    </p>
                  </div>

                  {/* Bank Branch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Bank_Br_Name"
                          value={formData.Bank_Br_Name}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Bank_Br_Name
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter branch name"
                          maxLength={100}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.Bank_Br_Name || "—"}
                        </div>
                      )}
                    </div>
                    {errors.Bank_Br_Name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Bank_Br_Name}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 100 characters
                    </p>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="BkAc_Type"
                          value={formData.BkAc_Type}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.BkAc_Type
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="e.g., Savings, Current"
                          maxLength={20}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {profileData.BkAc_Type || "—"}
                        </div>
                      )}
                    </div>
                    {errors.BkAc_Type && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.BkAc_Type}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 20 characters
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Tab */}
            {activeTab == "additional" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Additional Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Languages Known */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Languages Known
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                        {getLanguagesDisplay(languages)}
                      </div>
                    </div>
                  </div>

                  {/* Employee Category */}
                  {category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Category
                      </label>
                      <div className="relative">
                        <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {category.ECt_Name} ({category.ECt_Code})
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Designation */}
                  {personal_profile?.designation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <div className="relative">
                        <UserRoundCog className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {personal_profile.designation.Dsg_Desc}
                          {personal_profile.designation.Dsg_Title && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({personal_profile.designation.Dsg_Title})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Join Date */}
                  {personal_profile?.Join_Date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Joining
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {formatDate(personal_profile.Join_Date)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - Only show in edit mode */}
            {editMode && (
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - View Only Information */}
          <div className="space-y-6">
            {/* User Account Card */}
            {user && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    User Account
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Username
                    </label>
                    <div className="flex items-center">
                      <AtSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {user.Usr_Name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Email
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        {user.Usr_Email}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Mobile
                    </label>
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        {user.Usr_Mobile}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Department Information Card */}
            {department && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Building className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Department Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Department (Gujarati)
                    </label>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {department.Dpt_Desc}
                      </span>
                    </div>
                  </div>
                  {department.Dpt_Name && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Department (English)
                      </label>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          {department.Dpt_Name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Caste, Quota, Category Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Caste & Quota
                </h3>
              </div>

              <div className="space-y-4">
                {caste && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Caste
                    </label>
                    <div className="flex items-center">
                      <UsersRound className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {caste.caste_name}
                      </span>
                    </div>
                  </div>
                )}

                {quota && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Quota
                    </label>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        {quota.Qut_Name} ({quota.Qut_Code})
                      </span>
                      {quota.Percentage && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                          {quota.Percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status Card */}
            {user && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Status
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    {user.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>

                  {user.is_locked && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lock Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Last updated: {formatDateTime(profileData.updated_at)}
        </p>
      </div>
    </div>
  );
};

export default EmployeeProfile;

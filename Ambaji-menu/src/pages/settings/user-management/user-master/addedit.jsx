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
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Key,
  Building,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import UserMasterApi from "../../../services/usermasterapi";
import axios from "axios";

const AddEditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
 
  const [pageTitle, setPageTitle] = useState("User Management");

  // Role dropdown states
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roleHighlightedIndex, setRoleHighlightedIndex] = useState(-1);
  const roleDropdownRef = useRef(null);
  const roleSearchInputRef = useRef(null);
  const roleItemRefs = useRef([]);
  const roleListRef = useRef(null);

  // Refs for focus management
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const roleButtonRef = useRef(null);
  
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/user-management/user-master";
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
    Usr_Name: "",
    Usr_Email: "",
    Usr_Mobile: "",
    Usr_Pas: "",
    Usr_Pas_confirmation: "",
    Usr_Role_Id: "",
  });

  const [errors, setErrors] = useState({});

  // Load roles and departments
  useEffect(() => {
    loadRoles();
   

    if (id && id != "create") {
      setIsEditMode(true);
      loadUserData();
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setIsRoleDropdownOpen(false);
        setRoleSearchTerm("");
        setRoleHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // Focus on first field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => usernameRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  

  useEffect(() => {
    if (isRoleDropdownOpen && roleSearchInputRef.current) {
      setTimeout(() => roleSearchInputRef.current.focus(), 0);
    }
  }, [isRoleDropdownOpen]);

  

  // Scroll highlighted item into view for Role
  useEffect(() => {
    if (
      isRoleDropdownOpen &&
      roleHighlightedIndex >= 0 &&
      roleListRef.current
    ) {
      const container = roleListRef.current;
      const item = roleItemRefs.current[roleHighlightedIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [roleHighlightedIndex, isRoleDropdownOpen]);

  

 

  
  

  

  const loadRoles = async () => {
    try {
      const response = await UserMasterApi.getAllRoles();
      if (response.success) {
        const sortedRoles = (response.data || [])
          .filter((role) => role.Role_Id != 1) // Exclude Admin
          .sort((a, b) => {
            if (a.Role_Prefix < b.Role_Prefix) return -1;
            if (a.Role_Prefix > b.Role_Prefix) return 1;
            return (a.Role_Name || "").localeCompare(b.Role_Name || "");
          });
        setRoles(sortedRoles);
        setFilteredRoles(sortedRoles);
      }
    } catch (error) {
      console.error("Failed to load roles:", error);
      toast.error("Failed to load roles. Please try again.");
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await UserMasterApi.getById(id);
      if (response.success) {
        const userData = response.data;

        setFormData({
          Usr_Name: userData.Usr_Name || "",
          Usr_Email: userData.Usr_Email || "",
          Usr_Mobile: userData.Usr_Mobile || "",
          Usr_Pas: "",
          Usr_Pas_confirmation: "",
          Usr_Role_Id: userData.Usr_Role_Id?.toString() || "",
        });
      } else {
        toast.error("Failed to load user data!");
        navigate("/settings/user-management/user-master");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data!");
      navigate("/settings/user-management/user-master");
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
    if (name == "Usr_Pas" && errors.Usr_Pas_confirmation) {
      setErrors((prev) => ({ ...prev, Usr_Pas_confirmation: null }));
    }
  };

  
  // Role keyboard handlers
  const handleRoleKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsRoleDropdownOpen(true);
      setRoleSearchTerm("");
      setRoleHighlightedIndex(-1);
      setTimeout(() => roleSearchInputRef.current?.focus(), 0);
    }
  };

  const handleRoleSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredRoles.length > 0) {
        setRoleHighlightedIndex(0);
        setTimeout(() => {
          if (roleItemRefs.current[0]) {
            roleItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsRoleDropdownOpen(false);
      setRoleHighlightedIndex(-1);
      setRoleSearchTerm("");
      roleButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredRoles.length > 0 && roleHighlightedIndex >= 0) {
        handleRoleSelect(filteredRoles[roleHighlightedIndex]);
      } else if (filteredRoles.length > 0) {
        handleRoleSelect(filteredRoles[0]);
      }
    }
  };

  const handleRoleItemKeyDown = (e, role, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredRoles.length) {
        setRoleHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (roleItemRefs.current[nextIndex]) {
            roleItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setRoleHighlightedIndex(-1);
        setTimeout(() => roleSearchInputRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setRoleHighlightedIndex(-1);
        setTimeout(() => roleSearchInputRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setRoleHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (roleItemRefs.current[prevIndex]) {
            roleItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleRoleSelect(role);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsRoleDropdownOpen(false);
      setRoleHighlightedIndex(-1);
      setRoleSearchTerm("");
      roleButtonRef.current?.focus();
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      Usr_Role_Id: role.Role_Id.toString(),
    }));
    setIsRoleDropdownOpen(false);
    setRoleSearchTerm("");
    setRoleHighlightedIndex(-1);

    if (errors.Usr_Role_Id) {
      setErrors((prev) => ({ ...prev, Usr_Role_Id: null }));
    }

    
  };

 

  const handleRoleSearchChange = (e) => {
    const term = e.target.value;
    setRoleSearchTerm(term);
    if (term.trim()) {
      const filtered = roles.filter(
        (role) =>
          (role.Role_Name?.toLowerCase() || "").includes(term.toLowerCase()) ||
          (role.Role_Prefix?.toLowerCase() || "").includes(
            term.toLowerCase(),
          ) ||
          (role.Full_Role?.toLowerCase() || "").includes(term.toLowerCase()),
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
    setRoleHighlightedIndex(-1);
  };

  

  const clearRoleSearch = () => {
    setRoleSearchTerm("");
    setFilteredRoles(roles);
    setRoleHighlightedIndex(-1);
    if (roleSearchInputRef.current) {
      roleSearchInputRef.current.focus();
    }
  };

  // General keyboard navigation for Enter key
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Usr_Name?.trim()) {
      newErrors.Usr_Name = "Username is required";
    } else if (formData.Usr_Name.length > 50) {
      newErrors.Usr_Name = `Maximum 50 characters allowed (${formData.Usr_Name.length}/50)`;
    }

    if (!formData.Usr_Email?.trim()) {
      newErrors.Usr_Email = "Email address is required";
    } else if (formData.Usr_Email.length > 50) {
      newErrors.Usr_Email = `Maximum 50 characters allowed (${formData.Usr_Email.length}/50)`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Usr_Email)) {
      newErrors.Usr_Email = "Invalid email format";
    }

    if (!formData.Usr_Mobile?.trim()) {
      newErrors.Usr_Mobile = "Mobile number is required";
    } else if (formData.Usr_Mobile.length > 15) {
      newErrors.Usr_Mobile = `Maximum 15 characters allowed (${formData.Usr_Mobile.length}/15)`;
    }

    if (!isEditMode) {
      if (!formData.Usr_Pas?.trim()) {
        newErrors.Usr_Pas = "Password is required";
      } else if (formData.Usr_Pas.length < 6) {
        newErrors.Usr_Pas = `Minimum 6 characters required (${formData.Usr_Pas.length}/6)`;
      }

      if (!formData.Usr_Pas_confirmation?.trim()) {
        newErrors.Usr_Pas_confirmation = "Confirm password is required";
      } else if (formData.Usr_Pas != formData.Usr_Pas_confirmation) {
        newErrors.Usr_Pas_confirmation = "Passwords do not match";
      }
    }

    if (isEditMode && formData.Usr_Pas) {
      if (formData.Usr_Pas.length < 6) {
        newErrors.Usr_Pas = `Minimum 6 characters required (${formData.Usr_Pas.length}/6)`;
      }
      if (!formData.Usr_Pas_confirmation?.trim()) {
        newErrors.Usr_Pas_confirmation = "Confirm password is required";
      } else if (formData.Usr_Pas != formData.Usr_Pas_confirmation) {
        newErrors.Usr_Pas_confirmation = "Passwords do not match";
      }
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
      title: isEditMode ? "Update User?" : "Create New User?",
      text: isEditMode
        ? "Are you sure you want to update this user?"
        : "Are you sure you want to create this new user?",
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
        Usr_Name: formData.Usr_Name?.trim(),
        Usr_Email: formData.Usr_Email?.trim(),
        Usr_Mobile: formData.Usr_Mobile?.trim(),
      };

      if (!isEditMode || formData.Usr_Pas) {
        submitData.Usr_Pas = formData.Usr_Pas;
        submitData.Usr_Pas_confirmation = formData.Usr_Pas_confirmation;
      }

      if (formData.Usr_Role_Id) {
        submitData.Usr_Role_Id = parseInt(formData.Usr_Role_Id, 10);
      }

      if (isEditMode) {
        await UserMasterApi.update(id, submitData);
        toast.success("User updated successfully!");
      } else {
        await UserMasterApi.create(submitData);
        toast.success("User created successfully!");
      }

      setTimeout(() => {
        navigate("/settings/user-management/user-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving user:", error);

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
            ? "Failed to update user. Please try again."
            : "Failed to create user. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/settings/user-management/user-master");
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setFormData((prev) => ({
      ...prev,
      Usr_Pas: password,
      Usr_Pas_confirmation: password,
    }));

    if (errors.Usr_Pas || errors.Usr_Pas_confirmation) {
      setErrors((prev) => ({
        ...prev,
        Usr_Pas: null,
        Usr_Pas_confirmation: null,
      }));
    }
  };

  

  const getSelectedRoleName = () => {
    if (!formData.Usr_Role_Id) return "Select a role (optional)";
    const role = roles.find((r) => r.Role_Id == formData.Usr_Role_Id);
    if (!role) return "Select a role (optional)";
    return role.Full_Role || `${role.Role_Prefix} - ${role.Role_Name}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/settings/user-management/user-master")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit User" : "Add New User"}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Usr_Name.length > 45
                      ? formData.Usr_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Usr_Name.length}/50
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={usernameRef}
                  type="text"
                  name="Usr_Name"
                  value={formData.Usr_Name}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, emailRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Usr_Name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter username"
                  maxLength={50}
                  autoComplete="off"
                />
              </div>
              {errors.Usr_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Usr_Name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Usr_Email.length > 45
                      ? formData.Usr_Email.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Usr_Email.length}/50
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={emailRef}
                  type="email"
                  name="Usr_Email"
                  value={formData.Usr_Email}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, mobileRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Usr_Email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                  maxLength={50}
                  autoComplete="off"
                />
              </div>
              {errors.Usr_Email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Usr_Email}
                </p>
              )}
            </div>

            {/* Mobile Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Usr_Mobile.length > 12
                      ? formData.Usr_Mobile.length >= 15
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Usr_Mobile.length}/15
                </span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={mobileRef}
                  type="tel"
                  name="Usr_Mobile"
                  value={formData.Usr_Mobile}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, roleButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Usr_Mobile ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter mobile number"
                  maxLength={15}
                  autoComplete="off"
                />
              </div>
              {errors.Usr_Mobile && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Usr_Mobile}
                </p>
              )}
            </div>

            {/* Role Field - Optional with Search */}
            <div ref={roleDropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>

                <button
                  ref={roleButtonRef}
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  onKeyDown={handleRoleKeyDown}
                  className={`pl-9 sm:pl-10 pr-10 block w-full py-2.5 sm:py-3 border ${
                    errors.Usr_Role_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base text-left bg-white relative`}
                  disabled={loading}
                >
                  <span
                    className={`block truncate ${!formData.Usr_Role_Id ? "text-gray-400" : "text-gray-900"}`}
                  >
                    {getSelectedRoleName()}
                  </span>
                </button>

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isRoleDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  )}
                </div>

                {isRoleDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          ref={roleSearchInputRef}
                          type="text"
                          value={roleSearchTerm}
                          onChange={handleRoleSearchChange}
                          onKeyDown={handleRoleSearchKeyDown}
                          placeholder="Search roles..."
                          className="pl-9 pr-8 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        {roleSearchTerm && (
                          <button
                            type="button"
                            onClick={clearRoleSearch}
                            className="absolute inset-y-0 right-0 pr-2 flex items-center"
                          >
                            <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Role list */}
                    <div ref={roleListRef} className="overflow-y-auto max-h-60">
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role, idx) => (
                          <button
                            key={role.Role_Id}
                            ref={(el) => {
                              roleItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleRoleSelect(role)}
                            onKeyDown={(e) =>
                              handleRoleItemKeyDown(e, role, idx)
                            }
                            className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 ${
                              roleHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.Usr_Role_Id == role.Role_Id
                                  ? "bg-blue-100"
                                  : ""
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {role.Full_Role ||
                                  `${role.Role_Prefix} - ${role.Role_Name}`}
                              </span>
                              {role.Role_Name && (
                                <span className="text-xs text-gray-500">
                                  {role.Role_Name}
                                </span>
                              )}
                              {formData.Usr_Role_Id == role.Role_Id && (
                                <div className="text-xs text-blue-600 mt-1 flex items-center">
                                  <Check className="h-3 w-3 mr-1" />
                                  Selected
                                </div>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500">
                            No roles found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your search
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Results count */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                      {filteredRoles.length} role(s) found
                    </div>
                  </div>
                )}
              </div>

              {errors.Usr_Role_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Usr_Role_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optional: Select a role to assign permissions
              </p>
            </div>
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Password Settings
              </h2>
            </div>
            <button
              type="button"
              onClick={generatePassword}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center"
            >
              <Key className="h-4 w-4 mr-2" />
              Generate Password
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                  {isEditMode && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Leave empty to keep current)
                    </span>
                  )}
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  name="Usr_Pas"
                  value={formData.Usr_Pas}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, confirmPasswordRef)}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Usr_Pas ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder={
                    isEditMode
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.Usr_Pas && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Usr_Pas}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                {formData.Usr_Pas_confirmation && formData.Usr_Pas && (
                  <span
                    className={`text-xs ${
                      formData.Usr_Pas == formData.Usr_Pas_confirmation
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formData.Usr_Pas == formData.Usr_Pas_confirmation
                      ? "✓ Match"
                      : "✗ Not match"}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? "text" : "password"}
                  name="Usr_Pas_confirmation"
                  value={formData.Usr_Pas_confirmation}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Usr_Pas_confirmation
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm password"
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.Usr_Pas_confirmation && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Usr_Pas_confirmation}
                </p>
              )}
            </div>
          </div>

          {isEditMode && !formData.Usr_Pas && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-3" />
                <p className="text-sm text-blue-800">
                  Leave password fields empty to keep the current password
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => e.key == "Enter" && handleCancel()}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
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
                  {isEditMode ? "Update User" : "Create User"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditUser;

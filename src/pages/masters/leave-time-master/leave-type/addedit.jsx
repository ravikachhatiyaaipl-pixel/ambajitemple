import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  AlertCircle,
  Info,
  DollarSign,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  RotateCcw,
  Shield,
  UserCheck,
  Briefcase,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveTypeApi } from "../../../services/leavetypeapi";

const AddEditLeaveType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    LT_code: "",
    LT_name: "",
    Max_days: "",
    Alw_Gen: "A", // M, F, A
    Min_ApBf: "",
    Min_ApDy: "",
    Max_ApDy: "",
    Acr_Plcy: "MONTHLY", // YEARLY, HALF_YEARLY, QUARTERLY, MONTHLY
    Acr_Days: "",
    Is_Encash: false,
    Is_CryFw: false,
    Max_CfAl: "",
    Is_HfDy: false,
    Is_Paid: true,
    Is_Active: true,
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadLeaveTypeData();
    }
  }, [id]);

  const loadLeaveTypeData = async () => {
    setLoading(true);
    try {
      const data = await LeaveTypeApi.getById(id);

      setFormData({
        LT_code: data.LT_code || "",
        LT_name: data.LT_name || "",
        Max_days: data.Max_days || "",
        Alw_Gen: data.Alw_Gen || "A",
        Min_ApBf: data.Min_ApBf || "",
        Min_ApDy: data.Min_ApDy || "",
        Max_ApDy: data.Max_ApDy || "",
        Acr_Plcy: data.Acr_Plcy || "MONTHLY",
        Acr_Days: data.Acr_Days || "",
        Is_Encash: data.Is_Encash == true || data.Is_Encash == 1,
        Is_CryFw: data.Is_CryFw == true || data.Is_CryFw == 1,
        Max_CfAl: data.Max_CfAl || "",
        Is_HfDy: data.Is_HfDy == true || data.Is_HfDy == 1,
        Is_Paid: data.Is_Paid == true || data.Is_Paid == 1,
        Is_Active: data.Is_Active == true || data.Is_Active == 1,
      });
    } catch (error) {
      console.error("Error loading leave type:", error);
      toast.error("Failed to load leave type data!");
      navigate("/masters/leave-time-master/leave-type");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle number inputs
    if (["Max_days", "Min_ApBf", "Acr_Days", "Max_CfAl"].includes(name)) {
      const numValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (["Min_ApDy", "Max_ApDy"].includes(name)) {
      // Allow decimals for Min_ApDy and Max_ApDy
      const numValue = value.replace(/[^0-9.]/g, "");
      // Prevent multiple decimals
      const parts = numValue.split(".");
      const formattedValue =
        parts[0] + (parts.length > 1 ? "." + parts[1] : "");
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.LT_name?.trim()) {
      newErrors.LT_name = "Leave type name is required";
    }

    if (formData.LT_name?.length > 100) {
      newErrors.LT_name = "Name cannot exceed 100 characters";
    }

    if (formData.LT_code?.length > 20) {
      newErrors.LT_code = "Code cannot exceed 20 characters";
    }

    if (
      formData.Max_days &&
      (parseInt(formData.Max_days) < 0 || parseInt(formData.Max_days) > 365)
    ) {
      newErrors.Max_days = "Max days must be between 0 and 365";
    }

    if (formData.Min_ApBf && parseInt(formData.Min_ApBf) < 0) {
      newErrors.Min_ApBf = "Min days before must be a positive number";
    }

    if (formData.Min_ApDy && parseFloat(formData.Min_ApDy) < 0) {
      newErrors.Min_ApDy = "Min days per application must be a positive number";
    }

    if (formData.Max_ApDy && parseFloat(formData.Max_ApDy) < 0) {
      newErrors.Max_ApDy = "Max days per application must be a positive number";
    }

    if (
      formData.Min_ApDy &&
      formData.Max_ApDy &&
      parseFloat(formData.Min_ApDy) > parseFloat(formData.Max_ApDy)
    ) {
      newErrors.Max_ApDy =
        "Max days per application must be greater than Min days";
    }

    if (formData.Acr_Days && parseInt(formData.Acr_Days) < 0) {
      newErrors.Acr_Days = "Accrual days must be a positive number";
    }

    if (formData.Max_CfAl && parseInt(formData.Max_CfAl) < 0) {
      newErrors.Max_CfAl = "Max carry forward must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Leave Type?" : "Create New Leave Type?",
      text: isEditMode
        ? "Are you sure you want to update this leave type?"
        : "Are you sure you want to create this leave type?",
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
      const payload = {
        LT_code: formData.LT_code || null,
        LT_name: formData.LT_name,
        Max_days: formData.Max_days ? parseInt(formData.Max_days) : null,
        Alw_Gen: formData.Alw_Gen,
        Min_ApBf: formData.Min_ApBf ? parseInt(formData.Min_ApBf) : null,
        Min_ApDy: formData.Min_ApDy ? parseFloat(formData.Min_ApDy) : null,
        Max_ApDy: formData.Max_ApDy ? parseFloat(formData.Max_ApDy) : null,
        Acr_Plcy: formData.Acr_Plcy,
        Acr_Days: formData.Acr_Days ? parseInt(formData.Acr_Days) : null,
        Is_Encash: formData.Is_Encash ? 1 : 0,
        Is_CryFw: formData.Is_CryFw ? 1 : 0,
        Max_CfAl: formData.Max_CfAl ? parseInt(formData.Max_CfAl) : null,
        Is_HfDy: formData.Is_HfDy ? 1 : 0,
        Is_Paid: formData.Is_Paid ? 1 : 0,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await LeaveTypeApi.update(id, payload);
        toast.success("Leave type updated successfully!");
      } else {
        await LeaveTypeApi.create(payload);
        toast.success("Leave type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/leave-time-master/leave-type");
      }, 1500);
    } catch (error) {
      console.error("Error saving leave type:", error);

      if (error.errors) {
        const newErrors = {};
        Object.keys(error.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update leave type."
            : "Failed to create leave type.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/leave-time-master/leave-type");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading leave type data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/leave-time-master/leave-type")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Leave Type" : "Add New Leave Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update leave type information"
                : "Create a new leave type master"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave/Attendance Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="LT_name"
                value={formData.LT_name}
                onChange={handleInputChange}
                placeholder="e.g., Casual Leave, Earned Leave"
                className={`w-full px-4 py-2.5 border ${
                  errors.LT_name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                maxLength="100"
              />
              {errors.LT_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.LT_name}
                </p>
              )}
            </div>

            {/* Leave Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave/Attendance Code
              </label>
              <input
                type="text"
                name="LT_code"
                value={formData.LT_code}
                onChange={handleInputChange}
                placeholder="e.g., CL, EL, SL"
                className={`w-full px-4 py-2.5 border ${
                  errors.LT_code ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                maxLength="20"
              />
              {errors.LT_code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.LT_code}
                </p>
              )}
            </div>

            {/* Max Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Days Per Year
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Max_days"
                  value={formData.Max_days}
                  onChange={handleInputChange}
                  placeholder="e.g., 12"
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Max_days ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
              {errors.Max_days && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Max_days}
                </p>
              )}
            </div>

            {/* Allowed Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Gender
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Alw_Gen"
                  value={formData.Alw_Gen}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="A">All</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Specify which gender can avail this leave
              </p>
            </div>
          </div>
        </div>

        {/* Application Rules */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Application Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Min Days Before Application */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Days Before Application
              </label>
              <input
                type="text"
                name="Min_ApBf"
                value={formData.Min_ApBf}
                onChange={handleInputChange}
                placeholder="Days required before applying"
                className={`w-full px-4 py-2.5 border ${
                  errors.Min_ApBf ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.Min_ApBf && (
                <p className="mt-1 text-sm text-red-600">{errors.Min_ApBf}</p>
              )}
            </div>

            {/* Min Days Per Application */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Days Per Application
              </label>
              <input
                type="text"
                name="Min_ApDy"
                value={formData.Min_ApDy}
                onChange={handleInputChange}
                placeholder="Minimum days per request"
                className={`w-full px-4 py-2.5 border ${
                  errors.Min_ApDy ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.Min_ApDy && (
                <p className="mt-1 text-sm text-red-600">{errors.Min_ApDy}</p>
              )}
            </div>

            {/* Max Days Per Application */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Days Per Application
              </label>
              <input
                type="text"
                name="Max_ApDy"
                value={formData.Max_ApDy}
                onChange={handleInputChange}
                placeholder="Maximum days per request"
                className={`w-full px-4 py-2.5 border ${
                  errors.Max_ApDy ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.Max_ApDy && (
                <p className="mt-1 text-sm text-red-600">{errors.Max_ApDy}</p>
              )}
            </div>
          </div>
        </div>

        {/* Accrual Policy */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Accrual Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accrual Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accrual Policy <span className="text-red-500">*</span>
              </label>
              <select
                name="Acr_Plcy"
                value={formData.Acr_Plcy}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="YEARLY">Yearly</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
              {errors.Acr_Plcy && (
                <p className="mt-1 text-sm text-red-600">{errors.Acr_Plcy}</p>
              )}
            </div>

            {/* Accrual Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accrual Days
              </label>
              <input
                type="text"
                name="Acr_Days"
                value={formData.Acr_Days}
                onChange={handleInputChange}
                placeholder="Days accrued per period"
                className={`w-full px-4 py-2.5 border ${
                  errors.Acr_Days ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.Acr_Days && (
                <p className="mt-1 text-sm text-red-600">{errors.Acr_Days}</p>
              )}
            </div>
          </div>
        </div>

        {/* Carry Forward & Encashment */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-3">
              <RotateCcw className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Carry Forward & Encashment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Is Carry Forward */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carry Forward Allowed
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_CryFw"
                    checked={formData.Is_CryFw == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_CryFw: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_CryFw"
                    checked={formData.Is_CryFw == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_CryFw: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Max Carry Forward */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Carry Forward Days
              </label>
              <input
                type="text"
                name="Max_CfAl"
                value={formData.Max_CfAl}
                onChange={handleInputChange}
                placeholder="Maximum days to carry forward"
                className={`w-full px-4 py-2.5 border ${
                  errors.Max_CfAl ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.Max_CfAl && (
                <p className="mt-1 text-sm text-red-600">{errors.Max_CfAl}</p>
              )}
            </div>

            {/* Is Encash */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encashment Allowed
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Encash"
                    checked={formData.Is_Encash == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Encash: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Encash"
                    checked={formData.Is_Encash == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Encash: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Is Half Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Half Day Allowed
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_HfDy"
                    checked={formData.Is_HfDy == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_HfDy: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_HfDy"
                    checked={formData.Is_HfDy == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_HfDy: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Status Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Status
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Paid"
                    checked={formData.Is_Paid == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Paid: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                    Paid
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Paid"
                    checked={formData.Is_Paid == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Paid: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Unpaid</span>
                </label>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
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
            <span className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </span>
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Leave Type" : "Create Leave Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLeaveType;

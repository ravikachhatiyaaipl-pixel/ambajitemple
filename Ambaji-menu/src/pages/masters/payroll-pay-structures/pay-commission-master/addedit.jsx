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
  Briefcase,
  AlertCircle,
  Calendar,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PayCommissionApi from "../../../services/paycommissionapi";
import PayStructureTypeApi from "../../../services/paystructuretypeapi";

const AddEditPayCommission = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [structureTypes, setStructureTypes] = useState([]);

  const [formData, setFormData] = useState({
    PC_Name: "",
    PST_Id: "",
    Eff_From: "",
    Eff_To: "",
    PST_Desc: "",
    Is_Active: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStructureTypes();
    if (id && id != "create") {
      setIsEditMode(true);
      loadCommissionData();
    }
  }, [id]);

  const loadStructureTypes = async () => {
    try {
      const response = await PayStructureTypeApi.getAllList();
      if (response.success) {
        setStructureTypes(response.data || []);
      } else if (Array.isArray(response)) {
        setStructureTypes(response);
      }
    } catch (error) {
      console.error("Error loading structure types:", error);
      toast.error("Failed to load pay structure types");
    }
  };

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      const response = await PayCommissionApi.getById(id);
      if (response.success) {
        const commission = response.data;
        setFormData({
          PC_Name: commission.PC_Name || "",
          PST_Id: commission.PST_Id || "",
          Eff_From: commission.Eff_From
            ? commission.Eff_From.split("T")[0]
            : "",
          Eff_To: commission.Eff_To ? commission.Eff_To.split("T")[0] : "",
          PST_Desc: commission.PST_Desc || "",
          Is_Active: commission.Is_Active ? 1 : 0,
        });
      } else {
        toast.error("Failed to load pay commission data!");
        navigate("/masters/payroll-pay-structures/pay-commission-master");
      }
    } catch (error) {
      toast.error("Failed to load pay commission data!");
      navigate("/masters/payroll-pay-structures/pay-commission-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? (e.target.checked ? 1 : 0) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.PC_Name.trim()) {
      newErrors.PC_Name = "Pay commission name is required";
    } else if (formData.PC_Name.length > 50) {
      newErrors.PC_Name = `Maximum 50 characters allowed (${formData.PC_Name.length}/50)`;
    }

    if (!formData.Eff_From) {
      newErrors.Eff_From = "Effective from date is required";
    }

    if (
      formData.Eff_To &&
      formData.Eff_From &&
      new Date(formData.Eff_To) < new Date(formData.Eff_From)
    ) {
      newErrors.Eff_To =
        "Effective to date cannot be earlier than effective from date";
    }

    if (formData.PST_Desc && formData.PST_Desc.length > 255) {
      newErrors.PST_Desc = "Description cannot exceed 255 characters";
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
      title: isEditMode
        ? "Update Pay Commission?"
        : "Create New Pay Commission?",
      text: isEditMode
        ? "Are you sure you want to update this pay commission?"
        : "Are you sure you want to create this new pay commission?",
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
        ...formData,
        PST_Id: formData.PST_Id || null,
        Eff_To: formData.Eff_To || null,
        PST_Desc: formData.PST_Desc || null,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await PayCommissionApi.update(id, submitData);
        toast.success("Pay commission updated successfully!");
      } else {
        await PayCommissionApi.create(submitData);
        toast.success("Pay commission created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/pay-commission-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving pay commission:", error);

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
            ? "Failed to update. Please try again."
            : "Failed to create. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/payroll-pay-structures/pay-commission-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay commission data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-commission-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Pay Commission" : "Add New Pay Commission"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update pay commission information"
                : "Create a new pay commission for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pay Commission Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pay Commission Name */}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Commission Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.PC_Name.length > 40
                      ? formData.PC_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.PC_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="PC_Name"
                  value={formData.PC_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.PC_Name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 7th Pay Commission, 6th Pay Commission"
                  maxLength={50}
                />
              </div>
              {errors.PC_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PC_Name}
                </p>
              )}
            </div>

            {/* Pay Structure Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Structure Type
              </label>
              <select
                name="PST_Id"
                value={formData.PST_Id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.PST_Id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select Structure Type</option>
                {structureTypes.map((type) => (
                  <option key={type.PST_Id} value={type.PST_Id}>
                    {type.PST_Type}
                  </option>
                ))}
              </select>
              {errors.PST_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PST_Id}
                </p>
              )}
            </div>

            {/* Effective From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="Eff_From"
                  value={formData.Eff_From}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Eff_From ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.Eff_From && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Eff_From}
                </p>
              )}
            </div>

            {/* Effective To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="Eff_To"
                  value={formData.Eff_To}
                  onChange={handleInputChange}
                  min={formData.Eff_From}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Eff_To ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.Eff_To && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Eff_To}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Leave empty if currently active
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="PST_Desc"
                  value={formData.PST_Desc}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.PST_Desc ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter description or notes about this pay commission"
                  maxLength={255}
                />
              </div>
              {errors.PST_Desc ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PST_Desc}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.PST_Desc.length}/255 characters
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="Is_Active"
                    checked={formData.Is_Active == 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Is_Active: e.target.checked ? 1 : 0,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors duration-200 ${
                      formData.Is_Active == 1 ? "bg-green-400" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                        formData.Is_Active == 1 ? "transform translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center">
                  {formData.Is_Active == 1 ? (
                    <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {formData.Is_Active == 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-14">
                Set as active to make this commission available for selection
              </p>
            </div>
          </div>
        </div>

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
                  {isEditMode ? "Update Commission" : "Create Commission"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayCommission;

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
  DollarSign,
  Hash,
  TrendingUp,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PayScaleApi from "../../../services/payscaleapi";
import PayCommissionApi from "../../../services/paycommissionapi";

const AddEditPayScale = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [commissions, setCommissions] = useState([]);

  const [formData, setFormData] = useState({
    PC_Id: "",
    Scl_Code: "",
    St_Basic: "",
    Inc_Amount: "",
    Inc_Steps: "",
    Max_Basic: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCommissions();
    if (id && id != "create") {
      setIsEditMode(true);
      loadPayScaleData();
    }
  }, [id]);

  const loadCommissions = async () => {
    try {
      const response = await PayCommissionApi.getAllList();
      if (response.success) {
        setCommissions(response.data || []);
      } else if (Array.isArray(response)) {
        setCommissions(response);
      }
    } catch (error) {
      console.error("Error loading commissions:", error);
      toast.error("Failed to load pay commissions");
    }
  };

  const loadPayScaleData = async () => {
    setLoading(true);
    try {
      const response = await PayScaleApi.getById(id);
      if (response.success) {
        const scale = response.data;
        setFormData({
          PC_Id: scale.PC_Id || "",
          Scl_Code: scale.Scl_Code || "",
          St_Basic: scale.St_Basic || "",
          Inc_Amount: scale.Inc_Amount || "",
          Inc_Steps: scale.Inc_Steps || "",
          Max_Basic: scale.Max_Basic || "",
        });
      } else {
        toast.error("Failed to load pay scale data!");
        navigate("/masters/payroll-pay-structures/pay-scale-master");
      }
    } catch (error) {
      toast.error("Failed to load pay scale data!");
      navigate("/masters/payroll-pay-structures/pay-scale-master");
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

    if (name == "St_Basic" || name == "Inc_Amount" || name == "Inc_Steps") {
      const stBasic =
        name == "St_Basic"
          ? parseFloat(value) || 0
          : parseFloat(formData.St_Basic) || 0;
      const incAmount =
        name == "Inc_Amount"
          ? parseFloat(value) || 0
          : parseFloat(formData.Inc_Amount) || 0;
      const incSteps =
        name == "Inc_Steps"
          ? parseInt(value) || 0
          : parseInt(formData.Inc_Steps) || 0;

      if (stBasic > 0 && incAmount > 0 && incSteps > 0) {
        const maxBasic = stBasic + incAmount * incSteps;
        setFormData((prev) => ({
          ...prev,
          Max_Basic: maxBasic.toFixed(2),
        }));
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.PC_Id) {
      newErrors.PC_Id = "Pay commission is required";
    }

    if (!formData.Scl_Code.trim()) {
      newErrors.Scl_Code = "Scale code is required";
    } else if (formData.Scl_Code.length > 20) {
      newErrors.Scl_Code = `Maximum 20 characters allowed (${formData.Scl_Code.length}/20)`;
    }

    if (!formData.St_Basic) {
      newErrors.St_Basic = "Starting basic is required";
    } else if (parseFloat(formData.St_Basic) < 0) {
      newErrors.St_Basic = "Starting basic cannot be negative";
    }

    if (!formData.Inc_Amount) {
      newErrors.Inc_Amount = "Increment amount is required";
    } else if (parseFloat(formData.Inc_Amount) < 0) {
      newErrors.Inc_Amount = "Increment amount cannot be negative";
    }

    if (!formData.Inc_Steps) {
      newErrors.Inc_Steps = "Increment steps is required";
    } else if (parseInt(formData.Inc_Steps) < 1) {
      newErrors.Inc_Steps = "Increment steps must be at least 1";
    }

    if (!formData.Max_Basic) {
      newErrors.Max_Basic = "Maximum basic is required";
    } else if (parseFloat(formData.Max_Basic) < 0) {
      newErrors.Max_Basic = "Maximum basic cannot be negative";
    } else if (
      parseFloat(formData.Max_Basic) <= parseFloat(formData.St_Basic)
    ) {
      newErrors.Max_Basic = "Maximum basic must be greater than starting basic";
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
      title: isEditMode ? "Update Pay Scale?" : "Create New Pay Scale?",
      text: isEditMode
        ? "Are you sure you want to update this pay scale?"
        : "Are you sure you want to create this new pay scale?",
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
        PC_Id: parseInt(formData.PC_Id),
        Scl_Code: formData.Scl_Code,
        St_Basic: parseFloat(formData.St_Basic),
        Inc_Amount: parseFloat(formData.Inc_Amount),
        Inc_Steps: parseInt(formData.Inc_Steps),
        Max_Basic: parseFloat(formData.Max_Basic),
      };

      if (isEditMode) {
        await PayScaleApi.update(id, submitData);
        toast.success("Pay scale updated successfully!");
      } else {
        await PayScaleApi.create(submitData);
        toast.success("Pay scale created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/pay-scale-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving pay scale:", error);

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
    navigate("/masters/payroll-pay-structures/pay-scale-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay scale data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-scale-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Pay Scale" : "Add New Pay Scale"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update pay scale information"
                : "Create a new pay scale for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pay Scale Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pay Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Commission <span className="text-red-500">*</span>
              </label>
              <select
                name="PC_Id"
                value={formData.PC_Id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.PC_Id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select Pay Commission</option>
                {commissions.map((comm) => (
                  <option key={comm.PC_Id} value={comm.PC_Id}>
                    {comm.PC_Name}
                  </option>
                ))}
              </select>
              {errors.PC_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PC_Id}
                </p>
              )}
            </div>

            {/* Scale Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Scale Code <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Scl_Code.length > 15
                      ? formData.Scl_Code.length >= 20
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Scl_Code.length}/20 characters
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Scl_Code"
                  value={formData.Scl_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Scl_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., S-01, GP-5200"
                  maxLength={20}
                />
              </div>
              {errors.Scl_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Scl_Code}
                </p>
              )}
            </div>

            {/* Starting Basic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Basic (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="St_Basic"
                  value={formData.St_Basic}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.St_Basic ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 5200.00"
                />
              </div>
              {errors.St_Basic && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.St_Basic}
                </p>
              )}
            </div>

            {/* Increment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Increment Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="Inc_Amount"
                  value={formData.Inc_Amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Inc_Amount ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 200.00"
                />
              </div>
              {errors.Inc_Amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Inc_Amount}
                </p>
              )}
            </div>

            {/* Increment Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Increment Steps <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="Inc_Steps"
                  value={formData.Inc_Steps}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Inc_Steps ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 1000"
                />
              </div>
              {errors.Inc_Steps && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Inc_Steps}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Number of increments to reach maximum basic
              </p>
            </div>

            {/* Maximum Basic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Basic (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="Max_Basic"
                  value={formData.Max_Basic}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Max_Basic ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 20200.00"
                  readOnly
                  style={{ backgroundColor: "#f9fafb" }}
                />
              </div>
              {errors.Max_Basic && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Max_Basic}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Auto-calculated: Starting Basic + (Increment Amount × Increment
                Steps)
              </p>
            </div>
          </div>

          {/* Calculation Preview */}
          {formData.St_Basic && formData.Inc_Amount && formData.Inc_Steps && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Calculation Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Starting Basic:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    ₹{" "}
                    {parseFloat(formData.St_Basic).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">+ Increments:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formData.Inc_Steps} × ₹{" "}
                    {parseFloat(formData.Inc_Amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">= Maximum Basic:</span>
                  <span className="ml-2 font-medium text-green-600">
                    ₹{" "}
                    {parseFloat(formData.Max_Basic || 0).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}
                  </span>
                </div>
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
                  {isEditMode ? "Update Pay Scale" : "Create Pay Scale"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayScale;

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
  Hash,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PayBandApi from "../../../services/paybandapi";
import PayCommissionApi from "../../../services/paycommissionapi";

const AddEditPayBand = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [commissions, setCommissions] = useState([]);

  const [formData, setFormData] = useState({
    PC_Id: "",
    PB_Code: "",
    Min_Pay: "",
    Max_Pay: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCommissions();
    if (id && id != "create") {
      setIsEditMode(true);
      loadBandData();
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

  const loadBandData = async () => {
    setLoading(true);
    try {
      const response = await PayBandApi.getById(id);
      if (response.success) {
        const band = response.data;
        setFormData({
          PC_Id: band.PC_Id || "",
          PB_Code: band.PB_Code || "",
          Min_Pay: band.Min_Pay || "",
          Max_Pay: band.Max_Pay || "",
        });
      } else {
        toast.error("Failed to load pay band data!");
        navigate("/masters/payroll-pay-structures/pay-band-master");
      }
    } catch (error) {
      toast.error("Failed to load pay band data!");
      navigate("/masters/payroll-pay-structures/pay-band-master");
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

    if (!formData.PC_Id) {
      newErrors.PC_Id = "Pay commission is required";
    }

    if (!formData.PB_Code.trim()) {
      newErrors.PB_Code = "Pay band code is required";
    } else if (formData.PB_Code.length > 20) {
      newErrors.PB_Code = `Maximum 20 characters allowed (${formData.PB_Code.length}/20)`;
    }

    if (!formData.Min_Pay) {
      newErrors.Min_Pay = "Minimum pay is required";
    } else if (isNaN(formData.Min_Pay) || parseFloat(formData.Min_Pay) < 0) {
      newErrors.Min_Pay = "Minimum pay must be a positive number";
    }

    if (!formData.Max_Pay) {
      newErrors.Max_Pay = "Maximum pay is required";
    } else if (isNaN(formData.Max_Pay) || parseFloat(formData.Max_Pay) < 0) {
      newErrors.Max_Pay = "Maximum pay must be a positive number";
    } else if (parseFloat(formData.Max_Pay) <= parseFloat(formData.Min_Pay)) {
      newErrors.Max_Pay = "Maximum pay must be greater than minimum pay";
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
      title: isEditMode ? "Update Pay Band?" : "Create New Pay Band?",
      text: isEditMode
        ? "Are you sure you want to update this pay band?"
        : "Are you sure you want to create this new pay band?",
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
        PB_Code: formData.PB_Code,
        Min_Pay: parseFloat(formData.Min_Pay),
        Max_Pay: parseFloat(formData.Max_Pay),
      };

      if (isEditMode) {
        await PayBandApi.update(id, submitData);
        toast.success("Pay band updated successfully!");
      } else {
        await PayBandApi.create(submitData);
        toast.success("Pay band created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/pay-band-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving pay band:", error);

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
    navigate("/masters/payroll-pay-structures/pay-band-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay band data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-band-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Pay Band" : "Add New Pay Band"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update pay band information"
                : "Create a new pay band for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pay Band Information
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.PC_Id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select Pay Commission</option>
                {commissions.map((commission) => (
                  <option key={commission.PC_Id} value={commission.PC_Id}>
                    {commission.PC_Name}{" "}
                    {commission.Is_Active ? "(Active)" : "(Inactive)"}
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

            {/* Pay Band Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Band Code <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.PB_Code.length > 15
                      ? formData.PB_Code.length >= 20
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.PB_Code.length}/20 characters
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="PB_Code"
                  value={formData.PB_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.PB_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., PB-1, PB-2, Level-1"
                  maxLength={20}
                />
              </div>
              {errors.PB_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PB_Code}
                </p>
              )}
            </div>

            {/* Minimum Pay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Pay <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="Min_Pay"
                  value={formData.Min_Pay}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.Min_Pay ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.Min_Pay && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Min_Pay}
                </p>
              )}
            </div>

            {/* Maximum Pay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Pay <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="Max_Pay"
                  value={formData.Max_Pay}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.Max_Pay ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.Max_Pay && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Max_Pay}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be greater than minimum pay
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
                  {isEditMode ? "Update Pay Band" : "Create Pay Band"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayBand;

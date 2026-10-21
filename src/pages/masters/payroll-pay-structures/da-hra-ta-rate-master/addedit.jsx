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
  Percent,
  Hash,
  Check,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  Calculator,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DaRateApi } from "../../../services/daratemasterapi";

const AddEditDaRate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [commissions, setCommissions] = useState([]);
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  const [formData, setFormData] = useState({
    DR_Sr: "",
    Fr_Date: "",
    To_Date: "",
    Eff_Date: "",
    PC_Id: "",
    Da_Rate: "",
    Da_Paid: "",
    Da_Diff: "",
    NPA_Rate: "",
    NPA_Limit: "",
    DaPf: "",
    Bon_Limit: "",
    IR_Rate: "",
    Da_Diff_Mon: "",
    Da_Diff_Rate: "",
    // Additional fields from the image
    Da_Off_Rate: "", // DA Off Rate
    IR_Limit: "", // IR Limit
  });

  useEffect(() => {
    loadCommissions();
    if (id && id != "create") {
      setIsEditMode(true);
      loadDaRateData();
    }
  }, [id]);

  const loadCommissions = async () => {
    setLoadingCommissions(true);
    try {
      const data = await DaRateApi.getAllCommissions();
      setCommissions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load pay commissions!");
    } finally {
      setLoadingCommissions(false);
    }
  };

  const loadDaRateData = async () => {
    setLoading(true);
    try {
      const daRate = await DaRateApi.getById(id);

      setFormData({
        DR_Sr: daRate.DR_Sr?.toString() || "",
        Fr_Date: daRate.Fr_Date || "",
        To_Date: daRate.To_Date || "",
        Eff_Date: daRate.Eff_Date || "",
        PC_Id: daRate.PC_Id?.toString() || "",
        Da_Rate: daRate.Da_Rate?.toString() || "",
        Da_Paid: daRate.Da_Paid?.toString() || "",
        Da_Diff: daRate.Da_Diff?.toString() || "",
        NPA_Rate: daRate.NPA_Rate?.toString() || "",
        NPA_Limit: daRate.NPA_Limit?.toString() || "",
        DaPf: daRate.DaPf?.toString() || "",
        Bon_Limit: daRate.Bon_Limit?.toString() || "",
        IR_Rate: daRate.IR_Rate?.toString() || "",
        Da_Diff_Mon: daRate.Da_Diff_Mon?.toString() || "",
        Da_Diff_Rate: daRate.Da_Diff_Rate?.toString() || "",
        Da_Off_Rate: daRate.Da_Off_Rate?.toString() || "",
        IR_Limit: daRate.IR_Limit?.toString() || "",
      });
    } catch (error) {
      toast.error("Failed to load DA rate data!");
      navigate("/masters/payroll-pay-structures/da-hra-ta-rate-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;

    // Handle numeric fields
    const numericFields = [
      "DR_Sr",
      "Da_Rate",
      "Da_Paid",
      "Da_Diff",
      "NPA_Rate",
      "Da_Off_Rate",
      "NPA_Limit",
      "DaPf",
      "Bon_Limit",
      "IR_Rate",
      "IR_Limit",
      "Da_Diff_Mon",
      "Da_Diff_Rate",
    ];

    if (numericFields.includes(name)) {
      // Allow only numbers and decimal point
      processedValue = value.replace(/[^0-9.]/g, "");

      // Prevent multiple decimals
      const decimalCount = (processedValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        processedValue = processedValue.replace(/\.+$/, "");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.PC_Id) {
      newErrors.PC_Id = "Pay Commission is required";
    }

    // Date validations
    if (formData.Fr_Date && formData.To_Date) {
      if (new Date(formData.To_Date) < new Date(formData.Fr_Date)) {
        newErrors.To_Date = "To Date must be after or equal to From Date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update DA Rate?" : "Create New DA Rate?",
      text: isEditMode
        ? "Are you sure you want to update this DA rate information?"
        : "Are you sure you want to create this new DA rate?",
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
      const daRateData = {
        Fr_Date: formData.Fr_Date || null,
        To_Date: formData.To_Date || null,
        Eff_Date: formData.Eff_Date || null,
        PC_Id: formData.PC_Id ? parseInt(formData.PC_Id) : null,
        Da_Rate: formData.Da_Rate ? parseFloat(formData.Da_Rate) : null,
        Da_Paid: formData.Da_Paid ? parseFloat(formData.Da_Paid) : null,
        Da_Diff: formData.Da_Diff ? parseFloat(formData.Da_Diff) : null,
        Da_Off_Rate: formData.Da_Off_Rate
          ? parseFloat(formData.Da_Off_Rate)
          : null,
        NPA_Rate: formData.NPA_Rate ? parseFloat(formData.NPA_Rate) : null,
        NPA_Limit: formData.NPA_Limit ? parseFloat(formData.NPA_Limit) : null,
        DaPf: formData.DaPf == true || formData.DaPf == "true" ? 1 : 0,
        Bon_Limit: formData.Bon_Limit ? parseFloat(formData.Bon_Limit) : null,
        IR_Rate: formData.IR_Rate ? parseFloat(formData.IR_Rate) : null,
        IR_Limit: formData.IR_Limit ? parseFloat(formData.IR_Limit) : null,
        Da_Diff_Mon: formData.Da_Diff_Mon
          ? parseInt(formData.Da_Diff_Mon)
          : null,
        Da_Diff_Rate: formData.Da_Diff_Rate
          ? parseFloat(formData.Da_Diff_Rate)
          : null,
      };

      if (isEditMode) {
        await DaRateApi.update(id, daRateData);
        toast.success("DA rate updated successfully!");
      } else {
        await DaRateApi.create(daRateData);
        toast.success("DA rate created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/da-hra-ta-rate-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving DA rate:", error);

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
            ? "Failed to update DA rate. Please try again."
            : "Failed to create DA rate. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/payroll-pay-structures/da-hra-ta-rate-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading DA rate data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/da-hra-ta-rate-master")
            }
            className="mr-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit DA Master" : "Add New DA Master"}
            </h1>
            <p className="text-gray-600 mt-1">
              Create a new dearness allowance master record
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Date Range Section - Two Column Layout */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Date Range</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="Fr_Date"
                    value={formData.Fr_Date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Fr_Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
                {errors.Fr_Date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Fr_Date}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">mm/dd/yyyy</p>
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="To_Date"
                    value={formData.To_Date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.To_Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
                {errors.To_Date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.To_Date}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">mm/dd/yyyy</p>
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="Eff_Date"
                    value={formData.Eff_Date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">mm/dd/yyyy</p>
              </div>
            </div>
          </div>
        </div>

        {/* DA / HRA / TA Rate Information */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              DA / HRA / TA Rate Information
            </h2>
          </div>
          <div className="p-6">
            {/* Grid container with 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-8">
              {/* =========  ROW 1 - ALL 4 COLUMNS =========  */}
              {/* Col 1: Pay Commission */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Commission <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="PC_Id"
                    value={formData.PC_Id}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.PC_Id ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                    disabled={loadingCommissions}
                  >
                    <option value="">Select Pay Commission</option>
                    {commissions.map((commission) => (
                      <option key={commission.PC_Id} value={commission.PC_Id}>
                        {commission.PC_Name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.PC_Id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.PC_Id}
                  </p>
                )}
              </div>

              {/* Col 2: DA Rate (%) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Da_Rate"
                    value={formData.Da_Rate}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Da_Rate ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="e.g., 46%"
                  />
                </div>
                {errors.Da_Rate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Da_Rate}
                  </p>
                )}
              </div>

              {/* Col 3: DA Paid (%) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA Paid (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Da_Paid"
                    value={formData.Da_Paid}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 45%"
                  />
                </div>
              </div>

              {/* Col 4: DA Difference (%) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA Difference (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Da_Diff"
                    value={formData.Da_Diff}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 1%"
                  />
                </div>
              </div>

              {/* =========  ROW 2 - FIELDS START FROM COL 2 =========  */}
              {/* Col 1: Empty */}
              <div className="col-span-1"></div>

              {/* Col 2: DA Diff Rate (%) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA Diff Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Da_Diff_Rate"
                    value={formData.Da_Diff_Rate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 1%"
                  />
                </div>
              </div>

              {/* Col 3: DAPF Applicable */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DAPF Applicable
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="DaPf"
                    checked={formData.DaPf == true || formData.DaPf == "true"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        DaPf: e.target.checked,
                      });
                    }}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </div>
              </div>

              {/* Col 4: DA Diff Months */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA Diff Months
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Da_Diff_Mon"
                    value={formData.Da_Diff_Mon}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 6"
                  />
                </div>
              </div>

              {/* =========  ROW 3 - FIELDS START FROM COL 2 =========  */}
              {/* Col 1: Empty */}
              <div className="col-span-1"></div>

              {/* Col 2: NPA Rate (%) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NPA Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="NPA_Rate"
                    value={formData.NPA_Rate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 25%"
                  />
                </div>
              </div>

              {/* Col 3: NPA Limit (€) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NPA Limit (€)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="NPA_Limit"
                    value={formData.NPA_Limit}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 7000"
                  />
                </div>
              </div>

              {/* Col 4: Empty */}
              <div className="col-span-1"></div>

              {/* =========  ROW 4 - IR RATE (COL 2 ONLY) =========  */}
              {/* Col 1: Empty */}
              <div className="col-span-1"></div>

              {/* Col 2: IR Rate (%) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IR Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="IR_Rate"
                    value={formData.IR_Rate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 10%"
                  />
                </div>
              </div>

              {/* Col 3: Empty */}
              <div className="col-span-1"></div>

              {/* Col 4: Empty */}
              <div className="col-span-1"></div>

              {/* =========  ROW 5 - BONUS LIMIT (COL 2 ONLY) =========  */}
              {/* Col 1: Empty */}
              <div className="col-span-1"></div>

              {/* Col 2: Bonus Limit (€) */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus Limit (€)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Bon_Limit"
                    value={formData.Bon_Limit}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 3500"
                  />
                </div>
              </div>

              {/* Col 3: Empty */}
              <div className="col-span-1"></div>

              {/* Col 4: Empty */}
              <div className="col-span-1"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
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
                {isEditMode ? "Update DA Rate" : "Create DA Rate"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditDaRate;

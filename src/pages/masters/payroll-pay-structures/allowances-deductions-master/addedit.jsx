/**
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
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
  Percent,
  Type,
  Plus,
  Trash2,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PayAlwdedApi from "../../../services/payalwdedapi";

const emptySlab = () => ({
  From_Amt: "",
  To_Amt: "",
  Slab_Type: "P",
  Slab_Value: "",
});

const AddEditPayAlwded = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    PAD_Code: "",
    PAD_ShortName: "",
    PAD_Name: "",
    Calc_Type: "P",
    Percentage: "",
    Flat_Amount: "",
    Based_On: "BASIC",
    Alw_Ded: "A",
    Lg_Id: user?.Lg_Id || "1",
  });
  const [slabs, setSlabs] = useState([emptySlab()]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await PayAlwdedApi.getById(id);
      if (response.status) {
        const data = response.data;
        setFormData({
          PAD_Code: data.PAD_Code || "",
          PAD_ShortName: data.PAD_ShortName || "",
          PAD_Name: data.PAD_Name || "",
          Calc_Type: data.Calc_Type || "P",
          Percentage: data.Percentage ?? "",
          Flat_Amount: data.Flat_Amount ?? "",
          Based_On: data.Based_On || "BASIC",
          Alw_Ded: data.Alw_Ded || "A",
          Lg_Id: data.Lg_Id || "1",
        });
        if (Array.isArray(data.slabs) && data.slabs.length > 0) {
          setSlabs(
            data.slabs.map((s) => ({
              From_Amt: s.From_Amt ?? "",
              To_Amt: s.To_Amt ?? "",
              Slab_Type: s.Slab_Type || "P",
              Slab_Value: s.Slab_Value ?? "",
            })),
          );
        } else {
          setSlabs([emptySlab()]);
        }
      } else {
        toast.error("Failed to load allowance/deduction data!");
        navigate(
          "/masters/payroll-pay-structures/allowances-deductions-master",
        );
      }
    } catch (error) {
      toast.error("Failed to load allowance/deduction data!");
      navigate("/masters/payroll-pay-structures/allowances-deductions-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSlabChange = (index, field, value) => {
    setSlabs((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addSlab = () => setSlabs((prev) => [...prev, emptySlab()]);
  const removeSlab = (index) =>
    setSlabs((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.PAD_Code.trim()) newErrors.PAD_Code = "Code is required";
    else if (formData.PAD_Code.length > 20)
      newErrors.PAD_Code = `Maximum 20 characters allowed (${formData.PAD_Code.length}/20)`;

    if (!formData.PAD_ShortName.trim())
      newErrors.PAD_ShortName = "Short name is required";
    else if (formData.PAD_ShortName.length > 10)
      newErrors.PAD_ShortName = `Maximum 10 characters allowed (${formData.PAD_ShortName.length}/10)`;

    if (!formData.PAD_Name.trim()) newErrors.PAD_Name = "Name is required";
    else if (formData.PAD_Name.length > 100)
      newErrors.PAD_Name = `Maximum 100 characters allowed (${formData.PAD_Name.length}/100)`;

    if (!formData.Alw_Ded) newErrors.Alw_Ded = "Type is required";
    if (!formData.Calc_Type)
      newErrors.Calc_Type = "Calculation type is required";

    if (formData.Calc_Type === "P") {
      if (formData.Percentage === "" || formData.Percentage === null)
        newErrors.Percentage = "Percentage is required";
      else if (isNaN(parseFloat(formData.Percentage)))
        newErrors.Percentage = "Percentage must be a valid number";
      else if (parseFloat(formData.Percentage) < 0)
        newErrors.Percentage = "Percentage cannot be negative";
      else if (parseFloat(formData.Percentage) > 100)
        newErrors.Percentage = "Percentage cannot exceed 100";
    }

    if (formData.Calc_Type === "F") {
      if (formData.Flat_Amount === "" || formData.Flat_Amount === null)
        newErrors.Flat_Amount = "Flat amount is required";
      else if (isNaN(parseFloat(formData.Flat_Amount)))
        newErrors.Flat_Amount = "Flat amount must be a valid number";
      else if (parseFloat(formData.Flat_Amount) < 0)
        newErrors.Flat_Amount = "Flat amount cannot be negative";
    }

    if (formData.Calc_Type === "S") {
      if (!slabs.length) newErrors.slabs = "At least one slab is required";
      slabs.forEach((s, i) => {
        if (s.From_Amt === "" || isNaN(parseFloat(s.From_Amt)))
          newErrors[`slab_${i}_From_Amt`] = "From amount required";
        if (s.Slab_Value === "" || isNaN(parseFloat(s.Slab_Value)))
          newErrors[`slab_${i}_Slab_Value`] = "Value required";
        if (s.Slab_Type === "P" && parseFloat(s.Slab_Value) > 100)
          newErrors[`slab_${i}_Slab_Value`] = "Percentage cannot exceed 100";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Allowance/Deduction?"
        : "Create New Allowance/Deduction?",
      text: isEditMode
        ? "Are you sure you want to update this record?"
        : "Are you sure you want to create this new record?",
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
        PAD_Code: formData.PAD_Code,
        PAD_ShortName: formData.PAD_ShortName,
        PAD_Name: formData.PAD_Name,
        Calc_Type: formData.Calc_Type,
        Based_On: "BASIC",
        Percentage:
          formData.Calc_Type === "P" ? parseFloat(formData.Percentage) : 0,
        Flat_Amount:
          formData.Calc_Type === "F" ? parseFloat(formData.Flat_Amount) : 0,
        Alw_Ded: formData.Alw_Ded,
        Lg_Id: parseInt(formData.Lg_Id) || null,
        slabs:
          formData.Calc_Type === "S"
            ? slabs.map((s, i) => ({
                From_Amt: parseFloat(s.From_Amt) || 0,
                To_Amt:
                  s.To_Amt === "" || s.To_Amt === null
                    ? null
                    : parseFloat(s.To_Amt),
                Slab_Type: s.Slab_Type,
                Slab_Value: parseFloat(s.Slab_Value) || 0,
                Sort_Order: i,
              }))
            : [],
      };

      if (isEditMode) {
        await PayAlwdedApi.update(id, submitData);
        toast.success("Allowance/Deduction updated successfully!");
      } else {
        await PayAlwdedApi.create(submitData);
        toast.success("Allowance/Deduction created successfully!");
      }

      setTimeout(() => {
        navigate(
          "/masters/payroll-pay-structures/allowances-deductions-master",
        );
      }, 1000);
    } catch (error) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        toast.error(Object.values(apiErrors).flat().join(", "));
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/payroll-pay-structures/allowances-deductions-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Allowance/Deduction"
                : "Add New Allowance/Deduction"}
            </h1>
            <p className="text-gray-600 mt-1">
              Calculation is always based on Basic pay
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Allowance/Deduction Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="PAD_Code"
                  value={formData.PAD_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.PAD_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., WA, SPL"
                  maxLength={20}
                />
              </div>
              {errors.PAD_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PAD_Code}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="PAD_ShortName"
                  value={formData.PAD_ShortName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.PAD_ShortName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., WA"
                  maxLength={10}
                />
              </div>
              {errors.PAD_ShortName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PAD_ShortName}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="PAD_Name"
                value={formData.PAD_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.PAD_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Washing Allowance"
                maxLength={100}
              />
              {errors.PAD_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PAD_Name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="Alw_Ded"
                value={formData.Alw_Ded}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.Alw_Ded ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="A">Allowance</option>
                <option value="D">Deduction</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Type <span className="text-red-500">*</span>
              </label>
              <select
                name="Calc_Type"
                value={formData.Calc_Type}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.Calc_Type ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="P">Percentage (of Basic)</option>
                <option value="F">Flat Amount</option>
                <option value="S">Slab Wise</option>
              </select>
            </div>

            {formData.Calc_Type === "P" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="Percentage"
                    value={formData.Percentage}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.Percentage ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., 10.50"
                  />
                </div>
                {errors.Percentage && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Percentage}
                  </p>
                )}
              </div>
            )}

            {formData.Calc_Type === "F" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flat Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="Flat_Amount"
                    value={formData.Flat_Amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.Flat_Amount ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., 500"
                  />
                </div>
                {errors.Flat_Amount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Flat_Amount}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {formData.Calc_Type === "S" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Slab Configuration
                </h2>
                <p className="text-sm text-gray-500">
                  Match employee Basic to a slab. Each slab can be % or flat.
                </p>
              </div>
              <button
                type="button"
                onClick={addSlab}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Slab
              </button>
            </div>
            {errors.slabs && (
              <p className="mb-3 text-sm text-red-600">{errors.slabs}</p>
            )}
            <div className="space-y-3">
              {slabs.map((slab, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      From Basic
                    </label>
                    <input
                      type="number"
                      value={slab.From_Amt}
                      onChange={(e) =>
                        handleSlabChange(index, "From_Amt", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                    {errors[`slab_${index}_From_Amt`] && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors[`slab_${index}_From_Amt`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      To Basic
                    </label>
                    <input
                      type="number"
                      value={slab.To_Amt}
                      onChange={(e) =>
                        handleSlabChange(index, "To_Amt", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                      placeholder="No limit"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Slab Type
                    </label>
                    <select
                      value={slab.Slab_Type}
                      onChange={(e) =>
                        handleSlabChange(index, "Slab_Type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="P">Percentage</option>
                      <option value="F">Flat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {slab.Slab_Type === "P" ? "Value (%)" : "Value (₹)"}
                    </label>
                    <input
                      type="number"
                      value={slab.Slab_Value}
                      onChange={(e) =>
                        handleSlabChange(index, "Slab_Value", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                    {errors[`slab_${index}_Slab_Value`] && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors[`slab_${index}_Slab_Value`]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeSlab(index)}
                      className="w-full px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center"
                      disabled={slabs.length === 1}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <p className="text-sm text-gray-600 mb-4 sm:mb-0">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/masters/payroll-pay-structures/allowances-deductions-master",
                )
              }
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update" : "Create"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayAlwded;

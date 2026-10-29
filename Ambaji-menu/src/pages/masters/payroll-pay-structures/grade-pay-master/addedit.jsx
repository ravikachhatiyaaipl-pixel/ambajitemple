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
  ToggleLeft,
  ToggleRight,
  Hash,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import GradeApi from "../../../services/gradeapi";
import PayBandsApi from "../../../services/paybandapi";

const AddEditGrade = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [payBands, setPayBands] = useState([]);

  const [formData, setFormData] = useState({
    EGM_Code: "",
    EGM_Name: "",
    PB_ID: "",
    Is_Active: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPayBands();
    if (id && id != "create") {
      setIsEditMode(true);
      loadGradeData();
    }
  }, [id]);

  const loadPayBands = async () => {
    try {
      const response = await PayBandsApi.getAllList();
      if (response.success) {
        setPayBands(response.data || []);
      } else if (Array.isArray(response)) {
        setPayBands(response);
      }
    } catch (error) {
      console.error("Error loading pay bands:", error);
      toast.error("Failed to load pay bands");
    }
  };

  const loadGradeData = async () => {
    setLoading(true);
    try {
      const response = await GradeApi.getById(id);
      if (response.success) {
        const grade = response.data;
        setFormData({
          EGM_Code: grade.EGM_Code || "",
          EGM_Name: grade.EGM_Name || "",
          PB_ID: grade.PB_ID || "",
          Is_Active: grade.Is_Active ? 1 : 0,
        });
      } else {
        toast.error("Failed to load grade data!");
        navigate("/masters/payroll-pay-structures/grade-pay-master");
      }
    } catch (error) {
      toast.error("Failed to load grade data!");
      navigate("/masters/payroll-pay-structures/grade-pay-master");
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

    if (!formData.EGM_Name.trim()) {
      newErrors.EGM_Name = "Grade name is required";
    } else if (formData.EGM_Name.length > 50) {
      newErrors.EGM_Name = `Maximum 50 characters allowed (${formData.EGM_Name.length}/50)`;
    }

    if (formData.EGM_Code && formData.EGM_Code.length > 10) {
      newErrors.EGM_Code = `Maximum 10 characters allowed (${formData.EGM_Code.length}/10)`;
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
      title: isEditMode ? "Update Grade?" : "Create New Grade?",
      text: isEditMode
        ? "Are you sure you want to update this grade?"
        : "Are you sure you want to create this new grade?",
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
        EGM_Name: formData.EGM_Name,
        ...(formData.EGM_Code && { EGM_Code: formData.EGM_Code }),
        ...(formData.PB_ID && { PB_ID: formData.PB_ID }),
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await GradeApi.update(id, submitData);
        toast.success("Grade updated successfully!");
      } else {
        await GradeApi.create(submitData);
        toast.success("Grade created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/grade-pay-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving grade:", error);

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
    navigate("/masters/payroll-pay-structures/grade-pay-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading grade data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/grade-pay-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Grade" : "Add New Grade"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update grade information"
                : "Create a new grade for the system"}
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
              Grade Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Grade Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.EGM_Name.length > 40
                      ? formData.EGM_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.EGM_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="EGM_Name"
                  value={formData.EGM_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.EGM_Name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., Senior Grade, Junior Grade"
                  maxLength={50}
                />
              </div>
              {errors.EGM_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EGM_Name}
                </p>
              )}
            </div>
            {/* Grade Code - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Grade Code
                </label>
                <span
                  className={`text-xs ${
                    formData.EGM_Code.length > 8
                      ? formData.EGM_Code.length >= 10
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.EGM_Code.length}/10 characters
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="EGM_Code"
                  value={formData.EGM_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.EGM_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., G-01, GR-02"
                  maxLength={10}
                />
              </div>
              {errors.EGM_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EGM_Code}
                </p>
              )}
            </div>

            {/* Pay Band - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Band
              </label>
              <select
                name="PB_ID"
                value={formData.PB_ID}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.PB_ID ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select Pay Band</option>
                {payBands.map((band) => (
                  <option key={band.PB_Id} value={band.PB_Id}>
                    {band.PB_Code} - ₹
                    {parseFloat(band.Min_Pay).toLocaleString()} to ₹
                    {parseFloat(band.Max_Pay).toLocaleString()}
                    {band.commission && ` (${band.commission.PC_Name})`}
                  </option>
                ))}
              </select>
              {errors.PB_ID && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PB_ID}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-3 cursor-pointer mt-2">
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
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Set as active to make this grade available for selection
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
                  {isEditMode ? "Update Grade" : "Create Grade"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditGrade;

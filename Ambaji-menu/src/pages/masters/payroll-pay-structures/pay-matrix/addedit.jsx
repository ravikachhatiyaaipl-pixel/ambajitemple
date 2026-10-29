import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Hash,
  Check,
  AlertCircle,
  Copy,
  Calculator,
  DollarSign,
  Grid,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PayMatrixApi } from "../../../services/paymatrixapi";
import axios from "axios";

const AddEditPayMatrix = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown data states
  const [empGrades, setEmpGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const [formData, setFormData] = useState({
    EGM_id: "",
    Cell_Index: "",
    Basic_Pay: "",
  });

  useEffect(() => {
    loadEmpGrades();
    if (id && id != "create") {
      setIsEditMode(true);
      loadPayMatrixData();
    }
  }, [id]);

  const loadEmpGrades = async () => {
    setLoadingGrades(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/emp-grade/all`,
         {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
        }
      );
      const grades = response.data.data || [];
      setEmpGrades(grades);
    } catch (error) {
      toast.error("Failed to load employee grades!");
    } finally {
      setLoadingGrades(false);
    }
  };

  const loadPayMatrixData = async () => {
    setLoading(true);
    try {
      const payMatrix = await PayMatrixApi.getById(id);

      setFormData({
        EGM_id: payMatrix.EGM_id?.toString() || "",
        Cell_Index: payMatrix.Cell_Index?.toString() || "",
        Basic_Pay: payMatrix.Basic_Pay?.toString() || "",
      });
    } catch (error) {
      toast.error("Failed to load pay matrix data!");
      navigate("/masters/payroll-pay-structures/pay-matrix");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name == "Cell_Index") {
      processedValue = value.replace(/[^0-9]/g, "");
      if (processedValue.length > 3) {
        processedValue = processedValue.substring(0, 3);
      }
    }

    if (name == "Basic_Pay") {
      // Allow numbers with up to 2 decimal places
      const regex = /^\d*\.?\d{0,2}$/;
      if (value == "" || regex.test(value)) {
        processedValue = value;
      } else {
        return;
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

    if (!formData.EGM_id) {
      newErrors.EGM_id = "Employee grade is required";
    }

    if (!formData.Cell_Index) {
      newErrors.Cell_Index = "Cell index is required";
    } else {
      const cellIndex = parseInt(formData.Cell_Index);
      if (isNaN(cellIndex) || cellIndex < 1) {
        newErrors.Cell_Index = "Cell index must be a positive number";
      }
    }

    if (!formData.Basic_Pay) {
      newErrors.Basic_Pay = "Basic pay is required";
    } else {
      const basicPay = parseFloat(formData.Basic_Pay);
      if (isNaN(basicPay) || basicPay <= 0) {
        newErrors.Basic_Pay = "Basic pay must be a positive number";
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
      title: isEditMode ? "Update Pay Matrix?" : "Create New Pay Matrix?",
      text: isEditMode
        ? "Are you sure you want to update this pay matrix information?"
        : "Are you sure you want to create this new pay matrix?",
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
      const payMatrixData = {
        EGM_id: parseInt(formData.EGM_id),
        Cell_Index: parseInt(formData.Cell_Index),
        Basic_Pay: parseFloat(formData.Basic_Pay),
      };

      if (isEditMode) {
        await PayMatrixApi.update(id, payMatrixData);
        toast.success("Pay matrix updated successfully!");
      } else {
        await PayMatrixApi.create(payMatrixData);
        toast.success("Pay matrix created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/pay-matrix");
      }, 1500);
    } catch (error) {
      console.error("Error saving pay matrix:", error);

      if (error.errors) {
        const newErrors = {};
        Object.keys(error.errors).forEach((key) => {
          const errorKey = key == "EGM_id" ? "EGM_id" : key;
          newErrors[errorKey] = Array.isArray(error.errors[key])
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
            ? "Failed to update pay matrix. Please try again."
            : "Failed to create pay matrix. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/payroll-pay-structures/pay-matrix");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const selectedGrade = empGrades.find(
    (g) => g.EGM_Id?.toString() == formData.EGM_id,
  );

  if (loading || loadingGrades) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay matrix data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-matrix")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Pay Matrix" : "Add New Pay Matrix"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update pay matrix master information"
                : "Create a new pay matrix master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pay Matrix Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Employee Grade Dropdown - Required (Simple dropdown) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Employee Grade <span className="text-red-500">*</span>
                </label>
                {selectedGrade && (
                  <span className="text-xs text-gray-500">
                    Code: {selectedGrade.EGM_Code}
                  </span>
                )}
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="EGM_id"
                  value={formData.EGM_id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.EGM_id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                  required
                >
                  <option value="">Select Employee Grade</option>
                  {empGrades.map((grade) => (
                    <option key={grade.EGM_Id} value={grade.EGM_Id}>
                      {grade.EGM_Name}
                    </option>
                  ))}
                </select>
                {formData.EGM_id && !errors.EGM_id && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.EGM_id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.EGM_id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EGM_id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the employee grade (required)
                </p>
              )}
            </div>

            {/* Cell Index - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Cell Index <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Cell_Index.length > 2
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Cell_Index.length}/3 digits
                </span>
              </div>
              <div className="relative">
                <Grid className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Cell_Index"
                  value={formData.Cell_Index}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Cell_Index ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 1, 2, 3, 4"
                  required
                  maxLength={3}
                />
                {formData.Cell_Index && !errors.Cell_Index && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Cell_Index && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.Cell_Index && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Cell_Index)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy cell index"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Cell_Index ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Cell_Index}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Cell index number (positive integer, e.g., 1, 2, 3...)
                </p>
              )}
            </div>

            {/* Basic Pay - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Basic Pay (₹) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Basic_Pay.length > 8
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Basic_Pay.length} characters
                </span>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Basic_Pay"
                  value={formData.Basic_Pay}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Basic_Pay ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 35000, 42000.50"
                  required
                />
                {formData.Basic_Pay && !errors.Basic_Pay && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Basic_Pay && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.Basic_Pay && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Basic_Pay)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy amount"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Basic_Pay ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Basic_Pay}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Basic pay amount in rupees (supports up to 2 decimal places)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
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
                  {isEditMode ? "Update Pay Matrix" : "Create Pay Matrix"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayMatrix;

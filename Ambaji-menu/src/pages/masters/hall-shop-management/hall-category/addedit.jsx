import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Hash,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallCategoryApi from "../../../services/hallcategoryapi";

const AddEditHallCategory = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Hall Category");

  const nameRef = useRef(null);
  const codeRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    HLC_Name: "",
    HLC_Code: "",
  });

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/masters/hall-shop-management/hall-category";
      const currentMenuItem = menuDetails.find((item) => item.Menu_Links == currentPath);
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) loadData();
    else setTimeout(() => nameRef.current?.focus(), 100);
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallCategoryApi.getById(id);
      const d = res?.data;
      setFormData({
        HLC_Name: d.HLC_Name || "",
        HLC_Code: d.HLC_Code || "",
      });
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-category");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.HLC_Name.trim()) {
      newErrors.HLC_Name = "Category name is required";
    } else if (formData.HLC_Name.length > 50) {
      newErrors.HLC_Name = "Name must not exceed 50 characters";
    }

    if (formData.HLC_Code && formData.HLC_Code.length > 20) {
      newErrors.HLC_Code = "Code must not exceed 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
        if (firstErrorKey == "HLC_Name") {
          nameRef.current?.focus();
        } else if (firstErrorKey == "HLC_Code") {
          codeRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this record?"
        : "Are you sure you want to create this record?",
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
        HLC_Name: formData.HLC_Name.trim(),
        HLC_Code: formData.HLC_Code.trim() || null,
      };

      if (isEditMode) {
        await HallCategoryApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await HallCategoryApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(() => navigate("/masters/hall-shop-management/hall-category"), 1000);
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });
        setErrors(newErrors);
        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey) {
          toast.error(backendErrors[firstErrorKey][0]);
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/hall-shop-management/hall-category");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${pageTitle}` : `Add New ${pageTitle}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update hall category information"
                : "Create a new hall category"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Building className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Category Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name - required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.HLC_Name.length}/50
                </span>
              </div>
              <input
                ref={nameRef}
                type="text"
                name="HLC_Name"
                value={formData.HLC_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, codeRef)}
                maxLength="50"
                placeholder="Enter category name"
                className={`w-full px-4 py-2.5 text-sm border ${errors.HLC_Name ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.HLC_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.HLC_Name}
                </p>
              )}
            </div>

            {/* Code - optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category Code <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.HLC_Code.length}/20
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={codeRef}
                  type="text"
                  name="HLC_Code"
                  value={formData.HLC_Code}
                  onChange={handleInputChange}
                  maxLength="20"
                  placeholder="Enter category code"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLC_Code ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.HLC_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.HLC_Code}
                </p>
              )}
           
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
              className="px-6 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? `Update ${pageTitle}` : `Save ${pageTitle}`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallCategory;
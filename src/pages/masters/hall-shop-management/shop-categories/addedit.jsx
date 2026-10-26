import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopCategoryApi from "../../../services/shopcategoryapi";

const AddEditShopCategory = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Estate Categories");

  const [formData, setFormData] = useState({
    SPC_Name: "",
    SPC_Code: "",
  });

  const nameRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/masters/hall-shop-management/shop-categories";
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
      const res = await ShopCategoryApi.getById(id);
      const d = res?.data;
      setFormData({
        SPC_Name: d.SPC_Name || "",
        SPC_Code: d.SPC_Code || "",
      });
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-categories");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name == "SPC_Name" && value.length > 255) return;
    if (name == "SPC_Code" && value.length > 20) return;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.SPC_Name.trim()) {
      newErrors.SPC_Name = "Name is required";
    } else if (formData.SPC_Name.length > 255) {
      newErrors.SPC_Name = "Name must not exceed 255 characters";
    }
    if (formData.SPC_Code && formData.SPC_Code.length > 20) {
      newErrors.SPC_Code = "Code must not exceed 20 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode ? "Are you sure you want to update this record?" : "Are you sure you want to create this record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const payload = {
        SPC_Name: formData.SPC_Name.trim(),
        SPC_Code: formData.SPC_Code.trim() || undefined,
      };

      if (isEditMode) {
        await ShopCategoryApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await ShopCategoryApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(() => navigate("/masters/hall-shop-management/shop-categories"), 1000);
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });
        setErrors(newErrors);
        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey) toast.error(backendErrors[firstErrorKey][0]);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") { e.preventDefault(); nextRef?.current?.focus(); }
  };

  if (loading) {
    return (
      <div className="p-12 text-center min-h-screen bg-[#f8f9fa]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      {/* Header - Image 3 & 4 Style */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/hall-shop-management/shop-categories")}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${pageTitle}` : `Add ${pageTitle}`}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isEditMode ? "Update the record details" : "Fill in the details to create a new record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-md font-semibold text-gray-900">{pageTitle} Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Name - required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs ml-1">(max 255 characters)</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  name="SPC_Name"
                  value={formData.SPC_Name}
                  onChange={handleChange}
                  onKeyDown={(e) => handleEnterKey(e, codeRef)}
                  maxLength="255"
                  placeholder="e.g. Electronics, Clothing, Food"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-colors ${errors.SPC_Name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                />
                <div className="mt-1 flex justify-between">
                  {errors.SPC_Name && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />{errors.SPC_Name}
                    </p>
                  )}
                  <span className={`text-xs ${formData.SPC_Name.length > 230 ? 'text-orange-500' : 'text-gray-400'} ml-auto`}>
                    {formData.SPC_Name.length}/255
                  </span>
                </div>
              </div>

              {/* Code - optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category Code <span className="text-gray-400 text-xs">(optional)</span>
                  <span className="text-gray-400 text-xs ml-1">(max 20 characters)</span>
                </label>
                <input
                  ref={codeRef}
                  type="text"
                  name="SPC_Code"
                  value={formData.SPC_Code}
                  onChange={handleChange}
                  maxLength="20"
                  placeholder="e.g. CAT001"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-colors ${errors.SPC_Code ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                />
                <div className="mt-1 flex justify-between">
                  {errors.SPC_Code && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />{errors.SPC_Code}
                    </p>
                  )}
                  <span className={`text-xs ${formData.SPC_Code.length > 15 ? 'text-orange-500' : 'text-gray-400'} ml-auto`}>
                    {formData.SPC_Code.length}/20
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Buttons - Image 3 & 4 Style */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/masters/hall-shop-management/shop-categories")}
            className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 flex items-center disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />{isEditMode ? `Update ${pageTitle}` : `Save ${pageTitle}`}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditShopCategory;
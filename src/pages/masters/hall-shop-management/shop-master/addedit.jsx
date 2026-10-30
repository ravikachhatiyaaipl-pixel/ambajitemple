import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Upload,
  X,
  Eye,
  Building,
  MapPin,
  Home,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  CheckCircle,
  XCircle,
  Hash,
  Folder,
  Globe,
  Box,
  Tag,
  Ruler,
  Store,
  FileText,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopApi from "../../../services/shopapi";

const AddEditShop = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Shop");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [fncId, setFncId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs for focus management
  const nameRef = useRef(null);
  const codeRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const categorySearchRef = useRef(null);
  const locationRef = useRef(null);
  const buildingRef = useRef(null);
  const floorRef = useRef(null);
  const blockRef = useRef(null);
  const unitRef = useRef(null);
  const sqFtRef = useRef(null);
  const sqMtRef = useRef(null);
  const facilitiesRef = useRef(null);
  const statusToggleRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  const [formData, setFormData] = useState({
    SPM_Code: "",
    SPM_Name: "",
    SPC_Id: "",
    SPM_Loca: "",
    SPM_Bldg: "",
    SPM_Flor: "",
    SPM_Blok: "",
    SPM_Unit: "",
    SPM_SqFt: "",
    SPM_SqMt: "",
    SPM_Fclt: "",
    SPM_Active: true,
    is_donation_storage: false,
    is_article_storage: false,
    Documents: [],
  });

  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);
  const [documentsToDelete, setDocumentsToDelete] = useState([]);
  const [estateDocs, setEstateDocs] = useState([]);
  const [estateUploaded, setEstateUploaded] = useState([]);

  // Get Fnc_Id from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/masters/hall-shop-management/shop-master";
      const currentMenuItem = menuDetails.find((item) => item.Menu_Links == currentPath);
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
      if (currentMenuItem?.Fnc_Id) setFncId(currentMenuItem.Fnc_Id);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        setCategorySearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categorySearch.trim()) {
      setFilteredCategories(categories);
    } else {
      const searchLower = categorySearch.toLowerCase();
      const filtered = categories.filter(
        (cat) =>
          cat.SPC_Name.toLowerCase().includes(searchLower) ||
          (cat.SPC_Code && cat.SPC_Code.toLowerCase().includes(searchLower))
      );
      setFilteredCategories(filtered);
    }
    setHighlightedIndex(-1);
  }, [categorySearch, categories]);

  useEffect(() => {
    if (isDropdownOpen && categorySearchRef.current) {
      setTimeout(() => categorySearchRef.current.focus(), 0);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen && highlightedIndex >= 0 && listRef.current) {
      const container = listRef.current;
      const item = itemRefs.current[highlightedIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [highlightedIndex, isDropdownOpen]);

  useEffect(() => {
    if (isEditMode) loadData();
    else setTimeout(() => nameRef.current?.focus(), 100);
  }, [id]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await ShopApi.getAllCategories();
      setCategories(res?.data || []);
      setFilteredCategories(res?.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ShopApi.getById(id);
      const d = res?.data;
      setFormData({
        SPM_Code: d.SPM_Code || "",
        SPM_Name: d.SPM_Name || "",
        SPC_Id: d.SPC_Id || "",
        SPM_Loca: d.SPM_Loca || "",
        SPM_Bldg: d.SPM_Bldg || "",
        SPM_Flor: d.SPM_Flor || "",
        SPM_Blok: d.SPM_Blok || "",
        SPM_Unit: d.SPM_Unit || "",
        SPM_SqFt: d.SPM_SqFt || "",
        SPM_SqMt: d.SPM_SqMt || "",
        SPM_Fclt: d.SPM_Fclt || "",
        SPM_Active: d.SPM_Active ?? true,
        is_donation_storage: !!d.is_donation_storage,
        is_article_storage: !!d.is_article_storage,
        Documents: [],
      });
      if (d.SPC_Id && d.category) setCategorySearch(d.category.SPC_Name);
      setExistingDocuments(d.Documents || []);
      setNewDocuments([]);
      setDocumentsToDelete([]);
      loadEstateDocs(id);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-master");
    } finally {
      setLoading(false);
    }
  };

  const loadEstateDocs = async (shopId) => {
    if (!shopId) return;
    try {
      const res = await ShopApi.getEstateDocuments(shopId);
      setEstateDocs(res?.data?.mapped || []);
      setEstateUploaded(res?.data?.uploaded || []);
    } catch (e) {
      setEstateDocs([]);
      setEstateUploaded([]);
    }
  };

  const handleEstateUpload = async (e, doc) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("document_id", doc.document_id);
      fd.append("file", file);
      const res = await ShopApi.uploadEstateDocument(id, fd);
      if (res?.success === false) {
        toast.error(res.message || "Upload failed");
        return;
      }
      toast.success(`${doc.name} uploaded`);
      loadEstateDocs(id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type == "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryKeyDown = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setIsDropdownOpen(true);
      setCategorySearch("");
      setHighlightedIndex(-1);
      setTimeout(() => categorySearchRef.current?.focus(), 0);
    }
  };

  const handleCategorySearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredCategories.length > 0) {
        setHighlightedIndex(0);
        setTimeout(() => itemRefs.current[0]?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setCategorySearch("");
      categoryButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredCategories.length > 0 && highlightedIndex >= 0) {
        handleCategorySelect(filteredCategories[highlightedIndex]);
      } else if (filteredCategories.length > 0) {
        handleCategorySelect(filteredCategories[0]);
      }
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setCategorySearch("");
    }
  };

  const handleCategoryItemKeyDown = (e, category, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredCategories.length) {
        setHighlightedIndex(nextIndex);
        setTimeout(() => itemRefs.current[nextIndex]?.focus(), 0);
      } else {
        setHighlightedIndex(-1);
        setTimeout(() => categorySearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedIndex(-1);
        setTimeout(() => categorySearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedIndex(prevIndex);
        setTimeout(() => itemRefs.current[prevIndex]?.focus(), 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleCategorySelect(category);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setCategorySearch("");
      categoryButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setCategorySearch("");
    }
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, SPC_Id: category.SPC_Id }));
    setCategorySearch(category.SPC_Name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    if (errors.SPC_Id) setErrors((prev) => ({ ...prev, SPC_Id: "" }));
    setTimeout(() => locationRef.current?.focus(), 100);
  };

  const handleCategorySearchChange = (e) => {
    setCategorySearch(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length == 0) return;
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error("Some files exceed 5MB limit");
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidTypes = files.filter((file) => !validTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      toast.error("Only JPG, JPEG, PNG, and WEBP files are allowed");
      return;
    }
    setNewDocuments((prev) => [...prev, ...files]);
    if (errors.Documents) setErrors((prev) => ({ ...prev, Documents: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewDocument = (index) => {
    setNewDocuments((prev) => prev.filter((_, i) => i != index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.SPM_Name.trim()) newErrors.SPM_Name = "Shop name is required";
    else if (formData.SPM_Name.length > 100) newErrors.SPM_Name = "Name must not exceed 100 characters";
    if (!formData.SPC_Id) newErrors.SPC_Id = "Please select a category";
    if (formData.SPM_Code && formData.SPM_Code.length > 20) newErrors.SPM_Code = "Code must not exceed 20 characters";
    if (formData.SPM_Loca && formData.SPM_Loca.length > 255) newErrors.SPM_Loca = "Location must not exceed 255 characters";
    if (formData.SPM_Bldg && formData.SPM_Bldg.length > 100) newErrors.SPM_Bldg = "Building must not exceed 100 characters";
    if (formData.SPM_Flor && formData.SPM_Flor.length > 5) newErrors.SPM_Flor = "Floor must not exceed 5 characters";
    if (formData.SPM_Blok && formData.SPM_Blok.length > 3) newErrors.SPM_Blok = "Block must not exceed 3 characters";
    if (formData.SPM_Fclt && formData.SPM_Fclt.length > 255) newErrors.SPM_Fclt = "Facilities must not exceed 255 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) toast.error(errors[firstErrorKey]);
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
      const formDataObj = new FormData();
      if (fncId) formDataObj.append("Fnc_Id", fncId);
      formDataObj.append("SPM_Name", formData.SPM_Name.trim());
      formDataObj.append("SPC_Id", formData.SPC_Id);
      if (formData.SPM_Code) formDataObj.append("SPM_Code", formData.SPM_Code.trim());
      if (formData.SPM_Loca) formDataObj.append("SPM_Loca", formData.SPM_Loca.trim());
      if (formData.SPM_Bldg) formDataObj.append("SPM_Bldg", formData.SPM_Bldg.trim());
      if (formData.SPM_Flor) formDataObj.append("SPM_Flor", formData.SPM_Flor.trim());
      if (formData.SPM_Blok) formDataObj.append("SPM_Blok", formData.SPM_Blok.trim());
      if (formData.SPM_Unit) formDataObj.append("SPM_Unit", formData.SPM_Unit);
      if (formData.SPM_SqFt) formDataObj.append("SPM_SqFt", formData.SPM_SqFt);
      if (formData.SPM_SqMt) formDataObj.append("SPM_SqMt", formData.SPM_SqMt);
      if (formData.SPM_Fclt) formDataObj.append("SPM_Fclt", formData.SPM_Fclt.trim());
      formDataObj.append("SPM_Active", formData.SPM_Active ? "1" : "0");
      formDataObj.append("is_donation_storage", formData.is_donation_storage ? "1" : "0");
      formDataObj.append("is_article_storage", formData.is_article_storage ? "1" : "0");
      newDocuments.forEach((file) => formDataObj.append("Documents[]", file));
      if (isEditMode && documentsToDelete.length > 0) {
        formDataObj.append("DocumentsToDelete", JSON.stringify(documentsToDelete));
      }
      if (isEditMode) {
        await ShopApi.update(id, formDataObj);
        toast.success("Updated successfully!");
      } else {
        await ShopApi.create(formDataObj);
        toast.success("Created successfully!");
      }
      setTimeout(() => navigate("/masters/hall-shop-management/shop-master"), 1000);
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

  const handleCancel = () => navigate("/masters/hall-shop-management/shop-master");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading shop data...</p>
      </div>
    );
  }

  const getSelectedCategoryName = () => {
    if (formData.SPC_Id) {
      const selected = categories.find((c) => c.SPC_Id == parseInt(formData.SPC_Id));
      return selected ? selected.SPC_Name : "";
    }
    return "";
  };

  const Toggle = ({ checked, onChange, color = "green", name }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        className={`w-12 h-6 rounded-full transition-colors duration-300 ${
          checked
            ? color === "amber"
              ? "bg-amber-500"
              : color === "emerald"
              ? "bg-emerald-500"
              : "bg-green-500"
            : "bg-gray-300"
        }`}
      ></div>
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          checked ? "translate-x-6" : ""
        }`}
      ></div>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white transition-colors shadow-sm border border-gray-200"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {isEditMode ? `Edit ${pageTitle}` : `Add New ${pageTitle}`}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {isEditMode
                  ? "Update shop master information"
                  : "Create a new shop master record"}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Store className="h-3.5 w-3.5" />
            {isEditMode ? "Edit Mode" : "Create Mode"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-sm">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Shop Information</h2>
                  <p className="text-xs text-gray-500">Basic details of the shop master record</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Shop Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${formData.SPM_Name.length > 90 ? "text-amber-600" : "text-gray-400"}`}>
                    {formData.SPM_Name.length}/100
                  </span>
                </div>
                <input
                  ref={nameRef}
                  type="text"
                  name="SPM_Name"
                  value={formData.SPM_Name}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, codeRef)}
                  maxLength="100"
                  placeholder="e.g. Main Gift Shop"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all outline-none ${
                    errors.SPM_Name
                      ? "border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50/30"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {errors.SPM_Name && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPM_Name}
                  </p>
                )}
              </div>

              {/* Shop Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Shop Code <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <span className="text-xs text-gray-400">{formData.SPM_Code.length}/20</span>
                </div>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={codeRef}
                    type="text"
                    name="SPM_Code"
                    value={formData.SPM_Code}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, categoryButtonRef)}
                    maxLength="20"
                    placeholder="e.g. SH-001"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg transition-all outline-none ${
                      errors.SPM_Code
                        ? "border-red-300 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.SPM_Code && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPM_Code}
                  </p>
                )}
              </div>

              {/* Category Selection */}
              <div ref={dropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  {loadingCategories ? (
                    <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-gray-500">Loading categories...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        ref={categoryButtonRef}
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        onKeyDown={handleCategoryKeyDown}
                        className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white transition-all ${
                          errors.SPC_Id ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        {formData.SPC_Id ? (
                          <span className="text-gray-900 font-medium">{getSelectedCategoryName()}</span>
                        ) : (
                          <span className="text-gray-500">Select a Category</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {isDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </>
                  )}
                  {errors.SPC_Id && (
                    <AlertCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && !loadingCategories && (
                  <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={categorySearchRef}
                          type="text"
                          value={categorySearch}
                          onChange={handleCategorySearchChange}
                          onKeyDown={handleCategorySearchKeyDown}
                          placeholder="Search categories..."
                          className="w-full pl-10 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {categorySearch && (
                          <button
                            type="button"
                            onClick={() => setCategorySearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div ref={listRef} className="overflow-y-auto max-h-64 py-1">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat, idx) => {
                          const isSelected = formData.SPC_Id == cat.SPC_Id;
                          return (
                            <button
                              key={cat.SPC_Id}
                              ref={(el) => (itemRefs.current[idx] = el)}
                              type="button"
                              onClick={() => handleCategorySelect(cat)}
                              onKeyDown={(e) => handleCategoryItemKeyDown(e, cat, idx)}
                              className={`w-full px-4 py-2.5 text-left transition-colors focus:outline-none ${
                                highlightedIndex == idx
                                  ? "bg-blue-100"
                                  : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                              tabIndex={0}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-sm font-medium truncate ${
                                      isSelected ? "text-blue-700" : "text-gray-900"
                                    }`}
                                  >
                                    {cat.SPC_Name}
                                  </div>
                                  {cat.SPC_Code && (
                                    <div className="text-xs text-gray-500 truncate">
                                      Code: {cat.SPC_Code}
                                    </div>
                                  )}
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p className="text-sm font-medium">No categories found</p>
                          <p className="text-xs mt-0.5">Try a different search term</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 p-2.5 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600 px-2">
                        <span>{filteredCategories.length} results</span>
                        <span>Total: {categories.length}</span>
                      </div>
                    </div>
                  </div>
                )}
                {errors.SPC_Id && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPC_Id}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Location <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <span className="text-xs text-gray-400">{formData.SPM_Loca.length}/255</span>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={locationRef}
                    type="text"
                    name="SPM_Loca"
                    value={formData.SPM_Loca}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, buildingRef)}
                    maxLength="255"
                    placeholder="e.g. Near Main Gate"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
                      errors.SPM_Loca
                        ? "border-red-300 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.SPM_Loca && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPM_Loca}
                  </p>
                )}
              </div>

              {/* Building */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Building <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <span className="text-xs text-gray-400">{formData.SPM_Bldg.length}/100</span>
                </div>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={buildingRef}
                    type="text"
                    name="SPM_Bldg"
                    value={formData.SPM_Bldg}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, floorRef)}
                    maxLength="100"
                    placeholder="e.g. Block A"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
                      errors.SPM_Bldg
                        ? "border-red-300 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.SPM_Bldg && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPM_Bldg}
                  </p>
                )}
              </div>

                            {/* Floor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Floor <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  ref={floorRef}
                  type="text"
                  name="SPM_Flor"
                  value={formData.SPM_Flor}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, blockRef)}
                  maxLength="5"
                  placeholder="e.g. 2, GF"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
                    errors.SPM_Flor
                      ? "border-red-300 focus:ring-2 focus:ring-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {errors.SPM_Flor && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPM_Flor}
                  </p>
                )}
              </div>

              {/* Block */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Block <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  ref={blockRef}
                  type="text"
                  name="SPM_Blok"
                  value={formData.SPM_Blok}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, unitRef)}
                  maxLength="3"
                  placeholder="e.g. A, B"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
                    errors.SPM_Blok
                      ? "border-red-300 focus:ring-2 focus:ring-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {errors.SPM_Blok && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPM_Blok}
                  </p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Unit <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={unitRef}
                    type="number"
                    name="SPM_Unit"
                    value={formData.SPM_Unit}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, sqFtRef)}
                    placeholder="Unit no."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Sq Ft */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sq Ft <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={sqFtRef}
                    type="number"
                    step="0.01"
                    name="SPM_SqFt"
                    value={formData.SPM_SqFt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, sqMtRef)}
                    placeholder="Area in sq ft"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Sq Mt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sq Mt <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={sqMtRef}
                    type="number"
                    step="0.01"
                    name="SPM_SqMt"
                    value={formData.SPM_SqMt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, facilitiesRef)}
                    placeholder="Area in sq mt"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Facilities */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Facilities <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <span className="text-xs text-gray-400">{formData.SPM_Fclt.length}/255</span>
                </div>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={facilitiesRef}
                    type="text"
                    name="SPM_Fclt"
                    value={formData.SPM_Fclt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, statusToggleRef)}
                    maxLength="255"
                    placeholder="e.g. Parking, Lift, AC, CCTV"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
                      errors.SPM_Fclt
                        ? "border-red-300 focus:ring-2 focus:ring-red-500"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.SPM_Fclt && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.SPM_Fclt}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Storage & Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/60 to-orange-50/60">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-3 shadow-sm">
                  <Box className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Storage & Status</h2>
                  <p className="text-xs text-gray-500">Configure storage purpose and availability</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Donation Storage Toggle */}
              <div className="flex items-center justify-between p-4 bg-amber-50/40 border border-amber-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Box className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-800">
                      Use as Donation Storage
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Estate item ko donation storage ke liye use karna hai
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={!!formData.is_donation_storage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_donation_storage: e.target.checked }))
                  }
                  color="amber"
                  name="is_donation_storage"
                />
              </div>

              {/* Article Storage Toggle */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Folder className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-800">
                      Use as Article Donation Storage
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Estate item ko article donation storage ke liye use karna hai
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={!!formData.is_article_storage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_article_storage: e.target.checked }))
                  }
                  color="emerald"
                  name="is_article_storage"
                />
              </div>

              {/* Status Toggle */}
              <div
                ref={statusToggleRef}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      formData.SPM_Active ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {formData.SPM_Active ? (
                      <CheckCircle className="h-4 w-4 text-green-700" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-700" />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Status</label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Record availability in the system
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      formData.SPM_Active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {formData.SPM_Active ? "Active" : "Inactive"}
                  </span>
                  <Toggle
                    checked={formData.SPM_Active}
                    onChange={handleInputChange}
                    color="green"
                    name="SPM_Active"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-pink-50/60">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 shadow-sm">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Shop Documents</h2>
                  <p className="text-xs text-gray-500">Upload images related to this shop</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Existing Documents */}
              {isEditMode && existingDocuments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Documents
                    <span className="text-xs text-gray-400 ml-2">
                      ({existingDocuments.length})
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {existingDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm group hover:bg-gray-100/60 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 text-xs truncate flex-1">
                          {doc.split("/").pop()}
                        </span>
                        <a
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingDocument(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Documents
                  <span className="text-gray-400 text-xs ml-1">(optional)</span>
                  <span className="text-gray-400 text-xs ml-2">
                    JPG, PNG, WEBP · Max 5MB each
                  </span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag files
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {newDocuments.length > 0
                        ? `${newDocuments.length} file(s) selected`
                        : "No files selected yet"}
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {errors.Documents && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.Documents}
                  </p>
                )}

                {newDocuments.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {newDocuments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-200 text-sm"
                      >
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-gray-700 text-xs truncate flex-1">
                          {file.name}
                        </span>
                        <span className="text-gray-400 text-[10px] flex-shrink-0">
                          {(file.size / 1024).toFixed(0)}KB
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewDocument(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 flex-shrink-0"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4 text-blue-500" />
                <span>
                  <span className="text-red-500 font-semibold">*</span> Required fields must be
                  filled
                </span>
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
                  className="px-6 py-2.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center transition-all"
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
                  className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditShop;
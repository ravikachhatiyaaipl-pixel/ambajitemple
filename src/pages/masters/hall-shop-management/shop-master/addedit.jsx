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
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/shop-master";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories when search changes
  useEffect(() => {
    if (!categorySearch.trim()) {
      setFilteredCategories(categories);
    } else {
      const searchLower = categorySearch.toLowerCase();
      const filtered = categories.filter(
        (cat) =>
          cat.SPC_Name.toLowerCase().includes(searchLower) ||
          (cat.SPC_Code && cat.SPC_Code.toLowerCase().includes(searchLower)),
      );
      setFilteredCategories(filtered);
    }
    setHighlightedIndex(-1);
  }, [categorySearch, categories]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && categorySearchRef.current) {
      setTimeout(() => categorySearchRef.current.focus(), 0);
    }
  }, [isDropdownOpen]);

  // Scroll highlighted item into view
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

      if (d.SPC_Id && d.category) {
        setCategorySearch(d.category.SPC_Name);
      }

      setExistingDocuments(d.Documents || []);
      setNewDocuments([]);
      setDocumentsToDelete([]);

      // Estate documents (central document master - module ESTATE)
      loadEstateDocs(id);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-master");
    } finally {
      setLoading(false);
    }
  };

  // Estate documents (central document master - module ESTATE)
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
    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Category dropdown keyboard handlers
  const handleCategoryKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
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
        setTimeout(() => {
          if (itemRefs.current[0]) {
            itemRefs.current[0].focus();
          }
        }, 0);
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
        setTimeout(() => {
          if (itemRefs.current[nextIndex]) {
            itemRefs.current[nextIndex].focus();
          }
        }, 0);
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
        setTimeout(() => {
          if (itemRefs.current[prevIndex]) {
            itemRefs.current[prevIndex].focus();
          }
        }, 0);
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
    setFormData((prev) => ({
      ...prev,
      SPC_Id: category.SPC_Id,
    }));
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
    const invalidTypes = files.filter(
      (file) => !validTypes.includes(file.type),
    );
    if (invalidTypes.length > 0) {
      toast.error("Only JPG, JPEG, PNG, and WEBP files are allowed");
      return;
    }

    setNewDocuments((prev) => [...prev, ...files]);
    if (errors.Documents) setErrors((prev) => ({ ...prev, Documents: "" }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveNewDocument = (index) => {
    setNewDocuments((prev) => prev.filter((_, i) => i != index));
  };

  const handleRemoveExistingDocument = (index) => {
    const docUrl = existingDocuments[index];
    setDocumentsToDelete((prev) => [...prev, docUrl]);
    setExistingDocuments((prev) => prev.filter((_, i) => i != index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.SPM_Name.trim()) {
      newErrors.SPM_Name = "Shop name is required";
    } else if (formData.SPM_Name.length > 100) {
      newErrors.SPM_Name = "Name must not exceed 100 characters";
    }

    if (!formData.SPC_Id) {
      newErrors.SPC_Id = "Please select a category";
    }

    if (formData.SPM_Code && formData.SPM_Code.length > 20) {
      newErrors.SPM_Code = "Code must not exceed 20 characters";
    }

    if (formData.SPM_Loca && formData.SPM_Loca.length > 255) {
      newErrors.SPM_Loca = "Location must not exceed 255 characters";
    }

    if (formData.SPM_Bldg && formData.SPM_Bldg.length > 100) {
      newErrors.SPM_Bldg = "Building must not exceed 100 characters";
    }

    if (formData.SPM_Flor && formData.SPM_Flor.length > 5) {
      newErrors.SPM_Flor = "Floor must not exceed 5 characters";
    }

    if (formData.SPM_Blok && formData.SPM_Blok.length > 3) {
      newErrors.SPM_Blok = "Block must not exceed 3 characters";
    }

    if (formData.SPM_Fclt && formData.SPM_Fclt.length > 255) {
      newErrors.SPM_Fclt = "Facilities must not exceed 255 characters";
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
        if (firstErrorKey == "SPM_Name") {
          nameRef.current?.focus();
        } else if (firstErrorKey == "SPM_Code") {
          codeRef.current?.focus();
        } else if (firstErrorKey == "SPC_Id") {
          categoryButtonRef.current?.focus();
        } else if (firstErrorKey == "SPM_Loca") {
          locationRef.current?.focus();
        } else if (firstErrorKey == "SPM_Bldg") {
          buildingRef.current?.focus();
        } else if (firstErrorKey == "SPM_Flor") {
          floorRef.current?.focus();
        } else if (firstErrorKey == "SPM_Blok") {
          blockRef.current?.focus();
        } else if (firstErrorKey == "SPM_Fclt") {
          facilitiesRef.current?.focus();
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
      const formDataObj = new FormData();

      if (fncId) {
        formDataObj.append("Fnc_Id", fncId);
      }

      formDataObj.append("SPM_Name", formData.SPM_Name.trim());
      formDataObj.append("SPC_Id", formData.SPC_Id);

      if (formData.SPM_Code)
        formDataObj.append("SPM_Code", formData.SPM_Code.trim());
      if (formData.SPM_Loca)
        formDataObj.append("SPM_Loca", formData.SPM_Loca.trim());
      if (formData.SPM_Bldg)
        formDataObj.append("SPM_Bldg", formData.SPM_Bldg.trim());
      if (formData.SPM_Flor)
        formDataObj.append("SPM_Flor", formData.SPM_Flor.trim());
      if (formData.SPM_Blok)
        formDataObj.append("SPM_Blok", formData.SPM_Blok.trim());
      if (formData.SPM_Unit) formDataObj.append("SPM_Unit", formData.SPM_Unit);
      if (formData.SPM_SqFt) formDataObj.append("SPM_SqFt", formData.SPM_SqFt);
      if (formData.SPM_SqMt) formDataObj.append("SPM_SqMt", formData.SPM_SqMt);
      if (formData.SPM_Fclt)
        formDataObj.append("SPM_Fclt", formData.SPM_Fclt.trim());

      formDataObj.append("SPM_Active", formData.SPM_Active ? "1" : "0");
  formDataObj.append("is_donation_storage", formData.is_donation_storage ? "1" : "0");
formDataObj.append("is_article_storage", formData.is_article_storage ? "1" : "0");

      newDocuments.forEach((file) => {
        formDataObj.append("Documents[]", file);
      });

      if (isEditMode && documentsToDelete.length > 0) {
        formDataObj.append(
          "DocumentsToDelete",
          JSON.stringify(documentsToDelete),
        );
      }

      if (isEditMode) {
        await ShopApi.update(id, formDataObj);
        toast.success("Updated successfully!");
      } else {
        await ShopApi.create(formDataObj);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/shop-master"),
        1000,
      );
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
    navigate("/masters/hall-shop-management/shop-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading shop data...</p>
      </div>
    );
  }

  const getSelectedCategoryName = () => {
    if (formData.SPC_Id) {
      const selected = categories.find(
        (c) => c.SPC_Id == parseInt(formData.SPC_Id),
      );
      return selected ? selected.SPC_Name : "";
    }
    return "";
  };

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
                ? "Update shop master information"
                : "Create a new shop master record"}
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
              Shop Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-400">
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
                placeholder="Enter shop name"
                className={`w-full px-4 py-2.5 text-sm border ${errors.SPM_Name ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.SPM_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPM_Name}
                </p>
              )}
            </div>

            {/* Shop Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Shop Code <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.SPM_Code.length}/20
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={codeRef}
                  type="text"
                  name="SPM_Code"
                  value={formData.SPM_Code}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, categoryButtonRef)}
                  maxLength="20"
                  placeholder="Enter shop code"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPM_Code ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPM_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPM_Code}
                </p>
              )}
            </div>

            {/* Category Selection - Searchable Dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
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
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.SPC_Id ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.SPC_Id ? (
                        <span className="text-gray-900">
                          {getSelectedCategoryName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Category</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.SPC_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Category Dropdown Menu */}
              {isDropdownOpen && !loadingCategories && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={categorySearchRef}
                        type="text"
                        value={categorySearch}
                        onChange={handleCategorySearchChange}
                        onKeyDown={handleCategorySearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={listRef} className="overflow-y-auto max-h-64">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat, idx) => {
                        const isSelected = formData.SPC_Id == cat.SPC_Id;

                        return (
                          <button
                            key={cat.SPC_Id}
                            ref={(el) => {
                              itemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleCategorySelect(cat)}
                            onKeyDown={(e) =>
                              handleCategoryItemKeyDown(e, cat, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              highlightedIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                C{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {cat.SPC_Name}
                                </div>
                               
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-600 ml-2" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No categories found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredCategories.length} categories found</span>
                      <span>Total: {categories.length} categories</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.SPC_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPC_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a category from the list (required)
              </p>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Location <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.SPM_Loca.length}/255
                </span>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={locationRef}
                  type="text"
                  name="SPM_Loca"
                  value={formData.SPM_Loca}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, buildingRef)}
                  maxLength="255"
                  placeholder="Enter location"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPM_Loca ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPM_Loca && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPM_Loca}
                </p>
              )}
            </div>

            {/* Building */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Building <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.SPM_Bldg.length}/100
                </span>
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={buildingRef}
                  type="text"
                  name="SPM_Bldg"
                  value={formData.SPM_Bldg}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, floorRef)}
                  maxLength="100"
                  placeholder="Enter building"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPM_Bldg ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPM_Bldg && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPM_Bldg}
                </p>
              )}
            </div>

            {/* Floor & Block */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className={`w-full px-4 py-2.5 text-sm border ${errors.SPM_Flor ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.SPM_Flor && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPM_Flor}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className={`w-full px-4 py-2.5 text-sm border ${errors.SPM_Blok ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.SPM_Blok && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPM_Blok}
                </p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                ref={unitRef}
                type="number"
                name="SPM_Unit"
                value={formData.SPM_Unit}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, sqFtRef)}
                placeholder="Unit no."
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Sq Ft */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sq Ft <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                ref={sqFtRef}
                type="number"
                step="0.01"
                name="SPM_SqFt"
                value={formData.SPM_SqFt}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, sqMtRef)}
                placeholder="Area in sq ft"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Sq Mt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sq Mt <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                ref={sqMtRef}
                type="number"
                step="0.01"
                name="SPM_SqMt"
                value={formData.SPM_SqMt}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, facilitiesRef)}
                placeholder="Area in sq mt"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Facilities */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Facilities <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.SPM_Fclt.length}/255
                </span>
              </div>
              <input
                ref={facilitiesRef}
                type="text"
                name="SPM_Fclt"
                value={formData.SPM_Fclt}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, statusToggleRef)}
                maxLength="255"
                placeholder="Parking, Lift, AC"
                className={`w-full px-4 py-2.5 text-sm border ${errors.SPM_Fclt ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.SPM_Fclt && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPM_Fclt}
                </p>
              )}
            </div>

            {/* Donation Storage Flag (Estate Master se donation storage) */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Use as Donation Storage
                </label>
                <p className="text-[10px] text-gray-500">
                  Is estate item ko donation storage ke liye use karna hai
                </p>
              </div>
              <label className="flex cursor-pointer">
                <input
                  type="checkbox"
                  name="is_donation_storage"
                  checked={!!formData.is_donation_storage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_donation_storage: e.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`block w-14 h-8 rounded-full ${
                    formData.is_donation_storage ? "bg-amber-500" : "bg-gray-300"
                  } transition-colors duration-200`}
                ></div>
                <div
                  className={`pointer-events-none absolute left-1 top-1 bg-white border-2 border-gray-200 rounded-full h-6 w-6 transition-transform duration-200 ${
                    formData.is_donation_storage ? "translate-x-6" : ""
                  }`}
                ></div>
              </label>
            </div>

            {/* Article Storage Flag (Estate Master se article donation storage) */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Use as Article Donation Storage
                </label>
                <p className="text-[10px] text-gray-500">
                  Is estate item ko article donation storage ke liye use karna hai
                </p>
              </div>
              <label className="flex cursor-pointer">
                <input
                  type="checkbox"
                  name="is_article_storage"
                  checked={!!formData.is_article_storage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_article_storage: e.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`block w-14 h-8 rounded-full ${
                    formData.is_article_storage ? "bg-emerald-500" : "bg-gray-300"
                  } transition-colors duration-200`}
                ></div>
                <div
                  className={`pointer-events-none absolute left-1 top-1 bg-white border-2 border-gray-200 rounded-full h-6 w-6 transition-transform duration-200 ${
                    formData.is_article_storage ? "translate-x-6" : ""
                  }`}
                ></div>
              </label>
            </div>

            {/* Estate Documents (central document master - module ESTATE) */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Estate Documents
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Mapped documents from Document Mapping screen will appear
                    here for upload
                  </p>
                </div>
                {estateDocs.length > 0 && (
                  <span className="text-[10px] text-gray-500">
                    {estateDocs.length} mapped
                  </span>
                )}
              </div>

              {estateDocs.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No document mapped for this estate item.{" "}
                  <span className="font-medium text-blue-600">
                    Document Mapping
                  </span>{" "}
                  Map from Document Mapping screen (module: Estate Master).
                </p>
              ) : (
                <div className="space-y-2">
                  {estateDocs.map((d) => (
                    <div
                      key={d.document_id}
                      className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2"
                    >
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          d.is_required
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.is_required ? "Required" : "Optional"}
                      </span>
                      <span className="text-xs font-medium text-gray-800 flex-1">
                        {d.name}
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:underline cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={(e) => handleEstateUpload(e, d)}
                        />
                      </label>
                    </div>
                  ))}

                  {estateUploaded.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[10px] font-medium text-gray-500 mb-1">
                        Uploaded
                      </p>
                      {estateUploaded.map((u) => (
                        <a
                          key={u.Doc_Lib}
                          href={u.Doc_Upload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[11px] text-blue-600 hover:underline truncate"
                        >
                          {u.Description}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <div ref={statusToggleRef} className="flex items-center justify-between pt-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="SPM_Active"
                    checked={formData.SPM_Active}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        e.preventDefault();
                        setFormData((prev) => ({
                          ...prev,
                          SPM_Active: !prev.SPM_Active,
                        }));
                      } else if (e.key == "Tab") {
                        e.preventDefault();
                        saveButtonRef.current?.focus();
                      }
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.SPM_Active ? "bg-green-500" : "bg-gray-300"
                    } transition-colors duration-200`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                      formData.SPM_Active ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-sm font-medium">
                  {formData.SPM_Active ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Inactive
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Upload className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          </div>

          {isEditMode && existingDocuments.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Documents
              </label>
              <div className="flex flex-wrap gap-2">
                {existingDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                  >
                    <span className="text-gray-600 max-w-[150px] truncate">
                      {doc.split("/").pop()}
                    </span>
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Documents <span className="text-gray-400 text-xs">(optional)</span>
              <span className="text-gray-400 text-xs ml-1">
                (JPG, PNG, WEBP, Max 5MB)
              </span>
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 text-sm bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
              >
                <Upload className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Choose Files</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                {newDocuments.length} file(s)
              </span>
            </div>
            {errors.Documents && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.Documents}
              </p>
            )}

            {newDocuments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {newDocuments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-sm"
                  >
                    <span className="text-gray-600 max-w-[120px] truncate">
                      {file.name}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {(file.size / 1024).toFixed(0)}KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

export default AddEditShop;

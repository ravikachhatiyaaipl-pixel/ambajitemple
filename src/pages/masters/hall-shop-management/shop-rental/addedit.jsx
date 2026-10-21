import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Layers,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopRentalApi from "../../../services/shoprentalapi";

const AddEditShopRental = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Shop Rental");
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shopSearch, setShopSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs for focus management
  const shopButtonRef = useRef(null);
  const shopSearchRef = useRef(null);
  const dateRef = useRef(null);
  const baseRentRef = useRef(null);
  const sdMntRef = useRef(null);
  const endDateRef = useRef(null);
  const taxPRef = useRef(null);
  const ltFeRef = useRef(null);
  const dueDateRef = useRef(null);
  const statusToggleRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  const [formData, setFormData] = useState({
    SPM_Id: "",
    SPR_Date: "",
    SPR_BsRnt: "",
    SPR_SDMnt: "",
    SPR_Dura: "",
    SPR_EdDt: "",
    SPR_TaxP: "",
    SPR_LtFe: "",
    SPR_DuDt: "",
    SPR_Status: true,
  });

  // Get Fnc_Id from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/shop-rental";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
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
        setShopSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load shops
  useEffect(() => {
    loadShops();
  }, []);

  // Filter shops when search changes
  useEffect(() => {
    if (!shopSearch.trim()) {
      setFilteredShops(shops);
    } else {
      const searchLower = shopSearch.toLowerCase();
      const filtered = shops.filter(
        (shop) =>
          shop.SPM_Name?.toLowerCase().includes(searchLower) ||
          (shop.SPM_Code && shop.SPM_Code.toLowerCase().includes(searchLower)),
      );
      setFilteredShops(filtered);
    }
    setHighlightedIndex(-1);
  }, [shopSearch, shops]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && shopSearchRef.current) {
      setTimeout(() => shopSearchRef.current.focus(), 0);
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
    else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, SPR_Date: today }));
      setTimeout(() => shopButtonRef.current?.focus(), 100);
    }
  }, [id]);

  const loadShops = async () => {
    setLoadingShops(true);
    try {
      const res = await ShopRentalApi.getAllShops();
      setShops(res?.data || []);
      setFilteredShops(res?.data || []);
    } catch (error) {
      console.error("Error loading shops:", error);
      toast.error("Failed to load shops");
    } finally {
      setLoadingShops(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ShopRentalApi.getById(id);
      const d = res?.data;
      setFormData({
        SPM_Id: d.SPM_Id || "",
        SPR_Date: d.SPR_Date || "",
        SPR_BsRnt: d.SPR_BsRnt || "",
        SPR_SDMnt: d.SPR_SDMnt || "",
        SPR_Dura: d.SPR_Dura || "",
        SPR_EdDt: d.SPR_EdDt || "",
        SPR_TaxP: d.SPR_TaxP || "",
        SPR_LtFe: d.SPR_LtFe || "",
        SPR_DuDt: d.SPR_DuDt || "",
        SPR_Status: d.SPR_Status ?? true,
      });

      if (d.SPM_Id && d.shop) {
        setShopSearch(d.shop.SPM_Name);
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-rental");
    } finally {
      setLoading(false);
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

  // Shop dropdown keyboard handlers
  const handleShopKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsDropdownOpen(true);
      setShopSearch("");
      setHighlightedIndex(-1);
      setTimeout(() => shopSearchRef.current?.focus(), 0);
    }
  };

  const handleShopSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredShops.length > 0) {
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
      setShopSearch("");
      shopButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredShops.length > 0 && highlightedIndex >= 0) {
        handleShopSelect(filteredShops[highlightedIndex]);
      } else if (filteredShops.length > 0) {
        handleShopSelect(filteredShops[0]);
      }
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setShopSearch("");
    }
  };

  const handleShopItemKeyDown = (e, shop, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredShops.length) {
        setHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (itemRefs.current[nextIndex]) {
            itemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setHighlightedIndex(-1);
        setTimeout(() => shopSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedIndex(-1);
        setTimeout(() => shopSearchRef.current?.focus(), 0);
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
      handleShopSelect(shop);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setShopSearch("");
      shopButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      setShopSearch("");
    }
  };

  const handleShopSelect = (shop) => {
    setFormData((prev) => ({
      ...prev,
      SPM_Id: shop.SPM_Id,
    }));
    setShopSearch(shop.SPM_Name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    if (errors.SPM_Id) setErrors((prev) => ({ ...prev, SPM_Id: "" }));
    setTimeout(() => dateRef.current?.focus(), 100);
  };

  const handleShopSearchChange = (e) => {
    setShopSearch(e.target.value);
    setIsDropdownOpen(true);
  };

  // Tenure auto: start + end date se months nikalo
  const derivedDuration = useMemo(() => {
    if (!formData.SPR_Date || !formData.SPR_EdDt) return 0;
    const s = new Date(formData.SPR_Date);
    const e = new Date(formData.SPR_EdDt);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    const months =
      (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    return months > 0 ? months : 0;
  }, [formData.SPR_Date, formData.SPR_EdDt]);

  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.SPM_Id) {
      newErrors.SPM_Id = "Please select a shop";
    }

    if (!formData.SPR_Date) {
      newErrors.SPR_Date = "Rental date is required";
    }

    if (!formData.SPR_BsRnt) {
      newErrors.SPR_BsRnt = "Base rent is required";
    } else if (parseFloat(formData.SPR_BsRnt) < 0) {
      newErrors.SPR_BsRnt = "Base rent cannot be negative";
    }

    if (
      formData.SPR_SDMnt &&
      (parseInt(formData.SPR_SDMnt) < 0 || parseInt(formData.SPR_SDMnt) > 99)
    ) {
      newErrors.SPR_SDMnt = "Months must be between 0 and 99";
    }

    if (!formData.SPR_EdDt) {
      newErrors.SPR_EdDt = "Lease end date is required";
    } else if (
      formData.SPR_Date &&
      new Date(formData.SPR_EdDt) <= new Date(formData.SPR_Date)
    ) {
      newErrors.SPR_EdDt = "End date must be after start date";
    } else if (derivedDuration > 120) {
      newErrors.SPR_EdDt = "Tenure cannot exceed 120 months";
    }

    if (formData.SPR_TaxP) {
      const tax = parseFloat(formData.SPR_TaxP);
      if (tax < 0 || tax > 999.99) {
        newErrors.SPR_TaxP = "Tax percentage must be between 0 and 999.99";
      }
    }

    if (formData.SPR_LtFe && parseFloat(formData.SPR_LtFe) < 0) {
      newErrors.SPR_LtFe = "Late fee cannot be negative";
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
        if (firstErrorKey == "SPM_Id") {
          shopButtonRef.current?.focus();
        } else if (firstErrorKey == "SPR_Date") {
          dateRef.current?.focus();
        } else if (firstErrorKey == "SPR_BsRnt") {
          baseRentRef.current?.focus();
        } else if (firstErrorKey == "SPR_SDMnt") {
          sdMntRef.current?.focus();
        } else if (firstErrorKey == "SPR_EdDt") {
          endDateRef.current?.focus();
        } else if (firstErrorKey == "SPR_TaxP") {
          taxPRef.current?.focus();
        } else if (firstErrorKey == "SPR_LtFe") {
          ltFeRef.current?.focus();
        } else if (firstErrorKey == "SPR_DuDt") {
          dueDateRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this rental record?"
        : "Are you sure you want to create this rental record?",
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
        SPM_Id: parseInt(formData.SPM_Id),
        SPR_Date: formData.SPR_Date,
        SPR_BsRnt: parseFloat(formData.SPR_BsRnt),
        SPR_SDMnt: formData.SPR_SDMnt ? parseInt(formData.SPR_SDMnt) : null,
        SPR_Dura: derivedDuration || 12,
        SPR_EdDt: formData.SPR_EdDt || null,
        SPR_TaxP: formData.SPR_TaxP ? parseFloat(formData.SPR_TaxP) : null,
        SPR_LtFe: formData.SPR_LtFe ? parseFloat(formData.SPR_LtFe) : null,
        SPR_DuDt: formData.SPR_DuDt || null,
        SPR_Status: formData.SPR_Status,
      };

      if (isEditMode) {
        await ShopRentalApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await ShopRentalApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/shop-rental"),
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
    navigate("/masters/hall-shop-management/shop-rental");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rental data...</p>
      </div>
    );
  }

  const getSelectedShopName = () => {
    if (formData.SPM_Id) {
      const selected = shops.find((s) => s.SPM_Id == parseInt(formData.SPM_Id));
      return selected ? selected.SPM_Name : "";
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
                ? "Update shop rental information"
                : "Create a new shop rental record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Rental Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Selection  */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingShops ? (
                  <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading shops...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={shopButtonRef}
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onKeyDown={handleShopKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.SPM_Id ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.SPM_Id ? (
                        <span className="text-gray-900">
                          {getSelectedShopName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Shop</span>
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
                {errors.SPM_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Shop Dropdown Menu  */}
              {isDropdownOpen && !loadingShops && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={shopSearchRef}
                        type="text"
                        value={shopSearch}
                        onChange={handleShopSearchChange}
                        onKeyDown={handleShopSearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {shopSearch && (
                        <button
                          type="button"
                          onClick={() => setShopSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={listRef} className="overflow-y-auto max-h-64">
                    {filteredShops.length > 0 ? (
                      filteredShops.map((shop, idx) => {
                        const isSelected = formData.SPM_Id == shop.SPM_Id;

                        return (
                          <button
                            key={shop.SPM_Id}
                            ref={(el) => {
                              itemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleShopSelect(shop)}
                            onKeyDown={(e) =>
                              handleShopItemKeyDown(e, shop, idx)
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
                                S{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {shop.SPM_Name}
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
                        <p>No shops found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredShops.length} shops found</span>
                      <span>Total: {shops.length} shops</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.SPM_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPM_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a shop from the list (required)
              </p>
            </div>

            {/* Base Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Rent (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={baseRentRef}
                  type="number"
                  step="0.01"
                  name="SPR_BsRnt"
                  value={formData.SPR_BsRnt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, sdMntRef)}
                  placeholder="Enter base rent amount"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPR_BsRnt ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPR_BsRnt && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPR_BsRnt}
                </p>
              )}
            </div>

            {/* Security Deposit Months */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (Months){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
                <span className="text-gray-400 text-xs ml-1">(max 99)</span>
              </label>
              <input
                ref={sdMntRef}
                type="number"
                name="SPR_SDMnt"
                value={formData.SPR_SDMnt}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, taxPRef)}
                placeholder="e.g. 12"
                min="0"
                max="99"
                className={`w-full px-4 py-2.5 text-sm border ${errors.SPR_SDMnt ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.SPR_SDMnt && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPR_SDMnt}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Number of months of security deposit (0-99)
              </p>
            </div>

            {/* Lease Tenure: Start Date -> End Date (duration auto) */}
            <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
              <p className="mb-2 text-xs font-semibold text-blue-900">
                Lease Tenure (Start to End)
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={dateRef}
                      type="date"
                      name="SPR_Date"
                      value={formData.SPR_Date}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, endDateRef)}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPR_Date ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    />
                  </div>
                  {errors.SPR_Date && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.SPR_Date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={endDateRef}
                      type="date"
                      name="SPR_EdDt"
                      value={formData.SPR_EdDt}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, baseRentRef)}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPR_EdDt ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    />
                  </div>
                  {errors.SPR_EdDt && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.SPR_EdDt}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-2 text-xs text-blue-700">
                {derivedDuration > 0 ? (
                  <>
                    Auto tenure: <strong>{derivedDuration} months</strong>{" "}
                    ({formatDate(formData.SPR_Date)} to {formatDate(formData.SPR_EdDt)})
                    - applicant ki application me yahi auto show hoga.
                  </>
                ) : (
                  "Start aur End date select karne par tenure auto calculate hoga."
                )}
              </p>
            </div>

            {/* Tax Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Percentage (%){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
                <span className="text-gray-400 text-xs ml-1">(max 999.99)</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={taxPRef}
                  type="number"
                  step="0.01"
                  name="SPR_TaxP"
                  value={formData.SPR_TaxP}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, ltFeRef)}
                  placeholder="e.g. 18"
                  min="0"
                  max="999.99"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPR_TaxP ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPR_TaxP && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPR_TaxP}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tax percentage applied on rent (0-999.99)
              </p>
            </div>

            {/* Late Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Fee (₹){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={ltFeRef}
                  type="number"
                  step="0.01"
                  name="SPR_LtFe"
                  value={formData.SPR_LtFe}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, dueDateRef)}
                  placeholder="Enter late fee amount"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPR_LtFe ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPR_LtFe && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPR_LtFe}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dueDateRef}
                  type="date"
                  name="SPR_DuDt"
                  value={formData.SPR_DuDt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, statusToggleRef)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPR_DuDt ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPR_DuDt && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPR_DuDt}
                </p>
              )}
            </div>

            {/* Status Toggle */}
            <div
              ref={statusToggleRef}
              className="flex items-center justify-between pt-2"
            >
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="SPR_Status"
                    checked={formData.SPR_Status}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        e.preventDefault();
                        setFormData((prev) => ({
                          ...prev,
                          SPR_Status: !prev.SPR_Status,
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
                      formData.SPR_Status ? "bg-green-500" : "bg-gray-300"
                    } transition-colors duration-200`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                      formData.SPR_Status ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-sm font-medium">
                  {formData.SPR_Status ? (
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

export default AddEditShopRental;
// src/pages/Masters/FinancialAccounting/VendorTDSConfiguration/addedit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Trash2,
  Plus,
  ChevronDown,
  Search,
  Check,
  Loader,
  XCircle,
  User,
  Building,
  Percent,
  Eye,
  Download,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { VendorTDSConfigurationApi } from "../../../services/vendortdsconfigurationapi";

// Searchable Dropdown Component (same as before)
const SearchableDropdown = ({
  label,
  value,
  error,
  required = false,
  icon: Icon,
  isOpen,
  setIsOpen,
  searchTerm,
  setSearchTerm,
  items,
  filteredItems,
  highlightedIndex,
  onSelect,
  onKeyDown,
  onSearchKeyDown,
  onItemKeyDown,
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  itemRefs,
  listRef,
  disabled = false,
  renderItem,
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  const handleSearchChange = (e) => {
    if (typeof setSearchTerm == "function") {
      setSearchTerm(e.target.value);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={!disabled ? onKeyDown : undefined}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors`}
        >
          {value ? (
            <span className="text-gray-900">{getSelectedDisplay()}</span>
          ) : (
            <span className="text-gray-500">
              {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
            </span>
          )}
        </button>

        {loading ? (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )
        )}

        {error && (
          <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "300px" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId = item?.SL_Id || item?.FY_Id || `item-${idx}`;

                return (
                  <button
                    key={itemId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => onSelect(item)}
                    onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && itemId && value == itemId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem ? renderItem(item) : item.name}
                    {value && itemId && value == itemId.toString() && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No items found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} items found</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const AddEditVendorTDSConfiguration = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [fncId, setFncId] = useState(null);

  // Dropdown data
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Financial Year dropdown states
  const [filteredFYs, setFilteredFYs] = useState([]);
  const [fySearchTerm, setFySearchTerm] = useState("");
  const [isFYDropdownOpen, setIsFYDropdownOpen] = useState(false);
  const [fyHighlightedIndex, setFyHighlightedIndex] = useState(-1);
  const fyDropdownRef = useRef(null);
  const fySearchRef = useRef(null);
  const fyItemRefs = useRef([]);
  const fyListRef = useRef(null);
  const fyButtonRef = useRef(null);

  // Vendor dropdown states
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorHighlightedIndex, setVendorHighlightedIndex] = useState(-1);
  const vendorDropdownRef = useRef(null);
  const vendorSearchRef = useRef(null);
  const vendorItemRefs = useRef([]);
  const vendorListRef = useRef(null);
  const vendorButtonRef = useRef(null);

  // Refs for focus management
  const dateInputRef = useRef(null);
  const tdsRateRef = useRef(null);
  const remarkRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const activeToggleRef = useRef(null);

  const [formData, setFormData] = useState({
    FY_Id: "",
    SL_Id: "",
    VTC_Date: "", // Will be set to current date in useEffect
    TDS_rate: "",
    Remark: "",
    Is_Active: "Y", // Changed from "Y" to true for boolean (Active by default)
    Documents: [],
  });

  // Separate state for new documents to upload
  const [newDocuments, setNewDocuments] = useState([
    {
      files: [],
      description: "",
      id: Date.now(),
    },
  ]);

  // Function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/financial-accounting/vendortdsconfiguration-master";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Id) {
        setFncId(currentMenuItem.Fnc_Id);
      } else {
        console.warn("Fnc_Id not found in menu details for path:", currentPath);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    loadDropdownData();

    if (id && id != "create") {
      setIsEditMode(true);
      loadTDSData();
    } else {
      // Set current date and active status for create mode
      setFormData((prev) => ({
        ...prev,
        VTC_Date: getCurrentDate(),
        Is_Active: "Y",
      }));
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        fyDropdownRef.current &&
        !fyDropdownRef.current.contains(event.target)
      ) {
        setIsFYDropdownOpen(false);
        setFyHighlightedIndex(-1);
        setFySearchTerm("");
      }
      if (
        vendorDropdownRef.current &&
        !vendorDropdownRef.current.contains(event.target)
      ) {
        setIsVendorDropdownOpen(false);
        setVendorHighlightedIndex(-1);
        setVendorSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // Focus on date field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isFYDropdownOpen && fySearchRef.current) {
      setTimeout(() => fySearchRef.current.focus(), 0);
    }
  }, [isFYDropdownOpen]);

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

  // Filter financial years based on search
  useEffect(() => {
    if (!fySearchTerm.trim()) {
      setFilteredFYs(financialYears);
    } else {
      const term = fySearchTerm.toLowerCase();
      const filtered = financialYears.filter(
        (fy) =>
          fy.FY_Name?.toLowerCase().includes(term) ||
          fy.FY_Code?.toLowerCase().includes(term),
      );
      setFilteredFYs(filtered);
    }
    setFyHighlightedIndex(-1);
  }, [fySearchTerm, financialYears]);

  // Filter vendors based on search
  useEffect(() => {
    if (!vendorSearchTerm.trim()) {
      setFilteredVendors(vendors);
    } else {
      const term = vendorSearchTerm.toLowerCase();
      const filtered = vendors.filter(
        (vendor) =>
          vendor.SL_Name?.toLowerCase().includes(term) ||
          (vendor.SL_Code && vendor.SL_Code.toLowerCase().includes(term)),
      );
      setFilteredVendors(filtered);
    }
    setVendorHighlightedIndex(-1);
  }, [vendorSearchTerm, vendors]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [years, vendorList] = await Promise.all([
        VendorTDSConfigurationApi.getFinancialYears(),
        VendorTDSConfigurationApi.getVendors(),
      ]);

      setFinancialYears(years || []);
      setVendors(vendorList || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadTDSData = async () => {
    setLoading(true);
    try {
      const response = await VendorTDSConfigurationApi.getById(id);
      const tdsData = response?.data || response;

      // Extract Documents from API response
      const existingDocuments = tdsData?.Document || [];

      // Set form data (date will come from API, not set to current date)
      // Convert Is_Active to boolean (default to true if not found)
      const isActive = tdsData?.Is_Active == "Y"; // Added check for "Y" string

      const newFormData = {
        FY_Id: tdsData?.FY_Id?.toString() || "",
        SL_Id: tdsData?.SL_Id?.toString() || "",
        VTC_Date: tdsData?.VTC_Date
          ? new Date(tdsData.VTC_Date).toISOString().split("T")[0]
          : "",
        TDS_rate: tdsData?.TDS_rate?.toString() || "",
        Remark: tdsData?.Remark || "",
        Is_Active: isActive, // Store as boolean
        Documents: existingDocuments,
      };

      setFormData(newFormData);

      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading TDS configuration:", error);
      toast.error("Failed to load TDS configuration data!");
      navigate("/masters/financial-accounting/vendortdsconfiguration-master");
    } finally {
      setLoading(false);
    }
  };

  // General keyboard navigation for Enter key
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Financial Year keyboard handlers
  const handleFYKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsFYDropdownOpen(true);
      setFySearchTerm("");
      setFyHighlightedIndex(-1);
      setTimeout(() => fySearchRef.current?.focus(), 0);
    }
  };

  const handleFYSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredFYs.length > 0) {
        setFyHighlightedIndex(0);
        setTimeout(() => {
          if (fyItemRefs.current[0]) {
            fyItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsFYDropdownOpen(false);
      setFyHighlightedIndex(-1);
      setFySearchTerm("");
      fyButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredFYs.length > 0 && fyHighlightedIndex >= 0) {
        handleFYSelect(filteredFYs[fyHighlightedIndex]);
      } else if (filteredFYs.length > 0) {
        handleFYSelect(filteredFYs[0]);
      }
    }
  };

  const handleFYItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredFYs.length) {
        setFyHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (fyItemRefs.current[nextIndex]) {
            fyItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setFyHighlightedIndex(-1);
        setTimeout(() => fySearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setFyHighlightedIndex(-1);
        setTimeout(() => fySearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setFyHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (fyItemRefs.current[prevIndex]) {
            fyItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleFYSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsFYDropdownOpen(false);
      setFyHighlightedIndex(-1);
      setFySearchTerm("");
      fyButtonRef.current?.focus();
    }
  };

  const handleFYSelect = (fy) => {
    setFormData((prev) => ({
      ...prev,
      FY_Id: fy.FY_Id.toString(),
    }));
    setIsFYDropdownOpen(false);
    setFySearchTerm("");
    setFyHighlightedIndex(-1);

    if (errors.FY_Id) {
      setErrors((prev) => ({ ...prev, FY_Id: "" }));
    }

    setTimeout(() => {
      if (vendorButtonRef.current) {
        vendorButtonRef.current.focus();
      }
    }, 100);
  };

  const getSelectedFYDisplay = () => {
    if (!formData.FY_Id) return "";
    const selected = financialYears.find(
      (fy) => fy.FY_Id.toString() == formData.FY_Id,
    );
    return selected ? `${selected.FY_Name} (${selected.FY_Code})` : "";
  };

  const renderFYItem = (fy) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{fy.FY_Name}</div>
      <div className="text-xs text-gray-500 mt-1">
        Code: {fy.FY_Code} | {new Date(fy.St_Date).getFullYear()} -{" "}
        {new Date(fy.Ed_Date).getFullYear()}
      </div>
    </div>
  );

  // Vendor keyboard handlers
  const handleVendorKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsVendorDropdownOpen(true);
      setVendorSearchTerm("");
      setVendorHighlightedIndex(-1);
      setTimeout(() => vendorSearchRef.current?.focus(), 0);
    }
  };

  const handleVendorSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredVendors.length > 0) {
        setVendorHighlightedIndex(0);
        setTimeout(() => {
          if (vendorItemRefs.current[0]) {
            vendorItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredVendors.length > 0 && vendorHighlightedIndex >= 0) {
        handleVendorSelect(filteredVendors[vendorHighlightedIndex]);
      } else if (filteredVendors.length > 0) {
        handleVendorSelect(filteredVendors[0]);
      }
    }
  };

  const handleVendorItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredVendors.length) {
        setVendorHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (vendorItemRefs.current[nextIndex]) {
            vendorItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setVendorHighlightedIndex(-1);
        setTimeout(() => vendorSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setVendorHighlightedIndex(-1);
        setTimeout(() => vendorSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setVendorHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (vendorItemRefs.current[prevIndex]) {
            vendorItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleVendorSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    }
  };

  const handleVendorSelect = (vendor) => {
    setFormData((prev) => ({
      ...prev,
      SL_Id: vendor.SL_Id.toString(),
    }));
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");
    setVendorHighlightedIndex(-1);

    if (errors.SL_Id) {
      setErrors((prev) => ({ ...prev, SL_Id: "" }));
    }

    setTimeout(() => {
      if (tdsRateRef.current) {
        tdsRateRef.current.focus();
      }
    }, 100);
  };

  const getSelectedVendorDisplay = () => {
    if (!formData.SL_Id) return "";
    const selected = vendors.find(
      (vendor) => vendor.SL_Id.toString() == formData.SL_Id,
    );
    return selected ? selected.SL_Name : "";
  };

  const renderVendorItem = (vendor) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{vendor.SL_Name}</div>
      {vendor.SL_Code && (
        <div className="text-xs text-gray-500 mt-1">Code: {vendor.SL_Code}</div>
      )}
      {vendor.ledger_names && vendor.ledger_names.length > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          Ledger: {vendor.ledger_names.join(", ")}
        </div>
      )}
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "TDS_rate" && value != "") {
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
      if (parseFloat(value) > 100) {
        toast.error("TDS rate cannot exceed 100%");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle Is_Active toggle - now using boolean
  const handleActiveToggle = () => {
    setFormData((prev) => ({
      ...prev,
      Is_Active: !prev.Is_Active,
    }));

    // Show toast notification for status change
    if (!formData.Is_Active) {
      toast.success("Configuration will be activated");
    } else {
      toast.success("Configuration will be deactivated");
    }
  };

  // Handle multiple file selection for new documents
  const handleFileChange = (index, files) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!validTypes.includes(file.type)) {
        toast.error(`File type not supported: ${file.name}`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large (max 10MB): ${file.name}`);
        return;
      }
    }

    const updatedDocuments = [...newDocuments];

    if (
      updatedDocuments[index].files &&
      updatedDocuments[index].files.length > 0
    ) {
      const existingNames = updatedDocuments[index].files.map((f) => f.name);
      const newFiles = fileArray.filter((f) => !existingNames.includes(f.name));

      if (newFiles.length > 0) {
        updatedDocuments[index].files = [
          ...updatedDocuments[index].files,
          ...newFiles,
        ];
        toast.success(`${newFiles.length} file(s) added successfully`);
      } else {
        toast.error("All selected files already exist in this row");
        return;
      }
    } else {
      updatedDocuments[index].files = fileArray;
      toast.success(`${fileArray.length} file(s) selected successfully`);
    }

    setNewDocuments(updatedDocuments);
  };

  const removeFileFromRow = (rowIndex, fileIndex) => {
    const updatedDocuments = [...newDocuments];
    updatedDocuments[rowIndex].files.splice(fileIndex, 1);

    if (updatedDocuments[rowIndex].files.length == 0) {
      updatedDocuments[rowIndex].files = [];
    }

    setNewDocuments(updatedDocuments);
    toast.success("File removed");
  };

  const handleDescriptionChange = (index, description) => {
    const updatedDocuments = [...newDocuments];
    updatedDocuments[index].description = description;
    setNewDocuments(updatedDocuments);
  };

  const addNewDocumentRow = () => {
    setNewDocuments([
      ...newDocuments,
      {
        files: [],
        description: "",
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const removeDocumentRow = (index) => {
    if (newDocuments.length == 1) {
      setNewDocuments([{ files: [], description: "", id: Date.now() }]);
    } else {
      setNewDocuments(newDocuments.filter((_, i) => i != index));
    }
  };

  const handleDeleteDocument = async (doc) => {
    const docId = doc.doc_lib_id || doc.id;

    const result = await Swal.fire({
      title: "Delete Document?",
      text: "Are you sure you want to delete this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      toast.loading("Deleting document...", { id: "delete-doc" });

      await VendorTDSConfigurationApi.deleteDocument(docId);

      setFormData((prev) => ({
        ...prev,
        Documents: prev.Documents.filter((d) => d != doc),
      }));

      toast.success("Document deleted successfully!", { id: "delete-doc" });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document. Please try again.", {
        id: "delete-doc",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FY_Id) {
      newErrors.FY_Id = "Financial Year is required";
    }

    if (!formData.SL_Id) {
      newErrors.SL_Id = "Vendor selection is required";
    }

    if (!formData.TDS_rate) {
      newErrors.TDS_rate = "TDS rate is required";
    } else if (parseFloat(formData.TDS_rate) <= 0) {
      newErrors.TDS_rate = "TDS rate must be greater than 0";
    } else if (parseFloat(formData.TDS_rate) > 100) {
      newErrors.TDS_rate = "TDS rate cannot exceed 100%";
    }

    if (formData.VTC_Date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.VTC_Date)) {
      newErrors.VTC_Date = "Invalid date format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fncId) {
      console.warn("Fnc_Id not loaded from menu details");
    }

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update TDS Configuration?"
        : "Create New TDS Configuration?",
      text: isEditMode
        ? "Are you sure you want to update this TDS configuration?"
        : "Are you sure you want to create this new TDS configuration?",
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
      let response;

      if (isEditMode) {
        // EDIT MODE - FormData with binary files
        const formDataObj = new FormData();

        formDataObj.append("FY_Id", formData.FY_Id);
        formDataObj.append("SL_Id", formData.SL_Id);
        formDataObj.append("TDS_rate", formData.TDS_rate);
        // Send Is_Active as "Y" or "N" (string)
        formDataObj.append("Is_Active", formData.Is_Active ? "Y" : "N");

        if (formData.VTC_Date) {
          formDataObj.append("VTC_Date", formData.VTC_Date);
        }

        if (formData.Remark) {
          formDataObj.append("Remark", formData.Remark);
        }

        if (fncId) {
          formDataObj.append("Fnc_Id", fncId);
        }

        // Add new files (binary)
        let fileIndex = 0;
        newDocuments.forEach((doc) => {
          if (doc.files && doc.files.length > 0) {
            doc.files.forEach((file) => {
              formDataObj.append(`Documents[${fileIndex}]`, file);
              if (doc.description) {
                formDataObj.append(
                  `Documents_description[${fileIndex}]`,
                  doc.description,
                );
              }
              fileIndex++;
            });
          }
        });

        response = await VendorTDSConfigurationApi.update(id, formDataObj);
        toast.success("TDS configuration updated successfully!");
      } else {
        // CREATE MODE - FormData with binary files
        const formDataObj = new FormData();

        formDataObj.append("FY_Id", formData.FY_Id);
        formDataObj.append("SL_Id", formData.SL_Id);
        formDataObj.append("TDS_rate", formData.TDS_rate);
        // Send Is_Active as "Y" or "N" (string) - Default is "Y" (active)
        formDataObj.append("Is_Active", formData.Is_Active ? "Y" : "N");

        if (formData.VTC_Date) {
          formDataObj.append("VTC_Date", formData.VTC_Date);
        }

        if (formData.Remark) {
          formDataObj.append("Remark", formData.Remark);
        }

        if (fncId) {
          formDataObj.append("Fnc_Id", fncId);
        }

        // Add files (binary)
        let fileIndex = 0;
        newDocuments.forEach((doc) => {
          if (doc.files && doc.files.length > 0) {
            doc.files.forEach((file) => {
              formDataObj.append(`Documents[${fileIndex}]`, file);
              if (doc.description) {
                formDataObj.append(
                  `Documents_description[${fileIndex}]`,
                  doc.description,
                );
              }
              fileIndex++;
            });
          }
        });

        response = await VendorTDSConfigurationApi.create(formDataObj);
        toast.success("TDS configuration created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/vendortdsconfiguration-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving TDS configuration:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            (isEditMode
              ? "Failed to update TDS configuration. Please try again."
              : "Failed to create TDS configuration. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/vendortdsconfiguration-master");
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "📎";
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading TDS configuration data...</p>
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
                "/masters/financial-accounting/vendortdsconfiguration-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit TDS Configuration" : "New TDS Configuration"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update vendor TDS configuration information"
                : "Create new vendor TDS configuration"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TDS Configuration Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Percent className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              TDS Configuration Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TDS Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  name="VTC_Date"
                  value={formData.VTC_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, fyButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.VTC_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.VTC_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.VTC_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.VTC_Date}
                </p>
              )}
            </div>

            {/* Financial Year Dropdown */}
            <SearchableDropdown
              label="Financial Year"
              value={formData.FY_Id}
              error={errors.FY_Id}
              required={true}
              icon={Calendar}
              isOpen={isFYDropdownOpen}
              setIsOpen={setIsFYDropdownOpen}
              searchTerm={fySearchTerm}
              setSearchTerm={setFySearchTerm}
              items={financialYears}
              filteredItems={filteredFYs}
              highlightedIndex={fyHighlightedIndex}
              onSelect={handleFYSelect}
              onKeyDown={handleFYKeyDown}
              onSearchKeyDown={handleFYSearchKeyDown}
              onItemKeyDown={handleFYItemKeyDown}
              getSelectedDisplay={getSelectedFYDisplay}
              loading={loadingDropdowns}
              placeholder="Select Financial Year"
              searchPlaceholder="Search by year name or code..."
              buttonRef={fyButtonRef}
              dropdownRef={fyDropdownRef}
              searchRef={fySearchRef}
              itemRefs={fyItemRefs}
              listRef={fyListRef}
              renderItem={renderFYItem}
            />

            {/* Vendor Dropdown */}
            <SearchableDropdown
              label="Vendor"
              value={formData.SL_Id}
              error={errors.SL_Id}
              required={true}
              icon={User}
              isOpen={isVendorDropdownOpen}
              setIsOpen={setIsVendorDropdownOpen}
              searchTerm={vendorSearchTerm}
              setSearchTerm={setVendorSearchTerm}
              items={vendors}
              filteredItems={filteredVendors}
              highlightedIndex={vendorHighlightedIndex}
              onSelect={handleVendorSelect}
              onKeyDown={handleVendorKeyDown}
              onSearchKeyDown={handleVendorSearchKeyDown}
              onItemKeyDown={handleVendorItemKeyDown}
              getSelectedDisplay={getSelectedVendorDisplay}
              loading={loadingDropdowns}
              placeholder="Select Vendor"
              searchPlaceholder="Search by vendor name or code..."
              buttonRef={vendorButtonRef}
              dropdownRef={vendorDropdownRef}
              searchRef={vendorSearchRef}
              itemRefs={vendorItemRefs}
              listRef={vendorListRef}
              renderItem={renderVendorItem}
            />

            {/* TDS Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TDS Rate (%) *
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={tdsRateRef}
                  type="text"
                  name="TDS_rate"
                  value={formData.TDS_rate}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, remarkRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.TDS_rate ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter TDS rate (e.g., 10)"
                  required
                />
                {errors.TDS_rate && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TDS_rate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TDS_rate}
                </p>
              )}
            </div>

            {/* Is_Active Toggle Button - Active by default */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <button
                ref={activeToggleRef}
                type="button"
                onClick={handleActiveToggle}
                className="flex items-center gap-3 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key == "Enter" || e.key == " ") {
                    e.preventDefault();
                    handleActiveToggle();
                  }
                }}
              >
                {formData.Is_Active ? (
                  <div className="flex items-center gap-2">
                    <ToggleRight className="h-8 w-8 text-green-600" />
                    <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  </div>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Toggle to activate or deactivate this configuration (Active by
                default)
              </p>
            </div>

            {/* Remark */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark
              </label>
              <textarea
                ref={remarkRef}
                name="Remark"
                value={formData.Remark}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                rows="3"
                className={`w-full p-3 border ${
                  errors.Remark ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter remarks (optional)..."
              />
              {errors.Remark && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Remark}
                </p>
              )}
            </div>

            {/* Document Upload Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Reference Documents
                  <span className="text-xs text-gray-500 ml-2">
                    (PDF, Word, Excel, Images - max 10MB each, multiple files
                    allowed)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addNewDocumentRow}
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add More
                </button>
              </div>

              {/* Existing Documents (for edit mode) */}
              {isEditMode && formData.Documents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Existing Documents ({formData.Documents.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.Documents.map((doc, index) => {
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1">
                              <span className="text-xl mr-3">
                                {getFileIcon(doc.name)}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h5 className="font-medium text-gray-900">
                                    {doc.name}
                                  </h5>
                                  <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    Existing
                                  </span>
                                </div>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {doc.description}
                                  </p>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  <span>Type: {doc.type || "Unknown"}</span>
                                  <span className="mx-2">•</span>
                                  <button
                                    type="button"
                                    onClick={() => openDocument(doc)}
                                    className="text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </button>
                                  <span className="mx-2">•</span>
                                  {doc.url && (
                                    <a
                                      href={doc.url}
                                      download
                                      className="text-green-600 hover:underline inline-flex items-center"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click the delete button to permanently remove a document.
                  </p>
                </div>
              )}

              {/* New Document Upload Rows */}
              <div className="space-y-4">
                {newDocuments.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        {isEditMode
                          ? "Add New Document Row"
                          : `Document Row #${index + 1}`}
                      </h4>
                      {newDocuments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocumentRow(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove this document row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* File Upload - Multiple files */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Files {isEditMode ? "(New)" : ""}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleFileChange(index, e.target.files)
                            }
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You can select multiple files at once
                          </p>
                        </div>

                        {/* Show selected files preview */}
                        {doc.files && doc.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Selected Files ({doc.files.length}):
                            </p>
                            {doc.files.map((file, fileIndex) => (
                              <div
                                key={fileIndex}
                                className="p-2 bg-white border border-green-200 rounded-lg flex items-center justify-between"
                              >
                                <div className="flex items-center flex-1">
                                  <span className="text-lg mr-2">
                                    {getFileIcon(file.name)}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(file.size)} • {file.type}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFileFromRow(index, fileIndex)
                                  }
                                  className="text-red-600 hover:text-red-800 p-1 ml-2"
                                  title="Remove this file"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Description - Common for all files in this row */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document Description (for all files in this row)
                        </label>
                        <div className="relative">
                          <textarea
                            value={doc.description}
                            onChange={(e) =>
                              handleDescriptionChange(index, e.target.value)
                            }
                            rows="2"
                            className={`w-full p-3 border ${
                              errors[`documentDesc_${index}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Enter description for these documents (optional)..."
                          />
                          {errors[`documentDesc_${index}`] && (
                            <AlertCircle className="absolute right-2 top-2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {errors[`documentDesc_${index}`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors[`documentDesc_${index}`]}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          This description will apply to all files in this row
                          (optional)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fnc_Id warning if not loaded */}
        {!fncId && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              Note: Function ID not found. Some features may not work properly.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isEditMode
                ? "Existing documents can be deleted. New documents can be added."
                : "Note: You can add multiple files per row and multiple rows. Documents are optional."}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Configuration" : "Create Configuration"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditVendorTDSConfiguration;

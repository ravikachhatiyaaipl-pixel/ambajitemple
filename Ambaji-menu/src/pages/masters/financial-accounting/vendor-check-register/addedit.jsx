/***
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

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Building2,
  Landmark,
  User,
  Hash,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  File,
  Trash2,
  ChevronDown,
  Search,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";

const AddEditVendorBkCheck = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [existingDocumentName, setExistingDocumentName] = useState("");

  // Vendor dropdown state
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [vendorHighlightedIndex, setVendorHighlightedIndex] = useState(-1);

  // Refs
  const vendorButtonRef = useRef(null);
  const vendorSearchRef = useRef(null);
  const vendorItemRefs = useRef([]);
  const vendorListRef = useRef(null);
  const bankNameRef = useRef(null);
  const branchNameRef = useRef(null);
  const accountHolderRef = useRef(null);
  const accountNumberRef = useRef(null);
  const ifscCodeRef = useRef(null);
  const accountTypeRef = useRef(null);
  const documentInputRef = useRef(null);
  const saveButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    Lg_Id: [], // Vendor ID (subledger ID) - stored as array
    SL_Name: "", // Vendor will be selected, this will be auto-filled
    Bank_Name: "",
    Branch_Name: "",
    Account_Holder_Name: "",
    Account_Number: "",
    IFSC_Code: "",
    Account_Type: "",
    Is_cnl_cheq: false, // Default NO (false)
    Documents: null,
  });

  const accountTypeOptions = [
    { value: "Savings", label: "Savings Account" },
    { value: "Current", label: "Current Account" },
    { value: "OD", label: "Overdraft (OD)" },
    { value: "CC", label: "Cash Credit (CC)" },
    { value: "NRI", label: "NRI Account" },
    { value: "Other", label: "Other" },
  ];

  // Account Type dropdown state
  const [isAccountTypeDropdownOpen, setIsAccountTypeDropdownOpen] =
    useState(false);
  const [accountTypeSearchTerm, setAccountTypeSearchTerm] = useState("");
  const [filteredAccountTypes, setFilteredAccountTypes] =
    useState(accountTypeOptions);
  const [accountTypeHighlightedIndex, setAccountTypeHighlightedIndex] =
    useState(-1);
  const accountTypeButtonRef = useRef(null);
  const accountTypeSearchRef = useRef(null);
  const accountTypeItemRefs = useRef([]);
  const accountTypeListRef = useRef(null);

  useEffect(() => {
    loadVendors();
    if (id && id != "create") {
      setIsEditMode(true);
      loadVendorBankCheckData();
    }
  }, [id]);

  useEffect(() => {
    if (!vendorSearchTerm.trim()) {
      setFilteredVendors(vendors);
    } else {
      const term = vendorSearchTerm.toLowerCase();
      const filtered = vendors.filter(
        (vendor) =>
          vendor.SL_Name?.toLowerCase().includes(term) ||
          vendor.SL_Code?.toLowerCase().includes(term),
      );
      setFilteredVendors(filtered);
    }
    setVendorHighlightedIndex(-1);
  }, [vendorSearchTerm, vendors]);

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

  useEffect(() => {
    if (!accountTypeSearchTerm.trim()) {
      setFilteredAccountTypes(accountTypeOptions);
    } else {
      const term = accountTypeSearchTerm.toLowerCase();
      const filtered = accountTypeOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          option.value.toLowerCase().includes(term),
      );
      setFilteredAccountTypes(filtered);
    }
    setAccountTypeHighlightedIndex(-1);
  }, [accountTypeSearchTerm]);

  useEffect(() => {
    if (isAccountTypeDropdownOpen && accountTypeSearchRef.current) {
      setTimeout(() => accountTypeSearchRef.current.focus(), 0);
    }
  }, [isAccountTypeDropdownOpen]);

  // Sync vendor name when vendors are loaded and form has Lg_Id
  useEffect(() => {
    if (
      isEditMode &&
      vendors.length > 0 &&
      formData.Lg_Id &&
      formData.Lg_Id.length > 0
    ) {
      const selectedVendor = vendors.find((v) => v.SL_Id == formData.Lg_Id[0]);
      if (selectedVendor && !formData.SL_Name) {
        setFormData((prev) => ({ ...prev, SL_Name: selectedVendor.SL_Name }));
      }
    }
  }, [vendors, isEditMode, formData.Lg_Id, formData.SL_Name]);

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      // Using getAllPartySl to get only vendors (sub-ledgers with is_party=Y)
      const result = await SubLedgerAccountApi.getAllPartySl(1, 500, "");
      if (result.success && result.data) {
        setVendors(result.data.data || []);
        setFilteredVendors(result.data.data || []);
      } else {
        toast.error("Failed to load vendors");
      }
    } catch (error) {
      console.error("Error loading vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoadingVendors(false);
    }
  };

  const loadVendorBankCheckData = async () => {
    setLoading(true);
    try {
      const result = await SubLedgerAccountApi.getById(id);

      if (!result.success) {
        throw new Error(result.message || "Failed to load data");
      }

      const data = result.data;

      // Fix: Ensure Lg_Id is properly set as an array with the vendor ID
      const vendorId = data.Lg_Id;
      setFormData({
        Lg_Id: vendorId ? [vendorId] : [], // Make sure it's an array
        SL_Name: data.SL_Name || "",
        Bank_Name: data.Bank_Name || "",
        Branch_Name: data.Branch_Name || "",
        Account_Holder_Name: data.Account_Holder_Name || "",
        Account_Number: data.Account_Number || "",
        IFSC_Code: data.IFSC_Code || "",
        Account_Type: data.Account_Type || "",
        Is_cnl_cheq:
          data.Is_cnl_cheq == "Y" ||
          data.Is_cnl_cheq == 1 ||
          data.Is_cnl_cheq == true,
        Documents: null,
      });

      // Store existing document info
      if (data.Documents) {
        setExistingDocument(data.Documents);
        // Extract filename from path or URL if available
        if (typeof data.Documents == "string") {
          const fileName = data.Documents.split("/").pop();
          setExistingDocumentName(fileName || "Existing Document");
        } else {
          setExistingDocumentName("Existing Document");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to load data!");
      navigate("/masters/financial-accounting/vendor-check-register");
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
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPEG, PNG files are allowed");
        return;
      }

      setSelectedFile(file);

      // For edit mode, convert to base64 immediately
      if (isEditMode) {
        try {
          const base64 = await convertFileToBase64(file);
          setFormData((prev) => ({ ...prev, Documents: base64 }));
        } catch (error) {
          console.error("Error converting file to base64:", error);
          toast.error("Failed to process file");
        }
      } else {
        // For create mode, store the file object for FormData
        setFormData((prev) => ({ ...prev, Documents: file }));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, Documents: null }));
    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  const handleRemoveExistingDocument = () => {
    setExistingDocument(null);
    setExistingDocumentName("");
    setFormData((prev) => ({ ...prev, Documents: null }));
  };

  const getVendorLabel = () => {
    // Make sure Lg_Id is an array and has at least one element
    const vendorId =
      Array.isArray(formData.Lg_Id) && formData.Lg_Id.length > 0
        ? formData.Lg_Id[0]
        : null;

    const selected = vendors.find((v) => v.SL_Id == vendorId);
    return selected ? selected.SL_Name : "Select Vendor";
  };

  const handleVendorSelect = (vendor) => {
    setFormData((prev) => ({
      ...prev,
      Lg_Id: [vendor.SL_Id],
      SL_Name: vendor.SL_Name,
    }));
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");

    setTimeout(() => {
      bankNameRef.current?.focus();
    }, 100);
  };

  const handleVendorKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
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

  const handleAccountTypeSelect = (value) => {
    setFormData((prev) => ({ ...prev, Account_Type: value }));
    setIsAccountTypeDropdownOpen(false);
    setAccountTypeSearchTerm("");

    setTimeout(() => {
      saveButtonRef.current?.focus();
    }, 100);
  };

  const handleAccountTypeKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsAccountTypeDropdownOpen(true);
      setAccountTypeSearchTerm("");
      setAccountTypeHighlightedIndex(-1);
      setTimeout(() => accountTypeSearchRef.current?.focus(), 0);
    }
  };

  const handleAccountTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredAccountTypes.length > 0) {
        setAccountTypeHighlightedIndex(0);
        setTimeout(() => {
          if (accountTypeItemRefs.current[0]) {
            accountTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAccountTypeDropdownOpen(false);
      setAccountTypeHighlightedIndex(-1);
      setAccountTypeSearchTerm("");
      accountTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredAccountTypes.length > 0 && accountTypeHighlightedIndex >= 0) {
        handleAccountTypeSelect(
          filteredAccountTypes[accountTypeHighlightedIndex].value,
        );
      } else if (filteredAccountTypes.length > 0) {
        handleAccountTypeSelect(filteredAccountTypes[0].value);
      }
    }
  };

  const handleAccountTypeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredAccountTypes.length) {
        setAccountTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (accountTypeItemRefs.current[nextIndex]) {
            accountTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setAccountTypeHighlightedIndex(-1);
        setTimeout(() => accountTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setAccountTypeHighlightedIndex(-1);
        setTimeout(() => accountTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setAccountTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (accountTypeItemRefs.current[prevIndex]) {
            accountTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleAccountTypeSelect(item.value);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAccountTypeDropdownOpen(false);
      setAccountTypeHighlightedIndex(-1);
      setAccountTypeSearchTerm("");
      accountTypeButtonRef.current?.focus();
    }
  };

  const getSelectedAccountTypeLabel = () => {
    if (!formData.Account_Type) return "";
    const selected = accountTypeOptions.find(
      (option) => option.value == formData.Account_Type,
    );
    return selected ? selected.label : "";
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.Lg_Id || formData.Lg_Id.length == 0) {
      errors.push("Please select a vendor");
    }
    if (!formData.Bank_Name?.trim()) {
      errors.push("Bank Name is required");
    }
    if (!formData.Account_Holder_Name?.trim()) {
      errors.push("Account Holder Name is required");
    }
    if (!formData.Account_Number?.trim()) {
      errors.push("Account Number is required");
    }
    if (
      formData.Account_Number &&
      (formData.Account_Number.length < 9 ||
        formData.Account_Number.length > 18)
    ) {
      errors.push("Account number must be between 9 to 18 digits");
    }
    if (
      formData.IFSC_Code &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.IFSC_Code)
    ) {
      errors.push("IFSC Code must be 11 characters (e.g., SBIN0001234)");
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Record?" : "Create New Record?",
      text: isEditMode
        ? "Are you sure you want to update this vendor bank check information?"
        : "Are you sure you want to create this new vendor bank check record?",
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
      const data = {
        Lg_Id: formData.Lg_Id[0], // Send as single value, not array
        Bank_Name: formData.Bank_Name,
        Branch_Name: formData.Branch_Name,
        Account_Holder_Name: formData.Account_Holder_Name,
        Account_Number: formData.Account_Number,
        IFSC_Code: formData.IFSC_Code,
        Account_Type: formData.Account_Type,
        Is_cnl_cheq: formData.Is_cnl_cheq ? "Y" : "N",
      };

      // Handle document based on mode
      if (isEditMode) {
        if (selectedFile) {
          // New file selected - already converted to base64 in handleFileChange
          data.Documents = formData.Documents;
        } else if (existingDocument) {
          // Keep existing document - send the existing document reference
          data.Documents = existingDocument;
        }
        // If no document and no existing document, don't send Documents field

        // For edit mode - send as JSON
        const response = await SubLedgerAccountApi.update(id, data);

        if (!response.success) {
          throw new Error(response.message || "Failed to update record");
        }

        toast.success("Vendor bank check updated successfully!");
      } else {
        // Create mode - prepare FormData if file exists
        if (selectedFile) {
          // For create mode, keep as File object for FormData
          data.Documents = selectedFile;
        }

        const response = await SubLedgerAccountApi.create(data);

        if (!response.success) {
          throw new Error(response.message || "Failed to create record");
        }

        toast.success("Vendor bank check created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/vendor-check-register");
      }, 1500);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error(error.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/vendor-check-register");
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
              navigate("/masters/financial-accounting/vendor-check-register")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Vendor Bank Check"
                : "Add New Vendor Cancel Check"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update vendor bank account and check information"
                : "Create a new vendor Cancel check record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Vendor & Cancel Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Dropdown */}
            <div ref={vendorListRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {loadingVendors ? (
                  <div className="flex items-center pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading vendors...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={vendorButtonRef}
                      type="button"
                      onClick={() =>
                        setIsVendorDropdownOpen(!isVendorDropdownOpen)
                      }
                      onKeyDown={handleVendorKeyDown}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between"
                    >
                      <span
                        className={
                          formData.Lg_Id.length > 0
                            ? "text-gray-900"
                            : "text-gray-500"
                        }
                      >
                        {getVendorLabel()}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${isVendorDropdownOpen ? "transform rotate-180" : ""}`}
                      />
                    </button>

                    {isVendorDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              ref={vendorSearchRef}
                              type="text"
                              value={vendorSearchTerm}
                              onChange={(e) =>
                                setVendorSearchTerm(e.target.value)
                              }
                              onKeyDown={handleVendorSearchKeyDown}
                              placeholder="Search vendor..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {vendorSearchTerm && (
                              <button
                                type="button"
                                onClick={() => setVendorSearchTerm("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="overflow-y-auto max-h-64">
                          {filteredVendors.length > 0 ? (
                            filteredVendors.map((vendor, idx) => (
                              <button
                                key={vendor.SL_Id}
                                ref={(el) => {
                                  vendorItemRefs.current[idx] = el;
                                }}
                                type="button"
                                onClick={() => handleVendorSelect(vendor)}
                                onKeyDown={(e) =>
                                  handleVendorItemKeyDown(e, vendor, idx)
                                }
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                  vendorHighlightedIndex == idx
                                    ? "bg-blue-100"
                                    : ""
                                } ${Array.isArray(formData.Lg_Id) && formData.Lg_Id[0] == vendor.SL_Id ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                                tabIndex={0}
                              >
                                <div className="font-medium text-gray-900">
                                  {vendor.SL_Name}
                                </div>
                                {vendor.SL_Code && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Code: {vendor.SL_Code}
                                  </div>
                                )}
                                {Array.isArray(formData.Lg_Id) &&
                                  formData.Lg_Id[0] == vendor.SL_Id && (
                                    <div className="text-xs text-blue-600 mt-1 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Selected
                                    </div>
                                  )}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                              <p>No vendors found</p>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{filteredVendors.length} vendors found</span>
                            <span>Total: {vendors.length} vendors</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select the vendor from the dropdown list
              </p>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={bankNameRef}
                type="text"
                name="Bank_Name"
                value={formData.Bank_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, branchNameRef)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter bank name"
                maxLength={100}
              />
            </div>

            {/* Branch Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name
              </label>
              <input
                ref={branchNameRef}
                type="text"
                name="Branch_Name"
                value={formData.Branch_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, accountHolderRef)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter branch name"
                maxLength={100}
              />
            </div>

            {/* Account Holder Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={accountHolderRef}
                type="text"
                name="Account_Holder_Name"
                value={formData.Account_Holder_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, accountNumberRef)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter account holder name as per bank records"
                maxLength={100}
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={accountNumberRef}
                  type="text"
                  name="Account_Number"
                  value={formData.Account_Number}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, ifscCodeRef)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number"
                  maxLength={18}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">9-18 digits</p>
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={ifscCodeRef}
                  type="text"
                  name="IFSC_Code"
                  value={formData.IFSC_Code}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, accountTypeButtonRef)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="SBIN0001234"
                  maxLength={20}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                11 characters (e.g., SBIN0001234)
              </p>
            </div>

            {/* Account Type */}
            <div ref={accountTypeListRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="relative">
                <button
                  ref={accountTypeButtonRef}
                  type="button"
                  onClick={() =>
                    setIsAccountTypeDropdownOpen(!isAccountTypeDropdownOpen)
                  }
                  onKeyDown={handleAccountTypeKeyDown}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      formData.Account_Type ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {formData.Account_Type
                      ? getSelectedAccountTypeLabel()
                      : "Select Account Type"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${isAccountTypeDropdownOpen ? "transform rotate-180" : ""}`}
                  />
                </button>

                {isAccountTypeDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={accountTypeSearchRef}
                          type="text"
                          value={accountTypeSearchTerm}
                          onChange={(e) =>
                            setAccountTypeSearchTerm(e.target.value)
                          }
                          onKeyDown={handleAccountTypeSearchKeyDown}
                          placeholder="Search account type..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {accountTypeSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setAccountTypeSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-64">
                      {filteredAccountTypes.length > 0 ? (
                        filteredAccountTypes.map((option, idx) => (
                          <button
                            key={option.value}
                            ref={(el) => {
                              accountTypeItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() =>
                              handleAccountTypeSelect(option.value)
                            }
                            onKeyDown={(e) =>
                              handleAccountTypeItemKeyDown(e, option, idx)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              accountTypeHighlightedIndex == idx
                                ? "bg-blue-100"
                                : ""
                            } ${formData.Account_Type == option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                            tabIndex={0}
                          >
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            {formData.Account_Type == option.value && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p>No account types found</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{filteredAccountTypes.length} types found</span>
                        <span>Total: {accountTypeOptions.length} types</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CNL Cheq Toggle */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                CNL Cheque Status
              </h3>
              <p className="text-sm text-gray-600">
                Enable if CNL cheque is applicable for this vendor
              </p>
            </div>
            <div className="flex">
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="Is_cnl_cheq"
                    checked={formData.Is_cnl_cheq}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${formData.Is_cnl_cheq ? "bg-blue-500" : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.Is_cnl_cheq ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {formData.Is_cnl_cheq ? (
                    <span className="flex items-center text-blue-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Yes - CNL Cheque Applicable
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      No - CNL Cheque Not Applicable
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Document Upload
            </h2>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <File className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : existingDocument ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Existing Document
                    </p>
                    <p className="text-xs text-gray-500">
                      {existingDocumentName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveExistingDocument}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  PDF, JPEG, PNG (Max 5MB)
                </p>
                <input
                  ref={documentInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="document-upload"
                />
                <label
                  htmlFor="document-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Upload supporting document (cheque copy, bank confirmation, etc.)
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end items-center mt-8 pt-6 border-t">
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
              type="button"
              onClick={handleSave}
              disabled={
                saving ||
                formData.Lg_Id.length == 0 ||
                !formData.Bank_Name ||
                !formData.Account_Holder_Name ||
                !formData.Account_Number
              }
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
                  {isEditMode ? "Update Record" : "Create Record"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditVendorBkCheck;

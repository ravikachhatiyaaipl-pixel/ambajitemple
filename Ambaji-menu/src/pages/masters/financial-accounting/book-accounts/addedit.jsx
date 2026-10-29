import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Hash,
  Folder,
  Mail,
  Phone,
  User,
  Map,
  Home,
  AlertCircle,
  Check,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BookAccountsApi } from "../../../services/bookaccountsapi";

const AddEditBookAccounts = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [errors, setErrors] = useState({});

  // Form state - updated to match API field names
  const [formData, setFormData] = useState({
    Lg_Code: "",
    Gr_Id: "",
    Lg_Name: "",
    Lg_Eng_Name: "",
    Lg_Address: "",
    Lg_City: "",
    Lg_Pin: "",
    Lg_Phone: "",
    Lg_Email: "",
    Lg_Status: true,
  });

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadLedgerGroups();

    if (id && id != "create") {
      setIsEditMode(true);
      loadLedgerData();
    }
  }, [id]);

  // Filter groups when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGroups(ledgerGroups);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = ledgerGroups.filter(
        (group) =>
          group.Gr_Nm?.toLowerCase().includes(term) ||
          group.Gr_Cd?.toLowerCase().includes(term),
      );
      setFilteredGroups(filtered);
    }
  }, [searchTerm, ledgerGroups]);

  const loadLedgerGroups = async () => {
    setLoadingGroups(true);
    try {
      const groups = await BookAccountsApi.getLedgerGroups();

      // Filter groups where Gr_Buk is "Y" (Book Ledger) and sort by Gr_Cd
      const filteredAndSortedGroups = Array.isArray(groups)
        ? groups
            .filter((group) => group.Gr_Buk == "Y")
            .sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
        : [];

      setLedgerGroups(filteredAndSortedGroups || []);
      setFilteredGroups(filteredAndSortedGroups || []);
    } catch (error) {
      console.error("Error loading ledger groups:", error);
      toast.error("Failed to load ledger groups");
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadLedgerData = async () => {
    setLoading(true);
    try {
      const ledger = await BookAccountsApi.getById(id);

      setFormData({
        Lg_Code: ledger.Lg_Code || "",
        Gr_Id: ledger.Gr_Id?.toString() || "",
        Lg_Name: ledger.Lg_Name || "",
        Lg_Eng_Name: ledger.Lg_Eng_Name || "",
        Lg_Address: ledger.Lg_Address || "",
        Lg_City: ledger.Lg_City || "",
        Lg_Pin: ledger.Lg_Pin || "",
        Lg_Phone: ledger.Lg_Phone || "",
        Lg_Email: ledger.Lg_Email || "",
        Lg_Status: ledger.Lg_Status != undefined ? ledger.Lg_Status : true,
      });
    } catch (error) {
      console.error("Error loading ledger:", error);
      toast.error("Failed to load ledger data!");
      navigate("/masters/financial-accounting/book-accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // For Lg_Code - auto uppercase
    if (name == "Lg_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGroupSelect = (groupId) => {
    setFormData((prev) => ({
      ...prev,
      Gr_Id: groupId.toString(),
    }));
    setIsDropdownOpen(false);
    setSearchTerm("");

    if (errors.Gr_Id) {
      setErrors((prev) => ({ ...prev, Gr_Id: null }));
    }
  };

  const getSelectedGroupName = () => {
    if (!formData.Gr_Id) return "";
    const selectedGroup = ledgerGroups.find(
      (group) => group.Gr_Id.toString() == formData.Gr_Id,
    );
    return selectedGroup
      ? `${selectedGroup.Gr_Nm} (${selectedGroup.Gr_Cd})`
      : "";
  };

  // Generate code suggestions based on name
  const generateCodeSuggestions = () => {
    const name = formData.Lg_Name.trim();
    if (!name) return [];

    const suggestions = [];

    // Take first letter of each word
    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
      }
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      // Add with number suffix
      suggestions.push(word.substring(0, 2).toUpperCase() + "001");
      suggestions.push(word.substring(0, 3).toUpperCase() + "001");
    } else if (words.length >= 2) {
      // First letter of each word
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);

      // First two letters of first word + first letter of second
      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
      // Add with number suffix
      suggestions.push(firstLetters + "001");
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    // Gr_Id validation - required
    if (!formData.Gr_Id) {
      newErrors.Gr_Id = "Group is required";
    }

    // Lg_Name validation - required, max 100
    if (!formData.Lg_Name.trim()) {
      newErrors.Lg_Name = "Ledger name is required";
    } else if (formData.Lg_Name.length > 100) {
      newErrors.Lg_Name = "Ledger name must not exceed 100 characters";
    }

    // Lg_Eng_Name validation - optional, max 150
    if (formData.Lg_Eng_Name && formData.Lg_Eng_Name.length > 150) {
      newErrors.Lg_Eng_Name = "English name must not exceed 150 characters";
    }

    // Lg_Code validation - optional, max 50
    if (formData.Lg_Code && formData.Lg_Code.length > 50) {
      newErrors.Lg_Code = "Ledger code must not exceed 50 characters";
    }

    // Email validation - optional
    if (
      formData.Lg_Email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Lg_Email)
    ) {
      newErrors.Lg_Email = "Please enter a valid email address";
    }

    // Phone validation - optional, max 15
    if (formData.Lg_Phone && formData.Lg_Phone.length > 15) {
      newErrors.Lg_Phone = "Phone number must not exceed 15 characters";
    }

    // City validation - optional, max 50
    if (formData.Lg_City && formData.Lg_City.length > 50) {
      newErrors.Lg_City = "City must not exceed 50 characters";
    }

    // PIN validation - optional, max 20
    if (formData.Lg_Pin && formData.Lg_Pin.length > 20) {
      newErrors.Lg_Pin = "PIN code must not exceed 20 characters";
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
      title: isEditMode ? "Update Ledger?" : "Create New Ledger?",
      text: isEditMode
        ? "Are you sure you want to update this ledger information?"
        : "Are you sure you want to create this new ledger?",
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
      const ledgerData = {
        Gr_Id: parseInt(formData.Gr_Id),
        Lg_Name: formData.Lg_Name.trim(),
        Lg_Eng_Name: formData.Lg_Eng_Name.trim() || null,
        Lg_Code: formData.Lg_Code.trim().toUpperCase() || null,
        Lg_Status: formData.Lg_Status,
        Lg_Address: formData.Lg_Address.trim() || null,
        Lg_City: formData.Lg_City.trim() || null,
        Lg_Pin: formData.Lg_Pin.trim() || null,
        Lg_Phone: formData.Lg_Phone.trim() || null,
        Lg_Email: formData.Lg_Email.trim() || null,
      };

      let response;
      if (isEditMode) {
        response = await BookAccountsApi.update(id, ledgerData);
        toast.success("Ledger updated successfully!");
      } else {
        response = await BookAccountsApi.create(ledgerData);
        toast.success("Ledger created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/book-accounts");
      }, 1500);
    } catch (error) {
      console.error("Error saving ledger:", error);

      // Handle backend validation errors
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
              ? "Failed to update ledger. Please try again."
              : "Failed to create ledger. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/book-accounts");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ledger data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/book-accounts")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Ledger" : "Add New Ledger"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update ledger master information"
                : "Create a new ledger master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Ledger Name - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ledger Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Lg_Name.length > 80
                      ? formData.Lg_Name.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Lg_Name.length}/100 characters
                </span>
              </div>
              <input
                type="text"
                name="Lg_Name"
                value={formData.Lg_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Lg_Name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., Cash Account, Bank Account"
                required
                maxLength={100}
              />
              {errors.Lg_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Name}
                </p>
              ) : null}
            </div>

            {/* English Name - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  English Name{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Lg_Eng_Name.length > 120
                      ? formData.Lg_Eng_Name.length >= 150
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Lg_Eng_Name.length}/150 characters
                </span>
              </div>
              <input
                type="text"
                name="Lg_Eng_Name"
                value={formData.Lg_Eng_Name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter English name (optional)"
                maxLength={150}
              />
              {errors.Lg_Eng_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Eng_Name}
                </p>
              )}
            </div>

            {/* Ledger Code - Optional with Character Counter and Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ledger Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Lg_Code.length > 40
                        ? formData.Lg_Code.length >= 50
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Lg_Code.length}/50 characters
                  </span>
                  {suggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              Lg_Code: suggestion,
                            }));
                          }}
                          className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Lg_Code"
                  value={formData.Lg_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Lg_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., CASH001, BANK001 (optional)"
                  maxLength={50}
                />
              </div>
              {errors.Lg_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the ledger (optional, max 50 characters,
                  uppercase only)
                </p>
              )}
            </div>

            {/* Group Selection - Required with Search Dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingGroups ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading groups...</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.Gr_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.Gr_Id ? (
                        <span className="text-gray-900">
                          {getSelectedGroupName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Group</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </>
                )}
                {errors.Gr_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && !loadingGroups && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Groups List */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map((group) => {
                        const level = group.Gr_St ? parseInt(group.Gr_St) : 1;
                        const isSelected =
                          formData.Gr_Id == group.Gr_Id.toString();
                        const indent = "    ".repeat(level - 1);

                        return (
                          <button
                            key={group.Gr_Id}
                            type="button"
                            onClick={() => handleGroupSelect(group.Gr_Id)}
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors
                              ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                          >
                            <div className="flex items-start">
                              {/* Level Indicator Badge */}
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                L{level}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${isSelected ? "text-blue-600" : "text-gray-900"}`}
                                >
                                  <span className="whitespace-pre">
                                    {indent}
                                  </span>
                                  {group.Gr_Nm}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                                    Code: {group.Gr_Cd}
                                  </span>
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
                        <p>No groups found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredGroups.length} groups found</span>
                      <span>Total: {ledgerGroups.length} groups</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.Gr_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Gr_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a ledger group from the hierarchy (only Book Ledgers
                shown)
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="Lg_Address"
                  value={formData.Lg_Address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Lg_City"
                  value={formData.Lg_City}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Lg_City ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter city"
                  maxLength={50}
                />
              </div>
              {errors.Lg_City && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_City}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                name="Lg_Pin"
                value={formData.Lg_Pin}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Lg_Pin ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter PIN code"
                maxLength={20}
              />
              {errors.Lg_Pin && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Pin}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="Lg_Phone"
                  value={formData.Lg_Phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Lg_Phone ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter phone number"
                  maxLength={15}
                />
              </div>
              {errors.Lg_Phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="Lg_Email"
                  value={formData.Lg_Email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Lg_Email ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter email address"
                  maxLength={50}
                />
              </div>
              {errors.Lg_Email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card - Enhanced toggle design */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ledger Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this ledger
              </p>
            </div>
            <div className="flex">
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="Lg_Status"
                    checked={formData.Lg_Status}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.Lg_Status ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.Lg_Status ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {formData.Lg_Status ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      Inactive
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ledger code must be unique across all ledgers
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Ledger" : "Create Ledger"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditBookAccounts;

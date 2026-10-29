import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Building2,
  Hash,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Info,
  Banknote,
  MapPin,
  Phone,
  Mail,
  Home,
  DollarSign,
  Shield,
  Landmark,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BankAccountsApi } from "../../../services/bankaccountsapi";

const AddEditBankAccounts = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [banks, setBanks] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loadingDdl, setLoadingDdl] = useState(false);

  // Form state - matches API payload
  const [formData, setFormData] = useState({
    Org_Id: "",
    Bank_Id: "",
    account_code: "",
    account_name: "",
    account_number: "",
    account_type: "current",
    ifsc: "",
    micr: "",
    branch_name: "",
    branch_code: "",
    city: "",
    address: "",
    opening_balance: "",
    od_limit: "",
    is_active: true,
  });

  useEffect(() => {
    loadDropdownData();
    if (id && id != "create") {
      setIsEditMode(true);
      loadBankAccountData();
    }
  }, [id]);

  const loadDropdownData = async () => {
    setLoadingDdl(true);
    try {
      const [banksRes, orgsRes] = await Promise.all([
        BankAccountsApi.getAllBanks(),
        BankAccountsApi.getAllOrganizations(),
      ]);
      setBanks(banksRes);
      setOrganizations(orgsRes);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDdl(false);
    }
  };

  const loadBankAccountData = async () => {
    setLoading(true);
    try {
      const account = await BankAccountsApi.getById(id);
      setFormData({
        Org_Id: account.Org_Id || "",
        Bank_Id: account.Bank_Id || "",
        account_code: account.account_code || "",
        account_name: account.account_name || "",
        account_number: account.account_number || "",
        account_type: account.account_type || "current",
        ifsc: account.ifsc || "",
        micr: account.micr || "",
        branch_name: account.branch_name || "",
        branch_code: account.branch_code || "",
        city: account.city || "",
        address: account.address || "",
        opening_balance: account.opening_balance || "",
        od_limit: account.od_limit || "",
        is_active: account.is_active != undefined ? account.is_active : true,
      });
    } catch (error) {
      console.error("Error loading bank account:", error);
      toast.error("Failed to load bank account data!");
      navigate("/masters/financial-accounting/bank-accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Auto uppercase for account_code and ifsc
    if (name == "account_code" || name == "ifsc") {
      const upperValue = value.toUpperCase();
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else if (name == "account_number") {
      // Allow only numbers for account number
      const numValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (name == "opening_balance" || name == "od_limit") {
      // Allow decimal numbers
      const numValue = value.replace(/[^0-9.]/g, "");
      // Prevent multiple decimal points
      const parts = numValue.split(".");
      let sanitized = parts[0];
      if (parts.length > 1) {
        sanitized += "." + parts[1].slice(0, 2);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: sanitized,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Generate IFSC from selected bank and branch code
  useEffect(() => {
    if (formData.Bank_Id && formData.branch_code && !formData.ifsc) {
      const selectedBank = banks.find(
        (b) => b.Bank_Id == parseInt(formData.Bank_Id),
      );
      if (selectedBank && selectedBank.ifsc_prefix) {
        const suggestedIfsc =
          `${selectedBank.ifsc_prefix}${formData.branch_code}`.toUpperCase();
        setFormData((prev) => ({
          ...prev,
          ifsc: suggestedIfsc,
        }));
      }
    }
  }, [formData.Bank_Id, formData.branch_code]);

  const validateForm = () => {
    const newErrors = {};

    // Organization validation
    if (!formData.Org_Id) {
      newErrors.Org_Id = "Organization is required";
    }

    // Bank validation
    if (!formData.Bank_Id) {
      newErrors.Bank_Id = "Bank is required";
    }

    // Account code validation - required, max 20
    if (!formData.account_code.trim()) {
      newErrors.account_code = "Account code is required";
    } else if (formData.account_code.length > 20) {
      newErrors.account_code = "Account code must not exceed 20 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.account_code)) {
      newErrors.account_code =
        "Account code must contain only uppercase letters and numbers";
    }

    // Account name validation - required, max 100
    if (!formData.account_name.trim()) {
      newErrors.account_name = "Account name is required";
    } else if (formData.account_name.length > 100) {
      newErrors.account_name = "Account name must not exceed 100 characters";
    }

    // Account number validation - required, max 30
    if (!formData.account_number.trim()) {
      newErrors.account_number = "Account number is required";
    } else if (formData.account_number.length > 30) {
      newErrors.account_number = "Account number must not exceed 30 characters";
    }

    // Account type validation
    if (!formData.account_type) {
      newErrors.account_type = "Account type is required";
    }

    // IFSC validation - required, max 11
    if (!formData.ifsc.trim()) {
      newErrors.ifsc = "IFSC code is required";
    } else if (formData.ifsc.length > 11) {
      newErrors.ifsc = "IFSC code must not exceed 11 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.ifsc)) {
      newErrors.ifsc = "IFSC must contain only uppercase letters and numbers";
    }

    // MICR validation - optional, exactly 9 digits
    if (formData.micr && !/^\d{9}$/.test(formData.micr)) {
      newErrors.micr = "MICR code must be 9 digits";
    }

    // Branch name validation - required, max 50
    if (!formData.branch_name.trim()) {
      newErrors.branch_name = "Branch name is required";
    } else if (formData.branch_name.length > 50) {
      newErrors.branch_name = "Branch name must not exceed 50 characters";
    }

    // Branch code validation - required, max 20
    if (!formData.branch_code.trim()) {
      newErrors.branch_code = "Branch code is required";
    } else if (formData.branch_code.length > 20) {
      newErrors.branch_code = "Branch code must not exceed 20 characters";
    }

    // City validation - required, max 50
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (formData.city.length > 50) {
      newErrors.city = "City must not exceed 50 characters";
    }

    // Opening balance validation
    if (
      formData.opening_balance &&
      (isNaN(formData.opening_balance) ||
        parseFloat(formData.opening_balance) < 0)
    ) {
      newErrors.opening_balance =
        "Opening balance must be a valid positive number";
    }

    // OD limit validation
    if (
      formData.od_limit &&
      (isNaN(formData.od_limit) || parseFloat(formData.od_limit) < 0)
    ) {
      newErrors.od_limit = "OD limit must be a valid positive number";
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
      title: isEditMode ? "Update Bank Account?" : "Create New Bank Account?",
      text: isEditMode
        ? "Are you sure you want to update this bank account information?"
        : "Are you sure you want to create this new bank account?",
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
      const accountData = {
        Org_Id: parseInt(formData.Org_Id),
        Bank_Id: parseInt(formData.Bank_Id),
        account_code: formData.account_code.trim().toUpperCase(),
        account_name: formData.account_name.trim(),
        account_number: formData.account_number.trim(),
        account_type: formData.account_type,
        ifsc: formData.ifsc.trim().toUpperCase(),
        micr: formData.micr.trim() || null,
        branch_name: formData.branch_name.trim(),
        branch_code: formData.branch_code.trim(),
        city: formData.city.trim(),
        address: formData.address.trim() || null,
        opening_balance: formData.opening_balance
          ? parseFloat(formData.opening_balance)
          : 0,
        od_limit: formData.od_limit ? parseFloat(formData.od_limit) : 0,
        is_active: formData.is_active,
      };

      if (isEditMode) {
        await BankAccountsApi.update(id, accountData);
        toast.success("Bank account updated successfully!");
      } else {
        await BankAccountsApi.create(accountData);
        toast.success("Bank account created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/bank-accounts");
      }, 1500);
    } catch (error) {
      console.error("Error saving bank account:", error);

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
              ? "Failed to update bank account. Please try again."
              : "Failed to create bank account. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/bank-accounts");
  };

  if (loading || loadingDdl) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {loading
            ? "Loading bank account data..."
            : "Loading dropdown options..."}
        </p>
      </div>
    );
  }

  const accountTypes = [
    { value: "saving", label: "Saving Account" },
    { value: "current", label: "Current Account" },
    { value: "overdraft", label: "Overdraft Account" },
    { value: "cash_credit", label: "Cash Credit Account" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/bank-accounts")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Bank Account" : "Add New Bank Account"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update bank account information"
                : "Create a new bank account record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Organization & Bank Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
              <Landmark className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Organization & Bank Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization <span className="text-red-500">*</span>
              </label>
              <select
                name="Org_Id"
                value={formData.Org_Id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Org_Id ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.Org_Id} value={org.Org_Id}>
                    {org.Org_Name} ({org.Org_Code})
                  </option>
                ))}
              </select>
              {errors.Org_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Org_Id}
                </p>
              )}
            </div>

            {/* Bank */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank <span className="text-red-500">*</span>
              </label>
              <select
                name="Bank_Id"
                value={formData.Bank_Id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Bank_Id ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select Bank</option>
                {banks.map((bank) => (
                  <option key={bank.Bank_Id} value={bank.Bank_Id}>
                    {bank.bank_name} ({bank.bank_code})
                  </option>
                ))}
              </select>
              {errors.Bank_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Bank_Id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Account Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Account Code <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.account_code.length}/20
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="account_code"
                  value={formData.account_code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.account_code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., SBI_CURR_001"
                  maxLength={20}
                />
              </div>
              {errors.account_code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.account_code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for this bank account
                </p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.account_name.length}/100
                </span>
              </div>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.account_name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., State Bank Current Account"
                maxLength={100}
              />
              {errors.account_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.account_name}
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.account_number.length}/30
                </span>
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.account_number ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 12345678901234567"
                  maxLength={30}
                />
              </div>
              {errors.account_number && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.account_number}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.account_type ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                {accountTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.account_type && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.account_type}
                </p>
              )}
            </div>

            {/* IFSC Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.ifsc.length}/11
                </span>
              </div>
              <input
                type="text"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.ifsc ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                placeholder="e.g., SBIN0012345"
                maxLength={11}
              />
              {errors.ifsc ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.ifsc}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  11-character alpha-numeric code (auto-generated from bank
                  prefix + branch code)
                </p>
              )}
            </div>

            {/* MICR Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MICR Code{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="micr"
                value={formData.micr}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.micr ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., 380002001"
                maxLength={9}
              />
              {errors.micr && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.micr}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Branch Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Branch Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Branch Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.branch_name.length}/50
                </span>
              </div>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.branch_name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., Ashram Road Branch"
                maxLength={50}
              />
              {errors.branch_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.branch_name}
                </p>
              )}
            </div>

            {/* Branch Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Branch Code <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.branch_code.length}/20
                </span>
              </div>
              <input
                type="text"
                name="branch_code"
                value={formData.branch_code}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.branch_code ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                placeholder="e.g., AR001"
                maxLength={20}
              />
              {errors.branch_code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.branch_code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Used with bank prefix to generate IFSC code
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.city.length}/50
                </span>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.city ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Ahmedabad"
                  maxLength={50}
                />
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.city}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Complete branch address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Financial Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opening Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="text"
                  name="opening_balance"
                  value={formData.opening_balance}
                  onChange={handleInputChange}
                  className={`w-full pl-8 pr-4 py-2.5 border ${
                    errors.opening_balance
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                />
              </div>
              {errors.opening_balance && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.opening_balance}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Initial balance when account was opened
              </p>
            </div>

            {/* OD Limit / Credit Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OD / Credit Limit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="text"
                  name="od_limit"
                  value={formData.od_limit}
                  onChange={handleInputChange}
                  className={`w-full pl-8 pr-4 py-2.5 border ${
                    errors.od_limit ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                />
              </div>
              {errors.od_limit && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.od_limit}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Overdraft limit or credit limit for this account
              </p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Account Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this bank account
              </p>
            </div>
            <div className="flex">
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.is_active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.is_active ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {formData.is_active ? (
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

        {/* Info Note */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Important Information
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Account code must be unique. IFSC code should be 11 characters.
                MICR code should be exactly 9 digits. Opening balance and OD
                limit should be positive numbers.
              </p>
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
              Account code and IFSC are automatically converted to uppercase
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
                  {isEditMode ? "Update Account" : "Create Account"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditBankAccounts;

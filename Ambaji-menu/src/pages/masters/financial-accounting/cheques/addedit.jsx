import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  CreditCard,
  User,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  Hash,
  CheckCircle,
  AlertCircle,
  Info,
  Banknote,
  Receipt,
  Briefcase,
  MapPin,
  Users,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequesApi } from "../../../services/chequesapi";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AddEditCheques = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown data states
  const [organizations, setOrganizations] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [chequeBooks, setChequeBooks] = useState([]);
  const [chequeFormats, setChequeFormats] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Form state - matches API payload
  const [formData, setFormData] = useState({
    Org_Id: "",
    bank_account_id: "",
    cheque_book_id: "",
    cheque_format_id: "",
    status: "",
    cheque_number: "",
    cheque_date: "",
    SL_Name: "",
    amount: "",
    amount_words: "",
    payment_type: "",
    pdc_clearing_date: "",
    narration: "",
    ref_doc_number: "",
    ref_doc_type: "",
    department: "",
    cost_centre: "",
    is_account_payee: true,
    is_not_negotiable: false,
    approval_level: "",
  });

  // Payment type options
  const paymentTypes = ["NEFT", "RTGS", "IMPS", "Cheque", "DD", "Cash"];

  // Reference document types
  const refDocTypes = [
    "Invoice",
    "Bill",
    "Purchase Order",
    "Sales Order",
    "Contract",
    "Other",
  ];

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadChequeData();
    }
  }, [id]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Load organizations
      const orgResponse = await axios.get(
        `${API_BASE_URL}/lst-org-master?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
      if (orgResponse.data.success) {
        setOrganizations(orgResponse.data.data.data || []);
      }

      // Load bank accounts
      const bankAccountResponse = await axios.get(
        `${API_BASE_URL}/bank-accounts/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
      if (bankAccountResponse.data.success) {
        setBankAccounts(bankAccountResponse.data.data || []);
      }

      // Load cheque books
      const chequeBookResponse = await axios.get(
        `${API_BASE_URL}/cheque-books/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
      if (chequeBookResponse.data.success) {
        setChequeBooks(chequeBookResponse.data.data || []);
      }

      // Load cheque formats
      const chequeFormatResponse = await axios.get(
        `${API_BASE_URL}/cheque-formats/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
      if (chequeFormatResponse.data.success) {
        setChequeFormats(chequeFormatResponse.data.data || []);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadChequeData = async () => {
    setLoading(true);
    try {
      const cheque = await ChequesApi.getById(id);
      setFormData({
        Org_Id: cheque.Org_Id || "",
        
        cheque_book_id: cheque.cheque_book_id || "",
        cheque_format_id: cheque.cheque_format_id || "",
        status: cheque.status || "",
        cheque_number: cheque.cheque_number || "",
        cheque_date: cheque.cheque_date ? cheque.cheque_date.split("T")[0] : "",
        SL_Name: cheque.SL_Name || "",
        amount: cheque.amount || "",
        amount_words: cheque.amount_words || "",
        payment_type: cheque.payment_type || ""
       
      });
    } catch (error) {
      console.error("Error loading cheque:", error);
      toast.error("Failed to load cheque data!");
      navigate("/masters/financial-accounting/cheques");
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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Auto-generate amount in words (basic implementation)
  const generateAmountWords = (amount) => {
    if (!amount || amount == 0) return "";
    // This is a basic implementation - you may want to use a proper library
    const num = parseFloat(amount);
    if (isNaN(num)) return "";

    // Simple conversion for demo - replace with actual number to words conversion
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let words = numberToWords(rupees);
    if (paise > 0) {
      words += " and " + numberToWords(paise) + " Paise";
    }
    words += " Only";

    return words;
  };

  // Simple number to words function
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    if (num == 0) return "Zero";

    const convertHundreds = (n) => {
      if (n == 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        const ten = Math.floor(n / 10);
        const one = n % 10;
        return tens[ten] + (one ? " " + ones[one] : "");
      }
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return (
        ones[hundred] +
        " Hundred" +
        (remainder ? " " + convertHundreds(remainder) : "")
      );
    };

    let result = "";
    const lakhs = Math.floor(num / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = num % 1000;

    if (lakhs > 0) {
      result += convertHundreds(lakhs) + " Lakh ";
    }
    if (thousands > 0) {
      result += convertHundreds(thousands) + " Thousand ";
    }
    if (hundreds > 0) {
      result += convertHundreds(hundreds);
    }

    return result.trim();
  };

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setFormData((prev) => ({
      ...prev,
      amount: amount,
      amount_words: generateAmountWords(amount),
    }));

    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Org_Id) {
      newErrors.Org_Id = "Organization is required";
    }
    if (!formData.cheque_number || !formData.cheque_number.trim()) {
      newErrors.cheque_number = "Cheque number is required";
    }
    if (!formData.cheque_date) {
      newErrors.cheque_date = "Cheque date is required";
    }
    if (!formData.SL_Name || !formData.SL_Name.trim()) {
      newErrors.SL_Name = "Payee name is required";
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    if (!formData.payment_type) {
      newErrors.payment_type = "Payment type is required";
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
      title: isEditMode ? "Update Cheque?" : "Create New Cheque?",
      text: isEditMode
        ? "Are you sure you want to update this cheque information?"
        : "Are you sure you want to create this new cheque?",
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
      const chequeData = {
        Org_Id: parseInt(formData.Org_Id),
        bank_account_id: formData.bank_account_id
          ? parseInt(formData.bank_account_id)
          : null,
        cheque_book_id: formData.cheque_book_id
          ? parseInt(formData.cheque_book_id)
          : null,
        cheque_format_id: formData.cheque_format_id
          ? parseInt(formData.cheque_format_id)
          : null,
        status: formData.status ? parseInt(formData.status) : null,
        cheque_number: formData.cheque_number.trim(),
        cheque_date: formData.cheque_date,
        SL_Name: formData.SL_Name.trim(),
        amount: parseFloat(formData.amount),
        amount_words: formData.amount_words.trim(),
        payment_type: formData.payment_type,
        pdc_clearing_date: formData.pdc_clearing_date || null,
        narration: formData.narration.trim() || null,
        ref_doc_number: formData.ref_doc_number.trim() || null,
        ref_doc_type: formData.ref_doc_type || null,
        department: formData.department.trim() || null,
        cost_centre: formData.cost_centre.trim() || null,
        is_account_payee: formData.is_account_payee ? 1 : 0,
        is_not_negotiable: formData.is_not_negotiable ? 1 : 0,
        approval_level: formData.approval_level
          ? parseInt(formData.approval_level)
          : null,
      };

      if (isEditMode) {
        await ChequesApi.update(id, chequeData);
        toast.success("Cheque updated successfully!");
      } else {
        await ChequesApi.create(chequeData);
        toast.success("Cheque created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/cheques");
      }, 1500);
    } catch (error) {
      console.error("Error saving cheque:", error);

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
              ? "Failed to update cheque. Please try again."
              : "Failed to create cheque. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/cheques");
  };

  if (loading || loadingDropdowns) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cheque data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/financial-accounting/cheques")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Cheque" : "Add New Cheque"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update cheque transaction information"
                : "Create a new cheque transaction record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Organization & Bank Details Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Building2 className="h-4 w-4 text-white" />
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

            {/* Bank Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account
              </label>
              <select
                name="bank_account_id"
                value={formData.bank_account_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Bank Account</option>
                {bankAccounts.map((account) => (
                  <option
                    key={account.bank_account_id}
                    value={account.bank_account_id}
                  >
                    {account.bank_name} - {account.account_name} (
                    {account.account_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Cheque Book */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cheque Book
              </label>
              <select
                name="cheque_book_id"
                value={formData.cheque_book_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Cheque Book</option>
                {chequeBooks.map((book) => (
                  <option key={book.cheque_book_id} value={book.cheque_book_id}>
                    {book.book_reference} (Leaves: {book.leaf_from} -{" "}
                    {book.leaf_to})
                  </option>
                ))}
              </select>
            </div>

            {/* Cheque Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cheque Format
              </label>
              <select
                name="cheque_format_id"
                value={formData.cheque_format_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Cheque Format</option>
                {chequeFormats.map((format) => (
                  <option
                    key={format.cheque_format_id}
                    value={format.cheque_format_id}
                  >
                    {format.format_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cheque Details Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Cheque Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cheque Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cheque Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="cheque_number"
                  value={formData.cheque_number}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.cheque_number ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., CHQ-000123"
                />
              </div>
              {errors.cheque_number && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.cheque_number}
                </p>
              )}
            </div>

            {/* Cheque Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cheque Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="cheque_date"
                  value={formData.cheque_date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.cheque_date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {errors.cheque_date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.cheque_date}
                </p>
              )}
            </div>

            {/* PDC Clearing Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDC Clearing Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="pdc_clearing_date"
                  value={formData.pdc_clearing_date}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Post-dated cheque clearing date (if applicable)
              </p>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.payment_type ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select Payment Type</option>
                  {paymentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errors.payment_type && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.payment_type}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payee & Amount Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payee & Amount Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payee Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payee Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="SL_Name"
                  value={formData.SL_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.SL_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter payee name"
                />
              </div>
              {errors.SL_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SL_Name}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.amount ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Amount in Words */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount in Words
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="amount_words"
                  value={formData.amount_words}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Amount in words will be auto-generated"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated from amount field
              </p>
            </div>
          </div>
        </div>
        

        {/* Options Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Cheque Options
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_account_payee"
                checked={formData.is_account_payee}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Account Payee (Crossed Cheque)
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_not_negotiable"
                checked={formData.is_not_negotiable}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Not Negotiable</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
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
                  {isEditMode ? "Update Cheque" : "Create Cheque"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditCheques;

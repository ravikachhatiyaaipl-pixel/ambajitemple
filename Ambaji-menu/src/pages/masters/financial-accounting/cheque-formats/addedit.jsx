import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Eye,
  Calendar,
  User,
  DollarSign,
  FileText,
  Signature,
  Type,
  Palette,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequeFormatsApi } from "../../../services/chequeformatsapi";

const AddEditChequeFormats = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeFieldTab, setActiveFieldTab] = useState("date");
  const [activePreviewField, setActivePreviewField] = useState(null);
  const [previewData, setPreviewData] = useState({
    payee_name: "M/s Sample Enterprises Ltd.",
    amount: "125000",
    amount_words: "One Lakh Twenty Five Thousand Rupees Only",
    // signature1: "Signature 1",
    // signature2: "Signature 2",
  });

  // Helper function to format date based on format string
  const formatDate = (date, format) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    
    switch(format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'DD MMM YYYY':
        return `${day} ${monthShort} ${year}`;
      case 'DDMMYYYY':
        return `${day}${month}${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD-MMM-YYYY':
        return `${day}-${monthShort}-${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  // Font families and weights for dropdowns
  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
  ];
  const fontWeights = [
    "normal",
    "bold",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ];
  const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MMM-YYYY", "DD-MM-YYYY", "DD MMM YYYY", "DDMMYYYY"];

  // Form state - includes font and color properties
  const [formData, setFormData] = useState({
    format_name: "",
    description: "",
    page_width_mm: 210,
    page_height_mm: 99,
    top_margin_mm: 0,
    left_margin_mm: 0,
    // Date field settings
    date_x: 150,
    date_y: 10,
    date_width: 60,
    date_height: 12,
    date_font_size: 11,
    date_font_family: "Arial",
    date_font_weight: "normal",
    date_color: "#000000",
    date_format: "DD/MM/YYYY",
    date_char_spacing: 2,
    print_date: true,
    // Payee field settings
    payee_x: 20,
    payee_y: 35,
    payee_width: 80,
    payee_height: 12,
    payee_font_size: 11,
    payee_font_family: "Arial",
    payee_font_weight: "normal",
    payee_color: "#000000",
    print_payee: true,
    // Amount (Number) field settings
    amount_num_x: 140,
    amount_num_y: 55,
    amount_num_width: 70,
    amount_num_height: 12,
    amount_num_font_size: 11,
    amount_num_font_family: "Arial",
    amount_num_font_weight: "bold",
    amount_num_color: "#000000",
    amount_prefix: "₹",
    amount_suffix: "/-",
    print_amount_num: true,
    // Amount (Words) field settings
    amount_word_x: 20,
    amount_word_y: 55,
    amount_word_width: 110,
    amount_word_height: 12,
    amount_word_font_size: 11,
    amount_word_font_family: "Arial",
    amount_word_font_weight: "normal",
    amount_word_color: "#000000",
    words_suffix: "Only",
    print_amount_words: true,
    // Signature 1 field settings
    sig1_x: 20,
    sig1_y: 80,
    sig1_width: 60,
    sig1_height: 12,
    // Signature 2 field settings
    sig2_x: 130,
    sig2_y: 80,
    sig2_width: 60,
    sig2_height: 12,
    print_signature: true,
    is_default: false,
    is_active: true,
    status: 12,
  });

  // Field tabs configuration
  const fieldTabs = [
    { id: "date", label: "Date", icon: Calendar, printKey: "print_date" },
    { id: "payee", label: "Payee", icon: User, printKey: "print_payee" },
    {
      id: "amount_num",
      label: "Amount (No.)",
      icon: DollarSign,
      printKey: "print_amount_num",
    },
    {
      id: "amount_word",
      label: "Amount (Words)",
      icon: FileText,
      printKey: "print_amount_words",
    },
  ];

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadChequeFormatData();
    }
  }, [id]);

  const loadChequeFormatData = async () => {
    setLoading(true);
    try {
      const data = await ChequeFormatsApi.getById(id);
      setFormData({
        format_name: data.format_name || "",
        description: data.description || "",
        page_width_mm: parseFloat(data.page_width_mm) || 210,
        page_height_mm: parseFloat(data.page_height_mm) || 99,
        top_margin_mm: parseFloat(data.top_margin_mm) || 0,
        left_margin_mm: parseFloat(data.left_margin_mm) || 0,
        date_x: parseFloat(data.date_x) || 150,
        date_y: parseFloat(data.date_y) || 10,
        date_width: parseFloat(data.date_width) || 60,
        date_height: parseFloat(data.date_height) || 12,
        date_font_size: parseFloat(data.date_font_size) || 11,
        date_font_family: data.date_font_family || "Arial",
        date_font_weight: data.date_font_weight || "normal",
        date_color: data.date_color || "#000000",
        date_format: data.date_format || "DD/MM/YYYY",
        date_char_spacing: parseFloat(data.date_char_spacing) || 2,
        print_date: data.print_date == true || data.print_date == 1,
        payee_x: parseFloat(data.payee_x) || 20,
        payee_y: parseFloat(data.payee_y) || 35,
        payee_width: parseFloat(data.payee_width) || 80,
        payee_height: parseFloat(data.payee_height) || 12,
        payee_font_size: parseFloat(data.payee_font_size) || 11,
        payee_font_family: data.payee_font_family || "Arial",
        payee_font_weight: data.payee_font_weight || "normal",
        payee_color: data.payee_color || "#000000",
        print_payee: data.print_payee == true || data.print_payee == 1,
        amount_num_x: parseFloat(data.amount_num_x) || 140,
        amount_num_y: parseFloat(data.amount_num_y) || 55,
        amount_num_width: parseFloat(data.amount_num_width) || 70,
        amount_num_height: parseFloat(data.amount_num_height) || 12,
        amount_num_font_size: parseFloat(data.amount_num_font_size) || 11,
        amount_num_font_family: data.amount_num_font_family || "Arial",
        amount_num_font_weight: data.amount_num_font_weight || "bold",
        amount_num_color: data.amount_num_color || "#000000",
        amount_prefix: data.amount_prefix || "₹",
        amount_suffix: data.amount_suffix || "/-",
        print_amount_num:
          data.print_amount_num == true || data.print_amount_num == 1,
        amount_word_x: parseFloat(data.amount_word_x) || 20,
        amount_word_y: parseFloat(data.amount_word_y) || 55,
        amount_word_width: parseFloat(data.amount_word_width) || 110,
        amount_word_height: parseFloat(data.amount_word_height) || 12,
        amount_word_font_size: parseFloat(data.amount_word_font_size) || 11,
        amount_word_font_family: data.amount_word_font_family || "Arial",
        amount_word_font_weight: data.amount_word_font_weight || "normal",
        amount_word_color: data.amount_word_color || "#000000",
        words_suffix: data.words_suffix || "Only",
        print_amount_words:
          data.print_amount_words == true || data.print_amount_words == 1,
        sig1_x: parseFloat(data.sig1_x) || 20,
        sig1_y: parseFloat(data.sig1_y) || 80,
        sig1_width: parseFloat(data.sig1_width) || 60,
        sig1_height: parseFloat(data.sig1_height) || 12,
        sig2_x: parseFloat(data.sig2_x) || 130,
        sig2_y: parseFloat(data.sig2_y) || 80,
        sig2_width: parseFloat(data.sig2_width) || 60,
        sig2_height: parseFloat(data.sig2_height) || 12,
        print_signature:
          data.print_signature == true || data.print_signature == 1,
        is_default: data.is_default == true || data.is_default == 1,
        is_active: data.is_active == true || data.is_active == 1,
        status: data.status || 12,
      });
    } catch (error) {
      console.error("Error loading cheque format:", error);
      toast.error("Failed to load cheque format data!");
      navigate("/masters/financial-accounting/cheque-formats");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let parsedValue = type == "checkbox" ? checked : value;

    if (type == "number") {
      parsedValue = value == "" ? 0 : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFieldClick = (fieldName) => {
    setActivePreviewField(fieldName);
    setActiveFieldTab(fieldName);
    setTimeout(() => setActivePreviewField(null), 2000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.format_name.trim()) {
      newErrors.format_name = "Format name is required";
    } else if (formData.format_name.length > 100) {
      newErrors.format_name = "Format name must not exceed 100 characters";
    }
    if (formData.page_width_mm <= 0) {
      newErrors.page_width_mm = "Page width must be greater than 0";
    }
    if (formData.page_height_mm <= 0) {
      newErrors.page_height_mm = "Page height must be greater than 0";
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
      title: isEditMode ? "Update Cheque Format?" : "Create New Cheque Format?",
      text: isEditMode
        ? "Are you sure you want to update this cheque format information?"
        : "Are you sure you want to create this new cheque format?",
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
        format_name: formData.format_name.trim(),
        description: formData.description?.trim() || null,
        page_width_mm: formData.page_width_mm,
        page_height_mm: formData.page_height_mm,
        top_margin_mm: formData.top_margin_mm,
        left_margin_mm: formData.left_margin_mm,
        date_x: formData.date_x,
        date_y: formData.date_y,
        date_width: formData.date_width,
        date_height: formData.date_height,
        date_font_size: formData.date_font_size,
        date_font_family: formData.date_font_family,
        date_font_weight: formData.date_font_weight,
        date_color: formData.date_color,
        date_format: formData.date_format,
        date_char_spacing: formData.date_char_spacing,
        print_date: formData.print_date ? 1 : 0,
        payee_x: formData.payee_x,
        payee_y: formData.payee_y,
        payee_width: formData.payee_width,
        payee_height: formData.payee_height,
        payee_font_size: formData.payee_font_size,
        payee_font_family: formData.payee_font_family,
        payee_font_weight: formData.payee_font_weight,
        payee_color: formData.payee_color,
        print_payee: formData.print_payee ? 1 : 0,
        amount_num_x: formData.amount_num_x,
        amount_num_y: formData.amount_num_y,
        amount_num_width: formData.amount_num_width,
        amount_num_height: formData.amount_num_height,
        amount_num_font_size: formData.amount_num_font_size,
        amount_num_font_family: formData.amount_num_font_family,
        amount_num_font_weight: formData.amount_num_font_weight,
        amount_num_color: formData.amount_num_color,
        amount_prefix: formData.amount_prefix,
        amount_suffix: formData.amount_suffix,
        print_amount_num: formData.print_amount_num ? 1 : 0,
        amount_word_x: formData.amount_word_x,
        amount_word_y: formData.amount_word_y,
        amount_word_width: formData.amount_word_width,
        amount_word_height: formData.amount_word_height,
        amount_word_font_size: formData.amount_word_font_size,
        amount_word_font_family: formData.amount_word_font_family,
        amount_word_font_weight: formData.amount_word_font_weight,
        amount_word_color: formData.amount_word_color,
        words_suffix: formData.words_suffix,
        print_amount_words: formData.print_amount_words ? 1 : 0,
        sig1_x: formData.sig1_x,
        sig1_y: formData.sig1_y,
        sig1_width: formData.sig1_width,
        sig1_height: formData.sig1_height,
        sig2_x: formData.sig2_x,
        sig2_y: formData.sig2_y,
        sig2_width: formData.sig2_width,
        sig2_height: formData.sig2_height,
        print_signature: formData.print_signature ? 1 : 0,
        is_default: formData.is_default ? 1 : 0,
        is_active: formData.is_active ? 1 : 0,
        status: formData.status,
      };

      if (isEditMode) {
        await ChequeFormatsApi.update(id, payload);
        toast.success("Cheque format updated successfully!");
      } else {
        await ChequeFormatsApi.create(payload);
        toast.success("Cheque format created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/cheque-formats");
      }, 1500);
    } catch (error) {
      console.error("Error saving cheque format:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          (isEditMode
            ? "Failed to update cheque format. Please try again."
            : "Failed to create cheque format. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/cheque-formats");
  };

  const renderCurrentFieldSettings = () => {
    switch (activeFieldTab) {
      case "date":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  X (mm)
                </label>
                <input
                  type="number"
                  name="date_x"
                  value={formData.date_x}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Y (mm)
                </label>
                <input
                  type="number"
                  name="date_y"
                  value={formData.date_y}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  W (mm)
                </label>
                <input
                  type="number"
                  name="date_width"
                  value={formData.date_width}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  H (mm)
                </label>
                <input
                  type="number"
                  name="date_height"
                  value={formData.date_height}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  name="date_font_size"
                  value={formData.date_font_size}
                  onChange={handleInputChange}
                  step="1"
                  min="8"
                  max="72"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Family
                </label>
                <select
                  name="date_font_family"
                  value={formData.date_font_family}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Weight
                </label>
                <select
                  name="date_font_weight"
                  value={formData.date_font_weight}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontWeights.map((weight) => (
                    <option key={weight} value={weight}>
                      {weight}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="date_color"
                  value={formData.date_color}
                  onChange={handleInputChange}
                  className="w-full h-9 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date Format
                </label>
                <select
                  name="date_format"
                  value={formData.date_format}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {dateFormats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Char Spacing
                </label>
                <input
                  type="number"
                  name="date_char_spacing"
                  value={formData.date_char_spacing}
                  onChange={handleInputChange}
                  step="0.5"
                  min="0"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        );

      case "payee":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  X (mm)
                </label>
                <input
                  type="number"
                  name="payee_x"
                  value={formData.payee_x}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Y (mm)
                </label>
                <input
                  type="number"
                  name="payee_y"
                  value={formData.payee_y}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  W (mm)
                </label>
                <input
                  type="number"
                  name="payee_width"
                  value={formData.payee_width}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  H (mm)
                </label>
                <input
                  type="number"
                  name="payee_height"
                  value={formData.payee_height}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  name="payee_font_size"
                  value={formData.payee_font_size}
                  onChange={handleInputChange}
                  step="1"
                  min="8"
                  max="72"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Family
                </label>
                <select
                  name="payee_font_family"
                  value={formData.payee_font_family}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Weight
                </label>
                <select
                  name="payee_font_weight"
                  value={formData.payee_font_weight}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontWeights.map((weight) => (
                    <option key={weight} value={weight}>
                      {weight}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="payee_color"
                  value={formData.payee_color}
                  onChange={handleInputChange}
                  className="w-full h-9 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        );

      case "amount_num":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  X (mm)
                </label>
                <input
                  type="number"
                  name="amount_num_x"
                  value={formData.amount_num_x}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Y (mm)
                </label>
                <input
                  type="number"
                  name="amount_num_y"
                  value={formData.amount_num_y}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  W (mm)
                </label>
                <input
                  type="number"
                  name="amount_num_width"
                  value={formData.amount_num_width}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  H (mm)
                </label>
                <input
                  type="number"
                  name="amount_num_height"
                  value={formData.amount_num_height}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  name="amount_num_font_size"
                  value={formData.amount_num_font_size}
                  onChange={handleInputChange}
                  step="1"
                  min="8"
                  max="72"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Family
                </label>
                <select
                  name="amount_num_font_family"
                  value={formData.amount_num_font_family}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Weight
                </label>
                <select
                  name="amount_num_font_weight"
                  value={formData.amount_num_font_weight}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontWeights.map((weight) => (
                    <option key={weight} value={weight}>
                      {weight}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="amount_num_color"
                  value={formData.amount_num_color}
                  onChange={handleInputChange}
                  className="w-full h-9 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  name="amount_prefix"
                  value={formData.amount_prefix}
                  onChange={handleInputChange}
                  maxLength={5}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Suffix
                </label>
                <input
                  type="text"
                  name="amount_suffix"
                  value={formData.amount_suffix}
                  onChange={handleInputChange}
                  maxLength={5}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        );

      case "amount_word":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  X (mm)
                </label>
                <input
                  type="number"
                  name="amount_word_x"
                  value={formData.amount_word_x}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Y (mm)
                </label>
                <input
                  type="number"
                  name="amount_word_y"
                  value={formData.amount_word_y}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  W (mm)
                </label>
                <input
                  type="number"
                  name="amount_word_width"
                  value={formData.amount_word_width}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  H (mm)
                </label>
                <input
                  type="number"
                  name="amount_word_height"
                  value={formData.amount_word_height}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  name="amount_word_font_size"
                  value={formData.amount_word_font_size}
                  onChange={handleInputChange}
                  step="1"
                  min="8"
                  max="72"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Family
                </label>
                <select
                  name="amount_word_font_family"
                  value={formData.amount_word_font_family}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Font Weight
                </label>
                <select
                  name="amount_word_font_weight"
                  value={formData.amount_word_font_weight}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {fontWeights.map((weight) => (
                    <option key={weight} value={weight}>
                      {weight}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="amount_word_color"
                  value={formData.amount_word_color}
                  onChange={handleInputChange}
                  className="w-full h-9 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                "Only" Suffix
              </label>
              <input
                type="text"
                name="words_suffix"
                value={formData.words_suffix}
                onChange={handleInputChange}
                maxLength={20}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        );

      case "sig1":
        return (
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                X (mm)
              </label>
              <input
                type="number"
                name="sig1_x"
                value={formData.sig1_x}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Y (mm)
              </label>
              <input
                type="number"
                name="sig1_y"
                value={formData.sig1_y}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                W (mm)
              </label>
              <input
                type="number"
                name="sig1_width"
                value={formData.sig1_width}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                H (mm)
              </label>
              <input
                type="number"
                name="sig1_height"
                value={formData.sig1_height}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        );

      case "sig2":
        return (
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                X (mm)
              </label>
              <input
                type="number"
                name="sig2_x"
                value={formData.sig2_x}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Y (mm)
              </label>
              <input
                type="number"
                name="sig2_y"
                value={formData.sig2_y}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                W (mm)
              </label>
              <input
                type="number"
                name="sig2_width"
                value={formData.sig2_width}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                H (mm)
              </label>
              <input
                type="number"
                name="sig2_height"
                value={formData.sig2_height}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Helper function to get font style for preview
  const getFontStyle = (fieldPrefix) => {
    return {
      fontFamily: formData[`${fieldPrefix}_font_family`],
      fontWeight: formData[`${fieldPrefix}_font_weight`],
      color: formData[`${fieldPrefix}_color`],
      fontSize: `${formData[`${fieldPrefix}_font_size`]}px`,
    };
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cheque format data...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full mx-auto">
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
                  {isEditMode ? "Edit Cheque Format" : "New Cheque Format"}
                </h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two Column Layout - 40% Left, 60% Right */}
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
              {/* Left Column - Settings (40%) */}
              <div className="space-y-5">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border p-5 space-y-5">
                  {/* Format Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format Name *
                    </label>
                    <input
                      type="text"
                      name="format_name"
                      value={formData.format_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.format_name
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg text-sm`}
                      placeholder="e.g. HDFC CTS Standard"
                    />
                    {errors.format_name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.format_name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Optional description..."
                    />
                  </div>

                  {/* Page Settings */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Page Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Width (mm)
                        </label>
                        <input
                          type="number"
                          name="page_width_mm"
                          value={formData.page_width_mm}
                          onChange={handleInputChange}
                          step="0.1"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Height (mm)
                        </label>
                        <input
                          type="number"
                          name="page_height_mm"
                          value={formData.page_height_mm}
                          onChange={handleInputChange}
                          step="0.1"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Top Margin (mm)
                        </label>
                        <input
                          type="number"
                          name="top_margin_mm"
                          value={formData.top_margin_mm}
                          onChange={handleInputChange}
                          step="0.1"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Left Margin (mm)
                        </label>
                        <input
                          type="number"
                          name="left_margin_mm"
                          value={formData.left_margin_mm}
                          onChange={handleInputChange}
                          step="0.1"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field Settings with Tabs */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  {/* Tab Headers */}
                  <div className="flex flex-wrap border-b bg-gray-50">
                    {fieldTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isPrinted = formData[tab.printKey];
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFieldTab(tab.id)}
                          className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                            activeFieldTab == tab.id
                              ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 mr-1.5" />
                          {tab.label}
                          {!isPrinted && (
                            <span className="ml-1.5 text-xs text-gray-400">
                              (Hidden)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
                    {/* Print Checkbox for current field */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <h3 className="font-medium text-gray-900">
                        {fieldTabs.find((t) => t.id == activeFieldTab)?.label}{" "}
                        Settings
                      </h3>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={
                            fieldTabs.find((t) => t.id == activeFieldTab)
                              ?.printKey
                          }
                          checked={
                            formData[
                              fieldTabs.find((t) => t.id == activeFieldTab)
                                ?.printKey
                            ]
                          }
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">
                          Print{" "}
                          {fieldTabs.find((t) => t.id == activeFieldTab)?.label}
                        </span>
                      </label>
                    </div>

                    {/* Dynamic Field Settings */}
                    {renderCurrentFieldSettings()}
                  </div>
                </div>

                {/* Status and Default */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Set as Default
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Live Canvas Preview (60%) */}
              <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col">
                <div className="flex items-center mb-4">
                  <Eye className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Live Canvas — Click on fields to edit
                  </h2>
                </div>

                {/* Canvas Preview */}
                <div className="flex justify-center mb-2">
                  <div
                    className="relative bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden"
                    style={{
                      width: "520px",
                      height: "280px",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    {/* Grid pattern background for better visibility */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    ></div>

                    <div className="absolute inset-0 p-3">
                      {/* Date Field */}
                      {formData.print_date && (
                        <div
                          className={`absolute cursor-pointer transition-all ${activePreviewField == "date" ? "ring-2 ring-blue-500 bg-blue-100" : "hover:ring-2 hover:ring-blue-300 bg-transparent"}`}
                          style={{
                            left: `${Math.min(formData.date_x * 2.2, 450)}px`,
                            top: `${Math.min(formData.date_y * 2.2, 230)}px`,
                            width: `${Math.min(formData.date_width * 2.2, 150)}px`,
                            height: `${Math.min(formData.date_height * 2.2, 30)}px`,
                            ...getFontStyle("date"),
                            letterSpacing: `${formData.date_char_spacing || 0}px`,
                          }}
                          onClick={() => handleFieldClick("date")}
                        >
                          <div className="text-sm">
                            {formatDate(new Date(), formData.date_format)}
                          </div>
                        </div>
                      )}

                      {/* Payee Field */}
                      {formData.print_payee && (
                        <div
                          className={`absolute cursor-pointer transition-all ${activePreviewField == "payee" ? "ring-2 ring-green-500 bg-green-50" : "hover:ring-2 hover:ring-green-300"}`}
                          style={{
                            left: `${Math.min(formData.payee_x * 2.2, 450)}px`,
                            top: `${Math.min(formData.payee_y * 2.2, 230)}px`,
                            width: `${Math.min(formData.payee_width * 2.2, 250)}px`,
                            height: `${Math.min(formData.payee_height * 2.2, 30)}px`,
                            ...getFontStyle("payee"),
                          }}
                          onClick={() => handleFieldClick("payee")}
                        >
                          <div className="truncate">
                            {previewData.payee_name}
                          </div>
                        </div>
                      )}

                      {/* Amount Number Field */}
                      {formData.print_amount_num && (
                        <div
                          className={`absolute cursor-pointer transition-all ${activePreviewField == "amount_num" ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:ring-2 hover:ring-yellow-300"}`}
                          style={{
                            left: `${Math.min(formData.amount_num_x * 2.2, 450)}px`,
                            top: `${Math.min(formData.amount_num_y * 2.2, 230)}px`,
                            width: `${Math.min(formData.amount_num_width * 2.2, 180)}px`,
                            height: `${Math.min(formData.amount_num_height * 2.2, 30)}px`,
                            ...getFontStyle("amount_num"),
                          }}
                          onClick={() => handleFieldClick("amount_num")}
                        >
                          <div>
                            {formData.amount_prefix}{" "}
                            {parseInt(
                              previewData.amount || 125000,
                            ).toLocaleString("en-IN")}
                            .00 {formData.amount_suffix}
                          </div>
                        </div>
                      )}

                      {/* Amount Words Field */}
                      {formData.print_amount_words && (
                        <div
                          className={`absolute cursor-pointer transition-all ${activePreviewField == "amount_word" ? "ring-2 ring-purple-500 bg-purple-50" : "hover:ring-2 hover:ring-purple-300"}`}
                          style={{
                            left: `${Math.min(formData.amount_word_x * 2.2, 450)}px`,
                            top: `${Math.min(formData.amount_word_y * 2.2, 230)}px`,
                            width: `${Math.min(formData.amount_word_width * 2.2, 320)}px`,
                            height: `${Math.min(formData.amount_word_height * 2.2, 30)}px`,
                            ...getFontStyle("amount_word"),
                          }}
                          onClick={() => handleFieldClick("amount_word")}
                        >
                          <div className="truncate text-xs">
                            {previewData.amount_words}
                          </div>
                        </div>
                      )}

                      {/* Signature 1 Field */}
                      {formData.print_signature && formData.sig1_width > 0 && (
                        <div
                          className={`absolute cursor-pointer transition-all ${activePreviewField == "sig1" ? "ring-2 ring-red-500 bg-red-50" : "hover:ring-2 hover:ring-red-300"}`}
                          style={{
                            left: `${Math.min(formData.sig1_x * 2.2, 450)}px`,
                            top: `${Math.min(formData.sig1_y * 2.2, 230)}px`,
                            width: `${Math.min(formData.sig1_width * 2.2, 150)}px`,
                            height: `${Math.min(formData.sig1_height * 2.2, 30)}px`,
                            fontFamily: "cursive",
                            fontStyle: "italic",
                          }}
                          onClick={() => handleFieldClick("sig1")}
                        >
                          <div className="text-sm italic">
                            {previewData.signature1}
                          </div>
                        </div>
                      )}

                      {/* Signature 2 Field */}
                      {formData.print_signature && formData.sig2_width > 0 && (
                        <div
                          className={`absolute cursor-pointer transition-all ${activePreviewField == "sig2" ? "ring-2 ring-red-500 bg-red-50" : "hover:ring-2 hover:ring-red-300"}`}
                          style={{
                            left: `${Math.min(formData.sig2_x * 2.2, 450)}px`,
                            top: `${Math.min(formData.sig2_y * 2.2, 230)}px`,
                            width: `${Math.min(formData.sig2_width * 2.2, 150)}px`,
                            height: `${Math.min(formData.sig2_height * 2.2, 30)}px`,
                            fontFamily: "cursive",
                            fontStyle: "italic",
                          }}
                          onClick={() => handleFieldClick("sig2")}
                        >
                          <div className="text-sm italic">
                            {previewData.signature2}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mb-4">
                  Tip: Click on any field to edit its settings
                </p>

                {/* Sample Data Preview */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    SAMPLE DATA PREVIEW
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end pt-2">
                      <div
                        className="text-sm text-gray-700 font-medium"
                        style={getFontStyle("payee")}
                      >
                        {previewData.payee_name}
                      </div>
                      <div
                        className="text-sm text-gray-800 font-mono"
                        style={{
                          ...getFontStyle("date"),
                          letterSpacing: `${formData.date_char_spacing || 0}px`,
                        }}
                      >
                        {formatDate(new Date(), formData.date_format)}
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <div
                        className="text-sm text-gray-700"
                        style={getFontStyle("amount_word")}
                      >
                        {previewData.amount_words}
                      </div>
                      <div
                        className="text-sm font-bold text-gray-900"
                        style={getFontStyle("amount_num")}
                      >
                        {formData.amount_prefix}{" "}
                        {parseInt(previewData.amount || 125000).toLocaleString(
                          "en-IN",
                        )}
                        .00 {formData.amount_suffix}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                <X className="h-4 w-4 inline mr-1" /> Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  isEditMode ? (
                    "Updating..."
                  ) : (
                    "Creating..."
                  )
                ) : (
                  <>
                    <Save className="h-4 w-4 inline mr-1" />{" "}
                    {isEditMode ? "Update Format" : "Save Format"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditChequeFormats;
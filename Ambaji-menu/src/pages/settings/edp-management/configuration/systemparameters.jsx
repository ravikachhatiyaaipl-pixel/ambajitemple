/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Clock,
  Table,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Globe,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";

const SystemParameters = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paraId, setParaId] = useState(null);
  const [pageTitle, setPageTitle] = useState("System Parameters");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/settings/edp-management/configuration/system-parameters";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  const [formData, setFormData] = useState({
    Date_format: "",
    Time_format: "",
    Currency: "INR",
    Default_Amount: "0.00",
    Amount_Alignment: "left",
    Text_Alignment: "left",
    Db_Row_limit: "25",
    Is_Active: "1",
  });
  const [errors, setErrors] = useState({});

  const dateFormats = [
    { value: "d-m-Y", label: "d-m-Y (04-02-2026)", example: "04-02-2026" },
    { value: "m-d-Y", label: "m-d-Y (02-04-2026)", example: "02-04-2026" },
    { value: "Y-m-d", label: "Y-m-d (2026-02-04)", example: "2026-02-04" },
    { value: "d.m.Y", label: "d.m.Y (04.02.2026)", example: "04.02.2026" },
    { value: "m.d.Y", label: "m.d.Y (02.04.2026)", example: "02.04.2026" },
    { value: "Y.m.d", label: "Y.m.d (2026.02.04)", example: "2026.02.04" },
    { value: "d/m/Y", label: "d/m/Y (04/02/2026)", example: "04/02/2026" },
    { value: "m/d/Y", label: "m/d/Y (02/04/2026)", example: "02/04/2026" },
    { value: "Y/m/d", label: "Y/m/d (2026/02/04)", example: "2026/02/04" },
    { value: "d/M/Y", label: "d/M/Y (04/Feb/2026)", example: "04/Feb/2026" },
    { value: "d.M.Y", label: "d.M.Y (04.Feb.2026)", example: "04.Feb.2026" },
    { value: "d-M-Y", label: "d-M-Y (04-Feb-2026)", example: "04-Feb-2026" },
    { value: "d M Y", label: "d M Y (04 Feb 2026)", example: "04 Feb 2026" },
    {
      value: "d F, Y",
      label: "d F, Y (04 February, 2026)",
      example: "04 February, 2026",
    },
    {
      value: "d D M Y",
      label: "d D M Y (04 Wed Feb 2026)",
      example: "04 Wed Feb 2026",
    },
    {
      value: "D d M Y",
      label: "D d M Y (Wed 04 Feb 2026)",
      example: "Wed 04 Feb 2026",
    },
    {
      value: "dS M Y",
      label: "dS M Y (04th Feb 2026)",
      example: "04th Feb 2026",
    },
  ];

  const timeFormats = [
    { value: "h:i A", label: "12 Hour(s) (03:24 PM)", example: "03:24 PM" },
    { value: "H:i:s", label: "24 Hour(s) (15:24:00)", example: "15:24:00" },
  ];

  const currencyFormats = [
    {
      value: "INR",
      label: "Indian Format (₹ 1,72,25,41,922.69)",
      description: "Uses lakhs and crores - ₹ 1,72,25,41,922.69",
      example: "₹ 1,72,25,41,922.69",
    },
    {
      value: "USD",
      label: "US / International Format ($ 1,722,541,922.69)",
      description: "Standard international format - $ 1,722,541,922.69",
      example: "$ 1,722,541,922.69",
    },
  ];

  const alignmentOptions = [
    { value: "left", label: "Left Align", icon: AlignLeft },
    { value: "center", label: "Center Align", icon: AlignCenter },
    { value: "right", label: "Right Align", icon: AlignRight },
  ];

  const dataTableRowLimits = [
    { value: "25", label: "25 rows" },
    { value: "50", label: "50 rows" },
    { value: "75", label: "75 rows" },
    { value: "100", label: "100 rows" },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-parameters`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      console.log("API Response:", response.data);

      if (
        response.data.status &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const settings = response.data.data[0];

        setParaId(settings.Para_Id);

        let amountAlignment = "left";
        let textAlignment = "left";
        let defaultAmount = "0.00";

        if (
          settings.Amount &&
          typeof settings.Amount == "string" &&
          settings.Amount.includes("{")
        ) {
          try {
            const amountData = JSON.parse(settings.Amount);
            defaultAmount = amountData.default || "0.00";
            amountAlignment = amountData.alignment || "left";
          } catch (e) {
            defaultAmount = settings.Amount;
          }
        } else {
          defaultAmount = settings.Amount || "0.00";
        }

        if (
          settings.Text &&
          typeof settings.Text == "string" &&
          settings.Text.includes("{")
        ) {
          try {
            const textData = JSON.parse(settings.Text);
            textAlignment = textData.alignment || "left";
          } catch (e) {}
        } else if (
          settings.Text &&
          ["left", "center", "right"].includes(settings.Text)
        ) {
          textAlignment = settings.Text;
        }

        setFormData({
          Date_format: settings.Date_format || "",
          Time_format: settings.Time_format || "",
          Currency: settings.Currency || "INR",
          Default_Amount: defaultAmount,
          Amount_Alignment: amountAlignment,
          Text_Alignment: textAlignment,
          Db_Row_limit: settings.Db_Row_limit?.toString() || "25",
          Is_Active: settings.Is_Active || "1",
        });
      } else {
        toast.info("No settings found. Using default values.");
        setFormData({
          Date_format: "",
          Time_format: "",
          Currency: "INR",
          Default_Amount: "0.00",
          Amount_Alignment: "left",
          Text_Alignment: "left",
          Db_Row_limit: "25",
          Is_Active: "1",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "Default_Amount") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      const parts = numericValue.split(".");
      if (parts.length > 2) {
        return;
      }
      if (parts[1] && parts[1].length > 2) {
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.Date_format && formData.Date_format.trim() != "") {
      const datePattern = /^(\d{1,2})[-./]\d{1,2}[-./]\d{2,4}$/;
      if (!datePattern.test(formData.Date_format)) {
        newErrors.Date_format = "Invalid date format";
      }
    }

    if (formData.Time_format && formData.Time_format.trim() != "") {
      if (!["H:i:s", "h:i A"].includes(formData.Time_format)) {
        newErrors.Time_format = "Invalid time format";
      }
    }

    if (formData.Currency && formData.Currency.length > 25) {
      newErrors.Currency = "Maximum 25 characters allowed";
    }

    if (!formData.Default_Amount || formData.Default_Amount == "") {
      newErrors.Default_Amount = "Default amount is required";
    } else if (isNaN(parseFloat(formData.Default_Amount))) {
      newErrors.Default_Amount = "Default amount must be a number";
    } else {
      const amountNum = parseFloat(formData.Default_Amount);
      const amountStr = formData.Default_Amount.toString();

      const digitsOnly = amountStr.replace(".", "");
      if (digitsOnly.length > 15) {
        newErrors.Default_Amount =
          "Amount cannot exceed 13 digits before decimal";
      }

      if (amountStr.includes(".")) {
        const decimalPlaces = amountStr.split(".")[1].length;
        if (decimalPlaces > 2) {
          newErrors.Default_Amount = "Amount can have maximum 2 decimal places";
        }
      }

      if (amountNum < 0) {
        newErrors.Default_Amount = "Amount cannot be negative";
      }
      if (amountNum > 9999999999999.99) {
        newErrors.Default_Amount = "Amount exceeds maximum value";
      }
    }

    if (formData.Db_Row_limit && formData.Db_Row_limit.trim() != "") {
      if (!/^\d+$/.test(formData.Db_Row_limit)) {
        newErrors.Db_Row_limit = "Row limit must be a number";
      } else {
        const limit = parseInt(formData.Db_Row_limit);
        if (limit < 1) {
          newErrors.Db_Row_limit = "Row limit must be greater than 0";
        }
        if (limit > 1000) {
          newErrors.Db_Row_limit = "Row limit cannot exceed 1000";
        }
      }
    }

    if (
      !formData.Is_Active ||
      (formData.Is_Active != "0" && formData.Is_Active != "1")
    ) {
      newErrors.Is_Active = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    const result = await Swal.fire({
      title: paraId ? "Update System Parameters?" : "Save System Parameters?",
      text: paraId
        ? "Are you sure you want to update these System Parameters?"
        : "Are you sure you want to save these System Parameters?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: paraId ? "Yes, update!" : "Yes, save!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const getSampleDateFromFormat = (format) => {
        if (!format) return null;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const shortYear = String(year).slice(-2);

        return format
          .replace(/Y/g, year)
          .replace(/y/g, shortYear)
          .replace(/m/g, month)
          .replace(/n/g, month.replace(/^0/, ""))
          .replace(/d/g, day)
          .replace(/j/g, day.replace(/^0/, ""))
          .replace(/F/g, today.toLocaleString("default", { month: "long" }))
          .replace(/M/g, today.toLocaleString("default", { month: "short" }))
          .replace(/D/g, today.toLocaleString("default", { weekday: "short" }))
          .replace(/l/g, today.toLocaleString("default", { weekday: "long" }))
          .replace(/S/g, getOrdinalSuffix(day));
      };

      const getOrdinalSuffix = (day) => {
        const dayNum = parseInt(day);
        if (dayNum >= 11 && dayNum <= 13) return "th";
        switch (dayNum % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };

      const backendData = {
        Date_format: formData.Date_format
          ? getSampleDateFromFormat(formData.Date_format)
          : null,
        Time_format: formData.Time_format || null,
        Currency: formData.Currency || null,
        Amount: parseFloat(formData.Default_Amount).toFixed(2),
        Text: formData.Text_Alignment,
        Db_Row_limit: formData.Db_Row_limit
          ? parseInt(formData.Db_Row_limit)
          : null,
        Is_Active: formData.Is_Active,
      };

      console.log("Sending to backend:", backendData);

      let response;
      if (paraId) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/parameters/${paraId}`,
          backendData,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );
        toast.success("Parameters updated successfully!");
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/parameters`,
          backendData,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );
        if (response.data && response.data.Para_Id) {
          setParaId(response.data.Para_Id);
        }
        toast.success("Parameters created successfully!");
      }

      Swal.fire({
        title: "Success!",
        text: paraId
          ? "System Parameters have been updated successfully."
          : "System Parameters have been saved successfully.",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "OK",
      });

      await loadSettings();
    } catch (error) {
      console.error("Error saving parameters:", error);
      console.error("Error response:", error.response);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        Object.keys(apiErrors).forEach((key) => {
          toast.error(`${key}: ${apiErrors[key].join(", ")}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to save parameters!");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset to Defaults?",
      text: "This will reset all settings to their default values.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reset!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setFormData({
      Date_format: "",
      Time_format: "",
      Currency: "INR",
      Default_Amount: "0.00",
      Amount_Alignment: "left",
      Text_Alignment: "left",
      Db_Row_limit: "25",
      Is_Active: "1",
    });

    toast.success("Settings reset to defaults!");
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleReload = () => {
    loadSettings();
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading System Parameters...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              Configure application parameters and display settings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </button>
        </div>
      </div>

      {formData.Is_Active == "0" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              These settings are currently{" "}
              <span className="font-semibold">inactive</span>.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date & Time Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Date & Time Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Date_format"
                  value={formData.Date_format}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    errors.Date_format ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Date Format</option>
                  {dateFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.Date_format && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Date_format}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select your preferred date display format
              </p>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Time_format"
                  value={formData.Time_format}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    errors.Time_format ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Time Format</option>
                  {timeFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.Time_format && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Time_format}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                12-hour or 24-hour clock format
              </p>
            </div>
          </div>
        </div>

        {/* Currency Format Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Currency Format Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Currency Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Format
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Currency"
                  value={formData.Currency}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    errors.Currency ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  {currencyFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.Currency && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Currency}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select how currency amounts should be formatted
              </p>
            </div>
          </div>
        </div>

        {/* Amount & Text Alignment Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Field Alignment Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Amount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Amount Value *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Default_Amount"
                  value={formData.Default_Amount}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Default_Amount ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.Default_Amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Default_Amount}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Default amount value (max 13 digits with 2 decimal places)
              </p>
            </div>

            {/* Amount Field Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Field Alignment
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Amount_Alignment"
                  value={formData.Amount_Alignment}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {alignmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Alignment for amount fields in forms
              </p>
            </div>

            {/* Text Field Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Field Alignment
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Text_Alignment"
                  value={formData.Text_Alignment}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {alignmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Alignment for text fields in forms
              </p>
            </div>
          </div>
        </div>

        {/* Database Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-3">
              <Table className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Database Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Database Row Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Row Limit
              </label>
              <div className="relative">
                <Table className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Db_Row_limit"
                  value={formData.Db_Row_limit}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    errors.Db_Row_limit ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Row Limit</option>
                  {dataTableRowLimits.map((limit) => (
                    <option key={limit.value} value={limit.value}>
                      {limit.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.Db_Row_limit && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Db_Row_limit}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Number of rows displayed per page in database tables
              </p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                Activate or deactivate these system parameters
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="Is_Active"
                checked={formData.Is_Active == "1"}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    Is_Active: e.target.checked ? "1" : "0",
                  }));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.Is_Active == "1" ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
          {errors.Is_Active && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.Is_Active}
            </p>
          )}
        </div>

        {/* Reset Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Reset Settings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Restore all settings to their original default values
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 flex items-center transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
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
                  {paraId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {paraId ? "Update Parameters" : "Create Parameters"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SystemParameters;

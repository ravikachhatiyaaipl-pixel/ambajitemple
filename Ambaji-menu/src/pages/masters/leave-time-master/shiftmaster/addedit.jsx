import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, ArrowLeft, Clock, AlertCircle, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ShiftApi } from "../../../services/shiftapi";

const AddEditShift = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Shift Types options
  const shiftTypes = ["Regular", "Rotational", "Flexible", "Split"];
  const yesNoOptions = ["Yes", "No"];
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [formData, setFormData] = useState({
    Sf_Code: "",
    Sf_Name: "",
    Sf_Type: "Regular",
    Sf_Stime: "09:00",
    Sf_Etime: "18:00",
    Sf_Hours: "9",
    Sf_MidNight: "No",
    Brk_Stime: "13:00",
    Brk_Etime: "14:00",
    Grc_In_Mnt: "15",
    Grc_Out_Mnt: "15",
    LtMrk_After: "30",
    ErlMrk_Before: "30",
    Sf_HalfDay: "4",
    Sf_OtAllowed: "Yes",
    Sf_OtGrace: "15",
    Sf_OtRounding: "30",
    Sf_MaxOTHrs: "4",
    Sf_FlxIn_ST: "08:30",
    Sf_FlxOut_ST: "09:30",
    Sf_FlxIn_ET: "17:30",
    Sf_FlxOut_ET: "18:30",
    Sf_Rot_Days: "7",
    Sf_WkOff: "Sunday",
    Sf_HolDy: "Yes",
    Sf_NgtAllow: "No",
  });

  useEffect(() => {
    // Check if we're in edit mode
    if (id && id != "create" && id != "add" && !isNaN(id)) {
      setIsEditMode(true);
      loadShiftData();
    } else {
      setIsEditMode(false);
    }
  }, [id]);

  const loadShiftData = async () => {
    setLoading(true);
    try {
      const shift = await ShiftApi.getById(id);

      if (!shift) {
        toast.error("Shift not found!");
        navigate("/masters/leave-time-master/shiftmaster");
        return;
      }

      // Format time values (remove AM/PM if present)
      const formatTimeForInput = (timeStr) => {
        if (!timeStr) return "";
        // If time is in format "09:00 AM", convert to "09:00"
        if (timeStr.includes("AM") || timeStr.includes("PM")) {
          const [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":");
          if (modifier == "PM" && hours != "12") {
            hours = parseInt(hours, 10) + 12;
          }
          if (modifier == "AM" && hours == "12") {
            hours = "00";
          }
          return `${hours.toString().padStart(2, "0")}:${minutes}`;
        }
        return timeStr;
      };

      setFormData({
        Sf_Code: shift.Sf_Code || "",
        Sf_Name: shift.Sf_Name || "",
        Sf_Type: shift.Sf_Type || "Regular",
        Sf_Stime: formatTimeForInput(shift.Sf_Stime) || "09:00",
        Sf_Etime: formatTimeForInput(shift.Sf_Etime) || "18:00",
        Sf_Hours: shift.Sf_Hours || "9",
        Sf_MidNight: shift.Sf_MidNight || "No",
        Brk_Stime: formatTimeForInput(shift.Brk_Stime) || "13:00",
        Brk_Etime: formatTimeForInput(shift.Brk_Etime) || "14:00",
        Grc_In_Mnt: shift.Grc_In_Mnt || "15",
        Grc_Out_Mnt: shift.Grc_Out_Mnt || "15",
        LtMrk_After: shift.LtMrk_After || "30",
        ErlMrk_Before: shift.ErlMrk_Before || "30",
        Sf_HalfDay: shift.Sf_HalfDay || "4",
        Sf_OtAllowed: shift.Sf_OtAllowed || "Yes",
        Sf_OtGrace: shift.Sf_OtGrace || "15",
        Sf_OtRounding: shift.Sf_OtRounding || "30",
        Sf_MaxOTHrs: shift.Sf_MaxOTHrs || "4",
        Sf_FlxIn_ST: formatTimeForInput(shift.Sf_FlxIn_ST) || "08:30",
        Sf_FlxOut_ST: formatTimeForInput(shift.Sf_FlxOut_ST) || "09:30",
        Sf_FlxIn_ET: formatTimeForInput(shift.Sf_FlxIn_ET) || "17:30",
        Sf_FlxOut_ET: formatTimeForInput(shift.Sf_FlxOut_ET) || "18:30",
        Sf_Rot_Days: shift.Sf_Rot_Days || "7",
        Sf_WkOff: shift.Sf_WkOff || "Sunday",
        Sf_HolDy: shift.Sf_HolDy || "Yes",
        Sf_NgtAllow: shift.Sf_NgtAllow || "No",
      });
    } catch (error) {
      console.error("Error loading shift:", error);
      toast.error(error.message || "Failed to load shift data!");
      navigate("/masters/leave-time-master/shiftmaster");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate hours if start and end time are set
    if (name == "Sf_Stime" || name == "Sf_Etime") {
      calculateHours();
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const calculateHours = () => {
    setTimeout(() => {
      if (formData.Sf_Stime && formData.Sf_Etime) {
        const start = formData.Sf_Stime.split(":");
        const end = formData.Sf_Etime.split(":");

        let startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
        let endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);

        // Handle overnight shifts
        if (endMinutes < startMinutes) {
          endMinutes += 24 * 60;
        }

        const diffHours = ((endMinutes - startMinutes) / 60).toFixed(1);
        setFormData((prev) => ({ ...prev, Sf_Hours: diffHours }));
      }
    }, 100);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Sf_Code?.trim()) newErrors.Sf_Code = "Shift code is required";
    if (!formData.Sf_Name?.trim()) newErrors.Sf_Name = "Shift name is required";
    if (!formData.Sf_Stime) newErrors.Sf_Stime = "Start time is required";
    if (!formData.Sf_Etime) newErrors.Sf_Etime = "End time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Shift?" : "Create New Shift?",
      text: isEditMode
        ? "Are you sure you want to update this shift?"
        : "Are you sure you want to create this shift?",
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
      // Format time values to include AM/PM as per API expectation
      const formatTimeForAPI = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":");
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
      };

      const payload = {
        Sf_Code: formData.Sf_Code,
        Sf_Name: formData.Sf_Name,
        Sf_Type: formData.Sf_Type,
        Sf_Stime: formatTimeForAPI(formData.Sf_Stime),
        Sf_Etime: formatTimeForAPI(formData.Sf_Etime),
        Sf_Hours: formData.Sf_Hours,
        Sf_MidNight: formData.Sf_MidNight,
        Brk_Stime: formatTimeForAPI(formData.Brk_Stime),
        Brk_Etime: formatTimeForAPI(formData.Brk_Etime),
        Grc_In_Mnt: formData.Grc_In_Mnt,
        Grc_Out_Mnt: formData.Grc_Out_Mnt,
        LtMrk_After: formData.LtMrk_After,
        ErlMrk_Before: formData.ErlMrk_Before,
        Sf_HalfDay: formData.Sf_HalfDay,
        Sf_OtAllowed: formData.Sf_OtAllowed,
        Sf_OtGrace: formData.Sf_OtGrace,
        Sf_OtRounding: formData.Sf_OtRounding,
        Sf_MaxOTHrs: formData.Sf_MaxOTHrs,
        Sf_FlxIn_ST: formatTimeForAPI(formData.Sf_FlxIn_ST),
        Sf_FlxOut_ST: formatTimeForAPI(formData.Sf_FlxOut_ST),
        Sf_FlxIn_ET: formatTimeForAPI(formData.Sf_FlxIn_ET),
        Sf_FlxOut_ET: formatTimeForAPI(formData.Sf_FlxOut_ET),
        Sf_Rot_Days: formData.Sf_Rot_Days,
        Sf_WkOff: formData.Sf_WkOff,
        Sf_HolDy: formData.Sf_HolDy,
        Sf_NgtAllow: formData.Sf_NgtAllow,
      };
      let response;
      if (isEditMode) {
        response = await ShiftApi.update(id, payload);
        toast.success("Shift updated successfully!");
      } else {
        response = await ShiftApi.create(payload);
        toast.success("Shift created successfully!");
      }

      // Navigate back to list
      setTimeout(() => {
        navigate("/masters/leave-time-master/shiftmaster");
      }, 1500);
    } catch (error) {
      console.error("Error saving shift:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const newErrors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.response.data.errors[key])
            ? error.response.data.errors[key][0]
            : error.response.data.errors[key];
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode ? "Failed to update shift." : "Failed to create shift.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/leave-time-master/shiftmaster");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading shift data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/leave-time-master/shiftmaster")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Shift" : "Add New Shift"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? `Updating shift: ${formData.Sf_Code}`
                : "Create a new shift schedule"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shift Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Sf_Name"
                value={formData.Sf_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Sf_Name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Enter shift name"
              />
              {errors.Sf_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Sf_Name}
                </p>
              )}
            </div>
            {/* Shift Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Sf_Code"
                value={formData.Sf_Code}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Sf_Code ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Enter shift code"
                disabled={isEditMode}
              />
              {errors.Sf_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Sf_Code}
                </p>
              )}
            </div>

            {/* Shift Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Type
              </label>
              <select
                name="Sf_Type"
                value={formData.Sf_Type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {shiftTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Week Off */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week Off
              </label>
              <select
                name="Sf_WkOff"
                value={formData.Sf_WkOff}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {weekDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Timing Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="Sf_Stime"
                value={formData.Sf_Stime}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Sf_Stime ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.Sf_Stime && (
                <p className="mt-1 text-sm text-red-600">{errors.Sf_Stime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="Sf_Etime"
                value={formData.Sf_Etime}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Sf_Etime ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              {errors.Sf_Etime && (
                <p className="mt-1 text-sm text-red-600">{errors.Sf_Etime}</p>
              )}
            </div>

            {/* Total Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Hours
              </label>
              <input
                type="text"
                name="Sf_Hours"
                value={formData.Sf_Hours}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Midnight Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Midnight Shift
              </label>
              <select
                name="Sf_MidNight"
                value={formData.Sf_MidNight}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Half Day Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Half Day Hours
              </label>
              <input
                type="number"
                name="Sf_HalfDay"
                value={formData.Sf_HalfDay}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Rotation Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rotation Days
              </label>
              <input
                type="number"
                name="Sf_Rot_Days"
                value={formData.Sf_Rot_Days}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Break Timing */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Break Timing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Break Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Start Time
              </label>
              <input
                type="time"
                name="Brk_Stime"
                value={formData.Brk_Stime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Break End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break End Time
              </label>
              <input
                type="time"
                name="Brk_Etime"
                value={formData.Brk_Etime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Grace & Late Marking */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-3">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Grace & Late Marking (Minutes)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grace In
              </label>
              <input
                type="number"
                name="Grc_In_Mnt"
                value={formData.Grc_In_Mnt}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grace Out
              </label>
              <input
                type="number"
                name="Grc_Out_Mnt"
                value={formData.Grc_Out_Mnt}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Mark After
              </label>
              <input
                type="number"
                name="LtMrk_After"
                value={formData.LtMrk_After}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Early Mark Before
              </label>
              <input
                type="number"
                name="ErlMrk_Before"
                value={formData.ErlMrk_Before}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Overtime Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-3">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Overtime Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* OT Allowed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OT Allowed
              </label>
              <select
                name="Sf_OtAllowed"
                value={formData.Sf_OtAllowed}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* OT Grace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OT Grace (min)
              </label>
              <input
                type="number"
                name="Sf_OtGrace"
                value={formData.Sf_OtGrace}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* OT Rounding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OT Rounding (min)
              </label>
              <input
                type="number"
                name="Sf_OtRounding"
                value={formData.Sf_OtRounding}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Max OT Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max OT Hours
              </label>
              <input
                type="number"
                name="Sf_MaxOTHrs"
                value={formData.Sf_MaxOTHrs}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Flexible Timing */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Flexible Timing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Flex In Window
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="Sf_FlxIn_ST"
                    value={formData.Sf_FlxIn_ST}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="Sf_FlxIn_ET"
                    value={formData.Sf_FlxIn_ET}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Flex Out Window
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="Sf_FlxOut_ST"
                    value={formData.Sf_FlxOut_ST}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="Sf_FlxOut_ET"
                    value={formData.Sf_FlxOut_ET}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Holiday & Night Allowance */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Holiday Duty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Duty
              </label>
              <select
                name="Sf_HolDy"
                value={formData.Sf_HolDy}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Night Allowance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Night Allowance
              </label>
              <select
                name="Sf_NgtAllow"
                value={formData.Sf_NgtAllow}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <span className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </span>
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Shift" : "Create Shift"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditShift;

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

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Shield,
  AlertCircle,
  Calendar,
  Users,
  Wallet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmpGroupInsuranceApi from "../../../services/empgroupinsuranceapi";
import PayCommissionApi from "../../../services/paycommissionapi";

const AddEditEmpGroupInsurance = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs for focus management
  const effectiveDateRef = useRef(null);
  const payCommissionRef = useRef(null);
  const groupTypeRef = useRef(null);
  const insuranceAmtRef = useRef(null);
  const saveAmtRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    Effective_Date: getCurrentDate(),
    Group_Type: "",
    Insurance_Amt: "",
    Save_Amt: "",
    PC_Id: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCommissions();
    if (id && id != "create") {
      setIsEditMode(true);
      loadInsuranceData();
    }
  }, [id]);

  // Set focus on Pay Commission when page loads
  useEffect(() => {
    if (!loading && payCommissionRef.current) {
      setTimeout(() => {
        payCommissionRef.current.focus();
      }, 100);
    }
  }, [loading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCommissions = async () => {
    try {
      const response = await PayCommissionApi.getAllList();
      if (response.success) {
        setCommissions(response.data || []);
      } else if (Array.isArray(response)) {
        setCommissions(response);
      }
    } catch (error) {
      console.error("Error loading commissions:", error);
      toast.error("Failed to load pay commissions");
    }
  };

  const loadInsuranceData = async () => {
    setLoading(true);
    try {
      const response = await EmpGroupInsuranceApi.getById(id);
      if (response.success) {
        const insurance = response.data;
        setFormData({
          Effective_Date: insurance.Effective_Date
            ? insurance.Effective_Date.split("T")[0]
            : getCurrentDate(),
          Group_Type: insurance.Group_Type || "",
          Insurance_Amt: insurance.Insurance_Amt || "",
          Save_Amt: insurance.Save_Amt || "",
          PC_Id: insurance.PC_Id || "",
        });
      } else {
        toast.error("Failed to load insurance data!");
        navigate("/masters/employee-records/emp-group-insurance");
      }
    } catch (error) {
      toast.error("Failed to load insurance data!");
      navigate("/masters/employee-records/emp-group-insurance");
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle Enter key press for navigation
  const handleKeyPress = (e, nextFieldRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  // Handle Pay Commission selection
  const handleSelectCommission = (commission) => {
    setFormData((prev) => ({
      ...prev,
      PC_Id: commission.PC_Id,
    }));
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);

    // After selection, automatically move to Group Type field
    setTimeout(() => {
      if (groupTypeRef.current) {
        groupTypeRef.current.focus();
      }
    }, 50);
  };

  // Handle click on select - open dropdown
  const handleSelectClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation in dropdown
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isDropdownOpen) {
          // Open dropdown on down arrow
          setIsDropdownOpen(true);
          setHighlightedIndex(0);
        } else if (isDropdownOpen && commissions.length > 0) {
          // Navigate down through options
          setHighlightedIndex((prev) =>
            prev < commissions.length - 1 ? prev + 1 : prev,
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (isDropdownOpen) {
          if (highlightedIndex > 0) {
            setHighlightedIndex((prev) => prev - 1);
          } else if (highlightedIndex == 0) {
            setHighlightedIndex(-1);
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        if (
          isDropdownOpen &&
          highlightedIndex >= 0 &&
          commissions[highlightedIndex]
        ) {
          // Select highlighted option
          handleSelectCommission(commissions[highlightedIndex]);
        } else if (!isDropdownOpen) {
          // If dropdown closed, open it
          setIsDropdownOpen(true);
          setHighlightedIndex(0);
        }
        break;

      case "Escape":
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;

      case "Tab":
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Get selected commission name
  const getSelectedCommissionName = () => {
    if (!formData.PC_Id) return "Select Pay Commission";
    const selected = commissions.find((c) => c.PC_Id == formData.PC_Id);
    return selected ? selected.PC_Name : "Select Pay Commission";
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate Effective Date as required
    if (!formData.Effective_Date) {
      newErrors.Effective_Date = "Effective date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Insurance?" : "Create New Insurance?",
      text: isEditMode
        ? "Are you sure you want to update this insurance record?"
        : "Are you sure you want to create this new insurance record?",
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
      const submitData = {
        Effective_Date: formData.Effective_Date,
        Group_Type: formData.Group_Type || null,
        Insurance_Amt: formData.Insurance_Amt
          ? parseFloat(formData.Insurance_Amt)
          : null,
        Save_Amt: formData.Save_Amt ? parseFloat(formData.Save_Amt) : null,
        PC_Id: formData.PC_Id ? parseInt(formData.PC_Id) : null,
      };

      if (isEditMode) {
        await EmpGroupInsuranceApi.update(id, submitData);
        toast.success("Insurance record updated successfully!");
      } else {
        await EmpGroupInsuranceApi.create(submitData);
        toast.success("Insurance record created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/employee-records/emp-group-insurance");
      }, 1500);
    } catch (error) {
      console.error("Error saving insurance record:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update. Please try again."
            : "Failed to create. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/employee-records/emp-group-insurance");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading insurance data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/emp-group-insurance")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Insurance" : "Add New Insurance"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update employee group insurance information"
                : "Create a new employee group insurance record for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Insurance Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Effective Date - First field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={effectiveDateRef}
                  type="date"
                  name="Effective_Date"
                  value={formData.Effective_Date}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, payCommissionRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Effective_Date ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.Effective_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Effective_Date}
                </p>
              )}
            </div>

            {/* Pay Commission - Second field with custom dropdown */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Commission
              </label>
              <div
                ref={payCommissionRef}
                tabIndex={0}
                onClick={handleSelectClick}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white flex items-center justify-between"
              >
                <span
                  className={
                    !formData.PC_Id ? "text-gray-500" : "text-gray-900"
                  }
                >
                  {getSelectedCommissionName()}
                </span>
                {isDropdownOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && commissions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {commissions.map((commission, index) => (
                    <div
                      key={commission.PC_Id}
                      onClick={() => handleSelectCommission(commission)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                        highlightedIndex == index ? "bg-blue-100" : ""
                      } ${
                        formData.PC_Id == commission.PC_Id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">
                          {commission.PC_Name}
                        </span>
                        {formData.PC_Id == commission.PC_Id && (
                          <span className="text-xs text-blue-600">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isDropdownOpen && commissions.length == 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No pay commissions found
                  </div>
                </div>
              )}
            </div>

            {/* Group Type - Third field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Group Code
                </label>
                <span
                  className={`text-xs ${
                    formData.Group_Type.length > 40
                      ? formData.Group_Type.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Group_Type.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={groupTypeRef}
                  type="text"
                  name="Group_Type"
                  value={formData.Group_Type}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, insuranceAmtRef)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Code"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Insurance Amount - Fourth field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Amount (₹)
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={insuranceAmtRef}
                  type="number"
                  name="Insurance_Amt"
                  value={formData.Insurance_Amt}
                  onChange={handleInputChange}
                  onKeyPress={(e) => handleKeyPress(e, saveAmtRef)}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50000.00"
                />
              </div>
            </div>

            {/* Savings Amount - Fifth field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savings Amount (₹)
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={saveAmtRef}
                  type="number"
                  name="Save_Amt"
                  value={formData.Save_Amt}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10000.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
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
                  {isEditMode ? "Update Insurance" : "Create Insurance"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEmpGroupInsurance;

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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Building,
  Award,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  Search,
  XCircle,
  RefreshCw,
  Calculator,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Tamarate from "../../../services/tamarate";

const AddEditTamarate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [empGrades, setEmpGrades] = useState([]);
  const [cityGrades, setCityGrades] = useState([]);
  const [filteredEmpGrades, setFilteredEmpGrades] = useState([]);
  const [filteredCityGrades, setFilteredCityGrades] = useState([]);
  const [searchEmpGradeTerm, setSearchEmpGradeTerm] = useState("");
  const [searchCityGradeTerm, setSearchCityGradeTerm] = useState("");
  const [selectedEmpGrade, setSelectedEmpGrade] = useState(null);
  const [selectedCityGrade, setSelectedCityGrade] = useState(null);
  const [empGradeSearchOpen, setEmpGradeSearchOpen] = useState(false);
  const [cityGradeSearchOpen, setCityGradeSearchOpen] = useState(false);
  const [originalEmpGrade, setOriginalEmpGrade] = useState(null);
  const [originalCityGrade, setOriginalCityGrade] = useState(null);
  const [pageTitle, setPageTitle] = useState("TA-MA Rate Master");
  const [empGradeHighlightIndex, setEmpGradeHighlightIndex] = useState(-1);
  const [cityGradeHighlightIndex, setCityGradeHighlightIndex] = useState(-1);

  // Refs for dropdown containers
  const empGradeDropdownRef = useRef(null);
  const cityGradeDropdownRef = useRef(null);
  const empGradeSearchInputRef = useRef(null);
  const cityGradeSearchInputRef = useRef(null);
  const empGradeButtonRef = useRef(null);
  const cityGradeButtonRef = useRef(null);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/payroll-pay-structures/ta-ma-rate-master";
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
    EGM_Id: "",
    CGR_Id: "",
    TA: "",
    MA: "",
    TMR_Date: new Date().toISOString().split("T")[0], // Set current date
  });

  const [errors, setErrors] = useState({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        empGradeDropdownRef.current &&
        !empGradeDropdownRef.current.contains(event.target)
      ) {
        setEmpGradeSearchOpen(false);
        setEmpGradeHighlightIndex(-1);
        setSearchEmpGradeTerm("");
      }
      if (
        cityGradeDropdownRef.current &&
        !cityGradeDropdownRef.current.contains(event.target)
      ) {
        setCityGradeSearchOpen(false);
        setCityGradeHighlightIndex(-1);
        setSearchCityGradeTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadDropdowns();

    if (id && id != "create") {
      setIsEditMode(true);
    }
  }, [id, location]);

  useEffect(() => {
    if (isEditMode && id) {
      loadRateData();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (searchEmpGradeTerm.trim()) {
      const term = searchEmpGradeTerm.toLowerCase();
      const filtered = empGrades.filter(
        (grade) =>
          grade.EGM_Name?.toLowerCase().includes(term) ||
          grade.EGM_Code?.toLowerCase().includes(term),
      );
      setFilteredEmpGrades(filtered);
      setEmpGradeHighlightIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setFilteredEmpGrades(empGrades);
      setEmpGradeHighlightIndex(empGrades.length > 0 ? 0 : -1);
    }
  }, [searchEmpGradeTerm, empGrades]);

  useEffect(() => {
    if (searchCityGradeTerm.trim()) {
      const term = searchCityGradeTerm.toLowerCase();
      const filtered = cityGrades.filter(
        (city) =>
          city.City_Name?.toLowerCase().includes(term) ||
          city.Grade?.toLowerCase().includes(term),
      );
      setFilteredCityGrades(filtered);
      setCityGradeHighlightIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setFilteredCityGrades(cityGrades);
      setCityGradeHighlightIndex(cityGrades.length > 0 ? 0 : -1);
    }
  }, [searchCityGradeTerm, cityGrades]);

  const loadDropdowns = async () => {
    try {
      const [empGradesResponse, cityGradesResponse] = await Promise.all([
        Tamarate.getEmpGrades(),
        Tamarate.getCityGrades(),
      ]);

      if (empGradesResponse.success) {
        const gradesData = empGradesResponse.data || [];
        const activeGrades = gradesData.filter(
          (grade) => grade.Is_Active == "1",
        );
        setEmpGrades(activeGrades);
        setFilteredEmpGrades(activeGrades);
        if (activeGrades.length > 0) {
          setEmpGradeHighlightIndex(0);
        }
      } else {
        console.error(
          "Failed to load employee grades:",
          empGradesResponse.message,
        );
        toast.error("Failed to load employee grades");
      }

      if (cityGradesResponse.success) {
        const citiesData = cityGradesResponse.data || [];
        setCityGrades(citiesData);
        setFilteredCityGrades(citiesData);
        if (citiesData.length > 0) {
          setCityGradeHighlightIndex(0);
        }
      } else {
        console.error(
          "Failed to load city grades:",
          cityGradesResponse.message,
        );
        toast.error("Failed to load city grades");
      }
    } catch (error) {
      console.error("Failed to load dropdowns:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const loadRateData = async () => {
    setLoading(true);
    try {
      const response = await Tamarate.getById(id);
      if (response.success == true) {
        const rateData = response.data;

        setFormData({
          EGM_Id: rateData.EGM_Id?.toString() || "",
          CGR_Id: rateData.CGR_Id?.toString() || "",
          TA: rateData.TA?.toString() || "",
          MA: rateData.MA?.toString() || "",
          TMR_Date: rateData.TMR_Date || new Date().toISOString().split("T")[0], // Load existing date or current date
        });

        if (rateData.emp_grade) {
          setSelectedEmpGrade(rateData.emp_grade);
          setOriginalEmpGrade(rateData.emp_grade);
        }
        if (rateData.city_grade) {
          setSelectedCityGrade(rateData.city_grade);
          setOriginalCityGrade(rateData.city_grade);
        }
      } else {
        toast.error("Failed to load rate data!");
        navigate("/masters/payroll-pay-structures/ta-ma-rate-master");
      }
    } catch (error) {
      console.error("Error loading rate:", error);
      toast.error("Failed to load rate data!");
      navigate("/masters/payroll-pay-structures/ta-ma-rate-master");
    } finally {
      setLoading(false);
    }
  };

  const handleEmpGradeSelect = (grade) => {
    setFormData((prev) => ({
      ...prev,
      EGM_Id: grade.EGM_Id.toString(),
    }));
    setSelectedEmpGrade(grade);
    setEmpGradeSearchOpen(false);
    setSearchEmpGradeTerm("");
    setEmpGradeHighlightIndex(-1);

    if (errors.EGM_Id) {
      setErrors((prev) => ({ ...prev, EGM_Id: null }));
    }
  };

  const handleCityGradeSelect = (city) => {
    setFormData((prev) => ({
      ...prev,
      CGR_Id: city.CGR_Id.toString(),
    }));
    setSelectedCityGrade(city);
    setCityGradeSearchOpen(false);
    setSearchCityGradeTerm("");
    setCityGradeHighlightIndex(-1);

    if (errors.CGR_Id) {
      setErrors((prev) => ({ ...prev, CGR_Id: null }));
    }
  };

  // Keyboard navigation for employee grade dropdown
  const handleEmpGradeKeyDown = (e) => {
    if (!empGradeSearchOpen) {
      if (e.key == "ArrowDown" || e.key == "ArrowUp") {
        e.preventDefault();
        setEmpGradeSearchOpen(true);
        if (filteredEmpGrades.length > 0) {
          setEmpGradeHighlightIndex(0);
        }
        setTimeout(() => {
          empGradeSearchInputRef.current?.focus();
        }, 100);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (filteredEmpGrades.length > 0) {
          setEmpGradeHighlightIndex((prev) =>
            prev < filteredEmpGrades.length - 1 ? prev + 1 : 0,
          );
          // Scroll into view
          const highlightedElement = document.querySelector(
            `.emp-grade-item-${empGradeHighlightIndex + 1}`,
          );
          if (highlightedElement) {
            highlightedElement.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (filteredEmpGrades.length > 0) {
          setEmpGradeHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : filteredEmpGrades.length - 1,
          );
          // Scroll into view
          const highlightedElement = document.querySelector(
            `.emp-grade-item-${empGradeHighlightIndex - 1}`,
          );
          if (highlightedElement) {
            highlightedElement.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          }
        }
        break;
      case "Enter":
        e.preventDefault();
        if (
          empGradeHighlightIndex >= 0 &&
          filteredEmpGrades[empGradeHighlightIndex]
        ) {
          handleEmpGradeSelect(filteredEmpGrades[empGradeHighlightIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setEmpGradeSearchOpen(false);
        setEmpGradeHighlightIndex(-1);
        setSearchEmpGradeTerm("");
        empGradeButtonRef.current?.focus();
        break;
      default:
        break;
    }
  };

  // Keyboard navigation for city grade dropdown
  const handleCityGradeKeyDown = (e) => {
    if (!cityGradeSearchOpen) {
      if (e.key == "ArrowDown" || e.key == "ArrowUp") {
        e.preventDefault();
        setCityGradeSearchOpen(true);
        if (filteredCityGrades.length > 0) {
          setCityGradeHighlightIndex(0);
        }
        setTimeout(() => {
          cityGradeSearchInputRef.current?.focus();
        }, 100);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (filteredCityGrades.length > 0) {
          setCityGradeHighlightIndex((prev) =>
            prev < filteredCityGrades.length - 1 ? prev + 1 : 0,
          );
          // Scroll into view
          const highlightedElement = document.querySelector(
            `.city-grade-item-${cityGradeHighlightIndex + 1}`,
          );
          if (highlightedElement) {
            highlightedElement.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (filteredCityGrades.length > 0) {
          setCityGradeHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCityGrades.length - 1,
          );
          // Scroll into view
          const highlightedElement = document.querySelector(
            `.city-grade-item-${cityGradeHighlightIndex - 1}`,
          );
          if (highlightedElement) {
            highlightedElement.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          }
        }
        break;
      case "Enter":
        e.preventDefault();
        if (
          cityGradeHighlightIndex >= 0 &&
          filteredCityGrades[cityGradeHighlightIndex]
        ) {
          handleCityGradeSelect(filteredCityGrades[cityGradeHighlightIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setCityGradeSearchOpen(false);
        setCityGradeHighlightIndex(-1);
        setSearchCityGradeTerm("");
        cityGradeButtonRef.current?.focus();
        break;
      default:
        break;
    }
  };

  // Removed validation function

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      EGM_Id: parseInt(formData.EGM_Id),
      CGR_Id: parseInt(formData.CGR_Id),
      TA: parseFloat(formData.TA),
      MA: parseFloat(formData.MA),
      TMR_Date: formData.TMR_Date,
    };

    const currentSelectedEmpGrade = empGrades.find(
      (grade) => grade.EGM_Id.toString() == formData.EGM_Id,
    );
    const currentSelectedCityGrade = cityGrades.find(
      (city) => city.CGR_Id.toString() == formData.CGR_Id,
    );

    let confirmationMessage = "";
    if (isEditMode) {
      const changes = [];

      if (originalEmpGrade?.EGM_Id.toString() != formData.EGM_Id) {
        changes.push(
          `<strong>Employee Grade:</strong> ${originalEmpGrade?.EGM_Name || "N/A"} → ${currentSelectedEmpGrade?.EGM_Name || "N/A"}`,
        );
      }

      if (originalCityGrade?.CGR_Id.toString() != formData.CGR_Id) {
        changes.push(
          `<strong>City Grade:</strong> ${originalCityGrade?.City_Name || "N/A"} → ${currentSelectedCityGrade?.City_Name || "N/A"}`,
        );
      }

      if (originalFormData.TA != formData.TA) {
        changes.push(
          `<strong>TA Amount:</strong> ₹${originalFormData.TA || "0"} → ₹${formData.TA}`,
        );
      }

      if (originalFormData.MA != formData.MA) {
        changes.push(
          `<strong>MA Amount:</strong> ₹${originalFormData.MA || "0"} → ₹${formData.MA}`,
        );
      }

      if (originalFormData.TMR_Date != formData.TMR_Date) {
        changes.push(
          `<strong>Effective Date:</strong> ${originalFormData.TMR_Date || "N/A"} → ${formData.TMR_Date}`,
        );
      }

      // Remove the "No changes detected" check - always show confirmation
      confirmationMessage = `
        <div class="text-left">
          <p class="mb-2">Update this TA-MA rate configuration?</p>
          ${changes.length > 0 ? `<div class="text-sm text-gray-600 mb-2">${changes.join("<br/>")}</div>` : '<p class="text-sm text-gray-600 mb-2">No changes detected</p>'}
        </div>
      `;
    } else {
      confirmationMessage = `
        <div class="text-left">
          <p class="mb-2">Create a new TA-MA rate configuration?</p>
          <p class="text-sm text-gray-600 mb-1"><strong>Employee Grade:</strong> ${currentSelectedEmpGrade?.EGM_Name || "Not selected"}</p>
          <p class="text-sm text-gray-600 mb-1"><strong>City Grade:</strong> ${currentSelectedCityGrade?.City_Name || "Not selected"}</p>
          <p class="text-sm text-gray-600 mb-1"><strong>TA Amount:</strong> ₹${formData.TA || "0"}</p>
          <p class="text-sm text-gray-600 mb-1"><strong>MA Amount:</strong> ₹${formData.MA || "0"}</p>
          <p class="text-sm text-gray-600 mb-2"><strong>Effective Date:</strong> ${formData.TMR_Date || "Not selected"}</p>
        </div>
      `;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Rate?" : "Create New Rate?",
      html: confirmationMessage,
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
      if (isEditMode) {
        await Tamarate.update(id, submitData);
        toast.success("TA-MA rate updated successfully!");
      } else {
        await Tamarate.create(submitData);
        toast.success("TA-MA rate created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/ta-ma-rate-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving rate:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update rate. Please try again."
            : "Failed to create rate. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/payroll-pay-structures/ta-ma-rate-master");
  };

  const refreshData = () => {
    loadDropdowns();
    if (isEditMode && id) {
      loadRateData();
    }
    toast.success("Data refreshed!");
  };

  const clearEmpGradeSelection = () => {
    setSelectedEmpGrade(null);
    setFormData((prev) => ({ ...prev, EGM_Id: "" }));
    setSearchEmpGradeTerm("");
    setEmpGradeHighlightIndex(filteredEmpGrades.length > 0 ? 0 : -1);
  };

  const clearCityGradeSelection = () => {
    setSelectedCityGrade(null);
    setFormData((prev) => ({ ...prev, CGR_Id: "" }));
    setSearchCityGradeTerm("");
    setCityGradeHighlightIndex(filteredCityGrades.length > 0 ? 0 : -1);
  };

  const hasChanges = () => {
    if (!isEditMode) return true;

    const empGradeChanged =
      originalEmpGrade?.EGM_Id.toString() != formData.EGM_Id;
    const cityGradeChanged =
      originalCityGrade?.CGR_Id.toString() != formData.CGR_Id;
    const taChanged = originalFormData?.TA != formData.TA;
    const maChanged = originalFormData?.MA != formData.MA;
    const dateChanged = originalFormData?.TMR_Date != formData.TMR_Date;

    return (
      empGradeChanged ||
      cityGradeChanged ||
      taChanged ||
      maChanged ||
      dateChanged
    );
  };

  const originalFormData = {
    TA: formData.TA,
    MA: formData.MA,
    TMR_Date: formData.TMR_Date,
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rate data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/ta-ma-rate-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit TA-MA Rate" : "Add New TA-MA Rate"}
            </h1>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rate Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Rate Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            {/* Effective Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.TMR_Date}
                  onChange={(e) => {
                    setFormData({ ...formData, TMR_Date: e.target.value });
                  }}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Grade Selection */}
            <div ref={empGradeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Grade
              </label>
              <div className="relative">
                <button
                  ref={empGradeButtonRef}
                  type="button"
                  onClick={() => {
                    setEmpGradeSearchOpen(!empGradeSearchOpen);
                    if (!empGradeSearchOpen) {
                      setEmpGradeHighlightIndex(
                        filteredEmpGrades.length > 0 ? 0 : -1,
                      );
                      setTimeout(() => {
                        empGradeSearchInputRef.current?.focus();
                      }, 100);
                    }
                  }}
                  onKeyDown={handleEmpGradeKeyDown}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedEmpGrade ? (
                    <div className="flex items-center w-full">
                      <Award className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">
                          {selectedEmpGrade.EGM_Name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>Code: {selectedEmpGrade.EGM_Code}</span>
                        </div>
                        {selectedEmpGrade.pay_band && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <span>
                              Pay Band: {selectedEmpGrade.pay_band.PB_Code}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-500">
                        Select employee grade...
                      </span>
                    </div>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${empGradeSearchOpen ? "rotate-180" : ""} flex-shrink-0`}
                  />
                </button>

                {selectedEmpGrade && (
                  <button
                    type="button"
                    onClick={clearEmpGradeSelection}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    title="Clear selection"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}

                {empGradeSearchOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={empGradeSearchInputRef}
                          type="text"
                          placeholder="Search by grade name or code..."
                          value={searchEmpGradeTerm}
                          onChange={(e) =>
                            setSearchEmpGradeTerm(e.target.value)
                          }
                          onKeyDown={handleEmpGradeKeyDown}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-64">
                      {filteredEmpGrades.length == 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No employee grades found</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredEmpGrades.map((grade, index) => (
                            <button
                              key={grade.EGM_Id}
                              type="button"
                              onClick={() => handleEmpGradeSelect(grade)}
                              onMouseEnter={() =>
                                setEmpGradeHighlightIndex(index)
                              }
                              className={`emp-grade-item-${index} w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                index == empGradeHighlightIndex
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Award className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">
                                    {grade.EGM_Name}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                    <span>Code: {grade.EGM_Code}</span>
                                  </div>
                                  {grade.pay_band && (
                                    <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                      <span>
                                        Pay Band: {grade.pay_band.PB_Code}
                                      </span>
                                      <span className="mx-1">•</span>
                                      <span>
                                        ₹{grade.pay_band.Min_Pay} - ₹
                                        {grade.pay_band.Max_Pay}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedEmpGrade &&
                isEditMode &&
                originalEmpGrade?.EGM_Id.toString() != formData.EGM_Id && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <div className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>
                        Changed from:{" "}
                        <strong>{originalEmpGrade?.EGM_Name}</strong>
                      </span>
                    </div>
                  </div>
                )}
              <p className="mt-2 text-xs text-gray-500">
                {isEditMode
                  ? "Click dropdown to change employee grade"
                  : "Select an employee grade"}
              </p>
            </div>

            {/* City Grade Selection */}
            <div ref={cityGradeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Grade
              </label>
              <div className="relative">
                <button
                  ref={cityGradeButtonRef}
                  type="button"
                  onClick={() => {
                    setCityGradeSearchOpen(!cityGradeSearchOpen);
                    if (!cityGradeSearchOpen) {
                      setCityGradeHighlightIndex(
                        filteredCityGrades.length > 0 ? 0 : -1,
                      );
                      setTimeout(() => {
                        cityGradeSearchInputRef.current?.focus();
                      }, 100);
                    }
                  }}
                  onKeyDown={handleCityGradeKeyDown}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedCityGrade ? (
                    <div className="flex items-center w-full">
                      <Building className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">
                          {selectedCityGrade.City_Name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>Grade: {selectedCityGrade.Grade}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-500">
                        Select city grade...
                      </span>
                    </div>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${cityGradeSearchOpen ? "rotate-180" : ""} flex-shrink-0`}
                  />
                </button>

                {selectedCityGrade && (
                  <button
                    type="button"
                    onClick={clearCityGradeSelection}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    title="Clear selection"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}

                {cityGradeSearchOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={cityGradeSearchInputRef}
                          type="text"
                          placeholder="Search by city name or grade..."
                          value={searchCityGradeTerm}
                          onChange={(e) =>
                            setSearchCityGradeTerm(e.target.value)
                          }
                          onKeyDown={handleCityGradeKeyDown}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-64">
                      {filteredCityGrades.length == 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No city grades found</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredCityGrades.map((city, index) => (
                            <button
                              key={city.CGR_Id}
                              type="button"
                              onClick={() => handleCityGradeSelect(city)}
                              onMouseEnter={() =>
                                setCityGradeHighlightIndex(index)
                              }
                              className={`city-grade-item-${index} w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                index == cityGradeHighlightIndex
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <Building className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">
                                    {city.City_Name}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                    <span>Grade: {city.Grade}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedCityGrade &&
                isEditMode &&
                originalCityGrade?.CGR_Id.toString() != formData.CGR_Id && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <div className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>
                        Changed from:{" "}
                        <strong>{originalCityGrade?.City_Name}</strong>
                      </span>
                    </div>
                  </div>
                )}
              <p className="mt-2 text-xs text-gray-500">
                {isEditMode
                  ? "Click dropdown to change city grade"
                  : "Select a city grade"}
              </p>
            </div>

            {/* TA Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TA Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.TA}
                  onChange={(e) => {
                    setFormData({ ...formData, TA: e.target.value });
                  }}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter TA amount"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Travel Allowance amount in INR
              </p>
            </div>

            {/* MA Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MA Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingDown className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.MA}
                  onChange={(e) => {
                    setFormData({ ...formData, MA: e.target.value });
                  }}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter MA amount"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Medical Allowance amount in INR
              </p>
            </div>
          </div>

          {/* Total Summary */}
          {(formData.TA || formData.MA) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-700">
                    Total Amount:
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{" "}
                    {(
                      (parseFloat(formData.TA) || 0) +
                      (parseFloat(formData.MA) || 0)
                    ).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">TA + MA combined</p>
                </div>
              </div>
            </div>
          )}
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
              className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Rate" : "Create Rate"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditTamarate;

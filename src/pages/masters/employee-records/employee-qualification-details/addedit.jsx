import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  GraduationCap,
  Check,
  AlertCircle,
  Copy,
  ChevronDown,
  User,
  Calendar,
  Award,
  Building2,
  Hash,
  Loader,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import EmployeeEducationProfileApi from "../../../services/employeeeducationprofileapi";

const AddEditEmployeeEducationProfile = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown data
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [qualifications, setQualifications] = useState([]);
  const [loadingQualifications, setLoadingQualifications] = useState(false);

  const [formData, setFormData] = useState({
    Emp_Id: "",
    EEP_Date: "",
    EED_Id: "",
    Obtain_Grade: "",
    Obtain_Marks: "",
    Total_Marks: "",
    Pass_Year: "",
    Name_Insti: "",
    Is_Active: true,
  });

  // Fetch dropdown data
  useEffect(() => {
    fetchEmployees();
    fetchQualifications();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      console.log("Employee API Response:", response.data);

      if (response.data && response.data.status == true) {
        setEmployees(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else if (response.data && response.data.data) {
        setEmployees(response.data.data);
      } else {
        console.warn("Unexpected employee data format:", response.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employee data");
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchQualifications = async () => {
    setLoadingQualifications(true);
    try {
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
      const response = await axios.get(`${API_BASE_URL}/emp-edu/all`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      console.log("Qualification API Response:", response.data);

      if (response.data) {
        if (Array.isArray(response.data)) {
          setQualifications(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setQualifications(response.data.data);
        } else if (response.data.success == true && response.data.data) {
          setQualifications(response.data.data);
        } else {
          console.warn("Unexpected qualification data format:", response.data);
          setQualifications([]);
        }
      } else {
        setQualifications([]);
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      toast.error("Failed to load qualification data");
      setQualifications([]);
    } finally {
      setLoadingQualifications(false);
    }
  };

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadProfileData();
    }
  }, [id]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const response = await EmployeeEducationProfileApi.getById(id);

      if (response.success) {
        const data = response.data;
        setFormData({
          Emp_Id: data.Emp_Id?.toString() || "",
          EEP_Date: data.EEP_Date ? data.EEP_Date.split("T")[0] : "",
          EED_Id: data.EED_Id?.toString() || "",
          Obtain_Grade: data.Obtain_Grade?.toString() || "",
          Obtain_Marks: data.Obtain_Marks?.toString() || "",
          Total_Marks: data.Total_Marks?.toString() || "",
          Pass_Year: data.Pass_Year || "",
          Name_Insti: data.Name_Insti || "",
          Is_Active: data.Is_Active == true || data.Is_Active == 1,
        });
      } else {
        toast.error("Failed to load education profile!");
        navigate("/masters/employee-records/employee-qualification-details");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load education profile!");
      navigate("/masters/employee-records/employee-qualification-details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Numeric field validation
    if (
      [
        "Obtain_Grade",
        "Obtain_Marks",
        "Total_Marks",
        "Emp_Id",
        "EED_Id",
      ].includes(name)
    ) {
      processedValue = value.replace(/[^0-9]/g, "");
    }

    // Year validation (4 digits)
    if (name == "Pass_Year") {
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 4);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee validation
    if (!formData.Emp_Id) {
      newErrors.Emp_Id = "Employee is required";
    }

    // Qualification validation
    if (!formData.EED_Id) {
      newErrors.EED_Id = "Qualification is required";
    }

    // Institution name validation
    if (formData.Name_Insti && formData.Name_Insti.length > 100) {
      newErrors.Name_Insti = "Institution name must not exceed 100 characters";
    }

    // Marks validations
    if (formData.Obtain_Marks && formData.Total_Marks) {
      const obtain = parseInt(formData.Obtain_Marks);
      const total = parseInt(formData.Total_Marks);

      if (obtain > total) {
        newErrors.Obtain_Marks = "Obtained marks cannot exceed total marks";
      }
    }

    // Year validation
    if (formData.Pass_Year && formData.Pass_Year.length != 4) {
      newErrors.Pass_Year = "Please enter a valid 4-digit year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Education Profile?"
        : "Create Education Profile?",
      text: isEditMode
        ? "Are you sure you want to update this education profile?"
        : "Are you sure you want to create this education profile?",
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
        Emp_Id: formData.Emp_Id ? parseInt(formData.Emp_Id) : null,
        EEP_Date: formData.EEP_Date || null,
        EED_Id: formData.EED_Id ? parseInt(formData.EED_Id) : null,
        Obtain_Grade: formData.Obtain_Grade
          ? parseInt(formData.Obtain_Grade)
          : null,
        Obtain_Marks: formData.Obtain_Marks
          ? parseInt(formData.Obtain_Marks)
          : null,
        Total_Marks: formData.Total_Marks
          ? parseInt(formData.Total_Marks)
          : null,
        Pass_Year: formData.Pass_Year || null,
        Name_Insti: formData.Name_Insti || null,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await EmployeeEducationProfileApi.update(id, payload);
        toast.success("Education profile updated successfully!");
      } else {
        await EmployeeEducationProfileApi.create(payload);
        toast.success("Education profile created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/employee-records/employee-qualification-details");
      }, 1500);
    } catch (error) {
      console.error("Error saving profile:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        Object.keys(apiErrors).forEach((key) => {
          setErrors((prev) => ({ ...prev, [key]: apiErrors[key][0] }));
        });
        toast.error("Please fix the validation errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update education profile. Please try again."
            : "Failed to create education profile. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/employee-records/employee-qualification-details");
  };

  // Helper function to get employee ID from different possible field names
  const getEmployeeId = (emp) => {
    return emp.Emp_Id || emp.Emp_id || emp.id;
  };

  // Helper function to get employee display name
  const getEmployeeDisplay = (emp) => {
    const empId = getEmployeeId(emp);

    if (emp.Emp_Code && (emp.First_Name || emp.Emp_Name)) {
      const name = emp.First_Name || emp.Emp_Name || "";
      const lastName = emp.Last_Name ? ` ${emp.Last_Name}` : "";
      return `${emp.Emp_Code} - ${name}${lastName}`;
    }
    if (emp.Emp_Code) return emp.Emp_Code;
    if (emp.First_Name)
      return `${emp.First_Name} ${emp.Last_Name || ""}`.trim();
    if (emp.name) return emp.name;
    return `Employee ${empId || ""}`;
  };

  // Helper function to get qualification display
  const getQualificationDisplay = (qual) => {
    const code = qual.EED_Code || qual.code || qual.EEd_Code;
    const name =
      qual.EED_Name || qual.name || qual.EEd_Name || qual.qualification_name;
    const id = qual.EEd_Id || qual.id;

    if (code && name) {
      return `${code} - ${name}`;
    }
    if (name) return name;
    if (code) return code;
    return `Qualification ${id || ""}`;
  };

  // Helper function to get qualification ID
  const getQualificationId = (qual) => {
    return qual.EEd_Id || qual.id;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading education profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/employee-records/employee-qualification-details",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Education Profile"
                : "Add New Education Profile"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update employee education profile"
                : "Create a new employee education profile"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Education Profile Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="Emp_Id"
                  value={formData.Emp_Id}
                  onChange={handleInputChange}
                  disabled={loadingEmployees}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Emp_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">
                    {loadingEmployees
                      ? "Loading employees..."
                      : "Select Employee"}
                  </option>
                  {employees.map((emp) => {
                    const empId = getEmployeeId(emp);
                    return empId ? (
                      <option key={empId} value={empId}>
                        {getEmployeeDisplay(emp)}
                      </option>
                    ) : null;
                  })}
                </select>
                {loadingEmployees ? (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                )}
              </div>
              {errors.Emp_Id && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Emp_Id}
                </p>
              )}
              {!loadingEmployees && employees.length == 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No employees found. Please contact administrator.
                </p>
              )}
            </div>

            {/* Education Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="EEP_Date"
                  value={formData.EEP_Date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.EEP_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Qualification Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="EED_Id"
                  value={formData.EED_Id}
                  onChange={handleInputChange}
                  disabled={loadingQualifications}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.EED_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">
                    {loadingQualifications
                      ? "Loading qualifications..."
                      : "Select Qualification"}
                  </option>
                  {qualifications.map((qual) => {
                    const qualId = getQualificationId(qual);
                    return qualId ? (
                      <option key={qualId} value={qualId}>
                        {getQualificationDisplay(qual)}
                      </option>
                    ) : null;
                  })}
                </select>
                {loadingQualifications ? (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                )}
              </div>
              {errors.EED_Id && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EED_Id}
                </p>
              )}
              {!loadingQualifications && qualifications.length == 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No qualifications found. Please contact administrator.
                </p>
              )}
            </div>

            {/* Marks and Grade Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Obtain Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obtain Grade
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Obtain_Grade"
                    value={formData.Obtain_Grade}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Obtain_Grade ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 85"
                  />
                </div>
              </div>

              {/* Obtain Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obtain Marks
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Obtain_Marks"
                    value={formData.Obtain_Marks}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Obtain_Marks ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 850"
                  />
                </div>
                {errors.Obtain_Marks && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.Obtain_Marks}
                  </p>
                )}
              </div>

              {/* Total Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Total_Marks"
                    value={formData.Total_Marks}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Total_Marks ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>
            </div>

            {/* Pass Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pass Year
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Pass_Year"
                  value={formData.Pass_Year}
                  onChange={handleInputChange}
                  maxLength={4}
                  placeholder="e.g., 2024"
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Pass_Year ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {errors.Pass_Year && (
                <p className="mt-1 text-xs text-red-600">{errors.Pass_Year}</p>
              )}
            </div>

            {/* Institution Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Institution Name
                </label>
                <span
                  className={`text-xs ${
                    formData.Name_Insti?.length > 80
                      ? formData.Name_Insti?.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Name_Insti?.length || 0}/100
                </span>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Name_Insti"
                  value={formData.Name_Insti}
                  onChange={handleInputChange}
                  maxLength={100}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Name_Insti ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Mumbai University"
                />
              </div>
              {errors.Name_Insti && (
                <p className="mt-1 text-xs text-red-600">{errors.Name_Insti}</p>
              )}
            </div>

            {/* Is_Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == true}
                    onChange={() =>
                      setFormData({ ...formData, Is_Active: true })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == false}
                    onChange={() =>
                      setFormData({ ...formData, Is_Active: false })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Profile" : "Save Profile"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEmployeeEducationProfile;

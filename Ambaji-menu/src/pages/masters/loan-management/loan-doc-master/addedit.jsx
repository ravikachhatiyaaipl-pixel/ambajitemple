import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  AlertCircle,
  DollarSign,
  Shield,
  Upload,
  Trash2,
  Eye,
  File,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LoanDocumentApi } from "../../../services/loandocumentapi";

const AddEditLoanDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [loanTypes, setLoanTypes] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);

  const [formData, setFormData] = useState({
    LD_Name: "",
    LD_Code: "",
    LT_Id: "",
    Loan_Doc: [],
    Is_Mandatory: false,
    Is_Original: false,
    Is_Active: true,
  });

  useEffect(() => {
    loadLoanTypes();
    if (id && id != "create") {
      setIsEditMode(true);
      loadLoanDocumentData();
    }
  }, [id]);

  const loadLoanTypes = async () => {
    try {
      const result = await LoanDocumentApi.getLoanTypes();
      if (result.success) {
        setLoanTypes(result.data);
      }
    } catch (error) {
      console.error("Error loading loan types:", error);
      toast.error(error.message || "Failed to load loan types!");
    }
  };

  const loadLoanDocumentData = async () => {
    setLoading(true);
    try {
      const result = await LoanDocumentApi.getById(id);
      if (result.success) {
        const data = result.data;

        setFormData({
          LD_Name: data.LD_Name || "",
          LD_Code: data.LD_Code || "",
          LT_Id: data.LT_Id || "",
          Loan_Doc: [],
          Is_Mandatory: data.Is_Mandatory == true || data.Is_Mandatory == 1,
          Is_Original: data.Is_Original == true || data.Is_Original == 1,
          Is_Active: data.Is_Active == true || data.Is_Active == 1,
        });

        if (data.Loan_Doc && Array.isArray(data.Loan_Doc)) {
          setExistingFiles(data.Loan_Doc);
        }
      } else {
        toast.error(result.message);
        navigate("/masters/loan-management/loan-doc-master");
      }
    } catch (error) {
      console.error("Error loading loan document:", error);
      toast.error(error.message || "Failed to load loan document data!");
      navigate("/masters/loan-management/loan-doc-master");
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      Loan_Doc: [...prev.Loan_Doc, ...files],
    }));
  };

  const removeNewFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      Loan_Doc: prev.Loan_Doc.filter((_, i) => i != index),
    }));
  };

  const removeExistingFile = (fileId) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setExistingFiles((prev) =>
      prev.filter((file) => file.doc_lib_id != fileId),
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.LD_Name?.trim()) {
      newErrors.LD_Name = "Document name is required";
    } else if (formData.LD_Name?.length > 50) {
      newErrors.LD_Name = "Name cannot exceed 50 characters";
    }

    if (formData.LD_Code?.length > 20) {
      newErrors.LD_Code = "Code cannot exceed 20 characters";
    }

    if (!formData.LT_Id) {
      newErrors.LT_Id = "Please select a loan type";
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
      title: isEditMode ? "Update Loan Document?" : "Create New Loan Document?",
      text: isEditMode
        ? "Are you sure you want to update this loan document?"
        : "Are you sure you want to create this loan document?",
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
      const payload = new FormData();
      payload.append("LD_Name", formData.LD_Name);
      if (formData.LD_Code) payload.append("LD_Code", formData.LD_Code);
      payload.append("LT_Id", formData.LT_Id);
      payload.append("Is_Mandatory", formData.Is_Mandatory ? 1 : 0);
      payload.append("Is_Original", formData.Is_Original ? 1 : 0);
      payload.append("Is_Active", formData.Is_Active ? 1 : 0);

      // Append new files
      formData.Loan_Doc.forEach((file) => {
        payload.append("Loan_Doc[]", file);
      });

      // Append files to delete
      filesToDelete.forEach((fileId) => {
        payload.append("delete_files[]", fileId);
      });

      let response;
      if (isEditMode) {
        response = await LoanDocumentApi.update(id, payload);
      } else {
        response = await LoanDocumentApi.create(payload);
      }

      if (response.success) {
        toast.success(response.message);
        setTimeout(() => {
          navigate("/masters/loan-management/loan-doc-master");
        }, 1500);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error saving loan document:", error);

      if (error.errors) {
        const newErrors = {};
        Object.keys(error.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.message ||
            (isEditMode
              ? "Failed to update loan document."
              : "Failed to create loan document."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/loan-management/loan-doc-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading loan document data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/loan-management/loan-doc-master")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Loan Document" : "Add New Loan Document"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update loan document information"
                : "Create a new loan document master"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="LD_Name"
                value={formData.LD_Name}
                onChange={handleInputChange}
                placeholder="e.g., KYC Documents, Salary Slips"
                className={`w-full px-4 py-2.5 border ${
                  errors.LD_Name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                maxLength="50"
              />
              {errors.LD_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.LD_Name}
                </p>
              )}
            </div>

            {/* Document Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Code
              </label>
              <input
                type="text"
                name="LD_Code"
                value={formData.LD_Code}
                onChange={handleInputChange}
                placeholder="e.g., KYC, SLIP"
                className={`w-full px-4 py-2.5 border ${
                  errors.LD_Code ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                maxLength="20"
              />
              {errors.LD_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.LD_Code}
                </p>
              )}
            </div>

            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="LT_Id"
                  value={formData.LT_Id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.LT_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                >
                  <option value="">Select Loan Type</option>
                  {loanTypes.map((type) => (
                    <option key={type.LT_Id} value={type.LT_Id}>
                      {type.LT_Name} ({type.LT_Code})
                    </option>
                  ))}
                </select>
              </div>
              {errors.LT_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.LT_Id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Upload className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Document Upload
            </h2>
          </div>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-sm text-gray-600">
                  Click to upload documents
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Supported files: PDF, JPG, PNG, DOC (Max 10MB each)
                </span>
              </label>
            </div>

            {/* New Files */}
            {formData.Loan_Doc.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  New Documents ({formData.Loan_Doc.length})
                </h3>
                <div className="space-y-2">
                  {formData.Loan_Doc.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Files */}
            {existingFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Existing Documents ({existingFiles.length})
                </h3>
                <div className="space-y-2">
                  {existingFiles.map((file) => (
                    <div
                      key={file.doc_lib_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.type?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => removeExistingFile(file.doc_lib_id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-3">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Document Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Is Mandatory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Is Mandatory
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Mandatory"
                    checked={formData.Is_Mandatory == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Mandatory: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Mandatory"
                    checked={formData.Is_Mandatory == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Mandatory: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Is this document mandatory for loan application?
              </p>
            </div>

            {/* Is Original */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Require Original Document
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Original"
                    checked={formData.Is_Original == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Original: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Original"
                    checked={formData.Is_Original == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Original: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Does this document require original copy?
              </p>
            </div>

            {/* Is Active */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
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
                  {isEditMode ? "Update Loan Document" : "Create Loan Document"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLoanDocument;

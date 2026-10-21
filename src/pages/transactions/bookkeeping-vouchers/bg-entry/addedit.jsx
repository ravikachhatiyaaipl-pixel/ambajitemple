import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Hash,
  FileText,
  Building,
  Upload,
  File,
  Eye,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import BgEntryApi from "../../../services/bgentryapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/bg-entry";
const today = () => new Date().toISOString().slice(0, 10);

const AddEditBgEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("BG Entry");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingDoc, setExistingDoc] = useState(null);
  const [removeDocument, setRemoveDocument] = useState(false);

  const fileRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    BGE_Date: today(),
    Tender_No: "",
    Tender_Name: "",
    BG_No: "",
    Vendor_Name: "",
    Amount: "",
    Status: "In",
  });

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == BASE_PATH,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await BgEntryApi.getById(id);
      const d = res?.data;
      setFormData({
        BGE_Date: d.BGE_Date ? String(d.BGE_Date).slice(0, 10) : today(),
        Tender_No: d.Tender_No || "",
        Tender_Name: d.Tender_Name || "",
        BG_No: d.BG_No || "",
        Vendor_Name: d.Vendor_Name || "",
        Amount: d.Amount != null && d.Amount != "" ? String(d.Amount) : "",
        Status: d.Status || "In",
      });
      const docUrl = d.document_url || d.Document;
      if (docUrl) {
        const name = String(docUrl).split("/").pop();
        setExistingDoc({ url: docUrl, name });
      }
    } catch (error) {
      toast.error("Failed to load BG entry");
      navigate(BASE_PATH);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must not exceed 10MB");
      return;
    }
    setUploadedFile(file);
    setRemoveDocument(false);
    if (errors.Document) setErrors((prev) => ({ ...prev, Document: "" }));
    e.target.value = "";
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.BGE_Date) newErrors.BGE_Date = "Date is required";
    if (!formData.Tender_No.trim())
      newErrors.Tender_No = "Tender No is required";
    if (!formData.Tender_Name.trim())
      newErrors.Tender_Name = "Tender Name is required";
    if (!formData.BG_No.trim()) newErrors.BG_No = "BG No is required";
    if (!formData.Vendor_Name.trim())
      newErrors.Vendor_Name = "Vendor Name is required";
    if (formData.Amount != "" && Number(formData.Amount) < 0)
      newErrors.Amount = "Amount cannot be negative";
    if (!formData.Status) newErrors.Status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update BG Entry?" : "Create BG Entry?",
      text: isEditMode
        ? "Are you sure you want to update this bank guarantee entry?"
        : "Are you sure you want to create this bank guarantee entry?",
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
      payload.append("BGE_Date", formData.BGE_Date);
      payload.append("Tender_No", formData.Tender_No.trim());
      payload.append("Tender_Name", formData.Tender_Name.trim());
      payload.append("BG_No", formData.BG_No.trim());
      payload.append("Vendor_Name", formData.Vendor_Name.trim());
      payload.append("Amount", formData.Amount == "" ? "" : formData.Amount);
      payload.append("Status", formData.Status);
      if (uploadedFile) payload.append("Document", uploadedFile);
      if (isEditMode && removeDocument && !uploadedFile) {
        payload.append("remove_document", "1");
      }

      if (isEditMode) {
        await BgEntryApi.update(id, payload);
        toast.success("BG Entry updated successfully!");
      } else {
        await BgEntryApi.create(payload);
        toast.success("BG Entry created successfully!");
      }
      setTimeout(() => navigate(BASE_PATH), 800);
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });
        setErrors(newErrors);
        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey) toast.error(backendErrors[firstErrorKey][0]);
      } else {
        toast.error(error.response?.data?.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(BASE_PATH)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${pageTitle}` : `Add New ${pageTitle}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update bank guarantee details"
                : "Record a bank guarantee received or returned"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              BG Entry Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="BGE_Date"
                  value={formData.BGE_Date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.BGE_Date ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.BGE_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.BGE_Date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, Status: "In" }))
                  }
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    formData.Status == "In"
                      ? "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  In
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, Status: "Out" }))
                  }
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    formData.Status == "Out"
                      ? "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-200"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Out
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                In = BG received / held &nbsp;·&nbsp; Out = BG returned /
                released
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender No <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Tender_No"
                  value={formData.Tender_No}
                  onChange={handleInputChange}
                  maxLength="100"
                  placeholder="Enter tender number"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.Tender_No ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.Tender_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.Tender_No}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Tender_Name"
                value={formData.Tender_Name}
                onChange={handleInputChange}
                maxLength="255"
                placeholder="Enter tender name"
                className={`w-full px-4 py-2.5 text-sm border ${errors.Tender_Name ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.Tender_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.Tender_Name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BG No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="BG_No"
                value={formData.BG_No}
                onChange={handleInputChange}
                maxLength="100"
                placeholder="Enter bank guarantee number"
                className={`w-full px-4 py-2.5 text-sm border ${errors.BG_No ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono`}
              />
              {errors.BG_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.BG_No}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="Amount"
                  value={formData.Amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.Amount ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.Amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.Amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Vendor_Name"
                  value={formData.Vendor_Name}
                  onChange={handleInputChange}
                  maxLength="150"
                  placeholder="Enter vendor name"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.Vendor_Name ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.Vendor_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.Vendor_Name}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-2">
                  <Upload className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Document{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (optional, max 10MB)
                  </span>
                </h2>
              </div>

              <input
                ref={fileRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              />

              <div
                className="border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer flex items-center justify-center gap-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                    fileRef.current?.click();
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <Upload className="h-6 w-6 flex-shrink-0 text-gray-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload BG document
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
                  </p>
                </div>
              </div>

              {existingDoc && !removeDocument && !uploadedFile && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                  <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 truncate text-gray-700">
                    {existingDoc.name}
                  </span>
                  <a
                    href={existingDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveDocument(true);
                      setExistingDoc(null);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {uploadedFile && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                  <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="flex-1 truncate text-gray-700">
                    {uploadedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-600 mb-4 sm:mb-0">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex items-center gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={() => navigate(BASE_PATH)}
              className="px-6 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? `Update ${pageTitle}` : `Save ${pageTitle}`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditBgEntry;

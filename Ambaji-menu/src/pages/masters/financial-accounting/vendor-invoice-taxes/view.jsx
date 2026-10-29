import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Percent,
  Hash,
  Edit,
  Trash2,
  Calendar,
  Copy,
  Calculator,
  BookOpen,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { VendorInvoiceTaxesApi } from "../../../services/vendorinvoicetaxesapi";

const ViewVendorInvoiceTaxes = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taxType, setTaxType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaxTypeData();
  }, [id]);

  const loadTaxTypeData = async () => {
    setLoading(true);
    try {
      const data = await VendorInvoiceTaxesApi.getById(id);
      setTaxType(data);
    } catch (error) {
      toast.error("Failed to load tax type data!");
      navigate("/masters/financial-accounting/vendor-invoice-taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTaxType = async () => {
    const result = await Swal.fire({
      title: "Delete Tax Type?",
      text: `Are you sure you want to delete "${taxType?.IC_Name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await VendorInvoiceTaxesApi.delete(id);
        toast.success(`Tax type "${taxType?.IC_Name}" deleted successfully!`);
        navigate("/masters/financial-accounting/vendor-invoice-taxes");
      } catch (error) {
        toast.error(error.message || "Failed to delete tax type");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tax type details...</p>
      </div>
    );
  }

  if (!taxType) {
    return (
      <div className="p-12 text-center">
        <div className="text-red-600 mb-4">
          <Percent className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tax Type Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The tax type you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() =>
            navigate("/masters/financial-accounting/vendor-invoice-taxes")
          }
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tax Types
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/vendor-invoice-taxes")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Percent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {taxType.IC_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {taxType.IC_Code && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Hash className="h-3 w-3 mr-1" />
                      {taxType.IC_Code}
                    </span>
                  )}
                  {taxType.Percentage && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Percent className="h-3 w-3 mr-1" />
                      {parseFloat(taxType.Percentage).toFixed(2)}%
                    </span>
                  )}
  
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/financial-accounting/vendor-invoice-taxes/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tax Type Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-4 shadow-sm">
                  <Percent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tax Type Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the tax type
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tax Name */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Tax Name
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(taxType.IC_Name)}
                      className="text-xs text-green-600 hover:text-green-800 flex items-center"
                      title="Copy tax name"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {taxType.IC_Name}
                    </div>
                  </div>
                </div>

                {/* Tax Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Tax Code
                      </span>
                    </div>
                    {taxType.IC_Code && (
                      <button
                        onClick={() => handleCopyToClipboard(taxType.IC_Code)}
                        className="text-xs text-green-600 hover:text-green-800 flex items-center"
                        title="Copy tax code"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {taxType.IC_Code ? (
                      <div className="font-mono text-lg font-bold text-green-600">
                        {taxType.IC_Code}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No code assigned
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Percentage
                      </span>
                    </div>
                    {taxType.Percentage && (
                      <button
                        onClick={() =>
                          handleCopyToClipboard(taxType.Percentage.toString())
                        }
                        className="text-xs text-green-600 hover:text-green-800 flex items-center"
                        title="Copy percentage"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {taxType.Percentage ? (
                      <div className="text-2xl font-bold text-green-600">
                        {parseFloat(taxType.Percentage).toFixed(2)}%
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No percentage set
                      </div>
                    )}
                  </div>
                </div>

            
              </div>
            </div>
          </div>

          {/* Ledger Information Card */}
          {taxType.ledger && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-sm">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Associated Ledger
                    </h2>
                    <p className="text-sm text-gray-600">
                      Linked ledger account for this tax type
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          Ledger Code
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(taxType.ledger.Lg_Code)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        title="Copy ledger code"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="font-mono text-lg font-semibold text-blue-600">
                        {taxType.ledger.Lg_Code}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          Ledger Name
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(taxType.ledger.Lg_Name)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        title="Copy ledger name"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-lg font-semibold text-gray-900">
                        {taxType.ledger.Lg_Name}
                      </div>
                    </div>
                  </div>

            

            
                </div>
              </div>
            </div>
          )}


        </div>

 
      </div>
    </div>
  );
};

export default ViewVendorInvoiceTaxes;
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
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingDown,
  Hash,
  CheckCircle,
  XCircle,
  Edit,
  Copy,
  Scale,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DebtTypeMasterApi } from "../../../services/debttypemasterapi";

const ViewDebtType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debtType, setDebtType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebtTypeData();
  }, [id]);

  const loadDebtTypeData = async () => {
    setLoading(true);
    try {
      const response = await DebtTypeMasterApi.getById(id);
      setDebtType(response.data);
    } catch (error) {
      toast.error("Failed to load debt type data!");
      navigate("/masters/grant-management/debt-type-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDebtType = async () => {
    const result = await Swal.fire({
      title: "Delete Debt Type?",
      text: `Are you sure you want to delete "${debtType?.DT_Name}"? This action cannot be undone.`,
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
        await DebtTypeMasterApi.delete(id);
        toast.success(`Debt type "${debtType?.DT_Name}" deleted successfully!`);
        navigate("/masters/grant-management/debt-type-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete debt type");
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
    return new Date(dateString).toLocaleString("en-US", {
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
        <p className="mt-4 text-gray-600">Loading debt type details...</p>
      </div>
    );
  }

  if (!debtType) {
    return (
      <div className="p-12 text-center">
        <div className="text-red-600 mb-4">
          <TrendingDown className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Debt Type Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The debt type you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/masters/grant-management/debt-type-master")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Debt Types
        </button>
      </div>
    );
  }

  const getCategoryBadgeColor = (category) => {
    if (category == "Long Term") return "bg-blue-100 text-blue-800";
    if (category == "Short Term") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getLiabilityTypeBadgeColor = (type) => {
    if (type == "Payable") return "bg-purple-100 text-purple-800";
    if (type == "Deposit") return "bg-yellow-100 text-yellow-800";
    if (type == "Loan") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/grant-management/debt-type-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {debtType.DT_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Hash className="h-3 w-3 mr-1" />
                    {debtType.DT_Code || "No Code"}
                  </span>

                  {debtType.Is_Active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/grant-management/debt-type-master/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Debt Type Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-sm">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Debt Type Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the debt type
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
                        Debt Code
                      </span>
                    </div>
                    {debtType.DT_Code && (
                      <button
                        onClick={() => handleCopyToClipboard(debtType.DT_Code)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        title="Copy debt code"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {debtType.DT_Code ? (
                      <div className="font-mono text-lg font-bold text-blue-600">
                        {debtType.DT_Code}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No code assigned
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <TrendingDown className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Debt Name
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {debtType.DT_Name}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    {debtType.Is_Active ? (
                      <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {debtType.Is_Active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <XCircle className="h-4 w-4 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Scale className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Debt Category
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {debtType.DT_Cate ? (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadgeColor(debtType.DT_Cate)}`}
                      >
                        {debtType.DT_Cate}
                      </span>
                    ) : (
                      <div className="text-gray-500 italic">Not specified</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Liability Type
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {debtType.DT_Lia_type ? (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLiabilityTypeBadgeColor(debtType.DT_Lia_type)}`}
                      >
                        {debtType.DT_Lia_type}
                      </span>
                    ) : (
                      <div className="text-gray-500 italic">Not specified</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDebtType;

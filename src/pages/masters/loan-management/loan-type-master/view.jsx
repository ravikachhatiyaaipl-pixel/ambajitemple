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
  CreditCard,
  Key,
  Edit,
  Trash2,
  Copy,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import LoanTypeMasterApi from "../../../services/loantypemasterapi";

const ViewLoanType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loanType, setLoanType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadLoanTypeData();
  }, [id]);

  const loadLoanTypeData = async () => {
    setLoading(true);
    try {
      const response = await LoanTypeMasterApi.getById(id);

      if (response.success) {
        setLoanType(response.data);
      } else {
        toast.error(response.message || "Failed to load loan type data!");
        navigate("/masters/loan-management/loan-type-master");
      }
    } catch (error) {
      toast.error("Failed to load loan type data!");
      navigate("/masters/loan-management/loan-type-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoanType = async () => {
    if (!loanType) return;

    const result = await Swal.fire({
      title: "Delete Loan Type?",
      text: `Are you sure you want to delete "${loanType.LT_Name}"? This action cannot be undone.`,
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
        await LoanTypeMasterApi.delete(id);
        toast.success(`Loan Type "${loanType.LT_Name}" deleted successfully!`);
        navigate("/masters/loan-management/loan-type-master");
      } catch (error) {
        toast.error("Failed to delete loan type");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStatusBadge = (isActive) => {
    if (isActive == 1) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200">
          <CheckCircle className="h-3 w-3 mr-1.5" />
          Active
        </span>
      );
    } else if (isActive == 0) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200">
          <XCircle className="h-3 w-3 mr-1.5" />
          Inactive
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200">
          <AlertCircle className="h-3 w-3 mr-1.5" />
          Unknown
        </span>
      );
    }
  };

  const renderModeBadge = (mode) => {
    if (mode == "IN") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Inward
        </span>
      );
    } else if (mode == "OUT") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Outward
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading loan type details...</p>
      </div>
    );
  }

  if (!loanType) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Loan type not found</p>
        <Link
          to="/masters/loan-management/loan-type-master"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Loan Type List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/loan-management/loan-type-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {loanType.LT_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {loanType.LT_Code && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Key className="h-3 w-3 mr-1" />
                      {loanType.LT_Code}
                    </span>
                  )}
                  {renderModeBadge(loanType.Loan_Mode)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/loan-management/loan-type-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab == "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Loan Type Details
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Loan Type Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Loan Type Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Loan Type Name
                  </label>
                  <div className="mt-1">
                    <span className="text-gray-900 font-medium">
                      {loanType.LT_Name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Loan Mode
                  </label>
                  <div className="mt-1">
                    {renderModeBadge(loanType.Loan_Mode)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Maximum Amount
                  </label>
                  <div className="mt-1 flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(loanType.Max_Amount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    {renderStatusBadge(loanType.Is_Active)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Loan Type Code
                  </label>
                  <div className="mt-1 flex items-center">
                    <Key className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {loanType.LT_Code || "N/A"}
                    </span>
                    {loanType.LT_Code && (
                      <button
                        onClick={() => handleCopyToClipboard(loanType.LT_Code)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Interest Rate
                  </label>
                  <div className="mt-1 flex items-center">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {loanType.Interest_Rate
                        ? `${loanType.Interest_Rate}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tenure
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {loanType.Tenure_Years
                        ? `${loanType.Tenure_Years} Years`
                        : "N/A"}
                    </span>
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

export default ViewLoanType;

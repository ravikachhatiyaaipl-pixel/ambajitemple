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
  Target,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  FileText,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SchemeMasterApi } from "../../../services/schememasterapi";

const ViewScheme = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchemeData();
  }, [id]);

  const loadSchemeData = async () => {
    setLoading(true);
    try {
      const data = await SchemeMasterApi.getById(id);
      setScheme(data);
    } catch (error) {
      toast.error("Failed to load scheme data!");
      navigate("/masters/grant-management/scheme-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScheme = async () => {
    const result = await Swal.fire({
      title: "Delete Scheme?",
      text: `Are you sure you want to delete "${scheme?.Sch_Name}"? This action cannot be undone.`,
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
        await SchemeMasterApi.delete(id);
        toast.success(`Scheme "${scheme?.Sch_Name}" deleted successfully!`);
        navigate("/masters/grant-management/scheme-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete scheme");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading scheme details...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Scheme not found</p>
        <Link
          to="/masters/grant-management/scheme-master"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scheme List
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
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

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRemainingDays = () => {
    if (!scheme.Ed_Date) return null;
    const endDate = new Date(scheme.Ed_Date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const remainingDays = getRemainingDays();

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/grant-management/scheme-master")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {scheme.Sch_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {scheme.Sch_Code}
                  </span>

                  {scheme.Status && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {scheme.Status}
                    </span>
                  )}
                  {scheme.Is_Active ? (
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
            to={`/masters/grant-management/scheme-master/edit/${id}`}
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
          {/* Scheme Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Scheme Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Scheme Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-900 font-mono font-medium">
                        {scheme.Sch_Code}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Scheme Name
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 text-lg font-medium">
                        {scheme.Sch_Name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1 space-y-2">
                      <div className="mt-2">
                        {scheme.Is_Active ? (
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
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Grant Type
                    </label>
                    <div className="mt-1">
                      {scheme.grant_type ? (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-500 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {scheme.grant_type.GT_Name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Code: {scheme.grant_type.GT_Code}
                              </div>
                              {/* <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded ${scheme.grant_type.GT_Nature ==  "Revenue"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                  {scheme.grant_type.GT_Nature || "N/A"}
                                </span>
                                <span>
                                  Authority:{" "}
                                  {scheme.grant_type.grant_authority?.GA_Name ||
                                    "N/A"}
                                </span>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-gray-500">
                              No grant type assigned
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial & Timeline Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Financial & Timeline Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Budget Allocation
                    </label>
                    <div className="mt-1">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(parseFloat(scheme.Budget))}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Total allocated budget for the scheme
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Timeline
                    </label>
                    <div className="mt-1 space-y-3">
                      {scheme.St_Date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Start Date: {formatDate(scheme.St_Date)}
                            </div>
                          </div>
                        </div>
                      )}
                      {scheme.Ed_Date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-red-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              End Date: {formatDate(scheme.Ed_Date)}
                            </div>
                            {remainingDays != null && remainingDays >= 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {remainingDays > 0
                                  ? `${remainingDays} days remaining`
                                  : "Ends today"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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

export default ViewScheme;

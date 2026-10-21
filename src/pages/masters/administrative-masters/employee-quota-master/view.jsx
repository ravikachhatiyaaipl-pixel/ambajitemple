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
  Briefcase,
  Edit,
  Copy,
  Code,
  Tag,
  Percent,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Info,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmpQuotaApi from "../../../services/empquotaapi";

const ViewEmpQuota = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadQuotaData();
    } else {
      setError("Invalid quota ID");
      setLoading(false);
    }
  }, [id]);

  const loadQuotaData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await EmpQuotaApi.getById(id);

      if (response && response.status == true) {
        setQuota(response.data);
      } else if (response && response.data) {
        setQuota(response.data);
      } else if (response && response.Qut_Id) {
        setQuota(response);
      } else {
        console.error("Unexpected response structure:", response);
        setError(response?.message || "Failed to load employee quota data!");
        toast.error(response?.message || "Failed to load employee quota data!");

        setTimeout(() => {
          navigate("/masters/administrative-masters/employee-quota-master");
        }, 2000);
      }
    } catch (error) {
      console.error("Error loading quota:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load employee quota data!";
      setError(errorMessage);
      toast.error(errorMessage);

      setTimeout(() => {
        navigate("/masters/administrative-masters/employee-quota-master");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formatPercentage = (value) => {
    if (value == null || value == undefined || value == "") return "—";
    const num = parseFloat(value);
    return isNaN(num) ? "—" : num.toFixed(2) + "%";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee quota details...</p>
      </div>
    );
  }

  if (error || !quota) {
    return (
      <div className="p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-6">
            {error || "Employee quota not found"}
          </p>
          <Link
            to="/masters/administrative-masters/employee-quota-master"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Link>
        </div>
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
              navigate("/masters/administrative-masters/employee-quota-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {quota.Qut_Name || "Unnamed Quota"}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1.5">                  
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quota.Is_Active == 1 || quota.Is_Active == true
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {quota.Is_Active == 1 || quota.Is_Active == true
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/administrative-masters/employee-quota-master/edit/${id}`}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors shadow-sm hover:shadow-md"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Quota
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quota Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Quota Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column Details */}
                <div className="space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quota Code
                    </label>
                    <div className="mt-1.5 flex items-center">
                      <Code className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {quota.Qut_Code || "—"}
                      </span>
                      {quota.Qut_Code && (
                        <button
                          onClick={() =>
                            handleCopyToClipboard(quota.Qut_Code, "Code")
                          }
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Copy code"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </label>
                    <div className="mt-1.5 flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium text-lg">
                        {formatPercentage(quota.Percentage)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column Details */}
                <div className="space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quota Name
                    </label>
                    <div className="mt-1.5 flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-900 font-medium break-words">
                        {quota.Qut_Name}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(quota.Qut_Name, "Name")
                        }
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Copy name"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </label>
                    <div className="mt-1.5 flex items-center">
                      {quota.Is_Active == 1 || quota.Is_Active == true ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-700 font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-500 font-medium">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {quota.description && (
                    <div className="pb-3 border-b border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </label>
                      <div className="mt-1.5">
                        <p className="text-gray-700">{quota.description}</p>
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
  );
};

export default ViewEmpQuota;

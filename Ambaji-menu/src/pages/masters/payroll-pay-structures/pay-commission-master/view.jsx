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
  Calendar,
  Clock,
  Edit,
  Copy,
  FileText,
  ToggleLeft,
  ToggleRight,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import PayCommissionApi from "../../../services/paycommissionapi";

const ViewPayCommission = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    loadCommissionData();
  }, [id]);

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      const response = await PayCommissionApi.getById(id);

      if (response.success) {
        setCommission(response.data);
        
        try {
          const detailsResponse = await PayCommissionApi.getCommissionDetails(id);
          if (detailsResponse.success) {
            setDetails(detailsResponse.data);
          }
        } catch (error) {
          console.error("Error loading commission details:", error);
        }
      } else {
        toast.error(response.message || "Failed to load pay commission data!");
        navigate("/masters/payroll-pay-structures/pay-commission-master");
      }
    } catch (error) {
      toast.error("Failed to load pay commission data!");
      navigate("/masters/payroll-pay-structures/pay-commission-master");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay commission details...</p>
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Pay commission not found</p>
        <Link
          to="/masters/payroll-pay-structures/pay-commission-master"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-commission-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {commission.PC_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    commission.Is_Active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {commission.Is_Active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/payroll-pay-structures/pay-commission-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Commission Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Commission Name
                    </label>
                    <div className="mt-1 flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {commission.PC_Name}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(commission.PC_Name)
                        }
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Pay Structure Type
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900">
                        {commission.structure_type?.PST_Type || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1 flex items-center">
                      {commission.Is_Active ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-700 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-500">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Effective From
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(commission.Eff_From)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Effective To
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {commission.Eff_To ? formatDate(commission.Eff_To) : "—"}
                      </span>
                    </div>
                    {!commission.Eff_To && (
                      <p className="mt-1 text-xs text-green-600 ml-6">
                        Currently active (no end date)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {commission.PST_Desc && (
                <div className="mt-6 pt-6 border-t">
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Description
                  </label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {commission.PST_Desc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details Card (if available) */}
          {details && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Additional Details
                </h2>
              </div>
              <div className="p-6">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Quick Info Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Commission</span>
                </div>
                <span className="text-sm font-semibold text-blue-700">
                  {commission.PC_Name}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Created</span>
                </div>
                <span className="text-sm font-semibold text-purple-700">
                  {new Date(commission.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Updated</span>
                </div>
                <span className="text-sm font-semibold text-green-700">
                  {new Date(commission.updated_at).toLocaleDateString()}
                </span>
              </div>

              {commission.structure_type && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Type</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-700">
                    {commission.structure_type.PST_Type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayCommission;
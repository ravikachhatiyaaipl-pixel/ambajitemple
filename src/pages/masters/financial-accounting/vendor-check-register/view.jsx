/***
*
*  Application Name: I3EMS
*
*  Developed By: Aark InfoSoft Pvt Ltd.
*
*  Version: Ambaji Mata Temple Management
*  
*  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
*  
*/

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Landmark,
  User,
  Hash,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Printer,
  CreditCard,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";

const ViewVendorBkCheck = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await SubLedgerAccountApi.getById(id);

      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load data!");
        navigate("/masters/financial-accounting/vendor-check-register");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to load data!");
      navigate("/masters/financial-accounting/vendor-check-register");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor bank check details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Record Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The vendor bank check record you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/masters/financial-accounting/vendor-check-register")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate("/masters/financial-accounting/vendor-check-register")}
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {data.SL_Name || "Vendor Cancel Check Details"}
                </h1>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                View complete vendor bank account and check information
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/masters/financial-accounting/vendor-check-register/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Vendor & Bank Information Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Vendor & Bank Information
              </h2>
              {data.Is_cnl_cheq && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  CNL Cheque Applicable
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Vendor Name
                </label>
                <div className="mt-1">
                  <span className="text-gray-900 text-lg font-medium">
                    {data.SL_Name || "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Bank Name
                </label>
                <div className="mt-1 flex items-center">
                  <Landmark className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {data.Bank_Name || "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Branch Name
                </label>
                <div className="mt-1 flex items-center">
                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {data.Branch_Name || "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Holder Name
                </label>
                <div className="mt-1 flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {data.Account_Holder_Name || "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Number
                </label>
                <div className="mt-1 flex items-center">
                  <Hash className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 font-mono">
                    {data.Account_Number ? `****${data.Account_Number.slice(-4)}` : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  IFSC Code
                </label>
                <div className="mt-1 flex items-center">
                  <Hash className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 font-mono uppercase">
                    {data.IFSC_Code || "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Type
                </label>
                <div className="mt-1 flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {data.Account_Type || "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  CNL Cheque Status
                </label>
                <div className="mt-1">
                  {data.Is_cnl_cheq ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Yes - Applicable
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      No - Not Applicable
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Information Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Document Information
            </h2>
          </div>
          <div className="p-6">
            {data.Documents ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-10 w-10 text-green-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Supporting Document</p>
                    <p className="text-xs text-gray-500">Uploaded document for this vendor bank check</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Handle document download
                      if (data.Documents) {
                        window.open(data.Documents, "_blank");
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Document
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No document uploaded</p>
                <p className="text-sm text-gray-400 mt-1">
                  No supporting document has been uploaded for this record
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Information Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Audit Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created Date
                </label>
                <div className="mt-1">
                  <span className="text-gray-900">
                    {formatDate(data.created_at)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <div className="mt-1">
                  <span className="text-gray-900">
                    {formatDate(data.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVendorBkCheck;
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
  Hash,
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { toast } from "react-hot-toast";
import PayBandApi from "../../../services/paybandapi";

const ViewPayBand = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBandData();
  }, [id]);

  const loadBandData = async () => {
    setLoading(true);
    try {
      const response = await PayBandApi.getById(id);

      if (response.success) {
        setBand(response.data);
      } else {
        toast.error(response.message || "Failed to load pay band data!");
        navigate("/masters/payroll-pay-structures/pay-band-master");
      }
    } catch (error) {
      toast.error("Failed to load pay band data!");
      navigate("/masters/payroll-pay-structures/pay-band-master");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay band details...</p>
      </div>
    );
  }

  if (!band) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Pay band not found</p>
        <Link
          to="/masters/payroll-pay-structures/pay-band-master"
          className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Link>
      </div>
    );
  }

  const minPay = parseFloat(band.Min_Pay);
  const maxPay = parseFloat(band.Max_Pay);
  const payRange = maxPay - minPay;
  const rangePercentage = ((payRange / minPay) * 100).toFixed(2);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-band-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {band.PB_Code}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {band.commission && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {band.commission.PC_Name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/payroll-pay-structures/pay-band-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Pay Band Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Band Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {band.PB_Code}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(band.PB_Code)
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
                      Pay Commission
                    </label>
                    <div className="mt-1">
                      {band.commission ? (
                        <>
                          <span className="text-gray-900">
                            {band.commission.PC_Name}
                          </span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${band.commission.Is_Active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                              }`}>
                              {band.commission.Is_Active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Minimum Pay
                    </label>
                    <div className="mt-1 flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-semibold text-lg">
                        {formatCurrency(band.Min_Pay)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Maximum Pay
                    </label>
                    <div className="mt-1 flex items-center">
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-semibold text-lg">
                        {formatCurrency(band.Max_Pay)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Range Analysis */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Pay Range Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Pay Range</p>
                    <p className="text-lg font-bold text-purple-700">
                      {formatCurrency(payRange)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Range Percentage</p>
                    <p className="text-lg font-bold text-green-700">
                      {rangePercentage}%
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Spread Factor</p>
                    <p className="text-lg font-bold text-blue-700">
                      {(maxPay / minPay).toFixed(2)}x
                    </p>
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

export default ViewPayBand;
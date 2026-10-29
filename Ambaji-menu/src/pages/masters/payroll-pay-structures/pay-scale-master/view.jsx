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
  DollarSign,
  Hash,
  TrendingUp,
  Layers,
  Info,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import PayScaleApi from "../../../services/payscaleapi";

const ViewPayScale = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payScale, setPayScale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    loadPayScaleData();
  }, [id]);

  const loadPayScaleData = async () => {
    setLoading(true);
    try {
      const response = await PayScaleApi.getById(id);

      if (response.success) {
        setPayScale(response.data);

      } else {
        toast.error(response.message || "Failed to load pay scale data!");
        navigate("/masters/payroll-pay-structures/pay-scale-master");
      }
    } catch (error) {
      toast.error("Failed to load pay scale data!");
      navigate("/masters/payroll-pay-structures/pay-scale-master");
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-IN").format(number);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay scale details...</p>
      </div>
    );
  }

  if (!payScale) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Pay scale not found</p>
        <Link
          to="/masters/payroll-pay-structures/pay-scale-master"
          className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800"
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
              navigate("/masters/payroll-pay-structures/pay-scale-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {payScale.Scl_Code}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    ID: #{payScale.PS_Id}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {payScale.commission?.PC_Name || "No Commission"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/payroll-pay-structures/pay-scale-master/edit/${id}`}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
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
                Pay Scale Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Pay Scale ID
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 font-medium">
                        #{payScale.PS_Id}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Scale Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {payScale.Scl_Code}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(payScale.Scl_Code)
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
                    <div className="mt-1 flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {payScale.commission?.PC_Name || "Not specified"}
                      </span>
                    </div>
                    {payScale.commission && (
                      <p className="mt-1 text-xs text-gray-500 ml-6">
                        Effective: {formatDate(payScale.commission.Eff_From)}
                        {payScale.commission.Eff_To && ` - ${formatDate(payScale.commission.Eff_To)}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Starting Basic
                    </label>
                    <div className="mt-1 flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(payScale.St_Basic)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Increment Amount
                    </label>
                    <div className="mt-1 flex items-center">
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatCurrency(payScale.Inc_Amount)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Increment Steps
                    </label>
                    <div className="mt-1 flex items-center">
                      <Layers className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatNumber(payScale.Inc_Steps)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maximum Basic Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Maximum Basic
                      </label>
                      <div className="mt-1">
                        <span className="text-2xl font-bold text-purple-700">
                          {formatCurrency(payScale.Max_Basic)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Calculation</p>
                      <p className="text-sm text-gray-700">
                        {formatCurrency(payScale.St_Basic)} +
                        ({formatNumber(payScale.Inc_Steps)} × {formatCurrency(payScale.Inc_Amount)})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Quick Info Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Hash className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Scale Code</span>
                </div>
                <span className="text-sm font-semibold text-purple-700">
                  {payScale.Scl_Code}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Commission</span>
                </div>
                <span className="text-sm font-semibold text-blue-700">
                  {payScale.commission?.PC_Name || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Range</span>
                </div>
                <span className="text-sm font-semibold text-green-700">
                  {formatCurrency(payScale.St_Basic)} - {formatCurrency(payScale.Max_Basic)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Increment</span>
                </div>
                <span className="text-sm font-semibold text-amber-700">
                  {formatCurrency(payScale.Inc_Amount)} × {payScale.Inc_Steps}
                </span>
              </div>
            </div>
          </div>

          {/* Range Visualization */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pay Range
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Starting: {formatCurrency(payScale.St_Basic)}</span>
                  <span>Maximum: {formatCurrency(payScale.Max_Basic)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-green-500 to-purple-600 h-2.5 rounded-full"
                    style={{
                      width: `${(parseFloat(payScale.St_Basic) / parseFloat(payScale.Max_Basic)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Total Range: {formatCurrency(parseFloat(payScale.Max_Basic) - parseFloat(payScale.St_Basic))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayScale;
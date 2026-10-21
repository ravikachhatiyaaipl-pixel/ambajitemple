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
  Shield,
  Edit,
  Copy,
  DollarSign,
  Calendar,
  Users,
  Wallet,
  Info,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmpGroupInsuranceApi from "../../../services/empgroupinsuranceapi";

const ViewEmpGroupInsurance = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsuranceData();
  }, [id]);

  const loadInsuranceData = async () => {
    setLoading(true);
    try {
      const response = await EmpGroupInsuranceApi.getById(id);

      if (response.success) {
        setInsurance(response.data);
      } else {
        toast.error(response.message || "Failed to load insurance data!");
        navigate("/masters/employee-records/emp-group-insurance");
      }
    } catch (error) {
      toast.error("Failed to load insurance data!");
      navigate("/masters/employee-records/emp-group-insurance");
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading insurance details...</p>
      </div>
    );
  }

  if (!insurance) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Insurance record not found</p>
        <Link
          to="/masters/employee-records/emp-group-insurance"
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
              navigate("/masters/employee-records/emp-group-insurance")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {insurance.Group_Type}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {insurance.pay_commission?.PC_Name || "No Commission"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/employee-records/emp-group-insurance/edit/${id}`}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Insurance Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Group Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {insurance.Group_Type}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(insurance.Group_Type)
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
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {insurance.pay_commission?.PC_Name || "Not specified"}
                      </span>
                    </div>
                    {insurance.pay_commission && (
                      <p className="mt-1 text-xs text-gray-500 ml-6">
                        Effective: {formatDate(insurance.pay_commission.Eff_From)}
                        {insurance.pay_commission.Eff_To && ` - ${formatDate(insurance.pay_commission.Eff_To)}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Effective Date
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(insurance.Effective_Date)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Insurance Amount
                    </label>
                    <div className="mt-1 flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(insurance.Insurance_Amt)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Savings Amount
                    </label>
                    <div className="mt-1 flex items-center">
                      <Wallet className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatCurrency(insurance.Save_Amt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">

        </div>
      </div>
    </div>
  );
};

export default ViewEmpGroupInsurance;
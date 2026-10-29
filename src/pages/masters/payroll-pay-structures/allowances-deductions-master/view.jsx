/**
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
  Briefcase,
  Edit,
  Copy,
  Percent,
  Hash,
  Type,
  Info,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import PayAlwdedApi from "../../../services/payalwdedapi";

const ViewPayAlwded = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await PayAlwdedApi.getById(id);

      if (response.status) {
        setItem(response.data);
      } else {
        toast.error(response.message || "Failed to load data!");
        navigate(
          "/masters/payroll-pay-structures/allowances-deductions-master",
        );
      }
    } catch (error) {
      toast.error("Failed to load data!");
      navigate("/masters/payroll-pay-structures/allowances-deductions-master");
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

  const formatPercentage = (value) => {
    return parseFloat(value).toFixed(2) + "%";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Record not found</p>
        <Link
          to="/masters/payroll-pay-structures/allowances-deductions-master"
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
              navigate(
                "/masters/payroll-pay-structures/allowances-deductions-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <Percent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {item.PAD_Code}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.Alw_Ded == "A"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.Alw_Ded == "A" ? "Allowance" : "Deduction"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/payroll-pay-structures/allowances-deductions-master/edit/${id}`}
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
                Allowance/Deduction Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {item.PAD_Code}
                      </span>
                      <button
                        onClick={() => handleCopyToClipboard(item.PAD_Code)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Short Name
                    </label>
                    <div className="mt-1 flex items-center">
                      <Type className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {item.PAD_ShortName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900">{item.PAD_Name}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Calculation Type
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 font-medium">
                        {(item.Calc_Type || "P") === "F"
                          ? "Flat Amount"
                          : (item.Calc_Type || "P") === "S"
                            ? "Slab Wise"
                            : "Percentage (of Basic)"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Value
                    </label>
                    <div className="mt-1 flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {(item.Calc_Type || "P") === "F"
                          ? `₹${parseFloat(item.Flat_Amount || 0).toFixed(2)}`
                          : (item.Calc_Type || "P") === "S"
                            ? `${(item.slabs || []).length} slab(s)`
                            : formatPercentage(item.Percentage)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Type
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          item.Alw_Ded == "A"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.Alw_Ded == "A" ? "Allowance" : "Deduction"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Based On
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900">
                        {item.Based_On || "BASIC"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(item.Calc_Type || "P") === "S" &&
                Array.isArray(item.slabs) &&
                item.slabs.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Slabs
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-3 py-2">From</th>
                            <th className="px-3 py-2">To</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.slabs.map((s) => (
                            <tr key={s.PAS_Id} className="border-t">
                              <td className="px-3 py-2">{s.From_Amt}</td>
                              <td className="px-3 py-2">
                                {s.To_Amt ?? "∞"}
                              </td>
                              <td className="px-3 py-2">
                                {s.Slab_Type === "F" ? "Flat" : "%"}
                              </td>
                              <td className="px-3 py-2">
                                {s.Slab_Type === "F"
                                  ? `₹${s.Slab_Value}`
                                  : `${s.Slab_Value}%`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayAlwded;

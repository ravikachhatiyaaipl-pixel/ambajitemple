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
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import PayStructureTypeApi from "../../../services/paystructuretypeapi";

const ViewPayStructureType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTypeData();
  }, [id]);

  const loadTypeData = async () => {
    setLoading(true);
    try {
      const response = await PayStructureTypeApi.getById(id);

      if (response.success) {
        setType(response.data);
      } else {
        toast.error(response.message || "Failed to load pay structure type data!");
        navigate("/masters/payroll-pay-structures/pay-structure-type-master");
      }
    } catch (error) {
      toast.error("Failed to load pay structure type data!");
      navigate("/masters/payroll-pay-structures/pay-structure-type-master");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay structure type details...</p>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Pay structure type not found</p>
        <Link
          to="/masters/payroll-pay-structures/pay-structure-type-master"
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
              navigate("/masters/payroll-pay-structures/pay-structure-type-master")
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
                  {type.PST_Type}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/payroll-pay-structures/pay-structure-type-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Pay Structure Type Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Pay Structure Type
                    </label>
                    <div className="mt-1 flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {type.PST_Type}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(type.PST_Type)
                        }
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
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

export default ViewPayStructureType;
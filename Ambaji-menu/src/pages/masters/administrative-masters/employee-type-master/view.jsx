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
  ToggleLeft,
  ToggleRight,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmpTypeApi from "../../../services/emptypeapi";

const ViewEmpType = ({ user }) => {
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
      const response = await EmpTypeApi.getById(id);
      if (response.success) {
        setType(response.data);
      } else {
        toast.error(response.message || "Failed to load employee type data!");
        navigate("/masters/administrative-masters/employee-type-master");
      }
    } catch (error) {
      toast.error("Failed to load employee type data!");
      navigate("/masters/administrative-masters/employee-type-master");
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
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee type details...</p>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Employee type not found</p>
        <Link to="/masters/administrative-masters/employee-type-master" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate("/masters/administrative-masters/employee-type-master")} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{type.ETy_Name}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.Is_Active == 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {type.Is_Active == 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link to={`/masters/administrative-masters/employee-type-master/edit/${id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Type Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Sub-col */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type Code</label>
                    <div className="mt-1 flex items-center">
                      <Code className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">{type.ETy_Code || '—'}</span>
                      {type.ETy_Code && (
                        <button onClick={() => handleCopyToClipboard(type.ETy_Code)} className="ml-2 text-gray-400 hover:text-gray-600" title="Copy"><Copy className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1 flex items-center">
                      {type.Is_Active == 1 ? (
                        <><ToggleRight className="h-5 w-5 text-green-600 mr-2" /><span className="text-green-700 font-medium">Active</span></>
                      ) : (
                        <><ToggleLeft className="h-5 w-5 text-gray-400 mr-2" /><span className="text-gray-500">Inactive</span></>
                      )}
                    </div>
                  </div>
                </div>
                {/* Right Sub-col */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type Name</label>
                    <div className="mt-1 flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">{type.ETy_Name}</span>
                      <button onClick={() => handleCopyToClipboard(type.ETy_Name)} className="ml-2 text-gray-400 hover:text-gray-600" title="Copy"><Copy className="h-4 w-4" /></button>
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

export default ViewEmpType;
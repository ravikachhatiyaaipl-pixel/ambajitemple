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
  Users,
  Edit,
  Copy,
  Tag,
  Calendar,
  Info,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import CasteMasterApi from "../../../services/castemasterapi";

const ViewCaste = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caste, setCaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadCasteData();
    } else {
      setError("Invalid caste ID");
      setLoading(false);
    }
  }, [id]);

  const loadCasteData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CasteMasterApi.getById(id);

      if (response && response.status == true) {
        setCaste(response.data);
      } else if (response && response.data) {
        setCaste(response.data);
      } else if (response && response.Caste_Id) {
        setCaste(response);
      } else {
        console.error("Unexpected response structure:", response);
        setError(response?.message || "Failed to load caste data!");
        toast.error(response?.message || "Failed to load caste data!");

        setTimeout(() => {
          navigate("/masters/administrative-masters/caste-master");
        }, 2000);
      }
    } catch (error) {
      console.error("Error loading caste:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load caste data!";
      setError(errorMessage);
      toast.error(errorMessage);

      setTimeout(() => {
        navigate("/masters/administrative-masters/caste-master");
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading caste details...</p>
      </div>
    );
  }

  if (error || !caste) {
    return (
      <div className="p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-6">{error || "Caste not found"}</p>
          <Link
            to="/masters/administrative-masters/caste-master"
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
              navigate("/masters/administrative-masters/caste-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {caste.caste_name || "Unnamed Caste"}
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/administrative-masters/caste-master/edit/${id}`}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors shadow-sm hover:shadow-md"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Caste
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Caste Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Caste Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Right Column Details */}
                <div className="space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caste Name
                    </label>
                    <div className="mt-1.5 flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-900 font-medium break-words">
                        {caste.caste_name}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(caste.caste_name, "Name")
                        }
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Copy name"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {caste.deleted_at && (
                    <div className="pb-3 border-b border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deleted At
                      </label>
                      <div className="mt-1.5">
                        <p className="text-gray-700">
                          {formatDateTime(caste.deleted_at)}
                        </p>
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

export default ViewCaste;

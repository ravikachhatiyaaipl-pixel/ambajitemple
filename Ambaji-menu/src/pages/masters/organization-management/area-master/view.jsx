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
  MapPin,
  Key,
  Calendar,
  Edit,
  Trash2,
  Copy,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import AreaMasterApi from "../../../services/areamasterapi";

const ViewArea = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [refreshing, setRefreshing] = useState(false);
  const [pageTitle, setPageTitle] = useState("Area Master");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/organization-management/area-master";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    loadAreaData();
  }, [id]);

  const loadAreaData = async () => {
    setLoading(true);
    try {
      const response = await AreaMasterApi.getById(id);

      if (response.success && response.data) {
        setArea(response.data);
      } else {
        toast.error(response.message || "Failed to load area data!");
        navigate("/masters/organization-management/area-master");
      }
    } catch (error) {
      toast.error("Failed to load area data!");
      navigate("/masters/organization-management/area-master");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAreaData();
  };

  const handleDeleteArea = async () => {
    if (!area) return;

    const result = await Swal.fire({
      title: "Delete Area?",
      text: `Are you sure you want to delete "${area.Are_Name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await AreaMasterApi.delete(id);
        if (response.success) {
          toast.success(`Area "${area.Are_Name}" deleted successfully!`);
          navigate("/masters/organization-management/area-master");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.error("Failed to delete area");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading area details...</p>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Area not found</p>
        <Link
          to="/masters/organization-management/area-master"
          className="mt-4 inline-flex items-center text-green-600 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Area List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - Enhanced */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/organization-management/area-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {area.Are_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Key className="h-3 w-3 mr-1" />
                    {area.Are_Code}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          <Link
            to={`/masters/organization-management/area-master/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab == "details"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-2" />
            Area Details
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab == "details" && (
            <>
              {/* Ward Information Card - Updated to use correct field names */}
              {area.ward && (
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Ward Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Ward Name
                          </label>
                          <div className="mt-1 flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 font-medium">
                              {area.ward.Wrd_Name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewArea;

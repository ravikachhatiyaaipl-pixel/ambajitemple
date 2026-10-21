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
  Home,
  MapPin,
  Building,
  Key,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Copy,
  AlertCircle,
  Check,
  Clock,
  Users,
  FileText,
  Phone,
  Mail,
  Map,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import CccsApi from "../../../services/cccsapi";

const ViewCCC = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ccc, setCcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [statistics, setStatistics] = useState({
    totalTransactions: 0,
    monthlyAverage: 0,
    activeServices: 5,
  });

  useEffect(() => {
    loadCCCData();
  }, [id]);

  const loadCCCData = async () => {
    setLoading(true);
    try {
      const response = await CccsApi.getById(id);

      if (response.success && response.data) {
        setCcc(response.data);

        setStatistics({
          totalTransactions: 1245,
          monthlyAverage: 103.75,
          activeServices: 5,
        });
      } else {
        toast.error(response.message || "Failed to load CCC data!");
        navigate("/masters/organization-management/city-civic-centers-master");
      }
    } catch (error) {
      toast.error("Failed to load CCC data!");
      navigate("/masters/organization-management/city-civic-centers-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCCC = async () => {
    if (!ccc) return;

    const result = await Swal.fire({
      title: "Delete CCC?",
      text: `Are you sure you want to delete "${ccc.CCC_Name}"? This action cannot be undone.`,
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
        const response = await CccsApi.delete(id);
        if (response.success) {
          toast.success(`CCC "${ccc.CCC_Name}" deleted successfully!`);
          navigate(
            "/masters/organization-management/city-civic-centers-master",
          );
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.error("Failed to delete CCC");
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading CCC details...</p>
      </div>
    );
  }

  if (!ccc) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">CCC not found</p>
        <Link
          to="/masters/organization-management/city-civic-centers-master"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CCC List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details as requested */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/organization-management/city-civic-centers-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {ccc.CCC_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Key className="h-3 w-3 mr-1" />
                    {ccc.CCC_Code || "—"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ccc.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ccc.is_active ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/organization-management/city-civic-centers-master/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
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
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Home className="h-4 w-4 inline mr-2" />
            CCC Details
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab == "hierarchy"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Map className="h-4 w-4 inline mr-2" />
            Location Hierarchy
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab == "details" && (
            <>
              {/* CCC Information Card */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    CCC Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          CCC Name
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 font-medium">
                            {ccc.CCC_Name}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          CCC Code
                        </label>
                        <div className="mt-1 flex items-center">
                          <Key className="h-4 w-4 text-gray-400 mr-2" />
                          <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono text-gray-800">
                            {ccc.CCC_Code || "—"}
                          </code>
                          {ccc.CCC_Code && (
                            <button
                              onClick={() =>
                                handleCopyToClipboard(ccc.CCC_Code)
                              }
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title="Copy code"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4"></div>
                  </div>
                </div>
              </div>

              {/* Ward Information Card */}
              {ccc.ward && (
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Ward Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-4">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ccc.ward.Wrd_Name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab == "hierarchy" && ccc.ward && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Location Hierarchy
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Organization Level */}
                  {ccc.ward.zone?.organisation && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4">
                          <Building className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {ccc.ward.zone.organisation.Org_Name}
                          </h3>
                          <div className="mt-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="mr-4">
                                Code: {ccc.ward.zone.organisation.Org_Code}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {ccc.ward.zone.organisation.Org_City},{" "}
                                {ccc.ward.zone.organisation.Org_State}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Organization
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zone Level */}
                  {ccc.ward.zone && (
                    <div className="border rounded-lg p-4 ml-8">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-4">
                          <Map className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {ccc.ward.zone.Zon_Name}
                          </h3>
                          <div className="mt-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="mr-4">
                                Code: {ccc.ward.zone.Zon_Code}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">Zone</div>
                      </div>
                    </div>
                  )}

                  {/* Ward Level */}
                  <div className="border rounded-lg p-4 ml-16">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {ccc.ward.Wrd_Name}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500">Ward</div>
                    </div>
                  </div>

                  {/* CCC Level */}
                  <div className="border-2 border-blue-500 rounded-lg p-4 ml-24 bg-blue-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-4">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {ccc.CCC_Name}
                        </h3>
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        Current CCC
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab == "services" && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Services ({statistics.activeServices})
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Cards */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Tax Collection
                        </h3>
                        <p className="text-sm text-gray-500">
                          Property tax, water tax, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Certificate Issuance
                        </h3>
                        <p className="text-sm text-gray-500">
                          Birth, death, income certificates
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Grievance Redressal
                        </h3>
                        <p className="text-sm text-gray-500">
                          Citizen complaints & feedback
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center mr-3">
                        <Home className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          License Processing
                        </h3>
                        <p className="text-sm text-gray-500">
                          Trade, building, vehicle licenses
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                        <Phone className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Information Desk
                        </h3>
                        <p className="text-sm text-gray-500">
                          Public information & guidance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCCC;

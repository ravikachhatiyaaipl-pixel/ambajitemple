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
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Menu,
  Link as LinkIcon,
  Calendar,
  Hash,
  FileText,
  AlertCircle,
  Edit,
  Copy,
  Plus,
  Eye as EyeVisible,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import DepartmentMenuMappingsApi from "../../../services/departmentmenumappingsapi";

const ViewDepartmentMenuMappings = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState(null);
  const [pageTitle, setPageTitle] = useState("Mapping Details");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/menu-management/branch-menu-mapping/view";
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
    if (id) {
      loadMappingData();
    }
  }, [id]);

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const response = await DepartmentMenuMappingsApi.getById(id);
      if (response.success) {
        setMapping(response.data);
      } else {
        toast.error("Failed to load mapping data!");
        navigate("/settings/menu-management/branch-menu-mapping");
      }
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/settings/menu-management/branch-menu-mapping");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading mapping details...</p>
      </div>
    );
  }

  if (!mapping) {
    return (
      <div className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Mapping Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The requested mapping could not be found.
        </p>
        <button
          onClick={() =>
            navigate("/settings/menu-management/branch-menu-mapping")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const DetailCard = ({ title, icon: Icon, children, color = "blue" }) => {
    const colorClasses = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200",
      },
    }[color];

    return (
      <div
        className={`bg-white rounded-xl border ${colorClasses.border} p-6 hover:shadow-lg transition-all duration-200`}
      >
        <div className="flex items-center mb-4">
          <div className={`${colorClasses.bg} text-white p-2 rounded-lg mr-3`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    );
  };

  const InfoRow = ({ label, value, icon: Icon, copyable = false }) => (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center max-w-xs">
        <span className="text-sm text-gray-900 text-right break-words">
          {value || "N/A"}
        </span>
        {copyable && value && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success("Copied to clipboard!");
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );

  const getMenuStyle = (grsh) => {
    const level = parseInt(grsh);
    const styles = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-amber-100 text-amber-800",
      4: "bg-purple-100 text-purple-800",
    };
    return styles[level] || "bg-gray-100 text-gray-800";
  };

  const department = mapping.department || {};
  const menus = mapping.menus || [];
  const menuCount = mapping.Fnc_Id?.length || 0;

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/settings/menu-management/branch-menu-mapping")
            }
            className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 mr-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
              Back to List
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/settings/menu-management/branch-menu-mapping/edit/${id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Mapping
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>
        <p className="text-gray-600 ml-11">
          View detailed information about department and its mapped menus
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Card */}
        <DetailCard title="Department Details" icon={Building} color="green">
          <InfoRow
            label="Department Name"
            value={department.Dpt_Name}
            icon={Building}
          />
          <InfoRow
            label="Department Description"
            value={department.Dpt_Desc}
            icon={FileText}
          />
          <InfoRow
            label="Group Code"
            value={department.UpGrp}
            icon={Hash}
            copyable={true}
          />
          <InfoRow label="Group Serial" value={department.GrSrn} icon={Hash} />
          <InfoRow
            label="Group Status"
            value={department.GrStt}
            icon={FileText}
          />
          <InfoRow
            label="Visibility"
            value={department.isvisible == "1" ? "Visible" : "Hidden"}
            icon={department.isvisible == "1" ? EyeVisible : EyeOff}
          />
          <InfoRow
            label="Created At"
            value={formatDateTime(department.created_at)}
            icon={Calendar}
          />
        </DetailCard>

        {/* Menus Summary Card */}
        <DetailCard title="Menus Summary" icon={Menu} color="blue">
          <div className="space-y-4">
            {menuCount > 0 ? (
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Mapped Menus ({menuCount})
                    </span>
                    <span className="text-xs text-gray-500">
                      Showing all menus
                    </span>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {menus.map((menu, index) => {
                    const level = menu.GrCod?.match(/^0+/)?.[0].length / 2 || 0;

                    return (
                      <div
                        key={menu.Fnc_Id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div
                                className={`h-6 w-6 rounded ${getMenuStyle(level)} flex items-center justify-center mr-2`}
                              >
                                <span className="text-xs font-bold">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {menu.Fnc_Title ||
                                    menu.Fnc_Desc ||
                                    "Unnamed Menu"}
                                </h4>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                  <Hash className="h-3 w-3 mr-1" />
                                  <span className="font-mono">
                                    {menu.GrCod}
                                  </span>
                                  <span className="mx-1">•</span>
                                  <span>Level {level}</span>
                                </div>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                menu.isvisible
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {menu.isvisible ? "Visible" : "Hidden"}
                            </span>
                          </div>

                          {/* Additional Menu Info */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                            <div className="flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              <span>Serial: {menu.GrSrn}</span>
                            </div>
                            <div className="flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              <span>Group: {menu.UpGrp}</span>
                            </div>
                            {menu.Menu_Links && (
                              <div className="col-span-2 flex items-center">
                                <LinkIcon className="h-3 w-3 mr-1 text-blue-400" />
                                <a
                                  href={menu.Menu_Links}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 truncate text-xs"
                                >
                                  {menu.Menu_Links}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Count */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total menus mapped</span>
                    <span className="font-medium text-gray-900">
                      {menuCount} menu(s)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-gray-200 rounded-lg">
                <Menu className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No menus are mapped to this department
                </p>
                <Link
                  to={`/settings/menu-management/branch-menu-mapping/edit/${id}`}
                  className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add menus to this mapping
                </Link>
              </div>
            )}
          </div>
        </DetailCard>
      </div>
    </div>
  );
};

export default ViewDepartmentMenuMappings;

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
  User,
  Link as LinkIcon,
  Calendar,
  Hash,
  Mail,
  Phone,
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  Users,
  Briefcase,
  Award,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import UserDepartmentMapping from "../../../services/userdepartmentmapping";

const ViewUserDepartmentMapping = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState(null);
  const [pageTitle, setPageTitle] = useState("User-Department Mapping");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/user-management/user-department-mapping";
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
      const response = await UserDepartmentMapping.getById(id);
      if (response.status == true) {
        setMapping(response.data);
      } else {
        toast.error("Failed to load mapping data!");
        navigate("/settings/user-management/user-department-mapping");
      }
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/settings/user-management/user-department-mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Mapping?",
      html: `
        <div class="text-left">
          <p class="mb-2">Are you sure you want to delete this mapping?</p>
          <p class="text-sm text-gray-600 mb-1"><strong>User:</strong> ${mapping?.user?.full_name || "Unknown User"}</p>
          <p class="text-sm text-gray-600 mb-2"><strong>Department:</strong> ${mapping?.department?.Dpt_Desc || "Unknown Department"}</p>
          <p class="text-xs text-red-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await UserDepartmentMapping.delete(id);
        toast.success("Mapping deleted successfully!");
        navigate("/settings/user-management/user-department-mapping");
      } catch (error) {
        toast.error("Failed to delete mapping");
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
      second: "2-digit",
    });
  };

  const getAccountStatus = (user) => {
    if (user?.is_locked) return "Locked";
    if (user?.is_active) return "Active";
    return "Inactive";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Locked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMappingStatus = (status) => {
    if (status == "1" || status == 1) {
      return {
        label: "Active",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    }
    return {
      label: "Inactive",
      color: "bg-gray-100 text-gray-800",
      icon: XCircle,
    };
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
            navigate("/settings/user-management/user-department-mapping")
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
        light: "bg-blue-50",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200",
        light: "bg-green-50",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200",
        light: "bg-purple-50",
      },
      amber: {
        bg: "bg-amber-500",
        text: "text-amber-600",
        border: "border-amber-200",
        light: "bg-amber-50",
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
        {copyable && value && value != "N/A" && (
          <button
            onClick={() => handleCopy(value)}
            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="Copy to clipboard"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );

  const mappingStatus = getMappingStatus(mapping.Status);
  const StatusIcon = mappingStatus.icon;

  return (
    <div className="p-6">
      {/* Header with Actions and Dynamic Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/settings/user-management/user-department-mapping")
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
            to={`/settings/user-management/user-department-mapping/edit/${id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Mapping
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Details Card */}
        <DetailCard title="User Details" icon={User} color="blue">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-4">
              <span className="text-white text-xl font-bold">
                {mapping.user?.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {mapping.user?.full_name || "N/A"}
              </h4>
              <div className="flex items-center mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getAccountStatus(mapping.user))}`}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {getAccountStatus(mapping.user)}
                </span>
              </div>
            </div>
          </div>

          <InfoRow
            label="Username"
            value={mapping.user?.Usr_Name}
            icon={User}
            copyable={true}
          />
          <InfoRow
            label="Email Address"
            value={mapping.user?.Usr_Email}
            icon={Mail}
            copyable={true}
          />
          <InfoRow
            label="Mobile Number"
            value={mapping.user?.Usr_Mobile}
            icon={Phone}
            copyable={true}
          />
          {mapping.user?.role && (
            <InfoRow
              label="User Role"
              value={mapping.user.role.Role_Name}
              icon={Shield}
            />
          )}
          <InfoRow
            label="Last Login"
            value={
              mapping.user?.last_login
                ? formatDateTime(mapping.user.last_login)
                : "Never"
            }
            icon={Clock}
          />
          <InfoRow
            label="Account Created"
            value={formatDateTime(mapping.user?.created_at)}
            icon={Calendar}
          />
        </DetailCard>

        {/* Department Details Card */}
        <DetailCard title="Department Details" icon={Building} color="green">
          {(mapping.departments || (mapping.department ? [mapping.department] : [])).map((dept, idx) => (
            <div key={dept.Dpt_id || idx} className={idx > 0 ? "pt-4 border-t border-gray-100" : ""}>
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mr-3">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">{dept.Dpt_Desc || "N/A"}</h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {dept.isvisible == "1" ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
              <InfoRow label="Department Name" value={dept.Dpt_Name} icon={Briefcase} />
              <InfoRow label="Parent Group" value={dept.UpGrp} icon={Award} />
              <InfoRow label="Group Serial" value={dept.GrSrn} icon={FileText} />
              <InfoRow label="Group Status" value={dept.GrStt} icon={Shield} />
              <InfoRow label="Created At" value={formatDateTime(dept.created_at)} icon={Calendar} />
            </div>
          ))}
          {!(mapping.departments?.length) && !mapping.department && (
            <p className="text-sm text-gray-500">No department assigned</p>
          )}
        </DetailCard>
      </div>
    </div>
  );
};

export default ViewUserDepartmentMapping;

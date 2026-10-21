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
  BookOpen,
  Link as LinkIcon,
  Calendar,
  CheckCircle,
  Edit,
  Copy,
  AlertCircle,
  PieChart,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import GrantDepartmentMappingApi from "../../../services/grantdepartmentmappingapi";

const ViewGrantDepartmentMapping = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState(null);

  useEffect(() => {
    if (id) {
      loadMappingData();
    }
  }, [id]);

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const response = await GrantDepartmentMappingApi.getById(id);
      if (response.success) {
        setMapping(response.data);
      } else {
        toast.error("Failed to load mapping data!");
        navigate("/masters/grant-management/grant-department-mapping");
      }
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/masters/grant-management/grant-department-mapping");
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
          <p class="text-sm text-gray-600 mb-1"><strong>Department:</strong> ${mapping?.department?.Dpt_Desc || mapping?.department?.Dpt_Name || "department"}</p>
          <p class="text-sm text-gray-600 mb-2"><strong>Budget Heads:</strong> ${mapping?.Bh_Id?.length || 0} budget head(s)</p>
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
        const response = await GrantDepartmentMappingApi.delete(id);
        if (response.success) {
          toast.success("Mapping deleted successfully!");
          navigate("/masters/grant-management/grant-department-mapping");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.error("Failed to delete mapping");
      }
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

  const getBudgetHeadIndent = (grSt) => {
    const level = parseInt(grSt) || 1;
    const indentLevels = {
      1: "",
      2: "    ",
      3: "        ",
      4: "            ",
    };
    return indentLevels[level] || "";
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mapping details...</p>
        </div>
      </div>
    );
  }

  if (!mapping) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
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
              navigate("/masters/grant-management/grant-department-mapping")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </button>
        </div>
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
      amber: {
        bg: "bg-amber-500",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      indigo: {
        bg: "bg-indigo-500",
        text: "text-indigo-600",
        border: "border-indigo-200",
      },
    }[color];

    return (
      <div
        className={`bg-white rounded-xl border ${colorClasses.border} p-5 hover:shadow-lg transition-all duration-200 h-full`}
      >
        <div className="flex items-center mb-3">
          <div className={`${colorClasses.bg} text-white p-1.5 rounded-lg mr-2`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    );
  };

  const InfoRow = ({ label, value, icon: Icon, copyable = false }) => (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400 mr-1.5" />}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center max-w-xs">
        <span className="text-xs text-gray-900 text-right break-words">
          {value || "N/A"}
        </span>
        {copyable && value && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success("Copied to clipboard!");
            }}
            className="ml-1.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );

  const department = mapping.department;
  const budgetHeads = mapping.all_budget_heads || [];
  const budgetHeadCount = mapping.Bh_Id?.length || 0;

  return (
    <div className="h-full w-full p-4 flex flex-col">
      {/* Header with Actions */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-shrink-0">
        <button
          onClick={() =>
            navigate("/masters/grant-management/grant-department-mapping")
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <Link
          to={`/masters/grant-management/grant-department-mapping/edit/${id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
        {/* Page Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <LinkIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Department-Budget Head Mapping Details
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                View detailed information about department and its mapped budget heads
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 p-5 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Department Card */}
            <div className="h-full">
              <DetailCard title="Department Details" icon={Building} color="green">
                <InfoRow
                  label="Department Name"
                  value={
                    <div>
                      <div className="text-xs font-medium text-gray-900">
                        {department?.Dpt_Desc}
                      </div>
                      {department?.Dpt_Name && (
                        <div className="text-[10px] text-gray-400">
                          {department?.Dpt_Name}
                        </div>
                      )}
                    </div>
                  }
                  icon={Building}
                  copyable={true}
                />
               
              </DetailCard>
            </div>

            {/* Budget Heads Summary Card */}
            <div className="h-full">
              <DetailCard title="Budget Heads Summary" icon={PieChart} color="purple">
                <div className="space-y-3 h-full">
                  {/* Budget Head List Section */}
                  {budgetHeadCount > 0 ? (
                    <div className="border border-gray-200 rounded-lg flex flex-col h-[calc(100%-2rem)]">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">
                            Mapped Budget Heads ({budgetHeadCount})
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto min-h-0">
                        {budgetHeads.map((head, index) => {
                          const level = head.Gr_St ? parseInt(head.Gr_St) : 1;
                          const indent = getBudgetHeadIndent(head.Gr_St);

                          return (
                            <div
                              key={head.Bh_Id}
                              className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                            >
                              <div className="px-3 py-2">
                                <div className="flex items-start">
                                  <div className="h-5 w-5 rounded bg-purple-100 text-purple-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center">
                                      <span className="text-xs font-medium text-gray-900">
                                        <span className="whitespace-pre">{indent}</span>
                                        {head.Gr_Nm}
                                      </span>
                                     
                                    </div>
                                   
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Count */}
                      <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex-shrink-0">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Total</span>
                          <span className="font-medium text-gray-900">
                            {budgetHeadCount} budget head(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 border border-gray-200 rounded-lg">
                      <PieChart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-2">
                        No budget heads are mapped to this department
                      </p>
                      <Link
                        to={`/masters/grant-management/grant-department-mapping/edit/${id}`}
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-3 w-3 mr-0.5" />
                        Add budget heads
                      </Link>
                    </div>
                  )}
                </div>
              </DetailCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGrantDepartmentMapping;
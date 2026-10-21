// leave-application-entry/view.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  Tag,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LeaveApplicationApi } from "../../../../services/leaveapplicationapi";

const LeaveApplicationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pageTitle, setPageTitle] = useState("Leave Application Details");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/leave/leave-application-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadEntryDetails();
  }, [id]);

  const loadEntryDetails = async () => {
    setLoading(true);
    try {
      const response = await LeaveApplicationApi.getById(id);
      const entryData = response?.data || response;
      setEntry(entryData);
    } catch (error) {
      console.error("Error loading entry details:", error);
      toast.error("Failed to load entry details!");
      navigate(
        "/transactions/attendance-management/leave/leave-application-entry",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getHalfDayLabel = (value) => {
    switch (value) {
      case "FH":
        return "First Half";
      case "SH":
        return "Second Half";
      case "FD":
        return "Full Day";
      default:
        return "Full Day";
    }
  };

  const getStatusDisplay = () => {
    if (entry?.r_status) {
      return entry.r_status.St_Name || "Pending";
    }
    if (entry?.status_data) {
      return entry.status_data.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = () => {
    const statusName = getStatusDisplay();
    const statusLower = statusName.toLowerCase();

    let colorClass = "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("query")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("verif") || statusLower.includes("check")) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        <Clock className="h-4 w-4 mr-2" />
        {statusName}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading leave application details...
        </p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-12 text-center">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Application Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The leave application you're looking for doesn't exist or has been
          deleted.
        </p>
        <button
          onClick={() =>
            navigate(
              "/transactions/attendance-management/leave/leave-application-entry",
            )
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
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
                "/transactions/attendance-management/leave/leave-application-entry",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle} - View
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed information of leave application
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium flex items-center hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={() =>
              navigate(
                `/transactions/attendance-management/leave/leave-application-entry/edit/${entry.LA_id}`,
              )
            }
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center hover:from-blue-700 hover:to-indigo-800 transition-all"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Status Information
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Status</p>
                {getStatusBadge()}
              </div>
              {entry.LA_HDT && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Approved/Processed Date
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTime(entry.LA_HDT)}
                  </p>
                </div>
              )}
              {entry.Status_Remark && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-1 flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Query / Remark
                  </p>
                  <p className="text-sm text-amber-900">
                    {entry.Status_Remark}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Leave Dates Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Period
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">From Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(entry.Fr_Date)}
                  {entry.FDt_hfDy && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({getHalfDayLabel(entry.FDt_hfDy)})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">To Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(entry.To_Date)}
                  {entry.TDt_hfDy && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({getHalfDayLabel(entry.TDt_hfDy)})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Days</p>
              <p className="text-xl font-bold text-blue-600">
                {entry.Tot_Days} days
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Leave Breakdown</p>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs text-gray-500">Paid:</span>
                  <span className="ml-1 text-sm font-semibold text-green-600">
                    {entry.Paid || 0} days
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Unpaid:</span>
                  <span className="ml-1 text-sm font-semibold text-red-600">
                    {entry.UnPaid || 0} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Reason for Leave
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {entry.Reason || "No reason provided"}
            </p>
            {(entry.Prx_HlDy || entry.Sfx_HlDy) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Holiday Options:
                </p>
                <div className="flex gap-4">
                  {entry.Prx_HlDy == 1 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Prefix Holiday
                    </span>
                  )}
                  {entry.Sfx_HlDy == 1 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Suffix Holiday
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Employee and Leave Type */}
        <div className="space-y-6">
          {/* Employee Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Employee Information
              </h2>
            </div>

            {entry.employee ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Employee Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {entry.employee.First_Name} {entry.employee.Last_Name || ""}
                  </p>
                </div>

                {entry.employee.Phone && entry.employee.Phone != "0" && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      Phone
                    </p>
                    <p className="text-base text-gray-900">
                      {entry.employee.Phone}
                    </p>
                  </div>
                )}

                {entry.employee.Email_Id && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </p>
                    <p className="text-base text-gray-900">
                      {entry.employee.Email_Id}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No employee information available</p>
            )}
          </div>

          {/* Leave Type Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <Tag className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Type
              </h2>
            </div>

            {entry.leave_type ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Leave Type</p>
                  <p className="text-base font-medium text-gray-900">
                    {entry.leave_type.LT_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Maximum Days</p>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.leave_type.Max_days}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Leave Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.leave_type.Is_Paid ? "Paid Leave" : "Unpaid Leave"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                No leave type information available
              </p>
            )}
          </div>

          {/* Contact Information Card */}
          {(entry.Lv_Cnt || entry.Lv_Adr) && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Contact During Leave
                </h2>
              </div>

              <div className="space-y-3">
                {entry.Lv_Cnt && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact Number
                    </p>
                    <p className="text-base text-gray-900">{entry.Lv_Cnt}</p>
                  </div>
                )}

                {entry.Lv_Adr && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      Address
                    </p>
                    <p className="text-sm text-gray-900">{entry.Lv_Adr}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationView;

// overtime-record-entry/view.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Briefcase,
  Printer,
  Sunrise,
  Sunset,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { OverTimeRecordApi } from "../../../../services/overtimerecordapi";

const OverTimeRecordView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pageTitle, setPageTitle] = useState("Overtime Record Details");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/attendance/overtime-record-entry";
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
      const response = await OverTimeRecordApi.getById(id);
      setEntry(response);
    } catch (error) {
      console.error("Error loading entry details:", error);
      toast.error("Failed to load entry details!");
      navigate(
        "/transactions/attendance-management/attendance/overtime-record-entry",
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
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      if (
        typeof timeString == "string" &&
        timeString.match(/^\d{2}:\d{2}:\d{2}$/)
      ) {
        const [hours, minutes] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0);
        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      return timeString;
    } catch {
      return timeString || "N/A";
    }
  };

  const formatOvertimeHours = (hours) => {
    if (!hours && hours != 0) return "0:00";
    if (typeof hours == "string" && hours.includes(":")) {
      return hours;
    }
    const decimal = parseFloat(hours);
    const hrs = Math.floor(decimal);
    const mins = Math.round((decimal - hrs) * 60);
    return `${hrs}:${mins.toString().padStart(2, "0")}`;
  };

  const getStatusDisplay = () => {
    if (entry?.r_status_rel) {
      return entry?.r_status_rel.St_Name || "Pending";
    }
    if (entry?.status_rel) {
      return entry.status_rel.St_Name || "Pending";
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

  const getShiftBadges = () => {
    const badges = [];
    if (entry?.Early_Coming == "Y") {
      badges.push(
        <span
          key="early"
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
        >
          <Sunrise className="h-4 w-4 mr-2" />
          Early Coming
        </span>,
      );
    }
    if (entry?.Late_Going == "Y") {
      badges.push(
        <span
          key="late"
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
        >
          <Sunset className="h-4 w-4 mr-2" />
          Late Going
        </span>,
      );
    }
    return badges;
  };

  const getHolidayBadge = (prxHlDy, sfxHlDy) => {
    const badges = [];
    if (prxHlDy == "1" || prxHlDy == 1 || prxHlDy == true) {
      badges.push(
        <span
          key="prev"
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
        >
          Previous Holiday
        </span>,
      );
    }
    if (sfxHlDy == "1" || sfxHlDy == 1 || sfxHlDy == true) {
      badges.push(
        <span
          key="next"
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
        >
          Subsequent Holiday
        </span>,
      );
    }
    return badges.length > 0 ? (
      <div className="flex gap-2">{badges}</div>
    ) : null;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading overtime record details...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-12 text-center">
        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Record Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The overtime record you're looking for doesn't exist or has been
          deleted.
        </p>
        <button
          onClick={() =>
            navigate(
              "/transactions/attendance-management/attendance/overtime-record-entry",
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
                "/transactions/attendance-management/attendance/overtime-record-entry",
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
              Detailed information of overtime record
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Information Card */}
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
              {entry.OTR_HDT && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Approved/Processed Date
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(entry.OTR_HDT).toLocaleString()}
                  </p>
                </div>
              )}
              {entry.Status_Remark && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Query / Remark
                  </p>
                  <p className="text-sm text-amber-900">
                    {entry.Status_Remark}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date & Time Information Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Date & Time Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Overtime Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(entry.OTR_Date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">In Time</p>
                <p className="text-base font-medium text-gray-900">
                  {formatTime(entry.In_Time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Out Time</p>
                <p className="text-base font-medium text-gray-900">
                  {formatTime(entry.Out_Time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Total Overtime Hours
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatOvertimeHours(entry.OTR_Hrs)} hours
                </p>
              </div>
            </div>
          </div>

          {/* Employee Information Card */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-base text-gray-900">
                      {entry.employee.Phone || "N/A"}
                    </p>
                  </div>
                </div>
                {entry.employee.Email_Id && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
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
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Overtime Details Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                <Clock className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Overtime Details
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Shift Status</p>
                <div className="mt-1 flex gap-2">
                  {getShiftBadges().length > 0 ? (
                    getShiftBadges()
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-2">Holiday Details</p>
                {getHolidayBadge(entry.Prx_HlDy, entry.Sfx_HlDy) || (
                  <p className="text-gray-500 text-sm">
                    No holiday adjustments
                  </p>
                )}
              </div>
              {entry.Reason && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Reason</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {entry.Reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* HOD Information Card */}
          {entry.hod && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  HOD Information
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">HOD Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {entry.hod.Usr_Name}
                  </p>
                </div>
                {entry.hod.Usr_Email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-base text-gray-900">
                      {entry.hod.Usr_Email}
                    </p>
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

export default OverTimeRecordView;

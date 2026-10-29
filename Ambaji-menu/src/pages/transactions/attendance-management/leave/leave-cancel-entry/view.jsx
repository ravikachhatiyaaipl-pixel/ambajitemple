// leave-cancel-entry/view.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Tag,
  Clock,
  User,
  Briefcase,
  Building,
  CheckCircle,
  XCircle,
  Printer,
  DollarSign,
  CalendarDays,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const LeaveCancelView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pageTitle, setPageTitle] = useState("Leave Cancel Entry");

  const API_BASE_URL = process.env.VITE_API_URL;

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );
      const menuItem = menuDetails.find(
        (item) =>
          item.Menu_Links ==
          "/transactions/attendance-management/leave/leave-cancel-entry"
      );
      if (menuItem?.Fnc_Title) setPageTitle(menuItem.Fnc_Title);
    } catch {}
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    setLoading(true);
    try {
      // Fetch the specific cancelled leave application
      const response = await axios.get(
        `${API_BASE_URL}/lst-leave-application?lv_mode=C&per_page=100`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      
      if (response.data && response.data.success) {
        const cancelledLeaves = response.data.data.data || [];
        const foundEntry = cancelledLeaves.find(
          (leave) => leave.LA_id == parseInt(id)
        );
        
        if (foundEntry) {
          // Validate that it's a cancelled leave
          if (foundEntry.Lv_Mode !=  "C") {
            toast.error("This is not a cancelled leave record");
            navigate("/transactions/attendance-management/leave/leave-cancel-entry");
            return;
          }
          setEntry(foundEntry);
        } else {
          toast.error("Leave record not found");
          navigate("/transactions/attendance-management/leave/leave-cancel-entry");
        }
      } else {
        toast.error("Failed to load entry details");
        navigate("/transactions/attendance-management/leave/leave-cancel-entry");
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error(error.response?.data?.message || "Failed to load entry details!");
      navigate("/transactions/attendance-management/leave/leave-cancel-entry");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getCancellationBadge = () => {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <XCircle className="h-4 w-4 mr-2" />
        CANCELLED
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cancelled leave details...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-12 text-center">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
        <button
          onClick={() =>
            navigate("/transactions/attendance-management/leave/leave-cancel-entry")
          }
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
              navigate("/transactions/attendance-management/leave/leave-cancel-entry")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle} 
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed information of cancelled leave application
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          
          <button
            onClick={() => window.print()}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium flex items-center hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Cancelled Banner */}
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-sm font-medium text-red-800">
            This leave application has been CANCELLED on{" "}
            {formatDateTime(entry.updated_at)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Cancellation Information
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Leave Code
                  </span>
                </div>
                <p className="text-base font-mono font-semibold text-gray-900">
                  {entry.LA_Code}
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {entry.employee?.First_Name} {entry.employee?.Last_Name || ""}
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Leave Type
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {entry.leave_type?.LT_name || "N/A"}
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Reason for Leave
                  </span>
                </div>
                <p className="text-sm text-gray-900">{entry.Reason || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Leave Period
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatDate(entry.Fr_Date)} - {formatDate(entry.To_Date)}
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Total Days Cancelled
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {entry.Tot_Days} days
                </p>
                <div className="mt-1 text-xs text-gray-500">
                  Paid: {entry.Paid} days | Unpaid: {entry.UnPaid} days
                </div>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Cancellation Date
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatDateTime(entry.updated_at)}
                </p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Cancelled By (HOD)
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {entry.hod?.full_name || entry.hod?.Usr_Name || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(entry.LA_HDT)}
                </p>
              </div>
            </div>
          </div>

          {entry.Status_Remark && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Status Remark
              </span>
              <p className="text-sm text-gray-900 mt-1">{entry.Status_Remark}</p>
            </div>
          )}

          {entry.Leave_Address && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Leave Address
              </span>
              <p className="text-sm text-gray-900 mt-1">{entry.Leave_Address}</p>
            </div>
          )}

          {(entry.employee?.department_list?.length > 0 || 
            entry.employee?.designation) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.employee?.department_list?.length > 0 && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Building className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Department</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {entry.employee.department_list.map(dept => dept.Dpt_Name || dept.Dpt_Desc).join(", ")}
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

export default LeaveCancelView; 
// leave-credits/view.jsx
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LeaveCreditsApi } from "../../../../services/leavecreditsapi";

const LeaveTransactionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pageTitle, setPageTitle] = useState("Leave Credit Details");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/leave/leave-credits";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadEntryDetails();
  }, [id]);

  const loadEntryDetails = async () => {
    setLoading(true);
    try {
      const entryData = await LeaveCreditsApi.getById(id);
      setEntry(entryData);
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load entry details!");
      navigate("/transactions/attendance-management/leave/leave-credits");
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

  const getTransactionTypeLabel = (type) => {
    const labels = {
      ACCRUAL: "Accrual",
      OPENING_CREDIT: "Opening Credit",
      CARRY_FORWARD: "Carry Forward",
      DEBIT_APPLIED: "Debit Applied",
      CREDIT_CANCELLED: "Credit Cancelled",
      ENCASHMENT: "Encashment",
      LAPSE: "Lapse",
      MANUAL_ADJUSTMENT: "Manual Adjustment",
    };
    return labels[type] || type;
  };

  const getTrModeBadge = (mode) => {
    if (mode == "C") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Credit (+)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Debit (-)
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading leave transaction details...
        </p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-12 text-center">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
        <p className="text-gray-600 mb-6">
          The leave transaction you're looking for doesn't exist.
        </p>
        <button
          onClick={() =>
            navigate("/transactions/attendance-management/leave/leave-credits")
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/attendance-management/leave/leave-credits",
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
              Detailed information of leave transaction
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

      {/* Main Content - Simple Card Layout */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Information
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Employee Details */}
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
                <p className="text-sm text-gray-500 mt-1">
                  Code: {entry.employee?.Emp_Code}
                </p>
              </div>

              {/* Leave Type */}
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
                <p className="text-sm text-gray-500 mt-1">
                  Code: {entry.leave_type?.LT_code}
                </p>
              </div>

              {/* Transaction Type */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Transaction Type
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {getTransactionTypeLabel(entry.Tr_Type)}
                </p>
              </div>

              {/* Transaction Mode */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Transaction Mode
                  </span>
                </div>
                <div>{getTrModeBadge(entry.Tr_Mode)}</div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Transaction Date */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Transaction Date
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatDate(entry.Tr_Date)}
                </p>
              </div>

              {/* Leave Credit Date */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Leave Credit Date
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatDate(entry.LT_Date)}
                </p>
              </div>

              {/* Transaction Days */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Transaction Days
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {entry.Tr_Days} days
                </p>
              </div>

              {/* Financial Year */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Financial Year
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {entry.financial_year?.FY_Code || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {entry.financial_year?.FY_Name}
                </p>
              </div>
            </div>
          </div>

          {/* Department & Designation Row */}
          {(entry.employee?.department || entry.employee?.designation) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.employee?.department && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Building className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Department</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {entry.employee.department.Dpt_Name}
                    </p>
                  </div>
                )}
                {entry.employee?.designation && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Briefcase className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Designation</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {entry.employee.designation.Dsg_Desc}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Created At</span>
                <p className="text-sm text-gray-900">
                  {formatDate(entry.created_at)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Last Updated</span>
                <p className="text-sm text-gray-900">
                  {formatDate(entry.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveTransactionView;

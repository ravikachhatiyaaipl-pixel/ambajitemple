// leave-encashment/view.jsx
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
  CreditCard,
  Receipt,
  Hash,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LeaveEncashmentApi } from "../../../../services/leaveencashmentapi";

const LeaveEncashmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pageTitle, setPageTitle] = useState("Leave Encashment Details");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/leave/leave-encashment";
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
      const response = await LeaveEncashmentApi.getById(id);
      if (response.success && response.data) {
        setEntry(response.data);
      } else {
        toast.error("Failed to load encashment details!");
        navigate("/transactions/attendance-management/leave/leave-encashment");
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load encashment details!");
      navigate("/transactions/attendance-management/leave/leave-encashment");
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
      ENCASHMENT: "Encashment",
      ENCASHMENT_D: "Encashment (Debit)",
      ENCASHMENT_C: "Encashment (Credit)",
      ENCASHMENT_DEDUCTION: "Encashment Deduction",
      MANUAL_ENCASHMENT: "Manual Encashment",
    };
    return labels[type] || type || "Encashment Transaction";
  };

  const getTrModeBadge = (mode) => {
    if (mode == "C" || mode == "C") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Credit (+)
        </span>
      );
    }
    if (mode == "D" || mode == "D") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Debit (-)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {mode || "N/A"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusMap = {
      APPROVED: { color: "green", label: "Approved" },
      PENDING: { color: "yellow", label: "Pending" },
      REJECTED: { color: "red", label: "Rejected" },
      CANCELLED: { color: "gray", label: "Cancelled" },
      PROCESSING: { color: "blue", label: "Processing" },
    };
    
    const statusInfo = statusMap[status] || statusMap[status?.toUpperCase()] || { color: "gray", label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading leave encashment details...
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
          The leave encashment record you're looking for doesn't exist.
        </p>
        <button
          onClick={() =>
            navigate("/transactions/attendance-management/leave/leave-encashment")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  // Extract data from entry (handle both direct and nested structures)
  const transactionData = entry.original_data || entry;
  const employee = transactionData.employee || entry.employee;
  const leaveType = transactionData.leave_type || entry.leave_type;
  const financialYear = transactionData.financial_year || entry.financial_year;
  const statusAction = transactionData.status_action || entry.status_action;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/attendance-management/leave/leave-encashment",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle} - View
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed information of leave encashment transaction
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

      {/* Main Content - Simple Card Layout */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Encashment Information
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
                  {employee?.First_Name || entry.employee_name || "N/A"}
                  {employee?.Last_Name && ` ${employee.Last_Name}`}
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
                  {leaveType?.LT_name || entry.leave_type || "N/A"}
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
                  {getTransactionTypeLabel(transactionData.Tr_Type || entry.Tr_Type)}
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
                <div>{getTrModeBadge(transactionData.Tr_Mode || entry.Tr_Mode)}</div>
              </div>

              {/* Status */}
              {(transactionData.Status || entry.Status || statusAction) && (
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Status
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(transactionData.Status || entry.Status)}
                    {statusAction?.St_Name && (
                      <p className="text-sm text-gray-500 mt-1">
                        {statusAction.St_Name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Encashment Days */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Encashment Days
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {entry.encash_days || transactionData.Tr_Days || 0} days
                </p>
              </div>

              {/* Daily Rate & Total Amount */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Amount Details
                  </span>
                </div>
                {entry.daily_rate && (
                  <p className="text-sm text-gray-600">
                    Daily Rate: ₹{parseFloat(entry.daily_rate).toLocaleString()}
                  </p>
                )}
                <p className="text-xl font-bold text-green-600 mt-1">
                  Total Amount: ₹{(entry.total_amount || 0).toLocaleString()}
                </p>
              </div>

              {/* Payment Reference */}
              {(entry.payment_reference || transactionData.payment_reference) && (
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Payment Reference
                    </span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {entry.payment_reference || transactionData.payment_reference}
                  </p>
                </div>
              )}

              {/* Transaction Date */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Transaction Date
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatDate(transactionData.Tr_Date || entry.Tr_Date || entry.transaction_date)}
                </p>
              </div>

              {/* Payment Date */}
              {(entry.payment_date || transactionData.payment_date) && (
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Payment Date
                    </span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(entry.payment_date || transactionData.payment_date)}
                  </p>
                </div>
              )}

              {/* Financial Year */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Financial Year
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {financialYear?.FY_Code || entry.fy_name || "N/A"}
                </p>
                {financialYear?.FY_Name && (
                  <p className="text-sm text-gray-500 mt-1">
                    {financialYear.FY_Name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          {(entry.remarks || transactionData.remarks) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Remarks
                </span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {entry.remarks || transactionData.remarks}
              </p>
            </div>
          )}

          {/* Department & Designation Row */}
          {(employee?.department || employee?.designation || employee?.Dpt_Id) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee?.department && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Building className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Department</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {employee.department.Dpt_Name}
                    </p>
                  </div>
                )}
                {employee?.designation && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Briefcase className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Designation</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {employee.designation.Dsg_Desc}
                    </p>
                  </div>
                )}
                {employee?.department_list && employee.department_list.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-1">
                      <Building className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Departments</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {employee.department_list.map((dept, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {dept.Dpt_Name}
                        </span>
                      ))}
                    </div>
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
                  {formatDate(transactionData.created_at || entry.created_at)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Last Updated</span>
                <p className="text-sm text-gray-900">
                  {formatDate(transactionData.updated_at || entry.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveEncashmentView;
// leave-carryforward-entry/view.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  Printer,
  Download,
  CheckCircle,
  AlertTriangle,
  Building,
  Briefcase,
  Wallet,
  DollarSign,
  RefreshCw,
  Settings,
  Info,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LeaveCarryForwardApi } from "../../../../services/leavecarryforwardapi";

const LeaveCarryForwardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [pageTitle, setPageTitle] = useState("Leave Carry Forward Details");
  const [showCarriedDetails, setShowCarriedDetails] = useState(true);
  const [showLapsedDetails, setShowLapsedDetails] = useState(true);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/transactions/attendance-management/leave/leave-carryforward-entry";
      const currentMenuItem = menuDetails.find((item) => item.Menu_Links == currentPath);
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadMasterData();
    loadEntryDetails();
  }, [id]);

  const loadMasterData = async () => {
    try {
      const [fyResponse, empResponse, ltResponse] = await Promise.all([
        LeaveCarryForwardApi.getAllFinancialYears(),
        LeaveCarryForwardApi.getAllEmployees(),
        LeaveCarryForwardApi.getAllLeaveTypes()
      ]);
      
      if (fyResponse.success) {
        setFinancialYears(fyResponse.data || []);
      }
      if (empResponse.status && empResponse.data) {
        setEmployees(empResponse.data);
      }
      if (ltResponse.success && ltResponse.data) {
        setLeaveTypes(ltResponse.data);
      }
    } catch (error) {
      console.error("Error loading master data:", error);
      toast.error("Failed to load reference data");
    }
  };

  const loadEntryDetails = async () => {
    setLoading(true);
    try {
      const response = await LeaveCarryForwardApi.getById(id);
      const entryData = response?.data || response;
      
      // Validate entry data structure
      if (!entryData) {
        throw new Error("No data received from server");
      }
      
      setEntry(entryData);
      
      // If entry has employee and leave type IDs, try to fetch balance
      if (entryData.emp_id && entryData.lt_id && entryData.to_fy_id) {
        await fetchLeaveBalance(entryData.emp_id, entryData.lt_id, entryData.to_fy_id);
      }
    } catch (error) {
      console.error("Error loading entry details:", error);
      toast.error(error.response?.data?.message || "Failed to load carry forward details!");
      navigate("/transactions/attendance-management/leave/leave-carryforward-entry");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async (empId, ltId, fyId) => {
    setLoadingBalance(true);
    try {
      const response = await LeaveCarryForwardApi.getLeaveBalance(empId, ltId, fyId);
      if (response.success && response.data) {
        setBalanceData(response.data);
        setShowBalanceDetails(true);
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      // Don't show error toast as this is supplementary info
    } finally {
      setLoadingBalance(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-IN", {
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
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getFinancialYearName = (fyId) => {
    if (!fyId) return "N/A";
    const fy = financialYears.find(f => f.FY_Id == fyId);
    return fy ? fy.FY_Name : `FY #${fyId}`;
  };

  const getEmployeeDetails = () => {
    if (!entry) return null;
    
    if (entry.employee) {
      return {
        name: `${entry.employee.First_Name || ""} ${entry.employee.Last_Name || ""}`.trim(),
        code: entry.employee.Emp_Code,
        email: entry.employee.Email,
        department: entry.employee.Department,
        designation: entry.employee.Designation
      };
    }
    
    if (entry.emp_id) {
      const emp = employees.find(e => e.Emp_Id == entry.emp_id);
      if (emp) {
        return {
          name: `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim(),
          code: emp.Emp_Code,
          email: emp.Email,
          department: emp.Department,
          designation: emp.Designation
        };
      }
    }
    
    return {
      name: entry.emp_name || `Employee #${entry.emp_id}`,
      code: entry.emp_code,
    };
  };

  const getLeaveTypeDetails = () => {
    if (!entry) return null;
    
    if (entry.leave_type) {
      return {
        name: entry.leave_type.LT_name,
        maxDays: entry.leave_type.Max_days,
        isPaid: entry.leave_type.Is_Paid,
        isActive: entry.leave_type.Is_Active
      };
    }
    
    if (entry.lt_id) {
      const lt = leaveTypes.find(l => l.LT_id == entry.lt_id);
      if (lt) {
        return {
          name: lt.LT_name,
          maxDays: lt.Max_days,
          isPaid: lt.Is_Paid,
          isActive: lt.Is_Active
        };
      }
    }
    
    return {
      name: entry.lt_name || `Leave Type #${entry.lt_id}`,
    };
  };

  const getStatusBadge = () => {
    if (!entry) return null;
    
    const status = entry.status || "Completed";
    let colorClass = "bg-green-100 text-green-800";
    let icon = <CheckCircle className="h-4 w-4 mr-2" />;
    
    if (status == "Pending") {
      colorClass = "bg-yellow-100 text-yellow-800";
      icon = <Clock className="h-4 w-4 mr-2" />;
    } else if (status == "Failed") {
      colorClass = "bg-red-100 text-red-800";
      icon = <AlertTriangle className="h-4 w-4 mr-2" />;
    } else if (status == "Processing") {
      colorClass = "bg-blue-100 text-blue-800";
      icon = <RefreshCw className="h-4 w-4 mr-2 animate-spin" />;
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {icon}
        {status}
      </span>
    );
  };

  const getCarriedForwardList = () => {
    if (entry?.carried_forward) return entry.carried_forward;
    if (entry?.carry_forward_list) return entry.carry_forward_list;
    return [];
  };

  const getLapsedList = () => {
    if (entry?.lapsed) return entry.lapsed;
    if (entry?.lapsed_list) return entry.lapsed_list;
    return [];
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    if (!printContent) return;
    
    const originalTitle = document.title;
    document.title = `Carry_Forward_${entry?.id || id}_${new Date().toISOString().split('T')[0]}`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                padding: 0;
              }
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #333;
              }
              .print-title {
                font-size: 24px;
                font-weight: bold;
                margin: 0;
              }
              .print-subtitle {
                color: #666;
                margin-top: 5px;
              }
              .print-section {
                margin-bottom: 25px;
                page-break-inside: avoid;
              }
              .print-section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid #ddd;
              }
              .print-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 20px;
              }
              .print-label {
                font-weight: bold;
                color: #555;
                font-size: 12px;
                margin-bottom: 5px;
              }
              .print-value {
                font-size: 14px;
              }
              .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              .print-table th,
              .print-table td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
              }
              .print-table th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              .print-footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 15px;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
    
    document.title = originalTitle;
    toast.success("Print window opened");
  };

  const handleCopyId = () => {
    if (entry?.id || id) {
      navigator.clipboard.writeText(entry?.id || id);
      toast.success("ID copied to clipboard");
    }
  };

  const handleExportJSON = () => {
    if (!entry) return;
    
    const exportData = {
      ...entry,
      exported_at: new Date().toISOString(),
      from_fy_name: getFinancialYearName(entry.from_fy_id),
      to_fy_name: getFinancialYearName(entry.to_fy_id),
      employee_details: getEmployeeDetails(),
      leave_type_details: getLeaveTypeDetails(),
    };
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carry_forward_${entry.id || id}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("JSON exported successfully");
  };

  const carriedForwardList = getCarriedForwardList();
  const lapsedList = getLapsedList();
  const employeeDetails = getEmployeeDetails();
  const leaveTypeDetails = getLeaveTypeDetails();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading carry forward details...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Not Found</h2>
          <p className="text-gray-600 mb-6">
            The carry forward record you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate("/transactions/attendance-management/leave/leave-carryforward-entry")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" ref={printRef}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions/attendance-management/leave/leave-carryforward-entry")}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            title="Back to List"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle} - View
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed information of leave carry forward
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyId}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center hover:bg-gray-50 transition-colors"
            title="Copy ID"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportJSON}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center hover:bg-gray-50 transition-colors"
            title="Export as JSON"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handlePrint}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div id="print-content">
        {/* Header for Print */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
          <p className="text-gray-600">Carry Forward Details - ID: {entry.id || id}</p>
          <p className="text-gray-500 text-sm">Printed on: {formatDateTime(new Date())}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Status Information
                  </h2>
                </div>
                <span className="text-xs text-gray-400">ID: {entry.id || id}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Status</p>
                  {getStatusBadge()}
                </div>
                {entry.processed_date && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Processed Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(entry.processed_date)}
                    </p>
                  </div>
                )}
                {entry.created_at && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Created At</p>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(entry.created_at)}
                    </p>
                  </div>
                )}
                {entry.updated_at && entry.updated_at !=  entry.created_at && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(entry.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Year Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <Calendar className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Financial Years
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">From Financial Year</p>
                  <p className="text-base font-semibold text-gray-900">
                    {getFinancialYearName(entry.from_fy_id)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">To Financial Year</p>
                  <p className="text-base font-semibold text-gray-900">
                    {getFinancialYearName(entry.to_fy_id)}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <Wallet className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Carry Forward Summary
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Total Carried Forward</span>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-2">
                    {entry.total_carried_forward_days || entry.total_carry_forward_days || 0} days
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    {carriedForwardList.length} record(s)
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">Total Lapsed</span>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-2">
                    {entry.total_lapsed_days || 0} days
                  </div>
                  <div className="text-xs text-red-700 mt-1">
                    {lapsedList.length} record(s)
                  </div>
                </div>
              </div>

              {/* Net Balance after carry forward */}
              {(entry.total_carried_forward_days || entry.total_carry_forward_days) && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">Net Balance in New FY</span>
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    {balanceData?.available_balance || 
                     (entry.total_carried_forward_days || entry.total_carry_forward_days || 0)} days
                  </div>
                  {balanceData && (
                    <div className="text-xs text-blue-700 mt-1">
                      As of {getFinancialYearName(entry.to_fy_id)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Employee Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee Information
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Employee Name</p>
                  <p className="text-base font-semibold text-gray-900">
                    {employeeDetails?.name || "N/A"}
                  </p>
                </div>
                {employeeDetails?.code && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Employee Code</p>
                    <p className="text-sm text-gray-900 font-mono">{employeeDetails.code}</p>
                  </div>
                )}
                {employeeDetails?.email && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm text-gray-900">{employeeDetails.email}</p>
                  </div>
                )}
                {employeeDetails?.department && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-sm text-gray-900">{employeeDetails.department}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Leave Type Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                  <Building className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Leave Type
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Leave Type Name</p>
                  <p className="text-base font-semibold text-gray-900">
                    {leaveTypeDetails?.name || "N/A"}
                  </p>
                </div>
                {leaveTypeDetails?.maxDays && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Maximum Days</p>
                    <p className="text-sm text-gray-900">{leaveTypeDetails.maxDays} days</p>
                  </div>
                )}
                {leaveTypeDetails?.isPaid !=  undefined && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Leave Type</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${leaveTypeDetails.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {leaveTypeDetails.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Processing Settings
                </h2>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${entry.auto_carry ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {entry.auto_carry ? 'Auto Carry Enabled' : 'Manual Carry'}
                </span>
                <p className="text-xs text-gray-500 mt-3">
                  {entry.auto_carry 
                    ? "System automatically determined carry forward based on leave rules" 
                    : "Manual selection of carry forward amounts"}
                </p>
              </div>
            </div>

            {/* Balance Card - New */}
            {showBalanceDetails && balanceData && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mr-3">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Leave Balance (New FY)
                  </h2>
                </div>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-teal-600">
                    {balanceData.available_balance || 0}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Available Balance in {getFinancialYearName(entry.to_fy_id)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Carried Forward Details Table */}
        {carriedForwardList.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
            <button
              onClick={() => setShowCarriedDetails(!showCarriedDetails)}
              className="w-full px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                Carried Forward Details
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({carriedForwardList.length} records)
                </span>
              </h3>
              {showCarriedDetails ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
            </button>
            {showCarriedDetails && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Carried Days</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {carriedForwardList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.employee_name || `Employee #${item.emp_id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.leave_type || `Leave Type #${item.lt_id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          {item.carry_forward_days || item.carried_days} days
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700">
                          {item.net_balance || '-'} days
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">
                          {item.carry_forward_transaction_id || item.transaction_id || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-green-600">
                        {carriedForwardList.reduce((sum, item) => sum + (item.carry_forward_days || item.carried_days || 0), 0)} days
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Lapsed Details Table */}
        {lapsedList.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
            <button
              onClick={() => setShowLapsedDetails(!showLapsedDetails)}
              className="w-full px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                Lapsed Details
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({lapsedList.length} records)
                </span>
              </h3>
              {showLapsedDetails ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
            </button>
            {showLapsedDetails && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lapsed Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lapsedList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.employee_name || `Employee #${item.emp_id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.leave_type || `Leave Type #${item.lt_id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                          {item.lapsed_days} days
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.reason || "Exceeded maximum carry forward limit"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-red-600">
                        {lapsedList.reduce((sum, item) => sum + (item.lapsed_days || 0), 0)} days
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Print Footer */}
        <div className="hidden print:block text-center mt-8 pt-4 border-t text-xs text-gray-500">
          <p>Generated on: {formatDateTime(new Date())}</p>
          <p>Document ID: {entry.id || id}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveCarryForwardView;
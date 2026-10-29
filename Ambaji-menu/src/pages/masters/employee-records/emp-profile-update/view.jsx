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
  Briefcase,
  CheckCircle,
  Edit,
  Copy,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Award,
  Users,
  CreditCard,
  Hash,
  FileText,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Percent,
  Building2,
  Heart,
  Home,
  Coffee,
  Gift,
  TrendingUp,
  Flag,
  Layers,
  XCircle,
  Check,
  Shield,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmployeeProfileApi from "../../../services/employeeprofileapi";

const ViewEmpProfileUpdate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    payDetails: true,
    allowances: true,
    quotas: true,
    system: true,
    employee: false,
  });

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const response = await EmployeeProfileApi.getById(id);

      console.log("API Response:", response);

      if (response.success) {
        setProfile(response.data);
      } else {
        toast.error(response.message || "Failed to load employee profile!");
        navigate("/masters/employee-records/emp-profile-update");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to load employee profile!"
      );
      navigate("/masters/employee-records/emp-profile-update");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null || amount == undefined || amount == "") return "-";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatPercentage = (value) => {
    if (value == null || value == undefined || value == "") return "-";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return numValue % 1 == 0 ? `${numValue}%` : `${numValue.toFixed(2)}%`;
  };

  const getStatusBadge = (isActive) => {
    const active =
      isActive == true ||
      isActive == 1 ||
      isActive == "1" ||
      isActive == "true";
    return active ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getStatusBadgeSmall = (isActive) => {
    const active =
      isActive == true ||
      isActive == 1 ||
      isActive == "1" ||
      isActive == "true";
    return active ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  const getCpfNpsDisplay = (value) => {
    if (value == "C") return "CPF (C)";
    if (value == "N") return "NPS (N)";
    if (value == "G") return "GPF (G)";
    return "-";
  };

  const convertToYesNo = (value) => {
    // Handle boolean values
    if (value == true || value == 1 || value == "1" || value == "yes")
      return "Yes";
    if (value == false || value == 0 || value == "0" || value == "no")
      return "No";
    // Handle string 'fixed' for GPF
    if (value == "fixed" || value == 2 || value == "2") return "Fixed";
    return value || "-";
  };

  const getIncrementMonthDisplay = (incMonth) => {
    if (incMonth == "7") return "July";
    if (incMonth == "1") return "January";
    return incMonth || "-";
  };

  // ============= GPF DISPLAY FUNCTION ==============
  const getGPFDisplay = () => {
    const gpfValue = profile?.GPF;
    const isFixed = gpfValue == "fixed" || gpfValue == 2 || gpfValue == "2";

    if (isFixed) return "Fixed";
    return convertToYesNo(gpfValue);
  };

  // ============= WEEK OFF PATTERN DISPLAY FUNCTION - DISPLAYS WOP_name ==============
  const getWeekOffPatternDisplay = () => {
    // Check for woff_pattern object from API response (correct path)
    if (profile?.woff_pattern?.WOP_name) {
      return profile.woff_pattern.WOP_name;
    }

    // Alternative: check if week_off_pattern exists with WOP_name
    if (profile?.week_off_pattern?.WOP_name) {
      return profile.week_off_pattern.WOP_name;
    }

    // Check for pattern_name
    if (profile?.woff_pattern?.pattern_name) {
      return profile.woff_pattern.pattern_name;
    }

    // Fallback: show WOP_id if available
    if (profile?.WOP_id) {
      return `Pattern ID: ${profile.WOP_id}`;
    }

    return "-";
  };

  const DetailRow = ({
    label,
    value,
    icon: Icon,
    copyable = false,
    valueClassName = "",
  }) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 flex-shrink-0">
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <div className="mt-1 flex items-center flex-wrap gap-2">
          <div
            className={`text-sm text-gray-900 font-medium ${valueClassName}`}
          >
            {value || "-"}
          </div>
          {copyable && value && value != "-" && (
            <button
              onClick={() => handleCopyToClipboard(value)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading employee profile...
          </p>
          <p className="text-sm text-gray-400 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Employee profile not found</p>
        <Link
          to="/masters/employee-records/emp-profile-update"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profiles
        </Link>
      </div>
    );
  }

  // Extract nested objects with null checks
  const employee = profile.employee || {};
  const grade = profile.grade || {};
  const department = profile.department || {};
  const designation = profile.designation || {};
  const empType = profile.emp_type || {};
  const empStatus = profile.emp_status || {};
  const payBand = profile.pay_band || {};
  const payBill = profile.payroll_bill || {};
  const cityGrade = profile.city_grade || {};
  const payMatrix = profile.pay_matrix || {};
  const quotaDetails = profile.quota_details || [];
  const gisfEGI = profile.gisf_egi || {};
  const gisvEGI = profile.gisv_egi || {};

  // Format employee name
  const getEmployeeDisplayName = () => {
    if (employee.First_Name || employee.Last_Name) {
      return `${employee.First_Name || ""} ${employee.Last_Name || ""}`.trim();
    }
    return `Employee #${profile.Emp_Id || ""}`;
  };

  const employeeDisplayName = getEmployeeDisplayName();
  const employeeCode = employee.Emp_Code || `EMP-${profile.Emp_Id || ""}`;

  // REPLACE with this multi-department version
  const getDepartmentsDisplay = () => {
    // Check for departments array from API
    if (profile.departments && profile.departments.length > 0) {
      return profile.departments.map((dept) => ({
        gujarati: dept.Dpt_Desc || "",
        english: dept.Dpt_Name || "",
      }));
    }

    // Check for department_list array
    if (profile.department_list && profile.department_list.length > 0) {
      return profile.department_list.map((dept) => ({
        gujarati: dept.Dpt_Desc || "",
        english: dept.Dpt_Name || "",
      }));
    }

    // Fallback to single department (old data)
    if (profile.department && Object.keys(profile.department).length > 0) {
      return [
        {
          gujarati: profile.department.Dpt_Desc || "",
          english: profile.department.Dpt_Name || "",
        },
      ];
    }

    return [];
  };

  // Get designation display
  const getDesignationDisplay = () => {
    if (designation && Object.keys(designation).length > 0) {
      if (designation.Dsg_Desc) return designation.Dsg_Desc;
      if (designation.Dsg_Title) return designation.Dsg_Title;
      if (designation.Dsg_EName) return designation.Dsg_EName;
      return designation.name || "-";
    }

    if (profile.Dsg_Desc) return profile.Dsg_Desc;
    if (profile.Dsg_Title) return profile.Dsg_Title;
    if (profile.Dsg_EName) return profile.Dsg_EName;
    return profile.Dsg_Id || "-";
  };

  const getGradeDisplay = () => {
    if (grade && Object.keys(grade).length > 0) {
      if (grade.EGM_Code && grade.EGM_Name) {
        return `${grade.EGM_Code} - ${grade.EGM_Name}`;
      }
      return grade.EGM_Name || grade.EGM_Code || "-";
    }
    return profile.EGM_Id || "-";
  };

  const getEmpTypeDisplay = () => {
    if (empType && Object.keys(empType).length > 0) {
      return empType.ETy_Name || "-";
    }
    return profile.ETy_Id || "-";
  };

  const getEmpStatusDisplay = () => {
    if (empStatus && Object.keys(empStatus).length > 0) {
      return empStatus.Est_Name || "-";
    }
    return profile.Est_Id || "-";
  };

  const getPayBandDisplay = () => {
    if (payBand && Object.keys(payBand).length > 0 && payBand.PB_Code) {
      const minPay = payBand.Min_Pay ? formatCurrency(payBand.Min_Pay) : "";
      const maxPay = payBand.Max_Pay ? formatCurrency(payBand.Max_Pay) : "";
      if (minPay && maxPay) {
        return `${payBand.PB_Code} (${minPay} - ${maxPay})`;
      }
      return payBand.PB_Code;
    }
    return profile.PB_Id ? `Pay Band #${profile.PB_Id}` : "-";
  };

  const getPayBillDisplay = () => {
    if (payBill && Object.keys(payBill).length > 0) {
      if (payBill.PayBill_Code && payBill.Description) {
        return `${payBill.PayBill_Code} - ${payBill.Description}`;
      }
      if (payBill.PayBill_Code) return payBill.PayBill_Code;
    }
    return profile.PBillNo ? `Pay Bill #${profile.PBillNo}` : "-";
  };

  const getCityGradeDisplay = () => {
    if (cityGrade && Object.keys(cityGrade).length > 0) {
      if (cityGrade.City_Name && cityGrade.Grade) {
        return `${cityGrade.City_Name} - ${cityGrade.Grade}`;
      }
      if (cityGrade.City_Name) return cityGrade.City_Name;
      if (cityGrade.Grade) return cityGrade.Grade;
    }
    return profile.CityCode ? `City Grade #${profile.CityCode}` : "-";
  };

  const getPayMatrixDisplay = () => {
    if (payMatrix && Object.keys(payMatrix).length > 0) {
      const basicPay = payMatrix.Basic_Pay
        ? formatCurrency(payMatrix.Basic_Pay)
        : "";
      const cellIndex = payMatrix.Cell_Index || "";
      const gradeName =
        payMatrix.emp_grade?.EGM_Name || payMatrix.emp_grade?.EGM_Code || "";

      if (gradeName && cellIndex && basicPay) {
        return `${gradeName} - Cell ${cellIndex} (${basicPay})`;
      }
      if (basicPay) return basicPay;
      if (cellIndex) return `Cell ${cellIndex}`;
    }
    return profile.Basic ? formatCurrency(profile.Basic) : "-";
  };

  // GISF EGI Code Display
  const getGISFEGIDisplay = () => {
    // Check for nested gisf_group object
    if (profile.gisf_group && Object.keys(profile.gisf_group).length > 0) {
      const groupType = profile.gisf_group.Group_Type || "";
      const insuranceAmt = profile.gisf_group.Insurance_Amt
        ? formatCurrency(profile.gisf_group.Insurance_Amt)
        : "";
      const saveAmt = profile.gisf_group.Save_Amt
        ? formatCurrency(profile.gisf_group.Save_Amt)
        : "";

      if (groupType && insuranceAmt && saveAmt) {
        return `${groupType} - Insurance: ${insuranceAmt} / Save: ${saveAmt}`;
      }
      if (groupType && insuranceAmt) return `${groupType} - ${insuranceAmt}`;
      if (groupType) return groupType;
      return `EGI Code #${profile.gisf_group.EGI_Id}`;
    }

    // Fallback to gisfEGI object
    if (gisfEGI && Object.keys(gisfEGI).length > 0) {
      const groupType = gisfEGI.Group_Type || "";
      const insuranceAmt = gisfEGI.Insurance_Amt
        ? formatCurrency(gisfEGI.Insurance_Amt)
        : "";
      const saveAmt = gisfEGI.Save_Amt ? formatCurrency(gisfEGI.Save_Amt) : "";
      const pcName = gisfEGI.pay_commission?.PC_Name || "";

      if (groupType && insuranceAmt && saveAmt) {
        return `${groupType} - Insurance: ${insuranceAmt} / Save: ${saveAmt} ${
          pcName ? `(${pcName})` : ""
        }`;
      }
      if (groupType && insuranceAmt) {
        return `${groupType} - ${insuranceAmt} ${pcName ? `(${pcName})` : ""}`;
      }
      if (groupType) return groupType;
      return `EGI #${gisfEGI.EGI_Id}`;
    }

    return profile.GISF_Em_gr ? `EGI Code #${profile.GISF_Em_gr}` : "-";
  };

  // GISV EGI Code Display
  const getGISVEGIDisplay = () => {
    // Check for nested gisv_group object
    if (profile.gisv_group && Object.keys(profile.gisv_group).length > 0) {
      const groupType = profile.gisv_group.Group_Type || "";
      const insuranceAmt = profile.gisv_group.Insurance_Amt
        ? formatCurrency(profile.gisv_group.Insurance_Amt)
        : "";
      const saveAmt = profile.gisv_group.Save_Amt
        ? formatCurrency(profile.gisv_group.Save_Amt)
        : "";

      if (groupType && insuranceAmt && saveAmt) {
        return `${groupType} - Insurance: ${insuranceAmt} / Save: ${saveAmt}`;
      }
      if (groupType && insuranceAmt) return `${groupType} - ${insuranceAmt}`;
      if (groupType) return groupType;
      return `EGI Code #${profile.gisv_group.EGI_Id}`;
    }

    // Fallback to gisvEGI object
    if (gisvEGI && Object.keys(gisvEGI).length > 0) {
      const groupType = gisvEGI.Group_Type || "";
      const insuranceAmt = gisvEGI.Insurance_Amt
        ? formatCurrency(gisvEGI.Insurance_Amt)
        : "";
      const saveAmt = gisvEGI.Save_Amt ? formatCurrency(gisvEGI.Save_Amt) : "";
      const pcName = gisvEGI.pay_commission?.PC_Name || "";

      if (groupType && insuranceAmt && saveAmt) {
        return `${groupType} - Insurance: ${insuranceAmt} / Save: ${saveAmt} ${
          pcName ? `(${pcName})` : ""
        }`;
      }
      if (groupType && insuranceAmt) {
        return `${groupType} - ${insuranceAmt} ${pcName ? `(${pcName})` : ""}`;
      }
      if (groupType) return groupType;
      return `EGI #${gisvEGI.EGI_Id}`;
    }

    return profile.GISV_Em_gr ? `EGI Code #${profile.GISV_Em_gr}` : "-";
  };

  const getQuotaDisplay = (quota) => {
    if (!quota) return "";
    const code = quota.Qut_Code || "";
    const name = quota.Qut_Name || "";
    const percentage = quota.Percentage ? `${quota.Percentage}%` : "";

    if (code && name) {
      return `${code} - ${name} ${percentage ? `(${percentage})` : ""}`;
    }
    return code || name || `Quota #${quota.Qut_Id}`;
  };

  // REPLACE with this multi-department version
  const renderDepartmentDisplay = () => {
    const departments = getDepartmentsDisplay();

    if (!departments || departments.length == 0) {
      return <span className="text-sm text-gray-900">-</span>;
    }

    return (
      <div className="space-y-2">
        {departments.map((dept, index) => (
          <div key={index}>
            <span className="text-sm text-gray-900 font-medium block">
              {dept.gujarati || "-"}
            </span>
            {dept.english && dept.english !=  "-" && (
              <span className="text-xs text-gray-500 block">
                {dept.english}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/emp-profile-update")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Employee Profile
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    {employeeDisplayName} ({employeeCode})
                  </span>
                  {getStatusBadge(profile.Is_Active)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/employee-records/emp-profile-update/edit/${profile.EPP_Id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow
                label="Employee"
                value={`${employeeDisplayName} (${employeeCode})`}
                icon={User}
                copyable
              />
              <DetailRow
                label="Joining Date"
                value={formatDate(profile.Join_Date)}
                icon={Calendar}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow
                label="Employee Type"
                value={getEmpTypeDisplay()}
                icon={Hash}
              />
              <DetailRow
                label="Employee Status"
                value={getEmpStatusDisplay()}
                icon={Users}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow
                label="Department"
                value={renderDepartmentDisplay()}
                icon={Building2}
              />
              <DetailRow
                label="Designation"
                value={getDesignationDisplay()}
                icon={Briefcase}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow
                label="Pay Bill"
                value={getPayBillDisplay()}
                icon={CreditCard}
              />
              <DetailRow
                label="City Grade"
                value={getCityGradeDisplay()}
                icon={Flag}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow label="Grade" value={getGradeDisplay()} icon={Award} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow
                label="Pay Band"
                value={getPayBandDisplay()}
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <DetailRow
                label="Basic (Pay Matrix)"
                value={getPayMatrixDisplay()}
                icon={DollarSign}
              />
            </div>

            {/* Week Off Pattern - Displays WOP_name from woff_pattern object */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow
                label="Week Off Pattern"
                value={getWeekOffPatternDisplay()}
                icon={CalendarDays}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow
                label="Post-Effective Date"
                value={formatDate(profile.EPP_Date)}
                icon={Calendar}
              />
              <DetailRow
                label="Increment Month"
                value={getIncrementMonthDisplay(profile.IncMonth)}
                icon={Calendar}
              />
            </div>
          </div>
        </div>

        {/* Pay Details & Allowances Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pay Details & Allowances
            </h2>
          </div>

          <div className="space-y-6">
            {/* CPF/NPS Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                CPF/NPS Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailRow
                  label="CPF/NPS"
                  value={getCpfNpsDisplay(profile.CPF_NPS)}
                  icon={Layers}
                />
                <DetailRow
                  label="NPS Percentage"
                  value={formatPercentage(profile.NPS_PERCENT)}
                  icon={Percent}
                />
              </div>
            </div>

            {/* Two Column Allowances Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1 - Allowances */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  Allowances
                </h3>
                <div className="space-y-3">
                  {/* NPA */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.NPA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.NPA)}
                    </span>
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">NPA</span>
                  </div>

                  {/* DA */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.DA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.DA)}
                    </span>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">DA</span>
                  </div>

                  {/* HRA */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.HRA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.HRA)}
                    </span>
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">HRA</span>
                    {convertToYesNo(profile.HRA) == "Yes" &&
                      profile.FixHRAAmount && (
                        <>
                          <div className="relative w-28 ml-2">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <span className="w-full pl-7 pr-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg block">
                              {formatCurrency(profile.FixHRAAmount)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            Fix HRA Amount
                          </span>
                        </>
                      )}
                  </div>

                  {/* CLA */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.CLA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.CLA)}
                    </span>
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">CLA</span>
                  </div>

                  {/* MA */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.MA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.MA)}
                    </span>
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">MA</span>
                  </div>

                  {/* TA */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.TA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.TA)}
                    </span>
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">TA</span>
                  </div>
                </div>
              </div>

              {/* Column 2 - Savings & Loan Allowances */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
                  Savings & Loan Allowances
                </h3>
                <div className="space-y-3">
                  {/* GISF with EGI Code */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.GISF) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.GISF)}
                    </span>
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">GISF</span>
                    {convertToYesNo(profile.GISF) == "Yes" && (
                      <>
                        <div className="relative min-w-[400px] ml-2">
                          <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">
                            {getGISFEGIDisplay()}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap">
                          EGI Code
                        </span>
                      </>
                    )}
                  </div>

                  {/* GISV with EGI Code */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.GISV) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.GISV)}
                    </span>
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">GISV</span>
                    {convertToYesNo(profile.GISV) == "Yes" && (
                      <>
                        <div className="relative min-w-[400px] ml-2">
                          <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">
                            {getGISVEGIDisplay()}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap">
                          EGI Code
                        </span>
                      </>
                    )}
                  </div>

                  {/* GPF with Fix GPF Amount */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-20 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        getGPFDisplay() == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : getGPFDisplay() == "Fixed"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {getGPFDisplay()}
                    </span>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">GPF</span>
                    {(profile.GPF == "fixed" ||
                      profile.GPF == 2 ||
                      profile.GPF == "2") &&
                      profile.FixGPF && (
                        <>
                          <div className="relative w-28 ml-2">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <span className="w-full pl-7 pr-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg block">
                              {formatCurrency(profile.FixGPF)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            Fix GPF Amount
                          </span>
                        </>
                      )}
                  </div>

                  {/* HBA with HBA Interest */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.HBA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.HBA)}
                    </span>
                    <Home className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">HBA</span>
                    {convertToYesNo(profile.HBA) == "Yes" && profile.HBAINT && (
                      <>
                        <div className="relative w-24 ml-2">
                          <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <span className="w-full pl-7 pr-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg block">
                            {formatPercentage(profile.HBAINT)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap">
                          HBA Interest
                        </span>
                      </>
                    )}
                  </div>

                  {/* MCA with MCA Interest */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center ${
                        convertToYesNo(profile.MCA) == "Yes"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {convertToYesNo(profile.MCA)}
                    </span>
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">MCA</span>
                    {convertToYesNo(profile.MCA) == "Yes" && profile.MCAINT && (
                      <>
                        <div className="relative w-24 ml-2">
                          <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <span className="w-full pl-7 pr-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg block">
                            {formatPercentage(profile.MCAINT)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap">
                          MCA Interest
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PHY/HD/AP Quota */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-pink-600" />
                PHY/HD/AP Quota
              </h3>
              <div>
                {quotaDetails && quotaDetails.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {quotaDetails.map((quota) => (
                      <span
                        key={quota.Qut_Id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800"
                      >
                        {getQuotaDisplay(quota)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No quotas selected</p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-4 pt-4 border-t">
              <span className="text-sm text-gray-700 font-medium">
                Is Active (Profile): {getStatusBadgeSmall(profile.Is_Active)}
              </span>
            </div>
          </div>
        </div>

        {/* Employee Details Section */}
        {employee && Object.keys(employee).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("employee")}
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee Details
                </h2>
              </div>
              {expandedSections.employee ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {expandedSections.employee && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.Emp_Code && (
                    <DetailRow
                      label="Employee Code"
                      value={employee.Emp_Code}
                      icon={Hash}
                      copyable
                    />
                  )}
                  {employee.Email_Id && (
                    <DetailRow
                      label="Email"
                      value={employee.Email_Id}
                      icon={Mail}
                      copyable
                    />
                  )}
                  {employee.Phone && (
                    <DetailRow
                      label="Phone"
                      value={employee.Phone}
                      icon={Phone}
                      copyable
                    />
                  )}
                  {employee.F_M && (
                    <DetailRow
                      label="Gender"
                      value={
                        employee.F_M == "M"
                          ? "Male"
                          : employee.F_M == "F"
                          ? "Female"
                          : employee.F_M
                      }
                      icon={User}
                    />
                  )}
                  {employee.Birth_Date && (
                    <DetailRow
                      label="Date of Birth"
                      value={formatDate(employee.Birth_Date)}
                      icon={Calendar}
                    />
                  )}
                  {(employee.Emp_Add1 ||
                    employee.Emp_Add2 ||
                    employee.Emp_Add3) && (
                    <DetailRow
                      label="Address"
                      value={[
                        employee.Emp_Add1,
                        employee.Emp_Add2,
                        employee.Emp_Add3,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      icon={MapPin}
                    />
                  )}
                  {employee.Bank_Name && (
                    <DetailRow
                      label="Bank"
                      value={employee.Bank_Name}
                      icon={CreditCard}
                    />
                  )}
                  {employee.UID_AdharNo && (
                    <DetailRow
                      label="Aadhar Number"
                      value={employee.UID_AdharNo}
                      icon={Hash}
                      copyable
                    />
                  )}
                  {employee.PAN_No && (
                    <DetailRow
                      label="PAN Number"
                      value={employee.PAN_No}
                      icon={FileText}
                      copyable
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* System Information Section */}
        {/* {(profile.created_at || profile.updated_at || profile.created_by || profile.updated_by) && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("system")}
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center mr-3">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  System Information
                </h2>
              </div>
              {expandedSections.system ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {expandedSections.system && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.created_at && (
                  <DetailRow
                    label="Created At"
                    value={formatDateTime(profile.created_at)}
                    icon={Calendar}
                  />
                )}
                {profile.created_by && (
                  <DetailRow
                    label="Created By"
                    value={profile.created_by}
                    icon={User}
                  />
                )}
                {profile.updated_at && (
                  <DetailRow
                    label="Updated At"
                    value={formatDateTime(profile.updated_at)}
                    icon={Calendar}
                  />
                )}
                {profile.updated_by && (
                  <DetailRow
                    label="Updated By"
                    value={profile.updated_by}
                    icon={User}
                  />
                )}
                {profile.EPP_Id && (
                  <DetailRow
                    label="Profile ID"
                    value={profile.EPP_Id}
                    icon={Hash}
                    copyable
                  />
                )}
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ViewEmpProfileUpdate;

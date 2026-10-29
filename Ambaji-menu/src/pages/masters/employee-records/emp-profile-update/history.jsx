import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Award,
  Users,
  CreditCard,
  Hash,
  DollarSign,
  Building2,
  TrendingUp,
  Flag,
  CalendarDays,
  Trash2,
  History,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmployeeProfileApi from "../../../services/employeeprofileapi";

const HistoryEmpProfileUpdate = ({ user }) => {
  const { empId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [empId]);

  const loadHistory = async (keepSelectedId = null) => {
    setLoading(true);
    try {
      const response = await EmployeeProfileApi.getHistoryByEmpId(empId);
      if (response.success) {
        const list = response.data?.records || [];
        setRecords(list);
        setEmployee(response.data?.employee || list[0]?.employee || null);
        const nextId =
          (keepSelectedId &&
            list.find((r) => r.EPP_Id == keepSelectedId)?.EPP_Id) ||
          list[0]?.EPP_Id ||
          null;
        setSelectedId(nextId);
      } else {
        toast.error(response.message || "Failed to load profile history");
        navigate("/masters/employee-records/emp-profile-update");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load profile history",
      );
      navigate("/masters/employee-records/emp-profile-update");
    } finally {
      setLoading(false);
    }
  };

  const selected = records.find((r) => r.EPP_Id == selectedId) || null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
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

  const isActive = (value) =>
    value == true || value == 1 || value == "1" || value == "true";

  const convertToYesNo = (value) => {
    if (value == true || value == 1 || value == "1" || value == "yes")
      return "Yes";
    if (value == false || value == 0 || value == "0" || value == "no")
      return "No";
    if (value == "fixed" || value == 2 || value == "2") return "Fixed";
    return value || "-";
  };

  const getEmployeeName = () => {
    const emp = employee || selected?.employee;
    if (!emp) return `Employee #${empId}`;
    const name = `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim();
    const code = emp.Emp_Code || "";
    if (code && name) return `${code} - ${name}`;
    return name || code || `Employee #${empId}`;
  };

  const getDesignation = (item) =>
    item?.designation?.Dsg_Desc ||
    item?.designation?.Dsg_Title ||
    item?.designation?.Dsg_EName ||
    "-";

  const getGrade = (item) => {
    const grade = item?.grade;
    if (!grade) return "-";
    if (grade.EGM_Code && grade.EGM_Name)
      return `${grade.EGM_Code} - ${grade.EGM_Name}`;
    return grade.EGM_Name || grade.EGM_Code || "-";
  };

  const getEmpType = (item) => item?.emp_type?.ETy_Name || "-";
  const getEmpStatus = (item) => item?.emp_status?.Est_Name || "-";

  const getDepartments = (item) => {
    const list = item?.departments || item?.department_list || [];
    if (Array.isArray(list) && list.length > 0) {
      return list
        .map((d) => d.Dpt_Desc || d.Dpt_Name)
        .filter(Boolean)
        .join(", ");
    }
    return item?.department?.Dpt_Desc || item?.department?.Dpt_Name || "-";
  };

  const getPayBill = (item) => {
    const payBill = item?.payroll_bill;
    if (payBill?.PayBill_Code && payBill?.Description) {
      return `${payBill.PayBill_Code} - ${payBill.Description}`;
    }
    return payBill?.PayBill_Code || (item?.PBillNo ? `Bill #${item.PBillNo}` : "-");
  };

  const getCityGrade = (item) => {
    const city = item?.city_grade;
    if (city?.City_Name && city?.Grade) return `${city.City_Name} - ${city.Grade}`;
    return city?.City_Name || city?.Grade || "-";
  };

  const getPayBand = (item) => {
    const band = item?.pay_band;
    if (band?.PB_Code) return band.PB_Code;
    return item?.PB_Id ? `Pay Band #${item.PB_Id}` : "-";
  };

  const getWeekOff = (item) =>
    item?.woff_pattern?.WOP_name ||
    item?.week_off_pattern?.WOP_name ||
    "-";

  const getCpfNps = (value) => {
    if (value == "C") return "CPF (C)";
    if (value == "N") return "NPS (N)";
    if (value == "G") return "GPF (G)";
    return "-";
  };

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: "Delete this history record?",
      text: `Profile #${record.EPP_Id} dated ${formatDate(record.EPP_Date)} will be removed. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await EmployeeProfileApi.delete(record.EPP_Id);
      toast.success("Record deleted successfully");
      const remaining = records.filter((r) => r.EPP_Id != record.EPP_Id);
      if (remaining.length == 0) {
        navigate("/masters/employee-records/emp-profile-update");
        return;
      }
      await loadHistory(remaining[0]?.EPP_Id);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete this record",
      );
    }
  };

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="py-2 border-b border-gray-100 self-start">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-900 font-medium">{value || "-"}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile history...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/emp-profile-update")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
            title="Back to employee profiles"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <History className="h-6 w-6 text-indigo-600 mr-2" />
              Profile History
            </h1>
            <p className="text-gray-600 mt-1 flex items-center">
              <User className="h-4 w-4 mr-1" />
              {getEmployeeName()}
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {records.length} record{records.length == 1 ? "" : "s"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-50 border-b">
          <div className="h-12 px-4 flex items-center lg:border-r border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">
              History (latest first)
            </h2>
          </div>
          <div className="h-12 px-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              Record details
            </h2>
            {selected && (
              <button
                type="button"
                onClick={() => handleDelete(selected)}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete record
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-gray-200 items-start">
          <div className="overflow-y-auto max-h-[65vh]">
            {records.length == 0 ? (
              <div className="p-8 text-center text-gray-500">
                No history records found
              </div>
            ) : (
              records.map((item, index) => {
                const active = isActive(item.Is_Active);
                const isSelected = item.EPP_Id == selectedId;
                return (
                  <button
                    key={item.EPP_Id}
                    type="button"
                    onClick={() => setSelectedId(item.EPP_Id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                      isSelected
                        ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDate(item.EPP_Date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {getDesignation(item)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          #{item.EPP_Id} · {getGrade(item)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {index == 0 && (
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            Latest
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {active ? "Active" : "History"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="overflow-y-auto max-h-[65vh] p-4">
            {!selected ? (
              <div className="py-8 text-center text-gray-500">
                Select a history record to view details
              </div>
            ) : (
              <div>
                

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 content-start">
                  <DetailItem
                    label="Post-Effective Date"
                    value={formatDate(selected.EPP_Date)}
                    icon={Calendar}
                  />
                  <DetailItem
                    label="Joining Date"
                    value={formatDate(selected.Join_Date)}
                    icon={Calendar}
                  />
                  <DetailItem
                    label="Employee Type"
                    value={getEmpType(selected)}
                    icon={Hash}
                  />
                  <DetailItem
                    label="Employee Status"
                    value={getEmpStatus(selected)}
                    icon={Users}
                  />
                  <DetailItem
                    label="Department"
                    value={getDepartments(selected)}
                    icon={Building2}
                  />
                  <DetailItem
                    label="Designation"
                    value={getDesignation(selected)}
                    icon={Briefcase}
                  />
                  <DetailItem
                    label="Grade"
                    value={getGrade(selected)}
                    icon={Award}
                  />
                  <DetailItem
                    label="Pay Band"
                    value={getPayBand(selected)}
                    icon={TrendingUp}
                  />
                  <DetailItem
                    label="Basic Pay"
                    value={formatCurrency(selected.Basic)}
                    icon={DollarSign}
                  />
                  <DetailItem
                    label="Pay Bill"
                    value={getPayBill(selected)}
                    icon={CreditCard}
                  />
                  <DetailItem
                    label="City Grade"
                    value={getCityGrade(selected)}
                    icon={Flag}
                  />
                  <DetailItem
                    label="Week Off Pattern"
                    value={getWeekOff(selected)}
                    icon={CalendarDays}
                  />
                  <DetailItem
                    label="CPF/NPS"
                    value={getCpfNps(selected.CPF_NPS)}
                    icon={DollarSign}
                  />
                  <DetailItem
                    label="NPS %"
                    value={
                      selected.NPS_PERCENT != null
                        ? `${selected.NPS_PERCENT}%`
                        : "-"
                    }
                  />
                  <DetailItem label="DA" value={convertToYesNo(selected.DA)} />
                  <DetailItem
                    label="HRA"
                    value={convertToYesNo(selected.HRA)}
                  />
                  <DetailItem
                    label="CLA"
                    value={convertToYesNo(selected.CLA)}
                  />
                  <DetailItem label="MA" value={convertToYesNo(selected.MA)} />
                  <DetailItem label="TA" value={convertToYesNo(selected.TA)} />
                  <DetailItem
                    label="NPA"
                    value={convertToYesNo(selected.NPA)}
                  />
                  <DetailItem
                    label="Created"
                    value={formatDateTime(selected.created_at)}
                  />
                  <DetailItem
                    label="Updated"
                    value={formatDateTime(selected.updated_at)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryEmpProfileUpdate;

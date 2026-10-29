import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  User,
  Calendar,
  Briefcase,
  Award,
  CheckCircle,
  XCircle,
  Building2,
  DollarSign,
  Hash,
  CreditCard,
  TrendingUp,
  Percent,
  Home,
  History,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmployeeProfileApi from "../../../services/employeeprofileapi";

const ListEmpProfileUpdate = ({ user }) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortField, setSortField] = useState("EPP_Date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Employee Profile Update");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  });

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );
      const currentPath = "/masters/employee-records/emp-profile-update";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [currentPage]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await EmployeeProfileApi.getAll(params);

      if (response.success) {
        const data = response.data.data || [];
        console.log("API Response Data:", data);
        setProfiles(data);
        setPagination({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || itemsPerPage,
          total: response.data.total || 0,
          from: response.data.from || 0,
          to: response.data.to || 0,
        });

        // Calculate stats
        const active = data.filter(
          (p) => p.Is_Active == true || p.Is_Active == 1
        ).length;
        setStats({
          total: data.length,
          active: active,
        });
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadProfiles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSort = (field) => {
    const newDirection =
      sortField == field && sortDirection == "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...profiles].sort((a, b) => {
      const aValue = a[field] ?? "";
      const bValue = b[field] ?? "";

      if (newDirection == "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setProfiles(sorted);
  };

  const handleDelete = async (EPP_Id, employeeInfo) => {
    const employeeDisplay = employeeInfo?.Emp_Code
      ? `${employeeInfo.Emp_Code} - ${employeeInfo.First_Name || ""} ${
          employeeInfo.Last_Name || ""
        }`.trim()
      : `Employee #${employeeInfo?.Emp_Id}`;

    const result = await Swal.fire({
      title: "Delete Employee Profile?",
      text: `Are you sure you want to delete this profile for ${employeeDisplay}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await EmployeeProfileApi.delete(EPP_Id);
        toast.success("Employee profile deleted successfully!");
        loadProfiles();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete employee profile"
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedItems.length} selected items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedItems.map((id) => EmployeeProfileApi.delete(id))
        );
        toast.success(`${selectedItems.length} items deleted successfully!`);
        setSelectedItems([]);
        loadProfiles();
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some items");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to get employee display name (NO IDs shown)
  const getEmployeeDisplay = (item) => {
    if (item.employee) {
      const emp = item.employee;
      const firstName = emp.First_Name || "";
      const lastName = emp.Last_Name || "";
      const empCode = emp.Emp_Code || "";

      if (empCode && (firstName || lastName)) {
        return `${empCode} - ${firstName} ${lastName}`.trim();
      } else if (empCode) {
        return empCode;
      } else if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    return "N/A";
  };

  // Helper function to get designation display (NO IDs shown)
  const getDesignationDisplay = (item) => {
    // Check if designation data is nested in the response
    if (item.designation) {
      // Try Dsg_Desc first, then Dsg_Title, then Dsg_EName
      if (item.designation.Dsg_Desc) {
        return item.designation.Dsg_Desc;
      }
      if (item.designation.Dsg_Title) {
        return item.designation.Dsg_Title;
      }
      if (item.designation.Dsg_EName) {
        return item.designation.Dsg_EName;
      }
      return "-";
    }

    // Check if designation data is directly in the item
    if (item.Dsg_Desc) {
      return item.Dsg_Desc;
    }
    if (item.Dsg_Title) {
      return item.Dsg_Title;
    }
    if (item.Dsg_EName) {
      return item.Dsg_EName;
    }

    return "-";
  };

  // Helper function to get department display (returns object with both languages) - NO IDs
  const getDepartmentDisplay = (item) => {
    // Try to get department from nested relationship
    if (item.department) {
      const dept = item.department;

      // Get Gujarati name (Dpt_Desc) and English name (Dpt_Name)
      const gujaratiName = dept.Dpt_Desc || "";
      const englishName = dept.Dpt_Name || dept.name || "";

      return {
        gujarati: gujaratiName,
        english: englishName,
      };
    }

    // Try to get department from department_master
    if (item.department_master) {
      const dept = item.department_master;

      const gujaratiName = dept.Dpt_Desc || "";
      const englishName = dept.Dpt_Name || "";

      return {
        gujarati: gujaratiName,
        english: englishName,
      };
    }

    // Check if department data is directly in the item
    if (item.Dpt_Desc || item.Dpt_Name) {
      return {
        gujarati: item.Dpt_Desc || "",
        english: item.Dpt_Name || "",
      };
    }

    // Check if it's in a dpt_master object
    if (item.dpt_master) {
      const dept = item.dpt_master;

      const gujaratiName = dept.Dpt_Desc || "";
      const englishName = dept.Dpt_Name || "";

      return {
        gujarati: gujaratiName,
        english: englishName,
      };
    }

    return {
      gujarati: "-",
      english: "-",
    };
  };

  // Helper function to get grade display (NO IDs)
  const getGradeDisplay = (item) => {
    if (item.grade) {
      const grade = item.grade;
      const gradeName = grade.EGM_Name || "";

      if (gradeName) {
        return gradeName;
      }
    }

    if (item.EGM_Name) {
      return item.EGM_Name;
    }

    return "-";
  };

  // Helper function to get pay band display (NO IDs)
  const getPayBandDisplay = (item) => {
    if (item.pay_band) {
      return item.pay_band.PB_Code || "-";
    }

    if (item.payband && item.payband.PB_Code) {
      return item.payband.PB_Code;
    }

    return "-";
  };

  // Helper function to get basic pay display (NO IDs)
  const getBasicPayDisplay = (item) => {
    // If Basic is a direct amount
    if (item.Basic && !isNaN(item.Basic) && parseFloat(item.Basic) > 1000) {
      return formatCurrency(item.Basic);
    }

    // If Basic is an ID, try to get from pay_matrix
    if (item.pay_matrix && item.pay_matrix.Basic_Pay) {
      return formatCurrency(item.pay_matrix.Basic_Pay);
    }

    // If pay_matrix is in different format
    if (item.paymatrix && item.paymatrix.Basic_Pay) {
      return formatCurrency(item.paymatrix.Basic_Pay);
    }

    // If grade has payband with basic info
    if (item.grade && item.grade.payband && item.grade.payband.Min_Pay) {
      return `${formatCurrency(item.grade.payband.Min_Pay)} - ${formatCurrency(
        item.grade.payband.Max_Pay
      )}`;
    }

    return "-";
  };

  // FIXED: Helper function to get pay bill display - Now matches ViewEmpProfileUpdate
  const getPayBillDisplay = (item) => {
    // Try to get from payroll_bill relationship (as in ViewEmpProfileUpdate)
    if (item.payroll_bill) {
      const payBill = item.payroll_bill;
      const billCode = payBill.PayBill_Code || "";
      const description = payBill.Description || "";

      if (billCode && description) {
        return `${billCode} - ${description}`;
      } else if (billCode) {
        return billCode;
      } else if (description) {
        return description;
      }
    }

    // Try pay_bill relationship
    if (item.pay_bill) {
      const payBill = item.pay_bill;
      const billCode = payBill.PayBill_Code || "";
      const description = payBill.Description || "";

      if (billCode && description) {
        return `${billCode} - ${description}`;
      } else if (billCode) {
        return billCode;
      } else if (description) {
        return description;
      }
    }

    // Try paybill (alternate format)
    if (item.paybill) {
      const payBill = item.paybill;
      const billCode = payBill.PayBill_Code || "";
      const description = payBill.Description || "";

      if (billCode && description) {
        return `${billCode} - ${description}`;
      } else if (billCode) {
        return billCode;
      } else if (description) {
        return description;
      }
    }

    // If PBillNo exists, show bill number
    if (item.PBillNo) {
      return `Bill #${item.PBillNo}`;
    }

    return "-";
  };

  // Helper function to get city grade display (NO IDs)
  const getCityGradeDisplay = (item) => {
    if (item.city_grade) {
      const cityGrade = item.city_grade;
      const cityName = cityGrade.City_Name || "";
      const grade = cityGrade.Grade || "";

      if (cityName && grade) {
        return `${cityName} - ${grade}`;
      } else if (cityName) {
        return cityName;
      } else if (grade) {
        return grade;
      }
    }

    if (item.citygrade && item.citygrade.City_Name) {
      return item.citygrade.City_Name;
    }

    return "-";
  };

  // Helper function to get increment month
  const getIncrementMonth = (item) => {
    return item.IncMonth || "-";
  };

  // Helper function to get CPF/NPS display
  const getCpfNpsDisplay = (item) => {
    const types = {
      G: "GPF",
      N: "NPS",
      C: "CPF",
    };
    return types[item.CPF_NPS] || "-";
  };

  // Helper function to get NPS percentage
  const getNpsPercent = (item) => {
    if (item.NPS_PERCENT) {
      return `${item.NPS_PERCENT}%`;
    }
    return "-";
  };

  // Helper function to get fix HRA amount
  const getFixHraAmount = (item) => {
    if (item.FixHRA && parseFloat(item.FixHRA) > 100) {
      return formatCurrency(item.FixHRA);
    }
    return "-";
  };

  // Helper function to get HBA interest
  const getHbaInterest = (item) => {
    if (item.HBAINT) {
      return `${item.HBAINT}%`;
    }
    return "-";
  };

  // Helper function to get MCA interest
  const getMcaInterest = (item) => {
    if (item.MCAINT) {
      return `${item.MCAINT}%`;
    }
    return "-";
  };

  // Helper function to get employee type display (NO IDs)
  const getEmpTypeDisplay = (item) => {
    if (item.employee_type) {
      return item.employee_type.ETy_Name || "-";
    }

    if (item.ETy_Name) {
      return item.ETy_Name;
    }

    return "-";
  };

  // Helper function to get employee status display (NO IDs)
  const getEmpStatusDisplay = (item) => {
    if (item.employee_status) {
      return item.employee_status.Est_Name || "-";
    }

    if (item.Est_Name) {
      return item.Est_Name;
    }

    return "-";
  };

  // Helper function to get allowances summary (NO IDs)
  const getAllowancesSummary = (item) => {
    const allowances = [];
    if (item.DA == 1 || item.DA == true) allowances.push("DA");
    if (item.HRA == 1 || item.HRA == true) allowances.push("HRA");
    if (item.CLA == 1 || item.CLA == true) allowances.push("CLA");
    if (item.MA == 1 || item.MA == true) allowances.push("MA");
    if (item.TA == 1 || item.TA == true) allowances.push("TA");
    if (item.NPA == 1 || item.NPA == true) allowances.push("NPA");
    if (item.GPF == 1 || item.GPF == true) allowances.push("GPF");
    if (item.HBA == 1 || item.HBA == true) allowances.push("HBA");
    if (item.MCA == 1 || item.MCA == true) allowances.push("MCA");
    if (item.FOOD == 1 || item.FOOD == true) allowances.push("FOOD");
    if (item.FEST == 1 || item.FEST == true) allowances.push("FEST");
    if (item.IR == 1 || item.IR == true) allowances.push("IR");

    return allowances.length > 0 ? allowances.join(", ") : "-";
  };

  const StatCard = ({ title, value, icon: Icon, color, subValue }) => {
    const colors = {
      blue: {
        bg: "from-blue-500 to-blue-600",
        light: "bg-blue-50",
        border: "border-blue-200",
        iconBg: "bg-blue-500",
      },
      green: {
        bg: "from-green-500 to-green-600",
        light: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-500",
      },
    }[color];

    return (
      <div
        className={`bg-white rounded-xl border ${colors.border} p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subValue && <p className="text-sm text-gray-600">{subValue}</p>}
          </div>
          <div
            className={`${colors.iconBg} text-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              Manage employee profile updates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/masters/employee-records/emp-profile-update/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add Profile Update
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, code, or designation..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProfiles}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedItems.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedItems.length} item(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                      checked={
                        selectedItems.length == profiles.length &&
                        profiles.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(profiles.map((item) => item.EPP_Id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Join Date
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Grade
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Basic Pay
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Pay Bill
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last-Effective Date
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading employee profiles...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : profiles.length > 0 ? (
                profiles.map((item) => {
                  const employeeDisplay = getEmployeeDisplay(item);
                  const designationDisplay = getDesignationDisplay(item);
                  const departmentDisplay = getDepartmentDisplay(item);

                  // Get values for columns
                  const gradeDisplay = getGradeDisplay(item);
                  const basicPayDisplay = getBasicPayDisplay(item);
                  const payBillDisplay = getPayBillDisplay(item);
                  const cityGradeDisplay = getCityGradeDisplay(item);
                  const incrementMonth = getIncrementMonth(item);
                  const cpfNpsDisplay = getCpfNpsDisplay(item);
                  const npsPercent = getNpsPercent(item);
                  const fixHraAmount = getFixHraAmount(item);
                  const hbaInterest = getHbaInterest(item);
                  const mcaInterest = getMcaInterest(item);
                  const allowancesSummary = getAllowancesSummary(item);

                  return (
                    <tr
                      key={item.EPP_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons") &&
                          !e.target.closest("a")
                        ) {
                          navigate(
                            `/masters/employee-records/emp-profile-update/view/${item.EPP_Id}`
                          );
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                            checked={selectedItems.includes(item.EPP_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([
                                  ...selectedItems,
                                  item.EPP_Id,
                                ]);
                              } else {
                                setSelectedItems(
                                  selectedItems.filter(
                                    (id) => id != item.EPP_Id
                                  )
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employeeDisplay}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {getEmpTypeDisplay(item)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(item.Join_Date)}
                          </span>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <div>
                            <span className="text-sm text-gray-900 block font-medium">
                              {departmentDisplay.gujarati || "-"}
                            </span>
                            {departmentDisplay.english && (
                              <span className="text-xs text-gray-500 block mt-0.5">
                                {departmentDisplay.english}
                              </span>
                            )}
                          </div>
                        </div>
                      </td> */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {designationDisplay}
                          </span>
                        </div>
                      </td>
                      {/* Grade Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {gradeDisplay}
                          </span>
                        </div>
                      </td>
                      {/* Basic Pay Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {basicPayDisplay}
                          </span>
                        </div>
                      </td>
                      {/* Pay Bill Column - FIXED */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {payBillDisplay}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatDate(item.EPP_Date)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/masters/employee-records/emp-profile-update/history/${item.Emp_Id}`
                              )
                            }
                            className="mt-1 inline-flex items-center self-start px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                            title="View profile history"
                          >
                            <History className="h-3 w-3 mr-1" />
                            {item.history_count ?? 1}
                          </button>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/employee-records/emp-profile-update/view/${item.EPP_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/employee-records/emp-profile-update/edit/${item.EPP_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(item.EPP_Id, item.employee)
                            }
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No profiles found"
                          : "No employee profiles yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No profiles match your search criteria. Try adjusting your search term."
                          : "Get started by adding an employee profile update."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/employee-records/emp-profile-update/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Profile Update
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {profiles.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              items
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {Array.from(
              { length: Math.min(5, pagination.last_page) },
              (_, i) => {
                let pageNum;
                if (pagination.last_page <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.last_page - 2) {
                  pageNum = pagination.last_page - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage == pageNum
                        ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
              }
              disabled={currentPage == pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListEmpProfileUpdate;

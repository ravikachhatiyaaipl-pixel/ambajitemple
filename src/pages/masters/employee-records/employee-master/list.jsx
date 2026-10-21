import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmployeeMasterApi from "../../../services/employeemasterapi";

const EmployeeMasterList = ({ user }) => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [sortField, setSortField] = useState("Emp_Id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Employee Master");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );
      const currentPath = "/masters/employee-records/employee-master";
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load employees when debounced search term changes
  useEffect(() => {
    setCurrentPage(1);
    loadEmployees();
  }, [debouncedSearchTerm, sortField, sortDirection, filterStatus]);

  // Load employees when page changes
  useEffect(() => {
    loadEmployees();
  }, [currentPage]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        sort_field: sortField,
        sort_direction: sortDirection,
        status: filterStatus != "all" ? filterStatus : undefined,
      };

      const response = await EmployeeMasterApi.getAll(params);

      if (response.status && response.data) {
        setEmployees(response.data.data || []);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to,
        });
      } else {
        toast.error(response.message || "Failed to load employees");
      }
    } catch (error) {
      toast.error("Failed to load employees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id, employeeName) => {
    const result = await Swal.fire({
      title: "Delete Employee?",
      text: `Are you sure you want to delete "${employeeName}"? This action cannot be undone.`,
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
        await EmployeeMasterApi.delete(id);
        toast.success(`Employee "${employeeName}" deleted successfully!`);
        loadEmployees();
      } catch (error) {
        toast.error("Failed to delete employee");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedEmployees.length} selected items?`,
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
          selectedEmployees.map((id) => EmployeeMasterApi.delete(id))
        );
        setSelectedEmployees([]);
        toast.success(
          `${selectedEmployees.length} items deleted successfully!`
        );
        loadEmployees();
      } catch (error) {
        toast.error("Failed to delete some items");
      }
    }
  };

  const handleRefresh = () => {
    loadEmployees();
    toast.success("Data refreshed successfully!");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
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
            <p className="text-gray-600 mt-1">Manage employees in the system</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/masters/employee-records/employee-master/create"
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Employee
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, email, phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {selectedEmployees.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedEmployees.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedEmployees.length} item(s) selected
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
                onClick={() => setSelectedEmployees([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                      checked={
                        selectedEmployees.length == employees.length &&
                        employees.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees(employees.map((e) => e.Emp_Id));
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Emp_Code")}
                >
                  <div className="flex items-center">
                    Employee Code
                    {sortField == "Emp_Code" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("First_Name")}
                >
                  <div className="flex items-center">
                    Name
                    {sortField == "First_Name" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Email_Id")}
                >
                  <div className="flex items-center">
                    Email
                    {sortField == "Email_Id" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Phone")}
                >
                  <div className="flex items-center">
                    Phone
                    {sortField == "Phone" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Is_Active")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField == "Is_Active" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
                      <p className="mt-4 text-gray-600">Loading employees...</p>
                    </div>
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((emp) => {
                  const fullName =
                    `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim() ||
                    "N/A";
                  return (
                    <tr
                      key={emp.Emp_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/employee-records/employee-master/view/${emp.Emp_Id}`
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
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                            checked={selectedEmployees.includes(emp.Emp_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees([
                                  ...selectedEmployees,
                                  emp.Emp_Id,
                                ]);
                              } else {
                                setSelectedEmployees(
                                  selectedEmployees.filter(
                                    (id) => id != emp.Emp_Id
                                  )
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {emp.Emp_Code || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 font-medium">
                          {fullName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {emp.Email_Id || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {emp.Phone || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(emp.Is_Active)}
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/employee-records/employee-master/view/${emp.Emp_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/employee-records/employee-master/edit/${emp.Emp_Id}`}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(emp.Emp_Id, fullName);
                            }}
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus != "all"
                          ? "No employees found"
                          : "No employees yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus != "all"
                          ? "No items match your search criteria. Try adjusting your search term or filters."
                          : "Get started by creating your first employee."}
                      </p>
                      {!searchTerm && filterStatus == "all" && (
                        <Link
                          to="/masters/employee-records/employee-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Employee
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

      {pagination.total > 0 && (
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
              disabled={pagination.current_page == 1}
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
                } else if (pagination.current_page <= 3) {
                  pageNum = i + 1;
                } else if (
                  pagination.current_page >=
                  pagination.last_page - 2
                ) {
                  pageNum = pagination.last_page - 4 + i;
                } else {
                  pageNum = pagination.current_page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      pagination.current_page == pageNum
                        ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-sm"
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
              disabled={pagination.current_page == pagination.last_page}
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

export default EmployeeMasterList;

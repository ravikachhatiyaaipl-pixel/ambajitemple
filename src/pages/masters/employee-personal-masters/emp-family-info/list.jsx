import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  User,
  Copy,
  Calendar,
  Phone,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Briefcase,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { FamilyInfoApi } from "../../../services/familyinfoapi";

const ListEmpFamilyInfo = ({ user }) => {
  const [familyInfo, setFamilyInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortField, setSortField] = useState("Member_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Family Information Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/employee-personal-masters/emp-family-info";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    loadFamilyInfo();
  }, [currentPage, searchTerm]);

  const loadFamilyInfo = async () => {
    setLoading(true);
    try {
      const result = await FamilyInfoApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      console.log("API Result:", result); // For debugging

      // Ensure result.data is always an array
      const dataArray = Array.isArray(result.data) ? result.data : [];

      setFamilyInfo(dataArray);
      setPagination(
        result.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: dataArray.length,
          from: dataArray.length > 0 ? 1 : 0,
          to: dataArray.length,
        },
      );
      setSelectedItems([]);
    } catch (error) {
      console.error("Error loading family information:", error);
      toast.error(error.message || "Failed to load family information");
      setFamilyInfo([]);
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

  const getSortedFamilyInfo = () => {
    if (!Array.isArray(familyInfo) || familyInfo.length == 0) {
      return [];
    }

    return [...familyInfo].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested objects for sorting
      if (sortField == "employee_name") {
        aVal = a.employee
          ? `${a.employee.First_Name} ${a.employee.Last_Name}`.trim()
          : "";
        bVal = b.employee
          ? `${b.employee.First_Name} ${b.employee.Last_Name}`.trim()
          : "";
      } else if (sortField == "relationship_name") {
        aVal = a.relationship?.Rela_Name || "";
        bVal = b.relationship?.Rela_Name || "";
      }

      if (aVal == null || aVal == undefined) return 1;
      if (bVal == null || bVal == undefined) return -1;

      if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleDelete = async (itemId, memberName) => {
    const result = await Swal.fire({
      title: "Delete Family Information?",
      text: `Are you sure you want to delete "${memberName}"? This action cannot be undone.`,
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
        await FamilyInfoApi.delete(itemId);
        toast.success(
          `Family information "${memberName}" deleted successfully!`,
        );
        await loadFamilyInfo();
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error(error.message || "Failed to delete family information");
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
      text: `Are you sure you want to delete ${selectedItems.length} selected family information records?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedItems.map((id) =>
          FamilyInfoApi.delete(id),
        );
        await Promise.all(deletePromises);
        toast.success(
          `${selectedItems.length} family information records deleted successfully!`,
        );
        await loadFamilyInfo();
        setSelectedItems([]);
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete some records");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const stats = {
    totalRecords: pagination.total || 0,
    activeRecords: Array.isArray(familyInfo)
      ? familyInfo.filter(
          (item) => item?.Is_Active == 1 || item?.Is_Active == true,
        ).length
      : 0,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page || 1,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getGenderBadgeColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "bg-blue-100 text-blue-800";
      case "female":
        return "bg-pink-100 text-pink-800";
      case "other":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEmployeeDisplay = (item) => {
    if (item.employee) {
      const emp = item.employee;
      const fullName = `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim();
      const empCode = emp.Emp_Code || "";

      if (fullName && empCode) {
        return (
          <div>
            <div className="font-medium text-gray-900">{fullName}</div>
            <div className="text-xs text-gray-500 flex items-center mt-1">              
              {empCode}
            </div>
          </div>
        );
      } else if (fullName) {
        return (
          <div>
            <div className="font-medium text-gray-900">{fullName}</div>
          </div>
        );
      } else if (empCode) {
        return (
          <div>
            <div className="font-medium text-gray-900">{empCode}</div>
          </div>
        );
      }
    }
    return <div className="text-gray-400">—</div>;
  };

  const getRelationshipDisplay = (item) => {
    if (item.relationship) {
      return (
        <span className="text-sm text-gray-900">
          {item.relationship.Rela_Name}
        </span>
      );
    }
    return <span className="text-gray-400">—</span>;
  };

  const sortedFamilyInfo = getSortedFamilyInfo();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/employee-personal-masters/emp-family-info/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Family Information
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by member name, phone, employee name, or relationship..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                loadFamilyInfo();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedItems.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedItems.length} record(s) selected
                </span>
                <p className="text-xs text-purple-600">
                  Choose an action for selected records
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Family Information Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                      checked={
                        Array.isArray(familyInfo) &&
                        familyInfo.length > 0 &&
                        selectedItems.length == familyInfo.length
                      }
                      onChange={(e) => {
                        if (e.target.checked && Array.isArray(familyInfo)) {
                          setSelectedItems(
                            familyInfo.map((c) => c.EFI_Id).filter(Boolean),
                          );
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Member_name")}
                >
                  <div className="flex items-center">
                    Member Name
                    {sortField == "Member_name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("employee_name")}
                >
                  <div className="flex items-center">
                    Employee
                    {sortField == "employee_name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("relationship_name")}
                >
                  <div className="flex items-center">
                    Relationship
                    {sortField == "relationship_name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Dob")}
                >
                  <div className="flex items-center">
                    Date of Birth
                    {sortField == "Dob" && (
                      <span className="ml-1 text-purple-600">
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
                      <span className="ml-1 text-purple-600">
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
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading family information...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : sortedFamilyInfo.length > 0 ? (
                sortedFamilyInfo.map((item) => (
                  <tr
                    key={item.EFI_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons") &&
                        item.EFI_Id
                      ) {
                        navigate(
                          `/masters/employee-personal-masters/emp-family-info/view/${item.EFI_Id}`,
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
                          className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                          checked={selectedItems.includes(item.EFI_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.EFI_Id]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter((id) => id != item.EFI_Id),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {item.Member_name?.charAt(0) || "F"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <User className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-150">
                              {item.Member_name || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getEmployeeDisplay(item)}</td>
                    <td className="px-6 py-4">
                      {getRelationshipDisplay(item)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {formatDate(item.Dob)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.Phone ? (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {item.Phone}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(item.Phone);
                            }}
                            className="ml-1 p-1 hover:bg-purple-50 rounded transition-colors"
                            title="Copy phone number"
                          >
                            <Copy className="h-3 w-3 text-gray-400 hover:text-purple-600" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/employee-personal-masters/emp-family-info/view/${item.EFI_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/employee-personal-masters/emp-family-info/edit/${item.EFI_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!item.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.EFI_Id, item.Member_name);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching family information found"
                          : "No family information found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first family member"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/employee-personal-masters/emp-family-info/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blur-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Family Member
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
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
              {pagination.total || 0} records
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage == page
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.last_page || 1, prev + 1),
                )
              }
              disabled={currentPage == (pagination.last_page || 1)}
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

export default ListEmpFamilyInfo;

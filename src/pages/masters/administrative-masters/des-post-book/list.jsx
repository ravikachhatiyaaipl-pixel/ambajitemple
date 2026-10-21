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
  Briefcase,
  Calendar,
  Copy,
  ArrowRight,
  Clock,
  Hash,
  Layers,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DesPostBookApi } from "../../../services/despostbookapi";

const ListDesPostBook = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [sortField, setSortField] = useState("Dpb_id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Designation Post Book");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/administrative-masters/des-post-book";
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
    loadEntries();
  }, [currentPage, searchTerm]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const result = await DesPostBookApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      setEntries(result.data || []);
      setPagination({
        current_page: result.meta.current_page || 1,
        last_page: result.meta.last_page || 1,
        per_page: result.meta.per_page || itemsPerPage,
        total: result.meta.total || 0,
        from: result.meta.from || 0,
        to: result.meta.to || 0,
      });

      setSelectedEntries([]);
    } catch (error) {
      toast.error(error.message || "Failed to load entries");
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

  const sortedEntries = [...entries].sort((a, b) => {
    let aVal, bVal;

    if (sortField == "designation") {
      aVal = a.designation?.Dsg_Desc || "";
      bVal = b.designation?.Dsg_Desc || "";
    } else if (sortField == "Perm_Post") {
      aVal = parseFloat(a.Perm_Post) || 0;
      bVal = parseFloat(b.Perm_Post) || 0;
    } else if (sortField == "Temp_Post") {
      aVal = parseFloat(a.Temp_Post) || 0;
      bVal = parseFloat(b.Temp_Post) || 0;
    } else if (sortField == "Total_Posts") {
      aVal = (parseFloat(a.Perm_Post) || 0) + (parseFloat(a.Temp_Post) || 0);
      bVal = (parseFloat(b.Perm_Post) || 0) + (parseFloat(b.Temp_Post) || 0);
    } else if (sortField == "Date") {
      aVal = a.Date || "";
      bVal = b.Date || "";
    } else if (sortField == "Noc_Reg") {
      aVal = a.Noc_Reg || "";
      bVal = b.Noc_Reg || "";
    } else if (sortField == "Periodic_Renewal") {
      aVal = parseInt(a.Periodic_Renewal, 10) || 0;
      bVal = parseInt(b.Periodic_Renewal, 10) || 0;
    } else {
      aVal = a[sortField];
      bVal = b[sortField];
    }

    if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDelete = async (entryId, designationName) => {
    const result = await Swal.fire({
      title: "Delete Entry?",
      text: `Are you sure you want to delete entry for "${designationName}"? This action cannot be undone.`,
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
        await DesPostBookApi.delete(entryId);
        await loadEntries();
        toast.success(`Entry deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete entry");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length == 0) {
      toast.error("No entries selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedEntries.length} selected entries?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        for (const id of selectedEntries) {
          await DesPostBookApi.delete(id);
        }
        await loadEntries();
        setSelectedEntries([]);
        toast.success(
          `${selectedEntries.length} entries deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some entries");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (value) => {
    if (!value && value != 0) return "—";
    return parseFloat(value).toFixed(2);
  };

  const formatAgeRange = (min, max) => {
    const hasMin = min != null && min != "";
    const hasMax = max != null && max != "";
    if (!hasMin && !hasMax) return "—";
    if (hasMin && hasMax) return `${min}–${max}`;
    if (hasMin) return `${min}+`;
    return `Up to ${max}`;
  };

  const getIndentedName = (designation) => {
    if (!designation) return "—";
    const level = parseInt(designation.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const displayName = designation.Dsg_Desc || designation.Dsg_Title || "";
    return `${indent}${displayName}`;
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
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              Manage designation post book entries
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/administrative-masters/des-post-book/create"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Entry
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
              placeholder="Search by designation..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                loadEntries();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEntries.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedEntries.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-indigo-800">
                  {selectedEntries.length} entry(s) selected
                </span>
                <p className="text-xs text-indigo-600">
                  Choose an action for selected entries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedEntries([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedEntries.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 focus:ring-offset-0"
                      checked={
                        selectedEntries.length == entries.length &&
                        entries.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntries(entries.map((m) => m.Dpb_id));
                        } else {
                          setSelectedEntries([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("designation")}
                >
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Designation
                    {sortField == "designation" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Perm_Post")}
                >
                  <div className="flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Permanent
                    {sortField == "Perm_Post" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Temp_Post")}
                >
                  <div className="flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Temporary
                    {sortField == "Temp_Post" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Total_Posts")}
                >
                  <div className="flex items-center">
                    <Layers className="h-3 w-3 mr-1" />
                    Total
                    {sortField == "Total_Posts" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Date")}
                >
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date
                    {sortField == "Date" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Noc_Reg")}
                >
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    NOC-Reg
                    {sortField == "Noc_Reg" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Excepted Age
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Periodic_Renewal")}
                >
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Renewal
                    {sortField == "Periodic_Renewal" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                      <p className="mt-4 text-gray-600">Loading entries...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedEntries.length > 0 ? (
                sortedEntries.map((entry) => {
                  const totalPosts =
                    (parseFloat(entry.Perm_Post) || 0) +
                    (parseFloat(entry.Temp_Post) || 0);

                  return (
                    <tr
                      key={entry.Dpb_id}
                      className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/administrative-masters/des-post-book/view/${entry.Dpb_id}`,
                          );
                        }
                      }}
                    >
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 focus:ring-offset-0"
                          checked={selectedEntries.includes(entry.Dpb_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries([
                                ...selectedEntries,
                                entry.Dpb_id,
                              ]);
                            } else {
                              setSelectedEntries(
                                selectedEntries.filter(
                                  (id) => id != entry.Dpb_id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {entry.designation?.Dsg_Desc?.charAt(0) || "D"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                              {entry.designation?.Dsg_Desc || "—"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Level: {entry.designation?.GrStt || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatNumber(entry.Perm_Post)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatNumber(entry.Temp_Post)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="text-sm font-bold text-purple-700">
                            {totalPosts.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(entry.Date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            entry.Noc_Reg == "Y"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {entry.Noc_Reg == "Y" ? "Yes (Y)" : "No (N)"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {formatAgeRange(
                            entry.Excepted_Age_Min,
                            entry.Excepted_Age_Max,
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {entry.Periodic_Renewal != null
                            ? entry.Periodic_Renewal == 99
                              ? "99 (None)"
                              : `${entry.Periodic_Renewal} yrs`
                            : "—"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/administrative-masters/des-post-book/view/${entry.Dpb_id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/administrative-masters/des-post-book/edit/${entry.Dpb_id}`}
                            className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {!entry.deleted_at && (
                            <button
                              onClick={() =>
                                handleDelete(
                                  entry.Dpb_id,
                                  entry.designation?.Dsg_Desc,
                                )
                              }
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching entries found"
                          : "No entries found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first designation post book entry"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/administrative-masters/des-post-book/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Entry
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
            {pagination.total || 0} items
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage == 1}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-900 font-medium">
            {currentPage}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
            }
            disabled={
              currentPage == pagination.last_page || pagination.last_page <= 1
            }
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListDesPostBook;

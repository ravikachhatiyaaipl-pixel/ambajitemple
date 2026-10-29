import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Hash,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  File,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LoanDocumentApi } from "../../../services/loandocumentapi";

const ListLoanDocument = ({ user }) => {
  const [loanDocuments, setLoanDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortField, setSortField] = useState("LD_Id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMandatory, setFilterMandatory] = useState("");
  const [filterOriginal, setFilterOriginal] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Loan Document Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/loan-management/loan-doc-master";
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
    loadLoanDocuments();
  }, [currentPage, searchTerm, filterStatus, filterMandatory, filterOriginal]);

  const loadLoanDocuments = async () => {
    setLoading(true);
    try {
      const result = await LoanDocumentApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      if (result.success) {
        let apiData = Array.isArray(result.data) ? result.data : [];

        // Apply status filter
        if (filterStatus != "") {
          apiData = apiData.filter(
            (item) =>
              item &&
              (filterStatus == "active"
                ? item.Is_Active == true
                : item.Is_Active == false),
          );
        }

        // Apply mandatory filter
        if (filterMandatory != "") {
          apiData = apiData.filter(
            (item) =>
              item &&
              (filterMandatory == "mandatory"
                ? item.Is_Mandatory == true
                : item.Is_Mandatory == false),
          );
        }

        // Apply original filter
        if (filterOriginal != "") {
          apiData = apiData.filter(
            (item) =>
              item &&
              (filterOriginal == "original"
                ? item.Is_Original == true
                : item.Is_Original == false),
          );
        }

        setLoanDocuments(apiData);
        setPagination(result.meta);
        setSelectedItems([]);
      } else {
        toast.error(result.message);
        setLoanDocuments([]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load loan documents");
      console.error(error);
      setLoanDocuments([]);
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

  const sortedLoanDocuments = [...loanDocuments].sort((a, b) => {
    if (!a || !b) return 0;
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal == "boolean") {
      return sortDirection == "asc"
        ? aVal == bVal
          ? 0
          : aVal
            ? -1
            : 1
        : aVal == bVal
          ? 0
          : aVal
            ? 1
            : -1;
    }

    if ((aVal || "") < (bVal || "")) return sortDirection == "asc" ? -1 : 1;
    if ((aVal || "") > (bVal || "")) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete Loan Document?",
      text: `Are you sure you want to delete "${name}"?`,
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
        const response = await LoanDocumentApi.delete(id);
        if (response.success) {
          await loadLoanDocuments();
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete loan document");
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
      text: `Are you sure you want to delete ${selectedItems.length} selected loan documents?`,
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
          LoanDocumentApi.delete(id),
        );
        const results = await Promise.all(deletePromises);
        const allSuccess = results.every((r) => r.success);

        if (allSuccess) {
          await loadLoanDocuments();
          setSelectedItems([]);
          toast.success(
            `${selectedItems.length} loan documents deleted successfully!`,
          );
        } else {
          toast.error("Failed to delete some items");
        }
      } catch (error) {
        toast.error("Failed to delete some items");
      }
    }
  };

  const stats = {
    total: pagination.total || 0,
    active: loanDocuments.filter((m) => m && m.Is_Active == true).length,
    inactive: loanDocuments.filter((m) => m && m.Is_Active == false).length,
    mandatory: loanDocuments.filter((m) => m && m.Is_Mandatory == true).length,
    optional: loanDocuments.filter((m) => m && m.Is_Mandatory == false).length,
  };

  const getStatusBadge = (status) => {
    return status ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getMandatoryBadge = (isMandatory) => {
    return isMandatory ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Mandatory
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Optional
      </span>
    );
  };

  const getOriginalBadge = (isOriginal) => {
    return isOriginal ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Original Required
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Copy Accepted
      </span>
    );
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterMandatory("");
    setFilterOriginal("");
    setSearchTerm("");
    setCurrentPage(1);
    loadLoanDocuments();
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
            to="/masters/loan-management/loan-doc-master/create"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Loan Document
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
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            {/* <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Filter className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
              Filters
            </button> */}
            <button
              onClick={clearFilters}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
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
                  {selectedItems.length} item(s) selected
                </span>
                <p className="text-xs text-purple-600">Choose an action</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loan Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    checked={
                      loanDocuments.length > 0 &&
                      selectedItems.length == loanDocuments.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(
                          loanDocuments.map((m) => m.LD_Id).filter(Boolean),
                        );
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("LD_Code")}
                >
                  <div className="flex items-center">
                    Code{" "}
                    {sortField == "LD_Code" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("LD_Name")}
                >
                  <div className="flex items-center">
                    Document Name{" "}
                    {sortField == "LD_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("loan_type.LT_Name")}
                >
                  <div className="flex items-center">
                    Loan Type{" "}
                    {sortField == "loan_type.LT_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Mandatory")}
                >
                  <div className="flex items-center">
                    Mandatory{" "}
                    {sortField == "Is_Mandatory" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Original")}
                >
                  <div className="flex items-center">
                    Original{" "}
                    {sortField == "Is_Original" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Active")}
                >
                  <div className="flex items-center">
                    Status{" "}
                    {sortField == "Is_Active" && (
                      <span className="ml-1 text-purple-600">
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Loading loan documents...
                    </p>
                  </td>
                </tr>
              ) : sortedLoanDocuments.length > 0 ? (
                sortedLoanDocuments.map(
                  (item) =>
                    item && (
                      <tr
                        key={item.LD_Id}
                        className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                        onClick={(e) => {
                          if (
                            !e.target.closest('input[type="checkbox"]') &&
                            !e.target.closest(".action-buttons")
                          ) {
                            navigate(
                              `/masters/loan-management/loan-doc-master/view/${item.LD_Id}`,
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
                            className="h-4 w-4 text-purple-600 rounded border-gray-300"
                            checked={selectedItems.includes(item.LD_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([
                                  ...selectedItems,
                                  item.LD_Id,
                                ]);
                              } else {
                                setSelectedItems(
                                  selectedItems.filter(
                                    (id) => id != item.LD_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-600">
                          {item.LD_Code || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-white font-semibold text-xs">
                                {item.LD_Name?.charAt(0) || "D"}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                                {item.LD_Name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="font-medium">
                            {item.loan_type?.LT_Name || "—"}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({item.loan_type?.LT_Code || ""})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getMandatoryBadge(item.Is_Mandatory)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getOriginalBadge(item.Is_Original)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.Is_Active)}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap action-buttons"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-1">
                            <Link
                              to={`/masters/loan-management/loan-doc-master/view/${item.LD_Id}`}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/masters/loan-management/loan-doc-master/edit/${item.LD_Id}`}
                              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            {!item.deleted_at && (
                              <button
                                onClick={() =>
                                  handleDelete(item.LD_Id, item.LD_Name)
                                }
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                )
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ||
                        filterStatus ||
                        filterMandatory ||
                        filterOriginal
                          ? "No matching loan documents found"
                          : "No loan documents found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm ||
                        filterStatus ||
                        filterMandatory ||
                        filterOriginal
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first loan document"}
                      </p>
                      {!searchTerm &&
                        !filterStatus &&
                        !filterMandatory &&
                        !filterOriginal && (
                          <Link
                            to="/masters/loan-management/loan-doc-master/create"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add First Loan
                            Document
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
          <span className="text-sm text-gray-700">
            Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
            {pagination.total || 0} loan documents
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListLoanDocument;

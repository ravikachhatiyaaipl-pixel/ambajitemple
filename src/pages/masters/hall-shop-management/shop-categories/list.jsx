import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Plus, Edit, Trash2, Eye, RefreshCw,
  ChevronLeft, ChevronRight, XCircle, FileText, ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopCategoryApi from "../../../services/shopcategoryapi";
import debounce from "lodash/debounce";

const ShopCategoryList = ({ user }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Estate Categories");
  const [pagination, setPagination] = useState({
    current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0,
  });

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/masters/hall-shop-management/shop-categories";
      const currentMenuItem = menuDetails.find((item) => item.Menu_Links == currentPath);
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => { setSearchDebounced(value); setCurrentPage(1); }, 500),
    [],
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  useEffect(() => { loadItems(); }, [currentPage, searchDebounced]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      const res = await ShopCategoryApi.getAll(params);
      const data = res?.data;
      setItems(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete ${pageTitle}?`,
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
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
      await ShopCategoryApi.delete(id);
      toast.success(`"${name}" deleted successfully!`);
      loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const renderPagination = () => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(pagination.last_page, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      {/* Header - Image 1 Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage shop categories</p>
          </div>
        </div>
        <Link
          to="/masters/hall-shop-management/shop-categories/create"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-md font-medium flex items-center transition-all shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {pageTitle}
        </Link>
      </div>

      {/* Action Bar - Image 1 Style */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={loadItems}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm font-medium transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Table - Image 1 Style */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                      <p className="mt-4 text-gray-600 text-sm">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.SPC_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={() => navigate(`/masters/hall-shop-management/shop-categories/view/${item.SPC_Id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">{item.SPC_Name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.SPC_Name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.SPC_Code ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {item.SPC_Code}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-3 text-gray-400">
                        <Link
                          to={`/masters/hall-shop-management/shop-categories/view/${item.SPC_Id}`}
                          className="hover:text-red-600 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/hall-shop-management/shop-categories/edit/${item.SPC_Id}`}
                          className="hover:text-red-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.SPC_Id, item.SPC_Name)}
                          className="hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-gray-300 mb-3" />
                      <h3 className="text-md font-semibold text-gray-900 mb-1">
                        {searchTerm ? "No matching records found" : "No records found"}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {searchTerm ? "Try adjusting your search" : "Get started by adding the first entry"}
                      </p>
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
          <div className="text-sm text-gray-600">
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Prev
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${currentPage == page ? "bg-red-600 text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={currentPage == pagination.last_page}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopCategoryList;
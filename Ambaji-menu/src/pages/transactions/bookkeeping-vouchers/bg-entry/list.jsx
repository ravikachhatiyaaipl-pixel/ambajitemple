import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  XCircle,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  Calendar,
  Hash,
  Building,
  File,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BgEntryApi from "../../../services/bgentryapi";

const STATUS_BADGE = {
  In: {
    label: "In",
    color: "bg-green-100 text-green-800",
    icon: ArrowDownLeft,
  },
  Out: {
    label: "Out",
    color: "bg-amber-100 text-amber-800",
    icon: ArrowUpRight,
  },
};

const formatDate = (str) => {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return str;
  }
};

const formatAmount = (val) => {
  if (val == null || val == "") return "—";
  return Number(val).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const EXPORT_HEADERS = [
  "Sr.",
  "Date",
  "Tender No",
  "Tender Name",
  "BG No",
  "Vendor Name",
  "Amount (₹)",
  "Document",
  "Status",
];

const mapExportRow = (item, idx, { numericAmount = false } = {}) => [
  idx + 1,
  formatDate(item.BGE_Date),
  item.Tender_No || "—",
  item.Tender_Name || "—",
  item.BG_No || "—",
  item.Vendor_Name || "—",
  numericAmount && item.Amount != null && item.Amount != ""
    ? Number(item.Amount)
    : formatAmount(item.Amount),
  item.document_url || item.Document ? "Yes" : "No",
  item.Status || "—",
];

const BgEntryList = ({ user }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("BG Entry");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/bookkeeping-vouchers/bg-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    [],
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    loadItems();
  }, [currentPage, searchDebounced, statusFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      if (statusFilter) params.Status = statusFilter;
      const res = await BgEntryApi.getAll(params);
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
      toast.error(error.response?.data?.message || "Failed to load BG entries");
    } finally {
      setLoading(false);
    }
  };

  const fetchExportRows = async () => {
    const params = {};
    if (searchDebounced) params.search = searchDebounced;
    if (statusFilter) params.Status = statusFilter;
    const res = await BgEntryApi.getAllForExport(params);
    const rows = Array.isArray(res?.data) ? res.data : [];
    if (!rows.length) {
      toast.error("No BG entries to export");
      return null;
    }
    return rows;
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const rows = await fetchExportRows();
      if (!rows) return;
      const sheetData = [
        EXPORT_HEADERS,
        ...rows.map((item, idx) =>
          mapExportRow(item, idx, { numericAmount: true }),
        ),
      ];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws["!cols"] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 16 },
        { wch: 36 },
        { wch: 18 },
        { wch: 24 },
        { wch: 16 },
        { wch: 12 },
        { wch: 10 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BG Entry");
      const stamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `BG_Entry_${stamp}.xlsx`);
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const rows = await fetchExportRows();
      if (!rows) return;
      const doc = new jsPDF("landscape", "mm", "a4");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(pageTitle || "BG Entry", 14, 15);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const filterLabel = statusFilter
        ? `Status: ${statusFilter}`
        : "Status: All";
      const searchLabel = searchDebounced
        ? `  |  Search: ${searchDebounced}`
        : "";
      doc.text(`${filterLabel}${searchLabel}`, 14, 22);
      doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 27);
      doc.text(`Total records: ${rows.length}`, 14, 32);

      autoTable(doc, {
        head: [EXPORT_HEADERS],
        body: rows.map((item, idx) => mapExportRow(item, idx)),
        startY: 36,
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          6: { halign: "right" },
          7: { halign: "center" },
          8: { halign: "center" },
        },
      });

      const stamp = new Date().toISOString().slice(0, 10);
      doc.save(`BG_Entry_${stamp}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id, bgNo) => {
    const result = await Swal.fire({
      title: "Delete BG Entry?",
      text: `Are you sure you want to delete BG No. "${bgNo}"? This action cannot be undone.`,
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
      await BgEntryApi.delete(id);
      toast.success("BG Entry deleted successfully!");
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

  const hasActiveFilters = !!searchTerm || !!statusFilter;
  const basePath = "/transactions/bookkeeping-vouchers/bg-entry";

  return (
    <div className="p-6">
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
            <p className="text-gray-500 text-sm mt-0.5">
              Track bank guarantees received (In) and returned (Out)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download Excel"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </button>
          <Link
            to={`${basePath}/create`}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New BG Entry
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by BG No, tender, vendor..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white">
              {[
                { value: "", label: "All" },
                { value: "In", label: "In" },
                { value: "Out", label: "Out" },
              ].map((opt) => (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    statusFilter == opt.value
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center text-sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
            <button
              onClick={loadItems}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tender No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tender Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  BG No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading BG entries...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => {
                  const badge = STATUS_BADGE[item.Status] || STATUS_BADGE.In;
                  const StatusIcon = badge.icon;
                  const docUrl = item.document_url || item.Document;
                  return (
                    <tr
                      key={item.BGE_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                      onClick={(e) => {
                        if (!e.target.closest(".action-buttons")) {
                          navigate(`${basePath}/view/${item.BGE_Id}`);
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(item.BGE_Date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-mono">
                          <Hash className="h-3 w-3 mr-1" />
                          {item.Tender_No || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-700">
                          {item.Tender_Name || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900 font-mono">
                          {item.BG_No}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900">
                            {item.Vendor_Name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.Amount != null && item.Amount != ""
                            ? "₹ " + formatAmount(item.Amount)
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                            title="View document"
                          >
                            <File className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {badge.label}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`${basePath}/view/${item.BGE_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`${basePath}/edit/${item.BGE_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(item.BGE_Id, item.BG_No)
                            }
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching BG entries found"
                          : "No BG entries found"}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "Get started by adding the first bank guarantee entry"}
                      </p>
                      {!hasActiveFilters && (
                        <Link
                          to={`${basePath}/create`}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New BG Entry
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

      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
            entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${currentPage == page ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
              }
              disabled={currentPage == pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

export default BgEntryList;

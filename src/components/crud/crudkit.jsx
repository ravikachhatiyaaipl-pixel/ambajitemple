import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  Search,
  XCircle,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

/**
 * Common CRUD design kit.
 * Structure is taken from Estate Rent Application (shop-rent-application/list.jsx):
 *   Header (back + title + Add) -> Action bar (search + refresh) -> Table card -> Pagination
 * Brand colour lives in ONE place (BRAND) so the whole project can be switched at once.
 */
export const BRAND = {
  gradient:
    "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
  gradientActive: "bg-gradient-to-r from-red-600 to-red-700",
  ring: "focus:ring-red-500",
  spinner: "border-red-600",
  avatar: "bg-gradient-to-r from-red-500 to-red-700",
  hoverText: "group-hover:text-red-700",
};

/* ---------- hooks / helpers ---------- */

// Page title comes from the menu (same as Estate Rent Application), with a fallback.
export const usePageTitle = (path, fallback) => {
  const [title, setTitle] = useState(fallback);
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const item = menuDetails.find((m) => m.Menu_Links == path);
      if (item?.Fnc_Title) setTitle(item.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, [path]);
  return title;
};

// For APIs that return a plain array: same pagination object as the server-paginated lists.
export const useClientPagination = (items, perPage = 10) => {
  const [page, setPage] = useState(1);
  const lastPage = Math.max(1, Math.ceil(items.length / perPage));

  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * perPage, page * perPage),
    [items, page, perPage]
  );

  const pagination = {
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total: items.length,
    from: items.length ? (page - 1) * perPage + 1 : 0,
    to: Math.min(page * perPage, items.length),
  };

  return { page, setPage, pageItems, pagination };
};

export const confirmDelete = async ({ title = "Delete?", text }) => {
  const result = await Swal.fire({
    title,
    text: `${text} This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete!",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

/* ---------- list page parts ---------- */

export const CrudPageHeader = ({ title, subtitle, addLabel, onAdd, backTo = "/dashboard" }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center">
        <button onClick={() => navigate(backTo)} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowRight className="h-5 w-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className={`${BRAND.gradient} text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group`}
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          {addLabel}
        </button>
      )}
    </div>
  );
};

export const CrudActionBar = ({ value, onChange, onClear, onRefresh, placeholder = "Search..." }) => (
  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 ${BRAND.ring} focus:border-transparent`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          Refresh
        </button>
      )}
    </div>
  </div>
);

export const CrudTable = ({
  columns,
  loading,
  isEmpty,
  searching,
  emptyNoun = "records",
  addLabel,
  onAdd,
  children,
}) => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${BRAND.spinner}`} />
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searching ? `No matching ${emptyNoun} found` : `No ${emptyNoun} found`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searching ? "Try adjusting your search" : `Get started by adding the first one`}
                  </p>
                  {!searching && onAdd && (
                    <button
                      onClick={onAdd}
                      className={`inline-flex items-center px-5 py-2.5 ${BRAND.gradient} text-white font-medium rounded-lg transition-all shadow-sm`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {addLabel}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// First-column cell: round icon avatar + title + sub line (as in Estate Rent "Business" column)
export const NameCell = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center">
    <div className={`h-9 w-9 rounded-full ${BRAND.avatar} flex items-center justify-center shadow-sm mr-3`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <div className={`text-sm font-semibold text-gray-900 ${BRAND.hoverText} transition-colors`}>{title}</div>
      {sub && <div className="text-xs text-gray-500 max-w-xs truncate">{sub}</div>}
    </div>
  </div>
);

export const RowActions = ({ onView, onEdit, onDelete }) => (
  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
    {onView && (
      <button
        onClick={onView}
        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
    )}
    {onEdit && (
      <button
        onClick={onEdit}
        className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </button>
    )}
    {onDelete && (
      <button
        onClick={onDelete}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    )}
  </div>
);

export const StatusBadge = ({ active, onClick }) => {
  const cls = active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  const content = (
    <>
      {active ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
      {active ? "Active" : "Inactive"}
    </>
  );
  const base = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`;
  return onClick ? (
    <button onClick={onClick} className={base} title="Click to toggle status">
      {content}
    </button>
  ) : (
    <span className={base}>{content}</span>
  );
};

export const CrudPagination = ({ pagination, onPage }) => {
  if (!pagination || pagination.last_page <= 1) return null;
  const current = pagination.current_page;
  const pages = [];
  const max = 5;
  let start = Math.max(1, current - Math.floor(max / 2));
  let end = Math.min(pagination.last_page, start + max - 1);
  if (end - start + 1 < max) start = Math.max(1, end - max + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  const navBtn =
    "px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
      <div className="text-sm text-gray-700">
        Showing {pagination.from} to {pagination.to} of {pagination.total} entries
      </div>
      <div className="flex items-center space-x-1">
        <button onClick={() => onPage(Math.max(1, current - 1))} disabled={current == 1} className={navBtn}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              current == p
                ? `${BRAND.gradientActive} text-white shadow-sm`
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.min(pagination.last_page, current + 1))}
          disabled={current == pagination.last_page}
          className={navBtn}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

/* ---------- full-page form parts (Add / Edit) ----------
 * Same structure as Estate add/edit pages (e.g. hall-category/addedit.jsx):
 * Header (back + title) -> white card with fields -> Cancel / Save footer.
 * CrudModal is kept as an alias so existing pages keep working unchanged.
 */

export const CrudFormPage = ({ title, subtitle, onClose, onSubmit, saving, submitLabel = "Save", children }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <button type="button" onClick={onClose} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-4">{children}</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className={`px-6 py-2.5 text-sm ${BRAND.gradient} text-white rounded-lg flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const CrudModal = CrudFormPage;

export const CrudViewPage = ({ title, subtitle, onClose, closeLabel = "Close", children }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <button type="button" onClick={onClose} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-4">{children}</div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
        >
          <X className="h-4 w-4 mr-2" />
          {closeLabel}
        </button>
      </div>
    </div>
  </div>
);

export const Field = ({ label, required, children }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-gray-700">
      {label}
      {required && " *"}
    </label>
    {children}
  </div>
);

export const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100";

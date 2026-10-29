import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Plus, Edit, Trash2, Eye, RefreshCw, ChevronLeft, ChevronRight,
  XCircle, FileText, ArrowRight, Landmark,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";
import FdRegisterApi from "../../../services/fdregisterapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/fd-register";
const STATUS_BADGE = {
  Active: "bg-green-100 text-green-800",
  Matured: "bg-blue-100 text-blue-800",
  Closed: "bg-gray-100 text-gray-800",
};
const formatAmt = (val) =>
  "₹ " + (parseFloat(val) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatDate = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const FdRegisterList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("FD Register");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });

  useEffect(() => {
    try {
      const menu = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const item = menu.find((m) => m.Menu_Links == BASE_PATH);
      if (item?.Fnc_Title) setPageTitle(item.Fnc_Title);
    } catch (_) {}
  }, []);

  const debouncedSearch = useCallback(debounce((v) => { setSearchDebounced(v); setCurrentPage(1); }, 500), []);
  useEffect(() => { loadItems(); }, [currentPage, searchDebounced, statusFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      if (statusFilter) params.Status = statusFilter;
      const res = await FdRegisterApi.getAll(params);
      const data = res?.data;
      setItems(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        from: data?.from || 0,
        to: data?.to || 0,
        total: data?.total || 0,
      });
    } catch (_) {
      toast.error("Failed to load FD register");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Delete FD record?",
      text: `Delete FD No. "${row.FDR_No}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      await FdRegisterApi.delete(row.FDR_Id);
      toast.success("Deleted");
      loadItems();
    } catch (_) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="mr-4 text-gray-500"><ArrowRight className="h-5 w-5 rotate-180" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Investment / Fixed Deposit register (standalone records)</p>
          </div>
        </div>
        <Link to={`${BASE_PATH}/create`} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center">
          <Plus className="h-4 w-4 mr-2" />New FD
        </Link>
      </div>

      <div className="bg-gray-50 border rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            className="w-full pl-10 pr-10 py-2.5 bg-white border rounded-lg text-sm"
            placeholder="Search FD no, bank..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); debouncedSearch(e.target.value); }}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(""); setSearchDebounced(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-white border rounded-lg text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Matured">Matured</option>
          <option value="Closed">Closed</option>
        </select>
        <button onClick={loadItems} className="px-4 py-2.5 bg-white border rounded-lg flex items-center text-sm">
          <RefreshCw className="h-4 w-4 mr-2" />Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">FD No</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Bank</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Maturity</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="7" className="px-6 py-12 text-center">Loading...</td></tr>
            ) : items.length ? items.map((row) => (
              <tr key={row.FDR_Id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`${BASE_PATH}/view/${row.FDR_Id}`)}>
                <td className="px-6 py-3 text-sm font-mono font-semibold">{row.FDR_No}</td>
                <td className="px-6 py-3 text-sm">{formatDate(row.FDR_Date)}</td>
                <td className="px-6 py-3 text-sm">
                  <span className="inline-flex items-center gap-1"><Landmark className="h-3.5 w-3.5 text-gray-400" />{row.Bank_Name}</span>
                  {row.Branch_Name && <p className="text-xs text-gray-400 ml-5">{row.Branch_Name}</p>}
                </td>
                <td className="px-6 py-3 text-sm text-right font-semibold">{formatAmt(row.Amount)}</td>
                <td className="px-6 py-3 text-sm">{formatDate(row.Maturity_Date)}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[row.Status] || STATUS_BADGE.Active}`}>{row.Status}</span>
                </td>
                <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Link to={`${BASE_PATH}/view/${row.FDR_Id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye className="h-4 w-4" /></Link>
                    <Link to={`${BASE_PATH}/edit/${row.FDR_Id}`} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
                    <button onClick={() => handleDelete(row)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No FD records</p>
                  <Link to={`${BASE_PATH}/create`} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="h-4 w-4 mr-2" />New FD</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination.last_page > 1 && (
        <div className="flex justify-between mt-4 text-sm">
          <span>Showing {pagination.from} to {pagination.to} of {pagination.total}</span>
          <div className="flex gap-1">
            <button disabled={currentPage == 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={currentPage == pagination.last_page} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FdRegisterList;

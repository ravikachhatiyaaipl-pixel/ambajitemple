import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Plus, Eye, RefreshCw, ArrowRight, MapPin, IndianRupee, FileText, XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import ZoneCollectionApi from "../../../services/zonecollectionapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/zone-wise-collection";
const formatAmt = (val) =>
  "₹ " + (parseFloat(val) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ZoneCollectionList = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fyId, setFyId] = useState("");
  const [years, setYears] = useState([]);
  const [pageTitle, setPageTitle] = useState("Zone Wise Collection");

  useEffect(() => {
    try {
      const menu = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const item = menu.find((m) => m.Menu_Links == BASE_PATH);
      if (item?.Fnc_Title) setPageTitle(item.Fnc_Title);
    } catch (_) {}
    loadYears();
  }, []);

  useEffect(() => { loadSummary(); }, [fyId]);

  const loadYears = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/fy-master`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      const list = res.data?.data || [];
      setYears(list);
      const current = list.find((y) => y.is_current_year);
      if (current) setFyId(String(current.FY_Id));
    } catch (_) {}
  };

  const loadSummary = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fyId) params.FY_Id = fyId;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await ZoneCollectionApi.summary(params);
      setRows(res?.data || []);
      setGrandTotal(res?.grand_total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load zone collection");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows.filter((r) => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.toLowerCase();
    return (r.Zon_Name || "").toLowerCase().includes(t) || (r.Zon_Code || "").toLowerCase().includes(t);
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">One row per zone with total collection</p>
          </div>
        </div>
        <Link
          to={`${BASE_PATH}/create`}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Link>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search zone..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
          <select
            value={fyId}
            onChange={(e) => setFyId(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm min-w-[200px]"
          >
            <option value="">All Financial Years</option>
            {years.map((y) => (
              <option key={y.FY_Id} value={y.FY_Id}>{y.FY_Name || y.FY_Code}</option>
            ))}
          </select>
          <button onClick={loadSummary} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center text-sm">
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Zone</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Entries</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Total Collection</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-4 text-gray-600">Loading...</p>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((row) => (
                <tr
                  key={row.Zon_Id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`${BASE_PATH}/zone/${row.Zon_Id}${fyId ? `?fy=${fyId}` : ""}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{row.Zon_Name || "—"}</p>
                        {row.Zon_Code && <p className="text-xs text-gray-400 font-mono">{row.Zon_Code}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">{row.Entry_Count}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">{formatAmt(row.Total_Collection)}</span>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`${BASE_PATH}/zone/${row.Zon_Id}${fyId ? `?fy=${fyId}` : ""}`}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg inline-flex"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No zone collection records</p>
                  <Link to={`${BASE_PATH}/create`} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <Plus className="h-4 w-4 mr-2" />Add Collection
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
          {!loading && filtered.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900" colSpan="2">Grand Total</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-blue-700">
                  <span className="inline-flex items-center justify-end gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {formatAmt(filtered.reduce((s, r) => s + (parseFloat(r.Total_Collection) || 0), 0) || grandTotal).replace("₹ ", "")}
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ZoneCollectionList;

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Landmark, IndianRupee } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ZoneCollectionApi from "../../../services/zonecollectionapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/zone-wise-collection";
const formatAmt = (val) =>
  "₹ " + (parseFloat(val) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatDate = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const ZoneCollectionZoneView = () => {
  const { zonId } = useParams();
  const [searchParams] = useSearchParams();
  const fyId = searchParams.get("fy") || "";
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneName, setZoneName] = useState("Zone");

  useEffect(() => { loadItems(); }, [zonId, fyId]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { Zon_Id: zonId, per_page: 100, page: 1 };
      if (fyId) params.FY_Id = fyId;
      const res = await ZoneCollectionApi.getAll(params);
      const rows = res?.data?.data || [];
      setItems(rows);
      if (rows[0]?.zone?.Zon_Name) setZoneName(rows[0].zone.Zon_Name);
    } catch (_) {
      toast.error("Failed to load zone entries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Delete entry?",
      text: "This collection entry will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      await ZoneCollectionApi.delete(row.ZC_Id);
      toast.success("Deleted");
      loadItems();
    } catch (_) {
      toast.error("Failed to delete");
    }
  };

  const total = items.reduce((s, r) => s + (parseFloat(r.Amount) || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(BASE_PATH)} className="mr-4 text-gray-500"><ArrowLeft className="h-5 w-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{zoneName}</h1>
            <p className="text-sm text-gray-500">Collection entries · Total {formatAmt(total)}</p>
          </div>
        </div>
        <Link to={`${BASE_PATH}/create`} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" />Add
        </Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Financial Year</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Payment Mode</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading...</td></tr>
            ) : items.length ? items.map((row) => (
              <tr key={row.ZC_Id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm"><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gray-400" />{formatDate(row.ZC_Date)}</span></td>
                <td className="px-6 py-3 text-sm">{row.financial_year?.FY_Name || row.financial_year?.FY_Code || "—"}</td>
                <td className="px-6 py-3 text-sm"><span className="inline-flex items-center gap-1"><Landmark className="h-3.5 w-3.5 text-gray-400" />{row.payment_mode?.PayMd_Name || "—"}</span></td>
                <td className="px-6 py-3 text-sm text-right font-semibold">{formatAmt(row.Amount)}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-1">
                    <Link to={`${BASE_PATH}/edit/${row.ZC_Id}`} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
                    <button onClick={() => handleDelete(row)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No entries for this zone</td></tr>
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-6 py-3 text-sm font-semibold">Total</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-blue-700">
                  <span className="inline-flex items-center justify-end gap-1"><IndianRupee className="h-4 w-4" />{formatAmt(total).replace("₹ ", "")}</span>
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

export default ZoneCollectionZoneView;

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Package,
  IndianRupee,
  Scale,
  Loader2,
  Building2,
  Calendar,
  X,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DonationApi from "../../services/donationapi";

/**
 * S15 - DONATION STORAGE ALLOCATION
 *
 * Approved (28) donations jinka storage allocate nahi hua - uske liye
 * vault / locker allocate karo.
 */
const DonationStorageAllocation = ({ user }) => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    location_id: "",
    allocated_date: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await DonationApi.getTransactions({
        status: 28,
        per_page: 200,
      });
      const list = res?.data?.data || [];
      // jinka storage allocate nahi hua
      const allocRes = await DonationApi.getAllocations({ per_page: 200 });
      const allocatedIds = (allocRes?.data?.data || []).map(
        (a) => a.transaction_id
      );
      setRows(list.filter((t) => !allocatedIds.includes(t.transaction_id)));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    DonationApi.getDonationStorages()
      .then((r) => setLocations(r?.data?.data || r?.data || []))
      .catch(() => {});
  }, []);

  const handleAllocate = async () => {
    if (!form.location_id) return toast.error("Select a storage location");
    if (!form.allocated_date) return toast.error("Allocation date is required");

    setSaving(true);
    try {
      const res = await DonationApi.allocateStorage(modal.transaction_id, {
        location_id: Number(form.location_id),
        allocated_date: form.allocated_date,
        remarks: form.remarks,
      });
      if (res?.success === false) {
        toast.error(res.message || "Allocation failed");
        return;
      }
      toast.success("Storage allocated successfully");
      setModal(null);
      setForm({
        location_id: "",
        allocated_date: new Date().toISOString().slice(0, 10),
        remarks: "",
      });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Allocation failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const t = search.trim().toLowerCase();
    return `${r.receipt_no} ${r.donor?.donor_name || ""} ${
      r.category?.category_name || ""
    }`
      .toLowerCase()
      .includes(t);
  });

  const totalValue = rows.reduce(
    (s, r) => s + Number(r.valuation_amount || 0),
    0
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Donation Storage Allocation
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Approved donations - vault / locker me storage allocate karo
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          ["Pending Allocation", rows.length, "text-amber-600"],
          [
            "Total Value",
            `-${totalValue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}`,
            "text-emerald-600",
          ],
          [
            "Total Weight (g)",
            rows
              .reduce((s, r) => s + Number(r.weight_in_gram || 0), 0)
              .toFixed(3),
            "text-blue-600",
          ],
          ["Locations", locations.length, "text-indigo-600"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by receipt, donor or category..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Receipt",
                  "Category",
                  "Donation Date",
                  "Donor",
                  "Weight",
                  "Valuation",
                  "Current Location",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr
                    key={r.transaction_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm mr-3">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-mono font-semibold text-gray-900">
                          {r.receipt_no}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.category?.category_name || "--"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {String(r.donation_date).slice(0, 10)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.donor?.donor_name || "--"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Scale className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {Number(r.weight_in_gram || 0).toFixed(3)} g
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      -
                      {Number(r.valuation_amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.storageLocation?.location_name || "--"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setModal(r);
                          setForm({
                            location_id: r.storage_location_id || "",
                            allocated_date: new Date()
                              .toISOString()
                              .slice(0, 10),
                            remarks: "",
                          });
                        }}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                      >
                        Allocate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">
                    No approved donations pending for storage allocation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Storage Allocation
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {modal.receipt_no}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Donor</span>
                  <span className="font-medium text-gray-900">
                    {modal.donor?.donor_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span className="font-medium text-gray-900">
                    {Number(modal.weight_in_gram || 0).toFixed(4)} g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Valuation</span>
                  <span className="font-medium text-gray-900">
                    -
                    {Number(modal.valuation_amount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.location_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location_id: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">-- select --</option>
                  {locations.map((l) => (
                    <option key={l.location_id} value={l.location_id}>
                      {l.location_name} ({l.location_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Allocated Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.allocated_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, allocated_date: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  rows={2}
                  value={form.remarks}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, remarks: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setModal(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocate}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Allocate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationStorageAllocation;

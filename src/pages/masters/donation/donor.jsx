import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ArrowLeft,
  RefreshCw,
  Phone,
  User,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DonationApi from "../../services/donationapi";
import DonationFormPage, {
  donationInputCls,
  donationLabelCls,
} from "./DonationFormPage";

/**
 * S08 - DONATION DONOR MASTER
 * - Phone se search (auto-fill)
 * - Donor-wise donation history
 */
const DonationDonorMaster = ({ user }) => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState("");
  const [history, setHistory] = useState(null);
  const [docTypes, setDocTypes] = useState([]);

  const [form, setForm] = useState({
    donor_name: "",
    donor_phone: "",
    donor_email: "",
    donor_address: "",
    donor_pan: "",
    id_proof_type_id: "",
    id_proof_no: "",
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await DonationApi.getDonors({ per_page: 200 });
      const list = res?.data?.data || res?.data || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    DonationApi.getDocumentTypes()
      .then((r) => setDocTypes(r?.data?.data || r?.data || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setForm({
      donor_name: "",
      donor_phone: "",
      donor_email: "",
      donor_address: "",
      donor_pan: "",
      id_proof_type_id: "",
      id_proof_no: "",
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormError("");
    setForm({
      donor_name: row.donor_name || "",
      donor_phone: row.donor_phone || "",
      donor_email: row.donor_email || "",
      donor_address: row.donor_address || "",
      donor_pan: row.donor_pan || "",
      id_proof_type_id: row.id_proof_type_id || "",
      id_proof_no: row.id_proof_no || "",
      is_active: !!row.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.donor_name.trim()) return setFormError("Donor name is required");
    if (!form.donor_phone.trim())
      return setFormError("Donor phone is required");

    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form };
      if (editing) payload.id = editing.donor_id;

      const res = editing
        ? await DonationApi.updateDonor(payload)
        : await DonationApi.createDonor(payload);

      if (res?.success === false) {
        setFormError(res.message || "Save failed");
        return;
      }
      toast.success(editing ? "Donor updated" : "Donor created");
      setShowForm(false);
      load();
    } catch (e) {
      const errs = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e.response?.data?.message;
      setFormError(errs || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this donor?")) return;
    try {
      const res = await DonationApi.deleteDonor(row.donor_id);
      if (res?.success === false) {
        toast.error(res.message || "Delete failed");
        return;
      }
      toast.success("Donor deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const openHistory = async (row) => {
    try {
      const res = await DonationApi.getDonorDonations(row.donor_id);
      setHistory({ donor: res?.donor || row, rows: res?.data || [] });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load history");
    }
  };

  const filtered = rows.filter((r) => {
    if (!query.trim()) return true;
    const t = query.trim().toLowerCase();
    return `${r.donor_name} ${r.donor_phone} ${r.donor_pan || ""} ${
      r.donor_email || ""
    }`
      .toLowerCase()
      .includes(t);
  });

  if (showForm) {
    const setField = (name) => (e) =>
      setForm((p) => ({ ...p, [name]: e.target.value }));

    return (
      <DonationFormPage
        title={editing ? "Edit Donor" : "Add Donor"}
        subtitle={
          editing
            ? "Update the record details"
            : "Fill in the details to create a new record"
        }
        detailsTitle="Donor Details"
        onBack={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel={editing ? "Update Donor" : "Save Donor"}
        error={formError}
      >
        <div>
          <label className={donationLabelCls}>
            Donor Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.donor_name}
            onChange={setField("donor_name")}
            className={donationInputCls}
          />
        </div>
        <div>
          <label className={donationLabelCls}>
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            value={form.donor_phone}
            onChange={setField("donor_phone")}
            className={donationInputCls}
          />
          <p className="mt-1 text-xs text-gray-400">
            Unique - yahi phone entry form me auto-fill hota hai
          </p>
        </div>
        <div>
          <label className={donationLabelCls}>Email</label>
          <input
            value={form.donor_email}
            onChange={setField("donor_email")}
            className={donationInputCls}
          />
        </div>
        <div>
          <label className={donationLabelCls}>PAN</label>
          <input
            value={form.donor_pan}
            onChange={(e) =>
              setForm((p) => ({ ...p, donor_pan: e.target.value.toUpperCase() }))
            }
            className={`${donationInputCls} font-mono`}
          />
        </div>
        <div>
          <label className={donationLabelCls}>ID Proof Type</label>
          <select
            value={form.id_proof_type_id}
            onChange={setField("id_proof_type_id")}
            className={donationInputCls}
          >
            <option value="">-- select --</option>
            {docTypes.map((d) => (
              <option key={d.doctype_id} value={d.doctype_id}>
                {d.doctype_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={donationLabelCls}>ID Proof No</label>
          <input
            value={form.id_proof_no}
            onChange={setField("id_proof_no")}
            className={donationInputCls}
          />
        </div>
        <div className="md:col-span-2">
          <label className={donationLabelCls}>Address</label>
          <textarea
            value={form.donor_address}
            onChange={setField("donor_address")}
            rows={2}
            className={donationInputCls}
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) =>
                setForm((p) => ({ ...p, is_active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            Active
          </label>
        </div>
      </DonationFormPage>
    );
  }

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Donation Donor Master
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Donor records and donor-wise donation history
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={load}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm font-medium transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-md font-medium flex items-center transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Donor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          ["Total Donors", rows.length, "text-gray-900"],
          [
            "Active",
            rows.filter((r) => r.is_active).length,
            "text-emerald-600",
          ],
          [
            "With PAN",
            rows.filter((r) => r.donor_pan).length,
            "text-blue-600",
          ],
          [
            "With Id Proof",
            rows.filter((r) => r.id_proof_no).length,
            "text-amber-600",
          ],
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

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or PAN..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Donor Name", "Phone", "Email", "PAN", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr
                    key={r.donor_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {r.donor_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm mr-3">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {r.donor_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {r.donor_address
                              ? String(r.donor_address).slice(0, 40)
                              : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {r.donor_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.donor_email || "--"}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">
                      {r.donor_pan || "--"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openHistory(r)}
                          className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          title="Donation history"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                    No donors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donor history modal */}
      {history && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Donation History
                </h3>
                <p className="text-xs text-gray-500">
                  {history.donor?.donor_name}  - {history.donor?.donor_phone}
                </p>
              </div>
              <button
                onClick={() => setHistory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4">
              {history.rows.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No donations yet for this donor.
                </p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Receipt", "Date", "Category", "Weight (g)", "Valuation"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.rows.map((t) => (
                      <tr key={t.transaction_id} className="text-sm">
                        <td className="px-3 py-2 font-mono text-blue-600">
                          {t.receipt_no}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {String(t.donation_date).slice(0, 10)}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {t.category?.category_name}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {Number(t.weight_in_gram).toFixed(4)}
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          Rs.{" "}
                          {Number(t.valuation_amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDonorMaster;

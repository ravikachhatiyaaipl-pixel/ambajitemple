import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Loader2,
  X,
  Link2,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * CENTRAL DOCUMENT MAPPING
 *
 * Module ke hisaab se document map karo:
 *   SEVA     -> seva service
 *   DONATION -> donation category
 *   ESTATE   -> estate (shop) item
 */
const DocumentMapping = ({ user }) => {
  const navigate = useNavigate();

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const MODULES = [
    { value: "SEVA", label: "Seva / Booking Services" },
    { value: "DONATION", label: "Donation Management" },
    { value: "ESTATE", label: "Estate Management" },
  ];

  const [module, setModule] = useState("DONATION");
  const [rows, setRows] = useState([]);
  const [refs, setRefs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    ref_id: "",
    document_id: "",
    is_required: false,
    sort_order: 0,
    is_active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mapRes, refRes, docRes] = await Promise.all([
        axios.get(`${base}/document/mappings`, {
          params: { module },
          headers,
        }),
        axios.get(`${base}/document/references`, {
          params: { module },
          headers,
        }),
        axios.get(`${base}/document/master`, {
          params: { module },
          headers,
        }),
      ]);

      setRows(mapRes.data?.data || []);
      setRefs(refRes.data?.data || []);
      setDocs(docRes.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load mappings");
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setForm({
      ref_id: "",
      document_id: "",
      is_required: false,
      sort_order: rows.length + 1,
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setFormError("");
    setForm({
      ref_id: m.ref_id,
      document_id: m.document_id,
      is_required: !!m.is_required,
      sort_order: m.sort_order ?? 0,
      is_active: !!m.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.ref_id) return setFormError("Select the item");
    if (!form.document_id) return setFormError("Select the document");

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        module,
        ref_id: Number(form.ref_id),
        document_id: Number(form.document_id),
        is_required: form.is_required,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (editing) payload.id = editing.mapping_id;

      const res = editing
        ? await axios.put(`${base}/document/mappings`, payload, { headers })
        : await axios.post(`${base}/document/mappings`, payload, { headers });

      if (res.data?.success === false) {
        setFormError(res.data.message || "Save failed");
        return;
      }
      toast.success(
        editing ? "Mapping updated successfully" : "Mapping created successfully"
      );
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

  const handleDelete = async (m) => {
    if (!window.confirm("Remove this mapping?")) return;
    try {
      const res = await axios.delete(`${base}/document/mappings`, {
        data: { id: m.mapping_id },
        headers,
      });
      if (res.data?.success === false) {
        toast.error(res.data.message || "Delete failed");
        return;
      }
      toast.success("Mapping removed");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const refName = (id) =>
    refs.find((r) => String(r.ref_id) === String(id))?.ref_name || `#${id}`;

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelCls = "mb-1 block text-xs font-medium text-gray-700";

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
            <h1 className="text-2xl font-bold text-gray-900">Document Mapping</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Central mapping - kaunsa document kis module/item par lagega
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={load}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Mapping
          </button>
        </div>
      </div>

      {/* Module filter */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {MODULES.map((m) => (
            <button
              key={m.value}
              onClick={() => setModule(m.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                module === m.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
              }`}
            >
              {m.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-500">
            {rows.length} mapping(s) · {docs.length} document(s) available
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "#",
                  "Module",
                  "Item (Service / Category / Estate)",
                  "Document",
                  "Required",
                  "Sort",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
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
              ) : rows.length > 0 ? (
                rows.map((m) => (
                  <tr
                    key={m.mapping_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {m.mapping_id}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {m.module}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {refName(m.ref_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {m.document_name}
                          </p>
                          <p className="font-mono text-[10px] text-gray-500">
                            {m.document_code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          m.is_required
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.is_required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {m.sort_order}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          m.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
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
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">
                    No mappings for this module.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">
                {editing ? "Edit Mapping" : "Add Mapping"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Module</label>
                <input
                  value={
                    MODULES.find((m) => m.value === module)?.label || module
                  }
                  disabled
                  className={`${inputCls} bg-gray-50`}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Item <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.ref_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ref_id: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="">-- select --</option>
                  {refs.map((r) => (
                    <option key={r.ref_id} value={r.ref_id}>
                      {r.ref_name}
                      {r.ref_sub ? ` (${r.ref_sub})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Document <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.document_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, document_id: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="">-- select --</option>
                  {docs.map((d) => (
                    <option key={d.document_id} value={d.document_id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sort_order: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-5 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.is_required}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, is_required: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Required
                </label>
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
            </div>

            {formError && (
              <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex gap-3 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : editing ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentMapping;

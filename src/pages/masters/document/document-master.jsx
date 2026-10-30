import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  X,
  ArrowLeft,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * CENTRAL DOCUMENT MASTER
 *
 * Ek hi jagah se document define karo:
 *   SEVA     - seva booking ke documents
 *   DONATION - gold / silver / diamond donation ke documents
 *   ESTATE   - estate (shop) ke documents
 *   ALL      - sab modules me use hone wale
 *
 * Code automatically generate hota hai (name se).
 */
const DocumentMaster = ({ user }) => {
  const navigate = useNavigate();

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const MODULES = [
    { value: "ALL", label: "All Modules" },
    { value: "SEVA", label: "Seva / Booking Services" },
    { value: "DONATION", label: "Donation Management" },
    { value: "ESTATE", label: "Estate Management" },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("ALL");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    module: "ALL",
    is_required: false,
    accepts_multiple: false,
    file_types: "jpg,jpeg,png,pdf",
    max_size_kb: 5120,
    sort_order: 0,
    is_active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base}/document/master`, {
        params: { module },
        headers,
      });
      if (res.data?.success) setRows(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load documents");
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
      name: "",
      description: "",
      module,
      is_required: false,
      accepts_multiple: false,
      file_types: "jpg,jpeg,png,pdf",
      max_size_kb: 5120,
      sort_order: rows.length + 1,
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setFormError("");
    setForm({
      name: d.name || "",
      description: d.description || "",
      module: d.module || "ALL",
      is_required: !!d.is_required,
      accepts_multiple: !!d.accepts_multiple,
      file_types: d.file_types || "jpg,jpeg,png,pdf",
      max_size_kb: d.max_size_kb ?? 5120,
      sort_order: d.sort_order ?? 0,
      is_active: !!d.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Document name is required");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        module: form.module,
        is_required: form.is_required,
        accepts_multiple: form.accepts_multiple,
        file_types: form.file_types.trim() || null,
        max_size_kb: Number(form.max_size_kb) || 5120,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (editing) payload.id = editing.document_id;

      const res = editing
        ? await axios.put(`${base}/document/master`, payload, { headers })
        : await axios.post(`${base}/document/master`, payload, { headers });

      if (res.data?.success === false) {
        setFormError(res.data.message || "Save failed");
        return;
      }
      toast.success(
        editing ? "Document updated successfully" : "Document created successfully"
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

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete document "${d.name}"?`)) return;
    try {
      const res = await axios.delete(`${base}/document/master`, {
        data: { id: d.document_id },
        headers,
      });
      if (res.data?.success === false) {
        toast.error(res.data.message || "Delete failed");
        return;
      }
      toast.success("Document deleted successfully");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const filtered = rows.filter((r) => {
    if (!query.trim()) return true;
    const t = query.trim().toLowerCase();
    return `${r.code} ${r.name} ${r.description || ""} ${r.module}`
      .toLowerCase()
      .includes(t);
  });

  const moduleBadge = (m) => {
    const map = {
      SEVA: "bg-blue-100 text-blue-700",
      DONATION: "bg-amber-100 text-amber-700",
      ESTATE: "bg-emerald-100 text-emerald-700",
      ALL: "bg-gray-100 text-gray-700",
    };
    const label = MODULES.find((x) => x.value === m)?.label || m;
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          map[m] || map.ALL
        }`}
      >
        {label}
      </span>
    );
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelCls = "mb-1 block text-xs font-medium text-gray-700";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Master</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Central document master - Seva, Donation aur Estate sab yahin se
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
            <Plus className="h-4 w-4" /> Add Document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          ["Total Documents", rows.length, "text-gray-900"],
          [
            "Seva",
            rows.filter((r) => r.module === "SEVA").length,
            "text-blue-600",
          ],
          [
            "Donation",
            rows.filter((r) => r.module === "DONATION").length,
            "text-amber-600",
          ],
          [
            "Mandatory",
            rows.filter((r) => r.is_required).length,
            "text-red-600",
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

      {/* Action bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code, name or module..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          >
            {MODULES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
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
                  "Code (auto)",
                  "Document Name",
                  "Module",
                  "File Types",
                  "Max Size",
                  "Required",
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((d) => (
                  <tr
                    key={d.document_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {d.document_id}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-blue-600">
                        {d.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {d.name}
                          </p>
                          {d.description && (
                            <p className="text-xs text-gray-500">
                              {d.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{moduleBadge(d.module)}</td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {d.file_types || "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {d.max_size_kb ? `${d.max_size_kb} KB` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.is_required
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.is_required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {d.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d)}
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
                  <td colSpan="9" className="px-6 py-12 text-center text-sm text-gray-500">
                    No documents found.
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
                {editing ? "Edit Document" : "Add Document"}
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
                <label className={labelCls}>
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Donor PAN Card"
                  className={inputCls}
                />
                <p className="mt-1 text-[10px] text-gray-500">
                  Code will be auto-generated based on the name
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Module</label>
                <select
                  value={form.module}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, module: e.target.value }))
                  }
                  className={inputCls}
                >
                  {MODULES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Max File Size (KB)</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_size_kb}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, max_size_kb: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>File Types</label>
                <input
                  value={form.file_types}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, file_types: e.target.value }))
                  }
                  placeholder="jpg,jpeg,png,pdf"
                  className={inputCls}
                />
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
                  Mandatory document
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.accepts_multiple}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        accepts_multiple: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Multiple files allowed
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

export default DocumentMaster;

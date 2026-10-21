import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  X,
  Layers,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SevaCategoryMaster = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    service_kind: "",
    description: "",
    icon: "",
    sort_order: 0,
    is_active: true,
  });

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [catRes, kindRes] = await Promise.all([
        axios.get(`${base}/seva/categories`, { headers }),
        axios.get(`${base}/seva/kinds`, { headers }),
      ]);
      if (catRes.data?.success) setRows(catRes.data.data || []);
      if (kindRes.data?.success) setKinds(kindRes.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.code} ${r.name} ${r.service_kind || ""} ${r.description || ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      ),
    [rows, query]
  );

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: "",
      name: "",
      service_kind: kinds[0]?.code || "",
      description: "",
      icon: "",
      sort_order: rows.length + 1,
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      code: r.code || "",
      name: r.name || "",
      service_kind: r.service_kind || "",
      description: r.description || "",
      icon: r.icon || "",
      sort_order: r.sort_order ?? 0,
      is_active: !!r.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Code and Name are required");
      return;
    }
    if (!form.service_kind) {
      toast.error("Select a Service Kind");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        service_kind: form.service_kind,
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };

      if (editing) {
        await axios.put(`${base}/seva/categories/${editing.category_id}`, payload, {
          headers,
        });
        toast.success("Category updated");
      } else {
        await axios.post(`${base}/seva/categories`, payload, { headers });
        toast.success("Category created");
      }
      setShowForm(false);
      fetchAll();
    } catch (e) {
      const errs = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e.response?.data?.message;
      toast.error(errs || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete category "${r.name}"?`)) return;
    try {
      await axios.delete(`${base}/seva/categories/${r.category_id}`, { headers });
      toast.success("Category deleted");
      fetchAll();
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Delete failed (may be in use)"
      );
    }
  };

  const toggleActive = async (r) => {
    try {
      await axios.put(
        `${base}/seva/categories/${r.category_id}`,
        { is_active: !r.is_active },
        { headers }
      );
      toast.success(r.is_active ? "Deactivated" : "Activated");
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seva Category Master</h1>
          <p className="text-sm text-gray-500">
            Group seva services into categories (Maha Pooja, Yagna, Bhog, Thaal…)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories"
              className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total Categories", rows.length, "text-gray-900"],
          ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
          ["Inactive", rows.filter((r) => !r.is_active).length, "text-red-600"],
          ["Service Kinds", kinds.length, "text-blue-600"],
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Code", "Category Name", "Service Kind", "Icon", "Sort", "Used By", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r, idx) => (
                <tr key={r.category_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-800">
                      {r.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    {r.description && (
                      <p className="max-w-xs truncate text-xs text-gray-500">
                        {r.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                      {r.service_kind || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.icon || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        r.services_count > 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.services_count || 0} service
                      {r.services_count === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(r)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        r.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.is_active ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {r.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No categories found.
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
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">
                {editing ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    disabled={!!editing}
                    placeholder="MAHAPOOJA"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Service Kind *
                  </label>
                  <select
                    value={form.service_kind}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, service_kind: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">— select —</option>
                    {kinds.map((k) => (
                      <option key={k.kind_id} value={k.code}>
                        {k.name} ({k.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Category Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Maha Pooja"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Icon (lucide name)
                  </label>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                    placeholder="Flame"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Sort order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sort_order: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_active: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Active
              </label>
            </div>

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
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SevaCategoryMaster;
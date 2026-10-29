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
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CrudFormPage } from "../../../../components/crud/crudkit";

const SevaDocumentMaster = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    is_required: false,
    accepts_multiple: false,
    file_types: "jpg,jpeg,png,pdf",
    max_size_kb: 5120,
    sort_order: 0,
    is_active: true,
  });

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${base}/seva/documents`, { headers });
      if (res.data?.success) setRows(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load documents");
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
        `${r.code} ${r.name} ${r.description || ""}`
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
      description: "",
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
    setForm({
      code: d.code || "",
      name: d.name || "",
      description: d.description || "",
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
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Code and Name are required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        is_required: form.is_required,
        accepts_multiple: form.accepts_multiple,
        file_types: form.file_types.trim() || null,
        max_size_kb: Number(form.max_size_kb) || 5120,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };

      if (editing) {
        await axios.put(
          `${base}/seva/documents/${editing.document_id}`,
          payload,
          { headers }
        );
        toast.success("Document updated");
      } else {
        await axios.post(`${base}/seva/documents`, payload, { headers });
        toast.success("Document created");
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

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete document "${d.name}"?`)) return;
    try {
      await axios.delete(`${base}/seva/documents/${d.document_id}`, { headers });
      toast.success("Document deleted");
      fetchAll();
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Delete failed (mapped with services)"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (showForm) {
    return (
      <CrudFormPage
        title={editing ? "Edit Document" : "Add Document"}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel={editing ? "Update" : "Create"}
      >
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
                placeholder="AADHAAR"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase disabled:bg-gray-100"
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

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Document Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Aadhaar Card"
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
                Allowed file types
              </label>
              <input
                value={form.file_types}
                onChange={(e) =>
                  setForm((p) => ({ ...p, file_types: e.target.value }))
                }
                placeholder="jpg,jpeg,png,pdf"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Max size (KB)
              </label>
              <input
                type="number"
                min="1"
                value={form.max_size_kb}
                onChange={(e) =>
                  setForm((p) => ({ ...p, max_size_kb: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                ["is_required", "Mandatory (devotee must upload)"],
                ["accepts_multiple", "Allow multiple files"],
                ["is_active", "Active"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-xs text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
      </CrudFormPage>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Seva Document Master
          </h1>
          <p className="text-sm text-gray-500">
            Document types devotees can upload (Aadhaar, ID proof, photo…)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total Documents", rows.length, "text-gray-900"],
          [
            "Active",
            rows.filter((r) => r.is_active).length,
            "text-emerald-600",
          ],
          [
            "Required",
            rows.filter((r) => r.is_required).length,
            "text-amber-600",
          ],
          [
            "Used by Services",
            rows.filter((r) => (r.services_count || 0) > 0).length,
            "text-blue-600",
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  "Code",
                  "Document Name",
                  "Required?",
                  "Multiple",
                  "File Types",
                  "Max Size",
                  "Used By",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r, idx) => (
                <tr key={r.document_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-800">
                      {r.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {r.name}
                    </p>
                    {r.description && (
                      <p className="max-w-[16rem] truncate text-[11px] text-gray-500">
                        {r.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.is_required ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        <AlertCircle className="h-3 w-3" /> Required
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.accepts_multiple ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {r.file_types || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {r.max_size_kb ? `${r.max_size_kb} KB` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                      {r.services_count || 0} service
                      {r.services_count === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        r.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        title="Delete"
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
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SevaDocumentMaster;
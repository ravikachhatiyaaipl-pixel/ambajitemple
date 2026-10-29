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
  Link2,
  FileText,
  Layers,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const SevaDocumentMapping = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [services, setServices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [svcFilter, setSvcFilter] = useState("");

  const [form, setForm] = useState({
    service_id: "",
    document_ids: [],
    is_required: false,
    sort_order: 0,
    is_active: true,
  });

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [mapRes, svcRes, docRes] = await Promise.all([
        axios.get(`${base}/seva/document-mappings`, { headers }),
        axios.get(`${base}/seva/services?per_page=200`, { headers }),
        axios.get(`${base}/seva/documents`, { headers }),
      ]);
      if (mapRes.data?.success) setRows(mapRes.data.data || []);
      if (svcRes.data?.success)
        setServices(svcRes.data.data?.data || svcRes.data.data || []);
      if (docRes.data?.success) setDocuments(docRes.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const bySvc = !svcFilter || r.service_id == svcFilter;
        const byText = `${r.service?.name || ""} ${r.document?.name || ""} ${
          r.document?.code || ""
        }`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return bySvc && byText;
      }),
    [rows, query, svcFilter]
  );

  const openCreate = () => {
    setEditing(null);
    setForm({
      service_id: services[0]?.service_id || "",
      document_ids: [],
      is_required: false,
      sort_order: rows.length + 1,
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      service_id: m.service_id,
      document_ids: [m.document_id],
      is_required: !!m.is_required,
      sort_order: m.sort_order ?? 0,
      is_active: !!m.is_active,
    });
    setShowForm(true);
  };

  // Multiple documents select / deselect
  const toggleDocument = (id) => {
    setForm((p) => ({
      ...p,
      document_ids: p.document_ids.includes(id)
        ? p.document_ids.filter((x) => x !== id)
        : [...p.document_ids, id],
    }));
  };

  const handleSave = async () => {
    if (!form.service_id) return toast.error("Select a service");
    if (!form.document_ids.length)
      return toast.error("Select at least one document");

    try {
      setSaving(true);
      const payload = {
        service_id: form.service_id,
        is_required: form.is_required,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };

      if (editing) {
        // Edit mode: sirf ek mapping update (document change allowed nahi)
        await axios.put(
          `${base}/seva/document-mappings/${editing.mapping_id}`,
          {
            ...payload,
            document_id: form.document_ids[0],
          },
          { headers }
        );
        toast.success("Mapping updated");
      } else {
        await axios.post(`${base}/seva/document-mappings`, {
          ...payload,
          document_ids: form.document_ids,
        }, { headers });
        toast.success(
          `${form.document_ids.length} document(s) mapped with service`
        );
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

  const handleDelete = async (m) => {
    if (
      !window.confirm(
        `Remove mapping "${m.document?.name}" from "${m.service?.name}"?`
      )
    )
      return;
    try {
      await axios.delete(
        `${base}/seva/document-mappings/${m.mapping_id}`,
        { headers }
      );
      toast.success("Mapping removed");
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Seva Document Mapping
          </h1>
          <p className="text-sm text-gray-500">
            Map documents with services - devotees see these when booking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mappings"
              className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <select
            value={svcFilter}
            onChange={(e) => setSvcFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Services</option>
            {services.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Mapping
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total Mappings", rows.length, "text-gray-900"],
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
            "Services Covered",
            new Set(rows.map((r) => r.service_id)).size,
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
                  "Service",
                  "Document",
                  "Required?",
                  "Sort",
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
                <tr key={r.mapping_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900">
                      <Layers className="h-3.5 w-3.5 text-gray-400" />
                      {r.service?.name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-800">
                      <FileText className="h-3.5 w-3.5 text-gray-400" />
                      {r.document?.name || "—"}
                    </span>
                    {r.document?.code && (
                      <p className="ml-5 font-mono text-[11px] text-gray-500">
                        {r.document.code}
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
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.sort_order}
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
                        title="Remove"
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
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No mappings found. Map a document with a service to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
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

            <div className="space-y-3.5 px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Service *
                </label>
                <select
                  value={form.service_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, service_id: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">— select —</option>
                  {services.map((s) => (
                    <option key={s.service_id} value={s.service_id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Documents *
                </label>
                <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-300 p-2">
                  {documents.length === 0 && (
                    <p className="px-1 py-2 text-xs text-gray-500">
                      No documents available.
                    </p>
                  )}
                  {documents.map((d) => (
                    <label
                      key={d.document_id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.document_ids.includes(d.document_id)}
                        onChange={() => toggleDocument(d.document_id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="flex-1">{d.name}</span>
                      <span className="font-mono text-[10px] text-gray-400">
                        {d.code}
                      </span>
                      {d.is_required && (
                        <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                          required
                        </span>
                      )}
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-gray-500">
                  {form.document_ids.length
                    ? `${form.document_ids.length} document(s) selected`
                    : "Select one or more documents - all will be mapped to this service."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    ["is_required", "Mandatory for this service"],
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

              <p className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                Mapped documents devotee ko booking form me dikhenge. Mandatory
                documents approve hone se pehle upload hona zaroori hoga.
              </p>
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

export default SevaDocumentMapping;
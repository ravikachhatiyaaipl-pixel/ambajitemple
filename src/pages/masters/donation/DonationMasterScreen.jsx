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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * DONATION MODULE - reusable master screen
 *
 * Config driven (list / create / update / delete endpoints + columns + fields)
 * - Seva/Shop masters jaisa hi design (cards + gradient table + modal form)
 */
const DonationMasterScreen = ({
  title,
  subtitle,
  columns,
  fields,
  api,
  defaultFilters = {},
  extraParams = {},
  onLoaded,
  addLabel = "Add",
  stats,
}) => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...extraParams, ...filters };
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] === null) delete params[k];
      });

      const res = await api.list(params);
      const list = res?.data?.data || res?.data || [];
      setRows(Array.isArray(list) ? list : []);
      onLoaded?.(list);
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), JSON.stringify(extraParams)]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    const init = {};
    fields.forEach((f) => {
      init[f.name] = f.defaultValue ?? "";
    });
    setForm(init);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormError("");
    const init = {};
    fields.forEach((f) => {
      const v = row[f.source ?? f.name];
      init[f.name] = v ?? f.defaultValue ?? "";
    });
    setForm(init);
    setShowForm(true);
  };

  const handleSave = async () => {
    // Required validation
    for (const f of fields) {
      if (f.required && (form[f.name] === "" || form[f.name] === null)) {
        setFormError(`${f.label} is required`);
        return;
      }
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (payload[f.name] === "" && !f.sendEmpty) delete payload[f.name];
        if (f.type === "number") payload[f.name] = Number(payload[f.name]);
        if (f.type === "boolean") payload[f.name] = !!payload[f.name];
      });
      if (editing) payload.id = editing[fields.find((f) => f.key)?.key || "id"];

      const res = editing ? await api.update(payload) : await api.create(payload);

      if (res?.success === false) {
        setFormError(res.message || "Save failed");
        return;
      }
      toast.success(editing ? "Updated successfully" : "Created successfully");
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
    if (!window.confirm("Are you sure you want to delete this record?"))
      return;
    try {
      const id = row[fields.find((f) => f.key)?.key || "id"];
      const res = await api.remove(id);
      if (res?.success === false) {
        toast.error(res.message || "Delete failed");
        return;
      }
      toast.success("Deleted successfully");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const filtered = rows.filter((r) => {
    if (!query.trim()) return true;
    const term = query.trim().toLowerCase();
    return columns.some((c) =>
      String(r[c.source ?? c.key] ?? "").toLowerCase().includes(term)
    );
  });

  const statCards =
    typeof stats === "function" ? stats(rows) : stats || [];

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
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
            )}
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
            <Plus className="h-4 w-4" /> {addLabel}
          </button>
        </div>
      </div>

      {/* Stats */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
          {statCards.map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
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

          {fields
            .filter((f) => f.filter)
            .map((f) => (
              <select
                key={f.name}
                value={filters[f.name] ?? ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, [f.name]: e.target.value }))
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">{f.filterLabel || `All ${f.label}`}</option>
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((row) => (
                  <tr
                    key={row[fields.find((f) => f.key)?.key || "id"]}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="px-6 py-4 text-sm text-gray-700">
                        {c.render ? c.render(row) : String(row[c.source ?? c.key] ?? "-")}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                  <td
                    colSpan={columns.length + 1}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No records found.
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
                {editing ? "Edit" : "Add"} {title.replace(/ Master$/, "")}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
              {fields
                .filter((f) => !f.filter)
                .map((f) => (
                  <div
                    key={f.name}
                    className={f.full ? "sm:col-span-2" : ""}
                  >
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      {f.label}
                      {f.required && <span className="text-red-500"> *</span>}
                    </label>

                    {f.type === "select" ? (
                      <select
                        value={form[f.name] ?? ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, [f.name]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">- select -</option>
                        {(f.options || []).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "checkbox" ? (
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!form[f.name]}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              [f.name]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        {f.checkboxLabel || "Yes"}
                      </label>
                    ) : (
                      <input
                        type={f.type || "text"}
                        step={f.step}
                        min={f.min}
                        value={form[f.name] ?? ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, [f.name]: e.target.value }))
                        }
                        placeholder={f.placeholder}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    )}

                    {f.help && (
                      <p className="mt-1 text-[10px] text-gray-500">{f.help}</p>
                    )}
                  </div>
                ))}
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

export default DonationMasterScreen;

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DonationFormPage, {
  confirmDonationSave,
  donationInputCls,
  donationLabelCls,
} from "./DonationFormPage";

/**
 * DONATION MODULE - reusable master screen
 *
 * Config driven (list / create / update / delete endpoints + columns + fields)
 * - Estate (Seva/Shop) masters jaisa hi design (list + full page add/edit form)
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

    if (!(await confirmDonationSave(!!editing, title.replace(/ Master$/, ""))))
      return;

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

  const entityLabel = title.replace(/ Master$/, "");

  if (showForm) {
    return (
      <DonationFormPage
        title={`${editing ? "Edit" : "Add"} ${entityLabel}`}
        subtitle={
          editing
            ? "Update the record details"
            : "Fill in the details to create a new record"
        }
        detailsTitle={`${entityLabel} Details`}
        onBack={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel={`${editing ? "Update" : "Save"} ${entityLabel}`}
        error={formError}
      >
        {fields
          .filter((f) => !f.filter)
          .map((f) => (
            <div key={f.name} className={f.full ? "md:col-span-2" : ""}>
              <label className={donationLabelCls}>
                {f.label}
                {f.required && <span className="text-red-500"> *</span>}
              </label>

              {f.type === "select" ? (
                <select
                  value={form[f.name] ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.name]: e.target.value }))
                  }
                  className={donationInputCls}
                >
                  <option value="">- select -</option>
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "checkbox" ? (
                <label className="flex items-center gap-2 py-2 text-sm text-gray-700">
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
                  className={donationInputCls}
                />
              )}

              {f.help && <p className="mt-1 text-xs text-gray-400">{f.help}</p>}
            </div>
          ))}
      </DonationFormPage>
    );
  }

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
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
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm font-medium transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-md font-medium flex items-center transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> {addLabel}
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
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

          {fields
            .filter((f) => f.filter)
            .map((f) => (
              <select
                key={f.name}
                value={filters[f.name] ?? ""}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, [f.name]: e.target.value }))
                }
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
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
    </div>
  );
};

export default DonationMasterScreen;

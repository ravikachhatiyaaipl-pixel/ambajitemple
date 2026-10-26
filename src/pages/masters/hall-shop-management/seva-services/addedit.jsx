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
  CheckCircle,
  XCircle,
  Layers,
  Package,
  FileText,
  ShieldCheck,
  Calendar,
  Eye,
} from "lucide-react";
import { CrudFormPage } from "../../../../components/crud/crudkit";

const SevaServices = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const [form, setForm] = useState({
    category_id: "",
    code: "",
    codeTouched: false,
    name: "",
    service_kind: "POOJA",
    permission_approval: false,
    image_url: "",
    show_on_portal: true,
    is_active: true,
    sort_order: 0,
  });

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [svcRes, catRes, kindRes] = await Promise.all([
        axios.get(`${base}/seva/services?per_page=200`, { headers }),
        axios.get(`${base}/seva/categories`, { headers }),
        axios.get(`${base}/seva/kinds`, { headers }),
      ]);
      if (svcRes.data?.success) {
        setRows(svcRes.data.data?.data || svcRes.data.data || []);
      }
      if (catRes.data?.success) setCategories(catRes.data.data || []);
      if (kindRes.data?.success) setKinds(kindRes.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load services");
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
        const byCat = !catFilter || r.category_id == catFilter;
        const byText = `${r.name} ${r.code} ${r.service_kind} ${r.category?.name || ""
          }`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return byCat && byText;
      }),
    [rows, query, catFilter]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.category_id) === String(form.category_id)),
    [categories, form.category_id]
  );

  const openCreate = () => {
    setEditing(null);
    setForm({
      category_id: categories[0]?.category_id || "",
      code: "",
      codeTouched: false,
      name: "",
      service_kind: kinds[0]?.code || "POOJA",
      permission_approval: false,
      image_url: "",
      show_on_portal: true,
      is_active: true,
      sort_order: rows.length + 1,
    });
    setShowForm(true);
  };

  const openEdit = (svc) => {
    setEditing(svc);
    setForm({
      category_id: svc.category_id || "",
      code: svc.code || "",
      codeTouched: true,
      name: svc.name || "",
      service_kind: svc.service_kind || "POOJA",
      permission_approval: !!svc.permission_approval,
      image_url: svc.image_url || "",
      show_on_portal: !!svc.show_on_portal,
      is_active: !!svc.is_active,
      sort_order: svc.sort_order ?? 0,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...form };
      delete payload.codeTouched;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === null) delete payload[k];
      });
      // Code backend se auto-generate hota hai
      delete payload.code;
      payload.name = form.name.trim();
      payload.permission_approval = form.permission_approval ? 1 : 0;
      payload.sort_order = form.sort_order || 0;

      if (editing) {
        await axios.put(
          `${base}/seva/services/${editing.service_id}`,
          payload,
          { headers }
        );
        toast.success("Service updated");
      } else {
        await axios.post(`${base}/seva/services`, payload, { headers });
        toast.success("Service created");
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

  const handleDelete = async (svc) => {
    if (!window.confirm(`Delete service "${svc.name}"?`)) return;
    try {
      await axios.delete(`${base}/seva/services/${svc.service_id}`, { headers });
      toast.success("Service deleted");
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed (may be in use)");
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
        title={editing ? "Edit Service" : "Add Service"}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel={editing ? "Update" : "Create"}
      >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) => {
                  const catId = e.target.value;
                  const cat = categories.find(
                    (c) => String(c.category_id) === String(catId)
                  );
                  setForm((p) => ({
                    ...p,
                    category_id: catId,
                    // Category ka code auto service code me copy
                    code:
                      cat && !p.codeTouched ? cat.code || "" : p.code,
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <p className="mt-1 text-[10px] text-gray-500">
                  Code auto-generated from category:{" "}
                  <span className="font-mono font-semibold text-gray-700">
                    {selectedCategory.code}
                  </span>
                </p>
              )}
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Service Name *
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
                Code *
              </label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    code: e.target.value.toUpperCase(),
                    codeTouched: true,
                  }))
                }
                placeholder="Auto from category"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Service Type*
              </label>
              <select
                value={form.service_kind}
                onChange={(e) =>
                  setForm((p) => ({ ...p, service_kind: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {kinds.map((k) => (
                  <option key={k.kind_id} value={k.code}>
                    {k.name} ({k.code})
                  </option>
                ))}
              </select>
            </div>

            {/* PERMISSION APPROVAL = yes/no */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Permission Approval
              </label>
              <select
                value={form.permission_approval ? "1" : "0"}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    permission_approval: e.target.value === "1",
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="0">No — direct booking (no approval)</option>
                <option value="1">Yes — Action Master approval required</option>
              </select>
              <p className="mt-1 text-[10px] text-gray-500">
                {form.permission_approval
                  ? "Yes - bookings will wait for approval (HOD Approved, then Admin Approved) as per the Action Master flow."
                  : "No - bookings are scheduled directly, no approval needed."}
              </p>
            </div>
          </div>

          <p className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
            Price, Pooja Duration, daily limit and group size are defined
            in the <strong> Seva Packages </strong> master. Devotee selects
            the package at the time of booking.
          </p>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-700">
              Visibility
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ["show_on_portal", "Show on portal"],
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seva Services</h1>
          <p className="text-sm text-gray-500">
            Pooja, Yagna, Bhog, Thaal, Ratri Puja and more - pricing lives in
            Packages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services"
              className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total Services", rows.length, "text-gray-900"],
          [
            "Active",
            rows.filter((r) => r.is_active).length,
            "text-emerald-600",
          ],
          [
            "On Portal",
            rows.filter((r) => r.show_on_portal).length,
            "text-blue-600",
          ],
          [
            "With Approval",
            rows.filter((r) => r.permission_approval).length,
            "text-indigo-600",
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

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  "Code",
                  "Service",
                  "Category",
                  "Kind",
                  "Permission Approval",
                  "Package",
                  "Packages",
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
                <tr key={r.service_id} className="hover:bg-gray-50">
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
                    <p className="text-[11px] text-gray-500">
                      {r.service_kind}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      {r.service_kind}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.permission_approval ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                        <ShieldCheck className="h-3 w-3" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.package ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {r.package.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          ₹{Number(r.package.fee || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">— none —</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                      <Package className="h-3 w-3" />
                      {(r.packages || []).length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {!r.is_active && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          Inactive
                        </span>
                      )}
                      {!r.show_on_portal && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                          Hidden
                        </span>
                      )}
                      {r.is_active && r.show_on_portal && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          Live
                        </span>
                      )}
                    </div>
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
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
<<<<<<< HEAD
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">
                {editing ? "Edit Service" : "Add Service"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => {
                      const catId = e.target.value;
                      const cat = categories.find(
                        (c) => String(c.category_id) === String(catId)
                      );
                      setForm((p) => ({
                        ...p,
                        category_id: catId,
                      }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">— none —</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {selectedCategory && (
                    <p className="mt-1 text-[10px] text-gray-500">
                      Code automatically generate hoga (name se)
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Service Name *
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
                    Service Kind *
                  </label>
                  <select
                    value={form.service_kind}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, service_kind: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {kinds.map((k) => (
                      <option key={k.kind_id} value={k.code}>
                        {k.name} ({k.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* PERMISSION APPROVAL = yes/no */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Permission Approval
                  </label>
                  <select
                    value={form.permission_approval ? "1" : "0"}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        permission_approval: e.target.value === "1",
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="0">No — direct booking (no approval)</option>
                    <option value="1">Yes — Action Master approval required</option>
                  </select>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {form.permission_approval
                      ? "Yes - bookings will wait for approval (HOD Approved, then Admin Approved) as per the Action Master flow."
                      : "No - bookings are scheduled directly, no approval needed."}
                  </p>
                </div>
              </div>

              <p className="rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                Price, Pooja Duration, daily limit and group size are defined
                in the <strong> Seva Packages </strong> master. Devotee selects
                the package at the time of booking.
              </p>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Visibility
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    ["show_on_portal", "Show on portal"],
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
=======
>>>>>>> b4ae7505f0ddd090375ea03a53f7455424394ef7
    </div>
  );
};

export default SevaServices;
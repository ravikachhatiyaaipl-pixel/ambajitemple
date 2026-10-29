import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Layers } from "lucide-react";
import {
  usePageTitle,
  useClientPagination,
  confirmDelete,
  CrudPageHeader,
  CrudActionBar,
  CrudTable,
  CrudPagination,
  CrudFormPage,
  NameCell,
  RowActions,
  StatusBadge,
  Field,
  inputCls,
} from "../../../../components/crud/crudkit";

const SevaCategoryMaster = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const pageTitle = usePageTitle(
    "/masters/hall-shop-management/seva-categories",
    "Seva Categories"
  );

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
          .includes(searchTerm.trim().toLowerCase())
      ),
    [rows, searchTerm]
  );

  const { setPage, pageItems, pagination } = useClientPagination(filtered, 10);

  const handleSearch = (v) => {
    setSearchTerm(v);
    setPage(1);
  };

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
    if (!(await confirmDelete({ title: "Delete Category?", text: `Are you sure you want to delete "${r.name}"?` }))) return;
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

  if (showForm) {
    return (
      <CrudFormPage
        title={editing ? "Edit Category" : "Add Category"}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel={editing ? "Update" : "Create"}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code" required>
            <input
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              disabled={!!editing}
              placeholder="MAHAPOOJA"
              className={`${inputCls} font-mono uppercase`}
            />
          </Field>
          <Field label="Service Type" required>
            <select
              value={form.service_kind}
              onChange={(e) => setForm((p) => ({ ...p, service_kind: e.target.value }))}
              className={inputCls}
            >
              <option value="">— select —</option>
              {kinds.map((k) => (
                <option key={k.kind_id} value={k.code}>
                  {k.name} ({k.code})
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Category Name" required>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Maha Pooja"
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Icon (lucide name)">
            <input
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
              placeholder="Flame"
              className={inputCls}
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          Active
        </label>
      </CrudFormPage>
    );
  }

  return (
    <div className="p-6">
      <CrudPageHeader
        title={pageTitle}
        subtitle="Group seva services into categories (Maha Pooja, Yagna, Bhog, Thaal…)"
        addLabel="Add Category"
        onAdd={openCreate}
      />

      <CrudActionBar
        value={searchTerm}
        onChange={handleSearch}
        onClear={() => handleSearch("")}
        onRefresh={fetchAll}
        placeholder="Search by code, name, service kind..."
      />

      <CrudTable
        columns={["Category", "Service Kind", "Icon", "Sort", "Used By", "Status", "Actions"]}
        loading={loading}
        isEmpty={pageItems.length === 0}
        searching={!!searchTerm}
        emptyNoun="categories"
        addLabel="Add Category"
        onAdd={openCreate}
      >
        {pageItems.map((r) => (
          <tr key={r.category_id} className="hover:bg-gray-50 transition-colors duration-150 group">
            <td className="px-6 py-4">
              <NameCell icon={Layers} title={r.name} sub={r.code} />
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">{r.service_kind || "N/A"}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{r.icon || "N/A"}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{r.sort_order}</td>
            <td className="px-6 py-4 text-sm text-gray-700">
              {r.services_count || 0} service{r.services_count === 1 ? "" : "s"}
            </td>
            <td className="px-6 py-4">
              <StatusBadge active={!!r.is_active} onClick={() => toggleActive(r)} />
            </td>
            <td className="px-6 py-4">
              <RowActions onEdit={() => openEdit(r)} onDelete={() => handleDelete(r)} />
            </td>
          </tr>
        ))}
      </CrudTable>

      <CrudPagination pagination={pagination} onPage={setPage} />

    </div>
  );
};

export default SevaCategoryMaster;
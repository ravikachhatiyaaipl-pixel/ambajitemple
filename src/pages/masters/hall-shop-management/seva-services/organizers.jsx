import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Users } from "lucide-react";
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

const emptyForm = {
  code: "",
  name: "",
  phone: "",
  email: "",
  contact_person: "",
  city: "",
  address: "",
  is_active: true,
};

const SevaOrganizerMaster = ({ user }) => {
  const pageTitle = usePageTitle(
    "/masters/hall-shop-management/seva-organizers",
    "Seva Organizers"
  );
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${base}/seva/organizers`, { headers });
      if (res.data?.success) setRows(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load organizers");
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
        `${r.code || ""} ${r.name} ${r.phone || ""} ${r.email || ""} ${r.contact_person || ""} ${r.city || ""}`
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
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      code: r.code || "",
      name: r.name || "",
      phone: r.phone || "",
      email: r.email || "",
      contact_person: r.contact_person || "",
      city: r.city || "",
      address: r.address || "",
      is_active: !!r.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Organizer Name is required");
    if (form.phone.trim() && !/^[0-9+\-\s]{8,15}$/.test(form.phone.trim()))
      return toast.error("Enter a valid phone number");
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return toast.error("Enter a valid email");
    try {
      setSaving(true);
      const payload = {
        code: form.code.trim().toUpperCase() || null,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        contact_person: form.contact_person.trim() || null,
        city: form.city.trim() || null,
        address: form.address.trim() || null,
        is_active: form.is_active,
      };
      if (editing) {
        await axios.put(`${base}/seva/organizers/${editing.organizer_id}`, payload, { headers });
        toast.success("Organizer updated successfully!");
      } else {
        await axios.post(`${base}/seva/organizers`, payload, { headers });
        toast.success("Organizer created successfully!");
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
    if (!(await confirmDelete({ title: "Delete Organizer?", text: `Are you sure you want to delete "${r.name}"?` }))) return;
    try {
      await axios.delete(`${base}/seva/organizers/${r.organizer_id}`, { headers });
      toast.success("Organizer deleted successfully!");
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete (may be in use)");
    }
  };

  const toggleActive = async (r) => {
    try {
      await axios.put(`${base}/seva/organizers/${r.organizer_id}`, { is_active: !r.is_active }, { headers });
      toast.success(r.is_active ? "Deactivated" : "Activated");
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  if (showForm) {
    return (
      <CrudFormPage
        title={editing ? "Edit Organizer" : "Add Organizer"}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel={editing ? "Update" : "Create"}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code">
            <input
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              disabled={!!editing}
              placeholder="ORG01"
              className={`${inputCls} font-mono uppercase`}
            />
          </Field>
          <Field label="Organizer Name" required>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Shree Ambaji Seva Mandal"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="9876543210"
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact Person">
            <input
              value={form.contact_person}
              onChange={(e) => setForm((p) => ({ ...p, contact_person: e.target.value }))}
              placeholder="Shri Mehta"
              className={inputCls}
            />
          </Field>
          <Field label="City">
            <input
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Address">
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            className={inputCls}
          />
        </Field>
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
        subtitle="Manage the organizers (trusts, groups, families) who arrange seva services"
        addLabel="Add Organizer"
        onAdd={openCreate}
      />

      <CrudActionBar
        value={searchTerm}
        onChange={handleSearch}
        onClear={() => handleSearch("")}
        onRefresh={fetchAll}
        placeholder="Search by name, contact person, city..."
      />

      <CrudTable
        columns={["Organizer", "Contact", "Contact Person", "City", "Status", "Actions"]}
        loading={loading}
        isEmpty={pageItems.length === 0}
        searching={!!searchTerm}
        emptyNoun="organizers"
        addLabel="Add Organizer"
        onAdd={openCreate}
      >
        {pageItems.map((r) => (
          <tr key={r.organizer_id} className="hover:bg-gray-50 transition-colors duration-150 group">
            <td className="px-6 py-4">
              <NameCell icon={Users} title={r.name} sub={r.code || r.address} />
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">
              <div>{r.phone || "N/A"}</div>
              {r.email && <div className="text-xs text-gray-500">{r.email}</div>}
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">{r.contact_person || "N/A"}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{r.city || "N/A"}</td>
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

export default SevaOrganizerMaster;

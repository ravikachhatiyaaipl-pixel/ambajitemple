import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  ShieldCheck,
  Loader2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ArrowRight,
  X,
  Users,
} from "lucide-react";
import { CrudFormPage } from "../../../../components/crud/crudkit";

/**
 * Seva Action Master (stage SEV).
 *
 * Yahan se approval flow define / change karo. Seva booking approval
 * 100% DYNAMIC hai - is screen par jo bhi change karoge, booking flow
 * usi second update ho jayega (koi code change nahi).
 *
 * Chain structure:
 *   Step 1 (root)  ->  Step 2  ->  Step 3
 *   Previous_Status se link hota hai.
 */
const SevaActionMaster = ({ user }) => {
  const [chain, setChain] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    St_Name: "",
    Previous_Status: "",
    Is_Forward: "Y",
    Authorities: [],
    Viewers: [],
    Act_Remarks: "",
    Dpt_id: "",
  });

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [chainRes, dsgRes] = await Promise.all([
        axios.get(`${base}/seva/approval-chain?stage=SEV`, { headers }),
        axios.get(`${base}/lst-designation-master`, { headers }).catch(() => ({
          data: { data: [] },
        })),
      ]);

      if (chainRes.data?.success) setChain(chainRes.data.data || []);

      const d = dsgRes.data?.data;
      if (Array.isArray(d)) setDesignations(d);
      else if (d?.data && Array.isArray(d.data)) setDesignations(d.data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load action master");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      St_Name: "",
      Previous_Status: "",
      Is_Forward: "Y",
      Authorities: [],
      Viewers: [],
      Act_Remarks: "",
      Dpt_id: "",
    });
    setShowForm(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      St_Name: a.St_Name || "",
      Previous_Status: a.Previous_Status || "",
      Is_Forward: a.Is_Forward || "Y",
      Authorities: Array.isArray(a.Authorities) ? a.Authorities : [],
      Viewers: Array.isArray(a.Viewers) ? a.Viewers : [],
      Act_Remarks: a.Act_Remarks || "",
      Dpt_id: a.Dpt_id || "",
    });
    setShowForm(true);
  };

  const toggleIn = (key, id) => {
    setForm((p) => {
      const list = p[key] || [];
      const next = list.includes(id)
        ? list.filter((x) => x !== id)
        : [...list, id];
      return { ...p, [key]: next };
    });
  };

  const handleSave = async () => {
    if (!form.St_Name.trim()) {
      toast.error("Step name is required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        St_Name: form.St_Name.trim(),
        Previous_Status: form.Previous_Status || null,
        Is_Forward: form.Is_Forward,
        Authorities: form.Authorities,
        Viewers: form.Viewers,
        Act_Remarks: form.Act_Remarks || null,
        Dpt_id: form.Dpt_id || null,
        stage: "SEV",
      };

      if (editing) {
        await axios.put(`${base}/action-master/${editing.Act_Id}`, payload, {
          headers,
        });
        toast.success("Step updated - booking flow updated automatically");
      } else {
        await axios.post(`${base}/action-master`, payload, { headers });
        toast.success("Step added to the approval flow");
      }
      setShowForm(false);
      fetchAll();
    } catch (e) {
      const errs = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e.response?.data?.message || e.response?.data?.error;
      toast.error(errs || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (
      !window.confirm(
        `Delete step "${a.St_Name}"? Bookings currently on this step will not find the next step.`
      )
    )
      return;
    try {
      await axios.delete(`${base}/action-master/${a.Act_Id}`, { headers });
      toast.success("Step deleted");
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const dsgName = (id) => {
    const d = designations.find((x) => String(x.Dsg_id) === String(id));
    return d?.Dsg_Name || d?.name || `Designation ${id}`;
  };

  const steps = useMemo(() => chain, [chain]);

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
        title={editing ? "Edit Step" : "Add Step"}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel="Save"
      >
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Step name *
            </label>
            <input
              value={form.St_Name}
              onChange={(e) =>
                setForm((p) => ({ ...p, St_Name: e.target.value }))
              }
              placeholder="HOD Approved"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Previous step
            </label>
            <select
              value={form.Previous_Status}
              onChange={(e) =>
                setForm((p) => ({ ...p, Previous_Status: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">— none (first step) —</option>
              {steps
                .filter((s) => !editing || s.Act_Id !== editing.Act_Id)
                .map((s) => (
                  <option key={s.Act_Id} value={s.Act_Id}>
                    {s.St_Name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Who can approve this step
            </label>
            {designations.length === 0 ? (
              <p className="text-[11px] text-gray-500">
                No designation master loaded - leave empty to allow any
                authorised user.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {designations.map((d) => {
                  const id = d.Dsg_id ?? d.id;
                  const on = form.Authorities.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2 px-1 py-1 text-xs text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleIn("Authorities", id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-red-600"
                      />
                      {d.Dsg_Name || d.name || `Designation ${id}`}
                    </label>
                  );
                })}
              </div>
            )}
            <p className="mt-1 text-[10px] text-gray-500">
              Leave empty - any authorised user can approve this step.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Who can see bookings on this step
            </label>
            {designations.length === 0 ? (
              <p className="text-[11px] text-gray-500">
                No designation master loaded.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {designations.map((d) => {
                  const id = d.Dsg_id ?? d.id;
                  const on = form.Viewers.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2 px-1 py-1 text-xs text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleIn("Viewers", id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-red-600"
                      />
                      {d.Dsg_Name || d.name || `Designation ${id}`}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Remarks
            </label>
            <input
              value={form.Act_Remarks}
              onChange={(e) =>
                setForm((p) => ({ ...p, Act_Remarks: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
      </CrudFormPage>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Seva Action Master
          </h1>
          <p className="text-sm text-gray-500">
            Define the seva approval flow. Booking approval follows this flow
            dynamically - no code change needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Step
          </button>
        </div>
      </div>

      {/* FLOW */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <ShieldCheck className="h-4 w-4" /> Approval flow (stage SEV)
        </p>

        {steps.length === 0 ? (
          <p className="text-sm text-gray-500">
            No steps configured. Click "Add Step" to create the first step.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.Act_Id} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-4 w-4 text-gray-300" />}
                <div
                  className={`rounded-xl border px-4 py-3 ${
                    s.is_start
                      ? "border-gray-200 bg-gray-50"
                      : "border-indigo-200 bg-indigo-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        Step {s.step_no}
                        {s.is_start ? " (start)" : ""}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {s.St_Name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:bg-white"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {!s.is_start && (
                        <button
                          onClick={() => handleDelete(s)}
                          className="rounded-lg border border-red-300 p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-start gap-1.5 text-[11px] text-gray-600">
                      <Users className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                      {s.Authorities && s.Authorities.length > 0 ? (
                        <span>
                          Approve:{" "}
                          <strong>
                            {(Array.isArray(s.Authorities)
                              ? s.Authorities
                              : []
                            )
                              .map((a) => dsgName(a))
                              .join(", ")}
                          </strong>
                        </span>
                      ) : (
                        <span>Approve: any authorised user</span>
                      )}
                    </p>
                    {s.Viewers && s.Viewers.length > 0 && (
                      <p className="text-[11px] text-gray-600">
                        View:{" "}
                        <strong>
                          {(Array.isArray(s.Viewers) ? s.Viewers : [])
                            .map((a) => dsgName(a))
                            .join(", ")}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SevaActionMaster;

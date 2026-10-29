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
  MapPin,
} from "lucide-react";

/**
 * Article Donation Action Master (stage ART).
 *
 * Yahan se approval flow define / change karo. Article donation approval
 * 100% DYNAMIC hai - is screen par jo bhi change karoge, donation flow
 * usi second update ho jayega (koi code change nahi).
 *
 * Chain structure:
 *   Step 1 (root)  ->  Step 2  ->  Step 3
 *   Previous_Status se link hota hai.
 */
const ArticleDonationActionMaster = ({ user }) => {
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
        axios.get(`${base}/action-master/all`, {
          params: { stage: "ART" },
          headers,
        }),
        axios.get(`${base}/lst-designation`, { headers }).catch(() =>
          axios
            .get(`${base}/designation/all`, { headers })
            .catch(() => ({ data: { data: [] } }))
        ),
      ]);

      const actions = chainRes.data?.data || [];
      setChain(sortChain(actions));

      const d = dsgRes.data?.data;
      if (Array.isArray(d)) setDesignations(d);
      else if (d?.data && Array.isArray(d.data)) setDesignations(d.data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load action master");
    } finally {
      setLoading(false);
    }
  };

  // Previous_Status walk se forward chain order banao (root -> ... -> final)
  const sortChain = (actions) => {
    const all = (actions || []).filter((a) => !a.deleted_at);
    const root = all.find((a) => !a.Previous_Status && a.Is_Forward === "Y");
    if (!root) return all;

    const ordered = [root];
    const seen = new Set([root.Act_Id]);
    let cursor = root;

    while (cursor) {
      const next = all.find(
        (a) =>
          Number(a.Previous_Status) === Number(cursor.Act_Id) &&
          a.Is_Forward === "Y" &&
          !seen.has(a.Act_Id)
      );
      if (!next) break;
      ordered.push(next);
      seen.add(next.Act_Id);
      cursor = next;
    }

    // Query / backward branches apne parent ke baad
    all.forEach((a) => {
      if (!seen.has(a.Act_Id)) {
        ordered.push(a);
        seen.add(a.Act_Id);
      }
    });

    return ordered;
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      Authorities: parseJson(a.Authorities),
      Viewers: parseJson(a.Viewers),
      Act_Remarks: a.Act_Remarks || "",
      Dpt_id: a.Dpt_id || "",
    });
    setShowForm(true);
  };

  const parseJson = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const d = JSON.parse(raw);
        return Array.isArray(d) ? d : [];
      } catch {
        return [];
      }
    }
    return [];
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
        stage: "ART",
      };

      if (editing) {
        await axios.put(`${base}/action-master/${editing.Act_Id}`, payload, {
          headers,
        });
        toast.success("Step updated - article donation flow updated automatically");
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
        `Delete step "${a.St_Name}"? Article donations currently on this step will not find the next step.`
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
    return d?.Dsg_Desc || d?.Dsg_Title || d?.Dsg_Name || d?.name || `Designation ${id}`;
  };

  const parseSafe = parseJson;

  const steps = useMemo(() => chain, [chain]);

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
            Article Donation Action Master
          </h1>
          <p className="text-sm text-gray-500">
            Define the article / material donation approval flow. Donation
            approval follows this flow dynamically - no code change needed.
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
          <ShieldCheck className="h-4 w-4" /> Approval flow (stage ART)
        </p>

        {steps.length === 0 ? (
          <p className="text-sm text-gray-500">
            No steps configured. Click "Add Step" to create the first step.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((s, i) => {
              const isBackward = s.Is_Forward === "N";
              const auths = parseSafe(s.Authorities);
              const viewers = parseSafe(s.Viewers);
              return (
                <div key={s.Act_Id} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight className="h-4 w-4 text-gray-300" />}
                  <div
                    className={`rounded-xl border px-4 py-3 ${
                      isBackward
                        ? "border-orange-200 bg-orange-50"
                        : !s.Previous_Status
                        ? "border-gray-200 bg-gray-50"
                        : "border-indigo-200 bg-indigo-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">
                          {isBackward
                            ? "Backward branch"
                            : `Step ${i + 1}${!s.Previous_Status ? " (start)" : ""}`}
                          {s.Is_Forward === "Y" && !s.Previous_Status ? "" : ""}
                          {isBackward ? "" : ""}
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
                        <button
                          onClick={() => handleDelete(s)}
                          className="rounded-lg border border-red-300 p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-start gap-1.5 text-[11px] text-gray-600">
                        <Users className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                        {auths && auths.length > 0 ? (
                          <span>
                            Perform:{" "}
                            <strong>{auths.map((a) => dsgName(a)).join(", ")}</strong>
                          </span>
                        ) : (
                          <span>Perform: Admin only (no authority set)</span>
                        )}
                      </p>
                      {viewers && viewers.length > 0 && (
                        <p className="flex items-start gap-1.5 text-[11px] text-gray-600">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                          View:{" "}
                          <strong>{viewers.map((a) => dsgName(a)).join(", ")}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-gray-100 border border-gray-300"></span>
            Start step
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-indigo-50 border border-indigo-200"></span>
            Forward step (approval)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-orange-50 border border-orange-200"></span>
            Backward branch (Query / Sent Back / Reject)
          </span>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {editing ? "Edit Step" : "Add Step"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
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
                  Action direction
                </label>
                <select
                  value={form.Is_Forward}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, Is_Forward: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="Y">Forward (approval moves ahead)</option>
                  <option value="N">Backward (Query / Sent Back / Reject)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Who can perform this step
                </label>
                {designations.length === 0 ? (
                  <p className="text-[11px] text-gray-500">
                    No designation master loaded - leave empty to allow Admin only.
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
                          {dsgName(id)}
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="mt-1 text-[10px] text-gray-500">
                  Leave empty - only Admin can perform this step.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Who can see donations on this step
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
                          {dsgName(id)}
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
            </div>

            <div className="mt-5 flex gap-3">
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
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDonationActionMaster;

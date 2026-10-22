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
<<<<<<< HEAD
=======
  Check,
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
  Package,
  IndianRupee,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
<<<<<<< HEAD
import { CrudFormPage } from "../../../../components/crud/crudkit";
=======

/**
 * Time slots - koi bhi time MANUALLY type kar sakte hain (fixed 30-min
 * dropdown nahi).
 *
 * Accept:  "7:30"  "07:30"  "7:30 AM"  "7:30 pm"  "19:30"  "7"  "7 pm"
 * Return:  "HH:MM" (24-hour) ya invalid ho to null
 */
const parseTimeInput = (raw) => {
  const s = String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (!s) return null;

  const meridiem =
    s.endsWith("AM") || s.endsWith("PM") ? s.slice(-2) : null;
  const body = meridiem ? s.slice(0, -2) : s;

  const m = body.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!m) return null;

  let hh = parseInt(m[1], 10);
  const mm = m[2] !== undefined ? parseInt(m[2], 10) : 0;
  if (mm > 59) return null;

  if (meridiem === "AM") {
    if (hh < 1 || hh > 12) return null;
    if (hh === 12) hh = 0;
  } else if (meridiem === "PM") {
    if (hh < 1 || hh > 12) return null;
    if (hh !== 12) hh += 12;
  } else if (hh > 23) {
    return null;
  }

  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/** "07:30" -> "07:30 AM" (display ke liye) */
const to12Hour = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = String(hhmm).split(":").map(Number);
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${
    h < 12 ? "AM" : "PM"
  }`;
};
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339

const SevaPackages = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [services, setServices] = useState([]);
<<<<<<< HEAD
=======
  const [kinds, setKinds] = useState([]);
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [svcFilter, setSvcFilter] = useState("");
<<<<<<< HEAD

  const [form, setForm] = useState({
    service_id: "",
=======
  const [kindFilter, setKindFilter] = useState("");

  const [form, setForm] = useState({
    service_id: "",
    service_kind: "",
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
    name: "",
    description: "",
    includes: [],
    fee: "",
    duration_minutes: "",
    daily_quota: "",
    max_persons: 1,
    persons_served: 1,
    slot_times: [],
    effective_from: "",
    effective_to: "",
    sort_order: 0,
    is_active: true,
  });

  const [includeInput, setIncludeInput] = useState("");
<<<<<<< HEAD
=======
  const [slotError, setSlotError] = useState(false);
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
  const [slotDraft, setSlotDraft] = useState({
    start: "",
    end: "",
    label: "",
<<<<<<< HEAD
    capacity: "",
=======
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
  });

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      const [svcRes, pkgRes] = await Promise.all([
        axios.get(`${base}/seva/services?per_page=200`, { headers }),
        axios.get(`${base}/seva/packages?per_page=200`, { headers }),
=======
      const [svcRes, pkgRes, kindRes] = await Promise.all([
        axios.get(`${base}/seva/services?per_page=200`, { headers }),
        axios.get(`${base}/seva/packages?per_page=200`, { headers }),
        axios.get(`${base}/seva/kinds`, { headers }),
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      ]);
      if (svcRes.data?.success) {
        setServices(svcRes.data.data?.data || svcRes.data.data || []);
      }
<<<<<<< HEAD
=======
      if (kindRes.data?.success) {
        setKinds(kindRes.data.data?.data || kindRes.data.data || []);
      }
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      if (pkgRes.data?.success) {
        const list = pkgRes.data.data?.data || pkgRes.data.data || [];
        setRows(
          list.map((p) => ({
            ...p,
            service_name: p.service?.name || "",
            service_code: p.service?.code || "",
          }))
        );
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load packages");
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
<<<<<<< HEAD
=======
        const byKind = !kindFilter || r.service_kind == kindFilter;
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
        const byText = `${r.name} ${r.code || ""} ${r.service_name || ""} ${
          r.description || ""
        }`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
<<<<<<< HEAD
        return bySvc && byText;
      }),
    [rows, query, svcFilter]
  );

=======
        return bySvc && byKind && byText;
      }),
    [rows, query, svcFilter, kindFilter]
  );

  // Service Type code ka naam (POOJA -> Pooja)
  const kindLabel = (code) =>
    kinds.find((k) => k.code === code)?.name || code || "â€”";

  // Service Type ke hisaab se Services filter (current service hamesha dikhe)
  const visibleServices = useMemo(() => {
    const kind = form.service_kind;
    if (!kind) return services;
    return services.filter(
      (s) => s.service_kind === kind || s.service_id == form.service_id
    );
  }, [services, form.service_kind, form.service_id]);

>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
  const openCreate = () => {
    setEditing(null);
    setForm({
      service_id: services[0]?.service_id || "",
<<<<<<< HEAD
=======
      service_kind:
        services.find((s) => s.service_id == services[0]?.service_id)
          ?.service_kind || "",
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      name: "",
      description: "",
      includes: [],
      fee: "",
      duration_minutes: "",
      daily_quota: "",
      max_persons: 1,
      persons_served: 1,
      slot_times: [],
      effective_from: "",
      effective_to: "",
      sort_order: rows.length + 1,
      is_active: true,
    });
    setIncludeInput("");
<<<<<<< HEAD
    setSlotDraft({ start: "", end: "", label: "", capacity: "" });
=======
    setSlotDraft({ start: "", end: "", label: "" });
    setSlotError(false);
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      service_id: p.service_id,
<<<<<<< HEAD
=======
      service_kind:
        p.service_kind ||
        services.find((s) => s.service_id == p.service_id)?.service_kind ||
        "",
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      name: p.name || "",
      description: p.description || "",
      includes: Array.isArray(p.included_list)
        ? p.included_list
        : Array.isArray(p.includes)
          ? p.includes
          : [],
      fee: p.fee ?? "",
      duration_minutes: p.duration_minutes ?? "",
      daily_quota: p.daily_quota ?? "",
      max_persons: p.persons_per_booking ?? p.max_persons ?? 1,
      persons_served: p.persons_served_count ?? p.persons_served ?? 1,
<<<<<<< HEAD
      slot_times: Array.isArray(p.slot_times) ? p.slot_times : [],
=======
      slot_times: Array.isArray(p.slot_times)
        ? p.slot_times.map((t) => ({
            start: t.start,
            end: t.end,
            label: t.label || "",
          }))
        : [],
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      effective_from: p.effective_from || "",
      effective_to: p.effective_to || "",
      sort_order: p.sort_order ?? 0,
      is_active: !!p.is_active,
    });
    setIncludeInput("");
<<<<<<< HEAD
    setSlotDraft({ start: "", end: "", label: "", capacity: "" });
=======
    setSlotDraft({ start: "", end: "", label: "" });
    setSlotError(false);
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
    setShowForm(true);
  };

  // ---------- What's included : bullet chips ----------
  const addInclude = () => {
    const val = includeInput.trim();
    if (!val) return;
    if (form.includes.includes(val)) {
      setIncludeInput("");
      return;
    }
    setForm((p) => ({ ...p, includes: [...p.includes, val] }));
    setIncludeInput("");
  };

  const removeInclude = (item) =>
    setForm((p) => ({
      ...p,
      includes: p.includes.filter((i) => i !== item),
    }));

  // ---------- Time slots (multiple, dynamic/recurring) ----------
  const addEndTime = (start, mins) => {
    const [h, m] = String(start).split(":").map(Number);
    const total = h * 60 + m + (mins || 60);
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const addSlot = () => {
<<<<<<< HEAD
    if (!slotDraft.start) {
      toast.error("Select the slot start time");
      return;
    }

    const dur = Number(form.duration_minutes) || 60;
    const end = slotDraft.end || addEndTime(slotDraft.start, dur);
=======
    const dur = Number(form.duration_minutes) || 60;

    // User ne manually time type kiya hai - parse karo
    let start = parseTimeInput(slotDraft.start);
    const endInput = parseTimeInput(slotDraft.end);

    // Sirf END diya ho to START apne aap nikalo (End - duration)
    if (!start && endInput) {
      const [eh, em] = endInput.split(":").map(Number);
      let total = eh * 60 + em - dur;
      if (total < 0) total += 24 * 60;
      start = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
        total % 60
      ).padStart(2, "0")}`;
    }

    if (!start) {
      setSlotError(true);
      toast.error(
        slotDraft.start
          ? "Enter a valid START time (e.g. 07:30 AM)"
          : "Please enter the slot START time"
      );
      return;
    }

    if (slotDraft.end && !endInput) {
      toast.error("Enter a valid END time (e.g. 08:30 AM)");
      return;
    }

    setSlotError(false);

    let end = endInput;
    if (!end) {
      end = addEndTime(start, dur);
    }
    // End <= Start ho to raat cross midnight hai (e.g. 11:00 PM - 12:30 AM)
    // - clock time as it is store hota hai.
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339

    setForm((p) => ({
      ...p,
      slot_times: [
        ...p.slot_times,
        {
<<<<<<< HEAD
          start: slotDraft.start,
          end,
          label: slotDraft.label || "",
          capacity: Number(slotDraft.capacity) || 0,
=======
          start,
          end,
          label: slotDraft.label || "",
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
        },
      ],
    }));

<<<<<<< HEAD
    setSlotDraft({ start: "", end: "", label: "", capacity: "" });
  };

  const removeSlot = (idx) =>
    setForm((p) => ({
=======
    setSlotDraft({ start: "", end: "", label: "" });
    setSlotError(false);
  };

  // End input ka "Auto" hint - duration hisaab se
  const autoEndLabel = useMemo(() => {
    const parsed = parseTimeInput(slotDraft.start);
    if (!parsed) return "based on duration";

    const dur = Number(form.duration_minutes) || 60;
    return to12Hour(addEndTime(parsed, dur));
  }, [slotDraft.start, form.duration_minutes]);

  const removeSlot = (idx) =>    setForm((p) => ({
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      ...p,
      slot_times: p.slot_times.filter((_, i) => i !== idx),
    }));

  const handleSave = async () => {
    if (!form.service_id) return toast.error("Select a service");
<<<<<<< HEAD
=======
    if (!form.service_kind) return toast.error("Select a service type");
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
    if (!form.name.trim()) return toast.error("Package name is required");
    if (form.fee === "" || Number(form.fee) < 0)
      return toast.error("Base fee is required");
    if (form.effective_from && form.effective_to && form.effective_to < form.effective_from)
      return toast.error("End date cannot be before start date");

    try {
      setSaving(true);
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === null) delete payload[k];
      });
      payload.name = form.name.trim();
      payload.includes = form.includes;
      payload.max_persons = Number(form.max_persons) || 1;
      payload.persons_served = Number(form.persons_served) || 1;
      payload.slot_times = form.slot_times;
      payload.sort_order = form.sort_order || 0;

<<<<<<< HEAD
=======
      // Daily limit HAMESHA bhejo (0 = unlimited). Agar ye delete ho gaya to
      // dusre package me purana limit reh jayega aur portal par old value dikhega.
      payload.daily_quota = Number(form.daily_quota) || 0;

>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      if (editing) {
        await axios.put(
          `${base}/seva/packages/${editing.package_id}`,
          payload,
          { headers }
        );
        toast.success("Package updated");
      } else {
        await axios.post(`${base}/seva/packages`, payload, { headers });
        toast.success("Package created");
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

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete package "${p.name}"?`)) return;
    try {
      await axios.delete(`${base}/seva/packages/${p.package_id}`, { headers });
      toast.success("Package deleted");
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
        title={editing ? "Edit Package" : "Add Package"}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        saving={saving}
        submitLabel={editing ? "Update" : "Create"}
      >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Package Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Basic (1 person)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Base Fee (Rs) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.fee}
                onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Pooja Duration
              </label>
              <input
                type="number"
                min="1"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duration_minutes: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Persons per Group
              </label>
              <input
                type="number"
                min="1"
                value={form.max_persons}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    max_persons: e.target.value,
                    persons_served:
                      Number(p.persons_served) > Number(e.target.value)
                        ? e.target.value
                        : p.persons_served,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Persons Served
              </label>
              <input
                type="number"
                min="1"
                max={Number(form.max_persons) || 1}
                value={form.persons_served}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    persons_served: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Daily Limit (persons / day for this seva)
              </label>
              <input
                type="number"
                min="0"
                value={form.daily_quota}
                onChange={(e) =>
                  setForm((p) => ({ ...p, daily_quota: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={form.effective_from}
                onChange={(e) =>
                  setForm((p) => ({ ...p, effective_from: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={form.effective_to}
                onChange={(e) =>
                  setForm((p) => ({ ...p, effective_to: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
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

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              What's included
            </label>
            <div className="flex gap-2">
              <input
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInclude();
                  }
                }}
                placeholder="Type an item and press Enter"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addInclude}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Add
              </button>
            </div>
            {form.includes.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {form.includes.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeInclude(item)}
                      className="text-gray-400 hover:text-red-600"
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* TIME SLOTS - dynamic (recurring) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Time Slots
            </label>
            <p className="mb-2 text-[10px] text-gray-500">
              Ye time slots roz repeat honge — har date par automatically
              available. Multiple add kar sakte hain.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                  Start
                </label>
                <input
                  type="time"
                  value={slotDraft.start}
                  onChange={(e) =>
                    setSlotDraft((s) => ({ ...s, start: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                  End
                </label>
                <input
                  type="time"
                  value={slotDraft.end}
                  onChange={(e) =>
                    setSlotDraft((s) => ({ ...s, end: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                  Label
                </label>
                <input
                  value={slotDraft.label}
                  onChange={(e) =>
                    setSlotDraft((s) => ({ ...s, label: e.target.value }))
                  }
                  placeholder="Mangala Aarti"
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                  Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={slotDraft.capacity}
                  onChange={(e) =>
                    setSlotDraft((s) => ({
                      ...s,
                      capacity: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addSlot}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add Slot
                </button>
              </div>
            </div>

            {form.slot_times.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {form.slot_times.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="font-semibold">
                      {t.start} – {t.end}
                    </span>
                    {t.label && (
                      <span className="text-gray-500">({t.label})</span>
                    )}
                    <span className="text-gray-500">
                      cap {t.capacity || "∞"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      className="ml-auto text-gray-400 hover:text-red-600"
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
      </CrudFormPage>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seva Packages</h1>
          <p className="text-sm text-gray-500">
            Base fee, duration, daily quota and persons limits live here and
            connect to services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packages"
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
<<<<<<< HEAD
=======
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Service Types</option>
            {kinds.map((k) => (
              <option key={k.kind_id ?? k.code} value={k.code}>
                {k.name}
              </option>
            ))}
          </select>
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total Packages", rows.length, "text-gray-900"],
          [
            "Active",
            rows.filter((r) => r.is_active).length,
            "text-emerald-600",
          ],
          [
            "Services Covered",
            new Set(rows.map((r) => r.service_id)).size,
            "text-blue-600",
          ],
          [
            "Avg Fee",
            "Rs. " +
              (
                rows.length
                  ? rows.reduce(
                      (a, r) => a + Number(r.fee || 0),
                      0
                    ) / rows.length
                  : 0
              ).toFixed(0),
            "text-amber-600",
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
                  "Package",
                  "Service",
<<<<<<< HEAD
=======
                  "Service Type",
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
                  "Base Fee",
                  "Pooja Duration",
                  "Daily Limit",
                  "Per Group",
                  "Start - End Date",
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
                <tr key={r.package_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {r.name}
                    </p>
                    {r.description && (
                      <p className="max-w-[14rem] truncate text-[11px] text-gray-500">
                        {r.description}
                      </p>
                    )}
                    {(r.included_list || []).length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {(r.included_list || []).slice(0, 3).map((inc, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1 text-[11px] text-gray-500"
                          >
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                            <span className="truncate">{inc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
<<<<<<< HEAD
                    {r.service_name || "—"}
=======
                    {r.service_name || "â€”"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                      {kindLabel(r.service_kind)}
                    </span>
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Rs. {Number(r.fee || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
<<<<<<< HEAD
                    {r.duration_minutes ? `${r.duration_minutes} min` : "—"}
=======
                    {r.duration_minutes ? `${r.duration_minutes} min` : "â€”"}
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.daily_quota ? `${r.daily_quota} persons` : "Unlimited"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <p className="font-medium text-gray-800">
                      {r.persons_per_booking ?? r.max_persons ?? 1} per group
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {r.persons_served_count ?? r.persons_served ?? 1} served
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {r.effective_from || r.effective_to ? (
                      <>
                        <p className="font-medium text-gray-800">
                          {r.effective_from || "Open"}
                        </p>
                        <p className="text-gray-500">to {r.effective_to || "Open"}</p>
                      </>
                    ) : (
                      <span className="text-gray-400">Always</span>
                    )}
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
                    No packages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
=======
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">
                {editing ? "Edit Package" : "Add Package"}
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
                    Service *
                  </label>
                  <select
                    value={form.service_id}
                    onChange={(e) => {
                      const svcId = e.target.value;
                      const svc = services.find((s) => s.service_id == svcId);

                      // Service Type apne aap service ke type se sync ho jata hai
                      setForm((p) => ({
                        ...p,
                        service_id: svcId,
                        service_kind: svc?.service_kind || p.service_kind,
                      }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">â€” select â€”</option>
                    {visibleServices.length === 0 && (
                      <option value="" disabled>
                        No service of this type
                      </option>
                    )}
                    {visibleServices.map((s) => (
                      <option key={s.service_id} value={s.service_id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Service Type *
                  </label>
                  <select
                    value={form.service_kind}
                    onChange={(e) => {
                      const kind = e.target.value;
                      const cur = services.find(
                        (s) => s.service_id == form.service_id
                      );

                      // Type change kiya to service match na kare to clear
                      setForm((p) => ({
                        ...p,
                        service_kind: kind,
                        service_id:
                          cur && cur.service_kind === kind
                            ? p.service_id
                            : kind
                            ? ""
                            : p.service_id,
                      }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">â€” select â€”</option>
                    {kinds.map((k) => (
                      <option key={k.kind_id ?? k.code} value={k.code}>
                        {k.name} ({k.code})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-gray-500">
                    Service select karne par type apne aap set ho jata hai. Type
                    select karne par sirf usi type ke services dikhenge.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Package Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Basic (1 person)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Base Fee (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.fee}
                    onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Pooja Duration
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, duration_minutes: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Persons per Group
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_persons}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        max_persons: e.target.value,
                        persons_served:
                          Number(p.persons_served) > Number(e.target.value)
                            ? e.target.value
                            : p.persons_served,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Persons Served
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={Number(form.max_persons) || 1}
                    value={form.persons_served}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        persons_served: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Daily Limit (persons / day for this seva)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.daily_quota}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, daily_quota: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.effective_from}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, effective_from: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.effective_to}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, effective_to: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
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

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  What's included
                </label>
                <div className="flex gap-2">
                  <input
                    value={includeInput}
                    onChange={(e) => setIncludeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInclude();
                      }
                    }}
                    placeholder="Type an item and press Enter"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addInclude}
                    className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                {form.includes.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {form.includes.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        <span className="flex-1">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeInclude(item)}
                          className="text-gray-400 hover:text-red-600"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* TIME SLOTS - dynamic (recurring) */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        Time Slots
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Har din repeat hote hain - koi bhi time manually type
                        karein (7:30 AM, 19:45, 05:15...)
                      </p>
                    </div>
                  </div>
                  {form.slot_times.length > 0 && (
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                      {form.slot_times.length} slot
                      {form.slot_times.length > 1 ? "s" : ""} added
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-[10px] font-medium text-gray-500">
                      Start time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={slotDraft.start}
                      onChange={(e) =>
                        setSlotDraft((s) => ({ ...s, start: e.target.value }))
                      }
                      onBlur={() => {
                        const parsed = parseTimeInput(slotDraft.start);
                        if (parsed && parsed !== slotDraft.start) {
                          setSlotDraft((s) => ({
                            ...s,
                            start: to12Hour(parsed),
                          }));
                        }
                      }}
                      placeholder="07:30 AM"
                      className={`w-full rounded-lg border bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 ${
                        slotDraft.start && !parseTimeInput(slotDraft.start)
                          ? "border-red-400"
                          : slotError && !slotDraft.start
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {slotDraft.start && parseTimeInput(slotDraft.start) && (
                      <p className="mt-1 text-[10px] text-emerald-600">
                        {to12Hour(parseTimeInput(slotDraft.start))}
                      </p>
                    )}
                    {slotDraft.start && !parseTimeInput(slotDraft.start) && (
                      <p className="mt-1 text-[10px] text-red-500">
                        Invalid time
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-[10px] font-medium text-gray-500">
                      End time
                    </label>
                    <input
                      type="text"
                      value={slotDraft.end}
                      onChange={(e) =>
                        setSlotDraft((s) => ({ ...s, end: e.target.value }))
                      }
                      onBlur={() => {
                        const parsed = parseTimeInput(slotDraft.end);
                        if (parsed && parsed !== slotDraft.end) {
                          setSlotDraft((s) => ({ ...s, end: to12Hour(parsed) }));
                        }
                      }}
                      placeholder={`Auto (${slotDraft.start ? autoEndLabel : "based on duration"})`}
                      className={`w-full rounded-lg border bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 ${
                        slotDraft.end && !parseTimeInput(slotDraft.end)
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                    />
                    <p className="mt-1 text-[10px] text-gray-500">
                      {slotDraft.end
                        ? parseTimeInput(slotDraft.end)
                          ? to12Hour(parseTimeInput(slotDraft.end))
                          : "Invalid time"
                        : "Leave blank for auto"}
                    </p>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="mb-1 block text-[10px] font-medium text-gray-500">
                      Label
                    </label>
                    <input
                      type="text"
                      value={slotDraft.label}
                      onChange={(e) =>
                        setSlotDraft((s) => ({ ...s, label: e.target.value }))
                      }
                      placeholder="Mangala Aarti"
                      className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-end sm:col-span-2">
                    <button
                      type="button"
                      onClick={addSlot}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-900"
                    >
                      <Plus className="h-4 w-4" /> Add Slot
                    </button>
                  </div>
                </div>

                {form.slot_times.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-gray-200 pt-3">
                    {form.slot_times.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-200"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="font-semibold text-gray-900">
                          {to12Hour(t.start)}
                          {t.end ? ` â€“ ${to12Hour(t.end)}` : ""}
                        </span>
                        {t.label && (
                          <span className="truncate rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                            {t.label}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className="ml-auto shrink-0 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Remove slot"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
    </div>
  );
};

export default SevaPackages;

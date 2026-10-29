/***
 *  I3EMS - AMT ERP  |  ResourceManager (restyled to the AMT Master/Menu design language)
 *  Reusable list + add/edit + workflow CRUD screen. Blue primary, light cards, level/status badges —
 *  matching the existing Menu Management / Master screens.
 *
 *  Searchable dropdowns: any field whose key is a Department / Ledger / Financial-Year id
 *  (Dpt_Id, To_Dpt_Id, From_Dpt_Id, Lg_Id, FY_Id, …) automatically renders a SearchableSelect.
 *  You can also set a field type "lookup" with `source: "department"|"ledger"|"financialYear"` or
 *  `endpoint: "<api>"`.
 *
 *  Props:
 *    title, endpoint, idKey,
 *    columns [{key,label,type: text|date|amount|bool|status}]
 *    fields  [{key,label,type,options?,required?,full?,source?,endpoint?}]
 *    actions [{label,action|path,tone?,body?,done?}]
 */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiRefreshCw, FiAlertCircle,
} from "react-icons/fi";
import SearchableSelect, { LOOKUP_ENDPOINT } from "./searchableselect";
import { T, STATUS_TONE } from "../theme/amtTheme";

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } });
const API = import.meta.env.VITE_API_URL;

const fmt = (v, type) => {
  if (v ==  null || v ==  undefined || v ==  "") return "—";
  if (type ==  "date") { try { return new Date(v).toLocaleDateString("en-GB"); } catch { return v; } }
  if (type ==  "bool") return v == 1 || v ==  true ? "Yes" : "No";
  if (type ==  "amount") return "₹ " + Number(v).toLocaleString("en-IN");
  return String(v);
};

/** Auto-map a field key to a searchable lookup source. */
const LOOKUP_KEY = (key) => {
  if (/(^|_)(Dpt|Dept)_?Id$/i.test(key) || /Dpt_Id$/.test(key)) return "department";
  if (/Lg_Id$/.test(key)) return "ledger";
  if (/FY_Id$/.test(key)) return "financialYear";
  return null;
};

const ResourceManager = ({ title, endpoint, idKey, columns = [], fields = [], actions = [] }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API}/${endpoint}`, auth());
      setRows(res.data?.data || res.data?.rows || []);
    } catch (e) { setError(e.response?.data?.message || "Failed to load records"); }
    finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const openCreate = () => { const d = {}; fields.forEach((f) => (d[f.key] = f.type ==  "bool" ? false : "")); setModal({ mode: "create", data: d }); };
  const openEdit = (row) => setModal({ mode: "edit", data: { ...row } });

  const save = async () => {
    for (const f of fields) if (f.required && !modal.data[f.key] && modal.data[f.key] !=  0) { flash(`${f.label} is required`); return; }
    setSaving(true);
    try {
      if (modal.mode ==  "create") await axios.post(`${API}/${endpoint}`, modal.data, auth());
      else await axios.put(`${API}/${endpoint}/${modal.data[idKey]}`, modal.data, auth());
      setModal(null); flash("Saved successfully"); load();
    } catch (e) { flash(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this record? This can be reversed by an administrator.")) return;
    try { await axios.delete(`${API}/${endpoint}/${row[idKey]}`, auth()); flash("Deleted"); load(); }
    catch (e) { flash(e.response?.data?.message || "Delete failed"); }
  };

  const doAction = async (row, a) => {
    try {
      if (a.path) { await axios.post(`${API}/${endpoint}/${row[idKey]}/${a.path}`, a.body || {}, auth()); flash(a.done || "Done"); }
      else { const remarks = window.prompt(`Remarks for "${a.label}" (optional):`, "") ?? ""; await axios.post(`${API}/${endpoint}/${row[idKey]}/action`, { action: a.action, remarks }, auth()); flash("Status updated"); }
      load();
    } catch (e) { flash(e.response?.data?.message || "Action failed"); }
  };

  const field = (f) => {
    const v = modal.data[f.key] ?? "";
    const set = (val) => setModal((m) => ({ ...m, data: { ...m.data, [f.key]: val } }));
    // Searchable lookups (auto by key, or explicit)
    const lookup = f.type ==  "lookup" ? (f.source || null) : LOOKUP_KEY(f.key);
    if (f.endpoint || lookup) {
      return <SearchableSelect value={v} onChange={set}
        endpoint={f.endpoint || (lookup ? LOOKUP_ENDPOINT[lookup] : undefined)}
        options={f.options} placeholder={`Select ${f.label}…`} />;
    }
    if (f.type ==  "select")
      return <select className={T.input} value={v} onChange={(e) => set(e.target.value)}><option value="">Select…</option>{(f.options || []).map((o) => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}</select>;
    if (f.type ==  "textarea")
      return <textarea className={T.input} rows={3} value={v} onChange={(e) => set(e.target.value)} />;
    if (f.type ==  "bool")
      return <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} className="h-4 w-4 text-blue-600" /> Yes</label>;
    return <input type={f.type ==  "number" ? "number" : f.type ==  "date" ? "date" : "text"} className={T.input} value={v} onChange={(e) => set(e.target.value)} />;
  };

  return (
    <div className={T.page}>
      <div className={T.wrap}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className={T.h1}>{title}</h1>
            <p className={T.sub}>AMT e-Governance · Master</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className={T.btnGhost}><FiRefreshCw /> Refresh</button>
            <button onClick={openCreate} className={T.btnPrimary}><FiPlus /> Add New</button>
          </div>
        </div>

        {toast && <div className={T.toastOk}>{toast}</div>}

        <div className={T.card}>
          {loading ? (
            <div className="text-center py-16"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto" /><p className="mt-2 text-gray-500 text-sm">Loading…</p></div>
          ) : error ? (
            <div className="text-center py-16 text-gray-500"><FiAlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />{error}</div>
          ) : rows.length ==  0 ? (
            <div className="text-center py-16 text-gray-500"><FiAlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />No records yet. Click <b>Add New</b> to create the first entry.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={T.thead}>
                  <tr>{columns.map((c) => <th key={c.key} className={T.th}>{c.label}</th>)}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r, i) => (
                    <tr key={r[idKey] || i} className={i % 2 ? "bg-gray-50/60" : "bg-white"}>
                      {columns.map((c) => (
                        <td key={c.key} className={T.td}>
                          {c.type ==  "status"
                            ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TONE[String(r[c.key]).toUpperCase()] || "bg-gray-100 text-gray-700"}`}>{r[c.key] || "—"}</span>
                            : fmt(r[c.key], c.type)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {actions.map((a) => (
                            <button key={a.label} onClick={() => doAction(r, a)} title={a.label}
                              className={`px-2 py-1 rounded text-xs font-medium ${a.tone ==  "danger" ? "bg-rose-50 text-rose-700 hover:bg-rose-100" : a.tone ==  "primary" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}>{a.label}</button>
                          ))}
                          <button onClick={() => openEdit(r)} className="p-1.5 text-gray-500 hover:text-blue-600" title="Edit"><FiEdit2 /></button>
                          <button onClick={() => remove(r)} className="p-1.5 text-gray-500 hover:text-rose-600" title="Delete"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{modal.mode ==  "create" ? "Add" : "Edit"} — {title}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><FiX /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}{f.required && <span className="text-rose-500"> *</span>}</label>
                  {field(f)}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-2"><FiX /> Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"><FiCheck /> {saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;

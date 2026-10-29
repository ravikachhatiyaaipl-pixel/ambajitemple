/***
 *  I3EMS - AMT ERP | Admin · Menu Management (drag to reorder / change level) — ADMIN CATEGORY ONLY.
 *  Endpoint group: /menu-manager/*  (must sit behind ['auth:sanctum','admin']).
 *
 *  - Drag a row ONTO another row  -> makes it a CHILD of that row (change level / reparent).
 *  - Use the ▲ / ▼ buttons        -> reorder among siblings (GrSrn).
 *  - Eye toggles visibility.
 *  Matches the AMT Menu Management design: stat tiles, level badges (L1–L4), Visible/Hidden pills.
 */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { FiPlus, FiEye, FiEyeOff, FiChevronUp, FiChevronDown, FiRefreshCw, FiMove, FiCornerDownRight } from "react-icons/fi";
import { T, LEVEL_BADGE, STAT_TONES } from "../../theme/amtTheme";

const API = import.meta.env.VITE_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } });

const isAdmin = (user) => {
  if (!user) return false;
  const rn = String(user.Role_Name || user.role_name || user.role || "").toLowerCase();
  return user.is_admin ==  1 || user.Is_Admin ==  1 || rn.includes("admin") || rn.includes("super");
};

/** Flatten tree to ordered rows with depth. */
function flatten(nodes, depth = 0, out = []) {
  for (const n of nodes || []) { out.push({ ...n, depth }); if (n.children?.length) flatten(n.children, depth + 1, out); }
  return out;
}

export default function MenuManager({ user }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(null);
  const [toast, setToast] = useState("");
  const admin = isAdmin(user);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/menu-manager/tree`, auth()); setTree(r.data?.data?.tree || []); }
    catch { setToast("Failed to load menu"); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const rows = useMemo(() => flatten(tree), [tree]);
  const stats = useMemo(() => {
    const s = { total: rows.length, l1: 0, l2: 0, l3: 0, l4: 0, vis: 0, hid: 0, qa: 0 };
    rows.forEach((r) => { s["l" + Math.min(r.level || 1, 4)]++; (r.isvisible ? s.vis++ : s.hid++); if (r.Is_Quick_Action) s.qa++; });
    return s;
  }, [rows]);

  const reparent = async (nodeId, targetGrCod) => {
    if (!admin) return flash("Admin only");
    try { await axios.post(`${API}/menu-manager/reparent`, { Fnc_Id: nodeId, New_UpGrp: targetGrCod }, auth()); flash("Moved"); load(); }
    catch (e) { flash(e.response?.data?.message || "Move failed"); }
  };
  const reorder = async (row, dir) => {
    if (!admin) return flash("Admin only");
    // swap GrSrn with the adjacent sibling (same UpGrp)
    const sibs = rows.filter((x) => x.UpGrp ==  row.UpGrp).sort((a, b) => (+a.GrSrn) - (+b.GrSrn));
    const i = sibs.findIndex((x) => x.Fnc_Id ==  row.Fnc_Id);
    const j = dir ==  "up" ? i - 1 : i + 1;
    if (j < 0 || j >= sibs.length) return;
    const items = [{ Fnc_Id: sibs[i].Fnc_Id, GrSrn: sibs[j].GrSrn }, { Fnc_Id: sibs[j].Fnc_Id, GrSrn: sibs[i].GrSrn }];
    try { await axios.post(`${API}/menu-manager/reorder`, { items }, auth()); flash("Reordered"); load(); }
    catch (e) { flash(e.response?.data?.message || "Reorder failed"); }
  };
  const toggle = async (row) => {
    if (!admin) return flash("Admin only");
    try { await axios.post(`${API}/menu-manager/${row.Fnc_Id}/visible`, {}, auth()); load(); }
    catch (e) { flash(e.response?.data?.message || "Failed"); }
  };

  if (!admin) return (
    <div className={T.page}><div className={T.wrap}><div className={T.card + " p-10 text-center text-gray-500"}>
      <FiMove className="mx-auto h-8 w-8 mb-2 text-gray-300" />Menu Management is restricted to admin-category users.</div></div></div>
  );

  const STAT = [["Total Menu Items", stats.total], ["Level 1", stats.l1], ["Level 2", stats.l2], ["Level 3", stats.l3], ["Level 4", stats.l4], ["Visible", stats.vis], ["Hidden", stats.hid], ["Quick Actions", stats.qa]];

  return (
    <div className={T.page}>
      <div className={T.wrap}>
        <div className="flex items-center justify-between mb-4">
          <div><h1 className={T.h1}>Menu Management</h1><p className={T.sub}>Manage hierarchical menu items · drag a row onto another to change its level; use ▲▼ to reorder</p></div>
          <div className="flex gap-2"><button onClick={load} className={T.btnGhost}><FiRefreshCw /> Refresh</button>
            <button className={T.btnPrimary}><FiPlus /> Add Menu Item</button></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
          {STAT.map(([label, val], i) => (
            <div key={label} className={`rounded-xl border border-gray-200 p-3 ${STAT_TONES[i % STAT_TONES.length]}`}>
              <div className="text-[11px] font-medium opacity-80">{label}</div>
              <div className="text-xl font-bold mt-1">{val}</div>
            </div>
          ))}
        </div>

        {toast && <div className={T.toastOk}>{toast}</div>}

        <div className={T.card}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={T.thead}><tr>
                <th className={T.th}>Menu Details</th><th className={T.th}>Menu Links</th>
                <th className={T.th}>Group Codes</th><th className={T.th}>Level</th>
                <th className={T.th}>Visibility</th><th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={6} className="text-center py-14 text-gray-400">Loading…</td></tr> :
                rows.map((r) => (
                  <tr key={r.Fnc_Id}
                    draggable={admin}
                    onDragStart={() => setDrag(r)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (drag && drag.Fnc_Id !=  r.Fnc_Id) reparent(drag.Fnc_Id, r.GrCod); setDrag(null); }}
                    className={`${drag?.Fnc_Id ==  r.Fnc_Id ? "opacity-50" : ""} hover:bg-blue-50/40`}>
                    <td className={T.td}>
                      <div className="flex items-center" style={{ paddingLeft: (r.depth || 0) * 22 }}>
                        {r.depth > 0 && <FiCornerDownRight className="text-gray-300 mr-1" />}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold mr-2 ${LEVEL_BADGE[Math.min(r.level || 1, 4)]}`}>L{Math.min(r.level || 1, 4)}</span>
                        <span className="font-medium text-gray-800">{r.Fnc_Title || r.Fnc_Desc || "—"}</span>
                        <span className="text-[11px] text-gray-400 ml-2">ID: {r.Fnc_Id}</span>
                        <FiMove className="text-gray-300 ml-2 cursor-grab" title="Drag onto another row to reparent" />
                      </div>
                    </td>
                    <td className={T.td}>{r.Menu_Links ? <span className="text-blue-600">{r.Menu_Links}</span> : <span className="text-gray-400">No link</span>}</td>
                    <td className={T.td}><div className="text-xs">Code: {r.GrCod}</div><div className="text-[11px] text-gray-400">Parent: {r.UpGrp}</div></td>
                    <td className={T.td}><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_BADGE[Math.min(r.level || 1, 4)]}`}>Level {Math.min(r.level || 1, 4)}</span></td>
                    <td className={T.td}>{r.isvisible ? <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">Visible</span> : <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Hidden</span>}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button onClick={() => reorder(r, "up")} className="p-1.5 text-gray-500 hover:text-blue-600" title="Move up"><FiChevronUp /></button>
                        <button onClick={() => reorder(r, "down")} className="p-1.5 text-gray-500 hover:text-blue-600" title="Move down"><FiChevronDown /></button>
                        <button onClick={() => toggle(r)} className="p-1.5 text-gray-500 hover:text-amber-600" title="Toggle visibility">{r.isvisible ? <FiEye /> : <FiEyeOff />}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

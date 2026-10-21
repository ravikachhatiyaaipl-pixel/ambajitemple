/***
 *  I3EMS - AMT ERP | Admin · Dashboard → Department Assignment
 *  Assign a dashboard to a department (one default per dept). After login, users land on the
 *  dashboard assigned to their department (see PostLoginDashboard.jsx / GET /my-dashboard).
 *  Endpoints: /dashboard-master, /dashboard-assignments, /dashboard-assign, /dashboard-assign/{id}
 */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiRefreshCw, FiStar } from "react-icons/fi";
import SearchableSelect, { LOOKUP_ENDPOINT } from "../../components/searchableselect";
import { T } from "../../theme/amtTheme";

const API = import.meta.env.VITE_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } });

export default function DashboardAssignment() {
  const [dashboards, setDashboards] = useState([]);
  const [assign, setAssign] = useState([]);
  const [form, setForm] = useState({ DSH_Id: "", Dpt_Id: "", Is_Default: true });
  const [toast, setToast] = useState("");
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const load = useCallback(async () => {
    try {
      const [d, a] = await Promise.all([
        axios.get(`${API}/dashboard-master`, auth()),
        axios.get(`${API}/dashboard-assignments`, auth()),
      ]);
      setDashboards(d.data?.data || []);
      setAssign(a.data?.data || []);
    } catch { flash("Failed to load"); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.DSH_Id || !form.Dpt_Id) return flash("Select dashboard and department");
    try { await axios.post(`${API}/dashboard-assign`, form, auth()); flash("Assigned"); setForm({ DSH_Id: "", Dpt_Id: "", Is_Default: true }); load(); }
    catch (e) { flash(e.response?.data?.message || "Assign failed"); }
  };
  const remove = async (id) => { try { await axios.delete(`${API}/dashboard-assign/${id}`, auth()); flash("Removed"); load(); } catch { flash("Failed"); } };

  return (
    <div className={T.page}>
      <div className={T.wrap}>
        <div className="flex items-center justify-between mb-4">
          <div><h1 className={T.h1}>Dashboard → Department Assignment</h1><p className={T.sub}>Assign each department the dashboard its users see after login</p></div>
          <button onClick={load} className={T.btnGhost}><FiRefreshCw /> Refresh</button>
        </div>
        {toast && <div className={T.toastOk}>{toast}</div>}

        <div className={T.card + " p-5 mb-5"}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Dashboard</label>
              <SearchableSelect value={form.DSH_Id} onChange={(v) => setForm({ ...form, DSH_Id: v })}
                options={dashboards.map((d) => ({ value: d.DSH_Id, label: d.DSH_Name }))} placeholder="Select dashboard…" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <SearchableSelect value={form.Dpt_Id} onChange={(v) => setForm({ ...form, Dpt_Id: v })}
                endpoint={LOOKUP_ENDPOINT.department} placeholder="Search department…" /></div>
            <label className="inline-flex items-center gap-2 text-sm mt-6"><input type="checkbox" checked={form.Is_Default} onChange={(e) => setForm({ ...form, Is_Default: e.target.checked })} className="h-4 w-4 text-blue-600" /> Default for department</label>
            <button onClick={submit} className={T.btnPrimary}><FiPlus /> Assign</button>
          </div>
        </div>

        <div className={T.card}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={T.thead}><tr>
              <th className={T.th}>Department</th><th className={T.th}>Dashboard</th><th className={T.th}>Default</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {assign.length ==  0 ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">No assignments yet.</td></tr> :
              assign.map((a) => (
                <tr key={a.DDM_Id} className="hover:bg-blue-50/40">
                  <td className={T.td}>{a.Department || ("Dept #" + a.Dpt_Id)}</td>
                  <td className={T.td}>{a.Dashboard}</td>
                  <td className={T.td}>{a.Is_Default ? <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium"><FiStar /> Default</span> : "—"}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => remove(a.DDM_Id)} className="p-1.5 text-gray-500 hover:text-rose-600"><FiTrash2 /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

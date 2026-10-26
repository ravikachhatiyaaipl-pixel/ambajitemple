/***
 *  I3EMS - AMT ERP | Admin Dashboard (Shree Ambaji Mata Temple Trust)
 *  Data: users / employees / departments / roles (core masters) plus the existing
 *  /dashboards/{finance,estate,hr,executive} summaries. Every secondary feed is optional —
 *  a section simply shows an empty state if its endpoint is unavailable.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, Building2, RefreshCw, Heart, Landmark, FileText, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, ShieldCheck,
} from "lucide-react";
import {
  PortalPage, PortalLoader, HeroBanner, HeroButton, StatCard, StatGrid, Panel,
  TrendChart, BarsChart, DonutChart, ActionTile, EmptyState,
  greeting, todayLabel, countBy, monthlyCounts, TONES,
} from "../components/dashboard/portalkit";
import { inrShort } from "../components/dashboard/dashboardkit";
import { useQuickActions } from "../hooks/usequickactions";

const asArray = (res) => {
  if (res?.status !== "fulfilled") return null;
  const d = res.value?.data;
  if (d && d.success === false) return null;
  const x = d?.data ?? d;
  return Array.isArray(x) ? x : null;
};
const asObject = (res) => {
  if (res?.status !== "fulfilled") return null;
  const d = res.value?.data;
  return d?.success ? d.data : null;
};
const fmtKpi = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);
const KPI_TONE = { green: "green", red: "red", amber: "gold", blue: "teal", violet: "violet", cyan: "teal" };

const PendingRows = ({ items }) => (
  <div className="divide-y divide-gray-100">
    {items.map((p, i) => (
      <Link key={i} to={p.to || "#"} className="group flex items-center justify-between py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-800">{p.title}</p>
          {p.meta && <p className="text-xs text-gray-400">{p.meta}</p>}
        </div>
        <div className="flex items-center gap-2">
          {p.value !== undefined && <span className="text-sm font-semibold text-gray-700">{p.value}</span>}
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-red-600" />
        </div>
      </Link>
    ))}
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [fin, setFin] = useState(null);
  const [est, setEst] = useState(null);
  const [hr, setHr] = useState(null);
  const [exe, setExe] = useState(null);
  const [orgName, setOrgName] = useState("");
  const { quickActions } = useQuickActions();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL;
    const headers = { Authorization: `Bearer ${localStorage.getItem("auth_token")}` };
    const get = (p) => axios.get(`${base}${p}`, { headers });
    try {
      const [dept, usr, emp, rol, f, e, h, x, org] = await Promise.allSettled([
        get("/dpt-master/all/lst-dpt-master"),
        get("/usr-master/all"),
        get("/emp-mast/all"),
        get("/roles/all-role-master"),
        get("/dashboards/finance"),
        get("/dashboards/estate"),
        get("/dashboards/hr"),
        get("/dashboards/executive"),
        get("/lst-org-master"),
      ]);
      setDepartments(asArray(dept) || []);
      setUsers(asArray(usr) || []);
      setEmployees(asArray(emp) || []);
      setRoles(asArray(rol) || []);
      setFin(asObject(f));
      setEst(asObject(e));
      setHr(asObject(h));
      setExe(asObject(x));
      const orgs = asArray(org) || [];
      let selected = null;
      try { selected = JSON.parse(localStorage.getItem("selectedOrganisation") || "null"); } catch { /* ignore */ }
      const match = orgs.find((o) => selected && o.Org_Id == selected.id) || orgs[0];
      setOrgName(match?.Org_Name || selected?.name || "");
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const devoteeRoleId = useMemo(
    () => roles.find((r) => /devot|ભક્ત/i.test(r.Role_Name || ""))?.Role_Id,
    [roles]
  );
  const devoteeCount = useMemo(
    () => (devoteeRoleId ? users.filter((u) => u.Usr_Role_Id == devoteeRoleId).length : 0),
    [users, devoteeRoleId]
  );
  const userName = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user_data") || "null");
      return u?.Usr_Name || localStorage.getItem("username") || "";
    } catch {
      return localStorage.getItem("username") || "";
    }
  }, []);

  const roleName = useMemo(() => {
    const m = {};
    roles.forEach((r) => { m[r.Role_Id] = r.Role_Name; });
    return m;
  }, [roles]);

  const usersByRole = useMemo(
    () => countBy(users, (u) => roleName[u.Usr_Role_Id] || (u.Usr_Role_Id ? `Role ${u.Usr_Role_Id}` : "")).slice(0, 8),
    [users, roleName]
  );
  const newUsers = useMemo(() => monthlyCounts(users, (u) => u.created_at, 6), [users]);
  const hasNewUsers = newUsers.some((m) => m.value > 0);

  const finKpis = (fin?.kpis || []).slice(0, 4);
  const estKpis = (est?.kpis || []).filter((k) => ["shops", "shops_let", "rent", "hall_rev"].includes(k.key)).slice(0, 4);
  const alerts = [...(fin?.alerts || []), ...(est?.alerts || []), ...(hr?.alerts || [])].slice(0, 6);
  const pending = (fin?.pending || []).slice(0, 6);
  const hrKpis = (hr?.kpis || []).slice(0, 4);
  const byDept = Array.isArray(hr?.byDept) ? hr.byDept : [];
  const byType = Array.isArray(hr?.byType) ? hr.byType : [];
  const retirements = (hr?.pending || []).slice(0, 6);

  if (loading) return <PortalLoader />;

  return (
    <PortalPage>
      <HeroBanner
        eyebrow={todayLabel()}
        title={userName ? `${greeting()}, ${userName}` : greeting()}
        subtitle={orgName || undefined}
        actions={<HeroButton onClick={fetchData} icon={RefreshCw} solid>Refresh</HeroButton>}
      />

      {/* Core numbers */}
      <StatGrid cols={4}>
        {devoteeRoleId && (
          <StatCard label="Total Devotees" value={devoteeCount}
            sub={users.length ? `${Math.round((devoteeCount / users.length) * 100)}% of portal users` : undefined}
            icon={Heart} tone="red" />
        )}
        <StatCard label="Total Employees" value={employees.length} icon={UserCheck} tone="green" />
        <StatCard label="Total Departments" value={departments.length} icon={Building2} tone="gold" />
        <StatCard label="Portal Users" value={users.length} sub={`${roles.length || usersByRole.length} roles in use`} icon={ShieldCheck} tone="teal" />
      </StatGrid>

      {/* Finance + estate snapshot */}
      {(finKpis.length > 0 || estKpis.length > 0) && (
        <StatGrid cols={4}>
          {finKpis.map((k) => (
            <StatCard key={`f-${k.key}`} label={k.label} value={fmtKpi(k)} sub="Finance" tone={KPI_TONE[k.accent] || "red"}
              icon={k.key.includes("pay") ? TrendingDown : TrendingUp} to="/dashboards/finance" />
          ))}
          {estKpis.map((k) => (
            <StatCard key={`e-${k.key}`} label={k.label} value={fmtKpi(k)} sub="Estate" tone={KPI_TONE[k.accent] || "gold"}
              icon={Landmark} to="/dashboards/estate" />
          ))}
        </StatGrid>
      )}

      {/* Trend + role split */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Receipts vs Payments" subtitle="Monthly trend" className="lg:col-span-2"
          action={<Link to="/dashboards/finance" className="inline-flex items-center text-xs font-medium text-red-700 hover:underline">Details <ChevronRight className="h-3.5 w-3.5" /></Link>}>
          <TrendChart data={fin?.trend} series={[
            { key: "receipts", name: "Receipts", color: "#059669" },
            { key: "payments", name: "Payments", color: "#B71C1C" },
          ]} />
        </Panel>
        <Panel title="Users by Role" subtitle="Who uses the portal">
          <DonutChart data={usersByRole} centerValue={users.length} centerLabel="users" />
        </Panel>
      </div>

      {(hasNewUsers || retirements.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {hasNewUsers && (
            <Panel title="New Portal Registrations" subtitle="Last 6 months"
              className={retirements.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
              <BarsChart data={newUsers} bars={[{ key: "value", name: "New users", color: "#E53935" }]} height={200} />
            </Panel>
          )}
          {retirements.length > 0 && (
            <Panel title="Retirements Due" subtitle="Next 12 months"
              className={hasNewUsers ? "lg:col-span-1" : "lg:col-span-3"}>
              <PendingRows items={retirements} />
            </Panel>
          )}
        </div>
      )}

      {/* Pending / alerts / quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Vouchers Pending Approval" className="lg:col-span-1">
          {pending.length === 0 ? (
            <EmptyState icon={FileText} text="Nothing pending" height={140} />
          ) : (
            <PendingRows items={pending} />
          )}
        </Panel>
        <Panel title="Alerts" className="lg:col-span-1">
          {alerts.length === 0 ? (
            <EmptyState icon={ShieldCheck} text="All clear — no alerts" height={140} />
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: a.level === "danger" ? "#FDECEC" : a.level === "warning" ? "#FEF3C7" : "#E3F6F9",
                    color: a.level === "danger" ? "#B71C1C" : a.level === "warning" ? "#92400E" : "#0E7490"
                  }}>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Quick Actions" className="lg:col-span-1">
          {quickActions.length === 0 ? (
            <EmptyState icon={FileText} text="No quick actions configured" height={140} />
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {quickActions.map((q) => <ActionTile key={`${q.to}|${q.label}`} {...q} icon={FileText} />)}
            </div>
          )}
        </Panel>
      </div>

    </PortalPage>
  );
};

export default AdminDashboard;

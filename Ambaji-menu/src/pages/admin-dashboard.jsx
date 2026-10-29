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
  Users, UserCheck, Building2, RefreshCw, Heart, Landmark, TrendingUp, TrendingDown,
  AlertTriangle, ChevronRight, ShieldCheck, Zap, Boxes, CalendarCheck, UserCog, Clock,
} from "lucide-react";
import {
  PortalPage, PortalLoader, HeroBanner, HeroButton, StatCard, StatGrid, Panel,
  TrendChart, BarsChart, DonutChart, ActionTile,
  greeting, todayLabel, countBy, monthlyCounts,
} from "../components/dashboard/portalkit";
import { inrShort } from "../components/dashboard/dashboardkit";
import { useQuickActions } from "../hooks/usequickactions";

const DEVOTEE_ROLE_ID = 15;

const HR_ICONS = { on_leave: CalendarCheck, retire: UserCog, ot: Clock };
const HR_KPIS = ["on_leave", "retire", "ot"];
const COLS = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };
const hasRows = (d) => Array.isArray(d) && d.some((r) => Number(r.value) > 0);

// Lays out only the panels that have data, so a missing panel never leaves a blank gap.
const Row = ({ items }) => {
  const vis = items.filter(Boolean);
  if (!vis.length) return null;
  const wide = vis.length === 2 && vis[0].wide;
  const cls = wide ? "lg:grid-cols-3" : COLS[Math.min(vis.length, 4)];
  return (
    <div className={`grid grid-cols-1 gap-4 ${cls}`}>
      {vis.map((v, i) => (
        <div key={v.key} className={wide && i === 0 ? "lg:col-span-2" : ""}>{v.node}</div>
      ))}
    </div>
  );
};

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
  const { quickActions, modules } = useQuickActions();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL;
    const headers = { Authorization: `Bearer ${localStorage.getItem("auth_token")}` };
    const get = (p) => axios.get(`${base}${p}`, { headers });
    try {
      const [dept, usr, emp, rol, f, e, h, x] = await Promise.allSettled([
        get("/dpt-master/all/lst-dpt-master"),
        get("/usr-master/all"),
        get("/emp-mast/all"),
        get("/roles/all-role-master"),
        get("/dashboards/finance"),
        get("/dashboards/estate"),
        get("/dashboards/hr"),
        get("/dashboards/executive"),
      ]);
      setDepartments(asArray(dept) || []);
      setUsers(asArray(usr) || []);
      setEmployees(asArray(emp) || []);
      setRoles(asArray(rol) || []);
      setFin(asObject(f));
      setEst(asObject(e));
      setHr(asObject(h));
      setExe(asObject(x));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const devoteeCount = useMemo(() => users.filter((u) => u.Usr_Role_Id == DEVOTEE_ROLE_ID).length, [users]);

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

  const activeEmployees = useMemo(() => employees.filter((e) => e.Is_Active == 1 || e.Is_Active === true).length, [employees]);
  const hasStatus = employees.some((e) => e.Is_Active !== undefined && e.Is_Active !== null);
  const empStatus = useMemo(() => [
    { label: "Active", value: activeEmployees },
    { label: "Inactive", value: employees.length - activeEmployees },
  ], [employees, activeEmployees]);

  const finKpis = (fin?.kpis || []).slice(0, 4);
  const estKpis = (est?.kpis || []).filter((k) => ["shops", "shops_let", "rent", "hall_rev"].includes(k.key)).slice(0, 4);
  const hrKpis = (hr?.kpis || []).filter((k) => HR_KPIS.includes(k.key));
  const alerts = [...(fin?.alerts || []), ...(est?.alerts || []), ...(hr?.alerts || [])].slice(0, 6);
  const pending = (fin?.pending || []).slice(0, 6);

  // Snapshot cards come only from live dashboard feeds; trimmed to full rows so no empty slot is left.
  const snapshot = [
    ...finKpis.map((k) => ({ key: `f-${k.key}`, label: k.label, value: fmtKpi(k), sub: "Finance", tone: KPI_TONE[k.accent] || "red",
      icon: k.key.includes("pay") ? TrendingDown : TrendingUp, to: "/dashboards/finance" })),
    ...estKpis.map((k) => ({ key: `e-${k.key}`, label: k.label, value: fmtKpi(k), sub: "Estate", tone: KPI_TONE[k.accent] || "gold",
      icon: Landmark, to: "/dashboards/estate" })),
    ...hrKpis.map((k) => ({ key: `h-${k.key}`, label: k.label, value: fmtKpi(k), sub: "HR", tone: KPI_TONE[k.accent] || "green",
      icon: HR_ICONS[k.key] || Users, to: "/dashboards/hr" })),
  ];
  const snapCols = snapshot.length >= 4 ? 4 : snapshot.length;
  const snapCards = snapCols === 4 ? snapshot.slice(0, Math.floor(snapshot.length / 4) * 4) : snapshot;

  const hasTrend = Array.isArray(fin?.trend) && fin.trend.length > 0;
  const deptData = hr?.byDept;
  const donut2 = hasRows(hr?.byType)
    ? { title: "By Employee Type", subtitle: "Staff split", data: hr.byType, label: "staff" }
    : hasStatus && employees.length > 0
      ? { title: "Employee Status", subtitle: "Active vs inactive", data: empStatus, label: "employees" }
      : null;

  if (loading) return <PortalLoader />;

  return (
    <PortalPage>
      <HeroBanner
        eyebrow={todayLabel()}
        title={`${greeting()}, Admin`}
        subtitle="Shree Ambaji Mata Temple Trust Management — overview of people, finance and estate"
        actions={<HeroButton onClick={fetchData} icon={RefreshCw} solid>Refresh</HeroButton>}
      />

      {/* Core numbers */}
      <StatGrid cols={4}>
        <StatCard label="Total Devotees" value={devoteeCount} sub="Registered devotees" icon={Heart} tone="red" />
        <StatCard label="Total Employees" value={employees.length} sub={hasStatus ? `${activeEmployees} active` : undefined} icon={UserCheck} tone="green" />
        <StatCard label="Total Departments" value={departments.length} icon={Building2} tone="gold" />
        <StatCard label="Portal Users" value={users.length} sub={`${roles.length || usersByRole.length} roles in use`} icon={ShieldCheck} tone="teal" />
      </StatGrid>

      {/* Finance / estate / HR snapshot (only live KPIs) */}
      {snapCards.length > 0 && (
        <StatGrid cols={snapCols}>
          {snapCards.map(({ key, ...c }) => <StatCard key={key} {...c} />)}
        </StatGrid>
      )}

      {/* Trend + role split */}
      <Row items={[
        hasTrend && {
          key: "trend", node: (
            <Panel title="Receipts vs Payments" subtitle="Monthly trend" className="h-full"
              action={<Link to="/dashboards/finance" className="inline-flex items-center text-xs font-medium text-red-700 hover:underline">Details <ChevronRight className="h-3.5 w-3.5" /></Link>}>
              <TrendChart data={fin.trend} series={[
                { key: "receipts", name: "Receipts", color: "#059669" },
                { key: "payments", name: "Payments", color: "#B71C1C" },
              ]} />
            </Panel>
          ),
        },
      ]} />

      {/* Employees */}
      <Row items={[
        hasRows(deptData) && {
          key: "dept", wide: true, node: (
            <Panel title="Employees by Department" subtitle="Head-count (top 10)" className="h-full"
              action={<Link to="/dashboards/hr" className="inline-flex items-center text-xs font-medium text-red-700 hover:underline">Details <ChevronRight className="h-3.5 w-3.5" /></Link>}>
              <BarsChart data={deptData} bars={[{ key: "value", name: "Employees", color: "#E53935" }]} height={240} />
            </Panel>
          ),
        },
        donut2 && {
          key: "emp2", node: (
            <Panel title={donut2.title} subtitle={donut2.subtitle} className="h-full">
              <DonutChart data={donut2.data} centerValue={employees.length || undefined} centerLabel={donut2.label} />
            </Panel>
          ),
        },
      ]} />

      {/* Modules (from menu master) */}
      <Row items={[
        modules.length > 0 && {
          key: "modules", node: (
            <Panel title="Modules" subtitle="Open any module" className="h-full">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                {modules.slice(0, 12).map((m) => (
                  <ActionTile key={m.name} to={m.to} icon={Boxes} label={m.name} hint={`${m.count} pages`} tone={m.tone} />
                ))}
              </div>
            </Panel>
          ),
        },
      ]} />

      {/* Users by role + registrations side by side */}
      <Row items={[
        hasRows(usersByRole) && {
          key: "roles", node: (
            <Panel title="Users by Role" subtitle="Who uses the portal" className="h-full">
              <DonutChart data={usersByRole} centerValue={users.length} centerLabel="users" />
            </Panel>
          ),
        },
        hasNewUsers && {
          key: "newusers", node: (
            <Panel title="New Portal Registrations" subtitle="Last 6 months" className="h-full">
              <BarsChart data={newUsers} bars={[{ key: "value", name: "New users", color: "#E53935" }]} height={220} />
            </Panel>
          ),
        },
      ]} />

      {/* Pending / alerts / quick actions (each shown only when it has data) */}
      <Row items={[
        pending.length > 0 && {
          key: "pending", node: (
            <Panel title="Vouchers Pending Approval" className="h-full">
              <div className="divide-y divide-gray-100">
                {pending.map((p, i) => (
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
            </Panel>
          ),
        },
        alerts.length > 0 && {
          key: "alerts", node: (
            <Panel title="Alerts" className="h-full">
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
            </Panel>
          ),
        },
        quickActions.length > 0 && {
          key: "quick", node: (
            <Panel title="Quick Actions" subtitle="Set in Menu Master" className="h-full">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {quickActions.slice(0, 8).map((q) => <ActionTile key={`${q.to}|${q.label}`} {...q} icon={Zap} />)}
              </div>
            </Panel>
          ),
        },
      ]} />

    </PortalPage>
  );
};

export default AdminDashboard;

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
  Users, UserCheck, Building2, RefreshCw, Wallet, IndianRupee, UserCog, Heart,
  BarChart3, Landmark, CalendarCheck, Package, HandCoins, FileText, Gavel, Boxes,
  TrendingUp, TrendingDown, AlertTriangle, ChevronRight, ShieldCheck, Home,
  BookOpen, CreditCard,
} from "lucide-react";
import {
  PortalPage, PortalLoader, HeroBanner, HeroButton, StatCard, StatGrid, Panel,
  TrendChart, BarsChart, DonutChart, ActionTile, EmptyState,
  greeting, todayLabel, countBy, monthlyCounts, TONES,
} from "../components/dashboard/portalkit";
import { inrShort } from "../components/dashboard/dashboardkit";

const DEVOTEE_ROLE_ID = 15;

const MODULES = [
  { name: "Accounting & Finance", desc: "Ledger, vouchers, bank reconciliation, GST/TDS compliance", icon: Wallet, tone: "red", to: "/dashboards/finance" },
  { name: "Payroll", desc: "Salary, PF, Gratuity, Bonus, payslips, statutory deductions", icon: IndianRupee, tone: "green", to: "/dashboards/payroll" },
  { name: "Human Resource", desc: "Employee master, attendance, leave, transfer, appraisal", icon: UserCog, tone: "violet", to: "/dashboards/hr" },
  { name: "Devotee Management", desc: "Devotee records, historic control, auto notifications", icon: Heart, tone: "red" },
  { name: "Estate & Property", desc: "Land, buildings, assets, survey, legal documents", icon: Landmark, tone: "gold", to: "/dashboards/estate" },
  { name: "Booking Management", desc: "Tithi Bhojan, Puja booking, hall reservations", icon: CalendarCheck, tone: "teal" },
  { name: "Inventory", desc: "Stock items, purchase entries, vendor supply", icon: Package, tone: "slate" },
  { name: "Loan Management", desc: "Sanction, repayment tracking, EMI records", icon: HandCoins, tone: "teal" },
  { name: "Reports & MIS", desc: "Statutory reports, printable MIS, decision support", icon: BarChart3, tone: "gold", to: "/dashboards/executive" },
  { name: "Tender & Procurement", desc: "Vendor registration, tender workflow, approvals", icon: Gavel, tone: "slate", to: "/dashboards/tender" },
  { name: "Donation", desc: "Contributions, coupons, donation history", icon: Boxes, tone: "violet" },
  { name: "Documents", desc: "Central repository, uploads, filters, audit trail", icon: FileText, tone: "green" },
];

const QUICK = [
  { label: "Cash Book", hint: "Daily receipts & payments", to: "/reports/cash-bank/cash-book", icon: BookOpen, tone: "red" },
  { label: "Bank Book", hint: "Bank-wise transactions", to: "/reports/cash-bank/bank-book", icon: CreditCard, tone: "teal" },
  { label: "Trial Balance", hint: "Ledger summary", to: "/reports/core-ledger/trialbalance", icon: TrendingUp, tone: "green" },
  { label: "Shop Rent", hint: "Rent collection status", to: "/reports/estate/shop-rent-collection", icon: Home, tone: "gold" },
  { label: "Hall Bookings", hint: "Booking register", to: "/reports/estate/hall-booking-register", icon: CalendarCheck, tone: "violet" },
  { label: "Employee Master", hint: "Staff records", to: "/masters/employee-records/employee-master", icon: Users, tone: "slate" },
];

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

  const finKpis = (fin?.kpis || []).slice(0, 4);
  const estKpis = (est?.kpis || []).filter((k) => ["shops", "shops_let", "rent", "hall_rev"].includes(k.key)).slice(0, 4);
  const alerts = [...(fin?.alerts || []), ...(est?.alerts || []), ...(hr?.alerts || [])].slice(0, 6);
  const pending = (fin?.pending || []).slice(0, 6);

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
        <StatCard label="Total Employees" value={employees.length} sub="Active staff" icon={UserCheck} tone="green" />
        <StatCard label="Total Departments" value={departments.length} sub="Across temple" icon={Building2} tone="gold" />
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

      {hasNewUsers && (
        <Panel title="New Portal Registrations" subtitle="Last 6 months">
          <BarsChart data={newUsers} bars={[{ key: "value", name: "New users", color: "#E53935" }]} height={200} />
        </Panel>
      )}

      {/* Pending / alerts / quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Vouchers Pending Approval" className="lg:col-span-1">
          {pending.length === 0 ? (
            <EmptyState icon={FileText} text="Nothing pending" height={140} />
          ) : (
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
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {QUICK.map((q) => <ActionTile key={q.label} {...q} />)}
          </div>
        </Panel>
      </div>

    </PortalPage>
  );
};

export default AdminDashboard;

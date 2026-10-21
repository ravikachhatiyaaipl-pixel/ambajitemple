/***
 *  I3EMS - AMT ERP  |  Dashboard: Audit & Compliance
 *  Endpoint: /dashboards/audit  (DashboardController@auditDashboard)
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiDatabase, FiCalendar, FiLayers, FiCheckSquare, FiXCircle, FiUsers,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  PendingList, AlertList, QuickActions, TrendAreaChart, MiniDonut,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = { logs: FiDatabase, today: FiCalendar, tables: FiLayers, approvals: FiCheckSquare, cancelled: FiXCircle, users: FiUsers };
const QUICK = [
  { label: "Audit Log", to: "/reports/admin/audit-log", icon: FiDatabase },
  { label: "Role Master", to: "/reports/admin/role-master-report", icon: FiUsers },
  { label: "Menu (Function Types)", to: "/reports/admin/function-type-report", icon: FiLayers },
  { label: "Dept-Menu-Map", to: "/reports/admin/dept-menu-map-report", icon: FiCheckSquare },
];
const fmt = (k) => `${k.value}${k.suffix || ""}`;

const AuditDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/audit`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        });
        if (res.data?.success) setData(res.data.data);
        else setError(res.data?.message || "Unable to load dashboard");
      } catch (e) {
        setError(e.response?.data?.message || "Error loading dashboard");
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <DashboardShell
      title="Audit & Compliance Dashboard"
      subtitle={currentFinancialYear ? `Financial Year: ${currentFinancialYear.FY_Name || currentFinancialYear.FY_Code}` : ""}
      loading={loading}
    >
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-4 mb-6">{error}</div>}
      {data && (
        <>
          <KpiRow cols={6}>
            {data.kpis.map((k) => (
              <KpiTile key={k.key} label={k.label} value={fmt(k)} accent={k.accent} icon={ICONS[k.key]} />
            ))}
          </KpiRow>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <DashboardSection title="Audit Activity Trend" className="lg:col-span-2">
              <TrendAreaChart data={data.trend} xKey="label" series={[{ key: "value", name: "Log Entries", color: "#0891b2" }]} />
            </DashboardSection>
            <DashboardSection title="By Action"><MiniDonut data={data.byAction} /></DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Recent Audit Entries" className="lg:col-span-2">
              <PendingList items={data.recent} emptyText="No audit entries" />
            </DashboardSection>
            <div className="space-y-4">
              <DashboardSection title="Alerts"><AlertList items={data.alerts} /></DashboardSection>
              <DashboardSection title="Quick Actions"><QuickActions actions={QUICK} /></DashboardSection>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default AuditDashboard;

/***
 *  I3EMS - AMT ERP  |  Dashboard: Establishment / HR
 *  Endpoint: /dashboards/hr  (DashboardController@hrDashboard)
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers, FiUserCheck, FiCalendar, FiLogOut, FiClock, FiGrid,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  PendingList, AlertList, QuickActions, CategoryBarChart, MiniDonut,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = { total: FiUsers, active: FiUserCheck, on_leave: FiCalendar, retire: FiLogOut, ot: FiClock, depts: FiGrid };
const QUICK = [
  { label: "Employee Master", to: "/masters/employee-records/employee-master", icon: FiUsers },
  { label: "Employee Register", to: "/reports/hr/employee-master-register", icon: FiUserCheck },
  { label: "Leave Register", to: "/reports/hr/leave-register", icon: FiCalendar },
  { label: "Attendance Muster", to: "/reports/hr/attendance-muster", icon: FiClock },
  { label: "Retirement-Due", to: "/reports/hr/retirement-due", icon: FiLogOut },
  { label: "Overtime Register", to: "/reports/hr/overtime-register", icon: FiClock },
];
const fmt = (k) => `${k.value}${k.suffix || ""}`;

const HrDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/hr`, {
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
      title="Establishment / HR Dashboard"
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
            <DashboardSection title="Head-count by Department (Top 10)" className="lg:col-span-2">
              <CategoryBarChart data={data.byDept} xKey="label" barKey="value" color="#E53935" money={false} />
            </DashboardSection>
            <DashboardSection title="By Employee Type">
              <MiniDonut data={data.byType} />
            </DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Retirements Due (12 months)" className="lg:col-span-2">
              <PendingList items={data.pending} emptyText="No upcoming retirements" />
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

export default HrDashboard;

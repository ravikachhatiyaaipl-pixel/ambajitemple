/***
 *  I3EMS - AMT ERP  |  Dashboard: Executive / Commissioner
 *  Endpoint: /dashboards/executive  (DashboardController@executiveDashboard)
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiDollarSign, FiFileText, FiPercent, FiTrendingDown,
  FiPieChart, FiActivity, FiMessageSquare, FiCheckSquare,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  AlertList, QuickActions, TrendAreaChart, CategoryBarChart, inrShort,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = {
  revenue: FiDollarSign, demand: FiFileText, efficiency: FiPercent, expenditure: FiTrendingDown,
  allocated: FiPieChart, util: FiActivity, grievances: FiMessageSquare, approvals: FiCheckSquare,
};
const QUICK = [
  { label: "Finance Dashboard", to: "/dashboards/finance", icon: FiActivity },
  { label: "Budget Dashboard", to: "/dashboards/budget", icon: FiPieChart },
  { label: "Budget Utilization", to: "/reports/budget-management/utilization", icon: FiFileText },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/executive`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        });
        if (res.data?.success) setData(res.data.data);
        else setError(res.data?.message || "Unable to load dashboard");
      } catch (e) {
        setError(e.response?.data?.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardShell
      title="Executive / Commissioner Dashboard"
      subtitle={currentFinancialYear ? `Financial Year: ${currentFinancialYear.FY_Name || currentFinancialYear.FY_Code}` : ""}
      loading={loading}
    >
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-4 mb-6">{error}</div>}
      {data && (
        <>
          <KpiRow cols={4}>
            {data.kpis.map((k) => (
              <KpiTile key={k.key} label={k.label} value={fmt(k)} accent={k.accent} icon={ICONS[k.key]} />
            ))}
          </KpiRow>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <DashboardSection title="City Revenue Collection Trend" className="lg:col-span-2">
              <TrendAreaChart data={data.trend} xKey="label" series={[{ key: "collected", name: "Collected", color: "#059669" }]} />
            </DashboardSection>
            <DashboardSection title="Alerts">
              <AlertList items={data.alerts} />
            </DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Department Expenditure (Top 10)" className="lg:col-span-2">
              <CategoryBarChart data={data.deptExpense} xKey="label" barKey="value" color="#dc2626" money />
            </DashboardSection>
            <DashboardSection title="Quick Actions">
              <QuickActions actions={QUICK} />
            </DashboardSection>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default ExecutiveDashboard;

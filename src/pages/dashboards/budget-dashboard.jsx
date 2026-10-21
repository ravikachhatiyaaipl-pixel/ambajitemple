/***
 *  I3EMS - AMT ERP  |  Dashboard: Budget & Pension
 *  Endpoint: /dashboards/budget  (DashboardController@budgetDashboard)
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPieChart, FiActivity, FiDollarSign, FiPercent, FiGrid } from "react-icons/fi";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  AlertList, QuickActions, inr, inrShort,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = { allocated: FiPieChart, utilized: FiActivity, balance: FiDollarSign, util: FiPercent, depts: FiGrid };
const QUICK = [
  { label: "Dept-wise Budget", to: "/reports/budget-management/departmentwise-budget", icon: FiPieChart },
  { label: "Utilization", to: "/reports/budget-management/utilization", icon: FiActivity },
  { label: "Revised Budget", to: "/reports/budget-management/revised-budget", icon: FiDollarSign },
  { label: "Approval Status", to: "/reports/budget-management/budget-approval-status-report", icon: FiPercent },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const BudgetDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/budget`, {
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
      title="Budget & Pension Dashboard"
      subtitle={currentFinancialYear ? `Financial Year: ${currentFinancialYear.FY_Name || currentFinancialYear.FY_Code}` : ""}
      loading={loading}
    >
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-4 mb-6">{error}</div>}
      {data && (
        <>
          <KpiRow cols={5}>
            {data.kpis.map((k) => (
              <KpiTile key={k.key} label={k.label} value={fmt(k)} accent={k.accent} icon={ICONS[k.key]} />
            ))}
          </KpiRow>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Allocated vs Utilized (Top 10 Departments)" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.deptChart} margin={{ top: 8, right: 12, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => inrShort(v)} width={70} />
                  <Tooltip formatter={(v) => inr(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="allocated" name="Allocated" fill="#E53935" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utilized" name="Utilized" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardSection>
            <div className="space-y-4">
              <DashboardSection title="Alerts">
                <AlertList items={data.alerts} />
              </DashboardSection>
              <DashboardSection title="Quick Actions">
                <QuickActions actions={QUICK} />
              </DashboardSection>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default BudgetDashboard;

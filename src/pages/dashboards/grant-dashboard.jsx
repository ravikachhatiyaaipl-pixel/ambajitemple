/***
 *  I3EMS - AMT ERP  |  Dashboard: Grant & Scheme Dashboard
 *  Endpoint: /dashboards/grant
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiHome, FiCalendar, FiDollarSign, FiShoppingBag, FiKey, FiTrendingUp,
  FiActivity, FiAlertOctagon, FiShield, FiAward, FiUsers, FiFileText, FiHeart, FiClipboard,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  PendingList, AlertList, QuickActions, TrendAreaChart, CategoryBarChart, MiniDonut, inrShort,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = { received: FiDollarSign, grant_count: FiFileText, schemes: FiAward, scheme_budget: FiDollarSign };
const QUICK = [
  { label: "Grant Register", to: "/reports/grant/grant-register", icon: FiDollarSign },
  { label: "Scheme Register", to: "/reports/grant/scheme-register", icon: FiAward },
  { label: "Grant Summary", to: "/reports/grant/grant-summary-by-type", icon: FiFileText },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const GrantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/grant`, {
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
      title="Grant & Scheme Dashboard"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <DashboardSection title="Grants by Type"><MiniDonut data={data.byType} money /></DashboardSection>
            <DashboardSection title="Grants by Department (Top 10)"><CategoryBarChart data={data.byDept} xKey="label" barKey="value" color="#C62828" money /></DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Quick Actions" className="lg:col-span-3"><QuickActions actions={QUICK} /></DashboardSection>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default GrantDashboard;

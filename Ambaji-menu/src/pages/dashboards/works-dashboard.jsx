/***
 *  I3EMS - AMT ERP  |  Dashboard: Engineering & Works
 *  Endpoint: /dashboards/works  (DashboardController@worksDashboard)
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiClipboard, FiDollarSign, FiFileText, FiCheckCircle, FiSliders, FiGrid,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  PendingList, AlertList, QuickActions, TrendAreaChart, CategoryBarChart, inrShort,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = { wo: FiClipboard, wo_value: FiDollarSign, tenders: FiFileText, approved: FiCheckCircle, adjustments: FiSliders, depts: FiGrid };
const QUICK = [
  { label: "Work-Order Register", to: "/reports/works/work-order-register", icon: FiClipboard },
  { label: "Financial Summary", to: "/reports/works/financial-summary", icon: FiDollarSign },
  { label: "Work BG Register", to: "/reports/works/work-bg-register", icon: FiFileText },
  { label: "Adjustments", to: "/reports/works/tender-adjustments", icon: FiSliders },
  { label: "Active WO", to: "/reports/tender-management/active-wo", icon: FiCheckCircle },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const WorksDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/works`, {
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
      title="Engineering & Works Dashboard"
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
            <DashboardSection title="Work-Order Value Trend" className="lg:col-span-2">
              <TrendAreaChart data={data.trend} xKey="label" series={[{ key: "value", name: "WO Value", color: "#E53935" }]} />
            </DashboardSection>
            <DashboardSection title="Alerts"><AlertList items={data.alerts} /></DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Work-Order Value by Department (Top 10)" className="lg:col-span-2">
              <CategoryBarChart data={data.deptWo} xKey="label" barKey="value" color="#059669" money />
            </DashboardSection>
            <div className="space-y-4">
              <DashboardSection title="Recent Work Orders"><PendingList items={data.pending} emptyText="No work orders" /></DashboardSection>
              <DashboardSection title="Quick Actions"><QuickActions actions={QUICK} /></DashboardSection>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default WorksDashboard;

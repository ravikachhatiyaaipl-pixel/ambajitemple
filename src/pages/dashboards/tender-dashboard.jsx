/***
 *  I3EMS - AMT ERP  |  Dashboard: Tender Management
 *  Endpoint: /dashboards/tender  (DashboardController@tenderDashboard)
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiFileText, FiZap, FiDollarSign, FiCheckCircle, FiLock, FiShield,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  PendingList, AlertList, QuickActions, TrendAreaChart, MiniDonut, inrShort,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = { total: FiFileText, live: FiZap, proposal: FiDollarSign, approved: FiCheckCircle, emd: FiLock, bg: FiShield };
const QUICK = [
  { label: "EMD Register", to: "/reports/tender-management/emd-register", icon: FiLock },
  { label: "BG Register", to: "/reports/tender-management/bg-register", icon: FiShield },
  { label: "Pending Tender", to: "/reports/tender-management/pending-tender", icon: FiFileText },
  { label: "Tender Allocation", to: "/reports/tender-management/tender-allocation", icon: FiCheckCircle },
  { label: "Over-budgeted", to: "/reports/tender-management/over-budgeted", icon: FiDollarSign },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const TenderDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/tender`, {
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
      title="Tender Management Dashboard"
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
            <DashboardSection title="Approved Tender Value Trend" className="lg:col-span-2">
              <TrendAreaChart data={data.trend} xKey="label" series={[{ key: "value", name: "Approved Value", color: "#C62828" }]} />
            </DashboardSection>
            <DashboardSection title="Tenders by Type">
              <MiniDonut data={data.byType} />
            </DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Tenders Closing Soon" className="lg:col-span-2">
              <PendingList items={data.pending} emptyText="No open tenders" />
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

export default TenderDashboard;

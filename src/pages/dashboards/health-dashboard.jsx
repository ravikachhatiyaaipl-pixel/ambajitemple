/***
 *  I3EMS - AMT ERP  |  Dashboard: Health / Registration Dashboard
 *  Endpoint: /dashboards/health
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

const ICONS = { citizens: FiUsers, cert_types: FiFileText };
const QUICK = [
  { label: "Certificate Types", to: "/reports/health/certificate-types", icon: FiFileText },
  { label: "Citizen Register", to: "/reports/health/citizen-register", icon: FiUsers },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const HealthDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/health`, {
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
      title="Health / Registration Dashboard"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardSection title="Alerts"><AlertList items={data.alerts} /></DashboardSection>
            <DashboardSection title="Quick Actions"><QuickActions actions={QUICK} /></DashboardSection>
          </div>
          {data.note && <p className="text-xs text-gray-400 mt-4">{data.note}</p>}
        </>
      )}
    </DashboardShell>
  );
};

export default HealthDashboard;

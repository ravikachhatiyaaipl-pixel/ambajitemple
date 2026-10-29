/***
 *  I3EMS - AMT ERP  |  Dashboard: Estate (Hall & Shop) Dashboard
 *  Endpoint: /dashboards/estate
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

const ICONS = { halls: FiHome, bookings: FiCalendar, hall_rev: FiDollarSign, shops: FiShoppingBag, shops_let: FiKey, rent: FiDollarSign };
const QUICK = [
  { label: "Hall Bookings", to: "/reports/estate/hall-booking-register", icon: FiCalendar },
  { label: "Hall Revenue", to: "/reports/estate/hall-revenue", icon: FiDollarSign },
  { label: "Shop Register", to: "/reports/estate/shop-register", icon: FiShoppingBag },
  { label: "Shop Rent", to: "/reports/estate/shop-rent-collection", icon: FiDollarSign },
  { label: "Agreements Expiring", to: "/reports/estate/agreements-expiring", icon: FiKey },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const EstateDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/estate`, {
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
      title="Estate (Hall & Shop) Dashboard"
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
            <DashboardSection title="Hall Revenue Trend" className="lg:col-span-2">
              <TrendAreaChart data={data.trend} xKey="label" series={[{ key: "value", name: "Hall Revenue", color: "#059669" }]} />
            </DashboardSection>
            <DashboardSection title="Alerts"><AlertList items={data.alerts} /></DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Upcoming Hall Bookings" className="lg:col-span-2">
              <PendingList items={data.pending} emptyText="No upcoming bookings" />
            </DashboardSection>
            <DashboardSection title="Quick Actions"><QuickActions actions={QUICK} /></DashboardSection>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default EstateDashboard;

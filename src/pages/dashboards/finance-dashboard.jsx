/***
 *  I3EMS - AMT ERP  |  Dashboard: Finance & Accounts
 *  Endpoint: /dashboards/finance  (DashboardController@financeDashboard)
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiDownload, FiUpload, FiTrendingUp, FiCalendar,
  FiCreditCard, FiXCircle, FiClock, FiActivity,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  PendingList, AlertList, QuickActions, TrendAreaChart, inrShort,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = {
  receipts: FiDownload, payments: FiUpload, net: FiActivity, receipts_mtd: FiCalendar,
  payments_mtd: FiCalendar, cheques_pending: FiCreditCard, cheques_bounced: FiXCircle, vouchers_pending: FiClock,
};
const QUICK = [
  { label: "Cash Book", to: "/reports/cash-bank/cash-book", icon: FiDownload },
  { label: "Bank Book", to: "/reports/cash-bank/bank-book", icon: FiCreditCard },
  { label: "Day Book", to: "/reports/cash-bank/day-book-report", icon: FiCalendar },
  { label: "Cheque Register", to: "/reports/cash-bank/cheque-register", icon: FiCreditCard },
  { label: "Bank Reconciliation", to: "/reports/cash-bank/bank-reconciliation", icon: FiActivity },
  { label: "Trial Balance", to: "/reports/core-ledger/trialbalance", icon: FiTrendingUp },
];
const fmt = (k) => (k.money ? inrShort(k.value) : `${k.value}${k.suffix || ""}`);

const FinanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/finance`, {
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
      title="Finance & Accounts Dashboard"
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
            <DashboardSection title="Receipts vs Payments (Monthly)" className="lg:col-span-2">
              <TrendAreaChart
                data={data.trend}
                xKey="label"
                series={[
                  { key: "receipts", name: "Receipts", color: "#059669" },
                  { key: "payments", name: "Payments", color: "#dc2626" },
                ]}
              />
            </DashboardSection>
            <DashboardSection title="Alerts">
              <AlertList items={data.alerts} />
            </DashboardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Vouchers Pending Approval" className="lg:col-span-2">
              <PendingList items={data.pending} emptyText="No vouchers pending" />
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

export default FinanceDashboard;

/***
 *  I3EMS - AMT ERP  |  Dashboard: Payroll (processing metrics)
 *  Endpoint: /dashboards/payroll  (DashboardController@payrollDashboard)
 *  Note: salary rupee amounts live in the Salary Income / Deduction reports.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiFileText,
} from "react-icons/fi";
import {
  DashboardShell, KpiRow, KpiTile, DashboardSection,
  AlertList, QuickActions, CategoryBarChart,
} from "../../components/dashboard/dashboardkit";
import { useFinancialYear } from "../../context/financialyearcontext";

const ICONS = { emp: FiUsers, months: FiCalendar, presence: FiCheckCircle, absent: FiXCircle, ot: FiClock, paybills: FiFileText };
const QUICK = [
  { label: "Monthly Payroll", to: "/reports/hr/monthly-payroll-register", icon: FiUsers },
  { label: "Pay-Bill Summary", to: "/reports/hr/pay-bill-summary", icon: FiFileText },
  { label: "Salary Income", to: "/reports/salary-accounting/salary-income", icon: FiCheckCircle },
  { label: "Salary Deduction", to: "/reports/salary-accounting/salary-deduction", icon: FiXCircle },
  { label: "Absenteeism", to: "/reports/hr/absenteeism", icon: FiXCircle },
];
const fmt = (k) => `${k.value}${k.suffix || ""}`;

const PayrollDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboards/payroll`, {
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
      title="Payroll Dashboard"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashboardSection title="Employees Processed by Month" className="lg:col-span-2">
              <CategoryBarChart data={data.trend} xKey="label" barKey="employees" color="#059669" money={false} />
            </DashboardSection>
            <div className="space-y-4">
              <DashboardSection title="Alerts"><AlertList items={data.alerts} /></DashboardSection>
              <DashboardSection title="Quick Actions"><QuickActions actions={QUICK} /></DashboardSection>
            </div>
          </div>
          {data.note && <p className="text-xs text-gray-400 mt-4">{data.note}</p>}
        </>
      )}
    </DashboardShell>
  );
};

export default PayrollDashboard;

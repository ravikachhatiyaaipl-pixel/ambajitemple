/***
 *  I3EMS - AMT ERP  |  HR / Payroll Reports
 *  Report: Leave Balance   |   Endpoint: /hr-reports/leave-balance
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";
import useHrMasters from "../../../hooks/usehrmasters";

const MENU_LINK = "/reports/hr/leave-balance";
const COLUMNS = [{"key": "Emp_Code", "label": "Emp Code"}, {"key": "Employee", "label": "Employee"}, {"key": "Department", "label": "Department"}, {"key": "Leave_Type", "label": "Leave Type"}, {"key": "Credit", "label": "Credit", "type": "number"}, {"key": "Debit", "label": "Debit", "type": "number"}, {"key": "Balance", "label": "Balance", "type": "number"}];
const INIT = {"dept_id": ""};

const LeaveBalance = () => {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [f, setF] = useState(INIT);

  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();
  const { departments, empTypes, leaveTypes } = useHrMasters();
  const upd = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (currentFinancialYear?.FY_Id) params.append("fy_id", currentFinancialYear.FY_Id);
      Object.entries(f).forEach(([k, v]) => v !=  "" && v != null && params.append(k, v));
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/hr-reports/leave-balance?${params.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } },
      );
      if (res.data?.success) { setRows(res.data.data || []); setTotals(res.data.totals || null); }
      else { setRows([]); setTotals(null); setError(res.data?.message || "No data available"); }
    } catch (e) {
      setRows([]); setTotals(null);
      setError(e.response?.data?.message || "Error loading report");
    } finally { setLoading(false); }
  };

  const onGenerate = () => { setHasGenerated(true); fetchData(); };
  const onClear = () => { setF(INIT); setRows([]); setTotals(null); setHasGenerated(false); setError(""); };

  const filters = (
    <>
      <SelectField label="Department" value={f.dept_id} onChange={(v)=>upd("dept_id",v)} options={departments} valueKey="Dpt_id" labelKey="Dpt_Name" />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Leave Balance"
      organization={organization}
      financialYear={currentFinancialYear ? { name: currentFinancialYear.FY_Name || currentFinancialYear.FY_Code } : null}
      columns={COLUMNS}
      rows={rows}
      totals={totals}
      loading={loading}
      error={error}
      hasGenerated={hasGenerated}
      onGenerate={onGenerate}
      onClear={onClear}
      filters={filters}
      reportCode="HR-LVB-01"
      excelFileName="LeaveBalance"
      groupBy={{ key: "Department", label: "Department" }}
    />
  );
};

export default LeaveBalance;

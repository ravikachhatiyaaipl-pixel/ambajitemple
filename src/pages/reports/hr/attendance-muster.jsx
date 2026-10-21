/***
 *  I3EMS - AMT ERP  |  HR / Payroll Reports
 *  Report: Attendance Muster   |   Endpoint: /hr-reports/attendance-muster
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";
import useHrMasters from "../../../hooks/usehrmasters";

const MENU_LINK = "/reports/hr/attendance-muster";
const COLUMNS = [{"key": "Emp_Code", "label": "Emp Code"}, {"key": "Employee", "label": "Employee"}, {"key": "Department", "label": "Department"}, {"key": "EA_Month", "label": "Month", "type": "number"}, {"key": "Fr_Year", "label": "Year", "type": "number"}, {"key": "total_present", "label": "Present", "type": "number"}, {"key": "total_absent", "label": "Absent", "type": "number"}, {"key": "total_wop", "label": "WOP", "type": "number"}, {"key": "total_weekly_off", "label": "Wk Off", "type": "number"}, {"key": "total_holiday", "label": "Holiday", "type": "number"}, {"key": "total_working_hours", "label": "Work Hrs", "type": "number"}, {"key": "total_overtime_hours", "label": "OT Hrs", "type": "number"}, {"key": "total_late_days", "label": "Late Days", "type": "number"}];
const INIT = {"dept_id": "", "month": "", "year": ""};

const AttendanceMuster = () => {
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
        `${import.meta.env.VITE_API_URL}/hr-reports/attendance-muster?${params.toString()}`,
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
      <NumberField label="Month (1-12)" value={f.month} onChange={(v)=>upd("month",v)} placeholder="e.g. 4" />
      <NumberField label="Year" value={f.year} onChange={(v)=>upd("year",v)} placeholder="e.g. 2026" />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Attendance Muster"
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
      reportCode="HR-ATT-01"
      excelFileName="AttendanceMuster"
      groupBy={{ key: "Department", label: "Department" }}
    />
  );
};

export default AttendanceMuster;

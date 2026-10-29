/***
 *  I3EMS - AMT ERP  |  Admin / Governance Reports
 *  Report: Audit Log Report   |   Endpoint: /admin-reports/audit-log
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/admin/audit-log";
const COLUMNS = [{"key": "Changed_At", "label": "Changed At", "type": "date"}, {"key": "Table_Name", "label": "Table"}, {"key": "Record_Id", "label": "Record", "type": "number"}, {"key": "Action", "label": "Action"}, {"key": "Changed_By", "label": "Changed By"}, {"key": "IP_Address", "label": "IP"}, {"key": "R_Status", "label": "Status"}];
const INIT = {"from_date": "", "to_date": "", "action": ""};

const AuditLog = () => {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [f, setF] = useState(INIT);

  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();
  const upd = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => v !=  "" && v != null && params.append(k, v));
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-reports/audit-log?${params.toString()}`,
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
      <DateField label="From Date" value={f.from_date} onChange={(v)=>upd("from_date",v)} />
      <DateField label="To Date" value={f.to_date} onChange={(v)=>upd("to_date",v)} />
      <SelectField label="Action" value={f.action} onChange={(v)=>upd("action",v)} options={[{v:"INSERT",l:"Insert"},{v:"UPDATE",l:"Update"},{v:"DELETE",l:"Delete"}]} valueKey="v" labelKey="l" />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Audit Log Report"
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
      reportCode="AD-AUD-01"
      excelFileName="AuditLog"
    />
  );
};

export default AuditLog;

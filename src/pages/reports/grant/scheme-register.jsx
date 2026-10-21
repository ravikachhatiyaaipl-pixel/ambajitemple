/***
 *  I3EMS - AMT ERP  |  Scheme Register
 *  Endpoint: /grant-reports/scheme-register
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/grant/scheme-register";
const COLUMNS = [{"key": "Sch_Code", "label": "Code"}, {"key": "Scheme", "label": "Scheme"}, {"key": "Department", "label": "Department"}, {"key": "Grant_Type", "label": "Grant Type"}, {"key": "St_Date", "label": "Start", "type": "date"}, {"key": "Ed_Date", "label": "End", "type": "date"}, {"key": "Budget", "label": "Budget", "type": "amount"}, {"key": "Is_Active", "label": "Active"}];
const INIT = {"is_active": ""};

const SchemeRegister = () => {
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
      if (currentFinancialYear?.FY_Id) params.append("fy_id", currentFinancialYear.FY_Id);
      Object.entries(f).forEach(([k, v]) => v !=  "" && v != null && params.append(k, v));
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/grant-reports/scheme-register?${params.toString()}`,
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
      <SelectField label="Active" value={f.is_active} onChange={(v)=>upd("is_active",v)} options={[{v:"1",l:"Active"},{v:"0",l:"Inactive"}]} valueKey="v" labelKey="l" />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Scheme Register"
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
      reportCode="GR-SCH-01"
      excelFileName="SchemeRegister"
      
    />
  );
};

export default SchemeRegister;

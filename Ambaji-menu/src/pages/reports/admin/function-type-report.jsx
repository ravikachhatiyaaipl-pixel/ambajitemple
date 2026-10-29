/***
 *  I3EMS - AMT ERP  |  Admin / Governance Reports
 *  Report: Function-Type (Menu) Report   |   Endpoint: /admin-reports/function-types
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/admin/function-type-report";
const COLUMNS = [{"key": "Fnc_Id", "label": "ID", "type": "number"}, {"key": "Fnc_Title", "label": "Title"}, {"key": "Mod_Code", "label": "Module"}, {"key": "GrCod", "label": "GrCod"}, {"key": "UpGrp", "label": "UpGrp"}, {"key": "Menu_Links", "label": "Menu Link"}, {"key": "Is_Quick_Action", "label": "Quick"}, {"key": "isvisible", "label": "Visible"}];
const INIT = {"isvisible": ""};

const FunctionTypeReport = () => {
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
        `${import.meta.env.VITE_API_URL}/admin-reports/function-types?${params.toString()}`,
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
      <SelectField label="Visible" value={f.isvisible} onChange={(v)=>upd("isvisible",v)} options={[{v:"1",l:"Visible"},{v:"0",l:"Hidden"}]} valueKey="v" labelKey="l" />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Function-Type (Menu) Report"
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
      reportCode="AD-FNC-01"
      excelFileName="FunctionTypes"
    />
  );
};

export default FunctionTypeReport;

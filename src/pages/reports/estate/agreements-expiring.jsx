/***
 *  I3EMS - AMT ERP  |  Shop Agreements Expiring
 *  Endpoint: /estate-reports/agreements-expiring
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/estate/agreements-expiring";
const COLUMNS = [{"key": "Shop", "label": "Shop"}, {"key": "SPRG_StDt", "label": "Start", "type": "date"}, {"key": "SPRG_EdDt", "label": "Expiry", "type": "date"}, {"key": "Monthly_Rent", "label": "Monthly Rent", "type": "amount"}, {"key": "Status", "label": "Status"}];
const INIT = {"months_ahead": ""};

const AgreementsExpiring = () => {
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
        `${import.meta.env.VITE_API_URL}/estate-reports/agreements-expiring?${params.toString()}`,
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
      <NumberField label="Months Ahead" value={f.months_ahead} onChange={(v)=>upd("months_ahead",v)} placeholder="6" />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Shop Agreements Expiring"
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
      reportCode="SH-EXP-01"
      excelFileName="AgreementsExpiring"
      
    />
  );
};

export default AgreementsExpiring;

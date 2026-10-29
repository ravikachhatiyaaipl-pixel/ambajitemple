/***
 *  I3EMS - AMT ERP  |  Hall Revenue / Collection
 *  Endpoint: /estate-reports/hall-revenue
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/estate/hall-revenue";
const COLUMNS = [{"key": "HLRBTRN_Date", "label": "Date", "type": "date"}, {"key": "Hall", "label": "Hall"}, {"key": "Bill_No", "label": "Bill No"}, {"key": "Type", "label": "Type"}, {"key": "Amount", "label": "Amount", "type": "amount"}, {"key": "DrCr", "label": "Dr/Cr"}, {"key": "Centre", "label": "Centre"}, {"key": "Status", "label": "Status"}];
const INIT = {"from_date": "", "to_date": ""};

const HallRevenue = () => {
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
        `${import.meta.env.VITE_API_URL}/estate-reports/hall-revenue?${params.toString()}`,
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
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Hall Revenue / Collection"
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
      reportCode="HL-REV-01"
      excelFileName="HallRevenue"
      
    />
  );
};

export default HallRevenue;

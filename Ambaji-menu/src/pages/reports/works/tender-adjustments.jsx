/***
 *  I3EMS - AMT ERP  |  Engineering / Works + Tender Reports
 *  Report: Tender Adjustments Register   |   Endpoint: /works-reports/tender-adjustments
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/works/tender-adjustments";
const COLUMNS = [{"key": "TA_Date", "label": "Date", "type": "date"}, {"key": "Bill_No", "label": "Bill No"}, {"key": "Contractor", "label": "Contractor"}, {"key": "WO_Amount", "label": "WO Amount", "type": "amount"}, {"key": "Percentage", "label": "%", "type": "number"}, {"key": "Adj_Amount", "label": "Adj Amount", "type": "amount"}, {"key": "Add_Deduct", "label": "Add/Deduct"}, {"key": "Status", "label": "Status"}];
const INIT = {"status": "", "from_date": "", "to_date": ""};

const TenderAdjustments = () => {
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
        `${import.meta.env.VITE_API_URL}/works-reports/tender-adjustments?${params.toString()}`,
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
      <SelectField label="Status" value={f.status} onChange={(v)=>upd("status",v)} options={[{v:"P",l:"Pending"},{v:"A",l:"Approved"},{v:"R",l:"Rejected"}]} valueKey="v" labelKey="l" />
      <DateField label="From Date" value={f.from_date} onChange={(v)=>upd("from_date",v)} />
      <DateField label="To Date" value={f.to_date} onChange={(v)=>upd("to_date",v)} />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Tender Adjustments Register"
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
      reportCode="WK-ADJ-01"
      excelFileName="TenderAdjustments"
      
    />
  );
};

export default TenderAdjustments;

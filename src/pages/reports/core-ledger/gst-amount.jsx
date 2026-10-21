import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { DateField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/core-ledger/gst-amount";
const COLUMNS = [
  { key: "sr_no", label: "Sr No" },
  { key: "CV_No", label: "CV No" },
  { key: "Party_Name", label: "Party Name" },
  { key: "Amount", label: "Amount", type: "amount" },
  { key: "Tax_Details", label: "Tax Name - Tax Amount" },
  { key: "Net_Amount", label: "Net Amount", type: "amount" },
];
const INIT = { from_date: "", to_date: "" };

const GstAmountReport = () => {
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
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => v != "" && v != null && params.append(k, v));
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/gst-amount-report?${params.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } }
      );
      if (res.data?.success) {
        setRows(res.data.data || []);
        setTotals(res.data.totals || null);
      } else {
        setRows([]);
        setTotals(null);
        setError(res.data?.message || "No data available");
      }
    } catch (e) {
      setRows([]);
      setTotals(null);
      setError(e.response?.data?.message || "Error loading GST amount report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="GST Amount Report"
      organization={organization}
      financialYear={currentFinancialYear ? { name: currentFinancialYear.FY_Name || currentFinancialYear.FY_Code } : null}
      columns={COLUMNS}
      rows={rows}
      totals={totals}
      loading={loading}
      error={error}
      hasGenerated={hasGenerated}
      onGenerate={() => { setHasGenerated(true); fetchData(); }}
      onClear={() => { setF(INIT); setRows([]); setTotals(null); setHasGenerated(false); setError(""); }}
      filters={
        <>
          <DateField label="From Date" value={f.from_date} onChange={(v) => upd("from_date", v)} />
          <DateField label="To Date" value={f.to_date} onChange={(v) => upd("to_date", v)} />
        </>
      }
      reportCode="GST-AMT-01"
      excelFileName="GstAmountReport"
    />
  );
};

export default GstAmountReport;

/***
 *  I3EMS - AMT ERP  |  Hall Booking Register
 *  Endpoint: /estate-reports/hall-booking-register
 */
import React, { useState } from "react";
import axios from "axios";
import ReportShell from "../../../components/reports/reportshell";
import { SelectField, DateField, NumberField } from "../../../components/reports/filterfields";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const MENU_LINK = "/reports/estate/hall-booking-register";
const COLUMNS = [{"key": "HLRB_Date", "label": "Date", "type": "date"}, {"key": "Hall", "label": "Hall"}, {"key": "Event", "label": "Event"}, {"key": "Event_Type", "label": "Type"}, {"key": "Start_Date", "label": "Start", "type": "date"}, {"key": "End_Date", "label": "End", "type": "date"}, {"key": "Rate", "label": "Rate", "type": "amount"}, {"key": "Tax", "label": "Tax", "type": "amount"}, {"key": "Status", "label": "Status"}];
const INIT = {"from_date": "", "to_date": "", "status": ""};

const HallBookingRegister = () => {
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
        `${import.meta.env.VITE_API_URL}/estate-reports/hall-booking-register?${params.toString()}`,
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
      <SelectField label="Status" value={f.status} onChange={(v)=>upd("status",v)} options={[{v:"P",l:"Pending"},{v:"A",l:"Approved"},{v:"C",l:"Closed/Cancelled"}]} valueKey="v" labelKey="l" />
    </>
  );

  return (
    <ReportShell
      menuLink={MENU_LINK}
      defaultTitle="Hall Booking Register"
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
      reportCode="HL-BK-01"
      excelFileName="HallBookingRegister"
      
    />
  );
};

export default HallBookingRegister;

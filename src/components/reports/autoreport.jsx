/***
 *  I3EMS - AMT ERP
 *  Component: AutoReport  (Standardized rebuild wrapper for existing reports)
 *
 *  Calls an existing report endpoint, auto-derives flat columns from the returned
 *  rows (flattening one level of nested objects), and renders everything through
 *  the standardized <ReportShell/> (bilingual header, sub-totals + grand total,
 *  signature block, Print / Excel / PDF).
 *
 *  Used by the "Standardized Reports" menu — a parallel, non-destructive rebuild.
 *  The original report pages remain untouched.
 *
 *  Props:
 *    endpoint     string  API path after VITE_API_URL (e.g. "reports/zone-list")
 *    method       "get" | "post"        (default get)
 *    title        string
 *    menuLink     string  route path for dynamic title lookup
 *    reportCode   string
 *    filters      array of "dept" | "from" | "to" | "status"   (optional)
 *    dataPath     optional fn(resData) -> array   (override extraction)
 *    amountHint   optional array of extra column keys to format as ₹
 */
import React, { useState, useMemo } from "react";
import axios from "axios";
import ReportShell from "./reportshell";
import { SelectField, DateField } from "./filterfields";
import { useOrganization } from "../../hooks/useorganization";
import { useFinancialYear } from "../../context/financialyearcontext";
import useHrMasters from "../../hooks/usehrmasters";

const AMOUNT_RE = /(amount|amt|value|rent|budget|total|net|paid|balance|arrear|rebate|penalty|proposal|approved|gross|deduction|allowance|fee|emd|_bg|bg_|collected|demand|outstanding|expense|income|revenue|opening|closing|debit|credit|dr_|cr_)/i;
const DATE_RE = /(date|_dt|_at|dob|birth|expiry|due)/i;

const prettify = (k) =>
  String(k)
    .replace(/[_\.]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const isPrimitive = (v) =>
  v ==  null || ["string", "number", "boolean"].includes(typeof v);

// Flatten one level: nested object -> "key.subkey" primitive columns
const flattenRow = (row) => {
  const out = {};
  Object.entries(row || {}).forEach(([k, v]) => {
    if (isPrimitive(v)) out[k] = v;
    else if (v && typeof v ==  "object" && !Array.isArray(v)) {
      Object.entries(v).forEach(([sk, sv]) => {
        if (isPrimitive(sv)) out[`${k}.${sk}`] = sv;
      });
    }
  });
  return out;
};

const inferColumns = (rows, amountHint = []) => {
  const keys = [];
  const seen = new Set();
  rows.slice(0, 20).forEach((r) => {
    Object.keys(flattenRow(r)).forEach((k) => {
      if (!seen.has(k)) { seen.add(k); keys.push(k); }
    });
  });
  return keys.map((k) => {
    let type = "text";
    const sample = rows.map((r) => flattenRow(r)[k]).find((v) => v !=  null && v !=  undefined);
    const numeric = typeof sample ==  "number" || (!isNaN(parseFloat(sample)) && isFinite(sample) && sample !=  "" && sample !=  true && sample !=  false);
    if (DATE_RE.test(k)) type = "date";
    else if (amountHint.includes(k) || (AMOUNT_RE.test(k) && numeric)) type = "amount";
    else if (numeric && !/^(id|no|code|year|month|pin|mobile|phone|aadhar|pan)/i.test(k)) type = "number";
    return { key: k, label: prettify(k.split(".").pop() ==  k ? k : k), type, accessor: (row) => flattenRow(row)[k] };
  });
};

const extractArray = (resData, dataPath) => {
  if (dataPath) return dataPath(resData) || [];
  const d = resData?.data ?? resData;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(d?.ledgers)) return d.ledgers;
  if (Array.isArray(d?.records)) return d.records;
  // object of arrays -> first array
  if (d && typeof d ==  "object") {
    const arr = Object.values(d).find((v) => Array.isArray(v));
    if (arr) return arr;
  }
  return [];
};

const AutoReport = ({
  endpoint,
  method = "get",
  title = "Report",
  menuLink,
  reportCode = "",
  filters = [],
  dataPath,
  amountHint = [],
  group = null,
}) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [f, setF] = useState({ dept_id: "", from_date: "", to_date: "", status: "" });

  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();
  const { departments } = useHrMasters();
  const upd = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const totals = useMemo(() => {
    if (!rows.length || !columns.length) return null;
    const t = {};
    let any = false;
    columns.forEach((c) => {
      if (c.type ==  "amount" || c.type ==  "number") {
        t[c.key] = rows.reduce((a, r) => a + (parseFloat(c.accessor(r)) || 0), 0);
        any = true;
      }
    });
    return any ? t : null;
  }, [rows, columns]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (currentFinancialYear?.FY_Id) {
        params.append("fy_id", currentFinancialYear.FY_Id);
        params.append("fin_year", currentFinancialYear.FY_Id);
      }
      if (filters.includes("dept") && f.dept_id) { params.append("dept_id", f.dept_id); params.append("Dpt_Id", f.dept_id); }
      if (filters.includes("from") && f.from_date) { params.append("from_date", f.from_date); params.append("start_date", f.from_date); }
      if (filters.includes("to") && f.to_date) { params.append("to_date", f.to_date); params.append("end_date", f.to_date); }
      if (filters.includes("status") && f.status) params.append("status", f.status);

      const url = `${import.meta.env.VITE_API_URL}/${endpoint}?${params.toString()}`;
      const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } };
      const res = method ==  "post" ? await axios.post(url, {}, cfg) : await axios.get(url, cfg);

      const arr = extractArray(res.data, dataPath);
      if (arr.length) {
        setColumns(inferColumns(arr, amountHint));
        setRows(arr);
      } else {
        setRows([]); setColumns([]);
        setError(res.data?.message || "No data available for the selected filters");
      }
    } catch (e) {
      setRows([]); setColumns([]);
      setError(e.response?.data?.message || "Error loading report");
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = () => { setHasGenerated(true); fetchData(); };
  const onClear = () => { setF({ dept_id: "", from_date: "", to_date: "", status: "" }); setRows([]); setColumns([]); setHasGenerated(false); setError(""); };

  const filterEls = filters.length ? (
    <>
      {filters.includes("dept") && (
        <SelectField label="Department" value={f.dept_id} onChange={(v) => upd("dept_id", v)} options={departments} valueKey="Dpt_id" labelKey="Dpt_Name" />
      )}
      {filters.includes("from") && <DateField label="From Date" value={f.from_date} onChange={(v) => upd("from_date", v)} />}
      {filters.includes("to") && <DateField label="To Date" value={f.to_date} onChange={(v) => upd("to_date", v)} />}
      {filters.includes("status") && (
        <SelectField label="Status" value={f.status} onChange={(v) => upd("status", v)} options={[{ v: "P", l: "Pending" }, { v: "A", l: "Approved" }, { v: "R", l: "Rejected" }]} valueKey="v" labelKey="l" />
      )}
    </>
  ) : null;

  return (
    <ReportShell
      menuLink={menuLink}
      defaultTitle={title}
      organization={organization}
      financialYear={currentFinancialYear ? { name: currentFinancialYear.FY_Name || currentFinancialYear.FY_Code } : null}
      columns={columns}
      rows={rows}
      totals={totals}
      loading={loading}
      error={error}
      hasGenerated={hasGenerated}
      onGenerate={onGenerate}
      onClear={onClear}
      filters={filterEls || <div className="text-sm text-gray-500">Click Generate Report to load.</div>}
      reportCode={reportCode}
      excelFileName={title.replace(/\s+/g, "")}
      group={group}
    />
  );
};

export default AutoReport;

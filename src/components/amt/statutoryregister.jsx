/***
 *  I3EMS - AMT ERP  |  StatutoryRegister
 *
 *  Declarative statutory salary-deduction register built on the standardized
 *  <ReportShell/> (bilingual header, totals, signatures, Print / Excel / PDF).
 *  Adds Month / Year (and optional deduction-type) filters that the shared
 *  AutoReport does not provide, which statutory challans require.
 *
 *  Endpoint envelope expected: { success, data:[...], totals:{...}, meta:{deposit_account, authority, due_day, employee_rate, employer_rate} }
 *
 *  Props:
 *    endpoint    string   e.g. "statutory-reports/pf"
 *    title       string
 *    menuLink    string
 *    reportCode  string
 *    columns     [{ key, label, type, align }]   (type: text|amount|number|date)
 *    typeOptions [{ v, l }]                       optional deduction-type toggle (?type=)
 */
import React, { useState, useMemo } from "react";
import axios from "axios";
import ReportShell from "../reports/reportshell";
import { useOrganization } from "../../hooks/useorganization";
import { useFinancialYear } from "../../context/financialyearcontext";

const MONTHS = [
  { v: 1, l: "April" },
  { v: 2, l: "May" },
  { v: 3, l: "June" },
  { v: 4, l: "July" },
  { v: 5, l: "August" },
  { v: 6, l: "September" },
  { v: 7, l: "October" },
  { v: 8, l: "November" },
  { v: 9, l: "December" },
  { v: 10, l: "January" },
  { v: 11, l: "February" },
  { v: 12, l: "March" },
];
const CAL_MONTHS = [
  { v: 1, l: "January" },
  { v: 2, l: "February" },
  { v: 3, l: "March" },
  { v: 4, l: "April" },
  { v: 5, l: "May" },
  { v: 6, l: "June" },
  { v: 7, l: "July" },
  { v: 8, l: "August" },
  { v: 9, l: "September" },
  { v: 10, l: "October" },
  { v: 11, l: "November" },
  { v: 12, l: "December" },
];

const cls =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm";

const StatutoryRegister = ({
  endpoint,
  title = "Statutory Register",
  menuLink,
  reportCode = "",
  columns = [],
  typeOptions = null,
}) => {
  const now = new Date();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [type, setType] = useState(typeOptions ? typeOptions[0].v : "");

  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();

  const totals = useMemo(() => {
    if (!rows.length) return null;
    const t = {};
    let any = false;
    columns.forEach((c) => {
      if (c.type == "amount" || c.type == "number") {
        t[c.key] = rows.reduce((a, r) => a + (parseFloat(r[c.key]) || 0), 0);
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
      if (month) params.append("Month", month);
      if (year) params.append("Year", year);
      if (type) params.append("type", type);
      if (currentFinancialYear?.FY_Id) {
        params.append("FY_Id", currentFinancialYear.FY_Id);
        params.append("fy_id", currentFinancialYear.FY_Id);
      }
      const url = `${import.meta.env.VITE_API_URL}/${endpoint}?${params.toString()}`;
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      const arr = Array.isArray(res.data?.data) ? res.data.data : [];
      setMeta(res.data?.meta || null);
      if (arr.length) setRows(arr);
      else {
        setRows([]);
        setError(
          res.data?.message ||
            "No records for the selected period. Generate deductions for this period from the Statutory Head Config screen first.",
        );
      }
    } catch (e) {
      setRows([]);
      setError(e.response?.data?.message || "Error loading register");
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = () => {
    setHasGenerated(true);
    fetchData();
  };
  const onClear = () => {
    setRows([]);
    setMeta(null);
    setHasGenerated(false);
    setError("");
  };

  const monthList = typeOptions ? MONTHS : MONTHS; // fiscal ordering label; value is period month stored
  const filterEls = (
    <>
      {typeOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deduction Type
          </label>
          <select
            className={cls}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {typeOptions.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Month
        </label>
        <select
          className={cls}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">All months</option>
          {CAL_MONTHS.map((m) => (
            <option key={m.v} value={m.v}>
              {m.l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Year
        </label>
        <input
          type="number"
          className={cls}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g. 2026"
        />
      </div>
    </>
  );

  const metaBand = meta ? (
    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
      {meta.deposit_account && (
        <div className="bg-emerald-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-500">Deposit Account</div>
          <div className="font-medium text-gray-800">
            {meta.deposit_account}
          </div>
        </div>
      )}
      {meta.authority && (
        <div className="bg-emerald-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-500">Authority</div>
          <div className="font-medium text-gray-800">{meta.authority}</div>
        </div>
      )}
      {meta.due_day != undefined && meta.due_day != null && (
        <div className="bg-amber-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-500">Due Day (of month)</div>
          <div className="font-medium text-gray-800">{meta.due_day}</div>
        </div>
      )}
      {meta.employee_rate != undefined && (
        <div className="bg-sky-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-500">Rates (EE / ER %)</div>
          <div className="font-medium text-gray-800">
            {meta.employee_rate} / {meta.employer_rate}
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div>
      {hasGenerated && rows.length > 0 && (
        <div className="px-2 max-w-full">
          <div className="bg-white rounded-lg px-4 pt-4 -mb-2">{metaBand}</div>
        </div>
      )}
      <ReportShell
        menuLink={menuLink}
        defaultTitle={title}
        organization={organization}
        financialYear={
          currentFinancialYear
            ? {
                name:
                  currentFinancialYear.FY_Name || currentFinancialYear.FY_Code,
              }
            : null
        }
        columns={columns}
        rows={rows}
        totals={totals}
        loading={loading}
        error={error}
        hasGenerated={hasGenerated}
        onGenerate={onGenerate}
        onClear={onClear}
        filters={filterEls}
        reportCode={reportCode}
        excelFileName={title.replace(/\s+/g, "")}
        signatures={[
          "Prepared By",
          "Verified By",
          "Drawing & Disbursing Officer",
        ]}
      />
    </div>
  );
};

export default StatutoryRegister;

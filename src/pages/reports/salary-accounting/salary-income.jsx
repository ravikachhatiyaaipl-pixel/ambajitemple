import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const BASE_EARN_COLS = [
  { key: "Basic_GO", label: "Basic.GO\nSpl.Pay", code: "(101)\n(102)" },
  { key: "Basic_NGO", label: "Basic.NGO\nFP.Pay", code: "(101)\n(102)" },
  { key: "Leave_Enc", label: "Leave.Sal\nLeav.Enca", code: "(102)\n(109)" },
  { key: "NPA", label: "N.P.A\nOther.Allo", code: "(103)\n(104)" },
  { key: "DA", label: "D.A\nN.D.S", code: "(403)" },
  { key: "HRA", label: "H.R.A\nBonous", code: "(110)" },
  { key: "CLA", label: "C.L.A\nSpl.Serv", code: "(108)" },
  { key: "MA", label: "M.A\nD.P", code: "(107)" },
  { key: "TA", label: "T.A\nP.T.A", code: "(119/120)" },
  { key: "WA", label: "W.A\nSum.Allo", code: "(1101)" },
  {
    key: "GROSSPAY",
    label: "RECPAY\nGROSSPAY",
    code: "(-)(101/102)\n(-)(5701)",
  },
  { key: "FOOD", label: "FEST\nFOOD", code: "(-)(5801)" },
  { key: "S_ITAX", label: "ITAX\nS.ITAX", code: "(9510)\n(9520)" },
];

const GROSSPAY_COL = BASE_EARN_COLS.find((c) => c.key === "GROSSPAY");

/**
 * Show ONLY mapped allowance heads (from master + emp mapping).
 * Built-in Basic.GO / DA / HRA / ... columns are hidden (Basic stays under name).
 * GROSSPAY total column is kept at the end.
 */
const mergeEarnCols = (dynamicColumns = [], rows = []) => {
  const extras = (dynamicColumns || [])
    .map((c) => ({
      key: c.key,
      label: c.short_name || c.name || c.code || c.key,
      code: "", // avoid duplicate header text
    }))
    .filter((col) => {
      if (!rows?.length) return true;
      return rows.some((r) => Number(r[col.key] || 0) >= 1);
    });

  return GROSSPAY_COL ? [...extras, GROSSPAY_COL] : extras;
};

const fmt = (v) =>
  !v || Number(v) == 0 ? "0" : Number(v).toLocaleString("en-IN");

const SearchableDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current)
      setTimeout(() => searchRef.current.focus(), 0);
  }, [open]);

  const selected = options.find((o) => o.value == value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
      >
        <span className={selected ? "text-gray-900" : "text-gray-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div
          className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "220px" }}
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-56">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setSearch("");
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                !value ? "bg-blue-50 text-blue-600" : "text-gray-500"
              }`}
            >
              {placeholder}
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-t border-gray-100 ${
                  value == o.value
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {o.label}
              </button>
            ))}
            {filtered.length == 0 && (
              <div className="px-4 py-4 text-center text-sm text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SalaryIncome = () => {
  const { organization } = useOrganization();

  const [allRows, setAllRows] = useState([]);
  const [billNameList, setBillNameList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [empList, setEmpList] = useState([]);

  const [selMonth, setSelMonth] = useState(String(new Date().getMonth() + 1));
  const [selYear, setSelYear] = useState(String(new Date().getFullYear()));
  const [selBillNo, setSelBillNo] = useState("");
  const [selDept, setSelDept] = useState("");
  const [selEmp, setSelEmp] = useState("");

  const [data, setData] = useState([]);
  const [allDataForPrint, setAllDataForPrint] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [cumulativeTotals, setCumulativeTotals] = useState({});
  const [grandTotals, setGrandTotals] = useState({});
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [visibleSourceRows, setVisibleSourceRows] = useState([]);
  const allPageTotalsRef = React.useRef({});
  const PAGE_SIZE = 10;

  const EARN_COLS = React.useMemo(
    () => mergeEarnCols(dynamicColumns, visibleSourceRows),
    [dynamicColumns, visibleSourceRows],
  );
  const NUM_KEYS = React.useMemo(
    () => EARN_COLS.map((c) => c.key),
    [EARN_COLS],
  );

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/all/payroll/allowances?report_month=${selMonth}&report_year=${selYear}`,{ 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        })
      .then((res) => {
        if (!res.data?.success) return;
        const rows = res.data.data || [];
        setAllRows(rows);
        const seenBills = new Map();
        rows.forEach((r) => {
          if (r.PBillNo && !seenBills.has(r.PBillNo))
            seenBills.set(r.PBillNo, r.PayBill_Name || r.PBillNo);
        });
        const sortedBills = [...seenBills.entries()]
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([no, name]) => ({
            value: String(no),
            label: `${no} – ${name}`,
          }));
        setBillNameList(sortedBills);
        const depts = [
          ...new Map(rows.map((r) => [r.Dpt_Name, r.Dpt_Name])).values(),
        ].filter((d) => d);
        setDeptList(depts);
        const empMap = new Map();
        rows.forEach((r) => {
          const name = r.First_Name || "";
          const code = r.Emp_Code || "";
          if (name && !empMap.has(name)) {
            empMap.set(name, { id: name, name, code });
          }
        });
        setEmpList([...empMap.values()]);
      })
      .catch(() => {});
  }, [selMonth, selYear]);

  const fetchReport = async (page = 1) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = new URLSearchParams();
      params.append("report_month", selMonth);
      params.append("report_year", selYear);
      if (selBillNo) params.append("p_bill_no", selBillNo);
      params.append("per_page", 10000);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/payroll/allowances?${params.toString()}`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );

      if (response.data?.success) {
        if (response.data.totals?.cumulative) {
          setCumulativeTotals(response.data.totals.cumulative);
        }
        setDynamicColumns(response.data.dynamic_columns || []);

        let allFiltered = response.data.data || [];
        if (selDept)
          allFiltered = allFiltered.filter((r) => r.Dpt_Name == selDept);
        if (selEmp)
          allFiltered = allFiltered.filter(
            (r) => (r.First_Name || "") == selEmp,
          );

        setVisibleSourceRows(allFiltered);
        setTotalRecords(allFiltered.length);
        const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE) || 1;
        setTotalApiPages(totalPages);

        const offset = (page - 1) * PAGE_SIZE;
        const rows = allFiltered
          .slice(offset, offset + PAGE_SIZE)
          .map((r, i) => ({ ...r, srno: offset + i + 1 }));
        setData(rows);

        // Compute grand totals across all records
        const gt = NUM_KEYS.reduce(
          (acc, k) => ({
            ...acc,
            [k]: allFiltered.reduce((s, r) => s + (Number(r[k]) || 0), 0),
          }),
          {},
        );
        setGrandTotals(gt);

        if (!allFiltered.length)
          setMessage({
            text: "No records found for selected filters.",
            type: "info",
          });
      } else {
        setData([]);
        setMessage({
          text: response.data?.message || "No data available.",
          type: "info",
        });
      }
    } catch (err) {
      setData([]);
      setMessage({
        text: err.response?.data?.message || "Error loading data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDataForPrint = async () => {
    try {
      const params = new URLSearchParams();
      params.append("report_month", selMonth);
      params.append("report_year", selYear);
      if (selBillNo) params.append("p_bill_no", selBillNo);
      params.append("per_page", 10000);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/payroll/allowances?${params.toString()}`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (res.data?.success) {
        let rows = res.data.data || [];
        if (selDept) rows = rows.filter((r) => r.Dpt_Name == selDept);
        if (selEmp)
          rows = rows.filter((r) => (r.First_Name || "") == selEmp);
        return rows.map((r, i) => ({ ...r, srno: i + 1 }));
      }
      return [];
    } catch {
      return [];
    }
  };

  const handleGenerate = async () => {
    setHasGenerated(true);
    setCurrentPage(1);
    await fetchReport(1);
  };

  const handlePrint = async () => {
    setLoading(true);
    const printData = await fetchAllDataForPrint();
    setLoading(false);
    if (printData.length > 0) {
      setAllDataForPrint(printData);
      setShowPrint(true);
    } else {
      setMessage({ text: "No data available for printing.", type: "info" });
    }
  };

  const handleClear = () => {
    setSelMonth(String(new Date().getMonth() + 1));
    setSelYear(String(new Date().getFullYear()));
    setSelBillNo("");
    setSelDept("");
    setSelEmp("");
    setHasGenerated(false);
    setData([]);
    setAllDataForPrint([]);
    setMessage({ text: "", type: "" });
    setCurrentPage(1);
    setTotalRecords(0);
    setTotalApiPages(1);
    setCumulativeTotals({});
    setGrandTotals({});
    allPageTotalsRef.current = {};
  };

  // Calculate current page totals
  const pageTotals = NUM_KEYS.reduce(
    (acc, k) => ({
      ...acc,
      [k]: data.reduce((s, r) => s + (Number(r[k]) || 0), 0),
    }),
    {},
  );

  const handleExcel = () => {
    const rows = data.map((r) => ({
      "SR No": r.srno,
      "Emp Code": r.Emp_Code,
      "Employee Name": r.First_Name,
      Basic: r.Actual_Basic_Pay || 0,
      Department: r.Dpt_Name,
      ...EARN_COLS.reduce(
        (a, c) => ({ ...a, [c.label.replace(/\n/g, " ")]: r[c.key] || 0 }),
        {},
      ),
    }));

    // Add cumulative totals row using API-provided cumulative totals
    const totalsRow = {
      "SR No": "CUMULATIVE TOTAL",
      "Emp Code": "",
      "Employee Name": "",
      Basic: "",
      Department: "",
      ...EARN_COLS.reduce(
        (a, c) => ({
          ...a,
          [c.label.replace(/\n/g, " ")]:
            cumulativeTotals[c.key] || pageTotals[c.key],
        }),
        {},
      ),
    };
    rows.push(totalsRow);

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EarningSide");
    XLSX.writeFile(wb, `PayBillEarning_BillNo${selBillNo || "all"}.xlsx`);
  };

  const hasData = data.length > 0;
  const totalCols = EARN_COLS.length + 2; // SRNo + Name/Basic

  const PrintContent = () => {
    const printData = allDataForPrint.length > 0 ? allDataForPrint : data;
    const thS = {
      borderBottom: "2px solid #1e3a5f",
      padding: "2px 3px",
      textAlign: "center",
      fontWeight: "700",
      fontSize: "7px",
      backgroundColor: "#1e3a5f",
      color: "#ffffff",
    };
    const tdS = { border: "none", padding: "2px 3px", fontSize: "7px" };
    const printTotals = NUM_KEYS.reduce(
      (acc, k) => ({
        ...acc,
        [k]: printData.reduce((s, r) => s + (Number(r[k]) || 0), 0),
      }),
      {},
    );
    return (
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10px" }}>
        <style>{`@media print { .no-print-line { display: none !important; } .print-table td, .print-table tr { border: none !important; } }`}</style>
        <div style={{ marginBottom: "4px" }}>
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "13px",
              marginBottom: "3px",
            }}
          >
            {organization?.Org_Name ||
              organization?.name ||
              "Ambaji Mata Temple, AMBAJI"}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              marginBottom: "2px",
            }}
          >
            <b>PAY BILL INNER SHEET</b>
            <b>EARNING SIDE</b>
            <span>
              FOR THE MONTH OF :{" "}
              <b>___________ / COUNT = {selBillNo || "__"}</b>
            </span>
          </div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              marginBottom: "2px",
            }}
          >
            TO BE FILLED IN BY DRAWING OFFICER.
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              fontSize: "10px",
              justifyContent: "space-between",
            }}
          >
            <span>
              1. DISTRICT :- <b>___________</b>
            </span>
            <span>
              2. DRAWING OFFICER :- <b>___</b>
            </span>
            <span>
              BILL NAME :-{" "}
              <b>
                {selBillNo
                  ? billNameList.find((b) => b.value == selBillNo)?.label ||
                    selBillNo
                  : "ALL"}
              </b>
            </span>
            <span>
              TOTAL RECORDS :- <b>{printData.length}</b>
            </span>
          </div>
        </div>
        <table
          className="print-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "7px",
            marginTop: "3px",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thS, textAlign: "center" }}>
                SRNo
                <br />
                PSRNO
              </th>
              <th style={{ ...thS, textAlign: "left", minWidth: "110px" }}>
                EMPLOYEE'S NAME
                <br />
                BASIC
              </th>
              {EARN_COLS.map((c) => (
                <th key={c.key} style={thS}>
                  <div style={{ whiteSpace: "pre-line" }}>{c.label}</div>
                  <div style={{ whiteSpace: "pre-line" }}>{c.code}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {printData.map((row, i) => (
              <React.Fragment key={i}>
                <tr style={{ backgroundColor: "#ffffff" }}>
                  <td
                    style={{
                      ...tdS,
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#1e3a5f",
                    }}
                  >
                    {row.srno}
                    <div
                      style={{
                        fontSize: "6px",
                        color: "#6b7280",
                        fontWeight: "normal",
                      }}
                    >
                      {row.Emp_Code}
                    </div>
                  </td>
                  <td style={tdS}>
                    <div style={{ color: "#111827" }}>{row.First_Name}</div>
                    <div style={{ fontSize: "6px", color: "#6b7280" }}>
                      {fmt(row.Actual_Basic_Pay)}
                    </div>
                  </td>
                  {NUM_KEYS.map((k) => (
                    <td
                      key={k}
                      style={{ ...tdS, textAlign: "right", color: "#1e3a5f" }}
                    >
                      {fmt(row[k])}
                    </td>
                  ))}
                </tr>
                <tr className="no-print-line">
                  <td
                    colSpan={EARN_COLS.length + 2}
                    style={{
                      padding: 0,
                      height: "1px",
                      backgroundColor: "#cbd5e1",
                      border: "none",
                    }}
                  />
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: "bold", backgroundColor: "#1e3a5f" }}>
              <td
                colSpan={2}
                style={{
                  ...tdS,
                  textAlign: "right",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              >
                TOTAL
              </td>
              {NUM_KEYS.map((k) => (
                <td
                  key={k}
                  style={{
                    ...tdS,
                    textAlign: "right",
                    color: "#ffffff",
                    fontWeight: "bold",
                  }}
                >
                  {fmt(printTotals[k])}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {showPrint && (
        <PrintLayout
          title="Pay Bill Inner Sheet – Earning Side"
          showControls
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintContent />
        </PrintLayout>
      )}

      <div className="px-2 py-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleExcel}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RiFileExcel2Line className="h-4 w-4" /> Excel
            </button>
            <button
              onClick={handlePrint}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <FiPrinter className="h-4 w-4" /> Print
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-5">
            Pay Bill Inner Sheet – Earning Side
          </h2>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selMonth}
                  onChange={(e) => setSelMonth(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
                    <option key={i+1} value={String(i+1)}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selYear}
                  onChange={(e) => setSelYear(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - 4 + i)).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <SearchableDropdown
                  label="Bill Name"
                  value={selBillNo}
                  onChange={setSelBillNo}
                  options={billNameList}
                  placeholder="All"
                />
              </div>
              <div className="flex-1">
                <SearchableDropdown
                  label="Department"
                  value={selDept}
                  onChange={setSelDept}
                  options={deptList.map((d) => ({ value: d, label: d }))}
                  placeholder="All Departments"
                />
              </div>
              <div className="flex-1">
                <SearchableDropdown
                  label="Employee"
                  value={selEmp}
                  onChange={setSelEmp}
                  options={empList.map((e) => ({
                    value: String(e.id),
                    label: `${e.code} – ${e.name}`,
                  }))}
                  placeholder="All Employees"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 transition-colors"
                >
                  <FiCheck className="h-4 w-4 mr-2" /> Generate Report
                </button>
                {hasGenerated && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
                  >
                    <FiX className="h-4 w-4 mr-2" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading data...</p>
            </div>
          )}

          {!loading && message.text && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

          {!loading && !hasGenerated && !message.text && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generate report to view results
              </h3>
              <p className="text-gray-600">
                Select filters then click{" "}
                <span className="font-medium">Generate Report</span>.
              </p>
            </div>
          )}

          {!loading && hasData && (
            <>
              <div
                className="border border-blue-100 rounded-lg p-3 mb-4 text-xs text-gray-700"
                style={{ backgroundColor: "#f0f4f8", borderColor: "#cbd5e1" }}
              >
                <div
                  className="text-center font-bold text-sm mb-1"
                  style={{ color: "#1e3a5f" }}
                >
                  {organization?.Org_Name ||
                    organization?.name ||
                    "Ambaji Mata Temple, AMBAJI"}
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold" style={{ color: "#1e3a5f" }}>
                    PAY BILL INNER SHEET &nbsp;|&nbsp; EARNING SIDE
                  </span>
                  <span style={{ color: "#374151" }}>
                    BILL NAME :{" "}
                    <span className="font-bold" style={{ color: "#1e3a5f" }}>
                      {selBillNo
                        ? billNameList.find((b) => b.value == selBillNo)
                            ?.label || selBillNo
                        : "ALL"}
                    </span>
                  </span>
                </div>
                <div
                  className="mt-1 font-semibold"
                  style={{ color: "#374151" }}
                >
                  TO BE FILLED IN BY DRAWING OFFICER.
                </div>
                <div
                  className="flex flex-wrap gap-x-6 gap-y-1 mt-1"
                  style={{ color: "#374151" }}
                >
                  <span>
                    DEPARTMENT :{" "}
                    <b style={{ color: "#1e3a5f" }}>{selDept || "ALL"}</b>
                  </span>
                  <span>
                    TOTAL RECORDS :{" "}
                    <b style={{ color: "#1e3a5f" }}>{totalRecords}</b>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="min-w-full text-xs"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#1e3a5f",
                        borderBottom: "2px solid #1e3a5f",
                      }}
                    >
                      <th
                        className="px-2 py-2 text-center font-semibold text-white whitespace-pre-line leading-tight"
                        style={{ minWidth: "50px" }}
                      >
                        {"SRNo\nPSRNO"}
                      </th>
                      <th
                        className="px-2 py-2 text-left font-semibold text-white whitespace-pre-line leading-tight"
                        style={{ minWidth: "160px" }}
                      >
                        {"EMPLOYEE'S NAME\nBASIC"}
                      </th>
                      {EARN_COLS.map((c) => (
                        <th
                          key={c.key}
                          className="px-2 py-2 text-right font-semibold text-white whitespace-pre-line leading-tight"
                          style={{ minWidth: "62px" }}
                        >
                          <div>{c.label}</div>
                          <div
                            className="whitespace-pre-line"
                            style={{ color: "#ffffff" }}
                          >
                            {c.code}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <React.Fragment key={i}>
                        <tr style={{ backgroundColor: "#ffffff" }}>
                          <td
                            className="px-2 py-1 text-center font-bold text-xs"
                            style={{ color: "#1e3a5f" }}
                          >
                            {row.srno}
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#6b7280",
                                fontWeight: "normal",
                              }}
                            >
                              {row.Emp_Code}
                            </div>
                          </td>
                          <td
                            className="px-2 py-1 text-xs font-medium"
                            style={{ color: "#111827" }}
                          >
                            <div>{row.First_Name}</div>
                            <div style={{ fontSize: "10px", color: "#6b7280" }}>
                              {fmt(row.Actual_Basic_Pay)}
                            </div>
                          </td>
                          {EARN_COLS.map((c) => (
                            <td
                              key={c.key}
                              className="px-2 py-1 text-right font-mono"
                              style={{ color: "#1e3a5f" }}
                            >
                              {fmt(row[c.key])}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td
                            colSpan={totalCols}
                            style={{
                              padding: 0,
                              height: "1px",
                              backgroundColor: "#cbd5e1",
                            }}
                          />
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        backgroundColor: "#1e3a5f",
                        borderTop: "2px solid #1e3a5f",
                      }}
                    >
                      <td
                        className="px-2 py-1.5 text-center font-bold text-white"
                        colSpan={2}
                      >
                        PAGE TOTAL
                      </td>
                      {NUM_KEYS.map((k) => (
                        <td
                          key={k}
                          className="px-2 py-1.5 text-right font-mono font-bold text-white"
                        >
                          {fmt(pageTotals[k])}
                        </td>
                      ))}
                    </tr>
                    {currentPage == totalApiPages && (
                      <tr
                        style={{
                          backgroundColor: "#0f2b4a",
                          borderTop: "1px solid #1e3a5f",
                        }}
                      >
                        <td
                          className="px-2 py-1.5 text-center font-bold text-white"
                          colSpan={2}
                        >
                          GRAND TOTAL
                        </td>
                        {NUM_KEYS.map((k) => (
                          <td
                            key={k}
                            className="px-2 py-1.5 text-right font-mono font-bold text-white"
                          >
                            {fmt(grandTotals[k] || pageTotals[k])}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              {totalApiPages > 1 && (
                <div className="flex items-center justify-end mt-6 gap-2">
                  <button
                    onClick={() => {
                      const p = currentPage - 1;
                      setCurrentPage(p);
                      fetchReport(p);
                    }}
                    disabled={currentPage == 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: totalApiPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p == 1 ||
                        p == totalApiPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p == "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 py-2 text-sm text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => {
                            setCurrentPage(p);
                            fetchReport(p);
                          }}
                          className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                            currentPage == p
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => {
                      const p = currentPage + 1;
                      setCurrentPage(p);
                      fetchReport(p);
                    }}
                    disabled={currentPage == totalApiPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryIncome;

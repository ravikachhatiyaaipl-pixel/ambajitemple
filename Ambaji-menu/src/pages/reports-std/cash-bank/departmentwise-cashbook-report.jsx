/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Dept-wise Cash Book
 *  Parallel to the original (original left intact). Endpoint: /department-cash-ledgers
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DepartmentwiseCashbookReportStd = () => (
  <AutoReport
    endpoint="department-cash-ledgers"
    method="get"
    title="Dept-wise Cash Book"
    menuLink="/reports-std/cash-bank/departmentwise-cashbook-report"
    reportCode="STD-CAS-46"
    filters={["dept", "from", "to"]}
  />
);

export default DepartmentwiseCashbookReportStd;

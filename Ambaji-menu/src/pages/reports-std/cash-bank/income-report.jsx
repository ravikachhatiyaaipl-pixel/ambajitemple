/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Income Report
 *  Parallel to the original (original left intact). Endpoint: /ch-voucher/report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const IncomeReportStd = () => (
  <AutoReport
    endpoint="ch-voucher/report"
    method="get"
    title="Income Report"
    menuLink="/reports-std/cash-bank/income-report"
    reportCode="STD-CAS-49"
    filters={["from", "to"]}
  />
);

export default IncomeReportStd;

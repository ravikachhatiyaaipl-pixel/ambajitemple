/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Expense Report
 *  Parallel to the original (original left intact). Endpoint: /ch-voucher/report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ExpenseReportStd = () => (
  <AutoReport
    endpoint="ch-voucher/report"
    method="get"
    title="Expense Report"
    menuLink="/reports-std/cash-bank/expense-report"
    reportCode="STD-CAS-48"
    filters={["from", "to"]}
  />
);

export default ExpenseReportStd;

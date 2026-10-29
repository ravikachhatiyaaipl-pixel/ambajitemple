/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Summary Income
 *  Parallel to the original (original left intact). Endpoint: /ch-income-summary-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const SummaryIncomeReportStd = () => (
  <AutoReport
    endpoint="ch-income-summary-report"
    method="get"
    title="Summary Income"
    menuLink="/reports-std/cash-bank/summary-income-report"
    reportCode="STD-CAS-52"
    filters={["from", "to"]}
  />
);

export default SummaryIncomeReportStd;

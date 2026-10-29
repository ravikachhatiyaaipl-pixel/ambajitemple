/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Challan Status Summary
 *  Parallel to the original (original left intact). Endpoint: /ledgers/all/data
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ChallanStatusSummaryReportStd = () => (
  <AutoReport
    endpoint="ledgers/all/data"
    method="get"
    title="Challan Status Summary"
    menuLink="/reports-std/cash-bank/challan-status-summary-report"
    reportCode="STD-CAS-43"
    filters={["dept", "from", "to", "status"]}
  />
);

export default ChallanStatusSummaryReportStd;

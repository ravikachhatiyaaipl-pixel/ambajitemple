/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Consolidated Budget
 *  Parallel to the original (original left intact). Endpoint: /budget/summary
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ConsolidatedbudgetreportStd = () => (
  <AutoReport
    endpoint="budget/summary"
    method="get"
    title="Consolidated Budget"
    menuLink="/reports-std/budget-management/consolidatedbudgetreport"
    reportCode="STD-BUD-23"
    filters={["dept"]}
  />
);

export default ConsolidatedbudgetreportStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Over-budgeted WO
 *  Parallel to the original (original left intact). Endpoint: /tender-reports/over-budgeted
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const OverBudgetedStd = () => (
  <AutoReport
    endpoint="tender-reports/over-budgeted"
    method="get"
    title="Over-budgeted WO"
    menuLink="/reports-std/tender-management/over-budgeted"
    reportCode="STD-TEN-36"
    filters={["dept", "from", "to"]}
  />
);

export default OverBudgetedStd;

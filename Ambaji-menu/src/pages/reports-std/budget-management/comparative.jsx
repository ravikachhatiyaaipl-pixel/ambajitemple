/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Comparative Budget
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/comparative
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ComparativeStd = () => (
  <AutoReport
    endpoint="budget-reports/comparative"
    method="get"
    title="Comparative Budget"
    menuLink="/reports-std/budget-management/comparative"
    reportCode="STD-BUD-21"
    filters={["dept", "status"]}
  />
);

export default ComparativeStd;

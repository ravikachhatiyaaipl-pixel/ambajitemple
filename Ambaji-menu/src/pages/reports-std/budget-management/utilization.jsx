/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Budget Utilization
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/utilization
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const UtilizationStd = () => (
  <AutoReport
    endpoint="budget-reports/utilization"
    method="get"
    title="Budget Utilization"
    menuLink="/reports-std/budget-management/utilization"
    reportCode="STD-BUD-28"
    filters={["dept"]}
  />
);

export default UtilizationStd;

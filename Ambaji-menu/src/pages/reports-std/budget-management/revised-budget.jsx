/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Revised Budget
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/revised
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const RevisedBudgetStd = () => (
  <AutoReport
    endpoint="budget-reports/revised"
    method="get"
    title="Revised Budget"
    menuLink="/reports-std/budget-management/revised-budget"
    reportCode="STD-BUD-27"
    filters={["dept"]}
  />
);

export default RevisedBudgetStd;

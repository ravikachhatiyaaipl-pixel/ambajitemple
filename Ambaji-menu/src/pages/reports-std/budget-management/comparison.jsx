/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Budget Comparison
 *  Parallel to the original (original left intact). Endpoint: /revenue-expense/department-summary
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ComparisonStd = () => (
  <AutoReport
    endpoint="revenue-expense/department-summary"
    method="get"
    title="Budget Comparison"
    menuLink="/reports-std/budget-management/comparison"
    reportCode="STD-BUD-22"
    filters={["dept"]}
  />
);

export default ComparisonStd;

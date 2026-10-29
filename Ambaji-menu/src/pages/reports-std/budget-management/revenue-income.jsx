/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Revenue Income
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/revenue-income-hierarchy
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const RevenueIncomeStd = () => (
  <AutoReport
    endpoint="budget-reports/revenue-income-hierarchy"
    method="get"
    title="Revenue Income"
    menuLink="/reports-std/budget-management/revenue-income"
    reportCode="STD-BUD-26"
    filters={["dept"]}
  />
);

export default RevenueIncomeStd;

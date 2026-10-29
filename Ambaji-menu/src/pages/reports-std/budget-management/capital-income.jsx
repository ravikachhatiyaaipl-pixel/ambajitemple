/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Capital Income
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/capital-income-hierarchy
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const CapitalIncomeStd = () => (
  <AutoReport
    endpoint="budget-reports/capital-income-hierarchy"
    method="get"
    title="Capital Income"
    menuLink="/reports-std/budget-management/capital-income"
    reportCode="STD-BUD-20"
    filters={["dept"]}
  />
);

export default CapitalIncomeStd;

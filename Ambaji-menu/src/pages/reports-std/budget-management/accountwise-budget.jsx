/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Account-wise Budget
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/summary-group-wise
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const AccountwiseBudgetStd = () => (
  <AutoReport
    endpoint="budget-reports/summary-group-wise"
    method="get"
    title="Account-wise Budget"
    menuLink="/reports-std/budget-management/accountwise-budget"
    reportCode="STD-BUD-17"
    filters={[]}
  />
);

export default AccountwiseBudgetStd;

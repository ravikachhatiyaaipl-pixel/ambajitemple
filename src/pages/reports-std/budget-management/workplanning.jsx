/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Work Planning
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/department-budget-expenditure
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const WorkplanningStd = () => (
  <AutoReport
    endpoint="budget-reports/department-budget-expenditure"
    method="get"
    title="Work Planning"
    menuLink="/reports-std/budget-management/workplanning"
    reportCode="STD-BUD-29"
    filters={["dept"]}
  />
);

export default WorkplanningStd;

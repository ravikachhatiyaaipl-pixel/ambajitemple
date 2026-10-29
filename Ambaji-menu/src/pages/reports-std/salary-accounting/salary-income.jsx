/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Salary Income
 *  Parallel to the original (original left intact). Endpoint: /all/payroll/allowances
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const SalaryIncomeStd = () => (
  <AutoReport
    endpoint="all/payroll/allowances"
    method="get"
    title="Salary Income"
    menuLink="/reports-std/salary-accounting/salary-income"
    reportCode="STD-SAL-16"
    filters={[]}
  />
);

export default SalaryIncomeStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Salary Deduction
 *  Parallel to the original (original left intact). Endpoint: /all/payroll/deductions
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const SalaryDeductionStd = () => (
  <AutoReport
    endpoint="all/payroll/deductions"
    method="get"
    title="Salary Deduction"
    menuLink="/reports-std/salary-accounting/salary-deduction"
    reportCode="STD-SAL-15"
    filters={[]}
  />
);

export default SalaryDeductionStd;

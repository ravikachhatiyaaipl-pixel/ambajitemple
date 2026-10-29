/***
 *  I3EMS - AMT ERP  |  Payroll report: Loan Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const LoanRegister = () => (
  <AutoReport endpoint="payroll-reports/loan-register" method="get" title="Loan Register" menuLink="/reports/payroll-extra/loan-register" reportCode="PAY-LN-01" filters={["status"]} />
);
export default LoanRegister;

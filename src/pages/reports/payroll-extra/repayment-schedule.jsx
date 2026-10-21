/***
 *  I3EMS - AMT ERP  |  Payroll report: Repayment Schedule
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const RepaymentSchedule = () => (
  <AutoReport endpoint="payroll-reports/repayment-schedule" method="get" title="Repayment Schedule" menuLink="/reports/payroll-extra/repayment-schedule" reportCode="PAY-RS-01" filters={[]} />
);
export default RepaymentSchedule;

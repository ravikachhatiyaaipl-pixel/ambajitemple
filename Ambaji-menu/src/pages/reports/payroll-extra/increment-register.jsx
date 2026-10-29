/***
 *  I3EMS - AMT ERP  |  Payroll report: Increment Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const IncrementRegister = () => (
  <AutoReport endpoint="payroll-reports/increment-register" method="get" title="Increment Register" menuLink="/reports/payroll-extra/increment-register" reportCode="PAY-INC-01" filters={["status"]} />
);
export default IncrementRegister;

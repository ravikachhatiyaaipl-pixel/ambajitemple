/***
 *  I3EMS - AMT ERP  |  Loan Management report: Foreclosure Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ForeclosureRegister = () => (
  <AutoReport endpoint="loan-mgmt-reports/foreclosure-register" method="get" title="Foreclosure Register" menuLink="/reports/loan-mgmt/foreclosure-register" reportCode="PAY-LM-03" filters={["status"]} />
);
export default ForeclosureRegister;

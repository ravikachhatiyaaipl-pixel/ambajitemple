/***
 *  I3EMS - AMT ERP  |  Loan Management report: Outstanding Statement
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const OutstandingStatement = () => (
  <AutoReport endpoint="loan-mgmt-reports/outstanding-statement" method="get" title="Loan Outstanding Statement" menuLink="/reports/loan-mgmt/outstanding-statement" reportCode="PAY-LM-02" filters={[]} />
);
export default OutstandingStatement;

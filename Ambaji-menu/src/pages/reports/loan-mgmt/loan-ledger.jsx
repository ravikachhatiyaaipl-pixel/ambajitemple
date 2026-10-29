/***
 *  I3EMS - AMT ERP  |  Loan Management report: Loan Ledger
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const LoanLedger = () => (
  <AutoReport endpoint="loan-mgmt-reports/loan-ledger" method="get" title="Loan Ledger" menuLink="/reports/loan-mgmt/loan-ledger" reportCode="PAY-LM-01" filters={[]} />
);
export default LoanLedger;

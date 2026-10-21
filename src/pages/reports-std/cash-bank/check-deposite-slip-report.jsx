/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Cheque Deposit Slip
 *  Parallel to the original (original left intact). Endpoint: /ch-income-summary-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const CheckDepositeSlipReportStd = () => (
  <AutoReport
    endpoint="ch-income-summary-report"
    method="get"
    title="Cheque Deposit Slip"
    menuLink="/reports-std/cash-bank/check-deposite-slip-report"
    reportCode="STD-CAS-44"
    filters={["from", "to"]}
  />
);

export default CheckDepositeSlipReportStd;

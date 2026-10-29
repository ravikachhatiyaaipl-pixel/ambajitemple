/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Summary Expense
 *  Parallel to the original (original left intact). Endpoint: /chl-voucher/bank-payment-reciept-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const SummaryExpenseReportStd = () => (
  <AutoReport
    endpoint="chl-voucher/bank-payment-reciept-report"
    method="get"
    title="Summary Expense"
    menuLink="/reports-std/cash-bank/summary-expense-report"
    reportCode="STD-CAS-51"
    filters={["from", "to"]}
  />
);

export default SummaryExpenseReportStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Payment Status
 *  Parallel to the original (original left intact). Endpoint: /ch-status-summary/report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const PaymentStatusReportStd = () => (
  <AutoReport
    endpoint="ch-status-summary/report"
    method="get"
    title="Payment Status"
    menuLink="/reports-std/cash-bank/payment-status-report"
    reportCode="STD-CAS-50"
    filters={["dept", "from", "to", "status"]}
  />
);

export default PaymentStatusReportStd;

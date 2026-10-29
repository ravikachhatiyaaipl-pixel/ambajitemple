/***  I3EMS - AMT ERP | System report: Payment Receipts (Sprint 12B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PaymentReceipts = () => (
  <AutoReport endpoint="payment-reports/receipts" method="get" title="Payment Receipts" menuLink="/reports/system/payment-receipts" reportCode="SYS-PR-01" filters={["from", "to"]} />
);
export default PaymentReceipts;

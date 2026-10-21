/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Receipts & Payment
 *  Parallel to the original (original left intact). Endpoint: /receipts-payments
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ReceiptsPaymentStd = () => (
  <AutoReport
    endpoint="receipts-payments"
    method="get"
    title="Receipts & Payment"
    menuLink="/reports-std/annual-financial/receipts-payment"
    reportCode="STD-ANN-14"
    filters={["from", "to"]}
  />
);

export default ReceiptsPaymentStd;

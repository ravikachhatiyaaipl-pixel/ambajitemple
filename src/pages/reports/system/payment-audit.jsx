/***
 *  I3EMS - AMT ERP  |  System report: Payment Audit (all gateways, success + failure)
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PaymentAudit = () => (
  <AutoReport endpoint="payment-audit-reports/audit" method="get" title="Payment Audit" menuLink="/reports/system/payment-audit" reportCode="SYS-PA-01" filters={["status", "from", "to"]} />
);
export default PaymentAudit;

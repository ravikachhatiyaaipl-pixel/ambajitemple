/***  I3EMS - AMT ERP | report: Payment Control Register (Sprint FINAL)
 *   type = bill-passing | pending | advance | unpaid  */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PaymentControl = () => (
  <AutoReport endpoint="statfin-reports/payment-control" method="get" title="Payment Control Register" menuLink="/reports/statfin/payment-control" reportCode="FIN-PC-01" filters={["type", "from", "to"]} />
);
export default PaymentControl;

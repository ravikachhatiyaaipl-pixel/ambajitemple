/***
 *  I3EMS - AMT ERP  |  Financial report: Receipts & Payments Account
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ReceiptsPayments = () => (
  <AutoReport endpoint="fin-reports/receipts-payments" method="get" title="Receipts & Payments Account" menuLink="/reports/fin/receipts-payments" reportCode="FIN-RP-01" filters={["from","to"]} />
);
export default ReceiptsPayments;

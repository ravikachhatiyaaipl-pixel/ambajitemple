/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: DYMC Approval Bill
 *  Parallel to the original (original left intact). Endpoint: /chl-voucher/bank-payment-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DymcApprovalBillStd = () => (
  <AutoReport
    endpoint="chl-voucher/bank-payment-report"
    method="get"
    title="DYMC Approval Bill"
    menuLink="/reports-std/cash-bank/dymc-approval-bill"
    reportCode="STD-CAS-47"
    filters={["from", "to", "status"]}
  />
);

export default DymcApprovalBillStd;

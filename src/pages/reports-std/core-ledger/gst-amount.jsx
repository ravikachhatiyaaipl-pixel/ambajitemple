/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: GST Amount Report
 *  Parallel to the original. Endpoint: /gst-amount-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const GstAmountStd = () => (
  <AutoReport
    endpoint="gst-amount-report"
    method="get"
    title="GST Amount Report"
    menuLink="/reports-std/core-ledger/gst-amount"
    reportCode="STD-COR-62"
    filters={["from", "to"]}
  />
);

export default GstAmountStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Journal
 *  Parallel to the original (original left intact). Endpoint: /voucher-detail-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const JournalStd = () => (
  <AutoReport
    endpoint="voucher-detail-report"
    method="get"
    title="Journal"
    menuLink="/reports-std/core-ledger/journal"
    reportCode="STD-COR-54"
    filters={["from", "to"]}
  />
);

export default JournalStd;

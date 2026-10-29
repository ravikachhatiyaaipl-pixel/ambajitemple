/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Sub-ledger Bill Summary
 *  Parallel to the original (original left intact). Endpoint: /ledgers/all/data
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const SubledgerBillSummeryReportStd = () => (
  <AutoReport
    endpoint="ledgers/all/data"
    method="get"
    title="Sub-ledger Bill Summary"
    menuLink="/reports-std/core-ledger/subledger-bill-summery-report"
    reportCode="STD-COR-57"
    filters={["dept", "from", "to"]}
  />
);

export default SubledgerBillSummeryReportStd;

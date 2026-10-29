/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Sub-ledger Summary
 *  Parallel to the original (original left intact). Endpoint: /sub-ledger/balances
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const SubledgerSummaryStd = () => (
  <AutoReport
    endpoint="sub-ledger/balances"
    method="get"
    title="Sub-ledger Summary"
    menuLink="/reports-std/core-ledger/subledger-summary"
    reportCode="STD-COR-58"
    filters={["from", "to"]}
  />
);

export default SubledgerSummaryStd;

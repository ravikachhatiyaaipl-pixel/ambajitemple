/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Ledger
 *  Parallel to the original (original left intact). Endpoint: /finan-trns/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const LedgerStd = () => (
  <AutoReport
    endpoint="finan-trns/all"
    method="get"
    title="Ledger"
    menuLink="/reports-std/core-ledger/ledger"
    reportCode="STD-COR-55"
    filters={["from", "to"]}
  />
);

export default LedgerStd;

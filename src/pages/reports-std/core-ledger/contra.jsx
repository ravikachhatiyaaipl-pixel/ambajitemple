/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Contra
 *  Parallel to the original (original left intact). Endpoint: /reports/contra-register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ContraStd = () => (
  <AutoReport
    endpoint="reports/contra-register"
    method="get"
    title="Contra"
    menuLink="/reports-std/core-ledger/contra"
    reportCode="STD-COR-53"
    filters={["from", "to"]}
  />
);

export default ContraStd;

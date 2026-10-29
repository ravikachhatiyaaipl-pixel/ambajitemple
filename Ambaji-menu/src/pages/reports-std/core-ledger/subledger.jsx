/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Sub-ledger
 *  Parallel to the original (original left intact). Endpoint: /finan-trns/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const SubledgerStd = () => (
  <AutoReport
    endpoint="finan-trns/all"
    method="get"
    title="Sub-ledger"
    menuLink="/reports-std/core-ledger/subledger"
    reportCode="STD-COR-59"
    filters={["from", "to"]}
  />
);

export default SubledgerStd;

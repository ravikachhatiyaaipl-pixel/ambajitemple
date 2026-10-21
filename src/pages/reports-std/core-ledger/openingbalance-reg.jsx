/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Opening Balance Register
 *  Parallel to the original (original left intact). Endpoint: /voucher-detail-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const OpeningbalanceRegStd = () => (
  <AutoReport
    endpoint="voucher-detail-report"
    method="get"
    title="Opening Balance Register"
    menuLink="/reports-std/core-ledger/openingbalance-reg"
    reportCode="STD-COR-56"
    filters={["from", "to"]}
  />
);

export default OpeningbalanceRegStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Cash Flow Statement
 *  Parallel to the original (original left intact). Endpoint: /cash-flow/statement
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const CashFlowStatementStd = () => (
  <AutoReport
    endpoint="cash-flow/statement"
    method="get"
    title="Cash Flow Statement"
    menuLink="/reports-std/annual-financial/cash-flow-statement"
    reportCode="STD-ANN-10"
    filters={["from", "to"]}
  />
);

export default CashFlowStatementStd;

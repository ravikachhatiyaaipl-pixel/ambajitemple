/***
 *  I3EMS - AMT ERP  |  Financial report: Balance Sheet
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const BalanceSheet = () => (
  <AutoReport endpoint="fin-reports/balance-sheet" method="get" title="Balance Sheet" menuLink="/reports/fin/balance-sheet" reportCode="FIN-BS-01" filters={["from","to"]} />
);
export default BalanceSheet;

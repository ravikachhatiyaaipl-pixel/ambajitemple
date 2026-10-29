/***
 *  I3EMS - AMT ERP  |  Financial report: Ledger Statement
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const LedgerStatement = () => (
  <AutoReport endpoint="fin-reports/ledger-statement" method="get" title="Ledger Statement" menuLink="/reports/fin/ledger-statement" reportCode="FIN-LS-01" filters={["from","to"]} />
);
export default LedgerStatement;

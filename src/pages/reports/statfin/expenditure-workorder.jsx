/***  I3EMS - AMT ERP | report: Expenditure — Work Order (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ExpenditureWorkOrder = () => (
  <AutoReport endpoint="statfin-reports/expenditure-workorder" method="get" title="Expenditure — Work Order" menuLink="/reports/statfin/expenditure-workorder" reportCode="FIN-EXW-01" filters={["from","to"]} />
);
export default ExpenditureWorkOrder;

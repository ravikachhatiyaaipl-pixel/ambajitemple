/***
 *  I3EMS - AMT ERP  |  Disciplinary report: Penalty Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PenaltyRegister = () => (
  <AutoReport endpoint="disciplinary-reports/penalty-register" method="get" title="Penalty Register" menuLink="/reports/disciplinary/penalty-register" reportCode="HR-DP-03" filters={["status"]} />
);
export default PenaltyRegister;

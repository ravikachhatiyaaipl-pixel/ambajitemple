/***
 *  I3EMS - AMT ERP  |  Disciplinary report: Disciplinary Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const DisciplinaryRegister = () => (
  <AutoReport endpoint="disciplinary-reports/register" method="get" title="Disciplinary Register" menuLink="/reports/disciplinary/register" reportCode="HR-DP-01" filters={["status"]} />
);
export default DisciplinaryRegister;

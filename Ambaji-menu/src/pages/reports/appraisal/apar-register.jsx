/***
 *  I3EMS - AMT ERP  |  Appraisal report: APAR Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const AparRegister = () => (
  <AutoReport endpoint="appraisal-reports/apar-register" method="get" title="APAR Register" menuLink="/reports/appraisal/apar-register" reportCode="HR-AP-01" filters={["status"]} />
);
export default AparRegister;

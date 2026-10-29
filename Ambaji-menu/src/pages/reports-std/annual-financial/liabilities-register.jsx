/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Liabilities Register
 *  Parallel to the original (original left intact). Endpoint: /liabilities-register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const LiabilitiesRegisterStd = () => (
  <AutoReport
    endpoint="liabilities-register"
    method="get"
    title="Liabilities Register"
    menuLink="/reports-std/annual-financial/liabilities-register"
    reportCode="STD-ANN-13"
    filters={["from", "to"]}
  />
);

export default LiabilitiesRegisterStd;

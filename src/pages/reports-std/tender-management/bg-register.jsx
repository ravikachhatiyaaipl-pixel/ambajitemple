/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: BG Register
 *  Parallel to the original (original left intact). Endpoint: /tender-entries/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const BgRegisterStd = () => (
  <AutoReport
    endpoint="tender-entries/all"
    method="get"
    title="BG Register"
    menuLink="/reports-std/tender-management/bg-register"
    reportCode="STD-TEN-31"
    filters={["from", "to", "status"]}
  />
);

export default BgRegisterStd;

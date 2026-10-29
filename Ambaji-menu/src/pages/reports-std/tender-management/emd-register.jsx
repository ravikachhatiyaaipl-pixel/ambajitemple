/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: EMD Register
 *  Parallel to the original (original left intact). Endpoint: /tender-entries/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const EmdRegisterStd = () => (
  <AutoReport
    endpoint="tender-entries/all"
    method="get"
    title="EMD Register"
    menuLink="/reports-std/tender-management/emd-register"
    reportCode="STD-TEN-35"
    filters={["from", "to", "status"]}
  />
);

export default EmdRegisterStd;

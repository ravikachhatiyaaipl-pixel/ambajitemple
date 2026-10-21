/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Tender Register
 *  Parallel to the original (original left intact). Endpoint: /tender-type/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const TenderRegisterStd = () => (
  <AutoReport
    endpoint="tender-type/all"
    method="get"
    title="Tender Register"
    menuLink="/reports-std/tender-management/tender-register"
    reportCode="STD-TEN-39"
    filters={["dept", "from", "to"]}
  />
);

export default TenderRegisterStd;

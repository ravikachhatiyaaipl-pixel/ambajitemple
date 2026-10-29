/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Dept-wise BG Register
 *  Parallel to the original (original left intact). Endpoint: /tender-entries/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DepartmentwiseBgRegisterStd = () => (
  <AutoReport
    endpoint="tender-entries/all"
    method="get"
    title="Dept-wise BG Register"
    menuLink="/reports-std/tender-management/departmentwise-bg-register"
    reportCode="STD-TEN-33"
    filters={["dept", "from", "to", "status"]}
  />
);

export default DepartmentwiseBgRegisterStd;

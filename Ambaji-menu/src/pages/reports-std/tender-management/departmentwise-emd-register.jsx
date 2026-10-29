/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Dept-wise EMD Register
 *  Parallel to the original (original left intact). Endpoint: /tender-entries/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DepartmentwiseEmdRegisterStd = () => (
  <AutoReport
    endpoint="tender-entries/all"
    method="get"
    title="Dept-wise EMD Register"
    menuLink="/reports-std/tender-management/departmentwise-emd-register"
    reportCode="STD-TEN-34"
    filters={["dept", "from", "to", "status"]}
  />
);

export default DepartmentwiseEmdRegisterStd;

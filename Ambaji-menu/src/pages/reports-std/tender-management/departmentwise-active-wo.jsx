/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Dept-wise Active WO
 *  Parallel to the original (original left intact). Endpoint: /tender-reports/departmentwise-work-orders
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DepartmentwiseActiveWoStd = () => (
  <AutoReport
    endpoint="tender-reports/departmentwise-work-orders"
    method="get"
    title="Dept-wise Active WO"
    menuLink="/reports-std/tender-management/departmentwise-active-wo"
    reportCode="STD-TEN-32"
    filters={["dept", "from", "to", "status"]}
  />
);

export default DepartmentwiseActiveWoStd;

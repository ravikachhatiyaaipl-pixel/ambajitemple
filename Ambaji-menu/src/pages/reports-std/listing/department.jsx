/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Department List
 *  Parallel to the original (original left intact). Endpoint: /reports/department-list
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DepartmentStd = () => (
  <AutoReport
    endpoint="reports/department-list"
    method="get"
    title="Department List"
    menuLink="/reports-std/listing/department"
    reportCode="STD-LIS-03"
    filters={[]}
  />
);

export default DepartmentStd;

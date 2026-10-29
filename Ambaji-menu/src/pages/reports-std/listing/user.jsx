/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: User List
 *  Parallel to the original (original left intact). Endpoint: /reports/user-list
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const UserStd = () => (
  <AutoReport
    endpoint="reports/user-list"
    method="get"
    title="User List"
    menuLink="/reports-std/listing/user"
    reportCode="STD-LIS-04"
    filters={[]}
  />
);

export default UserStd;

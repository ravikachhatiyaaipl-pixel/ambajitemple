/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Employee Attendance
 *  Parallel to the original (original left intact). Endpoint: /lst-leave-application
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const EmployeeAttendanceStd = () => (
  <AutoReport
    endpoint="lst-leave-application"
    method="get"
    title="Employee Attendance"
    menuLink="/reports-std/leave-attendance/employee-attendance"
    reportCode="STD-LEA-07"
    filters={["dept", "from", "to", "status"]}
  />
);

export default EmployeeAttendanceStd;

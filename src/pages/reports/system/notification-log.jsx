/***
 *  I3EMS - AMT ERP  |  System report: Notification Log
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const NotificationLog = () => (
  <AutoReport endpoint="notification-reports/log" method="get" title="Notification Log" menuLink="/reports/system/notification-log" reportCode="SYS-NL-01" filters={["status", "from", "to"]} />
);
export default NotificationLog;

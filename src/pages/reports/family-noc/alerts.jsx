/***
 *  I3EMS - AMT ERP  |  NOC Alerts report
 *  Family members who have crossed the applicable age and require an NOC.
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const NocAlerts = () => (
  <AutoReport
    endpoint="family-noc-reports/alerts"
    title="NOC Age Alerts"
    menuLink="/reports/family-noc/alerts"
    reportCode="FNOC-ALERT"
    filters={["status"]}
  />
);

export default NocAlerts;

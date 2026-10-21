/***  I3EMS - AMT ERP  |  Duty / Award / Inquiry Details
 *  Consolidated service-events register across special duty, award, significant work,
 *  deputation and health certificates.
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ServiceEventsReport = () => (
  <AutoReport
    endpoint="svc/reports/service-events"
    title="Duty / Award / Inquiry Details"
    menuLink="/reports/service-events/details"
    reportCode="SVC-EVENTS"
  />
);

export default ServiceEventsReport;

/***
 *  I3EMS - AMT ERP  |  Family Members report
 *  Register of employee family members with relationship, gender and date of birth.
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const FamilyMembersReport = () => (
  <AutoReport
    endpoint="family-noc-reports/members"
    title="Family Members Report"
    menuLink="/reports/family-noc/members"
    reportCode="FNOC-MEM"
  />
);

export default FamilyMembersReport;

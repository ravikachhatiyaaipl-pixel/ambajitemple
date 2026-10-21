/***
 *  I3EMS - AMT ERP  |  Recruitment Register (report)
 *  Endpoint: /recruitment-reports/register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const RecruitmentRegister = () => (
  <AutoReport
    endpoint="recruitment-reports/register"
    method="get"
    title="Recruitment Register"
    menuLink="/reports/recruitment/register"
    reportCode="REC-REG-01"
    filters={["status"]}
  />
);

export default RecruitmentRegister;

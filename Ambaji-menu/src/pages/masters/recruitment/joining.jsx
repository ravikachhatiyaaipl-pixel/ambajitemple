/***
 *  I3EMS - AMT ERP  |  Recruitment · Joining / Induction
 *  Sprint 1 (SOW). Endpoint: /recruitment/joining
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "APO_Id", "label": "Order"}, {"key": "APP_Id", "label": "Application"}, {"key": "Joining_Date", "label": "Joining", "type": "date"}, {"key": "Emp_Id", "label": "Emp ID"}, {"key": "Induction_Done", "label": "Induction", "type": "bool"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "APO_Id", "label": "Appointment Order (ID)", "type": "number", "required": true}, {"key": "APP_Id", "label": "Application (ID)", "type": "number"}, {"key": "Joining_Date", "label": "Joining Date", "type": "date"}, {"key": "Induction_Done", "label": "Induction Done", "type": "bool"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Join \u2192 Employee", "action": "join"}];

const RecruitmentJoining = () => (
  <ResourceManager
    title="Joining / Induction"
    endpoint="recruitment/joining"
    idKey="JOIN_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default RecruitmentJoining;

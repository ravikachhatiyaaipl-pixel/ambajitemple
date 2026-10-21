/***
 *  I3EMS - AMT ERP  |  Recruitment · Manpower Requirement
 *  Sprint 1 (SOW). Endpoint: /recruitment/manpower-requirement
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "MPR_No", "label": "Req No"}, {"key": "MPR_Date", "label": "Date", "type": "date"}, {"key": "Dpt_Id", "label": "Dept"}, {"key": "Dsg_Id", "label": "Desig."}, {"key": "Required_Count", "label": "Count"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "MPR_Date", "label": "Requirement Date", "type": "date"}, {"key": "Dpt_Id", "label": "Department (ID)", "type": "number", "required": true}, {"key": "Dsg_Id", "label": "Designation (ID)", "type": "number"}, {"key": "Required_Count", "label": "Required Count", "type": "number", "required": true}, {"key": "Pay_Scale", "label": "Pay Scale"}, {"key": "Justification", "label": "Justification", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Submit", "action": "submit"}, {"label": "Approve", "action": "approve"}, {"label": "Reject", "action": "reject", "tone": "danger"}];

const ManpowerRequirement = () => (
  <ResourceManager
    title="Manpower Requirement"
    endpoint="recruitment/manpower-requirement"
    idKey="MPR_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default ManpowerRequirement;

/***
 *  I3EMS - AMT ERP  |  Recruitment · Selection
 *  Sprint 1 (SOW). Endpoint: /recruitment/selection
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "APP_Id", "label": "Application"}, {"key": "JO_Id", "label": "Opening"}, {"key": "Rank", "label": "Rank"}, {"key": "Is_Selected", "label": "Selected", "type": "bool"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "JO_Id", "label": "Job Opening (ID)", "type": "number"}, {"key": "APP_Id", "label": "Application (ID)", "type": "number", "required": true}, {"key": "Rank", "label": "Rank", "type": "number"}, {"key": "Is_Selected", "label": "Selected", "type": "bool"}, {"key": "Is_Waitlist", "label": "Waitlist", "type": "bool"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Approve", "action": "approve"}, {"label": "Reject", "action": "reject", "tone": "danger"}];

const RecruitmentSelection = () => (
  <ResourceManager
    title="Selection"
    endpoint="recruitment/selection"
    idKey="SEL_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default RecruitmentSelection;

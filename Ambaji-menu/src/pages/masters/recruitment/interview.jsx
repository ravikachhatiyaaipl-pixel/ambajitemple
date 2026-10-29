/***
 *  I3EMS - AMT ERP  |  Recruitment · Interview Schedule
 *  Sprint 1 (SOW). Endpoint: /recruitment/interview
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "APP_Id", "label": "Application"}, {"key": "JO_Id", "label": "Opening"}, {"key": "Interview_Date", "label": "Date", "type": "date"}, {"key": "Venue", "label": "Venue"}, {"key": "Result", "label": "Result"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "JO_Id", "label": "Job Opening (ID)", "type": "number"}, {"key": "APP_Id", "label": "Application (ID)", "type": "number", "required": true}, {"key": "Interview_Date", "label": "Interview Date", "type": "date"}, {"key": "Venue", "label": "Venue"}, {"key": "Committee", "label": "Committee"}, {"key": "Score", "label": "Score", "type": "number"}, {"key": "Result", "label": "Result", "type": "select", "options": [{"v": "PASS", "l": "Pass"}, {"v": "FAIL", "l": "Fail"}, {"v": "HOLD", "l": "Hold"}]}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Finalize", "action": "finalize"}];

const InterviewSchedule = () => (
  <ResourceManager
    title="Interview Schedule"
    endpoint="recruitment/interview"
    idKey="INT_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default InterviewSchedule;

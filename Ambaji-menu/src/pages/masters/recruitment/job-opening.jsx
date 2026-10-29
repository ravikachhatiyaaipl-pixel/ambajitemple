/***
 *  I3EMS - AMT ERP  |  Recruitment · Job Opening
 *  Sprint 1 (SOW). Endpoint: /recruitment/job-opening
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "JO_No", "label": "Opening No"}, {"key": "MPR_Id", "label": "Req"}, {"key": "Dpt_Id", "label": "Dept"}, {"key": "Vacancies", "label": "Vac."}, {"key": "Open_Date", "label": "Open", "type": "date"}, {"key": "Close_Date", "label": "Close", "type": "date"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "MPR_Id", "label": "Manpower Req (ID)", "type": "number"}, {"key": "Dpt_Id", "label": "Department (ID)", "type": "number"}, {"key": "Dsg_Id", "label": "Designation (ID)", "type": "number"}, {"key": "Vacancies", "label": "Vacancies", "type": "number", "required": true}, {"key": "Qualification", "label": "Qualification"}, {"key": "Experience", "label": "Experience"}, {"key": "Pay_Scale", "label": "Pay Scale"}, {"key": "Open_Date", "label": "Open Date", "type": "date"}, {"key": "Close_Date", "label": "Close Date", "type": "date"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Close", "action": "close"}, {"label": "Cancel", "action": "cancel", "tone": "danger"}];

const JobOpening = () => (
  <ResourceManager
    title="Job Opening"
    endpoint="recruitment/job-opening"
    idKey="JO_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default JobOpening;

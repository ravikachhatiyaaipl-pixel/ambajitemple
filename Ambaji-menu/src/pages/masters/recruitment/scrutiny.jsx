/***
 *  I3EMS - AMT ERP  |  Recruitment · Application Scrutiny
 *  Sprint 1 (SOW). Endpoint: /recruitment/scrutiny
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "APP_Id", "label": "Application"}, {"key": "Scrutiny_Date", "label": "Date", "type": "date"}, {"key": "Is_Eligible", "label": "Eligible", "type": "bool"}, {"key": "Shortlisted", "label": "Shortlisted", "type": "bool"}];
const FIELDS = [{"key": "APP_Id", "label": "Application (ID)", "type": "number", "required": true}, {"key": "Scrutiny_Date", "label": "Scrutiny Date", "type": "date"}, {"key": "Is_Eligible", "label": "Eligible", "type": "bool"}, {"key": "Shortlisted", "label": "Shortlisted", "type": "bool"}, {"key": "Scrutinized_By", "label": "Scrutinized By (User ID)", "type": "number"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS = [];

const ApplicationScrutiny = () => (
  <ResourceManager
    title="Application Scrutiny"
    endpoint="recruitment/scrutiny"
    idKey="SCR_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default ApplicationScrutiny;

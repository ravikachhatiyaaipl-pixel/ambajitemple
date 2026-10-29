/***
 *  I3EMS - AMT ERP  |  Recruitment · Legal-Heir / Compassionate
 *  Sprint 1 (SOW). Endpoint: /recruitment/legal-heir
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "LHC_No", "label": "Case No"}, {"key": "Applicant_Name", "label": "Applicant"}, {"key": "Relation", "label": "Relation"}, {"key": "NOC_From_Family", "label": "Family NOC", "type": "bool"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "Deceased_Emp_Id", "label": "Deceased Employee (ID)", "type": "number"}, {"key": "Applicant_Name", "label": "Applicant Name", "required": true}, {"key": "Relation", "label": "Relation", "type": "select", "options": [{"v": "Spouse", "l": "Spouse"}, {"v": "Son", "l": "Son"}, {"v": "Daughter", "l": "Daughter"}, {"v": "Other", "l": "Other"}]}, {"key": "NOC_From_Family", "label": "NOC from Family", "type": "bool"}, {"key": "NOC_Document", "label": "NOC Document"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Submit", "action": "submit"}, {"label": "Approve", "action": "approve"}, {"label": "Reject", "action": "reject", "tone": "danger"}];

const LegalHeirCase = () => (
  <ResourceManager
    title="Legal-Heir / Compassionate"
    endpoint="recruitment/legal-heir"
    idKey="LHC_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default LegalHeirCase;

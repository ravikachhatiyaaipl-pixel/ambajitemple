/***
 *  I3EMS - AMT ERP  |  Recruitment · Job Application
 *  Sprint 1 (SOW). Endpoint: /recruitment/job-application
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "APP_No", "label": "App No"}, {"key": "Applicant_Name", "label": "Applicant"}, {"key": "JO_Id", "label": "Opening"}, {"key": "Category", "label": "Cat."}, {"key": "Mobile", "label": "Mobile"}, {"key": "Applied_Date", "label": "Applied", "type": "date"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "JO_Id", "label": "Job Opening (ID)", "type": "number", "required": true}, {"key": "Applicant_Name", "label": "Applicant Name", "required": true}, {"key": "Father_Spouse", "label": "Father / Spouse"}, {"key": "Gender", "label": "Gender", "type": "select", "options": [{"v": "Male", "l": "Male"}, {"v": "Female", "l": "Female"}, {"v": "Other", "l": "Other"}]}, {"key": "DOB", "label": "Date of Birth", "type": "date"}, {"key": "Mobile", "label": "Mobile"}, {"key": "Email", "label": "Email"}, {"key": "Category", "label": "Category", "type": "select", "options": [{"v": "GEN", "l": "General"}, {"v": "OBC", "l": "OBC"}, {"v": "SC", "l": "SC"}, {"v": "ST", "l": "ST"}, {"v": "EWS", "l": "EWS"}]}, {"key": "Qualification", "label": "Qualification"}, {"key": "Experience", "label": "Experience"}, {"key": "Is_LegalHeir", "label": "Legal-Heir case?", "type": "bool"}, {"key": "Applied_Date", "label": "Applied Date", "type": "date"}, {"key": "Documents", "label": "Documents", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Shortlist", "action": "shortlist"}, {"label": "Reject", "action": "reject", "tone": "danger"}];

const JobApplication = () => (
  <ResourceManager
    title="Job Application"
    endpoint="recruitment/job-application"
    idKey="APP_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default JobApplication;

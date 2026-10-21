/***
 *  I3EMS - AMT ERP  |  Loan Management · Document Submission   (Sprint 6, SOW)
 *  Endpoint: /loan-mgmt/document-submission   (uses loan_document_master)
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "LAS_Id", label: "Loan" },
  { key: "LD_Id", label: "Doc" },
  { key: "Is_Submitted", label: "Submitted", type: "bool" },
  { key: "Is_Original", label: "Original", type: "bool" },
  { key: "Submitted_Date", label: "Date", type: "date" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "LAS_Id", label: "Loan Sanction (LAS ID)", type: "number", required: true },
  { key: "LD_Id", label: "Document (LD ID)", type: "number", required: true },
  { key: "Is_Original", label: "Original Submitted", type: "bool" },
  { key: "Reference", label: "Reference" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Mark Submitted", action: "submit", tone: "primary" },
  { label: "Return", action: "return" },
];
const DocumentSubmission = () => (
  <ResourceManager title="Loan Document Submission" endpoint="loan-mgmt/document-submission" idKey="LDS_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default DocumentSubmission;

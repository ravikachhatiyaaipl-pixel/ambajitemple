/***
 *  I3EMS - AMT ERP  |  Disciplinary · Inquiry Proceeding   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/proceeding
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "DC_Id", label: "Case" },
  { key: "Hearing_No", label: "Hearing" },
  { key: "Proceeding_Date", label: "Date", type: "date" },
  { key: "Next_Date", label: "Next", type: "date" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "DC_Id", label: "Disciplinary Case (ID)", type: "number", required: true },
  { key: "IO_Id", label: "Inquiry Officer (ID)", type: "number" },
  { key: "Hearing_No", label: "Hearing No", type: "number" },
  { key: "Proceeding_Date", label: "Proceeding Date", type: "date" },
  { key: "Notes", label: "Notes", type: "textarea", full: true },
  { key: "Witnesses", label: "Witnesses", type: "textarea", full: true },
  { key: "Documents_Exhibited", label: "Documents Exhibited", type: "textarea", full: true },
  { key: "Next_Date", label: "Next Hearing Date", type: "date" },
];
const ACTIONS = [
  { label: "Held", action: "hold" },
  { label: "Adjourn", action: "adjourn" },
  { label: "Ex-parte", action: "exparte", tone: "danger" },
];
const InquiryProceeding = () => (
  <ResourceManager title="Inquiry Proceeding" endpoint="disciplinary/proceeding" idKey="IP_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default InquiryProceeding;

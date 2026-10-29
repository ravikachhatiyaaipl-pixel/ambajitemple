/***  I3EMS - AMT ERP | Health · Certificate (Birth/Death/Marriage) (Sprint FINAL) | endpoint /health-certificate */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "HC_No", label: "No" }, { key: "Cert_Type", label: "Type" }, { key: "Event_Date", label: "Event", type: "date" },
  { key: "Child_Name", label: "Child" }, { key: "Deceased_Name", label: "Deceased" }, { key: "Groom_Name", label: "Groom" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Cert_Type", label: "Certificate Type", type: "select", options: ["BIRTH", "DEATH", "MARRIAGE"], required: true },
  { key: "Event_Date", label: "Event Date", type: "date", required: true },
  { key: "Ward_Id", label: "Ward (ID)", type: "number" }, { key: "Zone_Id", label: "Zone (ID)", type: "number" },
  { key: "Place", label: "Place", full: true },
  { key: "Child_Name", label: "Child Name (Birth)" }, { key: "Gender", label: "Gender (Birth)", type: "select", options: ["", "MALE", "FEMALE", "OTHER"] },
  { key: "Father_Name", label: "Father Name" }, { key: "Mother_Name", label: "Mother Name" },
  { key: "Deceased_Name", label: "Deceased Name (Death)" }, { key: "Age_At_Death", label: "Age at Death", type: "number" },
  { key: "Cause_Of_Death", label: "Cause of Death" },
  { key: "Groom_Name", label: "Groom Name (Marriage)" }, { key: "Bride_Name", label: "Bride Name (Marriage)" },
  { key: "Applicant_Name", label: "Applicant Name" }, { key: "Contact", label: "Contact" },
  { key: "Address", label: "Address", full: true },
  { key: "Fee", label: "Fee", type: "number" }, { key: "Fee_Paid", label: "Fee Paid", type: "bool" },
];
const ACTIONS = [
  { label: "Verify", action: "verify" },
  { label: "Issue", action: "issue", tone: "primary" },
  { label: "Cancel", action: "cancel", tone: "danger" },
];
const HealthCertificate = () => (<ResourceManager title="Health Certificate" endpoint="health-certificate" idKey="HC_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />);
export default HealthCertificate;

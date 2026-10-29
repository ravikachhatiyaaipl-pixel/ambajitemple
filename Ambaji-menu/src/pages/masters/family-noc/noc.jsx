/***
 *  I3EMS - AMT ERP  |  Family NOC (Family / NOC module)
 *  Upload & record NOC documents for family members, with an officer workflow
 *  (Submit → Verify → Record / Reject). A RECORDED NOC is locked.
 *  "Run Age Check" raises alerts for members who have crossed the applicable age.
 */
import React from "react";
import axios from "axios";
import EntityManager from "../../../components/amt/entitymanager";

const NOC_TYPES = [
  { v: "DEPENDENT_ADULT", l: "Dependent turned adult" },
  { v: "EMPLOYMENT", l: "Employment NOC" },
  { v: "HIGHER_STUDY", l: "Higher study NOC" },
  { v: "GENERAL", l: "General NOC" },
];

const FamilyNoc = () => {
  const runAgeCheck = async (reload) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/family-noc/run-age-check`, {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } }
    );
    const raised = res.data?.data?.raised ?? 0;
    window.alert(`Age check complete. ${raised} NOC requirement alert(s) raised. See the NOC Alerts report.`);
    reload();
  };

  return (
    <EntityManager
      title="Family NOC"
      subtitle="Upload and keep records of family-member NOC documents · AMT"
      endpoint="family-noc/noc"
      idKey="FNOC_Id"
      lockField="Status"
      lockValues={["RECORDED"]}
      toolbar={[{ label: "Run Age Check", tone: "neutral", onClick: runAgeCheck }]}
      columns={[
        { key: "FNOC_No", label: "NOC No" },
        { key: "NOC_Type", label: "Type" },
        { key: "NOC_Date", label: "NOC Date", type: "date" },
        { key: "Document_File", label: "Document", type: "file" },
        { key: "Status", label: "Status", type: "status" },
      ]}
      actions={[
        { label: "Submit", action: "submit", tone: "info" },
        { label: "Verify", action: "verify", tone: "info" },
        { label: "Record", action: "record", tone: "primary" },
        { label: "Reject", action: "reject", tone: "danger" },
      ]}
      fields={[
        { key: "Emp_Id", label: "Employee", type: "lookup", endpoint: "lookup/employees", required: true },
        { key: "EFI_Id", label: "Family Member", type: "lookup", endpoint: "family-noc/member", optionValue: "EFI_Id", optionLabel: "Member_name", required: true },
        { key: "NAR_Id", label: "Age Rule (optional)", type: "lookup", endpoint: "family-noc/age-rule", optionValue: "NAR_Id", optionLabel: "NAR_Name" },
        { key: "NOC_Type", label: "NOC Type", type: "select", options: NOC_TYPES, required: true },
        { key: "NOC_Date", label: "NOC Date", type: "date" },
        { key: "Document_Ref", label: "Document Reference No", type: "text" },
        { key: "Document_File", label: "NOC Document (PDF/Image)", type: "file", accept: ".pdf,image/*", full: true },
        { key: "Reason", label: "Reason / Remarks", type: "textarea", full: true },
      ]}
    />
  );
};

export default FamilyNoc;

/***
 *  I3EMS - AMT ERP  |  Family Members (Family / NOC module)
 *  Reuses family_info_master (EFI_Id, Emp_id, Member_name, Gender, Rela_Id, Dob, Phone).
 *  Employee & Relationship are searchable lookups.
 */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const FamilyMembers = () => (
  <EntityManager
    title="Family Members"
    subtitle="Record employee family members for NOC / establishment records · AMT"
    endpoint="family-noc/member"
    idKey="EFI_Id"
    columns={[
      { key: "Member_name", label: "Member Name" },
      { key: "Gender", label: "Gender" },
      { key: "Dob", label: "Date of Birth", type: "date" },
      { key: "Phone", label: "Phone" },
    ]}
    fields={[
      { key: "Emp_id", label: "Employee", type: "lookup", endpoint: "lookup/employees", required: true },
      { key: "Member_name", label: "Member Name", type: "text", required: true },
      { key: "Gender", label: "Gender", type: "select", options: [{ v: "male", l: "Male" }, { v: "female", l: "Female" }, { v: "other", l: "Other" }] },
      { key: "Rela_Id", label: "Relationship", type: "lookup", endpoint: "lookup/relations" },
      { key: "Dob", label: "Date of Birth", type: "date" },
      { key: "Phone", label: "Phone", type: "text" },
      { key: "IsActive", label: "Active", type: "bool", default: true },
    ]}
  />
);

export default FamilyMembers;
